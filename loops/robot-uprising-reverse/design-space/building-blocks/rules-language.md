# 3.05 — Rules Language: The Grammar of Agent Behavior

## Overview

Rules are one of the four core primitives. Skills define what agents *can* do. Hooks define what agents *broadcast*. Context config defines what agents *remember*. Rules define what agents *decide* — the behavioral logic that transforms buffer contents into action. The rules language is the single most player-facing design decision in the game. It determines:

- How expressive the game is (can the player describe any strategy they imagine?)
- How readable the game is (can a spectator understand what an agent is doing by reading its rules?)
- How learnable the game is (can a beginner write their first useful rule in 60 seconds?)
- How deep the game is (can a veteran discover non-obvious rule configurations after 100 hours?)

The locked spec says rules are **ordered condition→action pairs**. This document explores what that means mechanically — the vocabulary of conditions, the vocabulary of actions, the ordering semantics, the conflict resolution, the visual language, and the feel of writing rules across six distinct design approaches.

---

## The Design Spectrum

Rules languages fall on a spectrum from **structured** (limited vocabulary, constrained expression, high readability) to **expressive** (rich vocabulary, open-ended composition, steep learning curve). The locked spec — "ordered condition→action pairs" — sits deliberately in the middle, but there's enormous design space within that constraint.

| Approach | Expressiveness | Readability | Learning Curve | Comparable |
|----------|---------------|-------------|----------------|------------|
| **A. The Dispatch Table** | Low | Very High | Minutes | Traffic light rules |
| **B. The Priority Queue** | Medium | High | ~30 minutes | Gladiabots |
| **C. The Assembly Prefix** | Medium-High | Medium | ~1 hour | Shenzhen I/O +/- prefix |
| **D. The Sentence Builder** | High | Very High | ~45 minutes | Baba Is You meets Gladiabots |
| **E. The Nested Conditional** | Very High | Low-Medium | ~2 hours | Full behavior tree |
| **F. The Pattern Matcher** | Very High | Medium | ~90 minutes | Production rule systems / regex |

---

## Approach A: The Dispatch Table

**Philosophy:** Rules are a fixed-size lookup table. Each row maps one signal type to one action. No boolean logic, no composition, no nesting. Pure signal→response mapping.

### Mechanical Specification

Each agent has a **dispatch table** with N rows (where N = buffer size). Each row is:

```
WHEN [signal type] → DO [action]
```

Signal types are drawn from a fixed enum: `ENEMY_SPOTTED`, `THREAT_DETECTED`, `ALLY_BREACHING`, `RESOURCE_TAGGED`, `CHANNEL_SILENT`, `BUFFER_FULL`, `NO_SIGNAL`. Actions are the unit's available skills plus movement primitives: `MOVE_TOWARD`, `MOVE_AWAY`, `PATROL`, `ENGAGE`, `EVADE`, `HOLD_POSITION`.

Rows are evaluated top-to-bottom. First matching signal in the buffer triggers the corresponding action. If no signal matches, a mandatory `DEFAULT` row at the bottom fires.

### What It Looks Like

The dispatch table renders as a clean two-column grid in the workbench panel. Left column: colored icons representing signal types (yellow diamond for `ENEMY_SPOTTED`, red triangle for `THREAT_DETECTED`, green circle for `RESOURCE_TAGGED`). Right column: action icons (crosshair for `ENGAGE`, running figure for `MOVE_TOWARD`, shield for `HOLD_POSITION`). Each row is a horizontal strip the player can drag to reorder. The table glows faintly — occupied rows are bright, empty rows are dim outlines inviting clicks.

Hover over a row and the board's ghost preview updates: the unit shows its anticipated behavior if that signal were present. Hover over `WHEN ENEMY_SPOTTED → MOVE_TOWARD` and a dotted arrow appears from the unit's ghost toward the nearest phantom enemy position.

### Strengths

- **Atomic simplicity.** A new player can fill in a dispatch table in under a minute. There's nothing to misunderstand — it's a menu.
- **Total readability.** Any spectator can glance at a dispatch table and know exactly what the agent will do. Streamers can overlay it on screen.
- **Buffer-centric.** The dispatch table only triggers on signals that are actually in the buffer, reinforcing the game's core "you only know what you know" theme.
- **Zero syntax.** No text, no operators, no brackets. Pure selection.

### Weaknesses

- **No composition.** You can't say "IF enemy spotted AND ally breaching THEN flank." Conjunction and disjunction are impossible.
- **No spatial reasoning.** You can't reference distance, direction, or relative position in conditions.
- **One action per signal.** A scout that spots an enemy can either evade OR report, not both.
- **Ceiling hits fast.** After Mission 3, players will feel constrained. The table can't express the strategies the game's other systems enable.

### Interaction Effects

The dispatch table pairs well with a **rich hook system** because hooks compensate for the rules' lack of composition — complex behavior emerges from simple rules wired together via channels, not from complex rules themselves. But it makes Command agents nearly useless — command skills like `reassign` and `reroute` need conditional logic the table can't express.

---

#### Journey: Maya, 14, Minecraft Player Who's Never Played a Strategy Game

**Context:** Mission 1. First time seeing the workbench. One scout pre-placed on the board.

**Minute 0:00 — The Empty Table**
Maya sees a split screen. Left: the 8×8 board with her scout at B2 and three red enemy icons scattered around. Right: the workbench panel showing an empty dispatch table — six rows, each with a colored "?" icon on the left and a "?" on the right. Above the table, the scout's name in cyan: `SCOUT-A`. Below, a tooltip fades in: "What should SCOUT-A do when it senses something?"

She hovers over the first row's left "?" icon. A dropdown appears showing five signal types as icons with labels: 👁 Enemy Spotted, ⚠ Threat Detected, 📡 Ally Signal, 🔋 Resource Found, ❓ Nothing Happening. Each icon pulses gently.

**Minute 0:20 — First Rule**
She clicks 👁 Enemy Spotted. The left cell fills with a yellow diamond icon. The right cell's "?" highlights — a second dropdown appears: 🏃 Move Toward, 🏃‍♀️ Move Away, 👁 Patrol, ⚔ Engage, 🛡 Hold Position. She picks 🏃 Move Toward.

The board's ghost preview instantly updates: a dotted cyan arrow appears from her scout toward the nearest enemy. She grins. She understands: "when my scout sees something, it goes toward it."

**Minute 0:40 — Second Rule**
She fills in row 2: ⚠ Threat Detected → 🏃‍♀️ Move Away. Row 3: ❓ Nothing Happening → 👁 Patrol. She hasn't read any documentation. The icons did the teaching.

**Minute 1:10 — First Execute**
She hits EXECUTE. The sealed watch starts. Her scout patrols, spots an enemy, moves toward it — then the enemy moves adjacent. Threat detected fires, scout evades. The dispatch table is simple, but it worked. She feels smart.

**Minute 2:30 — The Ceiling**
Mission 2 introduces two scouts. She wants one to report enemies and the other to evade. But both have the same dispatch table options. She can give them different tables, but she can't express "IF enemy spotted AND I'm scout-A THEN report" vs "IF enemy spotted AND I'm scout-B THEN evade." She drags the rows around, experiments. The limitation is visible but not frustrating yet — she has different tables for different units.

**UI Annotations:**
- Dispatch table: right panel, 6 rows × 2 columns, 280px wide
- Signal icons: 32×32, colored, pulse on hover
- Action icons: 32×32, monochrome until selected
- Ghost preview: updates in <100ms on any row change
- Row drag handles: left edge of each row, grip dots

---

#### Journey: Derek, 31, Software Engineer, Factorio Veteran

**Context:** Mission 4. Four units deployed. Has been using dispatch tables for three missions.

**Minute 0:00 — The Frustration**
Derek has a scout feeding observations to a relay, which compresses and forwards to a striker. The pipeline works. But he wants the striker to prioritize fresh signals over stale ones — and the dispatch table can't express signal age. He also wants the striker to move toward enemies only when its buffer has at least 2 confirmed sightings (triangulation). The dispatch table has no concept of "at least 2" or "freshest."

He opens the workbench and stares at the dispatch table. Six rows. No filters. No quantifiers. He feels the same frustration he felt the first time he hit Factorio's circuit network limits — the system is obviously capable of more than the interface allows.

**Minute 1:00 — Working Around the Limits**
He wires a second hook from the scout to the relay on a different channel, creating a "confirmed" channel that only fires after two observations. But this is a hook solution to a rules problem. The relay's compress skill handles the logic, not the striker's rules. He's doing architecture because rules can't do logic.

**Minute 3:00 — The Realization**
After the sealed watch, Derek inspects the striker's behavior. It moved toward an enemy on a single stale report and got eliminated. The dispatch table said `ENEMY_SPOTTED → MOVE_TOWARD` and the buffer had a 12-tick-old entry. There was no way to say "only move if the signal is fresh." Derek opens the game's feedback form and types: "I need conditional filters on rules."

**UI Annotations:**
- Derek's frustration is visible in his dispatch table: rows 1-3 are filled, rows 4-6 are empty because the table can't express what he wants
- The inspector shows the striker's buffer with a stale entry highlighted amber — the smoking gun

---

#### Journey: Professor Adaora, 52, Teaching Intro to AI Course

**Context:** Has assigned Robot Uprising as a lab exercise. Wants students to understand production rule systems.

**Minute 0:00 — The Pedagogical Problem**
Adaora opens the dispatch table and immediately sees the limitation: it's a flat mapping, not a production rule system. There's no working memory interaction, no conflict resolution beyond ordering, no chaining. She can teach "stimulus-response" with it, but not "reasoning." She assigns it for Week 2 but knows she'll need a deeper rule system by Week 4.

She writes in her course notes: "The dispatch table is a degenerate production system with single-condition rules and first-match conflict resolution. Useful for introducing the concept. Insufficient for demonstrating forward chaining or conjunctive conditions."

---

## Approach B: The Priority Queue

**Philosophy:** Rules are ordered condition→action pairs with **filter parameters** on the conditions. First matching rule fires. This is the locked spec's most literal interpretation — and the closest to Gladiabots' behavior tree, flattened from a tree into a list.

### Mechanical Specification

Each agent has an **ordered list** of rules. Each rule is:

```
IF [condition] [filter₁] [filter₂] ... THEN [action] [target selector]
```

**Conditions** query the buffer:
- `BUFFER_CONTAINS [signal_type]` — is there an entry of this type?
- `BUFFER_FULL` — is the buffer at capacity?
- `BUFFER_EMPTY_OF [signal_type]` — no entries of this type?
- `ALWAYS` — unconditional (used for default behaviors)

**Filters** narrow the match:
- `AGE < [N] ticks` — signal freshness
- `FIDELITY > [threshold]` — signal quality (compressed signals have lower fidelity)
- `SOURCE = [unit_type]` — who sent this signal?
- `DISTANCE < [N] tiles` — spatial proximity (of the signal's reported position to this unit)
- `COUNT >= [N]` — at least N matching entries in the buffer

**Actions** are skills plus movement:
- `MOVE_TOWARD [target]`, `MOVE_AWAY [target]`, `HOLD`
- `ENGAGE`, `EVADE`, `PATROL [path]`
- `COMPRESS`, `FILTER`, `AMPLIFY` (relay-only)
- `REASSIGN`, `REROUTE`, `PRIORITIZE` (command-only)

**Target selectors** (when action needs a target):
- `FRESHEST`, `NEAREST`, `HIGHEST_FIDELITY`, `OLDEST`, `ANY`

Evaluation: scan rules top-to-bottom. Each rule's condition is checked against the buffer. First rule whose condition and all filters match → that action fires. Evaluation stops. If no rule matches → the agent does nothing (or an implicit HOLD).

### What It Looks Like

The priority queue renders as a vertical stack of **rule cards** in the workbench. Each card is a horizontal strip, maybe 40px tall, with colored segments:

- **Left segment (pink/coral):** The condition, shown as an icon + label. A buffer icon with a magnifying glass for `BUFFER_CONTAINS`, a battery icon for `BUFFER_FULL`.
- **Middle segment (purple):** Filter pills. Each filter is a small rounded rectangle with text: `age < 3`, `fidelity > 0.7`, `count ≥ 2`. Click a filter to edit. Click the "+" button to add a filter. Filters are AND'd together.
- **Right segment (cyan):** The action icon + target selector dropdown.

Between each card, a thin drag handle (three horizontal dots) allows reordering. The entire stack has a subtle top-to-bottom gradient — brighter at top (higher priority), dimmer at bottom — reinforcing that evaluation flows downward.

When the player hovers over a rule card, the board's ghost preview highlights: which units would match this rule's conditions right now, what action they'd take, and where they'd move. The ghost preview draws directional arrows on the board for movement actions and flashes perception radii for sensing conditions.

A "Test" button at the bottom of the rule stack runs a one-tick dry simulation: the workbench highlights which rule fired for each unit, coloring the card green (matched) or grey (skipped). The first green card in the stack is bright green; all below it are greyed out, visually demonstrating the "first match wins" semantics.

### Strengths

- **Direct mapping to the spec.** This IS "ordered condition→action pairs."
- **Gladiabots-proven.** The priority queue is essentially a flattened behavior tree, which Gladiabots proved works for exactly this kind of game.
- **Readable.** Each rule card is a self-contained English-like sentence: "IF buffer contains ENEMY_SPOTTED, age < 3, fidelity > 0.5 THEN MOVE_TOWARD freshest."
- **Ordering creates emergent complexity.** The same rules in different orders produce different behavior. "Evade before engage" creates a cautious agent. "Engage before evade" creates an aggressive one. The ordering IS the strategy.
- **Filter system is arbitrarily deep.** Beginners use zero filters. Veterans stack five filters per rule. The complexity is additive, not architectural.
- **Natural ceiling progression.** Missions 1-4 use conditions only. Mission 5 introduces filters. Mission 7 introduces count ≥ N. The vocabulary grows with the player.

### Weaknesses

- **No disjunction.** You can't say "IF enemy spotted OR buffer full THEN ..." Each rule is a conjunction (all filters must match). OR requires two separate rules with the same action — which works but creates visual clutter.
- **No negated actions.** You can only say "do X." You can't say "don't do X." A player who wants to prevent engagement under certain conditions must rely on a higher-priority rule that fires a different action first.
- **Flat structure.** Unlike a behavior tree, there's no grouping or nesting. A 12-rule list is readable. A 30-rule list is a wall. Late-game command agents with complex logic hit readability limits.
- **Rule explosion for state machines.** If the agent needs to behave differently in "scouting mode" vs. "retreating mode," the player must duplicate rules with different filter conditions rather than expressing modes directly.

### Interaction Effects

The priority queue pairs exceptionally well with the **hook system** because hooks handle cross-agent communication while rules handle intra-agent decision-making. The separation of concerns is clean: hooks are the network layer, rules are the application layer. The filter system directly leverages the buffer model — every filter parameter (age, fidelity, source, count) queries buffer metadata, making the buffer a first-class citizen of the rules language.

Pairs poorly with very deep command hierarchies (Approach E handles nested command logic better). Pairs well with the locked Plan screen's "ordered condition→action pairs" description in the blueprint editor.

---

#### Journey: Tomás, 22, College Student, First Strategy Game

**Context:** Mission 2. Has completed Mission 1 with a single scout. Now has a scout and a striker.

**Minute 0:00 — The Empty Rule Stack**
Tomás selects STRIKER-A on the board. The workbench shows an empty rule stack with a pulsing "Add Rule" button at the bottom. Above the stack, the striker's stats: Buffer 8, Hook Slots 2, Perception 2 (Narrow), Skills: engage, breach.

He clicks "Add Rule." A blank rule card appears with three dropdown regions: condition (blinking), filters (empty), action (blinking).

**Minute 0:15 — Building the First Rule**
He clicks the condition dropdown. Options appear as labeled icons:
- 📦 Buffer contains [type...]
- 📦❌ Buffer empty of [type...]
- 📦🔴 Buffer full
- ✅ Always

He picks "📦 Buffer contains" and a second dropdown appears listing signal types: `ENEMY_SPOTTED`, `THREAT_DETECTED`, `TRAJECTORY_UPDATE`, `ALLY_BREACHING`, `RESOURCE_FOUND`. He picks `ENEMY_SPOTTED`.

The filter section shows a "+" pill with tooltip "Add filter (optional)." He skips it for now.

He clicks the action dropdown: `MOVE_TOWARD`, `ENGAGE`, `HOLD`, `PATROL [path]`. He picks `MOVE_TOWARD`. A target selector dropdown appears: `FRESHEST`, `NEAREST`, `HIGHEST_FIDELITY`. He picks `NEAREST`.

The rule card now reads, in auto-generated text below the dropdowns: *"If buffer has ENEMY SPOTTED → move toward nearest."*

The board's ghost updates: a faint dotted line from the striker toward the nearest phantom enemy position.

**Minute 0:40 — Second and Third Rules**
Rule 2: `IF BUFFER_CONTAINS THREAT_DETECTED THEN ENGAGE NEAREST`. The striker will fight if an enemy is right next to it.
Rule 3: `IF ALWAYS THEN HOLD`. Default behavior: stand still and wait.

He looks at his three-rule stack. The top-to-bottom gradient makes the priority obvious. If an enemy is spotted (rule 1 fires), move toward it. If a threat is adjacent (rule 2 fires), engage. Otherwise, hold position.

Wait — he sees a problem. Rule 1 fires before rule 2. If the buffer has both an `ENEMY_SPOTTED` and a `THREAT_DETECTED`, the striker will move toward the enemy instead of engaging the adjacent threat. He needs to swap rules 1 and 2.

He grabs rule 2's drag handle and drags it above rule 1. The gradient shifts. Now the stack reads: Engage first, then move, then hold. He's just learned **priority ordering** through a concrete decision, not a tutorial popup.

**Minute 1:30 — Execute and Observe**
He hits EXECUTE. Sealed watch: the scout patrols, spots an enemy, hooks fire, the striker's buffer fills. The striker moves toward the reported position (rule 2 fires — buffer has ENEMY_SPOTTED but no adjacent THREAT_DETECTED yet). Two ticks later, the striker reaches adjacency. Rule 1 fires: ENGAGE. Red flash. Enemy eliminated.

Tomás pumps his fist. His three rules, ordered correctly, produced a kill chain.

**Minute 3:00 — Inspector Revelation**
In the Inspector, he clicks the striker at tick 14 (before the kill). Buffer state: slot 1 = `ENEMY_SPOTTED, C4, tick 10, fidelity 0.8`, slot 2 = `THREAT_DETECTED, C5, tick 13, fidelity 1.0`. He sees that rule evaluation checked rule 1 first (engage nearest) — but the `THREAT_DETECTED` entry matched, so engage fired. The green highlight on rule 1 in the inspector sidebar shows it was this rule that won.

He realizes: the inspector doesn't just show *what happened* — it shows *which rule decided it*. Every tick has a highlighted rule card. This is the debrief's teaching tool.

**UI Annotations:**
- Rule stack: right panel, max-width 320px, vertical scroll after 8 rules
- Rule cards: 40px height, three colored segments (condition/filters/action)
- Drag handles: 12px grip dots between cards, cursor changes to grab
- Ghost preview: updates per-rule on hover, full-stack on "Test" click
- Auto-generated text: 12px grey italic below each card

---

#### Journey: Keiko, 38, Game Designer, Slay the Spire Veteran

**Context:** Mission 7. Command agent introduced. Keiko has a 5-unit army with complex channel wiring.

**Minute 0:00 — The 18-Rule Wall**
Keiko's command agent has 18 rules. The stack overflows the workbench panel — she scrolls. The rules handle: scouting mode (rules 1-4), combat mode (rules 5-10), retreat mode (rules 11-15), idle mode (rules 16-18). Mode switching depends on buffer contents: combat mode activates when `THREAT_DETECTED count ≥ 3`.

The problem: she's encoding a finite state machine (scout/combat/retreat/idle) in a flat priority list. She's duplicating conditions across rules — rules 5-10 all start with `BUFFER_CONTAINS THREAT_DETECTED, count ≥ 3`. If she wants to change the combat trigger threshold to 4, she edits six rules.

**Minute 1:00 — The Workaround**
She discovers she can use a relay as a "mode detector" — a relay whose only job is to listen for threats, count them via compress, and broadcast a `COMBAT_MODE` signal on a dedicated channel. Now her command agent's rules only need `BUFFER_CONTAINS COMBAT_MODE` instead of repeating the count filter. She's invented the Observer pattern using hooks and rules together.

**Minute 3:00 — The Epiphany**
After sealed watch, Keiko realizes: the flat priority list FORCED her to invent the mode-detector relay. In a behavior tree system, she would have nested the combat rules under a condition node. Instead, the priority queue's flatness pushed the logic into the architecture — the relay network IS the nesting. The limitation became a feature.

She takes a screenshot of her rule stack alongside her relay's channel map for a design blog post: "How a flat rule system accidentally teaches distributed systems design."

**UI Annotations:**
- 18-rule stack requires scrolling; scroll indicator on right edge
- Duplicate conditions highlighted with a subtle amber outline (lint warning)
- The relay "mode detector" pattern visible in the channel map: a dedicated `combat-mode` channel with one sender and one receiver

---

#### Journey: Retired Sergeant Major Kwame, 61, Never Played a Video Game

**Context:** Mission 1. His granddaughter installed the game for him. He has military tactical experience but zero gaming literacy.

**Minute 0:00 — Orientation**
Kwame sees the board and recognizes the grid — it looks like a tactical map. The unit icons are legible: 👁 is clearly a lookout, ⚔ is a fighter. But the workbench panel on the right is foreign territory. He sees "Add Rule" and the empty stack.

**Minute 0:30 — First Contact with Dropdowns**
He clicks "Add Rule" and the condition dropdown appears. He reads the options. "Buffer contains" means nothing to him — he doesn't know what a buffer is yet. But "ENEMY SPOTTED" — he understands that. He selects it. The action dropdown appears. "Move Toward" — tactical advance. He selects it. Target: "Nearest" — he picks it because it's the most natural military choice.

The auto-generated text reads: *"If buffer has ENEMY SPOTTED → move toward nearest."* This sentence he can parse. "If my lookout spots an enemy, move toward it." He adds a second rule: "If ALWAYS → PATROL." He understands patrol from his career.

**Minute 1:30 — The Ordering Moment**
He initially puts patrol above move-toward. When he runs EXECUTE, the scout patrols and ignores the enemy report. The sealed watch shows the scout walking its path while an enemy approaches. In the debrief, he opens the inspector and sees rule 1 (patrol) highlighted green for every tick — it always matches because it's `ALWAYS`.

He realizes: "The patrol order is too high. It's like giving a standing order that overrides a contact report." He drags patrol to the bottom. This is military logic — contact reports override standing orders.

**Minute 2:30 — "This is a FRAGO"**
After reordering works, Kwame says to his granddaughter: "These rules are a fragmentary order. The higher ones are more urgent. You put the emergency response at the top and the routine patrol at the bottom." He's mapped the priority queue to something he's known for 40 years.

---

## Approach C: The Assembly Prefix (Shenzhen I/O Model)

**Philosophy:** Rules are unconditional by default. A **prefix modifier** (+/−) makes them conditionally enabled or disabled based on the most recent comparison. This is Zachtronics' insight: don't build complex conditions. Instead, let simple tests enable or disable subsequent lines.

### Mechanical Specification

Each agent has an ordered list of **instructions** (not "rules" — the vocabulary shifts). Each instruction is one of:

**Test instructions** (set internal +/− flag):
- `TEST buffer_has [signal_type]` — sets + if true, − if false
- `TEST buffer_count [signal_type] [operator] [N]` — count comparison
- `TEST signal_age [signal_type] [operator] [N]` — freshness comparison
- `TEST signal_fidelity [signal_type] [operator] [threshold]` — quality comparison

**Action instructions** (optionally prefixed):
- `MOVE_TOWARD [target]`, `ENGAGE`, `EVADE`, `HOLD`, `PATROL`
- Relay/command skills: `COMPRESS`, `FILTER`, `AMPLIFY`, `REASSIGN`, etc.

**Prefixes:**
- No prefix: always executes
- `+`: only executes if last TEST was true
- `−`: only executes if last TEST was false

**Flow control:**
- `JUMP [label]` — unconditional jump to labeled instruction
- `+JUMP [label]` / `−JUMP [label]` — conditional jump

Evaluation: instructions execute sequentially, top-to-bottom, once per tick. Multiple actions can fire in a single tick (unlike the priority queue's first-match semantics). A `JUMP` loops or branches.

### What It Looks Like

The instruction list renders as a vertical code block with line numbers — but every line is constructed from dropdowns and pills, not typed text. Each line has four slots:

```
[line#] [prefix slot: ·/+/−] [instruction dropdown] [parameter pills]
```

Line numbers are monospaced in a dark gutter. The prefix slot is a three-way toggle: a dot (always), a green plus, or a red minus. Each click cycles the prefix. The instruction dropdown opens a categorized menu (Test / Move / Skill / Flow). Parameters are clickable pills that open inline editors.

The visual rhythm is distinctive: TEST lines are indented by 0px with a yellow highlight. Action lines with + prefix are indented by 16px with green left border. Action lines with − prefix are indented by 16px with red left border. Unprefixed actions have no indent and a grey left border. The alternating indent creates a visual "question and response" pattern that reads like a dialogue:

```
  TEST buffer_has ENEMY_SPOTTED         ← yellow, no indent
    + MOVE_TOWARD freshest              ← green, indented
    − PATROL default_path               ← red, indented
  TEST signal_age THREAT < 3            ← yellow, no indent
    + ENGAGE nearest                    ← green, indented
```

### Strengths

- **Powerful composition.** Multiple TESTs can be chained: `TEST A; +TEST B; +ENGAGE` means "if A and B then engage." `TEST A; −TEST B; +ENGAGE` means "if A and not B then engage." Full boolean logic without explicit AND/OR/NOT operators.
- **Multiple actions per tick.** Unlike priority queue (one action per evaluation), the assembly model can fire several actions: TEST → +MOVE → TEST → +ENGAGE. This allows complex multi-step behaviors in a single tick.
- **Zachtronics-proven.** The +/− prefix is the core mechanic of Shenzhen I/O, one of the most acclaimed programming puzzle games ever made. The constraint-as-creativity principle is validated.
- **Natural teaching sequence.** Start with unprefixed actions only. Introduce TEST + single prefix. Then TEST + chained prefixes. Then JUMP for loops. Each addition doubles expressive power.
- **Meta-level fluency.** Command agents writing instructions that include `REASSIGN` and `REROUTE` feel like writing microcontroller firmware — which IS the game's fantasy.

### Weaknesses

- **Requires sequential thinking.** The player must understand instruction-by-instruction execution. The priority queue's "first match wins" is a single decision. The assembly prefix's "execute line by line, tests set flags, flags gate actions" requires tracing execution flow.
- **The +/− prefix is cryptic until learned.** "+" means "if the last test passed" is non-obvious. Gladiabots' "IF enemy spotted THEN attack" is immediately parseable by anyone. `TEST buffer_has ENEMY_SPOTTED / + ENGAGE nearest` requires explanation.
- **JUMP creates spaghetti.** Once players discover JUMP, they can create looping, branching instruction sequences that are powerful but unreadable. A 20-line instruction set with 4 JUMPs is as impenetrable as real assembly code.
- **Multi-action execution is hard to debug.** If three actions fire in one tick (move, engage, amplify), the inspector must show the execution trace line-by-line, not just "which rule won."
- **Alienates non-programmers.** The assembly aesthetic appeals to Zachtronics fans but may repel the "accessible to someone who's never played a strategy game" requirement.

### Interaction Effects

This approach deeply reinforces the "vocabulary is 1:1 with real agentic AI engineering" claim because production rule systems and microcontroller firmware use exactly this pattern. It pairs well with the inspector's tick-by-tick scrubbing (each tick's instruction trace is a linear execution log). But it conflicts with the "accessible to someone who's never played a strategy game" constraint — the Shenzhen I/O audience is specifically engineers and puzzle enthusiasts.

The TikTok clip problem: watching someone's assembly instructions execute isn't visually exciting. The drama is in the battlefield consequences, not the instruction trace.

---

#### Journey: Amir, 26, Shenzhen I/O Top 10% Player

**Context:** Mission 5. Factory just introduced. Amir has been frustrated by the priority queue model in early missions ("it's Gladiabots, not Robot Uprising"). He discovers the game has an "Advanced Rules Mode" unlockable.

**Minute 0:00 — "Finally"**
Amir enables Advanced Rules Mode in settings. His priority queue rules dissolve and reform as an instruction list. His old rule "IF BUFFER_CONTAINS ENEMY_SPOTTED THEN MOVE_TOWARD freshest" is now two lines:

```
01  TEST buffer_has ENEMY_SPOTTED
02  + MOVE_TOWARD freshest
```

He grins. This is his language.

**Minute 0:30 — First Composition**
He writes a conditional that the priority queue couldn't express: "If there are enemy reports AND they're fresh AND there are at least 2, THEN engage aggressively. Otherwise, if there's even one stale report, patrol cautiously."

```
01  TEST buffer_count ENEMY_SPOTTED >= 2
02  + TEST signal_age ENEMY_SPOTTED < 3
03    + ENGAGE nearest                    ← both tests passed: fresh + multiple
04  TEST buffer_has ENEMY_SPOTTED
05  + PATROL cautious_path               ← any enemy report, even stale: cautious patrol
06  − PATROL default_path                ← no enemy reports at all: normal patrol
```

Six lines. Two behaviors impossible in the priority queue. He feels the power differential immediately.

**Minute 2:00 — The Command Agent**
He writes COMMAND-A's instructions. The command agent doesn't move or fight — it manages other agents:

```
01  TEST buffer_count THREAT_DETECTED >= 4
02  + REASSIGN SCOUT-A patrol aggressive_path
03  + REROUTE RELAY-B channel priority_alert
04  − TEST buffer_has ALLY_BREACHING
05    + PRIORITIZE STRIKER-A breach_target
06    − REASSIGN SCOUT-A patrol default_path
```

The command agent checks threat density. If high (≥4 threats): switch scout to aggressive patrol AND reroute relay to priority channel. If low threats but ally is breaching: prioritize the striker on the breach target. If nothing notable: reset scout to default.

This is meta-level programming — the "factory that builds the factory" feeling. Amir is managing managers. His instructions don't move units; they reconfigure other units' behavior mid-battle. He screenshots this for Twitter: "Robot Uprising lets me write firmware for my general."

**Minute 4:00 — The Debugging Problem**
After sealed watch, Amir's formation collapsed at tick 38. In the inspector, he clicks COMMAND-A at tick 38. The execution trace shows:

```
01  TEST buffer_count THREAT_DETECTED >= 4  → FALSE (count was 3)
04  − TEST buffer_has ALLY_BREACHING        → TRUE
05    + PRIORITIZE STRIKER-A breach_target   → FIRED
```

The command agent prioritized breaching because it didn't see enough threats — but the count was 3, just one short of the threshold. Amir adjusts the threshold to 3 and re-executes. This time, the command agent switches to aggressive mode one tick earlier, and the formation holds.

He's doing exactly what he does at work: reading execution logs and tuning thresholds. The game feels like his IDE.

---

## Approach D: The Sentence Builder

**Philosophy:** Rules are composed by snapping together **word tiles** into English-like sentences. No code. No dropdowns. Physical manipulation of a vocabulary. Baba Is You's sentence construction meets Gladiabots' query model.

### Mechanical Specification

The player has a **word tray** containing tiles organized by category:

**Condition tiles (coral):** `IF`, `AND`, `OR`, `NOT`, `WHEN`
**Subject tiles (blue):** `BUFFER`, `SIGNAL`, `ENEMY`, `ALLY`, `SELF`
**Verb tiles (green):** `CONTAINS`, `LACKS`, `EXCEEDS`, `MATCHES`
**Object tiles (yellow):** `THREAT`, `POSITION`, `TRAJECTORY`, `RESOURCE`, `COMMAND`
**Qualifier tiles (purple):** `FRESH`, `STALE`, `MANY`, `FEW`, `HIGH-FIDELITY`, `LOW-FIDELITY`, `NEARBY`, `DISTANT`
**Action tiles (cyan):** `THEN`, `MOVE-TOWARD`, `ENGAGE`, `EVADE`, `PATROL`, `HOLD`, `COMPRESS`, `AMPLIFY`
**Target tiles (white):** `NEAREST`, `FRESHEST`, `STRONGEST`, `WEAKEST`, `ANY`

Rules are built by dragging tiles onto a **sentence rail** — a horizontal track with magnetic snap points. The rail parses left-to-right and glows green when the sentence is grammatically valid, amber when incomplete, red when invalid.

Example sentences:
- `IF BUFFER CONTAINS FRESH THREAT THEN ENGAGE NEAREST`
- `IF BUFFER LACKS POSITION AND SIGNAL EXCEEDS STALE THEN PATROL`
- `WHEN ENEMY NEARBY NOT HIGH-FIDELITY THEN EVADE`

Multiple sentence rails stack vertically (priority order, like Approach B). Each rail is a self-contained rule.

### What It Looks Like

The workbench splits into two zones. The upper zone is the **sentence workspace** — a series of horizontal rails, one per rule, with tiles snapped onto them. Each tile is a rounded rectangle (48px × 28px) with a single word in a clean sans-serif font, color-coded by category. The tiles have a slight 3D bevel and cast a tiny shadow, giving them a physical "Scrabble tile" feel.

The lower zone is the **word tray** — a categorized grid of available tiles. Categories are separated by thin lines and labeled. The tray scrolls horizontally. When the player drags a tile from the tray, it lifts with a subtle pop animation and follows the cursor. The sentence rail's snap points glow to show valid placement positions. Invalid positions flash red. When the tile snaps into place, a soft click sound plays and the rail's parse indicator updates.

Between tiles on a rail, thin connector lines appear — like sentence diagramming. The visual grammar is legible: a sentence is a left-to-right chain of colored blocks, and the color sequence tells you the sentence type at a glance (coral-blue-green-purple-yellow-cyan-white = condition-subject-verb-qualifier-object-action-target).

The sentence rail auto-generates a plain-English readout below itself: *"If the buffer contains a fresh threat, then engage the nearest enemy."* This confirms the player's tile arrangement.

### Strengths

- **Physical and tactile.** Dragging tiles onto rails feels like building with Legos or playing Scrabble. The physicality creates satisfaction and memory — players remember tile positions spatially.
- **Natural language readability.** Rules read as English sentences. Zero syntax barrier. A spectator can read the rails and understand the agent's logic without explanation.
- **Grammar prevents errors.** The rail's parser only allows grammatically valid arrangements. You CAN'T create a nonsensical rule because the snap points won't accept it. Errors are impossible, not just warned about.
- **Discovery through vocabulary.** New tiles unlock as the campaign progresses. Each new tile is a new word in the player's vocabulary — literally expanding what they can express. The `NOT` tile appearing in Mission 3 is the moment negation becomes possible. It's a physical "aha" — a new tile in the tray that changes everything.
- **Spectator-friendly.** Streamers can show their sentence rails on screen and viewers can read them instantly. The color coding makes rails visually distinctive even at low resolution.
- **The TikTok clip:** A time-lapse of someone building a complex 8-rule sentence chain, tiles sliding into place with click-click-click sounds, then hitting EXECUTE and watching the army perform exactly what the sentences describe. Immensely satisfying.

### Weaknesses

- **Limited expressive depth.** The vocabulary is finite. If the player wants to express something the tiles don't cover (e.g., "if the buffer has more THREAT entries than POSITION entries"), they can't. New tiles must be designed for every new concept.
- **Screen real estate.** Long sentences eat horizontal space. A rule with two conditions, a negation, and a qualified target might span 12 tiles (576px). On smaller screens, rails truncate or require horizontal scrolling.
- **Grammar design is hard.** The sentence parser must handle ambiguity (does `NOT` negate the next tile only or the rest of the sentence?), composition (`AND` and `OR` precedence), and edge cases. The grammar IS the game's complexity ceiling.
- **Tile unlock pacing.** The vocabulary must grow precisely with the campaign. Too many tiles early = overwhelm. Too few tiles late = frustration. Each mission must introduce exactly the right new tiles.
- **Touch input scaling.** On mobile, dragging 48px tiles onto snap points with a fingertip is imprecise. Touch adaptation needs significantly larger tiles, which means fewer tiles visible at once.

### Interaction Effects

The sentence builder creates a unique relationship with the **onboarding system**: each new tile IS the tutorial. The game doesn't explain concepts; it gives you a new word. When `FIDELITY` tiles appear in Mission 5, the game doesn't lecture about signal quality — it gives you `HIGH-FIDELITY` and `LOW-FIDELITY` tiles and a mission where unfiltered signals cause failure. You figure out what fidelity means by using the word.

This approach conflicts with Approach C's meta-level command feeling. Dragging tiles like Scrabble pieces doesn't feel like writing firmware. It feels like crafting a spell or writing a haiku. The fantasy shifts from "engineer" to "language designer."

---

#### Journey: Sofia, 10, Plays Roblox and Minecraft, No Strategy Experience

**Context:** Mission 1. Her older sister showed her the game.

**Minute 0:00 — "It's Like Scrabble!"**
Sofia sees the board on the left and the workbench on the right. The word tray at the bottom has colorful tiles. She recognizes the layout — it's like a word game. The sentence rails above are empty. A gentle animation shows a hand dragging a tile onto a rail, then the rail glowing green.

She looks at the tiles: `IF`, `BUFFER`, `CONTAINS`, `THREAT`, `THEN`, `MOVE-TOWARD`, `NEAREST`. She doesn't know what a buffer is, but she knows how sentences work.

**Minute 0:20 — First Sentence**
She drags `IF` onto the first rail. It snaps into place at the leftmost position. The rail's second snap point glows — only blue (subject) tiles will fit here. She drags `BUFFER`. Third snap point glows green (verb tiles). She drags `CONTAINS`. Fourth snap point: yellow tiles. She drags `THREAT`. The rail pulses amber — incomplete but valid so far. Fifth snap point: cyan tiles. She drags `THEN`. Sixth: action tiles. `MOVE-TOWARD`. Seventh: white target tiles. `NEAREST`.

The rail glows green. Below it, text appears: *"If the buffer contains a threat, then move toward the nearest."*

She reads it aloud: "If the buffer contains a threat, then move toward the nearest." She doesn't know what "buffer" means exactly, but the sentence makes grammatical sense. She hits EXECUTE.

**Minute 1:00 — It Works!**
Her scout spots an enemy. A `THREAT` entry appears in the buffer (she can see the buffer bar fill with a red pip). Her rule fires: the scout moves toward the enemy. She claps.

**Minute 1:30 — "What's EVADE?"**
She scrolls the word tray and finds `EVADE`. She doesn't know what it means. She drags it onto a second rail: `IF BUFFER CONTAINS THREAT THEN EVADE`. She has two rules — one says move toward, one says evade. She hits EXECUTE.

The scout spots an enemy and — moves toward it. Rule 1 (move toward) fired first because it's higher on the stack. She learns priority ordering by accident: the top sentence wins.

She drags the EVADE rail above the MOVE-TOWARD rail. Now the scout evades. She switches them back and forth, watching the behavior change. She's 10 years old and she's learning production rule evaluation order through physical tile manipulation.

**UI Annotations:**
- Word tiles: 48×28px, rounded corners, category-colored, slight bevel shadow
- Sentence rail: horizontal track, 16px tall, magnetic snap points glow on drag
- Parse indicator: left edge of rail, circle that pulses green/amber/red
- Word tray: bottom 120px of workbench, horizontal scroll, categorized columns
- Auto-generated text: 11px grey italic below each rail

---

#### Journey: Marcus, 45, Business Executive, Plays Only Chess and Wordle

**Context:** Mission 4. Marcus has been building sentences for three missions and is comfortable with the tile vocabulary.

**Minute 0:00 — The New Tile**
Mission 4 unlocks the `FRESH` and `STALE` qualifier tiles. They appear in the word tray with a sparkle animation and a tooltip: "New word unlocked!" Marcus examines them. They're purple (qualifier) tiles. Where do qualifiers go?

He builds: `IF BUFFER CONTAINS FRESH THREAT THEN ENGAGE NEAREST`. The `FRESH` tile slots between `CONTAINS` and `THREAT` — modifying the noun. The auto-text reads: *"If the buffer contains a fresh threat, then engage the nearest."*

He builds a second rule: `IF BUFFER CONTAINS STALE THREAT THEN PATROL`. Now his striker engages on fresh intel and patrols on stale intel. He didn't need a tutorial — the tile placement taught the concept. "Fresh" and "stale" are words he already knows from English. Their meaning in the game context is instantly clear.

**Minute 2:00 — The NOT Tile**
He experiments with `NOT`: `IF BUFFER NOT CONTAINS THREAT THEN PATROL`. The auto-text: *"If the buffer does not contain a threat, then patrol."* He's expressing negation through vocabulary, not syntax. No boolean operators. No code. Just English words on a rail.

**Minute 4:00 — The Mission Debrief**
Marcus's army won. In the inspector, he clicks a unit and sees which sentence fired at each tick — the rail highlights with a green pulse. He can read every decision: tick 12, sentence 1 fired ("fresh threat → engage"), tick 15, sentence 3 fired ("no threat → patrol"). The sentences ARE the explanation. No abstraction layer between intent and execution.

Marcus texts his chess club: "I'm playing a game where you build army AI by writing sentences. Like chess notation but for robots." Three club members download it that evening.

---

## Approach E: The Nested Conditional (Full Behavior Tree)

**Philosophy:** Rules form a tree structure with explicit branching, nesting, and grouping. Conditions gate subtrees. Actions are leaves. This is the full behavior tree model used in professional game AI, exposed directly to the player.

### Mechanical Specification

Each agent has a **behavior tree** rendered as a visual node graph:

**Node types:**
- **Selector (?):** Tries children left-to-right. First success stops evaluation (like OR).
- **Sequence (→):** Tries children left-to-right. First failure stops evaluation (like AND).
- **Condition (◇):** Tests a predicate. Succeeds or fails.
- **Action (■):** Executes a skill/movement. Always succeeds.
- **Decorator (○):** Modifies child (invert, repeat, until-fail).

The tree evaluates from the root each tick, traversing depth-first left-to-right.

### What It Looks Like

A miniature node graph in the workbench panel. The root node sits at the top center. Children branch downward. Condition nodes are diamond-shaped (pale yellow). Action nodes are square (cyan). Selector nodes are circles with "?" (purple). Sequence nodes are circles with "→" (green). Edges are curved lines with slight animation (a subtle pulse traveling root-to-leaf showing evaluation direction).

Nodes are created by right-clicking on an existing node → "Add child." Nodes can be dragged to reorder siblings (changing priority). The tree auto-layouts to prevent overlap. A minimap in the corner shows the full tree when it's too large for the viewport.

During sealed watch, the tree's evaluation path is visible: nodes that evaluate this tick glow, and the path from root to the fired action traces a bright line through the tree. Failed branches dim. The tree becomes a real-time diagnostic visualization.

### Strengths

- **Maximum expressiveness.** Any behavior expressible in a finite state machine or production system is expressible in a behavior tree. The nesting handles state machines naturally: a Selector at the root branches into "combat subtree" and "patrol subtree," each with its own Sequence of conditions and actions.
- **Grouping and modularity.** Related rules group visually as subtrees. A "combat mode" subtree bundles all combat-related conditions and actions. Collapsible subtrees keep the interface manageable even at scale.
- **Professional-grade.** This is the actual tool used by game AI engineers. The 1:1 vocabulary claim is strongest here — the player is literally building behavior trees.
- **Visual debugging is spectacular.** The tree's evaluation trace during sealed watch is a first-class diagnostic: you can SEE the decision path at every tick, watch branches light up and dim, trace exactly why the agent chose to engage instead of evade.

### Weaknesses

- **Steep learning curve.** Selector vs. Sequence semantics are non-obvious. Even game AI programmers sometimes confuse them. A player who's never seen a behavior tree needs significant onboarding.
- **Spatial layout consumes screen real estate.** A tree with 20+ nodes fills the entire workbench panel. Scrolling and zooming become necessary. The split-screen plan view (board left, workbench right) constrains tree size.
- **Mouse-intensive.** Building a behavior tree requires many clicks: create node, set type, configure parameters, connect, position. The interaction cost per rule is higher than any other approach.
- **Node soup.** Without discipline, behavior trees devolve into tangled graphs that are harder to read than the flat list they replaced. The expressiveness that enables power also enables mess.
- **Controller/touch hostile.** Behavior tree editors on gamepad or touchscreen are painful. The precise node placement and tree navigation don't map well to non-mouse inputs.

### Interaction Effects

Behavior trees pair naturally with the inspector's tick-by-tick scrubbing — the tree evaluation trace IS the debrief tool. But they conflict with the "accessible to someone who's never played a strategy game" requirement. The onboarding cost is highest of any approach. Gladiabots attempted this and got it to work, but with a specific audience (programming-game fans).

The TikTok clip: a fully expanded behavior tree evaluating in real-time, branches lighting up like a circuit board, converging on a decisive action that produces a spectacular flanking maneuver. Beautiful for experts. Meaningless for newcomers.

---

#### Journey: Raven, 19, CS Student, First Job in Game AI

**Context:** Mission 6. Has been using behavior trees in Unity tutorials. Immediately switched to Advanced Mode.

**Minute 0:00 — Home Turf**
Raven opens the workbench and sees a behavior tree editor. "Oh, this is just a BT. I know this." She creates a Selector at the root with two children: a "Combat" Sequence and a "Patrol" Sequence.

The Combat Sequence: Condition(buffer has THREAT, age < 3) → Condition(count ≥ 2) → Action(ENGAGE nearest). Both conditions must pass (Sequence = AND). The Patrol Sequence: Action(PATROL default_path).

The tree reads cleanly: "Try combat first (need fresh threats, at least 2). If combat conditions aren't met, fall through to patrol." She built it in 90 seconds because she already knows the vocabulary.

**Minute 2:00 — The Command Agent Tree**
Her command agent's tree is a three-level Selector:
```
Root (?)
├── High Threat Sequence (→)
│   ├── Condition: THREAT count ≥ 5
│   ├── Action: REASSIGN all scouts to aggressive patrol
│   └── Action: REROUTE relay to priority channel
├── Breach Opportunity Sequence (→)
│   ├── Condition: ALLY_BREACHING exists
│   ├── Condition: no THREAT in 3 tiles of base
│   └── Action: PRIORITIZE striker on breach target
└── Default Sequence (→)
    └── Action: REASSIGN scouts to default patrol
```

This is clean, modular, and readable. Each subtree is a "mode" with clear entry conditions. The visual layout makes the decision structure obvious. She screenshots it for her portfolio.

**Minute 5:00 — The Problem**
Her tree has grown to 31 nodes across 4 levels of nesting. The workbench panel is cramped. She's zooming and panning. The board on the left — which she needs to see for spatial decisions — is getting ignored because the tree demands her attention. The split-screen layout doesn't have enough room for a serious behavior tree.

She files feedback: "Let me pop the tree editor into a full-screen modal. Or make the split resizable."

---

## Approach F: The Pattern Matcher

**Philosophy:** Rules don't test individual conditions — they match **patterns** in the buffer. A pattern is a template describing what a specific buffer state looks like. If the buffer matches the pattern, the action fires. This is the production rule system from AI, applied directly.

### Mechanical Specification

Each agent has an ordered list of **pattern→action** pairs:

```
PATTERN: [slot descriptors...] → ACTION: [skill + target]
```

A **slot descriptor** describes what one buffer slot should contain:
- `THREAT(age < 3)` — a threat entry younger than 3 ticks
- `POSITION(source: SCOUT, fidelity > 0.6)` — a position from a scout, decent quality
- `* ` — any entry (wildcard)
- `_` — empty slot
- `!THREAT` — NOT a threat entry

A pattern matches when the buffer contains entries satisfying all non-wildcard slot descriptors (order doesn't matter — it's set matching, not sequence matching).

**Special pattern operators:**
- `COUNT(THREAT) >= 3` — at least 3 threat entries
- `RATIO(THREAT/TOTAL) > 0.5` — more than half the buffer is threats
- `SEQUENCE(THREAT, POSITION, COMMAND)` — these types in temporal order

### What It Looks Like

The workbench shows a **buffer template** — a visual representation of the agent's buffer slots, where each slot is a configurable tile. The buffer template looks like the actual buffer visualization from the inspector, but editable. Each slot is a 32×32 square arranged in a row. Empty slots are dashed outlines. The player drags signal type icons into slots to create the pattern.

Below the buffer template, the action selector: what to do when this pattern matches.

Multiple pattern→action pairs stack vertically, ordered by priority. The visual metaphor is powerful: "When my buffer looks like THIS → do THIS."

The RATIO and COUNT operators appear as overlays on the template — a colored bar spanning multiple slots labeled "≥ 3 of these" or a percentage indicator.

### Strengths

- **Buffer-native.** This is the only approach where the rule language directly mirrors the buffer visualization. What you see in the inspector (the buffer state) is what you build in the rules (the buffer pattern). The mental model is one thing, not two.
- **Pattern matching is intuitive for visual thinkers.** "When my buffer looks like [3 red, 2 blue, 1 empty]" is a visual concept, not a logical one. Players who struggle with IF-THEN logic may find pattern matching natural.
- **Ratio and count are first-class.** "More than half threats" is a pattern, not a compound condition. This enables strategies that respond to buffer composition rather than individual entries.
- **Directly teaches buffer management.** Because the rule language IS the buffer, every rule the player writes reinforces buffer awareness. The rules language and the core mechanic are the same thing.

### Weaknesses

- **Unusual.** No comparable game uses this approach. Players have no prior mental model for "buffer pattern matching" as a gameplay mechanic.
- **Spatial reasoning load.** The player must maintain a mental model of what the buffer looks like during execution — which changes every tick. Writing patterns requires predicting buffer states, which is cognitively expensive.
- **Debugging is asymmetric.** Patterns that ALMOST match are invisible — the inspector shows "pattern didn't match" but not "pattern was one entry away from matching." Near-misses are hard to diagnose.
- **Pattern explosion.** To handle all situations, the player needs many patterns. A buffer with 8 slots and 5 signal types has hundreds of possible states. Coverage becomes a completeness problem.

### Interaction Effects

The pattern matcher uniquely reinforces the game's central theme: *the buffer IS the agent's reality*. The rules language doesn't reference the world — it references the buffer, which is a filtered, compressed, potentially stale representation of the world. The rules operate on the agent's beliefs, not on truth. This is the deepest expression of the game's core insight.

---

#### Journey: Zara, 28, Data Scientist, Plays Slay the Spire

**Context:** Mission 3. Zara is intrigued by the buffer visualization and has been spending more time in the inspector than in combat.

**Minute 0:00 — The Buffer Template**
Zara selects her relay and opens the rules panel. Instead of IF-THEN cards, she sees a visual representation of the relay's 12-slot buffer — 12 squares in a row, each one editable. Above them: "When buffer looks like this →"

She thinks: "I want the relay to compress when it has 4+ raw observations." She drags the `OBSERVATION` icon into 4 of the 12 slots. The remaining 8 stay as wildcards (*). Below: `→ COMPRESS freshest 3`.

The pattern reads visually: "When at least 4 slots have observations → compress the 3 freshest into 1." She doesn't need to write a condition — she drew the buffer state she wanted to trigger on.

**Minute 1:00 — The Second Pattern**
She adds a second pattern: 6+ of 12 slots are `THREAT` type → `AMPLIFY on channel EMERGENCY`. The ratio overlay shows a red bar spanning 6 slots with the label "≥ 6 threats." She reads this as: "When more than half the buffer is threats, something is very wrong — sound the alarm."

**Minute 2:00 — The Aha Moment**
She creates a third pattern: 0 slots contain any signal type (all empty or wildcard-only) → `HOLD`. Then a fourth: exactly 1 `COMMAND` type entry → `PRIORITIZE that command's target`. She's building a complete behavioral specification by describing buffer states, not logic chains.

She opens the inspector after sealed watch and clicks her relay at tick 22. The buffer state is shown — 12 slots with their contents. She can visually compare the actual buffer against her patterns and see which one matched. Pattern 2 (≥ 6 threats) is highlighted green. She can SEE the match: the buffer has 7 red threat entries, exceeding her threshold.

"This is just a regex for the buffer," she murmurs. She's right. And she loves it.

**Minute 4:00 — The Near-Miss Problem**
At tick 35, her relay did nothing. She checks: the buffer had 3 observations, one short of her 4-observation pattern. The pattern didn't match. But the inspector doesn't show "almost matched" — it just shows "no match." She spends 2 minutes figuring out why the relay froze. She wishes the inspector would show near-misses: "Pattern 1: 3/4 observations (1 short)."

---

## Approach Synthesis: The Recommended Hybrid

None of these approaches alone satisfies all constraints. The game needs:
- **Beginner accessibility** (Approach A's simplicity or D's natural language)
- **Veteran depth** (Approach C's composition or E's nesting)
- **Buffer-centricity** (Approach F's pattern matching)
- **Readability** (Approaches B and D's English-like output)
- **1:1 engineering vocabulary** (Approach C's assembly prefix or E's behavior tree)

### The "Growing Grammar" Hybrid

The game could start with one approach and evolve into another as the campaign progresses:

1. **Missions 1-2: Dispatch Table** (Approach A). One signal → one action. Zero cognitive load. The player learns the signal types and action vocabulary.
2. **Missions 3-4: Priority Queue with Filters** (Approach B). The dispatch table "grows" filter pills. The player can now express freshness, fidelity, and count. The visual format evolves: rows gain the middle filter segment.
3. **Missions 5-7: Sentence Builder** (Approach D). The priority queue's dropdowns transform into draggable tiles. New qualifier tiles unlock. The rule format is richer but still English-readable.
4. **Missions 8-10: Full expression** — either the sentence builder with full vocabulary, or an optional switch to assembly prefix (C) or nested conditional (E) for expert players.

This parallels how programming languages teach: Python → C → Assembly. Start human-readable, end machine-powerful.

### Alternative: Dual-Mode

The locked spec's "ordered condition→action pairs" is Approach B (Priority Queue). The game could ship Approach B as the default and offer Approach C (Assembly Prefix) or E (Nested Conditional) as an unlockable "Advanced Mode" — same semantics, different syntax. Both modes compile to the same evaluation engine. The inspector shows behavior in whichever mode the player uses.

---

## Comparable Games — Rules Language Reference

| Game | Rules Model | Condition Vocabulary | Action Vocabulary | Ordering | Expressiveness |
|------|-------------|---------------------|-------------------|----------|----------------|
| **Gladiabots** | Behavior tree (visual) | Target type + filters + selector | Move, attack, grab, drop | Left-to-right depth-first | High |
| **Shenzhen I/O** | Assembly with +/− prefix | TEST instructions | MCxxxx instruction set | Sequential, line-by-line | Very high |
| **Baba Is You** | Sentence construction | Spatial arrangement of word tiles | Dynamic property assignment | Simultaneous (all rules active) | Creative (Turing-complete) |
| **Into the Breach** | N/A (player controls directly) | — | — | — | — |
| **Factorio** | Circuit network conditions | Signal comparisons | Enable/disable, set signal | Priority (first match in decider combinator) | Medium-high |
| **Screeps** | Full JavaScript | Any JS expression | Full API | Code execution order | Unlimited |
| **Autochess** | Implicit (position + items) | No explicit conditions | No explicit actions | — | Very low |
| **Slay the Spire** | Card play (implicit rules) | Energy, hand contents | Card effects | Player-chosen per turn | Medium |

---

## New Aspects Discovered

This analysis revealed several sub-questions that need their own explorations:

1. **3.05c — The "Growing Grammar" unlock pacing:** Exact mission-by-mission rule vocabulary expansion. Which tiles/filters/concepts unlock at which mission? The Goldilocks problem of "enough to solve this mission, not enough to overwhelm."
2. **3.05d — Rules language and accessibility:** How does each approach work with screen readers, colorblindness, motor impairment? The sentence builder's tile dragging is hostile to limited motor control. The priority queue's dropdowns work with keyboard navigation.
3. **3.05e — Rules language spectator readability:** Which approach produces the best "at a glance" understanding for stream viewers, tournament spectators, and TikTok clips? How does the rules display integrate into the sealed watch overlay?
4. **3.05f — The dual-mode compilation guarantee:** If the game offers multiple rules syntaxes (priority queue + assembly prefix), proving they produce identical behavior requires a formal equivalence. Design the compilation layer and the edge cases where equivalence breaks.
5. **3.06-ext — Rule conflict visualization in real-time:** When two rules COULD match but priority ordering picks one, how does the inspector show the "road not taken"? The near-miss visualization problem from Approach F applies to all approaches.

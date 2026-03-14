# 3.08 — Hook Taxonomy: The Event Vocabulary and Action Grammar of Inter-Agent Wiring

## Overview

Hooks are Robot Uprising's reactive wiring system — the "when X happens, broadcast Y on channel Z" primitives that connect agents into an information network. The locked spec says hooks are **fire-and-forget triggers wired to named channels**, with each unit type having a fixed number of hook slots (Scout: 2, Striker: 2, Relay: 4, Specialist: 2, Command: 6).

But the spec doesn't answer the most fundamental design question: **what events can trigger hooks, and what payloads do hooks transmit?**

This is the vocabulary question. If hooks are the verbs of inter-agent communication, the trigger events are the subjects ("when THIS happens") and the payloads are the objects ("send THIS"). The richness of this vocabulary determines:

- **How expressive the wiring is** — can the player describe "alert when scout evades twice in 3 ticks" or only "alert when scout evades"?
- **How readable the network is** — can a spectator look at a channel map and understand what signals flow where?
- **How deep the emergent combos go** — are there unexpected event×payload combinations that create novel strategies?
- **How much noise the system generates** — more trigger events = more signals = more EM emissions = more vulnerability
- **What the player learns about real systems** — event-driven architectures, pub-sub patterns, webhook design

This document catalogs every possible approach to the trigger and payload vocabularies, from the minimal (5 triggers, no payload) to the maximal (30+ triggers, structured payloads with metadata).

---

## The Two Halves: Triggers and Payloads

A hook has two sides:

1. **Trigger** — the event that causes the hook to fire. "WHEN [something happens to this agent]..."
2. **Payload** — what gets sent over the channel. "...SEND [this data] ON [channel name]."

These are independent design axes. A minimal trigger set can pair with rich payloads. A rich trigger set can pair with stripped payloads. The interaction between the two determines the system's character.

---

## Part 1: Trigger Event Vocabularies

### Approach A: The Minimal Trigger Set (5 Events)

**Philosophy:** One trigger per unit activity category. No composition, no parameters. The simplest possible event model.

**The five triggers:**

| Trigger | Fires when... | Available to |
|---------|---------------|-------------|
| `ON_OBSERVE` | Unit's perception detects any entity | Scout, Specialist |
| `ON_THREAT` | Enemy enters perception radius | Scout, Striker, Specialist |
| `ON_RECEIVE` | Any signal arrives in buffer | All units |
| `ON_ELIMINATE` | Unit destroys an enemy | Striker |
| `ON_SKILL` | Any skill activates | All units |

**What it feels like:** The player opens the hook editor. Five icons in a row — an eye (observe), a skull (threat), an inbox (receive), a crosshair (eliminate), a gear (skill). Click one, it lights up. That's the trigger. Done. Five seconds to configure.

**Strengths:**
- Virtually zero learning curve. Five icons, five meanings.
- Every trigger is immediately understandable to a non-gamer.
- Forces the complexity INTO the wiring topology rather than into individual hooks. A complex behavior emerges from 6 hooks on 3 agents, not from 1 sophisticated hook on 1 agent.
- Perfect for Missions 1-4 where the player is learning the basic vocabulary.

**Weaknesses:**
- Can't distinguish between "spotted enemy scout" and "spotted enemy striker." All observations are equal.
- Can't trigger on buffer state (fullness, emptiness, staleness).
- Can't trigger on negative events (silence on a channel, failure to observe, agent NOT doing something for N ticks).
- `ON_SKILL` is too broad — compress, filter, and amplify are very different events.

**The ceiling problem:** By Mission 5-6, players need to build relay networks that respond differently to compressed vs. raw signals, and command units that react to specific subordinate states. The minimal set can't express this.

**Comparable:** Gladiabots' earliest tutorials, where bots have binary triggers (see enemy → shoot, see ally → follow). Players graduate past this within the first hour.

---

### Approach B: The Typed Trigger Set (12 Events)

**Philosophy:** One trigger per distinct game event. Still no parameters, but enough granularity to distinguish meaningful situations.

**The twelve triggers:**

| Trigger | Fires when... | Available to |
|---------|---------------|-------------|
| `ON_SPOT_ENEMY` | Perception detects an enemy unit | Scout, Specialist |
| `ON_SPOT_ALLY` | Perception detects a friendly unit | Scout, Specialist |
| `ON_THREAT_ENTER` | Enemy enters perception radius | Scout, Striker, Specialist |
| `ON_THREAT_EXIT` | Enemy leaves perception radius | Scout, Specialist |
| `ON_RECEIVE_SIGNAL` | Signal arrives in buffer from a channel | All units |
| `ON_BUFFER_FULL` | Buffer reaches capacity | All units |
| `ON_EVADE` | Unit's evade skill fires | Scout |
| `ON_ENGAGE` | Unit eliminates an enemy | Striker |
| `ON_BREACH_START` | Unit begins breaching | Striker |
| `ON_COMPRESS` | Relay completes a compression | Relay |
| `ON_HACK` | Specialist completes a hack | Specialist |
| `ON_IDLE` | Unit has no action to take this tick | All units |

**What it feels like:** The hook editor shows a scrollable column of trigger icons, grouped by category (perception, communication, combat, skills, state). Each icon has a one-word label. The player scrolls, picks one, it snaps into the hook slot with a satisfying click. A tooltip shows a one-sentence description on hover.

**Strengths:**
- Distinguishes the events that actually matter for strategy — `ON_THREAT_ENTER` vs. `ON_THREAT_EXIT` enables "alert when enemy arrives" vs. "report when area is clear."
- `ON_BUFFER_FULL` is critical — it lets the player build backpressure-aware architectures.
- `ON_IDLE` enables watchdog patterns — "if nobody's giving you work, ask for assignments."
- `ON_BREACH_START` enables escort coordination — "when striker commits, rally nearby units."
- Skill-specific triggers let relays broadcast their activity precisely.

**Weaknesses:**
- No parameterization still means "spotted enemy" is one event regardless of enemy type.
- No compound triggers — can't express "IF threat enters AND buffer is NOT full."
- 12 triggers for 2-6 hook slots means most triggers will never be used on any given unit. Decision paralysis for beginners.
- `ON_IDLE` is philosophically tricky — does an agent "know" it's idle? This may break the information-architecture metaphor.

**The sweet spot claim:** This set has the right granularity for a 10-mission campaign. Missions 1-2 use 3-4 triggers. By Mission 10, players have encountered all 12. Each new trigger is a discrete learning moment.

**Comparable:** Into the Breach's threat display system — a finite, learnable set of icons that each mean one specific thing.

---

### Approach C: The Parameterized Trigger Set (8 Triggers × N Parameters)

**Philosophy:** Fewer base triggers, but each trigger takes optional parameters that narrow its firing condition. The trigger is the verb; the parameter is the filter.

**The eight base triggers with parameter slots:**

| Trigger | Parameters | Example Configuration |
|---------|-----------|----------------------|
| `ON_PERCEIVE` | `target_type`, `direction`, `range_bracket` | `ON_PERCEIVE(enemy_striker, north, close)` |
| `ON_SIGNAL` | `channel_name`, `signal_age`, `priority` | `ON_SIGNAL("alarm", fresh, any)` |
| `ON_BUFFER` | `condition` (full/half/empty/stale) | `ON_BUFFER(full)` |
| `ON_COMBAT` | `role` (attacker/defender/witness) | `ON_COMBAT(attacker)` |
| `ON_SKILL_FIRE` | `skill_name` | `ON_SKILL_FIRE(compress)` |
| `ON_MOVEMENT` | `type` (patrol/evade/approach/retreat) | `ON_MOVEMENT(evade)` |
| `ON_SILENCE` | `channel_name`, `ticks_silent` | `ON_SILENCE("scout_feed", 3)` |
| `ON_TICK` | `interval` | `ON_TICK(5)` — fires every 5th tick |

**What it feels like:** The player picks a base trigger from 8 icons. Below it, 1-3 parameter slots materialize with dropdown menus or small number inputs. Each parameter has a default ("any") so the player can leave them unset for broad triggers or narrow them for precision. The UI resembles a function call — `ON_PERCEIVE(▼ enemy_striker, ▼ any_direction, ▼ any_range)` — with dropdown selectors replacing each parameter.

A faint visual language: the trigger icon is the "shape" and parameters are "color fills." `ON_PERCEIVE` with no parameters is a hollow eye icon. `ON_PERCEIVE(enemy_striker)` fills the eye with red. `ON_PERCEIVE(enemy_striker, north)` adds a directional arrow. The icon becomes a compressed visual summary of the full trigger condition.

**Strengths:**
- **The "kitchen faucet" model.** Temperature (trigger) and flow (parameters) are separate controls. Simple when you want simple (pick trigger, leave defaults), precise when you need precision.
- `ON_SILENCE` is revolutionary — detecting the *absence* of communication. "If the scout feed goes quiet for 3 ticks, something's wrong." This is the watchdog timer pattern from real distributed systems.
- `ON_TICK` enables periodic behaviors without dedicated timers — relays that compress every 5 ticks, command units that reassess every 10 ticks.
- `ON_PERCEIVE` with `direction` and `range_bracket` enables directional awareness — a scout facing north broadcasts differently than one facing south.
- Parameters are optional, so beginner-accessible. `ON_PERCEIVE()` fires on every observation, exactly like Approach A's `ON_OBSERVE`.

**Weaknesses:**
- **UI complexity.** Each parameter slot is a decision. 8 triggers × 2-3 parameters = 16-24 total decision points per agent. With 6 hook slots on a Command agent, that's up to 144 micro-decisions.
- `ON_SILENCE` requires the game to track absence, which is computationally different from tracking presence. The tick scheduler needs negative-event detection. This is tractable but adds engine complexity.
- `ON_TICK(5)` is powerful but feels like a timer, not an attention system. It's the mechanic that takes players OUT of the information-architecture metaphor and into generic scripting.
- Parameter dropdowns add UI clutter in the workbench panel. The "clean slot" aesthetic of Approaches A/B gives way to a more IDE-like feel.

**The teaching gradient:** Mission 1 uses `ON_PERCEIVE()` (no params). Mission 2 adds `ON_PERCEIVE(enemy_striker)` (typed params). Mission 4 introduces `ON_SILENCE("feed", 3)` (absence detection). Mission 7 uses `ON_TICK(5)` (periodic scheduling). Each parameter type is a lesson.

**Comparable:**
- **Shenzhen I/O:** Conditional prefix on assembly instructions (`+/-` modifiers that change whether a line executes based on flag state) — minimal parameterization that radically increases expressiveness.
- **IFTTT / Zapier:** Trigger-with-filter model. "When new email arrives" (trigger) + "from [person]" (filter parameter) + "with subject containing [keyword]" (filter parameter).
- **Real webhook systems:** GitHub webhooks fire on events (push, PR, issue) with filter parameters (branch, label, assignee). The player is literally configuring webhooks.

---

### Approach D: The Compound Trigger System (Boolean Composition)

**Philosophy:** Triggers are composable expressions. The player can AND, OR, and NOT base triggers together to create precise firing conditions.

**The grammar:**

```
hook_trigger := base_trigger
             | hook_trigger AND hook_trigger
             | hook_trigger OR hook_trigger
             | NOT hook_trigger
             | ( hook_trigger )
```

**Example configurations:**

| Expression | Meaning |
|-----------|---------|
| `ON_PERCEIVE AND ON_BUFFER(not_full)` | "Fire only if I see something AND have room to report it" |
| `ON_SIGNAL("alarm") AND NOT ON_COMBAT` | "React to alarms only when not fighting" |
| `ON_PERCEIVE(enemy) OR ON_SILENCE("feed", 3)` | "Alert when I see an enemy OR when scout feed dies" |
| `NOT ON_SIGNAL("stand_down")` | "Fire on every tick UNLESS I've received a stand-down order" |

**What it feels like:** The hook editor is a horizontal expression builder. Base trigger chips (rounded rectangles with icons) snap together with AND/OR/NOT connector chips. Dragging an `ON_PERCEIVE` chip next to an `AND` chip next to a `ON_BUFFER(not_full)` chip creates a compound trigger. The expression reads left to right. Invalid expressions (dangling AND, nested NOTs) grey out with a subtle shake animation.

The compound expression renders as a "sentence" at the top of the hook slot: `👁 PERCEIVE AND 📦 BUFFER(not full) → 📡 channel:"alarm"`. It reads almost like English.

**Strengths:**
- **Maximum expressiveness.** Any boolean condition the player can imagine, they can build. This is the endpoint of trigger design.
- **NOT triggers are transformative.** `NOT ON_SIGNAL("stand_down")` creates a default-active hook that can be remotely silenced. A command unit sending "stand_down" on a channel causes all hooks listening for its absence to stop firing. This is the kill switch pattern.
- **Compound triggers enable reactive architectures** that respond to system STATE rather than individual events. "I see an enemy AND my buffer isn't full AND I haven't received a stand-down order" is a contextually-aware trigger that produces intelligent behavior.
- **The expression builder UI is inherently shareable** — players can screenshot their expressions, and the visual sentence format is self-documenting.

**Weaknesses:**
- **Massive learning curve.** Boolean logic is intuitive for programmers but alien to many gamers. "NOT (A AND B)" vs. "NOT A OR NOT B" is De Morgan's law, and players will trip over it.
- **Evaluation order ambiguity.** Does `A OR B AND C` mean `(A OR B) AND C` or `A OR (B AND C)`? Either the UI must enforce explicit parentheses (tedious) or follow standard operator precedence (opaque).
- **Debugging nightmare.** When a compound trigger doesn't fire, which sub-expression failed? The Inspector needs a sub-expression evaluator showing green/red per clause at each tick. This is a major UI feature.
- **Interaction with hook slots:** A Command unit with 6 hook slots and compound triggers on each has potentially 6 boolean expressions running every tick. This is a mini programming language, not an attention system.
- **The "just write code" gravity well.** At this expressiveness level, players ask "why can't I just write JavaScript?" The compound trigger system is fighting to be a visual programming language without admitting it.

**Comparable:**
- **Gladiabots:** Full boolean condition trees for AI behavior. Their community reports this is where the learning curve gets steep — many casual players never touch compound conditions.
- **Excel formulas:** `=IF(AND(A1>5, OR(B1="yes", C1<3)), "fire", "wait")` — compound booleans that most spreadsheet users avoid.
- **Factorio's circuit network:** Wire-based boolean logic that creates emergent automation. Expert players build CPUs; casual players avoid it entirely.

---

### Approach E: The Hybrid Progressive System (Layered Triggers)

**Philosophy:** Start with Approach A's minimal triggers. As the player progresses through the campaign, unlock Approach B's typed events, then Approach C's parameters, then limited composition (AND only, no OR/NOT). The trigger vocabulary grows WITH the player.

**The layer model:**

| Layer | Unlocked | Triggers Available | Composition |
|-------|----------|-------------------|-------------|
| **Basic** (Missions 1-2) | Default | 5 minimal triggers (A) | None |
| **Typed** (Missions 3-4) | After first debrief failure | 12 typed triggers (B) | None |
| **Filtered** (Missions 5-6) | When factory unlocks | 8 parameterized triggers (C) | None |
| **Compound** (Missions 7-8) | When Command unit unlocks | Full parameterized set | AND only |
| **Advanced** (Missions 9-10) | Post-campaign / Gauntlet | Full parameterized set | AND, OR, NOT |

**What it feels like:** The hook editor physically expands as the player progresses. In Mission 1, it's a single row: one icon, one channel name. By Mission 10, it's a full expression builder with parameter dropdowns and boolean connectors. The expansion is VISIBLE — locked layers are shown as grayed-out sections below the current layer, with a padlock icon and the mission name where they unlock. The player can see the future complexity before they need it.

When a new layer unlocks, the hook editor animates: the bottom section brightens, padlock dissolves, new options slide into view. A boot log entry appears: `[HOOK SUBSYSTEM] Advanced trigger parameters initialized. Filter slots: ONLINE.`

**Strengths:**
- **The progressive disclosure gold standard.** Players are never overwhelmed because they only see what they can use.
- **Each unlock is a "power moment."** The player FEELS stronger when parameterized triggers unlock — they can finally express the strategy they've been imagining.
- **Replay value through mastery layers.** A player who beat Mission 3 with minimal triggers can replay it with parameterized triggers and discover entirely new solutions.
- **Aligns perfectly with the 10-mission campaign arc.** Each layer maps to 2 missions of learning.
- **Solves the ceiling problem.** Early game is accessible; endgame has full expressiveness. No single approach achieves this alone.

**Weaknesses:**
- **Replay disruption.** If a player replays Mission 2 with full compound triggers, are they "cheating"? Does the game track "beat with Layer 1 only" vs. "beat with all layers"?
- **The gating feels arbitrary.** Why can't I use AND in Mission 4? The answer is "because we haven't taught it yet," which is pedagogically sound but can feel patronizing to experienced players who already know boolean logic.
- **Five transition moments in 10 missions** means a new UI expansion every 2 missions. That's a lot of interface instability. Players barely learn one layer before the next appears.
- **Testing burden.** Every mission must be solvable at ITS layer's trigger capability. Mission 5 must be beatable with parameterized triggers but without AND composition. This constrains mission design.
- **The "skip to layer 5" demand.** Veterans will want to skip the progression. A "start with all layers unlocked" toggle in settings solves this but undermines the teaching arc for impatient players who overestimate their readiness.

**The compromise:** Lock layers to campaign progression, but offer a "Full Access" mode in settings that unlocks everything with a warning: "Recommended for players experienced with visual programming or event-driven systems."

**Comparable:**
- **Baba Is You:** Rules start simple ("BABA IS YOU, FLAG IS WIN") and become terrifyingly complex ("NOT BABA HAS NOT KEKE IS NOT DEFEAT") through progressive introduction of negation, properties, and composition.
- **Factorio's technology tree:** Belts → splitters → circuits → combinators. Each unlock expands what you can build.
- **Slay the Spire's card pool:** Act 1 offers simple cards. Act 3 offers cards that reference deck state, discard pile, and enemy intent. The vocabulary grows with the run.

---

## Part 2: Payload Vocabularies

When a hook fires, what does the signal actually contain? This is the "object" of the hook sentence — the data that travels down the channel to all listeners.

### Payload Model 1: Implicit Payload (The Trigger IS the Message)

**The mechanic:** When a hook fires, the signal that enters the receiver's buffer is a copy of the triggering event. `ON_PERCEIVE(enemy_striker)` fires and the receiver gets `{type: enemy_spotted, target: enemy_striker, position: D4, tick: 17}` — the same observation that triggered the hook, forwarded verbatim.

**No player configuration of payload content.** The hook says WHEN to send and WHERE to send. The WHAT is automatic.

**What it feels like:** The hook slot has two fields: trigger (left) and channel (right). That's it. Click trigger icon, type channel name. The payload is invisible — an implementation detail the player never touches.

In the Inspector, the player sees what actually arrived: the full observation data. They trace backwards: "The striker received `enemy_striker at D4, tick 17` — that came from the alarm channel — that channel is fed by SCOUT-A's `ON_PERCEIVE(enemy_striker)` hook." The data tells the story.

**Strengths:**
- **Minimal cognitive load.** Two decisions per hook: when and where. Not three.
- **Data fidelity.** The observation or event data travels intact. No lossy encoding by the player.
- **Natural learning progression.** The player learns about payloads through the Inspector — they discover what signals contain by reading them in debrief, not by configuring them upfront.
- **Reinforces the "observation is data" theme.** The game's core message is that what you see IS what you know. Hooks extend this: what you broadcast IS what you saw.

**Weaknesses:**
- **No abstraction.** A scout broadcasting raw observations floods the network with detailed positional data. There's no way to say "just send the alert, not the details." The player can't compress at the hook level — they need a Relay with the compress skill to do that downstream.
- **Large payload size.** Full observation data takes buffer space. A hook that forwards every observation eats buffer capacity on every listener.
- **No player creativity in signal design.** The signal vocabulary is the game's internal data format. Players can't invent custom signal types.

**The teaching advantage:** When the player first sees hook payloads in the Inspector, they're reading the game's real data format. This IS the data engineering lesson — "here's what your webhook actually sent."

---

### Payload Model 2: Tagged Payloads (Signal Type Selection)

**The mechanic:** When configuring a hook, the player selects a **signal type** from a fixed vocabulary. The hook strips the full event data and wraps it in the selected type tag. This tag determines how the receiver's rules interpret the signal.

**The signal type vocabulary:**

| Signal Type | Meaning | Buffer Size | Color |
|------------|---------|-------------|-------|
| `ALERT` | Something urgent happened | 1 slot | Red |
| `REPORT` | Detailed observation data | 2 slots | Blue |
| `REQUEST` | Asking for help or resources | 1 slot | Yellow |
| `COMMAND` | Order from a superior agent | 1 slot | Gold |
| `STATUS` | Routine status update | 1 slot | Green |
| `INTELLIGENCE` | Hacked enemy data | 3 slots | Purple |

**What it feels like:** The hook slot now has THREE fields: trigger (left), signal type (center dropdown), channel (right). The signal type dropdown shows 6 colored tags. Picking `ALERT` turns the hook slot's border red. Picking `REPORT` turns it blue. The color coding propagates to the channel map — channels carrying ALERTs glow red, channels carrying STATUS updates glow green.

On the board during Plan phase, channel wiring lines adopt the color of their dominant signal type. A red line from SCOUT-A to RELAY-B means "this channel carries alert signals." The color map becomes the player's primary tool for reading network architecture at a glance.

**Strengths:**
- **Visual language.** Color-coded signals create instant readability on the channel map AND in the buffer bar. A buffer with 3 red slots and 2 green slots tells a story at a glance.
- **Buffer budgeting.** Signal types that cost different buffer sizes force the player to think about bandwidth allocation. A `REPORT` costs 2 slots — is the detail worth it, or should you send an `ALERT` (1 slot) and let the receiver infer?
- **Rule integration.** Rules can match on signal type: "IF buffer contains ALERT THEN move_toward" vs. "IF buffer contains STATUS THEN ignore." Signal types are the grammar that connects hooks to rules.
- **Emergent economy.** `COMMAND` signals from Command units carry authority. A rule that says "IF COMMAND received THEN override current action" creates a clear hierarchy. `REQUEST` signals create a market — units asking for resources, relays routing requests to the best provider.

**Weaknesses:**
- **Fixed vocabulary.** 6 types is limiting. What if the player wants a "warning" (less urgent than alert, more urgent than status)? What if they want custom signal types?
- **Abstraction loss.** The signal type strips the raw data down to a tag. The receiver knows "an ALERT came from SCOUT-A" but may lose positional details unless the signal type includes a position field.
- **Added decision per hook.** Three fields instead of two. Not dramatic, but every micro-decision adds up across 6 hook slots on a Command unit.

**The "email subject line" analogy:** Signal types are like choosing between "URGENT," "FYI," and "ACTION REQUIRED" in an email subject. The tag tells the receiver how to prioritize before they read the content.

---

### Payload Model 3: Structured Payloads (Field Selection)

**The mechanic:** The player constructs the hook's payload by selecting which fields of the triggering event to include. Each included field costs 1 buffer unit. The player is literally engineering the signal format.

**The field vocabulary** (available fields depend on the triggering event):

| Field | Content | Cost | Available On |
|-------|---------|------|-------------|
| `position` | Grid coordinates of the event | 1 slot | All perception events |
| `target_type` | What kind of unit was involved | 1 slot | Perception, combat events |
| `tick` | When the event occurred | 1 slot | All events |
| `direction` | Which way the target is moving | 1 slot | Perception events |
| `buffer_state` | Summary of sender's buffer fullness | 1 slot | All events |
| `signal_chain` | How many hops this signal has traveled | 1 slot | Received signals only |

**What it feels like:** The hook editor expands below the trigger selection. A horizontal strip of field chips appears — each chip is a rounded rectangle showing a field name and a "1" cost badge. The player drags desired chips into a "payload box." As chips are added, a "signal size: 3 slots" counter updates. A faint bar graph shows the signal's footprint relative to the receiver's buffer size.

The payload box renders as a tiny packet diagram — fields stacked vertically in order, like bytes in a network packet. The player is literally seeing their signal's wire format. Hovering over the assembled payload shows a preview: `{position: D4, target_type: enemy_striker, tick: 17}`.

**Strengths:**
- **The data engineering lesson at its purest.** The player decides what information to send. More fields = more bandwidth = more buffer consumption on the receiver. This IS API design. This IS schema engineering.
- **Precision control over network load.** A hook that sends only `position` uses 1 slot. A hook that sends `position + target_type + direction + tick` uses 4 slots. The player balances information richness against network capacity.
- **Emergent compression.** Instead of relying on a Relay's compress skill, the player can pre-compress at the source by selecting fewer fields. "I don't need the tick — just tell me where and what." This is choosing what to include in a log message.
- **Creates meaningful payload diversity.** Two hooks on the same trigger, same channel, but different payloads: one sends full reports, one sends slim alerts. Receivers can be configured to handle both.

**Weaknesses:**
- **High cognitive load.** Each hook is now trigger + channel + field selection. With 6 hooks on a Command agent and 3-4 fields each, that's 6 × (1 trigger + 1 channel + 4 field decisions) = 36 decisions per agent.
- **The "I forgot to include position" failure mode.** A player configures a hook to send `target_type` without `position`. The striker receives "there's an enemy striker" but not WHERE. The failure is subtle and only visible in debrief. This is realistic (real APIs have missing fields) but frustrating.
- **Field vocabulary must be small and fixed.** If new fields are added per unit type or per skill, the vocabulary explodes.
- **The "just include everything" trap.** New players will select all fields because they don't know what to omit. They'll learn through buffer overflow — which is the intended teaching moment but initially feels punitive.

**The TikTok clip:** Someone configuring a hook, agonizing over field selection, hitting execute — and in the sealed watch, their scout's signal arrives at the relay missing the one field the relay's rules need. Buffer bar fills with useless signals. The relay drowns. The player screams. Cut to debrief showing the missing field in red. They add one checkbox. Next run: perfect.

---

### Payload Model 4: Template Payloads (Message Templates)

**The mechanic:** The player writes a signal template using a simple placeholder syntax. The template defines the signal's shape, and the game fills in runtime values when the hook fires.

**Template syntax:**

```
ENEMY {target_type} AT {position} HEADING {direction}
```

This compiles into a 3-field signal: `ENEMY enemy_striker AT D4 HEADING south`. The signal is human-readable in the buffer AND in the Inspector.

**What it feels like:** The hook editor has a text input field (the template) with autocomplete. Typing `{` pops up a list of available fields. The template renders in a monospace font, with placeholders highlighted in cyan and literal text in white. Below the template, a "compiled preview" shows what the signal will look like with example data: `ENEMY enemy_striker AT D4 HEADING south`.

The template field has a character limit (30 characters) that maps to a slot cost. Short templates (≤10 chars) cost 1 slot. Medium (11-20) cost 2 slots. Long (21-30) cost 3 slots. The character counter is a small bar that fills from green to yellow to red.

**Strengths:**
- **The signal is self-documenting.** When a striker's buffer shows `ENEMY striker AT D4 HEADING south`, any player — or any spectator — can read it. No decoding, no Inspector required.
- **Creative expression.** Players can name their signals. `ALARM: {target_type} @ {position}` vs. `spotted a {target_type} going {direction}` — same data, different personality. Community sharing of clever templates.
- **The programming lesson:** Templates with placeholders are literally string interpolation. `f"ENEMY {target_type} AT {position}"` in Python. The player is learning templated output.

**Weaknesses:**
- **Text input in a visual game.** Everything else in the workbench is click/drag/select. A text field breaks the interaction paradigm.
- **Typos.** If the player types `{positon}` instead of `{position}`, the signal sends the literal string `{positon}`. Silent failure. Autocomplete mitigates but doesn't eliminate.
- **Parsing cost.** Receivers need rules that can match against template outputs. "IF buffer contains signal matching `ENEMY * AT *`" is a pattern-matching rule — this pushes complexity into the rules system.
- **Buffer display.** A buffer showing 6 different human-readable sentences is harder to scan than 6 color-coded type tags.

**The niche:** This model shines in a streaming/community context. Shareable, readable, expressive. But it conflicts with the workbench's visual-first design principle.

---

### Payload Model 5: Layered Payloads (Auto + Override)

**Philosophy:** By default, hooks send implicit payloads (Model 1) — the raw event data. The player can optionally OVERRIDE specific fields, strip fields, or add metadata. This is the progressive-disclosure approach to payloads.

**The three payload layers:**

| Layer | Behavior | Player Effort | Unlocked |
|-------|----------|---------------|----------|
| **Auto** | Full event data forwarded verbatim | Zero | Default |
| **Stripped** | Player deselects fields to omit | Light (checkbox unchecking) | Mission 3+ |
| **Annotated** | Player adds a signal type tag and/or custom field | Medium (tag + optional field) | Mission 5+ |

**What it feels like:** Mission 1: the hook slot shows trigger and channel. Nothing else. The payload is "whatever the trigger saw." In Mission 3, a small "..." button appears next to the channel name. Clicking it expands a "Payload Options" drawer showing checkboxes for each field the trigger would include, all checked by default. Uncheck "tick" to strip timing data. In Mission 5, the drawer adds a "Signal Tag" dropdown (ALERT/REPORT/REQUEST/COMMAND/STATUS) and a "Custom Note" field (5 characters max, optional).

The drawer collapses back to "..." when dismissed. Advanced players keep it open; beginners ignore it. The hook slot's visual changes subtly: a stripped payload shows a small scissors icon. A tagged payload shows a colored dot matching the signal type. An annotated payload shows both.

**Strengths:**
- **Zero-config start.** Beginners never touch payloads. They work.
- **Progressive precision.** As players encounter buffer overflow, they discover the payload drawer and start stripping unnecessary fields.
- **The "aha" moment when stripping fields fixes a buffer overflow** is the single best teaching moment for data engineering in the entire game.
- **Compatible with tagged payloads' color system** at the annotation layer — channels show colored dots once players start tagging.

**Weaknesses:**
- **Hidden complexity.** The "..." button is discoverable but not obvious. Some players will never find it and blame the game for buffer overflow.
- **Three layers of configuration per hook** when fully utilized. Trigger + channel + field checkboxes + tag + custom note = a lot of state per hook slot.
- **The custom note field is scope creep.** If 5 characters, it's useless. If more, it becomes Model 4's template system through the back door.

**Recommendation signal:** This is the strongest candidate for the first playable. It respects the locked design's "channels emerge from hooks" simplicity while providing the depth for mastery play. The progressive unlocking aligns with the 10-mission arc.

---

## Part 3: Interaction Effects

### Triggers × Payloads Matrix

| | Implicit (M1) | Tagged (M2) | Structured (M3) | Template (M4) | Layered (M5) |
|---|---|---|---|---|---|
| **Minimal (A)** | Simplest possible. Tutorial-only. | Simple + readable. Solid beginner experience. | Overbuilt — 5 triggers with field selection is overkill. | Mismatched — text templates for 5 triggers? | Clean progressive ramp but ceiling hits fast. |
| **Typed (B)** | Good balance. Trigger specificity compensates for payload simplicity. | Strong. 12 triggers × 6 types = 72 distinct hook configurations per unit. | Sweet spot for mid-game. | Text input unnecessary when triggers already carry meaning. | **Best overall combination.** 12 triggers × layered payloads = accessible start, deep endgame. |
| **Parameterized (C)** | Works but wastes parameterization — why filter triggers precisely if the payload is raw? | Rich. Parameter filtering + type tagging = very precise signal routing. | **Maximum expressiveness.** Expert players' dream. Dangerous complexity for beginners. | Double text input (params + templates) = no. | Strong if progressive disclosure is aggressive about hiding params until needed. |
| **Compound (D)** | Compound triggers + raw payloads = contradictory. Complex conditions, then dumb data? | Powerful but cognitively expensive. Boolean triggers + type selection + channel = 3+ decisions per hook. | **Pure engineering mode.** Boolean triggers + field selection = this is an IDE. | Kill it with fire. | Viable only if compound triggers are a late-game unlock (Layer 5). |
| **Hybrid (E)** | The default path. Each mission adds one layer. | Hybrid triggers + tagged payloads is the "designed" experience. | Each layer unlocks both trigger complexity and payload complexity in parallel. | No. | **E triggers × M5 payloads = the fully progressive system.** Both halves grow together. |

### The Recommended Combination: E × M5 (Hybrid Progressive Triggers × Layered Payloads)

Both systems progressively disclose complexity. The trigger system adds event types, then parameters, then composition. The payload system adds field stripping, then tagging, then annotation. They grow in parallel, each new capability arriving when the campaign introduces the mission that needs it.

---

## Part 4: The EM Emission Dimension

Every hook firing generates EM noise (locked spec). The trigger vocabulary directly affects the emission model:

- **Narrow triggers** (parameterized, compound) fire less often → less EM noise → stealthier architectures
- **Broad triggers** (minimal, unparameterized) fire constantly → high EM noise → louder networks
- **Rich payloads** generate more EM per transmission than stripped payloads

This creates a stealth-vs-intelligence tradeoff: precise hooks that fire rarely are quiet but may miss events. Broad hooks that fire constantly are noisy but comprehensive. The player is tuning their signal-to-noise ratio — literally.

A player who understands this builds a "dark" network: narrow triggers, stripped payloads, minimal transmissions. The scout sees everything but only broadcasts when it spots a striker (not scouts, not status). The relay compresses before forwarding (reducing per-hop emissions). The command unit uses `ON_SILENCE` to detect problems by absence rather than by active polling.

The "dark network" is the advanced strategy that emerges from understanding hook taxonomy. It's also the player's first real taste of information security — "my network is smart AND quiet."

---

## Part 5: Player Journeys

### Journey: Kai, 25, Full-Stack Developer, First Strategy Game

**Context:** Mission 2 (First Contact). Four pre-placed units: two scouts, one relay, one striker. Kai has configured context and rules in Mission 1. This is his first time seeing hooks.

**Minute 0:00 — The Empty Hook Slots**
Kai clicks SCOUT-A in the workbench. The blueprint editor shows skills (patrol, evade), rules (the dispatch table from Mission 1), and a new section at the bottom: HOOKS. Two empty slots, each showing a dashed outline with a "+" icon. A boot log line appears at the top: `[HOOK SUBSYSTEM] Inter-agent communication channels initialized. 2 slots available on SCOUT-A.`

He hovers over the first slot. A tooltip: "Configure a hook to broadcast signals to other agents. When a trigger event occurs, this agent will send a signal on the named channel."

**Minute 0:30 — First Hook Configuration**
He clicks the "+". The trigger picker appears — five icons in a row (minimal Layer 1): 👁 Observe, ☠ Threat, 📥 Receive, ⚔ Eliminate, ⚙ Skill. He picks 👁 Observe. The icon snaps into the trigger slot with a soft click sound.

Next to it, a text field appears with placeholder text: "channel name..." He types "scout_feed". As he types, the channel map panel on the lower left updates — a new entry appears: `#scout_feed` with a tiny antenna icon. A faint cyan line appears on the board from SCOUT-A toward... nothing yet. The line trails off into empty space, looking for listeners.

He hasn't configured a payload — it's implicit (Layer 1). The hook reads: `ON_OBSERVE → #scout_feed`. Done. Two decisions. Ten seconds.

**Minute 1:00 — Wiring the Relay**
Kai clicks RELAY-B. In its context config section, he sees a "Listen" panel with a list of known channels. `#scout_feed` appears — the channel he just created. He toggles it ON. The board updates: the trailing cyan line from SCOUT-A now connects to RELAY-B with a satisfying snap. A thin blue line on the board, arcing gently between the two units.

He configures RELAY-B's second hook slot: `ON_RECEIVE → #relay_out`. He switches to STRIKER-C and turns on listening for `#relay_out`. The board now shows a two-hop chain: SCOUT-A →(scout_feed)→ RELAY-B →(relay_out)→ STRIKER-C. Three units, two channels, a complete information pipeline. Kai grins. "It's like plumbing."

**Minute 2:00 — The EXECUTE Moment**
He hits EXECUTE. Sealed Watch begins. Tick 1: SCOUT-A moves along its patrol. Tick 3: SCOUT-A enters perception range of an enemy. A yellow ping appears on the scout. The scout's buffer bar gains a bright entry. One tick later, a green cell flash on RELAY-B — the signal arrived. One tick after that, another green flash on STRIKER-C. The information cascade is VISIBLE: ping → flash → flash. Three ticks, three visual events, a complete pipeline.

Tick 7: STRIKER-C is now moving toward the enemy position. Tick 9: adjacency. Red flash. Enemy eliminated. Kai pumps his fist.

**Minute 3:00 — The Failure**
But then SCOUT-A spots a SECOND enemy. Same pipeline fires. But the relay's buffer is full from the first cycle's residual signals. The second observation arrives at RELAY-B and — no flash. No forwarding. STRIKER-C doesn't move. The second enemy reaches the base.

Mission fails. "RUNS: 5, PASSED: 2."

**Minute 4:00 — Inspector Debrief**
In the Inspector, Kai clicks RELAY-B at tick 6. The buffer display shows 12 slots, all full. Slot 11 is the first scout report. Slot 12 is the relay's own forwarding confirmation. The SECOND scout report at tick 8 shows as a red dash below the buffer — "DROPPED: buffer full." The signal existed but had nowhere to land.

Kai understands immediately. "I need to either expand the buffer, add the filter skill, or strip the payload." He doesn't know about payload stripping yet (Mission 3 unlock), so he adjusts RELAY-B's eviction priority to drop oldest-first. Next run: 4/5 passed.

---

### Journey: Amara, 38, Project Manager, Casual Mobile Gamer

**Context:** Mission 5 (first factory mission). Amara has been enjoying the game but finds the workbench "fiddly." She's now encountering parameterized triggers (Layer 3, just unlocked) for the first time.

**Minute 0:00 — The Expanded Hook Editor**
Amara clicks her newly-built RELAY-C. The hooks section shows 4 slots. She's used to the typed triggers from Missions 3-4 — 12 icons she's grown comfortable with. But now a small "..." button has appeared next to each trigger icon. A boot log line: `[HOOK SUBSYSTEM] Trigger parameters initialized. Precision filtering available.`

She ignores the "..." and configures the first hook the old way: `ON_RECEIVE_SIGNAL → #relay_out`. Works. She hits EXECUTE. The sealed watch plays. Her relay forwards EVERYTHING — scout reports, status updates, alarm signals. Her striker's buffer overflows. Mission fails.

**Minute 5:00 — Discovering Parameters**
In the debrief, she sees the striker's buffer: 8 slots, 6 filled with STATUS signals from the relay's constant forwarding. Only 2 contain actual ALERT data. "The relay is sending too much junk."

She goes back to the Plan screen. Clicks the "..." next to the `ON_RECEIVE_SIGNAL` trigger on RELAY-C. A drawer slides out. Three parameter slots: `channel_name: [any ▼]`, `signal_age: [any ▼]`, `priority: [any ▼]`.

She changes `channel_name` from "any" to "scout_feed" — now the relay only forwards signals received on that specific channel. The trigger updates: `ON_RECEIVE_SIGNAL(scout_feed) → #relay_out`. The channel map highlights the specific wiring in brighter cyan.

**Minute 7:00 — The Refinement Cycle**
She runs again. Better — the striker only gets scout observations now, not status noise. But scout reports still include low-value data (distant enemies, allies passing through). She opens the "..." again. Changes `signal_age` to "fresh" — only forward signals from the current or previous tick. Stale observations get filtered at the trigger level.

The hook now reads: `ON_RECEIVE_SIGNAL(scout_feed, fresh) → #relay_out`. Each parameter has narrowed the funnel. Her striker's buffer now has room for real intelligence.

Mission passed. 4/5 runs succeed.

**Minute 10:00 — The "Aha"**
Amara stares at the hook configuration. "Wait — this is just an email filter. I'm making rules for which emails get forwarded and which get ignored." She laughs. She's been doing this in Outlook for years. The parameterized trigger system maps exactly to her professional inbox management. She starts thinking of her scouts as "field reporters" and her relay as "the project coordinator who decides what gets escalated."

She opens the second hook slot on the relay and types: `ON_SILENCE("scout_feed", 3) → #alarm`. "If the scouts stop reporting for 3 ticks, sound the alarm." She doesn't need the game to teach her this — she invented it from the metaphor.

---

### Journey: Yuto, 16, Competitive Overwatch Player, Loves Theorycrafting

**Context:** Mission 9 (late campaign). All trigger layers unlocked. Yuto has been speedrunning missions, replaying each 5+ times to optimize. He's building a "dark network" — minimal emissions, maximum intelligence.

**Minute 0:00 — The Compound Trigger Build**
Yuto is configuring COMMAND-A, the meta-agent with 6 hook slots and 14 buffer slots. He's already beaten Mission 9 once (barely). Now he's optimizing.

Hook slot 1: `ON_SIGNAL("intel") AND ON_BUFFER(not_full) → #orders`. The compound trigger means the command unit only processes intelligence reports WHEN it has room to think. If its buffer is full of pending orders, incoming intel gets ignored — deliberate triage.

Hook slot 2: `ON_SILENCE("scout_feed", 2) AND NOT ON_SIGNAL("stand_down") → #emergency`. The command reacts to scout silence (something killed or jammed the scouts) UNLESS it's already issued a stand-down order. The NOT prevents self-triggering loops.

Hook slot 3: `ON_TICK(5) → #status_check`. Every 5 ticks, the command pings all units for status updates. Periodic heartbeat. But he's configured this hook with a stripped payload (Layer 2) — only sending `{tick}`, not any buffer contents. Minimal EM emission for the heartbeat.

**Minute 3:00 — The Stealth Architecture**
Yuto reviews the channel map. He counts emission sources: SCOUT-A fires `ON_PERCEIVE(enemy_striker)` — narrow trigger, fires only on striker sightings, not scouts or terrain. SCOUT-B fires `ON_THREAT_EXIT` — only when enemies LEAVE its radius, meaning the area is clear (not when they enter, which is noisier). The relays use `ON_RECEIVE_SIGNAL("intel", fresh, high)` — processing only fresh, high-priority signals.

Total hooks across his army: 14. But with narrow triggers and parameterized conditions, most fire 1-3 times per mission. His EM footprint is tiny. The enemy's detection system barely registers his network.

Compare to his first Mission 9 attempt: 14 hooks, all with `ON_PERCEIVE()` (no params), firing every tick every unit sees anything. EM footprint was massive. The enemy striker squad homed in on his relay cluster and destroyed it by tick 15.

**Minute 5:00 — The Sealed Watch**
EXECUTE. The sealed watch plays. It's eerily quiet. Unlike his first attempt (constant green flashes from hyperactive hooks), this run shows sparse, deliberate communication. A single green flash when SCOUT-A spots the striker cluster. A two-tick delay (signal traveling through the dark relay). Then COMMAND-A issues one golden flash — a COMMAND signal to the striker wing. The strikers converge from two directions. Synchronized red flashes. Three enemies eliminated in one tick.

Silence again for 10 ticks. Then COMMAND-A's heartbeat fires (a faint green pulse). Status reports trickle in — stripped to just buffer fullness indicators. The command processes them and issues a single reroute order.

It looks like a special operations team. Minimal communication, maximum effect. Yuto screenshots the sealed watch and posts it to Discord: "dark net run, 32 ticks, zero detection."

**Minute 8:00 — Inspector: The EM Overlay**
In the Inspector, Yuto activates the emission overlay. His side of the board shows faint, occasional emission ripples — like gentle waves. The enemy side shows constant, overlapping emission rings from their broad-trigger architecture. The visual contrast is stunning: his dark network vs. their loud one. The emission overlay IS the screenshot he'll use for his guide.

---

## Part 6: New Aspects Discovered

During this analysis, several unexplored sub-aspects emerged:

1. **3.08a — Trigger-to-rule vocabulary alignment:** Triggers and rules use similar condition primitives (buffer state, perception events). Should the vocabulary be IDENTICAL (rules and triggers use the same condition chips) or DISTINCT (triggers are simpler, rules are richer)? Shared vocabulary reduces learning cost. Distinct vocabulary lets each system evolve independently.

2. **3.08b — Channel naming conventions as emergent culture:** Players naming channels "alarm," "intel," "orders" creates an implicit protocol language. Should the game suggest names? Should there be a "standard channel library"? How do naming conventions develop in competitive/community contexts?

3. **3.08c — Hook slot economy as strategic constraint:** With fixed hook slots per unit (2-6), choosing WHICH hooks to install is itself a strategic decision. What happens when a player needs 3 hooks on a Scout but only has 2 slots? Slot scarcity as design pressure.

4. **3.08d — Trigger evaluation order within a single tick:** If a unit has 2 hooks and both triggers match in the same tick, do both fire? In what order? Can one hook's firing affect another hook's trigger condition? Simultaneous vs. sequential evaluation per tick.

5. **3.08e — Hook inheritance and blueprint templates:** When a player designs a blueprint, can hooks be templated? "All scouts use this hook loadout" as a blueprint-level feature. How hook templates interact with channel naming (do cloned scouts use the same channel or instance-specific channels?).

---

## Part 7: Comparable Games Synthesis

| Game | Event System | What Robot Uprising Can Learn |
|------|-------------|------------------------------|
| **Gladiabots** | Behavior tree conditions as implicit triggers — "if I see enemy and health > 50%" | The condition vocabulary IS the trigger vocabulary. Don't separate them. |
| **Factorio** | Circuit network signals — binary on/off or integer values, combinators for logic | Named signals (iron, copper, each, everything) are the channel naming pattern. |
| **Screeps** | JavaScript event handlers — `creep.on('attack', fn)` | Explicit event registration is the hook pattern in code form. |
| **IFTTT/Zapier** | Trigger + filter + action as the universal automation atom | The trigger-with-parameters model (Approach C) maps 1:1 to IFTTT's UI. |
| **Shenzhen I/O** | `+/- prefix` as conditional execution modifier on assembly lines | Minimal parameterization (one bit: +/-) that radically changes behavior. |
| **Into the Breach** | Enemy intent display — fixed vocabulary of threat icons (attack, push, web) | Fixed signal type vocabulary (Payload Model 2) is the same readable-at-glance pattern. |
| **Dwarf Fortress** | Work orders with conditions — "brew drinks IF ale < 10" | Condition-gated triggers with inventory thresholds. The `ON_BUFFER(state)` trigger. |

---

## Summary

The hook taxonomy design space has two independent axes (trigger vocabulary × payload model) with 5 approaches on each axis. The **Hybrid Progressive triggers (E) × Layered Payloads (M5)** combination emerges as the strongest candidate for the first playable because it respects the game's dual audience (accessible start, deep endgame) while teaching real event-driven architecture concepts progressively.

The key insight: **hooks are the game's API design layer.** Skills are what agents do. Rules are what agents decide. But hooks are how agents COMMUNICATE — and the design of that communication protocol is the player's primary creative expression. The hook taxonomy determines whether the game teaches "events have types" (minimal) or "event-driven systems are an engineering discipline" (compound + structured).

The EM emission model adds a crucial wrinkle: every hook configuration choice has a stealth consequence. This transforms hook design from "what do I want to communicate?" to "what can I AFFORD to communicate?" — the bandwidth-versus-intelligence tradeoff at the heart of any communication system design.

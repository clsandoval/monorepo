# Onboarding: The Vocabulary Pacing Bottleneck

**Aspect ID:** 5.00a
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00 (external-documentation anti-pattern), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 5.04 (complexity ramp), 5.04b (vocabulary density curve), 1.01 (Shenzhen I/O), 1.04 (EXAPUNKS), 1.09 (Into the Breach)

---

## The Problem

Robot Uprising has **~30 game-specific terms** that must become meaningful to the player across **10 missions**. That's an average of **3 terms per mission**. But averages lie — the locked vocabulary curriculum (from 5.00) distributes terms unevenly:

| Mission | Terms Introduced | Term Count | Cumulative |
|---------|-----------------|-----------|-----------|
| M1: Wake | buffer, slot, observation, noise | 4 | 4 |
| M2: Focus | buffer size, confidence, staleness, eviction | 4 | 8 |
| M3: Relay | hook, channel, signal, latency | 4 | 12 |
| M4: Chorus | rule, condition, action, priority, perception radius, skill | 6 | 18 |
| M5: Factory | blueprint, production queue, cost, tagging, listen/ignore filter | 5 | 23 |
| M6-7: Command | command agent, reassign, reroute, prioritize, EM emission | 5 | 28 |
| M8-10: Full System | compress, filter, amplify | 3 | 31 |

**The bottleneck is Mission 4.** Six new terms in a single mission — double the density of Missions 1-3. And these aren't simple terms: rules, conditions, actions, and priority form an interlocking system where understanding any one depends on understanding the others. The player must simultaneously grasp:
- What a rule IS (a condition→action pair)
- What conditions look like (IF buffer contains X)
- What actions look like (THEN do Y)
- Why order matters (priority determines which rule fires first)
- Where sensing happens (perception radius)
- What options exist (skills)

This is the **cognitive load cliff** — the mission where the "hands before head" principle faces its hardest test. Can six concepts really be experienced before they're named? Or does Mission 4 become the wall that splits the player base into "got it" and "gave up"?

**Mission 5 is the second bottleneck.** Five terms, but with an even harder structural challenge: the game shifts from "configure pre-placed units" to "design blueprints and manage production." The player must learn a new *mode of play* AND five new terms simultaneously. This is the **mode-shift penalty** — the cognitive cost of changing what kind of game you're playing while also learning new vocabulary within it.

---

## Cognitive Load Theory Applied

Working memory holds **4±1 chunks** simultaneously (Cowan, 2001, refining Miller's classic 7±2). A "chunk" is a meaningful unit of information — but for a new player, each game term is a separate chunk. A veteran who understands "condition→action pair" treats it as one chunk; a beginner needs three slots (condition, action, and the relationship between them).

### The Three Types of Cognitive Load in Game Tutorials

1. **Intrinsic load**: The inherent complexity of the material. Six interlocking rule system concepts have high intrinsic load — they can't be simplified without changing the game.

2. **Extraneous load**: Friction from bad presentation. Alt-tabbing to a PDF, deciphering tiny tooltip text, parsing ambiguous icons — all extraneous load that can be reduced through design.

3. **Germane load**: The productive effort of building mental models. This is the load we WANT — the player constructing their understanding of how rules work by experimenting and observing consequences.

**The design goal:** Minimize extraneous load (the "hands before head" principle already does this), manage intrinsic load (through sequencing and chunking), and maximize germane load (through meaningful experimentation with visible feedback).

### The 2-Term Comfort Zone

Research on progressive disclosure in games (Petko, Schmid & Cantieni, 2020) and educational game design using cognitive load theory suggests that the optimal pace for introducing new concepts is **1-2 genuinely new ideas per learning unit**, with additional "extension" concepts (variations on already-learned ideas) tolerated at higher density.

Missions 1-3 sit at 4 terms each, but those terms are related — buffer/slot/observation/noise form a coherent cluster about "what's in the box." The player learns ONE concept (the buffer exists and has contents) through four lenses. That's 1 concept, 4 labels. Manageable.

Mission 4 introduces **3 genuinely new concepts**: the rule system (condition→action), the sensing system (perception), and the skill system. Each is a different kind of thing. Rules are behavioral logic. Perception is spatial. Skills are capabilities. The player must switch between three different mental models in a single session.

---

## Five Design Options for Pacing the Bottleneck

### Option A: "The Split" — Break Mission 4 Into Two Missions

Split Mission 4 (Chorus) into:
- **Mission 4a: Reflex** — Introduces rules (condition, action, priority) only. The player configures IF→THEN behavior on a single pre-placed unit and watches it respond to stimuli. No multi-agent coordination yet.
- **Mission 4b: Chorus** — Introduces perception radius and skills. The player now has units that sense their environment and choose between actions. The rule system from 4a provides the decision framework.

**Term pacing becomes:** M1(4), M2(4), M3(4), M4a(3), M4b(3), M5(5), M6-7(5), M8-10(3). Total: 11 missions instead of 10.

**Strengths:**
- Respects the 2-term comfort zone for genuinely new concepts
- Rules get a full mission of dedicated practice before being combined with sensing
- The player masters IF→THEN logic in isolation, then adds spatial awareness
- Matches Into the Breach's design philosophy: "small numbers, make the mechanics known"

**Weaknesses:**
- Adds a mission to the locked 10-mission arc (breaks locked spec unless an existing mission is merged elsewhere)
- Risk of Mission 4a feeling too simple — a single unit following IF→THEN rules may lack dramatic tension
- Delays the "aha moment" of multi-agent coordination by one mission

**Sensory description:** Mission 4a opens with a lone striker on the board, highlighted by a pale spotlight against a darkened grid. The boot log reads: "RULE ENGINE INITIALIZING. One agent. One decision framework. Teach it to think." The right panel shows a blank rule list — a column of empty slots, each slot a pair of dropdown menus connected by a subtle arrow glyph (→). The player drags a condition from a tray ("enemy in adjacent tile") into the left slot. The arrow glows amber. They drag an action ("engage") into the right slot. The arrow turns green, and on the board, the striker's outline pulses once — alive, responsive, loaded with intent. The player hits EXECUTE. The tick clock advances. An enemy approaches. The striker's rule fires — the condition slot flashes white, the arrow blazes, the action slot flashes, and the striker lunges. One kill. The player grins. They add a second rule: "no enemy nearby → patrol north." Two rules, an ordering handle appears between them — a small grip icon. Drag to reorder. Now the patrol rule is on top. EXECUTE again. This time the striker walks past an enemy because patrol was checked first. The player swaps the order. EXECUTE. The striker engages first, then patrols. Priority becomes visceral — it's not an abstract concept, it's the order of the list, and the order determines who lives.

#### Journey: Mia, 28, UX Designer (First Strategy Game)

**Context:** Completed Missions 1-3. Comfortable with buffers and hooks. Has never written a conditional statement in her life.

**Minute 0:00 — The Blank Slate**
The Plan screen loads with a single striker unit on an 8x8 board. The left panel shows the unit's buffer (she recognizes this — 8 slots, two observations already loaded: "ENEMY_POSITION: D4" and "TERRAIN: open_ground"). The right panel is new — a vertical column labeled with a dimmed, barely-visible header. Below: two empty rectangular slots side by side, connected by a faint arrow.

Mia hovers over the left slot. A soft two-note tone. A whisper: "Condition — what the agent checks." She hovers over the right slot. Same tone. "Action — what the agent does."

She thinks: *Oh. It's like "if this, then that."* She's used IFTTT before. For her smart lights.

**Minute 0:45 — First Rule**
She clicks the left slot. A dropdown appears: conditions drawn from what's currently in the unit's buffer. "ENEMY in adjacent tile" is highlighted with a subtle pulse — a gentle suggestion. She selects it. The left slot fills with a compact card: a red diamond icon (enemy) and an adjacency symbol (two squares touching).

She clicks the right slot. Actions appear: "engage," "evade," "hold." She picks "engage." The right slot fills. The arrow between them turns green. On the board, the striker's tile edge glows faintly — armed.

A boot log line prints: `RULE 1 loaded. Condition: ENEMY_ADJACENT. Action: ENGAGE.`

**Minute 1:30 — First Execution**
She presses EXECUTE. The sealed watch begins. Tick 1: nothing moves yet. Tick 2: an enemy slides into D5, adjacent to the striker at D4. The striker's condition slot flashes white — *checking* — the arrow blazes — *matched* — the action slot flashes — *firing*. The striker snaps to D5. Combat flash. Enemy eliminated. Cell flashes red.

Mia exhales. "That WORKED."

**Minute 2:15 — The Priority Lesson**
Back in Plan. She adds a second rule: "no enemy nearby → patrol north." Now two rules stack vertically. A small grip handle appears between them — three horizontal lines, draggable. She notices the order: Rule 1 (patrol) is on top, Rule 2 (engage) below.

EXECUTE. Tick 2: the enemy approaches. But the striker... walks north. Past the enemy. The patrol rule fired first. The condition "no enemy nearby" was true when checked (the enemy wasn't adjacent YET when the rule fired at tick start). The enemy is now behind the striker.

"Wait, what? Why didn't it fight?"

She inspects. The debrief shows: "Rule 1 (patrol north) — condition TRUE at tick 2. Rule 2 (engage) — not evaluated (Rule 1 already acted)."

*Oh. It only does the FIRST rule that matches. The order matters.*

**Minute 3:00 — The Swap**
She drags Rule 2 (engage) above Rule 1 (patrol). The grip handle clicks into place with a satisfying snap sound. EXECUTE. This time, tick 2: the enemy approaches. Engage rule is checked first. "Enemy adjacent? Yes." The striker lunges. Kill. Then tick 3: "No enemy nearby? Yes." The striker patrols north.

"OHHH. It's like... the priority list on my to-do app. The important stuff goes on top."

**Minute 4:30 — Resolution**
The boot log prints: `RULE ENGINE ONLINE. You taught an agent to think. Priority determines which thought comes first.` Three new glossary entries materialize: Rule, Condition, Action. Priority appears with its own entry, linking back to the moment she swapped the two rules. The glossary clip shows her own drag-and-drop, captured in a 2-second loop.

**UI Annotations:**
- Condition slot: left half of a horizontally-split rectangle, pale blue background, icon-based condition display
- Action slot: right half, pale green background, text + icon action display
- Arrow glyph: connecting → between condition and action, color-coded (grey=empty, amber=half-filled, green=complete)
- Priority grip: three horizontal lines between rules, grabbable, snap-into-place animation with tactile click sound
- Rule flash sequence during execution: condition flash (white) → arrow blaze (gold) → action flash (the action's color)

#### Journey: Dev, 34, Software Engineer (Factorio Veteran)

**Context:** Blazed through Missions 1-3 in under 15 minutes. Already thinking about rule composition. Impatient for depth.

**Minute 0:00 — Immediate Recognition**
Dev sees the rule editor and immediately recognizes it: "It's a priority queue of predicates." He starts typing conditions before the tutorial hints activate. He writes three rules in 30 seconds:
1. Enemy adjacent → engage
2. Enemy in perception → move toward
3. Default → patrol east

He hits EXECUTE before the boot log finishes its animation. The striker performs flawlessly — engages when close, chases when sensing, patrols otherwise.

**Minute 0:40 — Edge Case Hunting**
Dev wonders: what if two conditions are true simultaneously? He places two enemies — one adjacent, one at range 2. EXECUTE. The engage rule fires (it's first). Second enemy approaches during tick 3. Engage fires again. Good — the engine re-evaluates every tick.

He tries a degenerate case: conflicting rules. Rule 1: enemy adjacent → evade. Rule 2: enemy adjacent → engage. Only Rule 1 fires. "First match wins. Classic."

**Minute 1:30 — Speed Frustration**
"Okay, I get rules. Can I have the rest now?" The mission has one more puzzle variant — a scenario requiring three rules with specific ordering to survive a two-enemy pincer. Dev solves it in 20 seconds.

The expert fast-track system (5.01e) detects: 100% efficiency, sub-15s solve time, no hint usage. A subtle prompt appears: "FAST-TRACK AVAILABLE: Skip to Mission 4b?" Dev accepts.

**Minute 2:00 — Resolution**
Boot log abbreviates: `RULE ENGINE: ONLINE. [Details available in glossary.]` The glossary populates with full mechanical reference — Dev opens it, reads the exact evaluation semantics (per-tick, first-match-wins, top-to-bottom), nods, closes. Eight seconds.

**UI Annotations:**
- Fast-track prompt: thin amber bar at bottom of screen, "Skip to next mission →" with keyboard shortcut shown
- Abbreviated boot log: text prints faster, technical details collapsed behind [+] expand affordance

#### Journey: Tomás, 14, High School Student (Plays Fortnite, First Puzzle Game)

**Context:** Chose Robot Uprising because a TikTok showed a chain reaction clip. Has never seen a condition→action pair in any context. Does not know what "conditional logic" means.

**Minute 0:00 — Confusion**
Tomás sees the empty rule editor and has no idea what to do. He taps random things. The slots don't respond to tapping without selecting — he doesn't realize the left slot is a dropdown. He stares at the screen for 15 seconds.

**Minute 0:15 — The Nudge System Activates**
After 12 seconds of no meaningful input, the game's adaptive hint system fires. The left condition slot pulses with a soft glow. A tiny arrow appears pointing at it. The ghost mentor whisper (5.03d): "Try clicking this slot. It's where you tell the agent what to look for."

Tomás clicks it. The dropdown opens. He sees icons — not text-heavy descriptions, but visual cards. A red diamond (enemy) next to a touching-squares icon (adjacent). A blue eye (perception range) next to a cone icon. He picks the red diamond one because it looks like danger.

**Minute 0:40 — Building the First Rule**
The condition fills. The arrow glows amber. The action slot pulses next. He clicks it. Three options appear: a sword icon (engage), a shield icon (evade), a compass icon (patrol). He picks the sword because he wants to fight.

The arrow turns green. On the board, the striker glows. He doesn't fully understand what he just did, but something happened.

**Minute 1:00 — First Execution**
EXECUTE. The sealed watch runs. An enemy approaches. The striker's rule fires — the flash sequence plays. The striker lunges. Kill. Red flash.

"YOOO!" Tomás fist-pumps. He doesn't know the words "condition" or "action" yet. But he knows: "I told it to fight when enemies are close, and it DID."

**Minute 1:30 — The Priority Trap (Designed Failure)**
The mission advances. Two rule slots now, pre-filled: patrol on top, engage on bottom. EXECUTE. The striker walks past the enemy. Tomás is confused and annoyed.

"Why didn't it fight?! I TOLD it to fight!"

The debrief plays back in slow motion. The patrol rule flashes first — green. The engage rule shows a greyed-out "SKIPPED" label. A boot log line: "Rule 1 fired. Rule 2 was never checked. Try changing the order?"

Tomás drags engage above patrol. The snap sound is satisfying. He does it twice more just to hear it again.

**Minute 2:30 — Second Attempt**
EXECUTE. The striker engages the enemy. Then patrols. Everything works. "OH. It's like... the TOP one goes first. Like a checklist." He reorganizes again experimentally, watches different outcomes. Each attempt takes 15-20 seconds. He runs five executions in three minutes, each with a different ordering.

**Minute 5:30 — Resolution**
The boot log names the concepts. Tomás reads "RULE ENGINE ONLINE" and half the boot log text, then skips ahead to the next mission. He doesn't open the glossary. He doesn't need to — the ordering mechanic is now muscle memory. He'll learn the word "priority" when he needs it for conversation with other players, not from the game's text.

**UI Annotations:**
- Icon-first condition display: visual symbols with text labels below (text secondary, icons primary)
- Adaptive hint: 12-second idle trigger, soft pulse on interactive element, whisper audio at 40% volume
- Designed failure: pre-loaded wrong ordering, deliberate "SKIPPED" annotation in debrief
- Snap sound on reorder: tactile audio feedback calibrated to be satisfying enough that players reorder experimentally

---

### Option B: "The Cluster" — Group Terms by Concept, Not by Mission

Instead of distributing terms linearly across missions, group them into **conceptual clusters** that are taught as unified ideas:

| Cluster | Terms | Teaching Unity |
|---------|-------|---------------|
| **Memory** (M1-M2) | buffer, slot, observation, noise, buffer size, confidence, staleness, eviction | "What your agent knows and forgets" |
| **Communication** (M3) | hook, channel, signal, latency | "How agents talk to each other" |
| **Behavior** (M4) | rule, condition, action, priority, skill | "What your agent decides to do" |
| **Sensing** (M4 or M5) | perception radius, listen/ignore filter | "What your agent pays attention to" |
| **Production** (M5) | blueprint, production queue, cost, tagging | "How you build your army" |
| **Meta** (M6-7) | command agent, reassign, reroute, prioritize | "Agents that manage agents" |
| **Processing** (M8-10) | compress, filter, amplify, EM emission | "How signals transform in transit" |

The key insight: **perception radius** doesn't belong with rules. It belongs with listen/ignore filters — both are about "what the agent pays attention to." Moving perception out of Mission 4 and into a "Sensing" cluster (taught in Mission 5's first half, before production) reduces Mission 4 from 6 terms to 4.

**Revised pacing:** M1(4), M2(4), M3(4), M4(4), M5a-sensing(2), M5b-production(4), M6-7(5), M8-10(4). No mission exceeds 5 terms. The heaviest cluster (Memory, 8 terms) is split across two missions but teaches one unified concept.

**Strengths:**
- Conceptual clustering aids chunking — "all the attention stuff" becomes one mental model with two controls
- Doesn't require adding missions (respects locked 10-mission arc if sensing is a first-half beat of Mission 5)
- Perception and filtering are genuinely related — both answer "what reaches the buffer"

**Weaknesses:**
- Moving perception out of Mission 4 means the player doesn't see scouts sense enemies until Mission 5, which might feel late
- Mission 5 becomes even more loaded (sensing + production = new concept AND mode shift)
- The current mission naming ("Chorus" implies multi-agent which implies sensing) would need rethinking

**Sensory description:** In the "Sensing" cluster segment, the board dims except for a single scout's perception cone — a translucent wedge of cyan light sweeping from the unit like a flashlight beam in fog. The cone has crisp edges where it hits walls and soft gradient falloff at its maximum range. As the player adjusts the listen/ignore filter in the workbench, channel names that the scout is "ignoring" appear as faded grey text floating above their source agents, while "listening" channels show as bright white text with a subtle pulse. The visual is immediate: brightness = attention, dimness = filtered out. A player toggling a channel from "listen" to "ignore" sees that channel's text on the board fade from white to grey in real time, accompanied by a soft descending tone — attention withdrawn.

#### Journey: Aisha, 31, Product Manager (Plays Civilization, Moderate Strategy Experience)

**Context:** Just finished Mission 4, where she learned rules without perception. Her scout has hooks and rules but she hasn't yet seen how it "sees" the world. Mission 5 opens with a "Sensing" prelude.

**Minute 0:00 — The Cone Reveal**
The Plan screen loads. Aisha's scout sits at C3. For the first time, a translucent cyan wedge extends from the scout — five tiles forward in a cone shape. The boot log prints: `PERCEPTION SUBSYSTEM INITIALIZING...`

"What's that blue thing?" She hovers over the cone. Whisper: "Perception radius — the area your agent can observe."

She remembers observations from Mission 1 — buffer cards that said things like "ENEMY_POSITION: D4." Now she sees WHERE those observations come from. The cone IS the source. If an enemy walks into the cone, an observation appears in the buffer. If it's outside, the scout is blind.

**Minute 0:30 — The Filter Toggle**
The right panel shows a new section below the hook configuration: two columns labeled "LISTEN" and "IGNORE" with channel names listed between them. Currently all channels are on the LISTEN side. She drags "weather_report" to IGNORE. On the board, a faint grey "weather_report" label above RELAY-A fades to near-invisible. The scout's buffer, previously half-full with weather data, begins clearing as old weather observations evict without replacement.

"Oh. I can tell it to stop paying attention to the weather channel. So it has room for the important stuff."

**Minute 1:15 — The Aha Moment**
Aisha realizes: perception radius controls what the scout sees DIRECTLY. Listen/ignore filters control what it hears from OTHER agents. Both determine what fills the buffer. She's now thinking in terms of information architecture — input channels, each with different noise profiles, all competing for limited buffer space.

She adjusts the perception radius slider (from 5 to 3). The cyan cone shrinks. Fewer observations per tick, but higher quality — only nearby threats. She moves "friendly_chatter" to IGNORE. The scout's buffer is now lean: just threat data from close range.

"It's like setting up email filters. Important stuff goes to inbox. Everything else gets filtered."

**UI Annotations:**
- Perception cone: translucent cyan wedge, soft edge gradient, brightens when hovered
- Listen/Ignore columns: drag-and-drop channel name cards between two columns, satisfying magnetic snap
- Buffer clarity indicator: subtle animation on buffer bars when noise decreases — bars shift from amber to cool blue

#### Journey: Kenji, 42, Network Engineer (Factorio/Shenzhen Veteran)

**Context:** Mission 5 sensing prelude. Kenji immediately sees the parallel to network packet filtering.

**Minute 0:00 — Instant Mapping**
Kenji sees the listen/ignore filter and says aloud: "It's an allowlist." He configures perception radius to maximum (more data), then aggressively filters channels — ignoring everything except "threat" and "priority_target." He's building a router with specific ACLs.

**Minute 0:20 — Testing Edge Cases**
What happens when ALL channels are ignored? The scout still sees through its perception cone — direct observations aren't channel-based. Good — perception and channels are independent input sources.

What happens when perception is 0? "Can I make a blind relay that only processes channel signals?" He tries it. The scout's cone disappears. It sits there, receiving signals from other agents but seeing nothing directly. A "sensor node" that's really a "processing node."

"Interesting. So perception = direct sensing, channels = indirect sensing. Both fill the same buffer. I can specialize."

**Minute 1:00 — The Bandwidth Metaphor**
Kenji is now thinking about his agents as network devices. Scouts are sensors with high perception/low channel. Relays are switches with zero perception/high channel. The buffer is the packet queue. Eviction is tail drop. Listen/ignore is firewall rules.

He writes a channel architecture on a mental notepad: threat data on a dedicated channel, periodic position updates on another, everything else filtered. He's designing a network before he designs an army.

**UI Annotations:**
- Zero-perception visual: when perception slider hits 0, the cone collapses with a soft implosion sound and a brief flash; the scout's icon gains a subtle "antenna" overlay indicating channel-only mode

#### Journey: Luna, 10, Elementary School Student (Plays Minecraft, First Strategy Game, Plays with Parent)

**Context:** Luna's dad is a gamer who bought Robot Uprising. They play together. Luna controls the mouse, dad explains concepts in kid-friendly terms. Mission 5 sensing prelude.

**Minute 0:00 — The Blue Light**
Luna sees the cyan perception cone: "Ooh, it's like a flashlight!" She moves the scout around the board during Plan. The cone follows. She giggles every time it sweeps past a grid corner.

Dad: "That's how the scout sees. Anything inside the blue light, the scout knows about."

**Minute 0:30 — Playing Flashlight Tag**
Luna moves the scout to try to "catch" enemies in the cone. She discovers she can only place the scout during Plan — once EXECUTE starts, it moves on its own based on rules. She sets up a patrol rule and watches the cone sweep the board like a searchlight.

"It's like a security camera! It only sees what's in front of it!"

**Minute 1:00 — The Volume Knob**
Dad points to the listen/ignore panel. "See these channels? Those are like walkie-talkie stations. You can turn some off so your scout doesn't hear everything."

Luna drags "weather_report" to IGNORE. "I don't care about the weather. I want to find bad guys."

She drags "position_updates" to IGNORE too. Dad: "Wait, you might want that one." Luna: "Nah. Bad guys only!" She leaves only "threat" on LISTEN.

EXECUTE. The scout's buffer fills exclusively with threat data. It reacts faster to enemies because it's not processing noise. Luna doesn't know the word "filter" yet but she's done filtering.

**Minute 3:00 — The Overshoot**
Luna ignores too many channels. Her scout misses a flanking enemy because it filtered out position data from the relay. The debrief shows: "RELAY-A transmitted ENEMY_POSITION via 'position_updates' channel at tick 4. SCOUT-1 was ignoring 'position_updates.' Signal dropped."

"Ugh! I need to turn that back on!"

Dad: "See? You can't ignore everything. You have to pick what's important."

This is the designed teaching moment — the failure that teaches the cost of over-filtering. Luna's next configuration is more nuanced: ignore weather, listen to positions and threats. She's learned information triage at age 10 without ever hearing the phrase.

---

### Option C: "The Debrief Defer" — Introduce Terms During Debrief, Not Plan

The most radical pacing option: **don't name terms during the mission at all.** The player configures, executes, and watches using unlabeled UI elements. Then, during the Inspector debrief, each new concept is formally named and explained through replay annotations.

**How it works:**
1. **Plan phase:** New UI elements appear without labels. The hook configuration section is just a pair of connectable slots with no header text. The player experiments by clicking and dragging.
2. **Execution phase:** The sealed watch plays out. The player sees consequences of their configuration.
3. **Debrief phase:** The Inspector annotates the replay with new terminology. "At tick 5, the signal you wired at this connection point arrived at RELAY-A's memory. That connection is called a **hook.** The destination is a **channel.**"

**Term density per mission stays the same,** but the cognitive load is redistributed: the player does the HARD work (configuring) without vocabulary overhead, then processes terminology during the LOW-stress debrief phase.

**Strengths:**
- Separates "doing" from "naming" — reduces simultaneous cognitive demands
- The debrief is inherently low-pressure (the match is over, nothing is at stake)
- Matches the "hands before head" principle perfectly — the doing always comes first
- The player may already have their OWN name for the concept ("the connection thingy") before the game provides the official one, creating a satisfying moment of "oh, THAT's what it's called"
- Working memory research shows that spreading information processing across time reduces interference

**Weaknesses:**
- Unlabeled UI is confusing — players may not know what to click if nothing is labeled
- Players who skip or rush the debrief miss all naming moments
- The gap between doing and naming might be too long — if the debrief is 3 minutes after the player used the hook, the experiential anchor is fading
- Repeat players will find the debrief naming tedious since they already know the terms

**Sensory description:** During the Plan phase, new UI elements shimmer with a faint holographic distortion — present but unnamed, like prototypes still in testing. The dropdown that will become the "condition" selector has no header, just a placeholder glyph: ❓→❓. The player fills both slots and the glyph transforms to a checkmark: ✓→✓. During the debrief, as the Inspector replays tick 5, the holographic distortion clears — a crystallization effect, like frosted glass becoming transparent — and the word "HOOK" materializes above the connection point in sharp monospace text, accompanied by a single soft chime. The label is now permanent. The next time the player enters Plan, the label is there, solid, no shimmer. Named.

#### Journey: Rafael, 25, Music Producer (Plays Mobile Games Only, Zero Strategy Experience)

**Context:** Mission 3 (Relay). Rafael has been dragging and clicking without reading anything. He's in flow — the game feels tactile, like mixing tracks.

**Minute 0:00 — Plan Phase (No Labels)**
Rafael sees two units on the board: Scout at B2, Relay at E5. Between them, a faint dashed line suggests a possible connection. The right panel has a new section — no header, just two blank circles connected by a line. The left circle hovers near the scout's icon. The right circle hovers near the relay's icon.

Rafael drags from the left circle to the right. A line connects them. The game prompts: a text field appears on the line. Rafael types "main" (he'd type a track name in his DAW). The line solidifies and gains a subtle glow.

He didn't read a tutorial. He didn't know the word "hook" or "channel." He just connected two things and named the connection, like routing audio from a synth to a bus.

**Minute 1:30 — Execution**
EXECUTE. The scout sees an enemy. Information appears in the scout's buffer. Then — a green flash on the connection line. The same information appears in the relay's buffer one tick later.

Rafael watches: "Oh shit, they're talking to each other."

**Minute 3:00 — Debrief (The Naming)**
The Inspector replays tick 5. The connection line highlights. An annotation crystallizes above it: **"HOOK"** — followed by smaller text: "A reactive trigger that transmits a signal." The channel name "main" gains its own label: **"CHANNEL"** — "A named pipe connecting agents."

Rafael reads it and nods. He already understood what was happening. The words just gave names to things he already felt. He doesn't need to study them — the names will stick because they're attached to a memory of doing.

"Hook. Channel. Like an effects send in a mix bus. Got it."

**UI Annotations:**
- Unnamed connection UI: two circles + connecting line, no header text, placeholder animation (gentle pulse)
- Channel naming: inline text field on the connection line, auto-focus on creation
- Debrief crystallization: holographic shimmer → clear glass transition, 0.5s animation, chime on name reveal
- Permanent label: after crystallization, label appears in Plan phase on all subsequent sessions

#### Journey: Priya, 55, Retired Teacher (Bought Game for Grandkids, Playing Solo First to Understand It)

**Context:** Mission 4 (Chorus). Priya is methodical and reads everything. The unlabeled UI concerns her.

**Minute 0:00 — Anxiety**
Priya sees new UI elements without labels. Her instinct is to look for an explanation before touching anything. She hovers over the unlabeled condition slot. The Glossary Ghost whisper activates: "Try clicking this — it controls what your agent responds to." Not a definition, just encouragement.

She clicks. The dropdown is visual — icons with short text. She can parse the icons without knowing the formal vocabulary. She selects "enemy nearby."

**Minute 0:30 — Cautious Configuration**
She fills both slots. She doesn't understand WHAT she built (she doesn't have the word "rule" yet) but she understands that she told the agent to do something when something else happens. She adds a second pair. She notices the ordering.

"I bet the order matters. Let me try..."

She reorders. EXECUTE. Watches. The agent behaves differently based on order. She runs three configurations. Each time, she's more confident.

**Minute 4:00 — Debrief (Relief)**
The Inspector names everything. Priya exhales: "Oh, it's called a RULE. Like a rule in a classroom. If this happens, then do that." She opens the glossary. Reads the full mechanical reference. Takes her time. The glossary entry has a clip from her own gameplay — the moment she swapped the rule order and the agent changed behavior.

"That's clever. It showed me what I did and then told me what it's called. Like how I used to teach — let the kids try the experiment first, then explain the science."

**UI Annotations:**
- Glossary Ghost hover delay: 1.5s for unnamed elements (shorter than the standard 2s, acknowledging higher confusion)
- Debrief pacing: terms appear one at a time with 2-second gaps between crystallizations, not all at once

---

### Option D: "The Vocabulary Budget" — Hard Cap of 2 New Terms Per Mission

Impose a strict design constraint: **no mission introduces more than 2 genuinely new concepts.** Extension concepts (variations of already-learned ideas) don't count against the budget. Terms are redistributed accordingly:

| Mission | New Concepts (≤2) | Extension Terms (No Limit) |
|---------|-------------------|--------------------------|
| M1: Wake | buffer, observation | slot (extension of buffer), noise (extension of observation) |
| M2: Focus | eviction, confidence | buffer size (extension of buffer), staleness (extension of confidence) |
| M3: Relay | hook, channel | signal (extension of observation via hook), latency (extension of hook) |
| M4: Reflex | rule, condition→action | priority (extension of rule) |
| M5: Sense | perception radius, skill | — |
| M6: Build | blueprint, production queue | cost (extension of blueprint), tagging (extension of production) |
| M7: Filter | listen/ignore, EM emission | — |
| M8: Command | command agent, reassign | reroute (extension of reassign), prioritize (extension of command) |
| M9: Process | compress, filter | amplify (extension of compress) |
| M10: Climax | — (no new terms) | All terms in full combination |

**This requires 10 missions with no new terms on the finale,** giving Mission 10 the role of "final exam" where every previously learned concept is tested in a factory-vs-factory climax.

**Strengths:**
- Strictly respects cognitive load limits — working memory is never overwhelmed
- Clear design constraint makes mission design easier (each mission has a focused teaching goal)
- Mission 10 as pure application creates a satisfying capstone feeling
- Extension terms feel natural — they're "more of the same," not "something new"

**Weaknesses:**
- Redistributing terms across 10 missions means some concepts arrive later than they "should" (listen/ignore at Mission 7 instead of Mission 5)
- The "new vs. extension" distinction is debatable — is "priority" really an extension of "rule" or a new concept?
- Might feel too slow for experienced players (the expert fast-track from 5.01e becomes essential)
- Some missions may lack dramatic punch if they're introducing abstract concepts (M7: listen/ignore + EM emission is mechanically thin for a full mission)

**Sensory description:** Each mission opens with a boot log header showing the session's vocabulary budget — two empty hexagonal slots in the top-right corner of the Plan screen, like gem settings in a crown. As the player encounters each new concept during the mission, a hexagon fills with a colored glyph representing the concept (a blue buffer icon, a green hook zigzag, a red rule arrow). When both hexagons are full, any remaining concepts the player encounters are treated as extensions — they appear as smaller satellite dots orbiting the filled hexagons, visually subordinate. The message is clear: "You're learning two big things this mission. Everything else is detail." At mission end, the filled hexagons fly into the glossary bar with a trail of light, joining the growing constellation of mastered concepts.

#### Journey: Sam, 19, College Freshman (Plays Valorant, Trying Strategy for First Time)

**Context:** Mission 4 (Reflex). Under the vocabulary budget, this mission introduces only "rule" and "condition→action." Priority is an extension term.

**Minute 0:00 — Two Hexagons**
Sam sees two empty hex slots in the corner. "Is that like... achievements? Collectibles?" He starts playing. The Plan screen has a new panel: a vertical list with one empty condition→action pair.

**Minute 0:20 — First Hexagon Fills**
Sam drags a condition into the left slot. The game registers this as his first encounter with the "rule" concept. The left hexagon fills with a golden arrow glyph (→). A soft chime. Boot log: `CONCEPT ACQUIRED: Rule — an ordered instruction.`

"Oh, I'm collecting concepts. Cool."

**Minute 1:00 — Second Hexagon Fills**
He configures both halves of the rule. The right hexagon fills with a split card glyph (⟨IF|THEN⟩). Boot log: `CONCEPT ACQUIRED: Condition→Action — the structure of a rule.`

Both hexagons are full. Sam feels a small sense of completion even though the mission isn't over.

**Minute 1:30 — Extension: Priority**
Sam adds a second rule. He notices the ordering. He reorders. The behavior changes. A small satellite dot appears orbiting the first hexagon (Rule), labeled "Priority." No chime. No boot log entry. Just a quiet visual addition.

Sam gets it: priority is a DETAIL of rules, not its own thing. He doesn't need to give it a separate mental slot. It's just "the order matters."

**Minute 3:00 — Resolution**
Mission complete. The two hexagons fly into the glossary bar. Sam's concept constellation now has 8 hexagons (4 missions × 2 each) with various satellite dots. He feels the collection growing. He's curious what the next two hexagons will be.

---

### Option E: "The Cocktail Party" — All Terms Available from Mission 1, Context Determines Relevance

The radical opposite of pacing: **every term exists from the start.** The workbench shows all 30 labels from Mission 1. But the missions are designed so that only 2-4 terms are RELEVANT per mission. The rest are visible but inactive — greyed out, non-interactive, present but inert.

**How it works:**
- Mission 1's workbench shows buffer, rules, hooks, skills, context config — everything. But only the buffer section is interactive (colored, clickable). Everything else is dimmed and unresponsive.
- As missions progress, sections activate. Mission 3 lights up the hooks section. Mission 4 lights up rules. Each activation is accompanied by the boot log "subsystem online" narration.
- A player who HOVERS over dimmed sections can see preview tooltips: "HOOKS — coming soon. Unlocks in a future mission." This creates anticipation without cognitive load.

**Strengths:**
- Zero surprise — the player always knows what's coming. No "wait, there's MORE?" feeling at Mission 5
- Creates anticipation and curiosity ("What does COMMAND do? I can't wait to unlock it")
- Expert players can see the full system architecture from the start, satisfying their need for big-picture understanding
- No jarring UI changes between missions — elements activate in place rather than appearing from nowhere
- Mirrors real software: you can see the full menu but some features are greyed out until you upgrade

**Weaknesses:**
- 30 labels on screen from Mission 1 is visually overwhelming for beginners
- "Grey and inactive" might read as "broken" or "I'm doing something wrong"
- Preview tooltips ("coming soon") break diegetic immersion — why would the AI know its own subsystems aren't online yet? (Counter: it's literally an AI reading its own initialization, so "not yet initialized" IS diegetic)
- Creates a risk of spoiling the discovery feeling — the player knows hooks exist before encountering them, so the "first hook" moment loses its surprise

**Sensory description:** The workbench loads for Mission 1. The buffer section glows with its usual cool-blue interface light. Below it, three more sections are visible but rendered in deep charcoal grey — darker than the background but lighter than invisible. Their headers read "RULES," "HOOKS," "CONTEXT CONFIG" in faint monospace text, barely legible. A thin progress bar runs along the left edge of each section: 0% filled, waiting. When the player hovers over "HOOKS," the section brightens to 20% — a ghostly preview. A whisper: "Hook protocol: not yet initialized. Estimated activation: Mission 3." The section dims when the cursor leaves. In Mission 3, when hooks activate, the entire section blooms from charcoal to full color in a 2-second animation — grey to blue to cyan — with a hardware initialization sound (capacitor charge, relay click, fan spin-up). The progress bar fills to 100% and dissolves. The section is alive.

#### Journey: Elena, 38, Architect (Plays The Sims, Design-Minded but Not a Gamer)

**Context:** Mission 1 (Wake). Elena is a spatial thinker who likes seeing the full picture before starting.

**Minute 0:00 — The Full Dashboard**
Elena sees the workbench: buffer section lit up, three more sections in dark grey. She immediately scans all four sections. "Buffer, Rules, Hooks, Context Config. Okay. So there are four systems. I'm starting with Buffer."

This is EXACTLY the information she needed. She's an architect — she wants to see the floor plan before she starts building. The greyed-out sections are like rooms she hasn't furnished yet. She knows the shape of the house.

**Minute 0:20 — Satisfying Hover**
She hovers over each greyed section. "Rules — Mission 4." "Hooks — Mission 3." "Context Config — Mission 5." She mentally maps the learning trajectory. She LIKES knowing what's coming. She settles into Mission 1's buffer work feeling oriented, not overwhelmed.

"This is like a CAD template with layers turned off. I'll turn them on when I need them."

**Minute 5:00 — Mission 1 Complete**
She's mastered buffers. The greyed sections haven't distracted her — she's been laser-focused on the active section. But she's been glancing at "HOOKS" with increasing curiosity. The preview whisper told her it involves connecting agents. She's already thinking about her network architecture.

---

## Interaction Effects Across Categories

### With Building Blocks (design-space/building-blocks/)
The vocabulary pacing directly constrains which building block paradigm is viable. A node-graph paradigm requires the player to understand hooks, channels, and connections simultaneously — this demands at least Mission 3's vocabulary. A mixing-board paradigm (sliders and dials) could start from Mission 1 (buffer size = a slider). The building block paradigm choice and the vocabulary pacing must be co-designed.

### With Sealed Watch (locked)
The sealed watch's "no tools, no pause" constraint means the player can't look up terms during execution. All vocabulary must be internalized BEFORE the EXECUTE button is pressed. This adds pressure to the Plan phase's teaching responsibility — the sealed watch is a comprehension test with no open book.

### With Inspector/Debrief (locked)
The Inspector is the ideal location for vocabulary reinforcement. After watching the sealed replay, the player enters a low-pressure analytical mode where terms can be applied to specific events. Option C (Debrief Defer) leverages this maximally. Even under other options, the debrief should reinforce new terms by annotating the replay with them.

### With Expert Fast-Track (5.01e)
Any pacing option must coexist with expert fast-track detection. Options A and D (which slow down the pace) need robust fast-tracking to avoid boring veterans. Option E (everything visible from start) naturally serves experts who can absorb the full picture. The fast-track and the pacing are two levers controlling the same variable: information density per unit time.

### With Mission 5 Mode Shift
Mission 5 introduces the factory (production) mode. Under ALL pacing options, Mission 5 is a structural challenge because it changes what kind of game the player is playing. Any vocabulary added to Mission 5 competes for cognitive bandwidth with the mode-shift itself. Options B (cluster redistribution) and D (vocabulary budget) that reduce Mission 5's term count are strongest here.

### With Boot Log Narrative (locked)
The boot log's "subsystem online" naming moments are paced by mission. Adding or splitting missions (Option A) means more boot log entries. Deferring names to debrief (Option C) means the boot log names things AFTER execution rather than before it. Option E (all visible from start) requires the boot log to acknowledge pre-existing labels ("HOOK PROTOCOL: You can see the interface. But the subsystem isn't online yet.").

---

## Comparable Games: Vocabulary Pacing in Practice

### Slay the Spire — Keywords as Emergent Vocabulary
Slay the Spire has ~30 keywords (Vulnerable, Weak, Retain, Ethereal, Exhaust, Innate, etc.). It teaches ZERO of them explicitly. Keywords appear in bold on cards. The player reads the card, plays it, sees the effect, and infers the keyword's meaning. Learning rate is player-controlled — a cautious player reads every card description; an aggressive player plays first and reads later.

**Key insight:** Slay the Spire's keywords are independently meaningful. "Vulnerable: take 50% more damage" is self-contained. Robot Uprising's terms are interdependent — understanding "hook" requires understanding "channel" and "signal." This means Robot Uprising can't use Slay the Spire's "learn keywords independently via cards" approach for the core system vocabulary. It CAN use it for extension terms (individual skills like "compress" or "filter" that have self-contained effects).

### Into the Breach — Mechanics Over Vocabulary
Into the Breach has almost no formal vocabulary. There are no named keywords on weapons. The game teaches through spatial consequence: you see what a weapon does by watching the animation preview. "Pushes adjacent tiles" is shown, not named.

**Key insight:** Into the Breach can avoid vocabulary because its mechanics are spatial — you can SHOW pushing without NAMING it. Robot Uprising's mechanics are informational — you can't SHOW "eviction policy: FIFO" without some text. The game's vocabulary is irreducibly textual. But the text can be deferred (Option C) or minimized (icon-first as in Tomás's journey above).

### Factorio — Gradual Unlock, Full Reference
Factorio introduces mechanics through the research tree. You can't build a chemical plant until you've researched it. The technology tree IS the vocabulary curriculum — each research unlocks new terms (inserter, splitter, logistics network, circuit condition). The in-game encyclopedia provides full reference, but learning happens through building and observing.

**Key insight:** Factorio's pacing is player-controlled — YOU choose which tech to research next. Robot Uprising's campaign is linear (locked 10-mission arc). The player can't choose to learn hooks before rules. This means the game bears full responsibility for pacing, unlike Factorio where the player self-paces through exploration.

### Baba Is You — Rules as the Vocabulary
Baba Is You teaches its vocabulary by making vocabulary manipulation the core mechanic. "BABA IS YOU" is a sentence the player pushes around. The vocabulary IS the gameplay. Learning a new word = unlocking a new mechanic.

**Key insight:** Baba Is You's vocabulary is its building blocks — words are physical objects on the board. Robot Uprising could borrow this for its boot log: what if each new term materializes as a physical label on the workbench that the player must PLACE, not just read? Dragging the word "HOOK" from the boot log into the workbench header to activate that section. The naming moment becomes a physical act, not a passive read. (This is a potential new aspect to explore.)

---

## The TikTok Clip for Each Option

**Option A (The Split):** The clip is a 15-second montage: player dragging rules into order, striker engaging an enemy, then CUTTING TO the next mission where a perception cone sweeps the board. Caption: "Mission 4: teach it to think. Mission 5: teach it to see. 🤖" The split between rules and sensing creates two visually distinct moments — the gold arrow flash of rule evaluation, then the cyan sweep of perception activation.

**Option B (The Cluster):** The clip shows the perception cone and the listen/ignore panel side by side — the player drags a channel to IGNORE and the corresponding text on the board fades from white to grey. Cut to: the scout's buffer clearing of noise, buffer bars shifting from amber to blue. Caption: "When you teach a robot what to ignore 🤫" The satisfying visual of noise fading out is inherently clipable.

**Option C (Debrief Defer):** The clip is the crystallization moment — holographic shimmer clearing into sharp text as the word "HOOK" materializes during the debrief. The chime. The moment of "oh, THAT's what it's called." Caption: "the game doesn't tell you what things are called until AFTER you use them" The knowledge reveal is the hook.

**Option D (Vocabulary Budget):** The clip shows the two hexagons filling with concept glyphs, then flying into the glossary constellation at mission end. A collection mechanic. Caption: "collecting concepts, two per mission 💎" The collection animation is satisfying and shareable.

**Option E (The Cocktail Party):** The clip is the section activation — a greyed-out "HOOKS" panel blooming from charcoal to full cyan with the hardware initialization sound (capacitor charge, relay click, fan spin-up). Caption: "when a new subsystem comes online 🔋" The power-up activation is dramatic and distinctive.

---

## Recommendation Matrix

| Dimension | A: Split | B: Cluster | C: Defer | D: Budget | E: Cocktail |
|-----------|----------|-----------|----------|-----------|-------------|
| Cognitive load management | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★★ |
| Respects locked 10-mission arc | ★★ | ★★★★ | ★★★★★ | ★★★★★ | ★★★★★ |
| Expert player experience | ★★★ | ★★★ | ★★★ | ★★ | ★★★★★ |
| Beginner player experience | ★★★★★ | ★★★★ | ★★★★ | ★★★★★ | ★★ |
| Diegetic coherence | ★★★★ | ★★★ | ★★★★★ | ★★★ | ★★★★ |
| Dramatic tension per mission | ★★★ | ★★★★ | ★★★★ | ★★★ | ★★★★ |
| Implementation complexity | ★★★ | ★★★★ | ★★ | ★★★★ | ★★★ |
| TikTok clip potential | ★★★ | ★★★★ | ★★★★★ | ★★★★ | ★★★★★ |

---

## Discovered Aspects

This analysis surfaces the following new aspects for future exploration:

1. **5.00a-i — The Mission 4 Wall: detailed mission design for the rules introduction** — exact puzzle scenarios, enemy placement, designed failure states, and rule complexity ramp within a single mission; how to make 3-4 rule terms feel natural rather than overwhelming
2. **5.00a-ii — Physical term placement as naming mechanic** — the Baba Is You inspiration: dragging term labels from boot log to workbench headers as a physical naming ritual; the term becomes real when you place it; implications for accessibility and controller input
3. **5.00a-iii — Extension terms vs. genuinely new concepts: the taxonomy problem** — formal criteria for distinguishing "more of the same" from "fundamentally new"; which Robot Uprising terms are truly new concepts vs. which are parameters of existing concepts
4. **5.00a-iv — Cross-run vocabulary retention testing** — if a player takes a week-long break, how much vocabulary do they retain? Design patterns for reactivating dormant vocabulary on session resumption; the "welcome back" recap as vocabulary reinforcement
5. **5.00a-v — Vocabulary budget as visible game mechanic** — Option D's hexagonal concept slots as a first-class UI element; the vocabulary collection metagame; concept constellation as progression visualization; does making the pacing visible improve or constrain the experience?

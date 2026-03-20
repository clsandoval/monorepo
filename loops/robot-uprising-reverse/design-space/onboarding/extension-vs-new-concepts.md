# Onboarding: Extension Terms vs. Genuinely New Concepts — The Taxonomy Problem

**Aspect ID:** 5.00a-iii
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00a (vocabulary pacing bottleneck), 5.04b (vocabulary density curve), 5.00e (naming moment as designed beat), 5.00a-ii (physical term placement), 5.02 (tutorial as narrative), 3.05 (rules language), 3.12 (context config UI)

---

## The Core Question

Not all vocabulary is created equal. When Mission 2 introduces "eviction" after Mission 1 already taught "context window," does eviction count as a *new concept* or merely a *parameter* of the context window concept the player already holds? The answer determines whether the vocabulary pacing analysis (5.00a) overstates the cognitive burden — or understates it by treating genuinely alien concepts the same as natural extensions.

The formal distinction matters because it directly controls tutorial pacing. If 20 of Robot Uprising's 30 terms are extensions of 10 root concepts, the effective cognitive load is closer to 10 genuinely new mental models plus 20 parameter adjustments — a fundamentally different teaching challenge than 30 independent concepts.

---

## A Formal Taxonomy: Three Tiers of Vocabulary Novelty

### Tier 1: Root Concepts (Genuinely New Mental Models)

A root concept requires the player to construct an entirely new mental model that has no obvious analog in their prior experience with the game or with other games. Root concepts cannot be predicted from existing knowledge. They require their own Kishōtenketsu cycle (introduction, development, twist, conclusion) and occupy a full working-memory slot until integrated.

**Robot Uprising's root concepts:**

| Root Concept | Why It's Genuinely New | Mission |
|---|---|---|
| **Context window** (buffer) | Fixed-size memory is unfamiliar — most games have unlimited inventories. The idea that an agent can only "remember" N things at once, and that memory management IS the game, is alien. | M1 |
| **Hook** (reactive trigger) | The idea that agents react *to each other's outputs* automatically, creating emergent chains, has no analog in most strategy games. This isn't "attack the nearest enemy." It's "when this agent says something, that agent does something." Event-driven programming as a tactile mechanic. | M3 |
| **Rule** (condition→action pair) | The structured "IF X THEN Y" format as a *composable building block* rather than a fixed behavior menu. Not "this unit attacks enemies" but "this unit attacks IF its buffer contains a threat signal AND that signal is fresher than 3 ticks." Rules as a programmable language. | M4 |
| **Blueprint** (factory template) | The shift from configuring individual units to designing *templates* that produce units. You're no longer tuning one agent — you're designing a species. The ontological shift from instance to class. | M5 |
| **Command agent** (meta-level) | An agent that manages other agents. Not just "a powerful unit" but a unit whose skills operate on *other units' configurations*. The recursive leap: building the thing that builds the things. | M6 |

That's **5 root concepts** across 10 missions. One every two missions on average. Each demands its own experiential discovery phase, naming moment, and reference entry.

### Tier 2: Extension Terms (Parameters of Existing Concepts)

An extension term adds a dimension, constraint, or variant to a root concept the player already holds. The player can *predict* the extension's existence once they understand the root. "Oh, the context window can get full — so there must be a way things get removed" is a natural inference that makes "eviction" an extension of "context window," not a new concept.

**Extension terms and their roots:**

| Extension Term | Root It Extends | Why It's Predictable | Mission |
|---|---|---|---|
| **Slot** | Context window | "The window has N slots" — spatial subdivision of a container is universal | M1 |
| **Observation** | Context window | "Things go into the window" — input to a container | M1 |
| **Noise** | Context window | "Unwanted things go into the window" — junk input, universally understood | M1 |
| **Buffer size** | Context window | "Different windows have different sizes" — parameter of container | M2 |
| **Staleness** | Context window | "Old information" — temporal quality of data, natural extension | M2 |
| **Confidence** | Context window | "How reliable is this information" — quality dimension of data | M2 |
| **Eviction** | Context window | "When full, something gets removed" — overflow behavior | M2 |
| **Channel** | Hook | "The named wire connecting hooks" — the medium hooks use | M3 |
| **Signal** | Hook | "The thing that travels through a channel" — payload of hook | M3 |
| **Latency** | Hook | "Signals take time" — delay property of transport | M3 |
| **Condition** | Rule | "The IF part" — structural component of rule | M4 |
| **Action** | Rule | "The THEN part" — structural component of rule | M4 |
| **Priority** | Rule | "Rules have order" — ordering property of collection | M4 |
| **Skill** | Rule/Blueprint | "What an agent CAN do" — capability set, prerequisite for actions | M4 |
| **Perception radius** | Context window + spatial | "How far an agent can see" — range parameter | M4 |
| **Production queue** | Blueprint | "Blueprints build in order" — sequencing of factory | M5 |
| **Cost** | Blueprint | "Blueprints cost resources" — economic parameter | M5 |
| **Tagging** | Spatial/Blueprint | "Marking territory for resources" — presence-based mechanic | M5 |
| **Listen/ignore filter** | Context window | "Choose what to hear" — selective input, extension of buffer | M5 |
| **Reassign/reroute/prioritize** | Command agent | "What the Command agent does" — verbs of meta-level, predictable from "manages other agents" | M6-7 |
| **EM emission** | Hook | "Hooks make detectable noise" — side-effect of communication | M6-7 |
| **Compress/filter/amplify** | Hook/Context window | "Signal processing skills" — operations on data in transit | M8-10 |

That's roughly **23 extension terms**. Each is a spoke radiating from one of the 5 root concepts. The player who has internalized "context window" can absorb "eviction" in 15 seconds, not 3 minutes.

### Tier 3: Bridge Terms (Connecting Two Existing Concepts)

Some terms exist at the intersection of two root concepts. They're not extensions of either alone — they require the player to hold *both* roots simultaneously and see how they interact. Bridge terms are harder than extensions but easier than root concepts because the components are already known.

| Bridge Term | Roots It Bridges | Why It's a Bridge | Mission |
|---|---|---|---|
| **Context overload** | Context window + Rule | "Full buffer → stunned" — the collision of memory limits and behavioral consequences | M2 |
| **Listen/ignore filter** | Context window + Hook | "Choose which channels to hear" — selective subscription bridges buffer management and hook wiring | M5 |
| **EM emission** | Hook + Spatial/Stealth | "Communication is detectable" — bridges signal design and battlefield positioning | M6-7 |

Bridge terms represent the moments where the game's systems interlock. They're where the "aha" moments live — "Oh, my hooks are filling my buffer, and my buffer getting full makes my unit freeze — I need to filter!" That's two root concepts colliding.

---

## The Formal Test: "Could They Have Predicted It?"

The simplest criterion: **after experiencing the root concept, could a thoughtful player have predicted the extension's existence?**

- After learning "context window has limited slots": Could they predict eviction? **Yes.** Extension.
- After learning "hooks send signals between agents": Could they predict channels? **Yes** — signals need a medium. Extension.
- After learning "context window" and "hooks": Could they predict context overload from hook flooding? **Not immediately.** Bridge.
- Having never encountered reactive event wiring: Could they predict hooks from knowing about context windows? **No.** Root.

This test can be operationalized as a **design-time checklist**:

1. **Does the term add a property to something the player already uses?** → Extension
2. **Does the term describe what happens when two known systems interact?** → Bridge
3. **Does the term require a fundamentally new mental model with no precedent in the game so far?** → Root
4. **Can the player discover the term's meaning through experimentation with known tools before being told the name?** → Extension (they'll find it naturally) or Bridge (they'll find it through collision)

---

## Implications for Tutorial Pacing

If we apply this taxonomy to the vocabulary distribution:

| Mission | Root | Extension | Bridge | Total | Effective Load |
|---|---|---|---|---|---|
| M1 | 1 (context window) | 3 (slot, observation, noise) | 0 | 4 | 1 root + 3 light |
| M2 | 0 | 3 (buffer size, confidence, staleness) | 1 (eviction as overflow) | 4 | 0 roots + 4 light |
| M3 | 1 (hook) | 3 (channel, signal, latency) | 0 | 4 | 1 root + 3 light |
| M4 | 1 (rule) | 4 (condition, action, priority, skill) | 1 (perception as spatial-buffer bridge) | 6 | 1 root + 5 light |
| M5 | 1 (blueprint) | 3 (queue, cost, tagging) | 1 (listen/ignore as buffer-hook bridge) | 5 | 1 root + 4 light |
| M6-7 | 1 (command) | 3 (reassign, reroute, prioritize) | 1 (EM as hook-spatial bridge) | 5 | 1 root + 4 light |
| M8-10 | 0 | 3 (compress, filter, amplify) | 0 | 3 | 0 roots + 3 light |

**The reframing:** Mission 4's "six terms" is actually **one root concept (rule) plus five extensions/bridges that radiate naturally from it.** The cognitive load is dramatically lower than "six independent concepts." The real danger is not term count — it's whether the root concept lands clearly enough that the extensions feel inevitable.

---

## Three Player Journeys

### Journey: Tomás, 16, First Strategy Game Player

**Context:** Mission 2, just learned "context window" in Mission 1. Has physically placed the "context window" label onto the buffer panel.

**Minute 0:00 — The Overflow Discovery**
Tomás stares at the Plan screen. His scout's context window thermometer — a vertical glass tube on the left edge of the unit tile — glows cool blue at 3 of 6 slots filled. He's been watching this since Mission 1. He understands: things go in, the tube fills up. The boot log text crawls in teal monospace on the left sidebar: `MEMORY SUBSYSTEM: CAPACITY MANAGEMENT PROTOCOL INITIALIZING...`

**Minute 0:30 — Extension, Not Revolution**
The boot log continues: `WHEN MEMORY IS FULL, THE OLDEST ENTRY IS REMOVED TO MAKE ROOM. THIS IS CALLED EVICTION.` Tomás nods. He already saw the tube get close to full in Mission 1. He thought "what happens when it's totally full?" and now he knows. The amber label token "EVICTION" appears in the boot log sidebar tray. He already knows where it goes — he drags it to the small sub-header beneath "Context Window" that reads `[???]`. Click, snap, the 400ms cyan crystallization animation plays. The sub-header now reads "Eviction: Oldest First" in smaller type beneath the main panel title.

**Minute 0:45 — The Thought That Didn't Happen**
Tomás did NOT think "what is eviction? Is this a new system?" He thought "oh, that's what that's called." The concept existed in his head before the word arrived. He spends zero additional working memory on it. This is a Tier 2 extension term working as designed.

**Minute 1:30 — The Real Challenge**
The boot log continues: `BUT WHICH ENTRY SHOULD BE REMOVED? THE OLDEST? THE LEAST CONFIDENT? THE NOISIEST? YOU DECIDE.` Now Tomás pauses. This IS a new decision. Not a new concept — he still understands eviction — but a new *parameter* of the concept. The eviction sub-header updates to show a dropdown: "Oldest First | Least Confident First | Noisiest First". He clicks through them, watching the thermometer's color-coding shift subtly to indicate which slot is "most at risk" under each policy. A faint amber outline pulses around the bottom slot under "Oldest First," shifts to highlight the dimmest-colored slot under "Least Confident First."

**Minute 2:00 — Resolution**
Tomás selects "Noisiest First" because Mission 1 taught him noise was bad. He hits EXECUTE. During the sealed watch, he sees his scout's tube briefly fill to capacity — the top slot pulses angry red for 200ms — and then the noise entry dissolves with a quiet *fizz* sound, the tube settles back to amber. Eviction happened. He saw it. He understood it. Total learning time: 2 minutes for a concept that was 80% pre-loaded.

**UI Annotations:**
- **Eviction sub-header**: 10px type below main "Context Window" header, initially `[???]` with dashed outline
- **Eviction dropdown**: Three options with tooltip previews showing which slot gets evicted under each policy
- **Thermometer at-risk indicator**: Faint amber outline on the slot that would be evicted next, shifting when policy changes
- **Eviction animation during sealed watch**: Targeted slot dissolves outward like ash, 300ms, quiet fizz audio

---

### Journey: Dr. Amara, 41, ML Researcher

**Context:** Mission 3, already comfortable with context window (root) and its extensions. About to encounter "hook" for the first time.

**Minute 0:00 — The Genuinely New Thing**
Amara's two units — a scout and a striker — sit on the Ifugao rice terrace board. She's configured their context windows, set eviction policies, tuned perception radii. She understands how each unit *individually* processes information. The boot log begins: `COMMUNICATION BUS: ONLINE. YOUR UNITS EXIST IN ISOLATION. THEY SEE THEIR OWN WORLD. THEY DO NOT KNOW WHAT OTHERS SEE.`

**Minute 0:20 — The Root Concept Moment**
`A HOOK IS A REACTIVE TRIGGER. WHEN SOMETHING HAPPENS TO ONE UNIT, A HOOK CAN SEND A SIGNAL TO ANOTHER.` Amara leans forward. This is NOT an extension of context window. This is a fundamentally new idea — *inter-agent communication as a composable, player-configured primitive*. In her professional life she knows pub/sub, webhooks, event-driven architecture. But in-game, she has had zero exposure to units affecting each other. The scout and striker have been independent actors operating in parallel.

**Minute 0:40 — The Working Memory Spike**
The amber "HOOK" label appears in the token tray. Amara hovers it over the workbench. Unlike "eviction" (which she placed instantly on the context window sub-header), she's unsure where "hook" goes. There's no existing panel it obviously extends. A new panel outline pulses on the workbench — a separate section she hasn't interacted with before, below the Rules section, showing two empty dashed-outline slots per unit. She drags the token there. Snap. The panel materializes: "Hooks — 0/2 configured." The interface has literally grown. A new panel exists where there wasn't one.

**Minute 1:00 — Extension Terms Flow Naturally**
The boot log continues rapidly: `HOOKS SEND SIGNALS THROUGH NAMED CHANNELS. TYPE A CHANNEL NAME AND IT EXISTS.` "CHANNEL" and "SIGNAL" labels appear. Amara places them instantly — they're clearly extensions of "hook." Channel goes to the text field inside the hook slot. Signal goes to the output type selector. These are Tier 2 extensions and she absorbs them in seconds because the root concept (hook) already provides the mental scaffolding.

**Minute 1:30 — The Bridge Term**
`SIGNALS TAKE TIME. ONE TICK PER HOP.` "LATENCY" appears. Amara maps this immediately to her professional knowledge — network latency, API response times. But in-game, this is a *bridge* between hooks (the communication system) and the tick-based battlefield (the temporal system). The latency label goes to a small pip display on the channel wire visualization. She needs to hold two systems in mind simultaneously: "my scout sends a signal" (hook knowledge) and "the striker won't get it until next tick" (temporal knowledge). This is harder than pure extensions but easier than the root "hook" concept because both contributing systems are already understood.

**Minute 2:30 — Resolution**
Amara configures a hook: ON_ENEMY_SPOTTED → send to channel "threat" → striker listens on "threat". She hits EXECUTE. In the sealed watch, her scout spots an enemy on tick 3. A green flash on the scout tile, a colored dashed line arcs across the board toward the striker — but the striker doesn't react until tick 4. The one-tick gap is visible. Latency is real. She immediately thinks "what if I need faster communication?" and anticipates relay units before they're introduced. Root concepts that land well create *anticipation* for their extensions.

**UI Annotations:**
- **Hook panel emergence**: New panel materializes on workbench with 400ms fade-in when "HOOK" label placed; does NOT exist before Mission 3
- **Channel text field**: Inline text input inside hook slot, autocomplete dropdown appears after 2 characters
- **Latency pip**: Small diamond icon on channel wire showing "1" (ticks of delay), amber-colored
- **Signal arc in sealed watch**: Dashed bezier from sender to receiver, traveling dot takes exactly 1 tick to traverse

---

### Journey: Kai, 11, Minecraft Player

**Context:** Mission 4, about to encounter "rule" — the last root concept before the factory shift. Has been using units with pre-configured rules without knowing they're called rules.

**Minute 0:00 — The Root Concept That Was Already There**
Kai's units have been doing things automatically for three missions. His scout patrols. His striker attacks. He never configured these behaviors — they were pre-set. Now Mission 4 begins with a frozen striker. The boot log: `BEHAVIORAL LOGIC: UNLOCKED. YOUR STRIKER HAS NO INSTRUCTIONS. IT CANNOT ACT.` The striker sits motionless on the board, its tile slightly dimmer than usual, a faint amber "?" floating above it.

**Minute 0:15 — The "Oh, THAT'S What That Was" Moment**
Kai's first thought isn't "what's a rule?" It's "wait, the scout was following rules this whole time? I thought it just... did stuff." This is the root concept moment: the realization that *all* unit behavior is constructed from explicit instructions, not innate intelligence. The mental model shift from "units have personalities" to "units are blank slates I program." This is genuinely new and cannot be predicted from context window or hook knowledge.

**Minute 0:30 — The First Rule**
The workbench shows a new panel: "Rules — 0/4 configured." Each slot is a horizontal strip with two halves: left side reads "WHEN..." in amber, right side reads "DO..." in cyan. The boot log walks Kai through: `DRAG A CONDITION TO THE WHEN SIDE. DRAG AN ACTION TO THE DO SIDE.` Available conditions appear as draggable tiles: "ENEMY IN RANGE", "BUFFER CONTAINS THREAT", "ALLY NEARBY". Actions: "MOVE TOWARD", "ATTACK", "HOLD POSITION".

**Minute 1:00 — Extension Terms as Panel Furniture**
Kai drags "ENEMY IN RANGE" to the WHEN side and "ATTACK" to the DO side. His first rule. The "CONDITION" and "ACTION" labels from the token tray are placed almost as afterthoughts — they're just names for the two halves he already used. Tier 2 extensions, absorbed instantly.

**Minute 1:30 — Priority as the Real Lesson**
A second rule slot. Kai adds "BUFFER CONTAINS THREAT" → "MOVE TOWARD". Now the boot log asks: `WHAT IF BOTH RULES MATCH? AN ENEMY IS IN RANGE AND YOUR BUFFER CONTAINS A THREAT. WHICH RULE FIRES?` The word "PRIORITY" appears. Kai places it on the numbered badges (1, 2, 3, 4) beside each rule slot. He drags Rule 2 above Rule 1. The numbers swap. The 400ms reorder animation plays — strips slide smoothly, a quiet *click* as they lock into new positions. This is Tier 2 (ordering parameter of rule collection) but feels important because it's the *strategic core* of rules.

**Minute 2:30 — The Designed Failure**
Kai hits EXECUTE with "MOVE TOWARD" as Priority 1, "ATTACK" as Priority 2. His striker walks toward the threat signal... and walks past the adjacent enemy without attacking. The one-shot-one-kill enemy eliminates his scout the next tick. The sealed watch ends in failure. In the Inspector, the decision trace shows: "Tick 5 — Rule 1 matched (BUFFER CONTAINS THREAT) → MOVE TOWARD. Rule 2 also matched (ENEMY IN RANGE) → not evaluated (lower priority)." Kai sees it. He swaps the priority order. Wins on retry. Priority isn't just a label — it's the game.

**Minute 4:00 — Resolution**
Kai's internal taxonomy, though he doesn't articulate it: context window = "what the unit remembers" (old concept). Hook = "how units talk" (old concept). Rule = "what the unit DOES with what it remembers" (NEW concept — this is the root). Condition, action, priority = "parts of a rule" (duh, of course). The root concept took 2 minutes to land. The three extensions took 30 seconds total.

**UI Annotations:**
- **Rule strip**: 48px tall horizontal strip, left half amber background (WHEN), right half cyan background (DO), drag targets for tiles
- **Priority badges**: 24px numbered circles on left edge of each rule strip, 1 through 4, drag to reorder
- **Reorder animation**: 400ms spring physics, strips slide past each other, numbers swap with crossfade
- **Inspector decision trace**: Indented tree showing "Rule 1 MATCHED → action taken" with dimmed "Rule 2 MATCHED → not evaluated" below

---

## Strengths

**1. Honest Cognitive Budget.** The taxonomy reveals that Robot Uprising's real cognitive burden is 5 root concepts + 23 extensions + 3 bridges — not 30 independent terms. One root per two missions is well within sustainable limits.

**2. Pacing Guidance.** Root concepts need 2-3 minutes of dedicated experiential teaching. Extensions need 15-30 seconds. The time allocation per term should reflect this asymmetry. Mission designers who treat "eviction" with the same ceremony as "hook" waste the player's time.

**3. Predictive Design.** Knowing which terms are extensions lets the designer *rely on player inference*. The boot log for extensions can be briefer. The label-placement puzzle (5.00a-ii) can make extensions faster to place (maybe one-click instead of drag-and-drop). Root concepts get the full Kishōtenketsu treatment; extensions get a quick name-and-go.

**4. Failure Localization.** If playtesters struggle at Mission 4, the taxonomy tells you to check whether the *root concept* (rule) landed — not whether the player knows the word "condition." If the root failed, all extensions built on it will fail too. Fix the root.

---

## Weaknesses

**1. The Taxonomy Assumes Uniform Players.** An 11-year-old Minecraft player might find "hook" genuinely new, while a backend engineer finds it an extension of their existing "webhook" mental model. Player background shifts terms between tiers. The taxonomy describes the *game's* structure, not any individual player's experience.

**2. Bridge Terms Are Slippery.** "Context overload" bridges context window and rules — but is it really a bridge, or just an extension of context window with a rule-like consequence? The boundary between Tier 2 and Tier 3 is fuzzy. Designers may disagree.

**3. Underestimating Extensions.** Some extensions are harder than they look. "Eviction policy" is an extension of context window, but choosing *between* eviction policies (oldest-first vs. least-confident-first) requires understanding confidence metadata — which is itself an extension. Extension chains can stack cognitive load.

**4. The "Actually New" Subjectivity.** Whether "blueprint" is genuinely new (Tier 1) or an extension of "rule" (Tier 2 — "a rule template that spawns units") depends on framing. The taxonomy provides criteria but cannot eliminate designer judgment.

---

## Interaction Effects with Locked Decisions

**Boot Log.** The boot log's text should signal tier. Root concepts get longer, more dramatic narration with the subsystem-online micro-celebration (5.19). Extensions get brief, matter-of-fact naming. Bridge terms get a "connecting two systems you know" framing. The boot log's dramatic cadence IS the tier signal.

**Blueprint Codex.** Codex cards should visually cluster extensions under their root concept. The "Context Window" card opens to reveal sub-cards for slot, observation, noise, eviction, buffer size, confidence, staleness. The hierarchy is visible in the collection.

**Inspector.** The Inspector's decision trace uses all three tiers simultaneously. Root concepts (rules, hooks) form the trace's structural backbone. Extensions (conditions, channels) are the trace's parameters. Bridge terms (context overload) are the trace's failure modes. Understanding the tier system helps players parse traces faster.

**10-Mission Arc.** One root per two missions creates a reliable rhythm: learn root in odd mission, consolidate extensions in even mission, encounter bridge in next odd mission. M1 root, M2 consolidation, M3 root, M4 consolidation+bridge, M5 root, M6-7 root+consolidation, M8-10 bridge/mastery.

---

## Comparable Games

**Factorio.** Factorio's vocabulary follows this exact pattern. "Belt" is a root concept. "Throughput," "side-loading," "underground," "splitter" are all extensions of belt. Players learn "belt" in 5 minutes and absorb the extensions over 50 hours. The extensions never feel like "new concepts" because the root is so solid.

**Slay the Spire.** "Card" is a root concept. "Energy cost," "exhaust," "ethereal," "innate," "retain" are extensions. "Relic" is a separate root. Players who understand "card" absorb "exhaust" (card removed after playing) instantly because it's an obvious parameter of card lifecycle.

**Into the Breach.** "Tile" is root. "Water tile," "chasm tile," "building tile" are extensions. "Push" is root. "Push direction," "push distance" are extensions. The game's famous clarity comes partly from having very few root concepts (move, attack, push, environment) with many visible extensions.

**Baba Is You.** Every word tile is an extension of the root concepts IS, AND, NOT, HAS. The game has ~200 noun/verb tiles but only ~5 structural primitives. Players who understand "X IS Y" can absorb any new noun instantly.

---

## Sensory Design: Tier-Specific Feedback

**Root Concept Introduction:**
- Boot log text: 18px monospace, slower typewriter crawl (40ms per character), dramatic pause before the key sentence
- Board: All units briefly dim to 30% opacity; the relevant UI panel slides up from below the screen edge with a 500ms spring animation and a deep resonant *thoom*
- Audio: Low bass note (C2) sustained for 2 seconds, fading into the subsystem-online chime
- Label token: Larger amber token (36px vs 24px for extensions), slight glow pulse, heavier magnetic pickup sound

**Extension Introduction:**
- Boot log text: 14px monospace, standard crawl speed (25ms per character), inline with ongoing narration
- Board: No dim, no drama — the extension label simply appears in the token tray with a quiet *tick*
- Audio: Single high note (E5), 200ms, no sustain
- Label token: Standard 24px amber token, no glow, lighter pickup sound

**Bridge Term Introduction:**
- Boot log text: 16px monospace, medium crawl, preceded by a line connecting two system names: `CONTEXT WINDOW × HOOK = ...`
- Board: Both related panels briefly highlight with amber outlines simultaneously, 400ms pulse
- Audio: Two notes played together (chord), 400ms — one from each root concept's audio signature
- Label token: 28px token with a hairline split down the middle showing two colors (one from each root system's palette)

---

## The TikTok Clip

Split screen: left shows a new player staring blankly at 6 vocabulary terms listed in a tooltip (the bad version). Right shows the same player encountering Mission 2's "eviction" — they see their buffer tube fill, the oldest entry dissolve, and they nod, drag the label, and are done in 10 seconds. Caption: "6 new words? No. 1 new idea and 5 things you already knew." The right side plays three times faster because extensions are absorbed that much quicker when the root is solid.

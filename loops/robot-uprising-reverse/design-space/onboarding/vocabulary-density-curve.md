# Onboarding: The Vocabulary Density Curve

**Aspect ID:** 5.04b
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00a (vocabulary pacing bottleneck), 5.00 (external-documentation anti-pattern), 5.04 (complexity ramp), 5.04a (Mission 5 Wall), 5.17 (hybrid tutorial architecture), 1.01 (Shenzhen I/O), 1.04 (EXAPUNKS), 1.09 (Slay the Spire), Into the Breach, Baba Is You

---

## The Question

How many new terms per minute is sustainable during Robot Uprising's tutorial missions? The existing vocabulary pacing analysis (5.00a) maps terms to missions. This analysis goes finer-grained: **within a single mission, what is the maximum term introduction rate before the player's working memory collapses?** And how does that rate vary across player archetypes, mission phases (Plan vs. Sealed Watch vs. Inspector), and the nature of the terms themselves?

---

## Cognitive Science Foundations

### Working Memory Capacity

Cowan's (2001) refinement of Miller's classic number sets the working memory limit at **4±1 chunks** simultaneously. Each truly novel game term occupies one chunk. But "novel" is the key qualifier — terms that extend an already-understood concept ("eviction" after already understanding "buffer is full") consume less working memory than terms that introduce a fundamentally new mental model ("hook" as a reactive wiring concept when you've only dealt with passive observations so far).

### The Vocabulary Acquisition Rate from Language Learning

Language acquisition research gives us concrete numbers. Adult learners optimally acquire **7-9 genuinely new words per day** in a sustained study regime, but this assumes distributed practice with 8-12 meaningful encounters per word (Pashler et al., 2007). In a single concentrated session (the equivalent of one Robot Uprising mission), the ceiling drops dramatically: **3-5 genuinely new concepts per 15-minute learning block**, with retention plummeting sharply beyond that.

Critically, "meaningful encounter" doesn't mean "saw the word in a tooltip." It means the learner actively used the concept to solve a problem, experienced the consequences of getting it wrong, and connected it to prior knowledge. Robot Uprising's "hands before head" principle (experience the concept before naming it) naturally generates meaningful encounters — but each encounter takes time. A concept that needs 3 encounters before it sticks requires 3 distinct moments within the mission where it matters.

### Nintendo's Kishōtenketsu: The Four-Step Mechanic Cycle

Nintendo's level design formula — **Introduction (Ki), Development (Shō), Twist (Ten), Conclusion (Ketsu)** — provides a time-tested framework for a single mechanic's life cycle within one level. Critically, each level teaches ONE mechanic through four escalating encounters. Mario 3D World levels run about 5 minutes. That's **one mechanic per 5 minutes**, with four distinct encounters of increasing complexity.

If Robot Uprising missions run 8-15 minutes each (including Plan, Sealed Watch, and Inspector phases), and each mission introduces 3-6 terms, we need to understand which terms can share a Kishōtenketsu cycle (because they form a single conceptual cluster) and which demand their own.

### The "Teach, Test, Twist" Compression

The Level Design Book's three-beat pattern — teach in safety, test under pressure, twist with a complication — suggests a minimum of **3 encounters per concept**. If each encounter takes 30-60 seconds of active engagement, a single concept requires 1.5-3 minutes of dedicated mission time. With a 12-minute mission, that's a hard ceiling of **4-8 concepts** if they're perfectly sequenced with zero dead time.

But missions aren't pure teaching machines — they also need narrative beats (boot log), emotional arcs (Sealed Watch tension), and reflection (Inspector). Teaching time is roughly **60% of total mission time** at most, dropping the ceiling to **2-5 genuinely new concepts per mission**.

---

## The Term Taxonomy: Not All Terms Are Equal

Robot Uprising's ~31 terms fall into three cognitive categories that consume working memory differently:

### Category A: "Label for Something You Already Felt" (Low Cognitive Load)
These terms name an experience the player has already had. The naming moment (see 5.00e) is a recognition event, not a learning event.

**Examples:** "observation" (you already see things in the buffer), "noise" (you already noticed irrelevant stuff), "slot" (you already saw the grid cells in the buffer), "staleness" (you already noticed old data not updating)

**Working memory cost:** ~0.25 chunks (the concept is already chunked; the label attaches to an existing chunk)
**Encounters needed:** 1-2 (one to hear the name, one to use it deliberately)
**Time per term:** 30-60 seconds

### Category B: "New Behavior of a Familiar System" (Medium Cognitive Load)
These terms describe a new capability or constraint within a system the player already understands. The mental model expands but doesn't restructure.

**Examples:** "eviction" (the buffer does something when full — you already know the buffer), "confidence" (observations have quality — you already know observations), "listen/ignore filter" (the buffer accepts/rejects — you already know the buffer), "perception radius" (the unit sees a distance — you already know units see things), "amplify" (a skill that boosts signals — you already know skills and signals)

**Working memory cost:** ~0.5-0.75 chunks (requires connecting new behavior to existing model)
**Encounters needed:** 2-3 (one to observe the behavior, one to use it, one to see it fail)
**Time per term:** 60-120 seconds

### Category C: "Fundamentally New Mental Model" (High Cognitive Load)
These terms require the player to construct an entirely new conceptual framework. They can't be understood by extending existing knowledge — they introduce a new kind of thing.

**Examples:** "hook" (reactive triggers — nothing like passive observations), "channel" (named communication pipes — new architectural concept), "rule" (condition→action logic — first encounter with programming-like behavior), "priority" (ordered evaluation — depends on understanding rules first), "blueprint" (template for unit creation — shifts from configure-one to design-many), "command agent" (meta-level — agent that manages agents), "reassign/reroute" (meta-level operations — changing other agents' configs mid-battle)

**Working memory cost:** 1.0 chunk each (and these can't be parallelized — each demands dedicated attention)
**Encounters needed:** 3-5 (safe introduction, guided use, unguided use, failure case, successful application)
**Time per term:** 2-4 minutes

### The Density Formula

Given these categories, the **sustainable vocabulary density** per mission phase is:

```
Max new terms = (Phase teaching time in minutes) / (Weighted average time per term)

Where weighted time = 0.5min × (Category A count) + 1.5min × (Category B count) + 3min × (Category C count)
```

---

## Five Models for the Density Curve Shape

### Model 1: "The Flat Line" — Constant Rate

**Description:** Introduce terms at a steady rate of ~3 terms per mission, every mission. No mission is harder than any other. The difficulty comes from the combinatorial complexity of applying all terms together, not from the rate of new introductions.

**Shape:** A horizontal line at y=3 terms/mission across all 10 missions.

**Applied to Robot Uprising's locked curriculum:**

| Mission | Locked Terms | Model 1 Budget | Surplus/Deficit |
|---------|-------------|----------------|-----------------|
| M1 | 4 (buffer, slot, observation, noise) | 3 | -1 |
| M2 | 4 (buffer size, confidence, staleness, eviction) | 3 | -1 |
| M3 | 4 (hook, channel, signal, latency) | 3 | -1 |
| M4 | 6 (rule, condition, action, priority, perception, skill) | 3 | **-3** |
| M5 | 5 (blueprint, queue, cost, tagging, filter) | 3 | -2 |
| M6-7 | 5 (command, reassign, reroute, prioritize, EM) | 3×2=6 | +1 |
| M8-10 | 3 (compress, filter, amplify) | 3×3=9 | +6 |

**Verdict:** The locked curriculum is dramatically front-loaded. The Flat Line reveals a 3-term surplus at M4 and a 6-term surplus at M8-10. Either the late-game terms are too few (under-exploring the design space), or the early missions are too dense (cognitive overload).

**Strengths:**
- Predictable player expectation ("each mission teaches me 3 things")
- Easy to calibrate difficulty per mission
- No "cliff" missions

**Weaknesses:**
- Doesn't match the locked curriculum at all
- Ignores that Category C terms need more time than Category A
- The late game feels empty — no new terms to learn, but no replacement engagement model

**Sensory description:** The Flat Line mission feels metronomic. Each mission's boot log announces exactly three new subsystem initializations. The workbench panel expands by exactly one section per mission. The Blueprint Codex grows at a visible, predictable pace — three new card outlines glow to life, always three, mission after mission. The rhythm is reassuring but eventually numbing, like a metronome playing the same tempo for an hour.

### Model 2: "The Front Load" — Heavy Early, Light Late (Current Design)

**Description:** Pack the vocabulary into Missions 1-5, then spend Missions 6-10 on mastery, combination, and meta-level play. The locked curriculum already does this — 23 of 31 terms arrive by Mission 5.

**Shape:** A steep ramp from M1-M4 (averaging 4.5 terms/mission), a spike at M4 (6 terms), a gradual decline through M5-M7, and near-zero at M8-10.

**Applied density per minute (assuming 12-minute missions):**

| Mission | Terms | Category Mix | Effective Minutes Needed | Density (terms/min) |
|---------|-------|-------------|------------------------|---------------------|
| M1 | 4 | 4A | 2 min | 0.33 |
| M2 | 4 | 2A + 2B | 4 min | 0.33 |
| M3 | 4 | 1A + 1B + 2C | 8.5 min | 0.33 |
| M4 | 6 | 0A + 2B + 4C | 15 min | **0.50** |
| M5 | 5 | 1A + 2B + 2C | 9.5 min | 0.42 |
| M6-7 | 5 | 0A + 1B + 4C | 13.5 min (across 2) | 0.21 |
| M8-10 | 3 | 0A + 3B + 0C | 4.5 min (across 3) | 0.04 |

**The Mission 4 crisis revealed:** M4 needs **15 effective teaching minutes** for its 6 terms — but the mission is only 12 minutes long. This is the "vocabulary density wall." The terms per minute rate of 0.50 isn't the problem per se — it's that 4 of the 6 terms are Category C (fundamentally new mental models) that each need 3+ minutes of dedicated engagement. There isn't enough mission time.

**Strengths:**
- Gets vocabulary out of the way early — late game is pure application and mastery
- Late missions can focus on emergent complexity (combos, meta-level play)
- Matches how programming education works (learn syntax first, then practice)

**Weaknesses:**
- Mission 4 is over-budget by 25%+ in teaching time
- New players who stumble at M4 have no recovery — terms pile up
- Late game can feel "vocabulary-dead" — nothing new to name, less sense of progression
- The Category C concentration at M3-M5 creates a sustained high-load zone with no relief

**Comparable:** Shenzhen I/O's approach. The manual dumps all instructions upfront. Players who survive the wall become evangelists; players who don't become the 40% who refund on Steam. Zachtronics accepted this tradeoff. Robot Uprising shouldn't — its audience includes people who've never played a strategy game.

### Model 3: "The Sawtooth" — Introduce, Breathe, Introduce, Breathe

**Description:** Alternate between "vocabulary missions" (2-3 new terms) and "practice missions" (0 new terms, but harder application of known terms). The sawtooth creates a wave of cognitive load: spike → valley → spike → valley.

**Shape:** A zigzag oscillating between 0 and 3, with peaks at odd missions and valleys at even missions.

**Applied to Robot Uprising (hypothetical restructure):**

| Mission | Type | New Terms | Focus |
|---------|------|-----------|-------|
| M1 | Vocab | 4A (buffer, slot, observation, noise) | Learn the buffer |
| M2 | Practice | 0 | Buffer puzzles with harder enemy configs |
| M3 | Vocab | 2B + 2C (hook, channel, signal, latency) | Learn communication |
| M4 | Practice | 0 | Hook/channel puzzles, multi-agent wiring |
| M5 | Vocab | 3C + 1B (rule, condition, action, priority) | Learn decision logic |
| M6 | Practice + Reveal | 2B (perception, skill) | Apply rules with sensing |
| M7 | Vocab | 3B + 2C (blueprint, queue, cost, factory, tagging) | Learn production |
| M8 | Practice | 0 | Factory optimization |
| M9 | Vocab | 3C (command, reassign, reroute) | Learn meta-level |
| M10 | Climax | 0 | Full system, factory vs factory |

**This changes the mission count to 10 but redistributes the curriculum.** M4's 6 terms are split: rules get their own mission (M5) and perception/skill get folded into a practice mission (M6) where they're introduced as tools to solve a rule-based challenge, not as standalone concepts.

**Strengths:**
- Never exceeds 4 terms per vocabulary mission, and most vocabulary missions have 3
- Practice missions let terms consolidate into long-term memory before new ones arrive
- Matches the spaced repetition principle: terms from M3 are practiced in M4, reinforced in M5
- The breathing room prevents the "sustained high-load zone" of Models 1 and 2
- Category C terms never appear alongside more than 1-2 other new terms
- 8-12 meaningful encounters per term are achievable across the vocabulary + practice pair

**Weaknesses:**
- Practice missions risk feeling like filler ("I already know this, why are we drilling?")
- Dev (the Factorio veteran) will blaze through practice missions in 3 minutes and feel patronized
- Requires reordering the locked curriculum (rules before perception)
- Narrative pacing is harder — alternating teaching and drilling creates a start-stop rhythm

**Sensory description:** The sawtooth mission feels like breathing. M3 (vocab) is an inhale — new panels emerge on the workbench, new sounds in the boot log, the Codex glows with new card outlines, the player's eyes dart between unfamiliar UI elements. M4 (practice) is an exhale — the workbench is familiar now, the panels are the same ones from last mission, but the enemies are cleverer. The player settles into their chair, stops reading tooltips, starts experimenting. The boot log is quieter. The Codex cards that were outlines last mission are now filled in with examples from the player's own solutions. By M5, the inhale feels easier because the lungs are stronger.

### Model 4: "The Nintendo Curve" — One New Concept Per Mission, Four Encounters Each

**Description:** Apply Kishōtenketsu strictly. Each mission introduces exactly ONE genuinely new concept (Category C) and 1-2 supporting labels (Category A/B). The concept goes through four escalating encounters within the mission: safe introduction → development → twist → mastery challenge.

**Shape:** A flat line at y=1 Category C term per mission, with 1-2 Category A/B companions. Total terms per mission: 2-3. But requiring 18-20 missions to cover the full vocabulary.

**Applied to Robot Uprising:**

| Mission | Core Concept (C) | Support Terms (A/B) | Kishōtenketsu |
|---------|-----------------|--------------------|----|
| M1 | The buffer exists | slot, observation | Ki: see a buffer. Shō: see it fill. Ten: it overflows. Ketsu: filter it. |
| M2 | Noise vs. signal | noise, staleness, confidence | Ki: see noise. Shō: see it crowd out signal. Ten: staleness decays useful data. Ketsu: curate the buffer. |
| M3 | Reactive wiring | hook, channel | Ki: connect two units. Shō: see a signal travel. Ten: signal arrives too late. Ketsu: wire a faster path. |
| M4 | Signal has latency | latency, signal types | Ki: count ticks. Shō: see a 2-tick delay. Ten: enemy arrives before signal. Ketsu: pre-position relay. |
| M5 | Decision logic | rule, condition, action | Ki: one rule. Shō: two rules, priority. Ten: wrong priority kills a unit. Ketsu: correct order. |
| M6 | Sensing | perception radius, skill | Ki: a unit's vision range. Shō: scout sees far, striker sees near. Ten: scout sees enemy but can't kill. Ketsu: scout→hook→striker chain. |
| M7 | The factory | blueprint, production queue, cost | Ki: base spawns a unit. Shō: queue two blueprints. Ten: run out of resources. Ketsu: optimize production. |
| M8 | Tagging & territory | tagging, listen/ignore filter | Ki: tag a map node. Shō: tagged nodes boost income. Ten: enemy re-tags. Ketsu: tag-and-hold strategy. |
| M9 | The meta-level | command agent, reassign, reroute | Ki: a unit that changes other units. Shō: reroute a hook mid-battle. Ten: rerouted path creates overload. Ketsu: build adaptive architecture. |
| M10 | Emissions & stealth | EM emission, compress, amplify | Ki: hook transmissions make noise. Shō: enemy tracks your signals. Ten: too many hooks = detected. Ketsu: stealth architecture. |
| M11 | — | — | Factory vs. factory climax (no new terms) |

**Strengths:**
- No mission ever exceeds 3 terms
- Every Category C term gets a full Kishōtenketsu cycle — 4 encounters guaranteed
- Vocabulary density never exceeds 0.25 terms/minute
- Matches Mario 3D World's proven approach almost exactly
- Each mission has a clear, nameable identity ("the latency mission," "the factory mission")
- Dev-friendly: because each concept gets a full cycle, the twist encounter provides depth even for veterans

**Weaknesses:**
- Requires 11 missions, not 10 (violates locked spec unless two concepts merge)
- Mission pacing is very controlled — less room for player discovery and emergent learning
- Some concepts that are naturally tangled (rule + condition + action) must be artificially separated or combined
- May feel slow for players who intuit quickly — "I got this in encounter 1, but the mission forces me through 3 more"

**Comparable:** Every great Nintendo game. Super Mario 3D World introduces one mechanic per level. Baba Is You introduces one new word per puzzle cluster. The constraint is: **you finish learning this concept before the game introduces the next one.** The flip side is: some players finish faster than the game expects.

### Model 5: "The Adaptive Curve" — Measure Comprehension, Adjust Density

**Description:** The vocabulary density is not fixed per mission — it adapts based on measured player behavior. The game introduces a concept, observes how the player uses it (correct application speed, error rate, tooltip hover frequency), and either introduces the next term early (player has chunked the concept fast) or delays it (player is still struggling).

**Shape:** Different for every player. A beginner might experience Model 4's slow curve; a veteran might experience Model 2's front-loaded curve. The game doesn't have a fixed density — it has a density range with a comprehension gate.

**Adaptive signals the game can measure:**

| Signal | Indicates |
|--------|-----------|
| Time from concept introduction to first correct use | Speed of initial comprehension |
| Error rate on first 3 applications | Quality of initial comprehension |
| Tooltip hover count on new terms | Uncertainty / need for reference |
| Speed of subsequent uses (2nd, 3rd) | Chunking / automaticity |
| Self-correction (player changes config after seeing result) | Active learning / debugging mindset |
| Time spent in Inspector per debrief | Reflective learning engagement |
| Rule/hook/config diversity across attempts | Exploratory breadth |

**Comprehension gate logic (simplified):**

```
IF (first_correct_use < 45 seconds) AND (error_rate_first_3 < 0.33) AND (tooltip_hovers < 2):
    → Player has chunked this concept. Introduce next term immediately.
ELIF (first_correct_use < 120 seconds) AND (error_rate_first_3 < 0.66):
    → Player is learning normally. Introduce next term at next narrative beat.
ELSE:
    → Player is struggling. Provide additional practice encounter before next term.
    → If tooltip_hovers > 5: surface Codex entry as a hint.
```

**The density ceiling remains:** Even for the fastest player, the game never introduces more than 2 Category C terms per 5-minute window. The gate can accelerate, but it can't push past working memory limits.

**Strengths:**
- No player is bored; no player is overwhelmed
- The "Dev problem" (veteran bored by slow tutorials) and the "Mia problem" (new player overwhelmed by fast ones) are solved by the same system
- Invisible — the player never knows they're being measured (5.01e expert fast-track detection is a visible version of this; the adaptive curve is invisible)
- Works within the locked 10-mission structure — missions contain more content than any one player sees
- Aligns with cognitive adaptive game design research (CASG-F framework)

**Weaknesses:**
- Implementation complexity: every concept needs multiple introduction paths (fast/normal/slow)
- Content multiplication: each mission needs 1.5-2x the content to support all pacing variants
- Testing burden: Playwright tests must validate all pacing paths, not just one
- Community communication: "how does Mission 4 work?" has no single answer, complicating guides
- Risk of false positives: a player who solves a puzzle by luck (not understanding) triggers early advancement
- Risk of false negatives: a player who explores methodically (slow but correct) gets unnecessary remediation

**Comparable:** Duolingo's adaptive difficulty. Each lesson adjusts word introduction rate based on error patterns. But Duolingo can afford mistakes — you can always redo a lesson. Robot Uprising's missions are narrative experiences; repeating them differently is jarring.

**Sensory description:** The adaptive curve is invisible by design. Two players sitting next to each other playing M4 have slightly different experiences. Sofia's boot log prints three subsystem initializations in the first 2 minutes — she's breezing through. Mia's boot log prints two in the first 4 minutes — the third initialization waits for her to successfully apply the second concept before appearing. Neither player knows their pace is different. The workbench panels expand at the player's personal rhythm. The Codex card outlines appear when the game detects the player would benefit from naming what they've been doing, not on a fixed timer. If either player looked at the other's screen, they'd notice the UI is in a slightly different state — "Oh, you already have the priority grip? I don't have that yet" — but the difference feels like progression speed, not content gating.

---

## Cross-Model Comparison Matrix

| Dimension | Model 1 (Flat) | Model 2 (Front Load) | Model 3 (Sawtooth) | Model 4 (Nintendo) | Model 5 (Adaptive) |
|-----------|---------------|---------------------|--------------------|--------------------|-------------------|
| Peak density (terms/min) | 0.25 | **0.50** | 0.33 | 0.25 | 0.15-0.40 |
| M4 cognitive load | High | **Critical** | Moderate | Low | Player-dependent |
| Veteran engagement | Low (late game empty) | Medium | Low (practice missions bore) | Medium-Low | **High** |
| Beginner safety | Medium | **Low** | High | **High** | **High** |
| Implementation cost | Low | Low (current design) | Medium | Medium | **Very High** |
| Narrative coherence | Low | High | Medium | High | Low-Medium |
| Community legibility | High | High | High | High | **Low** |
| Kishōtenketsu compliance | No | No | Partial | **Full** | Partial |
| Locked spec compliance | Partial | **Yes** | No (reorders) | No (adds mission) | Yes (hidden) |

---

## The "Terms Per Minute" Speed Limit

Synthesizing across all models and research, the hard constraints are:

1. **Category C ceiling: 1 new mental model per 3-4 minutes.** This is the load-bearing number. A Category C term needs introduction, practice, failure, and recovery — all within the mission. At a 12-minute mission with ~7 minutes of teaching time, the absolute maximum is **2 Category C terms per mission**, and that's with zero Category A/B introductions alongside them.

2. **Category B ceiling: 1 per 1.5 minutes.** These extend existing models. They can be introduced faster but still need at least one failure encounter.

3. **Category A floor: essentially free.** Labels for experiences the player has already had. Can be introduced in batch (3-4 at once) without overload, as long as each is immediately recognizable.

4. **Total budget per mission: ~5-7 weighted term-minutes.** Where Category A = 0.5 min, B = 1.5 min, C = 3 min. A 12-minute mission with 7 effective teaching minutes can support combinations like:
   - 4A + 0B + 1C = 2.0 + 0 + 3.0 = 5.0 min ✓ (M1 pattern)
   - 2A + 2B + 0C = 1.0 + 3.0 + 0 = 4.0 min ✓
   - 0A + 1B + 2C = 0 + 1.5 + 6.0 = 7.5 min ✗ (over budget)
   - 0A + 2B + 1C = 0 + 3.0 + 3.0 = 6.0 min ✓
   - 0A + 0B + 2C = 0 + 0 + 6.0 = 6.0 min ✓ (tight)

5. **The compound term problem.** When two Category C terms depend on each other (rule + condition, or hook + channel), the working memory cost is super-additive — the player must hold both while learning either. The compound cost of two interdependent C terms is ~5 min, not 6, because they partially chunk together — but they **must be introduced in the same encounter**, not separated. This is why splitting "rule" and "condition" across missions (as Model 4 does) is pedagogically dubious — you can't understand a rule without a condition.

---

## The Recommended Density Envelope

Rather than a single model, the recommendation is a **density envelope** — a minimum and maximum term introduction rate per mission, with the actual rate varying by player archetype.

```
Mission  | Min terms | Max terms | Category C max | Teaching budget
---------|-----------|-----------|----------------|----------------
M1       | 2         | 4         | 0              | 3 min (easy intro)
M2       | 2         | 4         | 1              | 5 min
M3       | 2         | 4         | 2              | 7 min
M4       | 2         | 4         | 2              | 7 min (not 6 terms!)
M5       | 2         | 5         | 2              | 7 min (factory shift)
M6-7     | 1         | 3         | 1-2            | 5-7 min
M8-10    | 0         | 2         | 0-1            | 0-3 min (mastery focus)
```

**The envelope implies:** M4's locked 6-term load must be redistributed. The two most viable redistributions:

**Redistribution A (Push perception + skill to M3):** M3 becomes "sensing and communication" (hook, channel, signal, latency, perception, skill = 6 terms). But wait — that just moves the problem. Unless... perception and skill are recategorized as Category B (they extend existing understanding of units as entities that see and do things). Then M3's budget is 2C (hook, channel) + 2B (perception, skill) + 2A (signal, latency) = 6 + 3 + 1 = 10 min. Over budget.

**Redistribution B (Push perception to M2, skill to M1):** M1 introduces "skill" as part of meeting units — "this unit can patrol, this unit can engage" (Category A — it's just what units do). M2 introduces "perception radius" as part of understanding buffer contents — "this unit sees far, so its buffer fills with distant observations" (Category B — extends buffer understanding). M4 is now: rule, condition, action, priority = 4 terms, all related to decision logic. Budget: 0A + 0B + 4C... wait, that's 12 minutes. Still over.

**Redistribution C (Compound M4 terms):** Treat (rule + condition + action) as one compound Category C concept ("the decision engine") and priority as a separate Category C. Budget: 2C compound = 8 min. Tight but feasible. This requires the mission to introduce the trio simultaneously — "here's a rule: when [condition], do [action]" — as one atomic concept with three labels. The player learns "a rule is a condition→action pair" in one encounter, not three. Then priority gets its own Kishōtenketsu cycle within the same mission.

**Redistribution C is the most elegant.** It respects the locked curriculum order, doesn't require adding or reordering missions, and reduces M4's effective Category C count from 4 to 2 (the decision engine + priority). The remaining M4 terms (perception radius, skill) can be pre-seeded in earlier missions as Category A/B terms.

---

## Player Journeys

#### Journey: Sofia, 15, High School Student (Never Played a Strategy Game)

**Context:** First time playing Robot Uprising. Has played Roblox and Minecraft but nothing with "rules" or "buffers." Starting Mission 1.

**Minute 0:00 — The Buffer Appears**
The screen loads with a single Scout unit on the 8x8 board. On the right side of the Plan screen, a vertical column of empty rectangles — six of them, stacked like a card holder on a board game. The top rectangle has a faint shimmer, like it's waiting for something. The boot log types: `PERCEPTION SYSTEM ONLINE. Incoming data stream detected.`

A small enemy icon appears at the edge of the board. The top rectangle in the column fills with a card: a red diamond icon and the text "ENEMY — E7 — 1 tick ago." The card slides in from the right with a soft *shhk* sound, like slotting a card into a library pocket. Sofia watches. Another card slides in below: "TERRAIN — open ground — current." Then another: "ALLY — none — current."

Sofia hasn't been told any terms yet. She's just watching cards arrive.

**Minute 0:45 — The Name Arrives**
The boot log prints: `Context window initialized. 6 slots available.` The vertical column's label fades in — "CONTEXT WINDOW" — in a font that looks like it was typed on a terminal. The word "slot" appears next to each rectangle's index number (1, 2, 3...). A soft chime, like a single kulintang note ascending.

Sofia thinks: *Oh, these rectangles are slots, and the whole column is the context window. Like... a hand of cards.* She's already understood the concept from watching cards arrive; the labels are just names for what she saw. This took 45 seconds for 3 Category A terms (context window, slot, observation). She doesn't feel like she learned anything — she just got names for things she already recognized.

**Minute 1:30 — Noise Enters**
Three more cards slide in rapidly: "WIND DIRECTION — NW," "TEMPERATURE — 28°C," "AMBIENT LIGHT — low." The context window is now full — all 6 slots occupied. A 7th card tries to arrive but bumps against the bottom of the column with a dull *thunk*. The column flashes amber for a fraction of a second. The oldest card ("ENEMY — E7") dims slightly.

Sofia frowns. "Wait, why is there wind data? The robot doesn't need to know about wind." She hovers over the wind card. A tooltip: "This observation is noise — data that doesn't help the current task." The word "noise" glows amber in the tooltip.

She hasn't been told to remove it. She just wants to. She clicks the wind card. It lifts out of the slot like a library card being pulled. She drops it in a discard zone (a faintly glowing trash area below the column). The slot opens. The waiting card slides in.

**Minute 2:30 — The Learning Check**
Now 4 cards fill 6 slots. Two new noisy cards arrive: "BIRD COUNT — 3" and "GROUND VIBRATION — low." Sofia immediately drags them to discard. She's learned noise filtering through action, not instruction. The boot log prints: `Observation quality: improving. You're learning to focus.`

Total terms introduced by minute 2:30: context window, slot, observation, noise (4 Category A terms). Time per term: ~37 seconds. Well within the 30-60 second budget for Category A. Sofia doesn't feel overloaded because none of these required new mental models — they're all labels for things she could see.

**Minute 3:00-8:00 — The Sealed Watch and Inspector**
The remaining mission time is spent on execution and review. No new terms. Sofia watches her Scout navigate the board, its context window visible as colored pips on the unit tile. In the Inspector, she clicks the Scout and sees the same card column she was editing, but now frozen at each tick. She scrubs back and forth. "Oh, at tick 3 the enemy card was gone because I discarded it, so the Scout didn't know about the enemy anymore."

She hasn't learned "staleness" or "eviction" yet — those are Mission 2. But she's built the mental model (the buffer fills, cards age, removal has consequences) that will make those terms feel like names for things she already understands.

**Minute 8:00 — Resolution**
Boot log: `Mission 1 complete. Context window operational. 4 terms acquired.`
Codex cards materialize: Context Window, Slot, Observation, Noise. Each card has a 2-second clip of Sofia's own gameplay on the back — her drag-to-discard moment, her first card arrival. She taps each one. They feel like souvenirs, not homework.

**UI Annotations:**
- Context window column: right side of Plan screen, 6 stacked rectangles, 220px wide × 40px tall each, terminal-green border, dark interior
- Card arrival: slide-in from right, 0.3s animation, soft paper-slot sound
- Card hover: slight lift (2px shadow), tooltip appears below in 0.5s
- Discard zone: faint amber glow below column, pulsates when a noisy card is hovered
- Full-column flash: 0.1s amber border pulse when 7th card arrives and column is full

---

#### Journey: Dev, 34, Software Engineer (Factorio/Zachtronics Veteran)

**Context:** Has played every Zachtronics game. Immediately recognizes "context window" as a term from LLM engineering. Starting Mission 4, having blazed through M1-3 in ~20 minutes total.

**Minute 0:00 — The Rule Editor Appears**
Dev sees the new panel on the workbench and his eyes light up. Two dropdown menus connected by an arrow glyph. He doesn't read the boot log. He doesn't hover for tooltips. He clicks the left dropdown, scans the condition list, selects "ENEMY_ADJACENT," clicks the right dropdown, selects "ENGAGE." Rule created in 8 seconds.

If the game used Model 5 (Adaptive), it would measure: first_correct_use = 8 seconds, tooltip_hovers = 0, error_rate = 0. The comprehension gate opens immediately. The game doesn't force Dev through the gentle Kishōtenketsu cycle — it advances.

**Minute 0:30 — Rapid Rule Stacking**
Dev adds three rules in 45 seconds, ordering them by intuition: engage > evade > patrol. He hits EXECUTE. The sealed watch runs. His rules work perfectly — the striker engages adjacent enemies, evades when outnumbered, patrols otherwise. The priority order happens to be correct because Dev understands priority queues from his day job.

In the Inspector, he checks the decision trace. "Rule 1 matched at tick 3, rule 2 at tick 7. Clean." He's not learning — he's confirming. His density experience for the "decision engine" compound concept: one 8-second encounter. Category C cost for Dev: 0.2 minutes instead of 3.

**Minute 1:15 — Perception Radius Appears**
Because Dev has demonstrated comprehension of rules (the gate opened), the game introduces perception radius early — it would normally appear later in M4 for most players. On the workbench, each unit now shows a dotted circle around its tile. Dev hovers. "Vision range. Got it." He adjusts a Scout's perception to maximum and a Striker's to minimum. He understands the tradeoff intuitively: see more = bigger buffer fill = more noise.

**Minute 2:00 — The Skill Unlock**
Skills appear as equippable cards on the unit inspector. Dev scans the list: patrol, evade, engage, compress, filter. He reads each description in 3-4 seconds. He equips "compress" on a Relay. "Oh, this is like a middleware layer. It reduces observation fidelity but saves buffer space." He's mapping Robot Uprising's vocabulary to his professional vocabulary in real time.

**Minute 3:00 — Dev's Actual Challenge**
Dev's M4 isn't about learning vocabulary — it's about **applying vocabulary under constraint.** The mission presents a scenario where naive rule priority fails: two enemies approaching from opposite directions, but only one is real (the other is a decoy with a "noise" signature). The "correct" response requires:
1. A rule that checks buffer confidence (from M2) before engaging
2. A hook (from M3) that shares the confidence data with other units
3. A perception radius tuned to detect the decoy at range

Dev has all the vocabulary. He doesn't have the solution. For the first time in M4, he's genuinely challenged — not by new terms, but by the combinatorial depth of terms he already knows.

**Minute 8:00 — Resolution**
Dev completes M4 in 8 minutes (vs. Sofia's projected 15-20 minutes on the same mission). His vocabulary density experience: 6 terms in 3 minutes (0.50 terms/min at the surface, but effectively 0.12 terms/min of genuine learning because 5 of the 6 were Category A for him). His real challenge was the 5 minutes of combinatorial puzzle-solving.

**UI Annotations:**
- Fast-track indicator: subtle gold border on Codex cards that the player acquired faster than average ("mastered" state)
- Comprehension gate transition: no visible change — the game simply makes the next concept available when the player demonstrates readiness. Dev never sees a "loading next concept" screen.
- Combinatorial challenge: when all M4 terms are known, the mission escalates tactical difficulty rather than vocabulary difficulty. Enemies are smarter. Board layout is tighter. The mission adapts its challenge axis.

---

#### Journey: Aisha, 14, First-Time Strategy Gamer (Plays Mobile Games)

**Context:** Downloaded Robot Uprising because a TikTok clip showed a golden reroute cascade. Has played Clash Royale and Candy Crush but nothing with "rules" or "buffers." Starting Mission 4 after a one-week break from Mission 3.

**Minute 0:00 — The Vocabulary Gap**
Aisha hasn't played in 7 days. She opens M4 and sees the Plan screen. The workbench shows her M3 configuration — but she can't remember what channels do. She hovers over a hook connection. The tooltip says "channel: recon-net." She thinks: *What's recon-net? Did I make that?*

The boot log types: `Welcome back, operator. Systems nominal. Last session: 7 days ago. Refreshing context...` A quick recap animation plays: her M3 channel wiring diagram highlights for 3 seconds, with labels pulsing. "HOOK → CHANNEL (recon-net) → RELAY." Aisha nods. "Oh right, the Scout talks to the Relay through a named pipe."

**Minute 0:30 — The Vocabulary Density Question**
M4 introduces the rule editor. For Aisha, this is a Category C concept — she's never programmed anything, never written an IF→THEN statement. The boot log begins: `RULE ENGINE INITIALIZING...`

But Aisha is also still consolidating M3's vocabulary. Her mental model of hooks and channels is fragile. If M4 immediately introduces 6 terms (the locked curriculum), she'll experience compound overload: new terms on top of shaky old terms.

Under Model 5 (Adaptive), the game detects her return-from-break state. The recap animation ran because the system measured a >3 day gap. The game's vocabulary gate is set to **slow mode**: it will introduce the "decision engine" compound concept (rule + condition + action as one unit) and nothing else for the first 5 minutes. Priority, perception radius, and skill will wait until Aisha demonstrates she's chunked the rule concept.

**Minute 1:00 — The Gentlest Introduction**
A single rule slot appears on the workbench. Not three. Not six. One. The boot log: `One decision. One choice. What should this agent do when it sees an enemy?`

The left dropdown is pre-highlighted: "ENEMY NEARBY" (not "ENEMY_ADJACENT" — the game uses natural language for Aisha's first encounter). The right dropdown shows two options: "ENGAGE" and "EVADE." That's it. No "patrol," no "hold," no "compress." Two choices.

Aisha picks "ENGAGE." The arrow turns green. She hits EXECUTE. The sealed watch plays. Enemy approaches. Rule fires. Kill. She exhales.

**Minute 2:30 — Second Rule, Priority Emerges**
A second rule slot appears. The boot log: `What if there's no enemy? What should the agent do then?` Now "PATROL NORTH" is available as an action. Aisha adds it. Two rules exist. The grip handle appears. She drags, discovers priority. The twist: wrong order leads to the striker walking past an enemy. She swaps. Success.

Total time for the "decision engine" compound concept: 2.5 minutes. Three encounters (create rule, add second rule, discover priority through failure). Aisha's pace: slower than Dev's, faster than Model 4's 4-encounter cycle. The adaptive system observed her 8-second rule creation (fast for a beginner) and advanced to the priority encounter without an intermediate step.

**Minute 5:00 — The Gate Opens**
Aisha has successfully applied rules with correct priority across two executions. Tooltip hover count: 3 (acceptable). Error rate: 1/3 (the wrong-priority attempt, which was designed). The comprehension gate opens.

Perception radius appears on the workbench — the dotted circles. The boot log: `SENSING SYSTEM CALIBRATED. Your scout's eyes have a range.` Aisha hovers. The circle expands/contracts with a slider. She gets it in 30 seconds — this is Category B for her, extending her understanding of "the scout sees things."

Skill appears as a Codex card notification, not a workbench element. "New card available: SKILLS — what your agents can do." Aisha taps it in the Codex, reads the 30-word description, and returns to the workbench. No active encounter needed — skill is Category A (it's just the name for things units already do).

**Minute 8:00 — The Practice Zone**
The remaining 4-7 minutes of M4 are pure application. Aisha uses her new rule + perception + skill vocabulary to solve a multi-agent coordination puzzle. No new terms. The density drops to zero. She's breathing.

**Minute 12:00 — Resolution**
Aisha completes M4. Terms acquired: 4 (rule/condition/action as compound + priority + perception + skill). Effective density: 4 terms in 5 teaching minutes = 0.80 terms/min on paper, but weighted by category: 1 compound C + 1C + 1B + 1A = 3 + 3 + 1.5 + 0.5 = 8 weighted minutes. Tight but within budget because the adaptive system spread them out and provided breathing room.

**UI Annotations:**
- Return-from-break recap: 3-second animated highlight of previous mission's key configuration, auto-triggered on >3 day gap
- Slow mode rule editor: shows 1 rule slot initially, expanding to 2-3 as the player demonstrates comprehension. Expansion animation: new slot slides down from above with a soft *clk*.
- Reduced action vocabulary: first encounter shows 2 actions, expanding to full list after 2 successful executions
- Codex notification badge: pulsing amber dot on Codex icon when a new card is available but not yet viewed

---

#### Journey: Marcus, 42, IT Manager (Plays Board Games, Streams on Twitch)

**Context:** Streaming Robot Uprising for the first time. Has 47 viewers. Plays Gloomhaven and Spirit Island weekly. Comfortable with complex systems but wants to narrate the learning experience for his audience.

**Minute 0:00 — The Stream Moment**
Marcus is on Mission 3. He's about to learn hooks and channels. His chat has been typing "HOOKS HOOKS HOOKS" because a preview video showed the hook mechanic.

The boot log types: `REACTIVE TRIGGER SYSTEM ONLINE.` Marcus reads it aloud: "Reactive trigger system. Okay chat, this is hooks. This is the thing."

A new panel appears on the workbench — a small rectangle attached to the Scout's blueprint. Two empty hook slots with dashed outlines. Marcus: "Two hook slots. So the Scout can have two reactive triggers. Like... event listeners? For my programmer friends — it's addEventListener but for robots."

**Minute 0:45 — The Channel Naming Moment**
Marcus clicks a hook slot. A text field appears: "Channel name:" with a blinking cursor. Marcus types "enemy-spotted." The hook slot fills with a compact card: "WHEN: observation confidence > 0.8 → SEND to enemy-spotted." The channel name appears in a small sidebar panel labeled "ACTIVE CHANNELS" — a read-only list that now shows one entry: "enemy-spotted (1 sender, 0 listeners)."

Marcus: "Zero listeners! Nobody's listening yet. It's like I'm shouting into the void. Chat, I need to wire up a listener." Chat explodes with suggestions.

He clicks the Striker's blueprint. Hook slot 1. He types "enemy-spotted" — and the autocomplete catches it, highlighting it in green. The channel panel updates: "enemy-spotted (1 sender, 1 listener)." A faint dashed line appears on the board preview connecting the Scout's tile to the Striker's tile.

Marcus: "WE HAVE A WIRE. Chat. We have a wire. This is... this is the thing. The Scout sees, the Striker acts. Through a named channel. That's agentic engineering, chat. That's what I do at work, except at work the channels are Slack and the agents are my team."

**Minute 2:00 — Latency as Drama**
EXECUTE. Sealed watch. Tick 1: Scout spots enemy. Hook fires — the Scout's tile flashes green (signal sent). But the Striker doesn't move. Tick 2: Signal arrives at Striker. Striker's tile flashes green (signal received). Now the Striker acts — but the enemy has moved one tile closer. Tick 3: Striker engages. Kill. But it was close.

Marcus: "TWO TICKS. The signal took two ticks to get there. Scout to Striker, two ticks of latency. Chat, this is literally network latency. If I put a Relay in between, it would be... three ticks? Four? Oh no. Oh no, chat, this is TCP/IP."

**Minute 3:00 — The Vocabulary Density Awareness**
Marcus is narrating his learning for the stream. He's consciously tracking the terms: "Okay, so this mission we learned hooks, channels, signals, and latency. That's four new words. Chat, how are you keeping up? Type 1 if you're following, 2 if you're lost."

Chat: 1 1 1 1 2 1 1 2 1 1

Marcus: "Okay, 80% following. Good. The game is doing about one new word per 45 seconds right now. That's... actually pretty sustainable. The trick is, I already understood the concepts from my job. Hooks are event handlers. Channels are message queues. The WORDS are new but the IDEAS aren't."

This is the key insight for vocabulary density design: **the objective terms-per-minute rate is the same for Marcus and Sofia, but the subjective cognitive load is completely different.** Marcus maps every term to a prior professional concept (Category B/A for him). Sofia must build the concepts from scratch (Category C for her). The density curve must account for this asymmetry.

**Minute 8:00 — Resolution**
Marcus completes M3. His stream clip of "Oh no, chat, this is TCP/IP" gets 2.3K views independently. The vocabulary density was 4 terms in 3 teaching minutes — 1.33 terms/min surface rate. For Marcus, the effective cognitive load was approximately 2 Category A + 2 Category B = ~4 minutes. Well within budget. For a viewer who's never programmed, watching Marcus explain the concepts provides a second teaching channel (parasocial learning) that the game itself can't deliver.

**UI Annotations:**
- Channel autocomplete: appears after 2+ characters, highlights exact match in green, partial matches in amber
- Channel panel: read-only sidebar, showing sender/listener count per channel, updates in real-time as hooks are configured
- Signal line on board: dashed colored line (color = channel color, auto-assigned) connecting sender tile to listener tile during sealed watch. Line animates during signal transit (traveling dot from sender to listener, 1 tick per hop).
- Latency visualization: during Inspector, signal lines show tick numbers at each hop. "T1 → T2 → T3" annotated along the line.

---

## Interaction Effects

**With 5.00a (Vocabulary Pacing Bottleneck):** This analysis provides the quantitative framework 5.00a lacks. The "2 Category C terms per mission" ceiling validates 5.00a's identification of Mission 4 as critical. Redistribution C (compound term grouping) is the specific remedy.

**With 5.04a (Mission 5 Wall):** The factory introduction (M5) needs 2C + 2B + 1A = 9 min of teaching time. With a 12-minute mission and 7 teaching minutes, this is over budget by 2 minutes. The factory concepts must be pre-seeded: "cost" as Category A (the player already sees resource numbers) and "tagging" as Category B (territory presence, extending the concept of units occupying space). Then M5's effective load drops to 2C (blueprint, production queue) + 1B (listen/ignore filter) = 7.5 min. Barely feasible.

**With 5.17 (Hybrid Tutorial Architecture):** The Codex materialization ceremony at M5 is a zero-vocabulary-cost event — it names things the player has already learned. But it occurs during a mission that's already at budget. The Codex ceremony should consume narrative time, not teaching time. Place it between M4 and M5 as an interstitial, not within M5's teaching budget.

**With 5.01e (Expert Fast-Track Detection):** The adaptive model (Model 5) subsumes 5.01e. Fast-track detection is just one extreme of the adaptive density curve — the endpoint where all comprehension gates open immediately.

**With 1.01 (Shenzhen I/O):** Shenzhen I/O has no density curve — it's a step function (0 terms in-game, all terms in manual). Robot Uprising explicitly rejects this. The entire density curve analysis is the anti-Shenzhen approach.

**With 6.08 (Accessibility):** Cognitive accessibility (ADHD, dyslexia, processing speed differences) means the density curve must be wider than neurotypical assumptions. Model 5's adaptive system naturally accommodates this, but Models 1-4 need explicit accessibility variants (slower pacing, more practice encounters, shorter missions).

---

## Comparable Games and Their Density Choices

**Super Mario 3D World:** 1 mechanic per 5-minute level. ~0.20 new concepts/min. Four encounters per mechanic. The gold standard for clarity at the cost of vocabulary breadth.

**Baba Is You:** 1 new word per puzzle cluster (5-8 puzzles). ~0.03 new concepts/min of play time. But each word is profoundly high-concept (equivalent to Category C). The slowest density of any comparable game, and the deepest understanding per word.

**Slay the Spire:** ~5 new cards per Act 1 run (first 30 minutes). ~0.17 new concepts/min. But cards are self-documenting (their text explains their effect), so the cognitive load per card is low. The density is high because the terms are shallow.

**Shenzhen I/O:** Infinite density in the manual (30+ pages of instruction set). Zero density in-game. The step function approach. ~40% of players never complete the second puzzle. The manual IS the difficulty curve.

**Into the Breach:** ~0 explicit new terms. The game teaches through board state, not vocabulary. Every concept is visible — attack directions shown as arrows, damage shown as numbers, move range shown as highlights. This is the "zero vocabulary" approach: the game's visual language IS the tutorial. Robot Uprising can't do this because its concepts (hooks, channels, buffer eviction) are invisible by nature.

**Factorio:** ~2-3 new buildings per in-game hour, self-directed. ~0.04 new concepts/min. But the player chooses when to encounter each concept. This is the sandbox approach — density is player-controlled. Robot Uprising's campaign can't fully adopt this, but the sandbox mode (5.03) could.

---

## The TikTok Clip

**The vocabulary density TikTok clip isn't about vocabulary — it's about the moment vocabulary clicks.** The 15-second clip: A split-screen. Left: Sofia's Mission 4, minute 0:30 — one rule slot appears, she drags a condition in, the arrow turns green, she whispers "oh it's like an IF statement." Right: Dev's Mission 4, same moment — six rule slots appear simultaneously, he fills them in 8 seconds flat, his chat types "SPEEDRUN." The same mission. The same vocabulary. Two completely different density experiences. The adaptive system at work, invisible to both players, visible to the audience. Caption: "the game teaches you at YOUR speed."

---

## New Aspects Discovered

- **5.04b-i — Compound term teaching design:** Detailed mechanical design for introducing (rule + condition + action) as one atomic concept — the specific UI presentation, the boot log phrasing, the first encounter scenario. How do you make a 3-term compound feel like 1 concept?
- **5.04b-ii — Return-from-break vocabulary refresh:** Exact design for the recap animation triggered by session gaps >3 days — which terms get refreshed, how much time the refresh consumes, whether the refresh is skippable, interaction with save state
- **5.04b-iii — Vocabulary category reclassification across player archetypes:** The same term is Category C for a non-programmer and Category A for a software engineer. Should the game detect the player's professional background (initial questionnaire? behavioral signals?) to set initial category assignments?
- **5.04b-iv — The "vocabulary dead zone" in Missions 8-10:** Late-game missions introduce only 3 terms total. What replaces vocabulary introduction as the engagement driver? Combinatorial depth? Narrative? Competition? The vocabulary curve shapes the emotional curve of the entire campaign.
- **5.04b-v — Density curve visualization as a meta-game UI element:** Should the player be able to see their own vocabulary acquisition rate in the Codex? A sparkline showing terms-learned-per-mission as a self-awareness tool. Risk: makes the invisible adaptive system visible, potentially breaking the "magic."

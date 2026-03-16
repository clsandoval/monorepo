# 3.05a-i — The ? (Uncertainty) Prefix as First-Class Game Mechanic

## Overview

In the binary toggle model (+/−), a TEST that can't be evaluated because the data doesn't exist defaults to "false." A scout with `TEST signal_age ENEMY_SPOTTED < 3` when there are *zero* enemy signals in its buffer gets the same result — flag = false — as a scout that received an enemy signal 10 ticks ago. The − prefix fires in both cases. The scout evades a ghost.

The tri-state ? prefix breaks this conflation. It says: **"I don't know" is not the same as "no."** This is one of the deepest ideas in programming, database design, distributed systems, and epistemology — and the game can teach it through a single character.

This document explores the ? prefix not as a UI toggle variation (that's in `conditional-prefix-primitive.md` Variation B) but as a **first-class strategic mechanic** — the missions that force the distinction, the player archetypes it serves, the degenerate strategies it enables, and the moment-by-moment gameplay when uncertainty becomes the thing you're managing.

---

## The Mechanical Distinction

### Three States of Knowledge

| State | Flag | Meaning | Prefix That Fires | Color |
|-------|------|---------|-------------------|-------|
| **True** | ✓ | "I tested for X and found it." | + (green) | Bright green |
| **False** | ✗ | "I tested for X and it's not there (or doesn't match)." | − (amber) | Warm amber |
| **Unknown** | ? | "I can't test for X because I have no data to test against." | ? (cyan) | Cool cyan pulse |

### When Does ? Fire?

The flag enters the ? state when a TEST instruction references data that **doesn't exist in the unit's context window**:

```
TEST signal_age ENEMY_SPOTTED < 3
```

- If ENEMY_SPOTTED is in the buffer with age 1 → flag = true → + fires
- If ENEMY_SPOTTED is in the buffer with age 5 → flag = false → − fires
- If ENEMY_SPOTTED is **not in the buffer at all** → flag = unknown → ? fires

This means ? fires in exactly these conditions:
1. **Empty buffer** — unit just spawned, no observations yet
2. **Filtered signal** — context config is set to IGNORE the signal type being tested
3. **Evicted entry** — the entry existed but was evicted due to buffer pressure
4. **Out of perception range** — the unit can't see what the TEST asks about
5. **Channel not subscribed** — the unit doesn't listen to the channel that would carry this data

Each of these is a **distinct strategic situation** that the binary model collapses into "false."

### The Strategic Distinction

Consider a striker with this config:

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest        ← I know where an enemy is → attack
− PATROL cautious_path  ← I know there's no enemy nearby → patrol carefully
? HOLD_POSITION         ← I have no data → stay put and wait for intel
```

Without the ? prefix, a striker with no data patrols into fog. With ?, it holds position until it receives intelligence. The difference between these two behaviors is the difference between a reckless unit and a professional one.

**The deeper teaching:** In real agentic systems, this is the distinction between:
- A chatbot that says "I don't know" vs. one that confidently hallucinates
- A monitoring system that pages "service is down" vs. "we lost contact with the service"
- A self-driving car that brakes (known obstacle) vs. slows (no data from a sensor)

The game teaches this through play, not lecture.

---

## Mission Design That Forces the Distinction

### The Core Teaching Mission: "Fog of War" (Mission 5 or 6)

**Setup:** The board has a large opaque region (4×4 central tiles shrouded in interference static). Enemy spawner is inside the fog. The player's factory is at the corner. Scouts can enter the fog and broadcast what they see — but the fog blocks direct perception for all other units.

**The trap:** Players who completed Missions 1-4 using only +/− have scouts that broadcast and strikers that respond to broadcasts. But when a striker hasn't received ANY scout reports yet (tick 1-3, before scouts reach the fog), the striker's TEST for ENEMY_SPOTTED returns false, not unknown. The − prefix fires. The striker patrols into the fog — blind, alone, and immediately killed.

**The unlock:** The boot log for this mission reads:

```
LOGIC SUBSYSTEM UPDATE: Evaluating condition against empty data set...
WARNING: NULL reference in decision matrix. Cannot distinguish
"tested and absent" from "never tested."
Installing uncertainty evaluation module...
New prefix available: ? (fires when condition cannot be evaluated)
RECOMMENDATION: Distinguish between "no threat detected" and
"no data to detect threats."
```

**The solution:** Replace `− PATROL` with `? HOLD_POSITION` on the striker. Now the striker waits at the factory for scout intel before moving. The − PATROL still fires when the scout reports "all clear" — but only after the scout has actually looked.

**Why this works as game design:** The player's previous working config *breaks* on this mission, and the break is legible. "My striker walked into fog and died" → "Why?" → "It treated 'no data' as 'no enemy'" → "I need a way to say 'wait for data'" → boot log introduces ?. The learning is driven by failure, not instruction.

### The Advanced Teaching Mission: "Sensor Blackout" (Mission 7 or 8)

**Setup:** An enemy Specialist has the ability to jam signals — periodically blanking out all scout broadcasts for 2-3 ticks. The player's relay network goes dark. Every unit's buffer entries from scout broadcasts age past eviction threshold and get purged. Suddenly, all TESTing for ENEMY_SPOTTED returns unknown.

**The lesson:** This mission teaches that ? isn't just a startup state — it's a **recurring condition** that happens when information flow is disrupted. The player must design configs that degrade gracefully under uncertainty:

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
− PATROL aggressive_path      ← confirmed safe → push forward
? RETREAT_TO_RALLY_POINT      ← data blackout → fall back to defensive position
```

The strategic depth: ? behaviors create a **fallback posture**. When information fails, units don't freeze or panic — they execute a player-designed uncertainty protocol. This is exactly how real distributed systems handle network partitions (the CAP theorem, expressed as a game mechanic).

### The Mastery Mission: "The Fog Machine" (Mission 9-10)

**Setup:** The enemy deliberately generates false negatives. An enemy unit emits signals that fill player units' buffers with stale, useless data — the TESTing doesn't return unknown (there IS data in the buffer), it returns *wrong answers*. The player's units confidently take wrong actions.

**The lesson:** The ? prefix protects against missing data, but not against bad data. The player must now combine ? with signal age checks, trust weighting, and filter configs to build units that are skeptical of their own context:

```
TEST signal_age ENEMY_SPOTTED < 2          ← Is my data fresh?
+ TEST signal_source ENEMY_SPOTTED = SCOUT  ← Is it from MY scout?
  + ENGAGE nearest                          ← Fresh data from trusted source → act
  − HOLD_POSITION                           ← Fresh but untrusted → wait
− HOLD_POSITION                              ← Stale data → wait
? RETREAT_TO_RALLY_POINT                     ← No data at all → fall back
```

This is **defense in depth** — multiple layers of validation before acting. The ? prefix was the gateway drug; the mastery is a complete epistemological framework for agent decision-making.

---

## Five Design Variations for the ? Mechanic

### Variation 1: "Clean Tri-State" (Minimal)

The ? prefix fires only when the referenced data type has zero entries in the buffer. Binary test result + null check. No gradations.

**Strengths:** Simplest to understand. "Is there data? No → ?. Is there data? Yes → evaluate normally."
**Weaknesses:** Doesn't distinguish between "data was evicted 1 tick ago" and "data was never received." Both are "no data."

### Variation 2: "Recency-Aware Unknown"

The ? prefix fires when the data doesn't exist OR when it's older than a configurable threshold. The player sets a "trust horizon" per TEST:

```
TEST signal_age ENEMY_SPOTTED < 3 [trust: 5]
```

If the newest ENEMY_SPOTTED entry is older than 5 ticks, the flag goes to ? even if the entry technically exists. "Old data is as good as no data."

**Strengths:** Captures the real-world distinction between "stale cache" and "cache miss." The trust horizon is a tunable dial that creates interesting decisions.
**Weaknesses:** Another parameter to configure. The relationship between the TEST's comparison value and the trust horizon can be confusing ("I'm testing age < 3, but the trust is 5 — what does that mean?").

### Variation 3: "Cascading Unknown"

When one TEST returns ?, all subsequent prefixed instructions in the chain also use the ? flag — the unknown state "infects" downstream logic. This prevents a + TEST after a ? TEST from accidentally acting on the ? state.

```
TEST buffer_has ENEMY_SPOTTED      ← ? (no data)
+ TEST signal_count ENEMY > 2     ← SKIPPED (upstream ?)
  + ENGAGE nearest                ← SKIPPED
? PATROL default_path             ← ? fires (propagated from line 1)
```

**Strengths:** Prevents the subtle bug where a + TEST evaluates against nothing and produces a false positive. Cascade makes ? "contagious" in a way that's safe by default.
**Weaknesses:** Reduces the expressiveness of mixed-state logic. Sometimes the player WANTS to test something else when the first test returns unknown.

### Variation 4: "Explicit Unknown Handler"

Instead of a ? prefix, unknown triggers a dedicated `ON_UNKNOWN` handler — a labeled section like JUMP targets:

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
− PATROL cautious_path

ON_UNKNOWN:
  HOLD_POSITION
  BROADCAST "NEED_INTEL" scout_channel
```

**Strengths:** Cleanly separates the "happy path" (+/−) from the uncertainty handler. The handler can contain multiple instructions without interleaving with the main logic. Resembles try/catch in programming — a transferable pattern.
**Weaknesses:** Adds structural complexity. The handler is physically separated from the instruction it relates to, breaking the linear "TEST → response" reading order. Only one handler per instruction list (or one per TEST? — scoping ambiguity).

### Variation 5: "Progressive Unknown" (Recommended)

Combines Clean Tri-State with campaign-paced depth:

| Phase | ? Behavior | What the Player Learns |
|-------|-----------|----------------------|
| Mission 5-6 | Clean Tri-State (zero entries = ?) | "No data ≠ false data" |
| Mission 7 | Recency-Aware (evicted entries = ?) | "Old data ≈ no data" |
| Mission 8-9 | ? + source verification | "Untrusted data ≈ no data" |
| Mission 10 | Full epistemological framework | "Build systems that know what they don't know" |

Each mission escalates the question "what counts as unknown?" — from simple absence to staleness to untrustworthiness. The ? prefix stays the same character; what triggers it deepens.

---

## Interaction Effects

### ? × Context Config (Eviction Policies)

The ? prefix makes eviction policy strategically critical. If a player sets aggressive eviction (drop entries older than 3 ticks), their units enter the ? state more frequently. Conservative eviction (keep everything) means ? rarely fires but the buffer fills up, risking overload stun.

**The tension:** Aggressive eviction = more uncertainty, less overload risk. Conservative eviction = less uncertainty, more overload risk. The ? prefix makes this tradeoff **legible** — the player can see units cycling between + and ? behavior and understand that eviction policy is the cause.

### ? × Hooks (Signal Architecture)

A unit's ? frequency depends on its hook topology. A striker subscribed to scout broadcasts on a busy channel rarely hits ? — data flows constantly. A striker with no hook subscriptions (relying only on direct perception) hits ? whenever enemies leave perception range.

The ? prefix makes hook wiring decisions **visible in their consequences**. "My striker keeps going to ? and holding position" → "It needs more information" → "Wire it to the scout network."

### ? × EM Emissions

A unit executing a ? handler emits a distinct signal — a low-frequency uncertainty pulse. Enemy units with the right hooks can detect this pulse and identify uncertain units as targets. **Uncertainty is detectable.**

This creates a stealth dimension: a well-informed unit (never hitting ?) is electromagnetically quiet in the uncertainty band. A poorly-wired unit (constantly hitting ?) is broadcasting "I don't know what's going on" to any enemy listening.

### ? × Command Agent

The Command agent can use ? in its own rules to detect subordinate uncertainty:

```
TEST subordinate_state STRIKER-A = UNKNOWN
+ REROUTE RELAY-B → STRIKER-A_channel     ← striker is uncertain → send it data
+ PRIORITIZE SCOUT intelligence_channel    ← boost intelligence gathering
```

This is **organizational sensing** — the Command agent detects when its troops are uncertain and responds by improving information flow. It's a miniature incident response system: "this unit is in the dark" → "fix its information supply chain."

### ? × Inspector (Debugging)

In the Inspector timeline, ? ticks are rendered with a **dashed cyan border** on the unit's context window chart — visually distinct from the solid green (+ ticks) and solid amber (− ticks). A run with many cyan dashes tells the player "this unit spent a lot of time uncertain."

The Inspector can filter to "show only ? ticks" — revealing exactly when and why a unit lacked data. This turns the ? prefix into a **diagnostic tool**: the pattern of uncertainty across the timeline reveals information architecture failures.

### ? × Sealed Watch (Spectator Drama)

During the sealed watch, ? moments are **visually dramatic**. A unit entering ? state shows:
- The prefix slot on its rule overlay pulses cyan
- The unit's body language shifts — a scout in ? state rotates its sensor dish back and forth searching; a striker in ? state crouches behind cover
- A quiet two-note descending chime plays (the "I don't know" sound)
- If multiple units enter ? simultaneously (a blackout), the chimes layer into a dissonant chord — the sound of collective confusion

When a ? unit receives data and transitions to + or −, the resolution is palpable — the cyan dissolves into green or amber, the unit's posture snaps to decisive, and a rising note resolves the tension.

---

## Comparable Games and Systems

### SQL NULL Semantics

The ? prefix is exactly SQL's three-valued logic. In SQL, `NULL` is not false — it's unknown. `WHERE age > 5` excludes rows where age is NULL, but `WHERE NOT (age > 5)` ALSO excludes them. This trips up every junior developer. Robot Uprising teaches the same lesson at age 14, through play.

The game's advantage over SQL: the consequence of confusing NULL and false is a dead unit on the battlefield, not a missing row in a query result. The feedback is visceral, immediate, and memorable.

### Rust's Option<T>

Rust forces programmers to handle the "no value" case explicitly through `Option<T>` — you can't accidentally treat `None` as a value. The ? prefix does the same thing at the game mechanic level: you can't accidentally treat "no data" as "false data" once the ? prefix exists. The prefix IS the Option wrapper, expressed as a single character.

### Kubernetes Probe States

Kubernetes health probes have three states: Success, Failure, and Unknown. A pod in Unknown state is treated differently from a Failed pod — Unknown gets retried, Failed gets restarted. The ? prefix teaches this exact pattern: unknown triggers cautious behavior (hold, wait, fall back), while false triggers decisive behavior (patrol, evade).

### The Fog of War in RTS Games

Traditional RTS fog of war is binary: you can see a location or you can't. The ? prefix creates a richer model: you can see, you can't see, OR you could once see but your information is stale. StarCraft 2 partially addresses this with "last known position" markers, but Robot Uprising makes the distinction mechanically actionable — your units BEHAVE differently under these three conditions.

### Into the Breach's Perfect Information

Into the Breach famously eliminates uncertainty — you see enemy intentions, you know exactly what will happen. Robot Uprising's ? prefix is the opposite design choice: uncertainty is a **managed resource**, not an eliminated variable. Both approaches produce strategic depth, but through opposite mechanisms.

---

## Player Journeys

### Journey: Mika, 14, First Strategy Game (Minecraft Builder Background)

**Context:** Mission 5. Mika has completed Missions 1-4 using only +/− prefixes. Her scout-striker pair works: scout spots enemies, broadcasts, striker engages. She's feeling confident.

**Minute 0:00 — The Briefing**
The mission briefing shows an 8×8 board with a 4×4 grey static region in the center. "INTERFERENCE ZONE — perception blocked." Mika's factory is at H1 (bottom-right). Enemy spawner is hidden inside the fog at D4 or D5. She can see her own spawn area and the board edges, but the center is blank. The boot log begins:

```
LOGIC SUBSYSTEM UPDATE...
WARNING: NULL reference in decision matrix...
New prefix available: ?
```

Mika reads "?" and sees the cyan question mark appear in the prefix toggle cycle. She clicks the prefix slot on a test rule: dot → plus → minus → question mark → dot. The question mark feels different — it pulses slowly, like it's breathing. The "hmm?" chime on the toggle is quieter than the "tik/tok" of + and −.

She ignores the ? for now. "I'll just use what worked before."

**Minute 1:00 — The Plan**
Mika sets up her tried-and-true config: Scout with `TEST buffer_has ENEMY → + BROADCAST threat_channel`, Striker with `TEST buffer_has ENEMY → + ENGAGE nearest → − PATROL default_path`. She queues Scout first, Striker second. She hits EXECUTE.

**Minute 1:30 — Sealed Watch: The Death**
Tick 1: Scout and Striker spawn at H1. Scout starts moving toward the fog. Striker... immediately patrols toward the fog too. Mika's stomach drops — the Striker is heading into the blind zone.

Tick 3: Scout enters the fog at E4. The scout's perception illuminates a small radius — enemy at D5! The scout broadcasts. But the broadcast takes 2 ticks to reach the relay, then 1 more to the striker.

Tick 4: The striker is already at F3, inside the fog. An enemy striker was adjacent at E3. One-shot kill. The striker's tile flashes red. Dead.

Tick 6: The scout's broadcast finally reaches the relay... but there's no striker to receive it.

Mika watches the rest of the battle — her lone scout, dodging and broadcasting into an empty network. The sealed watch ends. She feels frustrated but curious.

**Minute 3:00 — The Inspector**
Mika clicks on her dead striker's timeline. At Tick 1, she sees: `TEST buffer_has ENEMY_SPOTTED → flag: FALSE → − PATROL`. The context window panel shows: zero entries. The striker had NO data about enemies — it had just spawned. But − PATROL fired as if the striker knew there were no enemies.

She sees the cyan "?" indicator next to the TEST result: "Condition could not be evaluated (no ENEMY_SPOTTED entries in context window)." A small tooltip says: "This TEST returned FALSE because there was no data — consider using the ? prefix to handle missing data differently."

**Minute 4:00 — The Fix**
Mika goes back to the Plan screen. She clicks on her Striker blueprint. She clicks the prefix slot on the `PATROL` rule — dot → plus → minus → **question mark**. The cyan pulse. She sets:

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
− PATROL cautious_path
? HOLD_POSITION
```

She re-executes. This time: Tick 1, the striker spawns and... holds. It stays at the factory. The cyan ? is visible on its tile — a tiny pulsing question mark over its head. The scout enters the fog, broadcasts. Tick 5: the signal arrives at the striker. The ? dissolves into +. The striker moves decisively toward the reported enemy position, arriving with intelligence instead of blindness.

The striker engages at Tick 8 and wins. Mika pumps her fist.

**Minute 6:00 — The Aha**
In the Inspector, she clicks through both runs. The first run's timeline is green-green-RED (engage without data → death). The second run is cyan-cyan-cyan-green-GREEN (wait → wait → wait → data arrives → decisive action). The cyan ticks aren't wasted time — they're the striker gathering intelligence. The ? prefix turned "doing nothing" into "waiting for information."

**UI Annotations:**
- **? prefix toggle:** Cyan pulsing question mark in 12×12 pixel slot, slow 2-second breathing animation
- **? unit indicator:** Small pulsing cyan ? above unit tile during sealed watch, 50% opacity
- **Inspector ? ticks:** Dashed cyan borders on context window chart, distinct from solid green/amber
- **Tooltip on ? TEST result:** "Condition could not be evaluated (no [SIGNAL_TYPE] entries in context window)"
- **? → + transition animation:** Cyan dissolves outward like mist clearing, green + crystallizes at center, 200ms, ascending resolution chime

---

### Journey: Raj, 35, Go Engineer (Distributed Systems Background)

**Context:** Mission 7. Raj recognized the prefix system as ARM-style predication from Mission 3. He immediately saw the ? prefix at Mission 5 as Option<T>/NULL handling and used it effectively. Now Mission 7 introduces enemy jamming — periodic signal blackouts.

**Minute 0:00 — Pre-Battle Config**
Raj has a sophisticated relay network: 2 scouts, 1 relay, 2 strikers, 1 specialist. His configs use ? extensively — every unit has a ? fallback behavior. He's proud of the architecture. The boot log for Mission 7 mentions:

```
SIGNAL INTEGRITY ALERT: Hostile electromagnetic interference detected.
Periodic signal blackouts expected. Duration: 2-3 ticks.
Context window entries may be evicted during blackout.
Your uncertainty handlers will be tested.
```

Raj smirks. "I already handle ?. This should be fine."

**Minute 2:00 — First Blackout**
The battle starts normally. Scouts broadcast, relay forwards, strikers engage. Then at Tick 12, the screen shudders — a brief static overlay, a low rumble sound. All channel lines on the board go dark for 2 ticks. Raj's units' context window bars shift — the green slots for recent broadcasts age rapidly and get evicted. By Tick 14, most units are in ? state. His strikers hold position (? HOLD). His scouts, still perceiving directly, continue scouting. The relay has nothing to relay.

Tick 15: Blackout ends. The relay re-establishes connections. Scouts broadcast fresh data. ? states resolve. Strikers resume. Raj's army recovers cleanly.

But while his strikers were holding (3 ticks), an enemy striker advanced 3 tiles. It's now adjacent to his relay.

**Minute 3:30 — The Realization**
The relay dies at Tick 16. One-shot kill. Raj's network splits — scouts can broadcast but the signal doesn't reach strikers without the relay. The strikers go back to ? state. Permanently this time.

Raj watches the rest of the battle — his strikers holding position forever, his scouts broadcasting into a void, the enemy methodically destroying everything.

**Minute 5:00 — Inspector Analysis**
Raj pulls up the timeline. He sees the problem clearly: his ? HOLD_POSITION was the right response to temporary blackout, but it was wrong for permanent relay loss. His strikers needed to distinguish between "blackout — wait it out" and "relay dead — switch to direct perception mode."

He notices something in the context window chart: during the blackout, entries evict over 2-3 ticks (gradual aging). When the relay dies, entries evict AND no new entries arrive (the buffer goes completely empty within 5 ticks). The *pattern* of ? is different — brief ? bursts for blackouts, sustained ? for relay death.

**Minute 7:00 — The Redesign**
Raj builds a two-tier uncertainty handler:

```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest
− PATROL aggressive_path

# Brief uncertainty → hold and wait
? TEST tick_since_last_signal < 5
  + HOLD_POSITION                   ← recent signal loss → wait for recovery

# Prolonged uncertainty → switch to autonomous mode
  − PATROL cautious_path            ← no signals for 5+ ticks → go autonomous
  − BROADCAST "RELAY_DOWN" emergency_channel  ← alert the network
```

This is **graceful degradation** — the distributed systems pattern Raj uses at work every day. His strikers now recover from temporary blackouts by waiting, and recover from permanent relay loss by switching to autonomous operation. The ? prefix enabled both modes.

**Minute 9:00 — The Second Run**
The blackout happens at Tick 12 again. Strikers hold. Blackout ends at Tick 14. Relay survives this time because Raj repositioned it defensively. But later, at Tick 22, the enemy specifically targets the relay. It dies. Strikers enter ? state. After 5 ticks of ? (the grace period), they switch to autonomous patrol. They're less effective without coordinated intelligence — but they're alive and fighting, not frozen.

Raj wins at Tick 45. In the Inspector, the timeline shows: green-green-green-cyan-cyan-green-green (blackout recovery) ... green-green-cyan-cyan-cyan-cyan-cyan-amber (relay death → autonomous mode). The transition from cyan to amber is visible as the moment his units "gave up waiting and started thinking for themselves."

**UI Annotations:**
- **Signal blackout visual:** Board-wide static overlay (CRT interference pattern), all channel dashed lines fade to 20% opacity, ambient sound drops to muffled bass
- **? state cascade:** Multiple units flipping to ? simultaneously — their cyan pulses sync briefly before drifting out of phase (like fireflies)
- **Context window eviction during blackout:** Entries visually shrink and fade, each slot dims from bright to dim to empty over 2 ticks
- **tick_since_last_signal counter:** Visible in Inspector as a small numeric counter next to the ? flag — "?3" means "uncertain for 3 ticks"

---

### Journey: Abuela Carmen, 67, Retired Nurse (Zero Gaming Background, Playing With Grandson)

**Context:** Mission 5. Carmen is playing on her grandson Tomás's iPad while he coaches from the couch. She completed Missions 1-4 slowly but successfully. She understands + as "green means go" and − as "orange means the other thing." Tomás has been translating game concepts into medical metaphors: buffer = patient chart, context window = how many things you can track at once.

**Minute 0:00 — The Boot Log**
The boot log text scrolls. Carmen reads aloud: "New prefix available... question mark... fires when condition cannot be evaluated." She looks at Tomás. "What does that mean?"

Tomás thinks. "It's like... when you check a patient's blood pressure and the cuff reads zero. Not low blood pressure — the cuff isn't connected. The machine can't take the reading."

Carmen nods. "So it's not 'the blood pressure is fine' or 'the blood pressure is bad' — it's 'I couldn't take the blood pressure at all.'"

"Exactly."

**Minute 1:30 — First Attempt**
Carmen sets up her units the way she has been — scouts patrol, strikers follow broadcasts. No ? prefix. She hits EXECUTE. The striker walks into the fog and dies, just like Mika's.

"Ay," Carmen says. "He went in blind."

**Minute 3:00 — The Medical Metaphor**
Tomás points at the dead striker's Inspector panel. "Look — the test said 'no enemies' but it didn't actually check. It's like writing 'blood pressure: normal' on a chart without taking the reading."

Carmen's eyes widen. She's seen this exact error in 40 years of nursing. Charting "no complaints" when the patient wasn't assessed. The consequence there was missed diagnoses. The consequence here was a dead robot.

**Minute 4:00 — The Fix**
Carmen clicks the prefix slot on her striker's patrol rule. Dot, plus, minus... question mark. The cyan pulse. She drags it to the patrol line. "This one means 'I don't have data'?"

Tomás: "Yeah. You're telling the striker: when you don't have data, do THIS instead of assuming everything's fine."

Carmen sets ? HOLD_POSITION. "He should wait until he has information. Like waiting for lab results before prescribing."

**Minute 5:00 — The Win**
She re-executes. The striker holds at the factory, the cyan ? visible on its tile. Scout enters fog, broadcasts. Data arrives. Striker moves purposefully. Engagement. Victory.

Carmen puts down the iPad. "That question mark should exist in real hospitals. When a nurse doesn't have a reading, the system shouldn't fill in 'normal' — it should say 'not assessed.' Different protocols."

Tomás opens his laptop and starts googling "null handling in electronic medical records." Carmen has accidentally discovered a real-world software engineering insight through a game she barely understands.

**Minute 7:00 — The Codex Entry**
Carmen opens the Blueprint Codex to see the ? prefix card. It shows the cycling animation (dot → + → − → ? → dot), a brief explanation ("The ? prefix fires when the condition has no data to evaluate"), and an example. In the corner, a small icon she hasn't noticed before: a folded page with the text "The machine can't take the reading" — Tomás's metaphor, which the game couldn't possibly know. Carmen looks at Tomás. He shrugs. She opens the example and reads through it, matching each line to her nursing mental model.

The game hasn't taught Carmen about null handling. It's taught her something she already knew — and shown her that the concept she's known for decades has a precise name and a 67-year engineering history.

**UI Annotations:**
- **iPad touch targets:** Prefix toggle is 44×44pt touch target (minimum iOS accessibility), not the 12×12 pixel desktop version
- **? pulse animation on tablet:** Slower 3-second pulse for legibility at arm's length, brighter cyan (#00D4FF) against the dark board background
- **Codex entry for ?:** Full-width card with animated prefix cycling, three example configs (simple/medium/complex), and a "Why does this matter?" section that draws the real-world parallel without being preachy
- **Coaching mode (Tomás present):** Not a game feature — but the game's visual clarity makes side-seat coaching possible without a dedicated "co-op explanation" mode

---

### Journey: DevOps Dave, 41, SRE at a Fintech Startup

**Context:** Mission 8. Dave has been playing Robot Uprising specifically because his colleague said "it's Kubernetes but fun." He's been mapping every mechanic to his day job. The ? prefix immediately registered as "probe Unknown state" from Kubernetes health checks. He's now facing a mission where enemy units can corrupt scout broadcasts — inserting false data into channels.

**Minute 0:00 — The Architecture Review**
Dave's config is sophisticated. His scouts have source-verification hooks — they sign broadcasts with a unit ID. His relay has a filter that drops unsigned signals. His strikers verify signal freshness. But the mission briefing says: "Enemy Specialist can forge unit IDs."

Dave stares at the screen. "Oh. Supply chain attack."

His current trust model — "trust signals signed by my units" — is compromised. A forged signal passes all his verification checks. His strikers will act on enemy-injected data with full confidence.

**Minute 2:00 — The Failed First Run**
Dave runs the battle. Everything looks normal until Tick 15 when an enemy Specialist forges a SCOUT-A broadcast: "ENEMY_SPOTTED at A1" — the opposite corner from the actual enemy position. Dave's relay dutifully forwards it (passes signature check). His striker turns and marches toward A1. The real enemy striker, at H8, walks into Dave's undefended base.

In the Inspector, Dave sees the corrupted signal: normal green color (it passed all checks), normal age, but the content was fabricated. There's a subtle red hairline border around the signal entry — the Inspector's corruption indicator, visible only in post-battle analysis.

**Minute 4:00 — The Defensive Architecture**
Dave redesigns. He can't trust content. He can't trust signatures. What CAN he trust?

Direct perception. A scout that SEES an enemy generates a verified observation — it can't be forged because it comes from the unit's own sensors. The ? prefix becomes his trust boundary:

```
# STRIKER CONFIG:
TEST buffer_has ENEMY_SPOTTED [source: direct_perception]
+ ENGAGE nearest                          ← I saw it myself → attack

TEST buffer_has ENEMY_SPOTTED [source: broadcast]
+ TEST signal_count ENEMY_SPOTTED >= 2    ← Multiple sources agree?
  + ENGAGE nearest                        ← Corroborated → act
  − HOLD_POSITION                         ← Single source → wait for confirmation

? PATROL cautious_path                    ← No data at all → standard patrol
```

The ? prefix here isn't just handling missing data — it's the **baseline behavior** for a unit that trusts nothing by default. The + prefix only fires when the unit has *verified* information. The entire architecture shifts from "trust unless suspicious" to "suspect unless verified."

Dave realizes he's just implemented zero-trust architecture in a game about robots. He takes a screenshot and posts it to his work Slack with the caption "this game just taught our junior devs zero-trust better than my 2-hour training."

**UI Annotations:**
- **Corruption indicator in Inspector:** Hairline red border (1px) around corrupted signal entries, visible on hover; full corruption analysis panel shows forged fields and the enemy Specialist responsible
- **Source filter in TEST:** `[source: direct_perception]` and `[source: broadcast]` as optional TEST modifiers, visually rendered as small source-icon tags (eye icon for perception, antenna icon for broadcast)
- **Trust architecture visualization:** Inspector can overlay a "trust graph" showing which data flows are verified (green line), unverified (amber dashed), and corrupted (red, post-battle only)
- **Zero-trust config template:** After Mission 8, the Blueprint Codex adds a "Verified Observer" template implementing the direct-perception-first pattern

---

## Degenerate Strategies and Counterplay

### The "?" Turtle

A player who sets ? HOLD_POSITION on everything creates units that never move until they have perfect information. This is safe but glacially slow — scouts must explore every tile before anything else acts.

**Counterplay by game design:** Timed missions. Enemy spawner produces units on a clock. If the player's army is sitting at the factory waiting for information, enemies accumulate and overwhelm. The ? prefix rewards caution, not paralysis.

### The "?" Spam

A player who puts ? handlers on every rule, even when the data is always available (e.g., a relay testing its own buffer, which is never empty while it's alive), wastes rule slots on handlers that never fire.

**Counterplay by game design:** Limited rule slots. A ? handler that never fires is a wasted slot — one fewer rule for actual behavior. The Inspector's execution overlay shows these as grey (never executed) rules, nudging the player to remove dead ? handlers.

### The "?" Exploit: Intentional Ignorance

A player configures a unit to IGNORE a signal type in context config, then uses the ? prefix on rules testing that signal type. The ? fires every tick — the unit deliberately keeps itself ignorant so it always executes the ? fallback behavior.

This is technically a degenerate strategy, but it's also... kinda smart? The player is using the interaction between context config and the ? prefix to create a unit that permanently runs in "uncertainty mode." Whether this is a bug or a feature depends on what the ? fallback does. If it's HOLD_POSITION, it's a waste. If it's a sophisticated autonomous behavior, the player has created a unit that acts independently of the intelligence network.

**Design decision:** Allow this. It's a valid architectural pattern — "disconnected autonomous agent." The game should recognize it, not prevent it. The Inspector should label it: "Unit STRIKER-B is permanently uncertain about ENEMY_SPOTTED (IGNORE filter active for this signal type)."

---

## The ? Prefix as Sound Design

The ? state has a distinct audio vocabulary:

| Event | Sound | Description |
|-------|-------|-------------|
| Entering ? state | Two-note descending chime (F → D♭) | "I don't know" — melancholic, not alarming |
| Sustained ? (3+ ticks) | Slow low-frequency hum, like a held breath | Tension building — this unit is in limbo |
| ? → + resolution | Rising two-note chime (D♭ → F → A♭) | Relief — data arrived, uncertainty resolved |
| ? → − resolution | Level two-note chime (D♭ → D♭) | Neutral — data arrived, it was negative, but at least we know |
| Mass ? event (3+ units simultaneously) | Descending chimes layer into dissonant cluster | Alarm — the network is failing |
| Mass ? resolution | Ascending chimes resolve into consonant chord | Relief — the network recovered |

The key design principle: the ? sound is **tense but not alarming**. Uncertainty is uncomfortable, not catastrophic. The player should feel the urge to resolve it, not panic.

---

## The TikTok Clip

**"The Fog Walk"** (15 seconds):

Second 0-3: Split screen. Left: striker with only +/− config. Right: striker with ? config. Same mission, same fog zone.

Second 3-7: Left striker immediately patrols into fog. Right striker holds position, cyan ? pulsing.

Second 7-10: Left striker dies in fog (red flash). Right striker receives scout data (? dissolves to +, resolution chime).

Second 10-13: Right striker moves purposefully to the reported enemy position and eliminates it.

Second 13-15: Text overlay: "? — because 'I don't know' ≠ 'no'" with the cyan question mark pulsing.

The visual contrast between the reckless death and the patient kill is immediately compelling. The viewer learns the mechanic in 15 seconds.

---

## New Aspects Discovered

1. **3.05a-i-a — The trust horizon as tunable parameter:** Detailed design of the configurable threshold (how many ticks of data absence before ? fires); UI for setting trust horizons per TEST instruction; interaction with eviction policy and buffer size; the "trust dial" as a per-signal-type slider in the context config panel.

2. **3.05a-i-b — Cascading ? through hook chains:** When a relay receives ? state from a scout (scout's broadcast contains "? — no enemy data"), should the relay propagate the uncertainty or drop it? "Uncertainty propagation" as a hook payload design decision; the ? prefix as a signal TYPE (not just a flag state) that flows through the network.

3. **3.05a-i-c — The ? prefix in Command agent meta-rules:** Command agents monitoring subordinate ? frequency as an organizational health metric; "uncertainty budget" — Command reassigns resources when a subordinate exceeds N ? ticks per window; interaction with 3.17 command agent workbench paradigms.

4. **3.05a-i-d — Enemy exploitation of ? behavior:** Enemy AI specifically targeting units in ? state (detected via EM uncertainty pulse); enemy strategy of forcing ? through signal jamming then attacking frozen units; "? hunting" as an enemy archetype; counterplay through ? behaviors that are unpredictable (randomized ? patrol vs. deterministic ? hold).

5. **3.05a-i-e — The ? prefix as accessibility affordance:** For players with cognitive load limitations, the ? prefix provides a safe default ("when confused, hold") that prevents catastrophic decisions from missing information; the ? prefix as an implicit difficulty adjustment — more ? handlers = safer but slower gameplay; interaction with 6.01a-vi accessibility modes.

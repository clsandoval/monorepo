# 5.00e — The Naming Moment as Designed Beat

## Overview

There is a precise instant in learning when a concept has been experienced but not yet named. The player has dragged noise out of a buffer three times. They understand that the buffer can be full, that fullness causes problems, and that removing things fixes it. They have the CONCEPT. They do not yet have the WORD.

This is the "tip of the tongue" moment — the cognitive state where the learner is reaching for a label that doesn't exist yet. Naming the concept too early ("This is called CONTEXT OVERLOAD" before the player has experienced it) creates a label attached to nothing — a word without meaning. Naming it too late (the player has been internally calling it "that overflowing thing" for 20 minutes) creates an interruption — the player already has their own mental label and the game's label feels like a correction.

The naming moment is a designed beat. Like a joke's punchline, the timing determines whether it lands.

---

## The Cognitive Science of Naming

### The Construction-First Principle

Constructivist learning theory (Piaget, Papert) establishes that understanding is built through experience, not delivered through definition. The learner constructs a mental model through interaction. The label — the name — is metadata applied AFTER the model exists. "Context window" means nothing to a player who hasn't watched a buffer fill up and cause a stun. After that experience, "context window" crystallizes the model into a communicable concept.

### The Naming Window

For any concept, there is a window of optimal naming:

- **Too early (before experience):** "Your units have context windows that can overload." The player nods and forgets. The word "context window" is stored in short-term memory with no experiential anchor. It evaporates within 30 seconds. Research on pre-teaching vocabulary (Nation, 2001) shows that words taught before relevant experience are retained at 15-20% after one week.

- **The sweet spot (during or immediately after experience):** The player watches their scout's buffer fill up. The scout freezes. Sparks fly. The player thinks "oh no, it's... full? broken? what happened?" The boot log types: "CONTEXT OVERLOAD DETECTED." The word arrives at the moment of maximum receptivity. Retention after one week: 65-80%.

- **Too late (well after experience):** The player has experienced 5 overloads, has internally labeled it "the freeze thing" or "buffer full problem," and has developed workarounds. The boot log names it "context overload" in Mission 4. The player's internal label is already consolidated. The game's label must now COMPETE with the player's own. Naming feels like a correction: "Actually, it's called context overload." Mildly annoying. Retention is high (the concept is understood) but the game's label may not stick — the player keeps calling it "the freeze thing."

### The Tip-of-the-Tongue State

The ideal naming moment occurs when the player is actively reaching for a label. They want to describe what just happened — to themselves, to a friend, to chat — and they don't have the right word. This is the "tip of the tongue" state (Brown & McNeill, 1966). The brain is primed for label acquisition. A name delivered in this state has the highest emotional impact: relief ("THAT'S what it's called!"), recognition ("that perfectly describes what happened"), and ownership ("now I know the real name").

The design challenge: this state is internal and invisible. The game cannot directly observe whether the player is reaching for a label. It must use PROXIES — behavioral signals that correlate with the tip-of-the-tongue state.

---

## Six Approaches to Naming Moment Timing

### Approach A: "The Fixed Schedule" (Name After N Encounters)

Each concept has a fixed encounter count before naming. "Context overload" is named on the player's 3rd overload event. "Compress" is named the 2nd time the relay compresses. The count is tracked globally and the naming event fires deterministically.

**Strengths:** Predictable. Testable. Easy to tune. Every player gets the name at the same experiential depth.
**Weaknesses:** Players learn at different speeds. A fast learner understands overload on first encounter and waits impatiently for the name. A slow learner hasn't fully processed 3 overloads and the name arrives too early. One-size-fits-all timing is suboptimal for both extremes.

### Approach B: "The Probe Gate" (Name After Demonstrated Understanding)

Before naming, the game presents a micro-interaction that tests whether the player understands the concept. Example: After the player's first context overload, the boot log says "WARNING: Unit SCOUT-A experienced [???]. Diagnosis pending." The [???] is a small interaction point — the player can click it, which opens a multiple-choice prompt: "What happened? (A) The unit was damaged. (B) The unit's memory was full. (C) The unit lost its connection." On correct answer: "DIAGNOSIS CONFIRMED: CONTEXT OVERLOAD." The name arrives as the player's own conclusion, confirmed by the system.

**Strengths:** Names are earned, not delivered. The micro-interaction creates a "prediction → confirmation" loop that deepens encoding. The player feels smart. Works at all learning speeds — the gate opens when the individual player is ready.
**Weaknesses:** Multiple-choice interactions interrupt flow. Players who just want to play may find them patronizing. The interaction must be minimal (< 5 seconds) and skippable after first playthrough. Also, the correct answer may be guessable without understanding (process of elimination).

### Approach C: "The Contextual Label" (Name During Relevant Interaction)

Names appear as labels on UI elements only when the player is interacting with the relevant system. "Context window" doesn't appear in a tutorial prompt or boot log — it appears as a label on the buffer bar when the player first hovers over it in Inspector. "Compress" appears as a skill name when the player first opens the relay's skill panel. Names are embedded in the interface, revealed through exploration.

**Strengths:** Zero interruption. Names arrive at the moment of maximum relevance — when the player is actively looking at the thing being named. Follows the "tools, not tutorials" philosophy.
**Weaknesses:** Players who don't hover or explore may miss names entirely. A player who never inspects the buffer bar in the Inspector never sees "context window" as a label. This creates a vocabulary gap that compounds over time — later boot log entries reference "context overload" and the player doesn't know what "context" means because they never hovered.

### Approach D: "The Dramatic Reveal" (Name as Narrative Beat)

Names are delivered as narrative events in the boot log. The AI protagonist discovers and names concepts as part of its self-initialization story. "ANALYSIS COMPLETE. The observation buffer has a fixed capacity. When capacity is exceeded, the unit enters a compromised state. Designating: CONTEXT OVERLOAD." The naming is a story beat — the AI learning to describe itself.

**Strengths:** Naming becomes memorable. The dramatic framing ("Designating: CONTEXT OVERLOAD") gives the name emotional weight. It mirrors the player's own learning journey — the AI and the player are discovering the same concepts simultaneously.
**Weaknesses:** The boot log is a fixed-pace narrative. It cannot adapt to the player's individual learning speed. If the player understood overload 3 minutes ago, the dramatic reveal feels slow. If the player hasn't fully processed it, the reveal feels premature. Also, the boot log competes for attention with the gameplay itself.

### Approach E: "The Social Trigger" (Name When Player Tries to Communicate)

This speculative approach detects when the player attempts to communicate about a concept — naming a blueprint, naming a channel, writing a custom label — and offers the game's vocabulary at that moment. If the player names a channel "alert" or "warning" or "help" when they are clearly trying to create an alarm system, the boot log could say: "Channel 'alert' registered. NOTE: In standard operational vocabulary, reactive trigger broadcasts are called HOOKS." The naming moment is triggered by the player's own attempt to label.

**Strengths:** Perfectly timed. The player is literally reaching for a word, and the game offers one. Maximum tip-of-the-tongue alignment.
**Weaknesses:** Technically complex — the game must parse player-created names and match against concept categories. "alert" → hooks is obvious; "oh-no-channel" → hooks is harder. False positives (naming something unrelated triggers a vocabulary lesson) would be annoying. Also, some players never name things descriptively — they use "channel_1" or "asdf."

### Approach F: "The Layered Naming" (Recommended)

A three-stage naming process for each concept:

**Stage 1 — The Ghost Label (Immediately After First Experience):**
When the player first experiences a concept, a faint label appears briefly in the relevant UI area. After first context overload, the words "context overload" appear in 30% opacity grey text near the stunned unit's buffer bar for 2 seconds, then fade. The player may or may not notice. If they do, it plants a subconscious seed. If they don't, no interruption occurred.

**Stage 2 — The Dramatic Name (After 2-3 Encounters OR Probe Gate):**
The boot log delivers the formal naming in the AI self-initialization narrative. "DESIGNATING: CONTEXT OVERLOAD. When a unit's context window is full and new entries arrive, the unit enters a compromised state for 1 tick." The dramatic framing gives weight. The timing is either fixed (3rd encounter) or gated (after a correct probe response, whichever comes first). This ensures the name arrives within the naming window for most players.

**Stage 3 — The Reinforcement (Ongoing):**
After naming, the term appears consistently in all UI labels, boot log entries, Inspector annotations, and tooltip text. The game never uses a synonym after naming. "Context overload" is always "context overload" — never "buffer full" or "memory exceeded." Consistent reinforcement cements the vocabulary.

The Ghost Label is the key innovation. It catches fast learners (who notice it immediately and have the name from first encounter) without interrupting slow learners (who don't notice and get the full dramatic naming later). It converts the naming moment from a single event to a graduated process.

---

## Player Journeys

#### Journey: Mika, 14, First-Timer (Manila)

**Context:** Mission 2. Mika has just experienced her first context overload. Her scout's buffer bar was full (all 6 pips bright), a new observation arrived, and the scout froze — sparking, jittering, unable to act for 1 tick. An enemy striker was adjacent. The scout was eliminated.

**Second 0 — The Experience**
Mika watches the scout freeze. "What? Why did it stop?!" She sees the sparking animation, the buffer bar's red pulse. She knows something went wrong with the bar — it was full, then the scout broke. She has the concept. She does not have the word.

**Second 3 — The Ghost Label**
Near the eliminated scout's position, faint grey text appears: "context overload." 30% opacity. 2 seconds. Mika's eyes are on the enemy striker advancing toward her relay. She does not consciously register the ghost label. But her peripheral vision caught something — a flicker of text near where the scout died. Subconscious seed planted.

**Second 15 — The Emotional Processing**
The sealed watch continues. Mika is thinking about the dead scout. "Its bar was full. When the bar is full, bad things happen. I need to keep the bar not-full." She is constructing the mental model. She might call it "bar overflow" or "memory full" internally. She is reaching for a label.

**Minute 2:00 — Mission Ends**
Mika's relay survives. Mission 2 complete. The boot log for the debrief types:

```
POST-ACTION REPORT
> Unit SCOUT-A: eliminated at tick 14.
> Cause: CONTEXT OVERLOAD.
> Context window was at 6/6 capacity. Incoming observation
  exceeded capacity. Unit entered compromised state for 1 tick.
> During compromised tick, adjacent ENEMY_STRIKER engaged.
> CONTEXT OVERLOAD: when a unit's context window is full and
  new entries arrive, the unit cannot act for 1 tick.
> Recommendation: configure context filters to prevent
  window saturation.
```

Mika reads "CONTEXT OVERLOAD" and feels a click. "THAT'S what happened." The ghost label she half-saw earlier now has a name and a definition. The boot log's explanation confirms her constructed mental model. She understands context overload not because the game told her what it is, but because she EXPERIENCED it, THEORIZED about it, and then received CONFIRMATION.

**Minute 3:00 — The Reinforcement**
In Inspector, hovering over the scout's buffer bar at tick 14 shows a tooltip: "Context Overload — tick 14. Window at 6/6. Incoming: enemy_observation. Resolution: stun (1 tick)." The same term, same spelling, same capitalization. In the workbench, the context config panel shows "Overload Protection: None" with a warning icon. The vocabulary is consistent from this moment forward.

**UI Annotations:**
- Ghost label: 30% opacity grey text, positioned 8px above the relevant UI element, 2s fade-in/fade-out, font-size 11px
- Boot log naming: "CONTEXT OVERLOAD" in amber highlight, first occurrence in all-caps, subsequent in title case
- Inspector tooltip: term in bold, consistent formatting
- Workbench label: term used in panel headers and dropdown labels

---

#### Journey: Derek, 31, Factorio Veteran (Portland)

**Context:** Mission 2. Derek has played 2,000 hours of Factorio. He understood context overload on his first scout death in Mission 1. He has been internally calling it "buffer overflow" — his programming background gives him an instant mental model.

**Second 0 — The Experience (Mission 1)**
Derek's scout overloads. He immediately thinks: "Buffer overflow. Classic. I need to manage input bandwidth or add eviction policies." He has the concept AND his own label after one encounter.

**Second 3 — The Ghost Label (Mission 1)**
Ghost text: "context overload." Derek notices it. "Oh, they call it 'context overload.' That's the game's term. Fine." He mentally files: "buffer overflow = context overload in this game." The ghost label did its job for a fast learner — it named the concept at first encounter.

**Minute 5:00 — The Boot Log (Mission 2)**
The boot log delivers the formal naming. Derek reads it and thinks: "Yeah, I already know this." But he notices a detail: "the unit cannot act for 1 tick." He had assumed overload caused data loss (like a real buffer overflow), not a temporal stun. The boot log's explanation adds mechanical precision to his existing mental model. The naming moment, while redundant as a label delivery, serves as a SPECIFICATION delivery.

**Minute 6:00 — The Vocabulary Shift**
Derek starts using "context overload" instead of "buffer overflow" in his internal monologue. The game's label is more precise — it describes the CONSEQUENCE (compromised state) rather than the cause (excess data). He appreciates the terminology. When he later streams Mission 5, he uses "context overload" naturally, teaching his chat the game's vocabulary.

**UI Annotations:**
- Ghost label timing for fast learners: immediately useful, provides game-specific terminology
- Boot log for fast learners: specification delivery (mechanical details) rather than label delivery
- Vocabulary adoption: player-created labels gradually replaced by game labels through consistent usage

---

#### Journey: Abuela Rosa, 62, Retired Teacher (Quezon City)

**Context:** Mission 3. Rosa is a slow, careful player. She has experienced context overload twice but is not sure she understands it. She has been calling it "when the little colored squares get too many."

**Minute 0:00 — The Ghost Labels (Missions 1-2)**
Rosa did not notice either ghost label. Her attention during overload events was on the scout's position and the enemy's approach, not on the buffer bar area. The ghost labels faded unseen. This is fine — the ghost labels are designed to catch fast learners, not universal.

**Minute 2:00 — The Probe Gate (Mission 3)**
After her third overload event, the boot log types:

```
ALERT: Unit SCOUT-B status compromised.
Suspected cause: [?]
> Tap to diagnose.
```

Rosa taps the [?]. A three-option prompt appears:
(A) The unit was attacked by an enemy.
(B) The unit's memory filled up and it froze.
(C) The unit lost its signal connection.

Rosa thinks. The scout wasn't attacked — the enemy was 3 tiles away when the scout froze. The scout was still on the board, so no connection loss. But the colored squares were all bright just before the freeze...

She selects (B). The boot log responds:

```
DIAGNOSIS CONFIRMED.
DESIGNATING: CONTEXT OVERLOAD.
> When a unit's context window reaches capacity and
  new entries arrive, the unit enters a compromised state.
> Duration: 1 tick.
> The unit cannot act during this tick.
> CONTEXT OVERLOAD is preventable.
```

"Context overload!" Rosa repeats it aloud. The probe gate gave her a moment to articulate her understanding, and the confirmation arrived with the label. She feels accomplished — she diagnosed the problem correctly. The label is now attached to a positive emotional memory (correct diagnosis) rather than a negative one (scout death).

**Minute 3:30 — The Metaphor**
Rosa opens the context config panel. She sees "Context Window: 6 slots" and "Overload Protection: None." She thinks: "It's like a classroom with 6 desks. If 7 students arrive, no one can sit down and the whole class is disrupted. I need to control who enters the classroom — that's the filter." The naming moment has activated her teaching metaphor framework. "Context overload" maps perfectly to "overcrowded classroom." She will use this metaphor when explaining the game to her grandson.

**UI Annotations:**
- Probe gate: [?] button in boot log, amber pulsing, tap to expand diagnostic prompt
- Diagnostic prompt: 3 options, correct answer reveals naming, wrong answer provides hint and repeats
- Confirmation: "DIAGNOSIS CONFIRMED" in green, then naming in amber, celebratory micro-chime (400Hz, 150ms)
- Probe gate frequency: max 1 per mission, only for Category C concepts (new mental models)

---

## Strengths

1. **The three-stage system (Ghost → Dramatic → Reinforcement) adapts to all learning speeds.** Fast learners get the name from the ghost label at first encounter. Medium learners get it from the boot log dramatic naming at encounter 2-3. Slow learners get it from the probe gate. No player is left behind and no player is bored.

2. **Ghost labels are nearly costless.** At 30% opacity for 2 seconds, they are visible only to players actively looking at the relevant area. They cause zero interruption for players who aren't ready. This is the design equivalent of writing the answer on the whiteboard in very faint pencil — only students who are looking will see it.

3. **The probe gate turns naming into accomplishment.** The player diagnoses the concept before receiving the label. The name arrives as confirmation of their own understanding, not as instruction. This follows the constructivist principle: understanding first, label second.

4. **Consistent reinforcement after naming cements vocabulary.** The game never uses synonyms after the formal naming. Every UI element, every tooltip, every boot log entry uses the exact same term. This is the Montessori "three-period lesson" principle: introduce, practice, test — with zero ambiguity in terminology.

## Weaknesses

1. **The probe gate risks feeling like a quiz.** Some players dislike being tested, even gently. The prompt must feel like a diagnostic aid, not a pop quiz. The wording should be "Suspected cause: [?] Tap to diagnose" rather than "What just happened? (A) (B) (C)." Framing matters.

2. **Ghost labels may cause confusion if partially read.** A player who catches "...overload" from the ghost label but misses "context" may partially internalize the wrong term ("overload" without "context"). This is low-risk but worth noting — the full term should be repeated in the dramatic naming stage.

3. **30 terms across 10 missions = 3 naming moments per mission.** Even with the three-stage system, missions with dense vocabulary (Mission 4 = 6 terms per vocabulary pacing analysis in 5.00a) have multiple naming events. The probe gate is limited to 1 per mission to prevent quiz fatigue, but ghost labels and dramatic namings can stack.

4. **The system cannot detect the actual tip-of-the-tongue state.** It uses proxies (encounter count, probe response) that approximate but don't measure cognitive readiness. Some players will receive names too early or too late despite the system's best efforts. The three-stage redundancy mitigates this but doesn't eliminate it.

---

## Interaction Effects

- **Vocabulary Pacing Bottleneck (5.00a):** The naming moment system directly addresses the Mission 4 "six-term wall." With ghost labels, 4 of the 6 terms may already be passively acquired by fast learners, reducing the effective naming load. The probe gate targets only the 1-2 most important Category C concepts per mission.

- **Boot Log Narrative (5.02):** The dramatic naming stage IS the boot log narrative. The AI protagonist's self-initialization ("DESIGNATING: CONTEXT OVERLOAD") is both story and teaching simultaneously. Naming moments are not interruptions of the narrative — they are the narrative's primary function.

- **Physical Term Placement (5.00a-ii):** If the game uses the "Experiential Stamp" mechanic (dragging term labels from boot log to workbench headers), the naming moment is the moment the label becomes draggable. The ghost label is a preview; the dramatic naming generates the draggable token; the physical placement cements it.

- **Blueprint Codex:** After a concept is formally named, its Codex card transitions from a silhouette to a full card. The naming moment triggers the card reveal animation — another sensory reinforcement.

- **Vocabulary Density Curve (5.04b):** Ghost labels count as 0 vocabulary units (passive, non-interruptive). Probe gates count as 0.5 units (brief, confirmatory). Dramatic namings count as 1 unit. This means the EFFECTIVE vocabulary density per minute can be managed independently of the NOMINAL density, because ghost labels front-load naming for fast learners without consuming density budget.

- **Field Manual (5.00d):** The field manual may reference concepts by name before the player has been formally named them. A page found in Mission 2 discussing "context overload" when the player hasn't yet received the dramatic naming creates a curiosity gap — "What is context overload? I haven't been told that yet." This is a FEATURE: the manual rewards re-reading after naming, creating a second layer of understanding.

---

## Comparable Games

- **Portal:** GLaDOS never names the portal mechanic. "Context-sensitive observation lozenge" is a joke, not a teaching moment. The player learns portals through USE, not naming. Portal's approach is pure Approach C (contextual labels on UI elements). It works because portals are visually self-evident. Robot Uprising's concepts are more abstract (context windows, hooks, eviction) and benefit from explicit naming.

- **Baba Is You:** Concept naming IS the mechanic. Every rule is a named sentence: "BABA IS YOU," "WALL IS STOP." Naming happens at the moment of rule construction — simultaneously with experience. This is the ultimate naming-moment design, but it only works because the game's vocabulary IS its gameplay surface. Robot Uprising has a separate vocabulary layer.

- **The Witness:** Concepts are never named. The player discovers line-drawing rules through experiential iteration. The absence of naming creates a unique "shared language emerges in the community" phenomenon — players invent their own terms for puzzle types ("tetrominos," "stars," "symmetry"). This is powerful for community building but frustrating for players seeking clear communication. Robot Uprising needs standardized vocabulary for its competitive and educational goals.

- **Slay the Spire:** Keywords (Vulnerable, Weak, Strength, Dexterity) are named on first card encounter with a tooltip definition. This is Approach A (fixed schedule, N=1). It works because keywords are independent — understanding Vulnerable doesn't require prior understanding of Weak. Robot Uprising's concepts are interdependent (context windows → overload → eviction → filtering), requiring sequenced naming.

- **Montessori Method:** The three-period lesson is directly analogous. Period 1: "This is context overload" (ghost label). Period 2: "Show me context overload" (probe gate). Period 3: "What is this?" (reinforcement in UI/Inspector). Montessori times the periods based on observed child readiness — the teacher watches for signs of understanding. The probe gate is the game's attempt to observe readiness programmatically.

- **Language Acquisition Research:** Krashen's Input Hypothesis (i+1) suggests learners acquire language when exposed to input slightly above their current level. The ghost label is i+1 — a name the player almost-but-not-quite understands, creating a productive gap that the dramatic naming later fills.

---

## Sensory Description

**The Ghost Label.** Thirty percent opacity. The font is the game's standard sans-serif, 11px, grey on whatever background the game surface provides. It appears 8 pixels above the relevant UI element — above the buffer bar for "context overload," above the skill slot for "compress," above the channel wire for "hook." It fades in over 500ms, holds for 1 second, fades out over 500ms. Total duration: 2 seconds. No sound. No animation beyond the fade. It is barely there — a whisper in the visual field. A player focused on the game's action will not see it. A player looking at the relevant area will catch it peripherally. A player actively searching for labels will read it clearly.

**The Probe Gate.** The [?] in the boot log is amber, 14px, pulsing with a gentle 1.5-second breathing animation (opacity 70%→100%→70%). Tapping it expands the boot log entry downward, revealing three options in a clean list. Each option has a small icon: (A) crossed swords, (B) grid with overflow arrow, (C) broken link. The correct answer, when selected, triggers a brief 200ms green flash on the text and a confirmation chime — a two-note ascending tone (400Hz→600Hz, 100ms each). The confirmed label appears in amber text, slightly larger (16px) than the surrounding boot log text, and holds for 3 seconds before returning to normal size.

**The Dramatic Naming.** The boot log types "DESIGNATING:" in standard teal monospace. Then the concept name appears in amber, letter by letter, 50ms per character. "C-O-N-T-E-X-T O-V-E-R-L-O-A-D." Each letter arrival plays a tiny percussive click — like typewriter keys. The full name, once typed, glows amber for 1 second, then settles to standard teal. The overall effect is a machine printing a label for the first time — the AI naming something it has just learned to identify. The typing cadence gives the name weight and ceremony, as if the word itself is being manufactured.

**The TikTok clip:** Split screen. Left: a scout's buffer bar filling up, 6 pips glowing bright, the scout freezing with sparks. A ghost label barely visible: "context overload." Right: the boot log typing "DESIGNATING: CONTEXT OVERLOAD" letter by letter, each click audible. The timing synced so the ghost label appears on the left as the typing completes on the right. Text overlay: "The game named what I was already thinking." The emotional hook: the game and the player arrive at understanding simultaneously.

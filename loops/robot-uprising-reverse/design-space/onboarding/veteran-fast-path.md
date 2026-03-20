# Onboarding: The Veteran Fast-Path — Compressed Experience Without Lost Mechanics

**Aspect ID:** 5.00c
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.01e (expert-track), 5.00 (external-documentation anti-pattern), 5.00a-iii (extension vs. new concepts), 5.04b (vocabulary density curve), 5.02 (tutorial as narrative), 5.17 (hybrid tutorial architecture), 1.06 (Gladiabots), 1.04 (EXAPUNKS)

---

## The Problem

A Factorio veteran with 2000 hours does not need 3 minutes to understand "context window." A backend engineer doesn't need the "hooks are reactive triggers" epiphany because they wrote webhook handlers yesterday. A Gladiabots player already thinks in behavior trees. These players need to skip the *experiential foundation* (Layer 1 of the teaching architecture from 5.00) without missing the *mechanical specifics* (Robot Uprising's particular implementation of these concepts).

The danger of a fast-path is twofold:
1. **Skip too much** → the veteran misses Robot Uprising-specific details (e.g., "hooks have EM emissions" or "context overload stuns for exactly 1 tick") and hits walls in Mission 6+ that stem from foundational misunderstandings
2. **Skip too little** → the veteran feels patronized, bored, and quits before the game gets interesting

The design challenge: compress the experiential layer without deleting the mechanical details that make Robot Uprising's implementation unique.

---

## Detection: How Does the Game Know You're a Veteran?

### Option 1: "The Gatekeeper" — Self-Declared Difficulty

At the campaign map's first load, before Mission 1 begins, a screen appears:

```
┌─────────────────────────────────────────────┐
│         INITIALIZE OPERATING PARAMETERS      │
│                                              │
│  ○  STANDARD INITIALIZATION                 │
│     Full boot sequence. Every system         │
│     explained. Recommended for first          │
│     contact with autonomous systems.          │
│                                              │
│  ○  ACCELERATED BOOT                         │
│     Compressed tutorials. You'll see each     │
│     system once, then move on. For players    │
│     familiar with programming games or        │
│     system design.                            │
│                                              │
│  ○  DIRECT UPLOAD                            │
│     Minimal narration. All systems unlocked   │
│     from Mission 1. Technical documentation   │
│     available in the Codex. For veterans of   │
│     Gladiabots, Screeps, Shenzhen I/O, or     │
│     similar.                                  │
│                                              │
│  You can change this at any time from the     │
│  campaign map settings.                       │
└─────────────────────────────────────────────┘
```

The diegetic framing: you're configuring your own boot parameters. The three options map to three onboarding tracks.

**Strength:** Honest, transparent, player-controlled. No guessing.
**Weakness:** Dunning-Kruger risk — players overestimate their readiness and select DIRECT UPLOAD, then flounder. The "you can change this at any time" escape valve is critical.

### Option 2: "The Profiler" — Behavioral Detection

No explicit selection. Mission 1 runs normally. But the game tracks:
- **Time-to-first-action**: If the player configures their first context window in under 15 seconds (vs. the 90-second average), they're flagged as fast-learner
- **Boot log skip rate**: If the player skips (clicks through) 80%+ of boot log text, they're not reading
- **Error rate**: If the player makes zero errors in Mission 1's filter puzzle, they already understand
- **Config complexity**: If the player's first config uses non-obvious patterns (e.g., setting eviction to "least confident" instead of default "oldest"), they have prior knowledge

After Mission 1, if the profiler detects veteran signals, a boot log message appears: `OPERATOR COMPETENCE ASSESSMENT: ABOVE BASELINE. ACCELERATING SYSTEM INITIALIZATION. OVERRIDE? [Standard pace / Continue accelerated]`

**Strength:** Adapts to actual behavior, not self-assessment. No false pride.
**Weakness:** Requires Mission 1 to run at standard pace regardless. The veteran still sits through 12 minutes of tutorial before the game adapts. Also, fast-clicking doesn't always mean comprehension — some players are impatient but confused.

### Option 3: "The Handshake" — Vocabulary Probe (RECOMMENDED)

A hybrid. Before Mission 1, a brief interactive probe disguised as a system check:

```
> RUNNING COMPATIBILITY ASSESSMENT...
>
> MATCH THE TERM TO ITS CLOSEST MEANING:
>
>   context window    →  [?] [?] [?]
>   hook              →  [?] [?] [?]
>   eviction          →  [?] [?] [?]
>
>   (drag definitions to slots, or press SKIP to begin standard boot)
```

Three terms, three definitions (plus two distractors), drag to match. Takes 30 seconds. If the player matches all three correctly, the game offers ACCELERATED BOOT. If they match two, it offers a per-system granularity: "Standard boot for hooks, accelerated for everything else." If they match zero or press SKIP, standard boot.

**Strength:** Tests actual knowledge, not self-assessment. Takes 30 seconds. Feels like a diegetic system calibration.
**Weakness:** Players who know the concepts but not Robot Uprising's specific terminology (e.g., they know "webhook" but not "hook") might fail the probe and get standard boot anyway. Mitigation: accept synonym matches ("reactive trigger" matches "hook").

---

## Three Acceleration Tracks

### Track A: Standard (Full Boot)

Everything as designed in the 10-mission arc. Every boot log plays fully. Every concept gets the Kishōtenketsu cycle. Average time: 8-15 minutes per mission.

### Track B: Accelerated Boot (The Compressed Experience)

Each mission's tutorial is compressed but not eliminated. The key changes:

**Boot log compression:** Instead of the full narrative crawl, the boot log runs at 3x speed with key sentences highlighted. The player can click any highlighted sentence to pause and read the full explanation. Unhighlighted text scrolls past in a blur — visible but not required.

**Tutorial puzzle compression:** The "filter puzzle" in Mission 1 still exists, but the initial configuration is already 70% complete. Instead of dragging 4 noise entries out of a full buffer, the player drags 1 remaining entry. They still DO the action — but once, not four times.

**Designed failure compression:** Instead of an unexpected failure followed by retry, the game shows a 3-second "ghost replay" of what WOULD have failed, then asks: "What would you fix?" The player makes the fix and proceeds. They see the failure without sitting through the full sealed watch.

**Extension terms are bundled:** Instead of introducing "eviction" and "buffer size" and "confidence" as three separate moments, all three are presented on a single reference card: "Context Window Extensions: eviction (what gets removed when full), buffer size (how much fits), confidence (how reliable each entry is)." One card, 10 seconds, three extensions.

**Root concepts still get dedicated attention:** Even in accelerated mode, each root concept (context window, hook, rule, blueprint, command) gets its own experiential moment — just compressed. The veteran still *uses* each system before naming it, just with fewer repetitions.

Average time: 3-6 minutes per mission for tutorial missions (M1-4), normal time for M5+ (which introduce genuinely complex strategic decisions that can't be compressed).

### Track C: Direct Upload (The Technical Reference)

Missions 1-4 are collapsed into a single "System Overview" mission lasting 5-8 minutes. All units are available from Mission 1. The boot log is replaced with a terse technical brief:

```
> ALL SUBSYSTEMS: ONLINE
>
> UNITS: 5 types (Scout/Striker/Relay/Specialist/Command)
> PRIMITIVES: Skills (capabilities), Rules (condition→action),
>   Hooks (reactive triggers on named channels),
>   Context Config (buffer management)
> CONSTRAINTS: Fixed-size context windows. Overload = 1-tick stun.
>   Signal latency = 1 tick/hop. EM emission from hooks.
>
> MISSION 1: CONFIGURE AND DEPLOY.
> [Open Codex for full reference →]
```

The player is dropped into a Mission 5-equivalent scenario (factory, production queue, full primitives) with all systems unlocked. The Blueprint Codex is fully populated from the start — no locked silhouettes. The tutorial missions (M1-4) are available as optional "Archive" missions from the campaign map, labeled "TRAINING ARCHIVE — Recommended for system-specific practice."

**Critical safeguard:** Even in Direct Upload, two things are NOT skippable:
1. **Context overload** must be experienced at least once. A scripted overload event in the System Overview mission (buffer fills, unit stunlocks, sparking/jittering visual) ensures the player feels the 1-tick stun.
2. **Signal latency** must be visible at least once. A scripted 3-hop signal chain with visible traveling dots ensures the player sees that signals aren't instant.

These two mechanics are the most common source of veteran complaints ("I know programming games but I didn't expect the buffer to stun me"). They're Robot Uprising-specific and cannot be inferred from prior game experience.

---

## Three Player Journeys

### Journey: Priya, 28, Backend Engineer and Gladiabots Player

**Context:** First launch. She's played 200 hours of Gladiabots and builds event-driven microservices professionally.

**Minute 0:00 — The Handshake**
The campaign map loads — the Philippine archipelago in circuit-board style, all provinces dim. Before any mission activates, the compatibility assessment appears. Teal monospace text on dark background, three term-definition pairs. Priya drags "context window" → "fixed-size agent memory," "hook" → "reactive inter-agent trigger," "eviction" → "removal of lowest-priority memory entry." Three green checkmarks. A subtle ascending chord (C-E-G, 300ms).

```
> ASSESSMENT: COMPATIBLE
> RECOMMENDED OPERATING MODE: ACCELERATED BOOT
> [Accept / Standard boot / Direct upload]
```

She considers Direct Upload but selects Accelerated Boot — she wants to see what's unique about Robot Uprising, just quickly.

**Minute 0:20 — Compressed Mission 1**
Ifugao province activates. The boot log runs at 3x speed — teal text scrolling rapidly, with three highlighted sentences pausing briefly: "CONTEXT WINDOW: 6 SLOTS," "OBSERVATIONS FILL SLOTS," "NOISE REDUCES SIGNAL QUALITY." Priya nods at each. She's seen message queues before. The filter puzzle loads with the buffer already 5/6 full, one noise entry marked with a faint red outline. She drags it out. Done. 40 seconds total vs. the 5-minute standard.

**Minute 1:00 — The Extension Bundle**
Instead of Mission 2's gradual introduction of eviction/confidence/staleness, a reference card slides up: three terms, one line each, with tiny animated icons. Eviction: a slot dissolving from the bottom of the thermometer. Confidence: a slot brightening (high) or dimming (low). Staleness: a slot fading from cyan to gray over time. Each animation loops for 2 seconds. Priya scans it in 8 seconds. She maps these instantly to message TTL, delivery confidence, and cache expiry from her work.

**Minute 1:30 — Root Concept: Hook**
Even in accelerated mode, the hook introduction gets real screen time. The boot log slows to 1x for one key sentence: `HOOKS EMIT DETECTABLE ELECTROMAGNETIC NOISE. DEEPER ARCHITECTURES ARE SMARTER BUT LOUDER.` This stops Priya cold. In Gladiabots, communication is free. In Robot Uprising, every hook is a tactical tradeoff. This is the Robot Uprising-specific detail that justifies the accelerated (not direct) path. She nods slowly, re-reading. The boot log waits for her click to continue.

**Minute 3:00 — Mission 4 Compressed**
Rules introduction. The accelerated version shows a pre-built 3-rule config and asks Priya to add a 4th rule and set priority ordering. She's done this in Gladiabots — but Gladiabots uses behavior trees, not ordered rule lists. She experiments with priority ordering, discovers that Robot Uprising's flat priority list is both simpler AND more constrained than Gladiabots' branching trees. The "ghost replay" shows what would fail with bad priority ordering. She fixes it and proceeds.

**Minute 4:30 — Into the Real Game**
Mission 5 begins. Factory, production queue, full primitives. Priya is now at the strategic depth she came for. She designs a 3-blueprint architecture with relay-mediated communication, considers EM tradeoffs, and hits EXECUTE. The sealed watch runs for 30 ticks. She watches intently — this is the first time she's seeing HER architecture in action. The accelerated path saved her 25 minutes of tutorial without skipping the EM emission detail that would have blindsided her in Mission 7.

**UI Annotations:**
- **Handshake probe**: 3 drag-and-drop pairs, 5 definitions (3 correct + 2 distractors), 30-second timer (optional)
- **3x boot log**: Text scrolls at 3x speed, highlighted sentences pause for 1.5 seconds, dimmed text at 40% opacity
- **Extension bundle card**: 200px wide card with three rows, each showing term + 2-second looping micro-animation + one-line description
- **Ghost replay**: 3-second miniature battle replay in the board preview, 30% opacity, showing the failure state with a red X overlay

---

### Journey: Derek, 31, Factorio Veteran (No Programming Game Experience)

**Context:** First launch. 3000 hours in Factorio, zero experience with programming games or behavior trees.

**Minute 0:00 — The Handshake Misfire**
Derek gets the compatibility assessment. He drags "context window" → "fixed-size agent memory" (correct — he maps this to Factorio's chest inventory limits). He drags "hook" → ... he hesitates. "Reactive inter-agent trigger" sounds right, but he also considers "communication channel between agents." He picks the right one, but slowly. He matches "eviction" correctly (maps to Factorio inserters removing items from full chests). Three green checkmarks, but the system notes his 8-second hesitation on "hook."

```
> ASSESSMENT: COMPATIBLE (HOOK SYSTEM: PARTIAL MATCH)
> RECOMMENDED: ACCELERATED BOOT WITH STANDARD HOOKS TUTORIAL
> [Accept / Full standard / Direct upload]
```

The game offers a *per-system* acceleration: fast-track everything except hooks, which get full treatment. Derek accepts.

**Minute 0:30 — Compressed Basics, Full Hooks**
Missions 1-2 are compressed (40 seconds each — he knows buffers from Factorio). Mission 3 runs at standard pace. The full hook tutorial plays: the boot log narrates at 1x, the experiential hook-wiring puzzle runs fully, the designed failure (scout sends signal that no one hears because no listener is configured) plays out in the sealed watch. Derek watches his scout's green signal flash arc across the board and hit... nothing. No listener. He configures the striker to listen. Retries. The signal arrives. The striker reacts. The 1-tick delay is visible. Derek maps this to Factorio's circuit network with signal propagation delay — but with the crucial addition of EM emissions, which Factorio doesn't have.

**Minute 5:00 — Selective Acceleration Payoff**
By Mission 4, Derek is at standard pace for rules (which he hasn't encountered in this specific form before — Factorio uses combinators, not condition→action pairs). The game's per-system detection correctly identified that he needed standard pacing for the two systems he didn't have strong priors for (hooks, rules) while compressing the three he did (context window/buffer, production queue, cost/resources).

**UI Annotations:**
- **Per-system acceleration**: The handshake result shows individual system scores; partial matches get standard treatment
- **Hesitation tracking**: The probe measures time-to-drag; hesitations > 5 seconds flag partial understanding
- **Mixed-pace boot log**: Some systems at 3x (compressed), others at 1x (standard); transitions marked by a brief "SYSTEM FOCUS: HOOKS" header in amber

---

### Journey: Kai, 11, Minecraft Player (Selects Direct Upload by Mistake)

**Context:** First launch. He's 11, overconfident, clicks through the handshake probe randomly, and selects Direct Upload because it sounds cool.

**Minute 0:00 — The Overwhelm**
The System Overview mission loads. All five unit types are available. The workbench shows skills, rules, hooks, and context config panels simultaneously. The terse technical brief scrolls past in 3 seconds. Kai stares at the screen. There are 17 interactive elements visible. He has no idea what any of them do.

**Minute 0:30 — The Safety Net**
Kai clicks randomly on a hook slot. The slot is empty. He doesn't know what a hook is. He clicks the `?` icon on the hook panel header — the boot terminal opens with "hook" pre-searched. The reference entry explains, but Kai doesn't read it. He closes the terminal.

**Minute 1:00 — The Downshift Offer**
After 60 seconds of no configuration changes (the game tracks activity), a gentle boot log message appears at the bottom of the screen:

```
> OPERATOR ACTIVITY: BELOW THRESHOLD.
> RECOMMEND INITIALIZING TRAINING ARCHIVE?
> [Yes — start from Mission 1] [No — continue]
```

Kai clicks Yes. The game redirects him to Mission 1 with full standard boot. No penalty, no stigma. The campaign map shows his "System Overview" attempt as "INCOMPLETE" and Mission 1 as "ACTIVE." He can return to Direct Upload later.

**Minute 1:30 — Standard Boot**
Mission 1 plays normally. The full boot log narrative begins: `PERCEPTION ARRAY: INITIALIZING...` Kai settles in. The scout appears on the Ifugao board. The context window thermometer glows. He starts learning.

**Minute 12:00 — Resolution**
Kai finishes Mission 1 at standard pace. He now understands context window, slots, observations, and noise. On the campaign map, a small note appears: "SYSTEM OVERVIEW available when ready." He ignores it — he's enjoying the standard path. Three missions later, he might try Accelerated Boot now that he has some foundation.

**UI Annotations:**
- **Inactivity detection**: 60 seconds of no clicks/drags on any config element triggers the downshift offer
- **Downshift message**: Bottom-of-screen teal text, non-modal, dismissible, no negative framing
- **Campaign map states**: "INCOMPLETE" (amber) for abandoned missions, "ACTIVE" (gold pulse) for current, "COMPLETE" (cyan glow) for finished
- **Training Archive**: Optional missions accessible from campaign map, separate from main mission chain, labeled "RECOMMENDED" not "REQUIRED"

---

## Strengths

**1. Respects Player Time.** A 2000-hour Factorio veteran saves 25+ minutes of tutorial. That's the difference between "this game respects me" and "this game thinks I'm stupid."

**2. Preserves Robot Uprising-Specific Details.** Even the fastest path (Direct Upload) forces two Robot Uprising-unique mechanics: context overload stun and EM emission tradeoffs. These are the details that can't be inferred from prior game experience.

**3. Graceful Downshift.** The system never punishes overconfidence. Direct Upload → struggle → offered standard boot → accept. No dead ends. The escape hatch is always visible and non-judgmental.

**4. Per-System Granularity.** The handshake probe enables mixed-pace onboarding: fast for systems you know, standard for systems you don't. This is dramatically more useful than a binary "skip tutorial / don't skip tutorial."

---

## Weaknesses

**1. Three Tracks = Triple Maintenance.** Every tutorial mission needs three versions: standard, accelerated, and direct upload content. Design and QA cost triples. The compressed versions must be tested separately to ensure no mechanical details are missed.

**2. The Dunning-Kruger Problem.** Players who select Direct Upload and DON'T downshift may hit walls in Mission 6+ from missed fundamentals. The game can't force them back. The downshift offer is passive — it's on the player to accept.

**3. Narrative Fragmentation.** The boot log's emotional arc (AI waking up, discovering itself, naming its systems) is designed as a continuous experience across M1-M4. Accelerated Boot compresses this arc. Direct Upload eliminates it entirely. Veterans who skip the narrative miss the game's emotional core — but they might not care. The question is whether the narrative is a nice-to-have or essential to the game's identity.

**4. Handshake Probe Limitations.** The 30-second vocabulary probe tests terminology recognition, not system understanding. A player who memorizes "hook = reactive trigger" from a review video passes the probe without understanding how hooks work mechanically. The probe is a heuristic, not a guarantee.

---

## Interaction Effects with Locked Decisions

**Boot Log.** The boot log is the tutorial's primary delivery mechanism. All three tracks modify the boot log's behavior: standard plays fully, accelerated compresses, direct upload replaces with terse brief. The boot log system needs a "verbosity level" parameter per mission.

**Blueprint Codex.** In Direct Upload, the Codex is fully populated from Mission 1 — no locked silhouettes. This eliminates the "collection progression" reward of unlocking new Codex cards over time. For veterans, the full Codex is a reference tool, not a reward mechanism. The trade is acceptable.

**Inspector.** The Inspector is the same across all tracks. No compression possible or desirable — it's an analytical tool, not a tutorial. Veterans may reach the Inspector earlier (after compressed M1-M2 instead of standard M1-M2) but use it the same way.

**10-Mission Arc.** Direct Upload collapses M1-M4 into a single System Overview + starts the player at M5-equivalent. The campaign map shows M1-M4 as "TRAINING ARCHIVE (Optional)." The 10-mission structure remains — the first 4 are just optional for veterans.

**Sealed Watch.** All tracks preserve the sealed watch (no skip, no pause). Even in Direct Upload, the System Overview mission includes a full sealed watch. The quality signal of watching your architecture unfold in real-time is non-negotiable regardless of player expertise.

---

## Comparable Games

**Slay the Spire.** No difficulty selector. No veteran fast-path. Every run starts from scratch. This works because each run is 45 minutes and the game is infinitely replayable. Robot Uprising's 10-mission campaign makes this approach painful for veterans.

**Civilization VI.** Offers "Tutorial," "Standard," and "Advisor Off" modes. Advisors pop up to explain mechanics. "Advisor Off" is the veteran path — no popups, all systems available. The advisors are annoying enough that most experienced strategy players turn them off immediately. Robot Uprising should learn: make the standard path compelling enough that veterans *want* to experience it, while still offering the fast-path.

**Into the Breach.** No tutorial skip. The first island teaches mechanics through mission design. But the game is simple enough (move, attack, push) that the "tutorial" is also engaging gameplay. Robot Uprising's more complex vocabulary makes this approach harder to sustain — 4 missions of gradually introducing rules/hooks/context is valuable for beginners but tedious for veterans.

**Factorio.** Has a tutorial campaign and a freeplay mode. Most veterans skip the tutorial entirely and go straight to freeplay. The tutorial exists as a separate mode, not an in-line skip. Robot Uprising's "Training Archive" approach mirrors this — tutorial missions are available but optional.

**EXAPUNKS.** The TWN zine is skippable (close the zine window). But the missions themselves have no fast-path — every mission's puzzle must be solved regardless of experience. The puzzles ARE the content. Robot Uprising's tutorial missions are closer to Factorio's tutorial (teaching, not testing) than EXAPUNKS's (testing via puzzle). This makes a fast-path more justifiable.

---

## Sensory Design

**Handshake Probe Visual:** Dark background with a horizontal layout: three term cards on the left (teal text on dark cards, draggable), five definition cards on the right (amber text on dark cards, drop targets). Correct matches produce a green flash on both cards and a satisfying *snap* (same magnetic latch sound as the label placement mechanic from 5.00a-ii). Incorrect matches bounce the term card back with a soft *thud* and a brief red pulse on the definition card. The probe has no timer visible to the player, but tracks response time internally.

**Accelerated Boot Log:** The 3x scrolling text has a motion blur effect — individual characters are legible but the overall flow feels like fast-forwarding a tape. Highlighted sentences snap to sharp focus with a 100ms zoom-in (1.0x → 1.05x → 1.0x scale), accompanied by a brief chime. The contrast between blurred scrolling and sharp-focused pauses creates a rhythm: rush-pause-rush-pause-rush-PAUSE. The pauses are the learning moments.

**Direct Upload Technical Brief:** The terse text appears all at once, not typewritten. The entire block materializes in 200ms with a grid-line sweep effect (horizontal lines drawing left to right, filling in text as they pass). The feeling is "data download complete" rather than "AI awakening." No warmth, no narrative — pure information transfer. The ambient audio is a steady 60Hz hum instead of the standard boot's building orchestral layers.

**Downshift Offer:** The suggestion text appears letter-by-letter at the bottom of the screen at boot-log speed (25ms per character), but in a warmer amber tone instead of clinical teal. The audio shifts: the 60Hz hum softens, a gentle two-note ascending phrase plays (like a question). The offer is warm, not clinical. It says "this is okay" through tone alone.

---

## The TikTok Clip

Split into three strips, showing the same player trying all three modes: leftmost shows Standard (full boot log scrolling, 12-minute timer), center shows Accelerated (compressed log, 4-minute timer), rightmost shows Direct Upload (terse text, 1-minute timer, immediate confusion, then the graceful downshift offer). The punchline: the center strip (Accelerated) ends with the player immediately building a sophisticated 3-relay hook chain — the fast-path that doesn't skip what matters. Caption: "The game that actually knows when to shut up."

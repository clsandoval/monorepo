# Complexity Ramp: Mechanic Introduction Order and Pacing

**Aspect:** 5.04 — Complexity ramp: what order are mechanics introduced? How many missions before full complexity?
**Category:** Campaign / Progression
**Wave:** 5 (Onboarding & Campaign)

---

## The Design Question

Robot Uprising has an unusually large vocabulary for a strategy game: **four primitive types** (skills, rules, hooks, context config), **five unit types** (scout, striker, relay, specialist, command), **production** (factory, queue, blueprints, resources), **channels** (naming, routing, listening), **emissions** (EM noise, detection), **eviction policies**, and **meta-level command** (reassigning skills, rerouting hooks). That's roughly **30 discrete concepts** a player must internalize before they're operating the full system.

The locked mission arc (10 missions, Missions 1–4 pre-placed, Mission 5 factory introduction, Missions 6–7 command agents, Missions 8–10 full system) provides the skeleton. But the PACING within that skeleton — how many concepts per mission, which concepts pair well, what interleaving pattern prevents cognitive overload — is an open design question with enormous impact on retention, comprehension, and the game's emotional arc.

The key tension: **too slow** and veterans disengage (the "I already understand this, let me build" impatience). **Too fast** and newcomers drown (the "I don't know what broke" confusion that precedes quitting). The ramp must serve both audiences simultaneously, or branch to serve them separately.

---

## Option A: "The Single Concept" — One New Thing Per Mission

### How It Works

Each mission introduces exactly **one** new concept. The player has only one unknown to master. Every other element on screen is already familiar.

**Mission-by-mission concept map:**

| Mission | New Concept | Cumulative Vocabulary | What's Familiar |
|---------|------------|----------------------|-----------------|
| 1 — Wake Up | Context config (listen/ignore) | 1 | Nothing — this IS the game |
| 2 — First Contact | Rules (condition→action pairs) | 2 | Context config |
| 3 — Blind Spots | Hooks (channel naming, fire-and-forget) | 3 | Context config, rules |
| 4 — Noisy Channel | Relay unit + compress/filter skills | 5 | Context, rules, hooks, scout, striker |
| 5 — Assembly Line | Factory + production queue + blueprints + resources | 9 | All pre-placed unit mechanics |
| 6 — Chain of Command | Command unit + reassign/reroute skills | 11 | Everything except meta-level |
| 7 — Pressure Test | Eviction policies under load | 12 | Full vocabulary minus stress scenarios |
| 8 — Breach | Specialist unit + hack/extract + emissions | 15 | Everything else |
| 9 — Arms Race | Enemy architectures + counter-design | 16 | Full player toolkit |
| 10 — The Warden | Factory vs. factory (full system) | 16 | Everything — mastery test |

**The problem:** Mission 5 is a cliff. It introduces FOUR concepts simultaneously (factory, queue, blueprints, resources). Even in a "one concept per mission" model, the factory is irreducibly complex — you can't teach "blueprint" without "production queue" without "resources." This is the **Mission 5 wall** and every complexity ramp variant must address it.

### Pacing Feel

The first four missions feel like learning to read — one letter at a time, each mission a new letter, and by Mission 4 you're reading short words. Mission 5 is the moment you open a book and realize words form sentences. The cognitive load jumps from "understand one thing" to "coordinate several things." This is intentional — the factory IS the game's first real system. But the jump must be managed.

### Strengths

- **Maximum clarity per mission.** The player always knows exactly what's new. Every failure is attributable to the new concept, not to confusion about which part broke. The debrief teaches one lesson.
- **Clean feedback loops.** When Mission 3 teaches hooks, every mistake the player makes IS a hook mistake. The inspector's "what went wrong" signal is unambiguous.
- **Works for the widest audience.** Non-gamers, children, people who've never touched a strategy game — each step is small enough to handle.
- **Supports the boot log narrative.** Each mission literally activates one new subsystem. The diegetic framing IS the pedagogical structure. `HOOK_BUS: INITIALIZING...` = "now you learn hooks."

### Weaknesses

- **Veterans get bored by Mission 2.** A player who's built agentic systems professionally grasps context config, rules, and hooks instantly. Four missions of single-concept tutorials feels like being patronized. The first hour is slow.
- **Mission 5 is still a cliff.** No amount of "one concept per mission" preparation fully readies a player for the factory. The jump from "configure pre-placed units" to "design blueprints and manage a production economy" is qualitatively different, not just quantitatively more.
- **10 missions isn't enough for 30 concepts.** Some missions MUST introduce multiple concepts. The "one new thing" model is aspirational, not achievable.

### Sensory Description

**Missions 1–3:** The Plan screen's workbench panel starts sparse. Mission 1 shows only the context config sub-panel — listen/ignore toggles, eviction dropdown. The rest of the panel is dark, greyed out, with faint outlines hinting at panels that will appear later. When Mission 2 unlocks rules, the rules sub-panel fades in from dark to full brightness with a soft `subsystem online` chime and a green border flash. The player sees their workspace literally growing. By Mission 3, three sub-panels are live, the workbench feels like a real toolkit, and the greyed-out hook and skills sections whisper "there's more coming."

**Mission 5:** The screen layout CHANGES. For the first time, the left side shows not just the board but also a production queue strip along the bottom. A new "BLUEPRINTS" tab appears in the workbench. The transition is marked by a 2-second animation: the Plan screen panels slide apart, making room, accompanied by the sound of machinery spinning up. The boot log prints: `[>>] FABRICATOR: ONLINE`. The player's spatial model of the UI must reorganize. This is the first (and most dramatic) UI layout change in the game.

---

## Option B: "The Layered Reveal" — Same Concepts, Deeper Each Time

### How It Works

Instead of introducing concepts once and moving on, each concept is introduced at **depth level 1** and then revisited at greater depth in later missions. The player encounters the same primitive multiple times, each time with more nuance.

**Depth levels for each concept:**

| Concept | Depth 1 (Exists) | Depth 2 (Nuance) | Depth 3 (Mastery) |
|---------|------------------|-------------------|---------------------|
| Context Config | M1: Listen/Ignore binary toggles | M4: Eviction priority ordering | M7: Dynamic eviction under overload |
| Rules | M2: Simple condition→action (if enemy_near → flee) | M5: Multi-rule ordering and priority conflicts | M8: Counter-rules that react to enemy architectures |
| Hooks | M3: Single-channel fire-and-forget | M5: Multi-channel routing with naming | M7: Hook chains across 3+ units |
| Relay | M3: Simple message forwarding | M4: Compress + filter skills | M6: Relay as command-proxy architecture |
| Factory | M5: Build one blueprint | M6: Multi-blueprint queue ordering | M9: Dynamic production based on battlefield state |
| Command | M6: Reassign skill to adjacent unit | M7: Reroute hooks mid-battle | M9: Command-as-factory-controller |

**The effect:** No mission feels like "just learning a new concept." Every mission deepens understanding of what the player already knows WHILE introducing a new element. The cognitive load per mission is moderate — some new, some familiar-but-deeper.

### Pacing Feel

Like learning a musical instrument. You learn your first chord (context config), play it for a while, then learn a second chord (rules) while refining the first. By Mission 4, you're switching between three chords with improving fluency. The factory (Mission 5) is like learning to play with a band — the chords are the same, but coordinating with other musicians is a new skill layer.

### Strengths

- **Prevents the "learned it, done with it" feeling.** Context config isn't just a Mission 1 thing — it returns in M4 with eviction priorities and again in M7 with overload scenarios. Each primitive stays relevant throughout the campaign.
- **Mission 5 cliff is softened.** The factory is the only truly new concept in Mission 5 because hooks are already at depth 2 from Mission 4. The player's working memory isn't overwhelmed.
- **Teaches transferable design thinking.** In real agentic engineering, you revisit the same systems at increasing depth. Context management isn't a one-time configuration — it's an ongoing concern. The layered reveal mirrors this reality.
- **Supports the "complexity ramp as spiral" model.** Each orbit around the concept space goes deeper. This is how human expertise actually develops — spiral curriculum theory (Jerome Bruner, 1960).

### Weaknesses

- **Harder to design missions.** Each mission must simultaneously introduce depth-N of old concepts and depth-1 of a new concept. The design space is more constrained.
- **Debrief ambiguity.** When a mission tests context config at depth 2 AND introduces factory at depth 1, a failure could be caused by either. The inspector must help disambiguate, but the player might not know where to look.
- **Veterans may still feel slow.** A veteran doesn't need depth 1 of anything. The first three missions are still tutorial-paced regardless of layering.

### Sensory Description

**Mission 4 (Noisy Channel) as a layered reveal moment:** The player already knows context config from Mission 1 — they've toggled listen/ignore switches. Now Mission 4 presents a relay unit whose buffer fills up with compressed signals from two scouts simultaneously. The familiar listen/ignore toggles are there, but a NEW dropdown appears below them: **EVICTION PRIORITY**. The dropdown has three options: `oldest-first`, `lowest-priority`, `random`. The dropdown glows with the "new element" amber highlight — the same highlight that marked listen/ignore toggles in Mission 1, a consistent "this is the thing to learn" visual language. The player recognizes the pattern: "Oh, this is context config again, but now there's a new layer."

The boot log prints not `[>>] NEW_SUBSYSTEM` but `[>>] CONTEXT_MANAGER: UPGRADE v2.0`. The language signals revision, not revolution.

---

## Option C: "The Parallel Tracks" — Concept Pairs Introduced Together

### How It Works

Instead of one concept per mission, concepts are introduced in **complementary pairs** that are more meaningful together than alone. Each mission introduces two concepts that create a decision tension between them.

| Mission | Concept Pair | Tension Created |
|---------|-------------|-----------------|
| 1 — Wake Up | Context config + Scout perception | "What to listen to" vs. "what you can see" |
| 2 — First Contact | Rules + Striker behavior | "What to do" vs. "who does it" |
| 3 — Blind Spots | Hooks + Relay unit | "How to send" vs. "who carries it" |
| 4 — Noisy Channel | Eviction policies + Buffer size | "What to forget" vs. "how much to remember" |
| 5 — Assembly Line | Factory + Production queue | "What to build" vs. "when to build it" |
| 6 — Chain of Command | Command unit + Skill reassignment | "Who decides" vs. "what changes" |
| 7 — Pressure Test | Emissions + Enemy detection | "How loud am I" vs. "who's listening" |
| 8 — Breach | Specialist + Hack/Extract | "What to steal" vs. "how to get in" |
| 9 — Arms Race | Counter-design + Adaptation | "What they built" vs. "what breaks it" |
| 10 — The Warden | Full system vs. Full system | Everything vs. everything |

**The insight:** Concepts don't exist in isolation. "Rules" without "a unit that follows them" is abstract. Teaching rules AND strikers together gives the concept a body — "here's a unit, here's what it does, now configure WHAT it does." The pair is the minimum viable unit of understanding.

### Pacing Feel

Each mission feels like being handed a new tool with a specific job. Not "here's a hammer" (tool alone) or "here's a nail" (job alone) but "here's a hammer and nails — build something." The missions are denser but more immediately satisfying because the player can DO something with each pair right away.

### Strengths

- **Faster time to "I made something cool."** By Mission 2, the player has configured a striker with custom rules and watched it make decisions. That's a complete micro-experience — design, execute, observe. In Option A, Mission 2 teaches rules but the player hasn't yet had the satisfaction of seeing a well-configured unit in action.
- **Teaches systemic thinking early.** The game IS about how things interact. Teaching pairs teaches interaction from minute one.
- **Fits the locked mission arc naturally.** Missions 1–4 already imply paired introductions: context + perception, rules + behavior, hooks + routing, compression + signal quality.

### Weaknesses

- **Higher floor per mission.** Two concepts = twice the failure space. A player who misunderstands BOTH rules AND striker behavior in Mission 2 gets a confusing debrief.
- **No gentle on-ramp.** Mission 1 is already a pair. There's no "just one thing" warmup. Players who need that single-concept comfort have no refuge.
- **Pair design constrains mission design.** Some concepts don't pair well. What's the natural pair for "emissions"? If the pairing feels forced, the mission feels like two unrelated tutorials stitched together.

---

## Option D: "The Sandbox Ramp" — Explore, Then Structure

### How It Works

Each mission has a **two-phase structure:** first a sandbox period where the player can experiment freely with the new concept(s) on a safe board, then a structured challenge that tests what they learned. The sandbox has no failure condition — only the structured challenge has win/lose states.

| Mission Phase | Duration | Failure? | Purpose |
|--------------|----------|----------|---------|
| Sandbox intro | 2–5 min | No | Explore new concepts with tooltips and ghost feedback |
| Structured challenge | 5–15 min | Yes | Apply concepts against real enemies |

**How it works in practice (Mission 3 — Blind Spots):**

The mission begins with a sandbox: 3 scouts and 2 strikers on an empty board. No enemies. A floating tooltip says: "Scouts can see far. Strikers hit hard but see poorly. Try connecting them." The player experiments with hooks — typing channel names, watching channel wiring lines appear on the board in real time. They can hit EXECUTE and watch a "dry run" with no enemies — just their units moving and signaling. They can reset and try again. After the player has created at least one valid hook connection and executed one dry run, a "BEGIN MISSION" button activates. Now enemies appear and the real challenge starts.

### Pacing Feel

Like a music lesson where you warm up with scales before playing the piece. The sandbox is low-pressure noodling; the challenge is the performance. The transition from sandbox to challenge creates a natural tension arc within each mission: relaxation → preparation → anticipation → execution → debrief.

### Strengths

- **Self-paced learning.** Fast learners spend 30 seconds in the sandbox and hit BEGIN MISSION. Slow learners spend 10 minutes. The game never gates on time, only on demonstrated minimum competence (one valid hook connection = you've at least tried).
- **Zero-stakes exploration.** Players experiment without fear of failure. This is critical for non-gamers who may be anxious about strategy games. "You can't lose here" is a powerful invitation.
- **The dry run IS the teaching.** Watching your units on an empty board lets you observe their behavior in isolation. No enemy interference. Pure system observation. This builds the "watch and understand" habit that the sealed watch phase later relies on.
- **Supports Option A or C layering.** The sandbox can introduce one concept OR a pair. It's a pedagogical wrapper, not a concept-ordering strategy.

### Weaknesses

- **Session length bloat.** If every mission has a 5-minute sandbox + a 10-minute challenge, the campaign runs 150 minutes. Add debrief time and you're at 3+ hours. For some players this is fine. For others, it's too long.
- **Sandbox fatigue.** By Mission 7, experienced players groan at another sandbox phase. "I KNOW hooks. Let me fight." A skip option is necessary, but then you need to decide if skipping the sandbox affects the challenge's difficulty.
- **Sandbox doesn't teach pressure.** The sandbox has no enemies, no ticking clock, no stakes. The transition to the real challenge can be jarring — "it worked in practice, why is it failing now?" — because the sandbox doesn't simulate adversarial conditions.

### Sensory Description

**Sandbox entry:** The board loads in with a different color treatment than the real challenge — slightly desaturated, a faint blue-grey overlay, like a holographic simulation. Units on the board have a subtle wireframe edge, visually marking them as "not real yet." A horizontal banner across the top of the screen reads `SIMULATION MODE — NO HOSTILE CONTACTS` in muted white text. Ghost chevrons drift lazily across the board — suggested signal routes rendered as translucent dotted lines.

**Transition to challenge:** When the player clicks BEGIN MISSION, the desaturation peels away like a filter being lifted — colors sharpen from left to right across the board over 1.5 seconds. The wireframe edges on units solidify into full sprites. The banner dissolves. Red enemy icons fade in from the board edges with a low `proximity alert` tone. The transition takes 3 seconds and feels like waking up from a simulation into reality. The boot log prints: `SIMULATION COMPLETE. ENGAGING LIVE TARGETS.`

---

## Option E: "The Fast Lane" — Adaptive Skip System

### How It Works

The game monitors player performance in real time and offers to skip tutorial content when the player demonstrates mastery. This isn't a separate "difficulty setting" — it's embedded in the mission flow.

**Detection triggers:**
- **Speed:** Player configures the correct solution in under 15 seconds → "You seem to have this. Skip to the next mission?"
- **Efficiency:** Player's first attempt achieves 100% pass rate → skip offer appears during debrief
- **Pattern recognition:** Player uses advanced techniques before they're formally introduced (e.g., manually typing a channel name before Mission 3 teaches hooks) → "You discovered hooks early. Mission 3 will adapt."
- **Explicit request:** A "Skip Tutorial" button visible from Mission 1, always available, no judgment

**What "skip" means:**
The player doesn't skip the MISSION — they skip the hand-holding within it. In normal mode, Mission 2 starts with a tooltip: "Rules are condition→action pairs. Try adding one." In skip mode, Mission 2 starts immediately with the full challenge and no tooltips. The objective and enemies are identical. Only the scaffolding changes.

### Pacing Feel

Like a textbook that notices you already know algebra and opens directly to calculus. The game respects your time by matching its explanatory depth to your demonstrated understanding. For a veteran agentic engineer, the first four missions might take 20 minutes total. For a newcomer, they might take 2 hours. Both players arrive at Mission 5 ready.

### Strengths

- **Solves the veteran problem.** A player who's built ralph loops doesn't need Mission 1's tooltip explaining context config. The game detects this and gets out of the way.
- **No separate difficulty setting needed.** Difficulty emerges from the player's own competence. This avoids the "should I pick Normal or Hard?" anxiety at the start menu.
- **Preserves narrative continuity.** The player still plays all 10 missions — they just experience them with varying levels of hand-holding. The boot log sequence is complete regardless. The story is intact.
- **Data-driven refinement.** After launch, telemetry reveals which skip triggers are too aggressive (players skip but then fail) or too conservative (players who should skip don't get offered). The thresholds tune over time.

### Weaknesses

- **False positive risk.** A player who solves Mission 1 quickly might have gotten lucky, not understood the concept. Offering a skip after luck leads to struggling later.
- **Narrative pacing disruption.** The boot log narrative assumes a certain dwell time per mission. A veteran who blazes through Missions 1–4 in 15 minutes doesn't absorb the narrative beats. The AI's "awakening" feels rushed.
- **Two code paths per mission.** Every mission needs both a tutorial path and a skip path. This doubles the QA surface. Tooltip triggers, skip offers, adaptive behaviors — each is a potential bug source.
- **"Is this a test?" anxiety.** Some players see a skip offer and worry they're being tricked. "If I skip, will I miss something important?" This anxiety undermines the system's purpose.

---

## Option F: "The Gauntlet Ramp" — Frontload Basics, Extend via Post-Campaign

### How It Works

The 10-mission campaign teaches a **reduced** vocabulary — just enough to play and enjoy the game. Advanced concepts (emissions, specialist hacking, command rerouting mid-battle, counter-architecture design) are introduced in the Gauntlet post-campaign, where the player has already demonstrated competence and motivation.

**Campaign teaches (Missions 1–7):** Context config, rules, hooks, relay, factory, production queue, basic command. That's ~12 concepts.

**Gauntlet introduces (post-campaign):** Emissions model, EM detection, specialist hack/extract, advanced eviction policies, dynamic hook rerouting, counter-design, factory vs. factory optimization. That's ~10 concepts introduced through **Gauntlet challenges** with escalating difficulty.

**Why this works:** The campaign's job is to make the player fall in love with the core loop. The Gauntlet's job is to make the player a master. Different pedagogical goals, different pacing needs. The campaign can afford to be slow and safe. The Gauntlet can afford to be fast and brutal — the player has opted in.

### Strengths

- **Campaign stays accessible.** 12 concepts across 7 meaningful missions is a gentler ramp than 30 concepts across 10 missions. The campaign is beatable by anyone willing to try.
- **Gauntlet has unlimited runway.** Post-campaign, new concepts can be drip-fed through Gauntlet challenges indefinitely. Season 2 adds new hooks. Season 3 adds new unit types. The ramp never ends.
- **Cleaner mission design.** Each campaign mission has fewer concepts to juggle. Missions can be tighter, more focused, more polished.

### Weaknesses

- **Delays the "full game" feeling.** Players who want to experience the complete system — emissions, counter-design, factory wars — must beat the entire campaign first. This could take 5+ hours for a new player. Some players want the full toolbox immediately.
- **The Gauntlet is the wrong place for tutorials.** The Gauntlet is competitive, adversarial, and unforgiving. Introducing concepts there means teaching under pressure. Some players learn well under pressure; others don't.
- **Missions 8–10 lose complexity.** Without emissions and specialists, the final campaign missions have fewer tools. The climax feels smaller than it could be.

---

## Cross-Cutting Analysis: The Mission 5 Wall

Every option faces the same structural problem: **Mission 5 introduces the factory, and the factory is irreducibly multi-concept.** A factory needs blueprints, a production queue, resources, and a build cycle. You can't introduce one without the others.

**Five approaches to the Mission 5 wall:**

1. **Pre-teach components.** Use Missions 3–4 to introduce factory sub-concepts in non-factory contexts. E.g., Mission 4 introduces "templates" (pre-built config snapshots) that later become "blueprints." The player already knows the concept; the factory just gives it a production context.

2. **Split Mission 5.** Make Assembly Line a two-part mission: 5A introduces blueprints (design a unit config and save it), 5B introduces the production queue (arrange saved blueprints into a build order). Each half introduces one concept. This requires expanding the campaign to 11 missions or making 5A/5B shorter.

3. **Sandbox the factory.** Use Option D's sandbox phase specifically for Mission 5 — a 5-minute free-play period where the player experiments with the factory UI, builds units, watches them spawn, and breaks things without consequence. Then the real Mission 5 challenge begins.

4. **Simplify the factory for Mission 5.** The first factory experience uses a ONE-blueprint queue. The player designs a single blueprint, and the factory produces copies of it. Multi-blueprint queuing, resource management, and build ordering come later. The factory is introduced at "depth 1."

5. **Make the factory optional.** The player can beat Mission 5 with pre-placed units (harder) or with factory-produced units (easier). The factory is presented as a tool that makes the mission easier, not a requirement. This inverts the typical tutorial structure — the new concept is a reward, not a hurdle.

---

## Player Journeys

### Journey: Maya, 29, UX Designer, Casual Gamer

**Context:** Maya plays puzzle games on her phone but has never played a strategy game. She downloaded Robot Uprising because a friend called it "like Wordle but for AI." She's on Mission 3 (Blind Spots) after completing Missions 1 and 2 over two evenings.

**Minute 0:00 — The Workbench**
Maya sees the Plan screen. The board shows 3 scouts (👁) scattered across the left half and 2 strikers (⚔) on the right. The workbench panel on the right has three live sub-panels: Context Config (familiar from Mission 1 — blue border, she's used this before), Rules (familiar from Mission 2 — green border), and a NEW sub-panel with an amber "NEW" badge pulsing gently: **Hooks**. Below the Hooks label, a tooltip floats: "Hooks send messages between units. Type a channel name to create a connection."

Maya clicks on Scout-A. The hook config appears: two empty hook slots (labeled "Hook 1" and "Hook 2"), each with a text field labeled "Channel:" and a dropdown labeled "When:". The text field cursor blinks. She hesitates.

**Minute 0:45 — First Hook Attempt**
Maya types "alert" into Scout-A's Hook 1 channel field. The moment she types the first letter, a faint dashed line appears on the board emanating from Scout-A, wobbling in space — it's a channel wiring preview, but it has nowhere to go yet. She sets the "When:" dropdown to "enemy_spotted" (one of two options — the game hasn't unlocked complex conditions yet). The dashed line turns solid amber.

She clicks on Striker-B. In the Context Config panel, a new toggle has appeared under LISTEN: a toggle labeled "alert" — the channel she just created. It wasn't there before. Maya toggles it to LISTEN. The amber line on the board snaps from Scout-A to Striker-B, solidifying into a glowing connection. A soft chime plays. The tooltip says: "Scout-A will now alert Striker-B when it spots an enemy."

Maya's face lights up. She gets it.

**Minute 2:30 — Wiring the Network**
Maya connects all three scouts to both strikers. Six amber lines crisscross the board. It looks like a web. She's proud of the coverage — every scout talks to every striker. She hits EXECUTE.

**Minute 3:00 — The Sealed Watch**
The tick clock starts. Scouts fan out. One scout spots an enemy. All six hook connections fire simultaneously — six green chevrons streak across the board. Both strikers' buffer bars jump from blue to amber in one tick. Three scouts are all reporting. The strikers stutter — buffer bars hit red. They received so many signals they can't process them all. One striker moves toward the first report; the other striker also moves toward the first report (they both got the same signal first). The second enemy, reported by Scout-C, goes unaddressed because both strikers filled their buffers with Scout-A's redundant alerts.

Maya watches the strikers bump into each other, ignore the second enemy, and lose. She frowns.

**Minute 4:30 — The Debrief**
The Inspector shows the buffer state at tick 5: both strikers had 6/6 slots full, all from the "alert" channel. The queue depth chart shows the spike — both bars hitting red simultaneously. Maya notices the debrief caption: "Both strikers received identical information. Consider a relay to consolidate signals."

She goes back to Plan. She remembers the relay unit — it was greyed out in Missions 1–2, but now it has a faint glow. She clicks it. A tooltip explains: "Relays can compress multiple signals into one." This is the moment Mission 3 introduces the relay. But Maya discovered the PROBLEM first — information overload from naive hook wiring. The relay is the SOLUTION, not an abstract concept.

**Minute 7:00 — The Fix**
Maya removes the direct scout→striker hooks. Instead: scouts hook to "raw-data" channel → relay listens to "raw-data" → relay compresses and hooks to "threat-report" → strikers listen to "threat-report." The board shows a clean hub-and-spoke topology. She hits EXECUTE.

The strikers now act on compressed, deduplicated threat reports. They split up. Each responds to a different threat. The buffer bars stay cool blue. Maya wins. She feels like she just designed something elegant.

**Resolution:** Maya spent 10 minutes on Mission 3. She learned hooks AND relays in a single mission (Option C's paired approach), but she learned the NEED for relays through failure (the wiring overload), which motivated the concept. No tooltip could have taught her what watching two strikers crash into each other taught her.

---

### Journey: Kai, 34, Senior ML Engineer, Hardcore Strategy Gamer

**Context:** Kai has built production ML pipelines, played Factorio for 800+ hours, and recently shipped a multi-agent system at work. He's starting Robot Uprising for the first time. He read the Steam store page and recognized the vocabulary. He's on Mission 1 (Wake Up).

**Minute 0:00 — Immediate Recognition**
Kai sees the Plan screen. Two frozen units with full buffers. The context config panel is highlighted. He reads "LISTEN/IGNORE toggles" and immediately thinks: "This is an attention filter. Like a message queue consumer group with topic subscriptions." He toggles three ignore filters in 4 seconds. The units unfreeze. Mission complete. Total time: 12 seconds.

**Minute 0:12 — The Skip Offer**
A subtle notification appears at the bottom of the debrief screen: `Sub-15s solve detected. You may be ready for accelerated progression. [Accept] [Decline]`. Kai clicks Accept. The boot log animates rapidly: `[OK] CONTEXT_INIT`, `[OK] RULE_ENGINE`, `[OK] RELAY_MESH`, `[>>] SIGNAL_PROC`. He's jumped to Mission 4.

**Wait — what did he skip?** In skip mode, Missions 2 and 3 are still listed in the boot log as `[OK]` but with a small `[SIM]` badge — "simulated." The game auto-generated passing configurations for those missions using Kai's context config settings as a template. He didn't play them, but his profile shows he completed them (with simulated scores). He can go back and play them for real scores anytime.

**Minute 0:30 — Mission 4 Without Hand-Holding**
Mission 4 (Noisy Channel) loads with NO tooltips, NO "new element" amber highlights. The full Plan screen is visible — context config, rules, hooks, relay unit. Everything is active. Kai is expected to figure it out by reading the UI. He clicks the relay unit, sees its skills (compress, filter), and immediately maps it to his mental model: "This is a message broker with a transform pipeline."

He designs a relay topology in 90 seconds. Hooks are named with his engineering instincts: "threat-raw", "threat-filtered", "resource-ping". He hits EXECUTE. The sealed watch plays. His relay-centric architecture handles the noisy channel elegantly. Mission 4 complete in 3 minutes total.

**Minute 3:30 — The Boot Log Prints On**
`[OK] SIGNAL_PROC`. `[>>] FABRICATOR`. Mission 5 loads. Kai has reached the factory in under 4 minutes of play. The game respected his expertise. He feels engaged, not patronized.

**Resolution:** Kai's experience with the adaptive skip system (Option E) compressed 4 tutorial missions into one real mission and two simulated completions. He arrived at the factory with full understanding of all primitives. The game matched his pace. He'll spend his time where it matters — designing factory architectures, not learning what a toggle does.

---

### Journey: Lena, 14, High School Student, First Strategy Game

**Context:** Lena saw a TikTok of someone's scout-relay-striker chain creating a flanking maneuver. She downloaded the game because it looked cool. She's never played a strategy game. She's on Mission 5 (Assembly Line) and has been stuck for two sessions.

**Minute 0:00 — The Factory Wall**
Lena opens Mission 5. The screen looks DIFFERENT from Missions 1–4. There's a new strip along the bottom — the production queue conveyor belt. A new tab in the workbench — BLUEPRINTS. A resource counter in the corner she's never seen before: `Materials: 15 | Energy: 5/tick`. The boot log just printed `[>>] FABRICATOR: ONLINE` and the terminal text said something about "designing blueprints for autonomous production." She understood Missions 1–4 — filters, rules, hooks, relays. But this is a whole new interface.

She clicks the BLUEPRINTS tab. It shows a blank config panel — the same layout as the unit config from before (skills, rules, hooks, context) but with an extra header: "Blueprint Name:" and a cost readout: `Est. cost: 0m, 0e/tick`. She stares. The connection between "configuring a unit" and "designing a blueprint" isn't clicking. In Missions 1–4, units were already on the board. Now she has to CREATE them?

**Minute 2:00 — The Sandbox Safety Net (Option D)**
The Mission 5 sandbox activates. The board shows the player base (a data center built into a rice terrace cliff face) and an EMPTY battlefield. No enemies. The banner reads `SIMULATION MODE — DESIGN YOUR FIRST BLUEPRINT`. A ghost hand animation shows: click BLUEPRINTS → configure a scout → drag to production queue → wait → unit appears on board. Lena follows the ghost hand. A scout materializes from the base after 3 ticks. It stands on the board, looking around with its sensor dish. Lena giggles.

She makes another blueprint — a striker. Drags it to the queue after the scout. Watches the base build a scout, then a striker. Two units stand on the empty board. The tooltip says: "You've built your first army. When you're ready, BEGIN MISSION to face the enemy."

**Minute 5:00 — Option 4: Simplified Factory**
The structured challenge begins, but the factory is running at "depth 1": one blueprint slot only. Lena can design ONE blueprint type, and the factory will produce copies of it every N ticks. She doesn't need to manage a multi-blueprint queue or balance build orders. She designs a scout blueprint (copying her Mission 3 relay-hub configuration) and watches the factory produce scouts.

The mission's challenge is: her scouts discover enemies, but she has no strikers. She can't build strikers yet (one-blueprint limit). The mission's lesson: "You need different unit types for different jobs." When she fails, the debrief suggests: "Next attempt, try a striker blueprint instead." She switches. Now she has strikers but no scouts. Failure again, different reason: "Your strikers can't see far enough."

**Minute 12:00 — The Unlock**
After two failures, the game unlocks the second blueprint slot. The tooltip says: "You can now design two different units." Lena designs a scout AND a striker. She drags both to the queue. The factory alternates: scout, striker, scout, striker. Her army has eyes and fists. She wins.

The factory was introduced at depth 1 (single blueprint), failure taught her WHY she needs depth 2 (multiple blueprints), and the unlock felt earned, not given.

**Minute 15:00 — The Relief**
Lena completes Mission 5 on her third attempt, 15 minutes total. She learned blueprints, the production queue, and build order — but each piece was isolated by the sandbox, the single-blueprint constraint, and the deliberate two-failure-then-unlock sequence. She didn't hit a wall. She climbed a staircase with visible steps.

**Resolution:** Lena's experience combined Options C (paired concepts), D (sandbox phase), and the "simplified factory" approach to the Mission 5 wall. Three separate pacing tools worked together to keep her engaged through the hardest transition in the game.

---

### Journey: Dr. Chen, 58, Retired Professor, Accessibility Needs

**Context:** Dr. Chen has low vision and uses a screen magnifier. He's methodical and patient, having played chess for 40 years. He's on Mission 2 (First Contact), experiencing the game with the "Standard" complexity layer and magnification at 130%.

**Minute 0:00 — The Rules Panel**
The Plan screen loads. Dr. Chen's magnifier means he sees about 60% of the screen at once. He pans to the workbench panel on the right. The Context Config sub-panel (familiar from Mission 1) is fully visible. Below it, a new sub-panel has appeared: **Rules**. The "NEW" badge pulses in amber — high contrast against the dark panel background, visible even at his magnification level.

He clicks the Rules panel. It expands to show a single empty rule slot: a condition dropdown on the left ("IF...") connected by an arrow to an action dropdown on the right ("THEN..."). The condition dropdown offers: `enemy_adjacent`, `buffer_full`, `ally_damaged`. The action dropdown offers: `move_away`, `move_toward`, `hold_position`. Large text. High contrast. Each option has a small icon reinforcing the text: a red triangle for enemy_adjacent, a full bar for buffer_full.

**Minute 1:30 — Building a Rule**
Dr. Chen selects `IF: enemy_adjacent → THEN: move_away` for Scout-A. On the board (he pans left to see it), a ghost preview appears: Scout-A shows a translucent arrow pointing away from the nearest enemy position. The arrow is thick — 4px stroke — visible at 130% magnification. The preview persists as long as the rule is selected.

He adds a second rule: `IF: buffer_full → THEN: hold_position`. The rules panel now shows both rules in order, with drag handles on the left for reordering. The "priority" concept is implicit in the visual ordering — top rule evaluates first. A tooltip explains: "Rules are checked top to bottom. The first matching rule fires."

**Minute 3:00 — The Priority Discovery**
Dr. Chen wonders: "What if both conditions are true? Enemy is adjacent AND buffer is full?" He pans to the board. The ghost preview now shows TWO potential behaviors overlapping — a move-away arrow AND a hold-position marker. The arrows are color-coded: Rule 1's arrow is bright green (top priority), Rule 2's marker is dim grey (lower priority). The visual clearly communicates that Rule 1 wins.

He drags Rule 2 above Rule 1. The colors swap. Now the hold-position marker is bright green and the move-away arrow is dim grey. He understands. Rule ordering matters. This is a 3-second interaction that teaches priority without a word of tutorial text.

**Minute 4:30 — Execute and Observe**
Dr. Chen hits EXECUTE. The sealed watch begins. His scout encounters an enemy. The tick clock fires. The scout holds position (Rule 1: buffer_full → hold_position, which is true because the buffer was pre-loaded). The enemy closes in. Next tick: the scout still holds. The enemy is now adjacent. But hold_position is still Rule 1. The scout doesn't flee.

Dr. Chen loses the scout. In the debrief, the inspector shows: "Tick 4: Rule 1 matched (buffer_full). Rule 2 (enemy_adjacent → move_away) was not evaluated." The lesson is clear: his rule ordering was wrong. He needs move_away as the higher priority.

**Minute 7:00 — The Fix**
He swaps the rules. Retries. The scout now flees from enemies, and only holds position when the buffer is full AND no enemy is adjacent. The implicit priority system has been learned through a single failure and a single drag-and-drop.

**Resolution:** Dr. Chen's experience worked because: (1) the rule panel was high-contrast and icon-reinforced (accessibility), (2) the ghost preview showed rule priority through color brightness (visual-first teaching), (3) a single failure taught rule ordering more effectively than any tooltip could. The complexity ramp accommodated his pace — he spent 7 minutes on what Kai did in 4 seconds, and both learned the same concept.

---

## Interaction Effects

| Option | Works Well With | Conflicts With |
|--------|----------------|----------------|
| A (Single Concept) | Boot log narrative (one subsystem per mission), strict linear campaign, screen reader accessibility | Veteran engagement, 10-mission constraint (too many concepts for 10 single-concept missions) |
| B (Layered Reveal) | Inspector depth (revisiting concepts in debrief), Gauntlet post-campaign (depth 3+ for endgame), spiral learning theory | Clear debrief attribution, simple mission objectives |
| C (Parallel Tracks) | Paired unit-concept introductions, systemic thinking emphasis, "teach the interaction not the part" | Newcomer cognitive load, simple first-session experience |
| D (Sandbox Ramp) | Mission 5 factory wall, accessibility (self-paced), anxiety-prone players | Session length, veteran patience, "sandbox fatigue" after mission 6+ |
| E (Fast Lane) | Veteran engagement, agentic engineer audience, telemetry-driven difficulty | QA complexity, false positive skips, narrative disruption |
| F (Gauntlet Ramp) | Post-campaign replayability, seasonal content, clean campaign scope | "Full game" delayed, Gauntlet-as-tutorial confusion |

## Comparable Games

- **Factorio:** Progressive automation complexity. Manual → inserters → belts → trains → robots → nuclear. Each layer solves a problem created by the previous layer's scale. The player never feels taught — they feel like they're inventing solutions. Robot Uprising should aim for this: each new primitive should solve a problem the player already felt. Hooks solve the "my scouts see things but my strikers don't know" problem. Relays solve the "my hooks are flooding everyone" problem. Factory solves the "I need more units but can't place them manually" problem.
- **Into the Breach:** 4 islands, each introducing new enemy types and tile hazards. Complexity comes from combinatorial explosion — each new element multiplies the decision space. But the INTERFACE never changes. The board is always 8x8. The actions are always move/attack. Robot Uprising can learn from this: the BOARD should remain constant (always 8x8, always the same visual language) even as the WORKBENCH grows.
- **Slay the Spire:** Card pool grows over a run. Each new card is one concept, but combos between cards create emergent complexity. The ramp is self-curated — the player chooses which cards to add. Robot Uprising's locked mission order prevents this self-curation, but the GAUNTLET could adopt it (choose which advanced concepts to unlock).
- **Baba Is You:** All rules are visible from level 1. Complexity comes from understanding interactions, not from learning new mechanics. This is the opposite of Robot Uprising's approach (progressive reveal) but worth studying — what if ALL primitives were available from Mission 1 and the complexity ramp was purely in the scenario design? This is essentially Option F inverted.
- **Shenzhen I/O:** Progressive instruction unlock across puzzles. Each puzzle introduces one or two new assembly instructions. The manual is always available as reference. Robot Uprising's boot log terminal could serve as a Shenzhen-style reference manual — always accessible, growing as concepts unlock.

## The Recommended Hybrid (Not a decision — an observation)

The strongest ramp likely combines:
- **Option A's mission structure** (one PRIMARY concept per mission)
- **Option B's depth layering** (old concepts return at greater depth)
- **Option D's sandbox** specifically for Mission 5 (the factory wall)
- **Option E's adaptive skip** for veterans (detect-and-compress)
- **Option C's pairing** for concepts that are inseparable (hooks+relay, factory+queue)

This hybrid means: each mission has one new concept as its headline, but revisits 1–2 old concepts at greater depth, with a sandbox phase available at complexity spikes, and an adaptive skip system that compresses the experience for players who demonstrate mastery.

---

## New Aspects Discovered

1. **5.04a — The Mission 5 Wall: five approaches to factory introduction pacing** — deep design pass on each of the five approaches (pre-teach, split mission, sandbox, simplify, make optional) with full player journeys per approach
2. **5.04b — The vocabulary density curve: how many new terms per minute is sustainable?** — research into cognitive load theory applied to game tutorial design; comparison with Shenzhen I/O's ~2 new instructions per puzzle vs. Robot Uprising's vocabulary density
3. **5.04c — The "subsystem online" micro-celebration: designing the moment a new concept unlocks** — the amber glow, the chime, the boot log print, the panel expansion animation; interaction with narrative beat design and emotional pacing
4. **5.04d — Sandbox-to-challenge transition design: the desaturation peel** — exact technical and aesthetic design of the simulation→reality transition animation; how the transition communicates stakes without words
5. **5.04e — Adaptive skip false positive mitigation: how to detect luck vs. understanding** — the difference between a fast solve and a correct solve; what additional signals beyond speed indicate genuine comprehension; interaction with 5.01e expert fast-track detection

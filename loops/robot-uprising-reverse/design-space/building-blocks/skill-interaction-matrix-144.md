# 3.01c — Skill Interaction Matrix: The 144 Squares

## Overview

Twelve skills. Twelve skills. One hundred forty-four possible cross-unit interactions. The existing skill-interactions analysis (3.03) mapped the Tier 1-4 synergy/trap categories at a high level. This document goes deeper: every cell in the 12x12 matrix gets a classification. Which pairings produce synergy? Which produce conflict? Which are surprisingly inert? And which produce the emergent "I didn't program that" moments that justify the entire game?

The matrix is not symmetric. Patrol→Compress (scout feeds relay) is a core pipeline. Compress→Patrol (relay feeds scout) is mostly useless — scouts generate their own observations and rarely need compressed data. Direction matters.

---

## The Matrix

Classification key:
- **S** — Synergistic: the combination produces behavior greater than the sum of its parts
- **C** — Conflicting: the combination creates tension, resource competition, or mutual interference
- **N** — Neutral: no meaningful interaction; the skills operate independently
- **E** — Emergent: the combination can produce surprising cascading effects the player didn't explicitly design
- **T** — Trap: the combination appears beneficial but degrades under load or creates degenerate strategies

### Full 12×12 Grid (Row = Sender, Column = Receiver)

| | patrol | evade | engage | breach | compress | filter | amplify | hack | extract | reassign | reroute | prioritize |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **patrol** | N | S | S | S | **S** | S | C | N | N | N | N | N |
| **evade** | C | N | N | N | S | **S** | **T** | N | C | S | S | S |
| **engage** | N | N | N | S | N | N | S | N | N | N | N | N |
| **breach** | N | N | S | N | N | N | **S** | N | C | S | N | N |
| **compress** | N | N | S | S | N | C | **S** | N | N | N | N | N |
| **filter** | N | N | S | N | **S** | N | S | N | N | N | N | S |
| **amplify** | N | N | S | N | C | N | N | N | N | N | N | N |
| **hack** | S | N | N | N | S | N | N | N | N | **E** | **E** | **E** |
| **extract** | N | N | N | N | N | N | N | N | N | C | N | N |
| **reassign** | E | E | E | N | N | N | N | N | E | N | S | S |
| **reroute** | N | S | N | N | N | N | N | N | N | S | N | S |
| **prioritize** | N | N | N | N | S | S | N | N | N | S | S | N |

**Summary counts:** 28 Synergistic, 8 Conflicting, 76 Neutral, 7 Emergent, 1 Trap (out of 132 non-diagonal cells)

---

## The Critical Pairings — Deep Analysis

### The Five "Pipeline" Synergies (The Backbone)

These are the synergy chains that define Robot Uprising's information flow. Every successful architecture includes at least one.

#### 1. Patrol → Compress (The Intelligence Pipeline)

Already documented extensively in 3.03. The game's "Hello World." Scout generates observations, relay compresses into summaries. The compression threshold parameter (from 3.01a) makes this pipeline tunable — threshold 2 = fast and rough, threshold 5 = slow and precise.

**Matrix classification: S (Synergistic)**

The critical insight not covered in 3.03: patrol→compress has a *rhythm*. A scout generating 2-3 observations per tick against a relay with compress threshold 4 creates a 2-tick compression cycle. Two scouts feeding one relay create a 1-tick cycle. Three scouts overload the relay unless filter is also active. The rhythm is audible in the sealed watch if you're paying attention — the relay's antenna pulses in sync with scout observation events, then emits a compression flash at regular intervals.

#### 2. Compress → Amplify (The Broadcasting Upgrade)

Compressed signals are already efficient (one slot instead of three). Amplifying them is doubly efficient — high-quality information delivered at high priority. This is the relay's self-contained signal chain.

**Matrix classification: S (Synergistic)**

But there's a hidden conflict: compress reduces volume (good for bandwidth), while amplify increases reach (loud for EM). A relay running both is quiet on the wire (few signals) but loud in the air (each signal is broadcast widely). Enemy units with EM detection see a relay that speaks rarely but shouts when it does — a distinctive signature that's easier to triangulate than constant low-volume chatter.

#### 3. Filter → Compress (The Pre-Processing Chain)

Filter first removes irrelevant entries. Compress then merges the survivors. The result: only relevant data gets compressed, and compression quality improves because the entries being merged are all meaningful.

**Matrix classification: S (Synergistic)**

The reverse (compress→filter) is classified **C (Conflicting)** because compression merges entries before filter can evaluate them individually. A compressed signal containing "3 scout sightings, 1 noise event" can't be filtered to remove just the noise — it's been baked into the summary. Order matters, and the game doesn't specify execution order (see 3.03 skill ordering question). This conflict creates a learning moment: the player must decide whether filter runs before or after compress by configuring rule priorities.

#### 4. Hack → Reassign/Reroute/Prioritize (The Intelligence-to-Action Pipeline)

Specialist hack provides enemy buffer snapshots. These high-value intelligence signals, forwarded to a command unit, enable the three command skills to make informed decisions. Reassign changes subordinate skills based on enemy intelligence. Reroute rewires channels to respond to detected threats. Prioritize adjusts buffer eviction to preserve the intelligence itself.

**Matrix classification: E (Emergent) for all three**

This trio is classified Emergent rather than merely Synergistic because the specific actions the command takes are unpredictable. A hack revealing "enemy relay has 5 scout reports and 0 striker commands" might trigger reassign (send more strikers to exploit the intelligence gap) OR reroute (redirect scouts away from the detected surveillance zone) OR prioritize (preserve the intelligence for future analysis). The player configured all three as possible responses; which one fires depends on the rules, the current buffer state, and the specific intelligence contents. The command unit appears to "decide" — it's the moment the game feels like managing an AI, not a program.

#### 5. Evade → Filter (The Noise Suppression Chain)

Scout evade events generate threat_detected entries. These flood the network if unfiltered. A relay's filter skill, configured to suppress old or distant threats, prevents alarm fatigue. This is the defensive counterpart to the patrol→compress offensive pipeline.

**Matrix classification: S (Synergistic)**

The degenerate case (evade→amplify, classified **T: Trap**) occurs when evade events are amplified without filtering. Every evade broadcasts a priority alarm. Five scouts evading 2-3 times per tick flood the entire network with priority-flagged threat data, evicting tactical intelligence from every unit's buffer. The result: strikers can't navigate because their buffers are full of amplified alarms from 10 ticks ago. This is alarm fatigue — the real-world phenomenon that kills monitoring systems. The game teaches it viscerally.

---

### The Seven Emergent Interactions

These are the cells where configured behavior produces surprising results — the "flanking maneuver from five independent configs" moments.

#### Hack → Reassign (The Double Agent)

A specialist hacks an enemy relay, revealing its channel configuration. Intelligence forwarded to a command unit enables reassign to reconfigure friendly units to exploit the gap. But the emergent behavior goes further: if the command unit's rules include "IF intelligence reveals enemy_channel_X THEN reassign specialist to hack on channel_X," the specialist starts actively targeting the enemy's communication backbone. The specialist becomes a double agent — reading enemy mail AND disrupting it by targeting the nodes that process it.

Nobody programmed "become a double agent." The behavior emerges from: hack (read) → forward (hook) → analyze (command rules) → reassign (command skill) → hack again (specialist). The loop closes. The specialist appears to develop a strategy.

#### Reassign → Patrol/Evade/Engage/Extract (The Shape-Shifter)

When a command unit reassigns a scout from patrol to evade-only, the scout changes behavior completely — from information gatherer to decoy. When it reassigns a specialist from hack to extract, the specialist shifts from intelligence to economy. Each reassignment creates a new unit type from an existing one.

The emergent behavior: a command unit with rules that reassign based on battlefield state creates units that shift roles dynamically. A scout that patrols in the early game, shifts to evade-only when enemies approach, then resumes patrol when the area clears — all driven by command reassignment — behaves like an adaptive organism. The sealed watch shows a scout that appears to "know" when to be aggressive and when to be cautious. The player didn't program the scout's caution. They programmed the command unit's assessment of danger.

---

### The Eight Conflicting Interactions

#### Patrol × Evade (The Interrupted Survey)

Within the same unit, patrol and evade conflict for movement priority. A scout that evades breaks its patrol path. Frequent evades in contested zones mean the scout never completes its patrol loop, creating gaps in surveillance. The conflict is intentional — it forces the player to choose: aggressive patrol routes (more data, more evades, more gaps) or conservative routes (less data, fewer evades, complete coverage).

#### Extract × Breach/Engage (The Resource vs. Combat Dilemma)

A specialist extracting resources (extract) is positionally committed — adjacent to a resource node. If an enemy approaches, the specialist must choose between maintaining extraction (economy) and moving to hack range (intelligence). Similarly, a striker extracting (if reassigned) can't be adjacent to both a resource node and an enemy. Extract conflicts with any combat-adjacent skill by competing for positioning.

#### Amplify × Compress (The Volume Paradox)

Compress reduces information volume. Amplify increases information reach. On the same relay, they pull in opposite directions: compress says "fewer, better signals" while amplify says "louder, wider signals." The relay compresses three observations into one summary, then amplifies that summary to the entire network. The compressed signal is efficient, but the amplification makes it loud. A relay running both is an efficient broadcaster — the best signal-to-noise ratio but also the most detectable by enemy EM sensors. The conflict isn't in functionality but in the stealth/intelligence tradeoff.

---

## Player Journeys

### Journey: Sofia, 31, Backend Engineer (Mission 6, Discovering the Matrix)

**Context:** Sofia has completed Mission 5 with a basic patrol→compress→amplify pipeline. She's now facing Mission 6 where enemies use EM detection to hunt noisy units. Her previous architecture — amplify everything — is getting her relays killed.

**Minute 0:00 — The Problem Statement**
Post-battle Inspector from her last failed attempt. She clicks on her destroyed relay. Decision trace shows: "Tick 22: amplify fired. Tick 23: enemy_striker moved toward relay position. Tick 24: engage — relay eliminated." The signal chain is clear: amplify generated EM noise, enemy detected it, enemy killed the relay. Sofia needs to reduce EM emissions without losing signal quality.

**Minute 0:30 — Consulting the Matrix**
She opens the Blueprint Codex. The skill entries now include interaction hints she's unlocked through play. Compress entry: "Works well with: filter (pre-processing), amplify (broadcasting). Caution with: amplify (EM signature increases with each amplified signal)." She reads the caution note. She didn't know compress and amplify had this tension.

**Minute 1:00 — Redesigning the Pipeline**
She removes amplify from her relay. Instead, she adds filter (suppress all entries older than 3 ticks) and keeps compress (threshold 4). The relay now filters first, then compresses. No amplification = no EM signature. But without amplification, her strikers' buffers might evict the compressed signals. She adds a rule to the relay: "IF compressed signal AND type contains enemy_position THEN prioritize outgoing signal." This marks compressed signals as priority without broadcasting them — targeted priority instead of broadcast priority.

**Minute 2:00 — The Stealth Pipeline**
She executes. During sealed watch, her relay is invisible — no concentric green rings (amplify's signature). Scout observations arrive, filter discards stale data, compress merges the rest, priority-marked signals go directly to subscribed units via hooks. The relay processes quietly. No EM ping. Enemy strikers patrol past without detecting it. Her relay survives the entire match for the first time. She's discovered the filter→compress stealth pipeline by understanding the interaction matrix.

**Minute 3:00 — The Tradeoff Insight**
But her strikers take longer to respond. Without amplification, their buffer eviction policies sometimes discard the compressed signals in favor of newer raw observations. She needs to tune the strikers' context config to prioritize compressed data. This is the matrix speaking: removing one synergy (compress→amplify) exposes a dependency (amplify was compensating for poor eviction policy). Fixing the root cause (eviction priority) is harder but more robust than the band-aid (amplify everything).

**UI Annotations:**
- **Blueprint Codex interaction hints**: Each skill card in the Codex has a "Works well with" and "Caution with" section at the bottom. These are unlocked based on the player's own experience — an interaction only appears after the player has USED both skills in the same architecture. Unplayed interactions show as "???" until discovered.
- **EM signature indicator**: On the workbench, a small antenna icon in the blueprint header shows estimated EM signature (1-5 bars). Adding amplify bumps it by 2 bars. Removing amplify drops it. The indicator updates live as skills are toggled.

---

### Journey: Dayo, 17, First Strategy Game (Mission 4, The Alarm Fatigue Trap)

**Context:** Dayo has three scouts and one relay. He's wired evade→amplify because "amplifying threat reports sounds smart." He's about to discover the T (Trap) cell in the matrix.

**Minute 0:00 — The Confident Setup**
Dayo's relay has amplify ON. His scouts have evade ON with hooks broadcasting threat_detected on the "alarm" channel. His relay listens on "alarm" and amplifies everything. His two strikers listen on "alarm" too. In his mind, this is a complete alarm system: scouts detect, relay amplifies, strikers respond. He hits EXECUTE.

**Minute 0:20 — The Cascade**
Sealed watch begins. Tick 4: Scout-1 spots an enemy. Evade fires. Threat_detected broadcasts on "alarm." Relay receives. Amplify fires — green concentric rings pulse outward from the relay. Strikers receive priority-flagged threat data. Good. Tick 5: Scout-2 spots a different enemy. Same cascade. Tick 6: Scout-1 evades again (same enemy still in range). Another amplified alarm. Tick 7: Scout-3 enters a contested zone. Three evades in one tick. Three alarms. Three amplifications. The relay's buffer is now 8/12 slots full of alarm data.

**Minute 0:40 — The Overload**
Tick 10: All three scouts are evading constantly. The relay receives 6-8 threat_detected signals per tick. Amplify fires on each one. The relay's buffer fills to 12/12. Context overload on tick 11 — the relay stuns, sparking and jittering. When it recovers, its buffer has been evicted down to 8/12, but the scouts are STILL evading. New alarms arrive immediately. The relay is caught in a stun cycle: fill → overload → stun → recover → fill → overload. The relay's context bar on the board flashes red-green-red-green in a sickly alternation.

Meanwhile, the strikers' buffers are 7/8 and 8/8 slots full of amplified, priority-flagged alarm data from ticks 4-10. None of this data is actionable anymore — the threats have moved. But the priority flag means the alarms resist eviction. New navigation data (from the relay's compressed signals, IF compress was running — it isn't, because Dayo equipped amplify instead) can't enter the buffer because the alarms won't leave. The strikers stand still. They're "deaf" — overwhelmed by old alarms they can't forget.

**Minute 1:00 — The Defeat**
An enemy striker walks adjacent to Dayo's frozen striker. Engage fires on the enemy's side. Dayo's striker is eliminated. It never saw the enemy coming because its buffer was full of priority-flagged alarms from 6 ticks ago. Dayo stares. "My alarm system killed my striker."

**Minute 1:30 — The Inspector Autopsy**
Inspector opens. Dayo clicks his dead striker. Buffer state at tick 14 (death tick): 8/8 slots, all priority-flagged threat_detected entries from ticks 5-10. The most recent entry is 4 ticks old. There's no room for the scout observation that would have warned about the adjacent enemy. The context window chart shows: green (healthy) ticks 1-5, then solid red (full) ticks 6-14. The striker was blind for 8 ticks. All because amplified alarms couldn't be evicted.

Dayo's fix: replace amplify with filter on the relay. Filter discards threat_detected entries older than 2 ticks. Now alarms are temporal — they exist briefly and then disappear, making room for fresh data. The alarm system goes from "everything is always an emergency" to "recent threats only." He replays. His strikers move.

**UI Annotations:**
- **Priority-flag visual in buffer bar**: Priority-flagged entries in the context bar show as brighter, slightly raised pips compared to normal entries. When the buffer is full of priority entries, the entire bar is uniformly bright — no variation, no "breathing." This visual uniformity communicates "stuck."
- **Stale data age indicator**: In Inspector, each buffer entry shows an age badge (ticks since arrival). Entries older than 3 ticks fade to a dimmer shade. Priority entries that are also old show a conflicting visual — bright (priority) but faded (stale) — a visual tension that says "important but outdated."
- **Stun cycle visualization**: In the context window chart, stun events appear as white vertical bars. A stun cycle (repeated stuns) creates a visual "barcode" pattern that's immediately recognizable as pathological.

---

### Journey: Priya, 45, Security Consultant (Mission 9, The Double Agent Emergence)

**Context:** Priya is an experienced player building a counter-intelligence architecture. She has a specialist configured to hack enemy relays, forwarding intelligence to a command unit. The command unit has reassign and reroute skills with rules that respond to intelligence data. She's about to discover the hack→reassign→hack emergent loop.

**Minute 0:00 — The Initial Architecture**
Specialist-A: hack ON, hooks broadcasting intelligence on "intel" channel. Command-A: reassign ON, reroute ON, prioritize ON. Rules: (1) "IF intelligence contains enemy_channel_name THEN reroute(Scout-1, listen: enemy_channel_name)" — eavesdropping. (2) "IF intelligence reveals enemy_relay_vulnerable THEN reassign(Specialist-A, priority: hack_relay)" — targeted hacking.

She didn't think of this as a loop. She thought of it as two separate responses to intelligence. But Rule 2 creates a feedback cycle: Specialist-A hacks an enemy → reveals a vulnerable relay → Command-A reassigns Specialist-A to prioritize that relay → Specialist-A hacks the priority target → reveals MORE intelligence → Command-A may re-reassign based on new intel.

**Minute 1:00 — The Loop in Action**
Sealed watch. Tick 15: Specialist-A hacks enemy-Scout-1. Intelligence reveals enemy scout reports go to channel "e-patrol." Tick 17: Command-A receives intelligence (2-tick latency). Rule 1 fires: Scout-1 rerouted to listen on "e-patrol." Now Priya's scout is eavesdropping on enemy communications. Tick 18: Specialist-A hacks enemy-Relay-B. Intelligence reveals Relay-B is the enemy's compression hub — it processes all scout data before forwarding to enemy strikers.

Tick 20: Command-A receives this intelligence. Rule 2 fires: reassign Specialist-A to prioritize hacking Relay-B. The specialist's behavior changes — it starts moving toward Relay-B instead of targeting whatever's closest. Tick 23: Specialist-A hacks Relay-B. The intelligence snapshot reveals the ENTIRE enemy information pipeline: which scouts feed it, which strikers it feeds, what channels it uses. This intelligence is forwarded to Command-A.

Tick 25: Command-A receives the pipeline map. Now its rules have enough information to execute a devastating reroute: it rewires all friendly units to avoid the channels the enemy is monitoring. Priya's network goes dark from the enemy's perspective. The enemy's own intelligence pipeline reports "no contacts" while Priya's specialist continues hacking from within.

**Minute 2:30 — The "I Didn't Program This" Moment**
Priya watches the specialist methodically work through enemy units — not randomly, but in an order that maximizes intelligence value. First the scouts (reveal observation patterns), then the relay (reveal the processing pipeline), then approach the enemy command unit. She thinks: "It looks like it's running an operation." She didn't program the operational sequence. She programmed the command unit's reassignment logic and the specialist's hack priority. The sequence emerged from the intelligence each hack produced, which triggered reassignment, which redirected the next hack. A self-organizing penetration test.

**Minute 3:30 — Inspector Trace**
In Inspector, the decision trace for ticks 15-28 shows a chain: hack → intel → reassign → hack → more intel → reroute → hack → even more intel → reassign. The trace looks like a conversation between the specialist and the command unit. Each hack produces data that shapes the next hack. Priya screenshots the trace and posts it with the caption: "My specialist just ran a pen test without being told to."

**UI Annotations:**
- **Intelligence chain visualization**: In Inspector, hack-intelligence entries have jagged green borders. When an intelligence entry triggered a command reassignment, a thin gold arrow connects the intelligence entry to the reassignment event in the timeline. Multiple connected arrows form a visible "chain" — the intelligence loop rendered as a directed graph.
- **Emergent loop detection**: When Inspector detects a skill→hook→skill cycle (same skill triggered 3+ times via the same channel), it displays a small "🔄 LOOP DETECTED" badge on the timeline. Not an error — an observation. Clicking it highlights all links in the loop.
- **Double agent narrative**: The boot log for Mission 9 includes a line: "COUNTER-INTELLIGENCE MODULE: specialist hacking protocols may exhibit autonomous target selection when paired with adaptive command reassignment. This is expected. This is the design."

---

## Interaction Effects with Locked Decisions

**With one-shot-one-kill:** The matrix's synergies are high-stakes because every eliminated unit breaks its interaction chains. A destroyed relay severs the patrol→compress→amplify pipeline. A destroyed specialist ends the hack→reassign intelligence loop. One-shot-one-kill means the matrix isn't just about building synergies — it's about protecting them. The most synergistic units are the highest-value targets.

**With signal latency:** Every matrix interaction adds latency. Patrol→compress is 2+ ticks (scout→relay). Adding amplify adds 1 tick (relay→broadcast). Forwarding to command adds 1+ tick. Hack→reassign→hack is 6+ ticks per loop iteration. The matrix's depth comes at the cost of speed. Flat architectures are fast but simple; deep architectures are slow but intelligent. The matrix is the game's complexity-latency tradeoff visualized.

**With EM emissions:** Synergistic chains are louder than individual skills. Patrol→compress→amplify generates EM at three points: scout hook (small), relay compress hook (medium), relay amplify (large). Each link in the chain adds EM. The most synergistic architectures are the loudest. Stealth architectures must sacrifice synergy for silence.

**With context overload:** Every skill in a chain generates buffer entries. Longer chains = more buffer pressure. The patrol→compress→amplify→engage chain generates entries at four stages. If any unit in the chain overloads, the chain breaks. Buffer management isn't separate from the interaction matrix — it's the matrix's health system.

---

## Comparable Games

**Slay the Spire's synergy tiers:** Slay the Spire has explicit synergy categories (block, poison, strength, shiv, etc.) but the most powerful combos cross categories (strength + shiv = multiplicative). Robot Uprising's matrix follows the same pattern: within-category synergies (compress+filter+amplify on one relay) are reliable but linear; cross-category synergies (hack→reassign across specialist+command) are powerful but harder to set up.

**Factorio's production chains:** Factorio's item recipes create implicit interaction matrices (iron plate + copper plate → electronic circuit). The matrix is discovered through crafting, not through a grid. Robot Uprising's matrix is similarly implicit — players discover synergies through experimentation, not through a displayed grid. The grid in this document is a designer's tool, not a player-facing feature.

**Magic: The Gathering's color pair interactions:** MTG's 5 colors create 10 two-color pairs, each with characteristic synergies and tensions. Robot Uprising's 5 unit types create 10 two-unit pairings, each with characteristic information flows. The MTG lesson: not all pairings need to be equally powerful. Some pairings (like extract×extract — two specialists both extracting) are intentionally inert, creating space for the powerful pairings to shine.

---

## Sensory Description

**The synergistic chain in sealed watch:** When a patrol→compress→amplify chain fires during the sealed watch, the visual flow is unmistakable. Blue ripple (scout observes) → thin cyan line (hook fires to relay) → three bright buffer pips slide together into one (compress) → concentric green rings expand (amplify). The whole sequence plays out over 3-4 ticks with a rhythmic quality: observe-transmit-process-broadcast. Well-tuned chains create a visual heartbeat. Poorly-tuned chains create visual chaos — overlapping rings, flickering buffer bars, stun flashes.

**The emergent loop in Inspector:** The hack→reassign→hack loop in the Inspector timeline renders as a spiral: each iteration's gold arrow connects to the next iteration, forming a helix pattern in the timeline. The spiral is visually distinctive — unlike any other pattern in the Inspector. Players who see a spiral in their timeline know they've created something self-organizing.

**The trap cascade in sealed watch:** The evade→amplify alarm fatigue trap has a characteristic visual signature: all buffer bars on the board turning uniformly bright red simultaneously. In a healthy architecture, buffer bars have variation — some green, some amber, some red. In alarm fatigue, everything is red at the same time. The uniformity is the signal: healthy diversity has collapsed into pathological sameness.

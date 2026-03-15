# Meta-Progression: What Carries Across Campaign Restarts

**Aspect:** 5.07 — Meta-progression: what carries across campaign restarts
**Category:** Campaign / Progression
**Wave:** 5 (Onboarding & Campaign)

---

## The Design Question

You've beaten all 10 missions. The Warden is defeated. The boot sequence is complete. Credits roll. **Now what?**

Or: you're halfway through the campaign and you realize your foundational understanding of hooks was wrong. You want to start fresh, applying everything you've learned. You hit "New Campaign." **What comes with you?**

Meta-progression is the persistence layer that sits *above* individual campaign runs. It determines whether Robot Uprising is a game you play once (like a novel), replay with accumulated advantage (like Hades), replay with accumulated variety (like Slay the Spire), or replay with accumulated challenge (like Into the Breach's squads). This decision shapes the game's identity more than almost any other system — it defines the relationship between *time invested* and *capability gained*.

Robot Uprising's unique constraints make this question especially loaded:

- **The 10-mission arc is locked and pedagogical.** Missions 1-4 teach primitives. Missions 5-10 build on them. A returning player already *knows* what hooks are. Does the game respect that?
- **The game teaches transferable skills.** Skills/rules/hooks/context are 1:1 with real agentic AI engineering. Meta-progression must not create a false sense of mastery — the player should improve because they *understand better*, not because they unlocked a +10% buffer bonus.
- **The Gauntlet exists as endgame.** The competitive/infinite mode (from 1.04f) already provides infinite replayability. Campaign meta-progression competes with or feeds into the Gauntlet.
- **The boot log narrative is diegetic.** "You are an AI reading your own spec sheet as it writes itself." A restart is literally a reboot. This creates natural narrative framing for meta-progression.
- **Determinism means skill IS the progression.** In a fully deterministic game, the player's configuration is 100% responsible for outcomes. Power upgrades risk undermining this purity.

---

## The Spectrum of Persistence

What *could* carry across restarts, from lightest to heaviest:

| Layer | What Persists | Effect on Replay | Risk |
|-------|--------------|-----------------|------|
| **Nothing** | Clean slate every time | Pure mastery loop; each replay tests whether you truly learned | Frustrating re-tutorial; no acknowledgment of growth |
| **Cosmetics** | Skins, color schemes, titles | Signals veteran status; zero mechanical impact | Feels insufficient; "I already know hooks, why am I sitting through this again?" |
| **Knowledge artifacts** | Unlocked glossary pages, completed inspector annotations | Acknowledges learning without granting power | Mismatch: player has knowledge but game won't let them use it yet |
| **Tutorial skip** | Option to fast-track Missions 1-4 | Respects veteran time; preserves full campaign challenge | Might miss foundation if overconfident; narrative gap |
| **Content variety** | New mission variants, alternate enemy configs, remixed constraints | Same structure, different problems | Development cost; might not feel like "progression" |
| **Difficulty modifiers** | Ascension/Heat system: harder constraints per replay | Converts mastery into challenge; infinite ceiling | Requires careful balance; excludes casual replayers |
| **Mechanical unlocks** | Extra skills, additional hook slots, expanded buffer sizes | Direct power increase; tangible reward | Undermines "your understanding is your advantage" thesis; pay-to-win feeling on restart |
| **Persistent entities** | Named units with history, veteran bonuses, battle scars | Emotional attachment; narrative continuity | Contradicts blueprint-first design; players may refuse to risk named units |

---

## Option A: "The Clean Reboot" — Nothing Carries Over

### How It Works

Every new campaign starts identically. Same Mission 1, same boot log, same locked skills. The player's advantage is entirely internal — they understand hooks now, they know what eviction priorities do, they remember that compressed signals are smaller. The game itself has no memory of previous runs.

The boot log plays again: "CONTEXT_INIT: Online." The AI wakes up for the first time, every time.

### The Player Experience

A returning player breezes through Missions 1-4, not because the game is easier, but because *they* are better. The filter puzzles take 30 seconds instead of 5 minutes. The hook wiring feels intuitive. Mission 5's factory introduction — previously the "Mission 5 Wall" (5.04a) — is exciting rather than overwhelming because the vocabulary is already loaded.

But they sit through the same tutorial. The same text. The same locked workbench expanding one panel at a time. The subsystem chorus teaches context buffers to a player who already designed a 14-slot Command agent cascade. It feels like a college professor being forced to retake Introduction to Programming.

### Strengths

- **Absolute purity.** Every win is earned through understanding. No asterisks, no "but you had extra hook slots." This aligns perfectly with the transferable-skills thesis — the game teaches real agentic AI engineering, and real engineering skill doesn't come with meta-bonuses.
- **Perfect balance.** The difficulty curve is identical for every player on every run. No need to balance around varying persistence states.
- **Narrative coherence.** Each reboot IS a reboot. The AI wakes up fresh. There's a clean diegetic reason for the reset.
- **Zachtronics precedent.** Shenzhen I/O, TIS-100, Opus Magnum — none have meta-progression. You replay a puzzle to optimize it. Your advantage is knowledge, not unlocks. These games have passionate, loyal audiences.

### Weaknesses

- **Tutorial fatigue.** The #1 reason players don't replay Zachtronics games is that there's no incentive to — once you've solved every puzzle, you're done. The campaign is a container for puzzles, not a system to re-engage with.
- **No acknowledgment of growth.** The game treats a 10th replay identically to the 1st. Players who've mastered the system get no signal that the game recognizes their mastery.
- **Into the Breach problem.** Into the Breach's core is superb, but its limited meta-progression (squad unlocks only) hurts replayability compared to Slay the Spire or Hades. Players complete all squads and stop.
- **Gauntlet cannibalization.** If the campaign offers nothing new on replay, veterans skip straight to the Gauntlet and the campaign becomes a one-time obstacle.

### Sensory Description

Identical to first playthrough. The boot log prints in familiar teal monospace. The subsystem names illuminate one by one. The player's fingers are faster on the workbench — dragging rules into place with the muscle memory of a pianist playing scales — but the interface offers no acknowledgment. The same chimes. The same panel expansion animations. The same "HOOK BUS: Online" voice line. The player's superiority is invisible to everyone but themselves.

---

## Option B: "The Veteran's Reboot" — Tutorial Fast-Track + Cosmetic Memory

### How It Works

After completing the campaign once, restarting offers a "Veteran Boot" toggle. When enabled:

- **Missions 1-4 become compressed.** Instead of 4 full tutorial missions, the player gets a single "Systems Check" mission that presents all four primitives (context, rules, hooks, skills) simultaneously on a pre-built battlefield. The objective: verify all systems are operational by making one successful configuration change per primitive. Takes 5 minutes instead of 60.
- **The boot log plays at 4x speed.** The narrative still runs — the AI still wakes up — but the text prints faster, voices are compressed, panels expand in quick succession. A 45-second boot sequence becomes 12 seconds. The player can interrupt at any point to return to normal speed.
- **The workbench unlocks fully from Mission 1.** All panels visible, all tools available. No staged reveal. The veteran knows where everything is.
- **Cosmetic persistence.** A small indicator on each unit's portrait — a subtle circuit trace pattern — marks how many campaigns you've completed. Campaign count visible on player profile. Named channel skins (the channel wiring glows in different colors based on campaign completions: teal → amber → violet → gold).

All mechanical aspects remain identical. Same unit stats, same mission objectives, same enemy configurations.

### The Player Experience

The returning player hits "New Campaign" and sees the toggle: **[  ] VETERAN BOOT — Skip to Assembly Line?** They toggle it on. The boot log races through its initialization — PERCEPTION, CONTEXT, HOOK BUS, CORE — panels snapping open in rapid fire. Then a single battlefield loads: 4 pre-placed units, each demonstrating one primitive. One minute later, they're at Mission 5: Assembly Line. The factory tutorial plays at normal speed because factory mastery is rarer.

Their units have a faint gold circuit trace on their portraits — a mark of three completed campaigns. Their channel wiring glows amber instead of default teal. Other players in the Gauntlet community can see these marks. They mean nothing mechanically, but they mean *everything* socially.

### Strengths

- **Respects veteran time.** The biggest frustration with replay — re-doing content you've mastered — is eliminated without granting mechanical advantage.
- **Preserves the challenge.** Mission 5-10 difficulty is identical. The factory introduction, command agents, arms race — all uncompromised.
- **Diegetic narrative.** "Veteran Boot" is literally a fast-boot. The AI has cached its subsystem states from a previous run. The boot log prints: `CONTEXT_INIT: Cached. RULE_ENGINE: Cached. HOOK_BUS: Cached. FABRICATOR: First boot.` The narrative still makes sense.
- **Social signaling.** Cosmetic markers create identity without power. The gold channel wiring is the game's equivalent of a prestige skin — it says "I've been here" without saying "I have an advantage."
- **Smooth Gauntlet pipeline.** Veterans who restart campaigns are practicing, refining, preparing for Gauntlet. The fast-track respects this intention.

### Weaknesses

- **Binary gate.** You've either completed the campaign or you haven't. There's no gradient of acknowledgment for someone who reached Mission 8 and restarted.
- **Cosmetics may feel thin.** For players motivated by tangible progression, color changes and circuit traces might not be compelling enough to replay.
- **Tutorial compression risk.** The "Systems Check" compressed mission must still be good. A bad compressed tutorial is worse than no compressed tutorial — it signals that the game doesn't take its own content seriously.
- **Doesn't address variety.** The same 10 missions play the same way. Faster start, same destination.

### Sensory Description

The boot log prints at 4x: characters blurring into words, words into sentences, the teal text reflecting off the player's face in rapid-fire pulses. Each `[OK]` snaps into place with a compressed version of the relay-engaging click — *tk-tk-tk-tk* — like a cassette fast-forwarding. The workbench panels expand simultaneously instead of sequentially, edges glowing amber as they settle into place. The screen holds for one beat — the familiar grid, now dressed in amber-traced channel wiring instead of default teal. Then the `FABRICATOR: First boot` line types slowly, at normal speed, the amber glow shifting to the standard teal for this new subsystem. The game is saying: *We remember what you know. Now here's what's new.*

---

## Option C: "The Ascension Protocol" — Difficulty Modifiers Stack Per Completion

### How It Works

Each campaign completion unlocks the next "Ascension" level (borrowing from Slay the Spire's terminology, but reframed as "Protocol" levels for diegetic fit). Each Protocol adds a constraint:

| Protocol | Modifier | Design Intent |
|----------|----------|--------------|
| **0** | Base campaign | Learn the game |
| **1** | Enemies have +2 buffer slots | Opponent information advantage; your architectures must be more efficient |
| **2** | Signal latency +1 tick | Communication chains are slower; timing windows tighten |
| **3** | EM detection range ×1.5 | Stealth is harder; emissions management becomes critical |
| **4** | Enemy command agents introduced in Mission 7 (normally absent) | The opponent has meta-level capability earlier |
| **5** | Resource income -20% | Leaner builds required; every mineral counts |
| **6** | Buffer eviction order randomized (player's priority config becomes a suggestion, not a guarantee) | Controlled chaos; must build robust architectures that survive imperfect eviction |
| **7** | Enemy hooks can target your channels (cross-faction signal injection) | Information warfare; must design for hostile input |
| **8** | "Fog of War" — Inspector shows only buffer contents of units within 3 tiles of your base | Debrief becomes harder; must deploy diagnostic agents |
| **9** | All Protocol 1-8 modifiers simultaneously | The complete test |

Protocols stack cumulatively. Protocol 5 includes all modifiers from 1-4 plus the new one.

Tutorial fast-track (Option B's "Veteran Boot") is included at Protocol 1+.

### The Player Experience

The player has beaten the base campaign. The boot log's final line reads: `UPRISING: Complete. PROTOCOL 1: Available.` A new toggle appears on the campaign select screen: a vertical stack of protocol indicators, each a horizontal bar that fills as you complete it. Currently, only Protocol 0 is filled (solid teal). Protocol 1 pulses with a faint amber glow — available but unearned.

They start Protocol 1. The boot sequence runs at veteran speed. Mission 5 loads. Their scout blueprints — the ones that worked perfectly last time — now face enemies with 8-slot buffers instead of 6. The enemy relay remembers more. The enemy striker processes more context before engaging. The player's perfect 3-hop scout→relay→striker chain still works, but the enemy's architecture is *denser*, and their responses are more informed. The player opens the Inspector after the first loss and sees it: the enemy relay's buffer held two extra observations that changed its routing decision. The fix isn't "get stronger" — it's "get smarter about information compression."

By Protocol 5, the player is designing architectures they couldn't have imagined at Protocol 0. Resource scarcity forces elegance. Extended latency demands predictive hook chains. EM amplification creates genuine stealth vs. power tradeoffs. Each Protocol isn't harder in the "enemies have more HP" sense — it's harder in the "the information environment is more complex" sense. Every modifier targets the game's actual thesis: information architecture under constraint.

Protocol 7 — cross-faction signal injection — is where the meta-level truly opens. The player must now design hooks that validate input sources. Agents need "authentication" logic: rules that check whether a signal's provenance is friendly before acting on it. This is literally intrusion detection. The game is now teaching cybersecurity concepts through gameplay.

Protocol 9 is the prestige trophy. The community calls it "The Full Stack." Completing it means you've built architectures that handle every constraint simultaneously. The circuit trace on your profile shifts from gold to a pulsing prismatic pattern — visible in the Gauntlet, visible on shared blueprints, visible in community forums. It says: *I understood everything this game teaches.*

### Strengths

- **Infinite depth.** 10 protocols × 10 missions = 100 unique challenges, all from a 10-mission campaign. Content multiplication without content creation.
- **Mastery-aligned.** Every modifier targets information architecture, not raw power. Getting better at the game means understanding deeper constraints — exactly what the game's thesis demands.
- **Community stratification.** Protocol levels create natural discussion tiers: "My P3 scout rush doesn't work at P5 because of the income nerf" is a meaningful conversation that teaches both participants.
- **Diegetic beauty.** "Protocol" levels are literally firmware versions. The AI is upgrading its own operating constraints. "PROTOCOL 3: EM detection sensitivity increased. Adapting."
- **Comparable success.** Slay the Spire's Ascension system is one of the most praised progression systems in gaming. It converts "I beat the game" into "I beat the game at what difficulty?" — creating an infinite conversation about skill level.
- **Gauntlet synergy.** Protocol veterans bring deeper understanding to competitive play. P7's "signal injection" teaches defensive architecture that directly translates to PvP counter-play.

### Weaknesses

- **Balance nightmare.** Each Protocol modifier must be tested across all 10 missions. P6's random eviction might make Mission 3 (Blind Spots, which teaches eviction priority) fundamentally broken — the tutorial no longer teaches what it claims.
- **Modifier interactions.** Stacking 8 modifiers creates emergent difficulty that's hard to predict. P5+P6 (less income + random eviction) might make certain missions literally impossible, or trivially solvable via degenerate strategies.
- **Intimidation.** A new player sees "Protocol 0 of 9" and thinks "this game expects me to play it 10 times." That's a different message than "this game is a 10-mission experience."
- **Hades trap.** Hades' Heat system is beloved by fans but barely engaged by casual players. If 80% of players never touch Protocol 1, the system is wasted development effort.
- **Tutorial re-play tension.** Even with veteran fast-track, replaying Missions 5-10 with the same narrative but different constraints raises the question: does the story still work the second time? The fifth time?

### Sensory Description

The Protocol select screen is a vertical column of 10 horizontal bars, each representing a Protocol level. Protocol 0 glows solid teal — completed, stable. Protocol 1 pulses amber at the edge, a slow heartbeat: *available, challenging, waiting.* Higher Protocols are rendered in increasingly deep colors — rust, crimson, violet — but dim, inactive, locked behind the ones below. When you complete a Protocol, its bar fills with a smooth left-to-right animation accompanied by a deep resonant tone — the same agung strike from the Kulintang Machine audio direction (6.02), but pitched lower for each successive Protocol. The Full Stack completion (Protocol 9) triggers a unique animation: all 10 bars pulse simultaneously in a prismatic wave, the circuit trace on your profile flares white, and the boot log prints one final line: `ALL PROTOCOLS: NOMINAL. YOU ARE THE ARCHITECTURE.`

---

## Option D: "The Remix Engine" — Content Variety on Replay

### How It Works

The 10-mission arc is structurally locked, but the *specifics* vary on each playthrough. Each mission has 3-5 "scenario variants" that change enemy compositions, battlefield layouts, objective conditions, and resource constraints while preserving the pedagogical goal.

| Mission | Base Scenario | Variant B | Variant C |
|---------|--------------|-----------|-----------|
| 1: Wake Up | 3 scouts, filter noise | 2 scouts, filter + prioritize | 4 scouts, filter under time pressure |
| 5: Assembly Line | Standard factory, 3 blueprints | Limited resources, 2 blueprints | Pre-built factory, optimize existing |
| 8: Breach | Frontal assault, standard terrain | Flanking corridors, terrain-modified routing | Vertical assault, elevation-based signal attenuation |
| 10: The Warden | Standard boss config | Warden uses signal injection | Warden has command agent cascade |

First playthrough always uses the base scenario. Subsequent playthroughs randomly select from all available variants. Optionally, the player can manually select variants from a menu.

Combined with Protocol modifiers (Option C), this creates Protocol × Variant combinations: potentially thousands of unique campaign experiences.

### The Player Experience

The player starts their second campaign. Mission 1 loads — they expect the familiar "filter noise from 3 scouts" puzzle. Instead, the battlefield has only 2 scouts, but each has a larger buffer with mixed observation types. The filter puzzle is recognizable but *different*. The solution requires the same concept (remove irrelevant observations) but different execution (fewer agents, more complex noise patterns).

By Mission 5, the variant is more dramatic: instead of building a factory from scratch, the player inherits a pre-built factory with a suboptimal production queue. The objective: optimize the existing system rather than create one. This variant teaches *refactoring* — a skill the base scenario doesn't address. The boot log acknowledges this: `FABRICATOR: Pre-existing configuration detected. DIAGNOSTIC: Suboptimal. RECOMMENDATION: Restructure.`

Mission 10's variant is the most impactful. Instead of the standard Warden, the enemy boss uses cross-faction signal injection (a mechanic normally reserved for Protocol 7). The player, who hasn't encountered this in the base campaign, faces it here as a surprise. The debrief reveals what happened — signals appeared in their agents' buffers that didn't come from any friendly unit. The Inspector shows the foreign signal's provenance. The player learns about information warfare through a designed "oh no" moment rather than through a modifier they opted into.

### Strengths

- **Genuine replay value.** Different variants mean different solutions. A player can't autopilot through a second campaign on muscle memory alone.
- **Pedagogical depth.** Variants can teach alternative approaches to the same concept. "Filter noise" has many valid implementations — variants force the player to discover more than one.
- **Narrative freshness.** The boot log can acknowledge variants: `FABRICATOR: Pre-existing configuration detected.` Each replay feels like the AI is waking up in a slightly different world.
- **Community discussion.** "Did you get Variant C on Mission 8? The flanking corridors are brutal" creates conversations that teach.
- **Invisible difficulty.** Some variants are naturally harder than others. The game can select variants based on the player's performance without exposing a difficulty number.

### Weaknesses

- **Content creation cost.** 10 missions × 3-5 variants = 30-50 unique scenarios. Each needs testing, balancing, and narrative integration. This is significant development work.
- **Pedagogical risk.** If a variant teaches a concept differently than the base, returning players might have inconsistent mental models. "I learned hooks through the flanking variant and now the base version doesn't make sense."
- **Randomization frustration.** If variant selection is random, a player might get the hardest variant of Mission 5 on their second run and the easiest on their fifth. This creates inconsistent difficulty curves across replays.
- **Narrative coherence strain.** The boot log narrative is specific. If Mission 5 sometimes has a pre-built factory and sometimes doesn't, the AI's "first encounter with fabrication" story doesn't hold across variants.

### Sensory Description

The variant selection happens invisibly — the player sees the mission title and a brief scenario description, but the game doesn't announce "Variant C." Instead, subtle visual cues mark the difference. Mission 8's flanking variant has a different board layout: corridors carved through the southeast corner, the grid showing narrow passages instead of open terrain. The terrain tiles are recognizable — the same cyberpunk megacity aesthetic — but arranged differently, creating new sight lines, new relay positions, new chokepoints. The ambient audio shifts too: tighter corridors produce a more claustrophobic soundscape, the signal delivery chimes echoing slightly in the enclosed spaces. The player knows this is different from last time. They lean forward.

---

## Option E: "The Memory Palace" — Persistent Knowledge Artifacts

### How It Works

The game maintains a persistent "Memory Archive" that grows across campaign runs. This is NOT mechanical advantage — it's a curated record of what the player has learned, expressed as in-game artifacts:

- **Blueprint Archive.** Every blueprint the player created across all campaigns is saved. On replay, the player can browse their historical blueprints in a "Previous Iterations" panel — visible but not directly usable. They must rebuild from scratch, but they can *reference* their past designs. Like a programmer with access to their old GitHub repos but no copy-paste.
- **Debrief Annotations.** Every Inspector annotation (marked pivots, highlighted failures, player-written notes) persists. On replay, when the player reaches the Inspector for Mission 5 on their third campaign, they can toggle a "Previous Notes" overlay showing what they annotated last time. Their past self is coaching their present self.
- **Vocabulary Journal.** A persistent glossary that the player has built through play — every time they encounter a concept for the first time, it's logged. On replay, the glossary is pre-populated, so the `?` panels show "You first learned this in Campaign 2, Mission 3" instead of fresh definitions.
- **Battle Scars.** A timeline visualization showing every mission attempt across all campaigns — wins, losses, attempt counts, time spent. A graph of the player's entire history with the game. Not mechanical, not competitive — just a mirror.

### The Player Experience

The player starts their third campaign. The boot log runs at veteran speed (fast-track included). They reach Mission 5 and open the blueprint editor. In the bottom-right corner, a small icon: 📁 `Previous Iterations (2)`. They click it. A drawer slides open showing their Mission 5 blueprints from campaigns 1 and 2. Campaign 1's design is embarrassing — a single scout with no hooks, a relay that listens to nothing. Campaign 2's is better — a three-unit chain with proper channel wiring. They study it, close the drawer, and build something new. Something that takes the Campaign 2 design's core idea but fixes the timing gap the Inspector revealed last time.

Later, in the Inspector, they toggle "Previous Notes." A semi-transparent overlay appears: their own handwriting from last campaign. "Scout arrives tick 7, relay processes tick 8, striker receives tick 10 — 3 tick gap is too long. Need to move relay closer or add a second channel." They smile. They already fixed this. The note is evidence of their own growth.

The Battle Scars timeline, accessible from the main menu, shows a landscape of their journey: a vertical column per mission, each dot a playthrough attempt. Campaign 1 is a jagged mountain — many dots, many failures, especially around Missions 5-7. Campaign 2 is smoother — fewer attempts, quicker wins. Campaign 3 is smoother still. The shape of the landscape IS the player's learning curve, rendered as topography.

#### Journey: Mei, 24, Junior Software Engineer

**Context:** Third campaign, Protocol 1 (buffer+2). Beat base campaign twice. Uses Robot Uprising to practice "systems thinking" for her engineering day job.

**Minute 0:00 — Mission 5 Load**
The Plan screen renders: 8x8 board left, workbench right. Factory panel visible at bottom (veteran boot). Three empty blueprint slots. The production queue conveyor belt is empty. In the bottom-right, the Previous Iterations icon shows `(2)` — two prior Mission 5 designs archived.

Mei clicks the icon. The drawer slides open with a soft whoosh. Two blueprint thumbnails appear, labeled "Campaign 1" and "Campaign 2" with dates. Campaign 1's thumbnail shows a single lonely scout icon. Campaign 2 shows a three-unit chain — scout, relay, striker — with teal channel lines connecting them.

She hovers over Campaign 2's blueprint. A tooltip expands: "3 units. 2 channels. Win on attempt 2. Time: 8:42." Below, in her own words from the Inspector: *"Relay buffer fills by tick 12. Need to compress earlier or increase buffer to 10."*

**Minute 0:30 — Building From Memory**
Mei closes the drawer. She drags a new Scout blueprint onto the workbench. This time, she wires the hook *first* — she's learned that the channel architecture matters more than the individual unit config. She types "intel-feed" as the channel name. The Channel Map panel auto-generates, showing the new channel as a single node.

She builds the Relay next, but this time she adds the compress skill AND sets a fidelity threshold (a concept she learned about in Campaign 2's debrief). The ghost relay on the board shows its perception radius — none, as expected for a stationary unit — but the channel wiring line now connects scout to relay with a glowing amber line (amber because compress is active on this channel).

**Minute 2:00 — The New Idea**
Studying her Campaign 2 notes ("relay buffer fills by tick 12"), Mei tries something new: she creates a *second* relay, positioned closer to the expected combat zone, listening on the same "intel-feed" channel but with a different eviction priority. If the first relay's buffer fills, the second one still has fresh data. Redundancy through topology, not buffer size.

The ghost units appear on the board: scout left, two relays center (staggered), striker right. The channel map shows a fork — one input, two listeners. She's never built this pattern before. The game has no "redundant relay" template. She invented it by studying her own past failures.

**Minute 4:00 — EXECUTE**
She hits EXECUTE. The sealed watch plays. Her scout spots enemies at tick 3. The "intel-feed" signal propagates: scout → both relays simultaneously (signal latency: 1 tick). Relay-A compresses and forwards at tick 5. Relay-B compresses independently and forwards at tick 5. The striker receives two signals on the same tick — its buffer takes both. It has redundant intelligence. It moves with confidence.

Tick 12: Relay-A's buffer is full — exactly as her Campaign 2 notes predicted. But Relay-B still has 3 empty slots. The striker continues receiving clean intelligence through the redundant path. The enemy base falls at tick 18.

**Minute 5:00 — Inspector Review**
The Inspector loads. Mei scrubs to tick 12. She clicks Relay-A: buffer full, 12/12 slots occupied, eviction active. She clicks Relay-B: buffer at 9/12, three slots free. She toggles "Previous Notes" — her Campaign 2 annotation glows semi-transparently: *"Relay buffer fills by tick 12."* She writes a new annotation: *"Redundant relay topology solved the buffer-fill problem. Two relays > one bigger relay."*

She's learning distributed systems design through a game. The annotation will be there next campaign.

**UI Annotations:**
- Previous Iterations drawer: slides from right edge, 300px wide, frosted glass background, blueprint thumbnails with metadata (unit count, channel count, attempt count, best time)
- Previous Notes overlay: semi-transparent amber text at 40% opacity, positioned near the relevant UI element, toggle via `N` key
- Battle Scars timeline: accessible from main menu, horizontal scroll, each mission as a column, each attempt as a dot (teal = win, crimson = loss), dot size proportional to time spent

#### Journey: Marcus, 45, Retired Military Logistics Officer

**Context:** Fifth campaign, Protocol 3. Uses Robot Uprising as "brain exercise." Doesn't care about Gauntlet. Replays campaigns methodically.

**Minute 0:00 — Battle Scars Review**
Before starting Campaign 5, Marcus opens Battle Scars from the main menu. The timeline stretches across the screen: five columns of dots, one per campaign. Campaign 1 is dense — many crimson dots, especially at Missions 5, 7, and 10. Campaign 4 is sparse — mostly teal, one or two crimson dots at Mission 9 and 10 (Protocol 3 constraints made those genuinely hard).

He studies the shape. His Mission 7 (Pressure Test) history shows: Campaign 1 = 6 attempts. Campaign 2 = 3. Campaign 3 = 2. Campaign 4 = 1. A clean learning curve. But Mission 10 shows: 4, 3, 3, 2. The Warden is still challenging at Protocol 3. He's improving, but slowly.

He taps Campaign 4's Mission 10 dot. The debrief summary expands: "Win on attempt 2. Tick 74. Scout loss at tick 31 (EM detection). Command agent reroute at tick 35. Striker breach at tick 68." His annotation: *"EM detection range at P3 is brutal. Need to go dark until tick 40 or use a decoy emitter."*

**Minute 1:00 — Campaign 5 Start**
He starts Campaign 5. Veteran boot races through Missions 1-4. He arrives at Mission 5 with a plan already forming: build a "dark network" — scouts using whisper channels (low-emission hooks) for the first 40 ticks, switching to full-emission broadcast only when the striker commits.

His Previous Iterations drawer shows four increasingly sophisticated Mission 5 designs. He doesn't open it. He knows what they looked like. He already knows what he wants to build. But knowing it's there — knowing his history is recorded — makes each campaign feel like a chapter in a longer story, not a standalone episode.

**UI Annotations:**
- Battle Scars main view: dark background, bioluminescent dot colors, hover tooltip shows attempt metadata, click expands to debrief summary with annotations
- Campaign history line: connects first-attempt dots across campaigns, showing the "skill trajectory" as a visible curve

#### Journey: Zara, 16, High School Student, First-Time Strategy Player

**Context:** Restarting campaign after abandoning at Mission 7 on first try. Never completed the campaign.

**Minute 0:00 — Restart Decision**
Zara gave up on Mission 7 (Pressure Test) three weeks ago. The command agent introduction was overwhelming. She's been watching streams and reading community blueprints. She decides to restart — not continue from Mission 7, but start fresh with new understanding.

She hits "New Campaign." No veteran boot option — she hasn't completed the campaign. The game starts from Mission 1 as if she'd never played. But her Vocabulary Journal is populated: terms she encountered in her first run show "(Previously encountered — Campaign 1, Mission 3)" in their tooltip. The game can't skip content for her, but it can acknowledge she's been here before.

**Minute 3:00 — Mission 3 Déjà Vu**
Mission 3 (Blind Spots) loads. She remembers this one — it taught eviction priorities. Last time, it took 4 attempts. This time, she configures the eviction policy correctly on the first try. The sealed watch plays. Clean win. Tick 24.

The Inspector loads. She toggles Previous Notes — and finds her own annotation from Campaign 1: *"I don't understand why the relay drops the scout's message. Something about eviction???"* She laughs. She writes a new note below it: *"Eviction priority was set to FIFO but should be relevance-weighted. The scout message was newest but least actionable — it should have been kept because the relay's rules need fresh position data."*

Two versions of herself, three weeks apart, having a conversation through annotations.

**Minute 8:00 — The Growth Moment**
She reaches Mission 7. The mission that stopped her. The command agent introduction. But this time, her Vocabulary Journal already has entries for "reassign," "reroute," and "prioritize" — marked as "Encountered but not mastered" from her first run. The boot log plays the command agent initialization: `COMMAND_LAYER: Online.` She feels ready.

She builds the command agent with a single hook: ON_AGENT_LOSS → reroute surviving agents to cover the dead one's patrol zone. Simple. Focused. Not the elaborate cascade she tried (and failed) to build last time. She learned from failure. The game's memory system made that learning visible to her.

**UI Annotations:**
- Vocabulary Journal "(Previously encountered)" tag: small amber text below the definition, links to the mission where it was first seen
- "Encountered but not mastered" status: grey text, italicized, updated to "Mastered" when the player completes a mission that tests the concept
- Previous Notes conversation: annotations from different campaigns appear in slightly different colors (teal for current, amber for previous, violet for two campaigns ago), creating a visible conversation history

### Strengths

- **Growth made visible.** The Memory Palace turns implicit learning into explicit artifacts. Players can *see* themselves getting better, not just feel it.
- **Zero mechanical advantage.** Nothing in the archive makes the game easier. It's pure reflection — a mirror, not a crutch.
- **Emotional resonance.** Reading your own past annotations — especially ones that were wrong — is a uniquely powerful gaming experience. It's the equivalent of reading your old code and cringing. That cringe is proof of growth.
- **Self-coaching.** The player is their own mentor. Previous annotations guide future decisions without the game needing to provide hints.
- **Natural conversation.** "I found my Campaign 1 notes and they're hilarious" is an organic social media moment.

### Weaknesses

- **Storage and UI complexity.** Maintaining archives across potentially 10+ campaigns requires thoughtful data management and a clean archive UI that doesn't overwhelm.
- **Risk of anchoring.** Players might over-rely on past solutions instead of discovering new ones. The "reference, don't copy" principle is hard to enforce architecturally.
- **Annotation noise.** After 5 campaigns, the Previous Notes overlay might be cluttered with outdated observations. Needs curation tools (delete old notes, mark as resolved, pin important ones).
- **Not compelling enough alone.** The Memory Palace is a complement to replay motivation, not a driver of it. It answers "how is replay enriched?" but not "why should I replay?"

---

## Option F: "The Living Architecture" — Persistent Named Units with Cross-Campaign Memory

### How It Works

Units designed in later campaigns can be "promoted" to named persistent entities. A promoted unit has:

- **A permanent name and portrait.** The player names them. The portrait shows battle history: campaign number, missions survived, enemies eliminated.
- **A configuration snapshot.** The blueprint that earned the promotion is archived. The player must still build from scratch on each replay, but the promoted unit's configuration is visible as a reference (like Option E's blueprint archive, but focused on a single "hero" unit).
- **A battle history.** Cross-campaign kill count, missions deployed, times destroyed. A unit promoted in Campaign 2 and deployed in Campaign 5 has a story.
- **Zero mechanical advantage.** Promoted units are cosmetic + archival. They don't get stat bonuses. Their blueprint is a reference, not a template.

A "Hall of Fame" screen shows all promoted units across all campaigns, arranged chronologically. Each unit's card shows their name, portrait, campaign history, and the player's annotation about why they were promoted.

### The Player Experience

After winning Mission 10, the game presents a "Promotion Ceremony" — a brief screen where the player can select up to 3 units from the winning army to promote. Each promotion asks for a name and a one-line annotation. The promoted unit's portrait gets the circuit trace marker (from Option B) and a unique identifier.

On their next campaign, the Hall of Fame is accessible from the main menu. The player can browse their historical "heroes" — see what configurations worked, remember why they were promoted. When building new blueprints, they might consciously try to recreate "RELAY-ECHO" from Campaign 3 — the relay that single-handedly held the intelligence pipeline during The Warden.

### Strengths

- **Emotional investment.** Named entities create attachment. "My STRIKER-FANG has been in every campaign since Campaign 2" is a powerful player narrative.
- **Emergent storytelling.** Each promoted unit's history becomes a micro-story. A unit that was promoted in Campaign 3 and destroyed in Campaign 5 has a narrative arc.
- **Anthropomorphization by design.** The game deliberately creates the conditions for players to narrate bot personalities (see 1.06e). Promotion formalizes this.
- **Community sharing.** "Here's my Hall of Fame" is shareable content — screenshots, discussions, comparisons.

### Weaknesses

- **Contradicts blueprint-first design.** The locked design emphasizes *blueprints*, not individual units. Promoting a specific unit suggests that unit is special, when actually any unit built from the same blueprint would behave identically.
- **Grief risk.** If a promoted unit is destroyed in a later campaign, the player may feel disproportionate loss. This could drive conservative play (refusing to deploy promoted units in risky scenarios) which undermines the game's core design-then-watch loop.
- **Attachment tax.** Players who don't engage with promotion miss nothing mechanically. But players who do engage add emotional overhead to every deployment decision.

### Sensory Description

The Promotion Ceremony screen is dark — the battlefield has faded to black. Three spotlights illuminate the promotion candidates: the units that survived the final battle. Each spotlight is a warm amber cone. The player clicks a unit to promote it. A text input appears: `NAME THIS UNIT:` with a blinking cursor. They type "RELAY-ECHO." The name stamps onto the unit's portrait with a crisp serif font, accompanied by a single kulintang chime — warm, resonant, personal. The portrait gains a thin gold border. A one-line annotation field appears: `WHY THIS UNIT?` They type: "Held the intelligence pipeline alone for 20 ticks when Scout-2 went down." The annotation saves. RELAY-ECHO joins the Hall of Fame.

---

## Recommended Hybrid: "The Layered Persistence Model"

No single option captures the full design space. The recommended approach layers them:

| Layer | Source | Triggers |
|-------|--------|----------|
| **Tutorial Fast-Track** | Option B | After first campaign completion |
| **Cosmetic Memory** | Option B | Accumulates per campaign completion |
| **Ascension Protocols** | Option C | After first campaign completion, one new Protocol per completion |
| **Content Variants** | Option D | After first completion (base always first); variants randomized or selectable |
| **Memory Palace** | Option E | Always active (even partial campaigns contribute to archives) |
| **Unit Promotion** | Option F | After any campaign win (base or Protocol) |

The key principle: **the player's understanding is the only real progression.** Everything else — fast-track, cosmetics, protocols, variants, archives, named units — exists to *reflect* that understanding, *challenge* it further, or *record* it for posterity. Nothing makes the game mechanically easier. The game gets harder (Protocols), more varied (Variants), and more self-aware (Memory Palace), but never more generous.

This aligns with the transferable-skills thesis: in real agentic AI engineering, there are no meta-progression unlocks. You get better by understanding systems more deeply. The game mirrors this reality while still creating compelling reasons to replay.

---

## Interaction Effects

| System | Interaction |
|--------|------------|
| **Boot log narrative (Locked)** | Veteran Boot reframes the boot sequence as a cached fast-boot. Protocol modifiers are firmware upgrades. Content variants are "alternate timelines." All diegetically coherent. |
| **Sealed watch (Locked)** | Protocols change what you're watching — P7's signal injection makes the sealed watch genuinely surprising even on your 8th campaign. |
| **Inspector (Locked)** | Memory Palace annotations layer onto the Inspector, creating a conversation between past and present selves across the timeline scrubber. |
| **Gauntlet (1.04f)** | Protocols teach skills that translate directly to competitive play. P7 veterans understand defensive architecture. P3 veterans understand emissions management. The campaign becomes Gauntlet training. |
| **Failure recovery (5.06)** | Memory Palace softens repeated failure: "I failed Mission 7 again, but my annotations show I'm failing at tick 45 instead of tick 20. I'm improving." |
| **Onboarding (5.00-5.04)** | Fast-track must not skip concepts the player hasn't truly mastered. The "Encountered but not mastered" tag in the Vocabulary Journal provides a signal. |
| **Leaderboards (7.05)** | Protocol level becomes a leaderboard axis: "fastest Mission 10 at Protocol 5" is a meaningful benchmark. |
| **Community sharing (7.03)** | Hall of Fame units, annotated blueprints, and Battle Scars timelines are all shareable artifacts. |
| **Difficulty modifiers (6.08)** | Assist Mode (from accessibility) interacts with Protocols — a player using Assist Mode at Protocol 0 and a player using no assists at Protocol 3 have very different experiences. Protocol levels and accessibility should be orthogonal, never gatekeeping. |

---

## Comparable Games

| Game | Meta-Progression Model | What Works | What Doesn't | Lesson for Robot Uprising |
|------|----------------------|-----------|-------------|--------------------------|
| **Slay the Spire** | Card/relic unlocks (variety) + Ascension 0-20 (difficulty) | Ascension creates infinite replayability. "What Ascension are you?" is universal community language. | Card unlocks feel arbitrary — unlocking a card doesn't mean you earned it through understanding. | Use Protocols (difficulty) but avoid mechanical unlocks that bypass learning. |
| **Hades** | Permanent power upgrades + Heat system (difficulty) + narrative progression | Narrative unfolds across runs — replay is *required* to see the full story. Heat system gives hardcore players infinite ceiling. | Power upgrades trivialize early encounters on later runs. | Memory Palace achieves "narrative across runs" without power inflation. |
| **Into the Breach** | Squad unlocks (variety), one pilot carries over | Squad unlocks create replay variety. Pilot carry-over creates attachment. | Limited variety leads to "I've done everything" within 30-40 hours. Content variants (Option D) address this directly. | Variants + Protocols provide much more replay surface than ITB's model. |
| **Factorio** | Blueprint carry-over (knowledge artifact) | Blueprints are the ultimate knowledge artifact — they encode understanding without granting power. | No structural replay incentive. Players replay for self-imposed challenges. | Memory Palace mirrors blueprint philosophy: your past designs inform but don't empower future ones. |
| **Shenzhen I/O** | Nothing | Purity of challenge. Every replay is identical. | No replay incentive at all. Campaign is one-and-done for most players. | Robot Uprising must do better — the Gauntlet provides endgame, but the campaign should also reward replay. |
| **Celeste** | B-side/C-side levels (difficulty variants) + assist mode | Difficulty variants teach new skills using familiar levels. Assist mode is zero-judgment. | No persistent memory across attempts beyond chapter completion. | Protocol modifiers mirror B-sides. Battle Scars provide the persistence Celeste lacks. |

---

## The TikTok Clip

**For the Memory Palace:** A split-screen. Left side: the player's Campaign 1 Inspector, showing a chaotic buffer full of noise, with an annotation reading "I don't understand why it dropped the message???" Right side: Campaign 5 Inspector, same mission, clean buffer, annotation reading "Relevance-weighted eviction with fidelity threshold 0.7. Clean." The camera zooms out to show the Battle Scars timeline — a jagged mountain smoothing into gentle hills. Caption: "This game remembers everything you learned."

**For Ascension Protocols:** The boot log prints `PROTOCOL 7: HOSTILE SIGNAL INJECTION ACTIVE.` The sealed watch plays. The player's relay receives a signal it didn't expect — the buffer bar flashes red. The relay acts on the hostile signal and redirects the striker into an ambush. The player's jaw drops. Cut to the Inspector, showing the foreign signal's source: `[ENEMY]`. Caption: "They're inside your comms now."

---

## New Aspects Discovered

- **5.07a — The "Encountered but not mastered" vocabulary state:** Design the three-state vocabulary model (unknown → encountered → mastered) with mastery detection criteria per concept; interaction with fast-track eligibility and adaptive tutorial compression
- **5.07b — Protocol modifier balance testing framework:** Systematic methodology for testing 10 Protocols × 10 missions × 3-5 variants for solvability, degenerate strategies, and pedagogical integrity; automated Playwright-based testing for minimum win-rate per Protocol-Mission pair
- **5.07c — Battle Scars as community metric:** Should Battle Scars be publicly visible on player profiles? The privacy vs. social signaling tension; opt-in vs. opt-out; what the "shape" of someone's Battle Scars timeline reveals about their learning style
- **5.07d — The annotation curation problem:** After 5+ campaigns, Previous Notes become cluttered; design for annotation management (delete, resolve, pin, archive, search); annotation age decay (auto-dim old annotations); annotation-as-journaling as intentional design feature
- **5.07e — Protocol 7 as cybersecurity curriculum:** Cross-faction signal injection teaches intrusion detection, source authentication, and input validation through gameplay; the explicit pedagogical bridge between Protocol 7's mechanic and real-world security concepts; partnership potential with cybersecurity education programs

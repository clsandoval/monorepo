# Mission Type as Difficulty Language

**Aspect:** 5.08c — Mission type as difficulty language: using type names instead of star ratings; player self-selection into preferred types
**Category:** Campaign / Mission Design
**Wave:** 5 (Onboarding & Campaign)

---

## The Design Question

Traditional games communicate difficulty with numbers: 1-5 stars, skull ratings, colored tiers. Robot Uprising has a unique opportunity because its mission types (Filter Puzzle, Relay Network, Stealth Run, Siege Defense, Escort, Factory vs Factory) already communicate **what kind of thinking** is required — and that's far more useful than "how hard" a mission is. A "3-star mission" tells you nothing. A "Relay Network" mission tells you that you're building signal topology. The type name IS the difficulty signal, because different players find different types challenging based on their architectural habits.

This aspect explores: should Robot Uprising replace numeric difficulty entirely with type-based communication? What does that UI look like? How do players navigate it? What are the failure modes?

---

## The Problem with Star Ratings

### The BATTLETECH Lesson

BATTLETECH uses a skull-based Challenge Rating system (0.5 to 5 skulls) that maps roughly to enemy lance tonnage. Players quickly discovered the system was unreliable — a hidden ±1 skull variance means a 3-skull mission could spawn 2-skull or 4-skull opposition. Worse, skull count doesn't account for mission TYPE. A 3-skull Base Capture plays nothing like a 3-skull Escort. The community response was telling: forum threads with titles like "Mission skull/star ratings are NOT accurate at all" and "mission skulls mean FK all?" dominated the discussion boards.

The deeper issue: skull ratings conflate **scope** with **difficulty**. A BATTLETECH developer clarified that "difficulty" in contracts means "scope of content" — scaring farmers is "easy" not because the fight is trivial, but because that's low-tier mercenary work. Robot Uprising faces the same ambiguity. Is a mission "hard" because it has more enemies, or because it requires a conceptual leap the player hasn't made yet?

### What Numbers Can't Communicate

A 4-star mission tells you it's harder than a 3-star mission. It doesn't tell you:
- Which primitives are being tested (hooks? rules? context config?)
- Which failure modes are most likely (buffer overflow? signal latency? EM detection?)
- Which architectural archetype will struggle (the minimalist? the over-engineer? the relay-heavy player?)
- What KIND of hard it is (puzzle-hard? execution-hard? optimization-hard?)

In Robot Uprising, these are the only dimensions that matter. A player with a beautiful relay network might breeze through a 5-star Relay Network mission but crash on a 2-star Stealth Run because their architecture is EM-loud by nature.

---

## Option A: "The Pure Type" — No Numeric Difficulty at All

### How It Works

Every mission on the campaign map and in the Gauntlet is labeled ONLY with its type name and a short descriptor. No stars, no numbers, no skulls. The type name and a one-sentence briefing communicate everything.

**Campaign map labels:**
- **M1: Filter Puzzle** — "Clear the noise. Let them see."
- **M3: Relay Network** — "Wire the blind spots."
- **M5: Assembly Line** — "Build the factory. Feed the front."
- **M7: Pressure Test** — "Everything works until it doesn't."
- **M10: Factory War** — "Their factory against yours."

**Gauntlet mission selection:**
```
┌─────────────────────────────────────┐
│  AVAILABLE MISSIONS                 │
│                                     │
│  ▸ Relay Network — Palawan Jungle   │
│    "3 scouts, 2 strikers, no relay. │
│     Build the backbone."            │
│                                     │
│  ▸ Stealth Run — Siquijor Night     │
│    "Extract intel. Stay silent.     │
│     One emission = detection."      │
│                                     │
│  ▸ Siege Defense — Cebu Overpass    │
│    "4 waves. Hold the factory.      │
│     They adapt each wave."          │
│                                     │
│  ▸ Phase Shift — Taal Caldera      │
│    "Starts as recon. Becomes war."  │
│                                     │
└─────────────────────────────────────┘
```

No stars. No skull icons. No color-coded difficulty band. The player reads the type, reads the briefing, and self-selects based on their understanding of their own strengths.

### Sensory Description

The Gauntlet mission select screen shows four mission cards arranged vertically on the right panel, each card a frosted glass rectangle with the mission type as a bold header in the game's monospace font. Below the type name, the briefing text fades in letter-by-letter like a terminal prompt, each character accompanied by a tiny keyclick. The terrain preview on the left panel shifts as the player hovers — jungle canopy for the Relay Network, moonlit volcanic rock for the Stealth Run, neon-lit highway overpass for the Siege Defense. No numerical indicator anywhere. The player's cursor hovers over "Stealth Run" and the card expands slightly, revealing a sub-line: "Last attempt: 73% pass rate. Your architecture emits 4.2 EM/tick average." That personal stat — not a developer-assigned difficulty number — tells the player what they need to know.

### Strengths

- Forces players to develop **self-assessment literacy** — "what am I good at? what's my weakness?" — which IS the meta-skill the game teaches
- Eliminates the "I should be able to beat a 3-star mission" frustration of failing against a number
- Makes mission selection itself an interesting decision (choose comfort or growth?)
- Aligns with the game's identity: you're an AI architect, not a difficulty tourist
- Creates natural community vocabulary: "I'm a Relay Network player" vs. "I main Stealth Runs"

### Weaknesses

- New players have no framework for which types are easier (is "Stealth Run" harder than "Siege Defense"?)
- Players who want a progression-difficulty ladder feel lost — "which one should I do next?"
- The campaign's linear structure already handles this (missions 1-10 are ordered), but the Gauntlet doesn't
- Streamers/content creators can't say "I beat the hardest mission" — no shared scale exists

---

## Option B: "The Hybrid Label" — Type Name + Qualitative Tier

### How It Works

Each mission has a type name AND a qualitative tier word — but the tier isn't numeric. It uses Robot Uprising's own vocabulary to communicate scope.

**Tier vocabulary:**
| Tier | Meaning | Visual |
|------|---------|--------|
| **Signal** | Single-primitive focus. Clean problem. | Thin cyan border |
| **Circuit** | Multi-primitive interaction. Requires wiring. | Amber border, double-line |
| **Architecture** | Full-system test. Everything matters. | Red border, triple-line, pulse animation |

**Examples:**
- "Relay Network — Signal" = build a topology, nothing else going on
- "Relay Network — Circuit" = build a topology while managing EM emissions and an enemy stealth unit
- "Relay Network — Architecture" = build a topology, manage emissions, handle production, counter an adaptive enemy factory

The tier word communicates SCOPE (how many systems are engaged simultaneously), not DIFFICULTY (how many times you'll fail). A "Signal" mission can still be tricky if the single primitive is pushed to its limit. An "Architecture" mission can be straightforward if you've built a robust full-system config.

### Sensory Description

Mission cards on the Gauntlet select screen have visually distinct borders per tier. **Signal** cards have a single thin cyan line border, clean and minimal, the card background nearly transparent. **Circuit** cards glow with a warm amber double border, slight heat shimmer around the edges, the card background a darker frosted glass with faint circuit-trace patterns visible. **Architecture** cards pulse — a triple-line red border that breathes slowly (2-second cycle), the card background nearly opaque with dense circuit-trace patterns, a subtle low-frequency hum audible when hovered.

The tier word appears below the type name in a smaller font, all-caps, letter-spaced wide:

```
RELAY NETWORK
S I G N A L
"Wire the blind spots."
```

vs.

```
RELAY NETWORK
A R C H I T E C T U R E
"Their relays against yours. Adapt or drown."
```

The letter spacing creates visual weight. ARCHITECTURE feels heavier on the card than SIGNAL, even before reading the description.

### Strengths

- Communicates scope without implying difficulty, preserving self-assessment
- The three-tier system is learnable in minutes (one, some, all systems engaged)
- Border visual treatment gives at-a-glance readability without numbers
- "Architecture" as the hardest tier reinforces the game's core identity
- Tier + type = precise language: "I need practice on Circuit-level Stealth Runs"

### Weaknesses

- Three tiers may be insufficient — is there a meaningful difference between "2 systems" and "3 systems"?
- "Signal" tier risks feeling like "baby mode" even when the puzzle is genuinely challenging
- Players may still mentally map Signal/Circuit/Architecture to Easy/Medium/Hard
- The border styling might not be readable at small screen sizes or for colorblind players

---

## Option C: "The Celeste Model" — Difficulty Through Chapter Identity

### How It Works

Like Celeste's named chapters (Forsaken City, Old Site, Celestial Resort, Golden Ridge), each Robot Uprising mission has a **province identity** that carries its difficulty reputation. Difficulty isn't labeled — it's EXPERIENCED. Players learn through the community and through play that "Taal Caldera" is brutal and "Ifugao Terraces" is gentle.

Celeste extends this with A-Sides, B-Sides, and C-Sides — the same level remixed at higher difficulty, labeled with music-inspired qualitative names rather than numbers. Robot Uprising could adopt a parallel system:

- **Campaign** (the A-Side): each province once, linear
- **Protocol Runs** (the B-Side): each province with a modifier (from the Pact of Punishment / Protocol system in 5.07)
- **Gauntlet** (the C-Side): provinces as competitive arenas with opponent-designed configs

The province name replaces the difficulty label. "I'm stuck on Zambales" is more meaningful than "I'm stuck on Mission 9" because Zambales carries associations: volcanic coast terrain, aggressive enemy factories, EM-heavy environment.

### Sensory Description

The Philippine archipelago campaign map shows ten glowing province markers connected by circuit-board data cables. Completed provinces glow steady cyan. The current province pulses gold. Locked provinces are dim grey silhouettes. When the player hovers over a province, a dossier card slides up from the bottom of the screen:

```
╔═══════════════════════════════════════╗
║  SIQUIJOR — "The Mystic Isle"         ║
║                                        ║
║  Terrain: Bioluminescent volcanic rock ║
║  Enemy: Censor subsystem (redactions)  ║
║  Focus: Stealth Run / EM Management   ║
║                                        ║
║  Campaign: ████████░░ 80% pass rate   ║
║  Protocol: ░░░░░░░░░░ not attempted   ║
║  Gauntlet: 12 matches, 1847 Elo       ║
║                                        ║
║  [DEPLOY →]                            ║
╚═══════════════════════════════════════╝
```

No star rating. The province name, terrain, enemy type, and personal stats tell the story. "80% pass rate" is the player's OWN history — not a developer assessment. The map itself teaches difficulty: provinces closer to Taal (the final boss) have thicker, more tangled data cable connections. The visual density of the map communicates escalation without numbers.

**Audio:** Hovering over each province plays a 3-second ambient clip of that biome. Ifugao: rushing water over terraces, bamboo creaking. Siquijor: distant chanting, bioluminescent hum. Cebu: traffic, neon buzz, steel rain. Taal: volcanic rumble, alarm klaxons. The audio IS the difficulty signal — calm biomes are gentle, harsh biomes are aggressive.

### Strengths

- Province identity is deeply memorable (people remember places, not numbers)
- Personal stats replace developer-assigned difficulty with player-experienced difficulty
- The Philippine geography gives each mission a real-world anchor that enriches the fiction
- Community naturally forms around province names: "Siquijor strategies" threads, "Taal no-relay run" challenges
- Audio previews provide gut-level difficulty assessment without cognitive load

### Weaknesses

- Only works for the campaign (10 provinces) — Gauntlet needs additional mission variety beyond province
- New players seeing the map for the first time have zero difficulty information beyond position
- Province associations are learned through play, not communicated upfront
- Some players genuinely want to know "is this hard?" before committing — this approach is hostile to pre-assessment

---

## Option D: "The Hades Heat Map" — Self-Selected Dimensional Difficulty

### How It Works

Borrowing from Hades' Pact of Punishment, Robot Uprising lets the player choose WHICH axes of difficulty to increase, rather than choosing a single number. Each mission has a base configuration plus optional modifiers that the player toggles before deploying:

```
┌─────────────────────────────────────────┐
│  SIQUIJOR — Stealth Run                 │
│                                          │
│  ☐ Enemy detection range +2 tiles       │
│  ☐ EM decay halved (louder for longer)  │
│  ☐ Buffer capacity -2 slots all units   │
│  ☐ Enemy adapts after each retry        │
│  ☐ Invisible randomization: HIGH        │
│                                          │
│  Active modifiers: 0 / 5                │
│  Heat: 0                                │
│                                          │
│  [DEPLOY →]                              │
└─────────────────────────────────────────┘
```

Each modifier is typed — it belongs to a difficulty DIMENSION (detection, emissions, buffer pressure, adaptation, randomization). The player reads what each modifier does and chooses based on what they want to practice, not how hard they want the mission to be.

### Sensory Description

The modifier panel sits to the right of the mission briefing. Each modifier is a horizontal toggle strip: a dark rectangle with the modifier text, and a cyan toggle switch on the right. When the player clicks a toggle, it snaps to ON with a satisfying mechanical click sound — the toggle glows amber, the text brightens, and a small "+1" flies up to join the Heat counter at the bottom of the panel. The Heat counter is a row of ember-like pips that glow hotter with each added modifier: 0 = dark, 1 = warm amber, 2 = bright orange, 3 = cherry red, 4 = white-hot, 5 = sparking. The entire panel radiates more visual heat as modifiers stack.

When a modifier is toggled ON, the terrain preview on the left subtly shifts to reflect it: "EM decay halved" makes the bioluminescent rocks on Siquijor pulse faster and brighter. "Buffer capacity -2" makes the ghost unit previews on the board show visibly shorter context bars. The preview changes are the difficulty FELT before it's experienced.

**Audio:** Each toggle-on plays a descending metallic note (like engaging a locking mechanism). Each toggle-off plays an ascending release. The cumulative tone at the bottom of the panel is a sustained chord whose harmonic complexity increases with Heat — 0 Heat is silence, 1 Heat is a single low note, 5 Heat is a dense, dissonant cluster chord that vibrates in the chest.

### Strengths

- Players choose difficulty in the domain they want to improve in — targeted practice
- Modifiers teach game mechanics by surfacing what CAN vary ("I didn't know EM decay was a factor")
- Heat counter provides a single "how much extra" number for leaderboards/bragging without being prescriptive
- Pact-style modifiers create massive replayability (5 toggles = 32 combinations per mission)
- Directly teaches the game's vocabulary: each modifier names a system the player should understand

### Weaknesses

- Modifier UI adds cognitive load to the pre-mission screen (5+ options before you even start)
- Players who don't understand a modifier can't evaluate whether toggling it is a good idea
- Heat counter risks becoming the new star rating ("I play at Heat 4" = status signal, losing the dimensional nuance)
- Requires balancing 32+ combinations per mission — enormous design/testing surface area
- First-time players should see ZERO modifiers — the system must progressively disclose

---

## Option E: "The Darius Briefing" — Narrative Difficulty Communication

### How It Works

Named after BATTLETECH's mission handler Darius (whose briefings contain difficulty clues buried in flavor text), this approach uses the boot log narrative to communicate what the player will face. The boot log doesn't say "difficulty: 4." It says:

> `[THREAT ASSESSMENT] Enemy relay density: HIGH. Expect signal flooding. Recommend context window hardening. Note: previous operator attempted direct assault, eliminated in 3 ticks.`

The narrative IS the difficulty label. "Previous operator eliminated in 3 ticks" communicates more than any star could. "Expect signal flooding" tells the player exactly which system to prepare. "Recommend context window hardening" is the game teaching through its own voice.

### Sensory Description

The boot log scrolls on the terminal screen before the plan phase. Each line appears letter-by-letter in the monospace amber font, accompanied by the soft clicking of a teletype printer. Threat assessment lines are rendered in a brighter amber, slightly larger font, with a subtle pulse on first appearance. Key tactical terms ("signal flooding," "context window hardening," "relay density") are highlighted in cyan — clickable links that open the Blueprint Codex entry for that concept.

When the boot log mentions the previous operator's fate, the text shifts to a dimmer, almost grey tone — like reading someone else's last log entry. A single low gong sounds. The player feels the weight of the warning without a number ever appearing.

After the boot log finishes, the plan screen opens with the workbench. The threat assessment persists as a collapsed bar at the top of the screen, expandable with a click, so the player can reference it while building their architecture.

### Strengths

- Maximally diegetic — no UI abstraction layer, the game world IS the difficulty communication
- Boot log warnings teach vocabulary in context ("signal flooding" = high-density hooks → buffer pressure)
- Previous operator fate creates emotional stakes that numbers can't match
- Tactical recommendations are soft tutorials disguised as intelligence reports
- Each mission's boot log is a unique narrative artifact — memorable, quotable, shareable

### Weaknesses

- Requires reading — players who skip text get no difficulty information
- Threat assessment language needs calibration: too specific = spoiler, too vague = useless
- First-time players can't interpret "relay density: HIGH" — they don't know what baseline is
- Non-diegetic information (like pass rate stats) has no natural home in this system
- Localization complexity: every briefing is a prose passage, not a reusable UI component

---

## Player Journeys

### Journey: Sofia, 15, First Strategy Game

**Context:** Sofia just finished Mission 4 (Noisy Channel). The campaign map shows Mission 5 glowing gold. She's never seen a star rating in this game.

**Minute 0:00 — Campaign Map**
Sofia sees the Philippine archipelago. Five provinces are visible — four glowing cyan (completed), one pulsing gold. She hovers over the gold province and the dossier card slides up: "CEBU — Assembly Line. Focus: Factory + Production. Enemy: Standard spawner."

She doesn't know if this is "hard" or "easy." But she reads "Factory + Production" and thinks: "OK, I'm going to learn something new." The type name tells her this isn't another relay puzzle. She clicks DEPLOY.

**Minute 0:15 — Boot Log**
The boot log scrolls: `[NEW SUBSYSTEM ONLINE] PRODUCTION MODULE initialized. You can now design blueprints and queue them for fabrication.` Then: `[THREAT ASSESSMENT] Enemy spawner active. 1 unit every 4 ticks. Your factory: 1 unit every 6 ticks. You are outproduced. Design efficiently.`

Sofia reads "you are outproduced" and feels a knot in her stomach. She doesn't need a star rating — "outproduced" tells her this is serious. She also knows exactly what her problem is: her factory is slower. She needs to either build better units or build faster.

**Minute 0:30 — Planning**
She opens the workbench and sees the new blueprint editor. It's unfamiliar. She drags a scout template into the first blueprint slot. The production queue shows: Scout → ??? → ???. She doesn't know what to build next. But the mission TYPE ("Assembly Line") told her the challenge is production. So she focuses on the queue, not the channel wiring. The type name guided her attention.

**Minute 3:00 — First Failure**
She deploys. Her single-blueprint army gets overwhelmed. The debrief doesn't say "difficulty: 4, you failed." It says: "Your factory produced 3 scouts in 18 ticks. The enemy produced 5 units in 20 ticks. Production gap: 2 units." The language is type-specific: this is an Assembly Line mission, so the debrief talks in production terms.

**Minute 3:30 — Second Attempt**
She adds a second blueprint (striker) and adjusts the queue. The type name told her what to fix. She didn't need "2 stars" to know the problem was production.

**UI Annotations:**
- Campaign map dossier card: type name in bold monospace, focus primitives listed, no numeric rating
- Boot log threat assessment: amber text, key terms cyan-linked to Codex
- Debrief language: type-specific vocabulary (production gap, queue efficiency, unit throughput)

---

### Journey: Marcus, 42, Factorio Veteran, Gauntlet Player

**Context:** Marcus has completed the campaign and is deep into the Gauntlet. He's deciding between three available missions for his evening session.

**Minute 0:00 — Gauntlet Selection**
The screen shows three mission cards (Option B hybrid: type + tier):

```
STEALTH RUN                    SIEGE DEFENSE                  RELAY NETWORK
A R C H I T E C T U R E       C I R C U I T                  S I G N A L
"Taal Caldera. Full stealth.   "Batanes Highlands. 3 waves.   "Palawan Jungle. Pure
 One emission = detected.       Enemy adapts wave 2."           topology challenge."
 Counter-intel active."
```

Marcus reads them left to right. Stealth Run — Architecture: his worst type. His configs are EM-loud by design (he loves relay meshes). He KNOWS this will be painful. Siege Defense — Circuit: manageable, he's good at defense. Relay Network — Signal: his bread and butter.

He picks the Stealth Run. Not because a star told him to. Because the type told him it's his weakness, the tier told him it's a full-system test, and the briefing told him the specific constraint (one emission = detected). He's choosing growth over comfort. The type-as-difficulty system made this a meaningful, informed decision.

**Minute 0:30 — Preparation**
The boot log for Taal loads: `[THREAT ASSESSMENT] Counter-intelligence subsystem ACTIVE. All hook transmissions generate trackable EM signatures. Estimated safe emission budget: 0.8 EM/tick. Your current architecture average: 4.2 EM/tick.`

Marcus winces. His personal stat (4.2 EM/tick) against the mission constraint (0.8 EM/tick) tells him exactly how much he needs to redesign. No star could communicate this. The number is HIS number — not a developer's assessment.

**Minute 1:00 — Redesign**
He strips his relay mesh down to a single chain. Removes three hook slots. Equips compress on every relay. His architecture goes from a highway system to a whisper network. The type name ("Stealth Run") guided the entire redesign direction.

**Minute 8:00 — Post-Match**
He passes at 82%. The debrief shows his EM profile across the match: a sparkline hovering around 0.7 EM/tick with two spikes to 1.4 (when scouts spotted threats simultaneously). The debrief speaks in stealth vocabulary: "Detection events: 2. Near-detection events: 5. Quietest tick: T14 (0.1 EM). Loudest tick: T23 (1.4 EM)." The type shapes the feedback language.

**UI Annotations:**
- Mission card: type bold top, tier letter-spaced below, briefing in quotes, border style per tier
- Personal stat on hover: "Your architecture average: 4.2 EM/tick" — context-aware number
- Debrief vocabulary: type-specific metrics (EM profile, detection events, quiet/loud ticks)

---

### Journey: Aisha, 14, Returning After 2 Weeks

**Context:** Aisha played missions 1-6, then got busy with school. She's returning and doesn't remember what's next.

**Minute 0:00 — Boot Log Session Resume**
The boot log greets her: `[OPERATOR RECONNECT] Last active: 14 days ago. Last mission: CEBU — Siege Defense (PASSED, 91% pass rate). Next target: MANILA — Chain of Command. Focus: Command agent + reassign/reroute skills.`

The type name "Chain of Command" and the focus line tell her exactly what she's about to learn. She doesn't need to remember where she was — the system remembers for her, and communicates in type language rather than mission numbers.

**Minute 0:15 — Campaign Map**
She hovers over Manila. The dossier shows the type (Chain of Command), the focus (Command agent, meta-level skills), and her Cebu stats. Below, a note: "This mission introduces the Command unit. New skills: reassign, reroute, prioritize."

She knows three things: (1) she's learning something new, (2) it's about commanding other agents, (3) it's in Manila (cyberpunk megacity). None of this required a star rating.

**Minute 0:30 — Planning**
The workbench has a new unit type available: Command (14 buffer, 6 hook slots, stationary). The production queue shows her Cebu loadout pre-filled. The boot log says: `[RECOMMENDATION] The Command unit cannot perceive the battlefield directly. It only knows what other units tell it. Design accordingly.`

This is the difficulty communication. Not "4 stars." Instead: "it has no eyes." Aisha immediately understands the challenge — she needs to wire perception from scouts into the command agent. The type name ("Chain of Command") told her the theme. The boot log told her the constraint.

**UI Annotations:**
- Session resume: boot log recap with type name + focus in cyan
- Campaign dossier: new skills listed with "(NEW)" badge, type-specific briefing
- Boot log recommendation: italicized amber, describes the constraint in plain language

---

### Journey: Kwame, 32, Twitch Streamer

**Context:** Kwame is streaming a Gauntlet session to 2,000 viewers. He wants to pick the most entertaining mission for content.

**Minute 0:00 — Gauntlet Selection (Live)**
Three missions appear. Chat immediately starts typing: "STEALTH STEALTH STEALTH" and "factory war pls." Kwame reads the cards aloud:

"OK chat, we've got a Phase Shift — Architecture on Taal... that means it CHANGES type mid-battle, and it's a full-system test. We've got a Stealth Run — Circuit on Siquijor... my EM is way too high for stealth, chat knows this. And we've got a Factory War — Architecture on Mindanao."

The type names create instant shared vocabulary with his audience. Chat doesn't need to understand star ratings. "Stealth Run" is immediately evocative. "Phase Shift" sounds exciting. "Factory War" sounds climactic. The type IS the content pitch.

**Minute 0:10 — Selection Drama**
Kwame hovers over the Phase Shift card. The border triple-pulses red (Architecture tier). Chat erupts: "THE BORDER IS PULSING" "it's literally warning you" "RED BORDER = CONTENT." The visual design communicates intensity without a number, and the visual drama creates stream-worthy moments.

He picks Phase Shift. "Chat we're doing the shape-shifter. If I die at the phase transition, clip it."

**Minute 0:30 — Boot Log**
The boot log rolls: `[THREAT ASSESSMENT] Mission profile: DYNAMIC. Initial phase: Relay Network. Phase transition at tick 40 ±5. Second phase: Factory War. Your architecture must handle BOTH configurations.`

Kwame reads it aloud: "BOTH configurations. Chat, this is a two-spec problem. We need a config that does relay AND factory." The briefing creates the narrative arc for the stream. No star could do this.

**UI Annotations:**
- Mission cards: type names readable at stream resolution (720p minimum)
- Tier border animation: visible and dramatic for spectators
- Boot log: readable at stream pace (letter-by-letter speed adjustable in settings)

---

## Interaction Effects

### With Inspector Debrief (4.04b)
Type-specific debrief language means the inspector adapts its vocabulary per mission type. A Relay Network debrief emphasizes throughput, latency, and topology metrics. A Stealth Run debrief emphasizes EM profile and detection events. The type doesn't just label the mission — it shapes the entire analytical framework presented to the player.

### With Blueprint Codex (Locked)
Codex entries can be tagged with which mission types they're most relevant to. "Compress" skill entry shows: "Critical for: Stealth Run, Relay Network." This creates a cross-reference between the type system and the learning system.

### With Gauntlet Competitive (5.22)
In competitive Gauntlet, type-based selection creates a draft/ban meta. If both players can see available mission types, choosing "Stealth Run" when you know your opponent runs EM-heavy configs becomes a strategic weapon. The type system enables mission selection as competitive tactic.

### With Community & Streaming (7.10)
Type names are inherently more shareable than star ratings. "I just beat a Phase Shift Architecture on Taal" tells a story. "I beat a 5-star mission" does not. Type language creates richer community discourse, necropsy posts organized by type, and strategy guides per type.

### With Accessibility (6.08)
Type names can be paired with icons for non-readers: 🔇 Stealth Run, 🏗️ Assembly Line, 📡 Relay Network, 🛡️ Siege Defense, ⚡ Phase Shift, 🏭 Factory War. Icon + name + audio preview creates multi-modal difficulty communication accessible to different learning styles.

### With Complexity Ramp (5.04)
During the campaign, the type system teaches incrementally. Missions 1-4 are all "Signal" tier (single primitive focus). Mission 5 is the first "Circuit" tier. Missions 8-10 are "Architecture." The tier vocabulary maps to the complexity ramp naturally: Signal → learning one thing, Circuit → combining things, Architecture → everything at once.

---

## Comparable Games

### Celeste — Chapter Names as Difficulty
Celeste's chapters (Forsaken City, Old Site, Celestial Resort, Golden Ridge, Mirror Temple, Reflection, The Summit, Core) communicate difficulty through **identity and association** rather than numbers. Players say "I'm stuck on Reflection" and everyone knows that means the dark-room mechanics, not "chapter 6." The A-Side/B-Side/C-Side system adds a difficulty axis using music terminology — qualitative, thematic, evocative. Robot Uprising's province names (Ifugao, Siquijor, Cebu, Taal) serve the same function. "I'm stuck on Taal" carries more weight than "I'm stuck on mission 10" because Taal is a volcano, the final boss, the place of fire.

### BATTLETECH — The Failure of Skull Ratings
BATTLETECH's skull system teaches what NOT to do: numeric ratings that don't account for mission type create frustration and distrust. The community learned to ignore skulls and read contract type + payout instead. Robot Uprising should learn this lesson and never implement a system that will be ignored.

### Hades — Dimensional Difficulty (Pact of Punishment)
Hades' modifier toggles (Extreme Measures, Tight Deadline, Hard Labor, etc.) let players choose WHICH axes to increase. Each modifier has a name, a description, and a heat value. The player constructs their own difficulty profile. This maps directly to Option D's mission modifier system.

### Into the Breach — Objective Count as Proxy
Into the Breach uses the number of bonus objectives per mission as an implicit difficulty signal. More objectives = more constraints = harder. But the real difficulty communication is the mission preview showing exact enemy positions, spawn points, and terrain. Perfect information replaces difficulty labels. Robot Uprising's plan screen preview (showing spawn points, enemy spawner positions, terrain layout) serves the same function.

### Slay the Spire — Path Readability
Slay the Spire communicates encounter difficulty through map icons: normal fight (sword), elite (flame), rest site (campfire), unknown (?), shop ($ sign), treasure (chest). Players learn through experience that elite = harder, but the icon communicates TYPE (combat), not difficulty (number). The player's current deck determines whether an elite is suicidal or routine. Robot Uprising's type names work the same way — a "Stealth Run" is easy for a quiet config and brutal for a loud one.

---

## Recommendation

**Option B (Hybrid: Type + Qualitative Tier) as the primary system**, enhanced with elements from Options C and E:

1. **Type name** (Relay Network, Stealth Run, etc.) as the primary label everywhere
2. **Qualitative tier** (Signal / Circuit / Architecture) as the scope indicator, communicated through border styling and letter-spaced text
3. **Province identity** from Option C for campaign missions, creating memorable geographic associations
4. **Boot log briefing** from Option E for every mission, providing narrative difficulty communication
5. **Personal stats on hover** (pass rate, relevant architecture metric like EM/tick) as the player-specific difficulty signal
6. **Zero numeric ratings anywhere in the game**

This combination means difficulty is communicated through five complementary channels — type, tier, place, narrative, and personal data — without ever showing a star or a number. Each channel serves a different player need: type for architectural self-assessment, tier for scope estimation, place for community vocabulary, narrative for immersion, personal stats for concrete measurement.

The TikTok clip: a streamer hovering over a mission card, the Architecture border pulsing red, chat spamming "DON'T DO IT," and the streamer reading the boot log aloud: "Previous operator eliminated in 3 ticks." Cut to black. Cut to DEPLOY button click. No star rating needed — the moment tells itself.

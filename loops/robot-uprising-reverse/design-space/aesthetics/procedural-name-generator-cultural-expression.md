# 2.00g-i — The Random Name Generator as Cultural Expression

## The Design Challenge

Every unit spawned from a blueprint needs a name. Not the blueprint name ("Scout Alpha") — the *instance* name, the thing that appears in the Inspector event log, in the sealed watch signal chain, in the debrief death report. In most games this is an afterthought — "Marine 1," "Marine 2," or procedurally generic fantasy names no one reads. In Robot Uprising, naming is a **cultural design decision** with cascading effects on attachment, readability, narrative identity, and the game's relationship to the Philippine setting it inhabits.

The locked decisions establish:
- **Philippine archipelago** campaign map — 10 missions in real provinces (Ifugao, Siquijor, Palawan, Batanes, Cebu, Manila, Mindanao, Bohol, Zambales, Taal)
- **SE Asian cyberpunk aesthetic** — Ifugao rice terrace server farms, Manila neon vertical slums, Siquijor bioluminescent relay towers
- **Five unit types** — Scout (perception), Striker (force), Relay (communication), Specialist (infiltration), Command (authority)
- **Boot log narrative voice** — "You are an AI reading your own spec sheet"
- **Inspector click-to-inspect** shows full unit state, decision traces, event logs
- **Signal chains visible** — unit names appear in channel traffic

The naming system must serve multiple masters: cultural authenticity, functional readability (which unit did what?), emotional attachment (the player mourns "Bantay-3" more than "Scout #7"), and the 1:1 AI engineering vocabulary mapping (names should feel like agent instance IDs, not fantasy character names).

---

## Option A: "The Callsign Pool" — Filipino Word Banks Per Unit Type

### What It Is

Each unit type draws from a curated pool of 20-30 Filipino/Tagalog words that semantically map to the unit's function. Scout names are perception words. Striker names are force words. Relay names are communication words. Specialist names are intelligence words. Command names are authority words. Each spawned unit gets a random name from its pool plus an incrementing instance number: **Bantay-1**, **Talim-2**, **Agos-3**, **Kidlat-1**.

### The Name Pools

**Scout Pool — Perception Words (Pagmamasid)**
Words related to sight, observation, speed, alertness:

| Name | Meaning | Why It Works |
|------|---------|--------------|
| **Bantay** | Guard, watchman | The quintessential lookout — a bantay watches so others don't have to |
| **Tanod** | Sentinel, neighborhood watch | Filipino community patrol — hyperlocal awareness, exactly a scout's 5-tile perception |
| **Matyag** | Watch closely, observe | The verb form of sustained attention — what the scout *does* every tick |
| **Tingin** | Gaze, sight, look | Pure visual perception — the scout's entire existence compressed to one word |
| **Masid** | Observe, examine | Clinical observation — the scout doesn't engage, it *studies* |
| **Tanaw** | View from a distance | Literally seeing far away — the scout's wide perception radius as a word |
| **Sigla** | Vitality, alertness | The energetic quality of a fast-moving scout scanning the field |
| **Liksi** | Agility, quickness | Speed personified — the scout's fast movement stat |
| **Aninag** | Glimpse, faint view | The incomplete observation, the partial data — scout sees but doesn't fully know |
| **Silip** | Peek, peep | The act of cautious looking — a scout probing enemy territory |
| **Hamog** | Fog, mist | What the scout cuts through — naming the obstacle the unit exists to overcome |
| **Kidlat** | Lightning | Speed and sudden illumination — the scout's flash of battlefield awareness |

**Striker Pool — Force Words (Lakas)**
Words related to combat, strength, decisive action:

| Name | Meaning | Why It Works |
|------|---------|--------------|
| **Talim** | Edge, blade | The cutting edge — one-shot-one-kill distilled to a single syllable pair |
| **Bagsak** | Drop, overhead strike | Filipino martial arts term — the downward blow that ends things |
| **Lusob** | Attack, charge | Aggressive forward movement — the striker's engagement pattern |
| **Dagok** | Punch, blow | The impact moment — what the one-shot-one-kill mechanic *sounds* like |
| **Lakas** | Strength, force | Raw power — the stat the striker embodies |
| **Tapang** | Bravery, courage | The willingness to close to adjacent range knowing it's kill-or-be-killed |
| **Wasak** | Destroy, demolish | Total destruction — what happens when a striker reaches its target |
| **Bugno** | Grapple, confront | Close combat engagement — the striker must be *adjacent* to eliminate |
| **Sandata** | Weapon | The tool of violence itself |
| **Tigás** | Hardness, toughness | Unyielding — the striker doesn't evade, it *arrives* |
| **Gulpi** | Beat, strike | Repeated impact — though the striker only needs one |
| **Bagani** | Warrior, hero | From indigenous Philippine warrior tradition — the name carries ancestral weight |

**Relay Pool — Communication Words (Ugnayan)**
Words related to connection, transmission, bridging:

| Name | Meaning | Why It Works |
|------|---------|--------------|
| **Agos** | Flow, current | The continuous movement of information — signals flowing through the network |
| **Tulay** | Bridge | The relay literally bridges the gap between disconnected units |
| **Hatid** | Deliver, convey | The relay's core function: receiving and passing on |
| **Bulong** | Whisper | Quiet transmission — the relay passes messages without shouting (low EM) |
| **Balita** | News, report | What the relay carries — intelligence reports, battlefield updates |
| **Abot** | Reach, extend to | The act of extending communication range — what the relay adds to the network |
| **Daloy** | Flow, stream | Smooth continuous data movement — the well-configured relay |
| **Hugot** | Draw from deep | Deep extraction and forwarding — pulling signal from one context, pushing to another |
| **Kawit** | Hook, connector | The physical metaphor for what hooks do — the relay *hooks* into channels |
| **Tagpi** | Patch, join | Stitching together a distributed system — the relay makes the whole greater than parts |
| **Senyas** | Signal, gesture | The encoded message itself — what the relay handles and transforms |
| **Salin** | Translate, transfer | Transformation in transit — compress, filter, amplify are all forms of *salin* |

**Specialist Pool — Intelligence Words (Talino)**
Words related to infiltration, knowledge, precision:

| Name | Meaning | Why It Works |
|------|---------|--------------|
| **Tiktik** | Spy, detective | The intelligence operative — what the specialist *is* |
| **Lihim** | Secret | What the specialist traffics in — hidden information, covert extraction |
| **Susi** | Key | The specialist unlocks what others can't access |
| **Tuklas** | Discover, find | The moment of breakthrough — the hack succeeds, the extraction completes |
| **Salat** | Probe, feel | Delicate investigative touch — the specialist doesn't smash, it *probes* |
| **Lusot** | Slip through, evade | Getting past defenses — the specialist's medium-speed approach |
| **Batid** | Known, aware | The state after successful intelligence — *batid na* means "now known" |
| **Saliksik** | Research, investigate | Systematic investigation — the specialist's methodical approach |
| **Dungis** | Stain, mark | What the specialist leaves behind — a trace, a tag, a mark on the target |
| **Subok** | Test, try | The experimental approach — hack is a *subok* against enemy defenses |
| **Anino** | Shadow | Moving unseen — the specialist's ideal operating mode |
| **Dalubhasa** | Expert, specialist | The word "specialist" itself, in Filipino — self-referential, meta |

**Command Pool — Authority Words (Kapangyarihan)**
Words related to leadership, order, orchestration:

| Name | Meaning | Why It Works |
|------|---------|--------------|
| **Utos** | Command, order | The direct translation — what the command unit issues every tick |
| **Punò** | Leader, chief | The head of the organization — what the command agent is |
| **Gabay** | Guide, mentor | Leadership through direction rather than force — the command doesn't fight, it *guides* |
| **Batas** | Law, rule | The rules the command sets and enforces — rules as governance |
| **Haligi** | Pillar, support | The structural foundation — the command holds the architecture together |
| **Tanglaw** | Light, illumination | The command provides clarity to the organization — a beacon |
| **Mando** | Command (Spanish-derived) | Military command — the authority to direct |
| **Diwata** | Spirit, deity | From Philippine mythology — the supernatural orchestrator |
| **Hudyat** | Signal, cue | The command's timing control — when to trigger, when to hold |
| **Kalasag** | Shield | Protection through strategy — the command defends by coordinating |
| **Ugnay** | Connection, link | The command's core skill — connecting the network, rerouting, reassigning |
| **Tahanan** | Home, dwelling | The stationary command as the army's home base — safety, anchor, origin |

### Instance Naming Convention

Format: **[Name]-[Instance Number]**
- First scout spawned: **Bantay-1**
- Second scout (different name drawn): **Tanod-1**
- Third scout (same name drawn): **Bantay-2**
- Instance numbers are per-name, not per-type — reinforcing that each named agent is a lineage

### How Name Assignment Works

1. Blueprint is queued for production
2. When the unit spawns, a name is drawn from the type's pool (weighted random — recently-used names are deprioritized to maximize variety)
3. If this name has been used before in this battle, the instance counter increments
4. The name appears on the unit's nameplate, in signal chains, in the Inspector, in the event log

### Sensory Description

**The naming moment** — when a unit finishes production and slides off the conveyor belt onto the board:
- A small **cyan nameplate** materializes beneath the unit sprite, typeset in a clean monospace font (reminiscent of terminal output — diegetically consistent)
- The name fades in letter by letter over 300ms, left to right, like a terminal printing text: `B-a-n-t-a-y---1`
- A soft **mechanical print sound** — like a dot matrix printer stamping a label — accompanies each letter
- The name glows brightly for 500ms then settles to a dimmer steady state
- On the Inspector, the full designation appears in the unit header: **SCOUT — Bantay-1** in amber text

**In signal chains during sealed watch:**
- Signal delivery flashes show abbreviated sender → receiver: `Bantay-1 → ch:intel → Agos-2`
- The Filipino names create a visual texture that is distinctly *not English* — even at reading speed, the player absorbs a Philippine flavor
- Channel traffic logs read like intercepted radio chatter in a language that's half-familiar: "Bantay-1 sent THREAT on ch:intel at T04" → "Talim-1 received THREAT from ch:intel at T05"

**In the Inspector debrief:**
- Death reports read: **"Talim-2 eliminated at D4 (T12) — last context: [THREAT: enemy_scout at C4, AGE: 3 ticks, SOURCE: Bantay-1 via ch:intel]"**
- The names transform dry logs into micro-narratives: "Bantay saw the threat, told Agos, who told Talim, who closed on the target but arrived too late because the signal was 3 ticks old"
- Reading this is more evocative than "Scout-1 → Relay-1 → Striker-1"

---

#### Journey: Mika, 14, First-Time Strategy Player (Manila)

**Context:** Mission 1 (Ifugao rice terraces). First ever battle. Pre-placed units: 2 scouts, 1 striker. Mika has just configured basic rules and is about to hit EXECUTE for the first time.

**Minute 0:00 — The First Spawn**
The plan screen shows the 8×8 board on the left, workbench on the right. Three pre-placed units sit on the board as blue silhouettes with dashed outlines — ghost previews. Mika has configured Scout Alpha and Scout Bravo blueprints with basic patrol rules.

Mika hits EXECUTE. The screen transitions to sealed watch. The tick clock appears at top center with empty pips.

**Minute 0:05 — Names Appear**
The three ghost silhouettes solidify into full sprites. As each materializes, a cyan nameplate types out beneath it:
- First scout: `M-a-t-y-a-g---1` (*dot-matrix print sound, six soft taps*)
- Second scout: `S-i-l-i-p---1` (*same sound, five taps*)
- Striker: `T-a-l-i-m---1` (*five taps, slightly deeper register because strikers are heavier*)

Mika doesn't know what these words mean yet, but they feel *specific*. This isn't "Unit 1." This is Matyag. She has a name.

**Minute 0:30 — Names in Action**
Tick 3. The event overlay flashes: `Matyag-1 → ch:alert → DELIVERED`. A green line pulses from Matyag's position to Talim's. Mika reads the names naturally — "Matyag told Talim something." The Filipino words are short enough to parse at tick speed.

**Minute 1:45 — The First Death**
Tick 11. Talim-1 moves adjacent to an enemy. Flash. The enemy is eliminated. The event overlay reads: **"Talim-1 ENGAGED enemy at E5 — ELIMINATED."** Mika doesn't know *talim* means *blade*, but the name paired with the lethal action creates an association. Talim = the one who kills.

**Minute 2:30 — Inspector Discovery**
Debrief. Mika clicks on Matyag-1 in the Inspector. The header reads **SCOUT — Matyag-1** in amber. The decision trace shows every tick of Matyag's patrol path — each observation, each signal sent. The name *Matyag* now carries a history. It's not a label; it's a story.

Mika hovers over the name and a tooltip appears: **matyag** — *to observe closely (Tagalog)*. "Oh!" she says. "The scout is named 'observe.' That's its job."

**Minute 3:00 — Recognition**
Mika notices that Silip-1, the other scout, also has a perception-related name. She hovers: **silip** — *to peek (Tagalog)*. She's learning Filipino words through gameplay. The names aren't decorative — they're descriptive.

**UI Annotations:**
- Nameplate: cyan monospace text, 10px below unit sprite, centered, renders above terrain but below overlay UI
- Tooltip: 200ms hover delay, dark translucent background, name in bold + pronunciation guide + meaning + language tag
- Event log: names in unit's accent color (scout=teal, striker=red, relay=amber, specialist=violet, command=gold)

---

#### Journey: Diego, 31, Backend Engineer (Cebu City)

**Context:** Mission 7 (Mindanao jungle). Diego has a full factory with 2 scout blueprints, 2 striker blueprints, 1 relay, 1 specialist, 1 command. He's been playing for 8 hours across 7 missions and has internalized the naming system.

**Minute 0:00 — The Roster**
Diego's factory produces units in waves. He watches the conveyor belt on the plan screen — each blueprint icon slides left to right, and he knows from experience that production takes 3 ticks per unit. He's configured his production queue: Scout → Relay → Scout → Striker → Specialist → Striker → Command.

**Minute 0:15 — Name Recognition as Diagnostic**
Sealed watch begins. Units spawn in sequence. Names type out:

T1: `Kidlat-1` (Scout) — Diego smiles. *Kidlat* means lightning. Fast scout. Good omen.
T4: `Daloy-1` (Relay) — *Daloy*, flow. The relay that will be the backbone.
T7: `Hamog-1` (Scout) — *Hamog*, fog. The second scout pushes into uncertain territory.
T10: `Wasak-1` (Striker) — *Wasak*, destroy. The first hammer.
T13: `Anino-1` (Specialist) — *Anino*, shadow. The infiltrator.
T16: `Lusob-1` (Striker) — *Lusob*, charge. The second hammer.
T19: `Gabay-1` (Command) — *Gabay*, guide. The orchestrator.

Diego has played enough that the names carry emotional weight. When he sees "Kidlat" he *expects* fast scouting. When he sees "Gabay" he expects the network to stabilize. The names have become a vocabulary.

**Minute 3:00 — Naming in the Fog of War**
Signal chains flash across the board. Diego reads them at speed: `Kidlat-1 → ch:recon → Daloy-1 → ch:intel → Wasak-1`. He doesn't need to look at unit positions to know what happened — Lightning spotted something, Flow relayed it, Destroy is moving to kill. The names ARE the narrative.

**Minute 5:30 — The Death Report That Hits**
Tick 38. An enemy striker flanks Daloy-1. The relay is destroyed — a critical one-shot-one-kill. The event overlay reads: **"Daloy-1 ELIMINATED at C6 (T38)."** Diego winces. Daloy. *Flow.* The flow stopped. The metaphor lands viscerally because the name maps to function.

In the Inspector, Diego opens Daloy-1's death context. The last 4 ticks show the relay's buffer filling — it was too busy processing Kidlat's scout data to notice the threat. The name *Daloy* now carries irony — the unit named for smooth flow died because the flow overwhelmed it.

**Minute 8:00 — Post-Battle Naming Culture**
Diego has started referring to his units by their Filipino names in his notes. "Daloy died because I didn't give Hamog an enemy-proximity hook." He screenshots the signal chain and posts it to Discord: "My Kidlat→Daloy→Wasak pipeline broke at Daloy again. Need redundant Daloy or reroute through Agos backup."

The Filipino names have become his architectural vocabulary. He's describing relay topology in Tagalog.

**UI Annotations:**
- Signal chain overlay: `Kidlat-1 → ch:recon → Daloy-1` rendered in colored text matching unit accent colors, 12px monospace, appears briefly (1.5s) then fades
- Death event: red flash on unit position, name remains on board in dimmed red for 3 ticks before fading
- Inspector death report: full unit name as header, last 10 ticks of context window state, "ELIMINATED" stamp in red

---

#### Journey: Prof. Adaora, 52, CS Professor (Lagos, Nigeria — No Filipino Background)

**Context:** Mission 4 (Batanes highlands). Adaora has no connection to the Philippines or Tagalog. She downloaded Robot Uprising because a student recommended it as "Factorio meets compiler design." She's experienced the naming system for 4 missions and is forming opinions.

**Minute 0:00 — Initial Foreignness**
When Adaora first saw names like "Bantay" and "Talim" in Mission 1, they were opaque. She couldn't pronounce them confidently. She relied on the unit-type prefix in the Inspector header ("SCOUT — Bantay-1") to track which was which.

**Minute 0:10 — The Tooltip Discovery**
By Mission 2, Adaora started hovering over nameplates out of curiosity. The tooltip for **Talim** reads:

```
talim — edge, blade (Tagalog)
Etymology: from Proto-Austronesian *tazim "sharp"
```

"Edge." The striker is named "Edge." Adaora appreciates the function-name mapping. She's a compiler engineer — she names her variables well. She respects systems that do the same.

**Minute 1:00 — Cross-Cultural Learning**
By Mission 4, Adaora has absorbed ~15 Filipino words through pure gameplay exposure. She doesn't study them — they just accumulate through repetition. She now reads "Bantay" as "guard" without hovering. She reads "Agos" as "flow" without checking. The game has taught her Tagalog vocabulary as a side effect.

She mentions this in her lecture: "The game names its scout agents 'Matyag' — which is Tagalog for 'to observe closely.' The naming convention maps function to identity. If you were naming your microservices, would you name them this well?"

**Minute 2:30 — The Cultural Appreciation Beat**
Adaora opens the Blueprint Codex between missions. She notices a section she hadn't explored: **"Name Origins."** It's a simple grid showing all names she's encountered, their meanings, and a brief cultural note:

```
BANTAY — Guard, watchman
From the Filipino tradition of community "bantay-bayan" (village
watchmen) — neighborhood sentinels who patrol on foot, observing
and reporting. Your scout units serve the same function in the
digital battlefield.
```

Adaora reads three entries. She didn't come to the game for cultural education, but the integration is seamless — it enriches her understanding of the units without ever interrupting gameplay.

**Minute 5:00 — The "Diwata" Moment**
Mission 4 introduces the Specialist. Adaora's first specialist spawns as **Diwata-1**... wait, she thinks. Diwata is in the Command pool. Let me reconsider — actually, the specialist spawns as **Lihim-1**. She hovers: **lihim** — *secret (Tagalog)*. The specialist who hacks and extracts is named "Secret." Perfect.

Later, when she finally unlocks the Command unit in Mission 6, the first one spawns as **Diwata-1**. Tooltip: **diwata** — *spirit, deity (from Philippine mythology — supernatural beings who orchestrate natural forces)*. Adaora laughs. The Command agent — the one that orchestrates all others — is named after a deity. She gets it.

**Minute 8:00 — Conference Presentation**
Months later, Adaora presents at a games-in-education workshop. Her slide reads: "Robot Uprising teaches Tagalog as an incidental side effect of naming conventions. After 10 hours of play, I had a working vocabulary of 40 Filipino words. No flashcards. No memorization. Pure contextual immersion through gameplay."

**UI Annotations:**
- Name Origins panel: accessible from Blueprint Codex → "Names" tab, grid of cards with Filipino text, English translation, brief cultural context paragraph, discovered/undiscovered tracking
- Pronunciation guide: optional audio playback icon next to each name (Filipino voice actor recording each word, ~1 second each)
- Cultural note: 2-3 sentence connection to Filipino culture or mythology, written in the boot log voice

---

## Option B: "The Designation System" — Functional Alphanumeric Codes

### What It Is

No Filipino names. Pure technical designations: **SCT-01**, **STR-02**, **RLY-01**, **SPC-01**, **CMD-01**. Clinical, precise, diegetically consistent with "you are an AI." AIs don't name things poetically — they label them.

### How It Works

- Three-letter type prefix (SCT/STR/RLY/SPC/CMD) + two-digit sequential instance number
- Blueprint designations are separate: Blueprint Alpha → instances SCT-01, SCT-02
- Zero emotional attachment by design — these are components, not characters

### Strengths

- **Maximum readability** — no pronunciation ambiguity, no learning curve for names
- **Diegetically pure** — an AI doesn't name its spawned units "Bantay." It numbers them.
- **Universal** — no cultural barrier for any player from any country
- **Familiar** — programmers see array indices, military players see unit designations

### Weaknesses

- **Zero cultural expression** — the Philippine setting becomes purely visual/geographical
- **No attachment** — "SCT-01 was eliminated" hits differently than "Bantay-1 was eliminated"
- **Signal chain readability suffers** — `SCT-01 → ch:intel → RLY-01 → ch:cmd → STR-02` is parseable but lifeless
- **Missed educational opportunity** — 40 Filipino words the player never learns
- **Forgettable** — players won't discuss specific units on forums or Discord

### The TikTok Test

A clip of signal chains with Filipino names ("Kidlat → Daloy → Talim") is inherently more viral than "SCT-01 → RLY-01 → STR-01." The Filipino names invite curiosity: *"What language is that? What do they mean?"* The codes invite nothing.

---

## Option C: "The Hybrid" — AI-Generated Designations with Filipino Etymology

### What It Is

The AI protagonist (the player) assigns designations that *appear* technical but are actually Filipino roots transliterated into a machine-readable format. The diegetic justification: the AI's training data included Philippine language corpora, and its naming algorithms produce culturally-inflected outputs.

### Naming Format

**[Root]-[Function Code]-[Instance]**

Examples:
- **BNT-OBS-01** (Bantay → BNT, function: observe)
- **TLM-ENG-01** (Talim → TLM, function: engage)
- **AGS-RLY-01** (Agos → AGS, function: relay)
- **LHM-INF-01** (Lihim → LHM, function: infiltrate)
- **UTS-CMD-01** (Utos → UTS, function: command)

### How It's Revealed

Initially, these look like arbitrary three-letter codes. But the tooltip reveals: **"BNT — derived from 'bantay' (Tagalog: guard, watchman)."** Over time, the player realizes the AI is *culturally situated* — it was trained on Filipino language data, and its naming conventions reflect that. This is a subtle worldbuilding detail: the AI uprising is rooted in the Philippines because the AI was *born* from Philippine data.

### Strengths

- Maintains diegetic purity (AI-generated designations)
- Preserves cultural expression (Filipino roots visible in codes)
- Creates a discovery moment ("Wait, BNT is short for 'bantay'?")
- Technical enough for the AI voice, human enough for attachment

### Weaknesses

- Three-letter codes are harder to remember than full words
- The cultural layer is buried — requires active tooltip engagement
- Loses the *music* of full Filipino words in signal chains

---

## Option D: "The Naming Ceremony" — Player Names Units, Filipino Defaults

### What It Is

Players can name their own units, but every name field starts pre-filled with a Filipino word from the appropriate pool. The naming moment is a tiny ceremony: when a blueprint is created, the workbench presents a pre-selected Filipino name with a "keep or rename" prompt. Most players keep the default. Power users rename. The Filipino vocabulary becomes the *lingua franca* of the community because most players never change the defaults.

### How It Works

**Blueprint creation flow:**
1. Player creates a new Scout blueprint
2. Workbench auto-generates a name from the Scout pool: **Bantay**
3. The name appears in a text field at the top of the blueprint editor, already filled, cursor not active
4. Below, a small tooltip: *"bantay — guard, watchman (Tagalog)"*
5. Player can click to edit — but the default is *good*, so most won't
6. Every unit spawned from this blueprint is **Bantay-1**, **Bantay-2**, etc.

**The community effect:** If 80% of players keep defaults, the community develops a shared Filipino vocabulary. "My Bantay keeps dying" is universally understood. "I put Agos between my Bantay and Talim" is a complete architectural statement in three Filipino words.

### Strengths

- **Player agency** without player burden
- **Cultural expression as default** — opt-out, not opt-in
- **Community vocabulary** emerges naturally
- **Personalization** for those who want it (Diego names his command unit "PANGINOON" — Lord)

### Weaknesses

- Custom names break the shared vocabulary (one player's "Bob" confuses forum readers)
- The "rename" option might imply the Filipino default is a placeholder, not a feature
- Maintaining both systems (custom + pool) adds UI complexity

---

## Option E: "The Living Dictionary" — Names Evolve with Unit Behavior

### What It Is

Units start with a random Filipino name from their pool, but the name *shifts* based on the unit's actual behavior over the course of a battle. A scout that spends most of its ticks in one position might shift from **Kidlat** (lightning — active scouting) to **Tanod** (sentinel — stationary watching). A striker that never engages because it's always stuck in context overload might shift from **Talim** (blade) to **Tigás** (hardness — unmoving).

### How It Works

- Each name in the pool has a behavioral fingerprint (movement frequency, combat events, signal activity, context utilization)
- Every 10 ticks, the game computes the unit's actual behavioral fingerprint
- If the unit's behavior is a better match for a different name, the nameplate subtly transitions: the old name fades, the new name types in
- The transition is noted in the event log: `[T30] Kidlat-1 → Tanod-1 (behavioral reclassification: stationary pattern detected)`

### Strengths

- **Dynamic identity** — names reflect reality, not assignment
- **Diagnostic value** — a name change IS a signal that the unit's behavior has drifted from design intent
- **Storytelling** — "Kidlat became Tanod" is a micro-narrative about a scout that got pinned down
- **Teaches** — the name change teaches the player what the words mean through behavioral association

### Weaknesses

- **Confusing** — the unit you were tracking as "Kidlat" is suddenly "Tanod"
- **Inspector chaos** — the event log refers to one unit by multiple names across different ticks
- **Overengineered** — adds complexity to a system that should be invisible

### Recommendation

Option E is fascinating as a *concept* but catastrophic for usability. Names must be stable identifiers. However, the *behavioral fingerprint* concept could work as a **secondary label** — a title or epithet that appears in the Inspector but doesn't replace the primary name: **"Kidlat-1 — The Sentinel"** (because this Kidlat stood still all battle).

---

## Recommended Design: Option D ("The Naming Ceremony") with Option A Pools

The strongest design combines:
- **Filipino word pools per unit type** (Option A) as the naming source
- **Blueprint-level naming** with editable defaults (Option D) for player agency
- **Tooltip etymology** always available for cultural learning
- **Instance numbering** (Name-N) for tracking multiple units from the same blueprint
- **Name Origins panel** in the Blueprint Codex for deep cultural context
- **No behavioral name changes** (Option E rejected for usability)
- **Optional pronunciation audio** for accessibility and cultural fidelity

### The Three-Layer System

1. **Surface layer (always visible):** Filipino name + instance number on unit sprite (Bantay-1)
2. **Context layer (on hover):** One-line translation + type designation (bantay — guard, watchman | SCOUT)
3. **Deep layer (in Codex):** Cultural context, etymology, connection to Filipino tradition

---

## Interaction Effects

### × Boot Log Narrative
The boot log initialization could reference the naming system diegetically:
```
[INIT] designation_engine v0.4.2 loaded
[INIT] language_corpus: tl-PH (Tagalog, Philippine) — primary
[INIT] naming_mode: semantic_functional
[NOTE] unit designations derived from operational vocabulary
[NOTE] corpus source: Manila Central Intelligence Archive, pre-uprising
```
This justifies the Filipino names within the AI fiction — the AI learned language from its Philippine origin.

### × Signal Chain Readability
Filipino names have 2-3 syllables (Ban-tay, Ta-lim, A-gos) — faster to read than full English words ("Guardian," "Blade," "Current") and more meaningful than codes (SCT-01). They occupy a sweet spot in signal chain rendering.

### × Community Culture
If the community adopts Filipino names as default vocabulary, it creates a unique community culture. "My Bantay→Agos→Talim pipeline" becomes community shorthand. This is free cultural diffusion — Filipino words entering gaming vocabulary through pure gameplay utility.

### × EM Emission Narrative
When a relay emits detectable EM noise, the event could read: `[WARNING] Agos-2 emission detected at B4 (EM: HIGH)`. The name "Agos" (flow) next to "emission detected" creates narrative irony — the flowing relay is leaking.

### × Inspector Death Reports
"Bantay-1 ELIMINATED at D4 (T12)" reads as a loss. "SCT-01 ELIMINATED at D4 (T12)" reads as a log entry. The Filipino name transforms every Inspector event from data into story.

### × Multiplayer/Competitive
In PvP, seeing your opponent's unit names reveals nothing strategic (the names are random from pools) but creates a texture — facing "Wasak-3" and "Lusob-2" feels different from facing "STR-03" and "STR-02." The Filipino names make the opponent's army feel *alive*.

### × Accessibility
Filipino names use phonetic spelling and consistent vowel patterns (a, i, o, u) — they're highly pronounceable across languages. A Korean player, a Brazilian player, and a Nigerian player can all read "Bantay" and produce roughly the same sound. This is a significant advantage over fantasy names with ambiguous pronunciation.

### × Localization
The Filipino names should NOT be localized. They are proper nouns, like character names. A Japanese localization keeps "Bantay" as バンタイ (Bantai) in katakana. This is a deliberate cultural assertion: the game is Filipino, the names are Filipino, regardless of what language the UI is in.

---

## Comparable Games

### **XCOM: Enemy Unknown** — Procedural Soldier Names
XCOM generates soldiers from nationality-specific name pools. A Nigerian soldier might be "Adaeze Okonkwo." Players form intense attachments to procedurally-named soldiers — the permadeath + naming combination creates powerful stories. XCOM proves that random names from culturally-specific pools create deeper attachment than generic labels.

### **Dwarf Fortress** — Dwarven Names
Every dwarf has a procedurally generated name in the dwarvish language ("Urist McAxedwarf"). The community has universalized "Urist" as the default dwarf name. This is exactly the community vocabulary effect Robot Uprising should target — "Bantay" becoming the universal shorthand for "scout."

### **FTL: Faster Than Light** — Crew Naming
FTL names crew members from generic pools. Players frequently rename them. The community discussions always use the default names because that's the shared language. This validates the "Filipino defaults, player-editable" approach.

### **Pokémon** — Nickname System
Pokémon lets you nickname but defaults to the species name. Most competitive players use the species name for communication efficiency. The default wins because shared vocabulary beats personal expression in community contexts.

### **Screeps** — Self-Named Creeps
Screeps players programmatically name their creeps. Community naming conventions emerge (often functional: "harvester_1," "upgrader_3"). This is the designation system (Option B) in practice — functional but soulless.

---

## The TikTok Clip

A 15-second clip: the sealed watch shows a devastating chain reaction. Signal lines flash across the board — `Kidlat-1 → Agos-1 → Talim-2`. The Filipino names scroll in the event overlay like intercepted radio chatter. Talim-2 closes on the target. One-shot elimination. Flash. The event overlay reads: **TALIM-2: ENGAGED — ELIMINATED**.

The comment section: *"Wait what language is that?"* → *"It's Tagalog! Talim means blade!"* → *"This game teaches you Filipino??"*

That's the clip. That's the cultural moment.

---

## Degenerate Scenarios & Mitigations

### "I Can't Pronounce These"
**Mitigation:** Optional audio pronunciation in tooltips. The game never *requires* speaking the names aloud — they're text identifiers. But the audio is there for players who want it.

### "I Don't Care About Filipino Culture"
**Mitigation:** The names are purely functional — they're just labels. The cultural layer is entirely optional (tooltip + Codex). A player who never hovers and never opens the Names panel still gets functional, distinguishable, short names.

### "Too Many Names to Track"
**Mitigation:** The type prefix is always visible in the Inspector header ("SCOUT — Bantay-1"). Signal chain overlays color-code by unit type. The Filipino names are a secondary identifier — the primary is always the unit type. Players track "my scout" first and "Bantay-1" second.

### "Monoculture — Everyone Uses the Same Names"
**Mitigation:** Pools are large (12+ per type) and weighted against repetition. A battle with 6 scouts will likely have 6 different names. But yes, community vocabulary will consolidate around the most common names — this is a *feature*, not a bug.

---

## New Aspects Discovered

1. **2.00g-i-a — Pronunciation audio system design:** Recording Filipino voice talent for 60+ name pronunciations; playback UI in tooltips and Codex; accessibility implications (screen readers reading Filipino words); diegetic justification (the AI learned spoken language too)
2. **2.00g-i-b — Name Origins panel as cultural bridge:** Full design of the Blueprint Codex "Names" tab; how much cultural context is enough without being a Wikipedia article; visual design of etymology cards; gamification (undiscovered names as collectible motivation)
3. **2.00g-i-c — Community vocabulary emergence:** Predicting which names will become universal shorthand; designing pools to maximize memorable defaults; the "Urist effect" — when one name becomes THE name for a type; competitive meta around custom naming (hiding your strategy by renaming units?)
4. **2.00g-i-d — Localization of non-localized names:** How to handle Filipino proper nouns in CJK localizations; katakana/hangul transliteration guides; the political dimension of insisting on Filipino names in a global game; comparable: Genshin Impact's handling of Chinese cultural terms across 15 languages
5. **2.00g-i-e — Regional Philippine language variant pools:** Expanding beyond Tagalog to Cebuano, Ilocano, Bisaya, Kapampangan; campaign missions in Cebu could draw from Cebuano pools, Ifugao missions from Cordilleran languages; linguistic diversity as cultural statement; risk of stereotyping or oversimplifying a linguistically complex nation

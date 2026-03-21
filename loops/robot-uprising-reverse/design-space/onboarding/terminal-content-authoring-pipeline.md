# Onboarding: Terminal Content Authoring Pipeline

**Aspect ID:** 5.16a
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.16 (non-alt-tab embedded document UI), 5.16b (terminal in Inspector mode), 5.16c (terminal as community sharing surface), 5.16d (terminal progressive disclosure across campaign), 5.00 (external-documentation anti-pattern), 5.15 (voice candidates), 3.03 (skill interactions), 1.04b (diegetic tutorial documents), 5.00b (search-by-player-vocabulary)

---

## The Problem: 870 Possible Interactions, One Authoring Team

The terminal is the game's living reference system -- the place where ~30 core terms (skills like compress, filter, amplify; primitives like rules, hooks, channels, context window, eviction) are defined and cross-referenced. Each term needs its own entry. But the terminal's real value is in **interaction descriptions** -- what happens when compress meets hooks? When eviction policy interacts with amplify's priority flag? When filter rules collide with channel noise?

Thirty terms produce 30 x 29 / 2 = **435 unique pairwise interactions**. If we include directional relationships (compress affecting hooks is different from hooks triggering compress), that's **870 ordered pairs**. Not all are meaningful -- patrol and breach have no direct interaction -- but the relevant subset is still enormous. A conservative estimate: **120-180 interactions** that players will actually encounter and want to understand.

This is the **content authoring combinatorial explosion**. The question is not whether to document every pair. The question is: how does a small team produce, maintain, and prioritize a reference system that covers enough interaction space to feel comprehensive without authoring 870 entries by hand?

---

## Four Authoring Approaches

### Approach A: "The Encyclopedia" -- Manual Authoring

Every entry and every interaction description is hand-written by a designer or writer. Each one gets the full diegetic treatment -- written in-voice (Reyes for tactical, Unit 0 for empirical, per the 5.15 hybrid recommendation), with narrative texture, sensory description, and cross-links.

**What the pipeline looks like:** A spreadsheet of all 30 terms. A second spreadsheet of all term pairs, color-coded by priority (red = core synergy the campaign teaches, yellow = useful combo players discover, green = edge case, grey = irrelevant). A writer works through the red entries first, then yellow, ignoring grey. Each entry goes through: draft in-voice, mechanical accuracy review by a designer, playtester readability pass, integration into the terminal database.

**Volume estimate:** 30 term entries at ~200 words each = 6,000 words. 150 interaction entries at ~100 words each = 15,000 words. Total: ~21,000 words of reference content. That's a short novella. For a solo developer or tiny team, this is 2-4 weeks of focused writing.

**The maintenance trap:** Every balance change invalidates interaction descriptions. If compress's threshold range changes from 2-5 to 2-8, every interaction that references compression thresholds needs updating. Manual authoring creates a content debt that compounds with every patch.

### Approach B: "The Stamp Press" -- Templated Authoring

Define structured templates for term entries and interaction descriptions. Each template has fixed sections (mechanical definition, player-facing description, sensory note, related terms) with fill-in slots. Interaction templates follow a grammar: "[Skill A] + [Skill B]: When [A's output type] enters [B's input context], [mechanical effect]. The player implication: [strategic consequence]."

**What the pipeline looks like:** A content schema defines each term's fields (name, category, mechanical definition, voice_text, sensory_description, unlock_mission, related_terms). An interaction schema defines pair fields (term_a, term_b, interaction_type [synergy/tension/neutral/degenerate], mechanical_description, voice_text, discovery_mission). A writer fills templates rather than writing from scratch. The template ensures consistency; the writer provides the diegetic texture.

**The stub system:** For low-priority interactions, the template auto-generates a stub: "[Term A] and [Term B] interact through [shared system: buffer/hook/channel]. Configure [A] and [B] independently; their interaction emerges from [shared resource contention / signal flow / timing]." Stubs are mechanically accurate but lack narrative voice. They serve as placeholders that the community can flag for expansion.

**Volume estimate:** Same 30 term entries (still need full authoring). But interaction entries drop to ~60 fully authored (red priority) + ~90 stubs (yellow/green). Total authored words: 6,000 + 6,000 + 9,000 stub words = ~21,000, but the human-written portion is ~12,000. The stubs feel noticeably different -- functional but flat.

### Approach C: "The Compiler" -- Procedural Rule-Based Generation

Define interaction rules as data, not prose. Each skill declares its **output type** (buffer entry, hook signal, EM emission, priority flag) and its **input sensitivity** (what buffer entry types affect its behavior). A rule engine computes interactions: "compress outputs compressed_signal; amplify is sensitive to any signal type; therefore compress + amplify interaction exists, type = synergy, mechanic = compressed signals can be amplified, reducing bandwidth while maintaining broadcast reach."

**What the pipeline looks like:** A developer defines a skill interaction graph -- nodes are skills/primitives, edges are typed relationships (feeds_into, competes_with, gates, amplifies, degrades). A generation script walks the graph and produces interaction descriptions from templates keyed to edge types. A "feeds_into" edge produces: "[A] generates [output] that [B] consumes as [input]. This creates a pipeline where [A]'s configuration directly affects [B]'s effectiveness." A "competes_with" edge produces: "[A] and [B] both consume [shared resource]. Allocating more to [A] reduces [B]'s capacity."

**The voice layer:** Generated descriptions are mechanically correct but completely lack diegetic voice. A post-processing pass wraps them in voice: the raw description becomes the "mechanical note" panel, while a shorter voice-text version appears as the primary display. Voice text still requires human authoring for the ~60 core interactions, but the mechanical layer is fully automated.

**Volume estimate:** 30 term entries (human-authored, ~6,000 words). ~180 generated interaction descriptions (~50 words each = 9,000 words of mechanical text). ~60 voiced interaction descriptions (human-authored, ~80 words each = 4,800 words). Total human effort: ~10,800 words. The generated mechanical layer provides a complete, accurate, but tonally flat reference that the voiced layer selectively enriches.

### Approach D: "The Dispatch Board" -- Player-Behavior-Driven Prioritization

Don't try to author all interactions upfront. Track which interactions players actually encounter during gameplay and prioritize authoring based on real demand. The terminal ships with all 30 term entries but only the ~20 highest-confidence interaction descriptions. The remaining interaction slots show a "SIGNAL PENDING" stub. Telemetry tracks: which term pairs do players search for? Which interaction stubs do players click on? Which pairs appear together in Inspector replays? A weekly or biweekly authoring sprint targets the top-demanded stubs.

**What the pipeline looks like:** Pre-launch: author all 30 term entries + the ~20 interactions that the campaign explicitly teaches (patrol+compress in M1-3, evade+amplify in M3, hack+reroute in M6-7, etc.). Post-launch week 1: telemetry dashboard shows the top 20 most-clicked "SIGNAL PENDING" stubs. The content team writes the top 10. Week 2: same process. Within 4-6 weeks, the ~60-80 interactions that players actually care about are fully authored. The remaining 100+ stubs stay as stubs because no one is looking for them.

**The community acceleration:** Players who find a "SIGNAL PENDING" stub can submit their own interaction description via an in-game form. Community submissions go through moderation, and accepted ones appear with a "[Community Signal]" badge -- a different visual treatment from the official Unit 0 / Reyes voice entries. This turns the authoring pipeline into a collaborative wiki without losing diegetic framing.

---

## Triaging the Combinatorial Explosion: The Relevance Matrix

Not all 870 pairs matter. The triage framework:

**Tier 1 -- Campaign-Taught (20-25 pairs):** Interactions the campaign explicitly teaches through mission design. Patrol+compress, evade+amplify, hack+reroute, filter+channel noise, compress+hook threshold. These MUST be fully authored, in-voice, with sensory descriptions. Non-negotiable.

**Tier 2 -- Emergent Discovery (40-60 pairs):** Interactions players discover through experimentation in sandbox or competitive play. Amplify+EM emission, filter+fidelity threshold, prioritize+eviction policy. These should be authored within 2-4 weeks of launch, prioritized by telemetry.

**Tier 3 -- Edge Cases (30-50 pairs):** Interactions that technically exist but rarely matter. Breach+patrol (a striker breaching while a scout patrols nearby -- no meaningful interaction beyond shared spatial proximity). These get templated stubs.

**Tier 4 -- Null Pairs (remaining ~700):** Interactions that don't exist. Patrol and extract have no mechanical relationship. These don't appear in the terminal at all -- searching for "patrol + extract" returns "No direct interaction recorded. These capabilities operate on independent subsystems."

---

## Player Journeys

#### Journey: Nadia, 31, Content Designer at the Robot Uprising Studio

**Context:** Nadia is the sole content designer responsible for the terminal's reference entries. She has the full skill interaction matrix (3.03) open in one monitor and the terminal content CMS in the other. It's 6 weeks before launch. She has authored 30 term entries and 22 interaction descriptions. The backlog has 158 remaining interaction pairs tagged as Tier 1-3.

**Minute 0:00 -- The Morning Triage**
Nadia opens the interaction priority dashboard. A heatmap grid -- 30 x 30 cells, color-coded. The diagonal is blank (no self-interactions). Bright red cells cluster around relay skills (compress, filter, amplify) -- these interact with everything. The command skills (reassign, reroute, prioritize) form a second hot zone. Cool blue fills the periphery: scout and specialist skills interact with fewer systems.

She clicks the "Unauthored, Tier 1" filter. Fourteen red cells remain. Fourteen interactions the campaign teaches that don't have terminal entries yet. She sorts by mission appearance: the earliest unauthored interaction is **filter + channel noise**, taught in Mission 6. Six weeks to launch. She has time, but not much.

**Minute 2:00 -- Writing in Voice**
She opens the interaction template for filter + channel noise. The mechanical layer is already generated by the Compiler (Approach C): "Filter discards buffer entries matching player-defined criteria. Channel noise introduces false entries on subscribed channels. When an agent subscribes to a noisy channel without filter rules, false entries consume buffer slots and trigger incorrect rule evaluations."

Nadia's job: wrap this in Reyes's voice for the tactical register, and Unit 0's voice for the empirical register.

She types the Reyes version first: "Enemy signals will flood your channels. That's their doctrine -- drown your relays in garbage until your strikers can't find real targets. The filter is your countermeasure. Define what matters. Everything else dies on arrival."

Then Unit 0: "Observed: agents subscribing to unfiltered channels in contested zones maintained targeting accuracy for 4.2 ticks before buffer saturation. Post-saturation, rule evaluations referenced stale or fabricated entries in 73% of decisions. Confidence: CERTAIN. Filter configuration reduced false-positive rate to below 8% in controlled tests."

She reads both aloud. Reyes sounds like a field officer briefing troops. Unit 0 sounds like a research paper with feelings. Good. She pastes them into the dual-voice template, assigns the Reyes text to the "Tactical" tab and the Unit 0 text to the "Empirical" tab.

**Minute 8:00 -- The Cross-Link Pass**
Every interaction entry must link to related term entries and related interaction entries. Filter + channel noise links to: filter (term), channel (term), noise (term), fidelity threshold (term), filter + fidelity threshold (interaction), amplify + channel noise (interaction). Nadia clicks each link to verify the target exists. Two of them are stubs. She flags them for next week's sprint.

**Minute 12:00 -- The Playtest Check**
She loads the terminal in the dev build, navigates to "filter," scrolls to the interaction section. The entry appears under a header: "CROSS-CUTTING SIGNALS." Below the header, interaction cards arranged in a column. Each card shows: the paired term's icon, a one-line summary, and a "Read full signal" expand button. She clicks "channel noise." The card expands to show the dual-voice entry -- Reyes tab selected by default, Unit 0 tab one click away. The mechanical layer sits in a collapsible "RAW DIAGNOSTIC" section at the bottom, monospace font, for players who want the numbers.

The card feels right. Dense enough for veterans, voiced enough for narrative players, mechanically complete for optimizers. She marks filter + channel noise as "Authored" and moves to the next red cell.

---

#### Journey: Tomás, 16, High School Student (First Strategy Game)

**Context:** Tomás is in Mission 7. He's just lost a battle because his striker ignored a flanking enemy. He thinks the problem is his hooks, but he's not sure how compress interacts with hooks. He opens the terminal.

**Minute 0:00 -- The Search**
Tomás presses Tab. The terminal slides open from the right edge of the workbench -- a dark panel with a monospace header: `> QUERY: _`. The cursor blinks amber. The panel's background is a deep charcoal, almost black, with faint horizontal scan lines that drift slowly upward -- CRT static, barely perceptible. The terminal feels like a machine thinking.

He types "compress hooks." Two characters in, the auto-suggest dropdown begins populating: `compress`, `compress + filter`, `compress + hooks`, `compress + amplify`. He selects "compress + hooks." A soft two-note chime -- the "query acknowledged" sound, a rising minor second.

**Minute 0:12 -- The Entry Loads**
The screen transitions: the query line slides upward, and below it, a card materializes. The card header reads: **COMPRESS x HOOK INTERACTION** in small caps, with the compress icon (three converging arrows) and the hook icon (a curved fishhook glyph) flanking the title.

The Reyes voice tab is active by default (Tomás set this preference in Mission 5 after discovering he preferred the tactical register):

> "Your relay compresses three sightings into one summary. Good. But the hook that forwards that summary doesn't know it's compressed. The hook fires on 'new buffer entry' -- and a compressed entry is one entry. If your hook threshold is set to fire on every entry, compressed signals transmit immediately. If your threshold is 3 entries before firing, the compression actually delays transmission -- the relay compresses three into one, then waits for two more entries before the hook fires. You've built a pipeline that compresses for speed but hooks for batching. Those goals fight each other."

Tomás reads it twice. The second time, his eyes widen. He mutters: "Oh. That's what happened." His relay was compressing scout reports into single entries, but the hook's threshold was set to 3 -- so the compressed signal sat in the buffer for two more ticks while the hook waited for entries that would never come because compression was reducing the count. His striker never got the flanking warning.

**Minute 0:45 -- The Cross-Reference**
Below the Reyes text, a "Related Signals" section lists three links: `compress + filter`, `hooks + channel latency`, `compression threshold (term)`. Tomás clicks "compression threshold." A new card slides in from the right, pushing the interaction card to a breadcrumb trail at the top. The term entry for compression threshold includes a small interactive diagram: a slider labeled "threshold" with values 2-5, and below it, a timing diagram showing how many ticks elapse between buffer entry arrival and hook transmission at each threshold value.

Tomás drags the slider to 1. The timing diagram shows: "Hook fires on every entry. Compressed signals transmit immediately." He drags it to 3. "Hook waits for 3 entries. Compressed signals delayed by N ticks until 2 additional entries arrive." He sees the conflict visually. He closes the terminal, returns to the workbench, and changes his hook threshold to 1. Problem solved.

**Minute 1:30 -- The Invisible Teaching**
Tomás doesn't realize he just learned about pipeline impedance matching -- the real-world engineering concept where two connected systems with mismatched throughput rates create bottlenecks. The terminal taught him a transferable principle through a game-specific interaction description, without ever using the word "impedance."

---

#### Journey: Elena, 24, New Player Browsing the Codex for the First Time

**Context:** Elena just finished Mission 1 (Wake). She has four terms unlocked: buffer, slot, observation, noise. She heard about the terminal from a friend who described it as "the game's built-in wiki." She opens it to explore.

**Minute 0:00 -- The First Impression**
Elena presses Tab. The terminal opens. It's darker than the workbench -- the charcoal background with drifting scan lines feels like entering a different room. The header reads: `TERMINAL v0.1 -- 4 SIGNALS INDEXED`. Below: four cards arranged vertically, each showing an icon and a term name. Buffer (a horizontal bar divided into segments). Slot (a single segment, highlighted). Observation (an eye icon). Noise (a jagged waveform).

The rest of the terminal is present but dimmed -- a faint grid of empty card outlines stretches below the four active ones, like shelves waiting to be filled. Some outlines have ghostly shapes inside them -- the silhouettes of icons not yet revealed. Elena can see that the terminal will grow. It feels like a collection in progress, not a finished reference.

**Minute 0:15 -- Browsing a Term**
She clicks "buffer." The card expands. The header reads: **BUFFER -- Context Memory Subsystem.** The Unit 0 empirical tab loads first (Elena hasn't set a voice preference yet, so the default is Unit 0 for term entries, Reyes for interactions):

> "The buffer is the agent's working memory. Fixed capacity. Each slot holds one observation, one signal, or one compressed summary. When the buffer fills, the oldest entry is evicted unless an eviction policy overrides default behavior. Buffer size varies by unit type: Scout 6, Striker 8, Relay 12, Specialist 10, Command 14. Confidence: CERTAIN."

Below the voice text, a "RAW DIAGNOSTIC" collapsible shows the mechanical definition. Elena doesn't expand it -- the voice text told her what she needs.

**Minute 0:30 -- The Empty Interactions Section**
Below the buffer entry, a section header reads: "CROSS-CUTTING SIGNALS." One interaction card is visible: **buffer x slot** -- a trivially simple entry explaining that slots are the units of buffer capacity. Below it, two more card outlines are dimmed with faint text: "SIGNAL PENDING -- Interaction data will compile as more subsystems initialize." Elena understands: these interactions will unlock as she plays more missions and the terminal indexes more terms.

She scrolls down. Below the interactions, a "FIELD NOTES" section is empty except for a placeholder: "No field manual pages collected for this entry. Pages may be found during mission exploration." Elena makes a mental note to watch for collectible pages.

**Minute 0:50 -- The Collection Instinct**
Elena counts: 4 of... she scrolls to the bottom. The ghostly card outlines number roughly 30. She's seen 4. Twenty-six to go. The terminal feels like a Pokédex -- incomplete, inviting completion. She closes the terminal and starts Mission 2, not because she needs to, but because she wants to see what term unlocks next.

She doesn't realize the terminal has just converted her from "playing missions to progress" to "playing missions to fill the reference." The collection drive and the learning drive are now the same drive.

**Minute 1:10 -- The After-Mission Return**
After completing Mission 2, Elena opens the terminal immediately. The header now reads: `TERMINAL v0.2 -- 8 SIGNALS INDEXED`. Four new cards have materialized with the subsystem-online micro-celebration (5.04c) -- buffer size, confidence, staleness, eviction. The kulintang babendil chime played during the unlock. She clicks "eviction" first, because it sounds ominous. Unit 0's entry is careful and precise: "When buffer capacity is exceeded, the eviction policy determines which entry is removed. Default: FIFO (oldest first). Alternatives: LRU, Priority. Eviction is not deletion -- it is forgetting. The distinction matters."

Elena lingers on that last sentence. "Eviction is not deletion -- it is forgetting." Unit 0's voice is making her feel something about a data structure. She's hooked.

---

## Strengths and Weaknesses

### Approach A: Manual Authoring ("The Encyclopedia")

**Strengths:**
- Maximum narrative quality -- every entry has full diegetic voice, authored by a human who understands the game's emotional register
- Interactions can reference specific campaign moments ("You first encountered this in Mission 4 when your striker froze")
- No tonal inconsistency between entries -- the same writer's voice throughout
- Cross-links can be curated by a human who understands conceptual proximity, not just mechanical overlap

**Weaknesses:**
- Scale: 21,000 words is achievable but fragile -- one writer's pace determines the entire terminal's completeness at launch
- Maintenance debt: every balance change requires a content audit across all affected entries
- Blind spots: the author's play experience biases which interactions feel "important" -- expert-blind to beginner confusion points
- Launch risk: if the writer falls behind, the terminal ships incomplete, breaking the "comprehensive reference" promise

### Approach B: Templated Authoring ("The Stamp Press")

**Strengths:**
- Consistency guaranteed -- every entry has the same sections, the same depth, the same structure
- Faster authoring: templates eliminate structural decisions, focusing writer energy on content
- Stubs provide complete coverage -- no term pair returns nothing; the worst case is a functional-but-flat entry
- Easier to onboard additional writers -- the template constrains style divergence

**Weaknesses:**
- Template rigidity: some interactions are fundamentally different in kind (a synergy reads differently from a degenerate case), and a single template flattens these distinctions
- Stubs are detectable -- players will notice the tonal shift between authored and stubbed entries, breaking immersion
- The template voice tends toward encyclopedia neutral, fighting the diegetic commitment (Reyes doesn't speak in templates)
- Still requires significant human effort for the ~60 fully-authored entries

### Approach C: Procedural Rule-Based ("The Compiler")

**Strengths:**
- Mechanical accuracy guaranteed by the interaction graph -- if the data model is correct, every generated description is correct
- Instant coverage: all ~180 relevant interactions have mechanical descriptions on day one
- Automatic maintenance: when balance changes update the interaction graph, descriptions regenerate
- The mechanical layer serves as a source of truth that human-authored voice text can diverge from without losing accuracy

**Weaknesses:**
- Generated prose is flat -- "compress outputs compressed_signal that amplify consumes as input" teaches mechanics but doesn't teach feeling
- The interaction graph itself requires significant upfront engineering -- defining edge types, output/input mappings, and template grammars is a development cost hidden behind "automation"
- Edge cases: emergent interactions that arise from timing, buffer pressure, or multi-hop chains can't be captured by pairwise graph edges
- Risk of false completeness: the generated layer covers everything, which may reduce motivation to author the voiced layer for lower-priority entries

### Approach D: Player-Behavior-Driven ("The Dispatch Board")

**Strengths:**
- Perfect prioritization -- the entries that get written first are exactly the ones players need most
- Community submissions turn the authoring pipeline into a living system that grows with the player base
- Reduced launch burden: only ~50 entries needed at ship (30 terms + 20 campaign interactions), with the rest filled post-launch
- "SIGNAL PENDING" stubs are diegetically coherent -- the terminal is a system that's still indexing, not a reference that's incomplete

**Weaknesses:**
- Launch window vulnerability: early players encounter a sparse terminal, and first impressions are permanent
- Telemetry dependency: requires instrumented search tracking, click tracking, and a dashboard before the data is actionable
- Community moderation cost: player-submitted entries need voice consistency review, factual accuracy checking, and diegetic framing verification
- Feedback lag: a player who needs an interaction description today won't benefit from it being authored next week

---

## The Recommended Hybrid: "The Living Index"

Combine C's mechanical completeness with A's voiced depth for campaign-critical entries, and D's telemetry-driven prioritization for post-launch expansion.

**Pre-launch:** Author all 30 term entries in full dual-voice (Reyes + Unit 0). Build the interaction graph (Approach C) to generate mechanical descriptions for all ~180 relevant pairs. Fully author the ~25 Tier 1 campaign-taught interactions in dual-voice. Remaining ~155 interactions ship with generated mechanical text in a "RAW DIAGNOSTIC" panel and a "SIGNAL PENDING" marker where the voiced text would appear.

**Post-launch:** Telemetry identifies the most-demanded "SIGNAL PENDING" entries. A biweekly content sprint voices the top 10. Community submissions fill Tier 3 entries with "[Community Signal]" badges. Within 8 weeks, the terminal covers ~80 voiced interactions, with mechanical text backing the rest.

**The diegetic justification:** The terminal is an indexing system. Indexing takes time. The AI (Unit 0) is still processing field data. "SIGNAL PENDING" isn't a missing entry -- it's an entry the system hasn't finished compiling. When a voiced version appears in a patch, the terminal displays a brief "NEW SIGNAL COMPILED" notification with a micro-celebration chime. The authoring pipeline IS the fiction.

---

## Interaction Effects

**Blueprint Codex:** The Codex is the card-collection screen (Units, Skills, Rules, Hooks, Channels). The terminal is the Codex's reference companion -- clicking "Learn more" on any Codex card opens the terminal to that term's entry. The Codex shows what you HAVE; the terminal explains what it DOES. The two systems must share a vocabulary index so Codex card names exactly match terminal entry headers.

**Boot Log:** Term entries in the terminal are seeded by boot log text. When the boot log introduces "CONTEXT BUFFER INITIALIZED" in Mission 1, the terminal's buffer entry auto-populates with an excerpt from that boot log line. The boot log is the first draft; the terminal is the canonical reference. Players who re-read their boot log history and then check the terminal see the same concepts at two levels of detail.

**Inspector:** The terminal in Inspector mode (5.16b) becomes context-aware. When a player pauses at tick 23 and opens the terminal, interaction descriptions reference the current tick state: "At tick 23, your relay's compress threshold was set to 3 but only 1 entry had arrived since last compression. The hook did not fire." This requires the terminal to read replay state -- a significant engineering integration.

**Onboarding Sequence:** Terminal entries unlock progressively (5.16d). The authoring pipeline must tag every entry with its unlock mission. Entries for terms not yet introduced must be invisible, not just greyed -- a player in Mission 3 should not see interaction descriptions referencing compress (Mission 8). The progressive disclosure system and the authoring pipeline share a dependency: every entry needs an `unlock_mission` field.

**Community Wikis:** The terminal's existence should REDUCE wiki dependency, not compete with it. The "[Community Signal]" badge system acknowledges that community knowledge will exceed developer-authored content. A future API (5.16c) could export terminal entries as shareable links: "here's the compress+hooks interaction entry" as a URL. This turns the terminal into a canonical reference that wikis link TO rather than replace.

---

## Comparable Games

**Civilization VI -- Civilopedia:** The Civilopedia is the gold standard for in-game encyclopedias with cross-referencing. Every technology, unit, building, and civic has an entry with links to every related entry. The authoring approach is pure Approach A (manual) at enormous scale -- thousands of entries across expansions. The lesson: manual authoring at Civ's scale requires a dedicated content team. For Robot Uprising's ~30 terms + ~180 interactions, the scope is manageable but the per-entry depth is far greater.

**Stellaris -- In-Game Wiki:** Stellaris ships an in-game wiki overlay that mirrors the external wiki. Cross-references between entries handle the game's enormous concept space (ethics, government types, ship components, anomalies). The lesson: Stellaris's wiki is non-diegetic -- it's a reference tool that acknowledges it's a reference tool. Robot Uprising's terminal must maintain diegetic framing, which means every entry needs narrative voice, not just mechanical accuracy. This is the extra authoring cost of the diegetic commitment.

**Path of Exile -- Passive Skill Tree + Wiki Ecosystem:** Path of Exile's passive tree has 1,325 nodes with hundreds of keyword interactions. The in-game reference is minimal -- tooltips and short descriptions. The REAL reference is the community wiki, which documents every interaction exhaustively. The lesson: if your in-game reference is insufficient, the community builds a better one outside the game. Robot Uprising's terminal should make the external wiki unnecessary for the first 100 hours of play. The community wiki becomes the advanced reference for Gauntlet-level optimization, not a crutch for basic comprehension.

**Magic: The Gathering -- Gatherer / Scryfall:** MTG's card database has 27,000+ unique cards with a formal rules system (the Comprehensive Rules) governing all interactions. Gatherer provides rulings for specific card interactions -- not exhaustive coverage, but targeted entries for commonly confused pairs. Scryfall (community-built) adds advanced search and syntax. The lesson: MTG's approach is closest to Approach D -- rulings are authored reactively based on player confusion, not proactively for every possible pair. "SIGNAL PENDING" in Robot Uprising's terminal is analogous to a card interaction that hasn't received an official ruling yet.

**Dwarf Fortress -- The Wiki as Survival Requirement:** Dwarf Fortress is famously unplayable without the community wiki. Every material, creature, workshop, and syndrome interaction is documented externally. The in-game reference is essentially nonexistent. The lesson: this is the anti-pattern. Robot Uprising's terminal exists specifically to prevent the Dwarf Fortress situation, where the game outsources comprehension to a volunteer-maintained external resource. The terminal is the wiki, built into the game, maintained by the developer, written in-voice.

**Slay the Spire -- Keyword System:** Slay the Spire uses keywords (Vulnerable, Weak, Intangible, etc.) with tooltip definitions. Keywords interact through cards, but the game provides no cross-referencing between keywords -- the player must discover that Vulnerable + multi-hit attacks = multiplicative damage by experimentation or wiki reading. The lesson: tooltips are necessary but insufficient. Players need a place to look up INTERACTIONS, not just DEFINITIONS. The terminal's interaction entries fill the gap that Slay the Spire's tooltips leave open.

---

## Sensory Description: The Terminal Experience

The terminal occupies the right third of the screen when open, pushing the workbench left rather than overlaying it. Its background is a deep charcoal (#1a1a1e) with barely perceptible horizontal scan lines that drift upward at one pixel per second -- the visual signature of a CRT display running a persistent process. The scan lines are not decorative; they are a living texture that makes the terminal feel like a machine that is always on, always indexing, even when closed.

The header bar is a single line of amber monospace text: `> TERMINAL v[X.X] -- [N] SIGNALS INDEXED`. The version number increments with each mission's term unlocks. The signal count is the total number of authored entries (terms + interactions). This number growing across the campaign is a subtle progress indicator.

Below the header, the query line: `> QUERY: _` with a blinking amber cursor. The cursor blink rate is 530ms -- slightly faster than the standard 1000ms terminal cursor, conveying a sense of readiness, of a system eager to respond. Typing produces monospace characters with a faint, dry keyclick sound -- not mechanical keyboard, but membrane keys in a sealed enclosure. Each character appears with zero latency.

Search results materialize below the query line as cards. Each card has a left-edge color bar: teal for term entries, amber for interaction entries, grey for stubs. The card's background is slightly lighter than the terminal's charcoal (#242428). On hover, the card lifts 2px with a subtle shadow -- the only hint of material design in an otherwise flat interface.

Inside a card, the voice text occupies the primary space. Reyes's text renders in a slightly condensed sans-serif (suggesting field reports). Unit 0's text renders in the same monospace as the terminal header (suggesting system output). The tab switcher between voices is two small rectangles labeled `TACTICAL` and `EMPIRICAL` -- understated, not competing with the content.

The "RAW DIAGNOSTIC" collapsible at the bottom of each card uses a different visual language: full monospace, reduced font size, no color, pure data. Expanding it adds a mechanical hum to the ambient audio -- the sound of a system dumping raw output. Collapsing it restores silence.

When a player navigates from a term entry to an interaction entry, the transition is a horizontal slide -- the term card pushes left into a breadcrumb trail, and the interaction card slides in from the right. The breadcrumb trail at the top shows the navigation path: `buffer > buffer x eviction > eviction policy`. Clicking any breadcrumb snaps back to that card. The navigation feels like moving through a linked document -- a hypertext system with physicality.

"SIGNAL PENDING" stubs pulse faintly -- a slow amber breathe animation on the card's border, once every 4 seconds. The pulse conveys "this entry is being processed," not "this entry is missing." Inside the stub, the text reads: "Signal compilation in progress. This interaction has been observed in field data but requires further analysis before indexing. Check back after additional mission data is processed." The language is Unit 0's -- clinical, patient, promising eventual completeness.

When a new entry is authored and patched in (replacing a "SIGNAL PENDING" stub), the next time the player opens the terminal, a notification appears: `NEW SIGNAL COMPILED: [term_a] x [term_b]`. The stub's amber pulse stops. The card's border flashes teal once, then settles into the standard interaction amber. A single low chime -- the agung from the kulintang vocabulary (5.04c) -- marks the moment. The terminal just got smarter.

---

## Named Patterns

**"The Living Index" (Recommended Hybrid):** C's compiled mechanical layer + A's voiced campaign entries + D's telemetry-driven post-launch expansion. The terminal ships complete in coverage, incomplete in voice, and grows its narrative texture over time.

**"The Impedance Match Problem":** When two connected systems (like compress threshold and hook threshold) have mismatched configurations, the pipeline creates unintended bottlenecks. This is the interaction the terminal is best at explaining -- and the reason interaction entries exist at all.

**"The Signal Pending Promise":** Using diegetic language ("signal compilation in progress") to frame incomplete content as an in-universe process rather than a missing feature. Turns the authoring pipeline's limitations into a narrative beat.

**"The Dispatch Board Sprint":** The biweekly content authoring cycle driven by telemetry data. A production cadence that matches game-as-service content delivery to an in-game reference system.

**"The Community Signal Badge":** Player-submitted interaction descriptions that pass moderation and appear in the terminal with a distinct visual treatment. Turns the authoring bottleneck into a community participation mechanic.

---

## New Aspects Discovered

- [ ] 5.16a-i — Interaction graph data model: the typed directed graph (skills as nodes, relationship types as edges) that powers procedural generation of mechanical interaction descriptions; graph schema, edge type taxonomy, generation templates
- [ ] 5.16a-ii — "SIGNAL PENDING" as diegetic loading state: the narrative framing of incomplete terminal content as an in-universe indexing process; how the framing changes player perception of missing content
- [ ] 5.16a-iii — Community Signal moderation pipeline: how player-submitted terminal entries are reviewed for voice consistency, factual accuracy, and diegetic framing; badge visual design; community contributor recognition
- [ ] 5.16a-iv — Terminal telemetry dashboard: the developer-facing analytics system that tracks which terminal entries players search for, click, and dwell on; how telemetry drives the authoring priority queue
- [ ] 5.16a-v — Terminal entry versioning and balance-change propagation: when a balance patch changes a skill's parameters, how affected term entries and interaction descriptions are flagged, updated, and re-validated across the mechanical and voiced layers

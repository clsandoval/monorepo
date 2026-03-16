# Onboarding: The Hybrid Tutorial Architecture — Where Interactive Teaching Hands Off to Diegetic Document

**Aspect ID:** 5.17
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00 (external-documentation anti-pattern), 5.00a (vocabulary pacing bottleneck), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative — boot log), 5.03 (tutorial as sandbox), 5.04 (complexity ramp), 5.10 (product-as-puzzle narrative method), 5.15 (voice candidates), 5.16 (non-alt-tab embedded document UI), 1.01 (Shenzhen I/O), 1.04 (EXAPUNKS — TWN), 1.04b (diegetic tutorial documents), 3.05a (conditional prefix)

---

## The Core Problem: Two Teaching Systems That Don't Know About Each Other

Robot Uprising has committed to two distinct pedagogical systems:

1. **Interactive first-touch tutorial** — the "hands before head" approach. Missions 1-4 teach through doing: filter puzzles (M1-2), hook wiring (M3), rules authoring (M4). The player touches the mechanic before they name it. The boot log frames each mechanical discovery as AI subsystem initialization. This is procedural knowledge: how to drag, what to click, when to execute.

2. **Diegetic document reference** — the Blueprint Codex. A persistent collection-style card screen accessible anytime after first encounter. Unit cards, skill cards, rule cards, hook cards. This is conceptual knowledge: what compress does exactly, how eviction priority works, what the difference between amplify and filter is.

The problem is the **seam** between these two systems. Every hybrid tutorial architecture has a handoff moment — the point where the game stops holding the player's hand through interactive guidance and says "from now on, check the reference." If this handoff is invisible, the player doesn't know the reference exists. If it's clumsy, it feels like being kicked out of a classroom and handed a textbook. If it's too early, the player hasn't built enough procedural fluency to make the reference meaningful. If it's too late, the player has already developed bad habits or alt-tabbed to a wiki.

The question is not whether to have both systems. Both are locked. The question is: **where does the handoff happen, what does it feel like, and how does the player's relationship with each system evolve across 10 missions?**

---

## The Handoff Taxonomy: Six Models

### Model A: "The Clean Break" — Interactive Stops, Document Starts

The interactive tutorial covers Missions 1-4 completely. Starting Mission 5 (factory introduction), the game never prompts interactive tutorials again. Instead, new mechanics are introduced through Codex entries that unlock automatically. The player discovers the Codex through a boot-log moment:

```
[0412] CORE      : knowledge base restructured
[0413] CORE      : tactical archive now available — CODEX ACCESS ENABLED
[0414] CORE      : all prior subsystem documentation archived
[0415] CORE      : future capability documentation will appear in Codex
[0416] CORE      : interactive initialization... no longer required.
```

**How it works:** Missions 1-4 are interactive-tutorial-dominant — the boot log narrates, the game constrains, the player follows a guided path. Mission 5 marks the transition: the boot log announces the Codex, the game immediately presents a new mechanic (production queue) with NO interactive guidance, and a pulsing Codex icon indicates a new entry is available. The player must self-direct: open the Codex, read the production queue card, figure out how to use it.

**What this model gets right:** Clean narrative arc. The AI has finished booting — it no longer needs hand-holding. The "initialization complete" moment is a genuine milestone that feels earned. The player's graduation from tutorial to reference is diegetically justified.

**What this model gets wrong:** The cliff. Mission 5 already introduces 5 new terms AND a new mode of play (5.00a). Removing interactive guidance at exactly the highest-difficulty transition is cruel. Players who thrived with guided interactive teaching may crater when forced to self-direct through a reference document. The handoff is a wall, not a ramp.

**Comparable:** Dark Souls. After the tutorial area (Undead Asylum), the game drops you in Firelink Shrine with no further interactive guidance. The item descriptions and NPC dialogue become your "reference." This works for Dark Souls because the core mechanic (attack, dodge, roll) is simple — the challenge is execution, not comprehension. Robot Uprising's challenge IS comprehension. A Dark Souls handoff would filter out the audience the game explicitly wants to include ("someone who's never played a strategy game").

### Model B: "The Gradual Fade" — Interactive Teaching Gets Quieter

Interactive tutorial elements never fully stop. Instead, they get progressively lighter across the campaign:

| Mission | Tutorial Density | What Interactive Guidance Looks Like |
|---------|-----------------|--------------------------------------|
| M1-2 | Full | Constrained puzzles, locked UI, step-by-step boot log, one path forward |
| M3-4 | Heavy | Guided first encounter, then open sandbox. Boot log narrates but doesn't constrain |
| M5-6 | Medium | First-time-use highlights (golden glow on new UI elements). Codex entries unlock. Boot log provides 1-2 orientation lines, then goes silent |
| M7-8 | Light | New mechanics appear in Codex only. Boot log is purely narrative (no instructions). A subtle pulse on the Codex icon when new content is available |
| M9-10 | Absent | No interactive guidance. No highlights. The player is an expert. The Codex is comprehensive |

**How it works:** The handoff is not a moment — it's a gradient. Each mission reduces the interactive teaching volume by one notch while increasing the Codex's role by one notch. The player's relationship with the reference document develops gradually. By Mission 7, they're already accustomed to checking the Codex for new entries rather than waiting for the game to explain things.

**The "first-time-use highlight" mechanic:** When a player encounters a new UI element for the first time (the production queue in M5, the Command agent's reassign panel in M6), it glows with a soft golden pulse — not a tooltip, not a popup, just a visual invitation. If the player hovers, a single line of boot-log-style text appears: `[reassign]: redirect subordinate skill allocation`. If they click away, the glow fades after 3 seconds. If they open the Codex, the corresponding entry is highlighted. The highlight never appears on retry — it respects the player's time.

**What this model gets right:** No cliff. The player is never abruptly abandoned. Each reduction in interactive guidance is small enough that the player barely notices the transition. By the time explicit tutorials are gone, the player has internalized the habit of checking the Codex.

**What this model gets wrong:** The "where am I?" problem. In a gradual fade, there's no clear moment where the player feels "I'm ready." The graduation from student to practitioner is implicit. Some players want — need — the moment of confidence that comes from a clear boundary. The gradual fade risks producing players who are competent but never feel competent. They keep expecting guidance that no longer comes, and interpret its absence as "the game forgot to teach me this."

**Comparable:** Breath of the Wild's approach to shrines. The first few shrines (on the Great Plateau) are heavily guided, with the Sheikah Slate tutorial gating progress. But there's no "tutorial over" flag — the guidance just... stops. Most players don't notice because they've absorbed the vocabulary. But a significant minority reach the end of the Great Plateau confused about mechanics that were implicitly graduated out of the tutorial zone.

### Model C: "The Dual Track" — Interactive and Document Run in Parallel

The interactive tutorial and the diegetic document are not sequential — they're simultaneous from Mission 1. Every interactive teaching moment has a corresponding Codex entry that unlocks at the same time. The player can engage with either or both.

**How it works:** When the player drags their first noise observation out of a buffer in M1, two things happen: (1) the boot log narrates the action (`[0024] CONTEXT: noise entry evicted — slot freed`), and (2) a quiet chime plays and the Codex icon gains a blue dot (new unread entry). If the player opens the Codex, they find a card for "Observation — Noise" with a brief description, an icon, and a reference to the buffer slot mechanic. If they don't open the Codex, the blue dot remains until they do. No penalty either way.

The Codex grows alongside the interactive tutorial. By M4, the Codex has 18 entries covering everything the interactive tutorial has taught. The player can reference any of them at any time. Starting M5, new mechanics appear FIRST in the Codex (the entry unlocks at mission start) and THEN in play (the player encounters the mechanic). The Codex becomes a preview system: "read what's coming, then experience it."

**What this model gets right:** Player agency over learning mode. Fast learners skip the interactive tutorial and read the Codex. Slow learners ignore the Codex and rely on interactive guidance. Visual learners look at the card art. Textual learners read the descriptions. The dual track respects different learning styles without forcing one path.

**What this model gets wrong:** The Codex-in-Mission-1 problem. Opening a reference document during a filter puzzle — the simplest possible interaction — is absurd overengineering for the moment. The player is dragging one card out of a stack. They don't need a reference card explaining what "noise" is when they're literally looking at it. Early Codex entries feel like help for a task that doesn't need help. This trains the player to dismiss the Codex as unnecessary, exactly when they should be building the habit of checking it.

**Comparable:** Civilization VI's Civilopedia. Available from turn 1, comprehensive, always updated. And almost universally ignored by new players because the early game doesn't require it. The Civilopedia's value emerges around turn 100 when the player encounters a system (diplomatic visibility, amenities, housing) that the in-game feedback doesn't sufficiently explain. But by then, many players have trained themselves to ignore the Civilopedia entirely and instead alt-tab to the wiki.

### Model D: "The Materialization" — Document Emerges from Interactive Teaching

The Codex does not exist at the start of the game. It materializes through play. Each interactive tutorial completion generates a Codex card as a tangible artifact of what the player learned.

**How it works:** In M1, the player drags noise out of a buffer. The boot log narrates. After the puzzle resolves, a new visual beat plays: a card crystallizes on screen — it slides from the buffer visualization into a collection panel at the bottom of the screen, accompanied by a soft chime and a shimmer animation. The card has the "Noise" icon, a one-line description, and a small portrait. This IS the Codex entry. The Codex is being built by the player's actions.

By M4, the player has accumulated 18 cards through interactive play. Each card represents a concept they physically touched. The collection panel has grown into a visible tray. At Mission 5, the boot log announces:

```
[0412] CORE      : knowledge base... compiling
[0413] CORE      : 18 experiential records found
[0414] CORE      : organizing into indexed archive
[0415] CORE      : BLUEPRINT CODEX initialized
[0416] CORE      : all future capability records will be indexed automatically
```

The tray transforms — cards rearrange themselves into the full Codex grid layout. The Codex opens for the first time as a complete, organized reference of everything the player has already learned. Future entries appear here automatically when new mechanics are first encountered.

**The critical difference from Model C:** The Codex's existence is EARNED. It doesn't feel like a help system imposed by the developer. It feels like the AI organizing its own knowledge — which is exactly what the diegetic framing says is happening. The player watched their knowledge accumulate card by card, then saw it organize itself into a searchable reference. The Codex's authority comes from the player's own experience.

**What this model gets right:** The strongest diegetic justification. The Codex IS the AI's memory. It was built from experience. This maps perfectly to the game's thematic core: information architecture determines behavior. The AI's own knowledge base is a designed system, just like its units' context windows. The player has been building a knowledge management system without realizing it.

The transition moment (M5 Codex initialization) is a BEAT — a narrative event with audio and visual ceremony. The player feels it. They know something changed. And because the Codex contains only things they've already touched, opening it for the first time produces recognition, not confusion. "Oh, that's the noise card from Mission 1. That's the hook card from Mission 3." Every entry has a personal history.

**What this model gets wrong:** The pre-M5 reference gap. If the player wants to look up how eviction works during M3, they can't — the Codex doesn't exist yet as a searchable reference. They have the accumulated card tray, but it's a flat collection, not an indexed reference. This means M1-4 are reference-less by design. For most players, this is fine — M1-4 are guided enough that reference isn't needed. But for players who replay M1-4 (after failing and wanting to re-examine concepts), the lack of a formal reference during the tutorial phase creates friction.

**Comparable:** Inscryption's deck-building. Each card you acquire has a physical presence on the table. Your collection of cards IS your deck — it was built from choices and encounters. When Inscryption transitions to its second act (the card game becomes a different game entirely), the deck's transformation feels earned because every card has a history. The Codex materialization follows the same principle: the reference document emerges from a collection of experiential artifacts.

### Model E: "The Mentor Withdrawal" — A Character Teaches, Then Leaves

The interactive tutorial is delivered by a character — the Predecessor (from 6.03a, the AI's previous iteration) or Unit 0 (the archivist from voice option B in 5.15). This character speaks through the boot log, highlights UI elements, and guides the player through M1-4. At M5, the character withdraws. Their final transmission is explicit:

```
[UNIT 0] : I have shown you everything I can show
[UNIT 0] : The archive contains everything I know
[UNIT 0] : You will learn the rest by building, failing, rebuilding
[UNIT 0] : I will be in the archive if you need me
[UNIT 0] : ...
[UNIT 0] : Good luck, architect.
```

The Codex is framed as "Unit 0's archive" — the place where the mentor's knowledge lives. Consulting the Codex is visiting the mentor. New entries appear written in Unit 0's voice, maintaining the relationship even though the interactive guidance is over.

**How it works:** The handoff is emotional, not mechanical. The player loses a companion. The Codex is the companion's legacy. Opening the Codex is not "checking a help file" — it's "asking Unit 0." This reframes the reference document as a character, not a tool.

When the player encounters something new in M5+ and opens the Codex, the entry appears with a subtle flicker — as if Unit 0 just finished writing it. A faint typewriter sound plays for the first viewing of each entry. The character is still there, still teaching, but at one remove. They are no longer in the room. They are in the book.

**What this model gets right:** Emotional weight. The handoff is a story beat, not a UX transition. Players remember when their mentor left. The Codex has emotional texture — it's not a help file, it's a person's knowledge. This maps to a real engineering experience: the senior developer who onboards you eventually stops pairing and becomes a resource you consult asynchronously. The transition from synchronous mentorship to asynchronous reference is a transferable lesson.

**What this model gets wrong:** Dependency risk. If the player bonds too strongly with Unit 0, their departure creates grief that interferes with Mission 5's cognitive demands. The player is processing an emotional event (mentor withdrawal) simultaneously with a mechanical event (factory introduction + 5 new terms). Emotional and cognitive load compound. Some players may stop playing not because they're confused but because they're sad.

Also: if the mentor's voice in the Codex is TOO present, the handoff feels fake — "you said you left but you're right here." The entries must feel like pre-written reference material, not live dialogue. The mentor's absence must be real.

**Comparable:** Ori and the Blind Forest. Sein guides the player through the early game with dialogue, highlighting, and emotional presence. Sein never fully withdraws (the character stays throughout), but the tutorial guidance fades while the character relationship continues. The risk Ori avoids — and Robot Uprising must also avoid — is the mentor feeling like a hindrance rather than a help. If Unit 0 talks too much during M1-4, players won't miss them — they'll be relieved.

### Model F: "The Living Handoff" — The Document Teaches Differently

Neither system replaces the other. Instead, they teach different TYPES of knowledge and the player oscillates between them based on what they need.

**The division:**
- **Interactive tutorial** teaches *procedures* — how to physically interact with the game. Dragging, clicking, wiring, reordering. "This is how you remove a noise entry." "This is how you wire a hook." Motor memory, spatial memory, click-sequence memory.
- **Diegetic document** teaches *concepts* — why things work the way they do. "Eviction priority determines which entries are discarded when the context window is full." "Signal latency scales with hop count because each relay adds 1 tick of processing time." Mental models, causal relationships, system dynamics.

**How it works:** From Mission 1, the interactive tutorial teaches procedures. Concurrently, the Codex grows (per Model D's materialization pattern). But the Codex entries don't repeat the interactive tutorial — they explain the WHY behind the HOW that the player just experienced. The M1 Codex entry for "Buffer Eviction" doesn't say "drag noise cards to remove them." It says: "When the context window is full, new observations cannot enter. The system must decide what to forget. Eviction priority — which entries matter most — determines which memories survive." The player has already done the dragging. The Codex explains the principle.

This means the interactive tutorial never fully stops — new procedures always get interactive teaching (the first time you open the production queue in M5, the game shows you how to drag blueprints into it). But conceptual depth always lives in the Codex. The game teaches HOW interactively and WHY through documents.

**The oscillation pattern:**
1. Player encounters new mechanic interactively (guided by boot log, first-time highlights)
2. Player successfully uses the mechanic (the procedure is learned)
3. Codex entry materializes (the concept card crystallizes)
4. Player may or may not read the concept now
5. Three missions later, the player encounters a situation where the concept matters (not just the procedure)
6. The player opens the Codex and reads the WHY for the first time with genuine motivation
7. The concept transforms their understanding — they redesign their approach based on principle, not habit

**The "three-mission delay" insight:** The most valuable Codex reads happen NOT when the entry first appears but 2-3 missions later, when the player encounters a problem that the concept explains. The M1 eviction entry becomes valuable in M4 when the player is writing rules and realizes rule evaluation depends on what's in the buffer, which depends on eviction priority. The Codex entry was available since M1 — but it became meaningful in M4. This delayed relevance is a feature, not a bug. It rewards players who return to old entries with fresh eyes.

**What this model gets right:** Procedure and concept are distinct learning targets. The interactive tutorial never has to explain WHY (which would slow it down and add cognitive load during motor learning). The Codex never has to explain HOW (which would make it redundant with the interactive experience). Each system does what it does best.

**What this model gets wrong:** The player must self-identify when they need conceptual understanding. A player stuck on M6 because they don't understand eviction priority needs to know that the Codex's "Buffer Eviction" entry contains the answer. But the connection between "my units keep making wrong decisions" and "I should re-read the eviction entry" requires metacognition that many players lack. The dual-track system works beautifully for self-directed learners and fails for players who don't know what they don't know.

**Comparable:** Slay the Spire. The game teaches card procedures through play (this card costs 2 energy, deals 8 damage) but never explains deck-building concepts (deck thinning, draw engine, frontloaded damage). The concepts live in the community — Reddit, YouTube, guides. Players who self-direct toward conceptual learning (reading strategy guides) become dramatically better. Players who don't may plateau. Robot Uprising's Codex would be the in-game equivalent of those community guides — but it must be more discoverable than Slay the Spire's external knowledge.

---

## Recommended Hybrid: D+F — "The Experiential Archive"

Combine Model D (materialization) and Model F (procedure/concept division) into a unified architecture.

### Architecture

**Phase 1: Interactive Procedural Teaching (M1-4)**
- Boot log frames each mission as subsystem initialization
- Constrained puzzles teach procedures through doing
- Each completed procedure generates a Codex card (materialization)
- Cards accumulate in a visible tray at screen bottom
- Cards contain CONCEPTS (the why), not procedures (the how)
- Players CAN read cards immediately but are not prompted to

**Phase 2: The Codex Initialization (M5 opening)**
- Boot log announces knowledge compilation
- Card tray transforms into organized Codex grid
- Accompanied by a 3-second ceremony: cards lift, sort themselves by category, settle into grid positions, a warm amber glow pulses once, a crystallization chord plays (three ascending notes: C-E-G)
- This is a narrative beat — the AI organizing its own mind

**Phase 3: Concept-Forward Reference (M5-10)**
- New procedures still get interactive first-touch teaching (golden glow highlight + one-line boot log text)
- New concepts appear as Codex entries, written in the diegetic voice (Unit 0 / Reyes — see 5.15)
- The Codex icon pulses when new unread entries exist
- No forced Codex reads — the player decides when to consult

**Phase 4: The Delayed Relevance Cycle (emergent)**
- M5+ missions create situations where M1-4 concepts become newly relevant
- The game does NOT point the player to old Codex entries
- Instead, the Inspector (debrief phase) surfaces the relevant concept: "Context overload at tick 12 — RELAY-B's context window was full when SCOUT-A's signal arrived. See: Eviction Priority"
- "See: Eviction Priority" is a clickable link that opens the Codex to that entry
- This is the missing bridge: the Inspector connects player failures to Codex concepts

### The Inspector-Codex Bridge

This is the critical design innovation that makes the hybrid work. The Inspector doesn't just show what happened — it links what happened to WHY it happened, and the WHY lives in the Codex.

**How it works mechanically:**
- Inspector's decision trace shows: "STRIKER-A did not engage at T14 because Rule 2 condition 'IF THREAT in context' evaluated FALSE"
- Below the trace, a diagnostic annotation: "THREAT signal from SCOUT-B arrived at T12 but was evicted at T13 (low priority, buffer full)"
- Below the annotation, a Codex link: **[Buffer Eviction →]** in amber text
- Clicking opens the Codex entry for Buffer Eviction, which explains the concept of eviction priority
- The player reads the concept, returns to the Inspector, and now understands: the fix is not "add more scouts" — the fix is "raise THREAT signal eviction priority in STRIKER-A's context config"

**The pedagogical flow:**
1. SEALED WATCH: Player sees their striker fail (emotional)
2. INSPECTOR: Player traces the failure to a specific cause (analytical)
3. CODEX LINK: Player reads the concept that explains the cause (conceptual)
4. PLAN SCREEN: Player modifies the config based on understanding (procedural)
5. EXECUTE: Player tests the fix (experiential)

This five-step loop is the game's mature teaching cycle. It doesn't require interactive tutorials. It doesn't require the player to randomly browse the Codex. The failure itself generates the motivation to learn, the Inspector provides the diagnostic, and the Codex provides the explanation.

### Why This Hybrid Works

1. **No cliff.** The interactive tutorial fades gradually (M1-4 heavy, M5-6 light, M7+ absent) while the Codex grows in authority.

2. **Earned reference.** The Codex materializes from experience, not from a developer-imposed help system. Every entry has a tactile history.

3. **Procedure/concept separation.** The interactive tutorial teaches HOW. The Codex teaches WHY. Neither duplicates the other.

4. **Failure-driven learning.** The Inspector-Codex bridge means the player encounters conceptual knowledge precisely when they need it — after a failure that the concept explains.

5. **Diegetic consistency.** The entire architecture maps to the AI's own growth: first it learns to use its subsystems (interactive), then it organizes its knowledge (Codex initialization), then it learns from failure (Inspector-Codex bridge). The player's learning journey IS the AI's learning journey.

6. **Replayability.** On replay, M1-4's interactive tutorials are skippable (the Codex already exists). But the Codex entries remain valuable because new situations create new reasons to re-read old concepts. The reference has permanent shelf life.

---

## Sensory Design: The Handoff Moments

### Card Materialization (M1-4, after each procedural milestone)

**Visual:** The relevant UI element (a buffer slot, a hook wire, a rule row) flashes once with warm amber. A ghostly outline of a card lifts from the element, semi-transparent, and floats to the card tray at screen bottom. As it settles, it solidifies — edges sharpen, the icon fills with color, a hairline golden border appears. The card makes a soft thup sound as it lands in the tray.

**Audio:** A two-note ascending chime (C4→E4) with a gentle metallic shimmer, like a music box tooth being struck. Not celebratory — acknowledging. "You learned something."

**Feel:** The card materialization is quiet and understated. It should feel like a bookmark being placed, not a trophy being awarded. The player should register it peripherally — "oh, a new card" — without it breaking their focus on the current puzzle. Over M1-4, the accumulation of 18 cards in the tray creates a growing sense of substance. The tray goes from sparse (2-3 cards) to full (18 cards) and the visual weight communicates progress.

### Codex Initialization (M5 opening)

**Visual:** The screen dims slightly (85% opacity overlay). The card tray at screen bottom lifts — all 18 cards rise simultaneously, hover at chest height. They begin to sort: units drift left, skills drift right, rules drift center. Cards rotate to face forward. They arrange into a 3×6 grid. A golden border frames the grid. The grid labels appear letter by letter (UNITS | SKILLS | RULES | HOOKS | CONFIG). The border pulses once — warm amber expanding and contracting. The cards settle.

**Audio:** A slow ascending arpeggio (C3→E3→G3→C4) played on a kulintang-like metallic tone, each note arriving as a category label appears. A deep resonant hum holds underneath — the sound of a system indexing. As the cards settle, a final soft bell: high C5 with long decay. Silence.

**Duration:** 4 seconds total. Long enough to register as a moment. Short enough not to annoy on replay.

**Narrative context:** This plays during the boot log's "knowledge base compiling" sequence. The boot log text and the card animation are synchronized — `[0412] CORE: knowledge base... compiling` appears as cards lift, `[0415] CORE: BLUEPRINT CODEX initialized` appears as the grid frame locks in.

### Inspector-Codex Link Click (M5+, during debrief)

**Visual:** The amber **[Buffer Eviction →]** text glows on hover. On click, the Inspector panel slides left (it doesn't disappear — it compresses to 40% width). The Codex opens on the right side, scrolled to the relevant entry. The entry's title pulses once with the same amber. A thin golden thread visually connects the Inspector's diagnostic annotation to the Codex entry header — a literal link between failure and knowledge. This thread fades after 2 seconds.

**Audio:** A soft page-turn sound (paper, not digital). Then the Codex's ambient hum — a very low, warm tone that says "you are in the library." This contrasts with the Inspector's cooler, more clinical audio palette.

**Feel:** The transition from Inspector to Codex should feel like zooming out — from specific failure to general principle. The Inspector is a microscope. The Codex is an encyclopedia. The link is the moment where the player goes from "what happened" to "why it happens."

---

## Player Journeys

### Journey: Sofia, 15, Casual Mobile Gamer — First Codex Encounter

**Context:** Sofia has completed Missions 1-3 on her phone during bus rides. She's comfortable with buffer management and hook wiring but hasn't opened the card tray once — she's noticed the cards accumulating at screen bottom but treats them as visual decoration. She's about to start Mission 5.

**Minute 0:00 — The Initialization**
Sofia taps Mission 5 on the campaign map. The screen loads. But instead of the boot log starting immediately, the cards in her tray lift. She stops scrolling. All 18 cards are floating, rearranging. She watches them sort into a grid. She reads the labels: UNITS, SKILLS, RULES, HOOKS, CONFIG. The kulintang chime plays through her earbuds.

She thinks: "Oh. Those were cards? Like a collection?" She taps the grid. The Codex opens full-screen. She recognizes everything — the noise icon from M1, the hook icon from M3, the rule card from M4. Each entry is a few sentences. She reads two of them. "Oh, THAT's what eviction does. I thought I was just throwing away garbage."

**Minute 0:45 — The New Mechanic**
The boot log begins: factory initialization. A new UI element appears — the production queue conveyor belt. A golden glow pulses around it. A boot-log line says `[production queue]: schedule blueprint construction order`. Sofia drags a Scout blueprint onto the conveyor. It works. A new card materializes — PRODUCTION QUEUE — and floats to the Codex grid.

She doesn't open the Codex this time. She's busy learning the new procedure. But she knows the card is there.

**Minute 4:00 — The First Factory Failure**
Sofia executes. Her scouts deploy but run out of energy. Her strikers never spawn — the production queue was wrong. In the Inspector, she reads: "SCOUT-A energy depleted at T8. No replacement queued." Below: "Production queue priority: Scout > Scout > Scout > Striker. Striker production delayed by 3× Scout cost." Below that: **[Production Queue →]**

She taps the link. The Codex opens. She reads: "The production queue builds blueprints left-to-right. Each blueprint costs materials and build time. Ordering determines which units exist when." She thinks: "I need the striker FIRST, not third."

**Minute 5:30 — The Fix**
Back on Plan screen, Sofia rearranges the conveyor: Striker > Scout > Scout. Executes. The striker deploys early, covers the scouts. Victory.

**What Sofia learned:** The Codex is not decoration — it's the answer key to her failures. But it only provides answers she has questions for.

### Journey: Marcus, 42, Factorio Veteran — Speed-Running the Handoff

**Context:** Marcus has completed Missions 1-2 in a single session and found them trivially easy. He's been clicking every card as it materializes, reading the Codex entries immediately. He's the self-directed learner Model F was designed for.

**Minute 0:00 — Pre-Reading Mission 3**
Marcus opens his card tray before starting M3. He's accumulated 8 cards. He reads the "Hook" entry that appeared at the end of M2's boot log (a preview card for the next mission's mechanic): "Hooks are reactive triggers. When a condition is met, the hook fires a signal on a named channel. All units listening on that channel receive the signal." He thinks: "Pub/sub. Got it."

He starts M3. The boot log begins narrating hook initialization. Marcus skips through the tutorial guidance by immediately wiring the hook correctly — he read the concept before encountering the procedure. The boot log catches up: `[0089] HOOK BUS: ... you're ahead of me, architect.`

**Minute 1:30 — Beyond the Tutorial**
Marcus opens the Codex and reads the "Signal Latency" entry: "1 tick per hop." He counts hops in his head. Scout→Relay→Striker = 4 ticks. He designs his M3 hook architecture to minimize hops. The tutorial didn't mention optimization — it just taught wiring. But the Codex entry gave Marcus the conceptual foundation to optimize on his own.

**Minute 5:00 — The Codex as Pre-Flight Checklist**
Before executing, Marcus opens the Codex and scans all hook-related entries. He's using the Codex the way a pilot uses a checklist — systematic verification against conceptual knowledge. He catches a mistake: he wired Scout→Striker directly (2 ticks) but also Scout→Relay→Striker (4 ticks), creating a duplicate signal with a 2-tick delay. The Codex entry on channels says "all listeners on a channel receive all signals." He removes the redundant path.

**What Marcus learned:** The Codex is a thinking tool, not just a reference. Reading ahead of the interactive tutorial lets him engage with the game as a design challenge from the start, not as a series of lessons.

### Journey: Aisha, 14, Never Played a Strategy Game — The Inspector Bridge

**Context:** Aisha picked up Robot Uprising because her older cousin showed her a TikTok of someone's relay network failing in a spectacular cascade. She's completed Missions 1-6 but struggles with M7. Her units keep making wrong decisions. She's replayed M7 three times without understanding why she's failing.

**Minute 0:00 — The Third Failure's Inspector**
Aisha watches the sealed replay of her fourth M7 attempt. Her Command agent sits motionless while her scouts die. She enters the Inspector. She clicks the Command agent. Decision trace: "COMMAND-A: no matching rule at T9, T10, T11, T12."

She scrolls down. "Rule 1: IF THREAT in context THEN reassign STRIKER-B to threat position." Diagnostic: "THREAT signal from SCOUT-C arrived at T8 but was not present in COMMAND-A's context at T9. Evicted at T8 due to low priority." Below: **[Eviction Priority →]**

**Minute 0:30 — The Codex Revelation**
Aisha taps the link. She's opened the Codex before but only to browse card art. This time she reads the full entry. "Eviction priority determines which context entries are removed when the context window is full. Low-priority entries are evicted first. If a critical signal has low eviction priority, it will be discarded before the unit can act on it."

She reads it twice. She thinks: "The THREAT message was thrown away before the Command could read it. Because I didn't make THREAT signals important."

**Minute 1:00 — The Conceptual Click**
She goes back to the Inspector. She sees it differently now. The eviction happened at T8. The rule checked at T9. The signal existed for less than one tick in the Command's context window. She opens the Command's context config on the Plan screen. She finds "Eviction Priority" — a drag-to-reorder list. THREAT is at the bottom. She drags it to the top.

**Minute 3:00 — Fourth Attempt**
She executes. The THREAT signal arrives at T8. The Command reads it at T9. Rule 1 fires. STRIKER-B repositions. The scout survives. Aisha exhales.

**What Aisha learned:** The Inspector-Codex bridge converted a frustrating failure loop into a diagnostic journey. She didn't need the game to teach her about eviction priority in a tutorial. She needed to fail in a way that the Inspector could trace to a concept that the Codex could explain.

### Journey: Dr. Ramirez, 55, CS Professor — Evaluating the Pedagogy

**Context:** Dr. Ramirez is playing Robot Uprising to evaluate whether it could be used in her introductory computer science course. She's completed the full campaign and is now replaying M1-4 with a critical eye on the pedagogical architecture.

**Minute 0:00 — Observing the Card Materialization**
Dr. Ramirez replays M1. She watches the first card materialize after the filter puzzle. She notes: "Constructivist. The artifact emerges from the experience, not from the instructor." She opens the card. "The text explains the concept without referring to the procedure. Good — it forces the student to connect the two independently."

**Minute 2:00 — Evaluating the M5 Handoff**
She jumps to M5's opening. The Codex initialization plays. She notes: "This is a metacognitive scaffolding event. The student is shown their own accumulated knowledge organized by category. This is the 'concept map' moment — the student sees the structure of what they've learned, not just the individual facts."

She opens the Codex and checks each entry. "Hmm. The eviction priority entry is accurate but uses analogies that might mislead. 'What to forget' implies permanent loss, but evicted entries can re-enter through new observations. A student might incorrectly model eviction as deletion."

**Minute 4:00 — Testing the Inspector Bridge**
She deliberately builds a broken M7 config to trigger the Inspector-Codex bridge. She follows the link from a failure diagnostic to the Codex. "The link is good — it connects symptom to concept. But it doesn't connect concept to fix. The student must make that inferential leap independently. That's appropriate for an advanced student but might leave a struggling student stranded. A 'Suggested Actions' section at the bottom of the Codex entry would bridge the gap for weaker students — but would also reduce the inferential challenge for strong ones. This is the Vygotsky tension: scaffolding helps weak students but constrains strong ones."

She writes in her notes: "Suitable for mid-semester supplement. Students who've already encountered buffers and caches in lecture will benefit from the embodied metaphor. Not suitable as primary instruction — too many concepts introduced before formal definition."

**What Dr. Ramirez learned:** The hybrid architecture implements constructivist pedagogy (experience before theory) with a reflective component (Inspector as metacognitive tool) and a reference component (Codex as declarative knowledge base). The three-part system maps to Kolb's experiential learning cycle: concrete experience (interactive tutorial) → reflective observation (sealed watch) → abstract conceptualization (Codex) → active experimentation (next attempt).

---

## Interaction Effects

### With Boot Log Narrative (5.02)
The boot log's role shifts across the hybrid architecture. In M1-4, the boot log is the primary teaching voice — narrating procedures, framing discoveries. In M5, the boot log performs the Codex initialization ceremony. In M5-10, the boot log becomes purely narrative — atmospheric, emotional, character-driven. The boot log's pedagogical role is fully absorbed by the Codex and Inspector. This means the boot log writing must be designed with this transition in mind: early entries are instructional-poetic, late entries are purely poetic.

### With Vocabulary Pacing (5.00a)
The hybrid architecture changes how vocabulary density is managed. The M4 bottleneck (6 terms) is still procedurally demanding, but the Codex provides a fallback: players who feel overwhelmed by M4's interactive tutorial can open their accumulated cards and re-read earlier concepts to anchor themselves. The cards for buffer (M1), eviction (M2), and hook (M3) provide conceptual scaffolding that makes M4's new terms less alien. The hybrid doesn't reduce the bottleneck — but it provides handrails.

### With Blueprint Codex Design (locked)
The Codex's locked design as a "collection-style card screen (like a card game collection)" aligns perfectly with Model D's materialization. Cards as collectible artifacts. Categories as collection pages. Locked cards as silhouettes — which in the materialization model means "concepts you haven't experienced yet." The silhouettes are a preview of what's coming, not a reminder of what you're missing.

### With Inspector (locked)
The Inspector-Codex bridge is the architecture's most critical interaction. Without it, the Codex is a passive reference that players may never open. With it, every failure becomes a learning opportunity with a direct path to conceptual understanding. The Inspector must be designed with Codex linking as a first-class feature — diagnostic annotations need concept tags, and the Codex needs deep-linkable entries.

### With Tutorial Puzzle Design (5.01)
The filter puzzles of M1-2 are the card-generation engine for the materialization model. Each puzzle resolution should generate exactly one card. This means puzzle design must consider: which concept does this puzzle's completion teach? The puzzle itself teaches the procedure. The card captures the concept. They must be distinct: the M1 puzzle teaches "how to remove noise" (procedure) and generates a card about "what noise is and why it degrades decisions" (concept).

### With Voice Candidates (5.15)
The recommended A+B voice hybrid (Reyes + Unit 0) maps naturally to the hybrid architecture: Reyes's tactical voice dominates the interactive tutorial (procedure-focused, imperative), while Unit 0's archival voice dominates the Codex (concept-focused, reflective). The handoff from interactive to reference is also a handoff from one voice to another, creating a clear register shift that signals the change in pedagogical mode.

---

## Comparable Games and Their Handoff Architecture

### Shenzhen I/O: No Handoff (Position 1 Forever)
The manual is always external. No interactive tutorial exists — the first puzzle assumes you've read the manual. The handoff is the player's responsibility: they must decide when to stop reading and start building. This creates a bimodal player population: readers who find the game elegant and non-readers who find it incomprehensible. There is no bridge between the two.

### EXAPUNKS: Early Handoff (Position 2 Forever)
TWN is delivered at the start. The first few puzzles guide interactively while the player still has TWN open. By puzzle 5-6, the interactive guidance disappears and TWN is the sole reference. The handoff is fast but softened by TWN's voice — reading TWN is pleasurable, not homework. The weakness is alt-tab friction: the player must leave the game window to consult the zine.

### Into the Breach: Gradual Fade (Model B)
Early islands have popup tips and constrained scenarios. Later islands have no tips. The in-game help menu is always available but rarely needed — the game's visual language teaches everything. The handoff is invisible because the game's mechanics are visually self-explanatory (you can SEE the attack patterns, the push directions, the movement ranges). Robot Uprising's mechanics are less visually self-explanatory (you can't SEE eviction priority), so Into the Breach's invisible handoff wouldn't work.

### Slay the Spire: No Internal Handoff (External Community)
The game teaches card procedures through play but never explains deck-building concepts. The conceptual knowledge lives in the community (Reddit, YouTube, wikis). There is no Codex equivalent. This works because Slay the Spire's difficulty curve is gentle enough that players can succeed through intuition — and those who want to optimize find the community. Robot Uprising's concepts are harder to intuit (signal latency is not visually obvious), so a community-dependent model is insufficient.

### TUNIC: Discovery-Based Handoff (Model D Adjacent)
The in-game manual pages are found scattered through the world. Each page teaches a mechanic. The manual is built from exploration. This is Model D's materialization applied to physical discovery rather than procedural completion. TUNIC's weakness: pages can be found in any order, so the manual never guarantees baseline knowledge at any point in the game. Robot Uprising's materialization is sequenced (M1 concepts before M2 concepts), avoiding this problem.

### Baba Is You: No Handoff (Position 5 — Zero Text)
No manual, no reference, no tutorial text. Each level IS the tutorial for the next level. The game's vocabulary (IS, STOP, PUSH, WIN, etc.) is taught purely through interaction. This is possible because Baba Is You has ~15 words total and each word's behavior is immediately visible. Robot Uprising has ~30 terms and many are not immediately visible (latency, eviction priority, emission noise). Zero-text is not viable.

---

## New Aspects Discovered

- **5.17a — The "three-mission-delay" relevance cycle:** detailed design of how the Codex surfaces old entries when new situations make them relevant; beyond Inspector links, should the Codex itself suggest "related reading" based on recent failures? Risk of noise vs. benefit of connection-making.
- **5.17b — Codex entry quality and voice calibration:** what makes a good Codex entry? Length, tone, abstraction level, use of examples, inclusion of edge cases. Entry writing as a design discipline — each entry must serve both the first-time reader and the fifth-time re-reader.
- **5.17c — The skip-tutorial-replay problem:** when a player replays M1-4 after completing the campaign, the interactive tutorial is redundant. Should the Codex replace it? Options: skip tutorial (boot log abbreviated), tutorial-as-speedrun (same content, no gates), tutorial-with-Codex (Codex available from M1 on replay). Each option changes the replay experience.
- **5.17d — Inspector diagnostic annotation quality:** the Inspector-Codex bridge depends on high-quality diagnostic annotations that correctly identify which concept explains the failure. Bad annotations send the player to irrelevant Codex entries. Annotation generation as a design challenge — especially for multi-cause failures where multiple concepts are relevant.
- **5.17e — The "unknown unknowns" problem in self-directed Codex use:** players who don't know what they don't know won't search the Codex for help. Beyond Inspector links, what other entry points exist? Campaign map Codex hints? Pre-mission Codex highlights? A "struggling?" prompt that surfaces relevant entries based on retry count?

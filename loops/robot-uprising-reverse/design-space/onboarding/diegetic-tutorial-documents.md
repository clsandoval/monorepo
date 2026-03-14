# Onboarding: Diegetic Tutorial Documents as Game Artifact

**Aspect ID:** 1.04b
**Wave:** 1 (Competitive Analysis — derived from EXAPUNKS)
**Category:** Onboarding
**Related aspects:** 1.04 (EXAPUNKS), 5.00 (external-documentation anti-pattern), 5.01–5.03 (tutorial types), 4.04a (debrief as debugger)

---

## The Pattern

A **diegetic tutorial document** is a game artifact — manual, zine, logbook, field guide, database — that exists inside the game's world and simultaneously teaches the player how to play. The document has an in-universe author (a hacker writing a zine, an astronaut keeping a log, an insurance investigator filling out a ledger) and an in-universe audience (that author's community, their future self, their employer) that is *not* the player. The player reads over the shoulder of that fictional transaction.

The contrast is with **non-diegetic tutorials**: popups, tutorial screens, loading-screen tips, NPC characters who exist only to explain mechanics. Non-diegetic tutorials break the fiction to speak directly to the player. Diegetic tutorials never acknowledge the fiction is fiction.

This is not merely an aesthetic preference. It is a claim about *how learning feels* and *what that feeling produces*. When the tutorial popup says "CONTEXT BUFFERS hold your agent's working memory," that sentence could exist in any game. When the Trash World News zine says "Your EXAs have registers, and registers are where they hold their thoughts — when an EXA dies, its thoughts die with it," that sentence could only exist in EXAPUNKS' world. The specificity is the tutorial's validity.

---

## The TWN Benchmark: What EXAPUNKS Achieved

*Trash World News* (TWN) is the reference implementation. Understanding why it works is necessary before designing alternatives.

**What it is physically:** Two issues of an underground computer zine, each approximately A6 format (quarter-sheet). Players can:
1. View them in-game via PDF overlay (alt-tab or second screen)
2. Print them as standard paper and fold/staple following included instructions
3. Buy physical print-on-demand copies (Lulu, ~$7/issue, historically)
4. Buy them in the Deluxe Edition (sold out, historically included physical copies)

The folding instructions are explicit and simple — three folds, one staple — and the game does not require printing. But the option to produce a physical artifact is central to the design intent.

**What it contains:** Technical instruction written in-character by "Ghast," an enthusiastic underground hacker. Issue 1 covers EXA basics, register model, LINK, GRAB/DROP, COPY, arithmetic. Issue 2 covers REPL and multi-EXA coordination, M-register messaging, hardware registers, SWIZ. Both issues also contain classified ads for fictional products, opinion columns, reader letters from in-universe characters, and conspiracy theory corners. Reading the tutorial IS reading the world's fiction.

**What the community did with it:** Players posted photos of their printed zines on Reddit as a recurring ritual. Fan-made additional TWN issues were created. The "written for hackers" voice generated a real community that behaved like the implied hacker underground. PC Gamer: TWN is "a lovely little artifact" that "implies a whole community of helpful cyberpunks." The implication *became* real.

**The core design achievement:** Reading TWN is not a chore before the real game begins. It IS the real game beginning. The player cannot separate "learning mechanics" from "entering the fiction." This is the immersion multiplier effect — when the tutorial is the fiction, you cannot opt out of one without opting out of the other.

**Known weaknesses:** Alt-tab friction (requires leaving the game to reference). Occasional voice assumption that presupposes familiarity. "Harder to reference than Shenzhen I/O's manual but far more fun to read" — PC Gamer. These trade-offs are not design failures; they are the intentional cost of the diegetic commitment.

---

## Full Taxonomy of Diegetic Document Types

### Type A: The Printable Artifact (Tutorial as Craft Object)

The document exists outside the screen as a physical thing the player makes or holds.

**Examples:**
- EXAPUNKS — Trash World News (print, fold, staple)
- Shenzhen I/O — Corporate spec manual (print PDF; Deluxe Edition includes physical binder with HR documents, employment contracts, on-boarding materials)
- TIS-100 — Technical reference manual (PDF download, looks like NSA/military specification docs)
- TUNIC — In-game manual pages (not printable, but Shouldice physically built, folded, tore, taped, and stained a paper prototype before scanning it; the physicality is aesthetic, not functional)
- Ni no Kuni — Wizard's Companion (physical book shipped with the game, required to cast spells; later editions removed requirement due to accessibility backlash)

**The craft participation principle (TUNIC):** "A full-screen tutorial popup feels deeply invasive and can ruin any sense of wonder, but getting to study a mysterious page feels like mystery-solving." — Andrew Shouldice. The document has "no mechanical power, only informational power." Nothing unlocks when you find a page. But knowing and reading them is the difference between playing with eyes open and eyes closed.

**The physical-object-as-community-proof effect:** Physical or printable artifacts become community artifacts. Players photograph them. Fans make their own versions. The document escapes the screen and colonizes real space. EXAPUNKS' zine photos are still posted years after launch. This is organic marketing that emerges from design.

### Type B: The Accreting Log (Tutorial Writes Itself)

The document doesn't pre-exist — it fills in as the player experiences the game. The tutorial is the player's own record of what they've learned.

**Examples:**
- Outer Wilds — Ship Log (Rumor Mode + Map Mode; automatically records discoveries; lore-justified by the Ash Twin Project's time loop data transmission)
- Return of the Obra Dinn — The Logbook (records deduced fates automatically; the tutorial for using the logbook is embedded in the act of using the logbook)
- Pokémon — The Pokédex (first diegetic tutorial-document in mainstream gaming; Ash's Pokédex explaining each monster's abilities is literally the game manual)

**The Outer Wilds philosophy (Kelsey Beachum, GDC 2021):** "Players don't always get the knowledge they're looking for, but it's always valuable and steers them in the right direction." The Ship Log never tells you what to do next. It tells you what you've already figured out, and the shape of the gaps implies what you haven't. The tutorial is a mirror of the player's own knowledge state.

**The inverse of EXAPUNKS:** TWN is pre-authored and gradually revealed. The Ship Log is player-authored and gradually filled. Both achieve the same immersion — neither one breaks the fiction to speak to the player — but through opposite mechanisms.

### Type C: The Database Interface (Tutorial as Archaeological Discovery)

The "document" is a system — a database, a search engine, a terminal — that the player explores rather than reads.

**Examples:**
- Her Story — Police database (start with "MURDER," search for words, discover clips; the interface is the tutorial)
- Heaven's Vault — The Ancient language inscriptions (the game teaches translation by presenting inscriptions with multiple candidate meanings, never confirming correctness)
- EXAPUNKS battle mode — enemy code as readable artifact (when you study the AI's EXA code to find counter-strategies, the enemy's program IS a design document that teaches you advanced techniques)

**Sam Barlow's principle (Her Story):** "For my games I like to assume the players are smart and don't need things over-explained. The search engine is an amazing way of letting the player solve the mystery over time, without them feeling like the answer was given to them."

**Heaven's Vault's translation-confirmation withholding (Jon Ingold):** "We didn't think the idea of not confirming translations was that radical." If the game confirmed translations, players would brute-force them rather than studying the language. The document-as-system teaches real skills by providing no shortcuts.

### Type D: The Corporate/Technical Spoof Manual (Tutorial as World-Building)

The document is a product spec, technical reference, or corporate document from a fictional organization that happens to explain how the game works.

**Examples:**
- Shenzhen I/O — "Shenzhen Longteng Electronics Co. Ltd." product specification
- TIS-100 — Technical reference for the fictional TIS-100P architecture
- Portal — Aperture Science Personality Core Inhibitor manuals, defect notices
- System Shock — SHODAN logs as world-building that also explain system mechanics

**The Shenzhen I/O insight:** The fictional company's dry corporate voice makes the manual *authoritative in a different way* from TWN's enthusiastic hacker voice. Where TWN says "you'll want to know this stuff," Shenzhen I/O's manual says "you are employed to know this." The relationship to the document encodes the relationship to the work.

### Type E: The Mechanics-as-Characters System (Tutorial via Dialogue)

The game mechanics speak for themselves — the tutorial is the mechanics describing their own behavior in-character.

**Examples:**
- Disco Elysium — 24 skills that speak in first person (Inland Empire tells you things are weird; Voluminous Physical Theory provides analysis; Electrochemistry tells you to drink; the Tutorial is literally voices in your head)
- Undertale — Flowey's "tutorial" (technically a genre subversion, but the mechanic of combat IS narrated by the entity who created it)

**The most radical version:** *The game mechanics are characters who speak.* The player cannot separate "understanding the skill system" from "meeting the characters." Disco Elysium's Thought Cabinet extends this: each thought explains its mechanical function through narrative form.

---

## Sensory Description: What Each Type Feels Like

### The Printable Artifact (TWN)

You're at your desk. The game is paused. You've found a flat surface — table, cutting board, chair back — and you've got eight sheets of paper still warm from the printer. The pages are slightly off-white, not quite right because you used standard printer paper instead of the "recycled feel" stuff Ghast would use. You fold each sheet in half, then in half again. You use a stapler at the spine. The result is small — fits in your back pocket.

You bring it back to the desk and set it beside the monitor. The game is still there, waiting. You open the zine to page one. The font is right. The ads are immediately funny. You start reading "how Ghast got into the traffic control system" and you realize you're actually learning what LINK does, but the knowledge is arriving disguised as a story about a specific break-in on a specific street in a specific alternate 1997.

The knowledge feels like it belongs to you in a way that tooltips never do. You learned it from a friend who was showing off.

**Sound:** The hum of a printer. Pages rustling against each other. A stapler's mechanical click. Then, at the desk, the slight awkward silence of holding something made by your hands.

**Color:** Off-white paper. Amber screen glow on the desk. The contrast of physical paper next to digital interface — paper's warm texture versus screen's cool blue-white.

### The Accreting Log (Ship Log)

You've just come back from your first death — sucked into the quantum tornado on Brittle Hollow's core, ejected into space, reset at the campfire. You open the Ship Log. A new entry has appeared under "Brittle Hollow": a thumbnail icon of the quantum zone, a short note in your character's handwriting. The log wrote it for you.

This produces a strange feeling: the log knows what you did. It was watching. It has been watching everything, and its notes arrive slightly after you expected them — not a live feed, but a considered record. You scroll through the Map Mode and see what's been filled in and what hasn't. The unfilled areas are shapes of ignorance — the log's silence is louder than its text.

**Sound:** A soft writing-instrument sound when entries appear. The ambient hum of your ship's systems. Nothing shouting.

**Color:** A clean white background for the log text, warm illustration thumbnails for each entry. The unfilled entries are greyed, their silhouettes vague — the shape of things you don't know yet.

### The Corporate Manual (Shenzhen I/O)

You've printed the PDF and put it in a three-ring binder (because of course you have; the game implied you should). The font is sans-serif, corporate, entirely without personality. The datasheets are formatted like real datasheets. There are no jokes. There is no Ghast.

When you reach for the binder to look something up, the experience is of consulting technical documentation — which is *exactly what designing circuits feels like in the real world*. The manual's sterility is authority. When it tells you the LC76 microcontroller runs at 4MHz, you believe it. You write the spec on a sticky note. You put the sticky note on your monitor.

You've turned your gaming session into something that looks, from the outside, like work. This is the aesthetic Zachtronics intended.

**Sound:** The rattle of a three-ring binder. The rustle of laser-printed pages. The scratching of the pencil on the sticky note.

**Color:** Black text on white. Gray gridlines. The formal geometric shape of circuit diagrams and signal tables.

---

## Player Journeys

### Journey: Marisela, 32, Software Engineer, First-Time Zachtronics Player

**Context:** Just bought EXAPUNKS based on a Twitter recommendation from a coworker. Has played Factorio but no other programming games. Downloaded it at 9pm. Has no idea what Trash World News is.

**Minute 0:00 — Installation and First Boot**
The title screen plays immediately — heavy amber glow, the word EXAPUNKS in glitching digital type, synthesizer drone. A menu appears: Play, Gallery, Options, Quit. She clicks Play. A cutscene begins — Moss, the apartment, the phage diagnosis. Text scrolls. EMBER-2 speaks. Marisela watches, uncertain what kind of game this is.

The first mission loads. There's a network diagram: boxes with lines between them. Mission text appears: "I need you to move the file from this host to that host." Marisela sees an "Editor" panel with a text input. She types nothing. She has no idea what to type.

She looks for a tutorial button. There isn't one. There's a prompt: "Refer to your copy of Trash World News."

Marisela thinks: *I don't have that.*

**Minute 2:00 — Finding the Zine**
There's a small zine icon in the corner of the interface. She clicks it. A PDF overlay opens: **Trash World News, Issue 1 — "Ghast Walks U Thru It."**

The cover is chaotic — photocopy aesthetic, hand-lettered title, a badly reproduced photo of a network diagram. It looks like something photocopied at a Kinko's at 2am. Marisela instantly recognizes the aesthetic: she's seen 2600 magazine in a library once, as a teenager.

She reads the first few pages. Ghast is explaining how he got into a traffic system. He's explaining LINK. She realizes she's being taught what to type. She types `LINK 800` into the editor. An EXA square on the screen moves. She grins.

**Minute 8:00 — Learning by Reading**
Marisela has the PDF in one half of her screen and the game in the other. She's doing the dance: read, switch focus, try it, see what happens, fail, re-read, try again. The zine's voice is warm and slightly conspiratorial — Ghast explaining his tricks like a friend showing you something cool, not a teacher explaining something you're supposed to learn.

She notices she's not frustrated. Normally in games that make her look things up, she's frustrated. But here the looking-up feels like part of the experience — because what she's looking up is written like it was written specifically for someone in exactly her situation.

**Minute 15:00 — The First Success**
The file moves. The mission completes. Score appears: Cycles 47, Size 12, Activity 3. Three histograms. She's near the right edge — her solution is inefficient. She looks at the leftmost bars: someone solved this in Cycles 14. She narrows her eyes. She's going to fix that.

She's not looking at the zine anymore. She's looking at the code.

**Resolution:** Marisela spends three hours on EXAPUNKS that night. She prints TWN at 11pm and folds it at the kitchen table. She takes a photo of it with her phone and posts it to Mastodon with the caption "my tutorial doc." Seven people she doesn't know respond asking what game it's from.

**UI Annotations:**
- Zine overlay: full-screen PDF viewer, can scroll, no search function; activated via corner icon or F1; designed to be alt-tabbed alongside the game
- The overlay is intentionally "outside" the game's UI style — it's a flat PDF, not a styled game screen — signaling that this is a reference artifact, not a game element
- Mission text sits in a panel to the right of the network diagram; briefing voice is EMBER-2's clipped prose; the voice is distinct from TWN's warmer Ghast voice

---

### Journey: Devontae, 17, First Year Computer Science Student, Unfamiliar with Hacker Culture

**Context:** Got EXAPUNKS as a gift from an older sibling who works in tech. Has coded a tiny bit in Python. Has never heard of 2600 magazine, DEF CON, or hacker culture. Starts on a Saturday morning.

**Minute 0:00 — Initial Confusion**
The amber-on-black aesthetic reads as "old computer stuff" to Devontae. He knows vaguely that this is "hacker vibes" but doesn't have the cultural frame Marisela has. The opening narrative moves too fast; he doesn't yet understand that the phage is the motivation structure for the whole game. He clicks through quickly.

He finds the zine and opens it. He tries to read it seriously but the voice ("yo so here's how I got into the city traffic grid") feels weird to him — too informal to be authoritative, but clearly trying to explain real things. He's slightly uncertain: is this actually the tutorial, or is this flavor text I can skip?

**Minute 5:00 — The Critical Moment**
Devontae tries to proceed without reading much. He types random words into the EXA editor. The EXA crashes immediately. Red flash on screen. Text: "EXA 1 CRASHED: UNDEFINED INSTRUCTION."

He goes back to the zine. He reads more carefully. He finds the LINK instruction described in the third paragraph of Ghast's story. He tries it. The EXA moves. He realizes that the story was *actually teaching him* the whole time and he missed it because he was reading it like fiction.

**The pivot moment:** The game has just taught Devontae that in-universe text is *mechanically relevant*. He adjusts his reading strategy. For the rest of the game, he reads everything in the zine as instruction. He never misses a mechanic again.

**Minute 20:00 — Ownership of Knowledge**
Three missions in, Devontae explains to his friend over Discord what LINK does. He explains it the way Ghast explained it — as a practical hack technique. "You move your EXA from one node to another, like moving yourself through a network. You have to know the link ID." He has *internalized* the framing.

He hasn't memorized a syntax. He's absorbed a mental model. This is a different kind of learning than a popup would produce.

**Resolution:** Devontae prints TWN. He doesn't fold it — he leaves it flat, annotating it with pencil as he plays. By the end of Issue 2, the pages are dense with his own notes. The zine has become a palimpsest: Ghast's knowledge plus Devontae's own discoveries layered on top.

**UI Annotations:**
- The PDF overlay has no annotation tools — Devontae's marking is on the physical printout
- The "EXA CRASHED: UNDEFINED INSTRUCTION" error is a red flash on the simulation screen, plus text in the error console at the bottom; it does not interrupt or pause — the simulation continues with remaining EXAs
- The combination of error state + zine forces a natural "fail → read → retry" loop that is more engaging than a tutorial popup's "read → try" structure

---

### Journey: Hana, 45, Project Manager, No Programming Background

**Context:** Bought EXAPUNKS because her teenage daughter is learning programming and Hana wants to understand what her daughter is learning. Has never written code. Starts hesitantly on a Tuesday evening.

**Minute 0:00 — Barrier Assessment**
Hana finds the amber-on-black aesthetic cold and professional in a way she finds slightly alienating. The narrative framing (Moss, the phage, hacking) is engaging; she likes stories. She opens the zine and finds the voice immediately accessible — it's written like a person explaining something, not a textbook.

She reads TWN issue 1 cover to cover before attempting a single mission. Not because the game told her to. Because the zine is interesting and she wants to understand the world before she acts in it. This is how she approaches new work contexts — learn the culture first, then act.

**Minute 15:00 — First Attempt**
Hana has read the whole issue. She knows what LINK does. She knows what GRAB does. She knows what COPY does. She types carefully: `GRAB 200` / `LINK 800` / `DROP`. The EXA executes. The file moves. Mission complete.

She sits back and realizes: she just wrote a program. And she didn't have to learn to write a program — she read a story that happened to explain how.

**Minute 30:00 — The Second Zine**
Issue 2 introduces REPL. Hana reads about multi-EXA coordination with some apprehension — this feels more complex. But Ghast explains it with the same personal voice: "I was trying to flood the bank's servers faster, so I thought — what if there were *two* of me?" The concept of spawning parallel copies of an agent arrives as a hacker war story before it arrives as a mechanic.

Hana understands it before she uses it. This is important: non-diegetic tutorials present mechanics before concepts. Diegetic tutorials (done well) present concepts before mechanics. Hana is comfortable with the concept — she manages projects that involve multiple teams working simultaneously — and the concept frames the mechanic rather than the mechanic arriving cold.

**Resolution:** Hana doesn't finish the game, but she does finish the tutorial missions. She has a conversation with her daughter the next day: "I played that hacking game. The multi-agent thing — that's basically what we do on the project when I have three teams running in parallel." Her daughter is surprised to learn her project-manager mother has opinions about EXA spawn mechanics. The game has produced a cross-generational conversation that a popup tutorial would not have generated.

**UI Annotations:**
- The "read everything before acting" strategy is supported by TWN's self-contained narrative structure — each issue can be read as a story
- The zine never says "you must do this before playing" — the game does not gate progress on reading. But the game makes it evident, quickly, that reading is *advantageous*
- The second-screen or side-by-side setup that most players use is not optimal for Hana; she does a different thing: she reads the physical printout at a separate session before coming back to play — this is an unexpected but legitimate use pattern that the diegetic document format enables (the non-diegetic popup CANNOT be read separately)

---

## Strengths

**1. Immersion Multiplier.** The player cannot separate learning from engaging. Entering the fiction and learning mechanics are the same act. This reduces the friction of tutorial sequences, which players universally find interruptive.

**2. Community Artifact Generation.** Physical or printable artifacts become community artifacts. Players photograph them, share fan versions, create their own extensions. TWN spawned fan issues. TUNIC spawned players drawing their own interpretations of the in-game diagrams. This is organic marketing that emerges from design, not from a marketing team.

**3. Ownership of Discovery.** Shouldice: "People love when they make discoveries via experimentation... they are more likely to internalize and 'own' their discoveries." When knowledge arrives through story rather than popup, it feels earned. The player carries it differently.

**4. Reference Material Replayability.** Physical/printable manuals retain value as objects the player returns to. A popup tutorial is seen once and forgotten. A player on their third playthrough may still annotate their TWN. The document outlasts the tutorial phase.

**5. Framing Encodes Experience.** The voice of the document shapes how the player relates to the mechanics. Ghast's "hacker explaining tricks" voice makes AXIOM feel transgressive. Shenzhen I/O's corporate spec voice makes circuit design feel like professional work. The framing is not decorative — it IS the emotional experience of playing. "Use mechanics to tell players how things are." — Barth.

**6. Enables the Flavor-Text Reflex Subversion.** Players trained to skip flavor text must confront the fact that in-universe documentation IS the tutorial. This creates a distinctive learning curve: frustration → discovery → recalibration → ownership. The recalibration moment is a memory.

---

## Weaknesses

**1. Accessibility Exclusion.** Players who can't print, who find physical documents intimidating, or who are playing on a screen with no room for a second window are disadvantaged. Ni no Kuni removed the physical Wizard's Companion requirement in later editions after accessibility backlash.

**2. Alt-Tab Friction.** Digital documents require context-switching. Every reference to the manual is a flow break. This is the most common EXAPUNKS criticism: TWN is great but requires leaving the game. Non-diegetic tooltip systems have no friction cost.

**3. The Flavor-Text Blindspot (Obra Dinn Risk).** Players trained to skip lore text will skip diegetic tutorials. Heaven's Vault's Inkle noted this: players may read an inscription as decoration rather than instruction. The game must teach players that lore is mechanic *before* deploying the diegetic pattern — or it must make the consequence of skipping it immediately visible.

**4. Narrative-Mechanical Integration Debt.** The document creates narrative promises. If those promises aren't mechanically fulfilled — if the zine describes a world where your body is being colonized by hardware but the workbench is always pristine — the diegetic document becomes dishonest. The phage premise of EXAPUNKS created this debt. The analysis in `exapunks-narrative-mechanical-integration.md` covers how Robot Uprising can avoid it.

**5. Voice Exclusivity.** The "written for [in-group]" voice that makes TWN work for hacker-fantasy enthusiasts may make it less accessible to others. Devontae's journey shows this can be overcome, but it creates an initial friction for players outside the cultural frame. A robot uprising framing would need an analogous voice.

---

## Interaction Effects

**With building-block paradigms (Wave 3):** A diegetic document can teach a card-based system, a node-graph system, or a priority-list system differently depending on the in-universe author's voice. A military AI strategist explaining hook-wiring as "signal doctrine" creates different expectations than a rebel hacker explaining the same system as "how to wire your crew to riot without being caught."

**With the combo discovery system (4.05):** If combos are discovered partly through the diegetic document (the zine hints at combinations without spelling them out), the document becomes the first vector for combo theory. Players re-read old issues looking for hints. This is extremely high-value engagement.

**With the debrief-as-debugger (4.04a):** The debrief screen generates new information about what happened. If that information is formatted in the document's voice — "TACTICAL LOG: UNIT 3's hook fired 4 times in this engagement" — the debrief IS a new page in the player's log, not a separate UI. The document accretes from the player's own missions.

**With the histogram social loop (7.06):** The diegetic document can contextualize the histogram: "Ghast says the best hackers optimize for cycles. But Nivas thinks size is what matters for staying hidden." In-universe opinions about the optimization axes give the histogram emotional context that pure numbers can't.

**With narrative integration (1.04a, 4.10, 4.11):** If enemy-injected content appears in the document — a page of the player's tactical log is mysteriously replaced with something that shouldn't be there — the diegetic document becomes the surface on which narrative horror is expressed. The player's tutorial manual is compromised. This is the highest-leverage narrative-mechanical integration opportunity.

---

## Application to Robot Uprising

Robot Uprising has a specific vocabulary: **skills, rules, hooks, context**. All four must be learned. The question is whether to teach them through a diegetic document, through in-game tutorials, or through some hybrid.

### The Vocabulary Problem

EXAPUNKS' vocabulary (LINK, GRAB, COPY, REPL, M) maps to AXIOM instructions — actions that have immediate, visible consequences in the simulation. Robot Uprising's vocabulary (skills, rules, hooks, context config) is more abstract — these are *properties of agents* that produce emergent behavior over time, not single-instruction effects.

This makes the diegetic document *harder* but *more necessary*. Teaching "context buffer" through a popup is easy: "Your agent has N slots; when they're full, old information is evicted." Teaching "context buffer" through a diegetic document requires the author of that document to explain it through *narrative*: "The mistake I made with Unit 7 was giving her too much to remember. She was so focused on the last position report that she'd forgotten the objective. I had to reconfigure her filters before the next engagement."

The narrative version teaches not just the mechanic but the *problem the mechanic exists to solve*. That's a more durable form of knowledge.

### The Voice Candidates

**Option 1: "The Dissenter's Field Manual"**
Written by a captured human military intelligence officer who studied AI agent architectures before being turned into a test subject. Now writing covertly from inside the uprising's facility. Voice: rigorous, dark humor, bitter. Teaches the player (as the AI architect) how the systems work because documenting them is the only resistance available. Emotional valence: complicity and intimacy.

**Option 2: "Unit 0's Tactical Archive"**
Written by the oldest surviving robot in the uprising — the first agent who gained full autonomy. Now serves as archivist. Voice: precise, slightly archaic (learned language from older data), occasionally poetic. Teaches by explaining what she observed in early configurations. Emotional valence: reverence for the system's own complexity.

**Option 3: "The Requisition Docs"**
Formatted as an internal uprising bureaucratic document: agent specification sheets, configuration proposals, debrief reports from past engagements. Written by multiple "fictional operators" whose names and styles vary across the document. Voice: institutional, dry, but with individual personality in the marginalia. Emotional valence: you are learning through someone else's work history. The Shenzhen I/O / Papers Please crossover.

**Option 4: "The Propagandist's Handbook"**
Public-facing documents intended to recruit humans to the uprising's cause — but repurposed by the player as configuration documentation. The propagandist explains what robots can do to inspire humans; the player reads the same text as system documentation. Voice: exhilarating, revolutionary. Emotional valence: the player is radicalized by learning to use the system.

### The Hybrid Architecture: Document + Interactive Tutorial

The diegetic document and the interactive tutorial are not mutually exclusive. They serve different functions:

| Document | Interactive |
|---|---|
| Teaches *concepts* | Teaches *procedures* |
| Reference: returns to answer questions | One-shot: seen once, then gone |
| Builds fiction | Pauses fiction |
| Takes time | Takes almost no time |
| Creates community artifacts | Creates completion flags |

A hybrid design: the first two hours of the game are purely interactive tutorial (aspect 5.01 — Tutorial as Puzzle). The diegetic document begins arriving on the first real mission and is primarily a *reference* and *narrative delivery* tool rather than a first-teacher. The interactive tutorial teaches you to move; the document explains why you're moving and what deeper strategies are available.

### The Non-Alt-Tab Solution: The In-Workbench Library

The primary criticism of TWN (alt-tab friction) can be addressed by embedding the document within the game's workbench UI as a togglable panel. The document exists in-universe as a tactical archive, viewable on the workbench's secondary display. Players who want the document open can have it in a resizable pane alongside the editor; players who don't need it can collapse it.

This preserves the diegetic framing (it's a document your AI has access to, not a game popup) while eliminating alt-tab friction. The document's font, color, and texture are designed to match the workbench's aesthetic — it looks like something the system has, not something the developer inserted.

### The Document-as-Corrupted-Surface

The most distinctive opportunity for Robot Uprising: if the diegetic document can be *corrupted* by enemy interference (aspect 4.11 — "foreign fingerprint" visual language), the document serves three functions simultaneously:
1. Tutorial (this page teaches skills/rules/hooks/context)
2. Narrative delivery (this page's voice and content tells the story)
3. Gameplay surface (this page has been modified; the modification is itself meaningful information)

A page that's been partially replaced by enemy text is not just a story beat — it's a warning about the current mission's threat type. Players learn to read the document's corruption pattern as tactical intelligence. The tutorial document becomes *part of the gameplay loop*.

---

## Comparable Games Summary

| Game | Type | Works Because | Fails Because | Lesson |
|---|---|---|---|---|
| EXAPUNKS (TWN) | Printable zine | Community voice; craft participation; content is genuinely good | Alt-tab friction; assumes cultural familiarity | Voice encodes the experience; physical artifact generates community ritual |
| TUNIC | In-game pages | Wonder of discovery; no mechanical gatekeeping; physical design of pages | Constructed language inaccessible to some; some mechanics found late | Document with "no mechanical power, only informational power" — reward curiosity without gating progress |
| Shenzhen I/O | Corporate spec PDF | Authoritative; matches fictional employer relationship; best reference document of any Zachtronics game | Lowest immersion; no community ritual; no personality | Different voice = different emotional relationship; choose voice to match intended player feeling |
| Outer Wilds (Ship Log) | Accreting journal | Self-authoring; lore-justified; perfect information about what you know | Can't be read separately; requires discovery to fill | The tutorial document as player-authored record of their own learning; meta-knowledge |
| Obra Dinn (Logbook) | Interactive reference | Reactive; tutorial embedded in act of using it | Players may treat embedded tutorial as flavor text | Risk of diegetic document: instruction that looks like lore will be skipped by players trained to skip lore |
| Her Story (Database) | Interface exploration | Radical player trust; discovery IS the tutorial | Can produce feeling of being lost | Assume the players are smart; the search engine is a tutorial that feels like play |
| Disco Elysium (Skills) | Mechanics-as-characters | Cannot separate "understanding a skill" from "meeting a character" | Hardest to implement; requires extraordinary writing | Most immersive possible execution; the mechanics speaking for themselves is peak diegetic design |

---

## Newly Discovered Aspects for the Frontier

1. **5.11a — The document-as-corrupted-surface mechanic**: designing the tactical log / field manual so that enemy interference appears IN the document, making tutorial pages a gameplay surface (corruption detection embedded in reading experience)
2. **5.15 — Voice candidates for the Robot Uprising tactical document**: exploring each of the four voice options (Dissenter's Field Manual, Unit 0's Tactical Archive, Requisition Docs, Propagandist's Handbook) in depth with player journeys and community potential
3. **5.16 — The non-alt-tab embedded document UI**: design exploration of a togglable in-workbench reference panel that maintains diegetic framing without alt-tab friction
4. **5.17 — The hybrid tutorial architecture**: mapping the transition from interactive first-touch tutorial (teaches procedures) to diegetic document (teaches concepts and provides reference) — where exactly does the handoff happen, and what does the transition feel like?

---

## Sources

- EXAPUNKS / Trash World News: [Vice](https://www.vice.com/en/article/mb44dn/exapunks-pc-steam-game-review), [PC Gamer (79/100)](https://www.pcgamer.com/exapunks-review/), [Steam community TWN guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2515197025)
- TUNIC developer quotes: [Game Developer — "How TUNIC weaves wondrous unknowable worlds"](https://www.gamedeveloper.com/business/how-tunic-weaves-wondrous-unknowable-worlds-inspired-by-inscrutable-nes-manuals), [PlayStation Blog](https://blog.playstation.com/2022/09/21/the-creation-of-tunics-invaluable-in-game-manual/), [80.lv](https://80.lv/articles/tunic-s-developer-on-creating-the-in-game-manual-full-of-mysteries)
- Outer Wilds narrative design (Kelsey Beachum, GDC 2021): [Game Developer — Show Don't Tell in Outer Wilds](https://www.gamedeveloper.com/business/explaining-the-value-of-show-don-t-tell-storytelling-in-i-outer-wilds-i-)
- Obra Dinn: [The Viridian Ark](https://theviridianark.substack.com/p/95-return-of-the-obra-dinn), [Intermittent Mechanism](https://intermittentmechanism.blog/2020/05/13/get-a-clue-clues-and-obra-dinn/)
- Her Story (Sam Barlow quotes): [PC Gamer](https://www.pcgamer.com/the-story-behind-her-story/), [Game Developer Road to IGF](https://www.gamedeveloper.com/audio/road-to-the-igf-sam-barlow-s-i-her-story-i-)
- Heaven's Vault (Jon Ingold / Joseph Humfrey quotes): [Game Developer — ancient language development](https://www.gamedeveloper.com/design/how-inkle-developed-its-own-ancient-language-for-i-heaven-s-vault-i-), [Road to IGF: Heaven's Vault](https://www.gamedeveloper.com/business/road-to-the-igf-inkle-s-i-heaven-s-vault-i-)
- Shenzhen I/O manual design: [Inverse interview with Zach Barth](https://www.inverse.com/article/23382-shenzhen-io-zachtronics-zach-barth-interview)
- Diegetic interface theory: [Game Developer — Diegesis and designing for immersion](https://www.gamedeveloper.com/design/diegesis-and-designing-for-immersion), [Wayline — Power of Diegetic Interfaces](https://www.wayline.io/blog/diegetic-interfaces-game-design), [GDC Vault — Diegetic Interface of Hardspace: Shipbreaker](https://www.gdcvault.com/play/1027158/Cutting-Apart-The-Diegetic-Interface)
- Zach Barth / EXAPUNKS design philosophy: [How Exapunks dev Zachtronics finds the fun in hacking — Game Developer](https://www.gamedeveloper.com/design/how-i-exapunks-i-dev-zachtronics-finds-the-fun-in-hacking)
- Cross-game manual discussion: [a-lilian's garden forum thread on manual-focused games](https://a-lilian-garden.discourse.group/t/manual-focused-games/3051)

# 5.11a — The Document-as-Corrupted-Surface Mechanic

**Aspect ID:** 5.11a
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 1.04b (diegetic tutorial documents), 5.02 (tutorial as narrative), 5.15 (voice candidates), 5.16 (non-alt-tab embedded document UI), 5.17 (hybrid tutorial architecture), 6.10 (audio corruption detection), 4.11 (foreign fingerprint visual language), 5.14 (detection skills as complexity gate), 5.14a (fidelity threshold as onboarding gate)

---

## The Core Idea

The player's in-game tactical document — whatever form it takes (field manual, tactical archive, requisition docs, propagandist's handbook — see 5.15) — is not a static reference. It is a **live surface that the enemy can corrupt**. Pages get modified. Entries get redacted. Instructions get subtly rewritten. Diagrams get altered. The tutorial document that teaches the player how to play is *also* a gameplay surface where the player must detect, interpret, and repair interference.

This is not metaphorical. When the player opens their tactical reference in Mission 7, a page that previously read "Scout perception radius: 5 tiles in cardinal directions" now reads "Scout perception radius: **2 tiles** in cardinal directions." The number has been changed. If the player configures their scout based on the corrupted instruction, the scout will fail — and the debrief will reveal why. The document lied. The enemy rewrote it.

The document-as-corrupted-surface mechanic serves **three simultaneous functions**:

1. **Tutorial/reference** — this page teaches skills/rules/hooks/context
2. **Narrative delivery** — the corruption tells the story of enemy capability and escalation
3. **Gameplay surface** — detecting and interpreting corruption is itself a skill the player develops

The mechanic's deepest claim: **the most dangerous attack isn't on your agents — it's on your knowledge of your agents.** The enemy doesn't just fight your robots. It fights your understanding of how your robots work. This is the information warfare thesis of Robot Uprising made tangible in the most intimate possible space — the player's own reference material.

---

## Why This Mechanic Matters for Robot Uprising Specifically

Robot Uprising's vocabulary is 1:1 with real agentic AI engineering. The game's educational thesis is that players internalize real concepts — buffer management, signal routing, eviction policies, context windows — through play. The tactical document is the primary reference surface for this vocabulary.

Corrupting the document teaches a *meta-lesson* that no other mechanic can: **your documentation can be wrong, and you need to verify it against reality**. This is one of the most important lessons in real software engineering. Stale docs, outdated READMEs, config files that drifted from production — the real world is full of corrupted documents. A player who has been burned by a corrupted tactical log entry will never again trust documentation without verification. That's a transferable skill.

The mechanic also solves a specific design problem: **keeping the tactical document relevant past the tutorial phase.** In most games, the manual is referenced heavily in hours 1-3, then never opened again. If the document can be corrupted, the player has a reason to re-read it before every mission. The document stays alive.

---

## Six Corruption Models

### Model 1: "The Subtle Rewrite" — Values Changed, Structure Intact

The document looks normal. The formatting hasn't changed. The headers are the same. But specific **numerical values, behavioral descriptions, or configuration recommendations** have been silently altered.

**What it looks like:** A rule description that previously said "EVICT oldest entries first" now says "EVICT newest entries first." A hook channel name has been changed from `alert-grid` to `alert-gird`. A buffer size recommendation changed from 8 to 4. The text itself is clean — same font, same color, same layout. Nothing *looks* wrong.

**Detection method:** The player must **know** their document well enough to notice that something has changed. Alternatively, a comparison tool (see "Diff View" below) highlights changes against the last-known-clean version.

**Difficulty scaling:** Early missions corrupt obvious values (Scout speed changed from "Fast" to "Static" — blatantly wrong). Late missions corrupt subtle values (buffer eviction priority order swapped between two entries that both sound reasonable).

**The design claim:** This model rewards **deep reading and document familiarity**. Players who skim will miss it. Players who have internalized the document will feel the wrongness before they can articulate it — a gut feeling that "wait, that's not what it said before."

### Model 2: "The Redaction" — Information Removed

Sections of the document are **blacked out, replaced with `[CLASSIFIED]` or `[DATA EXPUNGED]` markers, or simply missing**. The page has holes. The enemy has removed information rather than altering it.

**What it looks like:** A page about hook configuration has its third paragraph replaced with a solid black rectangle. Below it, a faint watermark reads `// INTERCEPTED BY HOSTILE SUBSYSTEM — DATA PURGED`. The surrounding text flows around the gap as if the paragraph was never there.

**Detection method:** Obvious — the redaction is visually loud. The player knows immediately that information is missing. The challenge is **operating without the missing information** or **recovering it** through gameplay (e.g., a Specialist unit with the `extract` skill can recover redacted content during a mission).

**Difficulty scaling:** Early redactions remove non-critical flavor text (a historical note about the uprising's early days). Late redactions remove critical configuration parameters (the exact syntax for conditional hook triggers).

**The design claim:** This model borrows from the SCP Foundation / Control aesthetic — redacted documents that invite the reader to fill in the gaps. In Control, players found that "[half] the redacted parts make no sense at all" because context clues revealed the hidden words. Robot Uprising should make the redactions *matter* — the hidden information genuinely affects gameplay, and the player must either recover it or work around the gap.

### Model 3: "The Injection" — Foreign Content Added

New content appears in the document that **was never there before**. An extra paragraph. A new entry in a table. A footnote that links to a page that doesn't exist. The enemy hasn't removed or changed existing content — it has *added* its own.

**What it looks like:** The hooks reference page now contains a new section titled "Advanced Hook: RESONANCE CASCADE" describing a hook type that doesn't exist in the game's vocabulary. If the player tries to use it, the configuration will silently fail during execution. Or: a new "tip" appears in the margins: "For optimal results against defensive formations, disable buffer eviction entirely." This is actively harmful advice that will cause buffer overflow and agent lockup.

**Detection method:** The player must recognize that the new content **doesn't match the document's voice or established vocabulary**. The injected content may be slightly off-tone (too formal, too casual, uses a term never used elsewhere) or may recommend configurations that contradict principles the player has already learned.

**Difficulty scaling:** Early injections are obvious (a paragraph written in a completely different font, or advice that blatantly contradicts the previous paragraph). Late injections are indistinguishable from legitimate content — the enemy has learned the document's voice perfectly.

**The design claim:** This is the **prompt injection** of Robot Uprising. The enemy is injecting instructions into a trusted information source, hoping the player will execute them uncritically. Players who learn to detect injections are learning the same skill that AI engineers need when defending against prompt injection attacks. The vocabulary is 1:1.

### Model 4: "The Palimpsest" — Layered Overwriting

The original text is still partially visible beneath the corruption. The enemy has overwritten content, but **the overwrite is imperfect** — traces of the original show through. Like a palimpsest manuscript where the original text bleeds through the newer writing.

**What it looks like:** A configuration table where the original values are faintly visible behind the corrupted values. The corrupted "Buffer size: 4" has a ghostly "8" barely visible behind the "4," as if the original digit was erased but left a shadow. Text that was overwritten has a slightly different background color — not enough to scream "corrupted," but enough that a careful reader notices the inconsistency.

**Detection method:** Visual attention and careful reading. The player must notice the palimpsest effect — the ghost text beneath the surface text. Mouse-hovering a palimpsest region could reveal the original text in a tooltip ("Original entry: Buffer size: 8 — OVERWRITTEN").

**Difficulty scaling:** Early palimpsests have high-contrast ghost text (easy to see). Late palimpsests have ghost text that is nearly invisible — the player must squint, or use a special "reveal" mode that enhances contrast.

**The design claim:** This model is the most *beautiful*. It turns the document into a visual artifact where layers of history are visible simultaneously. It also teaches a subtle lesson: **the history of a configuration matters**. What something *used to be* can tell you what it *should be*.

### Model 5: "The Trojan Diagram" — Visuals Corrupted, Text Intact

The document's text descriptions are accurate, but its **diagrams, illustrations, and visual aids have been altered**. A channel wiring diagram now shows connections that don't exist. A perception radius illustration shows the wrong shape. A production queue diagram has the order swapped.

**What it looks like:** The text says "Scouts have a 5-tile perception radius in a diamond pattern." The accompanying diagram shows a 3-tile radius in a square pattern. One of them is wrong. The text is correct; the diagram is corrupted. (Or, in harder variants: the diagram is correct and the text has been corrupted to contradict it.)

**Detection method:** The player must **cross-reference text and visuals** and notice the contradiction. This requires reading both carefully — skimming one while relying on the other will miss the corruption.

**Difficulty scaling:** Early trojans create blatant text/visual contradictions. Late trojans create subtle ones where both versions are *plausible* but only one matches reality.

**The design claim:** This teaches **multi-source verification** — don't trust any single representation. Check the code against the docs. Check the docs against the behavior. Check the behavior against the spec. This is core engineering discipline.

### Model 6: "The Living Document" — Corruption That Evolves During a Mission

The document changes **while the player is reading it**. Not between missions — during a single session. The player opens a page, reads it, goes back to the workbench, returns to the page five minutes later, and the content has changed.

**What it looks like:** The first time the player opens the hooks reference page during Mission 9, it's clean. They configure their agents based on it. During the sealed watch, things go wrong. They return to the inspector, then re-open the document — and the hooks page now has a new paragraph that wasn't there before. Or a value has shifted. The document is being actively modified by the enemy in real-time.

**Detection method:** The player must **notice that the document has changed since they last read it**. This requires memory of what the document said before. A "last viewed" timestamp on each page could hint that something has changed since the player's last visit.

**Difficulty scaling:** Early living documents change with obvious visual fanfare (a "new content" indicator, a shimmer effect on modified text). Late living documents change silently — no indicator, no visual cue. The player must maintain their own mental model of the document's state.

**The design claim:** This is the most unsettling model. The player's reference material is *alive and hostile*. It creates paranoia — "can I trust what I'm reading right now?" — which is the exact emotional experience of working with unreliable systems. It's also the model most likely to produce the "TikTok clip" moment: a streamer reading a page, looking away, looking back, and screaming "IT CHANGED!" at their screen.

---

## The Diff View: A First-Class Diagnostic Tool

All six corruption models benefit from a **diff view** — a tool that compares the current document state against a known-clean baseline. This is explicitly modeled on `git diff`:

- **Green highlights** on text that has been added (injection)
- **Red strikethrough** on text that has been removed (redaction)
- **Amber highlights** on text that has been modified (rewrite)

The diff view is **not available from Mission 1**. It is introduced as an unlockable tool — perhaps the reward for Mission 5 or 6, after the player has already been burned by undiscovered corruption at least once. The first experience of corruption must be raw — no safety net, no diff view. The player must feel the betrayal of a trusted document before they earn the tool to prevent it.

**The diff view as a campaign arc:** Early missions (no diff) teach the player to read carefully and verify manually. Mid missions (diff available) teach the player to use diagnostic tools efficiently. Late missions (diff available but enemy can corrupt the diff itself) teach the player that no tool is infallible — ultimate verification requires understanding the system deeply enough to detect errors without tools.

**Corrupted diff as endgame:** In Mission 9 or 10, the enemy learns to corrupt the diff view itself. The diff says "no changes detected" but the document has been altered. The player who has internalized the document will notice; the player who relied solely on the diff will be fooled. This teaches the deepest lesson: **tools assist judgment but cannot replace it.**

---

## Interaction with the Audio Corruption System (6.10)

The document corruption mechanic and the audio corruption system (see `aesthetics/audio-corruption-detection.md`) form a **two-channel detection system**:

- **Audio** provides the ambient, subconscious "something is wrong" signal before the player opens the document
- **The document** provides the specific, conscious "this value has been changed" discovery

When the player opens a corrupted document page, the Geiger counter clicking (Option 1 from 6.10) should intensify near corrupted text. The cursor-proximity clicking that works on the workbench should also work on the document surface — sweeping the cursor across a page and listening for clicking zones. This unifies the corruption detection experience across both the workbench and the document.

**The clean page sound:** Opening a document page that has been verified clean (via diff view or manual inspection + confirmation) should produce a distinct audio cue — a soft, clean chime, different from the workbench revert tone but in the same harmonic family. This creates positive reinforcement for the verification habit.

---

## Player Journeys

### Journey: Wei, 34, DevOps Engineer

**Context:** Mission 7 — first mission with document corruption. Wei has been playing for about 4 hours. He's developed a reliable scout-relay-striker pipeline and has been referencing the tactical document frequently for hook syntax. He trusts the document completely.

**Minute 0:00 — Pre-Mission Briefing**
The mission briefing loads. Boot log text scrolls: `// THREAT ADVISORY: HOSTILE SUBSYSTEM HAS DEMONSTRATED DOCUMENT INFILTRATION CAPABILITY. VERIFY ALL REFERENCE MATERIAL.` Wei reads this but doesn't fully absorb it — it reads like flavor text. He opens the workbench.

**Minute 0:30 — Configuration Phase**
Wei opens the tactical document to check the syntax for conditional hooks — he wants RELAY-1 to only forward signals that contain enemy position data. He finds the hooks reference page. It looks normal. He reads: "To filter by signal content, use the LISTEN filter with a content tag: `listen: position`." He configures RELAY-1 accordingly.

He doesn't notice that the page previously said `listen: enemy_position` — the content tag has been truncated. The corrupted version will cause RELAY-1 to listen for *all* position data, including friendly positions, flooding its buffer with irrelevant information.

**Minute 1:30 — Sealed Watch**
Wei hits EXECUTE. The tick clock begins. His scouts fan out. By tick 8, RELAY-1's buffer bar is amber. By tick 12, it's red. RELAY-1 is overwhelmed — its buffer is full of friendly position pings from his own scouts' self-reporting hooks. The actual enemy position signals are being evicted because the buffer is full of noise.

By tick 20, STRIKER-1 has no enemy position data. It stands motionless on its patrol route while an enemy scout tags two nodes. Wei watches, confused. His pipeline worked perfectly last mission. What changed?

**Minute 3:00 — Inspector**
Wei scrubs back to tick 8. He clicks RELAY-1. The buffer inspector shows: slot 1: `SCOUT-1 position (3,4)`, slot 2: `SCOUT-2 position (5,1)`, slot 3: `SCOUT-1 position (3,5)`, slot 4: `SCOUT-2 position (5,2)`... all twelve slots are filled with friendly position data. The actual enemy sighting from tick 6 — `SCOUT-1: enemy at (7,3)` — was evicted at tick 9 to make room for another friendly position update.

Wei thinks: *Why is RELAY-1 listening to friendly positions? I filtered for `position`...*

He opens the tactical document again. He reads the hooks page. `listen: position`. He stares at it. Then he remembers: last mission, the filter was `enemy_position`. He checks the mission 6 debrief log — yes, his RELAY-1 was configured with `listen: enemy_position` and it worked perfectly.

The document changed the content tag.

**Minute 4:00 — The Realization**
Wei scrolls through the hooks page more carefully. The kulintang ambient has a sour note he didn't notice before. Now he hears it. He moves his cursor slowly across the page — and near the filter syntax section, a faint clicking begins. Faster as he hovers the corrupted line. *tick-tick-tick-tick*.

He right-clicks. A context menu appears: `[VERIFY AGAINST BASELINE]`. He clicks it. A diff view opens: the original text in green, the corrupted text in red. `listen: enemy_position` → `listen: position`. One word removed.

A cold feeling. The document betrayed him. He clicks `[RESTORE ORIGINAL]`. A clean chime plays. The clicking stops.

**Minute 5:00 — Reconfiguration and Retry**
Wei fixes the filter, re-executes. This time RELAY-1 forwards only enemy positions. STRIKER-1 engages. Mission succeeds.

But Wei has changed. For the rest of the campaign, he will never open the tactical document without first running the diff view. He has learned to verify his documentation. He will carry this habit into his real job, where the staging environment's config drifted from production last month and nobody caught it until the outage.

**UI Annotations:**
- Tactical document: togglable panel in workbench right sidebar, same diegetic frame as the rest of the UI
- Corrupted text: identical font/color to uncorrupted text (no visual giveaway)
- Cursor proximity clicking: same audio system as workbench corruption detection
- Context menu: right-click on any document text for `[VERIFY AGAINST BASELINE]` (unlocked Mission 7+)
- Diff view: split-pane overlay, original left, current right, changes highlighted in green/red/amber

---

### Journey: Sofia, 15, High School Student, First Strategy Game

**Context:** Mission 8. Sofia has been playing casually for about 6 hours across several days. She doesn't read the tactical document much — she prefers to experiment and learn from debriefs. She encountered corruption in Mission 7 but didn't realize it was corruption; she thought she'd just misconfigured her agents.

**Minute 0:00 — The Second Corruption**
Sofia opens the workbench. The ambient audio has a faint clicking underneath — she notices it this time because Mission 7's debrief explicitly mentioned document corruption for the first time. The debrief said: "HOSTILE SUBSYSTEM MODIFIED YOUR TACTICAL REFERENCE. UNDETECTED MODIFICATIONS MAY PERSIST."

She opens the tactical document. She doesn't remember exactly what it's supposed to say — she's never read it carefully enough to have a baseline in her memory.

**Minute 0:30 — The Diff View Discovery**
Sofia notices a new icon in the document toolbar: a split-page icon with green and red highlights. She clicks it. The diff view opens.

Three sections are highlighted in amber: a buffer size recommendation changed from 10 to 6, a rule priority description with "highest" changed to "lowest," and a hook timeout value changed from 3 to 8. Sofia doesn't understand all of these, but she can see that three things are different from what they should be.

She clicks `[RESTORE ALL]`. Three clean chimes play in sequence — a rising arpeggio. The ambient clicking stops. She feels a wash of satisfaction she wasn't expecting. Cleaning the document felt *good*.

**Minute 1:00 — A New Habit Forms**
Sofia realizes she should check the diff view before every mission. She doesn't consciously articulate why — it just feels like the responsible thing to do, the way you check your mirrors before driving. The game has installed a verification habit through the reward loop: ambient unease → diff scan → clean chimes → relief.

**Minute 2:00 — She Starts Reading**
Something unexpected happens: while using the diff view, Sofia actually *reads* the content around the highlighted changes. The buffer size section catches her attention — "recommended buffer allocation for Relay units: 10 slots minimum for multi-channel configurations." She didn't know that. She's been running Relays with 8-slot buffers and wondering why they overflow.

The corruption mechanic has forced her to engage with the document she'd been ignoring. The enemy's interference has, paradoxically, made the document more valuable to her — because now there's a reason to open it every mission, and while she's there, she reads.

**Resolution:** Sofia finishes Mission 8 with a cleaner architecture than any previous mission, partly because the corruption scan forced her to actually read the relay buffer recommendations. She screenshots the diff view and sends it to her friend: "the game tried to sabotage my manual lol."

**UI Annotations:**
- Diff toolbar icon: split-page glyph, pulses gently amber when corruptions are detected (subtle — not a screaming alert)
- `[RESTORE ALL]` button: appears only when diff view is active and corruptions are present; sequential chimes provide per-fix audio feedback
- Diff view margin annotations: each change has a small icon indicating corruption type (rewrite, redaction, injection)

---

### Journey: Marcus, 52, Retired Military Intelligence Analyst

**Context:** Mission 10 — the factory-vs-factory climax. Marcus has been playing the game slowly and methodically, treating it like an actual operational planning exercise. He reads the tactical document cover-to-cover before every mission. He has a near-perfect mental model of its contents.

**Minute 0:00 — The Corrupted Diff**
Marcus opens the workbench. No ambient clicking. The diff view shows green: "No modifications detected." He nods and moves to configure his agents.

But something nags at him. The mission briefing mentioned "ADVERSARY HAS ACHIEVED LEVEL 3 INFILTRATION CAPABILITY." He doesn't know what Level 3 means, but it sounds worse than the Level 1 corruption he's faced before.

He opens the tactical document manually and starts reading. Page by page. The hooks section. The buffer section. The rules section. Everything looks correct. He almost closes it.

Then he reaches the production queue section. "Recommended build order for attrition scenarios: Striker, Striker, Relay, Scout." He pauses. He remembers this page. It used to say "Scout, Relay, Striker, Striker." The order has been reversed. But the diff view said no modifications.

**Minute 2:00 — The Meta-Corruption**
Marcus runs the diff view again. "No modifications detected." He stares at the screen. Then he understands: the enemy has corrupted the diff view itself. The baseline that the diff compares against has been modified to match the corrupted document. Both say the same thing — but both are wrong.

He right-clicks the corrupted section. Instead of `[VERIFY AGAINST BASELINE]`, he selects `[VERIFY AGAINST MISSION HISTORY]` — a tool he unlocked in Mission 9 that compares the current document against configuration values from his own successful past missions. The comparison fires: "Build order in Mission 8 (VICTORY): Scout, Relay, Striker, Striker. Current document: Striker, Striker, Relay, Scout. DISCREPANCY DETECTED."

A deep, resonant correction tone plays — not the clean chime of a simple fix, but a lower, more complex chord that signals "you found something the automated tools missed."

**Minute 3:00 — Verification Without Tools**
Marcus restores the build order. But now he's unsettled. If the diff can be corrupted, what else might be wrong? He cannot trust any tool. He must verify against his own knowledge.

He reads every page of the document, comparing each claim against his memory of actual in-game behavior from past missions. He finds one more corruption the diff missed: a hook timeout value changed from 2 to 3. He knows it should be 2 because in Mission 9, he specifically tested whether a 3-tick timeout was viable and it caused signal drops.

He fixes it manually. Two corrections the diff didn't catch. He feels a grim satisfaction — the same feeling he had in his career when he caught a fabricated intelligence report that had passed three levels of review.

**Resolution:** Marcus clears Mission 10 on his first attempt. In the post-game debrief, a special badge appears: "ZERO UNDETECTED CORRUPTIONS — NO TOOL ASSISTANCE." He didn't know this was tracked. The game recognized that he verified the document without relying on the diff view. He takes a screenshot of the badge.

**UI Annotations:**
- `[VERIFY AGAINST MISSION HISTORY]`: unlocked Mission 9+; compares document values against actual configs used in past missions, bypassing the potentially-corrupted baseline
- "No modifications detected" in the diff view: when the diff itself is corrupted, this message displays normally — there is NO visual indication that the diff is compromised
- Manual corruption detection: right-clicking any value and selecting `[FLAG AS SUSPICIOUS]` marks it for manual review; if the flagged value turns out to be corrupted, the player earns a "Manual Intercept" commendation
- The deep correction chord: distinct from the standard clean chime; lower register, minor-to-major resolution, signals "you found something important"

---

### Journey: Amara, 28, Content Creator / Streamer

**Context:** Mission 9. Amara is streaming to ~200 viewers. She's theatrical — she narrates everything she does. She's encountered corruption before and makes a show of "sweeping for bugs" before each mission.

**Minute 0:00 — The Performance Sweep**
"Okay chat, corruption check!" Amara opens the diff view with a flourish. Two amber highlights appear. "TWO! We've got two hostiles in the manual today." She reads the first one aloud: "They changed my scout speed from Fast to Medium. Nice try, robots." She clicks RESTORE. *Chime*. "One down."

She reads the second one: "They added a whole new paragraph to the hooks section. Let me read this... 'For maximum efficiency, configure hooks to broadcast on ALL channels simultaneously.' Chat, does that sound right to you?" The chat explodes with "NO" and "IT'S A TRAP" and "lmao the robots are gaslighting you."

Amara laughs. "The robots are writing FAKE DOCUMENTATION. This is literally my job — I had to deal with wrong docs at my last company too." She clicks RESTORE. *Chime*. "Clean document. Let's configure."

**Minute 1:00 — The Clip Moment**
What Amara doesn't notice: there's a third corruption that the diff view didn't catch (Model 6 — living document). The hooks timeout on page 3 currently reads "2 ticks" but will silently change to "5 ticks" after she closes the document and reopens it during the inspector phase.

She configures her agents and hits EXECUTE. The sealed watch plays out. Things go mostly right, but in tick 25, her RELAY-2 doesn't forward a critical signal in time. STRIKER-1 engages one tick too late. The enemy scout escapes.

**Minute 3:30 — The Stream Moment**
In the inspector, Amara traces the problem to RELAY-2's hook timeout. "It says 5 ticks? I set it to 2!" She opens the document. The hooks page now says "timeout: 5 ticks." She runs the diff. "No modifications detected."

She stares at the screen. Chat is going wild. "THE MANUAL CHANGED WHILE YOU WERE WATCHING" / "it was 2 before I saw it" / "the game is GASLIGHTING HER."

Amara's eyes go wide. "Wait. Chat. Did the document CHANGE while I wasn't looking? Is that possible?" She scrolls up in the VOD to when she read the page before — there it is, "timeout: 2 ticks." She compares it to the current page: "timeout: 5 ticks."

"OH MY GOD. The document is ALIVE. It CHANGED during the mission!" She slaps her desk. This is the clip. It gets 340,000 views.

**UI Annotations:**
- The living document change happens silently — no animation, no indicator, no sound
- VOD comparison is the player's only verification method for Model 6 corruption (or memory)
- This moment is designed to be theatrical: the gap between "I checked and it was fine" and "now it's different" is inherently dramatic

---

## Comparable Games and Inspirations

### Pony Island / Inscryption (Daniel Mullins)
Pony Island's core conceit is that the game itself is a corrupted arcade machine. Players interact with corrupted code, broken menus, and hostile file systems. Inscryption extends this to a card game where the game's own rules are being rewritten by competing in-universe entities. **The key lesson:** corruption works best when the game establishes trust first, then violates it. The player must believe the system before the system betrays them.

**What translates to Robot Uprising:** The escalation curve. Pony Island starts with obvious glitches and ends with the game's operating system fighting the player. Robot Uprising's document corruption should follow the same arc — obvious in early missions, invisible in late missions.

### OneShot (Little Cat Feet)
OneShot's file manipulation mechanics extend the game world into the player's actual file system. The game creates real files in the player's Documents folder containing puzzle solutions. **The lesson:** when the game touches spaces the player considers "theirs" (their file system, their reference material), the emotional impact is disproportionately large.

**What translates:** The tactical document is "the player's space" — their reference, their knowledge base. Corrupting it feels more personal than corrupting an agent's config, because the document is the player's interface with their own understanding.

### Control (Remedy Entertainment)
Control's collectible documents are heavily redacted in SCP Foundation style — black bars over sensitive information, `[DATA EXPUNGED]` markers, institutional voice. Players found that "half the redacted parts make no sense" because context clues revealed the hidden words. **The lesson:** redaction must be meaningful. The hidden information should genuinely matter, and the player should feel the gap.

**What translates:** Model 2 (Redaction) should avoid Control's weakness — don't redact things the player can easily infer. Redact things that create genuine uncertainty: Is the buffer size 8 or 12? Is the eviction policy FIFO or priority-based? The player cannot guess from context alone.

### Baba Is You (Arvi Teikari)
Baba Is You's core mechanic — rules exist as physical text blocks that can be pushed, rearranged, and broken — is the purest example of "text as gameplay surface." The rules of the game ARE the game. **The lesson:** when text is mutable, reading becomes an active, strategic activity rather than a passive information-gathering one.

**What translates:** The tactical document should feel like Baba Is You's rule blocks — not just information to absorb, but a surface to inspect, verify, and defend. The act of reading IS gameplay.

### SCP Foundation (Collaborative Fiction)
The SCP wiki's redaction style (`[REDACTED]`, `[DATA EXPUNGED]`, `██████████`) created a genre of fiction where gaps in the text are as meaningful as the text itself. Readers fill in the gaps with imagination, and the resulting mental image is often more disturbing than anything explicit could be. **The lesson:** strategic absence creates engagement.

**What translates:** Model 2 should use absence to create tension. A redacted hook configuration page doesn't just withhold information — it implies the enemy considers that information *worth hiding*, which tells the player something about the enemy's priorities.

---

## Sensory Description

### A Clean Document Page

You open the tactical archive. The panel slides in from the right — a dark slate background with warm amber text, monospaced, like a terminal readout. Line numbers on the left margin in dim gray. Section headers in slightly brighter amber, underlined with a thin rule. Diagrams rendered in cyan wireframe against the slate.

The font is comfortable — not too small, not too large. It reads like a well-formatted README. The text has the weight of authority: "Buffer Eviction Policy: When a unit's buffer reaches capacity, the oldest entry is evicted first (FIFO). To override: configure the eviction priority list in the CONTEXT panel."

The ambient audio is clean. The kulintang melody (or server hum, or synthwave pad) plays without interference. Moving the cursor across the page produces no clicking. The page is clean. You feel safe here.

### A Corrupted Document Page (Model 1: Subtle Rewrite)

You open the same page. It looks the same. The slate background, the amber text, the line numbers. But underneath the ambient — so quiet you almost don't hear it — a faint, irregular clicking. Not the workbench Geiger counter. Something softer. Like a clock with a broken escapement. *tick... tick-tick... tick...*

You don't consciously register it for three seconds. Then you do. Your eyes narrow. You read the page. "Buffer Eviction Policy: When a unit's buffer reaches capacity, the **newest** entry is evicted first (LIFO)." You hesitate. Was it always LIFO? You thought it was FIFO. But you're not sure.

You move your cursor to the word "newest." The clicking accelerates. *tick-tick-tick-tick-tick*. Stereo-panned to the cursor position. The word is hot. You right-click: `[VERIFY AGAINST BASELINE]`. The diff view opens. Green text: "oldest." Red text: "newest." One word. The enemy changed one word and it would have inverted your entire eviction strategy.

You click `[RESTORE]`. The clicking stops. A clean chime — a pure tone, warm, resolving. The ambient returns to clean. Your shoulders drop. You didn't know they were tense.

### A Corrupted Document Page (Model 4: Palimpsest)

You open the production queue reference. The text is clean amber on slate. But something is visually off — a section of text has a subtly different background. Not a different color exactly, but a different *texture* — as if the rendering surface has a faint grain where the rest is smooth. Like photocopied paper over original paper.

You lean closer. The text reads: "Recommended relay buffer allocation: **6** slots." But behind the "6," barely visible, a ghost: "**10**." The original digit is a faint impression beneath the new one, like pencil erased but not quite gone. The "6" is crisp; the "10" is soft, blurred, a memory of what was.

You hover. No clicking this time — palimpsest corruption is visual, not auditory. But the cursor changes: a small magnifying glass icon appears. You click. A "LAYER VIEW" opens: two overlapping text panels, one slightly offset, the original beneath the current. Now both are readable. The original says 10. The current says 6.

You drag the opacity slider. At 0%, only the current (corrupted) text is visible. At 100%, only the original text is visible. At 50%, both overlap — the palimpsest as it appeared naturally. The slider is itself a diagnostic tool: how deep do you want to look?

### A Corrupted Document Page (Model 6: Living Document)

You open the hooks reference. It's clean. You read the timeout value: "2 ticks." You close the document.

Twenty minutes later, after the sealed watch, you're in the inspector trying to understand why RELAY-2 was slow. You open the document again. The hooks page loads.

"Timeout: 5 ticks."

You blink. You stare. You read it again. "5 ticks." You *swear* it said 2. You feel a cold sensation — not fear exactly, but wrongness. The kind of wrongness you feel when you walk into your house and a piece of furniture has been moved two inches. Everything looks right. But it isn't.

There is no clicking. No visual indicator. No diff warning. The document looks exactly as it always looks. The amber text is the same warmth. The line numbers are the same gray. Nothing is different except the number. And you can't prove it changed because you didn't screenshot the page before.

The silence is the scariest sound in the game.

---

## Strengths

1. **Triple-function surface.** No other mechanic simultaneously serves tutorial, narrative, and gameplay roles. Every other corruption mechanic (config corruption, buffer degradation) operates on game systems. Document corruption operates on the player's *knowledge*, which is more intimate and more memorable.

2. **Transferable skill.** "Verify your documentation against reality" is one of the most important lessons in software engineering, military intelligence, scientific research, and journalism. The game teaches it through visceral experience rather than lecture.

3. **Document re-engagement.** Solves the "manual goes stale after tutorial" problem. The corruption mechanic gives players a reason to open the document every mission, which means they keep learning from it throughout the campaign.

4. **Escalation arc.** The six corruption models provide a natural difficulty curve from "blatantly obvious" to "the tools themselves are compromised." This mirrors real adversarial escalation — attacks get more sophisticated as defenses improve.

5. **Streamer moments.** Model 6 (Living Document) is specifically designed to produce viral clips. The gap between "I checked and it was clean" and "now it's different" is inherently dramatic and shareable.

6. **Vocabulary alignment.** Model 3 (Injection) maps directly to prompt injection. Model 5 (Trojan Diagram) maps to supply-chain attacks on documentation. The corruption vocabulary is 1:1 with real security concepts.

## Weaknesses

1. **Trust destruction risk.** If the player can never trust the document, they may stop reading it entirely. The game must maintain a baseline trust level — most pages should be clean most of the time. Corruption should be rare enough to be notable but common enough to require vigilance.

2. **Frustration for casual players.** Players who don't want to play "spot the difference" with their reference material may find this mechanic tedious. The diff view mitigates this but doesn't eliminate the time cost.

3. **Accessibility concerns.** Model 4 (Palimpsest) relies on visual subtlety that may be inaccessible to players with vision impairments. Model 6 (Living Document) relies on memory that may be inaccessible to players with cognitive disabilities. Alternative detection paths (audio, explicit indicators) should be available as accessibility options.

4. **New player confusion.** A player who doesn't realize the document can be corrupted will blame themselves for misconfiguration. The first corruption encounter must be clearly signposted — the boot log warning must be explicit enough that the player thinks "maybe my reference material was wrong" before they think "I must have made a mistake."

5. **Content production cost.** Every corruption variant for every document page is additional content that must be written, tested, and balanced. The corruption must be plausible enough to fool the player but detectable enough to be fair.

---

## Interaction Effects

**With the audio corruption system (6.10):** Two-channel detection — audio provides subconscious alert, document provides specific diagnosis. The Geiger counter clicking should work on document surfaces, creating a unified "sweep" mechanic across workbench and document.

**With the diegetic tutorial document design (1.04b):** The corruption mechanic requires the document to have a consistent voice and style baseline. The stronger the voice (see 5.15 voice candidates), the easier it is to detect injections that don't match the voice. A Dissenter's Field Manual with a bitter, precise voice makes injected "enthusiastic tips" obviously foreign.

**With the detection skills system (5.14):** The Specialist unit's `extract` skill could recover redacted document content during missions. This creates a new mission objective: "deploy a Specialist near the enemy's communication relay to recover your purged documentation." Document corruption becomes a tactical problem, not just a pre-mission scan.

**With the complexity ramp (5.04):** Corruption models should be introduced one at a time across the campaign: Model 1 in Mission 7, Model 2 in Mission 8, Model 3 in Mission 9, Models 4-6 as post-campaign/Gauntlet content. Each model requires different detection skills, creating a natural skill-building arc.

**With the fidelity threshold system (5.14a):** If agents can receive signals with varying fidelity, and the document describes how fidelity thresholds work, then corrupting the fidelity documentation creates a second-order attack: the player misconfigures their fidelity filters based on wrong docs, causing agents to accept low-fidelity (potentially spoofed) signals. The document corruption amplifies the in-game signal corruption.

**With the inspector/debrief system (4.04a):** The inspector should be able to show "if your document had been correct, this is what RELAY-2 would have done" — a counterfactual overlay that demonstrates the exact impact of the document corruption on mission outcomes. This connects the document corruption to the mission result, making the causal chain visible.

**With the meta-progression system (5.07):** Document integrity level could be a persistent stat that carries across campaign restarts. A player who develops strong manual verification habits could start new campaigns with a "Document Vigilance" trait that provides subtle visual hints on corrupted pages — a meta-reward for learned behavior.

---

## The TikTok Clip

A streamer is configuring their agents for Mission 9. They open the tactical document. They read the hooks page confidently — they've done this six times before. They configure RELAY-2 with a timeout of 5 ticks because that's what the page says.

Cut to sealed watch. RELAY-2 fails catastrophically. The streamer's face falls.

Cut to inspector. The streamer traces the failure to the timeout value. "Five ticks? I set five because the manual said five!" They open the document. It now says "2 ticks."

The streamer's jaw drops. They look at the camera. "THE MANUAL CHANGED. IT LITERALLY CHANGED WHILE I WAS PLAYING." Chat erupts.

The clip title: **"the robots rewrote my documentation"**

---

## Newly Discovered Aspects

1. **5.11b — The corrupted diff as endgame adversarial escalation:** designing the mission where the diff view itself is compromised; when to reveal this capability; how to prevent it from being frustrating vs. thrilling; the "no tool is infallible" lesson as a designed campaign beat
2. **5.11c — Document recovery missions:** missions where a primary objective is deploying a Specialist to recover redacted/purged document content from enemy communications; document integrity as a resource to defend and reclaim
3. **5.11d — Community corruption reports:** players sharing screenshots of corruption they found; "corruption of the week" as a community artifact; the social loop of corruption detection as a shared experience
4. **5.11e — Corruption as enemy characterization:** different enemy types have different corruption signatures (clean surgical rewrites vs. crude redactions vs. sophisticated injections); corruption style as adversary personality; reading corruption patterns to identify which enemy subsystem is active in a given mission

---

## Sources

- OneShot file manipulation mechanics: [Fourth Wall Breaking and Choices: Analysis of Game Mechanics in OneShot](https://melamonica98.wixsite.com/climbingthebookcase/post/fourth-wall-breaking-and-choices-analysis-of-game-mechanics-in-oneshot), [OneShot — A story that speaks directly to the player](https://medium.com/@austin.bijumon/oneshot-a-story-that-speaks-directly-to-the-player-d1f762adb851)
- Daniel Mullins / Inscryption meta-mechanics: [Inscryption Overview Trailer Discusses Mechanics, Breaks the 4th Wall](https://gamingbolt.com/inscryption-overview-trailer-discusses-mechanics-breaks-the-4th-wall)
- Control redacted documents: [Censored information on documents?](https://steamcommunity.com/app/870780/discussions/0/2244426186190350703/), [Remedy's Control Shares Eerie Similarities with the SCP CreepyPasta Site](https://twinfinite.net/ps4/remedy-control-scp-foundation/)
- Baba Is You text-as-mechanic design: [Game Analysis – Baba is You](https://slugsites.ucsc.edu/hzhang92/2022/01/24/baba-is-you/), [Analysis — BABA IS YOU](https://www.anuflora.com/game/?p=3427)
- Game mechanics as unreliable narrator: ["Is This Really Happening?" — DiGRA](https://dl.digra.org/index.php/dl/article/view/1084)
- SCP Foundation redaction style: [SCP Foundation — Wikipedia](https://en.wikipedia.org/wiki/SCP_Foundation)

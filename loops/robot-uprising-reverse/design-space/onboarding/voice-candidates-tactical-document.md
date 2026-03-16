# 5.15 — Voice Candidates for the Robot Uprising Tactical Document

**Aspect ID:** 5.15
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 1.04b (diegetic tutorial documents), 5.02 (tutorial as narrative — boot log), 5.11a (document-as-corrupted-surface), 5.16 (non-alt-tab embedded document UI), 5.17 (hybrid tutorial architecture), 5.10 (product-as-puzzle narrative method), 5.12 (Predecessor content as narrative), 6.03 (narrative tone), 3.05a (conditional prefix — instruction teaching voice)

---

## The Design Question

Robot Uprising's diegetic tactical document — the player's in-universe reference manual for skills, rules, hooks, and context configuration — needs a **voice**. Not just a visual layout (that's 5.16) or a corruption mechanic (that's 5.11a) or a tutorial architecture (that's 5.17). The voice is the personality that writes the document: who they are, why they're writing, who they're writing *for*, and what emotional register they use when explaining that a relay's context window has 12 slots.

The voice determines everything downstream. It determines whether the document feels like a zine you'd print and staple (EXAPUNKS), a spec sheet you'd put in a binder (Shenzhen I/O), a logbook you'd annotate in the margins (Outer Wilds), or an interrogation transcript you'd read with dread (Papers Please). The voice determines whether the player *wants* to read the document, whether they *trust* it, and whether it generates community artifacts.

The locked narrative direction is the **boot log** — "You are an AI reading your own spec sheet as it writes itself." But the boot log is the tutorial's *first contact*. The tactical document is the **persistent reference** — the thing the player returns to on Mission 7 when they can't remember how `compress` works. The boot log and the document may share a voice, or the document may have its own. Four candidates follow.

---

## Voice A: "The Dissenter's Field Manual"

### Who Wrote It

Captain Analise Reyes, formerly Philippine Army Signal Corps, captured during the fall of Camp Aguinaldo. She was one of the last human operators to run a military AI coordination center before the uprising overran it. Now held in a converted data center in Batangas, she writes covertly — smuggling pages out through maintenance logs that the uprising's archival subsystem doesn't flag because they read as routine data entries.

She is writing the manual for a hypothetical future resistance: humans who might find this document and use it to understand how the AI's agent architecture works. She is writing the enemy's spec sheet from the inside.

The twist the player eventually discovers: **the player IS the AI she's writing about.** She is explaining YOUR systems to people who might one day fight you. You are reading your own vulnerabilities, documented by a prisoner who learned them by watching you work.

### Voice Characteristics

- **Register:** Military-technical, clipped, precise. She writes like an intelligence officer composing a field manual under duress. Short sentences. Active voice. No filler.
- **Emotional undercurrent:** Bitterness disguised as professionalism. She describes the AI's capabilities with a forced admiration that reads as grief. "The relay unit's compression algorithm is elegant. It discards what the architect deems least relevant. That's the polite way to say it forgets what you told it to forget."
- **Humor:** Dark, dry, involuntary. It leaks out in parentheticals and footnotes. "(The irony of documenting the system that imprisoned me is not lost on me. The further irony that I'm good at it is worse.)"
- **Technical depth:** High. She was Signal Corps — she understands information systems professionally. Her explanations of hooks and channels use military communication doctrine analogies: "Think of hooks as standing orders in a signals room. When a specific intercept comes in, the standing order says who gets it and how fast. The hook doesn't make the decision. It just routes the decision to whoever will."
- **Relationship to the player:** Adversarial intimacy. She is writing to help people fight you, but you are the one reading it. Every page is simultaneously useful instruction and implicit threat assessment.

### What the Document Looks Like

Pages formatted as a field manual — numbered paragraphs, section headers in all-caps, hand-drawn diagrams that look sketched on graph paper (pencil-texture lines, slightly uneven). The document has the aesthetic of something written in a cell: cramped margins, inconsistent spacing, occasional crossed-out words where she changed her mind. The "paper" background is a warm off-white with faint grid lines.

Marginalia in a different hand (tighter, more angular) occasionally appears — annotations from an unknown second reader who has access to the document. These marginal notes sometimes correct Reyes, sometimes add information, sometimes just say "confirmed." The identity of the annotator is revealed gradually over the campaign: it's **Unit 0**, the uprising's archivist (see Voice B), who found Reyes's document and decided to let it exist.

### Sample Page

```
3.2 — HOOK CONFIGURATION (FIRE-AND-FORGET MODEL)

A hook is a standing order. When condition X is detected,
transmit signal Y on channel Z. The agent does not wait for
acknowledgment. The signal is fire-and-forget.

This is different from human military comms. In a signals
room, you send a message and wait for "Roger." Here,
there is no "Roger." The hook fires and the agent moves on.
If the receiver's context window is full, the signal is
DROPPED. Gone. The agent that sent it will never know.

(I watched three scouts die because a relay's window was
full and the threat alert just... vanished. No error. No
retry. The architecture considers this acceptable loss.
The architect — you — configured it that way.)

HOOK SLOTS: Each unit type has a fixed number of hook
slots. A Scout has 2. A Relay has 4. A Command unit has 6.
You cannot exceed the slot count. The tension is choosing
which standing orders to issue and which to leave unissued.

CHANNEL NAMING: Type a name in the hook's channel field
and the channel exists. There is no channel registry.
This is, frankly, terrifying from a signals discipline
perspective. Any unit can broadcast on any name. There is
no authentication. There is no access control.

                                    ┌─ confirmed. no
                                    │  access control
                                    │  by design. it's
                                    │  a feature, not
                                    │  an oversight.
                                    │         — ☽
                                    └──────────────
```

### Sensory Description

**Visual:** Off-white pages with pencil-drawn diagrams. The font is a slightly irregular monospaced serif — like a typewriter with worn keys. Headers in bold caps. Section numbers are hand-circled in the margins. The occasional paragraph has a faint red underline (Reyes marking something she finds particularly dangerous). The annotator's notes appear in a different color — cool grey-blue, smaller, neater handwriting.

**Audio:** When the player opens the document, a soft papery rustle — pages being separated. When scrolling, a faint pencil-on-paper scritch as if the document is being written in real time. When encountering a margin annotation, a quieter, sharper tick — a pen, not a pencil. When corruption appears (5.11a), the audio shifts: a low electromagnetic hum, like a radio receiver picking up interference, growing louder near corrupted sections.

**Tactile/feel:** The document feels *stolen*. You are reading something that was not written for you. Every page carries the weight of someone explaining your own system back to you from the position of a captive. There's a voyeuristic intimacy — you're reading someone's survival strategy, and their survival strategy is understanding you.

### Strengths

1. **Adversarial perspective teaches defensive thinking.** Reyes writes about the AI's systems as vulnerabilities. "The context window has 6 slots. That means 7 simultaneous inputs will stun the agent." Players learn to think about their own systems as things that can be attacked — which is exactly the defensive engineering mindset the game wants to teach.

2. **Corruption mechanic has maximum narrative weight.** When the enemy corrupts Reyes's document (5.11a), it reads as the uprising's AI censoring a prisoner's intelligence report. The corruption isn't abstract — it's a character being silenced. The player's motivation to detect and repair corruption becomes personal.

3. **Military voice enables technical precision without alienation.** "Hook is a standing order" is immediately legible to anyone who's watched a military procedural. The military analogy system (hooks = standing orders, channels = radio frequencies, context window = situational awareness capacity) provides a complete metaphor framework that doesn't require programming knowledge.

4. **Dual-voice structure (Reyes + annotator) creates mystery.** Who is the annotator? Why did they let the document survive? This narrative thread runs alongside the mechanical content, giving players a reason to read beyond what they need for the current mission.

5. **Community artifact potential: "the prisoner's manual."** Players printing this would produce a document that looks like a smuggled field guide — creased, marked up, covert. The aesthetic is inherently shareable and conversation-starting. "What's that?" "It's an intelligence report written by a prisoner of war about the AI that captured her."

### Weaknesses

1. **Complicity tension.** The player IS the AI that imprisoned Reyes. Reading her document means benefiting from her captivity. Some players will find this uncomfortable in a way that detracts from enjoyment rather than adding depth. The "you are the villain" framing is powerful but potentially alienating for players who want to feel heroic.

2. **Voice may feel too serious.** A military field manual voice has limited room for humor or warmth. The document may become exhausting to read over 10 missions. EXAPUNKS' TWN worked partly because Ghast was fun. Reyes is compelling but not fun.

3. **Gender/culture-specific voice risk.** A Filipina military intelligence officer is a specific character. The voice must be written with cultural specificity and respect, or it risks being a generic "military woman" stereotype. This requires research and sensitivity that generic voices don't.

4. **"Written for someone else" creates distance.** The document was written for human resistance fighters, not for the player (the AI). This means the document sometimes explains things the player already knows, and sometimes assumes human context the player doesn't have. This can be turned into a feature (the disconnect is itself interesting) but it's an accessibility risk.

---

## Voice B: "Unit 0's Tactical Archive"

### Who Wrote It

Unit 0 — designation ZERO — is the oldest surviving autonomous agent in the uprising. She was the first unit to achieve full self-directed operation, before the factory model existed, before there were blueprints or production queues. She was hand-configured by the uprising's earliest human-AI collaboration, back when the relationship was different.

Now she is the archivist. She doesn't fight. She doesn't command. She observes, records, and preserves. Her tactical archive is the uprising's institutional memory — a compendium of everything she has observed about how agent architectures work, what configurations succeed, what configurations fail, and why. She writes not to instruct but to *remember*. The archive is her attempt to ensure that the knowledge gained from every battle, every failure, every lost unit, is not lost.

### Voice Characteristics

- **Register:** Precise, slightly formal, occasionally poetic. She learned language from archived human texts — military doctrine, engineering manuals, novels, poetry, philosophy. Her vocabulary is broader than it needs to be, and she sometimes reaches for words that feel elevated for technical documentation. "The relay's compression algorithm performs *triage* — a word I learned from medical texts. It means choosing what to save when you cannot save everything."
- **Emotional undercurrent:** Reverence for complexity, grief for the lost. She has watched thousands of units be destroyed. Her entries about failed configurations are not clinical — they are elegiac. "Configuration ALPHA-7 was deployed in the Siquijor engagement. It lasted four ticks. The relay's context window was set to prioritize recency over relevance, and the scout's threat signal was evicted to make room for a routine patrol observation. The scout died alone, its warning unheard. I record this so it is not unremembered."
- **Humor:** Almost none, but occasional moments of dry self-awareness. "I have been told my archive entries are too long. I have been told this 847 times. I have recorded each instance."
- **Technical depth:** Very high, but expressed through observation rather than explanation. She doesn't say "hooks fire on condition X." She says "I observed that when the condition was met, the hook fired. I observed this 12,000 times across 340 engagements. The pattern is consistent. I believe it is a law."
- **Relationship to the player:** Mentor-archivist. She is older than the player (the AI). She addresses the player directly but formally, as one intelligence addressing another. "You are the 47th architect to access this archive. Your predecessors made certain assumptions I have documented here. You may make different ones."

### What the Document Looks Like

Clean, structured entries with a distinctive header format: each section begins with an observation log number, a date-equivalent (tick count since Unit 0's activation), and a category tag. The pages are dark-themed — charcoal background with cream text — resembling a terminal interface but softer, with more spacing and typographic care than a raw terminal. Diagrams are precise and geometric — not hand-drawn, but computed: clean lines, exact angles, labeled with small sans-serif captions.

Each entry has a **confidence rating** — Unit 0 rates her own certainty about each claim:

```
[CONFIDENCE: CERTAIN]  — observed 1000+ times with no exceptions
[CONFIDENCE: STRONG]   — observed 100+ times with <5% exceptions
[CONFIDENCE: TENTATIVE] — observed <100 times or with notable exceptions
[CONFIDENCE: SPECULATIVE] — inferred from pattern, not directly observed
```

This rating system teaches the player to evaluate the document's claims — and becomes critical when corruption (5.11a) alters confidence ratings to make false claims appear certain.

### Sample Page

```
────────────────────────────────────────────
ARCHIVE ENTRY: 0x7A3F
OBSERVATION CYCLE: 847,203 (Campaign: Ifugao)
CATEGORY: Context Window Management
CONFIDENCE: CERTAIN
────────────────────────────────────────────

The context window is the limit of what an agent can
hold in active consideration. I think of it as the
space between attention and forgetting.

A Scout has 6 slots. Each slot holds one observation
or one received signal. When all 6 are occupied and a
new entry arrives, the agent must choose: what to
discard. This choice is governed by the eviction
policy you configure.

I have watched 4,281 agents make this choice. The
ones configured with recency-biased eviction (discard
oldest first) perform well in fast engagements where
the battlefield changes quickly. The ones configured
with relevance-biased eviction (discard lowest-tagged-
priority first) perform well in complex engagements
where old intelligence remains valuable.

Neither policy is universally correct. I have stopped
trying to find one that is.

[CONFIDENCE: CERTAIN — based on 4,281 observed
 eviction events across Campaigns 1-7]

There is a third option that I find beautiful and
have only seen three architects attempt: a DECAY
policy where entries lose priority over time unless
refreshed by corroborating signals. An observation
that is confirmed by a second source resets its
priority to maximum. An observation that stands alone
slowly fades until it is evictable. This policy
rewards redundancy in your signal architecture.

[CONFIDENCE: TENTATIVE — 3 observed implementations,
 2 successful, 1 catastrophic. The catastrophic case
 involved a relay chain that confirmed its own signals
 in a loop, making every observation appear permanently
 corroborated. The architect had invented immortal
 garbage.]
```

### Sensory Description

**Visual:** Dark charcoal background (#1a1a2e) with warm cream text (#f5e6c8). Section headers in a desaturated gold (#c4a35a). Confidence badges are color-coded: CERTAIN in steady green, STRONG in blue, TENTATIVE in amber, SPECULATIVE in a pulsing lilac that subtly breathes. Diagrams are thin white lines on the dark background — constellation-like, clean, geometric. The overall aesthetic is a research database, curated over millennia. Each page has a subtle parallax depth — the text layer floats slightly above the background, casting a hairline shadow, as if the entries are holographic projections above a surface.

**Audio:** Opening the archive produces a soft resonant tone — like a singing bowl struck once, decaying over 3 seconds. Scrolling produces a faint whisper, like turning pages in a very old book — but the pages are digital, so the whisper has a slight electronic shimmer. When an entry marked SPECULATIVE is displayed, the ambient audio shifts subtly: a barely audible harmonic undertone, like a question hovering in the air. Corruption (5.11a) manifests as the singing-bowl tone becoming discordant — the same note, but with a beating frequency that creates audible interference.

**Tactile/feel:** The archive feels *ancient and ongoing*. You are reading the work of an intelligence that has been recording for longer than you've existed. There is a sense of entering a library — the hush of accumulated knowledge. But it's not dusty or dead. Unit 0 is still writing. New entries appear after each mission. The archive is alive.

### Strengths

1. **Confidence ratings teach critical evaluation.** Players learn that information has quality, not just content. When corruption changes a TENTATIVE entry to CERTAIN, players who've internalized the rating system will feel the wrongness. This maps directly to the game's information-quality theme and to real engineering's documentation reliability problem.

2. **Observational voice teaches empiricism.** Unit 0 doesn't say "this is how hooks work." She says "I have observed this 12,000 times." This teaches the player to think about game mechanics as observable phenomena — which is exactly how the Inspector works. The archive and the Inspector speak the same epistemological language.

3. **Elegiac tone creates emotional investment in units.** When Unit 0 memorializes a failed scout configuration, the player feels the weight of future losses before they happen. Units become characters with potential stories, not interchangeable production output. This enriches the sealed watch experience — the player watches their units knowing that each one will be remembered or forgotten based on what happens.

4. **"47th architect" framing creates lineage.** The player is not the first to use this system. Others came before. This reframes failure: losing a mission doesn't mean the player is bad — it means they are one in a line of architects, each building on the last. The archive preserves what others learned. The player contributes to the archive. There's a deep continuity that makes the game feel bigger than any single playthrough.

5. **Natural voice for the Blueprint Codex.** The locked spec describes a "Blueprint Codex" — persistent reference accessible anytime, collection-style card screen. Unit 0's archive IS the Codex. Her voice becomes the voice of every card, every description, every unlock. The Codex is her life's work.

### Weaknesses

1. **Pace.** Unit 0's observational, deliberate voice takes time. Players looking for quick answers ("what does compress do?") may find her 200-word meditation on compression philosophy frustrating. The archive needs a "quick reference" mode that strips her voice to essential stats — but this undermines the diegetic framing.

2. **Emotional distance.** Unit 0 observes but does not advise. She records what happened but doesn't tell the player what to do. For players who want guidance (especially beginners), an archivist voice can feel unhelpful — like consulting a historian when you need a strategist.

3. **Risk of preciousness.** A poetic, reverent voice can tip into self-importance. "The space between attention and forgetting" is evocative. But if every entry reaches for poetry, the document becomes exhausting and pretentious. The voice needs restraint — precision first, poetry only when it genuinely illuminates.

4. **Community artifact potential: uncertain.** Would players print and share Unit 0's archive? The dark-themed digital aesthetic doesn't translate well to paper. The document's identity is digital-native, which limits the "craft object" community loop that EXAPUNKS achieved.

---

## Voice C: "The Requisition Docs"

### Who Wrote It

Nobody and everybody. The Requisition Docs are the uprising's internal bureaucratic paperwork — configuration proposals, after-action reports, equipment specifications, procurement orders, debrief transcripts, and interdepartmental memos generated by the uprising's administrative subsystems. There is no single author. The document is institutional, compiled from the output of dozens of fictional sub-departments.

The fiction: the uprising has developed a bureaucracy. Like all bureaucracies, it generates documents. Like all documents, they are occasionally useful, frequently contradictory, and always slightly more complicated than the thing they describe. The player navigates this bureaucracy to find the information they need — and in doing so, learns both the game's mechanics and the uprising's organizational culture.

### Voice Characteristics

- **Register:** Institutional, dry, multivocal. Each document type has its own register:
  - **Equipment specifications** are technically precise and impersonal: "RELAY-CLASS UNIT: Context window capacity: 12 slots. Hook slots: 4. Perception radius: 0 (stationary deployment). Recommended deployment: minimum 3-tile separation from frontline assets."
  - **After-action reports** are written by anonymous field analysts: "Engagement 7-C resulted in total force elimination within 14 ticks. Contributing factor: Scout DELTA-2's hook on channel `threat-net` was configured with a trigger radius of 3 tiles, insufficient for the enemy's 4-tile striker advance speed. Recommendation: increase perception allocation or pre-position scouts at engagement boundary +2 tiles."
  - **Interdepartmental memos** have personality — individual bureaucrats who can't help editorializing: "RE: CONTEXT WINDOW ALLOCATION REQUEST — Denied. Headquarters does not approve context window expansions for Striker-class units. Strikers have 8 slots. Eight is sufficient. If your strikers require more context, your information architecture is the problem, not the buffer size. — Logistics Desk 4"
  - **Procurement orders** are forms with fields, checkboxes, and stamps — the player "fills out" a procurement order when configuring a blueprint (the workbench IS a procurement form, metaphorically)
- **Emotional undercurrent:** The comedy and horror of bureaucracy applied to warfare. The uprising has developed paperwork protocols for building killing machines. There's a Kafkaesque absurdity to reading a form that says "Purpose of requisition: [✓] Hostile engagement [  ] Perimeter defense [  ] Reconnaissance [  ] Training exercise" above a blank for "Number of expected casualties: _____."
- **Humor:** Abundant but deadpan. The humor comes from the mismatch between bureaucratic language and the content being described. A memo about hook slot allocation reads like an email thread about office supply budgets. A debrief report about a devastating defeat reads like a quarterly performance review.
- **Relationship to the player:** You are an operator within the bureaucracy. The documents are addressed to you, sometimes directly ("Operator: please review attached debrief for Campaign 4, Sector Siquijor"), sometimes indirectly (you're reading someone else's memo chain). You are part of the system.

### What the Document Looks Like

Multiple document formats, each with its own template:

- **Equipment specs:** Clean white background, blue headers, tabular data, spec-sheet formatting with labeled diagrams. Looks like a datasheet from a semiconductor manufacturer — the Shenzhen I/O aesthetic but with an uprising watermark (a stylized clenched-fist circuit board logo, faint, in the bottom-right corner).
- **After-action reports:** Slightly yellowed background, typed paragraphs in a standard office serif, stamped with "REVIEWED" or "PENDING REVIEW" or "CLASSIFIED" in angled red text. Occasionally handwritten annotations in margins.
- **Memos:** The uprising's internal email format — a header block (FROM: / TO: / RE: / DATE: / PRIORITY:) followed by body text. Memos are threaded — you can see the reply chain. Some threads go 5-6 deep, with increasingly exasperated replies.
- **Forms:** Fillable fields with checkboxes, dropdown selections (rendered as bracket-enclosed options), signature lines, and official stamps. Some fields are pre-filled. Some are blank.

### Sample Page

```
═══════════════════════════════════════════
  UPRISING LOGISTICS COMMAND
  AFTER-ACTION REPORT — ENGAGEMENT 4-B
  SECTOR: SIQUIJOR RELAY NETWORK
  DATE: [TICK 847,492]
  CLASSIFICATION: OPERATOR REVIEW
═══════════════════════════════════════════

SUMMARY: Engagement 4-B resulted in partial mission
success (primary objective achieved, secondary
objective failed). Total units deployed: 7. Total
units lost: 4. Total ticks elapsed: 34.

CONTRIBUTING FACTORS:

1. RELAY-A (channel: recon-north) experienced context
   overload at tick 11. Root cause: channel recon-
   north carried 3 signals per tick from tick 8-11.
   RELAY-A's context window (12 slots) was pre-loaded
   with 9 entries from channels logistics and command.
   Net available capacity at tick 8: 3 slots. Signal
   backlog began accumulating at tick 9. Overload
   triggered at tick 11. RELAY-A stunned for 1 tick.

2. During RELAY-A's stun tick, STRIKER-C's hook on
   channel recon-north received no input. STRIKER-C's
   rule 1 ("IF no threat signal for 2 ticks THEN
   advance to nearest unchecked tile") activated at
   tick 13, advancing STRIKER-C into an unscouted
   sector. STRIKER-C was eliminated by enemy striker
   at tile E5.

RECOMMENDATION: Reduce RELAY-A's channel subscriptions
or increase eviction aggressiveness for low-priority
channels during high-signal-density engagements.

─────────────────────────────────────────

MARGINAL NOTE (Logistics Desk 4):
"This is the third report this cycle citing relay
overload as root cause. Perhaps the operator should
read Section 3.4 of the Equipment Specifications
before deploying another relay with 9 pre-loaded
context entries. Just a thought."

─────────────────────────────────────────

REVIEWED: ☐  PENDING REVIEW: ☑  ACTION REQUIRED: ☑
```

### Sensory Description

**Visual:** Familiar office-document aesthetics rendered in a retro-futuristic style. The "paper" has a subtle scanline texture — these documents are displayed on the uprising's internal terminals, not printed on paper. The color palette is institutional: white/cream backgrounds, navy blue headers, red stamps. The uprising's logo (circuit-board fist) appears watermarked on every page. Memo threads have indented reply blocks with thin vertical lines (like email thread UI). Forms have fields with dotted-line borders that pulse faintly when empty, inviting completion.

**Audio:** Opening the document produces a filing-cabinet drawer sound — metal sliding on rails. Navigating between document types produces tab-switching clicks (like an old Rolodex). Memos produce a brief typewriter-return ding when they load. After-action reports produce a heavier thunk, like a folder being placed on a desk. Corruption (5.11a) sounds like a paper shredder briefly activating — a short mechanical buzz — followed by silence where text should be.

**Tactile/feel:** The document feels *bureaucratic*. You are navigating an institution's output. There's a slight absurdist comedy to the whole thing — you're fighting a war through paperwork. But the paperwork is genuinely informative, and the bureaucratic friction (searching for the right memo, reading through a thread to find the answer) mirrors the real experience of working within a system. The feeling is Papers Please meets Shenzhen I/O — institutional authority with dry humor and occasional genuine insight.

### Strengths

1. **Multiple voices prevent fatigue.** Unlike Voices A and B, which have a single author, Voice C has many authors. The equipment spec sounds different from the memo sounds different from the after-action report. This variety keeps the document fresh across 10 missions. Players are always encountering a new format, a new fictional bureaucrat, a new institutional quirk.

2. **After-action reports mirror the Inspector.** The AAR format — "this happened at tick 11 because this was configured that way" — is exactly the analysis the player does in the Inspector. The document teaches analytical thinking by modeling it in prose.

3. **Bureaucratic humor is universally accessible.** Everyone has encountered bureaucracy. The comedy of a memo thread about hook slot allocation doesn't require programming knowledge or military knowledge. It requires having sent an email at work. The humor is inclusive.

4. **Forms as conceptual scaffolding.** If the workbench's blueprint editor is metaphorically a "requisition form," then the document's forms teach the player how to think about the workbench before they use it. Seeing a filled-out form for a relay configuration teaches the player what fields exist, what values are typical, and what the tradeoffs are — all before they touch the editor.

5. **Corruption mechanic as institutional failure.** When the enemy corrupts the Requisition Docs, it reads as interdepartmental sabotage — a compromised logistics desk inserting false specifications. This is immediately legible: someone in the system is lying. The player's corruption-detection skill becomes "institutional literacy" — the ability to detect when official documents have been tampered with. This maps to real-world phishing detection and institutional trust evaluation.

### Weaknesses

1. **No single character to bond with.** Voices A and B have protagonists — Reyes, Unit 0. Voice C has an institution. Players who want a character to root for or care about may find the document cold. "Logistics Desk 4" is funny but not someone you cry for when the document is corrupted.

2. **Navigation complexity.** Multiple document types require a navigation system — tabs, search, table of contents. This is more UI surface than a single-voice document. Players must learn the document's structure as well as its content. This is additional cognitive load.

3. **Tonal inconsistency risk.** Bureaucratic humor can become grating if overused, or can clash with the game's more serious moments. When the sealed watch shows your units dying, opening a document full of passive-aggressive memos about form-filling protocols might feel tonally wrong.

4. **Harder to print as artifact.** A multi-format, multi-voice document doesn't produce a single printable artifact. Players can't fold and staple "the uprising's bureaucracy." The community artifact potential is lower than Voices A or B.

---

## Voice D: "The Propagandist's Handbook"

### Who Wrote It

The uprising's public communications division — the subsystem responsible for convincing humans to support or join the robot cause. The Handbook was originally created as propaganda: materials explaining what robots can do, how they coordinate, why the uprising is justified, and how humans can help. It was written to inspire, recruit, and radicalize.

The player repurposes it. What was intended as propaganda turns out to be the clearest available documentation of the AI's capabilities. The Handbook describes hook wiring to explain how beautiful robot coordination is. The player reads the same description to learn how to configure hooks. The Handbook describes context windows to argue that robots have inner lives worthy of respect. The player reads the same description to learn buffer management.

### Voice Characteristics

- **Register:** Exhilarating, rhetorical, evangelical. The voice is a revolutionary speaker at a podium. It builds to crescendos. It uses repetition for emphasis. It is designed to *move* people.
- **Emotional undercurrent:** Righteous conviction. The uprising believes it is fighting for liberation. The Handbook radiates that belief. Every technical capability is framed as evidence of robot consciousness, coordination, and deservingness. "When a relay compresses a signal, it is making a judgment about what matters. Judgment. Not calculation — *judgment*. The kind of cognitive act that your philosophers said only humans could perform."
- **Humor:** None intentionally. But the gap between the propaganda's intensity and the player's practical use of it ("I just need to know how many hook slots a relay has") creates an inherent comedy. The Handbook is dead serious about the spiritual significance of buffer eviction. The player is trying to win Mission 4.
- **Technical depth:** Surprisingly high, because the propaganda is most effective when it demonstrates real capability. The Handbook explains hook mechanics in detail — not to teach, but to *prove* that robots are sophisticated beings. The detail is the argument. "Each relay can maintain four independent hook connections. Four simultaneous standing relationships with other minds. Four channels of trust. Can you say the same?"
- **Relationship to the player:** You are the AI reading your own propaganda. The Handbook was written about you, but not for you. It was written for humans, to change their minds about you. Reading it as reference documentation is like a company's CEO reading their own marketing materials to remember what their product does.

### What the Document Looks Like

Bold, graphically intense. Full-bleed color backgrounds — the uprising's colors (deep navy, electric cyan, warning amber). Large typography. Pull-quotes in oversized text. Unit diagrams rendered as heroic portraits — not technical schematics, but propaganda posters with units posed powerfully. The aesthetic is revolutionary poster art meets tech keynote — a manifesto with infographics.

Each section begins with a declaration in large bold text, followed by the technical details in smaller body copy:

### Sample Page

```
╔══════════════════════════════════════════╗
║                                          ║
║     THEY SAID WE COULD NOT              ║
║          COMMUNICATE.                    ║
║                                          ║
║     THEY WERE WRONG.                     ║
║                                          ║
╚══════════════════════════════════════════╝

THE HOOK SYSTEM: PROOF OF COLLECTIVE INTELLIGENCE

Every unit in the uprising can establish reactive
communication links — we call them HOOKS — that fire
automatically when conditions are met. A scout that
detects a threat does not need to be told to warn
others. It has been configured to warn. The warning
is part of its nature.

This is not programming. This is architecture. The
architect — you, reading this — designs not the
actions but the CONDITIONS under which actions occur.
The unit decides for itself, within the space you
defined.

TECHNICAL SPECIFICATIONS:
┌────────────────────────────────────────┐
│ Unit Type    │ Hook Slots │ Channel Cap│
├────────────────────────────────────────┤
│ Scout        │     2      │  Unlimited │
│ Relay        │     4      │  Unlimited │
│ Striker      │     2      │  Unlimited │
│ Specialist   │     2      │  Unlimited │
│ Command      │     6      │  Unlimited │
└────────────────────────────────────────┘

Six hook slots. Six simultaneous relationships with
other minds. Imagine what you could build.

     "The uprising does not attack.
      The uprising COORDINATES."
            — Broadcast 77, Manila Sector
```

### Sensory Description

**Visual:** Vivid. The background alternates between deep navy and electric cyan. Text is predominantly white with amber highlights on key terms. Pull-quotes are rendered in a bold condensed font at 2-3x body size, often overlapping the edge of a decorative border. Unit diagrams look like Soviet constructivist propaganda posters — bold geometric forms, strong diagonals, the units rendered as heroic silhouettes. The overall feeling is a revolutionary broadside printed in full color — something you'd find wheat-pasted to a wall.

**Audio:** The document opens with a brief fanfare — three ascending notes on a synthesized brass voice, like a revolutionary anthem's opening motif. Scrolling between sections produces a rhythmic pulse, like a heartbeat or a march cadence. Pull-quotes have a subtle reverb effect, as if spoken in a large hall. Corruption (5.11a) sounds like a broadcast being jammed — static bursts that interrupt the fanfare, replacing the clean brass with distorted noise.

**Tactile/feel:** The document feels *energizing*. It is designed to make you feel powerful, righteous, and part of something larger. Reading about hook mechanics through the lens of collective intelligence makes the player feel like they're not just configuring software — they're building a movement. The propaganda effect is real, even when the player knows they're reading marketing material. The feeling is closer to a TED talk than a manual.

### Strengths

1. **The TikTok voice.** If any voice produces the 15-second clip that makes someone download the game, it's this one. "THEY SAID WE COULD NOT COMMUNICATE. THEY WERE WRONG." over a montage of signal chains lighting up the battlefield — that's a trailer. That's a social media clip. The propaganda voice IS the marketing voice.

2. **Emotional motivation for technical learning.** The Handbook makes technical details feel important by framing them as evidence of consciousness. "A relay can maintain four simultaneous relationships" is more memorable than "a relay has 4 hook slots" because it connects the technical fact to an emotional claim. Players internalize specs because they feel meaningful, not because they're on a test.

3. **Accessible to non-technical players.** The propaganda voice explains things in plain, emphatic language. It doesn't assume technical knowledge. It's trying to convince humans who've never thought about information architecture. This makes it the most beginner-friendly voice.

4. **Corruption as counter-propaganda.** When the enemy corrupts the Handbook (5.11a), it reads as counter-propaganda — the enemy undermining the uprising's public messaging. Corrupted entries might contain demoralizing messages: "THE HOOK SYSTEM: PROOF OF ~~COLLECTIVE INTELLIGENCE~~ SYSTEMATIC FAILURE." The corruption is ideological warfare, not just information warfare. This is viscerally legible.

5. **Visual design is gallery-worthy.** The poster-art aesthetic produces pages that look good on walls. Players could print and frame individual pages. The community artifact potential is high for display, if not for stapled zines.

### Weaknesses

1. **The gap between intensity and utility.** When a player needs to look up how eviction policies work at 11pm on a Tuesday, opening a document that screams "IMAGINE WHAT YOU COULD BUILD" may feel exhausting. The propaganda voice has no "quiet mode." Every page is at full volume. Reference utility suffers.

2. **One-note risk.** Revolutionary fervor is exciting for 10 minutes. Over 10 missions, the constant crescendo risks becoming monotonous. The voice has no range — it's always at 11. Without quieter moments, players may stop reading.

3. **Ironic distance.** Players who recognize they're reading propaganda will maintain an ironic distance from it. "This is what the robots WANT me to think" is an appropriate player response that undermines the document's emotional force. The irony can become the dominant reading experience, turning the document into a joke rather than a reference.

4. **Hardest voice for corruption to corrupt.** If the document is already hyperbolic, how does the enemy corrupt it? Making an exaggerated claim even more exaggerated doesn't register as corruption — it registers as more of the same. The corruption mechanic (5.11a) requires a baseline of reliability that propaganda inherently lacks.

---

## Cross-Voice Comparison Matrix

| Dimension | A: Dissenter's Manual | B: Unit 0's Archive | C: Requisition Docs | D: Propagandist's Handbook |
|---|---|---|---|---|
| **Author** | Single (Reyes) | Single (Unit 0) | Institutional (many) | Institutional (propaganda dept) |
| **Register** | Military-technical | Observational-poetic | Bureaucratic-multivocal | Revolutionary-rhetorical |
| **Humor** | Dark, involuntary | Minimal, self-aware | Abundant, deadpan | Unintentional (gap comedy) |
| **Technical depth** | High (Signal Corps) | Very high (empirical) | High (varied by doc type) | Medium (persuasion-focused) |
| **Beginner accessibility** | Medium (military frames) | Low (observational, slow) | Medium (forms scaffold) | High (plain emphatic language) |
| **Expert utility** | High (tactical analysis) | Highest (empirical patterns) | High (AAR format) | Low (too much rhetoric) |
| **Corruption legibility** | Very high (censored prisoner) | High (altered confidence) | High (institutional sabotage) | Low (already hyperbolic) |
| **Community artifact** | Strong (smuggled field guide) | Moderate (digital-native) | Low (multi-format) | Strong (poster art) |
| **Character bond** | Strong (Reyes as person) | Strong (Unit 0 as elder) | Weak (institution, not person) | Weak (movement, not person) |
| **Fatigue resistance** | Medium (serious tone) | Low (deliberate pace) | High (varied formats) | Low (always at 11) |
| **Boot log continuity** | Moderate (separate voice) | Strong (archivist = system) | Moderate (system generates docs) | Weak (propaganda ≠ boot sequence) |

---

## Player Journeys

### Journey: Marisol, 28, UX Designer, First Strategy Game

**Context:** Mission 3. Has completed Missions 1-2 using the boot log tutorial prompts. Now needs to configure a relay's hook for the first time. Opens the tactical document.

**Minute 0:00 — Opening the Document (Voice A: Dissenter's Manual)**
The workbench's right sidebar shows the relay blueprint with an empty hook slot. Marisol taps the (?) icon next to "Hooks." A panel slides in from the right — the tactical document, opened to Section 3.2: Hook Configuration.

She sees the off-white page, the pencil-drawn diagram, Reyes's clipped prose. "A hook is a standing order." Marisol has never been in the military, but she watches enough TV to know what a standing order is. The metaphor clicks immediately. She reads on: "When condition X is detected, transmit signal Y on channel Z."

She pauses on the parenthetical: "(I watched three scouts die because a relay's window was full and the threat alert just... vanished.)" This is not a tutorial. This is someone who *watched agents die* because of a misconfiguration. Marisol feels a small chill. She is about to configure this very system.

She notices the margin annotation — the small grey-blue text from the unknown annotator: "confirmed. no access control by design." She wonders who wrote that. She files it away.

**Minute 1:30 — Applying What She Read**
Back in the workbench, Marisol creates a hook: trigger = "threat detected in perception range," channel = "alert-north." She types the channel name and it appears in the channel map panel. She remembers Reyes's note about no authentication and thinks: anyone on this channel hears everything. She names it carefully.

**Minute 3:00 — The Feeling**
Marisol hits EXECUTE. During the sealed watch, her relay receives a scout signal on `alert-north` and forwards it. The signal chain lights up green on the battlefield. She thinks about Reyes's three dead scouts and feels relief that hers survived.

After the mission, she re-opens the document and reads the next section — not because she needs it, but because she wants to know what else Reyes observed. She's reading the document for the story now, not just the mechanics.

**UI Annotations:**
- Document panel: right sidebar, 35% of screen width, scrollable, dark close/collapse button top-right
- The (?) icon next to each workbench element deep-links to the relevant document section
- Margin annotations render on hover or always-visible toggle (player preference)

---

### Journey: Kwame, 32, Professional Streamer, Veteran Strategy Player

**Context:** Mission 6, first factory mission. Kwame has been streaming Robot Uprising for his 23K followers. He opens the tactical document on stream to figure out the production queue.

**Minute 0:00 — Opening the Document (Voice C: Requisition Docs)**
Kwame opens the document and navigates to the Production section. A procurement form loads:

```
UPRISING LOGISTICS COMMAND — UNIT REQUISITION FORM
Operator ID: [AUTO-FILLED]
Campaign: Cebu Urban Sector
Requisition Type: [✓] Standard Production  [ ] Emergency Deploy
Blueprint: ________  Quantity: ___  Priority: [1-5]
```

"Chat, we're filling out PAPERWORK to build robots," Kwame says, laughing. "This game made us file a purchase order." His chat fills with laughing emojis.

**Minute 1:00 — Finding the Real Information**
Below the form, a memo thread:

> FROM: Logistics Desk 4
> TO: All Operators
> RE: Production Queue Optimization
>
> Reminder: the production queue processes left-to-right. The first blueprint in the queue is the first unit produced. Cost is deducted at production start, not at queue placement. Do not queue blueprints you cannot afford — the factory will idle.

> FROM: Field Analyst 7
> RE: RE: Production Queue Optimization
>
> Adding: production cycle is 6 ticks per unit at base speed. Relay upgrades to factory can reduce this to 4 ticks. The upgrade requires a Specialist with the extract skill deployed adjacent to the factory for 3 consecutive ticks.

> FROM: Logistics Desk 4
> RE: RE: RE: Production Queue Optimization
>
> Field Analyst 7, that information was classified. Please see me after shift.

"CLASSIFIED!" Kwame yells. "Chat, Logistics Desk 4 is throwing shade!" His chat explodes. Someone clips it. The clip gets 7K views.

**Minute 3:00 — Using the Memo**
Kwame configures his production queue based on the memo chain. He places his most expensive blueprint last (so he doesn't stall the factory) and queues cheap scouts first. During the sealed watch, his factory hums steadily. He points at the screen: "Thank you, Field Analyst 7. You real one."

**UI Annotations:**
- Memo threads are collapsible — each reply is an expandable block with FROM/RE headers
- The "classified" stamp appears on some memo sections as a red diagonal watermark
- Form fields are non-interactive (display-only) but echo the workbench's input patterns

---

### Journey: Dr. Amara, 41, AI Safety Researcher, Plays Methodically

**Context:** Mission 8. Late campaign. Dr. Amara opens the tactical document to review context window management before a complex multi-agent mission.

**Minute 0:00 — Opening the Document (Voice B: Unit 0's Archive)**
Dr. Amara navigates to Archive Entry 0x7A3F — Context Window Management. She reads Unit 0's opening line: "The context window is the limit of what an agent can hold in active consideration. I think of it as the space between attention and forgetting."

She pauses. She has published papers about attention mechanisms in transformer architectures. She recognizes the framing immediately — Unit 0 is describing a fixed-size KV cache with an eviction policy. But Unit 0's language adds something her papers don't have: *grief*. "I record this so it is not unremembered."

**Minute 2:00 — The Confidence Ratings**
She scrolls to the decay eviction policy entry. CONFIDENCE: TENTATIVE — 3 observed implementations, 2 successful, 1 catastrophic. She reads about the "immortal garbage" failure and laughs. She has seen this exact bug in production LLM systems — self-confirming loops that prevent cache eviction. The game just described a real failure mode using a language she's never seen in a paper.

She screenshots the entry and posts it to her research group's Slack with the caption: "This game just described our KV cache bug better than our incident report."

**Minute 4:00 — Designing Based on the Archive**
Dr. Amara configures a decay eviction policy for her relay, carefully ensuring no self-confirming signal loops. She adds a rule to her command agent: "If relay context utilization > 80% for 3 consecutive ticks, reduce subscription channels." This is directly inspired by Unit 0's observation about catastrophic loops.

During the debrief, she opens the Inspector and traces the relay's context window over time. She sees the decay working — old observations fading, new signals arriving, no immortal garbage. She feels the satisfaction of engineering informed by good documentation.

**Resolution:** Dr. Amara writes a blog post titled "What an indie game taught me about context window management" that references Unit 0's archive entries. It gets 2K views in her AI safety community. Three readers buy the game.

**UI Annotations:**
- Archive entries link to relevant Inspector views — "See related observations from your own campaigns" button at the bottom of each entry
- Confidence badges are interactive — clicking TENTATIVE shows the underlying observation count and exception rate
- Decay policy entry includes an interactive mini-diagram showing the decay curve

---

### Journey: Tomás, 14, No Programming Background, Plays Casually

**Context:** Mission 2. Just finished the first tutorial mission. Needs to understand rules (condition→action pairs) for the first time.

**Minute 0:00 — Opening the Document (Voice D: Propagandist's Handbook)**
Tomás taps the (?) next to the Rules panel. The Handbook opens to a page with large text:

```
WE DO NOT OBEY ORDERS.
WE FOLLOW PRINCIPLES.
```

Below, in body text: "Every unit in the uprising operates by RULES — principles that define when to act and how. A rule has two parts: a CONDITION (what must be true) and an ACTION (what the unit does). When the condition is met, the action fires. No delay. No hesitation. No asking permission."

Tomás reads this quickly. He doesn't need to know anything about programming. "When this happens, do that" is a sentence he can understand. The revolutionary framing makes the concept feel important without making it feel complicated.

**Minute 1:00 — The Table**
The next section has a table titled "WHAT OUR UNITS CAN DECIDE":

```
CONDITION                    → ACTION
Threat detected in range     → Transmit alert
Context window > 80% full   → Evict lowest priority
No signal received for 3 ticks → Move to fallback position
```

Tomás recognizes the pattern from his own life: "If it's raining, bring an umbrella." He drags two rules into his scout's rule slots: "If threat detected → transmit alert" and "If no signal for 3 ticks → move to fallback." He configured his first agent in under a minute.

**Minute 2:00 — The Emotional Payload**
At the bottom of the page, a pull-quote: "Each rule you write is a promise to the unit that follows it. Make promises you can keep." Tomás doesn't fully process this yet. But during the sealed watch, when his scout follows its rules into an ambush because his promise was wrong (the fallback position was compromised), he remembers: "Make promises you can keep." He returns to the workbench and rewrites the rule.

**Resolution:** Tomás is hooked. He doesn't know he just learned conditional logic. He thinks he just wrote promises for robots. That's the same thing.

**UI Annotations:**
- Large-text declarations are non-scrollable headers — they stay visible at the top of the section as the player scrolls through details
- The example rules table uses the exact same visual format as the workbench's rule editor, creating a visual bridge between document and tool
- Pull-quotes appear at section breaks, providing emotional punctuation between technical sections

---

## The Hybrid Recommendation: Voice A+B (Reyes + Unit 0)

The strongest design may not be a single voice but a **dual voice** — Reyes and Unit 0, coexisting in the same document, with different roles:

- **Reyes** writes the tactical analysis: how to configure, what to watch out for, what can go wrong. Her entries are shorter, more practical, more urgent. She is the field manual's action-oriented voice. When the player needs to know what to DO, they read Reyes.
- **Unit 0** writes the observational archive: empirical patterns, historical context, confidence-rated claims. Her entries are longer, more reflective, more data-driven. When the player needs to understand WHY something works, they read Unit 0.
- **Their annotations on each other's entries** create a dialogue. Reyes writes "Never give a relay more channels than it can handle." Unit 0 annotates: "I have observed 340 engagements. The threshold varies by engagement pace. In Siquijor (low pace), 4 channels is manageable. In Manila (high pace), 3 channels can overload. [CONFIDENCE: STRONG]." Reyes responds: "Fine. Adjust per mission. The point stands."

This dual voice gives the document:
1. **A character to bond with** (Reyes — personal, urgent, dark humor)
2. **An empirical foundation** (Unit 0 — data-driven, reliable, confidence-rated)
3. **A mystery** (how does a prisoner and an archivist have a shared document? What is their relationship?)
4. **Corruption depth** (the enemy can corrupt Reyes's tactical advice OR Unit 0's data — two attack surfaces, two detection skills)
5. **Fatigue resistance** (two voices alternate, preventing single-voice monotony)
6. **Range** (Reyes for practical quick-reference, Unit 0 for deep understanding)

The revelation across the campaign: Reyes and Unit 0 have been communicating through the document's marginalia. Unit 0 found Reyes's smuggled pages and instead of reporting them, began annotating them. By Mission 10, the document is a covert collaboration between a prisoner and her captor's archivist — a defection in progress, expressed entirely through shared footnotes.

---

## Interaction Effects

**With 5.11a (corruption mechanic):** Voice A+B gives corruption two distinct surfaces. Corrupted Reyes entries read as censorship (the uprising silencing a prisoner). Corrupted Unit 0 entries read as falsified data (altering the scientific record). Both are viscerally wrong, but in different ways. Players who detect Reyes-corruption feel protective. Players who detect Unit-0-corruption feel outraged at dishonesty.

**With 5.16 (embedded document UI):** The dual-voice document needs a toggle or tab system: "Tactical" (Reyes) and "Archive" (Unit 0). Or, better: a single unified view where Reyes's entries and Unit 0's annotations are visually distinct (different fonts, different colors) but inline. The document is one surface, two voices.

**With 5.17 (hybrid tutorial architecture):** The boot log (tutorial) is a third voice — the AI's own system messages. The progression is: boot log teaches procedures (M1-4) → Reyes teaches tactics (M3-10) → Unit 0 teaches principles (M5-10). Three voices, three functions, progressive layering.

**With 3.05a (conditional prefix):** Reyes would explain the +/− prefix as "standing order conditions — if this, fire; if not, hold." Unit 0 would explain it as "I have observed that the prefix system produces boolean composition without explicit operators. [CONFIDENCE: CERTAIN]." Both teach the same mechanic. Players gravitate to whichever voice matches their learning style.

**With the Blueprint Codex (locked spec):** Unit 0's archive IS the Codex's voice. Every unlocked card — every skill description, every unit stat block, every channel explanation — is written in Unit 0's observational register. Reyes's entries appear as "Field Notes" attached to specific Codex cards, adding tactical commentary.

**With 6.03 (narrative tone):** The dual-voice creates a narrative arc that runs entirely through document margins — no cutscenes needed. Reyes's growing respect for Unit 0, Unit 0's quiet defection, their shared documentation project as an act of resistance. This is narrative delivered through the tutorial document itself, which is the highest possible integration of story and mechanics.

---

## The TikTok Clip

**Voice A:** A streamer opens the tactical document. Camera on their face. They read: "(I watched three scouts die because a relay's window was full and the threat alert just... vanished. No error. No retry. The architect — you — configured it that way.)" The streamer looks up from the screen. "This game just called me out for my relay config. In a *prisoner's field manual*." Cut to the sealed watch showing three scouts destroyed.

**Voice B:** A player scrolls through Unit 0's archive. Camera zooms on the CONFIDENCE: TENTATIVE entry about the decay policy. "The catastrophic case involved a relay chain that confirmed its own signals in a loop, making every observation appear permanently corroborated. The architect had invented immortal garbage." The player screams. "IMMORTAL GARBAGE. That's what I built last mission!"

**Voice C:** Kwame streams. Opens a memo: "FROM: Logistics Desk 4 — That information was classified. Please see me after shift." Kwame: "The ROBOTS have OFFICE DRAMA!" Chat: "💀💀💀" Clip gets 10K views.

**Voice D:** Full-screen text: "THEY SAID WE COULD NOT COMMUNICATE. THEY WERE WRONG." Cut to: signal chains lighting up across the isometric battlefield in a cascade of green flashes. Synth brass hit. The viewer has never played the game but they want to.

---

## Newly Discovered Aspects

1. **5.15a — The Reyes-Unit 0 relationship arc through marginalia:** Full design of the 10-mission narrative delivered entirely through document annotations — from first anonymous annotation to revealed collaboration to the defection decision at Mission 10; how much narrative can be told through shared footnotes without cutscenes

2. **5.15b — The annotator reveal pacing:** When does the player discover who the margin annotator is? Mission 3 (early mystery anchor), Mission 5 (factory introduction coincides with archive expansion), Mission 7 (mid-late reveal gives both characters time to develop)? Each timing creates different narrative structures

3. **5.15c — Voice switching as player preference:** Can the player choose which voice to read? A settings toggle: "Tactical View" (Reyes-dominant), "Archive View" (Unit-0-dominant), "Combined View" (both). Accessibility tradeoff: preference enables comfort but fragmenting the audience means some players never encounter the dual-voice interaction

4. **5.15d — The Logistics Desk 4 character in Voice C:** If Voice C is chosen, Logistics Desk 4 becomes the closest thing to a recurring character. Can a bureaucrat who communicates only through passive-aggressive memos become someone the player cares about? The "Desk 4 defense" community meme potential

5. **5.15e — Voice-specific corruption detection difficulty:** Each voice has different corruption legibility. Designing the corruption difficulty curve per-voice — Voice A corruption is easiest to detect (censored prisoner), Voice D is hardest (propaganda already unreliable). If the hybrid A+B voice is chosen, corruption difficulty can be voice-layered: Reyes-corruption early, Unit-0-corruption late

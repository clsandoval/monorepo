# Onboarding: Physical Term Placement as Naming Mechanic — The Baba Is You Inspiration

**Aspect ID:** 5.00a-ii
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding
**Related aspects:** 5.00a (vocabulary pacing bottleneck), 5.00 (external-documentation anti-pattern), 5.01 (tutorial as puzzle), 5.02 (tutorial as narrative), 3.05 (rules language), 3.07 (rules UI), 5.00a-i (Mission 4 Wall), 1.09 (Into the Breach)

---

## The Core Idea

In Baba Is You, rules are physically present as pushable word tiles on the game board. "ROCK IS PUSH" isn't a menu option — it's three tile-objects arranged in a row. Push one out of alignment and the rule breaks. Push new tiles together and a new rule forms. The rules of the game are the game.

**The proposal for Robot Uprising:** When a new concept is introduced (e.g., "context window," "hook," "eviction"), the player doesn't just hear the name in a boot log. They physically drag the term label from the boot log panel and place it onto the corresponding workbench header or UI element. The concept becomes "real" — active, named, interactive — at the moment of placement. The naming is a physical ritual, not a passive notification.

This is the "mention vs. use" distinction made tangible. The boot log *mentions* "context window." The player *uses* the concept by placing the label onto the buffer panel. The panel was always there, doing its job. The name arrives when the player decides they understand what they're looking at.

---

## Five Design Variations

### Variation A: "The Label Maker"

**How it works:** During each mission's boot log sequence, new term labels appear as draggable amber tokens in the boot log sidebar. Each token shows the term name ("context window," "eviction priority," "hook") in monospace type. The workbench has unlabeled panels with dashed-outline header slots. The player drags the token from the boot log and drops it onto the matching panel. When placed correctly, the token snaps into position with a satisfying mechanical *click*, the panel header fills in, and the panel's full functionality unlocks.

**Matching logic:** Each token has exactly one correct destination. Incorrect drops bounce the token back to the sidebar with a soft rejection sound (dull *thud*, slight red flash on the token). The panel's existing behavior — which the player has already been using — is the clue. If the player has been watching the colored pips fill and empty on their units, they know which panel is "context window" even before the label exists.

**Visual treatment:** Unlabeled panels show `[???]` in their header slots with a pulsing dashed outline, inviting interaction. Tokens in the sidebar glow faintly amber. When the player hovers a token over a panel, the panel shows a brief tooltip preview: "This panel shows what each unit remembers." Correct placement triggers a 400ms lock-in animation: token slides into slot, edges crystallize from amber to cyan, a thin horizontal light-bar sweeps across the panel header, and the panel subtitle (e.g., "6 slots • Evicts oldest first") materializes letter by letter.

**Audio:** Pickup — soft magnetic *snick*. Hover-over-wrong — silence. Hover-over-correct — warm harmonic hum (recognition). Drop-correct — mechanical latch *click* followed by a rising two-note chime (C→E). Drop-wrong — dull bounce *thk*. All labels placed in a mission — brief fanfare chord (C major, 500ms).

### Variation B: "The Revealer"

**How it works:** Instead of discrete labels, the entire workbench starts obscured behind a frosted glass effect. The boot log narrates ("PERCEPTION ARRAY: ONLINE"), and a corresponding region of the workbench *clears* — the frost dissolves outward from a central point, revealing the panel underneath with its name already in place. The player doesn't drag anything. They tap/click the boot log line to "acknowledge" the subsystem, and the reveal happens.

**The physical element:** The player's click is the "activation" gesture. Not a drag, but a deliberate action — "I acknowledge this system." Fast players can click rapidly through the sequence. Slow players can pause and examine each revealed panel before proceeding. The boot log line dims after acknowledgment, making it clear which systems have been activated.

**Visual treatment:** Pre-reveal panels show ghostly silhouettes behind frosted glass — shapes are visible, text is not. The reveal animation is a circular wipe expanding from the cursor position, with particles of "frost" drifting off like ice crystals. Each revealed panel has a 200ms amber glow before settling to its normal color state.

**Why this is weaker:** No physical placement = no matching game. The player doesn't have to figure out which label goes where. The ritual is acknowledgment, not comprehension. It's a button press, not a puzzle.

### Variation C: "The Scrabble Board"

**How it works:** Drawing more directly from Baba Is You, the workbench's section headers are assembled from individual word tiles that the player drags from a tile tray. Not single-token labels but multi-word compositions. The player must construct "CONTEXT WINDOW" from separate "CONTEXT" and "WINDOW" tiles, or "EVICTION PRIORITY" from "EVICTION" and "PRIORITY."

**The Baba Is You parallel:** In Baba Is You, forming "ROCK IS PUSH" from three separate tiles teaches what the rule means through the act of assembly. Similarly, assembling "EVICTION PRIORITY" from two tiles teaches that eviction and priority are separate but linked concepts. Later missions could introduce tiles that combine in unexpected ways — "HOOK" + "CHANNEL" creates a different meaning than "HOOK" + "TRIGGER."

**Tile tray design:** A horizontal strip at the bottom of the boot log panel containing 6-8 word tiles per mission. Some tiles are distractors — real game vocabulary that doesn't apply to the current mission's panels. The player must not only know WHERE each label goes but WHICH words are relevant right now. Distractor tiles go grey after the mission completes (they'll be needed later).

**Visual treatment:** Tiles are chunky 3D-ish blocks (2px shadow, beveled edges) in amber monospace on dark backgrounds. They stack slightly overlapping in the tray, like physical tile game pieces. Dragging a tile lifts it above the tray with a parallax shadow. Tile placement slots on workbench headers show the exact dimensions expected — three slots for a three-word header. Completed headers lock with a steel-band animation across the top.

**Audio:** Each tile dragged plays a light wooden *clack* (like Scrabble tiles). Placement — deeper wooden *clunk*. Complete header — metallic *clasp* + brief ambient hum indicating the panel is now "live."

### Variation D: "The Naming Moment"

**How it works:** The player DOESN'T physically place labels at all during the boot log. Instead, the boot log introduces concepts by behavior, not by name: "That column of colored pips? That's your unit's working memory. Watch what happens when it fills up." The player uses the panel, experiments, watches results. Then — only after demonstrating comprehension (e.g., correctly removing noise from a buffer, or observing an eviction event) — the system prompts: "This is called a **context window**. Name it?"

A text input appears over the panel header. The player can:
1. Type the suggested name ("context window") — instant confirmation
2. Type their own name ("memory box," "brain slots") — accepted, displayed as player's name with official name in tooltip
3. Skip — system auto-labels after 10 seconds

**The physical element:** The act of typing (or confirming) the name is the ritual. Custom names create ownership — "my naming" of a concept I already understand. The game vocabulary becomes the player's vocabulary.

**Comprehension gate:** The naming prompt appears only after a behavioral trigger (successful filter, observed overload, manually reordered priority). This guarantees the player has experienced the concept before naming it. The name arrives at the "tip of the tongue" moment — when the player is thinking "what IS this thing?" and the answer appears.

**Visual treatment:** The text input appears as a blinking amber cursor in the panel header slot. Suggested name appears as ghost text (50% opacity). Typing replaces the ghost. On confirm (Enter), the text solidifies with a typewriter stamp animation — each letter punches into the header with a micro-delay, like an impact printer. If the player typed their own name, the official name appears as a subtle subscript below (8pt, 40% opacity).

**Audio:** Text input appears — typewriter carriage return *ding*. Each keystroke — soft key click. Confirm — stamp *thunk* with rising tone. Custom name confirm — same *thunk* plus a brief unique chime indicating "you named this."

### Variation E: "The Living Dictionary"

**How it works:** Terms exist on the battlefield itself, not just the workbench. When a concept first manifests in gameplay — the first time a context window overflows, the first time a hook fires, the first time a signal propagates — a floating label appears above the event on the battlefield. The label is a draggable object that the player grabs from the battlefield and deposits into a "Dictionary" panel on the workbench.

**The spatial connection:** The label originates at the point of the event. "CONTEXT OVERLOAD" appears above the stunned unit. "SIGNAL LATENCY" appears between two units that just experienced delayed communication. The player sees the concept happen, sees it named in-place, then physically relocates the name to their reference shelf.

**Visual treatment:** Floating labels appear as holographic amber text rotating slowly above the event location. A thin golden tether connects the label to the event source. When the player grabs the label, the tether stretches and thins, eventually snapping with a small spark when the label reaches the workbench Dictionary panel. Placed labels stack in the Dictionary as a growing collection — a visible record of concepts encountered.

**Audio:** Label appears — soft ascending chime + quiet electric crackle. Tether stretch — rubber-band-like tension. Tether snap — spark *zzt*. Dictionary placement — book-page-flip *fwip*.

---

## Cross-Variation Comparison Matrix

| Dimension | A: Label Maker | B: Revealer | C: Scrabble Board | D: Naming Moment | E: Living Dictionary |
|-----------|---------------|-------------|-------------------|------------------|---------------------|
| Player agency | ★★★★ | ★★ | ★★★★★ | ★★★★★ | ★★★★ |
| Cognitive load | ★★ (low) | ★ (minimal) | ★★★★ (high) | ★★★ (medium) | ★★★ (medium) |
| Comprehension gate | Matching puzzle | None | Word assembly puzzle | Behavioral gate | Spatial event recognition |
| Time cost per term | 3-8 seconds | 1-2 seconds | 8-20 seconds | 5-30 seconds | 5-15 seconds |
| Controller/touch friendly | ★★★★ | ★★★★★ | ★★★ | ★★ (typing) | ★★★ |
| Accessibility (screen reader) | ★★★ | ★★★★ | ★★ | ★★★★ | ★★ (spatial) |
| Emotional weight | Medium | Low | Medium-high | Very high | High |
| Distraction risk | Low | None | Medium (wrong combos) | Medium (naming tangent) | High (battlefield focus split) |
| Replayability cost | Tedious on replay | Fine | Tedious | Fine (auto-skip) | Tedious |
| Baba Is You resemblance | ★★★ | ★ | ★★★★★ | ★★ | ★★★ |

---

## Recommended Hybrid: "The Experiential Stamp"

Combine Variation D's comprehension gate with Variation A's physical placement:

1. **Experience first.** The player uses the unnamed panel, sees behavior, builds intuition.
2. **Comprehension trigger fires.** After a behavioral milestone (first successful eviction, first hook delivery), the boot log prints: `"SUBSYSTEM RECOGNIZED: ████████. Label available."`
3. **Physical placement.** An amber token materializes in the boot log sidebar with the concept name. The player drags it to the panel header.
4. **Lock-in.** The label snaps into place, the panel lights up with its full name, and functionality stays identical — but now the player has the WORD for what they already DO.

**Why this hybrid:**
- The comprehension gate (D) ensures the name arrives after understanding, not before
- The physical drag (A) creates the ritual moment — tactile, satisfying, memorable
- The boot log integration respects the locked diegetic narrative (the AI is documenting its own systems as it recognizes them)
- Skip path: if the player doesn't drag within 30 seconds, the label auto-places with a quieter animation (no fanfare, just a soft slide into position)

**Replay handling:** On subsequent playthroughs, labels are pre-placed. The panels start fully labeled. A "relabel" option in settings lets veterans re-experience the naming sequence if desired.

---

## Player Journeys

### Journey: Sofia, 15, first strategy game ever (plays Roblox and Baba Is You)

**Context:** Mission 1: Wake. Sofia has never played anything like this. She recognizes the grid aesthetic from Into the Breach screenshots her brother shared. She's played 200+ hours of Baba Is You and immediately notices the word tiles.

**Minute 0:00 — Boot Sequence**
The screen is dark. Teal monospace text appears: `INITIALIZING... PERCEPTION ARRAY: ONLINE.` To the right, the workbench panels are visible but dimmed, headers showing `[???]` with pulsing dashed outlines. Below the boot log, a tray holds four amber tiles: `CONTEXT WINDOW`, `SLOT`, `OBSERVATION`, `NOISE`. Sofia's eyes widen — she recognizes draggable text objects.

**Minute 0:15 — First Drag**
The boot log says: `"Something is already watching. Six slots of memory. What fills them?"` Sofia grabs `OBSERVATION` — the magnetic *snick* triggers her Baba Is You muscle memory. She hovers over the grid panel. Nothing happens. She hovers over the unit inspector panel where colored pips are slowly filling. A tooltip appears: "This shows what enters a unit's memory." She drops `OBSERVATION` on the inspector's item header. *Click.* The pip entries now show the label "Observation" next to each colored square. She grins. "Oh, like ROCK IS PUSH but for naming things."

**Minute 0:40 — Wrong Drop**
She grabs `NOISE` and tries to drop it on the buffer panel header. Soft *thud.* The token bounces back. She pauses. "Noise isn't a panel... noise is a TYPE of thing." She reads the boot log: `"Not everything in memory matters. Some entries are NOISE."` She realizes `NOISE` labels a category of observation, not a workbench section. She re-examines the buffer contents — some pips are dimmer than others. She drops `NOISE` on the filter sidebar where dim entries are displayed separately. *Click.* The filter section now reads "Noise Filter" with the dim pips highlighted.

**Minute 1:10 — Assembly Complete**
She places `CONTEXT WINDOW` on the main buffer display (the panel she's been staring at for a minute), and `SLOT` appears as a label on each individual pip within the context window panel. Four tokens placed. The brief C-major fanfare plays. The workbench panels are fully labeled now. Boot log: `"All subsystems documented. You see what you're working with."` Sofia screenshots the labeled workbench. She texts her Baba Is You speedrun group: "this game literally has word tiles"

**Minute 1:30 — Gameplay Begins**
The unit on the grid has 6 context window slots, 4 filled with observations (two bright, two dim). The filter panel shows dim entries marked as noise. Sofia drags the dim entries out — dissolve animation, ascending tone. She already knows the mechanic from the tutorial-as-puzzle framework, but now she has NAMES for what she's doing. "I'm removing NOISE from the CONTEXT WINDOW." The vocabulary has anchored.

**UI Annotations:**
- Boot log sidebar: 200px wide, amber text on dark background, tokens below in horizontal tray
- Token: 120×28px amber block, monospace bold text, 2px bevel, subtle glow on hover
- Panel header slot: matching width, dashed outline pulses at 0.5Hz, tooltip appears on 500ms hover
- Correct drop: 400ms lock-in (slide→crystallize→light-bar sweep→subtitle materialize)
- Wrong drop: 200ms bounce-back with 80ms red flash on token border

---

### Journey: Marcus, 42, IT infrastructure manager, plays Factorio and Civilization

**Context:** Mission 4: Chorus. Marcus has breezed through Missions 1-3. He's labeled all 12 terms across three missions without a wrong drop. He treats the label placement as a satisfying organizational task — like labeling server rack positions. Mission 4 introduces 6 new terms: `RULE`, `CONDITION`, `ACTION`, `PRIORITY`, `PERCEPTION RADIUS`, `SKILL`.

**Minute 0:00 — The Six-Token Tray**
Marcus opens Mission 4. The boot log begins its subsystem initialization sequence. The token tray fills with SIX amber tiles — the most he's seen. He notes the density immediately. "Six new terms. This is the big mission." The workbench has new panels: a rules editor (currently showing `[???]` header and blank ordered list), a perception overlay toggle (unlabeled), and a skills sidebar (icons visible but unnamed).

**Minute 0:20 — The Frozen Striker**
His pre-placed striker unit sits on the grid, perception cone visible but not labeled. It sees three enemies. Its context window is packed with observations. But it does nothing. No action fires. Marcus has seen buffer overload before, but this isn't overload — the unit is simply... motionless. "It sees everything but has no rules." He clicks the empty rules panel. Nothing to configure yet.

**Minute 0:45 — Boot Log Subsystem Sequence**
The boot log prints: `"SKILL MODULE: ONLINE. Your units have capabilities. They cannot yet choose when to use them."` The skills sidebar lights up — he can see "engage" and "breach" as icons. He grabs the `SKILL` token and drops it on the sidebar header. *Click.* Now labeled "Skills." He sees the engage skill but can't activate it manually.

**Minute 1:00 — The Rules Aha**
Boot log: `"CONDITIONAL LOGIC: ONLINE. If something is true, then something happens."` The rules panel activates with one empty slot. Marcus immediately grabs `CONDITION` and `ACTION` — he hovers over the rules panel. Two header sub-slots appear: the left half of a rule strip (`WHEN ___`) and the right half (`DO ___`). He drops `CONDITION` on the left. *Click.* Drops `ACTION` on the right. *Click.* The empty rule strip now reads: `WHEN [condition] → DO [action]`. "Oh, this is just IFTTT. When enemy adjacent, then engage." He configures the rule. His striker springs to life — sees adjacent enemy, fires engage, eliminates it.

**Minute 1:30 — Priority Discovery**
Boot log: `"RULE COMPILER: ONLINE. When multiple rules match, one must fire first."` A second rule slot appears. Marcus adds a second rule: `WHEN noise detected → DO evade`. Both rules match simultaneously — an enemy is adjacent AND the context window has noise. The striker evades instead of engaging. "Wrong priority." He grabs the `PRIORITY` token and drops it on the numbered slot indicators (1, 2) beside each rule. *Click.* The numbers glow — draggable. He swaps rule 1 and rule 2. Now engage fires first. Kill. He nods. "This is just my runbook priority system."

**Minute 2:00 — Perception Placement**
Boot log: `"PERCEPTION ARRAY: CALIBRATED."` The perception overlay toggle gains a `[???]` label. Marcus grabs `PERCEPTION RADIUS` and drops it. *Click.* The overlay now shows the striker's perception cone with a radius value (2 tiles). He adjusts it and sees the cone shrink/expand. He connects this to Mission 1's observation system — "perception radius determines what ENTERS the context window."

**Minute 2:20 — The RULE Capstone**
One token left: `RULE`. The rules panel has been functional for 80 seconds, but its header still says `[???]`. Marcus grabs the `RULE` token and places it on the panel header. *Click.* The full label appears: "Rules." Boot log: `"A rule is a condition-action pair. Priority determines which fires first. You've already built two."` The naming is retroactive — the concept has been in use for over a minute before it gets its official name. Marcus appreciates the sequencing. "They made me use it before they named it. Smart."

**Minute 2:30 — The Fanfare**
All six tokens placed. The C-major chord resolves with an extra sustain. The workbench is fully labeled for Mission 4. Marcus takes 5 seconds to admire the layout — Skills, Rules (with CONDITION→ACTION strips and PRIORITY numbers), and PERCEPTION RADIUS toggle. Everything he needs to build intelligent units. "Alright, let's make this thing think."

**UI Annotations:**
- Six-token tray: tokens arranged 3×2 in sidebar, slightly smaller font to fit
- Rules panel sub-slots: CONDITION and ACTION drop zones appear as left/right halves of the rule strip
- PRIORITY drop zone: appears on the numbered indicators (1, 2, ...) beside each rule
- RULE token placement: arrives AFTER the component terms, retroactive labeling of the panel
- Six-token fanfare: 200ms longer sustain than four-token fanfare, slightly fuller chord

---

### Journey: Kai, 11, plays Minecraft and Fortnite, mild dyslexia

**Context:** Mission 2: Focus. Kai got through Mission 1 mostly by copying what the on-screen hints suggested. He placed `CONTEXT WINDOW` and `OBSERVATION` with some trial-and-error bouncing. He's back for Mission 2 with four new tokens: `BUFFER SIZE`, `CONFIDENCE`, `STALENESS`, `EVICTION`.

**Minute 0:00 — Token Anxiety**
Kai sees four new amber tiles. He can read them but the words are long. "Ev-ict-ion. What's that." The boot log is printing text but he's not reading it carefully — he's looking at the grid. His unit has a context window (he remembers that label from last mission) with 6 slots. Four are filled. Two are bright, two are faded.

**Minute 0:15 — Icon Discovery**
Each token has a small icon beside the text: `BUFFER SIZE` has a ruler icon, `CONFIDENCE` has a bright-to-dim gradient bar, `STALENESS` has a clock with cobwebs, `EVICTION` has an arrow pointing out of a box. Kai ignores the text and focuses on the icons. He grabs the ruler icon token (`BUFFER SIZE`) and looks for a ruler-like thing on the workbench. The context window panel has a small "6/6" counter in its corner. He drops the token on the counter. *Click.* The counter now reads "Buffer Size: 6/6." He didn't read the word — the icon matched the visual element.

**Minute 0:30 — The Faded Observation**
Kai notices two observations in the context window are fading. One is almost invisible. He grabs the clock-with-cobwebs token (`STALENESS`). He hovers over the fading observation. A tooltip appears: "This observation arrived 4 ticks ago." He drops the token on the observation's timestamp indicator. *Click.* The timestamp area now shows "Staleness: 4 ticks" with a fading gradient overlay matching the icon. "Oh, old stuff goes stale. Like food in Minecraft."

**Minute 0:50 — The Bounce**
He grabs `CONFIDENCE` (bright-to-dim gradient icon) and tries to drop it on the same timestamp area. *Thud.* Bounce. He tries the observation's brightness indicator instead. *Click.* The brightness value now reads "Confidence: High" for the bright observation and "Confidence: Low" for the dim one. "Wait — confidence and staleness are DIFFERENT?" He scrubs back in his mind. Bright = confident (recently verified). Faded = stale (old data). A thing can be bright but old, or dim but new. He's just learned that information quality has two axes, not one — through the physical act of trying to place two labels on the same slot and failing.

**Minute 1:10 — Eviction**
The context window fills to 6/6. A new observation arrives. The oldest, stalest entry — which is also the lowest confidence — pops out with a small dissolve animation. The `EVICTION` token pulses amber in the tray. Kai grabs it and drops it on the eviction configuration panel (which just appeared when the first eviction happened). *Click.* "Eviction Policy: Oldest First." The panel shows a dropdown: Oldest First, Lowest Confidence First, Manual. Kai selects "Lowest Confidence First" and watches the NEXT eviction remove a dim entry instead of an old one. He's just configured a cache eviction policy through physical interaction, at age 11, without reading a single paragraph of explanation.

**Minute 1:30 — Session End**
All four tokens placed. He screenshots the labeled workbench for his Minecraft friend group chat. "this game lets u name ur own stuff like baba but for robots"

**UI Annotations:**
- Icon-augmented tokens: 16×16 pixel icon left of text, high contrast, recognizable at 50% zoom
- Timestamp indicator: subtle clock icon at bottom-right of each observation entry in context window
- Brightness indicator: vertical gradient bar at left edge of each observation entry
- Eviction config panel: materializes only AFTER first eviction event occurs (comprehension gate)
- Tooltip for dyslexia: larger font (14pt vs. 11pt default), 800ms hover delay, icon + text

---

### Journey: Dr. Amara, 38, ML researcher, blind in one eye, uses screen magnifier

**Context:** Mission 3: Relay. Amara has been impressed by the accessibility — panels at 150% zoom, high-contrast mode enabled. She uses keyboard navigation exclusively (Tab between panels, Enter to interact). Mission 3 introduces: `HOOK`, `CHANNEL`, `SIGNAL`, `LATENCY`. She plays with screen reader active.

**Minute 0:00 — Screen Reader Token Announcement**
Screen reader: "Four new tokens available. Token one: Hook. Token two: Channel. Token three: Signal. Token four: Latency. Press Tab to select token." Amara Tabs to the first token. Screen reader: "Hook token. Drag to matching workbench panel. Press Enter to pick up." She presses Enter. Screen reader: "Token Hook picked up. Use arrow keys to navigate panels. Press Enter to drop."

**Minute 0:15 — Keyboard Placement**
Amara uses arrow keys to navigate panel headers. On the hook configuration panel: Screen reader: "Panel: unlabeled. Contains reactive trigger configuration with channel name input and event selector. Drop token here? Press Enter to confirm." She presses Enter. Screen reader: "Token Hook placed. Panel now labeled: Hooks." The placement chime plays. She doesn't need to see the animation — the chime is the confirmation.

**Minute 0:30 — Incorrect Drop Correction**
She picks up `SIGNAL` and navigates to the channel map panel. Screen reader: "Panel: unlabeled. Contains channel topology overview. Drop token here?" She presses Enter. Screen reader: "Token rejected. This panel shows channel routing, not individual signal data." The rejection *thud* plays. She navigates to the message inspector sub-panel within the context window. Screen reader: "Sub-panel: unlabeled. Contains individual message entries with source, content, and age." She drops. *Click.* Screen reader: "Token Signal placed. Sub-panel now labeled: Signals." She nods — signals are the individual messages, not the channels they travel on.

**Minute 1:00 — Latency as Revelation**
She places `CHANNEL` on the channel map panel and `LATENCY` on the delivery timing indicator. The screen reader describes: "Token Latency placed. Indicator now labeled: Signal Latency. Current value: 2 ticks from Scout to Relay." Amara, who builds distributed ML training pipelines professionally, murmurs: "Signal latency in a game. This is just network hop count." She's mapped the game concept to her professional vocabulary through the placement action. The physical act of finding the right drop target forced her to examine what the indicator measures — not just read a definition.

**Minute 1:20 — Reflection**
Screen reader: "All tokens placed. Boot log: All subsystems documented." Amara pauses to Tab through the now-labeled panels: Hooks, Channels, Signals, Signal Latency. Each panel now has a full ARIA label including the name she placed plus a description. "The labeling mechanic works perfectly with screen reader. Placing the name is just Tab-Enter-Arrow-Enter. Same cognitive load as sighted play — I still have to figure out which label goes where."

**UI Annotations:**
- Screen reader token pickup: Enter key on focused token, announces "picked up" state
- Arrow key panel navigation: moves between droppable panel header slots
- Rejection: screen reader announces WHY the drop failed (semantic mismatch description)
- Correct placement: screen reader announces new panel label + brief description
- Keyboard-only time cost: ~5 seconds per token (Tab→Enter→Arrow→Arrow→Enter) vs. ~3 seconds for drag

---

## Interaction Effects

### With Locked Boot Log Narrative (5.02)
The boot log is the AI documenting its own systems as they come online. Physical label placement is the player completing that documentation. The AI recognizes a subsystem → the player names it. This deepens the "you are the AI" diegetic framing: you literally write your own documentation.

### With Vocabulary Pacing (5.00a)
The physical placement creates a natural speed limit — 3-8 seconds per term. At Mission 4's six terms, the placement ritual alone takes 20-50 seconds. This prevents vocabulary dump syndrome where terms flash by too quickly. The player MUST engage with each term individually.

### With Tutorial-as-Puzzle (5.01)
Label placement is itself a mini-puzzle. The matching game (which label → which panel) tests comprehension BEFORE gameplay even begins. In Mission 4, the six-token puzzle is genuinely challenging — CONDITION and ACTION go to sub-slots of the rules panel, not separate panels. This is Baba Is You's "aha" moment applied to game vocabulary.

### With Blueprint Codex (Locked)
Placed labels could populate Codex entries. Each label placement unlocks the corresponding card in the Codex. The Codex becomes a collection of concepts the player has physically placed — a museum of their own vocabulary.

### With Controller Input (6.06)
On gamepad: D-pad to cycle tokens in sidebar, A to pick up, left stick to navigate panels, A to drop. The radial menu could present tokens in a wheel for faster selection. On DualSense: the trigger resistance increases as you hover over the correct panel (haptic guidance without explicit reveal).

### With Mobile/Touch (6.07)
Touch-drag is the most natural platform for this mechanic. Tokens in the sidebar are large touch targets (48×48pt minimum). Long-press to pick up, drag with finger, release to drop. Haptic feedback on correct/incorrect. The mechanic feels like placing refrigerator magnets on a whiteboard — the most tactile version of all platforms.

### With Replay (Replayability)
On subsequent playthroughs, labels are pre-placed. The naming ritual only happens once per concept per save file. This prevents tedium on replay while preserving the first-encounter magic. A "fresh naming" toggle in settings re-enables the ritual for players who want to re-experience it.

### With Rules Language (3.05)
If Variation C (Scrabble Board) is adopted, the naming mechanic directly parallels the rules construction UI (Sentence Builder / Option D from 3.05). Players who learn to assemble names from word tiles will naturally transition to assembling rules from condition/action tiles. The UI metaphor is consistent: "arrange tiles to create meaning."

### With Accessibility (6.08)
Variation D (Naming Moment) has the best accessibility profile — typing works universally with screen readers, and the comprehension gate ensures the player isn't just performing a rote matching task. However, the typing input is challenging on controllers. The recommended hybrid (D's gate + A's drag) preserves the comprehension requirement while using the more accessible drag-and-drop interaction.

---

## Strengths

1. **Embodied cognition.** Physical manipulation creates stronger memory traces than passive reading. The motor act of dragging "CONTEXT WINDOW" to the buffer panel encodes the concept through an additional sensory channel. Research on embodied learning (Barsalou, 2008) supports that motor engagement during concept acquisition improves retention.

2. **Comprehension verification.** The matching puzzle serves as a soft test. A player who doesn't understand what the context window IS will struggle to place the label correctly. The wrong-drop bounce gently reveals the gap without punishing.

3. **Pacing control.** The player controls the speed. Fast players blitz through in 10 seconds. Slow players take 2 minutes, reading tooltips, examining panels. The system adapts to the player without difficulty settings.

4. **Diegetic consistency.** The AI documenting its own systems + the player naming those systems = unified narrative. No fourth-wall break. No "here's a tutorial popup." The naming IS the story.

5. **The Baba Is You hook.** Players who recognize the word-tile aesthetic immediately understand the mechanic. This creates a positive association for puzzle game veterans and generates social sharing ("this game has Baba Is You naming").

---

## Weaknesses

1. **Replay tedium.** Even with auto-skip after 30 seconds, veterans may find the naming ritual annoying on second playthroughs. Pre-placed labels on replay mitigate this, but the tension between "magical first encounter" and "tedious repeat" is inherent.

2. **Localization complexity.** Term labels in English may be single words ("HOOK") but multi-word in German ("AUSLÖSER-HAKEN") or Japanese ("フックトリガー"). Token sizing, tray layout, and drop target dimensions must accommodate variable text length across 10+ locales. Interaction with 4.69e-i-a-1-a (text expansion budgets).

3. **Accessibility ceiling.** Screen reader users can complete the mechanic (see Journey 4) but miss the spatial "aha" of seeing the label snap into the right visual context. The matching puzzle is solvable via semantic description alone, but the sensory satisfaction is diminished.

4. **False comprehension.** A player who doesn't understand the concept can still place the label by process of elimination. With 4 tokens and 4 slots, the last placement is always trivially correct. Mitigation: add 1-2 distractor tokens that don't belong to any panel (they go to a "for later" shelf).

5. **Interaction with fast-track (5.01e).** Expert players who demonstrate instant comprehension in tutorial puzzles still have to go through the labeling ritual. The auto-skip timer (30 seconds) may feel too long for someone who knows exactly what everything is. Shorter timer (10 seconds) for detected experts.

---

## Comparable Games & Media

### Baba Is You — Direct Inspiration
Rules are pushable tile objects. "ROCK IS PUSH" exists as three physical tiles. Break the alignment, break the rule. The key lesson: **making abstract rules into physical objects creates understanding through manipulation.** Robot Uprising applies this to vocabulary rather than rules — the concepts are already functioning; the name is what becomes physical.

### TUNIC — The Manual as Discovery Object
TUNIC's in-game instruction manual has pages scattered throughout the world. Finding a page reveals mechanics you may have already been using. The manual doesn't teach you HOW to play — it names what you're already doing. Robot Uprising's label placement is the same pattern: experience first, name second.

### Inscryption — Physical Card Manipulation
Cards are physical objects that can be destroyed, combined, and physically moved. The physicality creates emotional weight — burning a card MATTERS because you performed a physical action. Similarly, placing a label creates ownership of the concept.

### The Witness — Environmental Teaching
The Witness never uses text to explain puzzle rules. You learn by doing. Robot Uprising's comprehension gate (Variation D / recommended hybrid) echoes this — the player must demonstrate understanding through action before the name is offered.

### Montessori Materials — Educational Parallel
Montessori education uses physical manipulatives (wooden letters, counting beads, puzzle maps) to teach abstract concepts through touch. Children form words by arranging physical letter tiles — the motor act encodes the spelling. Robot Uprising's label placement is digital Montessori for game vocabulary.

---

## Sensory Summary

**What it looks like:** Amber word-tokens glow softly in a sidebar tray, like physical letter tiles backlit by warm light. Workbench panel headers pulse with dashed outlines, empty but inviting. When a token is dragged, it lifts with a subtle shadow, hovering above the UI surface. On correct placement, the token slides into its slot with crystallizing edges — amber shifting to cyan as the label locks, a thin horizontal light-bar sweeping across the header like a scanner confirming a barcode. The panel's subtitle materializes letter by letter in 11pt monospace beneath the new name.

**What it sounds like:** Picking up a token — a soft magnetic *snick*, like pulling a fridge magnet off metal. Hovering over the correct panel — a warm harmonic hum that rises in pitch the closer the cursor gets to the drop zone. Correct drop — a mechanical latch *click* followed by a two-note ascending chime (C→E, clean sine wave). Wrong drop — a dull, flat *thud* with no resonance. All tokens placed — a brief C-major chord that sustains for 500ms, with a subtle reverb tail that fades into the mission's ambient soundscape.

**What it feels like:** On DualSense — light haptic buzz when picking up a token, increasingly intense pulse when hovering over correct panel, sharp satisfying *clack* on placement. On mobile — standard haptic tap on pickup, longer buzz on correct hover, double-tap on lock. On keyboard — no haptics, but the chime does the work.

**The TikTok clip:** Close-up of a phone screen. Player's thumb drags "CONTEXT WINDOW" across the workbench. It snaps into the buffer panel header with a visible crystallize animation and audible *click-chime*. Cut to: the same player 30 minutes later, dragging "EVICTION PRIORITY" into the filter settings with confident speed. Text overlay: "this game taught me cache invalidation by making me label my own brain." 12 seconds. 4M views.

---

## Discovered Aspects

- **5.00a-ix — Distractor tokens as comprehension test:** adding 1-2 word tiles per mission that DON'T match any panel, requiring the player to identify them as "not yet relevant" and shelf them; distractor tokens as false-match avoidance training; interaction with vocabulary density curve (5.04b)
- **5.00a-x — Label persistence across sessions:** do placed labels survive a game restart? If a player quits mid-labeling, which tokens are placed and which are still in the tray? Save-state design for the partially-labeled workbench; interaction with session resume (5.20a)
- **5.00a-xi — Community label sharing:** if Variation D allows custom names, can players share their naming schemes? "Sofia's naming pack" that renames context window to "memory box" and eviction to "brain cleanup"; custom vocabulary as community artifact; interaction with config sharing (5.20e, 7.03)
- **5.00a-xii — Label removal as advanced mechanic:** can experienced players REMOVE labels to return to the unnamed state? Stripping names to see the raw system without vocabulary framing; "beginner's mind" as a deliberate diagnostic technique; interaction with the "frozen striker" diagnostic template (5.00a-vi)
- **5.00a-xiii — Multi-language simultaneous labels:** a toggle showing both the player's language AND English (or another language) on panel headers simultaneously; vocabulary learning as a secondary benefit for non-English-speaking players studying CS terminology; interaction with localization (6.03d) and educational use (6.11d-v-iv CS Mode overlay)

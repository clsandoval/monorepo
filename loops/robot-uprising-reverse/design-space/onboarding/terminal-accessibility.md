# 5.16e — Terminal Accessibility: Screen Reader Navigation, Keyboard-Only Operation, High-Contrast Mode, Reduced-Motion Scan-Line Removal, Audio Descriptions of Micro-Scenarios

**Aspect ID:** 5.16e
**Wave:** 5 (Onboarding & Campaign)
**Category:** Onboarding / Accessibility crossover
**Related aspects:** 5.16 (embedded document reference UI — Model D CRT Terminal), 5.16a (terminal content authoring pipeline), 5.16b (terminal in Inspector mode — tick-state-aware reference), 5.16d (terminal progressive disclosure across campaign), 6.10d (corruption audio accessibility — ensuring corruption detection is never audio-gated), 5.04c (subsystem online micro-celebration — kulintang accessibility), 5.00a-ii (physical term placement naming mechanic — screen reader keyboard workflow), 8.09 (diagnostic layer as teaching mechanic)

---

## The Problem

The terminal is Robot Uprising's primary reference system: a three-column CRT-styled interface with a category list on the left, entries in the center, and a detail/related panel on the right. It renders in charcoal-on-amber monospace with animated scan lines drifting vertically, phosphor glow bleeding around characters, and subtle flicker that sells the "decommissioned military equipment" fiction. In Inspector mode (5.16b), the terminal gains a tick-state-aware Grounding Strip and amber Tick Marginalia that update as the player scrubs the replay timeline.

This aesthetic is load-bearing. The CRT fiction communicates that the player is operating decommissioned hardware, that information is being accessed through a legacy system, that the knowledge itself has a physical medium. The scan lines, the glow, the monospace font, the amber-on-charcoal palette — these are not decorative. They establish the terminal as a diegetic object in the world.

The problem: this diegetic object is hostile to assistive technology on five fronts simultaneously.

**Screen readers** encounter a three-column layout with no semantic structure — the CRT aesthetic is rendered as styled divs, not as landmarks or headings. The reading order (left column categories, center column entry, right column related terms) is visually obvious but programmatically invisible. Focus management is undefined: when the player selects a category, where does focus go? When Tick Marginalia updates on scrub, does the screen reader announce it? When micro-scenarios play their embedded animations, what does the screen reader convey?

**Keyboard-only users** face a layout designed around mouse clicks. The three columns invite cursor-based navigation — click a category, click an entry, click a related term. Tab order through three columns creates an N-shaped traversal that fights the left-to-right-then-down reading flow. Arrow key navigation within columns needs to coexist with arrow key navigation in the Inspector timeline scrubber.

**Motion-sensitive users** encounter constant animation. The scan lines drift at 0.5px/frame, the phosphor glow pulses at 2Hz, text characters occasionally "jitter" on render, and the Grounding Strip in Inspector mode updates with a 200ms amber flash on every scrub tick. For users with vestibular disorders, photosensitive epilepsy, or migraine triggers, the terminal is a sustained source of discomfort.

**Low-vision users** face an intentionally low-contrast palette. Amber text on charcoal (#D4A017 on #2B2B2B) achieves approximately 4.8:1 contrast ratio — barely above WCAG AA's 4.5:1 minimum for normal text and below the 7:1 AAA threshold. The phosphor glow effect softens character edges further, reducing effective contrast. At 200% zoom, the three-column layout collapses unpredictably.

**Deaf and hard-of-hearing users** cannot access micro-scenario audio descriptions. Each terminal entry includes an embedded micro-scenario — a brief animated vignette showing the mechanic in action. These vignettes use sound effects (buffer insertion clicks, eviction whooshes, hook chain chimes) as primary information carriers. A deaf player watching the eviction micro-scenario sees colored blocks moving but misses the severity-indicating audio that distinguishes a routine eviction from a critical one.

The design challenge is not "add accessibility." It is: how does the terminal remain a diegetic CRT artifact — an object that belongs in Robot Uprising's world — while being fully operable by every player, in every modality, without degrading the information density that makes the terminal useful?

---

## The Mechanic: Parallel-Fidelity Accessibility Layers

### Screen Reader Architecture: "The Invisible Wireframe"

The terminal's visual three-column CRT layout is a presentation layer over a semantic document structure. The underlying HTML follows ARIA landmark patterns that map the terminal's spatial layout into a navigable document tree.

**Landmark structure:**

```
<nav aria-label="Terminal categories">        ← Left column
  <ul role="listbox" aria-activedescendant>
    <li role="option">Context Window</li>
    <li role="option">Eviction</li>
    ...
  </ul>
</nav>

<main aria-label="Terminal entry" aria-live="polite">  ← Center column
  <h2>Eviction</h2>
  <section aria-label="Definition">...</section>
  <section aria-label="Micro-scenario" role="figure"
           aria-describedby="eviction-audio-desc">
    <div id="eviction-audio-desc">...</div>
  </section>
  <section aria-label="Tick marginalia"
           aria-live="assertive" aria-atomic="true">
    <!-- Inspector mode only -->
  </section>
</main>

<aside aria-label="Related terms">            ← Right column
  <ul role="list">
    <li><a href>Compress</a></li>
    <li><a href>Hook chain</a></li>
  </ul>
</aside>
```

**Focus management protocol.** When a player selects a category in the left column, focus moves to the first entry in that category within the center column. The screen reader announces: "Eviction. Definition: [first sentence]. Press Tab for micro-scenario, press Right Arrow for related terms." This announcement pattern — name, then preview, then navigation hint — is borrowed from WCAG 2.1 AA's "focus visible" and "consistent navigation" success criteria.

**Tick Marginalia announcements.** In Inspector mode, the Grounding Strip and Tick Marginalia are wrapped in `aria-live="assertive"` regions. When the player scrubs the timeline, the screen reader does not announce every intermediate tick — it debounces, waiting 500ms after the last scrub input before announcing the new state. The announcement is concise: "Tick 22. RELAY-C. Buffer 11 of 12. Eviction count: 3." Full marginalia text is available by pressing Enter on the marginalia section.

**Micro-scenario audio descriptions.** Each micro-scenario has a hidden `aria-describedby` text block that narrates the vignette in plain language. For the eviction micro-scenario: "A buffer with six slots, all occupied. A new signal arrives at the left edge. The oldest signal in slot 1 glows amber, slides out to the right, and dissolves. The new signal slides into the vacated slot. The buffer is full again." These descriptions are authored as part of the content pipeline (5.16a) and are mandatory for every entry — no entry ships without its audio description text.

### Keyboard Navigation: "The Grid Protocol"

The terminal's three columns form a logical grid navigable with a consistent key scheme:

**Column traversal.** Left Arrow and Right Arrow move between columns. The left column (categories) is column 1, center (entry) is column 2, right (related) is column 3. Pressing Right Arrow from column 1 moves focus to the currently selected entry in column 2. Pressing Right Arrow from column 2 moves to column 3. The pattern wraps: Right Arrow from column 3 returns to column 1. This circular traversal means the player never gets "stuck" in a column.

**Within-column navigation.** Up Arrow and Down Arrow move within a column. In column 1, this scrolls through categories. In column 2, this scrolls through sections of the current entry (definition, micro-scenario, rules, Tick Marginalia). In column 3, this scrolls through related terms. Enter activates the focused item — selecting a category, expanding a section, or navigating to a related term.

**Quick keys.** Slash (/) focuses the search field from anywhere. Escape returns focus to the last active column item. Backtick toggles the terminal open/closed (consistent with 5.16b). The keys G, M, and R jump directly to Grounding Strip, Micro-scenario, and Related Terms respectively — single-letter shortcuts available when the terminal has focus and no text input is active.

**Inspector mode coexistence.** The terminal and the Inspector timeline both want arrow keys. Resolution: when the terminal panel has focus (indicated by a visible amber border), arrow keys control terminal navigation. Tab moves focus out of the terminal to the next Inspector element (timeline scrubber, unit selector). The terminal traps arrow keys only while focused — a standard "composite widget" pattern from WAI-ARIA.

### High-Contrast Mode: "The Blueprint Terminal"

High-contrast mode replaces the CRT aesthetic with a clean, high-contrast rendering that preserves the terminal's information architecture but abandons the phosphor fiction.

**Color transformation.** The charcoal background (#2B2B2B) shifts to true black (#000000). The amber text (#D4A017) shifts to pure white (#FFFFFF) for body text and bright amber (#FFD700) for headings and the Grounding Strip. This achieves 21:1 contrast for body text and 14.5:1 for headings — both well above WCAG AAA. The phosphor glow effect is removed entirely. Character edges become sharp. The scan-line overlay is removed. The result is a crisp monospace terminal that reads like a modern IDE's dark theme rather than a vintage CRT.

**Structural preservation.** The three-column layout, the category list, the entry structure, the Tick Marginalia separator — all remain identical. The terminal is still recognizably the terminal. It simply looks like a well-maintained terminal rather than a degrading one.

**Micro-scenario contrast.** Animated micro-scenario vignettes switch to a high-contrast palette: white outlines on black, amber highlights for active elements, 3px borders instead of 1px. The "buffer slots" in the eviction micro-scenario become thick-bordered white rectangles on black instead of soft amber-glow containers on charcoal. Signal movement trails become solid amber lines instead of glowing particle effects.

**The CRT Fiction Stub.** In high-contrast mode, a single concession to the CRT aesthetic remains: the terminal's outer border renders as a double-line rectangle with rounded corners — the silhouette of a CRT monitor — in dark gray (#333333). This border is the only visual reminder that this interface is supposed to be old hardware. It costs nothing in readability and maintains the faintest thread of diegetic fiction. Players who toggle back to standard mode will recognize the same terminal, now with its full aesthetic treatment restored.

### Reduced-Motion Mode: "The Still Terminal"

Reduced-motion mode responds to the operating system's `prefers-reduced-motion: reduce` media query and to an in-game toggle in the accessibility settings menu.

**What is removed.** Scan-line drift animation (the slow vertical crawl of horizontal lines across the screen). Phosphor character jitter (the subtle per-character positional noise). The Grounding Strip's amber flash on tick change. Micro-scenario playback animations — these are replaced with static keyframe captures (a before/during/after triptych of still images with captions). The "SIGNAL PENDING" loading animation (pulsing ellipsis) becomes a static "LOADING..." text.

**What is preserved.** The scan-line texture itself — the horizontal lines remain as a static overlay at 15% opacity, providing the CRT feel without motion. The amber-on-charcoal color scheme remains unchanged. The phosphor glow remains as a static CSS `text-shadow` rather than an animated pulse. The terminal still looks like a CRT. It simply looks like a CRT displaying a frozen frame rather than a live feed.

**Micro-scenario triptychs.** Each animated micro-scenario is pre-rendered into three still frames: the initial state, the critical action moment, and the result state. These render side by side (or stacked vertically on narrow viewports) with captions below each frame. The eviction triptych: Frame 1 "Buffer full, 6/6 slots occupied, new signal arriving." Frame 2 "Oldest signal (slot 1) marked for eviction, glowing amber." Frame 3 "New signal inserted into slot 1, old signal removed." The triptych conveys the same mechanical information as the animation. What it sacrifices is the temporal experience — the feeling of watching eviction happen in real time, the brief moment of tension as the oldest signal is selected. This is an acceptable trade: the triptych teaches the mechanic, and the player will see eviction happen in real matches.

### Audio Descriptions for Micro-Scenarios: "The Narrator Layer"

Every micro-scenario in the terminal includes an optional audio description track — a narrated voiceover that describes the visual action as it occurs. This is toggled independently from other accessibility settings: a sighted player might enable audio descriptions because they prefer auditory learning, or a screen reader user might enable them to supplement the static `aria-describedby` text with a timed narration synchronized to the animation.

**Voice and tone.** The narrator voice matches the terminal's diegetic fiction — a synthetic, slightly degraded voice processed through the same CRT audio filter used for boot log narration (5.02). The voice sounds like a training tape recorded on the same military hardware that runs the terminal. It speaks in clipped, technical sentences: "Signal arrives. Buffer full. Eviction policy: FIFO. Oldest entry selected. Slot 1 cleared. Signal inserted. Buffer full again."

**Synchronization.** Audio descriptions are timed to animation keyframes. In reduced-motion mode (triptych display), the audio description plays as a single continuous narration when the player activates the triptych (Enter key or click). The narration pauses between frames with a 500ms gap, matching the visual transition between triptych panels.

**Screen reader interaction.** When both screen reader and audio description are active simultaneously, the audio description takes priority during micro-scenario playback, and the screen reader is silenced for the duration (using `aria-busy="true"` on the scenario container). After playback completes, the screen reader announces "Micro-scenario complete. Press Enter to replay, Down Arrow to continue."

### Font Size and Zoom: "The Elastic Terminal"

The terminal's layout is built on CSS Grid with relative units (`rem`, `fr`, `%`). At 100% zoom, the three-column layout renders as 20%/55%/25% width distribution. At 150% zoom, the layout remains three-column but the right column (related terms) collapses into a toggleable drawer accessible via the R key. At 200% zoom, the terminal switches to a single-column stacked layout: categories become a dropdown selector at the top, the entry renders full-width below, and related terms appear as an expandable section at the bottom.

The monospace font (the terminal uses a system monospace stack: `"IBM Plex Mono", "Fira Code", "Courier New", monospace`) scales linearly with browser zoom. A minimum font size of 14px equivalent is enforced — the terminal will not render text below this threshold regardless of user settings, preventing the CRT aesthetic from making text illegibly small.

---

## Player Journeys

#### Journey: Amara, 34, Accessibility Consultant — Screen Reader Navigation Through Inspector Mode

**Context:** Mission 6, Amara's third session. She plays with NVDA on Windows, no monitor — she works entirely through audio. She has completed five missions using the terminal exclusively via screen reader. Her relay network is functional but she suspects her eviction policy is wrong. She enters Inspector mode after a close loss.

**Minute 0:00 — Entering the Terminal**
Amara presses backtick. NVDA announces: "Terminal opened. Categories panel. 12 categories. Context Window selected." The three-column layout is invisible to her — she does not know or need to know that categories are on the left. She knows categories are a listbox and she can arrow through them.

**Minute 0:08 — Navigating to Eviction**
She presses Down Arrow four times. NVDA announces each category: "Eviction." She presses Enter. NVDA announces: "Eviction. Definition: When a unit's context window is full and a new signal arrives, the oldest or lowest-priority entry is removed to make room. Press Tab for micro-scenario, Right Arrow for related terms." She presses Right Arrow to hear the Grounding Strip first — a habit she developed in Mission 5. NVDA reads: "Tick 31. RELAY-B. Buffer 8 of 12. Eviction count: 7."

**Minute 0:22 — The Tick Marginalia**
She presses Down Arrow in the center column to reach the Tick Marginalia section. NVDA reads the full marginalia: "At tick 31, RELAY-B. Eviction occurred 7 times in this unit's history. Most recent: tick 28, slot 3 evicted. SCOUT-A terrain at B4, age 9 ticks. Reason: FIFO policy, slot held oldest entry. Buffer state: 8 of 12 slots occupied, 4 slots available." Amara pauses. Four slots available and seven evictions — her relay is evicting aggressively even though it has room. Something is wrong with her configuration.

**Minute 0:40 — The Audio Description**
She tabs to the micro-scenario section and presses Enter. The narrator voice begins, processed through the CRT audio filter — slightly grainy, clipped cadence: "Buffer with twelve slots. Eight occupied. New signal arrives. Eviction policy activates despite four empty slots. Configuration error: eviction threshold set to eight. Slot 3 selected — oldest entry. Signal removed. New signal inserted into slot 3. Buffer remains at eight of twelve." Amara hears the critical phrase: "eviction threshold set to eight." She configured the threshold wrong. She set a maximum occupancy of 8 instead of 12.

**Minute 1:05 — Closing the Terminal**
Amara presses backtick. NVDA announces: "Terminal closed. Inspector. RELAY-B selected. Tick 31." She navigates to RELAY-B's configuration panel to fix the threshold.

**UI Annotations:**
- NVDA debounce: 500ms after last scrub before announcing new tick state
- Category→entry focus transfer on Enter, with preview sentence
- Micro-scenario audio description synchronized to animation keyframes
- `aria-live="assertive"` on Grounding Strip, `aria-live="polite"` on entry content

---

#### Journey: Dmitri, 28, Repetitive Strain Injury — Keyboard-Only Terminal Operation

**Context:** Mission 4, Dmitri's first session with the terminal. He has a wrist injury that prevents mouse use — he operates everything via keyboard with a split ergonomic board. He has used the terminal in Plan mode for two missions via Tab navigation, but this is his first time in Inspector mode where the terminal and the timeline scrubber compete for arrow key focus.

**Minute 0:00 — The Focus Conflict**
Dmitri has the Inspector timeline focused. He presses Right Arrow to scrub forward. Tick 14, 15, 16. He wants to check a term. He presses backtick. The terminal opens. He hears the focus indicator — a thickened amber border appears around the terminal panel. He presses Right Arrow. Instead of scrubbing the timeline, the focus moves from column 1 to column 2 inside the terminal. The terminal has captured arrow key input. Dmitri nods — the border told him focus moved.

**Minute 0:12 — The Grid Protocol in Practice**
He is in column 2, the entry panel, showing whatever entry was last open. He wants to find "Observation." He presses Slash. The search field activates. He types "obs" and presses Enter. The search results appear in column 2. He presses Down Arrow to scroll through results: "Observation," "Observation Refresh," "Observer Pattern." He presses Enter on "Observation." The entry loads. He reads.

**Minute 0:30 — Column Traversal**
He wants to see related terms. He presses Right Arrow. Focus shifts to column 3: "Related: Perception Cone. Context Window. Refresh Skill. Eviction." He presses Down Arrow to reach "Eviction," then Enter. The terminal navigates to the Eviction entry — focus returns to column 2 with the new content. The circular column traversal means he never needed to Tab out and Tab back in.

**Minute 0:45 — Returning to the Inspector**
He has what he needs. He presses backtick to close the terminal. Focus returns to the Inspector timeline at the tick where he left it. He presses Right Arrow — the timeline scrubs to tick 17. Arrow keys belong to the Inspector again. The focus transfer is clean. No ambiguity about which element owns his input.

**Minute 1:00 — Quick-Key Discovery**
Later in the session, Dmitri opens the terminal and wants the Grounding Strip. He remembers the quick-key hint from the NVDA announcement earlier and presses G. Focus jumps directly to the Grounding Strip text. He reads the tick state without scrolling. He presses M — focus jumps to the micro-scenario. He discovers that single-letter shortcuts let him treat the terminal like a spatial object navigated by landmarks rather than a linear document navigated by Tab.

**UI Annotations:**
- Amber border thickens to 3px when terminal has focus (keyboard-visible focus indicator)
- Arrow keys captured only inside focused terminal; Tab exits to next Inspector element
- Slash for search from anywhere inside terminal
- Quick keys G/M/R for Grounding/Micro-scenario/Related
- Backtick toggle preserves Inspector focus position on close

---

#### Journey: Yuki, 42, Graphic Designer with Vestibular Disorder — Reduced-Motion Terminal Use

**Context:** Mission 3, Yuki's first time opening the terminal. She has vestibular migraine triggered by certain motion patterns — scrolling text, parallax effects, and repetitive horizontal line movement are her primary triggers. She set `prefers-reduced-motion: reduce` in her OS settings before launching the game. Robot Uprising detected this at first boot and enabled reduced-motion mode automatically, with a notification: "Reduced motion detected. Animations minimized. You can adjust this in Settings > Accessibility."

**Minute 0:00 — First Terminal Open**
Yuki presses backtick. The terminal appears without transition animation — no slide-in, no fade, it simply appears in place. The CRT aesthetic is present but still: the charcoal background, the amber text, the monospace font, the scan-line texture as a static overlay at 15% opacity. The scan lines do not drift. The phosphor glow around characters is static — a fixed text-shadow, not a pulsing halo. The terminal looks like a photograph of a CRT rather than a live CRT feed. Yuki's eyes settle immediately. There is no motion to track. She does not feel the familiar tightness behind her eyes that signals an incoming trigger.

**Minute 0:10 — Browsing Categories**
She clicks "Context Window" in the left column. The entry loads in the center column — the text appears instantly, no typewriter animation, no fade-in. She reads the definition. She scrolls down with the mouse wheel. The content scrolls smoothly but without any parallax effect, no inertial bounce, no elastic overscroll. Clean, immediate scrolling. She reaches the micro-scenario section.

**Minute 0:25 — The Triptych**
Instead of an animated vignette, three still images are arranged horizontally: a buffer with empty slots, the same buffer receiving a signal, and the buffer with the signal occupying a slot. Below each frame, a caption: "Empty buffer, 0/6 occupied." "Signal S-1 arrives at context window." "Signal S-1 inserted into slot 1. Buffer 1/6." Yuki studies the three frames. The progression is clear — left to right, empty to occupied. She does not need to watch the signal slide into the slot to understand the mechanic. The triptych teaches the same fact without temporal motion.

**Minute 0:45 — Inspector Mode Marginalia**
In a later mission, Yuki opens the terminal in Inspector mode. She scrubs the timeline. The Grounding Strip updates — but without the amber flash that standard mode uses. The text simply changes: "TICK 18" becomes "TICK 19" with no transition effect. The Tick Marginalia text below the dashed separator updates in place. No scrolling, no fade, no highlight pulse. The information changes; the pixels do not move unnecessarily. Yuki spends twenty minutes in the terminal during this Inspector session. She does not develop a headache. The terminal has been fully useful — every piece of information accessible, every navigation path available — without a single animation frame.

**Minute 1:05 — Testing the Toggle**
Curious, Yuki opens Settings > Accessibility and temporarily disables reduced-motion mode. The terminal's scan lines begin drifting. The phosphor glow starts pulsing. She watches for three seconds, feels the first twinge of discomfort behind her left eye, and toggles reduced motion back on. The animations stop instantly — no fade-out, no transition. Still. She exhales.

**UI Annotations:**
- `prefers-reduced-motion` auto-detection at first boot with player notification
- Static scan-line texture at 15% opacity (no drift animation)
- Static text-shadow glow (no pulse)
- Micro-scenario triptychs: three still frames with captions, replacing animation
- Grounding Strip updates without flash transition
- In-game toggle independent of OS setting (player can override in either direction)
- Instant animation stop on toggle — no transition animation for the transition itself

---

## Strengths

**Information parity across modalities.** No accessibility mode receives less information than the standard mode. The screen reader user hears the same marginalia data the sighted user reads. The reduced-motion triptych conveys the same mechanical truth as the animation. The high-contrast mode preserves the same layout structure. "Parallel fidelity" is not aspirational — it is architecturally enforced by making the accessibility layer a presentation concern over a shared semantic data model.

**Diegetic fiction survives every mode.** High-contrast mode keeps the CRT monitor border silhouette. Reduced-motion mode keeps the static scan-line texture. The screen reader's audio descriptions use the same CRT-filtered narrator voice as the boot log. The terminal never stops being a military CRT terminal — it simply becomes a military CRT terminal operated by someone who configured it for their needs. This is itself diegetic: a real operator would adjust display settings on real hardware.

**Progressive disclosure of accessibility features.** Players discover accessibility features through use rather than a settings menu. The keyboard focus border appears the first time arrow keys are pressed inside the terminal. The audio description play button appears on the micro-scenario the first time a screen reader is detected. Quick keys (G/M/R) are mentioned in screen reader announcements. The accessibility layer teaches itself the same way the game teaches its mechanics — through interaction.

**Inspector mode coexistence is clean.** The focus management protocol (terminal captures arrow keys when focused, Tab exits to Inspector) avoids the most common accessibility failure in multi-panel game UIs: ambiguous input ownership. The player always knows which panel owns their input because the visual focus indicator (amber border) and the screen reader announcement ("Terminal. Categories panel.") both confirm context.

## Weaknesses

**The CRT fiction fights accessibility at a fundamental level.** Every accessibility accommodation — removing scan lines, sharpening text, increasing contrast — removes a piece of the CRT illusion. The terminal in high-contrast mode looks like a modern IDE terminal, not a 1987 military display. The reduced-motion triptych looks like a documentation screenshot, not a living diagnostic tool. Players who use accessibility modes will have a different aesthetic experience than players who do not, and some may feel they are missing the "real" terminal. This is an irreducible tension between atmospheric design and inclusive design.

**Audio description authoring doubles the content pipeline.** Every micro-scenario needs both an animation and a narrated description text (plus a triptych for reduced-motion mode). The content pipeline (5.16a) already faces a combinatorial explosion with ~30 entries and ~180 cross-cutting interactions. Adding audio descriptions and triptychs to each entry increases per-entry authoring cost by approximately 40%. The "Living Index" pipeline (5.16a's recommendation) must budget for this from day one — retrofitting accessibility content is always more expensive than authoring it in parallel.

**Three-to-one column collapse at 200% zoom sacrifices spatial navigation.** At 200% zoom, the terminal becomes a single-column layout with a dropdown category selector. This is functionally correct — all information is accessible — but it destroys the spatial mental model that sighted keyboard users build in the three-column grid. A player who learned the Grid Protocol (Left/Right between columns, Up/Down within columns) must switch to a linear Tab-based navigation model at high zoom. The transition is jarring. A possible mitigation: maintain the Grid Protocol's key bindings even in single-column mode, with Left/Right cycling between the dropdown, the entry, and the related section as virtual "columns."

**Debounced screen reader announcements lose intermediate state.** The 500ms debounce on Tick Marginalia announcements means that a screen reader user who scrubs rapidly through ticks 20-30 will only hear the announcement for tick 30 (or wherever they stop). A sighted user scanning the marginalia while scrubbing sees every intermediate state flash past, which can reveal patterns ("eviction count jumps from 3 to 7 between ticks 24 and 25"). The screen reader user misses this pattern unless they scrub one tick at a time. Mitigation: a "marginalia history" buffer (press H to hear the last 5 tick states in sequence) could partially restore this scanning capability.

**Triptych micro-scenarios lose temporal causality.** The three-frame triptych shows before, during, and after — but it cannot show the *timing* of an event. A standard-mode player watching the eviction animation sees the 200ms pause before the oldest signal is selected, then the 300ms slide as it exits — the pacing communicates "the system deliberates, then acts." The triptych collapses this into simultaneity. For mechanics where timing is strategically relevant (e.g., hook chain propagation delays), the triptych's loss of temporal information is a meaningful fidelity reduction. Mitigation: optional frame-by-frame playback mode (press Space to advance one keyframe at a time) for reduced-motion users who want temporal information without continuous animation.

---

## Interaction Effects

### With Corruption Audio Accessibility (6.10d)

The corruption audio accessibility system (6.10d) provides visual, haptic, and screen reader alternatives for the 13-sound corruption vocabulary. The terminal's accessibility layer must not conflict with these. Key interaction: when a player in high-contrast mode opens a terminal entry about corruption while the corruption heatmap (6.10d's visual mode) is active on the workbench, the terminal's high-contrast amber-on-black palette must not clash with the corruption heatmap's amber glow fields. Resolution: in high-contrast mode, the corruption heatmap shifts to red (#FF4444) while the terminal retains amber (#FFD700). The two systems share a design token file that coordinates their palettes per accessibility mode.

The screen reader interaction is more subtle. The corruption system's `aria-live` announcements ("Corruption detected. RELAY-B. Severity: moderate.") and the terminal's `aria-live` Tick Marginalia announcements can collide if both update simultaneously. Resolution: the terminal's marginalia uses `aria-live="polite"` (queues behind other announcements), while corruption alerts use `aria-live="assertive"` (interrupts). Corruption always wins the announcement priority — a design choice reflecting that corruption is a threat requiring immediate attention, while marginalia is reference data that can wait.

### With Inspector Mode Terminal (5.16b)

The Inspector mode terminal adds the Grounding Strip and Tick Marginalia to the base terminal. Every accessibility feature must work with these additions. The Grounding Strip becomes a focusable landmark (quick key G). The Tick Marginalia becomes a collapsible section with `aria-expanded` state. The auto-update-on-scrub behavior (the "Living Reference") interacts with reduced-motion mode: in standard mode, marginalia text fades and updates; in reduced-motion mode, it swaps instantly. The screen reader debounce applies to scrub-triggered marginalia updates but NOT to player-initiated navigation (clicking a different entry).

### With Game Accessibility Settings

Robot Uprising's global accessibility settings menu includes toggles for: reduced motion, high contrast, screen reader mode, audio descriptions, subtitle size, colorblind mode (protanopia/deuteranopia/tritanopia), and input remapping. The terminal respects all of these. Colorblind mode shifts the amber/green split (standard text vs. Tick Marginalia) to a blue/orange split that maintains distinction across all three colorblind types. Input remapping allows rebinding the backtick toggle, quick keys, and column traversal keys. The terminal's accessibility is not a separate system — it reads from the same settings object as every other UI element, ensuring consistency.

---

## Comparable Games

### The Last of Us Part II — Menu Accessibility as Industry Benchmark

TLOU2 shipped with 60+ accessibility options, including full screen reader support for menus (a first for a AAA action game), high-contrast mode that reduces the game world to silhouettes while highlighting interactive elements, and audio descriptions for cinematics. The terminal's screen reader architecture borrows TLOU2's approach of making every interactive element announce its purpose and navigation context ("Press X to select, Triangle to go back"). Where Robot Uprising diverges: TLOU2's accessibility is for navigating a linear action game's menus and combat, while Robot Uprising's terminal is an information-dense reference tool. TLOU2 never had to make a screen reader navigate a three-column glossary with live-updating diagnostic data. The debounce pattern and Grid Protocol are Robot Uprising-specific solutions to a problem TLOU2 did not face.

### Hades — Screen Reader Support in a Fast-Paced Game

Supergiant added screen reader support to Hades post-launch, including full narration of the Codex (Hades' in-game reference system — the closest analog to Robot Uprising's terminal). Hades' Codex is a two-panel layout (character list left, description right) with screen reader support that announces character names and descriptions sequentially. Robot Uprising's terminal is more complex (three columns, live data, micro-scenarios) but follows the same principle: the reference system must be fully navigable by a player who cannot see the screen. Hades proved that screen reader support in a game's reference UI is not a niche accommodation — the community response was significant, and Supergiant committed to screen reader support in all future titles.

### WCAG 2.1 AA Patterns — Web Standards as Game UI Foundation

The terminal's accessibility architecture is built on web standards: ARIA landmarks, `aria-live` regions, focus management, `prefers-reduced-motion` media queries, and semantic HTML structure. These are WCAG 2.1 AA patterns translated into a game context. The key translation challenge: WCAG assumes a document reading model (top-to-bottom, left-to-right), while the terminal is an interactive application with three simultaneous information streams. The Grid Protocol is the bridge — it imposes a navigable structure on the three-column layout that behaves like a WCAG-compliant data grid while presenting like a CRT terminal.

### Celeste — Assist Mode Philosophy

Celeste's Assist Mode principle — "accessibility options are not cheating, they are configuration" — informs Robot Uprising's approach. Accessibility settings do not disable any game feature or reduce any information. High-contrast mode does not hide the terminal's content. Reduced-motion mode does not skip micro-scenarios — it presents them differently. The terminal in any accessibility mode contains exactly the same information as the terminal in standard mode. Configuration, not degradation.

---

## Sensory Descriptions by Accessibility Mode

### Standard Mode (No Accessibility Settings)

The terminal is a warm darkness. Charcoal background, the deep gray-black of a monitor that has been running for decades. Amber text glows with a soft halo — each character bleeds light into the surrounding pixels like phosphor burning through glass. Horizontal scan lines drift upward at one pixel per two frames, a slow vertical crawl that the eye stops tracking after thirty seconds but never fully forgets. The monospace font renders every character in its own equal-width cell, creating a gridded texture that reads like military teletype output. When text loads, it types itself in — each character appearing with a 15ms delay, accompanied by a faint tick from the terminal's audio layer. The Grounding Strip in Inspector mode is a warmer amber than the body text, the color of a hazard warning painted on old machinery. Micro-scenario animations play in their containers like films projected on a small screen — the buffer slots as amber rectangles, signals as brighter amber dots that slide and settle with mechanical precision. The scan lines pass over everything equally, unifying the terminal into a single coherent surface of aged, functional equipment.

### Screen Reader Mode

The terminal is a voice in the dark. Category names arrive in the screen reader's neutral tone, each one a door the player can open. The entry text is a continuous prose narration — definition first, then mechanical details, then the micro-scenario description in its clipped military syntax. The Grounding Strip is a location marker: "Tick 22. RELAY-C. Buffer 11 of 12." The marginalia is a briefing — numbers and unit names and tick references that build a picture of a specific moment in a specific battle. The audio description narrator's voice, when enabled, is the terminal itself speaking: slightly synthetic, slightly degraded, the voice of hardware that was built to teach. The pauses between sections are the player's own processing time. The terminal waits.

### High-Contrast Mode

The terminal is sharp. True black background, pure white text, every character edge a precise boundary between light and absence of light. The amber of headings and the Grounding Strip is bright gold — #FFD700, the color of caution tape, of urgent labels on equipment. The CRT monitor border — the last remnant of the fiction — is a thin dark gray outline, barely visible, a whisper of the object this interface is pretending to be. No glow. No bleed. No scan lines. The text is simply there, present, legible at any distance, at any zoom level. The micro-scenarios render in outline: white borders on black, amber fills for active elements, every visual element readable at arm's length. The terminal looks clinical, efficient, almost beautiful in its clarity. It has traded atmosphere for function and does not apologize.

### Reduced-Motion Mode

The terminal is frozen. The same charcoal, the same amber, the same monospace grid — but nothing moves. The scan lines are printed on the glass, not drifting across it. The phosphor glow is painted, not pulsing. The characters sit in their cells without jitter, without flicker, without the microscopic positional noise that standard mode uses to simulate cathode ray instability. The micro-scenario triptychs are stills — three amber-framed photographs of buffer states, each captioned in smaller text below. The Grounding Strip changes its text when the player scrubs, but the change is instantaneous — one number replaced by another, no animation, no transition, the way a digital clock updates: 22 becomes 23 becomes 24. The terminal is absolutely still. It breathes only when the player asks it to. For Yuki, and for every player for whom motion is pain, the terminal is a quiet room where knowledge lives without moving.

# 3.13 — Context Config Presets vs. Custom: The Tuning Spectrum

## Overview

Context configuration is the fourth primitive — after skills, rules, and hooks — and arguably the most abstract. Where skills are verbs ("patrol"), rules are if-then logic ("if enemy spotted, then evade"), and hooks are wiring ("on threat-detected, send to recon-net"), context config is *meta-cognition*: how large is the unit's working memory? What does it pay attention to? What does it forget first? These are questions about attention architecture itself, and they map directly to real agentic AI engineering decisions about context window management, token budgets, and retrieval priorities.

The design question: should players configure context from scratch every time (full manual control), choose from pre-built presets ("Aggressive Listener," "Selective Filter"), or encounter some hybrid where presets exist but can be customized?

This is not just a convenience question. It determines whether context config is a *first-class design primitive* that players deeply understand, or a *settings panel* they set once and forget. The answer shapes the entire game's relationship with its most distinctive mechanic.

---

## The Context Config Surface

Per the locked design, each blueprint's context config section includes:

- **Buffer size allocation** — how many of the unit's total slots are reserved for which data types (observations, signals, commands)
- **Listen/ignore filters** — which channels the unit listens to, which signal types it accepts
- **Eviction priorities** — when the context window is full, what gets dropped first (oldest, lowest-priority, specific type)

A Scout with 6 slots might allocate 4 to observations and 2 to incoming signals, listen only to the "threat" channel, and evict oldest-first. A Relay with 12 slots might allocate 2 to observations (it's stationary — what's it observing?), 8 to incoming signals, 2 to compressed output, listen to everything, and evict lowest-priority-first.

The config surface is small — maybe 5-8 decisions per blueprint — but the *interaction space* is enormous. A wrong listen filter means the unit never hears critical intel. A wrong eviction policy means it forgets the threat report that would have saved it. A wrong allocation means observations crowd out the signal that triggers its hook.

---

## Design Options

### Option A: "The Blank Slate" — Always Manual, No Presets

Every new blueprint starts with an empty context config. All listen filters off. No eviction policy selected. Buffer allocation at zero. The player must configure everything from scratch.

**Mechanical definition:** When a player creates a new Scout blueprint, the context config section shows:
- Buffer allocation: 6 empty slots, no type assignments (all grey)
- Listen filters: all channels toggled OFF (grey switches)
- Eviction policy: NONE selected (three radio buttons — oldest/lowest-pri/type-based — all unselected)

The blueprint is non-deployable until minimum config is set (at least 1 slot allocated, at least 1 listen filter on, eviction policy chosen). A red "INCOMPLETE" badge pulses on the blueprint card.

**Strengths:** Maximum learning pressure. Every player who completes the game genuinely understands context configuration because they had to build it from nothing ten times. No hidden defaults to misunderstand. The blank canvas forces deliberate choice on every axis. This is the Zachtronics path — no hand-holding, no shortcuts, and the players who emerge are deeply fluent.

**Weaknesses:** Catastrophic for onboarding. Mission 1 introduces context windows as a concept. Asking the player to immediately configure buffer allocation, listen filters, AND eviction priorities is three new concepts simultaneously with zero intuition for what "good" looks like. The "INCOMPLETE" badge creates anxiety rather than curiosity. Players who get it wrong (and they will — everyone will) face opaque failure: the unit dies or freezes, and the connection to the misconfigured listen filter is invisible without Inspector experience they don't yet have. The tutorial must do enormous work to compensate.

### Option B: "The Menu" — Presets Only, No Custom

Each unit type ships with 3-5 named presets. The player picks one. No customization possible. A Scout's context config is either "Wide Net" (listen to everything, evict oldest) or "Focused Hunter" (listen only to threat channels, evict observations first) or "Silent Runner" (listen to nothing, maximize observation slots). The choice is meaningful but bounded.

**Mechanical definition:** The context config section shows a horizontal row of 3-5 preset cards, each with:
- A name in teal small-caps ("WIDE NET")
- A one-sentence description ("Hears everything. Forgets the oldest first.")
- A small visual diagram showing slot allocation as colored blocks
- A selection ring (gold border) on the active preset

Clicking a preset instantly configures all context parameters. No individual toggles visible. The player sees the *result* (the colored slot diagram updates) but not the *mechanism*.

**Strengths:** Minimum cognitive load. The choice between "Wide Net" and "Focused Hunter" is immediately legible even to someone who has never heard the term "eviction policy." The preset names become shared vocabulary — players say "I ran Wide Net scouts" in community discussions. The workbench stays clean; the context config section is 80px tall with 3-5 cards. Presets can be carefully balanced so each is viable in different situations, creating real strategic choice without parametric complexity.

**Weaknesses:** Kills the game's core thesis. Robot Uprising's pitch is "you are configuring attention systems." If the most distinctive attention system — the context window itself — is reduced to a menu of pre-built options, the game is lying about what it teaches. Players never learn what eviction policies ARE, only which preset NAME works for which situation. The transferable skill (understanding context window management) is replaced with a non-transferable skill (memorizing preset names). Veterans hit a ceiling fast — there's no "my custom relay config that nobody else runs" moment. The meta-level (building systems that build systems) is impossible if the most fundamental system can't be custom-built.

### Option C: "The Starter Kit" — Presets as Defaults, Full Customization Available

Each unit type starts with a sensible default preset applied. The player can use it as-is or expand the section to reveal full manual controls. Presets are entry points, not ceilings.

**Mechanical definition:** The context config section has two states:

**Collapsed (default):** Shows the active preset name ("WIDE NET") with a small colored slot diagram and a downward chevron. 48px tall. Functionally identical to Option B's preset cards, but with an expand affordance.

**Expanded:** The chevron flips. Below the preset selector, full manual controls appear:
- Buffer allocation: draggable colored blocks in a horizontal strip. Drag the boundary between "Observations" (green) and "Signals" (blue) to resize. Numbers update live ("4 obs / 2 sig").
- Listen filters: vertical list of available channels with toggle switches. Each switch shows the channel's color dot. Active channels pulse gently.
- Eviction policy: three cards with names and diagrams — "Oldest First" (hourglass icon, entries fade left-to-right), "Lowest Priority" (stack icon, bottom entries dim), "Type Rotation" (color wheel icon, evicts one of each type round-robin).

When the player manually changes ANY parameter, the preset label shifts to italic with an asterisk — "WIDE NET*" — indicating customization. A "Reset to Preset" button appears as a small circular arrow.

**Strengths:** Best of both worlds. Beginners have a safe starting point. Veterans have full control. The expand/collapse pattern is universally understood. The asterisk notation teaches a real engineering concept — "I started from a template and customized it" is exactly how production AI systems are configured. The preset names still serve as shared vocabulary, but "WIDE NET with listen filters narrowed" adds precision. The physical expansion of the section mirrors the player's growing understanding — the workbench literally shows more as they learn more.

**Weaknesses:** The "hidden controls" problem. If the expanded view is too hidden, players never discover customization and the game degenerates to Option B. If it's too prominent, the expanded view is always open and the presets become noise — players ignore them and configure manually, making it Option A with extra clutter. The chevron must be discoverable but not insistent. The preset names might create a false sense of completeness — "I picked Wide Net, I'm done" — when the right config for this mission requires Wide Net with one specific channel ignored. The asterisk/modified state adds cognitive overhead: "Is my modified preset still good? Should I reset?"

### Option D: "The Growing Config" — Presets Early, Custom Late (RECOMMENDED)

Context config capability expands across the campaign. Missions 1-2 offer only presets (the player doesn't even know manual config exists). Missions 3-4 introduce listen filter customization (one toggle at a time, with a boot-log moment explaining the concept). Mission 5-6 unlock eviction policy selection. Mission 7+ unlock full buffer allocation control. Post-campaign Gauntlet unlocks advanced config: per-type eviction weights, conditional listen filters (listen to channel X only when buffer is >50% full), and eviction callbacks (when an entry is evicted, fire a hook).

**Mechanical definition across campaign:**

| Mission | Config Capability | Boot Log Moment | Workbench Height |
|---------|------------------|-----------------|------------------|
| M1-2 | Preset selection only (3 presets per unit type) | "ATTENTION SUBSYSTEM: preset profiles loaded. Select operating mode." | 48px |
| M3 | Presets + listen filter toggles | "ATTENTION SUBSYSTEM UPDATE: individual channel filters now adjustable. You can choose what your units hear." | 96px |
| M4 | + eviction policy selection | "MEMORY MANAGEMENT: eviction policy configurable. When memory is full, what should be forgotten?" | 144px |
| M5-6 | + buffer allocation sliders | "MEMORY ALLOCATION: slot partitioning unlocked. Decide how much memory each data type deserves." | 200px |
| M7-8 | Full manual config, presets as starting points | All controls available, presets remain as quick-start options | 200px |
| M9-10 | + advanced options (per-type weights, conditional filters) | "ADVANCED COGNITION: conditional attention filters. Your units can now decide what to listen to based on their current state." | 248px |
| Gauntlet | + eviction callbacks, buffer sharing between units | "EXPERIMENTAL SUBSYSTEM: eviction event hooks. Memory management becomes a signal source." | 296px |

Each unlock adds physical height to the context config section. The first time a new control appears, it glows with a soft cyan pulse for 3 seconds, then settles to standard brightness. The preset selector remains at the top throughout — it never goes away, because even veterans benefit from a quick starting point.

**Strengths:** Zero complexity cliff at any point. Each concept is introduced when the player has the experiential context to understand it. "What should your unit listen to?" is a meaningful question only AFTER the player has watched a unit drown in irrelevant signals (Mission 2's sealed watch). "What should be evicted first?" is meaningful only AFTER the player has seen a context overload stun (Mission 3-4). The physical growth of the config section is itself a progress signal — the workbench at Mission 1 and Mission 10 look visibly different, and the difference IS the player's growing competence.

The advanced options in late campaign and Gauntlet create genuine mastery depth. Conditional listen filters ("listen to recon-net only when buffer fill > 50%") are a real agentic AI pattern — dynamic context window management based on current state. Eviction callbacks (evicting an entry fires a hook) create a new primitive that enables sophisticated meta-behavior: a relay that broadcasts a "memory-pressure" signal when it starts evicting, triggering upstream scouts to reduce observation frequency. This is the meta-level — building systems that respond to their own cognitive limits.

**Weaknesses:** Implementation complexity — four distinct config UI states across the campaign. Returning players who replay early missions see a simplified config that might feel patronizing. The unlock sequence must be carefully tuned: if listen filters unlock too late, the player has already developed bad habits (ignoring channel management entirely). If buffer allocation unlocks too early, it's presented before the player has seen enough context overloads to understand why allocation matters.

---

## Player Journeys

#### Journey: Sofia, 15, high school student, first strategy game

**Context:** Mission 3, Palawan jungle terrain. Sofia completed Missions 1-2 using preset configs without thinking about them. In Mission 2, her scout was stunned by context overload — it was listening to everything and its 6-slot buffer filled instantly. She's frustrated but curious.

**Minute 0:00 — The Boot Log Revelation**

The mission opens. Dark screen, green phosphor text crawling upward. Sofia reads: "ATTENTION SUBSYSTEM UPDATE: individual channel filters now adjustable. Your Scout unit 'Diwata' was receiving 4.2 signals per tick on all channels. Its 6-slot context window overloaded in 3 ticks. Recommended action: restrict listening to mission-critical channels only." A small animated diagram shows a Scout icon with colored lines streaming in from every direction, then most lines fading to grey as filters engage, leaving only two bright connections. The boot log fades. The workbench appears.

**Minute 0:15 — Discovering the New Controls**

Sofia opens her Scout blueprint "Diwata." The context config section looks different — below the preset selector ("WIDE NET" is active, highlighted with a gold ring), there's a new subsection she hasn't seen before. A header reads "LISTEN FILTERS" in small teal caps, with a soft cyan glow pulsing on the border — the unlock indicator. Below it: four toggle switches in a vertical list, each with a colored dot and channel name. All four are ON (green).

- `recon-net` (teal dot) — ON
- `threat-alert` (red dot) — ON
- `movement-grid` (amber dot) — ON
- `command-override` (purple dot) — ON

Sofia hovers over `movement-grid`. A tooltip appears: "Receives position updates from all units on this channel. 1.8 signals/tick average." She thinks: *That's a lot. Does my scout need to know where everyone is?*

**Minute 0:45 — The First Filter Decision**

She clicks the `movement-grid` toggle. It slides to OFF with a satisfying click sound — the toggle turns grey, the amber dot dims. The preset label above shifts: "WIDE NET" becomes "WIDE NET*" in italic, with a tiny asterisk. A small text appears below: "Modified — 3 of 4 channels active."

The slot diagram updates live. Where before all 6 slots showed a chaotic mix of colors, now the projected fill rate indicator (a thin line below the slots, like a progress bar showing expected fill speed) drops from amber to green. Sofia sees the change: fewer inputs, slower fill, less overload risk.

She also toggles off `command-override` — she doesn't have a Command unit yet, so nothing is sending on that channel. The label reads "WIDE NET**" — then corrects itself to just show the modification count: "WIDE NET (2 channels filtered)."

**Minute 1:30 — Sealed Watch Payoff**

She hits EXECUTE. The sealed watch begins. Her Scout "Diwata" moves through Palawan jungle. The tiny context bar below the unit — 6 pips — fills more slowly this time. Green pip. Blue pip. Green. Blue. Green. Five of six slots full at tick 8. Last mission, the scout was stunned at tick 4. Sofia watches the bar hover at 5/6 for three ticks as the eviction policy (oldest-first, from the WIDE NET preset) drops old observations to make room for new ones. No overload. No stun.

At tick 12, a red flash — enemy contact. The scout's hook fires on `threat-alert`, a green flash on the signal line to the striker. The striker receives it, moves toward the threat. The scout, unburdened by movement-grid noise, still has 2 free slots for the fresh enemy observation. It tags the enemy position precisely.

**Minute 2:30 — Inspector Discovery**

Mission success. In the Inspector, Sofia clicks on Diwata and opens the context window chart — a sparkline showing fill over all ticks. It's a gentle wave between 3/6 and 5/6, never touching the red ceiling. She compares to last mission's chart (available in mission history): a steep ramp to 6/6 at tick 4, then the stunned-tick gap, then a sawtooth of desperate evictions.

She thinks: *Filtering out two channels made that much difference? What if I filtered even more?*

**Minute 3:00 — Resolution**

Sofia goes back to the workbench. She toggles off `recon-net` experimentally. The slot diagram shows projected fill dropping to almost nothing — the scout would receive almost no external signals, relying entirely on its own observations. The fill rate indicator turns deep blue — "very low." She toggles it back on. She's learning the tradeoff: filter too much and the unit is deaf; filter too little and it drowns.

**UI Annotations:**
- **Preset label with modification indicator:** Top of context config section, 14px DM Sans, teal text. Unmodified: "WIDE NET" in standard weight. Modified: italic with parenthetical count "(2 channels filtered)". Reset button: 16px circular arrow icon, appears on hover.
- **Listen filter toggles:** 32px row height per channel. Left: 8px colored dot matching channel color. Center: channel name in 12px DM Sans. Right: iOS-style toggle, 28px wide, green when ON / grey when OFF. Click transitions with 150ms slide animation and soft click audio.
- **Fill rate indicator:** 4px tall bar below the slot diagram. Color gradient: deep blue (very low) → green (healthy) → amber (moderate) → red (overload risk). Updates in real-time as toggles change.
- **Unlock glow:** New section border pulses with cyan at 2Hz for 3 seconds on first view, then fades to standard 1px border.

---

#### Journey: Marcus, 42, DevOps engineer, Factorio veteran

**Context:** Mission 7, Mindanao jungle. Marcus has full manual config unlocked. He's building a multi-relay signal processing pipeline. He's been playing for 6 hours across multiple sessions and has strong opinions about context management from his professional work with log aggregation systems.

**Minute 0:00 — The Custom Pipeline**

Marcus opens his Relay blueprint "Switchboard-3." The context config section is fully expanded — 200px tall, showing all four subsections. He ignores the preset selector entirely (it shows "SIGNAL HUB" — the default relay preset — but he customized it heavily three missions ago and the label reads "SIGNAL HUB (custom)").

His current config:
- **Buffer allocation:** 12 slots total. 0 observations (relay is stationary, doesn't observe). 8 incoming signals. 2 compressed output. 2 reserved (grey, unallocated — his personal style, leaving headroom).
- **Listen filters:** Listening to `recon-net`, `threat-alert`, `sector-alpha`, `sector-bravo`. Ignoring `movement-grid` and `logistics`.
- **Eviction policy:** "Lowest Priority" selected. A small detail panel shows the priority ranking he's configured: commands > threats > observations > routine signals.

**Minute 0:30 — The Allocation Experiment**

Marcus drags the boundary between "Incoming Signals" (blue) and "Compressed Output" (orange) in the buffer allocation strip. He's moving it from 8/2 to 6/4 — giving more room for compressed output at the cost of fewer raw signal slots. The strip is a horizontal bar divided into colored segments, with draggable dividers between them. As he drags, numbers update in real-time: "6 incoming / 4 compressed / 2 reserved."

He pauses. Thinks. If he reduces incoming slots to 6, the relay will start evicting raw signals sooner when multiple scouts report simultaneously. But with 4 compressed output slots, it can hold more compressed summaries — which means downstream units get richer information packets, not just the latest raw report.

He considers the tradeoff through a professional lens: *This is exactly the buffer pool sizing problem. Smaller ingest buffer means higher eviction rate but faster throughput. Larger output buffer means more context available for compression quality.*

**Minute 1:15 — The Eviction Refinement**

Marcus clicks on the eviction policy section. He's been using "Lowest Priority" but wants more control. In Mission 7, the eviction policy card has expanded detail: below the three base options, a new subsection reads "PRIORITY WEIGHTS" — each signal type has a small horizontal slider from 0 to 10.

He configures:
- Commands: 10 (never evict if possible)
- Threat alerts: 8
- Recon observations: 5
- Routine signals: 2
- His own compressed output: 7 (he wants to keep his work products)

The eviction visualization updates: a small animation shows hypothetical entries arriving and the lowest-weighted ones gently fading out from the bottom of the stack. The animation runs for 2 seconds showing a realistic traffic pattern, then loops.

**Minute 2:00 — Cross-Blueprint Config**

Marcus opens his second relay, "Switchboard-4," which handles a different sector. He wants similar config but with different listen filters. He right-clicks on Switchboard-3's context config section header. A context menu appears:

- Copy Config
- Save as New Preset
- Reset to Default

He clicks "Copy Config." A clipboard icon briefly appears. He switches to Switchboard-4, right-clicks the config header, clicks "Paste Config." All settings transfer. Then he manually adjusts the listen filters — swapping `sector-alpha` for `sector-charlie`.

The preset label on Switchboard-4 reads "Custom (from Switchboard-3)." Marcus renames it by clicking the label — a text field appears — he types "SECTOR-C FILTER." Now his custom preset has a name. It appears in the preset selector alongside the built-in presets, marked with a small user icon to distinguish it from system presets.

**Minute 3:30 — The Sealed Watch Validation**

EXECUTE. Marcus watches his dual-relay pipeline in action. Switchboard-3 receives scout reports from sectors A and B, compresses them (its 4 compressed-output slots fill with rich summaries), and forwards to the Command unit. Switchboard-4 handles sectors C and D. Neither relay overloads — the 2 reserved slots he left provide headroom for burst traffic.

At tick 15, a coordinated enemy push floods sector A with contacts. Switchboard-3's context bar jumps from 6/12 to 10/12, then 11/12. The eviction animation fires — a routine signal fades from the bottom of the stack. The relay doesn't stun. It compresses the burst into a single dense summary and forwards it. The Command unit receives it, triggers a redeployment.

Marcus nods. *The reserved slots saved it. Two ticks of burst absorption before eviction kicks in. Same pattern as a message queue's prefetch buffer.*

**Minute 4:30 — Inspector Diagnosis**

In the Inspector, Marcus clicks Switchboard-3 and examines the context window at tick 15. Each slot shows its content: 6 raw signals (sector-A threat reports), 4 compressed summaries (from earlier ticks), 1 evicted-and-replaced routine signal (shown as a ghost outline with a strikethrough). The eviction priority weights he set are visible as small numbers next to each entry — the routine signal showing "2" was correctly identified as lowest priority.

He checks the compression quality metric: "Compression ratio: 6 raw → 1 summary, 83% information retention." He compares to his previous config where compressed output had only 2 slots: "Previous compression ratio: 4 raw → 1 summary, 71% retention." More output slots meant the relay could hold partial compressions longer, combining more data before forwarding. His buffer allocation change improved downstream intelligence quality.

**UI Annotations:**
- **Buffer allocation strip:** Horizontal bar, full width of config section (approximately 280px). Colored segments: green (observations), blue (incoming signals), orange (compressed output), grey (reserved). Draggable dividers between segments — 2px dark lines that expand to 4px with a grab cursor on hover. Numbers centered in each segment update in real-time.
- **Priority weight sliders:** 120px horizontal sliders with numeric readout (0-10). Grouped under the selected eviction policy. Each slider labeled with signal type name and colored dot. Drag feel: 10 discrete stops, subtle click at each position.
- **Copy/Paste context menu:** Standard right-click menu, 160px wide, dark navy background, teal text. "Copy Config" shows clipboard icon. "Paste Config" shows clipboard-with-arrow icon. "Save as New Preset" shows star icon.
- **Custom preset naming:** Clicking the preset label converts it to a text field with a blinking cursor. Max 20 characters. Enter to confirm, Escape to cancel. Custom presets show a small user silhouette icon to distinguish from system presets.
- **Eviction visualization:** 48px tall animation below eviction policy selection. Shows 6 miniature slot representations with colored entries arriving from the right and lowest-priority entries fading and dropping from the bottom. 2-second loop. Updates live when priority weights change.

---

#### Journey: Kai, 11, sixth grader, plays Minecraft and Roblox

**Context:** Mission 1, Ifugao rice terraces. Kai's first time playing Robot Uprising. He has never heard the term "context window" or "eviction policy." He chose Robot Uprising because the trailer showed robots fighting on rice terraces and he thought it looked cool.

**Minute 0:00 — The Boot Log**

Dark screen. Green text: "ATTENTION SUBSYSTEM ONLINE. Loading preset profiles..." Three cards fade in, side by side, with a gentle cascade animation (left, center, right, 200ms delay each):

**WIDE NET** — A Scout icon with many colored lines radiating inward. "Hears everything. Remember: hearing more means forgetting faster."

**FOCUSED** — A Scout icon with two bright lines and several dim ones. "Hears only threats and recon. Quieter mind, slower fill."

**STEALTH** — A Scout icon with no incoming lines, only outgoing. "Hears nothing from others. Maximum observation space. Lone wolf."

The boot log continues: "Select an attention profile for your Scout unit. Recommendation for this mission: WIDE NET." The word "WIDE NET" glows gold briefly.

**Minute 0:20 — The Obvious Choice**

Kai is on the workbench. His Scout blueprint is open. The context config section is a compact 48px strip showing the three preset cards horizontally. "WIDE NET" has a gold border (recommended). He clicks it. A satisfying snap sound plays — like plugging something in. The card's border solidifies and a small checkmark appears in the corner.

Below the cards, a simple visual appears: 6 small squares in a row (the context window), with a caption: "Memory: 6 slots. Profile: hears everything." The squares are empty — they'll fill during battle.

Kai doesn't think about this for more than 3 seconds. He's already looking at the cool Scout sprite on the board preview. He hits EXECUTE.

**Minute 0:45 — The Sealed Watch**

The battle plays. His scout moves across the rice terrace grid. The 6 pips below the scout start filling — green, green, blue, green, blue, green. All six full. On the next tick, the scout sparks and jitters — stunned. A small text floats up from the unit: "OVERLOADED" in amber. Kai's eyes widen. The scout can't move for one tick. An enemy striker moves one tile closer.

Next tick, the scout recovers. The context bar has dropped to 4/6 — the eviction policy dumped the two oldest entries. The scout sends a signal (green flash on the line to the striker ally) and moves. But it lost a tick, and the enemy is one tile closer than it should be.

The mission succeeds anyway — it's Mission 1, designed to be forgiving — but Kai saw the overload happen. He felt the one-tick stun as a moment of helplessness.

**Minute 1:30 — Post-Mission Curiosity**

The Inspector opens (simplified for Mission 1 — just arrow-key scrubbing and click-to-inspect). Kai scrubs to the overload tick. He clicks the scout. The context window panel shows 6 slots, all filled with colored entries. A caption reads: "Context window FULL. Unit stunned for 1 tick. 2 oldest entries evicted."

He scrubs back one tick. 5/6 full. Forward. 6/6. Forward. STUN. Forward. 4/6 (eviction happened). The pattern is legible even without understanding the mechanics: too full = bad.

**Minute 2:00 — The Return**

Back at the workbench for a retry. Kai looks at the preset cards again. He hovers over "FOCUSED." The tooltip reads: "Hears only threats and recon. Your scout will receive fewer signals, so its memory fills more slowly. Less chance of overload." He looks at the projected fill rate indicator — it's green for FOCUSED, amber for WIDE NET.

He switches to FOCUSED. Clicks. Snap sound. The preset label updates. He hits EXECUTE again.

This time, the scout's context bar fills more slowly. It reaches 4/6 by tick 8 instead of 6/6 by tick 5. No overload. No stun. The scout moves smoothly, sending threat reports to the striker. Mission completes faster.

Kai doesn't know what "eviction policy" means. He doesn't know what "buffer allocation" means. But he knows that FOCUSED prevented the sparking-jitter thing, and he has a faint intuition that *how much the scout listens to* affects *how fast its memory fills up.* That intuition is the seed that will grow into full context config mastery over the next 9 missions.

**Minute 2:30 — Resolution**

Kai thinks: *Next mission, I'll try STEALTH and see if the scout works better alone.* He's already forming hypotheses about the attention spectrum — wide listening vs. narrow listening, even without the vocabulary.

**UI Annotations:**
- **Preset cards (Mission 1):** Three cards, each 80px wide × 40px tall. Unit icon (16px) on the left. Preset name in 11px DM Sans bold. One-sentence description in 9px DM Sans regular. Recommended preset has gold border and small "REC" badge. Non-selected cards have 1px grey border. Selected card has 2px teal border with checkmark in top-right corner.
- **Snap sound:** Short, crisp "click-lock" audio (like a USB connector seating), 100ms, plays on preset selection.
- **Context window preview:** 6 small squares (8px each, 2px gap) in a horizontal row below the preset cards. Empty = dark grey outline. Filled = solid color matching data type. Caption below in 9px grey text.
- **Overload float text:** "OVERLOADED" in amber, 12px bold, floats up from the unit sprite over 600ms, fades at 400ms. Accompanies the jitter/spark animation on the unit itself.
- **Projected fill rate indicator:** 4px bar below context window preview. Updates immediately on preset change. Color: green (safe), amber (moderate), red (dangerous). Tooltip on hover: "Estimated memory fill speed based on current attention profile."

---

#### Journey: Dr. Reyes, 45, CS professor, teaches distributed systems

**Context:** Mission 9, Zambales volcanic coast. Dr. Reyes has unlocked everything including advanced context config options. She's designing a fault-tolerant relay network for a mission with heavy enemy EM jamming. She wants conditional listen filters — a feature just unlocked this mission.

**Minute 0:00 — The Advanced Config**

Dr. Reyes opens her primary relay blueprint "Batangas." The context config section is fully expanded to its Mission 9 height (248px). Below the familiar subsections (buffer allocation, listen filters, eviction policy), a new subsection glows with the cyan unlock pulse: "CONDITIONAL FILTERS."

The boot log had explained: "ADVANCED COGNITION ONLINE. Your units can now modulate their attention based on internal state. Condition: buffer fill level. Action: enable or disable channel listening. Your relay can choose to stop listening when its memory is nearly full — preserving capacity for high-priority signals."

**Minute 0:30 — Configuring Conditional Attention**

The conditional filters interface shows a rule-builder format, consistent with the rules section she already knows:

```
WHEN [buffer fill] [>] [75%] THEN [ignore] [channel: logistics]
```

Each bracketed element is a dropdown or input. She configures:
- WHEN buffer fill > 75% THEN ignore channel `routine-updates`
- WHEN buffer fill > 90% THEN ignore channel `recon-net`
- WHEN buffer fill < 50% THEN listen channel `recon-net`

The third rule re-enables listening when pressure drops — creating a hysteresis loop. The listen filter toggles above now show a small condition icon (a tiny diamond with a percent sign) next to the channels that have conditional overrides, indicating they're no longer simple on/off switches.

Dr. Reyes smiles. *This is exactly how we design adaptive load shedding in distributed systems. Shed low-priority traffic first, then medium, then re-enable in reverse order as pressure drops.*

**Minute 1:15 — The Eviction Callback**

She scrolls to the eviction policy section. Below the priority weights she configured missions ago, another new feature: "EVICTION CALLBACKS." A toggle and a hook slot:

```
ON EVICTION → fire hook [memory-pressure] on channel [system-health]
```

She enables it and types "system-health" as the channel name. Now, every time Batangas evicts an entry from its context window, it will broadcast a "memory-pressure" signal on the system-health channel. Her other relays — configured to listen to system-health — can react by reducing their own output rate, creating back-pressure through the entire pipeline.

The channel map panel (read-only, auto-generated at the bottom of the workbench) updates: a new "system-health" channel appears with a small orange badge reading "EVICTION-TRIGGERED." Lines connect from Batangas to the two downstream relays that are already configured to listen on system-health.

**Minute 2:00 — The Meta-Architecture**

Dr. Reyes steps back and looks at her architecture. She has built:

1. Scouts that feed three relays
2. Relays with conditional listen filters that shed load under pressure
3. Eviction callbacks that create back-pressure signals
4. A Command unit that monitors system-health and can reroute traffic away from overloaded relays

This is a distributed system with admission control, back-pressure, load balancing, and health monitoring. She built it entirely from context config primitives — no special skills, no extra units, just careful configuration of attention and memory management.

She opens the Space-bar overlay to see the board. Ghost units show perception radii and channel wiring. The system-health channel's lines glow orange, connecting the relays in a feedback loop. She sees the architecture as a living diagram — not a static blueprint, but a reactive system that will adapt to whatever the enemy throws at it.

**Minute 3:00 — Sealed Watch Vindication**

EXECUTE. The enemy launches a noise-flooding attack — EM jammers broadcast garbage signals on all channels. Her scouts' context bars start climbing. But the conditional filters engage: at 75% fill, the relays stop listening to routine updates. At 90%, they stop listening to recon-net entirely, processing only threat alerts and commands. The eviction callbacks fire — orange flashes on the system-health channel lines. The Command unit sees the pressure signals, reroutes scout output to the less-loaded relay.

The enemy noise flood fails. The relays never overload. The architecture absorbs the attack through graceful degradation — exactly the pattern Dr. Reyes teaches in her graduate seminar.

She'll export this replay and use it in class next week. The context config interface is a visual representation of concepts she usually explains with dry architecture diagrams. Here, the students will watch the back-pressure signals propagate in real-time and see the conditional filters engage under load. Better than any slide deck.

**UI Annotations:**
- **Conditional filter rule builder:** Each rule is a horizontal row, 36px tall. WHEN/THEN keywords in 10px teal small-caps. Dropdowns have dark navy background with teal border, 12px DM Sans. The condition dropdown shows buffer-fill percentage as a small inline gauge that mirrors the current config. Add-rule button: "+" in a dashed circle below the last rule.
- **Condition icon on listen filters:** 12px diamond with "%" glyph, positioned right of the toggle switch on channels that have conditional overrides. Hover tooltip: "This channel has conditional rules — it may be automatically enabled or disabled based on buffer state."
- **Eviction callback config:** Toggle switch + hook slot input. The hook slot input is a text field matching the hook section's styling (consistent UI language). Channel name auto-completes from existing channels but allows new names. The channel map panel updates immediately.
- **System-health channel in channel map:** Orange-tinted line (distinct from standard teal signal lines and red threat lines). Small "EVT" badge on the line indicating eviction-triggered origin. Animated pulse every 2 seconds showing the potential flow direction.

---

## Strengths and Weaknesses Summary

| Criterion | A: Blank Slate | B: Presets Only | C: Starter Kit | D: Growing Config |
|-----------|---------------|----------------|----------------|-------------------|
| Onboarding friction | Very high | Very low | Low | Minimal |
| Mastery ceiling | Maximum | Low | High | Maximum+ (advanced options) |
| Teaching clarity | Sink-or-swim | Names only | Gradual if discovered | One concept per unlock |
| Workbench complexity at M1 | 200px of empty fields | 48px of cards | 48-200px depending on expansion | 48px of cards |
| Workbench complexity at M10 | 200px always | 48px always | 200px if expanded | 248px + advanced |
| Transferable skills taught | All, immediately | None (preset names are game-specific) | All, if player expands | All, progressively |
| "My custom config" moments | Immediate | Never | When expanded | Starting Mission 3 |
| Implementation effort | Low | Low | Medium | High |

## Interaction Effects

**x Skills (3.01a Skill Parameterization Depth):** Context config follows the same progressive disclosure pattern recommended for skill parameters. Option D aligns perfectly with the "Growing Dial" recommendation for skills — both systems start simple and add controls as the campaign progresses. The workbench grows in two dimensions simultaneously (skills getting parameters, context config getting controls), and the growth rate must be coordinated so the player isn't hit with both at once. Recommendation: stagger unlocks — skill parameters in odd missions, context config controls in even missions.

**x Rules (3.07):** Listen filter configuration is closely related to rule conditions. A rule that says "IF signal-type = threat THEN engage" and a listen filter that ignores non-threat channels achieve similar outcomes through different mechanisms. The game must make this distinction legible: listen filters control what ENTERS the context window, rules control what the unit DOES with what's already in the window. The boot log at Mission 3 should explicitly teach this: "Filters decide what your unit hears. Rules decide what it does about what it heard."

**x Context Overload (locked mechanic):** Presets are balanced around overload prevention. WIDE NET on a 6-slot Scout WILL overload in a noisy environment — that's intentional. The game wants the player to experience overload with the "safe" preset and then learn to customize. If all presets prevent overload, the core mechanic never teaches.

**x Inspector (4.04):** The Inspector must display context config state alongside context window contents. When a player clicks a unit and sees a full context window, they need to see which listen filters were active, what eviction policy was running, and how buffer allocation shaped the contents. The Inspector is where config decisions become legible retroactively.

**x Command Agent (locked):** The Command unit's "prioritize" skill interacts with eviction policies — it can override a subordinate's eviction priorities. With Option D's advanced config, a Command unit with an eviction callback creates a self-monitoring hierarchy: the Command watches its subordinates' memory pressure and adjusts priorities dynamically. This is the meta-level the game promises.

**x Copy-Paste (3.07b):** Context config should be included in the copy-paste system. Copying a relay's config to another relay is a natural workflow. Custom presets (as in Marcus's journey) are the config equivalent of blueprint library entries.

## Comparable Games

**Factorio's Inserter Filter Presets:** Factorio inserters have a "set filter" option that starts simple (pick an item) but scales to complex logic with circuit network conditions. New players just pick items. Veterans wire inserters to circuit networks for conditional behavior. The same physical object serves both audiences through optional complexity depth. Robot Uprising's context config presets serve the same function — the object is the same, but the depth of control scales with the player.

**Slay the Spire's Deck Size as Implicit Context Config:** In Slay the Spire, your deck size IS your context window. A small deck (15 cards) means you see your key cards every few turns — focused attention. A large deck (35 cards) means diluted draws — wide attention. Players learn this implicitly, not through a config panel. Robot Uprising makes the same concept explicit and configurable, which is more teachable but less elegant.

**StarCraft Control Groups as Preset-Like Shortcuts:** SC2 control groups (Ctrl+1 to assign, 1 to select) start as a convenience feature and become a core execution skill. The preset→custom progression in Option D works similarly — presets are training wheels that veterans eventually bypass but never lose access to.

**Zachtronics's Component Libraries:** In Shenzhen I/O, players build custom reusable components from primitive operations. There are no presets — everything is built from scratch. This is Option A and it works for Zachtronics's audience (engineers who enjoy constraint optimization). Robot Uprising's broader audience needs the on-ramp that presets provide.

## Sensory Description

**Preset cards (Mission 1-2):** Three rounded rectangles on a matte dark-navy background. Each card shows the unit's silhouette icon in grey-teal, with colored lines radiating inward (many for Wide Net, few for Focused, none incoming for Stealth). The active preset has a 2px teal border that brightens to gold on selection. Selection plays a short, satisfying "plug-in" click — metallic, 80ms, slightly reverbed as if inside a machine housing. The projected fill rate bar below shifts color smoothly over 300ms.

**Expanded manual controls (Mission 5+):** The config section unfolds downward with a 200ms ease-out animation — like a drawer sliding open. The buffer allocation strip is a horizontal bar of colored segments that respond to dragging with a smooth, magnetic feel — the boundaries resist slightly at round numbers (50/50, 75/25) before snapping past. Dragging produces a faint mechanical whir sound, like adjusting a dial on old radio equipment. Numbers update with a soft typewriter click per digit change.

**Conditional filter activation during battle:** When a conditional filter engages (buffer hits the threshold), the affected channel's signal line on the board dims from full brightness to 20% opacity over 400ms, accompanied by a descending two-note chime — a minor third interval, quiet, almost subliminal. When the channel re-enables (buffer drops below the restore threshold), the line brightens with an ascending two-note chime — the same interval inverted. The sound design reinforces the hysteresis: the system is breathing, load-shedding and recovering.

**Eviction callback signals during battle:** Orange pulses on the system-health channel lines — distinct from green (normal signal delivery) and red (combat). The orange has a warm, amber quality, like a warning light on a dashboard rather than an emergency. The pulse is slower than combat flashes (800ms vs. 200ms), communicating "this is a status update, not an emergency." Audio: a low, resonant hum, like a server room's UPS alarm — functional, not dramatic.

## The TikTok Clip

Fifteen seconds: A relay's context bar climbs toward full. At 75%, one signal line dims (conditional filter engaged) — descending chime. At 90%, a second line dims — another chime, lower. Orange pulses ripple outward on system-health lines to neighboring relays. The Command unit receives the pressure signal, reroutes traffic — a signal line physically bends from the overloaded relay to a fresh one. The original relay's bar drops. Both dimmed lines brighten back — ascending chimes. The relay is breathing again. Caption: "I built an AI that manages its own attention under pressure."

## Recommendation

**Option D: "The Growing Config"** is the clear winner. It delivers zero onboarding friction (presets only in Missions 1-2), progressive mastery (one new concept per unlock), and maximum depth (conditional filters and eviction callbacks in late game). It aligns with the locked progressive unlock philosophy across skills and rules, teaches real agentic AI engineering concepts in the exact order a practitioner would learn them (listen first, then eviction, then allocation, then adaptive behavior), and creates the meta-level promise where context management itself becomes a designable system.

The key implementation detail: presets must be intentionally imperfect. WIDE NET on a Scout must lead to overload in Mission 2's noisy environment. If presets always work, players never learn to customize. The game must create the problem before offering the tool.

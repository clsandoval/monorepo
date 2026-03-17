# 8.03b — The Inspector as Universal Substrate

**Aspect:** Which Inspector features are core (present in all configurations/modes) vs. mode-specific (only in competitive, sandbox, or narrative)? The Inspector is the one system all five configurations rely on — but they rely on it differently. This analysis maps every Inspector feature to its configuration dependency, identifies the universal kernel, and explores how the Inspector adapts its presentation without changing its underlying data model.

**Parent:** 8.03 — Full Game Configurations
**Related:** 4.04b — Two-Act Debrief Structure; 8.09 — Diagnostic Layer as Teaching Mechanic; 4.20 — Counterfactual Simulation; 4.16 — Signal Genealogy; 4.36 — Multi-Scenario Fix Explorer; 8.04 — Minimum Viable Game

---

## The Core Insight

The Inspector is the only screen that appears in *every* configuration, *every* mode, and *every* skill level. Plan screens vary (sentence strips vs. node graphs vs. card stacks). Sealed watch varies (sealed vs. speed-controllable). Campaign structure varies (linear vs. branching vs. sandbox). But the Inspector — the post-battle analytical phase — is always present. It is the substrate upon which Robot Uprising's entire pedagogical and competitive architecture rests.

This creates a design constraint: **the Inspector must be simultaneously the simplest screen for a first-time player in Mission 1 and the deepest screen for a Diamond-ranked competitive player 200 hours in.** The mechanism for this is not "two different Inspectors" — it's one Inspector with a progressive disclosure model that reveals layers based on context.

The question is: which layers are bedrock (always present, never removable) and which are sediment (deposited by mode, campaign progress, or player preference)?

---

## Complete Inspector Feature Inventory

Every Inspector feature that has been explored across the design space, categorized by its universality:

### Tier 1: Bedrock Features (Present in ALL configurations)

These features define what the Inspector IS. Removing any of them breaks the core teaching loop.

| Feature | What It Does | Why It's Universal |
|---------|-------------|-------------------|
| **Timeline Scrubber** | Step through any tick with arrow keys or click | Without temporal navigation, the Inspector is just a results screen. Every configuration needs "go to the moment that mattered." |
| **Click-to-Inspect** | Click any unit to see its state at the current tick | The fundamental interaction: "what was this unit thinking?" All modes require this for learning. |
| **Context Window State** | Each slot shows content type, source, age, whether it was used in a decision | The core data visualization. "My scout's memory had noise in slot 3" is the universal diagnostic unit. |
| **Decision Trace** | Which rule matched this tick, what context entries it evaluated, why this action was chosen | The causal chain: unit did X → because rule Y → because data Z → because signal from W. Without this, the Inspector doesn't teach. |
| **Context Window Utilization Chart** | Sparkline of context fill over all ticks (green/amber/red) | The at-a-glance health monitor. Every player, every mode, needs to see "when did the buffer spike?" |
| **Event Log** | Timestamped signal events (T12 recon-net → SENT, T13 threat detected) | The chronological record. Simple text log. Present from Mission 1. |
| **Signal Chain Visualization** | Colored dashed lines showing active channel communications during the inspected tick | Visual trace of information flow. The "subway map" of what's talking to what at this moment. |

**The Bedrock Inspector is approximately what Into the Breach offers:** a scrubber, a click-to-inspect, a state display, and a trace. It fits on one screen. A 10-year-old can use it. A professor can teach with it.

### Tier 2: Campaign-Progressive Features (Unlock via mission progression)

These features appear as the player's vocabulary grows. They are present in all configurations but gated behind campaign progress (or equivalent unlock in sandbox mode).

| Feature | Unlocks At | What It Adds |
|---------|-----------|-------------|
| **Buffer State History** (expanded view) | Mission 3 (after hooks are introduced) | Per-slot timeline showing when each entry arrived, was used, was evicted. Transforms context window from snapshot to narrative. |
| **Channel Metrics** | Mission 5 (factory + multi-channel) | Per-channel message count, delivery rate, average latency. "The 'intel' channel delivered 23 signals, average 2.1 tick latency." |
| **Diagnostic Ring** (expanded) | Mission 5 | The condensed buffer arc from sealed watch expands to show individual slot states on hover. Bridges Act 1 → Act 2 visually. |
| **Signal Genealogy** (basic) | Mission 6 (multi-hop architectures) | Click a signal → see its origin, every relay it passed through, every transformation applied. "This signal started as enemy_spotted at tick 4, was compressed at tick 6, was filtered at tick 7." |
| **EM Emission Overlay** | Mission 7 (when EM detection becomes relevant) | Toggle showing EM radiation halos around transmitting units. "My relay mesh is broadcasting a 4-tile glow." |

### Tier 3: Mode-Specific Features (Only in certain configurations/modes)

These features are NOT universal. They exist in specific game modes and would be inappropriate, confusing, or meaningless in others.

| Feature | Mode | Why Mode-Specific |
|---------|------|-------------------|
| **Counterfactual Simulation** ("what if?") | Competitive (Config 3), Sandbox (Config 4) | Requires deterministic execution to be meaningful. In narrative mode (Config 2, 5), counterfactual breaks emotional framing — "what if Talim hadn't died" undermines the sealed watch's emotional weight. In competitive mode, it's the primary analytical tool. In sandbox, it's the experimentation engine (fork-and-re-run). |
| **Gold Pivot Diamond** | Competitive (Config 3), Advanced Campaign (Mission 8+) | Marks the "effective outcome determination" tick. Irrelevant in tutorial missions where the outcome is pedagogically designed. Premature in early campaign where players don't yet understand what "pivot" means. |
| **False Pivot Markers** (grey diamonds) | Competitive (Config 3) | Advanced interpretive overlay. Only meaningful for players who understand the distinction between apparent and genuine turning points. |
| **Career Stats Panel** | Competitive (Config 3) | Win-rate by architecture type, opponent archetype tagging, season trends. Meaningless without a competitive context. |
| **Opponent Analysis** | Competitive (Config 3) | Post-match opponent config inspection (delayed reveal). Only exists in PvP. |
| **Fork-and-Re-Run** | Sandbox (Config 4) | Click any tick → modify config → re-simulate. The Inspector becomes a simulation laboratory. Absent from sealed/competitive modes where modification would break match integrity. |
| **AI Advisor Annotations** | Sandbox (Config 4, with hybrid intelligence) | Dashed-border suggestions in the Inspector: "Your relay's compress fired 3 ticks late. Consider adding a priority rule." Only in modes where the advisor is enabled. |
| **Character Voice Overlay** | Narrative (Config 2, 5) | Decision traces wrapped in first-person: "I saw three enemies but I could only remember two..." Absent from technical modes (Config 1, 3) where personality framing would obscure the mechanical trace. |
| **Cultural Context Annotations** | Cultural (Config 5) | "Talim detected the enemy at the rice terrace perimeter — the same boundary that Ifugao warriors defended for centuries." Absent from all non-narrative modes. |
| **Multi-Scenario Fix Explorer** | Advanced Competitive (Config 3, post-campaign) | MSMFE finds the single config change improving pass rate across multiple failing scenarios. Requires a large match history. Absent from campaign. |
| **Probe Hooks** | Advanced Campaign (Mission 8+), Competitive | Player-placed diagnostic hooks that capture state without affecting execution. A debugging tool. Too complex for early campaign. |
| **Pre-Ranking Transparency Panel** | Advanced Competitive | Explains why the Fix Explorer ranked candidates the way it did. Only meaningful with 30+ matches of context. |
| **Signal Genealogy** (full graph) | Advanced Campaign (Mission 8+), Competitive, Sandbox | The full interactive graph with branching, merging, and transformation chains. Basic genealogy (Tier 2) shows a linear trace; full genealogy shows the complete network topology of a signal's journey. |

---

## The Progressive Disclosure Architecture

The Inspector doesn't have "modes" in the user-facing sense. It has a **feature surface** that grows based on three independent axes:

1. **Campaign Progress Axis:** Missions 1-4 reveal Tier 1 features incrementally (Mission 1 = scrubber + click-to-inspect only; Mission 2 = decision trace; Mission 3 = buffer history; Mission 4 = event log + signal chains). Missions 5-7 reveal Tier 2. Missions 8-10 reveal applicable Tier 3 features.

2. **Mode Axis:** Entering Sandbox unlocks fork-and-re-run. Entering Ranked unlocks career stats, opponent analysis, and competitive diagnostics. Entering Culture mode enables character voice and cultural annotations.

3. **Player Preference Axis:** A toggle (accessible from Settings or the Inspector toolbar) lets the player show/hide any unlocked feature. A "Minimal" preset strips to Tier 1 only. A "Full" preset enables everything unlocked. A "Custom" mode lets the player toggle individual features.

These three axes create a **feature lattice** — the intersection of {campaign stage} × {mode} × {preference} determines exactly which Inspector features are visible at any moment.

### The "Analytical Index" as Feature Trigger

From 8.03a, the adaptive tonal system tracks player behavior (Inspector time, skip rate, retry count) to determine the player's analytical engagement. This same signal can gate Inspector feature introduction:

- A player who spends 45 seconds in the Inspector after each mission gets Tier 2 features earlier (Mission 4 instead of Mission 5).
- A player who skips the Inspector entirely (taps through to retry) gets gentler feature introduction with guided callouts.
- A player who clicks every unit and scrubs every tick gets advanced features with minimal tutorial framing.

The Inspector adapts not just its content but its *teaching posture* based on how the player engages with it.

---

## The Bedrock Data Model

Critically, the underlying data model is universal regardless of which features are displayed. Every match — tutorial, competitive, sandbox, narrative — generates the same simulation log:

```
Per-tick, per-unit:
  - context_window_state: [slot_0..slot_N] each with {content, source, age, type, weight, used_in_decision}
  - rule_evaluation: [{rule_id, condition, result, context_entries_evaluated}]
  - action_taken: {type, target, result}
  - signals_sent: [{channel, content, recipients}]
  - signals_received: [{channel, content, source, hop_count, latency}]
  - em_emission: {radius, intensity}
  - status: {alive, stunned, overloaded}
```

This log is the **universal substrate**. Every Inspector feature is a *view* into this log. The timeline scrubber indexes by tick. Click-to-inspect filters by unit. Signal genealogy follows signal chains across units and ticks. Counterfactual simulation replays with a modified log. Career stats aggregate across logs.

The implication: **the game never needs two different Inspector codebases.** One data model, one rendering pipeline, many feature toggles. This is architecturally clean and keeps the Inspector internally consistent across all modes.

---

## How Each Configuration Experiences the Inspector

### Configuration 1: "The Clockwork" — Inspector as Debugger

The Inspector is a **precision instrument**. The player approaches it like a software debugger: set a breakpoint (click a tick), inspect state (click a unit), trace causality (follow the decision chain). The dominant features are decision trace, buffer state history, and signal genealogy. The Inspector is cold, clinical, and maximally transparent. No character voice, no cultural annotation, no advisor. Just data.

**Sensory character:** Dark navy background. Monospace font for the decision trace. Context window slots rendered as horizontal bars with precise hex-color coding per content type. Signal genealogy as a directed graph with labeled edges showing transformation type and latency. The sound of scrubbing: a soft click per tick, like a mechanical counter.

### Configuration 2: "The Greenhouse" — Inspector as Story Reader

The Inspector shows the same data wrapped in **character voice**. Decision traces become first-person narratives: "I saw the enemy at B5 but my memory was full of old patrol data. I couldn't remember the important thing." The context window is still 6 slots with content, source, and age — but hovering shows the unit's "feeling" about each entry. The signal genealogy is simplified to a linear trace with character commentary at each hop.

**Sensory character:** Warm amber background matching the workbench. Rounded UI elements. The unit's portrait appears large in the Inspector panel, with the context window arranged around it like thought bubbles. The event log uses the unit's voice. Ambient audio shifts to a quieter, reflective version of the biome's soundscape. The sound of scrubbing: a soft page-turn per tick.

### Configuration 3: "The War Room" — Inspector as Intelligence Tool

The Inspector is an **adversarial analysis platform**. Post-match, the player sees their own side first. After a delayed reveal (5 ticks of scrubber unlock per second), the opponent's side becomes inspectable. Career stats appear in a sidebar: "Your Stealth-Aggression architecture: 67% WR. Strongest vs. Relay-Heavy (82%)." Counterfactual simulation is front-and-center: "What if you had rerouted at tick 15?" The gold pivot diamond anchors the analysis.

**Sensory character:** Dark background with bright signal indicators. Split-screen available (your units left, opponent's right). The decision trace is terse and technical — no personality, no metaphor. The signal genealogy shows both sides' signal networks with a "fog boundary" where your detection stopped. The career stats panel glows with ranked ELO color (bronze/silver/gold/diamond). The sound of scrubbing: a sharp tick, like a clock hand advancing.

### Configuration 4: "The Laboratory" — Inspector as Sandbox

The Inspector is an **experimentation workbench**. Fork-and-re-run is the primary interaction: click any tick, modify any config parameter in a split-panel editor, hit "Re-simulate" and watch the divergence. The AI advisor annotations appear in the margin: "Your relay's compress timing left a 3-tick window. Consider: priority 1 rule for time-sensitive data." The Inspector IS the game — the sealed watch is just a data collection phase.

**Sensory character:** Light background with high contrast for readability. The split-panel editor mirrors the plan screen's workbench on the right, with the timeline on the left. Forked simulations appear as branching timelines (like git branches). Each branch is color-coded. The signal genealogy is an interactive node graph that the player can rearrange. The sound of forking: a crystalline "branch" chime. The sound of re-running: a compressed tick sequence (all ticks play in 2 seconds).

### Configuration 5: "The Archipelago" — Inspector as Cultural Document

The Inspector wraps analytical data in **cultural metaphor**. Signal latency annotations reference historical trade routes: "This signal traveled 3 hops — the same number of island crossings between Cebu and Mindanao in pre-colonial trade." Buffer eviction is framed as memory: "Lapu-Lapu forgot the oldest observation to make room for the urgent threat — the alaala (memory) fills, the less important fades." The Filipino language toggle applies to all Inspector text.

**Sensory character:** Rich, saturated backgrounds matching the current province's biome. Traditional pattern borders (T'nalak weaving, okir carving) frame the Inspector panels. The context window uses culturally resonant color associations. The signal genealogy trace follows the visual language of the archipelago map — island-to-island connections rendered as the same circuit-board cables. Province-specific ambient audio continues (quieter) during inspection. The sound of scrubbing: a soft kulintang note per tick, in the key of the current province's instrument.

---

## The Universal-to-Specific Gradient

Visualized as concentric rings:

```
┌─────────────────────────────────────────────────────────┐
│                    OUTER RING (Tier 3)                   │
│  Counterfactual · Career Stats · Fork-and-Re-Run        │
│  Character Voice · Cultural Annotations · Probe Hooks   │
│  Fix Explorer · Pre-Ranking Panel · Opponent Analysis    │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              MIDDLE RING (Tier 2)               │   │
│   │  Buffer State History · Channel Metrics         │   │
│   │  Diagnostic Ring (expanded) · Signal Genealogy  │   │
│   │  EM Emission Overlay                            │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │         INNER CORE (Tier 1)             │   │   │
│   │   │  Timeline Scrubber · Click-to-Inspect   │   │   │
│   │   │  Context Window State · Decision Trace  │   │   │
│   │   │  Utilization Chart · Event Log          │   │   │
│   │   │  Signal Chain Visualization             │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

The inner core is **the Inspector**. Everything else is a lens applied to the Inspector based on context.

---

## Design Tensions

### Tension 1: Character Voice vs. Mechanical Clarity

Configuration 2's character voice ("I saw three enemies but could only remember two") is compelling for emotional connection but **actively misleading** for debugging. The relay didn't "choose" to forget — its FIFO eviction policy discarded the oldest entry. The character framing implies intentionality that doesn't exist.

**Resolution options:**
- **A. Dual-layer display.** Character voice as the primary text, with a "[show technical]" toggle revealing the raw decision trace beneath. The player can flip between "Talim's story" and "Rule 2 evaluated TRUE."
- **B. Voice fade.** Character voice is prominent in Missions 1-4, fades to parenthetical by Mission 7, and is absent by Mission 10 (or toggleable from Settings). The player outgrows the narrative scaffolding.
- **C. Voice as annotation, not replacement.** The technical decision trace is always shown. Character voice appears as a grey italicized annotation above or below the trace. Never replaces the mechanical truth.

**Recommendation:** Option B for campaign flow, Option A as a persistent toggle. The character voice is training wheels — warm, inviting, pedagogically valuable. But the player must eventually see the mechanism, and the mechanism must always be accessible.

### Tension 2: Counterfactual in Narrative Mode

Counterfactual simulation ("what if I had rerouted at tick 15?") breaks the sealed watch's emotional contract. If the player can rewrite history, the sealed watch's permanence — "what happened, happened" — is undermined. But counterfactual is also the deepest learning tool.

**Resolution:** Counterfactual is gated behind the **Inspector's analytical mode**, which is already post-seal-break. The emotional contract of Act 1 (sealed watch) is preserved because counterfactual only exists in Act 2. The tension is between "the result was real" (emotional weight) and "I could have changed it" (analytical power). The two-act structure already solves this: Act 1 says "this happened." Act 2 says "here's why, and here's what you could change next time." Counterfactual lives firmly in Act 2 across all modes, but is hidden in early campaign (Missions 1-7) and in narrative-primary modes unless the player explicitly enables it.

### Tension 3: Inspector Complexity vs. Onboarding Gentleness

A new player's first Inspector experience (Mission 1) must be: click a unit, see 6 colored slots, read one sentence about what happened. That's it. Seven features, zero cognitive load beyond "what did my robot see?"

A veteran's Inspector experience (Mission 10, Ranked) includes: timeline scrubber, click-to-inspect, full buffer history, signal genealogy graph, channel metrics, EM overlay, diagnostic ring, gold pivot diamond, false pivot markers, counterfactual simulation, career stats, opponent analysis, probe hooks, pre-ranking transparency, Fix Explorer. **Fifteen+ features.**

The distance between these two states is enormous. The progressive disclosure model must bridge it without the player ever feeling "the game dumped a new screen on me."

**Resolution: The "One New Thing Per Mission" rule.** Each mission introduces at most one new Inspector feature, with a brief callout (diegetic boot-log: "DIAGNOSTIC_MODULE: buffer history now available. Click any slot → see when it arrived."). The player's Inspector grows by one feature per mission across 10 missions. By Mission 10, the full Tier 1 + Tier 2 surface is revealed. Tier 3 features gate behind mode transitions (entering Ranked, enabling Sandbox, etc.) and are announced with similar callouts.

### Tension 4: The Inspector in Speedrun/Skip Culture

Some players will never use the Inspector. They'll hit "retry" the moment the sealed watch ends. This is a real pattern (the "skip debrief" behavior seen in auto-battlers and roguelikes).

**Resolution options:**
- **A. Make Inspector mandatory** for the first N missions (locked retry button until 30 seconds of Inspector time). Risk: frustrating impatient players.
- **B. Embed Inspector insights into the retry flow.** The retry button shows a 1-line summary: "Your relay overloaded at tick 12. Tap to see why →" The summary IS the Inspector in micro-form. Players who tap go to the full Inspector. Players who ignore still received the diagnostic nugget.
- **C. Design missions that are unsolvable without Inspector use.** Mission 3's puzzle requires identifying which context slot contained stale data. You can't fix the config without inspecting the buffer. The Inspector is the gameplay, not the postgame.

**Recommendation:** Combination of B and C. Never force time-in-Inspector, but make certain missions require Inspector insights to progress (the answer to "why did I fail?" is only visible in the Inspector). And always surface a 1-line diagnostic on the retry screen.

---

## Player Journeys

### Journey: Elena, 28, UX Designer, First Playthrough (Configuration 2: Greenhouse)

**Context:** Mission 3 (Blind Spots), first time hooks have gone wrong. Two scouts, one relay, one striker. The relay overloaded and the striker never received targeting data. She's staring at the Inspector for the second time.

**Minute 0:00 — The Sealed Watch Aftermath**

The sealed watch ended badly. Elena watched her relay's buffer bar shift from blue to amber to angry pulsing red over 4 ticks. The relay sparked, jittered, froze for 1 tick. During that frozen tick, an enemy moved adjacent to her unwarned striker. Red flash. Mission failed.

The seal breaks. The timeline scrubber materializes — a horizontal strip of tick pips at the top, with the current tick highlighted in gold. The Inspector sidebar slides in from the right, showing the relay's portrait (a dish-shaped unit named "Datu") with a warm amber background. Below the portrait: "Datu has something to tell you."

**Minute 0:15 — Click-to-Inspect (Tier 1)**

She clicks Datu on the board. The context window appears — 12 horizontal slots arranged vertically. At the current tick (tick 14, the overload tick), all 12 are filled. Each slot shows a small icon and a colored background:

- Slots 1-4: 👁 icons, green backgrounds — "enemy_spotted" entries from Scout-1, ticks 8-11
- Slots 5-8: 👁 icons, green backgrounds — "enemy_spotted" entries from Scout-2, ticks 9-12
- Slots 9-10: 📡 icons, yellow backgrounds — compressed summaries from its own compress skill, ticks 10-11
- Slots 11-12: 🔴 icons, red backgrounds — "noise" entries from ambient sensor static, ticks 12-13

The character voice annotation floats above the window: *"I tried to listen to everyone at once. Both scouts kept talking. I couldn't forget the old messages fast enough."*

Elena's eyes go to the noise entries. Two of Datu's 12 slots are occupied by noise — sensor static that serves no purpose. She hovers over slot 11. A tooltip shows: `noise | source: ambient | age: 2 ticks | used in decision: NO`. The grey "used in decision: NO" indicator tells her this slot is wasted space.

**Minute 0:45 — Decision Trace (Tier 1)**

She clicks the "Why?" tab below the context window. The decision trace for tick 14 reads:

> **Rule 1:** IF buffer_full AND incoming_signal → EVICT oldest entry
> **Evaluated:** TRUE (buffer 12/12, incoming signal from Scout-1 at tick 14)
> **Evicted:** Slot 1 (enemy_spotted from Scout-1, age 6 ticks)
> **But:** New incoming signal + eviction + compress backlog = overload threshold exceeded
> **Result:** STUNNED for 1 tick

The character voice: *"I was doing my best. But when Scout-1 sent another message while I was already full, I had to throw away my oldest memory just to hear it. That pushed me over the edge."*

Elena understands. The relay was receiving from two scouts simultaneously. Each scout sends enemy_spotted every tick. That's 2 signals per tick into a 12-slot buffer, with compress reducing 4→1 but needing 3+ entries to trigger. The pipeline can't keep up during a dense engagement.

**Minute 1:15 — The Context Utilization Chart (Tier 1)**

She glances at the sparkline in the lower-left corner of the Inspector panel. It shows Datu's buffer fill across all 20 ticks: flat at 2/12 for ticks 1-7 (cool blue), then a sharp ramp from tick 8 (when both scouts started detecting enemies), climbing through amber to red, peaking at 12/12 at tick 14. The "overload" moment is a visible spike — the sparkline goes from green to red in 6 ticks.

She scrubs the timeline back to tick 7 (the last "safe" tick). Datu's buffer: 2/12. Calm. She scrubs forward tick by tick, watching the slots fill one by one. Tick 8: slot 3 fills (green). Tick 9: slots 4 and 5 fill (both green — both scouts detected simultaneously). Tick 10: compress fires on slots 1-4, collapsing them to 1 summary. Buffer drops to 3/12. But tick 11: 2 more incoming signals. Tick 12: 2 more. Tick 13: compress fires again but only gets 3 entries (needs 3+), collapses to 1. Not enough. Tick 14: the noise entries arrive, filling the last 2 slots. Overload.

**Minute 2:00 — The Fix**

Elena returns to the plan screen. She opens Datu's context config. Under "Listen," she sees both scout channels enabled. Under "Filter," she sees: nothing. No filters configured. The noise entries from ambient sensor static were never filtered out.

She adds a context config rule: `IGNORE source:ambient`. The noise entries will now be dropped before entering the buffer. That frees 2 slots — enough headroom to prevent overload during the dense engagement.

She also adds a second relay ("Makisig") to split the load: Scout-1 → Datu, Scout-2 → Makisig, both → Striker. Two parallel relays instead of one overloaded relay.

She hits EXECUTE. The scouts detect. The relays handle the load — Datu's sparkline peaks at 8/12 (amber but not red). Makisig peaks at 7/12. No overload. The striker receives clean data from both relays. Enemy eliminated. Mission complete.

The character voice in the post-mission Inspector: *"We worked together this time. Makisig and I split the work. Nobody froze."*

**UI Annotations:**
- Context window: 12 horizontal bars stacked vertically, right-side panel, ~300px wide. Each bar shows icon (left), content summary (center), age counter (right), "used?" indicator (far right). Color: green=useful, yellow=processed, red=noise/overloaded.
- Decision trace: below context window, collapsible accordion. Technical text with character voice in italic grey above each trace line.
- Sparkline: lower-left, 180px wide × 40px tall. Green→amber→red gradient fill. Horizontal axis = ticks, vertical axis = buffer fill percentage.
- Timeline scrubber: full-width strip at top, 8px tall tick pips, gold highlight on current tick, cyan on hover. Arrow keys advance ±1 tick.

---

### Journey: Jin, 24, Diamond II Ranked Player (Configuration 3: War Room)

**Context:** Post-match Inspector after a Gauntlet loss. Season 4, modifier: "+2 EM Detection Range." She lost to a stealth build she didn't anticipate. Using the Inspector to diagnose the loss and prepare her counterfactual.

**Minute 0:00 — The Delayed Opponent Reveal**

The sealed watch ended in defeat. Jin's relay mesh — 4 relays in a diamond formation — was systematically dismantled by an opponent running 3 scouts with EM detection and 2 strikers on silent direct channels. She knew it was happening but couldn't intervene (sealed watch).

The Inspector opens to her side first. Her units are fully inspectable. The opponent's side shows greyed-out silhouettes with a countdown: "Opponent data unlocks in 15 seconds" (5 ticks per second of real time). This delayed reveal is a competitive design: it forces the player to analyze their OWN architecture's response before seeing the attack.

She uses the 15 seconds productively. She scrubs to tick 10 — the moment her Relay-2 was eliminated. She clicks Relay-2. The context window shows 12 slots: 8 occupied with scout data, 2 with compressed summaries, 2 empty. No overload. The relay was healthy. The decision trace: "No rule triggered evasion. Relay has no movement capability. Relay-2 was adjacent to enemy Striker at tick 10. One-shot elimination."

The problem isn't information — it's physical vulnerability. Her relay had no defense against a striker that reached it.

**Minute 0:20 — Opponent Reveal**

The 15-second timer expires. The opponent's units materialize on the board with a soft "declassify" sound — a brief static-to-clarity visual transition. Jin can now click any opponent unit and see its full config.

She clicks the opponent's Scout-1. Rules: `+EM_detected_within 5: SEND "target" on tac-net`. The scout was detecting her relay mesh's EM emissions from 5 tiles away (base 3 + modifier 2). Her relay diamond was a beacon.

She clicks the opponent's Striker-1. Rules: `IF target_received THEN move_toward target`. Context config: Listen on "tac-net" only. Buffer size: 8. The striker had a single-purpose rule: go where the scout says. No compression, no filtering, no relay chain. Direct. Fast. 2-tick latency from detection to action.

Jin's architecture: scout→relay→compress→relay→filter→striker = 6-tick pipeline. Her opponent: scout→striker = 2-tick pipeline. With +2 EM range making stealth irrelevant for HER but critical for the opponent (who used no relays and therefore emitted no EM), the matchup was asymmetric from tick 1.

**Minute 1:00 — The Gold Pivot Diamond**

The timeline scrubber shows a gold diamond at tick 6. She taps it. A tooltip: "Effective outcome determined at tick 6. Opponent's Scout-1 detected your relay mesh EM at this tick. From this point, the opponent's striker had a viable attack path with no countermeasure." The grey false-pivot markers appear at ticks 12 and 16 — moments that LOOKED decisive during the sealed watch but were already downstream of the tick-6 detection.

She taps the gold diamond tooltip's "[Show trace →]" link. The signal genealogy opens: Opponent Scout-1 (tick 6) detected EM → SEND "target" on tac-net → Opponent Striker-1 receives (tick 7) → move_toward Relay-2 → arrival tick 10 → one-shot. Four nodes. Four ticks. Clean causal chain.

**Minute 1:30 — Counterfactual Simulation**

She taps "What if?" on the toolbar. The counterfactual panel opens as a split view: left side shows the actual match timeline, right side shows a modifiable fork. She changes one parameter: moves Relay-2 from C5 to C3 — 2 tiles further from the center, 2 tiles further from the opponent's scout patrol path.

She hits "Simulate." The right-side timeline replays from tick 1 with the modified position. At tick 6, the opponent's Scout-1 still detects EM — but from Relay-3 (at D6), not Relay-2 (now at C3). The striker targets Relay-3 instead. Relay-3 is eliminated at tick 11. But Relay-2, still alive at C3, continues operating. The diamond formation is damaged but not broken — 3 of 4 relays maintain coverage.

The counterfactual result: "Fork diverges at tick 6. Outcome: LOSS at tick 34 (vs. tick 28 actual). Relay position change delayed defeat by 6 ticks but did not alter outcome."

She tries a second counterfactual: add `evade` skill to Relay-2 (replacing `amplify`). But relays are stationary — `evade` has no effect. She removes the skill change. Tries adding a Striker as bodyguard: places a 3rd striker adjacent to Relay-2 with rule `IF enemy_adjacent_to_ally THEN engage`. The simulation replays. Tick 10: the bodyguard striker intercepts the opponent's Striker-1. One-shot — the BODYGUARD eliminates the attacker. Jin's relay mesh survives.

The counterfactual result: "Fork diverges at tick 10. Outcome: WIN at tick 32. Production cost increase: +8 minerals."

She now has a concrete architectural fix: allocate one striker to relay defense.

**Minute 2:30 — Career Stats Update**

The career stats panel in the right sidebar updates: "Season 4 Record: 31-17 (64.6%). Architecture: Relay Diamond v3.2. This loss: vulnerability to EM-silent direct-strike. Recommendation: bodyguard allocation or relay dispersion." The career analysis flags this as the 3rd loss to EM-stealth builds this season. "Pattern detected: Relay Diamond v3.x consistently loses to EM-silent direct-strike architectures. Consider structural revision."

Jin screenshots the career analysis and saves it to her config history log.

**UI Annotations:**
- Opponent reveal: 15-second countdown timer in top-center, opponent units as greyed silhouettes with "CLASSIFIED" watermark dissolving on reveal
- Gold pivot diamond: 12px × 12px gold diamond on timeline scrubber, tooltip on hover, "[Show trace →]" link inline
- Counterfactual panel: right half of screen, split from actual timeline. "Simulate" button (cyan). Fork point marked with a branching icon on both timelines. Divergence highlighted in amber on the forked timeline.
- Career stats: right sidebar, 250px wide, collapsible. ELO badge at top (Diamond II, blue). Win-rate donut chart. Architecture tag with version number. Pattern detection alerts in amber callout boxes.

---

### Journey: Tala, 17, Cebu Student (Configuration 5: Archipelago, Filipino Language)

**Context:** Mission 6 (Chain of Command), set in Manila megacity. She's playing in Filipino language mode. First time configuring a Command agent. The Inspector is about to reveal a multi-hop signal chain failure.

**Minute 0:00 — Post-Sealed-Watch Entry**

The sealed watch was chaotic. Manila's urban grid was thick with enemies. Her Command agent, "Heneral Luna" (auto-generated from the hero name pool), issued a reassign order at tick 8 that never reached its target. The striker kept engaging scattered enemies instead of forming up for a defensive perimeter. Mission failed at tick 22 when enemies overwhelmed the factory.

The seal breaks with a sound that blends the "declassify" static transition with a brief Manila traffic ambience fade. The Inspector panel slides in. The background is rich — Manila megacity pixel art at reduced saturation, with the neon signs dimmed to reading-light level. The traditional okir pattern border frames the Inspector sidebar.

The timeline scrubber reads: "Tick 1 → Tick 22 (☠ pagkatalo)" — "pagkatalo" being Filipino for "defeat." The event log header: "Talaan ng mga Pangyayari" (Event Log).

**Minute 0:15 — Inspecting the Command Agent**

She clicks Heneral Luna on the board. The portrait appears large — a gold-accented robot with a stern expression, styled after historical Filipino military portraiture. Below the portrait, the context window header reads: "Bintana ng Konteksto ni Heneral Luna" (Heneral Luna's Context Window). 14 slots displayed.

At tick 8, slots 1-6 contain enemy_spotted data from scouts. Slots 7-8 contain compressed intel from Relay-1. Slots 9-14 are empty. The decision trace:

> **Patakaran 1:** KAPAG kaaway_bilang > 4 → GAWIN ipadala "kautusan" sa tac-net
> **Sinuri:** TOTOO (kaaway_bilang = 6, mula sa mga scout)
> **Aksyon:** Ipinadala "kautusan" sa channel na "tac-net"
> **Tumanggap:** Walang nakarinig.

(Translation: Rule 1: WHEN enemy_count > 4 → DO send "kautusan" (order) on tac-net / Evaluated: TRUE / Action: Sent "kautusan" on channel "tac-net" / Received: Nobody heard.)

The cultural annotation below the trace, in smaller grey text: *"Heneral Luna ay nagpadala ng utos, ngunit walang sundalo ang nakinig — katulad ng makasaysayang pagkabigo ng koordinasyon sa labanan sa Tirad Pass."* ("Heneral Luna sent an order, but no soldier listened — like the historical coordination failure at the Battle of Tirad Pass.")

**Minute 0:40 — Tracing the Signal Failure**

The "Walang nakarinig" (nobody heard) is the critical diagnostic. She taps the signal chain visualization. The channel "tac-net" shows: Heneral Luna sent at tick 8. The signal traveled to... Relay-1 (1 hop, tick 9). Relay-1's context config shows: Listen on "tac-net" = YES. Forward to: "pangalawang-tac" (secondary-tac). But Relay-1's compress skill was processing a backlog at tick 9. The forwarded signal entered Relay-1's buffer at position 11/12. Compress fired at tick 10, but the "kautusan" signal was tagged as type:command, not type:observation. The compress skill's filter: "compress observation entries only." The command signal passed through un-compressed. Relay-1 forwarded it on "pangalawang-tac" at tick 10.

She clicks the Striker. Context config: Listen on... "tac-net." NOT "pangalawang-tac."

The problem crystallizes. The Striker listens on "tac-net" — the Command's direct channel. But the signal was relayed through "pangalawang-tac" — the relay's output channel. The Striker never received it because it wasn't listening on the right channel.

The cultural annotation: *"Ang sundalo ay hindi nakarinig dahil iba ang kanyang sinusubaybayan. Sa kasaysayan ng Pilipinas, maraming mensahe ang hindi nakarating dahil sa maling daluyan."* ("The soldier didn't hear because it was monitoring the wrong channel. In Philippine history, many messages never arrived because of the wrong conduit.")

**Minute 1:15 — The Fix**

She returns to the plan screen. Opens the Striker's context config. Under "Pakikinig" (Listen), she enables "pangalawang-tac" alongside "tac-net." Now the Striker receives from both the Command's direct channel and the relay's forwarded channel.

She also adds a rule to Heneral Luna: `KAPAG relay_aktibo → GAWIN ipadala sa "pangalawang-tac"` — if a relay is active, send on the relay channel instead of direct. This way the Command adapts its output channel based on available infrastructure.

She hits EXECUTE. This time, the command signal reaches the Striker via relay at tick 10. The Striker reassigns to `depensa` (defense) and forms a perimeter. Mission complete at tick 30.

The Inspector post-mission shows Heneral Luna's annotation: *"Ngayon, naririnig na ng lahat. Ang utos ay dumadaloy sa tamang daluyan."* ("Now, everyone hears. The order flows through the right conduit.")

**UI Annotations:**
- Filipino language labels throughout: all Inspector headers, trace keywords, event log entries in Filipino with tooltip showing English equivalent on hover
- Cultural annotations: grey italic text below decision traces, ~2 sentences connecting the game moment to Philippine history/culture
- Okir pattern border: 4px decorative border on all Inspector panels, gold on dark background, drawn from Maranao carving patterns
- Hero name generation: culturally significant names from Philippine history, auto-assigned to unit types (Command = generals, Scout = sentinels, Relay = babaylan, Striker = warriors)

---

## Interaction Effects

### With Building Block Paradigms
The Inspector must display data that matches the building block paradigm used. If the player uses **sentence strips** (Config 1, 3), the decision trace shows `+enemy_count > 3: reassign` — matching the rule syntax. If the player uses **Baba Is You tiles** (Config 2, 5), the trace shows `WHEN enemy NEAR → SEND "danger"` with the tile visual language. If the player uses **node graph** (Config 4), the trace shows the graph path that fired. **The Inspector's decision trace must be polymorphic** — rendering in the vocabulary of whichever building block paradigm the player is using.

### With Sealed Watch Purity
The locked design mandates "no skip, no pause, no tools" during sealed watch — "not even on retry." This means the Inspector is strictly Act 2. But the quality of the sealed watch experience determines how much the player NEEDS the Inspector. A sealed watch that was legible (player understood what happened) means the Inspector confirms. A sealed watch that was confusing (too many units, too fast) means the Inspector reveals. **The Inspector's value scales inversely with sealed watch legibility.** This tension argues for keeping the sealed watch simple enough to parse emotionally but complex enough that mechanical details remain hidden — exactly the design documented in 4.04b.

### With Campaign Progression
The Inspector's feature surface grows with the campaign. But what happens on **replay**? If a player replays Mission 2 after completing Mission 10, do they get the Mission-10 Inspector (all features) or the Mission-2 Inspector (minimal features)? **Recommendation:** The player's highest-unlocked Inspector features are always available, regardless of which mission they're replaying. A veteran replaying Mission 2 should see signal genealogy even though Mission 2 didn't originally teach it. The progressive disclosure is a one-way ratchet — features unlock but never re-lock.

### With Multiplayer/Spectator
In competitive spectating (Config 3), the commentator's Inspector shows BOTH players' full data. In co-op (Config 2, 5), both players see a shared Inspector with cursor-awareness (your cursor is gold, partner's is cyan). In async challenges (Config 4), the Inspector shows the challenge creator's "intended solution" as a ghost overlay after the player's own analysis. **The Inspector is a multiplayer-aware surface** — it must handle observer permissions, cursor multiplexing, and delayed reveals.

### With Accessibility
The Bedrock Inspector (Tier 1) must be fully screen-reader accessible. Context window slots need ARIA labels: "Slot 3: enemy spotted at B5, from Scout-1, age 2 ticks, used in decision." The timeline scrubber needs keyboard-only navigation (arrow keys, already locked). The signal chain visualization needs an alternative text description. Tier 2 and Tier 3 features need progressive ARIA support matching their progressive visual disclosure. **The Inspector is the most accessibility-critical screen** because it's where learning happens — if it's inaccessible, the game's entire pedagogical promise fails.

---

## The TikTok Clip

Split four ways. Same match (Mission 7), same defeat (relay overload), four different Inspector experiences:

- **Top-left (Config 1: Clockwork):** Dark panel. Raw decision trace. `Rule 2: buffer_full → EVICT slot 1. OVERLOAD.` Clinical. The player nods, adjusts a number.
- **Top-right (Config 2: Greenhouse):** Warm amber panel. Datu's portrait. *"I tried to remember everything. I couldn't."* The player's face softens.
- **Bottom-left (Config 3: War Room):** Dark panel, gold pivot diamond. Counterfactual fork showing a 3-tick fix. The player saves to career log.
- **Bottom-right (Config 5: Archipelago):** Rich Manila background. Filipino text. Cultural annotation about Tirad Pass. The player pauses, reads, connects game to history.

Caption: "Same game. Same failure. Four ways to understand it. Which Inspector are you?"

---

## Discovered Aspects

- **8.03b-i — Decision trace polymorphism:** full design of how the Inspector renders decision traces differently based on the active building block paradigm (sentence strip syntax vs. tile grammar vs. node graph path vs. NL bar text); the rendering pipeline that translates a single simulation log into multiple visual vocabularies
- **8.03b-ii — Inspector replay feature ratchet:** detailed design of the "one-way unlock" policy for Inspector features on mission replay; edge cases (replaying Mission 1 with full Inspector changes the pedagogical experience; should there be a "play as first time" toggle?)
- **8.03b-iii — Inspector multiplayer cursor awareness:** technical design of shared Inspector in co-op — cursor synchronization, "I'm looking at this" indicators, split-inspect (each player inspects a different unit simultaneously), annotation sharing
- **8.03b-iv — Cultural annotation content pipeline:** who writes the ~100 cultural annotations needed for Config 5's full campaign? Quality bar, sensitivity review process, historian consultation, living document that community contributes to post-launch
- **8.03b-v — Inspector screen reader audit:** full accessibility specification for all three Inspector tiers — ARIA labels, keyboard navigation order, alternative descriptions for visual-only features (sparkline, signal genealogy graph), screen reader announcement protocol for scrubber navigation

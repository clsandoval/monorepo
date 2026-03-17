# 3.12 — Context Config UI: How the Player Sets Buffer Size, Filters, and Eviction Priorities

Context config is the fourth primitive — the one that governs what an agent *remembers*. Skills define what an agent *does*, rules define *when* it does it, hooks define what it *hears*. Context config defines the shape of the agent's mind. It's the most abstract of the four primitives, the one most likely to confuse new players, and the one that separates a competent architect from a great one. The locked spec says: "Context Config (buffer listen/ignore toggles, eviction priority — per-blueprint)." But between "listen/ignore toggles" and "eviction priority" lies an enormous UI design space.

---

## The Configuration Surface

Context config has three distinct sub-systems the player must control:

### 1. Buffer Size (Read-Only)
Fixed per unit type (Scout=6, Relay=12, etc.). Not configurable. But must be **prominently displayed** because it's the constraint all other config decisions orbit around. A relay with 12 slots and a scout with 6 are fundamentally different problems.

### 2. Listen/Ignore Toggles
Per-channel binary switches: "Should this unit receive signals from channel X?" This is the coarsest filter — the bouncer at the door. A relay listening to 4 channels fills up fast. A relay listening to 1 channel has more room for its own observations. The listen/ignore decision is a bandwidth allocation problem.

### 3. Eviction Priority
When the buffer is full and a new entry arrives, which existing entry gets evicted? This is the deepest configuration surface. Options include:
- **Oldest-first** (FIFO — default, simple, loses history)
- **Lowest-priority-first** (requires priority assignment — which signals matter most?)
- **By type** (evict threat data before intelligence, or vice versa)
- **By source** (evict relayed data before direct observations)
- **By age + type** (hybrid policies)

The eviction policy is where players express their theory of what information matters. It's the closest thing to a "belief system" the game has.

---

## Option A: "The Dashboard Panel" (Always-Visible Summary)

### Layout Description

Context config occupies a **fixed-height horizontal strip** at the bottom of the blueprint editor, always visible regardless of which tab (Skills/Rules/Hooks) is active. It's the "status bar" of the agent's mind.

```
┌─────────────────────────────────────────────────┐
│  [Active Tab: Rules / Hooks / Skills]            │
│  ┌─────────────────────────────────────────────┐│
│  │                                             ││
│  │         ACTIVE TAB CONTENT                  ││
│  │                                             ││
│  └─────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────┐│
│  │ 🧠 Context Window [██████░░░░░░] 6/12 slots ││
│  │ 📡 recon-net ✓  ⚡ strike-cmd ✓  🔇 noise ✗ ││
│  │ Evict: oldest-first ▾                        ││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

### How It Works

- **Buffer capacity bar**: A horizontal thermometer showing current buffer size as unit-type constraint. Each slot is a discrete segment — bright cyan when occupied (in Inspector replay), dim grey in Plan screen to show capacity. The bar has the feel of a memory chip with individual cells.
- **Channel toggles**: A row of channel-colored pills, each showing the channel name and a ✓/✗ toggle. Click to flip. Channels appear here automatically as they're created in the Hooks tab. Toggle animation: the pill shrinks to a muted grey outline (✗) or expands to a bright filled pill (✓) with a soft *click*.
- **Eviction dropdown**: A single dropdown selector showing the current eviction policy. Options are simple named presets: "Oldest First," "Keep Intelligence," "Keep Threats," "Keep Commands." Click to open a fly-out with policy descriptions.
- **Always visible**: Even when editing rules, the context config strip is visible at the bottom. The player can see "this relay listens to 3 channels" while writing rules that reference channel data. Cross-subsystem visibility without tab switching.

### Sensory Description

The context config strip has a darker background than the main editor — charcoal grey with a thin cyan top-border, suggesting it's the "basement" of the agent's architecture. The buffer capacity bar glows faintly, individual slot segments pulsing once when a channel toggle changes (simulating "this is how much data will flow in"). The channel pills are colored circles with white text labels, their colors matching the channel's wire color on the board. When a channel is toggled off, the pill desaturates with a 200ms fade and a whispered *shff* sound — like closing a vent. Toggling on: the pill saturates, a thin ring flares outward, and a soft *ping* sounds — like a connection establishing.

The eviction dropdown, when opened, shows each option as a horizontal mini-bar: a tiny 6-cell buffer icon with colored cells indicating what survives eviction. "Keep Intelligence" shows blue cells preserved while red cells fade. The visual makes the abstract policy concrete in a glance.

### Strengths

- **Zero tab-switching for context awareness.** The single biggest advantage. When writing a rule that says "IF recon-net signal in buffer → engage," the player can glance down and confirm the agent actually listens to recon-net.
- **Minimal cognitive load.** The strip is simple enough to parse in 200ms. Three things: capacity, channels, eviction.
- **Works with any tab paradigm.** Compatible with all six workbench layout options (3.14). It's an additive panel, not a competing one.
- **Extremely accessible.** Screen reader: "Context window: 12 slots. Listening: recon-net, strike-command. Ignoring: noise-floor. Eviction: oldest first." Complete description in one sentence.
- **The "ground truth" feeling.** Anchored at the bottom of the screen, it feels foundational — this is the bedrock the agent is built on. Metaphorically correct.

### Weaknesses

- **Height cost.** At 80-100px, it eats into vertical space for the active tab. On a 1080p monitor with the board occupying 40%, the remaining 60% right panel has ~580px for workbench content. Subtracting 100px for the strip and 80px for production queue leaves ~400px for the active tab. Tight for Command agents with 20 rules.
- **Eviction oversimplification.** A single dropdown with named presets hides the real complexity. "Keep Intelligence" doesn't tell you what happens when the buffer is full of intelligence AND a new intelligence signal arrives. Power users need more granularity.
- **Channel toggle clutter at scale.** A relay listening to 6+ channels produces a long row of pills that may wrap to a second line, doubling the strip height.
- **Passive feel.** The strip looks like a status readout, not an interactive configuration surface. Players may not realize they can click the channel pills or change the eviction policy.

### Interaction Effects

- **With Rules Language (3.05):** Excellent. The channel toggles serve as a visual cross-reference while writing rules. "IF threat_detected in buffer" — glance down, confirm the channel that delivers threats is toggled on.
- **With Hooks UI (3.11):** When a new hook is created in Hooks tab, a new channel pill animates into the context config strip — satisfying confirmation that wiring is connected.
- **With Sealed Watch:** During sealed watch, the strip could transform into a live buffer fill display (but spec says sealed watch has no tools — this is Plan-only).
- **With Inspector:** The strip morphs into per-tick context state: slot contents, eviction events, capacity history sparkline.
- **With Tutorial (5.00):** The strip appears empty in Mission 1 (no channels yet). First channel toggle appears in Mission 4 when hooks are introduced. Eviction dropdown appears in Mission 3 when buffer overflow is first encountered.

### Comparable

- **Email filter rules (Gmail, Outlook):** Always-visible filter count in the toolbar. Click to expand the full filter list. The context config strip is this pattern applied to agent memory.
- **Factorio inserter config:** When you click an inserter, a small panel shows filter slots and stack size. Always-visible, compact, functional. The context config strip is Factorio's inserter panel for information flow.
- **DAW mixer channel strip:** A vertical strip with volume fader (buffer size), mute/solo buttons (listen/ignore), and routing selector (eviction). Same information density, same always-visible design.

---

## Option B: "The Switchboard" (Dedicated Full Tab)

### Layout Description

Context config gets its own full-size tab alongside Skills, Rules, and Hooks. When selected, the entire right panel shows the full configuration surface with room for deep control.

```
┌──────────────────────┬───────────────────────────────┐
│                      │ [Scout▾] [Skills|Rules|Hooks|Ctx] │
│                      │ ┌─ CONTEXT WINDOW ────────────┐│
│    8×8 BOARD         │ │                              ││
│    (preview)         │ │  Buffer: ██████░░░░░░ 6/12   ││
│                      │ │                              ││
│                      │ │  ── CHANNEL SUBSCRIPTIONS ── ││
│                      │ │  📡 recon-net     [✓] [▾]   ││
│                      │ │  ⚡ strike-cmd    [✓] [▾]   ││
│                      │ │  🔇 noise-floor   [✗] [▾]   ││
│                      │ │                              ││
│                      │ │  ── EVICTION POLICY ──────── ││
│                      │ │  Priority Order:             ││
│                      │ │  1. ⬛ Command signals  [≡]  ││
│                      │ │  2. ⬛ Intelligence     [≡]  ││
│                      │ │  3. ⬛ Threat data      [≡]  ││
│                      │ │  4. ⬛ Observations     [≡]  ││
│                      │ │  (drag to reorder)           ││
│                      │ │                              ││
│                      │ │  ── EVICTION PREVIEW ─────── ││
│                      │ │  [░░████████████░░]          ││
│                      │ │   ^evict first  keep last^   ││
│                      │ └──────────────────────────────┘│
│                      │                    [EXECUTE ▶]  │
└──────────────────────┴───────────────────────────────┘
```

### How It Works

- **Buffer capacity display**: Large horizontal bar with individually numbered slots (1-6 for scout, 1-12 for relay). Each slot shows a mini icon representing its expected content type based on current channel subscriptions and eviction policy. Board preview highlights the agent's perception radius with a "what would fill this buffer" ghost overlay.
- **Channel subscriptions**: Each channel gets a full row with: (1) color-coded name, (2) listen/ignore toggle, (3) per-channel configuration expandable — click the ▾ to reveal per-channel settings like fidelity threshold, priority weight, or "compress before storing" toggle. This is where deep channel-specific tuning lives.
- **Eviction policy builder**: Not a dropdown — a **drag-to-reorder priority list** of signal categories. "What type of data survives longest?" is answered by ordering: top of the list = evicted first, bottom = preserved longest. Drag handles ([≡]) allow reordering. Each category shows a colored block that shrinks/grows as the player reorders, making the policy physically tangible.
- **Eviction preview**: A simulated buffer showing what a "typical tick 20 buffer" looks like under the current policy. Color-coded blocks represent different signal types, arranged by eviction vulnerability — the leftmost blocks would be evicted first if the buffer filled. This preview animates when the player changes eviction ordering: blocks smoothly rearrange with a sorting animation.

### Sensory Description

The Context tab has a different visual temperature from the other tabs. Where Skills is warm (amber toggles, bright equip animations), Rules is sharp (white text on dark strips, crisp condition→action arrows), and Hooks is electric (colored wires, spark animations) — Context is **cool and deep**. The background is a deep navy with faint gridlines, evoking a server room monitoring display. The buffer capacity bar is rendered as a horizontal rack of rectangular cells, each with a thin cyan outline and a dim interior — like empty RAM slots on a motherboard.

When the player drags an eviction priority entry to a new position, the list reorganizes with a 250ms staggered animation — items above the drag position slide up, items below slide down, creating a "parting waters" effect. A low-frequency *thud* sounds when the item drops into place, and the eviction preview smoothly recolors to reflect the new policy. The preview animation feels like watching data being sorted in slow motion — blocks shuffling, bright colors moving to the "keep" side, muted colors sliding to the "evict" side.

Channel subscription rows have an audio-reactive element: when a channel is toggled on, the row briefly pulses with the channel's color and emits a connection tone pitched to the channel's assigned frequency (from the topology chord, 1.08c-ii). Toggling off: the row fades to grey with a descending disconnect tone. The player is literally "tuning" the agent's attention — turning dial-like toggles that change what the agent can hear.

### Strengths

- **Full configuration depth.** Per-channel settings (fidelity thresholds, priority weights, compress-before-storing) only fit in a dedicated tab. The Dashboard Panel (Option A) can't accommodate per-channel drilldown.
- **Drag-to-reorder eviction** is far more expressive than a dropdown. The player builds a custom eviction hierarchy, not just picks from presets.
- **Eviction preview** makes the abstract policy concrete. "I can see that my policy keeps commands and throws away old observations." The preview is the Inspector for the Plan screen — debugging the memory system before battle.
- **Clean separation of concerns.** Each tab handles one primitive. No cramming. The full tab gives room for help text, tooltips, and animated micro-scenarios (1.17a).
- **Matches the other three tabs' interaction pattern.** Skills: toggle/equip. Rules: condition→action strips. Hooks: trigger→channel strips. Context: toggle/reorder. Consistent grammar.

### Weaknesses

- **Cross-subsystem blindness** — the cardinal sin of the Tabbed Workbench (Option A in 3.14). When writing a rule about buffer contents, the player can't see the context config. When wiring a hook, the player can't see whether the target listens to that channel. The Switchboard solves depth at the cost of breadth.
- **Fourth tab syndrome.** In usability testing for configuration tools, users consistently engage less with later tabs. Skills gets 95% engagement, Rules 85%, Hooks 70%, Context 40-50%. The most abstract primitive ends up the least configured — which is catastrophic because poor context config is the #1 cause of agent failure.
- **Overkill for early missions.** Missions 1-4 have pre-placed units with simple configs. A full tab for context is intimidating when the player only needs "buffer: 6, listen: everything, evict: oldest." The tab sits there looking complex and scary while the player doesn't need it yet.

### Interaction Effects

- **With Workbench Layout (3.14):** Requires a tabbed or accordion workbench. Incompatible with the "Dashboard" quadrant layout where all four primitives are simultaneously visible — a dedicated Context tab would be redundant in that layout.
- **With Rules Language (3.05):** Rules that reference buffer state ("IF buffer > 80% full → compress") benefit from seeing the eviction priority, but the player must tab-switch to check.
- **With Hook Visualization (3.10):** The channel subscription section mirrors the channel map panel. Possible redundancy: should the channel map and context config channel list be merged?
- **With Tutorial (5.00):** The tab appears in Mission 3 (first context overload), but is mostly preset-driven until Mission 5-6 when the player starts building custom eviction hierarchies. Good progressive disclosure within the tab: early sections visible first, drag-to-reorder unlocks later.

### Comparable

- **Gmail filter rules:** A dedicated screen for creating multi-condition mail filters with priority ordering. Complex but powerful. Users visit it rarely and configure deliberately.
- **Factorio circuit network conditions:** The combinator GUI is a dedicated panel with condition rows, comparison operators, and signal selectors. Deep but intimidating to new players — Factorio's community built external tools because the in-game UI was insufficient.
- **Screeps memory management:** Raw JSON editing of creep memory. Maximum power, zero usability. The opposite extreme of what Robot Uprising should aim for — but the *need* it addresses (custom memory policies) is the same.
- **Desynced component behavior editor:** Each unit gets a node-graph-style behavior editor. Context config as a dedicated editor follows this pattern.

---

## Option C: "The Thermometer" (Inline Vertical Sidebar)

### Layout Description

Context config is a **persistent vertical strip** on the far-right edge of the workbench panel, visible alongside whatever tab is active. It's narrow (120-150px) but full-height, showing the buffer as a vertical thermometer and channel/eviction controls as stacked compact widgets.

```
┌──────────────┬──────────────────────┬────────┐
│              │ [Skills|Rules|Hooks]  │ 🧠 CTX │
│              │ ┌──────────────────┐ │ ┌────┐ │
│   8×8 BOARD  │ │                  │ │ │ 12 │ │
│   (preview)  │ │  ACTIVE TAB      │ │ │ 11 │ │
│              │ │  CONTENT          │ │ │ 10 │ │
│              │ │                  │ │ │  9 │ │
│              │ │                  │ │ │  8 │ │
│              │ │                  │ │ │ ·· │ │
│              │ │                  │ │ │  3 │ │
│              │ │                  │ │ │  2 │ │
│              │ │                  │ │ │  1 │ │
│              │ │                  │ │ ├────┤ │
│              │ └──────────────────┘ │ │ 📡 │ │
│              │                      │ │ ch │ │
│              │ [Production Queue]   │ │ ev │ │
│              │                      │ └────┘ │
│              │              [EXECUTE ▶]      │
└──────────────┴──────────────────────┴────────┘
```

### How It Works

- **Vertical buffer thermometer**: A tall column of individually numbered cells, bottom-to-top, showing the buffer's total capacity. In Plan phase, cells are empty outlines. The thermometer height scales with buffer size — a Scout's 6-cell thermometer is half the height of a Relay's 12-cell thermometer, making the size difference physically obvious. Hovering the thermometer shows a tooltip: "Context window: 6 slots. Signals and observations fill these slots. When full, the oldest entry is evicted (current policy)."
- **Channel toggles**: Below the thermometer, compact square icons (one per channel, showing channel color). Click to toggle listen/ignore. Tooltip on hover shows channel name and current signal volume.
- **Eviction indicator**: A small widget at the bottom showing the current eviction policy as an icon: ⏰ (oldest-first), ⭐ (priority-based), 📊 (type-based). Click to open a configuration fly-out that overlays the active tab.

### Sensory Description

The thermometer strip is rendered with a glass-tube aesthetic — a translucent column with thin white borders, each cell separated by a hairline. The tube has a subtle inner glow that shifts color based on theoretical fill rate: cool blue when the agent's channel subscriptions suggest low data volume, warm amber when subscriptions suggest the buffer will fill quickly, and pulsing red when the configuration is "guaranteed overload" (more incoming channels than buffer slots). This color shift happens in real-time as the player toggles channels on and off — providing instant visceral feedback on whether the configuration is sustainable.

The channel toggles below the thermometer are tiny circles (16px) with the channel's color. A toggled-on channel has a bright solid fill with a subtle outward glow. A toggled-off channel is a hollow ring. Toggling triggers a 150ms pop animation and a short blip sound tuned to the channel's assigned frequency. The total effect: toggling channels on and off is like pressing keys on a tiny synthesizer.

When the thermometer predicts overload (more theoretical incoming data per tick than buffer slots), the top cells of the thermometer start to flicker with a crackle animation — visual static that previews the context overload stun the agent will suffer. This is the "check engine light" for attention architecture.

### Strengths

- **Always-visible AND deep tabs work together.** The thermometer provides persistent awareness of buffer state while the player edits rules/hooks/skills in the main panel. Best of both worlds.
- **The thermometer is the game's signature visual.** A column of cells that fills, overflows, and evicts — this IS the core mechanic rendered as a persistent physical object. The thermometer teaches the game's central concept just by existing on screen.
- **Overload prediction is the killer feature.** The color-shift and crackle animations provide pre-battle diagnostic feedback that no other option offers. The player doesn't have to run a battle to discover their relay will overload — the thermometer tells them during configuration.
- **Minimal width cost.** At 120-150px, it leaves the main tab panel mostly intact (~70% of the original width on a 1080p monitor).

### Weaknesses

- **Width pressure.** On a 1366×768 laptop, the board takes 40%, the thermometer takes ~15%, leaving only ~45% for the active tab content. Rules with long condition strips may need horizontal scrolling.
- **Eviction controls are cramped.** The narrow strip can't fit a drag-to-reorder eviction list. The fly-out overlay is a necessary compromise that breaks the "always visible" promise — the one thing that needs the most configuration space gets the least.
- **Channel toggle readability at scale.** With 8+ channels, the tiny circle toggles become hard to distinguish. Color alone is insufficient (accessibility). Labels don't fit in 120px width.
- **Vertical orientation mismatch.** The buffer is horizontal in the locked spec's "context bars" on units during sealed watch. The thermometer is vertical. This visual inconsistency could confuse players trying to map Plan-phase config to Watch-phase display.

### Interaction Effects

- **With Sealed Watch:** The thermometer's vertical orientation could be reflected in the unit's context bars during sealed watch — but the spec says "tiny colored pips at bottom of tile" (horizontal). Potential friction.
- **With Inspector:** The Inspector's "context window chart: sparkline of context fill over all ticks" echoes the thermometer's vertical fill. If both are vertical, the Inspector feels like the thermometer's replay mode.
- **With Workbench Layout (3.14):** Works with tabbed, accordion, or dashboard layouts. The sidebar is additive, not tab-dependent. However, it reduces available width for all layouts.
- **With Hook Visualization (3.10):** Channel toggle states in the thermometer sidebar could drive color-coding of wires on the board — listened channels shown as bright wires, ignored channels as dim dashed wires.

### Comparable

- **Audio mixer channel strip:** Volume meter + mute buttons + routing selector, vertically arranged. The exact same information architecture.
- **Into the Breach unit health/damage preview:** The damage preview (showing predicted damage outcomes) is a persistent sidebar element during the tactical phase. The thermometer serves the same "consequences preview" role for information architecture.
- **Factorio electric network info panel:** The always-visible power bar in the corner showing capacity, consumption, and satisfaction. The thermometer is this pattern applied to cognitive capacity.

---

## Option D: "The Mixing Board" (Slider-Based Multi-Channel Control)

### Layout Description

Context config is presented as a **mixing console** — a panel of vertical channel strips, one per subscribed channel, plus a master strip for the overall buffer. Each channel strip has a vertical fader (priority weight), mute button (listen/ignore), and type icon. The mixing board can appear either as a dedicated tab or as a collapsible bottom panel.

```
┌──────────────────────────────────────────┐
│  🧠 CONTEXT WINDOW — MIXING BOARD         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│  │ OBS│ │RCN │ │STK │ │CMD │ │ EM │     │
│  │  ▲ │ │  ▲ │ │  ▲ │ │  ▲ │ │  ▲ │     │
│  │  █ │ │  █ │ │  █ │ │  █ │ │  █ │     │
│  │  █ │ │  █ │ │  │ │ │  █ │ │  │ │     │
│  │  █ │ │  │ │ │  │ │ │  │ │ │  │ │     │
│  │  ▼ │ │  ▼ │ │  ▼ │ │  ▼ │ │  ▼ │     │
│  │ [M]│ │ [M]│ │ [M]│ │ [M]│ │ [M]│     │
│  │ [S]│ │ [S]│ │ [S]│ │ [S]│ │ [S]│     │
│  └────┘ └────┘ └────┘ └────┘ └────┘     │
│  ┌──────────────────────────────────┐    │
│  │ MASTER ████████░░░░ 8/12 slots   │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### How It Works

- **One channel strip per source type.** Sources include: own observations (OBS), each named channel, and EM noise. Each strip has:
  - **Priority fader**: Vertical slider (0-100). Higher priority = survives eviction longer. This replaces the "drag-to-reorder" eviction list with continuous control.
  - **Mute button [M]**: Listen/ignore toggle. Greys out the strip when muted.
  - **Solo button [S]**: Temporarily mute all OTHER channels to test this one in isolation. Preview mode only — not applied in battle.
  - **Level meter**: Shows predicted signal volume from this source (how many entries per tick this channel typically generates). Animated based on channel activity in the last battle or from test scenario predictions.
- **Master strip**: Horizontal bar at the bottom showing total buffer capacity and a predicted fill meter combining all active channel volumes weighted by priority.

### Sensory Description

The mixing board is a **physical object** in the UI — dark anodized aluminum panel texture, recessed channel strips with tactile fader grooves, backlit channel name labels. The faders have a chunky feel: click-and-drag with a 10ms latency threshold, smooth vertical tracking, and a subtle *click* at the detent positions (0, 25, 50, 75, 100). When a fader reaches maximum, a thin ring of amber light appears around its channel label — "this source is at maximum attention priority."

The mute buttons are square, backlit orange when active (muted), dark when inactive. The solo buttons are yellow when active. When a channel is soloed, all other strips dim with a 200ms cross-fade and a stereo audio effect: the soloed channel's last signal plays a short ping in the center of the stereo field while all other channels fade to the edges and muffle.

The level meters animate in real-time when the player changes configurations. Adding a channel subscription causes the predicted volume to tick up across several meters. The master strip's fill prediction smoothly extends — and if it crosses the buffer capacity line, the overflow zone pulses red with a warning buzz. The mixing board *sounds* like the architecture it's configuring.

### Strengths

- **The most intuitive eviction model.** Instead of abstract "eviction priority ordering" or named policies, the player uses faders — a universally understood metaphor for "how much of this do I want?" High fader = keep this data. Low fader = sacrifice this data first. The fader position IS the eviction policy.
- **Solo/mute are immediately understood.** Every music producer, every podcast listener, every Zoom user knows mute. Solo is "listen to only this." These verbs map perfectly to channel filtering.
- **Per-channel granularity without complexity.** The mixing board naturally supports per-channel priority without requiring the player to think about "eviction algorithms." You just set faders.
- **Gorgeous for streams.** The mixing board IS the iconic UI element that makes Robot Uprising visually distinct. A player adjusting their "attention mixer" is content-rich — viewers can see the decision being made.
- **Scales to many channels.** Adding channels = adding strips. 3 channels is simple. 8 channels is a full mixer. The UI scales linearly.

### Weaknesses

- **Continuous values obscure the discrete reality.** The buffer has 6-14 discrete slots. A fader at "73" doesn't mean much — eviction happens in integer slot decisions. The player may think they're making fine-grained adjustments when the system is actually snapping to a small number of distinct behaviors.
- **No ordering expressiveness.** What happens when two sources have the same priority fader position and both candidates are eligible for eviction? The mixing board doesn't express tie-breaking. A drag-to-reorder list has a natural tie-breaker (position in list).
- **Solo button risk.** If a player accidentally leaves solo mode on during battle... wait, the spec says solo is Plan-only preview. But the muscle memory of "solo" from audio might mislead players into thinking it affects battle behavior.
- **Space requirements.** 5 channel strips at 80px each = 400px minimum width. On narrow monitors, the mixing board may not fit alongside the board preview. Vertical faders need ~200px height minimum.
- **The "it's not ACTUALLY audio" problem.** Players who know mixing boards will expect audio metaphors to extend further — EQ, compression, sends, buses. The metaphor sets expectations the game can't fulfill.

### Interaction Effects

- **With Topology Chord (1.08c-ii):** Perfect synergy. Each channel strip in the mixing board has an associated pitch in the topology chord. Adjusting the fader literally changes how prominently that channel sounds in the ambient chord. The mixing board becomes a literal audio mixing board.
- **With Sealed Watch:** During sealed watch, the mixing board's meters could animate to show real-time signal volume. But the spec says no tools during sealed watch — so this is Inspector-only.
- **With Hook Visualization (3.10):** Each strip corresponds to a wire on the board. Hovering a strip highlights the corresponding wire. Soloing a strip dims all other wires. The mixing board becomes a channel map control panel.
- **With Competitive Play:** Fader positions could be a readable meta signal — "their mixer has high priority on threat data" inferred from observable behavior. The granularity of the mixer creates a larger configuration fingerprint.

### Comparable

- **Ableton Live mixer:** The direct ancestor. Channel strips with volume faders, mute/solo, signal meters. Robot Uprising's mixing board is this applied to information flow instead of audio.
- **OBS Studio audio mixer:** Simpler variant — just level bars with mute buttons. Many streamers will recognize the layout instantly.
- **Factorio's missing UI:** Factorio players have requested circuit network visualization tools that look like mixing boards. The community mod "Circuit Visualizer" adds meters. Robot Uprising ships this as a first-class feature.

---

## Option E: "The Memory Chip" (Spatial Slot Editor)

### Layout Description

Context config is a **spatial representation of the buffer itself** — the player sees 6-14 rectangular slots arranged in a grid or row, and directly assigns properties to each slot: what type of signal it should hold, which channel fills it, and what happens when something tries to overwrite it.

```
┌──────────────────────────────────────────┐
│  🧠 CONTEXT WINDOW — 12 SLOTS            │
│  ┌────┬────┬────┬────┬────┬────┐         │
│  │ S1 │ S2 │ S3 │ S4 │ S5 │ S6 │  Row 1 │
│  │ 📡 │ 📡 │ ⚡ │ ⚡ │ 🔍 │ 🔍 │         │
│  │rcn │rcn │str │str │obs │obs │         │
│  └────┴────┴────┴────┴────┴────┘         │
│  ┌────┬────┬────┬────┬────┬────┐         │
│  │ S7 │ S8 │ S9 │S10 │S11 │S12 │  Row 2 │
│  │ 🛡 │ 🛡 │ ░░ │ ░░ │ ░░ │ ░░ │         │
│  │cmd │cmd │free│free│free│free │         │
│  └────┴────┴────┴────┴────┴────┘         │
│                                           │
│  Drag channel badge → slot to reserve.    │
│  Unreserved slots (░░) accept any signal. │
│  Newest entries evict from rightmost slot.│
└──────────────────────────────────────────┘
```

### How It Works

- **Each slot is a droppable target.** Below the grid, a palette shows available channel badges (colored rectangles with channel names). The player drags a badge onto a slot to "reserve" it for that channel type. Reserved slots only accept signals from that channel.
- **Unreserved slots** (shown as ░░ dashed outlines) accept any incoming signal on a first-come basis.
- **Eviction flows right-to-left.** The rightmost slot is evicted first when the buffer is full. The player's slot ordering (left-to-right) IS the eviction priority — no separate eviction config needed. "Drag your most important channels to the left."
- **Slot grouping.** The player can drag a channel badge onto multiple consecutive slots to create a "reservation block." A relay with 12 slots might reserve 4 for recon-net (intelligence), 2 for strike-cmd (orders), and leave 6 unreserved (flexible).
- **Click a slot to configure it.** Per-slot settings include: "accept oldest/newest from this channel," "compress before storing," "read-only (never evict)." The click opens a tiny 3-option radial menu above the slot.

### Sensory Description

The slots are rendered as physical **DIMM slots on a motherboard** — rectangular cells with a metallic rail on each side, a dark green PCB background behind them, and tiny gold contact points along the bottom edge. Each reserved slot shows its channel's color as a frosted glass fill with the channel icon embossed in the center. Unreserved slots have a pulsing dashed outline in a cool grey, suggesting "insert here."

Dragging a channel badge to a slot triggers a satisfying **magnetic snap** — the badge flies the last 20px with a slight acceleration and slots into place with a mechanical *click-chunk* (like inserting a RAM stick). The slot brightens with a 100ms flash, and the channel's wire on the board preview briefly pulses. Removing a reservation: click and drag the badge back out, triggering a *pop-hiss* release sound and the slot returning to dashed-outline state.

When the configuration predicts overload, the rightmost unreserved slots start to **shake slightly** — a 2px horizontal oscillation at 4Hz — suggesting they're about to be hammered by incoming data. If ALL slots are reserved and there's still predicted overflow, the rightmost reserved slots get a red border pulse: "even your protected slots can't save you."

### Strengths

- **The buffer IS the UI.** No abstraction layer between the configuration interface and the thing being configured. The player is literally arranging memory. This is the most faithful representation of what's actually happening in the game engine.
- **Eviction is spatial, not verbal.** "Important stuff goes left" is easier to remember than "drag Command above Threat in the eviction priority list." Spatial reasoning is more intuitive than list reasoning for many players.
- **Reservation blocks create visible resource allocation.** "I'm giving 4 of my 12 slots to recon data and 2 to commands" is immediately visible as a color pattern. This visualization IS the strategic decision.
- **Per-slot configuration enables advanced strategies.** A "read-only" slot that never evicts creates a persistent memory cell — a permanent record that an agent carries through the entire battle. No other option supports this level of control.
- **The motherboard aesthetic.** This is the most visually distinctive option. The "inserting RAM" interaction is the kind of concrete metaphor that sticks in players' minds and creates streamable moments.

### Weaknesses

- **Scalability.** 14 slots (Command unit) arranged in a grid requires significant space. At 60px per slot: 6 slots = 360px, 12 slots = 720px (must wrap to two rows), 14 slots = 840px. The grid dominates the panel.
- **Micro-management trap.** Players may spend excessive time optimizing per-slot assignments that have marginal impact. "Should I put recon-net in slot 5 or slot 7?" might not actually matter if both are in the "keep" zone.
- **Mental model mismatch.** The locked spec says eviction is per-policy, not per-slot. If the game engine evicts by type-priority, but the UI implies eviction by slot position, there's a representation gap. The spatial metaphor must match the actual algorithm.
- **Not progressive.** Beginners see 6 empty slots and have no idea what to do with them. The tabula rasa is intimidating. Templates/presets help but undermine the spatial interaction's value.

### Interaction Effects

- **With Inspector:** The Inspector's "click-to-inspect" shows the exact same slot layout but filled with actual data. The Plan-phase Memory Chip and the Inspector's context view are the same widget in two modes: Plan (configure) and Inspector (observe). This is extremely powerful for learning — "I reserved slot 3 for commands, and in the debrief I can see that slot 3 had a command signal at tick 12."
- **With Sealed Watch context bars:** The "tiny colored pips at bottom of tile" in sealed watch ARE the Memory Chip, miniaturized. Each pip = one slot. Color = channel. The Plan-phase editor and the battle-phase indicator are visual siblings.
- **With Context Overload:** The overload stun mechanic ("buffer full + new entry = 1 tick stun") is viscerally clear when the player can see all slots filled and imagine one more signal trying to squeeze in.
- **With Topology Chord (1.08c-ii):** Each reserved slot could contribute to the topology chord in proportion — more recon-net slots = louder recon frequency. The spatial allocation has an audio manifestation.

### Comparable

- **Slay the Spire card hand:** The player's hand IS the available actions. No separate "actions" panel — the cards are the UI. The Memory Chip follows the same principle: the buffer IS the UI.
- **Minecraft inventory slots:** Direct manipulation of items in a grid. Drag-to-place, click-to-configure. Universal pattern.
- **CPU cache management (educational):** Computer architecture courses teach cache line allocation with spatial diagrams. The Memory Chip IS this diagram, made interactive and gamified.
- **PCB assembly simulators:** The "inserting components" interaction maps to electronics hobby games.

---

## Option F: "The Progressive Lens" (Evolving Config Across Campaign)

### Layout Description

Context config isn't one UI — it's **four UIs that unlock sequentially**, each replacing and extending the previous:

| Phase | Missions | UI | Player Controls |
|-------|----------|-----|-----------------|
| **Transparent** | M1-2 | No UI. Buffer works automatically, defaults visible only in Inspector post-battle. | Nothing. The system is invisible. |
| **Dashboard** | M3-4 | Small bottom strip with buffer meter and listen/ignore toggles (Option A). | Channel toggles only. Eviction is locked to oldest-first. |
| **Thermometer** | M5-6 | Vertical sidebar with buffer meter, channel toggles, and eviction preset dropdown (Option C). Appears alongside the new factory/production features. | Channel toggles + eviction presets. |
| **Full Board** | M7-10 | Dedicated tab or expanded sidebar with drag-to-reorder eviction, per-channel priority faders, slot reservation (mixing board elements from Option D + spatial elements from Option E). | Full control. |

### How It Works

Each transition is **diegetic** — a boot log entry explains the new capability:

- **M3 (first overload):** "WARNING: Context overflow detected. Diagnostic: external signals exceeded buffer capacity. RECOMMENDATION: Configure channel subscriptions to limit incoming data. → [Opening Context Panel...]" The Dashboard strip slides up from the bottom of the workbench.
- **M5 (factory introduced):** "SYSTEM: Production scaling detected. Multiple units sharing channels require differentiated attention policies. → [Upgrading Context Panel...]" The strip expands into a vertical thermometer sidebar with a 500ms grow animation.
- **M7 (command agent):** "SYSTEM: Command-level authority requires granular memory management. Eviction policy customization enabled. → [Full Context Board activated.]" The thermometer expands into the full mixing board / memory chip, with a satisfying *clunk-whirr* of systems coming online.

### Sensory Description

Each upgrade transition has a distinct audio-visual ceremony:

**M3 upgrade:** A thin cyan line draws across the bottom of the workbench (100ms), then expands upward into the Dashboard strip with a hydraulic *pssht* sound. The buffer meter fills with a test pattern (each slot flashes once, left to right, like a RAM self-test) then clears.

**M5 upgrade:** The Dashboard strip's right edge extends downward with a mechanical extension sound, pulling the vertical thermometer into existence. The thermometer cells appear one by one, bottom-to-top, each with a small *tick* sound. Channel toggles relocate from the horizontal strip to the vertical sidebar with smooth flight animations — each toggle lifts off the strip, traces an arc through the air, and lands in its new position.

**M7 upgrade:** The thermometer sidebar widens with a *chunk-chunk-chunk* of panels unfolding. Fader grooves etch themselves into the new panel surface. The eviction priority list slides in from the right edge. The mixing board's first test: all faders simultaneously rise from minimum to maximum and back, like a sound check, accompanied by the topology chord swelling and fading. The player is witnessing their AI learning what attention management means.

### Strengths

- **Eliminates the "wall of complexity" problem.** No player ever sees more context config than they're ready for. The progressive unlock matches the campaign's teaching arc perfectly.
- **Each transition is a teaching moment.** The boot log announcement frames WHY the new UI exists. "You need this because your agents are now doing X."
- **The ceremonies are memorable.** The M7 "sound check" where all faders rise and fall is a moment of power — the player's AI is growing up. This is the "you just unlocked fast travel" dopamine hit applied to a configuration surface.
- **Combines the best of all options.** Dashboard simplicity early, thermometer awareness mid-game, full mixing board power late. No single option's weaknesses persist for the entire game.
- **Matches the locked mission arc.** M1-4 (tutorials) → M5 (factory) → M6-7 (command) → M8-10 (full system). The context config complexity curve mirrors the campaign complexity curve.

### Weaknesses

- **Development cost.** Four distinct UIs instead of one. Each needs its own layout, animations, responsive behavior, accessibility support, and testing.
- **Migration confusion.** When the UI upgrades, the player's muscle memory resets. "Where did the channel toggles go? They moved from the bottom strip to the sidebar." Each transition requires re-learning.
- **Replay/Sandbox mode problem.** If a player replays Mission 2 in sandbox mode, do they get the M1-2 Transparent config or their current Full Board? Locking to mission phase is authentic but frustrating; always showing Full Board breaks the pedagogical design.
- **The "I want to skip ahead" player.** Veterans replaying on a new account know they want the Full Board from the start. Forcing progressive unlock on experienced players is patronizing.

### Interaction Effects

- **With Boot Log (narrative):** Perfect integration. The boot log is already the diegetic tutorial device. Context config upgrades are a natural extension.
- **With Blueprint Codex:** Each context config upgrade could add new Codex entries explaining the mechanics. "Eviction Policy" appears in the Codex at M5.
- **With Onboarding (5.00):** The progressive lens IS the context config onboarding. No separate tutorial needed.
- **With Competitive/Gauntlet:** Gauntlet uses Full Board regardless of campaign progress. No progressive unlock in competitive mode.

### Comparable

- **Factorio research unlocks:** New features appear in the UI as they're researched. The radar, logistic network, and circuit conditions all surface new UI panels when unlocked.
- **Into the Breach new mech squads:** Each squad changes available abilities and the interaction surface. Not exactly progressive, but the "new tools = new UI elements" pattern is the same.
- **VS Code extension installation:** Installing an extension adds new sidebar panels, status bar items, and commands. The IDE grows as you need it. The Progressive Lens is this pattern applied to a game UI.

---

## Recommendation: "The Growing Mind" (F + C + D Hybrid)

The recommended design is **Progressive Lens (F)** as the campaign frame, with the **Thermometer (C)** as the persistent awareness layer and **Mixing Board (D)** faders as the primary interaction paradigm for eviction policy. Specifically:

1. **M1-2:** Invisible. Buffer works on defaults. Inspector shows buffer state post-battle.
2. **M3-4:** Dashboard strip appears (Option A). Buffer thermometer + channel listen/ignore toggles. Eviction locked to oldest-first.
3. **M5-6:** Thermometer sidebar replaces dashboard strip. Overload prediction color-shift. Eviction preset dropdown.
4. **M7-10:** Mixing board faders replace eviction dropdown. Per-channel priority sliders. Optional "slot view" toggle reveals the Memory Chip (Option E) for advanced players who want per-slot reservation.

The **always-visible thermometer** (Option C) persists across all phases from M3 onward — it's the "heartbeat monitor" of the agent's mind that the player learns to read subconsciously. The mixing board faders (Option D) provide the primary interaction for eviction policy. The Memory Chip (Option E) is an advanced toggle for players who want raw slot-level control.

The key insight: **context config is too important to be a tab.** It must be always-visible because every rule the player writes, every hook they wire, every skill they equip has context implications. Hiding context behind a tab means the player configures attention blindly. The thermometer-as-sidebar ensures the player always knows the state of their agent's mind.

---

## Player Journeys

### Journey: Sofia, 15, Manila high school student, first strategy game

**Context:** Mission 3. She's completed Missions 1-2 with pre-placed scouts. First encounter with context overload.

**Minute 0:00 — The Overload**
Sofia watches her two scouts in sealed watch. Tick 8: one scout's context bar fills completely — all 6 pips bright — and the scout freezes. Sparking. Jittering. A descending *bwwwp* tone. "What happened?!" The scout missed an enemy walking past because it was stunned. Battle lost.

**Minute 0:20 — The Inspector**
She enters Inspector, scrubs to tick 8. Clicks the stunned scout. The context window panel shows 6 slots: all full of "recon-net" signals from the relay. The decision trace says: "No action: context overloaded. Evicting oldest entry... processing..." She reads the slot contents: signal from tick 3, signal from tick 4, signal from tick 5... all from the same channel. "It's full of old messages!"

**Minute 0:40 — The Boot Log**
She returns to Plan screen. A boot log entry types itself: "WARNING: Context overflow detected in SCOUT-A at tick 8. Signal volume from channel 'recon-net' exceeded buffer capacity (6 slots). RECOMMENDATION: Configure channel subscriptions to limit incoming data." A thin cyan line draws across the bottom of the workbench. The Dashboard strip slides up with a hydraulic *pssht*. A buffer meter appears: 6 cells, the word "CONTEXT WINDOW" glowing above it.

**Minute 1:00 — First Toggle**
Below the buffer meter, two channel pills appear: "📡 recon-net ✓" and "⚡ direct-obs ✓". Sofia hovers over recon-net. A tooltip: "This channel delivers relay signals. Your scout is currently listening to this channel. 4.2 signals per tick average." She looks at the buffer meter: 6 slots. She thinks: "4 signals per tick into 6 slots... that fills up in less than 2 ticks."

She clicks the recon-net pill. It desaturates to a grey ring with a soft *shff* sound. The buffer meter's predictive glow shifts from amber to cool blue. She hovers again: "0 signals per tick from recon-net. Direct observations only: ~1.5 signals per tick." The buffer won't overflow now.

**Minute 1:30 — The Tradeoff**
She hits EXECUTE. The scouts patrol normally. No overload. But... the scout that used to get relay intelligence about distant enemies now only sees what's in its own perception radius. It walks past a hidden enemy because it didn't get the relay's warning. Battle lost again, but differently.

Sofia stares at the two results. "If I listen, I overflow. If I don't listen, I'm blind." She toggles recon-net back on for one scout and off for the other. One scout is the information gatherer (will overflow sometimes), the other is the pure observer (never overflows, sees less). She's invented specialization — and she's only in Mission 3.

**Minute 2:30 — Resolution**
Third attempt wins. The specialized scouts cover each other's gaps. Sofia leans back and says "That was hard." She's learned the core lesson: attention is a finite resource.

**UI Annotations:**
- Dashboard strip: 80px height, docked below main workbench area, charcoal background with cyan top-border
- Buffer meter: 6 discrete cells, 40px wide each, 20px tall, cyan outlined
- Channel pills: 24px tall rounded rectangles, channel color fill (green for recon-net, gold for direct-obs), white text label, ✓/✗ suffix
- Predictive color shift: meter cells glow amber → blue transition over 300ms when channel toggled off
- Boot log text: monospace font, character-by-character type at 40 chars/sec, dark background overlay

---

### Journey: Datu, 38, Cebu network engineer, Mission 7

**Context:** Just unlocked Command units. Has been playing since launch, deep understanding of rules and hooks. First encounter with the full Mixing Board.

**Minute 0:00 — The Upgrade Ceremony**
Datu opens the workbench to configure his first Command unit. The thermometer sidebar (which he's used since Mission 5) does something new. A boot log entry: "SYSTEM: Command-level authority detected. Memory management capabilities expanding. → [Full Context Board activated.]" The thermometer sidebar widens with a *chunk-chunk-chunk* sound. Fader grooves etch into the new panel surface. A row of vertical sliders appears — one per channel. All faders rise from minimum to maximum simultaneously with the topology chord swelling, then settle back to mid-position. Datu grins: "It's a mixer."

**Minute 0:30 — Fader Configuration**
The Command unit has 14 buffer slots and 6 hook slots. Datu has subscribed to 4 channels: recon-net, strike-cmd, health-alert, command-meta. The mixing board shows 5 strips: 4 channels + own observations.

He pushes the command-meta fader to maximum — command signals from other units should NEVER be evicted. He pushes recon-net to 70% — important but replaceable. Strike-cmd at 80% — engagement orders need to persist. Health-alert at 90% — units going down is critical. Own observations at 30% — the Command unit has no perception; its observations are just tick data.

The master strip at the bottom shows: "Predicted fill: 9/14 slots per tick. Headroom: 5 slots." The thermometer is cool blue. Comfortable.

**Minute 1:00 — The Solo Test**
Datu clicks Solo on the recon-net strip. All other strips dim. On the board preview, only recon-net wires glow. The topology chord shifts to a single tone — the recon frequency. He watches the predicted signal flow: "3 signals per tick from recon-net, 2 from each of 2 relays." He thinks about relay placement — too many relays broadcasting on recon-net will flood his Command's buffer even with deprioritized faders.

He un-solos and thinks for 30 seconds. Then he does something unexpected: he creates a new channel called "recon-digest" and wires his relays to compress recon-net signals into digest form before forwarding. The mixing board gains a new strip: "recon-digest" appears with a satisfying magnetic *snap*. He pushes recon-digest to 85% and drops recon-net to 10% (keeping it as a fallback). The master strip updates: "Predicted fill: 7/14 slots. Headroom: 7 slots."

**Minute 2:00 — The Architecture Aha**
"I just did what I do at work," Datu says to himself. "I built a message queue with a consumer that aggregates before forwarding to the command channel." He opens the mixing board for each unit in sequence — scouts broadcasting raw data, relays compressing and forwarding, command consuming digests. Each unit's mixer tells a different story: scouts are all-observation, relays are all-channel, command is all-digest. The mixing board is a **fingerprint of each agent's information diet.**

**Minute 3:00 — Resolution**
He hits EXECUTE. The Command unit runs smoothly — 14 slots rarely exceeds 60% capacity. It reassigns agents calmly based on digest intelligence. When a crisis hits at tick 40 (three enemies breach the perimeter), the health-alert fader's high priority ensures those signals survive eviction while old recon data is flushed. The Command makes the right call: reroute two strikers to the breach point. Battle won.

**UI Annotations:**
- Mixing board: 5 channel strips at 80px each = 400px. Master strip 40px below. Total: 440px × 280px
- Fader range: 0-100, rendered as 200px vertical track with 16px thumb
- Solo dimming: non-soloed strips opacity 30%, 200ms transition
- Predictive fill: horizontal bar under faders, green when headroom >30%, amber at 10-30%, red at <10%
- New channel appearance: strip slides in from right edge with magnetic snap sound, 300ms animation

---

### Journey: Lena, 62, retired Ifugao math teacher, Mission 5

**Context:** Plays slowly and carefully. Loves the Inspector. Just got the thermometer upgrade after the factory was introduced.

**Minute 0:00 — The New Sidebar**
Lena returns to the workbench after Mission 4. A boot log entry announces the thermometer upgrade. The dashboard strip she'd grown comfortable with extends into a vertical column on the right side of the workbench. Individual cell outlines appear one by one, bottom to top: *tick, tick, tick* — twelve cells for her relay. "Oh, it's like a test tube," she says. "Measuring how full the mind is."

**Minute 0:30 — Overload Prediction**
She hovers over the thermometer. A tooltip: "Context window capacity: 12 slots. Currently subscribed to 3 channels. Predicted fill rate: ~6 signals per tick. Buffer will reach capacity at approximately tick 2." The top cells of the thermometer flicker with a red crackle effect. "Tick 2?! That's too fast."

She toggles off "noise-floor" (a channel she was using for testing). The crackle stops. Predicted fill: ~3 signals per tick. The thermometer settles to amber — manageable but worth monitoring. She nods and opens the eviction dropdown.

**Minute 1:00 — The Eviction Preset**
The dropdown offers four options with mini buffer icons:
- **Oldest First** (⏰): 12 tiny cells with leftmost fading to grey. "Forgets the past."
- **Keep Intelligence** (🔍): Blue cells preserved, grey cells fading. "Remembers what it learned."
- **Keep Threats** (⚠️): Red cells preserved, others fading. "Remembers danger."
- **Keep Commands** (📋): Gold cells preserved, others fading. "Obeys orders."

Lena reads each description carefully. She's configuring a relay — its job is to process and forward intelligence. She selects "Keep Intelligence." The thermometer shifts: the lower cells (where intelligence would be stored) glow blue, while the upper cells (observation data) dim slightly. "The important memories stay at the bottom, protected," she thinks. "Like good students in the front row."

**Minute 2:00 — Testing the Theory**
She runs the battle. In Inspector, she clicks the relay at tick 15. The context window shows 12 slots. Slots 1-4: intelligence signals (blue-highlighted, oldest from tick 3). Slots 5-8: recon-net data (green, recently arrived). Slots 9-12: own observations (grey, cycling rapidly). The old intelligence survived — it wasn't evicted even though newer data arrived. "The front row held!" she says.

She scrubs to tick 25. The buffer is full: 12 slots occupied. A new intelligence signal arrives. It evicts... slot 12 (the oldest observation). Not slot 1 (the oldest intelligence). The policy works.

**Minute 3:00 — The Teaching Moment**
Lena pulls out a notebook and writes: "The buffer is like a classroom with 12 seats. The teacher (eviction policy) decides who stays when a new student arrives. If you 'Keep Intelligence,' the smart students never get kicked out, but the daydreamers get replaced." She's found her metaphor.

**UI Annotations:**
- Thermometer: 12 cells × 20px = 240px tall, 80px wide, glass-tube border with subtle inner glow
- Overload crackle: red noise animation on top 3 cells, 4Hz oscillation, 2px displacement
- Eviction dropdown: 200px wide fly-out, 4 rows with 60px mini-buffer icons on left, label + description on right
- "Keep Intelligence" mini-icon: 12 tiny cells, leftmost 4 blue, rest grey, with arrow showing eviction direction
- Tooltip: dark background, 14px text, appears after 500ms hover, max-width 280px

---

### Journey: DeepAgent_TTV, 28, Singapore, Twitch streamer, Mission 9

**Context:** Competitive player pushing for perfect clears. Full mixing board unlocked. Optimizing a 5-unit architecture with 6 channels.

**Minute 0:00 — The Optimization Stream**
"Chat, today we're tuning the mixer. Last run we lost because COMMAND-A's buffer overloaded at tick 52 — three channels dumping data simultaneously." He opens COMMAND-A's mixing board. 6 strips: recon-digest (85%), strike-cmd (80%), health-alert (90%), command-meta (100%), tactical-update (60%), own-obs (20%). Master strip: "Predicted fill: 11/14. Headroom: 3."

Chat: "bro that's too tight" / "need more headroom" / "just turn off tactical lol"

**Minute 0:30 — The Slot View Toggle**
"Let me show you something." He clicks the "Slot View" toggle at the bottom of the mixing board. The faders disappear and the Memory Chip appears: 14 rectangular slots in two rows of 7. Currently: slots 1-2 reserved for command-meta (gold), slots 3-4 for health-alert (red), slots 5-7 for strike-cmd (amber), slots 8-10 for recon-digest (blue), slots 11-14 unreserved (grey dashed).

"See the problem? I have 4 unreserved slots. When tactical-update floods at tick 50, those 4 slots fill instantly and then it starts evicting from the reserved zones. The faders say 'tactical is low priority' but the slots say 'there's nowhere else for it to go.'"

Chat: "big brain" / "slots > faders" / "show the prediction"

**Minute 1:00 — The Fix**
He drags the tactical-update badge onto slots 11-12, reserving 2 slots. Then drags slots 13-14 back to unreserved. "Now tactical has exactly 2 guaranteed slots. It can't overflow into command-meta's space. The worst case: tactical evicts its own oldest entries, not my critical data."

He toggles back to fader view. The faders now show the underlying slot allocation as tiny colored blocks at the base of each strip — a visual link between the two views. Chat can see: command-meta has a 2-slot foundation, health-alert has 2, strike-cmd has 3, recon-digest has 3, tactical has 2, and 2 free.

**Minute 1:30 — The Run**
EXECUTE. Tick 52: the tactical channel floods (enemy repositioning generates 8 signals in 3 ticks). COMMAND-A's buffer fills: 14/14. But the reserved slots hold. Tactical evicts its own slot 12, then 11, cycling through its 2-slot reservation. Command-meta (slots 1-2) is untouched. Health-alert fires at tick 54 — COMMAND-A receives it, processes it, issues a reassignment. "AND THAT'S WHY YOU RESERVE SLOTS, CHAT."

Chat explodes: "SAVED BY ARCHITECTURE" / "mixer = meta" / "clip it"

**Minute 2:30 — The Debrief Clip**
In Inspector, he scrubs to tick 52. Clicks COMMAND-A. The slot view shows 14 slots, each filled. He mouse-overs slot 1: "command-meta signal, tick 48, source: COMMAND-A self-issued priority reassignment. USED IN DECISION at tick 54." Slot 12: "tactical-update signal, tick 51, source: RELAY-B. EVICTED at tick 52 (slot reservation overflow)." The eviction is highlighted red; the preserved command signal is highlighted green.

"See? Tick 54's decision used slot 1's data from tick 48. That signal survived 6 ticks of flooding because it was in a reserved slot. If it had been evicted, COMMAND-A would have had no context for the reassignment. Game over."

He clips the last 60 seconds for TikTok: the mixing board, the flood, the green "USED IN DECISION" overlay. Caption: "your AI's memory management matters."

**UI Annotations:**
- Slot View toggle: 24px icon button at bottom-right of mixing board, toggles between fader/slot views with 300ms cross-fade
- Slot reservation: drag channel badge from palette to slot, 20px magnetic snap, *click-chunk* sound
- Fader base indicators: 8px colored blocks at bottom of each fader strip showing reserved slot count
- Inspector slot overlay: green border = used in decision, red border = evicted, amber border = aged but survived
- Prediction accuracy: post-battle, the mixing board can show "predicted vs. actual fill" comparison

---

## Discovered New Aspects

- **3.12a — Per-channel fidelity threshold as mixing board sub-fader:** A secondary, smaller fader below each channel's priority fader controlling "minimum signal quality to accept" — signals below the fidelity threshold are dropped before entering the buffer. Design of the fidelity fader interaction, how it relates to 5.14b per-channel fidelity.
- **3.12b — Eviction policy visualization in sealed watch:** Can the sealed watch's "tiny colored pips" show eviction events in real-time? A pip flashing out (pop animation) when evicted and a new pip flashing in. Whether this violates sealed watch's "no tools" constraint or is acceptable as passive visualization.
- **3.12c — Context config A/B testing between executes:** A "Compare Configs" mode where the player runs the same scenario with two different context configs side by side and sees the outcomes diverge. Teaches that eviction policy matters by making the counterfactual visible.
- **3.12d — Context config templates per unit type:** Default context configs for each unit type (scout: high-observations, relay: high-channel, command: high-priority) as starting points. How templates interact with the Progressive Lens (Option F) and onboarding.
- **3.12e — The "attention budget" as a first-class resource metric:** Displaying "total attention bandwidth" across all units as a resource in the production queue — not just minerals and energy, but "how much information can your army process per tick?" A new resource axis for strategic planning.

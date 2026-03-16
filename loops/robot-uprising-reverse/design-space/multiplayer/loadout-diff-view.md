# Loadout Diff View Between Saved Configs

**Aspect:** 7.01a-i — Loadout diff view between saved configs: side-by-side comparison of two slots showing rule/hook/queue deltas; "what did I change between v6 and v7?" tool; interaction with config necropsy (7.10) and Inspector

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising's configs are *multi-dimensional attention architectures* — a single config contains 3-7 blueprints, each with skill slots, rule orderings, hook wirings, context configs, plus a shared production queue and channel map. When a player modifies a config and saves it as a new variant, they may have changed a single rule's position in one blueprint's priority list... or overhauled three blueprints, rewired four channels, and reversed the production order. The player has no way to see *what actually changed*.

This is the "what did I change?" problem. It afflicts every system where configurations are complex enough that the difference between two states isn't obvious at a glance. Git diff solves it for code. Factorio has no blueprint diff tool — and the community has been requesting one for years (forum threads from 2018 onward, no dedicated tool materialized). Warframe's modding community built third-party comparison spreadsheets because the in-game UI provides no side-by-side view. Robot Uprising should solve this problem natively.

The diff view serves three distinct use cases:
1. **Self-comparison:** "What did I change between my v6 and v7?" — the iterative improvement loop
2. **Cross-config strategy comparison:** "How does my anti-relay config differ from my anti-scout config?" — understanding strategic specialization
3. **Community comparison:** "How does this Workshop config differ from my own?" — learning from other players' architectures

Each use case has different entry points, different information priorities, and different emotional registers (self-reflection vs. strategic analysis vs. learning).

---

## Six Diff View Models

### Model A: "The Blueprint Spread" (Side-by-Side Blueprint Cards)

**How it works:** Two configs are loaded into a split-screen view. The left half shows Config A's blueprints; the right shows Config B's. Matched blueprints (same unit type) are aligned horizontally. Within each blueprint pair, differences are highlighted: changed rules show amber text with strikethrough on the old version, added rules show green, removed rules show red. Hook wirings that differ are drawn as dashed lines on one side and solid on the other. The production queue runs along the bottom in a split strip — left queue vs. right queue, with position changes connected by thin diagonal lines.

**What the screen looks like:**
The Plan screen's workbench area splits vertically down the center with a 2px dark teal divider. A thin header bar spans the top: left side shows Config A's name in amber text with its Quick Deploy slot number (if pinned), right side shows Config B's name in cyan. Between them, a centered label: "Comparing 2 configs." Each side renders its blueprints as familiar workbench cards, but at 85% scale to fit both columns. Cards are vertically aligned by unit type — if both configs have a Relay blueprint, they sit at the same vertical position. If Config A has a Specialist that Config B lacks, the right column shows an empty dashed-outline card at that position with a ghost silhouette and "(not present)" text at 40% opacity.

**Difference highlighting within blueprint cards:**
- **Rules:** Each rule row shows condition→action text. Identical rules have normal rendering. Changed rules (same position, different content) show the left version with normal text and the right version with an amber background tint and a tiny "Δ" delta icon. Added rules (present in B but not A) show a green left-border stripe. Removed rules (present in A but not B) show a red left-border stripe with 50% opacity strikethrough.
- **Rule ordering changes:** If the same rule exists in both configs but at different priority positions, a thin amber connecting line links them across the divider, with the position numbers (e.g., "#2 → #5") displayed as a small badge on the line. The line curves gently, like JetBrains IDE diff connectors.
- **Skills:** Skills present in both configs show normally. Skills equipped in A but not B show a red "−" badge. Skills in B but not A show a green "+" badge.
- **Hooks:** Hooks are rendered as small socket icons with channel name labels. Matched hooks (same trigger type, same channel) show normally. Changed hooks (same slot, different trigger or channel) show with an amber "Δ" badge and both channel names. Added/removed hooks use green/red badges.
- **Context Config:** Buffer size, listen/ignore toggles, and eviction priority are compared field-by-field. Changed fields show before→after with an amber arrow.

**The production queue comparison:**
A horizontal split strip at the bottom. Left queue slides left-to-right (Config A's build order); right queue mirrors it. Matching units (same blueprint appearing in both queues) are connected by thin vertical dotted lines. Units that appear in only one queue glow their respective green (added) or red (removed) tint.

**The channel map comparison:**
A small collapsible panel at the bottom-right shows the merged channel map — channels present in both configs show normally, channels unique to A show with a red "−" badge, channels unique to B show with a green "+" badge. Channel subscriber counts are compared: "recon-net: 3 listeners → 4 listeners."

**Strengths:**
- **Spatially intuitive.** The layout mirrors the workbench the player already knows. Each element is in the same place it would be during normal editing. Spatial memory from the Plan screen transfers directly.
- **Granularity scales.** One-change diffs show a single amber highlight. Twenty-change diffs show a dense web of color — the visual weight of the diff communicates the magnitude of the change before the player reads any detail.
- **Blueprint-centric.** Each blueprint is compared as a unit. This matches how players think about their configs — "I changed my relay's hooks" rather than "I changed line 47 of the serialized config."
- **JetBrains connector lines for priority changes.** Priority reordering is the single most common rule change in Robot Uprising (moving a rule from position #2 to #5 changes behavior dramatically). The connecting lines make reordering changes visible instantly.

**Weaknesses:**
- **Screen real estate hungry.** Two full workbench layouts at 85% scale still demand a wide viewport. On mobile or small laptops, the blueprints compress to unreadable sizes. The 8x8 board preview disappears entirely to make room.
- **Blueprint matching is fragile.** What if Config A has "Relay Alpha" and Config B renamed it to "Relay Bravo" but kept the same rules? Is it a "changed name" or "removed Alpha, added Bravo"? Name-based matching fails; content-similarity matching introduces ambiguity.
- **No temporal narrative.** The spread shows the state of both configs at a single point in time. It doesn't show the journey between them — which changes were made first, which were reactive to test results. The diff is flat, not storied.

**Sensory description:**
The split divider pulses with a faint teal glow, breathing gently at 2-second intervals — alive, not static. When the player hovers over a difference highlight, the corresponding element on the other side brightens and the connecting line (if any) thickens from 1px to 2px with a subtle *tink* sound — a tiny glass chime acknowledging the comparison. The amber "Δ" badges have a very subtle clockwise rotation animation (2 degrees back and forth) — they're restless, calling attention. Green "+" badges breathe outward (scale 1.0→1.05 at 3s intervals). Red "−" badges are static but slightly desaturated — fading away, as if the element is already half-gone. Scrolling both columns in sync is the default; a small lock/unlock icon in the divider lets the player scroll independently (unlocked columns show a broken-link icon and the divider's glow turns amber as a warning).

---

### Model B: "The Changelog" (Unified Diff with Annotations)

**How it works:** Instead of side-by-side, changes are displayed in a single-column unified view — like GitHub's unified diff mode. The view shows Config B as the "current" state, with inline annotations marking what changed from Config A. Additions are marked with green left borders, removals with red strikethrough, and changes with amber highlight + "was: [old value]" annotations. The player scrolls a single list of every difference, organized by blueprint → section (skills, rules, hooks, context).

**What the screen looks like:**
A full-width panel replacing the workbench area. A breadcrumb-style header reads: "Changes: [Config A name] → [Config B name]." Below, a scrollable list organized as:

```
▼ RELAY-ALPHA (3 changes)
  Rules
    #2: IF threat_detected THEN compress → broadcast    [was: compress → relay]
    #4: [ADDED] IF buffer_full THEN evict_oldest
  Hooks
    Slot 1: recon-net (unchanged)
    Slot 2: threat-alert → threat-priority              [was: threat-alert]

▼ SCOUT-BETA (1 change)
  Skills
    [REMOVED] evade
    [ADDED] patrol

▼ PRODUCTION QUEUE (2 changes)
  Position 3: RELAY-ALPHA                               [was: STRIKER-GAMMA]
  Position 4: STRIKER-GAMMA                             [was: RELAY-ALPHA]

▼ CHANNELS (1 change)
  [ADDED] hack-response (0 listeners in A → 2 listeners in B)
```

Each change line is clickable — opens a detail flyout showing the full rule/hook/config in context (the surrounding unchanged rules that frame this change).

**Strengths:**
- **Compact.** A twenty-change diff might take 40 lines of text — easily scannable without scrolling on most screens. The side-by-side model would require extensive scrolling through mostly-identical content.
- **Narratively sequential.** Changes are ordered by blueprint, then by section. The player reads top-to-bottom and builds a story: "I changed the relay's routing, added a new hook trigger, removed evade from the scout, and swapped the build order." This is how engineers describe diffs in pull request reviews.
- **Change count as headline.** The "(3 changes)" badge on each blueprint section immediately communicates where the bulk of the changes are. A player glancing at the changelog can see: relay has 3 changes, scout has 1, queue has 2. The relay was the focus of this iteration.
- **Mobile-friendly.** Single-column layout works on any screen width. Touch-scrollable. No split-view viewport problems.

**Weaknesses:**
- **Loses spatial context.** The unified view doesn't show where a rule sits relative to its blueprint's other rules. "Rule #2 changed" doesn't convey the strategic impact unless the player remembers what rules #1 and #3 are. The clickable flyout mitigates this but adds a navigation step.
- **Poor for structural comparison.** If the two configs have fundamentally different architectures (different unit compositions, different channel topologies), the unified view becomes a long list of "(REMOVED) everything → (ADDED) everything else" — which is less informative than seeing both configs side-by-side.
- **No visual diff for hook wiring.** Channel topology changes are described textually ("threat-alert → threat-priority") rather than shown as wiring diagrams. The visual network graph that makes hook architecture legible is absent.

**Sensory description:**
The changelog panel has a dark background matching the boot-log terminal aesthetic. Change entries use monospace font with syntax coloring: condition keywords in amber, action keywords in cyan, channel names in teal. The green "[ADDED]" tags use the same green as the boot-log "ONLINE" confirmations. The red "[REMOVED]" tags use a muted red (not alarming — just factual). Expanding a blueprint section with the ▼ chevron triggers a 150ms slide-down animation with a quiet paper-unfold sound. Collapsing snaps shut with a 100ms slide-up and a soft *fwip*. The change count badges pulse once on first render — drawing the eye to the heaviest-change sections — then settle.

---

### Model C: "The X-Ray" (Overlay Diff on the Board Preview)

**How it works:** Rather than comparing blueprints abstractly, this model shows the diff *on the battlefield*. The 8x8 board renders as a ghost overlay showing both configs' expected unit positions, channel wiring, and perception radii simultaneously. Config A's elements render in amber (ghost), Config B's in cyan (solid). Where they overlap (unchanged), elements render in white. The player sees the architectural difference as a spatial delta on the actual playing field.

**What the screen looks like:**
The 8x8 board fills the center of the screen at full size. Config A's unit positions are rendered as semi-transparent amber silhouettes with dashed perception radii. Config B's units are solid cyan with solid perception radii. Where a unit exists in both configs at the same position, it renders in white (merged). If a unit moved between configs, a thin amber-to-cyan gradient arrow connects the old position to the new one.

Channel wiring overlays the board as colored lines. Channels that exist in both configs show as white lines. Channels unique to A show as amber dashed lines. Channels unique to B show as cyan solid lines. Changed channels (same name, different subscribers) show as amber→cyan gradient lines with subscriber count badges at each endpoint.

A sidebar shows a legend and a condensed change summary: "3 units repositioned, 2 channels rewired, 1 unit type changed."

**Strengths:**
- **Spatial impact is immediate.** The player sees *where on the battlefield* the config changes matter. A relay that moved from D4 to F6 is visually dramatic — the communication topology shifts. This insight is invisible in text-based or card-based diffs.
- **Communication network visualization.** Seeing channel wiring changes on the actual board reveals coverage gaps, signal path lengths, and EM exposure changes. "My new relay position is closer to the enemy spawner" is legible at a glance.
- **Beautiful for streaming and sharing.** The amber/cyan ghost overlay is visually striking — the kind of screenshot that communicates "this game has depth" without explanation. The X-ray IS the TikTok clip.

**Weaknesses:**
- **Only shows spatial changes.** If the player changed rule priority orderings, skill configurations, or context eviction policies — none of which affect unit placement — the X-ray shows nothing. A 20-change diff that's entirely about rule tuning produces an empty-looking overlay.
- **Pre-placed units only.** For factory missions (M5+), unit positions are determined at runtime by the production queue and factory spawning. The X-ray can't show these positions — it can only show the production queue's expected output as a hypothetical.
- **No detail on demand.** The overlay shows that something changed but not what. "The relay moved" — but why? What rule or hook change motivated the reposition? The X-ray needs a companion detail view.

**Sensory description:**
The amber ghost units shimmer slightly — a 10% opacity fluctuation at 1Hz — conveying impermanence. The cyan solid units have the crisp silhouette of the live game. Where units overlap in white, the white is bright and stable — confirmed, unchanged, anchored. The gradient arrows connecting moved units have a slow particle flow from amber to cyan (particles traveling the arrow direction over 2 seconds), like data migrating from old to new. Channel wiring lines pulse with traveling dots in their respective colors (amber dots on A-only channels, cyan dots on B-only channels, white dots on shared channels). Hovering over any element dims the rest of the board to 20% and illuminates the hovered element's full comparison detail in a tooltip. The entire board sits against a dark starfield background instead of the usual terrain — the X-ray strips away the aesthetic layer to reveal pure architecture.

---

### Model D: "The Spec Sheet" (Tabular Stat Comparison)

**How it works:** A spreadsheet-style table where each row is a config parameter and each column is a config version. Numerical values show delta arrows (↑3, ↓1). Boolean values show checkmarks or Xs. The table is sortable, filterable, and exportable. This is the Warframe community spreadsheet, but built natively.

**What the screen looks like:**
A full-width table with three columns: Parameter | Config A | Config B. Rows are grouped by blueprint:

| Parameter | Anti-Relay v6 | Anti-Relay v7 |
|-----------|--------------|--------------|
| **RELAY-ALPHA** | | |
| Buffer Size | 12 | 12 |
| Rules Count | 5 | 6 (↑1) |
| Rule #1 | IF threat → compress | IF threat → compress |
| Rule #2 | IF idle → scan | IF buffer_full → evict (**NEW**) |
| Rule #3 | IF buffer_full → evict | IF idle → scan (↓1) |
| Hook Slots Used | 3/4 | 4/4 (↑1) |
| Hook 1: recon-net | SEND on threat | SEND on threat |
| Hook 2: threat-alert | SEND on enemy_adj | SEND on enemy_adj |
| Hook 3: relay-net | LISTEN | LISTEN |
| Hook 4: — | (empty) | hack-response LISTEN (**NEW**) |
| Eviction | FIFO | LRU (**CHANGED**) |
| **PRODUCTION QUEUE** | | |
| Position 1 | SCOUT-BETA | SCOUT-BETA |
| Position 2 | RELAY-ALPHA | RELAY-ALPHA |
| Position 3 | STRIKER-GAMMA | RELAY-ALPHA (**CHANGED**) |
| Position 4 | RELAY-ALPHA | STRIKER-GAMMA (**CHANGED**) |

Changed cells have an amber background. New rows have a green left border. Removed rows have a red strikethrough. A "Show only changes" toggle at the top hides identical rows — collapsing the table to just the deltas.

**Strengths:**
- **Exhaustive completeness.** Every single parameter is compared. Nothing is hidden. For players who want to verify exactly what changed, the spec sheet is the authoritative source.
- **"Show only changes" is powerful.** The toggle reduces a 200-row complete comparison to a 12-row change summary. The player controls the information density.
- **Exportable.** The table can be copied as formatted text for Discord, pasted into a necropsy document, or screenshotted for community discussion. Tabular data is universally readable.
- **Familiar to data-oriented players.** Engineers, spreadsheet users, and stat-min-maxers are native speakers of tabular comparison. This is their home turf.

**Weaknesses:**
- **Visually arid.** A spreadsheet table has none of the game's visual language. No circuit-board textures, no spark animations, no isometric charm. The spec sheet feels like stepping out of the game and into Excel.
- **No spatial or topological insight.** Rule priority changes, hook wiring topology, channel communication networks — all of these have spatial meaning that the table flattens into text rows. "Hook 4: hack-response LISTEN" doesn't convey where in the communication architecture that hook sits.
- **Row ordering implies false priority.** Parameters listed top-to-bottom might suggest importance ordering, but the table is organized by blueprint, then by section. A critical eviction policy change at the bottom of the RELAY-ALPHA section might be missed.

**Sensory description:**
The table renders on a dark background with thin teal grid lines — the circuit-board aesthetic applied to a data grid. Each row's left edge has a 3px colored stripe: white for unchanged, amber for changed, green for added, red for removed. The "Show only changes" toggle is a physical-looking switch (teal when on, gray when off) that triggers a satisfying *click* and a 200ms filter animation — unchanged rows collapse vertically like an accordion while changed rows slide together. Cell text uses the game's monospace font. Hover over any cell to see a tooltip with the full untruncated value and, for rule cells, the animated tooltip preview of that rule's behavior.

---

### Model E: "The Time Machine" (Animated Transition Replay)

**How it works:** Instead of showing two static states, this model *animates* the transformation from Config A to Config B. The player sees Config A's workbench, then watches as elements morph, move, appear, and disappear in a choreographed sequence that tells the story of the iteration. The animation can be scrubbed like a timeline.

**What the screen looks like:**
The workbench renders normally, showing Config A. A timeline scrubber sits at the bottom — a horizontal bar with a playhead. Pressing Play triggers the transformation sequence:

1. **Phase 1: Removals** (0.0s–1.0s). Elements being removed glow red, then dissolve into amber particles that drift upward and fade. A rule being removed shows its text crossing out letter by letter before the card shrinks and vanishes. An unequipped skill grays out and slides off the blueprint card into a "removed" tray at the bottom.

2. **Phase 2: Modifications** (1.0s–2.5s). Elements being changed pulse amber. A rule whose text changes shows the old text morphing into the new text — letter by letter, with changed characters flashing. A hook whose channel name changed shows the old name fading while the new name types itself in. Rule priority reordering shows cards physically sliding up or down in the priority list, pushing other cards aside.

3. **Phase 3: Additions** (2.5s–3.5s). New elements materialize with the "subsystem ONLINE" animation from the boot log — a brief scanner-line passes over the blueprint card, and the new element appears with a green flash and a *ping* sound. New hooks grow wire lines that extend from the blueprint to the channel map.

4. **Phase 4: Confirmation** (3.5s–4.0s). All changes settle. A brief pulse of white light washes over the workbench. The header updates from Config A's name to Config B's name with a fade transition.

The timeline is scrubbable — the player can drag the playhead to any point in the 4-second animation and pause. Individual changes are annotated on the timeline as small markers (amber dots for modifications, green for additions, red for removals). Clicking a marker jumps to that specific change.

**Strengths:**
- **The narrative of iteration.** The animation tells a story: "I removed this, then I changed that, then I added this." The temporal sequence conveys intent in a way static diffs can't.
- **Visually memorable.** Players remember *watching* the relay's hook change from threat-alert to threat-priority — the animation burns the change into memory. Static diffs are scanned and forgotten.
- **Spectacular for streaming and education.** A teacher explaining "how I improved my architecture" can play the transformation and narrate each phase. The animation IS the lesson.
- **Reuses existing visual vocabulary.** The "subsystem ONLINE" flash, the boot-log typing effect, the amber particle dissolution — all recycle animations the player already knows.

**Weaknesses:**
- **Slow for quick comparisons.** A 4-second animation to compare two configs that differ by one rule? The player just wants to see the delta, not watch a movie. Even at 2x speed, it's slower than any static view.
- **Complex authoring.** The animation system must handle arbitrary combinations of changes: what if 5 rules are reordered simultaneously? What if 3 blueprints are modified? The choreography engine becomes a significant engineering challenge.
- **Scrubbing precision is limited.** A single timeline scrubber for a 20-change diff means changes overlap in time. The player can't easily isolate one specific change without pausing at exactly the right frame.
- **No side-by-side reference.** At any point during the animation, the player sees one state — either mid-transition or Config B. They can't see Config A and Config B simultaneously for direct comparison. The mental burden is on the player's memory.

**Sensory description:**
The animation opens with a soft *whoosh* as the workbench dims to 80% brightness — entering "time machine" mode. The timeline scrubber has a dark background with gold tick marks at each change point. The playhead is a bright gold triangle. During Phase 1 (removals), the ambient audio drops to a low hum and removed elements emit a descending glass-chime *tiiing* as they dissolve. During Phase 2 (modifications), a soft rhythmic ticking accompanies each change — like a clock's second hand, but pitched up. During Phase 3 (additions), the "subsystem ONLINE" pings are staggered at 200ms intervals, creating a rapid ascending scale. During Phase 4 (confirmation), a single warm chord resolves — the same chord used when saving a config (mechanical *chunk*) but played on a synth pad instead of a percussion hit. The completion feels like a deep breath out.

---

### Model F: "The Architect's Loupe" (Progressive Hybrid — RECOMMENDED)

**How it works:** A three-layer system that adapts to the diff's complexity and the player's intent:

**Layer 1: The Summary Badge** (always visible). On any config card — in the Quick Deploy Bar, Named Collection drawer, or Workshop import preview — a small diff badge appears when a comparison reference is set. The badge shows: "Δ3" (3 changes), color-coded by magnitude: green for 1-3 changes, amber for 4-10, red for 11+. Hovering the badge shows a one-line summary: "2 rules changed, 1 hook added." This is the "at a glance" layer — no dedicated screen needed.

**Layer 2: The Split View** (on demand). Pressing a "Compare" button (or Ctrl+D when two configs are selected) opens a split-screen view combining the best of Model A and Model D. The left half shows Config A, the right shows Config B. But instead of rendering full workbench layouts, each side renders a *compact card* per blueprint showing only the elements that differ — unchanged elements are collapsed into a "(4 unchanged rules)" summary line. This is Model A's spatial layout with Model D's "show only changes" density. Between the two columns, JetBrains-style curved connector lines link corresponding changed elements.

The split view has three sub-modes toggled by tabs at the top:
- **"Changes Only"** (default): Collapsed unchanged content. Only differences visible. Fast scanning.
- **"Full Context"**: All rules, hooks, skills visible on both sides. Differences highlighted in amber. For understanding changes in context.
- **"Board Overlay"**: The X-ray model (Model C) showing spatial impact on the 8x8 board. For understanding communication topology changes.

**Layer 3: The Transformation** (optional). A "Play" button at the bottom of the split view triggers Model E's animated transition — the left column morphs into the right column over 4 seconds. For players who want the narrative experience or are recording content.

**What the screen looks like:**

*Layer 1 — Summary Badge:*
In the Quick Deploy Bar, each occupied slot shows a tiny "Δ" badge in the bottom-right corner when a comparison base is set. The badge is an 8×8 circle containing the change count in a miniature font. Green circle with "2" for a minor change. Amber with "7" for a moderate change. Red with "14" for a major overhaul. The badge appears only when the player has set a comparison reference — either by right-clicking a slot and selecting "Compare from here" or by importing a community config that was explicitly shared as a "compare against" target.

*Setting the comparison reference:*
Right-click any config (in Quick Deploy, Named Collection, or Workshop). Select "Set as comparison base." A subtle green underline appears on that config's name — it's now the reference. All other configs show their diff badge relative to this reference. To clear: right-click the reference → "Clear comparison base." Only one reference at a time. The reference persists across sessions (saved in local storage).

*Layer 2 — Split View:*
A dedicated overlay triggered by selecting two configs (Ctrl+click to multi-select in Named Collection, then "Compare Selected" button). The overlay is 90% viewport width, centered, with a 5% margin on each side. The dark backdrop dims the rest of the UI to 30%.

Left column header: Config A's name, tags, and win-rate sparkline.
Right column header: Config B's name, tags, and win-rate sparkline.
Center: A small "swap sides" button (↔) to reverse A and B.

In "Changes Only" mode, each blueprint section shows:
```
▼ RELAY-ALPHA (3 changes)
  Left                              Right
  ────────────────                  ────────────────
  Rule #2: IF idle → scan          Rule #2: IF buffer_full → evict
       ╰──── changed ────╯              (was #3, moved up)

  Rule #3: IF buffer_full → evict  Rule #3: IF idle → scan
       ╰──── changed ────╯              (was #2, moved down)

  Hook 4: (empty)                  Hook 4: hack-response LISTEN
       ╰──── added ────╯

  (4 unchanged rules, 2 unchanged hooks, skills identical)
```

The connector lines between left and right are rendered as thin Bézier curves in amber. For rule reorderings, the curve connects the rule's old position to its new position — crossing over other rules if necessary (creating a visible "crossing pattern" that communicates the extent of reordering at a glance).

In "Full Context" mode, all rules/hooks/skills are shown on both sides. Changed elements have an amber background tint. Unchanged elements have normal rendering but at 70% opacity — visually receding to let changes dominate.

In "Board Overlay" mode, the split view is replaced by the X-ray overlay (Model C) — the 8x8 board with amber/cyan ghost units and channel wiring.

*Layer 3 — Transformation:*
A "▶ Play transition" button at the bottom of the split view. Clicking it collapses the split into a single workbench showing Config A, then plays the morphing animation (Model E). The timeline scrubber appears at the bottom. The player can toggle back to the split view at any time.

**Entry points:**
1. **Quick Deploy Bar:** Right-click Slot 3 → "Compare with..." → pick Slot 1. Split view opens with Slot 1 left, Slot 3 right.
2. **Named Collection:** Ctrl+click two configs → "Compare Selected" button (appears at the top of the drawer when 2+ items are selected).
3. **Workshop:** When browsing a community config, a "Compare with my config" button auto-compares the Workshop entry against the player's currently loaded workbench config.
4. **Inspector:** In the post-battle Inspector, a "Compare with last deploy" button compares the config used in this match against the config used in the previous match on the same map.
5. **Config Necropsy (7.10):** In a changelog export, each version transition includes an inline diff summary. Clicking "Expand diff" opens the split view for that specific pair.

**Strengths:**
- **Progressive disclosure.** The badge costs zero screen space in normal operation. The split view appears only when requested. The animation is optional on top of that. Each layer adds detail without forcing complexity.
- **Three sub-modes cover all use cases.** "Changes Only" for quick iteration checks, "Full Context" for deep strategic analysis, "Board Overlay" for spatial topology analysis.
- **Integrates everywhere.** The comparison reference system works with Quick Deploy, Named Collection, Workshop, Inspector, and Necropsy — not a separate screen but a lens applied to any pair of configs.
- **The summary badge is a passive teaching tool.** Players see "Δ7" and learn to associate large deltas with risky jumps. Small deltas (Δ1, Δ2) feel safe. The badge teaches iterative improvement methodology: make small changes, test, compare, iterate.

**Weaknesses:**
- **Three layers is three things to explain.** The comparison reference concept ("set as base, then all other configs show diffs relative to it") is unintuitive for players who've never used git. The flow from "right-click → set base → see badges → click badge → split view → toggle modes → play animation" is a long path.
- **Comparison reference management.** One reference at a time means the player must clear and reset when switching between comparison tasks. If they forget to clear, stale badges confuse.
- **Engineering complexity.** The diff algorithm must handle blueprint matching (by content similarity, not just name), rule reordering detection, hook wiring topology comparison, and production queue alignment. This is a nontrivial matching problem — similar to structural diff algorithms for tree-shaped data (XML diff, JSON patch).

---

## Player Journeys

### Journey: Tomás, 16, just lost his 5th Gauntlet match in a row

**Context:** Mission 7 complete. Gauntlet Silver rank. Has 3 configs in Quick Deploy: Slot 1 "basic army," Slot 2 "relay chain," Slot 3 "anti-scout." He's been tweaking Slot 2 between every match, saving over it each time. He can't figure out why it stopped working — it was winning 3 days ago.

**Minute 0:00 — The Frustration Point**
Tomás stares at his workbench. Slot 2 is loaded: "relay chain." He knows he changed something since his win streak, but he's made at least 10 modifications over 3 days. What changed? He right-clicks Slot 1 (his untouched basic army) and sees the context menu. A new option he hasn't tried: "Set as comparison base." He clicks it. A thin green underline appears below "basic army" in Slot 1.

**Minute 0:10 — The Badge Revelation**
The Quick Deploy Bar updates. Slot 2's card now shows a tiny amber circle with "Δ11" in the bottom-right corner. Slot 3 shows "Δ6." Tomás hovers over Slot 2's badge. A tooltip: "11 changes from 'basic army': 4 rules changed, 3 hooks added, 2 skills changed, 2 queue positions changed." His eyes widen — eleven changes? He thought he'd made three or four tweaks. The accumulation of small changes was invisible until now.

**Minute 0:20 — The Split View**
He clicks the "Δ11" badge. The split view opens: left column shows "basic army" (Config A), right shows "relay chain" (Config B). He's in "Changes Only" mode. The RELAY-ALPHA section shows 5 changes — the most of any blueprint. He scans: his relay's rule #1 was originally "IF threat → compress" but it's now "IF buffer_full → evict." He forgot he changed that. He changed the relay's most important rule — the one that made it work — to solve a different problem three days ago.

**Minute 0:35 — The Insight**
He clicks the "Full Context" tab. Now all rules are visible on both sides, with changed rules in amber. He sees it: in the original "basic army," rule #1 (compress on threat) ensured the relay always compressed incoming threat data before doing anything else. In his iterated "relay chain," he moved compress down to rule #3 to make room for eviction and a new scan rule. But compress at #3 means the relay often buffers-full before compressing — triggering the very stun problem he's been losing to.

He realizes: the winning strategy was "compress first, always." His iteration drifted away from that core insight. He modifies Slot 2: moves compress back to rule #1. Saves. Deploys. Watches: wins in 22 ticks. The diff view didn't just show him what changed — it showed him what he lost.

**Minute 1:30 — The New Habit**
Before his next modification, he right-clicks Slot 2 and selects "Set as comparison base." Now future changes will diff against his current winning config, not his original basic army. He's learned to set reference points after victories — a habit the diff view taught him.

**UI Annotations:**
- Comparison base: green underline on slot name, persists across sessions
- Δ badge: 8×8 circle, green/amber/red by magnitude, bottom-right of config card
- Split view: 90% viewport overlay, dark backdrop, tabbed sub-modes
- Connector lines: amber Bézier curves between changed elements, 1.5px stroke

---

### Journey: Dr. Amara, 38, ML engineer preparing a competitive necropsy

**Context:** Diamond Gauntlet player. Just won a close 3-match series. She wants to post a necropsy (7.10) showing how she iterated her config from "anti-relay v5" (losing) to "anti-relay v7" (winning). She has all three versions saved in her Named Collection.

**Minute 0:00 — The Multi-Version Comparison**
Dr. Amara opens her Named Collection (Ctrl+L). She sets "anti-relay v5" as comparison base (right-click → "Set as comparison base"). The collection updates: v6 shows "Δ4," v7 shows "Δ9." She sees the progression: v5→v6 was a modest 4-change iteration, v5→v7 was a substantial 9-change overhaul. But what about v6→v7? She clears the base, sets v6 as the new base: v7 now shows "Δ5." The two-step iteration (4+5 changes) is more than the direct jump (9 changes) — meaning some v6 changes were reverted in v7. That's a story worth telling.

**Minute 0:30 — The Board Overlay Insight**
She opens the split view for v5 vs. v7 and clicks the "Board Overlay" tab. The X-ray shows: v5 had a relay at C3 (amber ghost); v7 moved it to E5 (cyan solid). The perception radii overlap differently — v7's relay covers the central chokepoint that v5's relay couldn't reach. The channel wiring also shifted: the old relay-to-striker direct line is now a relay-to-specialist-to-striker two-hop path. She takes a screenshot for her necropsy.

**Minute 1:00 — The Transformation Recording**
She clicks "▶ Play transition" to record a screen capture. The workbench shows v5's config. The animation begins: the relay slides from C3 to E5 on the board preview (an elegant diagonal slide with a trailing amber ghost). The specialist blueprint materializes with the "subsystem ONLINE" scanner-line. The hook wiring redraws — the old direct line dissolves into amber particles while a new two-hop path draws itself in cyan. She narrates over the recording: "The key insight was moving the relay to cover the chokepoint and adding the specialist as a signal intermediary." The 4-second animation becomes a 30-second narrated clip for her necropsy post.

**Minute 2:00 — The Export**
She opens the changelog export for v5→v6→v7 (three versions). Each transition includes the split view diff inline. She adds annotations between versions: "v5→v6: experimental specialist placement. Improved scout survival but relay still dying at T14." "v6→v7: moved relay to chokepoint and changed build order to get relay online 2 ticks earlier. The two-tick timing delta was the difference." She exports as a Config Code link with embedded changelog and posts to the Workshop.

**UI Annotations:**
- Multi-version comparison: clear and reset comparison base to compare different pairs
- Board Overlay: amber/cyan ghost units, gradient arrows for position changes
- Play transition: ▶ button at bottom of split view, 4s animation, scrubable timeline
- Changelog export: inline diff summaries between version nodes, expandable to full split view

---

### Journey: Kai, 11, iPad player comparing a friend's config to his own

**Context:** Mission 6. Got a Config Code from a friend who passed Mission 7. Wants to understand how the friend's config differs from his own.

**Minute 0:00 — The Import Preview**
Kai taps "Import Config Code" in the Named Collection. He pastes his friend's code. A preview card appears showing the config's name ("Jun's relay rush"), unit composition, and — because Kai has a config currently loaded in the workbench — a "Compare with your current config" button.

**Minute 0:10 — The Side-by-Side Discovery**
He taps the compare button. The split view opens on his iPad in landscape mode. Left: his "mission 6 try" config. Right: Jun's "relay rush." The "Changes Only" mode shows: 8 changes. His eyes go to the first one — Jun has a rule he's never seen before: "IF tagged_count > 2 THEN engage." Kai doesn't know what tagging does yet (he hasn't learned it). He long-presses the rule text. A tooltip appears: "This rule tells the striker to attack when 3 or more enemies are tagged by scouts. Tagging is a scout skill you'll unlock in Mission 7."

**Minute 0:25 — The Learning Moment**
He scrolls through the diff. Jun has two relay units in the production queue; Kai has one. Jun's relays use the "compress" skill; Kai's relay doesn't have compress equipped. He taps on "compress" in Jun's config — the animated tooltip plays: a relay receives 3 signals, squishes them into 1, and forwards it. The relay's buffer bar drops from red to green. Kai thinks: "Oh, that's why Jun's relay doesn't get stunned."

He doesn't import Jun's config wholesale. Instead, he goes back to his workbench, equips compress on his relay, and adds a second relay to his production queue. He's learned two specific things from the diff view without copying the entire architecture. The diff was a *teaching tool*, not a copy-paste mechanism.

**Minute 0:50 — The Selective Learning**
After modifying his config, he opens the compare again. The badge now shows "Δ5" instead of "Δ8" — he's closed the gap by 3 changes. The remaining 5 differences include things he doesn't understand yet (tagging, channel routing, priority rules). He'll investigate those after Mission 7. The diff view gave him a roadmap of what to learn, not just what to copy.

**UI Annotations:**
- Import preview: "Compare with your current config" button on import card
- iPad split view: landscape mode, 50/50 split, touch scrolling, long-press for tooltips
- Animated tooltips in diff context: same animated micro-scenario engine (1.17a) but within the split view
- Δ badge update: badge recalculates after workbench changes, showing progress toward convergence

---

### Journey: Sana, 28, blind screen reader user debugging a Gauntlet loss streak

**Context:** Using VoiceOver on macOS. Diamond Gauntlet. Has "stealth-v4" (winning) and "stealth-v5" (losing). Needs to find the regression.

**Minute 0:00 — Setting the Reference**
Sana opens Named Collection (Ctrl+L). Navigates to "stealth-v4" via search. Activates the context menu (VO+Shift+M). VoiceOver: "Set as comparison base, Compare with, Export Config Code, Delete." She selects "Set as comparison base." VoiceOver: "Comparison base set: stealth-v4. Other configs will show change counts relative to this config."

**Minute 0:10 — Reading the Badge**
She navigates to "stealth-v5." VoiceOver: "stealth-v5. Tags: stealth, gauntlet. Win rate: 38 percent, 8 matches. 6 changes from stealth-v4: 3 rules changed, 2 hooks changed, 1 skill changed." The badge is read as a full sentence — no visual-only information. She knows immediately: 6 changes, distributed across rules, hooks, and skills.

**Minute 0:20 — The Accessible Split View**
She activates "Compare with comparison base." The split view opens. VoiceOver reads the mode: "Comparing stealth-v4 and stealth-v5. Changes Only mode. 6 changes across 2 blueprints." She presses Down Arrow to navigate:

VoiceOver: "Scout Alpha. 3 changes. Change 1: Rule 2. Old: IF threat detected THEN evade. New: IF threat detected THEN report to recon-net. Rule changed from evasion to reporting."

She pauses. This is the change — her scout was evading threats (surviving) and now it's reporting threats (useful but dying in the process). She navigates to the next change:

VoiceOver: "Change 2: Hook Slot 2. Old: empty. New: recon-net, SEND on threat detected. Hook added."

She understands the complete picture: she added a reporting hook to the scout but changed its survival rule (evade) to a reporting rule. The scout reports better but dies more. She needs both — evade AND report. The fix: add the reporting hook but keep evade as rule #1 priority above the reporting rule.

**Minute 0:40 — The Fix**
She closes the split view, loads stealth-v5, moves the reporting rule from position #2 to position #3 (below evade), saves as "stealth-v6." She sets stealth-v5 as the new comparison base. VoiceOver reads: "stealth-v6. 1 change from stealth-v5: 1 rule reordered." Minimal. Precise. She deploys.

**UI Annotations:**
- Screen reader summary: badge read as "N changes: breakdown by type" full sentence
- Diff navigation: Down Arrow moves through changes sequentially; each change read as "Old: X, New: Y, Change type"
- Blueprint grouping: changes announced by blueprint first ("Scout Alpha, 3 changes")
- Mode toggle: "Changes Only / Full Context / Board Overlay" announced, togglable via Tab

---

## Interaction Effects

**With Config Necropsy (7.10):**
The diff view IS the necropsy's visual core. Every changelog export embeds inline diffs between versions. The "Play transition" animation IS the narrated walkthrough format. The split view provides the "before/after" evidence that makes necropsies persuasive. Without the diff view, necropsies are text-only descriptions of what changed. With it, they're visual forensic evidence.

**With Inspector (locked):**
The Inspector's "Compare with last deploy" button uses the same diff infrastructure. After a loss, the player sees not just what happened (Inspector) but what they changed since their last win (diff view). This closes the diagnostic loop: Inspector tells you *what went wrong in the match*; the diff view tells you *what you changed that caused it*.

The Inspector's timeline scrubber and the diff view's transformation animation share visual vocabulary (gold playhead, scrubber track, change markers). A player who masters one is prepared for the other.

**With Workshop (7.03d):**
When browsing Workshop configs, the "Compare with my config" button opens the split view with the Workshop config on the right. This transforms Workshop browsing from "should I import this?" to "what would I learn from this?" The diff view quantifies the distance between the player's current approach and the community's approach.

Workshop configs with small diffs from the player's config are surfaced as "Similar to your current config — see 3 differences." This enables a "nearby exploration" browsing pattern where players discover incremental improvements rather than wholesale replacements.

**With Campaign (locked):**
Each mission could auto-save a "mission N winning config" snapshot. The diff between "mission N" and "mission N+1" shows what the player learned between missions. Over the full campaign, the chain of diffs tells the player's architectural growth story — a visual autobiography of learning.

**With Loadout System (7.01a):**
The diff badge integrates directly into the Quick Deploy Bar and Named Collection. It transforms these storage systems from "pile of configs" to "network of related configs with visible distances." The badge's green/amber/red magnitude coloring teaches players to make small iterative changes (green) rather than dramatic rewrites (red).

**With Onboarding (Wave 5):**
The diff view should be introduced in Mission 6 — the first mission where the player has two configs saved (their Mission 5 winning config and their current attempt). A subtle prompt: "You have two saved configs. Want to see what you changed?" introduces the comparison concept at the moment of need.

The "Changes Only" default mode is critical for onboarding — new players are overwhelmed by full config comparisons. Showing only the deltas reduces cognitive load to just the relevant changes.

**With Competitive/PvP (7.01):**
In Arms Race (Bo3) format, the between-rounds diff view lets the player see exactly what they're about to change relative to their Round 1 config. This encourages deliberate adaptation ("I'll change exactly these 2 things based on what I saw") rather than panicked overhauls.

In Ghost Match, the "Compare deployed ghost vs. current workbench" button shows what would change if the player redeployed. This prevents accidental regression: "Wait, I was about to deploy a config that removed the hook that's winning my ghost matches."

---

## Comparable Games

**Git / GitHub / JetBrains IDEs — The Gold Standard for Code Diff:**
The side-by-side diff with connector lines between changed regions is a 30-year-old pattern that billions of developers use daily. JetBrains' implementation (IntelliJ, WebStorm) is widely considered the best: curved connector lines between corresponding changes, character-level highlighting within changed lines, and a minimap gutter showing the full file with colored markers for changes. Robot Uprising should steal the connector lines directly — they are the single most effective visual tool for communicating structural rearrangements (which, in Robot Uprising, means rule priority reordering).

**Factorio — The Missing Blueprint Diff:**
Factorio has no native blueprint comparison tool. The community has built viewers, editors, visualizers (Christoph Frick's tools, Teoxoy's Blueprint Editor, piebro's Visualizer) — but none offer side-by-side diff. Forum threads from 2018-2024 repeatedly request this feature. The "Staged Blueprint Planning" mod comes closest, tracking entity changes across stages. Robot Uprising should learn from Factorio's gap: players WILL need to compare configs, and they WILL build external tools if the game doesn't provide one.

**Warframe — Third-Party Comparison Culture:**
Warframe's modding community built Overframe and Frame Hub because the game provides no native mod comparison. Players export builds as text lists and manually compare them. The community even created stat comparison spreadsheets on Google Docs. This is exactly the pattern Robot Uprising should short-circuit by providing native comparison tools. Overframe's side-by-side build comparison (selecting two builds, seeing stat deltas as +/- arrows) is a direct UI reference for the Spec Sheet model.

**Smashing Magazine's "Perfect Feature Comparison Table" (2017):**
The seminal UX article on comparison table design identifies key patterns: sticky headers, highlighted differences, progressive disclosure of detail rows, and the "show only differences" toggle. All of these translate directly to Robot Uprising's Spec Sheet sub-mode. The article's insight that "the more similar items are, the harder comparison becomes" is directly relevant — two configs that differ by a single rule reordering are harder to compare than two configs with entirely different unit compositions.

**Destiny's Armor Comparison:**
Destiny 2's armor comparison shows stat bars side-by-side with delta arrows. The visual language is immediately legible: green up-arrow means "this armor is better at this stat," red down-arrow means "worse." Robot Uprising can't use this directly (configs don't have simple "better/worse" stats), but the delta-arrow visual vocabulary applies to numerical comparisons like buffer size changes, hook slot utilization changes, and production queue cost totals.

**Zed Editor's Split Diff (2025):**
Zed's implementation uses the "block map" pattern — inserting visual spacers to keep corresponding lines aligned across split panes. This solves the "uneven length" problem when one config has more rules than the other. Robot Uprising's split view should use the same spacer approach: if Config A has 5 rules and Config B has 7 rules, Config A's side shows 2 empty spacer rows aligned with Config B's added rules.

---

## Sensory Summary

**Audio vocabulary:**
- Setting comparison base: a quiet magnetic *click* — locking a reference point
- Diff badge appearing: a brief ascending two-note *ding-ding* (do-mi) — attention to the new information
- Opening split view: a horizontal sliding sound (pages spreading apart, 300ms)
- Closing split view: reverse horizontal slide (pages coming together, 200ms)
- Tab switching (Changes Only / Full Context / Board Overlay): a soft *click* with a subtle view-shift whoosh
- Connector line hover: tiny glass *tink* — acknowledging the comparison
- Transformation play: whoosh → ticking clock → ascending pings → warm chord (4s total)
- "No changes found": a satisfied single note — confirmation hum

**Color language:**
- Comparison base indicator: green underline on config name
- Δ badge: green (1-3), amber (4-10), red (11+) magnitude circles
- Changed elements: amber background tint (consistent with game's "modified" language)
- Added elements: green left-border stripe (consistent with "new" / "ONLINE")
- Removed elements: red left-border stripe with 50% opacity (fading, departing)
- Unchanged elements in Full Context: 70% opacity (receding, de-emphasized)
- Connector lines: amber Bézier curves (drawing the eye to relationships)
- Board overlay: amber ghosts (Config A), cyan solids (Config B), white overlaps (unchanged)

**Animation hierarchy:**
1. Badge pulse: 200ms on first appearance, then static — minimal, informational
2. Split view open: 300ms horizontal slide — quick, responsive
3. Tab switch: 200ms crossfade — faster than split open, feels like a lens change
4. Connector line hover: 150ms thicken from 1px to 2px — instant feedback
5. Transformation animation: 4000ms scripted sequence — cinematic, optional

---

## The Diff Algorithm

The matching algorithm must handle four types of structural comparison:

1. **Blueprint matching:** Match blueprints between configs by content similarity, not just name. A blueprint renamed from "Relay A" to "Relay Alpha" but with identical rules/hooks should be matched (not shown as "removed A, added Alpha"). Similarity score: weighted sum of (skill overlap × 0.3 + rule text overlap × 0.3 + hook channel overlap × 0.2 + unit type match × 0.2). Threshold: >0.6 = matched, <0.6 = separate add/remove.

2. **Rule reordering detection:** Within matched blueprints, rules can be reordered without changing content. The diff must distinguish "rule moved from position #2 to #5" from "rule #2 deleted and identical rule added at #5." Use longest common subsequence (LCS) to identify the minimum edit distance and surface reorderings as first-class diff elements.

3. **Hook wiring topology comparison:** Two hooks connecting to the same channel with the same trigger type should be matched even if their slot positions differ. The diff should show "hook moved from slot 1 to slot 3" not "hook removed from slot 1, hook added to slot 3."

4. **Production queue alignment:** The queue is an ordered list. Use standard sequence diff (similar to text line diff) to find insertions, deletions, and position changes.

---

## TikTok Clip

Split screen. Top half: a player staring at their losing config, face scrunched. They click the diff badge — the split view opens. Camera zooms into the screen. One amber connector line links a rule that moved from position #1 to position #4. The player's face transitions from confused to shocked to "AHA." They drag the rule back to #1. Deploy. Win. Bottom text: **"One rule. Wrong position. 5 losses."** The diff view is the detective that solved the case in 3 seconds.

---

## New Aspects Discovered

- **7.01a-i-a — Diff algorithm for blueprint matching: content-similarity vs. name-based matching.** When comparing two configs with renamed blueprints, how does the system determine which blueprints correspond? Content-similarity scoring, unit-type anchoring, manual override for ambiguous matches.
- **7.01a-i-b — "Regression alert" badge when deploying a config that reverts a previously tested change.** If the diff view detects that the player's current config reverts a change they made in a previous winning config, show a warning: "This deploy removes [compress at rule #1] which was present in your last 3 wins." Interaction with Inspector and sealed watch.
- **7.01a-i-c — Community diff as Workshop discovery signal.** Surfacing configs in the Workshop that are "nearby" (Δ1-3) the player's current config as "you might learn from this small change" recommendations. The diff magnitude as a relevance heuristic for Workshop search.
- **7.01a-i-d — Three-way diff for merge conflicts in co-op config editing.** In co-op modes where two players modify a shared config (7.02b), the diff view must show three-way comparison: base version, Player A's changes, Player B's changes, with conflict highlighting where both changed the same element.
- **7.01a-i-e — Diff view as tournament spectator analysis tool.** In tournament streams (7.01e), casters can show side-by-side diffs of both players' configs between Arms Race rounds. The audience sees what each player changed in response to the previous round. The diff view becomes sports commentary infrastructure.

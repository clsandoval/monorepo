# PvP Loadout System Design: Saveable Blueprint Configurations for Competitive Play

**Aspect:** 7.01a — Loadout system design for PvP: saveable blueprint configurations, quick-deploy, per-map loadout adaptation, loadout sharing between players, loadout import/export as community feature

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

In most competitive games, a "loadout" is a weapon or character preset selected before a match. In Robot Uprising, a loadout is an *entire attention architecture* — every blueprint, every rule ordering, every hook wiring, every context config, every production queue sequence. This is orders of magnitude more complex than choosing between an assault rifle and a shotgun.

The loadout system must answer five questions simultaneously:
1. **Storage:** How many configurations can a player save? How are they organized?
2. **Retrieval:** How quickly can a player swap between saved configurations during competitive play?
3. **Adaptation:** How does a player modify a saved configuration for a specific map or opponent?
4. **Sharing:** How do configurations move between players as community artifacts?
5. **Identity:** Does a player's loadout collection become part of their competitive identity?

The tension is between **depth** (full architecture expressiveness) and **speed** (quick deployment under timer pressure in Sealed Duel/Arms Race formats). A loadout system that's too rigid kills experimentation. One that's too flexible becomes indistinguishable from "just build from scratch every time."

---

## Six Loadout Models

### Model A: "The Garage" (Numbered Slot Rack)

**How it works:** The player has 5–10 numbered slots, each storing a complete architecture snapshot — all blueprints, production queue, channel map, context configs. Selecting a slot loads the entire architecture into the workbench instantly. The metaphor is a mechanic's garage with numbered bays, each holding a fully assembled vehicle.

**What the screen looks like:**
Above the workbench, a horizontal strip of numbered squares (1-10) rendered as brushed-metal plates with embossed digits. Occupied slots glow a soft teal with a miniature icon cluster — a 3×3 pixel grid showing unit type composition (how many scouts, relays, strikers in this config). The active slot pulses with a thin gold border. Empty slots show dashed outlines with a ghostly "+" symbol at 30% opacity. Hovering over an occupied slot reveals a tooltip: "GARAGE 3 — 'Scout Rush v2' — 2S 1R 2K — Last edited: 3h ago — Win rate: 62% (13/21)." Clicking a slot triggers a 400ms workbench swap animation: current blueprints slide left off-screen, new blueprints slide in from the right, channel wires redraw with a quick spark cascade, production queue conveyor belt shuffles.

**The save flow:**
After configuring the workbench, the player clicks a floppy-disk icon (or presses Ctrl+S / bumper+Y on controller). A save dialog appears: slot number selector (pre-selects current slot or first empty), name field (optional, 24-character limit), and a "Save" button. The save completes with a satisfying mechanical *chunk* sound — like a car door closing — and the slot's mini-icon updates.

**Strengths:**
- **Zero cognitive load.** Numbers are universally understood. "Load slot 3" is faster than navigating any hierarchy.
- **Keyboard shortcut natural.** Ctrl+1 through Ctrl+0 for instant swap. In timed Sealed Duel, this is a 200ms action.
- **History implicit.** Slots accumulate over time. Slot 1 is probably the player's first serious config; slot 7 is their latest experiment. The garage tells a story.
- **Comparable precedent.** Call of Duty's 10 custom classes, Tekken's character presets, Hearthstone's 18 deck slots — all numbered racks. Players know this pattern.

**Weaknesses:**
- **No organizational structure.** At 10 slots, players can't group by strategy, map, or opponent. The flat list becomes opaque. "What was slot 6 again?"
- **Slot scarcity as frustration.** With 5 unit types, 12+ skills, hundreds of possible hook configurations — 10 slots feels like 10 parking spaces for an infinite car collection. Players will demand more slots.
- **No partial loading.** Want to swap just your relay blueprint from slot 3 into your current slot 7 config? Can't. It's all or nothing.
- **No version history.** Overwriting slot 3 destroys the previous slot 3. The "I liked yesterday's version better" regret has no recovery path.

**Sensory description:**
The garage strip sits at the very top of the Plan screen, above the blueprint editor panels. Each slot is 48×48 pixels. Occupied slots have a subtle inner shadow suggesting depth — the blueprint is "recessed" into the bay. The active slot rises 2 pixels higher than its neighbors (raised, not recessed — it's pulled out of the garage). The swap animation uses a horizontal conveyor metaphor: the old config slides stage-left on rails while the new one slides in from stage-right. Channel wires disconnect with small blue sparks at the left edge and reconnect with green sparks at the right edge. The whole transition takes 400ms with a mechanical sliding-rail audio cue — *shhhk-CLUNK*.

---

### Model B: "The Portfolio" (Named + Tagged + Searchable)

**How it works:** Unlimited named configurations organized by player-created tags. The player names each save ("Anti-Rush Relay Chain," "Taal Volcano Specialist," "Stealth Scout Only"), assigns optional tags (#defensive, #taal, #relay-heavy, #gauntlet), and browses via a searchable list or tag filter. The metaphor is a designer's portfolio — curated, labeled, and browsable.

**What the screen looks like:**
A slide-out drawer from the left edge of the Plan screen, triggered by a folder icon or Ctrl+L. The drawer is 320px wide with a search bar at the top (magnifying glass icon, placeholder text "Search configs..."), a horizontal tag filter strip below (clickable tag pills: #offensive, #defensive, #mission-7, #gauntlet, each in a distinct muted color), and a scrollable list of configuration cards below. Each card shows: config name (bold, 16px), tag pills (small, 10px), unit composition bar (colored segments: cyan=scout, amber=relay, red=striker, green=specialist, gold=command), last-edited timestamp, and a sparkline of recent win/loss results (green dots for wins, red for losses, last 10 matches). The currently loaded config has a gold left-border stripe. Right-clicking a card reveals a context menu: Load, Duplicate, Rename, Edit Tags, Delete, Export as Config Code, Share to Workshop.

**Strengths:**
- **Scales infinitely.** Serious Gauntlet players with 50+ configurations can organize them without hitting a ceiling.
- **Semantic retrieval.** "Show me all my defensive configs tagged #cebu" is a 2-second operation. Map-specific configs become a first-class concept.
- **Community integration.** Tags create a shared vocabulary. When the meta shifts, players tag configs by metagame era: #season-3, #pre-nerf-compress.
- **Version-friendly.** Duplicate creates branches. "Anti-Rush v1," "Anti-Rush v2," "Anti-Rush v2.1-experimental" can coexist.

**Weaknesses:**
- **Naming is work.** Every save requires a name. Under timer pressure in Sealed Duel, "uhh... 'untitled-47'" becomes the default. The portfolio degrades into the garage's worst case — unlabeled numbered entries.
- **Decision paralysis.** With 50 configs, which one do you load? The search/filter step adds 3-5 seconds of cognitive load that the garage avoids entirely.
- **Tag rot.** Old tags become meaningless after meta shifts. #season-1-meta clutters the filter without active pruning.
- **No spatial memory.** Garage slots have position — "my relay config is the third one." Portfolio entries float in a list that changes with filtering. Players lose muscle memory.

**Sensory description:**
The drawer slides in with a gentle paper-shuffling sound, like opening a filing cabinet. Config cards are rendered on slightly textured off-white backgrounds with a paper-edge shadow at the bottom of each card — the portfolio is literally a stack of design documents. The search field has a warm amber focus ring matching the game's boot-log aesthetic. Typing in search instantly filters with a smooth reflow animation (non-matching cards shrink and fade simultaneously rather than popping out). Loading a config triggers the same conveyor swap as Model A but prefaced by a 200ms card-lift animation — the selected card rises, glows, and dissolves into the workbench.

---

### Model C: "The War Chest" (Map-Indexed Loadout Grid)

**How it works:** A 2D grid where rows are maps/provinces and columns are strategy variants. Each cell holds one complete configuration. The player selects a map from the campaign archipelago, then picks one of 3-5 strategy slots for that map. The metaphor is a general's war chest — a different battle plan for each theater.

**What the screen looks like:**
A full-screen overlay triggered from the campaign map or Gauntlet lobby. The left column shows the 10 Philippine provinces as small island silhouettes (Ifugao highlands, Siquijor mystic island, Palawan jungle, etc.) with terrain icons. Each row extends right into 3-5 strategy cells. Cells are 120×80px cards showing unit composition bars and a 1-2 word strategy label. Empty cells show dashed outlines with "+" buttons. The header row labels the columns: "Primary," "Counter," "Experimental," and optionally "Anti-[archetype]" columns that unlock after enough Gauntlet matches. Selecting a map row highlights the terrain preview in the background. Double-clicking a cell loads that config and navigates to the Plan screen.

**Strengths:**
- **Per-map adaptation is first-class.** The system *teaches* players to build map-specific configurations. "My Taal config has shorter signal chains because the board is tight" becomes an obvious design choice.
- **Counter-strategy structure.** The column layout invites thinking about matchup adaptation. "If my primary relay chain gets scouted, load my counter config with stealth scouts."
- **Visual at-a-glance.** The entire competitive portfolio is visible on one screen. Gaps (empty cells) are visible invitations.
- **Tournament-ready.** Best-of-3 Arms Race format: load Primary round 1, then switch to Counter round 2 based on what you saw. The grid makes this a 1-click operation.

**Weaknesses:**
- **Rigid structure.** What if a config works on three maps? It must be duplicated into three cells, and edits to one don't propagate. Or — a config that's not map-specific at all (a general-purpose Gauntlet entry) has no natural home.
- **Scale mismatch.** 10 maps × 5 columns = 50 cells. Most players will fill 5-10 of them. The grid looks empty and intimidating for months.
- **Ghost Match problem.** In async Ghost Match PvP, you deploy one ghost config that plays on any map. The war chest assumes map-specific deployment, but the primary PvP model doesn't support per-map selection.
- **Column semantics.** "Primary" and "Counter" columns imply a strategic framework that beginners don't have. A new player doesn't know what "counter" means yet.

**Sensory description:**
The war chest overlay has a dark navy background with the Philippine archipelago rendered as a ghostly circuit-board pattern behind the grid. Province silhouettes glow cyan when hovered, with terrain type rendered as small watercolor vignettes (rice terraces, volcanic coast, neon city). Filled cells pulse gently with the unit composition colors. Empty cells have a dotted border that brightens on hover with a quiet *tick* sound. Loading a config from the chest triggers a unique transition: the selected cell zooms forward while other cells recede, the province terrain fills the background, and the workbench assembles itself piece by piece — each blueprint card flies in from the cell's position to its workbench slot.

---

### Model D: "The Playbook" (Hierarchical Strategy Folders)

**How it works:** Configs are organized in a nested folder structure that mirrors competitive thinking. Top-level folders represent strategic archetypes ("Relay Chain Dominance," "Scout Rush," "Stealth Operations," "Factory Flood"). Inside each folder, sub-folders or individual configs represent variants, counters, and map adaptations. The metaphor is a football team's playbook — organized by formation and situation.

**What the screen looks like:**
A file-tree panel on the left side of the Plan screen (collapsible, 280px wide). Each root folder shows a custom icon (player-chosen emoji or auto-generated from unit composition) and a name. Expanding a folder reveals config entries with indented names, last-edited timestamps, and micro win-rate sparklines. Folders can be nested 2 levels deep (archetype → variant → map-specific). The tree supports drag-and-drop reordering. A "Quick Access" bar at the top pins up to 5 favorites from anywhere in the tree. Right-click context menus offer: New Folder, New Config, Move To, Duplicate, Rename, Delete, Export Folder (exports all configs inside), Share Folder.

**Strengths:**
- **Mirrors competitive mental model.** Serious players already think in strategy hierarchies. The playbook externalizes this thinking.
- **Folder sharing is powerful.** Export an entire "Anti-Relay" folder with 4 variant configs. Community content becomes strategic packages, not individual blueprints.
- **Scales elegantly.** 5 folders with 3 configs each is clean for a beginner. 20 folders with 50+ configs total is navigable for a veteran because the hierarchy provides structure.
- **Version history natural.** Keep "Scout Rush v1" alongside "Scout Rush v2" in the same folder. The old version isn't overwritten — it's preserved as evolutionary evidence.

**Weaknesses:**
- **Folder management is overhead.** Creating, naming, and organizing folders is work. Players who just want to play will dump everything in root — degrading to Model B without tags.
- **Speed under pressure.** In a 3-minute Sealed Duel timer, navigating a folder tree is slower than pressing Ctrl+3 (garage) or filtering by map (war chest). The hierarchy hurts when speed matters.
- **Organizational anxiety.** "Should this config go in the Relay Chain folder or the Taal Map folder?" Cross-cutting categorization doesn't map to trees. This is the same problem that killed hierarchical file systems for most consumer use.
- **Empty folders as shame.** A beginner with 2 configs in a tree structure feels the emptiness more acutely than 2 of 10 garage slots filled.

**Sensory description:**
The folder tree uses a monospace font reminiscent of the boot-log terminal aesthetic. Folder icons are small 16×16 glyphs in muted amber. Expanded folders show a thin vertical connecting line in dark teal. Config entries have a small unit-composition dot cluster (3-5 colored dots representing the army mix) before the name. The Quick Access bar at the top renders pinned configs as rounded rectangles with the config name truncated to 12 characters, connected to their tree location by a faint dotted amber thread that appears on hover — showing where this quick-access item lives in the hierarchy. Loading from the tree has the same conveyor animation but with an additional 200ms "folder opening" flourish — the selected folder appears to physically open like a book page turning before the config launches.

---

### Model E: "The Timeline" (Version-Controlled Configuration History)

**How it works:** Every workbench change is automatically saved as a version. The loadout system is a timeline scrubber — a visual history of every configuration the player has ever deployed. Branching is explicit: "fork from this version" creates a named branch. The metaphor is Git for attention architectures.

**What the screen looks like:**
A horizontal timeline strip at the bottom of the Plan screen (collapsible, 64px tall when visible). The timeline shows version nodes as small circles connected by a horizontal line, color-coded by outcome: green for deployed configs that won, red for losses, gray for never-deployed experiments, gold for the currently loaded version. Branching creates a second row of nodes below the main timeline, connected by a diagonal line to the branch point. Hovering over a node shows a tooltip with: timestamp, name (optional), unit composition, deployment context ("Gauntlet vs. ghost_42, Cebu map"), and outcome. Clicking a node loads that version. The timeline supports zoom (scroll to see more/fewer nodes) and filtering (show only wins, show only Gauntlet deploys, show only configs with relay units).

**Strengths:**
- **Zero save friction.** The player never has to "save" — it's automatic. No naming, no slot selection, no folder management. Just build and deploy.
- **Perfect recall.** "I had a config two weeks ago that beat relay chains" — scroll back, find the green node, load it. No version is ever lost.
- **Branch experimentation.** Fork from a known-good config, experiment freely, abandon if it doesn't work, return to the branch point. This is how actual software engineers iterate.
- **Win/loss visualization as learning tool.** The timeline visually shows which changes improved performance. A cluster of green nodes means "this branch was working." Red after a change means "that change was bad." The timeline IS the performance feedback loop.

**Weaknesses:**
- **Overwhelming for beginners.** After 20 matches, the timeline has 50+ nodes (pre-deploy experiments + deploys). After 200 matches, it's thousands. No hierarchy — just a flat linear river of versions.
- **No intentional curation.** Everything is saved, including junk experiments, half-finished configs, and accidental changes. The signal-to-noise ratio degrades over time.
- **Branch spaghetti.** 10 active branches create visual chaos in the timeline. Git branch management is hard for professional developers — it will be harder for game players.
- **Retrieval is slow.** "Load the relay chain config" requires scrolling, hovering, reading tooltips, identifying — when the player might just want to press Ctrl+3.
- **Git is not a metaphor most players know.** The branching model is powerful but foreign. "Fork from this version" is engineering vocabulary that many players won't intuit.

**Sensory description:**
The timeline strip has a dark background matching the sealed-watch tick clock aesthetic. Version nodes are 8×8 circles with a gentle glow matching their color code. The current node is larger (12×12) with a pulsing gold ring. Branch lines angle downward at 45° and run parallel to the main timeline 20px below. Hovering over a node illuminates the line connecting it to its parent — showing the evolutionary chain. Loading a version triggers a "time rewind" animation: the workbench blurs slightly, current components dissolve into amber particles that swirl and reform as the loaded version's components. The audio is a tape-rewind warble (300ms) followed by the mechanical garage *CLUNK*. When the player deploys, the current node gets stamped with a deployment seal — a small satellite dish icon that appears with a satisfying *ping*.

---

### Model F: "The Arsenal" (Hybrid Progressive System — RECOMMENDED)

**How it works:** A three-tier system that grows with the player:

**Tier 1: Quick Deploy Bar** (available from Mission 5). Five numbered slots at the top of the Plan screen. Ctrl+1 through Ctrl+5. Pure garage model. Fast, simple, no naming required. This is the speed layer — optimized for timed PvP formats and quick iteration.

**Tier 2: Named Collection** (unlocks at Gauntlet entry). Portfolio-style named configs with optional tags. Searchable, filterable, unlimited capacity. This is the depth layer — for serious competitive players managing 20+ strategic variants.

**Tier 3: Map Adaptation View** (unlocks after 10+ Gauntlet matches across 3+ maps). A map-indexed overlay showing which named configs from Tier 2 are "pinned" to specific provinces. Not separate storage — just a lens on the existing collection. Select a map, see which configs are tagged for it, pin one as the auto-load default for that terrain.

The key insight: **Tiers are views, not separate storage.** A config saved in Quick Deploy slot 3 is also visible in the Named Collection. A config tagged #taal in the collection appears in the Map Adaptation view for Taal province. One config, multiple access paths.

**What the screen looks like:**

*Tier 1 — Quick Deploy Bar:*
Five brushed-metal slots across the top of the Plan screen, identical to Model A's garage. Each slot shows a unit composition mini-bar and an optional 12-character label. The fifth slot has a subtle "..." overflow icon that opens Tier 2.

*Tier 2 — Named Collection:*
A drawer sliding in from the left (Ctrl+L or click the overflow icon). Search bar, tag filters, scrollable config cards. Each card shows: name, tags, unit composition bar, win-rate sparkline, and a small "pin" icon for each Quick Deploy slot (click to assign this config to slot 1-5) and each map (click to pin to Taal, Cebu, etc.).

*Tier 3 — Map Adaptation:*
Accessible from the Gauntlet lobby or a tab in the Named Collection drawer. Shows the archipelago with province cards. Each province card shows the currently pinned config (if any) and a dropdown of configs tagged with that province's terrain type. "Auto-deploy" toggle per province: when entering a Gauntlet match on this map, auto-load this config.

**Save flow under timer pressure (Sealed Duel, 3-minute timer):**
1. Map revealed. Player has 3:00.
2. If a map-pinned config exists → auto-loaded in 400ms. Player spends remaining time tweaking.
3. If no map pin → Player hits Ctrl+3 to load their general-purpose slot. 200ms.
4. If experimenting → Player modifies freely. At the 0:30 mark, a subtle pulse on the save icon reminds them to save. Quick-save to current slot (Ctrl+S) or save-as to a new named config.

**Quick Deploy assignment:**
Dragging a config card from the Named Collection onto a Quick Deploy slot replaces the slot's contents. The old config isn't deleted — it just loses its slot assignment. Slot ↔ collection pin is a many-to-one relationship.

**Strengths:**
- **Progressive complexity.** New players see 5 simple slots. Competitive players discover unlimited named collections. Map adaptation emerges naturally for Gauntlet regulars.
- **Speed when needed.** Ctrl+1 is always available, even for veterans with 100 named configs. The speed floor never degrades.
- **Map awareness without rigidity.** Pinning configs to maps is optional. General-purpose configs work fine without map tags.
- **Community sharing natural.** Named configs with tags export cleanly as Config Codes (7.03a). "Import my #cebu-defensive collection" works because the tag metadata is embedded in the code.
- **Auto-deploy reduces friction.** In Ghost Match, the auto-deploy pin determines which config your ghost uses on each map. Set it once, adapt when the meta shifts.

**Weaknesses:**
- **Three tiers is three things to explain.** Even with progressive unlocking, some players will be confused by the relationship between slots, names, and map pins.
- **Pin management overhead.** "Wait, is slot 3 still pinned to my old relay config or did I update it?" Pin state can become opaque if the player doesn't maintain it.
- **Implicit version history.** Unlike Model E's timeline, there's no automatic version tracking. Overwriting a slot or renaming a config destroys the previous state.

---

## Player Journeys

### Journey: Tomás, 16, first-time strategy gamer from Manila

**Context:** Just unlocked Gauntlet (Mission 5 complete). Has played 3 Ghost Matches, all losses. Currently has one config that sort-of works. Using the Arsenal (Model F).

**Minute 0:00 — The Quick Deploy Bar**
Tomás opens the Plan screen. The five Quick Deploy slots sit across the top. Slot 1 glows teal — it's his only saved config, "my first army" in the label. Slots 2-5 are dashed outlines. He's been tweaking his Slot 1 config between matches, overwriting each time. He doesn't know about named collections yet — the Tier 2 drawer icon is a subtle "..." he hasn't noticed.

**Minute 0:15 — The Loss Pattern**
His ghost just lost again. The Inspector shows his relay was destroyed early — the Cebu city map had tight corridors where the enemy striker could reach the relay in 3 ticks. He thinks: "I need a different relay position... but I don't want to lose my current setup." He hovers over Slot 2 (empty). The tooltip reads: "Empty slot — save current config here to create a variant." He clicks.

**Minute 0:30 — The Duplicate Discovery**
A save dialog appears. Pre-filled name: "my first army (copy)." He renames it "city defense" and clicks Save. Slot 2 now glows teal. He modifies Slot 2's config — moving the relay's hook to a different channel, adding a filter rule. His first config is preserved in Slot 1. He feels safe to experiment.

**Minute 1:00 — The Quick Switch**
He deploys Slot 2 as his ghost. Notification comes back: "Match vs. ghost_phoenix ready." He watches — it's on a Palawan jungle map. His city defense config doesn't work here — the relay needs wider signal range for jungle terrain. He presses Ctrl+1 to reload his original config. The workbench swaps in 400ms with the conveyor slide and spark sounds. He deploys Slot 1 for the jungle match. Now he has two configs for two situations. The mental model clicks: *different maps need different architectures.*

**Minute 2:00 — The Overflow**
Three weeks later, Tomás has 5 configs in Quick Deploy. Slots are: "scout rush," "relay chain," "city defense," "stealth experiment," "my first army (old)." He wants to save a sixth. No room. He hovers over the "..." icon next to Slot 5. A tooltip: "Open your full config collection." He clicks and discovers the Named Collection drawer — 5 configs listed, each with a pin icon for slots 1-5. He saves a new config "command test" in the collection, unpins "my first army (old)" from Slot 5, and pins "command test" instead. The drawer taught itself at the moment of need.

**UI Annotations:**
- Quick Deploy Bar: 5 × 48px brushed-metal slots, top of Plan screen, left-aligned
- Overflow icon: "..." glyph at right end of bar, amber on hover, opens Tier 2
- Save dialog: centered modal, 280px wide, name field + slot selector + Save button
- Conveyor swap: 400ms lateral slide, spark cascade on channel wire reconnections

---

### Journey: Dr. Amara, 38, ML engineer and Gauntlet Diamond-rank player

**Context:** Season 3, Diamond rank. Has 47 named configurations organized by strategic archetype. Preparing for a Sealed Duel tournament with Arms Race (Bo3) format.

**Minute 0:00 — Tournament Prep in the Named Collection**
Dr. Amara opens the Named Collection drawer (Ctrl+L). She types "#anti-relay" in the search field. 8 configs appear, each a variant of her counter-relay strategy. She scans the sparklines: v7 has the best recent win rate (71% over 14 matches), but v7b has a wider EM profile that might be detected. She loads v7 into Quick Deploy Slot 1 ("Primary") and v7b into Slot 2 ("Counter").

She then types "#anti-scout" — 5 configs. She loads the strongest into Slot 3. Then "#all-purpose" — her general-purpose config for unknown opponents goes into Slot 4. Slot 5 she leaves for mid-tournament improvisation.

Her Quick Deploy Bar now reads: [1: anti-relay-v7] [2: anti-relay-v7b] [3: anti-scout-4.2] [4: general-purpose-s3] [5: empty]. Five strategies, one keystroke each.

**Minute 1:00 — Map Adaptation Check**
She switches to the Map Adaptation tab. Taal province (the likely tournament map) shows her pinned config: "taal-specialized-v3." She depins it and pins "anti-relay-v7" instead — she expects relay-heavy opponents at Diamond rank. The Taal card now shows: "Anti-Relay v7 — Auto-deploy: ON." If the Sealed Duel starts on Taal, v7 loads automatically and the timer starts with her already configured.

**Minute 2:30 — Mid-Tournament Arms Race Adaptation**
Round 1 of her Bo3 starts. Taal map. Her anti-relay v7 auto-loads (400ms). She uses the remaining 4:30 of the 5-minute timer to add one extra hook she noticed was missing against command-heavy opponents. She saves the tweak to a new config: "anti-relay-v7-tourney-r1" (Ctrl+Shift+S for save-as).

Round 1 ends — she wins. Inspector reveals the opponent's architecture: scout-dominant with stealth hooks. Her anti-relay strategy won because the opponent's scouts couldn't handle her relay chain's compressed signals, but it was closer than expected.

Round 2 adaptation phase (2 minutes). She presses Ctrl+3 to load her anti-scout config. But she also wants to keep one element from her round 1 config — the extra hook. She opens the Named Collection, loads "anti-scout-4.2" into the workbench, then manually adds the hook from memory. She saves as "anti-scout-4.2-adapted." The entire adaptation took 45 seconds. She deploys with 1:15 remaining.

**Minute 5:00 — Post-Tournament Archival**
After winning the Bo3, Dr. Amara opens her Named Collection and creates a new tag: #tournament-2026-03-16. She tags all three configs used today. She also exports "anti-relay-v7-tourney-r1" as a Config Code and posts it to the community Workshop with a necropsy note: "v7 adapted for command-heavy relay-counter matchups on Taal — the extra hook on recon-net catches early positioning signals the base v7 misses."

**UI Annotations:**
- Search bar: instant filter with smooth reflow, amber focus ring
- Tag filter pills: horizontal scrollable strip, distinct muted colors per tag
- Sparkline: 10-match rolling window, green/red dots, hover to see individual match result
- Map Adaptation tab: tab in Named Collection drawer, shows archipelago cards with pin icons
- Auto-deploy toggle: per-province switch, cyan when active, ghost config icon when deployed

---

### Journey: Kai, 11, plays on an iPad, just finished Mission 7

**Context:** First strategy game. Doesn't know the word "loadout." Has been overwriting the same config for every mission. Just learned about the Command agent.

**Minute 0:00 — The Accidental Discovery**
Kai is on Mission 8, the first truly difficult mission. He's failed 4 times. Each time, he modifies his config and tries again — but he's lost track of what he changed. After attempt 4, the game shows a gentle tip in the Inspector: "Tip: Save different configurations to Quick Deploy slots so you can compare approaches." A small animation shows a finger tapping the empty Slot 2.

**Minute 0:10 — The First Save**
Kai taps Slot 2 (empty). The save dialog appears. He doesn't type a name — just taps "Save." The slot fills with his current config's unit icons. He continues modifying — removing a rule, adding a hook. The workbench now differs from Slot 2. He taps Slot 1 to see what was there (his original config from Mission 6). The conveyor swap slides in the old config. He taps Slot 2 — back to his modified version. He's swapping between two strategies for the first time. His eyes widen.

**Minute 0:30 — The A/B Test**
He deploys Slot 2 — fails at tick 14 (same chokepoint). Reloads Slot 1, adds a different relay position, saves to Slot 3. Deploys Slot 3 — survives to tick 22 before losing. Back to Slot 2, adds the relay idea from Slot 3. Saves over Slot 2. Deploys — passes the mission.

He looks at his Quick Deploy Bar: three configs, each representing a different approach to the same problem. He just performed his first systematic architecture comparison. No one told him to. The loadout system taught experimental methodology through slot mechanics.

**Minute 1:00 — The Share Moment**
His friend texts: "I'm stuck on Mission 8." Kai long-presses Slot 2 and sees "Share as Config Code." He taps it. A 60-character code appears with a "Copy" button. He pastes it into the text chat. His friend imports it, passes the mission, and texts back: "How did you figure out that relay placement?" Kai's config became a learning artifact — transmitted through the loadout system's export feature.

**UI Annotations:**
- iPad Quick Deploy: 5 slots in horizontal strip, 64×64px for touch targets
- Long-press context menu: Share, Duplicate, Rename, Delete — large touch-friendly buttons
- Config Code: 60-char string with Copy button, also generates QR code for scan
- Tip animation: ghost finger tapping empty slot, fades after 5 seconds, never repeats

---

### Journey: Sana, 28, blind software engineer using screen reader

**Context:** Competitive Gauntlet player using VoiceOver on macOS. Has 22 named configurations managed through keyboard shortcuts.

**Minute 0:00 — Keyboard-First Navigation**
Sana presses Ctrl+L to open the Named Collection. VoiceOver announces: "Config collection. 22 items. Search field." She types "relay" — VoiceOver: "Filter results: 8 configs." She presses Down Arrow to browse: "Anti-Relay v7. Tags: defensive, gauntlet. Win rate: 71 percent, 14 matches. Last edited: 2 hours ago." Down Arrow: "Relay Chain Primary. Tags: offensive, relay-heavy. Win rate: 58 percent, 24 matches."

She presses Enter on "Anti-Relay v7." VoiceOver: "Loading Anti-Relay v7 into workbench." The conveyor sound plays. VoiceOver: "Quick Deploy Slot 1 updated."

**Minute 0:20 — Quick Deploy as Spatial Memory**
In a Sealed Duel, the timer starts. VoiceOver: "Sealed Duel. Map: Cebu. Timer: 5 minutes." Sana immediately presses Ctrl+1 — her Cebu-specific config. VoiceOver: "Loaded: City Defense v3." She spends 4:40 making targeted tweaks. At 0:20, she presses Ctrl+S. VoiceOver: "Saved to Slot 1: City Defense v3." Submit.

The entire flow is keyboard-driven. Quick Deploy slots provide the spatial memory that sighted players get from visual position — Ctrl+1 IS the "top-left slot" in her mental model.

**Minute 0:40 — Tag Management as Organization Strategy**
After the match, Sana opens the Named Collection and navigates to "City Defense v3." She presses a shortcut to edit tags. VoiceOver: "Tags: cebu, defensive. Add tag field." She types "season-3" and presses Enter. VoiceOver: "Tag added: season-3." Her organizational system is entirely semantic — tags replace the visual grid that sighted players use.

**UI Annotations:**
- All Quick Deploy slots: ARIA labels with slot number, config name, and composition
- Named Collection: ARIA live region announces filter results count
- Config cards: role="listitem" with name, tags, win rate as accessible description
- Keyboard shortcuts: Ctrl+1-5 for slots, Ctrl+L for collection, Ctrl+S for save, Ctrl+Shift+S for save-as
- Screen reader mode: win-rate sparkline replaced with text "71 percent, 10 wins, 4 losses"

---

## Interaction Effects

**With PvP Models (7.01):**
- **Ghost Match (async):** The map-pinned auto-deploy from Model F's Tier 3 determines which config fights on which map. The ghost doesn't use one config — it uses the map-pinned config for each terrain. This makes map-adaptation a competitive advantage even in async.
- **Sealed Duel (timed):** Quick Deploy Ctrl+shortcuts are essential. 200ms to load vs. 5+ seconds to browse collections. The speed layer justifies its existence primarily in this mode.
- **Arms Race (iterative):** Mid-series adaptation requires saving new variants quickly. Save-as (Ctrl+Shift+S) with auto-naming ("[base config]-R2") supports the round-by-round evolution pattern.
- **Gauntlet (ranked):** Auto-deploy per map is the Gauntlet killer feature. 200+ matches across all maps — manual config selection every time would be exhausting.

**With Config Codes (7.03a):**
- Export from any tier: right-click → Export Config Code. The code includes the config's name and tags as metadata (human-readable envelope header).
- Import creates a new entry in the Named Collection with preserved name/tags but no slot assignment. The player must manually pin to a Quick Deploy slot.
- Community imports tagged with terrain types (#cebu, #taal) appear automatically in the Map Adaptation view as unpinned suggestions.

**With Inspector (locked):**
- Post-battle Inspector should show which loadout was deployed: "Config: Anti-Relay v7, Quick Deploy Slot 1, Map Pin: Taal." This metadata helps the player trace which configuration produced which result.
- The config necropsy (7.10) format should embed loadout evolution: "Went from v5 (loss) → v6 (loss with improvement) → v7 (win). Changes: added filter rule on relay, changed eviction priority to FIFO."

**With Campaign (locked):**
- Quick Deploy unlocks at Mission 5 (factory introduction). Before Mission 5, the player has pre-placed units and doesn't need loadouts.
- Named Collection unlocks with Gauntlet. No need to clutter the campaign experience with advanced loadout management.
- Campaign missions should auto-save a "Mission N config" snapshot to the Named Collection after completion, so players can revisit their winning configs.

**With Blueprint Codex (locked):**
- The Codex should have a "My Configs" section linking to the Named Collection. Viewing a skill's Codex entry should show which saved configs use that skill.
- "Configs using [compress]": filtered list showing all saved configs that equip the compress skill on any blueprint.

**With Onboarding (Wave 5):**
- The loadout system must NOT appear before Mission 5. Five slots appearing on the Plan screen from Mission 1 would imply the player needs 5 different configs — overwhelming for someone learning what a config even is.
- The first save should be prompted: after the player's first loss-then-win cycle in the factory era, suggest: "You figured out a winning architecture! Save it to Quick Deploy so you can always return to it."

---

## Comparable Games

**Call of Duty — Custom Classes (The Garage Model):**
10 numbered custom classes. Each stores weapon loadout, perks, equipment. Players swap between numbered classes in the lobby. Muscle memory develops: "Class 3 is my sniper." Works because individual loadout complexity is low — ~8 decisions per class. Robot Uprising's architecture complexity is 10× higher, so pure numbered slots feel more constraining.

**StarCraft II — Build Orders (External Tooling Problem):**
SC2 has no in-game build order save system. The community built Spawning Tool, SALT, and RTS Overlay as external tools — overlays showing step-by-step build orders during matches. This is a cautionary tale: *if you don't build the loadout system, the community will build an inferior version outside your game.* Robot Uprising's loadout system should make external tools unnecessary.

**Gladiabots — AI Save System:**
Gladiabots saves AI programs in the Windows registry with cloud backup sync. Multiple AI programs can be created and deployed. The system is functional but minimal — no tags, no map association, no version history. Robot Uprising should exceed Gladiabots' bare-minimum approach significantly, as configs are more complex and the competitive scene demands more organizational tools.

**Slay the Spire — Deck Runs (No Loadout by Design):**
StS deliberately prevents pre-built decks. Each run builds a deck from scratch. The roguelike structure means loadouts are antithetical to the design. Robot Uprising is the opposite: configs persist, and the loadout system is part of the competitive meta. However, StS's lesson is important — the thrill of discovery must not be killed by optimal loadout convergence.

**Teamfight Tactics — External Comp Builders (TFTactics, LoLChess):**
TFT's "comp planning" is handled entirely by third-party tools. In-game, players improvise based on what champions appear. But the comp-builder ecosystem (team builders, meta trackers, overlay apps) proves that players *want* to plan and save strategies even when the game doesn't support it. Robot Uprising should provide this natively.

**Factorio — Blueprint Library:**
Factorio's blueprint library is the gold standard for shareable configuration management. Players save factory designs (blueprints), organize them in books, and share via strings. The system supports: nested books, naming, description fields, export as base64 strings, Steam Workshop integration. The Config Code system (7.03a) already borrows from this. The loadout system should feel like Factorio's blueprint library crossed with a deployment dashboard.

**Sakura Arms (Furuyoni) — Hidden Deck Construction:**
The board game Sakura Arms has players build a 10-card deck from two character sets. The competitive depth comes from *hiding which cards you picked* — your opponent doesn't know your loadout until you play it. Robot Uprising's Sealed Duel has the same property: both players build blind, then reveal simultaneously. The loadout system must support this opacity — no accidental leaks of config details before the seal breaks.

---

## Sensory Summary

**Audio vocabulary:**
- Save: mechanical *chunk* (car door closing, satisfying finality)
- Load/swap: conveyor-rail *shhhk-CLUNK* (400ms, hardware movement)
- Quick Deploy hotkey: brief metallic *tick* (200ms, immediate confirmation)
- Slot pin assignment: magnetic *snap* with a rising pitch (connection made)
- Config Code export: data-transmission *bzzt-ping* (outgoing signal)
- Config Code import: data-reception *ping-bzzt* (incoming signal, reversed)

**Color language:**
- Occupied slot: teal glow with unit composition mini-bar colors
- Active/loaded slot: gold border pulse
- Empty slot: dashed outline at 30% opacity
- Map-pinned config: cyan pin icon
- Auto-deploy active: small animated satellite dish icon
- Win streak config: subtle green shimmer on card edge
- Loss streak config: subtle amber (not red — amber suggests "needs attention" not "failure")

**Animation hierarchy:**
1. Quick Deploy swap: 200ms (hotkey) or 400ms (click) — fastest operation, conveyor slide
2. Named Collection load: 600ms — card-lift dissolve into workbench assembly
3. Map Adaptation auto-load: 800ms — province terrain fills background + config assembles
4. First save ever: 1200ms — celebratory stamp animation with achievement-style fanfare
5. Tournament auto-deploy: 400ms + map-reveal — fastest possible competitive start

---

## TikTok Clip

Split screen, top and bottom. Top: player's hands on keyboard at a tournament. Timer reads 4:58. Map revealed: Taal. Their Quick Deploy auto-loads a config in 400ms — the workbench assembles itself with spark cascades. They spend 4 seconds verifying, then press SUBMIT at 4:52. Arms crossed. Bottom: opponent frantically building from scratch, timer at 3:00 and still wiring hooks. Text overlay: **"When your loadout system is better than your opponent's mechanics."** The message: preparation IS the skill. The loadout system is a competitive weapon.

---

## New Aspects Discovered

- **7.01a-i — Loadout diff view between saved configs:** Side-by-side comparison of two loadout slots showing rule differences, hook wiring changes, and production queue deltas; the "what did I actually change between v6 and v7?" tool; interaction with config necropsy (7.10) and Inspector
- **7.01a-ii — Auto-deploy ghost rotation for async PvP:** Instead of one ghost config per map, a rotation queue of 3 configs per map that cycles — preventing opponents from hard-countering a single known ghost; the "unpredictable ghost" as competitive advantage; interaction with Ghost Match model (7.01)
- **7.01a-iii — Loadout warmup: recent-play bonus for frequently used configs:** A subtle statistical advantage (or visual confidence indicator) for configs that have been recently deployed and tuned vs. configs dormant for weeks; the "practice makes perfect" signal; interaction with win-rate sparkline and competitive integrity
- **7.01a-iv — Opponent-specific loadout tagging in Gauntlet:** After multiple matches against the same opponent, the Named Collection surfaces a "vs. [opponent]" filter showing which configs you've used against them and their outcomes; the "scouting report" as loadout metadata; interaction with Arms Race adaptation (7.01)
- **7.01a-v — Loadout inheritance and template configs:** A "template" config type that can be partially inherited — lock certain elements (relay blueprint, channel names) while leaving others open for per-match customization; the "base class" config that sub-configs extend; interaction with Blueprint Codex and community sharing

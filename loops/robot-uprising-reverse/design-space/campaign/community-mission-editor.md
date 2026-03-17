# Community Mission Editor

**Aspect:** 5.08b — Community mission editor: tools for creating custom missions of each type; mission type as template system with adjustable parameters

**Category:** campaign
**Wave:** 5 — Campaign & Progression

---

## The Core Design Problem

Robot Uprising's 10-mission campaign is finite. The Gauntlet extends replayability through adversarial modifiers, but the *scenario space* — the enemy configurations, board layouts, terrain mixes, victory conditions — is developer-authored. A community mission editor transforms the scenario space from a fixed catalog into a living, player-generated ecosystem.

The fundamental tension: **the game's core vocabulary (skills, rules, hooks, context config) is already a visual composition system.** The player is already an "editor" in the Plan screen. A mission editor must feel like a natural extension of the workbench — not a separate tool with its own paradigm. The best mission editors feel like playing the game from the other side of the board.

The second tension: **mission quality is harder to validate than config quality.** A config either works or it doesn't — the sealed watch proves it. A mission can be *technically* completable but deeply unfun, unfair, or trivial. Quality gating for missions requires fundamentally different validation than config validation.

The third tension: **Robot Uprising's mission types (Filter Puzzle, Information Asymmetry, Composition Challenge, Escalation Cascade, Impossible Restart, Counter-Architecture) are structural archetypes, not just enemy placements.** A mission editor that only lets you place enemies on an 8x8 grid produces generic scenarios. A mission editor that exposes the archetype scaffolding produces missions that teach specific architectural skills.

---

## Four Editor Models

### Model 1: "The Scenario Stamp" (Template-First)

**How it works:** The player selects one of the six locked mission types as a template. Each template exposes 8-15 adjustable parameters — sliders, toggles, dropdown menus — organized into sections matching the mission type's structural challenge. The editor generates a complete mission from these parameters. The player can preview it, test it, adjust, repeat. No freeform enemy placement. No custom victory conditions. The template IS the editor.

**What the player sees:**

A full-width panel divided into three columns:

- **Left column (Template Selector):** Six cards arranged vertically, each showing the mission type's icon, name, and one-sentence description. The selected card glows cyan with a pulsing left border. Unselected cards are dim with dashed borders. Hovering a card shows a 3-second animated preview of a canonical scenario of that type playing out on a tiny 4x4 board in the card's background.

- **Center column (Parameter Panel):** The meat of the editor. For each template, a scrollable list of parameter groups. Each group has a header (e.g., "Enemy Composition," "Terrain," "Timing," "Victory Conditions") with collapsible sections below. Parameters are rendered as:
  - **Sliders** for continuous values (enemy count: 3-12, escalation rate: slow/medium/fast/brutal, noise volume: whisper/chatter/roar)
  - **Toggle rows** for boolean flags (fog of war: on/off, pre-placed units: yes/no, factory available: yes/no)
  - **Dropdown menus** for categorical choices (biome: jungle/beach/city/terrace/volcano, enemy archetype: swarm/stealth/artillery/counter-intel)
  - **Drag-reorder lists** for sequenced elements (wave composition: [scout wave, pause, striker wave, mixed wave])

  Each parameter shows a **tooltip on hover** explaining what it does in player-facing language: "Higher noise volume means more junk signals flooding your units' context windows. At 'roar,' every unit receives 2-3 irrelevant signals per tick."

  A **difficulty estimation bar** at the top of the parameter panel updates in real-time as parameters change — a horizontal thermometer from green (Easy) through amber (Hard) to red (Nightmare), with a numerical score (1-100) and a label like "Comparable to Mission 7 difficulty."

- **Right column (Preview Board):** A live 8x8 board preview showing the generated scenario. Enemy spawn positions marked with red pulsing dots. Player factory position marked with cyan. Terrain tiles rendered in the selected biome. Victory condition shown as an overlay (e.g., "Eliminate all enemies" with a skull icon, "Survive 30 ticks" with a clock icon, "Destroy enemy base" with a crosshair on the enemy factory).

  Below the board: a **"Test Run" button** (amber, prominent) that launches the player into a full Plan→Watch→Inspector loop against their own scenario. This is the proof-of-solvability gate — the scenario cannot be published until the creator has beaten it at least once.

**Template parameter examples for each mission type:**

| Mission Type | Key Parameters |
|---|---|
| **Filter Puzzle** | Noise type (random/patterned/adversarial), noise density (1-5 per tick), signal-to-noise ratio, number of "real" threats, pre-configured unit count |
| **Information Asymmetry** | Fog coverage (25/50/75/100%), relay availability, scout perception radius override, enemy stealth level |
| **Composition Challenge** | Threat count (2-5 independent threats), threat diversity (same type/mixed/fully diverse), timing overlap (simultaneous/staggered/cascading) |
| **Escalation Cascade** | Starting intensity, escalation rate curve (linear/exponential/stepwise), peak intensity, cascade duration in ticks |
| **Impossible Restart** | Which unit types can be lost, recovery tool availability, checkpoint system (none/single/multiple) |
| **Counter-Architecture** | Enemy intelligence model (random/reactive/predictive), enemy adaptation rate, counter-strategy pool size |

**Strengths:**
- **Lowest possible floor.** A player who has never designed anything can create a publishable mission in under 5 minutes by selecting a template and moving 3-4 sliders.
- **Structural guarantee.** Every generated mission inherits the archetype's pedagogical structure. A Filter Puzzle template always produces a scenario that tests signal discrimination. A player cannot accidentally create a mission that teaches nothing.
- **Difficulty estimation is reliable.** Because the parameter space is bounded and the generation algorithm is deterministic, difficulty scores are accurate and consistent.
- **Validation is trivial.** The parameter ranges are pre-validated — every combination produces a completable (though possibly very hard) scenario.

**Weaknesses:**
- **Low ceiling.** Veterans will exhaust the template space quickly. "I've seen every Filter Puzzle this editor can produce" — the combinatorial space is large but not infinite, and many parameter combinations produce perceptually similar scenarios.
- **No creative expression.** The editor doesn't let you tell a story, create a surprise, or design a moment. You're adjusting dials on a machine, not crafting an experience.
- **The "slot machine" feel.** Without freeform placement, the editor can feel like pulling a lever and seeing what comes out rather than building something intentional.

**Comparable games:** Into the Breach's Custom Squad selector (choose units, game generates scenarios), Slay the Spire's Custom Mode (toggle modifiers, game generates runs). Neither has a full mission editor, but both let players constrain the generation space.

**Sensory description:** The template selector cards have a matte charcoal background with the mission type icon rendered in thin cyan wireframe — like blueprint drawings. When you select one, the icon fills with solid cyan and the card lifts slightly with a soft mechanical *click*. The parameter panel scrolls with inertia and each slider has a thin amber track with a circular thumb that leaves a fading cyan trail as you drag it. The difficulty bar at the top fills smoothly with a liquid animation — green flowing to amber flowing to red — and the number ticks up/down with a soft *tck-tck-tck* like a mechanical counter. The preview board updates in real-time with a 200ms delay after each parameter change, tiles fading and reappearing as the generation algorithm runs, accompanied by a quiet *shff* sound like cards being shuffled.

---

### Model 2: "The War Room" (Board-First Freeform)

**How it works:** The player starts with a blank 8x8 grid and places elements directly: terrain tiles, enemy spawn points, enemy unit types, the player factory, resource nodes, and trigger zones. Victory conditions are configured in a sidebar. Enemy behavior is selected from pre-built AI archetypes (not custom-scripted). The editor is a spatial canvas with drag-and-drop placement.

**What the player sees:**

The layout mirrors the Plan screen but with the roles reversed — instead of configuring YOUR units on the right while viewing the board on the left, you're configuring THE BOARD on the left while viewing the mission properties on the right.

- **Center (dominant): The Board Canvas.** An 8x8 grid with a thick dashed border and axis labels (A-H, 1-8). Empty tiles show a faint checkerboard pattern. Click a tile to select it. Selected tile gets a cyan highlight ring. The board supports multi-select (Shift+click) and area select (click-drag rectangle).

- **Left sidebar: The Palette.** A vertical strip of placeable elements organized into tabs:
  - **Terrain tab:** Five biome tiles (jungle, beach, city, terrace, volcano) plus "impassable" and "hazard" tiles. Drag from palette to board, or click palette then click board tiles to paint.
  - **Units tab:** Three enemy unit types (enemy scout 👁, enemy striker ⚔, enemy relay 📡) plus "enemy spawner" (the enemy factory). Each shows a small stat card on hover (perception radius, buffer size, hook count). Also includes "player factory" placement.
  - **Objects tab:** Resource nodes (material tags), signal jammers (emit noise), barriers (block movement but not signals), and checkpoint flags.
  - **Triggers tab:** Zone triggers — draw a rectangular area on the board that fires when a player unit enters/exits. Used for wave triggers, reinforcement spawns, or victory conditions.

- **Right sidebar: Mission Properties.** Stacked sections:
  - **Victory Condition** dropdown: Eliminate All / Destroy Base / Survive N Ticks / Reach Zone / Escort VIP
  - **Wave Editor:** A timeline strip showing when each enemy spawns. Drag enemy icons onto the timeline. The timeline ticks in game-ticks (1-120). Waves are colored groups that can be expanded/collapsed.
  - **Enemy Behavior:** Per-enemy-group AI archetype selector (Patrol, Guard, Hunt, Swarm, Stealth, Counter-Intel). Each archetype has a one-line description and a 3-second animation preview.
  - **Player Constraints:** Toggles for pre-placed units (if on, a sub-editor lets you place and configure player units), factory available (if on, the player builds freely), budget limit (material cap).
  - **Biome Override:** Force all terrain to one biome, or allow per-tile mixed biomes.
  - **Metadata:** Mission name (freeform text, 40-char limit), description (200-char limit), difficulty self-assessment (1-5 stars, shown to players alongside the computed difficulty).

- **Bottom bar: Toolbar.** Undo/Redo (Ctrl+Z/Y), Clear Board, Randomize (fills the board with a random valid configuration), Symmetry Mode (mirror placements across center axis — useful for fair PvP scenarios), Grid Overlay (show perception radii, signal ranges, movement paths).

**The proof-of-solvability flow:** Hitting "Test" launches the mission exactly as a player would experience it. If you win, a green checkmark appears on the "Publish" button. If you lose, the button stays greyed out with a tooltip: "Beat your own mission to publish it." The creator's winning config is stored as the **author proof** — a reference solution that validates the mission is completable. The author proof is hidden from players but available to the automated validation system.

**Strengths:**
- **High creative expression.** The spatial canvas lets creators tell stories through geography. A narrow canyon funneling enemies through a chokepoint. A resource node isolated behind enemy lines. A VIP starting position surrounded on three sides. These spatial stories emerge from freeform placement and are impossible in the template model.
- **The Mario Maker magic.** Mario Maker proved that spatial editors are intrinsically fun — the act of placing objects on a grid and then playing through your creation is a core loop unto itself. The War Room captures this.
- **Emergent mission types.** Creators will discover mission archetypes the developers didn't anticipate. A "labyrinth" scenario with walls creating a maze. A "siege" where the player factory is surrounded. A "race" where two paths lead to the enemy base but only one is viable.

**Weaknesses:**
- **Quality floor is low.** Freeform placement means creators can make unfun, unfair, trivial, or broken missions. An enemy spawner placed adjacent to the player factory. An empty board with one scout. A board with 12 strikers and no cover. Proof-of-solvability prevents literally impossible missions but not bad ones.
- **Balance is the creator's problem.** The difficulty estimation is unreliable because the spatial arrangement of elements creates interactions the algorithm can't easily evaluate. A mission with 6 enemies in a line feels very different from 6 enemies in a flanking formation.
- **Wave editor complexity.** Timing enemy spawns correctly is a second skill beyond spatial design. Many creators will produce missions where enemies trickle in too slowly (trivial) or all arrive at once (overwhelming).

**Comparable games:** Super Mario Maker (spatial canvas + play-to-publish), Warcraft III World Editor terrain editor (tile painting + unit placement), Into the Breach (the editor the community wanted but never got).

**Sensory description:** The empty board canvas has a dark slate background with thin cyan grid lines and corner tick marks at each cell intersection — identical to the battlefield aesthetic but with a subtle "draft mode" dashed line treatment. Placing a terrain tile produces a satisfying *thock* as the tile drops into the grid with a 50ms scale-up animation from 0.8x to 1.0x. Enemy units placed on the board show a faint red perception radius circle that fades on and off like a heartbeat. The player factory, when placed, emits a subtle cyan glow that illuminates the 3x3 area around it. Multi-selecting tiles turns them all amber with a unified selection border. The wave editor timeline at the bottom is a horizontal strip of amber grid lines (one per tick) with enemy icons sitting on the timeline like notes on sheet music — dragging them produces a sliding *whoosh* and snapping them to a tick produces a click. The Randomize button triggers a 1-second cascade animation where tiles flip and fill left-to-right, top-to-bottom, like a shuffled deck dealing itself onto the table.

---

### Model 3: "The Thesis Defense" (Constraint-First)

**How it works:** Instead of designing a scenario, the creator designs a *teaching objective*. They specify what architectural skill the mission should test, and the editor generates scenarios that test it. The creator then curates: approving, rejecting, or tweaking generated scenarios until they find ones that teach the intended lesson effectively.

This is the inverse of Model 1. Model 1 says "choose a template, adjust parameters, get a scenario." Model 3 says "declare what the player should learn, the system generates scenarios, you curate the best ones."

**What the player sees:**

- **Top panel: The Thesis Statement.** A structured form where the creator declares:
  - **Primary skill tested:** Dropdown from a taxonomy of architectural skills: Context Management, Signal Routing, Hook Composition, Rule Priority, Channel Design, Compression Strategy, Eviction Policy, Emission Control, Production Sequencing, Meta-Architecture.
  - **Difficulty target:** 1-5 scale corresponding to campaign progression (1 = Mission 1 level, 5 = Mission 10 level).
  - **Constraint tags:** Multi-select checkboxes: "Requires relay chains," "Tests under noise," "Punishes single-point-of-failure," "Rewards emission discipline," "Requires multi-unit coordination."
  - **Anti-patterns to punish:** What common bad architectures should this mission expose? "All-to-all channel topology," "Single relay bottleneck," "No eviction policy," "Overloaded command unit."

- **Center panel: The Generation Gallery.** After submitting the thesis, the system generates 6-12 candidate scenarios displayed as small board thumbnails (4x4 simplified previews) arranged in a 3x4 grid. Each thumbnail shows terrain layout, enemy positions, and a one-line summary ("8 enemies, 2 waves, jungle terrain, fog 50%"). A colored badge shows estimated difficulty (green/amber/red) and a tag shows which anti-pattern it most effectively punishes.

  The creator clicks a thumbnail to expand it to full 8x8 preview with detailed parameter breakdown. From the expanded view, they can:
  - **Approve** (green checkmark) — adds to the curated set
  - **Reject** (red X) — removes and requests a replacement
  - **Tweak** (amber wrench) — opens the parameter panel from Model 1 for fine-tuning
  - **Regenerate Similar** (refresh icon) — generates 3 more scenarios similar to this one but with random variations

- **Bottom panel: The Curated Set.** Approved scenarios appear as a horizontal strip of board thumbnails. The creator selects one to be the published mission. Multiple approved scenarios can be bundled as a "mission pack" — a set of 3-5 scenarios that all test the same thesis from different angles.

**The thesis validation flow:** After the creator beats their chosen scenario, the system runs the author's winning config against all 6-12 generated scenarios. If the same config beats more than 80% of them, the mission is flagged as "thesis-weak" — meaning the winning strategy doesn't need the specific skill the thesis claims to test. The creator must either choose a harder scenario or refine their thesis.

**Strengths:**
- **Missions teach by design.** Every published mission has an explicit pedagogical purpose. The community catalog becomes a searchable curriculum: "Show me all missions that test emission control" or "I need to practice eviction policies."
- **Quality floor is high.** The thesis validation flow catches missions that don't actually test what they claim. A "compression strategy" mission that's beatable without ever using compress gets rejected.
- **Curation is fun.** Browsing generated scenarios and picking the best ones is a game-within-the-game — like judging a design competition. The "Regenerate Similar" flow creates a satisfying iteration loop.
- **Pedagogical metadata.** Unlike Models 1 and 2, every mission carries machine-readable learning objectives. This enables smart recommendation: "You struggled with Mission 7's noise flooding. Here are 5 community missions that teach noise management."

**Weaknesses:**
- **High cognitive floor.** The creator needs to understand the skill taxonomy well enough to write a meaningful thesis. New players who just finished the campaign can't articulate "I want to test eviction policies under adversarial noise with multi-unit coordination" — they barely know what eviction policies are.
- **Creative straitjacket.** Some of the best community content in other games (Mario Maker's Rube Goldberg machines, Baba Is You's rule-bending puzzles) emerge from creative freedom, not pedagogical intent. The Thesis Defense model can't produce "weird" missions — only "educational" ones.
- **Generation quality dependency.** If the generation algorithm produces bland scenarios, curation can't save it. "Pick the best of 12 mediocre options" is less satisfying than "build something great from scratch."

**Comparable games:** Baba Is Y'all (academic research — ML-assisted level generation with quality-diversity), Duolingo's exercise generation (constraint-based pedagogical content generation), Khan Academy's exercise templates (skill-tagged content libraries).

**Sensory description:** The thesis statement panel has a clean white-on-dark form layout like a minimalist web application. Each dropdown and checkbox has a soft cyan focus ring. Submitting the thesis triggers a 2-second generation animation: the Gallery panel fills with loading skeletons (pulsing grey rectangles) that resolve one by one from top-left to bottom-right, each thumbnail materializing with a quick fade-in and a faint *ping* sound at different pitches — the pitches corresponding to the difficulty level (low pitch = easy, high pitch = hard), so the generation sounds like an ascending arpeggio if the scenarios range from easy to hard. Approving a scenario plays a crisp mechanical *stamp* sound and the thumbnail slides down to the curated strip with a smooth animation. Rejecting plays a soft *whoosh* as the thumbnail dissolves and a new one generates in its place. The thesis-weak warning appears as an amber banner sliding down from the top of the gallery with a gentle shake animation and a *buzz* tone.

---

### Model 4: "The Replay Remix" (Fork-First)

**How it works:** The player starts from an existing mission — campaign, Gauntlet, or another community mission — and forks it. The original mission's board, enemies, wave timing, and victory conditions load into the editor. The creator then modifies whatever they want. The published mission carries a visible provenance chain: "Forked from Mission 7 → 'The Noise Floor' by PlayerX → 'The Silent Floor' by PlayerY."

This is how most creative tools actually work in practice: modification is easier than creation. Git for missions.

**What the player sees:**

- **Entry point: The Fork Button.** Available in the Inspector screen after completing any mission. A small fork icon (🔀) in the toolbar, between the replay controls and the share button. Clicking it opens a confirmation: "Fork this mission into the editor? You'll start with everything as-is and can modify freely."

- **The editor itself is Model 2 (War Room)** with one addition: a **Diff Panel** on the right sidebar showing what's changed from the original. Added enemies show as green outlines on the board. Removed enemies show as red translucent ghosts. Changed terrain tiles show a split-diagonal (original on top-left, new on bottom-right). Modified wave timing shows the original timeline as a grey ghost behind the amber current timeline.

- **The provenance chain** is displayed as a horizontal breadcrumb bar at the top of the editor: `Campaign M7 → "The Noise Floor" (PlayerX, 847 plays) → Your Fork`. Each node is clickable — clicking loads that version for comparison. A "Compare" toggle splits the board into left/right showing original and fork side by side.

- **Fork constraints:** The creator can optionally lock certain elements of their fork so that downstream forkers can't change them. A terrain tile can be locked (shows a tiny padlock icon). An enemy placement can be locked. This creates "mutation pathways" where certain elements are invariant while others evolve through the fork chain.

**The remix culture flow:** The community catalog displays missions as trees, not flat lists. The root is the original mission. Each fork is a branch. Popular forks grow their own sub-branches. The catalog browser shows these trees as expandable node graphs — like a git commit graph but for missions. Players can browse by "most-forked missions" to find the community's favorite starting points.

**Strengths:**
- **Lowest creative barrier.** Starting from a working mission means the creator never faces a blank canvas. Every fork starts in a valid, playable state. The question shifts from "what should I build?" to "what should I change?" — a much easier question.
- **Provenance enables learning.** A player struggling with Mission 7 can browse the fork tree to see how others modified it — easier versions, harder versions, versions that test different skills. Each fork is an implicit design lesson: "what happens if I add 3 more enemies here?"
- **Emergent curation.** The fork tree naturally surfaces quality. Heavily-forked missions are good starting points. Deeply-nested fork chains show design lineages worth exploring. Fork trees that dead-end (no further forks) were evolutionary dead ends — the community voted with their attention.
- **Attribution is built-in.** Every mission carries its creator lineage. This creates social capital: being the root of a popular fork tree is prestigious. "My mission spawned 200+ variants" is a meaningful community achievement.

**Weaknesses:**
- **Originality is diluted.** If every mission is a fork of a fork of a campaign mission, the design space clusters around the campaign's original scenarios. The most creative missions — the ones that use the board in ways the developers never imagined — are harder to discover in a forest of incremental modifications.
- **Fork fatigue.** A catalog dominated by slight variations of the same 10 missions can feel stale. "Oh, another Mission 7 fork with extra enemies. Next."
- **Attribution disputes.** "You just changed one tile from my mission and published it as your own." The provenance chain makes this visible but doesn't resolve the social tension.
- **Lock conflicts.** If a mission locks most of its elements, forks become trivially similar. If nothing is locked, forks can be so different they shouldn't share attribution. Finding the right default lock policy is a design problem with no obvious solution.

**Comparable games:** Baba Is You's levelpack system (community builds on community work), Minecraft redstone circuit sharing (copy → modify → share), GitHub's fork model (provenance tracking, diff visualization, fork networks), Fortnite Creative (remix culture, attribution via island codes).

**Sensory description:** The Fork button in the Inspector toolbar is a small icon that subtly glows when hovered — a branching path rendered in thin cyan lines on a dark background. Clicking it triggers a brief "splitting" animation: the current board visually duplicates, with the original sliding left and fading to 50% opacity while the copy stays centered and gains a dashed cyan border indicating edit mode. The diff panel shows additions as pulsing green outlines (like ghost unit previews in the Plan screen) and removals as red translucent afterimages that slowly fade. The provenance breadcrumb bar at the top uses a circuit-board visual language: each node is a small diamond connected by data-cable lines, with the current fork's diamond pulsing gold. Hovering a provenance node shows a tooltip with the author's name, play count, and a tiny 3x3 board thumbnail. The Compare toggle splits the board with a vertical divider that the player can drag left/right, the original on the left in slightly desaturated colors and the fork on the right in full saturation — the divider line itself rendered as a glowing amber seam.

---

## The Recommended Hybrid: "The Workshop Spectrum"

No single model serves all players. The editor should expose all four models as entry points along a complexity spectrum, with seamless transitions between them:

```
[Template Stamp] ←→ [Thesis Defense] ←→ [Replay Remix] ←→ [War Room]
   Simplest                                                   Most creative
   5 min                                                      30+ min
   Guaranteed quality                                         Maximum expression
```

**The entry screen** presents four doors:

1. **"Quick Mission"** → Template Stamp (Model 1). For players who want to generate a mission in under 5 minutes.
2. **"Teach Something"** → Thesis Defense (Model 3). For players who want to create a mission that tests a specific skill.
3. **"Remix"** → Replay Remix (Model 4). For players who want to modify an existing mission. Entry point can also be the Inspector fork button.
4. **"Build from Scratch"** → War Room (Model 2). For players who want full creative control.

**Crucially, every model can transition to every other model.** A Template Stamp mission can be "opened" in the War Room for freeform editing. A War Room mission can be analyzed for its thesis (what skill does it test?). A Replay Remix can be stripped to its template parameters. These transitions are one-click operations with clear "you're entering a more advanced editor" transitions.

---

## Validation & Publishing Pipeline

All four models share a common publishing pipeline:

1. **Structural Validation** (automated, instant): Schema compliance, all referenced elements exist, board is reachable (no isolated sections), at least one enemy, factory or pre-placed units present.

2. **Proof of Solvability** (creator-driven): The creator must beat their own mission. The winning config becomes the author proof. This is the Mario Maker principle — and it's non-negotiable. A mission that the creator can't beat is by definition either too hard for the intended difficulty or fundamentally broken.

3. **Quality Heuristics** (automated, 2-5 seconds):
   - **Trivial detection:** If the author proof uses only 1 unit type with default config → flagged as possibly too easy.
   - **Cheese detection:** If the author proof ignores 50%+ of the mission's enemies → flagged as possibly bypassable.
   - **Duration estimation:** Simulate 100 random configs against the mission. If >80% lose in under 10 ticks → flagged as possibly too hard. If >80% win → flagged as possibly too easy.
   - **Thesis validation** (Model 3 only): Author config vs. generated variants check.

4. **Text Filtering** (automated, instant): Mission name and description pass through the moderation pipeline (see 7.03b).

5. **Publication Metadata:**
   - Auto-generated tags: mission type, tested skills, estimated difficulty, biome, unit types present
   - Creator-authored tags: up to 5 freeform tags (filtered)
   - Provenance chain (if forked)
   - Author proof stored (hidden from players)

6. **Post-Publication Metrics:**
   - Play count, completion rate, average retry count
   - Player difficulty ratings (1-5 post-completion survey: "Was this harder or easier than you expected?")
   - Fork count (if enabled)
   - Report count and resolution status

---

## Player Journeys

#### Journey: Marites, 45, Cebu, Math Teacher

**Context:** Completed the campaign two weeks ago. Struggled most with Mission 7 (noise flooding). Wants to create practice scenarios for her students who are learning context management in her AP Computer Science class.

**Minute 0:00 — The Workshop Door**
Marites opens the Community Workshop from the campaign map's corner icon — a small workbench silhouette. Four doors appear: Quick Mission, Teach Something, Remix, Build from Scratch. She hovers over "Teach Something" and reads the tooltip: "Design a mission that tests a specific architectural skill. The system generates scenarios — you curate the best ones." She clicks it.

**Minute 0:30 — Writing the Thesis**
The thesis panel loads. Primary skill: she opens the dropdown and sees the taxonomy. She recognizes "Context Management" immediately — that's what Mission 7 taught her. She selects it. Difficulty target: she drags to 2 (her students are beginners). Constraint tags: she checks "Tests under noise" and "Punishes single-point-of-failure." Anti-patterns to punish: she checks "No eviction policy" — she wants students to learn that ignoring eviction is fatal.

She clicks "Generate Scenarios." A soft hum plays as the gallery fills with 12 thumbnails, materializing one by one with ascending *pings*.

**Minute 1:30 — Curating the Gallery**
She clicks the first thumbnail: 6 enemies, jungle terrain, heavy noise. The preview board shows noise emitters scattered around the edges. The difficulty badge says "2.3 — Comparable to Mission 3." She likes it — but the terrain is all jungle. She clicks "Tweak," changes the biome to "Mixed" (jungle + city), and the preview updates. Better — the city tiles create clear sightlines contrasting with jungle fog. She approves it.

The second thumbnail is too hard (difficulty 3.8). She rejects it. The third is interesting — a scenario where noise increases every 5 ticks, forcing the player to progressively tighten their eviction policy. She approves it as a second option.

**Minute 4:00 — Testing Her Mission**
She selects her first approved scenario and clicks "Test Run." The Plan screen loads with her own workbench. She builds a simple config: 2 scouts with eviction policies set to "newest first" (she knows this is wrong for noise scenarios — she wants to verify the mission catches this mistake). She hits EXECUTE.

The sealed watch runs. Her scouts flood with noise, context bars filling orange then red, then — *crack* — both stunned on tick 8. Enemies walk through. She loses. Perfect. The mission punishes the exact anti-pattern she wanted.

She rebuilds with "lowest-relevance-first" eviction and noise-filtering hooks. This time her scouts stay clear. She wins on tick 24. The "Publish" button lights up green.

**Minute 7:00 — Publishing**
She names it "Noise 101: The Clean Context" with a description: "Can your units think clearly when the world is screaming? Practice eviction policies under increasing noise pressure." She adds tags: "educational," "noise," "beginner." The validation bar fills — STRUCTURE ✓, QUALITY ✓, CONTENT ✓. Published.

She copies the mission code and pastes it into her class's Discord channel: "Homework: beat this mission with 3 different eviction policies. Screenshot your Inspector for each."

**UI Annotations:**
- Thesis panel: 400px wide, dark background, form elements with 16px padding
- Gallery grid: 3×4 thumbnails, each 160×160px, 8px gap
- Difficulty badge: 40×20px rounded rectangle, color-coded
- "Test Run" button: 120×40px, amber with dark text, centered below curated strip

---

#### Journey: DeepAgent_TTV, 28, Singapore, Twitch Streamer

**Context:** Gauntlet Level 12 player. Has built a following around creative challenge runs. Wants to create a mission that will produce a dramatic TikTok clip when his viewers attempt it.

**Minute 0:00 — The Fork Entry**
DeepAgent just finished a Gauntlet run on Level 12 that had a ridiculous moment: a single relay was the only thing keeping his entire network alive, and when it got sniped on tick 31, everything cascaded into failure. He's in the Inspector, scrubbing back to tick 31, staring at the single-point-of-failure. He clicks the Fork button (🔀).

The board duplicates with the splitting animation. He's now in the War Room editor with the Gauntlet Level 12 scenario pre-loaded. The diff panel on the right is empty — nothing changed yet.

**Minute 0:30 — Amplifying the Drama**
He has a vision: make the single-point-of-failure moment *inevitable* and *visible*. He adds three more enemy strikers converging on the center of the board where relays naturally get placed. He moves the enemy spawner so the striker patrol paths all cross the center tile on tick 28-32. In the diff panel, three green outlines pulse where the new enemies sit, and the spawner shows a split-diagonal showing its position change.

He labels this tile (D4) as "The Kill Zone" in his notes. He imagines the TikTok: a viewer's relay sitting right on D4, three strikers converging, the context bars of every downstream unit going dark simultaneously.

**Minute 2:00 — Adding the Escape Valve**
But he doesn't want a mission that's just "don't put anything on D4." He places a resource node on D4 — tagging it boosts material income by 50%. Now the player is incentivized to put a relay on the most dangerous tile on the board. The resource node shows as a green outline in the diff panel.

He tests it. First attempt: relay on D4, dies on tick 30, cascade failure, total wipe. Perfect drama. Second attempt: relay on D4 with emergency reroute hooks that activate when the relay dies, redistributing signals to two backup relays on B4 and F4. He wins — barely, with 2 units surviving. This IS the lesson: redundancy architecture.

**Minute 6:00 — Publishing and Streaming**
He names it "The Honey Trap: Can You Survive D4?" Description: "The best tile on the board is also the most dangerous. Your relay will die. The question is what happens next." Tags: "advanced," "architecture," "streaming-friendly."

The provenance breadcrumb reads: `Gauntlet L12 → "The Honey Trap" (DeepAgent_TTV)`.

He publishes, drops the code in his Twitch chat, and starts a viewer challenge stream. Chat erupts as the first viewer places their relay on D4 and watches three strikers converge on tick 30.

**UI Annotations:**
- Fork button: 24×24px icon in Inspector toolbar, glows on hover
- Board splitting animation: 400ms duration, original slides left with opacity fade
- Diff panel additions: green pulsing outlines, 2-second pulse cycle
- Provenance bar: 32px height, diamond nodes 16×16px, cable connections 2px width

---

#### Journey: Bong, 14, Batangas, First-Time Creator

**Context:** Just finished the campaign yesterday. Has never created content in any game before. Thinks Mission 4 was the coolest mission because it was the first time hooks clicked for him.

**Minute 0:00 — Discovering the Editor**
Bong sees a "Community Missions" tab on the campaign map. He browses for a minute — sees missions with 500+ plays, difficulty badges, and preview thumbnails. He's intrigued but intimidated. Then he notices the "Create" button in the top-right corner. He clicks it.

Four doors. He reads the descriptions. "Quick Mission" says "Generate a mission in under 5 minutes." That sounds safe. He clicks it.

**Minute 0:20 — Template Stamp**
Six template cards appear. He recognizes the descriptions from campaign missions. "The Information Asymmetry" card reminds him of Mission 4 — the mission where he first used hooks to relay scout data to strikers through fog. He selects it.

The parameter panel loads. He sees sliders: "Fog Coverage: 75%" (he leaves it), "Relay Availability: Standard" (he leaves it), "Enemy Stealth Level: Low/Medium/High" (he bumps it to Medium — Mission 4 was Medium). He notices "Scout Perception Override" set to Wide (5). He narrows it to 3 — he wants players to really need relay chains.

The difficulty bar ticks up from 2.1 to 2.8. The label changes from "Comparable to Mission 3" to "Comparable to Mission 4." Perfect — that's what he wanted.

**Minute 1:30 — Preview and Test**
The preview board shows a foggy jungle board with 4 enemies scattered in the fog. The player factory is in the bottom-left. Bong likes it but wishes there were more enemies. He moves the "Enemy Count" slider from 4 to 7. The preview updates — more red dots appear in the fog. Difficulty jumps to 3.5. He pulls it back to 6. Difficulty: 3.1.

He hits "Test Run." Plan screen loads. He builds his Mission 4 config from memory: 2 scouts with wide patrol, 1 relay compressing signals, 2 strikers listening for compressed threat data. He hits EXECUTE.

The sealed watch runs. His scouts find enemies through the fog, relay compresses and forwards, strikers converge. But enemy #5 and #6 are in a corner his scouts' narrowed perception doesn't reach. He loses when the hidden enemies flank his factory on tick 35.

He goes back, adjusts his patrol routes, tries again. Wins on attempt 3. Publish button lights up.

**Minute 5:00 — Publishing**
He names it "Fog World 2" (he's 14). Description: "like mission 4 but harder." Tags: "fog," "hooks." Published.

His mission gets 12 plays in the first day. 3 people complete it. He checks the stats obsessively. On day 2, someone forks his mission and adds a VIP escort through the fog. He sees it in the fork tree and plays it. The fork is better than his original. He's not offended — he's thrilled. He forks the fork and adds more enemies.

A design lineage is born.

**UI Annotations:**
- Campaign map "Community" tab: left sidebar, globe icon, slides in from left
- "Create" button: top-right of community browser, 80×32px, pulsing cyan border on first visit (new feature discovery animation)
- Template cards: 200×280px each, matte charcoal with wireframe icon, selection glow and mechanical click
- First-visit tooltips: appear on first editor session only, dismissable, pointing to key elements

---

#### Journey: Reyna, 33, Manila, Game Designer at a Local Studio

**Context:** Completed the campaign and Gauntlet Level 8. She's analyzing Robot Uprising's design patterns for her own studio's project. She wants to understand the mission design space by building extreme edge cases.

**Minute 0:00 — War Room Entry**
She goes straight to "Build from Scratch." The blank 8x8 grid appears. She has a thesis in her head: "What's the minimum viable mission? What's the absolute simplest scenario that still teaches something?"

**Minute 0:15 — The Minimum Mission**
She places one enemy scout on H8 and the player factory on A1. Victory condition: eliminate all. No terrain variation — all default tiles. No waves — just the one scout. No fog, no noise, no constraints.

She hits Test. Plan screen: she builds one striker, gives it a rule: "if enemy adjacent, engage." One hook: "if enemy spotted on recon-net, move toward." EXECUTE. Her striker walks diagonally across the board, spots the enemy scout on tick 4, engages on tick 5. Mission complete in 5 ticks.

The quality heuristic fires: "⚠ QUALITY: Mission may be too easy. Author proof uses only 1 unit with default config. Average completion rate estimated >95%." She nods — that's the point. She publishes it as "The Minimum" with tag "design-study." Not for players — for designers studying the mission space.

**Minute 2:00 — The Maximum Mission**
Now the opposite. She fills every non-factory tile with enemies. 62 enemy units. She sets them all to "Hunt" behavior. She places one resource node in the center. Victory: survive 60 ticks.

Test. She can't beat it. 47 attempts over 20 minutes. She can't beat it with any config. The "Publish" button stays grey. She adjusts: reduces to 30 enemies. Still can't beat it. 20 enemies. She barely wins with a perfect compression relay chain and emission-silent scouts. She publishes "The Maximum: 20" as another design study.

She now has the endpoints of the difficulty curve mapped. She starts filling in the middle, creating 5 missions at evenly-spaced difficulty targets. Over the next week, she publishes a 7-mission "Difficulty Gradient" pack that other designers use as a calibration reference.

**Minute 15:00 — Cross-Model Transition**
For her medium-difficulty mission, she starts in War Room but realizes she wants to ensure it specifically tests compression skills. She clicks "Analyze Thesis" — a button that reverse-engineers what skill a War Room mission tests by simulating 50 random configs and finding which architectural primitives correlate with success. The analysis returns: "Primary skill: Signal Routing (68%), Secondary: Context Management (45%), Compression: 12%."

Not enough compression emphasis. She switches to Thesis Defense mode, declares "Compression Strategy" as primary skill, and regenerates. The system produces variants of her existing board that increase noise density and reduce relay buffer sizes — forcing compression. She picks the best one, switches back to War Room for final spatial adjustments, and publishes.

**UI Annotations:**
- "Analyze Thesis" button: in War Room toolbar, magnifying glass icon, 2-5 second computation with spinning indicator
- Skill correlation results: horizontal bar chart, each skill as a colored bar with percentage
- Cross-model transition: 300ms screen morph animation, editor panels rearranging with smooth transitions
- Design study tag: grey italic label on community browser, indicating non-standard-play intent

---

## Interaction Effects

**× Mission Types (5.08a):** The template system directly implements the six mission types as first-class editor primitives. Template parameters encode each type's structural DNA. Community missions tagged by type extend the official type catalog infinitely.

**× Gauntlet (5.09):** Community missions can be injected into Gauntlet rotations. The rotation system (5.08d) can pull from community missions that meet quality thresholds (>85% completion rate, >4.0/5.0 player rating, >100 plays). This makes the Gauntlet a living system that evolves with the community.

**× Modding Tiers (multiplayer/modding):** The four editor models map directly to the first three modding tiers: Model 1 (Template Stamp) = Tier A (Mission Editor, lowest), Models 2/4 (War Room/Remix) = Tier B (Workshop), Model 3 (Thesis Defense) = unique to this system. The War Room could eventually gain Tier C capabilities (custom skills via visual scripting) as a post-launch expansion.

**× Community Moderation (7.03b):** All validation pipelines feed into the moderation infrastructure. The proof-of-solvability gate, quality heuristics, and text filtering are all Circuit Breaker (Model A moderation) implementations. Trust levels gate publishing: TL0 can only create and test locally, TL1 can publish, TL3 can publish to Gauntlet rotation candidates.

**× Inspector (locked):** The Inspector is the editor's quality assurance tool. After testing your own mission, the Inspector shows exactly why you won or lost — and therefore exactly what architectural skill the mission tests. The "Analyze Thesis" feature in Model 2→3 transition literally runs Inspector-style analysis across multiple simulation runs.

**× Blueprint Codex (locked):** Community missions appear in a "Community" tab of the Blueprint Codex. Each mission is a "card" with the same portrait/stats/description treatment as skills and units. Completing a community mission unlocks its card. This integrates community content into the collection-game progression loop.

**× Fork Culture (7.03 Model 4 Evolution Chains):** The Replay Remix model (Model 4) is the mission-editor equivalent of Evolution Chains. Both use provenance tracking, both reward iterative community improvement, both create branching trees of derivative content. The fork tree visualization should use identical visual language to evolution chain displays for consistency.

**× Educational Use (6.11d-v):** The Thesis Defense model is purpose-built for educators. A teacher can create missions testing specific CS concepts (buffer management = memory management, eviction policies = cache replacement, signal routing = network protocols) with machine-verified learning objectives. The mission code can be shared as homework.

---

## The TikTok Clip

**The "D4 Convergence" Clip (from DeepAgent's Honey Trap mission):**

*15 seconds. A relay sits on tile D4, context bars healthy, signals flowing. Three red arrows converge from three directions — enemy strikers walking toward D4. The viewer counts: tick 28... 29... 30. All three strikers arrive simultaneously. One-shot kill. The relay disappears. Instantly, every unit on the board goes dark — context bars draining to zero, signal chains vanishing, the entire screen going from information-rich to information-dead in one tick. The camera zooms to the player's factory, surrounded by now-blind units, as enemy stragglers close in.*

*Text overlay: "The best tile on the board is also the most dangerous. Can you survive D4?"*

*Cut to: a different player's replay where they DID survive — the relay dies, but backup relays activate, signal chains reroute through hooks, the network heals itself in 2 ticks. The army pivots and eliminates the remaining enemies. Clean.*

*Text overlay: "Redundancy architecture. Learn it or lose."*

---

## New Aspects Discovered

- **5.08b-i — Editor tutorial sequence:** How the editor teaches itself — first-time onboarding for each model, contextual help, the "your first mission" guided flow. Into the Breach never shipped this; Mario Maker's was rudimentary. Robot Uprising can do better.
- **5.08b-ii — Mission rating and discovery algorithms:** How community missions are ranked, recommended, and surfaced. Steam Workshop's "most subscribed" bias vs. quality-weighted discovery. The cold-start problem for new creators.
- **5.08b-iii — Mission packs as curated experiences:** Bundling 3-7 missions into themed packs with narrative framing, difficulty curves, and shared aesthetic. Community-authored "mini-campaigns."
- **5.08b-iv — Adversarial mission design (impossible-by-design):** Missions designed to be nearly unbeatable as community competitions. Speedrun categories, lowest-unit-count challenges, single-blueprint challenges. The "I Wanna Be the Guy" tradition applied to attention architecture.
- **5.08b-v — Cross-editor collaboration (multiplayer mission building):** Two players building a mission simultaneously — one designing the board, one designing the enemy AI. Real-time collaborative editing as a social activity.

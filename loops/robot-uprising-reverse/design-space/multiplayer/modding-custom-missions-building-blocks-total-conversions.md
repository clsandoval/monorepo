# 7.04 — Modding: Custom Missions, Custom Building Blocks, Total Conversions

## The Design Question

Robot Uprising is a game about composing systems from primitives. The game's vocabulary — skills, rules, hooks, context config — is inherently compositional. What happens when you let players compose the *game itself* from new primitives? How deep does moddability go? Where does the game end and the platform begin?

This is not a question about whether to support modding. It's a question about **which modding architecture** creates the best flywheel: players creating content that teaches other players to create better content, recursively, until the community is building things the developers never imagined.

---

## The Modding Depth Spectrum

Six models for how moddable Robot Uprising could be, from shallowest to deepest.

---

### Model A: "The Puzzle Box" — Custom Missions Only

**What it is:** Players can create custom missions using a built-in mission editor. The editor exposes: board layout (8x8 placement of terrain, starting units, enemy spawn points), victory conditions (eliminate all enemies, survive N ticks, control N nodes), resource budgets, enemy wave timing, and which blueprints the player starts with. No new unit types, skills, rules, or hooks. The vocabulary is fixed; only the puzzle changes.

**Comparable:** Baba Is You's level editor, Zachtronics' custom puzzle sharing in Shenzhen I/O, Mario Maker.

**How it works mechanically:**
- Mission editor is a dedicated screen, accessible from the main menu after completing Mission 5 (factory introduction).
- Left panel: 8x8 board with drag-and-drop terrain tiles (jungle, beach, city, terrace, Siquijor), unit placement (player and enemy), resource node placement.
- Right panel: Mission parameters — tick limit, resource budget (minerals + energy), starting blueprints (checkboxes from the player's unlocked set), enemy AI preset (patrol, aggressive, defensive, custom patrol routes), victory condition dropdown.
- Enemy AI is configured by placing patrol waypoints on the board and selecting aggression presets per enemy unit. No custom AI scripting.
- Export as a **Mission Code** — a compressed Base64 string that encodes the entire mission state. Share via clipboard, URL, QR code.
- Import: paste a code, preview the mission setup (read-only Plan view showing terrain and enemy layout but NOT enemy AI details), then play.

**The editor screen:**
A dark-teal workspace with the 8x8 grid center-left. Grid tiles have subtle dotted outlines showing placement zones. A vertical toolbar on the far left holds terrain brush icons — each biome a distinct silhouette (jungle: canopy, beach: wave, city: antenna, terrace: stepped lines, Siquijor: spiral). Below terrain: unit stamps. Player units are blue-outlined; enemy units are red-outlined. Drag a stamp onto a grid cell; it snaps with a satisfying mechanical *click* (like placing a chess piece on a magnetic board). Right-click any placed unit to configure: for enemies, a small popup with patrol waypoint editor (click grid cells to create a path, dots connected by dashed arrows) and aggression slider (cautious → balanced → berserker). For player starting units, a blueprint assignment dropdown.

The right panel is a scrollable form with labeled sections. "OBJECTIVE" in caps, followed by radio buttons: Eliminate, Survive, Control. Below: "TICK LIMIT" as a horizontal slider (20-200, default 80). "RESOURCE BUDGET" as a dual-slider for minerals and energy-per-tick. "ALLOWED BLUEPRINTS" as a checklist of the player's unlocked blueprints. At the bottom: a large "TEST PLAY" button (green, pulsing gently) and a "GENERATE CODE" button (amber).

**Strengths:**
- Very low barrier to creation. Anyone who can play can create.
- Mission codes are tiny (< 200 characters), shareable on Discord, Twitter, Reddit.
- No balance risk — all content uses the same game primitives.
- Test Play validates that the mission is completable before sharing.
- The Zachtronics precedent: custom puzzles in Shenzhen I/O created a small but devoted community of puzzle designers, and the histogram comparison system made solving community puzzles feel competitive.

**Weaknesses:**
- Limited creative expression. Players who want to make a "new unit type" or "new skill" can't.
- Enemy AI is constrained to presets and patrol routes — no scripted behaviors.
- No narrative support (no boot log text, no mission briefing customization).
- Risk of "quantity over quality" — most community missions will be trivial or unfair.
- No total conversions possible. The community ceiling is "clever puzzles," not "new games."

**Interaction effects:**
- Pairs naturally with the async challenge system (7.03) — custom missions become the primary challenge format.
- Workshop discovery UX (7.03d) becomes critical — without curation, 90% of missions are noise.
- Histogram sharing (7.06) on community missions creates the Zachtronics loop: make puzzle → share → see who solved it efficiently → iterate.
- Campaign progression is unaffected — custom missions are sandboxed from the unlock tree.

#### Journey: Ava, 31, Former Zachtronics Fan, Mission 8 Complete

**Context:** Ava finished the campaign's midpoint and wants to create something fiendish for her Discord group. She's fascinated by relay chains and wants to force players to build deep signal networks.

**Minute 0:00 — Opening the Editor**
Ava clicks "Create Mission" from the main menu. The editor opens with an empty 8x8 grid, soft blue-gray. A tooltip appears: "Place terrain first, then units." She selects the city tile from the toolbar. It highlights with a white glow. She paints the center four cells — each click producing a crisp *tap* like a keyboard switch. The city tiles snap into place, neon accents glowing against the neutral background.

**Minute 1:30 — Designing the Puzzle**
She surrounds the city core with jungle tiles, creating a 4x4 city center inside a jungle border. She places the player base in cell A1 (far corner) and enemy base in H8 (opposite corner). Between them: a wall of jungle with narrow corridors. She's building a signal-relay puzzle — scouts can't see through jungle, so players MUST use relays to get targeting data to strikers.

**Minute 3:00 — Enemy Configuration**
She places three enemy scouts along the corridors with criss-crossing patrol routes, creating a detection web. She places two enemy strikers near H8 with berserker aggression — they'll charge anything they detect. She sets the tick limit to 60 (tight) and resource budget to 40 minerals, 3 energy/tick (lean — forces efficient builds, no spam).

**Minute 5:00 — Test Play**
She hits TEST PLAY. The screen transitions to the normal Plan phase, but with a small "EDITOR" badge in the top-left. She configures a relay chain: Scout at B2, Relay at D4, Relay at F6, Striker at G7. Runs it. The scout spots an enemy, signal hops through both relays (2 ticks each = 4 total latency), striker receives and engages. But the second enemy scout detects her relay's EM emission and the enemy strikers rush in before her striker can eliminate the first target. She loses.

**Minute 8:00 — Iterating**
She adjusts the resource budget up by 5 minerals (enough for one more relay). Re-tests. This time she adds a third relay to create a backup channel, and wins with 3 ticks to spare. Tight but possible. She hits GENERATE CODE. A 147-character string appears. She copies it and pastes it into her Discord server: "relay gauntlet. no scouts past C column. GL."

**Minute 9:00 — Sharing**
Three friends paste the code in. By evening, Ava's Discord has a thread of Inspector screenshots comparing relay chain topologies. Someone found a 2-relay solution she didn't think was possible.

**UI Annotations:**
- Mission Code display: monospace font in a bordered box, "COPY" button on right, code truncated to first 20 chars + "..." with full code on click
- TEST PLAY badge: small pill-shaped label, top-left, yellow background, "EDITOR" in caps, dismisses after 3 seconds
- GENERATE CODE button: disabled until at least one TEST PLAY completes successfully

---

### Model B: "The Workshop" — Custom Missions + Blueprint Sharing + Scenario Parameters

**What it is:** Everything in Model A, plus: custom mission briefings (text), blueprint sharing/import, adjustable game parameters (tick speed, buffer size overrides, signal latency multipliers, EM detection range scaling), and pre-configured starting blueprints that the mission creator designed (not just the player's own). The creator essentially becomes a game designer — they can tune the knobs that define the game's pacing and difficulty.

**Comparable:** StarCraft II Arcade's simpler maps, Slay the Spire's custom challenge seeds, Into the Breach's squad system (constrained modding through preset configuration).

**How it works mechanically:**
- Everything from Model A.
- **Briefing Editor:** A text field (Markdown-lite: bold, italic, line breaks) for mission briefing. Displays in the boot-log style during mission start. Max 500 characters. Supports the diegetic voice ("SUBSYSTEM NOTICE: The northern corridor's relay infrastructure has been compromised...").
- **Blueprint Bundling:** The mission creator includes specific blueprint configurations that the player must use (locked) or can choose from (unlocked). The creator designs these blueprints using the normal Plan screen workbench. This means the creator can pre-wire complex hook chains, set specific rules, and configure context — then challenge others to deploy them effectively.
- **Scenario Parameters:** An "Advanced" tab in the mission editor with sliders for: tick limit, buffer size multiplier (0.5x to 2x, affecting all units), signal latency multiplier (0.5x to 3x), EM detection range multiplier (0x to 3x), resource multipliers.
- **Scenario Presets:** Named presets like "Fog of War" (EM detection 3x, signal latency 2x), "Blitz" (tick limit 30, resources 2x), "Silence is Golden" (EM detection 0x, removing emissions entirely), "Deep Memory" (buffer 2x, signal latency 0.5x).

**The blueprint bundling screen:**
When the creator clicks "Bundle Blueprints," a split view opens. Left: the normal workbench (skills toggles, rules editor, hooks, context config) for designing a blueprint. Right: a "Mission Blueprints" panel listing all bundled blueprints as icons with labels. Drag a completed blueprint from left to right to add it. Each bundled blueprint has a lock/unlock toggle — locked means the player must use it as-is; unlocked means the player can modify it. A "note" field per blueprint lets the creator leave hints: "This relay is pre-wired for the NORTH channel. Route your scouts there."

**Strengths:**
- Blueprint bundling is the killer feature. It lets experienced players teach through example — "here's a complex relay chain I designed, now figure out how to USE it."
- Scenario parameters create genuinely different game modes without new code.
- Briefing text enables narrative missions — community campaigns become possible.
- Still no new game primitives, so balance is bounded by known parameters.

**Weaknesses:**
- Parameter tuning can create broken experiences (buffer 0.5x + latency 3x = virtually unplayable).
- Blueprint bundling requires the creator to be a skilled player — barrier is higher than Model A.
- No custom AI scripting. Enemy behavior is still preset-based.
- No visual modding. Every mission looks like Robot Uprising.

**Interaction effects:**
- Config Code system (7.03a) must support bundled blueprints — codes become longer, need compression.
- The Predecessor narrative voice (6.03e) could be extended: community briefings use the same diegetic framing.
- Scenario presets interact with leaderboard design (7.05) — should "Blitz" mode runs be on a separate leaderboard?

#### Journey: Dev, 24, Computer Science Student, Campaign Complete

**Context:** Dev finished the full campaign and wants to teach his younger sibling about relay chains. He decides to create a tutorial mission.

**Minute 0:00 — Blueprint Design**
Dev opens the mission editor and immediately goes to "Bundle Blueprints." He designs three blueprints: a scout pre-wired to broadcast on "TARGET" channel, a relay pre-wired to listen on "TARGET" and rebroadcast on "STRIKE," and a striker pre-wired to listen on "STRIKE." He locks the scout and relay (the player must use them as-is) but unlocks the striker (the player can adjust its rules and context config).

**Minute 4:00 — Board Layout**
He creates a simple board: open terrain, one enemy scout patrolling a predictable east-west line across row 4. The player base is at A1. He places a resource node at D1 (easy to tag). Tick limit: 100 (generous). Resources: 60 minerals. The puzzle is: deploy the locked blueprints correctly, then configure the striker to prioritize the "STRIKE" signal over its own observations.

**Minute 6:00 — Briefing**
He writes: "RELAY TEST — SUBSYSTEM INITIALIZATION. Three blueprints loaded. Scout and Relay configurations are locked. Striker configuration is unlocked. Objective: eliminate the patrol unit using ONLY relay-mediated targeting. Direct engagement will fail — the enemy evades faster than the striker tracks. Route the signal."

**Minute 8:00 — Test and Share**
He test-plays twice: first deliberately failing (deploying striker without routing, striker wanders aimlessly), then succeeding (striker at E5, relay at C3, scout at A4 — signal chain triggers at tick 12, striker engages at tick 14). Generates code. Sends to his sibling with: "try this before Mission 5."

#### Journey: Kim, 38, Game Design Teacher, Uses Robot Uprising in Curriculum

**Context:** Kim teaches a university game design course and uses Robot Uprising's mod system to create weekly assignments.

**Minute 0:00 — Assignment Design**
Kim opens the editor with a specific pedagogical goal: teach students about information overload. She sets buffer size to 0.5x (halving all unit buffers), places 6 enemy scouts in a tight cluster (creating a signal flood), and gives students a generous resource budget. The challenge: design eviction priorities that keep the useful signal while drowning in noise.

**Minute 3:00 — Parameter Tuning**
She selects the "Deep Noise" preset (buffer 0.5x, signal latency 1x, EM detection 1.5x), then adjusts: she wants EM detection at 0x (no emissions) so the puzzle is purely about buffer management, not detection avoidance. She saves the preset as "Buffer Pressure 101."

**Minute 5:00 — Bundled Blueprint**
She creates one locked relay blueprint with a deliberately suboptimal context config (listen-all, no filters, FIFO eviction) and labels it "BROKEN RELAY — fix the eviction policy." She bundles it unlocked so students must diagnose and repair the relay's config to pass the mission.

**Minute 7:00 — Distribution**
She generates the code and posts it in her LMS. 30 students attempt it. The Inspector replays become the basis for next week's lecture on eviction policy design.

**UI Annotations:**
- Briefing editor: dark field with glowing green monospace text (matching boot-log aesthetic), character counter bottom-right, preview button shows boot-log rendering
- Blueprint lock toggle: padlock icon, clicking toggles open/closed with a metallic click sound
- Scenario preset selector: dropdown with preset name + icon (Fog = eye with slash, Blitz = lightning, Silence = muted speaker)

---

### Model C: "The Forge" — Custom Skills, Rules, and Hooks

**What it is:** Everything in Model B, plus: players can define entirely new skills, new rule conditions, new rule actions, and new hook triggers using a visual scripting language. The game's four primitives (skills, rules, hooks, context config) become extensible. A skill is no longer just "patrol" or "engage" — a modder can create "decoy" (spawn a holographic duplicate), "triangulate" (combine two scout signals to compute enemy position), or "sacrifice" (destroy self, send final signal to all channels).

**Comparable:** Factorio's Lua prototype system, Warcraft III's trigger editor, Screeps' JavaScript API.

**How it works mechanically:**
- **Skill Definition Language (SDL):** A visual scripting editor where skills are defined as: trigger condition → effect sequence → cooldown/cost. Effects are composed from primitive operations: move, damage-adjacent, send-signal, modify-buffer, tag-node, create-unit, destroy-self, modify-own-rules. Each primitive operation has typed parameters.
- Example: defining "Triangulate" — Trigger: 2+ signals from different sources in buffer. Effect: compute midpoint of signal origins → write synthetic "LOCATION" signal to buffer with computed position. Cooldown: 3 ticks.
- **Rule Extensions:** New conditions (e.g., "if buffer contains signal tagged 'PRIORITY'") and new actions (e.g., "swap position with nearest allied unit") can be defined using the same visual scripting.
- **Hook Extensions:** New hook triggers beyond the built-in set: "on unit destroyed within 3 tiles," "on buffer reaching N% capacity," "on channel silence for N ticks."
- **Mod Packaging:** Skills, rules, hooks packaged as a "Mod Kit" — downloadable from Workshop, loadable in the Plan screen workbench as additional options.
- **Sandbox Flag:** Missions using custom skills/rules/hooks are marked "MODDED" and excluded from official leaderboards. Separate modded leaderboard per mod kit.

**The skill editor screen:**
A horizontal canvas with a left-to-right flow. Leftmost block: "TRIGGER" (rounded rectangle, blue border). Click to open a condition builder — dropdown for condition type (buffer-state, proximity, tick-count, signal-received, health-state) with typed parameters. Middle blocks: "EFFECT" chain (green rectangles). Each effect is a primitive operation. Drag from a palette on the left side to add effects. Effects execute top-to-bottom. Connections between trigger and effects shown as flowing lines with animated particles (like data moving through the chain). Rightmost block: "COST" (amber rectangle) — energy cost per activation, cooldown in ticks. Below the canvas: a "TEST" button that spawns a minimal 3x3 test board to verify the skill works.

The visual scripting canvas has a dark background with a subtle grid. Blocks snap to grid. Hover over any block to see a tooltip explaining its behavior in plain English ("When this unit's buffer contains 2 or more signals from different grid positions, compute the midpoint and write a synthetic signal."). The palette on the left shows available primitive operations as icons with labels: 🔀 Move, ⚡ Damage, 📡 Signal, 🧠 Buffer, 🏷 Tag, 🏭 Create, 💀 Destroy, 📝 Modify.

**Strengths:**
- Massive creative ceiling. Players can invent unit archetypes the developers never imagined.
- The visual scripting language maps directly to the game's vocabulary — it's compositional all the way down.
- Mod Kits are shareable, composable (load multiple kits), versionable.
- Teaching power: the SDL IS the game's design language. Learning to mod IS learning to understand the system at a deeper level.
- Total conversion potential: replace all skills → functionally new game.

**Weaknesses:**
- Complexity explosion. Visual scripting that can define arbitrary behaviors is an open-ended programming problem.
- Balance is impossible to maintain. A custom skill could be game-breaking.
- "MODDED" flag splits the community. Core players may look down on modded content.
- Testing burden shifts to modders. Broken skills crash runs.
- Enemy AI can't use custom skills (unless the modder also scripts enemy behavior), creating asymmetry.

**Interaction effects:**
- Histogram/leaderboard system (7.05, 7.06) must handle modded vs. unmodded runs separately.
- The arms race metagame (7.09) becomes infinitely complex with custom skills — potentially exciting, potentially chaotic.
- Blueprint sharing (7.03) must embed skill definitions — codes become much larger.
- Accessibility (6.08) must cover the skill editor itself — screen reader support for visual scripting is extremely hard.

#### Journey: Rohan, 16, Aspiring Game Developer, Campaign Complete

**Context:** Rohan finished the campaign and is inspired by the command agent's "reassign" skill. He wants to create a skill that lets a unit "clone" its own buffer to an adjacent ally.

**Minute 0:00 — Opening the Forge**
Rohan selects "Mod Workshop" from the main menu. A new screen opens — the Forge. Center: the visual scripting canvas. Left: primitive operation palette. Top: tabs for Skills, Rules, Hooks. He clicks "New Skill" and types the name: "Memory Share."

**Minute 1:00 — Defining the Trigger**
He drags a TRIGGER block onto the canvas. Clicks it, selects "Proximity" condition: "allied unit within 1 tile." The block turns blue and displays a tiny radar icon. He connects it to the first EFFECT block.

**Minute 2:30 — Building the Effect Chain**
Effect 1: "Read Own Buffer" — primitive operation that copies current buffer contents into a temporary variable. He drags the 🧠 Buffer icon and selects "read-all." Effect 2: "Write to Target Buffer" — 📡 Signal operation, but targeted at "nearest allied unit" instead of a channel. He selects target: "nearest-ally" and payload: "own-buffer-copy." The two effect blocks are connected by a flowing green line with animated data particles.

**Minute 4:00 — Cost and Testing**
He sets cost: 2 energy, cooldown: 5 ticks. Hits TEST. A 3x3 board appears with his unit at center and an ally at an adjacent cell. His unit has 4 items in its buffer. He ticks forward. At tick 1, Memory Share triggers — the ally's buffer suddenly fills with 4 copied items, displacing whatever was there. The ally's buffer bar flashes white, then settles. "That's overpowered," Rohan mutters. He adds a third effect: "Limit: copy only top 2 items." Re-tests. Better.

**Minute 6:00 — Packaging**
He saves "Memory Share" to his Mod Kit "Rohan's Telepaths." Publishes to Workshop with description: "Units that share memories. Powerful with scouts — share observations without channel latency."

**Minute 7:00 — Community Response**
Within a day, three players have downloaded the kit. One immediately discovers a degenerate combo: a relay with Memory Share + a command unit with Reassign = infinite buffer duplication chain. Rohan gets a Workshop comment: "lol broke your mod in 10 minutes." He goes back to the Forge to add a "shared items can't be re-shared" flag.

---

### Model D: "The Engine" — Full Scenario Scripting

**What it is:** Everything in Model C, plus: a scripting layer (JavaScript or Lua) that controls mission flow, triggered events, custom AI behavior, custom victory conditions, custom UI overlays, and inter-mission persistence. The game exposes its tick engine as a scriptable runtime. Modders write event handlers that fire on game events (unit created, tick start, signal sent, unit destroyed, etc.).

**Comparable:** Factorio's Lua runtime API, Screeps (JavaScript game scripting), Warcraft III's JASS/Galaxy scripting.

**How it works mechanically:**
- **Scripting API:** JavaScript (chosen because the game is already React + Vite — no new language runtime needed). The API exposes:
  - `game.board` — read/write grid state (terrain, units, resources)
  - `game.units` — iterate, filter, inspect, create, destroy units
  - `game.signals` — send, intercept, inspect signals on channels
  - `game.ui` — create overlay panels, display text, trigger animations
  - `game.events` — register handlers for tick events, unit events, signal events
  - `game.mission` — set victory/defeat conditions, trigger phase transitions
  - `game.storage` — persist data between missions in a campaign mod
- **Script Editor:** In-browser Monaco editor (the VS Code engine) with syntax highlighting, autocomplete for the game API, inline documentation.
- **Sandboxing:** Scripts run in a Web Worker with a tick budget (max 50ms per tick). If a script exceeds budget, it's killed and the mission fails gracefully. No filesystem access, no network access, no DOM access outside `game.ui`.
- **Campaign Mods:** Chain scripted missions into a custom campaign with inter-mission persistence via `game.storage`.

**Strengths:**
- Maximum creative freedom. Anything expressible in code is buildable.
- JavaScript lowers the barrier — it's the most widely known programming language.
- Monaco editor provides a professional coding experience in-browser.
- Web Worker sandboxing prevents security issues without constraining creativity.
- Campaign mods enable narrative total conversions with branching stories.
- The game's theme (AI programming) makes a JavaScript modding API thematically coherent — you're literally programming the machine.

**Weaknesses:**
- Extremely high skill barrier. This is real programming. 95% of players can't participate.
- Testing burden is enormous. Script bugs create crashes, softlocks, infinite loops.
- Performance ceiling: 50ms/tick budget limits complexity. A mod with 50 scripted units doing pathfinding might hit the budget.
- Maintenance cost: every game update risks breaking the scripting API. API stability must be a first-class engineering priority (the Factorio lesson).
- Community fragmentation: deep mods create "mod ecosystems" that drift from the base game.

**Interaction effects:**
- Tech stack locked as React + Vite + Pixi.js — JavaScript scripting fits natively. No transpilation needed.
- Playwright testing (locked) can also test mods — scripted scenarios are deterministic.
- The "solutions-as-content" pattern (Zachtronics) inverts: the GAME becomes content. Scripts create new games within the game.
- Community moderation (7.03b) must handle malicious scripts (infinite loops, misleading UI overlays).

#### Journey: Clara, 29, Full-Stack Developer, Wants to Build "Robot Uprising: Horror Edition"

**Context:** Clara is an experienced web developer who loves both Robot Uprising and survival horror games. She wants to create a campaign mod where the player's units can be corrupted mid-battle by an enemy virus, and the player must identify and quarantine infected units.

**Minute 0:00 — Script Setup**
Clara opens the Script Editor from the Mod Workshop. A Monaco editor fills the screen with a dark theme. The left sidebar shows the API reference — expandable tree of `game.board`, `game.units`, `game.signals`, etc. She creates a new file: `virus.js`.

**Minute 2:00 — Writing the Virus**
```javascript
game.events.on('tick', (tick) => {
  if (tick % 10 === 0) { // Every 10 ticks
    const target = game.units.random({ team: 'player', infected: false });
    if (target) {
      target.data.infected = true;
      target.hooks.inject('*', { // Send garbage on all channels
        trigger: 'every-tick',
        payload: { type: 'noise', source: 'virus' }
      });
      game.ui.flash(target.position, { color: '#8B0000', duration: 200 });
    }
  }
});
```
She types quickly. Monaco autocompletes `game.units.random` and shows the typed signature. The inline docs explain that `.data` is a free-form storage object per unit.

**Minute 5:00 — Quarantine Mechanic**
She adds: if a player moves a unit to the base tile, it's "quarantined" — virus removed, but the unit is disabled for 5 ticks. This creates a tension: quarantine your infected relay, but lose your signal chain for 5 ticks while enemies advance.
```javascript
game.events.on('unit-move', (unit, from, to) => {
  if (to.equals(game.board.base.position) && unit.data.infected) {
    unit.data.infected = false;
    unit.hooks.clear(); // Remove injected hooks
    unit.disable(5); // Can't act for 5 ticks
    game.ui.overlay(unit.position, '🔧', { duration: 5000 });
  }
});
```

**Minute 8:00 — UI Overlay**
She creates a persistent UI panel showing infection status:
```javascript
const panel = game.ui.createPanel('virus-status', {
  position: 'top-right', width: 120
});
game.events.on('tick', () => {
  const infected = game.units.filter({ team: 'player', data: { infected: true } });
  panel.render(`INFECTED: ${infected.length}/${game.units.count({ team: 'player' })}`);
});
```
The panel appears as a red-bordered rectangle in the top-right during Sealed Watch. The number pulses when it increases.

**Minute 12:00 — Testing**
She runs the scenario. At tick 10, a random scout's buffer bar flashes dark red. The virus-status panel reads "INFECTED: 1/4." By tick 30, two units are infected. The relay chain disintegrates as the infected relay floods the "FORWARD" channel with garbage signals. She quarantines the relay at the base — it goes dark for 5 ticks, the striker loses its signal feed, and an enemy scout sneaks through. Tense. Exactly what she wanted.

**Minute 15:00 — Campaign Chain**
She creates three missions: "Patient Zero" (one infection, learn quarantine), "Outbreak" (faster infection, multiple targets), "Herd Immunity" (design architectures that are resilient to signal noise — the virus becomes a permanent environmental hazard). She connects them with `game.storage` to track how many total quarantines the player has performed across missions.

---

### Model E: "The Platform" — Visual Modding + Art + Audio

**What it is:** Everything in Model D, plus: custom sprite support (upload PNGs for units, tiles, effects), custom audio (upload WAV/OGG for sound effects, ambient loops), custom UI themes (CSS overrides for panel colors, fonts, layouts), and a campaign builder with narrative branching. The game becomes a platform for creating entirely new games that share the tick-based-attention-system engine.

**Comparable:** Warcraft III's World Editor (which birthed entire genres), RPG Maker, Dreams (PS4).

**How it works mechanically:**
- **Asset Pipeline:** Mod Kit includes an `assets/` directory. Drop PNGs into `assets/sprites/`, WAVs into `assets/audio/`, and a `theme.css` for UI styling. The game reads these at mod-load time.
- **Sprite Mapping:** A `sprites.json` maps game entities to custom sprites: `{ "scout": "assets/sprites/my-scout.png" }`. Supports animation frames (array of PNGs per state: idle, destroyed, hologram).
- **Audio Mapping:** Similar JSON maps game events to sounds: `{ "signal-sent": "assets/audio/whoosh.wav" }`.
- **Campaign Builder:** A visual campaign graph editor. Nodes are missions. Edges are progression paths. Branching: "if player won Mission 3 with < 30 ticks, unlock hard-mode Mission 4a; otherwise, normal Mission 4b."

**Strengths:**
- True total conversion potential. A Warcraft III-style explosion of emergent genres is possible.
- Visual modding lets artists participate even without coding skills.
- Audio modding enables completely different atmospheres — horror, comedy, zen.
- Campaign builder enables narrative-driven community content.
- The game's cultural identity (SE Asian cyberpunk) can be extended, remixed, recontextualized.

**Weaknesses:**
- Enormous engineering investment. Asset pipelines, format validation, performance profiling for arbitrary assets.
- Quality control nightmare. Custom sprites at wrong scale, audio at wrong volume, CSS that breaks layout.
- Storage and bandwidth costs for distributing asset-heavy mods.
- Risk of diluting the game's visual identity. If every mod looks different, there's no recognizable "Robot Uprising aesthetic."
- The modding community needed to fill this toolset is much smaller than the playing community. High investment, niche audience.

**Interaction effects:**
- Pixi.js rendering (locked tech) makes sprite swapping technically straightforward — it's just texture atlas management.
- Web-based distribution (locked: no backend) means mods must be hosted externally (GitHub, itch.io) or via a simple CDN, unless a Workshop backend is added.
- Sprite-sheet pipeline (locked) provides a template: community artists can follow the same anchor-first pipeline for their custom units.

#### Journey: Studio Mango, 4-Person Indie Team, Building "Market Mayhem" Total Conversion

**Context:** A small Philippine indie studio sees Robot Uprising's engine as a foundation for a game about Manila street market logistics — vendors managing customer attention, supply chains, and competing stalls.

**Month 1 — Concepting**
The team maps Robot Uprising concepts to their game: Scouts become "runners" (kids who scout for customers), Relays become "megaphone vendors" (relay price announcements), Strikers become "closers" (vendors who seal the deal when a customer is within range). The 8x8 grid becomes a top-down market layout. Tiles are concrete, wood, tarp, and galvanized iron.

**Month 2 — Asset Creation**
Their artist draws isometric sprites in a warm, saturated style: golden hour market light instead of cyberpunk neon. Each "unit" is a character with personality — the runner is a kid in school uniform, the megaphone vendor is a grandmother with a bullhorn, the closer is a fast-talking man in a barong tagalog. They follow the sprite-sheet pipeline: idle, interacting, exhausted (instead of destroyed). They upload 40 custom sprites, 15 tile variants, and 20 sound effects (market chatter, jeepney horns, sizzling street food, megaphone distortion).

**Month 3 — Scripting**
They write a custom economy system: instead of military victory, the goal is revenue. "Signals" are price announcements. "Buffers" are customer attention spans. "EM detection" is competitor awareness (if your megaphone is too loud, the competing stall adjusts their prices). They create 8 missions following the morning-to-evening arc of a market day.

**Month 4 — Release**
"Market Mayhem" launches on the Robot Uprising Workshop. It goes viral on Philippine game dev Twitter. The Robot Uprising developers feature it on the main menu's "Community Spotlight."

---

### Model F: "The Genome" — Moddable Game Rules and Engine Parameters

**What it is:** The deepest level. Beyond Model E's content modding, this exposes the simulation rules themselves: tick resolution order, combat rules, movement rules, buffer eviction algorithms, signal propagation physics. The game's core simulation becomes a configurable parameter space. Want simultaneous resolution replaced by initiative-based turn order? Change a config. Want HP instead of one-shot-one-kill? Modify the combat resolver. Want continuous movement instead of grid snapping? Override the movement system.

**Comparable:** Screeps' open-source server (fully moddable game rules), Dwarf Fortress's init files, NetHack's source code modding tradition.

**How it works mechanically:**
- **Engine Config:** A `rules.json` file that parameterizes every simulation behavior:
  ```json
  {
    "resolution": "simultaneous",  // or "initiative", "alternating"
    "combat": { "mode": "one-shot", "hp": false },
    "movement": { "mode": "grid-snap", "speed_unit": "tiles/tick" },
    "buffer": { "eviction": "player-configured", "overflow": "drop-oldest" },
    "signals": { "latency": "1-per-hop", "decay": false }
  }
  ```
- **Engine Override Hooks:** JavaScript functions that replace core engine behaviors: `game.engine.override('resolve-combat', (attacker, defender) => { ... })`.
- **Private Server:** Downloadable server binary that runs custom game rules for private multiplayer.

**Strengths:**
- Infinite design space. The game becomes a game engine.
- Private servers enable competitive leagues with house rules.
- Academic use: researchers can experiment with different simulation parameters to study emergent behavior.
- Maximum longevity — when the developer stops updating, the community can evolve the game.

**Weaknesses:**
- This is an engine, not a game. The engineering cost dwarfs the game itself.
- Compatibility between mods is nearly impossible when simulation rules differ.
- Replay sharing breaks (a replay from a "simultaneous resolution" game is meaningless in an "initiative" game).
- The original game's identity dissolves. "Robot Uprising" becomes a brand, not a specific experience.
- Security implications of engine overrides are severe in multiplayer contexts.

**Interaction effects:**
- Deterministic tick scheduler (locked tech) is the hardest thing to make moddable — it's the foundation of replay fidelity.
- Playwright testing (locked) can only test the base game, not arbitrary rule configurations.
- The "no backend" constraint (locked) means private servers are out of scope unless players self-host.

#### Journey: Dr. Torres, 45, AI Researcher, Wants to Study Emergent Communication

**Context:** Dr. Torres studies emergent communication in multi-agent systems at a Philippine university. She wants to use Robot Uprising's engine to run experiments where agents with different buffer/signal parameters develop communication protocols.

**Hour 0 — Configuration**
She writes a `rules.json` that removes combat entirely (`"combat": { "mode": "disabled" }`), increases the board to 16x16, and adds signal decay (`"signals": { "decay": true, "half_life": 3 }`). She creates 20 identical agents with minimal rules and maximal hook slots, places them randomly, and writes a fitness function that rewards successful information relay across the board.

**Hour 2 — Running Experiments**
She scripts 1000 automated runs with different buffer sizes (4, 8, 12, 16) and signal latencies (1, 2, 3, 4 ticks per hop). Each run exports the channel usage graph and buffer utilization histogram to CSV.

**Hour 6 — Analysis**
Her Jupyter notebook shows that buffer size 8 with latency 2 produces the most efficient communication networks. Below 8, agents can't maintain enough context to route signals. Above 12, they waste capacity on stale data. She publishes a paper: "Emergent Relay Architectures in Fixed-Buffer Multi-Agent Systems."

---

## Sensory Descriptions

**The Mission Editor (Model A):** The grid hums faintly when you hover over it — a soft electronic purr that rises in pitch as you fill more cells. Each terrain tile placement makes a distinct sound: jungle is a soft leaf rustle, city is a metallic *ping*, beach is a brief wave crash, terrace is a stone settling *clunk*, Siquijor is a crystalline chime. Enemy units placed on the grid emit a low mechanical growl that gets louder as more enemies are added — the rising tension of a coming threat. The TEST PLAY button pulses with a heartbeat rhythm, green light expanding and contracting. When you GENERATE CODE, the Mission Code appears character by character in rapid succession, like a terminal printing a hash — each character accompanied by a tiny typewriter *tick*.

**The Forge (Model C):** The visual scripting canvas feels like wiring a synth. Connecting trigger to effect produces a *patch cable* sound — a satisfying click-hum as the animated particle flow begins between blocks. Dragging primitive operations from the palette has weight — they resist slightly before snapping to grid, with a soft magnetic *thunk*. Hovering over a connected line shows a tooltip AND plays a faint preview of the operation: the Signal primitive plays a tiny radio burst, the Damage primitive plays a sharp metallic *crack*, the Buffer primitive plays a memory-write chirp. The TEST button produces a miniature sealed-watch experience in a 3x3 window — same tick clock, same buffer bars, same snap resolution, just smaller. Your custom skill activating for the first time makes a unique synthesized sound generated from the skill's parameter hash — every skill literally sounds different.

**The Script Editor (Model D):** Monaco's dark theme is tinted the game's cyberpunk teal. Autocomplete suggestions appear with a soft *whoosh*. Syntax errors produce a corruption-style visual glitch on the error line — the text distorts briefly before resolving with the red underline. Running a test scenario from the editor produces a split-screen: code on left, miniature game board on right. Console.log output appears in a panel styled as a boot log — green monospace text scrolling upward. When a script crashes (tick budget exceeded), the board view freezes with a scan-line effect and the boot log prints "PROCESS KILLED: TICK BUDGET EXCEEDED" in red, accompanied by the corruption audio cue from the main game.

---

## Comparable Games: Lessons Learned

### Factorio: The Gold Standard
Factorio's three-stage API (settings → prototype → runtime) is the template for Robot Uprising. Key lessons:
- **Stability over flexibility.** A constrained API that never breaks beats a powerful API that breaks every update. Factorio mods from 2018 often still work in 2024.
- **Composable total conversions.** Space Exploration + Krastorio 2 working together is the Holy Grail of modding. Robot Uprising should design mod kits to be composable by default.
- **Official mod portal with dependency management.** Steam Workshop works but lacks dependency resolution. Factorio runs its own portal.
- **API documentation as product.** Factorio's lua-api.factorio.com is more polished than many commercial API docs.

### Warcraft III: The Genre Factory
WC3's accessible trigger editor spawned DOTA, Tower Defense, Auto Chess. Key lessons:
- **Accessibility beats power.** WC3's trigger editor was simpler than SC2's Galaxy Editor, but produced more genres. The visual scripting in Model C should be as simple as possible.
- **UGC can become bigger than the game.** DOTA players outnumbered WC3 players. Design for this possibility.
- **IP ownership is a one-way door.** Blizzard's Reforged EULA claiming all custom game IP destroyed community trust permanently. Robot Uprising should explicitly grant modders ownership of their creations.

### Slay the Spire: Community-Built Infrastructure
The ModTheSpire → BaseMod → StSLib stack was built entirely by the community. Key lessons:
- **If you won't build mod tools, make the game moddable enough that the community can build them.** MegaCrit didn't create modding tools — but their Java codebase was transparent enough that the community could.
- **Downfall (community expansion with its own Steam page, 97% positive reviews)** proves that community content can match developer quality.

### Into the Breach: The Cautionary Tale
Brilliant game with zero developer investment in modding. Key lessons:
- **No mod support = tiny, declining community.** Into the Breach's mod community is a fraction of what it could be.
- **Hardcoded limitations frustrate more than no modding at all.** Modders discovered they ALMOST could do things, but arbitrary limits blocked them.

### Baba Is You: Built-In Editor as Doubling
Baba Is You shipped a built-in cross-platform level editor as a free update. Key lessons:
- **The editor doubled the game's content.** An internal editor is a multiplier on player investment.
- **Level codes (not Workshop) for cross-platform sharing.** Works on Switch, Steam, itch.io — anywhere. Robot Uprising's Mission Codes should follow this pattern.

---

## Recommended Modding Tiers (Not a Decision — A Framework)

| Tier | Launch | Post-Launch | Never |
|------|--------|-------------|-------|
| Model A (Mission Editor) | Strong candidate | — | — |
| Model B (+ Blueprints + Parameters) | Possible | Strong candidate | — |
| Model C (Custom Primitives) | — | Possible | — |
| Model D (Full Scripting) | — | Possible | — |
| Model E (Visual Modding) | — | — | Possible |
| Model F (Engine Rules) | — | — | High risk |

The natural path: Ship A, ship B in the first major update, evaluate C based on community demand, build D only if total conversions emerge as the primary community use case. E and F are "platform" decisions that depend on whether Robot Uprising is a game or a game engine.

---

## The TikTok Clip

**For Model A:** A timelapse of a player building a fiendish puzzle mission in 60 seconds — terrain painted, enemies placed, TEST PLAY run showing a failed attempt, then the Mission Code generated. Cut to 5 players in a Discord call all attempting the same code simultaneously, reactions as they watch each other's sealed replays. Caption: "I made a mission that broke my friends."

**For Model C:** A split screen. Left: a player in the Forge, wiring a "Memory Share" skill — trigger, effect, effect, cost. Right: that skill deployed in battle, one unit's buffer flashing as it copies to an ally, the ally suddenly reacting to information it shouldn't have. The moment of "I MADE that mechanic." Caption: "I invented a skill and it's broken."

**For Model E (Total Conversion):** Market Mayhem. The isometric grid filled with warm golden-hour Philippine market sprites. A megaphone vendor relays a price announcement through two runners to a closer who seals the deal. Same engine, completely different world. Caption: "This used to be a robot game."

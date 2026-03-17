# Red Team Mode in Plan Screen: Hypothetical Enemy Placement for Architecture Testing

**Aspect:** 7.01b — Red team mode in Plan screen: hypothetical enemy unit placement for testing architectures before deployment, sandbox PvP training, "what-if" scenarios for counter-configuration practice

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

In Robot Uprising, the player designs attention architectures blind. They configure blueprints — skills, rules, hooks, context — and hit EXECUTE or DEPLOY without ever seeing how their system performs against a specific enemy composition. The campaign provides fixed enemy compositions per mission, and Gauntlet matches only reveal the opponent's architecture after the Sealed Watch. There is no sandbox, no sparring dummy, no testing ground.

This is a massive gap. In every serious competitive game, there's a way to practice against specific scenarios: StarCraft has custom games and unit testers, fighting games have training mode, card games have theorycraft simulators. Robot Uprising has... nothing. The player's only feedback loop is deploy → watch → lose → guess → redeploy.

**Red Team Mode** fills this gap: a sandbox state within the Plan screen where the player can place hypothetical enemy units, configure their behaviors, and run local simulations to stress-test architectures before real deployment. The name comes from cybersecurity's "red teaming" — attacking your own systems to find vulnerabilities before an adversary does.

The design tension is threefold:
1. **Fidelity vs. simplicity:** How much of the enemy's architecture should the player be able to configure? Full blueprint editing (accurate but complex) vs. preset enemy archetypes (simple but lossy)?
2. **Training wheels vs. crutch:** Does Red Team Mode teach players to think adversarially, or does it let them overfit to specific enemy compositions they've already seen?
3. **Single-player vs. multiplayer scope:** Is this a campaign tool (practice against mission enemies) or a competitive tool (practice against Gauntlet opponents), or both?

---

## Five Red Team Mode Models

### Model A: "The Sparring Ring" (Full Enemy Blueprint Editor)

**How it works:** A toggle in the Plan screen flips the board from read-only preview to interactive red-team canvas. The player can now place enemy units on the grid, assign them full blueprints (same editor as their own units), configure enemy factory production queues, and run local tick simulations. Essentially a second workbench for the enemy side.

**What the screen looks like:**
The Plan screen gains a new toggle in the top-left corner: a shield icon split diagonally — left half teal (player), right half crimson (enemy). Default state: teal (normal workbench). Clicking it triggers a 600ms transition: the workbench panel slides to occupy the left 40% of the screen, the board expands to center, and a new crimson-bordered workbench panel slides in from the right edge. The board's background subtly shifts — a faint red grid overlay appears on the enemy half (rows 5-8), while the player half (rows 1-4) retains its teal tint. The top bar now shows "RED TEAM MODE" in stencil-font crimson capitals with a small animated radar sweep icon.

The enemy workbench is structurally identical to the player's — blueprint slots, skill toggles, rule ordering, hook wiring, context config — but rendered in the crimson color scheme. Every panel border is deep red instead of teal. Slot outlines pulse with a faint crimson glow. The production queue conveyor belt at the bottom runs right-to-left (mirroring the player's left-to-right), reinforcing the adversarial direction.

Between the two workbenches, the board shows both sets of units: player units as teal silhouettes on their spawn points, enemy units as crimson silhouettes wherever the player has placed them. Dragging an enemy blueprint from the right panel onto a grid cell places a crimson ghost unit there. The ghost shows the same perception radius overlay as player ghosts — but in red, creating visible overlap zones where both sides can "see."

At the bottom center of the screen, a large "SIMULATE" button replaces the normal EXECUTE button. It's rendered in amber (neither teal nor crimson — neutral ground). Below it: "Local simulation · Not a real match · Results won't affect rating."

**Simulation flow:**
Clicking SIMULATE runs the deterministic tick engine locally. The board transitions to a mini Sealed Watch — same tick clock, same 1-second default pace — but with two key differences: (1) a thin amber border around the entire screen signals "this is a simulation, not a real match," and (2) a "STOP & EDIT" button in the top-right allows halting mid-simulation to tweak either side's config. After the simulation completes (win, loss, or draw at max ticks), the Inspector is available with full scrubbing, decision traces, and context window inspection for both sides.

**Strengths:**
- **Maximum fidelity.** The player is literally running the real game engine against a real enemy configuration. No approximation, no abstraction loss.
- **Teaches adversarial thinking.** Building the enemy's architecture forces the player to understand enemy capabilities from the inside. "What would I do if I were trying to beat my own config?" is the most valuable competitive question.
- **Reuses existing UI.** The blueprint editor already exists. A second instance with a color swap is relatively cheap to implement.
- **Transfers to co-op.** The same dual-workbench layout could power co-op configuration where both players see each other's blueprints.

**Weaknesses:**
- **Massive complexity cliff.** The player is now managing TWO full architectures simultaneously. A new player who hasn't mastered their own workbench is being asked to also master the enemy's. This could be the most overwhelming screen in the entire game.
- **Overfitting risk.** Players will build enemy configs that match their last loss, not configs that challenge their architecture's structural weaknesses. They'll practice beating yesterday's opponent, not tomorrow's.
- **Time sink.** Configuring a full enemy architecture from scratch takes 5-10 minutes. Running the simulation takes 1-2 minutes. Iterating 5 times is 30+ minutes before even deploying. This could delay actual competitive play.
- **"Where do I get enemy configs?"** The player needs to know what enemy blueprints look like. In campaign, mission briefings could provide them. In Gauntlet, the player would need to reconstruct opponents from Inspector data — a non-trivial skill that itself needs teaching.

**Interaction effects:**
- Pairs naturally with **config necropsy culture (7.10)** — imported necropsies could include the opponent's config as a loadable red-team preset.
- Conflicts with **sealed watch emotional design** — if the player has already simulated a close approximation, the sealed watch loses surprise.
- Enables **community red-team challenges** — "here's a config that beats 90% of scout-rush builds, can you crack it?"

---

### Model B: "The Threat Library" (Preset Enemy Archetypes)

**How it works:** Instead of building enemy configs from scratch, the game provides a library of pre-built enemy archetypes that represent common strategic patterns. The player selects one (or a combination), places enemy units from the archetype on the board, and runs simulations. No enemy blueprint editing — the archetypes are black boxes with described-but-not-editable behaviors.

**What the screen looks like:**
The red-team toggle activates a different layout: the workbench stays full-width on the right (player's own config), but the board gains a collapsible "THREAT LIBRARY" drawer on its left edge. The drawer is styled as a dossier folder — manila-colored background, stamped "CLASSIFIED" watermark at 10% opacity, tab dividers along the top edge.

Inside the drawer, threat archetypes are presented as cards — 120×160px each, laid out in a 2-column scrollable grid. Each card has:
- **A portrait illustration** at top (stylized enemy composition silhouette — three units in formation)
- **A codename** in bold stencil font: "SWARM RUSH," "SIGNAL FLOOD," "SILENT FLANK," "RELAY FORTRESS," "NOISE WALL"
- **A one-line description:** "Fast scouts + strikers, no relays. Overwhelms with speed before information networks establish."
- **A difficulty badge** (bronze/silver/gold skull icons): how hard this archetype is to beat in general
- **A "your record" stat:** "3W 7L vs. this type" — pulled from the player's match history against similar archetypes

Clicking a card expands it to show a detailed behavioral summary: "SWARM RUSH deploys 3 scouts and 2 strikers in the first 8 ticks. Scouts patrol aggressively on short routes. Strikers follow the nearest scout's last-known-enemy signal. No relay infrastructure — all communication is direct hook-to-hook with 1-hop latency. The swarm overwhelms isolated defenders but collapses against coordinated kill zones." Below this, a "PLACE ON BOARD" button.

Placing an archetype drops a cluster of crimson ghost units on the enemy side of the board in a preset formation. The player can drag individual enemy ghosts to reposition them but cannot edit their internal configs. Each ghost shows a simplified perception radius (circle or cone, depending on archetype) in translucent red.

**Strengths:**
- **Dramatically lower complexity.** The player manages only their own config. The enemy is a named, understood challenge — like a training dummy with documented behavior.
- **Curated difficulty progression.** Archetypes can be unlocked as the player advances, ensuring they practice against increasingly sophisticated threats.
- **Teaches archetype recognition.** Players learn to identify and name enemy strategies — "that's a Relay Fortress" — which is a critical competitive skill.
- **Community can contribute archetypes.** High-Elo players could submit their configs as community archetypes (anonymized), creating a living threat library.

**Weaknesses:**
- **Lossy representation.** Real opponents don't fit neatly into archetypes. A Gauntlet opponent might be 60% Relay Fortress and 40% Signal Flood. Practicing against pure archetypes doesn't prepare for hybrids.
- **Stale without updates.** If the meta shifts faster than the archetype library updates, players practice against outdated threats.
- **Black box frustration.** "I can't see what rules this archetype uses" means the player can't learn from the enemy's design — only react to its behavior. This limits the adversarial thinking benefit.

**Interaction effects:**
- Pairs with **seasonal modifiers (7.09a)** — each season could shift which archetypes are dominant, and the library updates accordingly.
- Pairs with **the Blueprint Codex** — threat archetypes could be collectible cards in the Codex, unlocked by encountering (and beating) them.
- Conflicts less with sealed watch surprise than Model A, since the player hasn't seen the *exact* config they'll face.

---

### Model C: "The Ghost Replay" (Fight Your Own Past Opponents)

**How it works:** No manual enemy configuration at all. Instead, the player selects any past Gauntlet opponent from their match history and replays the exact configuration they faced. The system stores the deterministic config + seed from completed matches, allowing re-simulation with the player's *current* config against a *past* opponent's config.

**What the screen looks like:**
The red-team toggle opens a "MATCH ARCHIVE" panel overlaying the board. It's styled as a filing cabinet — vertical list of past matches, each row showing: opponent name (or anonymized handle), date, result (W/L), final tick count, and a thumbnail of the board's final state. Matches are sorted by recency, with filter tabs at top: "All," "Losses," "Close Calls" (matches where EDT was in the last 20% of max ticks), "By Archetype."

Clicking a match row loads the opponent's ghost config onto the board. The player sees crimson enemy ghosts in their original spawn positions. A status bar reads: "Replaying vs. [Opponent] — config from [date]. Your config has changed since this match." A small diff indicator shows how many elements the player has modified since that match: "12 changes since original encounter."

The player can now freely modify their own config in the workbench, then hit SIMULATE to re-run against the same opponent. The simulation uses the stored deterministic seed for enemy behavior but the player's updated config. This creates a controlled experiment: same enemy, different player approach.

After simulation, a split-screen comparison mode shows the original match result alongside the simulated result — tick-by-tick side by side, highlighting where the outcomes diverge.

**Strengths:**
- **Zero configuration burden.** The enemy config is already built — it's a real config from a real player. No archetype approximation, no manual construction.
- **Perfect practice target.** "I lost to this specific config. Can I beat it now?" is the most motivating possible practice scenario.
- **Reveals improvement.** The split-screen comparison between original loss and new simulation victory is one of the most satisfying moments the game can deliver.
- **Encourages Inspector use.** To understand why the past opponent beat them, the player must use Inspector tools — reinforcing diagnostic skills.

**Weaknesses:**
- **Only available after losing.** New players in campaign have no match history. This mode requires the player to have already played (and lost) competitive matches.
- **Backward-looking only.** Practicing against yesterday's loss doesn't prepare for tomorrow's innovation. The meta evolves; old configs become irrelevant.
- **Privacy concern.** Storing and replaying another player's config raises questions: does the opponent know their config is being used as a training dummy? Is this information advantage fair?
- **Overfitting risk (different flavor).** A player who obsessively replays one loss until they beat it may not generalize the lesson to other opponents.

**Interaction effects:**
- Directly enables **counterfactual simulation (4.20)** — the "what if" mode in the Inspector. Ghost Replay is counterfactual simulation made interactive.
- Pairs with **config necropsy (7.10)** — the replayed match becomes the subject of the necropsy, with the new simulation result as the "fix."
- Pairs with **loadout system (7.01a)** — "load Garage 3, simulate against last Friday's opponent, compare with Garage 5 against same opponent."
- Privacy concern interacts with **adversarial explorer exposure policy (4.54)**.

---

### Model D: "The Scenario Editor" (Parameterized Threat Generation)

**How it works:** Instead of placing individual enemy units or selecting archetypes, the player specifies high-level *constraints* and the game generates an enemy composition that satisfies them. "Give me an enemy that uses at least 2 relays," "Give me a rush composition that attacks before tick 20," "Give me the hardest possible counter to my current config."

**What the screen looks like:**
The red-team panel presents a form-style interface with sliders, toggles, and dropdown menus — reminiscent of a character creation screen, but for threats. Sections include:

**Composition constraints:**
- Unit count slider (3-8 units)
- Unit type minimums: "At least __ scouts, __ strikers, __ relays, __ specialists, __ command"
- "Randomize unconstrained" checkbox (fills remaining slots randomly)

**Behavioral constraints:**
- Aggression slider: "Defensive ←→ Aggressive" (affects patrol routes, engagement distance priorities)
- Communication density slider: "Silent ←→ Chatty" (affects hook count, channel usage, EM emissions)
- Timing slider: "Rush ←→ Macro" (affects production queue priorities, when first combat occurs)
- Intelligence slider: "Simple ←→ Complex" (affects rule count per unit, hook chain depth)

**Challenge mode:**
- "Counter my config" button: the game analyzes the player's current architecture and generates an enemy specifically designed to exploit its weaknesses. A loading animation (spinning gears with the text "Analyzing vulnerabilities...") plays for 2-3 seconds, then enemy ghosts appear on the board with a brief report: "Generated counter-config targeting your relay's buffer saturation vulnerability. Expected first engagement: tick 14."

Each slider has tick marks with named presets: the Aggression slider has "Turtle" at 0%, "Balanced" at 50%, "Berserker" at 100%. Moving a slider triggers a real-time update of the ghost preview on the board — enemy unit positions shift, perception cones adjust, and a predicted first-engagement tick updates in the corner.

**Strengths:**
- **Controlled difficulty.** The player can tune exactly how hard the challenge is. Beginners practice against simple, slow enemies. Veterans dial everything to max.
- **"Counter my config" is the killer feature.** Automated vulnerability analysis is something no other game offers. It's penetration testing for attention architectures.
- **Replayable variety.** Even with the same constraints, randomized elements ensure each simulation is different. This prevents overfitting to one specific config.
- **Teaches parameter thinking.** The sliders themselves teach the player about the axes of enemy variation — aggression, communication density, timing, complexity — which are the same axes they need to think about for their own configs.

**Weaknesses:**
- **Generated configs may be unrealistic.** A procedurally generated enemy might use combinations no human player would ever deploy. Practicing against artificial opponents doesn't build competitive intuition.
- **"Counter my config" could feel unfair.** If the generated counter always wins, the player may feel hopeless. If it sometimes loses, the player may not trust its analysis. The confidence calibration is tricky.
- **Implementation complexity.** Generating valid, interesting enemy configs from constraints requires a sophisticated AI or constraint solver — a significant engineering investment.
- **Slider fatigue.** Too many knobs can feel more like work than play. The mixing-board problem applies here.

**Interaction effects:**
- The "counter my config" feature is essentially the **adversarial counterfactual mode (4.39)** applied proactively — before the match, not after.
- Slider-based generation connects to the **mixing board building paradigm** — same interaction pattern, applied to threat generation.
- Pairs with **mission design robustness (campaign/mission-design-robustness-scenarios.md)** — the scenario editor could generate the 100-variant test suite for PvE missions.

---

### Model E: "The War Room" (Multiplayer Red Team Sessions)

**How it works:** Two human players enter a private lobby. One plays Blue (defending architecture), one plays Red (attacking architecture). The Red player has full access to Blue's deployed config — they can see every blueprint, every rule, every hook wiring. Red then builds a counter-config designed to exploit Blue's weaknesses. They simulate. Then they swap roles. This is cooperative adversarial training — both players improve by attacking each other.

**What the screen looks like:**
The lobby screen shows two player cards facing each other across a stylized battlefield divider — an 8×8 grid rendered as a top-down map between two war tables. The left card (Blue) shows the defending player's name, rating, and a locked padlock icon (their config is sealed until the session starts). The right card (Red) shows the attacking player's name and an open padlock (they'll receive Blue's config).

When the session starts, a dramatic reveal animation plays: Blue's config "unfolds" — blueprint cards flip face-up one by one across the divider onto Red's war table, each landing with a soft *thwack* sound. Hook wiring diagrams draw themselves in real-time across the board. Channel names appear in sequence. The animation takes 8-10 seconds and is designed to feel like laying out classified documents on a briefing table.

Red now has a split-screen view: Blue's complete config (read-only, left panel, blue-bordered) and their own workbench (editable, right panel, red-bordered). The board shows Blue's unit ghosts in teal and Red's placement area in crimson. Red has unlimited time to study Blue's config, identify weaknesses, and build a counter.

After Red clicks SIMULATE, both players watch the Sealed Watch together (synchronized tick clock). Chat is disabled during the watch — both must form their own impressions. After the watch, Inspector opens for both with full access. Then: voice/text debrief between the players, role swap, repeat.

**Strengths:**
- **The most effective training possible.** Having a human adversary study your config and find its weaknesses is immeasurably more valuable than any AI analysis. This is professional-grade red teaming.
- **Social bonding.** The war room creates intense shared experiences — the reveal animation, the synchronized watch, the "oh no they found it" moment. This is the co-op Inspector teaching tool (7.02d) applied to competitive practice.
- **Teaches empathy for opponent's perspective.** When you've *been* the Red player dissecting a Blue config, you understand what your Gauntlet opponents are doing in the Inspector. You start anticipating their analysis.
- **Community content.** War Room sessions are inherently interesting to watch — a skilled Red player live-dissecting a config is compelling content for streams and tutorials.

**Weaknesses:**
- **Requires two committed players.** Finding someone willing to spend 30-60 minutes in a cooperative adversarial session is a high social barrier. This mode might only be used by organized teams or content creators.
- **Full config reveal is high-stakes.** Showing your entire architecture to another player means they could share it publicly, use it against you in Gauntlet, or tell opponents your weaknesses. Trust is required.
- **Asymmetric skill mismatch.** If Red is much better than Blue, the "red team" degenerates into "I beat you easily, here are 15 things wrong with your config." If Blue is much better, Red can't find anything. The sweet spot requires similar skill levels.
- **Time-intensive.** A full war room session (study, build, simulate, debrief, swap, repeat) takes 60-90 minutes. This is a significant commitment.

**Interaction effects:**
- Directly extends **co-op Inspector as teaching tool (7.02d)** — the War Room is the competitive version of co-op Inspector.
- Interacts with **adversarial exposure policy (4.54)** — the War Room is explicit mutual disclosure by consent.
- Pairs with **spectator mode (7.01e)** — War Room sessions could be spectatable as a tournament/content format.
- The reveal animation connects to **boot log narrative design** — both use sequential disclosure as a dramatic technique.

---

## Comparative Analysis

| Dimension | A: Sparring Ring | B: Threat Library | C: Ghost Replay | D: Scenario Editor | E: War Room |
|-----------|-----------------|-------------------|-----------------|-------------------|-------------|
| Complexity for user | Very high | Low | Low | Medium | Medium-high |
| Accuracy of simulation | Perfect | Approximate | Perfect (past) | Generated | Perfect (live) |
| Requires match history | No | No | Yes | No | No |
| Requires another player | No | No | No | No | Yes |
| Teaches adversarial thinking | High | Low | Medium | Medium | Very high |
| Overfitting risk | High | Low | High | Low | Low |
| Campaign applicability | Full | Full | Limited | Full | None |
| Competitive applicability | Full | Moderate | Full | Moderate | Full |
| Time per session | 15-30min | 5-10min | 10-15min | 10-20min | 60-90min |
| Implementation cost | Medium | Medium | Low | High | High |

**The recommended progression:** Introduce Model B (Threat Library) in campaign Mission 5 when the factory is introduced — "test your production setup against these known threats." Unlock Model C (Ghost Replay) when Gauntlet opens. Model D (Scenario Editor) as a late-game research tree unlock. Model A (Sparring Ring) available in settings as an expert toggle. Model E (War Room) as a social feature for organized play.

---

## Player Journeys

### Journey 1: Marcus, 32, Software Engineer — First Encounter with Red Team Mode

**Context:** Mission 6 (Cebu, urban terrain). Marcus has just unlocked the factory and is struggling with his first factory-vs-factory mission. His scouts keep dying before relays establish communication channels. He's lost this mission twice.

**Minute 0:00 — The Prompt**
Marcus returns to the Plan screen after his second loss. A new amber tooltip appears next to the red-team toggle (shield icon, top-left): "NEW: Red Team Mode — Test your architecture against known threats before deploying." The tooltip has a pulsing amber outline — the game's standard "new feature" indicator. Marcus's cursor hovers over it. The tooltip expands: "Place enemy units on the board and simulate battles without affecting your rating or mission progress."

He clicks the toggle. The screen transitions with the 600ms animation: his workbench compresses slightly to the right, the board expands, and the Threat Library drawer slides in from the left. The drawer's "CLASSIFIED" watermark is semi-transparent, manila-colored background with folder tabs. A brief boot-log-style message scrolls at the top of the drawer: "THREAT ANALYSIS SUBSYSTEM ONLINE. Known adversary patterns loaded."

**Minute 0:30 — Browsing Threats**
Marcus scrolls through the threat cards. Five are available at his progression level:
- **SWARM RUSH** (bronze skull) — "Fast scouts + strikers, no relays."
- **SIGNAL FLOOD** (bronze skull) — "Maximum relay density, drowns targets in noise."
- **SILENT FLANK** (silver skull) — "Minimal EM emissions, flanking strikers."
- **RELAY FORTRESS** (silver skull) — "Centralized relay hub with layered defense."
- **NOISE WALL** (gold skull) — "Specialist-driven context overload strategy."

He reads the SWARM RUSH description: "Deploys 3 scouts and 2 strikers in the first 8 ticks. Scouts patrol aggressively on short routes. Strikers follow the nearest scout's last-known-enemy signal." This sounds like what beat him. He taps "PLACE ON BOARD."

**Minute 1:00 — Ghosts on the Grid**
Five crimson ghost units snap onto the enemy half of the board — three 👁 icons and two ⚔ icons in an aggressive forward formation. Each ghost has a red perception cone extending toward the player's half. Marcus can see his own teal units' perception zones overlapping with the enemy's red cones. The overlap zone — where both sides can see each other — pulses with a soft amber glow.

He notices his scout's patrol route passes directly through the densest overlap zone. "That's why they keep dying," he mutters.

**Minute 1:30 — First Simulation**
Without changing his own config, Marcus clicks SIMULATE (amber button, bottom center). The board transitions to the mini Sealed Watch — amber border around the screen, "SIMULATION" watermark. Ticks fire: tick 1, tick 2... By tick 6, his scouts are in the overlap zone. Tick 7: an enemy scout spots his scout. Tick 8: the enemy scout's hook fires — a red dashed line flashes across the board to the nearest enemy striker. Tick 9: the striker pivots. Tick 11: his scout is eliminated. No signal was sent — his relay hadn't connected yet.

"Same thing that happened in the real match," Marcus says. The simulation confirms his diagnosis.

**Minute 2:30 — The Fix Attempt**
He returns to the workbench (the simulation auto-transitions back to Plan screen on completion or via "STOP & EDIT"). He adjusts his scout's patrol route to stay out of the overlap zone for the first 5 ticks. He adds a rule: "IF tick < 6 THEN evade, ELSE patrol." He re-simulates.

This time, his scout survives until tick 10. The relay connects by tick 8. When the enemy scout spots his scout at tick 10, his scout's hook fires through the relay to his striker — and his striker arrives at tick 14, one tick before the enemy's. His striker eliminates the enemy scout. "YES." The simulation shows a close win.

**Minute 4:00 — Confidence to Deploy**
Marcus runs two more simulations, tweaking the early-game evade rule each time. He finds a version that wins 3 out of 3 against SWARM RUSH. He exits Red Team Mode (toggle back to teal), hits EXECUTE for the mission. This time, the Sealed Watch feels different — he's watching for the patterns he rehearsed. His scout survives. His relay connects. His striker flanks. Mission complete.

**What Marcus learned:** Patrol route timing relative to enemy perception zones. The value of early-game defensive rules. That his relay setup needs 8 ticks to establish, and his scouts must survive that window.

---

### Journey 2: Aya, 24, Competitive Gauntlet Player — Ghost Replay Revenge Match

**Context:** Gauntlet rank Silver III. Aya just lost a close match to a player named "RelayCascade" whose config used a dense relay network that flooded her scouts' context windows with noise, causing overload stuns at critical moments. She's frustrated and wants to understand exactly what happened.

**Minute 0:00 — Opening the Archive**
Aya clicks the red-team toggle and selects "MATCH ARCHIVE" (Model C). Her recent matches appear in a filing-cabinet list. The most recent — a loss to RelayCascade — is highlighted with a thin red border and a "LOSS" badge. She clicks it.

The board populates with crimson ghost units in the positions RelayCascade's units occupied at tick 0. A status bar reads: "Replaying vs. RelayCascade — config from 2 hours ago. You have made 0 changes since this match." Below the status bar, a mini summary: "RelayCascade used: 1 Scout, 4 Relays, 1 Striker, 1 Specialist. Total hooks: 14. Channels: 5."

Aya's eyes widen. "Four relays? That's insane."

**Minute 0:45 — Studying the Enemy Formation**
She clicks each crimson ghost to see its blueprint summary. The relays are positioned in a diamond formation at the center of the enemy half — maximum signal coverage. Each relay has 4 hook slots, all used: one hook per channel. Five channels: "threat-north," "threat-south," "threat-east," "threat-west," "priority-target." The relay network creates a mesh where any signal from the scout reaches all four relays within 1 tick, and each relay amplifies and forwards on the appropriate directional channel.

The specialist has a hook on "priority-target" and uses the "hack" skill — when a target is tagged on that channel, it jams the target's context window with garbage data. This is what caused the overload stuns.

**Minute 2:00 — The Counter-Config**
Aya now understands the attack vector: the specialist's hack skill injects garbage into her scouts' context windows, but only if they're tagged on the "priority-target" channel. Her scouts' context configs have no filter for unknown signal sources — they listen to everything.

She modifies her scout blueprint: in Context Config, she toggles "Listen: known channels only" and removes the default "listen to all." Her scouts will now only process signals from channels they're explicitly subscribed to. Garbage from the enemy specialist's hack will be ignored — it arrives on an unknown channel and gets dropped at the filter level, never consuming a context slot.

**Minute 3:00 — The Revenge Simulation**
She hits SIMULATE. The battle plays out differently from tick 1. Her scouts move freely — no overload stuns. The enemy specialist's hack skill fires at tick 14 (she can see the red signal flash), but her scout's context bar doesn't budge — the garbage was filtered. By tick 18, her scouts have mapped the enemy relay diamond, and her strikers are converging on the isolated scout at the edge of the enemy formation.

The simulation ends at tick 31 with a player victory. Aya switches to the split-screen comparison mode: the original match (left, desaturated, red "LOSS" banner) and the simulation (right, full color, teal "WIN" banner) side by side. She scrubs to tick 14 — in the original, her scout's context bar spikes to red and the stun icon appears. In the simulation, the scout's context bar barely moves. The difference is one toggle in the context config.

**Minute 4:30 — The Lesson**
A small tooltip appears in the comparison view: "Key difference: Context filter configuration. Original: listen-all. Simulation: known-channels-only. This prevented 7 context overloads across the match." Aya screenshots the split-screen comparison and posts it to the community Discord with the caption: "PSA: always filter unknown channels against relay-heavy opponents."

She saves the modified config to Garage slot 4, names it "Anti-Relay," and queues for Gauntlet.

**What Aya learned:** Context filtering is a defensive primitive against noise-based attacks. The specific interaction between hack skill, unknown channels, and context overload. How to read an enemy's architecture from Inspector data and construct a targeted counter.

---

### Journey 3: Tito, 14, First-Time Strategy Player — Accidentally Finding Red Team Mode

**Context:** Mission 4 (Batanes, highlands terrain). Tito is in the tutorial arc, hand-configuring pre-placed units. He hasn't unlocked the factory yet. He keeps losing because his striker moves too slowly to reach the enemy before his scout is eliminated.

**Minute 0:00 — Curiosity Click**
Tito notices the shield icon in the top-left. It's been there since Mission 3 but grayed out. Now, after two losses on Mission 4, it's lit up with a subtle amber glow and a "?" badge. He clicks it.

A gentle boot-log message scrolls: "THREAT SIMULATION SUBSYSTEM: BASIC MODE. Place training targets to test your unit configurations." The board gains a new element: a single draggable crimson enemy icon at the top edge, labeled "TRAINING TARGET." No threat library, no archive — just one movable target dummy.

**Minute 0:20 — The Training Dummy**
Tito drags the training target onto the board. It snaps to grid cell E6. The target has a simple behavior description in a tooltip: "Moves toward nearest player unit each tick. Eliminates on contact." No blueprints, no hooks, no context window — just a basic enemy that walks toward you and kills on adjacency.

He sees his striker on B2 and the target on E6. Between them: 6 tiles of highland terrain. His striker moves 1 tile per tick. The target moves 1 tile per tick. They'll collide at tick 3 somewhere around D4.

He hits SIMULATE. Tick 1: both advance. Tick 2: both advance. Tick 3: they're adjacent — the target reaches the striker. But the striker has the "engage" skill — it eliminates on adjacency too. The resolution is simultaneous: both eliminated. A "DRAW" result.

**Minute 1:00 — Repositioning**
Tito drags his scout (currently at A4) toward the target's path. The scout has "evade" — it can move away from threats. He places a rule on the scout: "IF enemy adjacent THEN evade north." He re-simulates. Now the scout lures the target north while the striker approaches from the west. The target follows the scout (nearest unit). The striker flanks. Tick 4: striker reaches the target from behind. Elimination. Victory.

"Oh! The scout is bait!" Tito grins. He drags the training target to different positions on the board and re-simulates each time, learning how his units interact with different approach angles.

**Minute 3:00 — Back to the Mission**
Tito exits Red Team Mode. He reconfigures his scout's patrol route to cross in front of the enemy spawn point, drawing fire while his striker flanks. He EXECUTES the mission. During the Sealed Watch, he watches his scout bait the enemy exactly like in the simulation. His striker flanks. Mission 4 complete.

**What Tito learned:** The scout-as-bait pattern. That positioning matters more than raw speed. The concept of flanking through information asymmetry (the enemy follows the nearest visible unit, not the most dangerous one). All of this without ever touching a blueprint editor or understanding hooks.

---

### Journey 4: StreamerChef_TTV, 28, Content Creator — War Room Stream

**Context:** StreamerChef is a mid-tier content creator who streams Gauntlet matches. Tonight's stream is a War Room session with their friend "NullPointer," a Diamond-rated player. 847 viewers in chat.

**Minute 0:00 — The Lobby**
StreamerChef creates a War Room lobby and shares the invite code on stream. NullPointer joins. The lobby screen shows two player cards facing each other across the battlefield divider. StreamerChef (Blue, defending) — rating 1,650. NullPointer (Red, attacking) — rating 2,100.

Chat is already buzzing: "NullPointer is going to DESTROY that config" / "StreamerChef's relay timing is so off, this is going to hurt" / "Popcorn time 🍿"

**Minute 0:30 — The Reveal**
StreamerChef clicks "BEGIN SESSION." The reveal animation starts: their blueprint cards flip face-up one by one, each landing on NullPointer's war table with a *thwack*. NullPointer's face (in webcam) is visible — they're leaning forward, studying each card as it lands. Chat explodes: "THE HOOK WIRING LMAOOO" / "Why is there a dead channel?" / "NullPointer already spotted the weakness I guarantee it."

StreamerChef narrates: "Okay so this is my main config, the one I've been climbing with. I know the relay timing is tight but it's been working against Silver opponents. Let's see what a Diamond player does with it."

**Minute 2:00 — NullPointer's Analysis (Split-Screen)**
The stream shows NullPointer's POV in a picture-in-picture window. NullPointer is methodically clicking through each blueprint, reading rules, tracing hook chains. They open the channel map and draw circles around two channels with their stream overlay tool.

"See this?" NullPointer says. "You have 'alert-north' and 'alert-south' but nothing on 'alert-east.' Your eastern flank is completely blind. Any competent opponent would just send two scouts east and you'd never see them until they're adjacent to your relay."

Chat: "EXPOSED" / "The east flank gap is criminal" / "I've been losing to the same thing and never noticed"

**Minute 5:00 — The Counter Build**
NullPointer builds a counter-config in the red workbench: two scouts routed east, a striker staged to follow. Their relay compresses the scout signals into a single "east-attack" channel that the striker listens on. The config takes 3 minutes to build — NullPointer narrates every decision.

"I'm not going to do anything fancy. I'm just going to exploit the east gap. If StreamerChef patches this one hole, this counter stops working entirely. That's how you know it's a real weakness — the fix is simple but the exploit is devastating."

**Minute 8:00 — The Simulation**
Both players watch the Sealed Watch. Chat predicts: "GG in 20 ticks" / "StreamerChef's relay is going to get flanked at tick 15."

Tick 12: NullPointer's eastern scouts appear in the gap. StreamerChef's scout is patrolling west — it never sees them. Tick 15: the scouts hook-signal to the striker. Tick 18: the striker is adjacent to StreamerChef's relay. Tick 19: relay eliminated. With the relay gone, StreamerChef's remaining units lose all coordination. Tick 24: total collapse.

StreamerChef: "Okay. That hurt. But now I see it — the east flank is just... open." They open Inspector, scrub to tick 12, click the eastern gap. No perception coverage. No hooks listening. Nothing.

**Minute 12:00 — The Fix and Role Swap**
StreamerChef adds a third hook to their scout blueprint: "IF enemy spotted east THEN broadcast on alert-east." They add a rule to their striker: "IF alert-east signal THEN move east." They re-simulate against NullPointer's counter. This time, the eastern scouts are detected at tick 12, the striker pivots east by tick 14, and the flanking striker is intercepted at tick 17.

NullPointer: "See? One hook, one rule. Your config was one hook away from covering that gap the whole time."

Role swap. Now StreamerChef attacks NullPointer's Diamond-rated config. StreamerChef spots NullPointer's config uses an aggressive command agent that reassigns all units mid-battle — but the command agent has only 14 buffer slots and 6 hooks feeding it data. StreamerChef builds a noise-flood counter using three relays broadcasting garbage on all channels, aiming to overload the command agent's buffer.

The simulation runs. Tick 8: NullPointer's command agent starts receiving noise. Tick 10: buffer at 12/14. Tick 11: 14/14. Tick 12: OVERLOAD. The command agent is stunned for 1 tick. During that tick, it can't reassign subordinates — and two of NullPointer's strikers, mid-reassignment, freeze in place with stale orders. StreamerChef's own striker reaches one of the frozen strikers. Elimination.

Chat: "STREAMERCHEADER JUST STUNLOCKED A DIAMOND COMMAND AGENT" / "THE NOISE FLOOD WORKED?!" / "clip it clip it"

NullPointer, laughing: "Okay, that's actually a good find. My command agent needs a compress skill or a noise filter. I've been relying on the 14-slot buffer being 'enough' but against targeted noise it's clearly not."

**Minute 25:00 — Debrief**
Both players discuss what they learned. StreamerChef gained: the east flank gap fix and the concept of targeting high-buffer command agents with noise. NullPointer gained: the realization that their command agent's buffer is unprotected. Chat gained: 25 minutes of educational content showing how high-level players think about architecture.

**What the audience learned:** How to identify blind spots in perception coverage. How noise-flooding works as an offensive strategy. That even Diamond-rated configs have exploitable weaknesses. The War Room format as a content type.

---

## Sensory Design Details

### The Red-Blue Color Language
The entire Red Team Mode operates on a strict **teal (player) vs. crimson (enemy)** color split. Teal is the game's existing player color — #00BCD4 with slight glow. Crimson is a deep, warm red — #DC143C, never bright enough to read as "error" or "danger," but warm enough to read as "adversary." The amber simulation border (#FFC107) sits between them as neutral ground. All three colors appear in the red-team toggle icon as a visual key.

### Sound Design
- **Toggle activation:** A heavy switch *chunk* — industrial circuit breaker engaging. The frequency drops slightly when toggling to red team (lower pitch = threat) and rises when toggling back to normal (higher pitch = safe).
- **Threat Library card hover:** A soft radar *ping* — high-frequency blip like sonar return. Each card has a slightly different pitch based on its difficulty skull rating.
- **Ghost unit placement:** A magnetic *snap* — the sound of a chess piece firmly placed on a board. Slightly metallic, slightly hollow.
- **Simulation start:** A countdown beep (3-2-1) that uses the sealed watch tick sound but played through a lo-fi filter — slightly muffled, slightly compressed — signaling "this is practice, not the real thing."
- **Simulation end (victory):** A muted version of the campaign victory sound — same melody, 50% volume, played through the lo-fi filter. Satisfying but clearly "not the real thing."
- **Simulation end (defeat):** A brief descending tone — not the campaign's failure sound, which would be punishing in a practice context. More like a "try again" doorbell.
- **War Room reveal animation:** Each card flip has a physical *thwack* — cardstock hitting wood. The hook wiring draws with a faint electrical crackle. Channels appear with a soft *hiss* — like opening a pressurized seal.

### The TikTok Clip
**The clip:** StreamerChef's noise flood stunlocking NullPointer's Diamond command agent. 15 seconds: the command agent's buffer bar climbing from green to amber to red, the OVERLOAD flash, the two frozen strikers, StreamerChef's striker sliding in for the kill. Chat overlay exploding. NullPointer's webcam showing genuine surprise. Caption: "I stunlocked a Diamond player's command agent with three relays. War Room built different."

**Why it works:** It shows a lower-rated player finding a genuine exploit in a higher-rated player's architecture through systematic analysis — the game's core fantasy of "smart systems beat strong systems." The stunlock visual (buffer bar going red, overload flash, frozen units) is instantly legible even to someone who doesn't play the game.

---

## Implementation Phasing

| Phase | What Ships | When |
|-------|-----------|------|
| 1 | Training Dummy (simplified Model B for tutorial) | Mission 4 |
| 2 | Threat Library (full Model B) | Mission 5 (factory introduction) |
| 3 | Ghost Replay (Model C) | Gauntlet unlock |
| 4 | Scenario Editor (Model D) | Late-game research tree |
| 5 | Sparring Ring (Model A) | Expert settings toggle |
| 6 | War Room (Model E) | Social feature, post-launch or Season 2 |

The Training Dummy (Tito's journey) is the entry point — it requires zero new UI concepts, just a draggable enemy ghost with simple movement rules. Each subsequent phase adds complexity only for players who seek it.

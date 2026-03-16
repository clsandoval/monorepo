# Seasonal Modifier Design Space

**Aspect:** 7.09a — Seasonal modifier design space: exhaustive catalog of possible modifiers (EM range, signal latency, buffer size, perception range, starting noise, unit cost scaling, terrain effects) with interaction matrices and archetype impact analysis; which modifiers create healthy meta-shifts vs. which create degenerate dominant strategies

**Category:** multiplayer/competitive
**Wave:** 7 — Multiplayer & Community

---

## The Design Problem

Robot Uprising's Gauntlet needs environmental modifiers that rotate each season (4-month cadence per 7.09) to prevent meta-stagnation within a fixed vocabulary. The parent analysis (7.09) established Model B "The Seasonal Map" as the recommended approach: rotate context, not vocabulary. This analysis exhaustively catalogs every modifier the game could deploy, evaluates each for meta-health impact, and identifies dangerous combinations that create degenerate strategies.

**The modifier designer's mandate:** Each modifier must (1) stress-test a different part of the configuration space, (2) make at least one previously-weak archetype newly viable, (3) not create a single dominant strategy that eclipses all others, and (4) be explainable in one sentence in the season boot log.

---

## Comparable Systems: What Works and What Breaks

### Slay the Spire Ascension (Cumulative Difficulty Modifiers)

StS's 20-level (StS1) / 10-level (StS2) ascension system is the gold standard for cumulative, player-chosen difficulty modifiers. Key design lessons:

- **Compression works.** StS2 halved the level count by merging related modifiers (enemy health + enemy damage = one level). Robot Uprising's seasonal modifiers should similarly avoid "micro-modifiers" — each modifier should change the meta meaningfully, not nudge it.
- **Categories matter.** StS's modifiers fall into clean types: resource penalties (less gold, fewer potions), enemy buffs (harder, deadlier), player debuffs (curses, less healing). Robot Uprising's modifiers should similarly cluster into legible categories.
- **The cumulative trap.** StS ascension levels stack. At Ascension 20, the game is unrecognizably punishing. Robot Uprising's seasonal modifiers should be **replacements, not additions** — each season has 1-3 active modifiers, not a growing stack.

### Hades Pact of Punishment (Player-Chosen Difficulty Menu)

Hades lets players choose WHICH dimensions of difficulty increase, with each dimension having multiple ranks. The Pact is brilliant because:

- **Player agency over difficulty vector.** "I'm comfortable fighting faster enemies but not more enemies" is a meaningful choice. Robot Uprising's modifiers are designer-chosen per season (not player-chosen), but the principle of **legible, orthogonal dimensions** still applies.
- **Heat as currency.** Hades gates rewards behind total Heat, not specific modifiers. Players find their own path through the difficulty space. If Robot Uprising ever offers player-chosen modifiers (e.g., in a practice/custom Gauntlet), the Hades model is the template.
- **Granularity.** Each modifier has 1-5 ranks. "Enemies deal +20% damage" feels different from "enemies deal +100% damage." Robot Uprising's seasonal modifiers should similarly have intensity dials, not binary on/off.

### StarCraft II Co-op Mutations (Weekly Combinatorial Challenges)

SC2 co-op deployed 50+ individual mutators, combined into weekly "mutations" of 2-4 mutators each. Key lessons:

- **Category diversity is essential.** SC2's mutators span environmental hazards (Blizzard, Lava Burst), enemy buffs (Avenger, Speed Freaks), player penalties (Shortsighted, Fear), economy disruption (Micro Transactions, Slim Pickings), and death effects (Scorched Earth, Self Destruction). Robot Uprising needs similar breadth.
- **Interaction effects create emergent difficulty.** "Shortsighted + Speed Freaks" is exponentially harder than either alone — you can't see the fast enemies coming. Robot Uprising's modifier combinations need interaction matrices.
- **Community excitement from the unknown.** SC2 players looked forward to weekly mutations precisely because the combination was unpredictable. Fixed seasonal modifiers lose this anticipation — consider mid-season "field conditions" (weekly micro-modifiers) alongside the season modifier.
- **"Heroes from the Storm" as expensive spectacle.** Some SC2 mutators required significant development effort and were used only once. Robot Uprising's modifiers should be parametric (adjusting existing numbers), not requiring new content.

### TFT Augments (300+ Per-Game Modifiers)

TFT's augment system offers 300+ modifiers per set, chosen during the game. The meta-relevant lesson:

- **Riot removed augments from post-game stats** because displaying pick rates caused players to pick "statistically best" augments regardless of context, creating a stale meta. The lesson: if Robot Uprising displays season modifier stats (archetype win rates under each modifier), it must frame them as contextual, not prescriptive.
- **60% new augments per set rotation** — TFT aggressively refreshes the modifier pool. Robot Uprising's fixed vocabulary means the modifier pool is the rotation mechanism. 2-3 new modifier variants per season keeps the catalog fresh.

### Apex Legends Ranked Splits (Map Rotation as Meta-Shift)

Apex shifts from single-map splits to daily map rotation, with soft rank resets mid-season:

- **Geography as modifier.** Apex's maps ARE modifiers — different maps favor different legends and strategies. Robot Uprising's terrain layouts serve the same function. A season on volcanic terrain (narrow corridors, limited sightlines) plays differently from a season on open beach terrain.
- **The rotation cadence debate.** Apex moved from split-long maps to daily rotation because single-map splits grew stale. Robot Uprising's 4-month seasons need enough internal variety (weekly field conditions, mid-season map rotation) to prevent the same staleness.

---

## The Modifier Taxonomy

Every possible modifier falls into one of eight categories. Each category targets a different axis of the configuration space.

### Category 1: Signal Environment Modifiers

These change how information propagates across the battlefield. They stress-test the player's communication architecture.

#### 1A. "Thick Atmosphere" — EM Detection Range Increase

**Mechanic:** EM detection range increases from default (3 tiles) to 5 tiles. Every hook transmission is visible from farther away. Relay-heavy architectures become trackable from across the board.

**Boot log:** `[>>] FIELD_CONDITION: EM propagation range expanded to 5 tiles. Deep networks visible from distance.`

**Who it helps:** Minimalist configs (few hooks = low EM), scout rushes (fast, few transmissions), stealth-specialist builds.
**Who it hurts:** Relay chains (high hook density = beacon), command meta (14-slot command agent with 6 hooks = loudest unit on the field).
**Degenerate risk:** LOW. Minimalist configs are viable but limited — they can't outmaneuver relay chains in information quality. The modifier forces relay players to add EM-mitigation skills (compress, filter) rather than abandon relays entirely.

**Intensity dial:** EM range 4 / 5 / 6 tiles (mild / standard / extreme).

#### 1B. "Dead Air" — EM Detection Range Decrease

**Mechanic:** EM detection range shrinks from 3 tiles to 1 tile. Hook transmissions are nearly invisible. Stealth becomes very difficult; deep architectures operate without fear of detection.

**Boot log:** `[>>] FIELD_CONDITION: EM propagation dampened. Detection range reduced to 1 tile. Deep networks run quiet.`

**Who it helps:** Relay chains, command meta, any hook-heavy architecture.
**Who it hurts:** EM-hunting configs, noise flood strategies (noise floods rely on enemy hearing the noise), minimalist configs (their stealth advantage disappears).
**Degenerate risk:** MEDIUM. Could create relay-chain dominance if stealth-cost is the only thing keeping them in check. Must be paired with another modifier that stresses relay chains on a different axis.

#### 1C. "Ionosphere" — Signal Latency Increase

**Mechanic:** Signal latency increases from 1 tick/hop to 2 ticks/hop. A scout→relay→striker signal that previously took 3 ticks now takes 5. Information is still accurate but arrives late.

**Boot log:** `[>>] FIELD_CONDITION: Signal propagation speed halved. Every hop costs 2 ticks. Plan for delay.`

**Who it helps:** Direct architectures (scout rush, striker swarm) where units act on local perception without waiting for signals. Minimalist configs that don't rely on multi-hop chains.
**Who it hurts:** Deep relay chains (4-hop chain now takes 8 ticks — information arrives after the battle is over), command meta (command agent's orders arrive 2× late).
**Degenerate risk:** HIGH if set to 2 ticks/hop. At this latency, relay chains become functionally useless, collapsing the strategy space to "direct engagement only." Safer at 1.5 ticks/hop (alternating 1 and 2 tick hops) or with a 1-hop exemption (first hop is still 1 tick, each subsequent hop is 2 ticks — progressive delay).

**Intensity dial:** 1.5 / 2 / 3 ticks per hop.

#### 1D. "Superconductor" — Signal Latency Decrease (Instant Delivery)

**Mechanic:** Signal latency reduced to 0 — all signals arrive in the same tick they're sent. Every unit knows everything every other unit broadcasts, instantly.

**Boot log:** `[>>] FIELD_CONDITION: Zero-latency signal propagation. All transmissions arrive same-tick. Speed advantage: nil.`

**Who it helps:** Relay chains (no latency penalty, pure information advantage), command meta (instant orders).
**Who it hurts:** Scout rushes (their speed advantage over relay-chain setup time disappears), minimalist configs (can't exploit latency windows).
**Degenerate risk:** VERY HIGH. Removes the core tension of the signal system. A relay chain with instant delivery has no downside — it's strictly better than not having one. This modifier collapses the strategy space around "who has the best relay chain." **Recommendation: DO NOT SHIP THIS.** It's instructive to include in the catalog to illustrate why some modifiers are destructive.

#### 1E. "Noise Floor" — Ambient Signal Noise

**Mechanic:** Every unit's context window receives 1 random noise entry per tick from the environment. This occupies a context slot with garbage data, effectively reducing useful buffer capacity by 1. Noise entries have no source tag and are identifiable by experienced players — but eviction rules must handle them.

**Boot log:** `[>>] FIELD_CONDITION: Ambient EM interference detected. Context windows receiving 1 noise entry per tick. Configure eviction priorities.`

**Who it helps:** Players with strong eviction configurations, filter skills, compress skills. Rewards context management mastery.
**Who it hurts:** Large-buffer strategies that rely on accumulating context over time (noise fills faster), small-buffer units (a 6-slot scout losing 1 slot to noise every tick is devastating).
**Degenerate risk:** LOW-MEDIUM. Encourages eviction optimization — a skill the game wants to teach. But at higher intensity (2+ noise/tick), small-buffer scouts become unplayable. Cap at 1/tick.

**Intensity dial:** 1 / 2 / 3 noise entries per tick.

#### 1F. "Radio Silence" — Hook Transmission Limit

**Mechanic:** Each unit can transmit at most 1 hook signal per tick (normally unlimited within hook slot count). Forces architectural parsimony — units must choose WHICH signal to send when multiple hooks could fire.

**Boot log:** `[>>] FIELD_CONDITION: Bandwidth cap imposed. Maximum 1 outbound transmission per unit per tick. Prioritize signals.`

**Who it helps:** Minimalist configs (already sending few signals), scout rushes (scouts have only 2 hook slots anyway).
**Who it hurts:** Relay chains (relays with 4 hook slots can normally fire 4 signals/tick, now limited to 1), command agents (6 hook slots, now bottlenecked).
**Degenerate risk:** LOW. Creates interesting priority decisions without eliminating any archetype. Relay chains must choose between forwarding, compressing, or amplifying. Command agents must sequence their orders.

---

### Category 2: Buffer/Context Modifiers

These change the fundamental resource of the game — working memory.

#### 2A. "Cognitive Load" — Buffer Size Reduction

**Mechanic:** All units' context window sizes reduced by 2 slots. Scout drops from 6→4, Relay from 12→10, Command from 14→12.

**Boot log:** `[>>] FIELD_CONDITION: Memory allocation reduced. All context windows −2 slots. Manage carefully.`

**Who it helps:** Minimalist configs (already operating efficiently with small buffers), eviction-optimized architectures, filter-heavy setups.
**Who it hurts:** Command meta (still has the most slots but the relative advantage shrinks), large-buffer strategies that rely on accumulating diverse context.
**Degenerate risk:** LOW-MEDIUM. At −2, scouts become very fragile (4 slots, 1 noise entry = 3 useful slots). At −4, scouts are unplayable. Keep at −2 max.

**Intensity dial:** −1 / −2 / −3 slots.

#### 2B. "Expanded Memory" — Buffer Size Increase

**Mechanic:** All units' context window sizes increased by 2 slots.

**Boot log:** `[>>] FIELD_CONDITION: Memory allocation expanded. All context windows +2 slots. More room to think.`

**Who it helps:** Command meta (16 slots = massive), relay chains (14 slots = nearly command-tier), noise-flood strategies (more buffer to fill = harder to stun).
**Who it hurts:** Noise flood (harder to overload expanded buffers), stun-lock strategies.
**Degenerate risk:** MEDIUM. Larger buffers generally favor more complex architectures. Could push the meta toward "everyone runs command agents because they have 16 slots now." Pair with EM increase to offset.

#### 2C. "Fragile Memory" — Overload Stun Duration Increase

**Mechanic:** Context overload stun lasts 2 ticks instead of 1. In a one-shot-one-kill game, 2 ticks of stun is almost certainly fatal.

**Boot log:** `[>>] FIELD_CONDITION: Context overload recovery time doubled. 2-tick stun on overflow. Prevention critical.`

**Who it helps:** Noise flood strategies (stun is 2× as punishing), filter-optimized configs (reward for never overloading), minimalist builds (small buffers but tightly managed).
**Who it hurts:** Large-buffer strategies that occasionally accept overload, aggressive relay chains that push signals faster than units can process.
**Degenerate risk:** LOW. Makes context management more important — aligns with the game's educational mission. Noise flood becomes scarier but is still counterable with filters.

#### 2D. "Volatile Memory" — Random Eviction

**Mechanic:** When a context window is full and a new entry arrives, instead of the player's configured eviction priority, a random slot is evicted. Player-configured eviction order is ignored.

**Boot log:** `[>>] FIELD_CONDITION: Memory volatility detected. Eviction order randomized. Context integrity unreliable.`

**Who it helps:** No one specifically — everyone must adapt. Rewards architectures that are robust to information loss.
**Who it hurts:** Precision-eviction architectures that depend on keeping specific high-priority entries.
**Degenerate risk:** MEDIUM-HIGH. Removes a core player skill (eviction configuration). If eviction is random, there's no reason to configure it, which undermines a major design pillar. **Recommendation: Use sparingly, perhaps as a Mission 9 campaign scenario rather than a Gauntlet modifier.** If used in Gauntlet, limit to specific unit types (e.g., only scouts have volatile memory, relays and command agents are unaffected).

---

### Category 3: Perception Modifiers

These change what units can see, directly affecting the information available to feed into context windows.

#### 3A. "Fog Bank" — Perception Range Reduction

**Mechanic:** All units' perception ranges reduced by 1. Scout drops from 5→4, Striker from 2→1, Specialist from 3→2.

**Boot log:** `[>>] FIELD_CONDITION: Atmospheric interference. Perception range −1 for all units. Rely on signals, not eyes.`

**Who it helps:** Relay chains (perception shrinks but signal range doesn't — relay-mediated intelligence becomes essential), stealth configs (harder to detect approaching units).
**Who it hurts:** Scout rushes (scouts see less, local-only strategies weaken), striker swarms (1-tile perception = can only see adjacent enemies = already in kill range = too late for evasion).
**Degenerate risk:** LOW. Strongly rewards communication architecture without eliminating direct strategies. One of the healthiest possible modifiers.

#### 3B. "Clear Skies" — Perception Range Increase

**Mechanic:** All units' perception ranges increased by 1. Scout from 5→6, Striker from 2→3.

**Boot log:** `[>>] FIELD_CONDITION: Atmospheric clarity. Perception range +1 for all units. Everyone sees more.`

**Who it helps:** Scout rushes (6-tile scout perception covers huge area), striker swarms (3-tile perception = earlier engagement decisions), minimalist configs (more local information reduces relay dependency).
**Who it hurts:** Relay chains (their information monopoly weakens when everyone can see more), stealth configs (harder to approach unseen).
**Degenerate risk:** LOW-MEDIUM. At +2, every unit sees so much that relay chains become unnecessary. Cap at +1.

#### 3C. "Thermal Blooming" — Perception Directional Bias

**Mechanic:** Perception cones replace perception circles. Each unit can only perceive in a 180° arc in their facing direction. Units must choose between covering width (broad scan) and covering depth (forward focus). Turning costs 1 tick.

**Boot log:** `[>>] FIELD_CONDITION: Sensor arrays directional. 180° arc forward only. Flanking rewarded.`

**Who it helps:** Flanking strategies, multi-unit coordinated approaches, specialist ambush tactics.
**Who it hurts:** Single-unit scout patrols (blind spots), stationary relay strategies (can't see behind them).
**Degenerate risk:** LOW. Creates a richer spatial game. However, implementation complexity is high — this modifier may require additional pathfinding and facing-direction logic. **Flag as "Season 3+" modifier** — don't ship in the first season.

---

### Category 4: Unit Economy Modifiers

These change production costs and timing, affecting army composition decisions.

#### 4A. "Inflation" — All Costs Increase

**Mechanic:** All unit production costs increase by 50%. Scout 3m→5m, Relay 5m→8m, Striker 8m→12m, Specialist 7m→11m, Command 10m→15m.

**Boot log:** `[>>] FIELD_CONDITION: Material costs inflated +50%. Every unit counts. No waste.`

**Who it helps:** Efficient architectures that do more with fewer units, minimalist configs, early-game rushes (rush before the opponent can afford their army).
**Who it hurts:** Army-diversity strategies (can't afford one of everything), command meta (command agent at 15m is a huge investment), relay chains (multiple relays at 8m each).
**Degenerate risk:** LOW-MEDIUM. Inflation compresses army sizes, which makes each unit's configuration more important — aligns with the game's thesis. But at +100%, only scouts are affordable and the game becomes "scout rush or lose."

**Intensity dial:** +25% / +50% / +100%.

#### 4B. "Surplus" — All Costs Decrease

**Mechanic:** All unit production costs decrease by 25%.

**Boot log:** `[>>] FIELD_CONDITION: Material surplus. All production costs −25%. Field larger armies.`

**Who it helps:** Army-diversity strategies, command meta (command agent more affordable), relay chains (more relay nodes affordable).
**Who it hurts:** Rush strategies (opponent can afford defense faster), minimalist builds (their efficiency advantage matters less when resources are abundant).
**Degenerate risk:** MEDIUM. Cheaper everything means bigger armies, which means more signals, more noise, more overload risk. Could create a "whoever manages the biggest army's context windows best wins" meta that punishes new players. Pair with noise floor to offset.

#### 4C. "Asymmetric Pricing" — Specific Unit Cost Changes

**Mechanic:** One unit type's cost changes significantly. Examples:
- "Relay Sale" — Relays cost 2m instead of 5m (encourages deep networks)
- "Command Tax" — Command agents cost 15m instead of 10m (discourages command meta)
- "Scout Surplus" — Scouts cost 1m instead of 3m (encourages swarm strategies)

**Boot log:** `[>>] FIELD_CONDITION: Market shift. [UNIT TYPE] production cost adjusted to [N]m.`

**Who it helps/hurts:** Depends on which unit is adjusted. This is the most targeted modifier — a precision tool for stressing specific archetypes.
**Degenerate risk:** VARIABLE. "Scout at 1m" could create degenerate mass-scout strategies. "Command at 15m" could make command agents unplayable. Requires careful calibration. Best used as a +/- 25% adjustment to a single unit type, not a 50%+ swing.

#### 4D. "Energy Crisis" — Energy Cost Increase

**Mechanic:** Per-tick energy costs increase by 50%. Scout 1e→2e, Relay 2e→3e, Striker 3e→5e, Command 4e→6e.

**Boot log:** `[>>] FIELD_CONDITION: Power grid strained. Energy consumption +50% per tick. Streamline operations.`

**Who it helps:** Small armies with low aggregate energy draw, efficient production queues.
**Who it hurts:** Large armies (aggregate energy cost becomes unsustainable), command agents (6e/tick is brutal), relay-heavy builds.
**Degenerate risk:** LOW. Energy pressure creates interesting "when to stop building" decisions. Aligns with efficiency optimization.

#### 4E. "Production Cooldown" — Slower Factory Output

**Mechanic:** Factory production interval increases by 50% (if default is every 4 ticks, now every 6 ticks). Fewer units on the field overall.

**Boot log:** `[>>] FIELD_CONDITION: Factory cooldown extended +50%. Each unit must earn its place.`

**Who it helps:** Quality-over-quantity strategies, single-blueprint mastery, pre-placed unit strategies.
**Who it hurts:** Spam strategies, production-queue-diversity approaches, late-game scaling builds.
**Degenerate risk:** LOW. Fewer units = more focus on each unit's configuration. Strongly aligns with the game's design thesis.

---

### Category 5: Terrain/Map Modifiers

These change the spatial environment of the 8×8 board.

#### 5A. "Choke Points" — Corridor Terrain

**Mechanic:** The board has 2-tile-wide corridors with walls. Only 3-4 paths between player base and enemy base. Forces units to encounter each other in narrow spaces.

**Boot log:** `[>>] FIELD_CONDITION: Urban corridor terrain. Limited approaches. Chokepoints decisive.`

**Who it helps:** Striker swarms (narrow corridors = guaranteed contact), relay defense (relays placed at corridor junctions), specialist ambush.
**Who it hurts:** Scout rushes (can't flank), wide-formation strategies.
**Degenerate risk:** LOW. Corridor maps are a well-understood strategy game design. Creates distinct positional play.

#### 5B. "Open Field" — Minimal Cover

**Mechanic:** The board is mostly open with 0-2 obstacle tiles. Maximum sightlines, maximum maneuver space.

**Boot log:** `[>>] FIELD_CONDITION: Open terrain. Maximum visibility. Nowhere to hide.`

**Who it helps:** Scout rushes (wide patrol paths), EM-hunting (clear signal paths), long-range perception.
**Who it hurts:** Stealth configs, ambush strategies, relay positioning (no safe corners for stationary relays).
**Degenerate risk:** LOW. Open maps favor different strategies than corridor maps — cycling between them across seasons creates variety.

#### 5C. "Signal Shadows" — EM-Blocking Terrain

**Mechanic:** Certain tiles block EM detection. Units behind these tiles cannot be detected by EM. Signals can still traverse these tiles, but the transmission's EM emission is blocked.

**Boot log:** `[>>] FIELD_CONDITION: Signal-dampening terrain detected. Certain tiles block EM emissions. Position for stealth.`

**Who it helps:** Relay chains (can place relays behind EM-blocking tiles for silent operation), command meta (command agent hidden behind blocking terrain).
**Who it hurts:** EM-hunting configs (detection coverage has gaps), noise flood strategies (noise doesn't reach units behind blocking terrain).
**Degenerate risk:** LOW. Adds positional depth to EM management. Excellent modifier for teaching spatial signal thinking.

#### 5D. "Shifting Terrain" — Dynamic Board Changes

**Mechanic:** Every 10 ticks, 2-3 tiles change type (passable↔impassable, normal↔EM-blocking). The board reshapes during battle.

**Boot log:** `[>>] FIELD_CONDITION: Tectonic instability. Terrain shifts every 10 ticks. Adapt or be trapped.`

**Who it helps:** Adaptive architectures, command meta (can reroute around terrain changes), mobile units.
**Who it hurts:** Static relay networks (relay could become walled off), defensive positional strategies.
**Degenerate risk:** LOW-MEDIUM. Dynamic terrain creates unpredictability that rewards robustness. But if terrain shifts isolate a player's relay network, the game could feel unfair. Terrain shifts should never block the last path between player base and enemy base.

---

### Category 6: Combat Modifiers

These change the one-shot-one-kill combat model.

#### 6A. "Shielded" — First Hit Immunity

**Mechanic:** Each unit survives the first adjacent-striker contact, consuming a shield. The second contact kills. Effectively doubles survivability.

**Boot log:** `[>>] FIELD_CONDITION: Emergency shields active. First contact absorbed. Second contact lethal.`

**Who it helps:** Scout rushes (scouts survive one engagement), relay chains (relays get one reprieve), aggressive positioning.
**Who it hurts:** Striker swarms (need two contacts instead of one = twice as many strikers needed), one-shot ambush strategies.
**Degenerate risk:** HIGH. Fundamentally changes the combat economy. In a one-shot-one-kill game, adding shields turns it into a two-shot game — a different game. **Recommendation: Campaign scenario only, not a Gauntlet modifier.** The one-shot model is too central to the game's identity to modify competitively.

#### 6B. "Kill Zone" — Extended Strike Range

**Mechanic:** Strikers can eliminate targets at range 2 (diagonal or orthogonal) instead of only adjacent.

**Boot log:** `[>>] FIELD_CONDITION: Striker engagement range extended to 2 tiles. Distance kills.`

**Who it helps:** Striker swarms (strikers become terrifying area denial units), defensive positioning.
**Who it hurts:** Scout rushes (scouts die from 2 tiles away), relay positioning (stationary relays are easier to pick off).
**Degenerate risk:** HIGH. Range-2 strikes would dominate the meta — a single striker controls 12 tiles instead of 4. **Recommendation: DO NOT SHIP.** Too distortive.

#### 6C. "Mutual Destruction" — Simultaneous Kill

**Mechanic:** When a striker eliminates a target, if the target was also a striker, both die. Mutual destruction on striker-vs-striker contact.

**Boot log:** `[>>] FIELD_CONDITION: Mutual destruction protocol active. Striker-vs-striker contact = both eliminated.`

**Who it helps:** Non-striker strategies (if your opponent commits strikers, they lose them in contact with yours — neither side benefits from pure striker builds).
**Who it hurts:** Striker swarm (strikers trade 1-for-1 instead of killing and surviving).
**Degenerate risk:** LOW. Actually healthier than default for some metas — prevents "whoever has more strikers wins" dominance. Encourages mixed armies.

---

### Category 7: Information Warfare Modifiers

These change the adversarial information landscape.

#### 7A. "Channel Interception" — Enemy Can Read Channel Names

**Mechanic:** The opponent can see channel names of intercepted signals (via EM detection). Channel naming becomes an intelligence leak.

**Boot log:** `[>>] FIELD_CONDITION: Signal headers exposed. Channel names visible in intercepted transmissions. Name accordingly.`

**Who it helps:** Players who use coded/obfuscated channel names, EM-hunting configs (intercepted signals now reveal intent), intelligence-focused strategies.
**Who it hurts:** Players with descriptive channel names ("threat-alert", "flank-left" — these names reveal strategy), casual players who haven't thought about channel naming security.
**Degenerate risk:** LOW. Creates a fun metagame around channel naming. Introduces information security concepts. Excellent modifier for advanced seasons.

#### 7B. "Ghost Signals" — Phantom Channel Activity

**Mechanic:** Each channel has a 20% chance per tick of generating a fake signal that appears to be a real transmission when detected via EM. The fake signal doesn't actually deliver to any unit — it's purely an EM deception layer.

**Boot log:** `[>>] FIELD_CONDITION: Phantom signals detected in EM spectrum. 20% of intercepted signals are ghosts. Trust nothing.`

**Who it helps:** Relay chains (their real signals are camouflaged by ghosts), hook-heavy architectures.
**Who it hurts:** EM-hunting configs (can't distinguish real from fake signals), noise flood strategies (the environment is already noisy).
**Degenerate risk:** LOW. Weakens EM-hunting without eliminating it. Adds uncertainty to the intelligence game.

#### 7C. "Signal Decay" — Context Entry Aging

**Mechanic:** Context entries older than 5 ticks automatically evict (regardless of player configuration). Information has a shelf life.

**Boot log:** `[>>] FIELD_CONDITION: Data volatility increased. Context entries expire after 5 ticks. Fresh intelligence only.`

**Who it helps:** Architectures that produce fresh signals frequently, fast-loop relay chains, scout-heavy builds (scouts produce new observations constantly).
**Who it hurts:** Accumulation strategies that rely on building up a rich context picture over many ticks, command agents that need historical data for pattern recognition.
**Degenerate risk:** LOW-MEDIUM. At 5 ticks, most context entries are still useful. At 3 ticks, the modifier becomes too punishing for deep architectures. Floor at 5 ticks.

**Intensity dial:** 8 / 5 / 3 tick expiry.

#### 7D. "Pre-Filled Noise" — Starting Context Contamination

**Mechanic:** All units begin battle with 50% of their context window pre-filled with noise entries. Players must evict the noise before useful data arrives.

**Boot log:** `[>>] FIELD_CONDITION: Residual interference in context windows. 50% pre-filled with noise. First priority: clean house.`

**Who it helps:** Filter-skilled architectures, compress-skilled relays, eviction-optimized configs.
**Who it hurts:** Small-buffer units (scout with 3 noise entries in 6 slots = barely functional), architectures that rely on clean startup.
**Degenerate risk:** LOW. Creates an interesting "first 3 ticks" mini-game where players race to clear noise. Rewards preparation and eviction skill.

---

### Category 8: Meta-Level Modifiers

These change the rules of the game at the architectural level — the most dangerous and the most interesting.

#### 8A. "Hook Slot Tax" — Reduced Hook Slots

**Mechanic:** All units lose 1 hook slot. Scout/Striker from 2→1, Relay from 4→3, Command from 6→5.

**Boot log:** `[>>] FIELD_CONDITION: Communication bandwidth reduced. Hook slots −1 per unit. Every connection must justify itself.`

**Who it helps:** Minimalist builds (already using few hooks), local-perception strategies.
**Who it hurts:** Relay chains (relays drop from 4→3 hooks, losing 25% of their wiring capacity), command meta (6→5 hooks, less coordination range).
**Degenerate risk:** LOW. Forces architectural parsimony. One of the healthiest modifiers — every hook must justify its existence.

#### 8B. "Expanded Wiring" — Increased Hook Slots

**Mechanic:** All units gain 1 hook slot.

**Boot log:** `[>>] FIELD_CONDITION: Communication bandwidth expanded. Hook slots +1 per unit. Wire freely.`

**Who it helps:** Relay chains (5-hook relays = more complex routing), command meta (7-hook command agents = unprecedented coordination), combo architectures.
**Who it hurts:** EM-hunting (more hooks = more signals = harder to track which are important), noise flood (more hooks = more channels to flood).
**Degenerate risk:** MEDIUM. More hooks means more EM emissions, which should self-balance. But if the EM cost isn't sufficient, this just makes relay chains strictly better.

#### 8C. "Locked Skills" — Skill Restriction

**Mechanic:** One specific skill is unavailable this season. Example: "compress" is locked — no unit can use the compress skill. Players must find alternative solutions.

**Boot log:** `[>>] FIELD_CONDITION: [SKILL] firmware incompatible with terrain. Skill unavailable this season.`

**Who it helps:** Architectures that don't use the locked skill, players who've mastered alternative approaches.
**Who it hurts:** Architectures that depend on the locked skill. If compress is locked, relay chains that rely on compression must restructure.
**Degenerate risk:** VARIABLE. Locking "compress" creates a healthy meta-shift (relay chains must use filter instead). Locking "engage" makes strikers useless — catastrophic. **Only lock skills that have clear alternatives.** Compress↔filter, hack↔extract, patrol↔evade.

#### 8D. "Rule Limit" — Maximum Rules Per Blueprint

**Mechanic:** Each blueprint can have at most 3 rules (normally 5+). Forces simpler decision logic per unit.

**Boot log:** `[>>] FIELD_CONDITION: Processing constraints imposed. Maximum 3 rules per blueprint.`

**Who it helps:** Simple, robust architectures, scout rushes (scouts rarely use 5 rules anyway).
**Who it hurts:** Complex conditional architectures, command agents (need many rules for adaptive behavior).
**Degenerate risk:** LOW-MEDIUM. Limits the skill ceiling, which could frustrate expert players. But also creates an interesting "which 3 rules are essential?" design puzzle. Best for early seasons before the meta has fully developed.

---

## The Interaction Matrix

Not all modifier combinations are safe. Some create degenerate states.

### Dangerous Combinations (DO NOT SHIP TOGETHER)

| Combo | Why It's Degenerate |
|-------|-------------------|
| **Ionosphere + Fog Bank** | Signals are slow AND perception is low → units are blind and deaf. Only local-contact strategies work. Collapses strategy space to "striker swarm." |
| **Dead Air + Expanded Wiring** | EM is undetectable AND everyone has more hooks → relay chains have zero cost and maximum capability. Relay-chain dominance. |
| **Cognitive Load + Noise Floor** | Buffers are smaller AND noise fills them → small-buffer units (scouts) are permanently stunned. Scouts become unplayable. |
| **Superconductor + anything** | Zero latency removes the core tension. Don't ship. |
| **Kill Zone + anything** | Range-2 strikers distort everything. Don't ship. |
| **Volatile Memory + Signal Decay** | Eviction is random AND entries expire → context is chaos. No reliable information architecture possible. Both players flail. |

### Synergistic Combinations (Healthy Meta-Shifts)

| Combo | Why It's Healthy |
|-------|-----------------|
| **Thick Atmosphere + Choke Points** | EM is louder AND corridors force encounters → information discipline AND spatial discipline both matter. Rich, multi-axis optimization. |
| **Fog Bank + Hook Slot Tax** | Perception is low AND hooks are limited → every signal must be precise. Rewards mastery of the signal system. "Economy of information" meta. |
| **Inflation + Production Cooldown** | Units are expensive AND slow to produce → every unit configuration must be perfect. "Quality over quantity" season. Strongly teaches the game's core thesis. |
| **Noise Floor + Fragile Memory** | Ambient noise AND 2-tick stun → context management is life-or-death. "Survival season" that pushes eviction and filter skills. |
| **Channel Interception + Ghost Signals** | Channel names leak intelligence BUT 20% of signals are fake → mind games, deception, counter-intelligence. "Spy season." |
| **Pre-Filled Noise + Energy Crisis** | Noise start AND expensive operations → the first 5 ticks determine the match. "Fast start" meta rewarding clean openers. |

---

## Archetype Impact Analysis

How does each modifier affect the six archetypes from the parent analysis (7.09)?

| Modifier | Scout Rush | Relay Chain | Striker Swarm | Command Meta | Noise Flood | Minimalist |
|----------|-----------|-------------|---------------|-------------|-------------|------------|
| 1A Thick Atmosphere | Neutral | **Hurts** (louder) | Neutral | **Hurts** (loudest) | Helps (noise visible) | **Helps** (quiet) |
| 1B Dead Air | Neutral | **Helps** (quiet) | Neutral | **Helps** (quiet) | **Hurts** (noise invisible) | **Hurts** (stealth parity) |
| 1C Ionosphere | **Helps** (local-only) | **Hurts** (slow signals) | **Helps** (local-only) | **Hurts** (slow orders) | Neutral | **Helps** (no relay need) |
| 1E Noise Floor | **Hurts** (small buffer) | Helps (filter skills) | Neutral | Neutral (big buffer absorbs) | Synergy (more noise) | Neutral |
| 1F Radio Silence | Neutral | **Hurts** (1 signal/tick) | Neutral | **Hurts** (1 order/tick) | **Hurts** (can't flood) | **Helps** (few signals) |
| 2A Cognitive Load | **Hurts** (tiny buffer) | Neutral | Neutral | Neutral (still largest) | **Helps** (easier to stun) | Neutral |
| 2C Fragile Memory | **Hurts** (one stun = death) | **Hurts** (overload = 2 ticks) | Neutral | **Hurts** (stun = catastrophic) | **Helps** (stun = more fatal) | **Helps** (never overloads) |
| 3A Fog Bank | **Hurts** (sees less) | **Helps** (signals essential) | **Hurts** (1-tile perception) | Neutral | Neutral | Neutral |
| 4A Inflation | **Helps** (cheap scouts) | **Hurts** (multiple relays expensive) | **Hurts** (expensive strikers) | **Hurts** (15m command) | Neutral | **Helps** (few units) |
| 5C Signal Shadows | Neutral | **Helps** (hidden relays) | Neutral | **Helps** (hidden command) | **Hurts** (noise blocked) | Neutral |
| 7A Channel Intercept | Neutral | **Hurts** (names leak) | Neutral | **Hurts** (names leak) | **Helps** (noise names meaningless) | **Helps** (few channels) |
| 7C Signal Decay | **Helps** (fresh observations) | Hurts (accumulation limited) | Neutral | **Hurts** (historical data expires) | Neutral | Neutral |
| 8A Hook Slot Tax | Neutral | **Hurts** (fewer wires) | Neutral | **Hurts** (fewer orders) | **Hurts** (fewer flood sources) | **Helps** (already minimal) |

### Reading the Matrix

A healthy season modifier should have a mix of "Helps" and "Hurts" across archetypes, with no archetype getting all-Helps or all-Hurts. The matrix reveals:

- **Minimalist configs** benefit from most modifiers because constraints favor efficiency. This is intentional — minimalism should be a viable competitive strategy.
- **Command meta** is hurt by most modifiers because it's the highest-cost, highest-complexity strategy. Modifiers naturally stress-test the most elaborate architectures.
- **Scout rush** is helped by economy modifiers but hurt by perception/buffer modifiers — balanced.
- **Relay chains** are helped by perception reductions but hurt by signal constraints — balanced.

The matrix suggests that **no single modifier creates a monoculture** — every modifier opens new viable strategies while closing others.

---

## Season Template Design

A season should include 1 PRIMARY modifier (high impact, defines the season's identity) and 1 SECONDARY modifier (moderate impact, adds texture). Maximum 2 active modifiers per season.

### Example Season Builds

**Season 1: "The Quiet War"**
- Primary: 1A Thick Atmosphere (EM range +2)
- Secondary: 3A Fog Bank (perception −1)
- Identity: Information discipline. Signals are loud, eyes are dim. Relay chains are visible beacons. Scouts can't see far. The meta rewards stealth and precision signaling.
- Expected meta: Minimalist and filtered-relay architectures rise. Command meta must add EM-reduction measures. Scout rushes must coordinate more carefully.

**Season 2: "The Austerity"**
- Primary: 4A Inflation (+50% costs)
- Secondary: 4E Production Cooldown (+50% interval)
- Identity: Every unit is precious. Small, meticulously configured armies. Quality over quantity. The "Factorio efficiency run" season.
- Expected meta: 3-4 unit armies with deep configurations. Command agents become luxury purchases. Scout-relay pairs as efficient minimal architectures. Rush strategies try to win before the opponent builds anything.

**Season 3: "The Spy Game"**
- Primary: 7A Channel Interception
- Secondary: 7B Ghost Signals (20% fake)
- Identity: Information warfare. Channel names are intelligence. EM detection reveals intent. But 20% of what you hear is fake. Counter-intelligence season.
- Expected meta: Coded channel names, deception-optimized architectures, EM-hunting with ghost-filtering. Players learn to distrust intercepted signals.

**Season 4: "The Crucible"**
- Primary: 2C Fragile Memory (2-tick stun)
- Secondary: 1E Noise Floor (1 noise/tick)
- Identity: Context management is survival. Noise fills your buffers. Overload means death. Filter and eviction mastery season.
- Expected meta: Filter-heavy architectures dominate. Noise flood becomes terrifying. Minimalist builds with tight eviction rules. Command agents must be carefully protected from overload.

**Season 5: "The Bottleneck"**
- Primary: 1F Radio Silence (1 transmission/tick)
- Secondary: 8A Hook Slot Tax (−1 hook slots)
- Identity: Every signal must justify itself. Relay chains are throttled. Command agents must sequence orders. "Say less, mean more."
- Expected meta: Simple, direct strategies rise. Relay chains that use compress to pack more information into fewer signals. Minimalist builds shine. Hook priority becomes a critical skill.

---

## Player Journeys

#### Journey: Mika, 14, Manila — First Gauntlet Season Transition

**Context:** Mika completed the campaign last month and has been playing her first Gauntlet season with a relay-chain architecture (2 relays, 2 scouts, 1 striker produced from factory). She's Silver tier, proud of her "web of awareness" design. Season 2 "The Austerity" just started.

**Minute 0:00 — The Boot Log**
The campaign map darkens. A wave of gold light sweeps across the Philippine archipelago. Mika sees the boot log scroll in the terminal panel at the bottom of her screen:
```
[>>] SEASON_SHIFT — Environmental Parameters Updated
    Unit production costs: +50%
    Factory interval: +50%
    Your deployed config is active. Match 1 begins in 3:00.
```
Mika's eyes widen. She mentally recalculates: her 2 relays now cost 16m instead of 10m. Her full army costs 29m instead of 19m. She can barely afford one relay before the first enemy wave.

**Minute 0:30 — The Panic Redesign**
She opens the Plan screen. The production queue conveyor belt shows her usual build: Scout → Relay → Scout → Relay → Striker. The cost preview beneath each icon has turned amber — the total exceeds her starting resources. She drags the second relay off the conveyor. Then reconsiders — without two relays, her "web" architecture has a dead zone. She drags the second relay back and removes the striker instead. "I'll produce the striker later, when I can afford it."

**Minute 2:00 — The First Austere Match**
The sealed watch begins. Mika's factory produces a scout on tick 4 (normally tick 3 — the production cooldown adds 2 extra ticks). The scout moves into position but there's no relay yet to report to. Tick 8: the first relay appears. The scout has been patrolling blind for 4 ticks. By tick 12, two enemies are already past the scout's position. Mika watches, hands on cheeks, as her delayed army scrambles to respond. She loses. The match lasted 34 ticks.

**Minute 4:00 — The Inspector Revelation**
In the Inspector, she scrubs to tick 8 — the moment her first relay came online. She can see the gap: 4 ticks of no signal intelligence. She opens the channel metrics panel and sees the latency budget: her "command-net" channel was −4 margin at tick 10 (signal arrived 4 ticks after the threat appeared). She realizes: in an austerity season, she needs an architecture that works with fewer units from earlier ticks. She considers: what if the scout has more rules to act independently, without waiting for relay instructions?

**Minute 6:00 — The Architectural Shift**
Mika reconfigures her scout blueprint. Instead of "report and wait for orders," she adds rules: "if enemy adjacent, evade north" and "if no signal received in 3 ticks, patrol clockwise." The scout becomes semi-autonomous. She doesn't know it yet, but she's discovering the "resilient local" archetype — units that function without relay support. The austerity modifier taught her something the campaign's abundant resources never did.

**Minute 8:00 — The Satisfying Win**
Match 2. The semi-autonomous scout survives the early ticks. The delayed relay comes online at tick 8 and immediately compresses 4 ticks of buffered observations into one signal. The single striker, produced at tick 16 (expensive but worth it), receives a compressed intelligence briefing and eliminates 3 enemies in sequence. Mika wins with 3 units total. She grins. "That was the best three robots I ever built."

**UI Annotations:**
- **Cost preview:** amber highlight on conveyor belt icons when total exceeds resources, red when exceeds by >50%
- **Season indicator:** small gold badge in top-right of Plan screen showing "S2: AUSTERITY" with tooltip listing active modifiers
- **Production timeline:** vertical dotted lines on the sealed watch tick clock showing when each unit will be produced, shifted right by the cooldown modifier

---

#### Journey: Derek, 31, Portland, DevOps Engineer — Diamond Tier, Season Transition Adaptation

**Context:** Derek has been Diamond for 2 seasons running a sophisticated command-meta architecture (command agent + 2 relays + specialist + 2 strikers). He's known on the Workshop for his "Orchestrator" config. Season 3 "The Spy Game" just dropped.

**Minute 0:00 — The Intelligence Briefing**
Derek reads the season boot log with professional interest:
```
[>>] SEASON_SHIFT — Environmental Parameters Updated
    Channel interception: ACTIVE. Channel names visible in intercepted signals.
    Ghost signals: 20% of intercepted EM signals are phantoms.
```
He immediately opens his config. His channel names: "threat-alert", "flank-request", "command-override", "position-update", "retreat-signal", "resource-check". Every name reveals his architecture's intent. "Well, that's a problem."

**Minute 1:00 — The Renaming Session**
Derek renames all channels. "threat-alert" becomes "ch-7a". "flank-request" becomes "ch-3f". "command-override" becomes "ch-9x". He types each name deliberately, watching the channel map panel update. The read-only channel summary now shows six cryptic alphanumeric codes instead of descriptive names. He feels like he's setting up a classified communication network.

Then he reconsiders. His opponent will also rename their channels. The ghost signals mean 20% of what he intercepts is fake. He needs an EM-hunting scout that can distinguish real patterns from noise. He adds a rule to his scout: "if same channel detected 3× in 5 ticks, classify as real." This filters ghosts (which are random) from genuine repeated transmissions.

**Minute 3:00 — The Counter-Intelligence Architecture**
Derek realizes the meta has shifted. His command agent's 6 hooks are now an intelligence liability — 6 named channels, all interceptable. He redesigns: the command agent communicates through a single relay that aggregates and re-broadcasts on one channel. The relay is the "proxy server" — the command agent's fingerprint is hidden behind the relay's single outbound channel. His DevOps instincts fire: "This is literally a reverse proxy."

**Minute 5:00 — The First Spy Game Match**
Sealed watch. Derek watches his scout detect enemy EM signals. The channel names are... "ch-2b", "ch-4e", "ch-1a". The opponent also renamed. But Derek's scout fires the "3× in 5 ticks" rule and identifies two persistent real channels and one intermittent ghost. The real channels' timing pattern suggests a relay-chain architecture (regular cadence = relay forwarding). Derek's command agent receives this intelligence and reroutes the specialist to hack the suspected relay position. The hack succeeds — the opponent's relay chain goes dark. Derek wins.

**Minute 7:00 — The Workshop Post**
Derek opens the Workshop and uploads his "Proxy Orchestrator v2" config with the note: "Season 3 adaptation. Reverse-proxy relay hides command fingerprint. Ghost-filtering scout rule included. GLHF." Within 24 hours, 47 imports. The community discusses whether "3× in 5 ticks" is the right ghost-filtering threshold or if "2× in 3 ticks" is more aggressive. The Spy Game meta is evolving.

**UI Annotations:**
- **Intercepted signal overlay:** when EM detects an enemy signal, a faint dashed line appears on the board with the channel name in small monospace text, ghost signals pulse with a slight transparency flicker
- **Channel rename:** inline edit on channel map panel, with live validation (warns if name duplicates an existing channel)
- **Ghost confidence indicator:** in Inspector, intercepted signals show a confidence badge (●●● for 3+ detections = likely real, ○○● for 1 detection = possibly ghost)

---

#### Journey: Abuela Rosa, 62, Retired Nurse — Gold Tier, Learning from Season Modifiers

**Context:** Rosa plays Robot Uprising because her grandchildren told her it's "like managing a hospital ward." She reached Gold tier with a simple but reliable architecture: 3 scouts, 2 strikers, 1 relay. She names her channels after hospital departments. Season 4 "The Crucible" just started — context management is now life-or-death.

**Minute 0:00 — The Ominous Boot Log**
```
[>>] SEASON_SHIFT — Environmental Parameters Updated
    Context overload stun: 2 ticks (was 1).
    Ambient noise: 1 entry per tick per unit.
    Handle with care.
```
Rosa reads "2-tick stun" and remembers when her scout got stunned last season — it was annoying but survivable. Two ticks though? In a one-shot-one-kill game, two ticks of standing still means death.

**Minute 0:45 — The Filter Priority Session**
Rosa opens her scout blueprint. The context config panel shows 6 slots. She mentally calculates: 1 noise entry per tick, 6 slots, if she doesn't evict noise... full in 6 ticks. Stunned for 2 ticks. Dead. She needs eviction rules that aggressively remove noise.

She sets eviction priority: "evict oldest → evict untagged → evict noise." Then reconsiders — what if useful observations are older than noise? She reverses: "evict noise first → then oldest." She's configuring a triage system, and the hospital metaphor clicks: "noise is the patient who isn't really sick — send them home to make room for emergencies."

**Minute 2:00 — The First Crucible Match**
Sealed watch. Rosa watches her scouts patrol. At tick 3, she notices the context bars beneath each scout — they're filling faster than usual. The amber glow appears at tick 5 instead of the usual tick 9. One scout hits red at tick 7 — but instead of stunning, the eviction rule fires and the noise entry disappears. The context bar drops back to amber. Rosa exhales. "The filter is working."

Then her relay's context bar goes red. The relay has 12 slots, but it's receiving signals from 3 scouts PLUS 1 noise per tick. At tick 10, the relay overloads. The 2-tick stun kicks in — the relay's tile shows a sparking, jittering animation, more violent than Rosa remembers. The sparkle lasts two full ticks. During those two ticks, the relay can't forward anything. The strikers, waiting for relay intelligence, act blind. One striker walks into an enemy. Dead.

**Minute 4:00 — The Compression Revelation**
In the Inspector, Rosa clicks the relay and examines its context window at tick 10. 12 slots, all full: 9 scout observations (3 scouts × 3 ticks of accumulation) + 3 noise entries. The noise entries are marked with a static-pattern icon. Rosa realizes: her relay needs the "compress" skill — it can compress 3 redundant scout observations into 1 summary, freeing 2 slots. She also adds "filter" to discard noise entries before they reach the relay's context.

She reconfigures. The relay now compresses incoming scout data and filters noise. The effective capacity jumps from 12 usable slots to 12 — no noise, compressed observations. She feels clever. She tells her granddaughter: "I taught my relay to do what the head nurse does — summarize the shift report and ignore the noise."

**Minute 6:00 — The Crucible Victory**
Match 2. No overloads. The relay's context bar stays green throughout. The strikers receive clean, compressed intelligence. Rosa wins in 28 ticks — her fastest win ever. The Inspector shows 0 stun events. Rosa takes a screenshot and sends it to her granddaughter: "Zero stuns. Just like a well-run ward."

**UI Annotations:**
- **Noise entry visual:** static-pattern icon (TV snow) in context window inspector, distinct from observation icons (eye) and signal icons (broadcast tower)
- **Stun animation (2-tick):** more violent sparking than 1-tick stun — sustained jitter with intermittent blackout flickers, red overload ring, "XXX" overlaid on unit for duration
- **Eviction animation:** when an eviction rule fires successfully, the evicted entry shrinks and fades with a soft "pff" sound — visible feedback that the filter is working

---

## Sensory Description: The Season Transition

**What it looks like:** The campaign map, normally a steady cyan glow across completed provinces, dims to 30% brightness. The Philippine archipelago silhouette becomes a dark outline against a deeper dark. Then a wavefront of gold light sweeps from the northernmost province (Batanes) southward — each province flares gold as the wave passes, like a sunrise moving across the islands. The wave takes 3 seconds. When it reaches the southern tip, the whole map flares white for 250ms, then resolves with new colors: active season provinces glow with the season's accent color (amber for Austerity, violet for Spy Game, crimson for Crucible). The boot log terminal at the bottom types out the season parameters in monospace, each line appearing with a soft keystroke sound — *tik tik tik tik* — like a teletype. The final line appears in bold: "Your deployed config is active. Match 1 begins in [countdown]."

**What it sounds like:** During the wavefront, a rising kulintang gong tone — a single agung hit that swells from pp to ff over 3 seconds, with sympathetic overtones from the gangsa (flat gongs). At the white flash, a single clean *crack* — the season's breaker switch. Then silence. Then the teletype sounds. The tone is solemn — not celebratory, not threatening. A new environment. Adapt.

**What it feels like (DualSense):** The wavefront is a slow right-to-left sweep across the adaptive triggers — right trigger begins with gentle resistance at 20%, sweeps to left trigger over 3 seconds. At the flash, both triggers lock hard for 250ms then release completely. During the boot log, subtle grip pulses synchronized with each teletype *tik*. The player feels the season arriving physically.

---

## Modifier Intensity Calibration Framework

Each modifier should have 3 intensity levels: **Mild** (noticeable but manageable), **Standard** (requires meaningful adaptation), **Extreme** (fundamentally reshapes the meta). The season designer chooses intensity per modifier.

| Modifier | Mild | Standard | Extreme |
|----------|------|----------|---------|
| 1A Thick Atmosphere | EM +1 tile | EM +2 tiles | EM +3 tiles |
| 1C Ionosphere | 1.5 ticks/hop | 2 ticks/hop | 3 ticks/hop |
| 1E Noise Floor | 1 noise every 2 ticks | 1 noise/tick | 2 noise/tick |
| 2A Cognitive Load | −1 slot | −2 slots | −3 slots |
| 2C Fragile Memory | 1.5-tick stun (round up) | 2-tick stun | 3-tick stun |
| 3A Fog Bank | Perception −1 | Perception −2 | Perception −3 |
| 4A Inflation | +25% cost | +50% cost | +100% cost |
| 4E Production Cooldown | +25% interval | +50% interval | +100% interval |
| 7C Signal Decay | 8-tick expiry | 5-tick expiry | 3-tick expiry |
| 8A Hook Slot Tax | −1 slot | −1 slot + no 1-slot units may transmit | −2 slots |

**First season recommendation:** Use Mild intensity for both modifiers. Players are learning the Gauntlet; don't crush them. Escalate to Standard by Season 3, Extreme never before Season 5.

---

## The "Degenerate Detector" Metric

Post-season, the development team should monitor three metrics to detect degenerate modifiers:

1. **Archetype diversity index:** Shannon entropy of archetype distribution in the Gauntlet population. Target: >1.5 bits (roughly 3+ viable archetypes). Below 1.0 = monoculture, modifier is degenerate.
2. **Match duration distribution:** Average match length should be 25-50 ticks. If average drops below 20 (rush dominance) or rises above 60 (defensive stalemate), the modifier is distorting.
3. **Win rate variance:** No archetype should have >60% win rate across 1000+ matches. If one archetype exceeds this, it's dominant and the modifier is enabling it.

These three metrics together form the "Season Health Score" — a composite that automatically flags degenerate modifiers for the next season's design.

---

## Discovered Sub-Aspects

- **7.09a-i — Mid-season "field condition" micro-modifiers:** Weekly rotating mild modifiers within a season (StarCraft 2 weekly mutation model adapted for Robot Uprising); how micro-modifiers interact with the season's primary modifier; community excitement from the weekly unknown
- **7.09a-ii — Player-chosen modifier mode (Hades Pact model):** Optional custom Gauntlet mode where players choose their own modifiers from the catalog; Heat-style difficulty currency; separate leaderboard per Heat level; does player choice undermine the shared-experience benefit of designer-chosen seasons?
- **7.09a-iii — Modifier preview and pre-season preparation window:** How much advance notice do players get before a season starts? "Weather forecast" showing next season's modifiers 1 week early; the pre-season preparation meta; comparable to TFT PBE set previews
- **7.09a-iv — Modifier interaction testing framework:** Systematic method for verifying that modifier combinations don't create degenerate states; automated simulation of 1000+ matches per combination; the "season QA playtest" as a development process
- **7.09a-v — Community-proposed modifier pipeline:** Community votes on modifier candidates for future seasons; "modifier workshop" where players propose and debate new modifiers; community ownership of the competitive environment

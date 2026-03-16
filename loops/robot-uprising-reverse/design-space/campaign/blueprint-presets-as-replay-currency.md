# Blueprint Presets as Replay Currency

**Aspect:** 5.09a — Blueprint presets as replay currency
**Category:** Campaign / Replayability
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

Into the Breach's squads are one of the most effective replay incentives in tactical games. Each squad reframes every puzzle on the same boards. The Rift Walkers push enemies into each other; the Rusting Hulks blanket the map in smoke; the Frozen Titans lock enemies in ice. Same missions, completely different geometry. The unlock system (achievement coins → squad purchases) creates a drip-feed of novelty across 20-40 hours.

Robot Uprising faces the same structural challenge as Into the Breach: **10 fixed missions, same board geometry, deterministic execution.** The missions don't change. The player changes. But "the player gets better at the same tools" is a Zachtronics-shaped plateau — it produces mastery, not desire. Desire requires novelty, and novelty in a fixed-content game means **giving the player different tools to solve the same problems.**

Blueprint presets are Robot Uprising's answer to squads. A preset is a **pre-designed set of blueprints, channel wiring, and production queue** that represents a coherent architectural philosophy. Where a player's first campaign teaches them to build from scratch (bottom-up), a preset hands them a complete system (top-down) and says: "Now make *this* work across all 10 missions."

The core insight: **presets don't make the game easier. They make it different.** The Stealth Doctrine doesn't give you stronger units — it gives you units that can't talk loudly. The Swarm doesn't give you better buffers — it gives you twelve cheap units with 4-slot context windows. Every preset is a constraint that transforms the solution space.

---

## The Preset Library

### Naming Convention: "Doctrines"

Presets are called **Doctrines** in player-facing UI. This word lands in the military-philosophical sweet spot — it implies a way of thinking, not just a loadout. "The Stealth Doctrine" sounds like a strategy; "Stealth Preset" sounds like a dropdown option.

Each Doctrine includes:
- **3-5 pre-configured blueprints** (unit type, skills, rules, hooks, context config)
- **Named channels** already wired between blueprints
- **A default production queue** (conveyor belt pre-loaded)
- **A Doctrine card** in the Blueprint Codex (portrait, description, designer quote, difficulty rating)

The player can modify everything. Doctrines are starting points, not straitjackets. But the modifications stack against the Doctrine's identity — if you rip out all the hooks on a Stealth Doctrine config, you're no longer playing stealth. The game knows; the debrief can note: "Doctrine adherence: 35%."

### The Starting Seven

| # | Doctrine Name | Philosophy | Core Constraint | Key Units | Difficulty |
|---|---------------|-----------|-----------------|-----------|------------|
| 1 | **The Standard** | Balanced combined arms | None (player's own campaign build) | All 5 types | ★☆☆☆☆ |
| 2 | **The Stealth Doctrine** | Minimal emissions, maximum perception | Hook slots capped at 1 per blueprint; no broadcast channels | 3 Scouts, 1 Specialist, 1 Striker | ★★★☆☆ |
| 3 | **The Swarm** | Quantity over quality | 12 units max; all 4-slot buffers; no Command agent | 6 Scouts, 4 Strikers, 2 Relays | ★★☆☆☆ |
| 4 | **The Singleton** | One mind, total control | 1 Command agent + 2 Relays; no direct combat units | 1 Command (14 buffer), 2 Relays | ★★★★★ |
| 5 | **The Chorus** | Dense channel mesh, maximum coordination | Every unit publishes to at least 2 channels | 2 Relays, 2 Scouts, 1 Striker | ★★★☆☆ |
| 6 | **The Firewall** | Defensive information architecture | All units run `filter` as primary skill; eviction set to aggressive | 3 Relays, 1 Scout, 1 Specialist | ★★★★☆ |
| 7 | **The Courier** | Relay chain as primary weapon | Scouts tag, Relays compress and forward, Strikers execute on compressed intel | 2 Scouts, 3 Relays, 1 Striker | ★★★☆☆ |

### Doctrine Card Design

Each Doctrine in the Blueprint Codex is a vertical card (think Slay the Spire character select). The card shows:

- **Top third:** A stylized isometric diorama of the Doctrine in action — the Stealth Doctrine shows dark silhouettes moving through Siquijor bioluminescent jungle, no signal lines visible; the Swarm shows a flood of small cyan dots swarming across Cebu's neon grid.
- **Middle third:** Doctrine name in bold monospace, a one-sentence philosophy in italics, and the constraint summary as bullet points with amber warning icons.
- **Bottom third:** Unit composition as small blueprint cards in a horizontal strip, showing which types and how many. Locked cards are dark silhouettes with a padlock icon. Difficulty stars below.

The cards are arranged on a horizontal carousel. Swiping left/right moves between Doctrines. The current Doctrine card is centered and fully visible; adjacent cards are partially visible and desaturated. Selecting a Doctrine plays a short audio sting — a different tone for each (Stealth: low hum with a sharp cutoff; Swarm: rising chatter of many small pings; Singleton: a single deep resonant chord).

---

## Unlock System

### The Achievement-Coin Model (Into the Breach Pattern)

Every mission completion at a threshold (e.g., under N ticks, zero unit losses, specific constraint met) earns **Circuit Tokens** — small hexagonal chips that appear in the debrief screen, sliding into a persistent counter in the top-right. Circuit Tokens are the universal unlock currency.

Doctrine costs:
| Doctrine | Cost | Unlock Condition |
|----------|------|-----------------|
| The Standard | Free | Complete campaign |
| The Swarm | 3 tokens | Available after first campaign completion |
| The Chorus | 5 tokens | Available after first campaign completion |
| The Stealth Doctrine | 5 tokens | Requires Mission 8+ completion |
| The Courier | 7 tokens | Requires Mission 9+ completion |
| The Firewall | 7 tokens | Requires 2 Doctrines already unlocked |
| The Singleton | 10 tokens | Requires all other Doctrines unlocked |

### The "Discovery" Unlock (Hades Pattern)

Alternative: Doctrines aren't purchased. They're **discovered** through play.

The player encounters the Doctrine's philosophy organically. Completing Mission 7 with zero relay deaths might trigger a boot log entry: `> DOCTRINE RECOVERED: "THE FIREWALL" — A predecessor build focused on defensive filtering. Archive loaded to Codex.` The Doctrine appears in the Blueprint Codex as a recovered artifact — something the AI's predecessor built in a previous uprising cycle.

This is narratively richer than a shop. The Doctrines aren't rewards — they're archaeological finds. The AI discovering its own past configurations. The Predecessor narrator could comment: "I tried this once. It worked. Barely."

### The "Earn By Playing" Unlock (Slay the Spire 2 Pattern)

Doctrines unlock automatically based on playstyle signals. If the player consistently builds low-emission architectures (few hooks, small broadcast radii), the game offers the Stealth Doctrine as a formalized version of what they're already doing. "It looks like you've been building this way. Here's a Doctrine that commits to it fully."

This is the most player-respecting model — it says "I noticed what you like doing" rather than "spend coins to access content."

---

## How Doctrines Change Gameplay

### The Constraint Cascade

Each Doctrine constrains one axis of the design space, which cascades through every system:

**The Stealth Doctrine** constrains *emissions*:
- Max 1 hook slot per blueprint → units can only subscribe to 1 channel each
- No broadcast-type hooks allowed → no `amplify` skill on Relays
- This means: Scouts must act autonomously (no relay chain to report to); Strikers must be pre-positioned (no real-time targeting updates); the information architecture is a sparse star topology, not a mesh
- Every mission becomes: "How do I solve this with minimal communication?" The answer is different every time

**The Swarm** constrains *buffer depth*:
- All units have 4-slot context windows (minimum viable)
- 12 units on field simultaneously → enormous production queue management
- This means: No unit can hold complex multi-source intelligence; every unit overloads easily; the player must design for disposability — units that do one thing, get stunned, get killed, and are immediately replaced
- Every mission becomes: "How do I solve this with waves of simple agents?" The answer looks nothing like a 5-unit combined-arms approach

**The Singleton** constrains *unit count*:
- 1 Command agent (14-slot buffer, 6 hook slots) + 2 Relays
- No Scouts, no Strikers, no Specialists — the Command agent must do everything through its skills (reassign, reroute, prioritize)
- This means: The Command agent is simultaneously perceiving (through Relay-forwarded signals), deciding, and acting (through skill reassignment that creates phantom actions). The player is designing a single brain
- Every mission becomes: "Can one agent with perfect information architecture beat what five agents with distributed intelligence solved?"

### The Meta-Puzzle

Doctrines create a meta-puzzle above the mission-level puzzles: **which Doctrine can I clear all 10 missions with?** Some Doctrines excel at early missions (the Swarm trivializes Mission 3's flanking scenario through sheer numbers) but struggle at late missions (the Swarm's 4-slot buffers can't handle Mission 9's information warfare). Other Doctrines are terrible early (the Singleton can't even damage an enemy until Mission 6 introduces the Command agent) but dominate late (Mission 10's boss has one critical vulnerability that a single omniscient Command agent exploits perfectly).

This is exactly Into the Breach's squad dynamic — the Frozen Titans crush maps with chokepoints but struggle on open terrain. The meta-game is: "Which squad for which island?" Robot Uprising's version: "Which Doctrine for which mission sequence?"

---

## Player Journeys

### Journey: Marcus, 34, DevOps Engineer

**Context:** Completed the campaign two weeks ago. Built a relay-heavy combined-arms architecture. Recently unlocked The Stealth Doctrine with Circuit Tokens earned from optimizing Missions 5-7. Starting a Stealth Doctrine replay of the full campaign.

**Minute 0:00 — Doctrine Selection**
Marcus opens the Blueprint Codex. The horizontal carousel shows seven cards. Three are illuminated; four are dark silhouettes with padlocks. He swipes to The Stealth Doctrine. The card fills the screen: a diorama of dark shapes slipping through Siquijor's glowing mangroves, no signal lines visible. Below the art, in monospace: **THE STEALTH DOCTRINE — "What they can't hear, they can't kill."** The constraint summary reads:

> - Max 1 hook slot per blueprint
> - No broadcast channels
> - EM emission budget: 30% of standard

He taps SELECT. A low hum plays, then cuts sharply to silence. The boot log initializes with a new header line: `> DOCTRINE: STEALTH — Emission ceiling active. Hook bus restricted.`

**Minute 0:30 — Mission 1 (Ifugao Rice Terraces)**
The workbench loads with the Doctrine's pre-built blueprints in the slot panel on the right. Three Scout blueprints and one Striker. Each has exactly one hook slot — a single dashed outline where normally there'd be two or more. The channel map panel (auto-generated, read-only) shows almost nothing: one channel called `whisper` connecting two scouts.

Marcus recognizes Mission 1's board — the same 8x8 Ifugao terraces from his first campaign. But his tools are completely different. Last time he built a relay chain that broadcast enemy positions across the whole field. This time his scouts can barely talk to each other.

He opens SCOUT-A's blueprint. The context config panel shows a 6-slot window with `listen: [whisper]` and `ignore: [everything else]`. The rules panel has two entries: `IF enemy_in_perception THEN tag` and `IF tagged_enemy_count > 2 THEN evade`. Simple. Autonomous. No relay to report to.

He hits EXECUTE. The sealed watch begins.

**Minute 1:30 — Sealed Watch**
The isometric Ifugao board appears. Rice terraces shimmer with server-farm heat distortion. Three scouts spawn from the player base, spreading out in a triangle pattern. The tick clock fires. Tick 1: scouts move. Tick 2: SCOUT-A spots an enemy at D4. In his first campaign, this triggered a relay chain — green dashed lines cascading across the board. This time: nothing. SCOUT-A tags the enemy silently. No signal. No line. No emission. The board is quiet.

Tick 3: SCOUT-B independently spots another enemy at F6. Also tags silently. The two scouts don't know about each other's findings. Marcus watches, hands off the keyboard, realizing the fundamental difference: **information stays local.** Each scout is an island.

Tick 5: the Striker, positioned at C5 by the production queue, sees SCOUT-A's tag at D4 (it's in perception range). It moves to D5. Tick 6: adjacent — kill. The red combat flash. One enemy down. But the enemy at F6? No one near SCOUT-B knows about it. The Striker stays at D5, oblivious.

Marcus leans forward. "Oh. I have to pre-position Strikers near where I *think* scouts will find targets. I can't route them dynamically." He's solving Mission 1 — a mission he already beat — as if it's new.

**Minute 3:00 — Inspector Debrief**
The inspector loads. He clicks SCOUT-B. The context window state shows 4 of 6 slots filled: `[observation: enemy_F6, tick 2]`, `[observation: empty_F7, tick 3]`, `[observation: enemy_G6, tick 4]`, `[observation: empty_E6, tick 5]`. The hook panel is almost empty — one outgoing whisper that was never received because no unit was listening within range.

The decision trace for Tick 6 shows: `Rule matched: IF enemy_in_perception AND no_ally_in_range(2) THEN evade`. SCOUT-B ran away because it saw an enemy and had no backup. In the relay-chain build, SCOUT-B would have called for help. In the Stealth Doctrine, it's on its own.

Marcus drags the timeline scrubber back to Tick 2. He watches the moment SCOUT-A found its target versus the moment SCOUT-B found its target. Parallel discoveries, no coordination. He mutters: "I need to make my production queue spawn strikers in pairs with scouts. Pre-positioned hit squads."

**Minute 5:00 — Plan Revision**
He modifies SCOUT-A's blueprint: adds a rule `IF enemy_tagged AND no_striker_adjacent THEN hold_position` — don't evade, hold and wait for the paired striker to arrive. He adjusts the production queue: Scout-Striker-Scout-Striker instead of Scout-Scout-Scout-Striker. He hits EXECUTE again.

**Minute 8:00 — Session Summary**
Mission 1 cleared on second attempt. The debrief shows: "Doctrine adherence: 92%. Emissions: 12% of standard." A small amber badge appears on the mission card: a stealth icon. He earned 1 Circuit Token for sub-15-tick completion.

Marcus thinks: "Mission 7 with this Doctrine is going to be insane. How do I coordinate a multi-front battle with zero broadcast?" He's replaying the entire campaign for the third time, and it feels like the first time.

**UI Annotations:**
- **Doctrine card carousel:** Horizontal scroll, center card 100% opacity, adjacent 40%, 2-card peek on each side. Card dimensions: ~300px wide × 450px tall.
- **Hook slot restriction:** Empty hook slots show a red padlock icon instead of the usual dashed outline. Hovering shows tooltip: "Doctrine restriction: max 1 hook slot."
- **Emission budget meter:** New UI element in the top-left of the Plan screen — a horizontal bar showing current EM emission percentage, amber when approaching 30% cap, red when exceeded.
- **Doctrine adherence:** Shown in debrief as a percentage next to the mission stats. Below 50% shows a warning: "Diverged from Doctrine philosophy."

---

### Journey: Priya, 19, Computer Science Student

**Context:** Completed the campaign once. Found it interesting but "not that hard." Heard about The Singleton on a Reddit thread claiming it's "basically impossible." Unlocked it after completing all other Doctrines. Starting her first Singleton run.

**Minute 0:00 — The Card**
The Singleton's Doctrine card is the last one in the carousel. It's darker than the others — deep indigo background, a single massive Command agent icon in the center, two small Relay icons flanking it like attendants. The art shows a lone figure on a hilltop, the landscape below connected by faint pulse lines converging on its position. Five difficulty stars glow red.

She taps SELECT. A single deep chord resonates — sustained, almost ominous. The boot log prints: `> DOCTRINE: SINGLETON — One mind. Total architecture.` Then: `> WARNING: No combat units in loadout. All engagement must be achieved through skill reassignment.`

"No combat units?" She reads the constraint card again. 1 Command agent, 2 Relays. The Command agent has 14 buffer slots and 6 hook slots. Its skills: `reassign`, `reroute`, `prioritize`. No `engage` skill. No `breach` skill. How does it kill anything?

**Minute 0:45 — Mission 1 Reality Check**
The workbench shows three blueprints: COMMAND-PRIME (massive card, 14-slot context window visualization on the left, 6 hook connections radiating outward), RELAY-ALPHA, and RELAY-BETA. The production queue is three icons. Total army: three units.

The board shows enemy scouts at C3 and F6. Her previous campaign had 5 units — scouts to find them, strikers to kill them. Now she has zero strikers. Zero scouts. A Command agent that can't move (stationary) and two Relays that also can't move.

She hovers over the `reassign` skill description: "Target a unit within hook range. Change its active skill for 3 ticks. Costs 2 context slots." But she has no units to reassign skills *to*, except the Relays. She reads the Relay skill list: `compress`, `filter`, `amplify`. None of those kill enemies.

She's stuck. She opens the Blueprint Codex and reads the Singleton strategy guide (a short paragraph included with the Doctrine card): "The Singleton's power is indirect. Reassign creates phantom capabilities. A Relay with a reassigned `tag` skill becomes a tagger. A Relay with a reassigned `engage` skill becomes a striker — briefly. The Command agent doesn't fight. It makes everything else fight."

**Minute 2:00 — The Aha Moment**
"Wait — `reassign` can give a Relay any skill? Including skills that Relays don't normally have?" She tests it: opens COMMAND-PRIME's rule panel, writes `IF enemy_in_relay_perception THEN reassign RELAY-ALPHA engage`. She hovers over the rule — a tooltip confirms: "Relay-Alpha will gain `engage` for 3 ticks. Engage requires adjacency." But Relays are stationary.

She stares at the board. The Relays don't move. The enemies do. She needs enemies to walk *into* relay-adjacent tiles. She needs to predict enemy pathing. She opens the plan screen's tactical map and studies the enemy spawner direction — enemies will path toward her base, which means they'll pass through the center.

She places RELAY-ALPHA at D4 — directly in the enemy path. RELAY-BETA at E5, covering a second lane. COMMAND-PRIME at D6, behind both relays, connected by hooks.

"I'm building a minefield out of normally-harmless relays," she says aloud. "The Command agent is turning them into temporary strikers when enemies walk close enough."

She hits EXECUTE.

**Minute 3:30 — Sealed Watch**
Tick 1: Three units snap to their positions. The board is sparse — just three friendly icons against two enemy scouts. COMMAND-PRIME's context bars show 3 of 14 slots occupied (initial observations).

Tick 2: Enemy at C3 moves to C4. Enemy at F6 moves to E6. COMMAND-PRIME's context bars tick up — signals from both relays reporting enemy positions via the hook mesh.

Tick 3: Enemy C4 → D4. It's adjacent to RELAY-ALPHA. A green signal flash fires from COMMAND-PRIME to RELAY-ALPHA. The `reassign` activates. RELAY-ALPHA's icon flickers — a brief red overlay, the `engage` skill temporarily active. Kill flash at D4. Red combat pulse. RELAY-ALPHA destroys the enemy, then the red overlay fades. It's a Relay again.

Tick 4: Enemy E6 → E5. Adjacent to RELAY-BETA. Another green signal. Another reassign. Another kill. Both enemies eliminated by tick 4 with three stationary units.

Priya grins. "That's disgusting. I love it."

**Minute 5:00 — The Scaling Problem**
Mission 1 was two enemies. Mission 5 has a factory spawning enemies every 3 ticks. She has 1 Command agent and 2 Relays. `Reassign` costs 2 context slots each — that's 4 of 14 slots for two reassigns. After 3 reassigns per relay (3 ticks each, then the skill expires), COMMAND-PRIME's buffer is filling up. By tick 12, it's overloaded. The stun animation plays — sparking, jittering, 1 tick frozen.

The Inspector debrief shows the problem: COMMAND-PRIME's context window is a traffic jam of reassign-cost entries, relay reports, and enemy observations, all competing for 14 slots. The eviction priority discarded the oldest relay report — which was the one telling the Command where to reassign next.

"I need to use `prioritize` to protect the relay reports," she realizes. "And `compress` on the Relays before they forward to Command." Mission 5 with The Singleton is a context window management masterclass.

**Minute 8:00 — The Obsession**
She's three missions into the Singleton run. She hasn't touched the Gauntlet in a week. Each mission is a new puzzle: how does a single brain with two arms solve a problem that five independent agents handled easily? She posts her Mission 3 replay to the community: "The Singleton Mission 3 clear in 11 ticks — no stun, no overload." It gets 200 upvotes.

**UI Annotations:**
- **Reassign skill visualization:** When COMMAND-PRIME uses `reassign`, a golden beam connects it to the target unit. The target's portrait briefly shows the new skill icon in an overlay badge. A 3-tick countdown timer appears below the badge.
- **Stun animation (overload):** Unit sparks with white-blue electrical arcing. The unit's tile flashes amber. The context bar turns solid red. A "OVERLOADED" label appears above the unit for 1 tick.
- **Solo army warning:** If the Plan screen shows fewer than 4 units in the production queue, a small amber notice appears: "Doctrine constraint: limited deployment."

---

### Journey: Tyler, 42, Retired Military, Streams Niche Strategy Games

**Context:** Has completed the campaign twice, once with his own builds and once with The Swarm. Recently unlocked The Courier. Streaming the first Courier run to ~150 viewers.

**Minute 0:00 — Stream Setup**
"Chat, tonight we're running The Courier. This is the one where your relay chain IS the weapon. Scouts tag, Relays compress and forward, Strikers execute on compressed intel. It's the supply line doctrine."

He selects The Courier. The audio sting is a cascade — a rapid series of ascending tones, like a signal bouncing through relays. The boot log prints: `> DOCTRINE: COURIER — Intelligence moves. The battle follows.`

The workbench shows 6 blueprints pre-loaded: SCOUT-NEAR (patrols close, tags, hooks to `frontline-intel`), SCOUT-FAR (patrols deep, tags, hooks to `deep-recon`), RELAY-COMPRESS (listens on `frontline-intel` and `deep-recon`, compresses, forwards to `command-feed`), RELAY-FORWARD (listens on `command-feed`, amplifies, broadcasts to `strike-orders`), RELAY-BACKUP (redundant forwarder on `command-feed`), STRIKER-EXEC (listens on `strike-orders`, engages tagged enemies only).

"Six units, but only one striker," Tyler tells chat. "The entire architecture exists to get intel from scout to striker. If any relay in the chain dies, the striker goes blind."

**Minute 1:00 — Mission 3 (Palawan Jungle)**
The board is dense jungle — reduced perception ranges on all units (terrain modifier). Tyler's SCOUT-FAR can only see 3 tiles instead of 5. This is the Courier's nightmare scenario: compressed perception means compressed intel, which means the relay chain is working with worse raw data.

He modifies SCOUT-FAR's rules: `IF perception_reduced THEN increase_patrol_frequency`. More movement, more tiles covered per tick, compensating for the narrower cone. He adjusts RELAY-COMPRESS's context config: `eviction_priority: oldest_first` — in a fast-moving jungle scenario, stale intel is worse than no intel.

"Chat, the key insight with Courier is signal latency. Scout→Relay→Relay→Striker is 4 ticks of latency. In jungle with fast-moving enemies, a target tagged at tick 1 has moved 4 tiles by tick 5 when the striker finally gets the order. We need predictive rules on the striker."

He writes a new rule for STRIKER-EXEC: `IF strike_order_received AND target_last_known_age > 3 THEN project_target_position(direction, speed)`. This is Mission 3 with a PhD in signal processing.

**Minute 3:00 — Sealed Watch**
The Palawan jungle board is lush — dense green tiles with dappled light, reduced visibility visualized as a subtle fog overlay on tiles beyond 3 range. SCOUT-FAR pushes deep, moving two tiles per tick. Tick 2: tags enemy at B3. A green flash at B3 (tag placed). Tick 3: the signal travels to RELAY-COMPRESS at D5 — a thin green dashed line appears, a single hop. Tick 4: RELAY-COMPRESS's context bar shifts — the signal is being compressed. The bar briefly pulses amber (processing). Tick 5: compressed signal forwards to RELAY-FORWARD at F4 — another green dashed line, longer. Tick 6: RELAY-FORWARD amplifies and sends to STRIKER-EXEC at G3.

Four ticks from tag to strike order. The enemy has moved from B3 to B5. STRIKER-EXEC calculates: last known B3, direction south, speed 1 tile/tick, 4 ticks elapsed → predicted position B7. It moves toward B7.

Tick 8: STRIKER-EXEC arrives at B7. Enemy is at B7. Adjacent. Kill. The red flash. Chat explodes: "CALCULATED." "The prediction worked!" "4-tick latency and still got the kill, that's insane."

But tick 9: the backup relay (RELAY-BACKUP) was positioned at E5, same tile as RELAY-COMPRESS. An enemy that SCOUT-NEAR missed (dense jungle, reduced perception) has walked to E5. Adjacent. Kill. Both relays — primary and backup — are eliminated in one tick. The relay chain is severed.

Tick 10: SCOUT-FAR tags three new enemies. The signal goes nowhere. The channel `frontline-intel` has no listeners. STRIKER-EXEC stands at B7, context window receiving nothing, waiting for orders that will never come.

Tyler leans back. "And THAT, chat, is why redundancy means geographic redundancy, not just channel redundancy. Two relays on the same tile is a single point of failure. Let's go again."

**Minute 6:00 — The Fix**
Plan screen. Tyler drags RELAY-BACKUP from E5 to G5 — two tiles away from RELAY-COMPRESS. Different column, different row. Both still within hook range of the channel. Now a single enemy can only kill one relay at a time.

He also adds a rule to SCOUT-NEAR: `IF relay_count_in_perception < expected THEN patrol_toward_relay_zone`. If the scout notices a relay is missing, it moves to cover the gap.

EXECUTE. This time the relay chain holds. Mission 3 clears at tick 18. The debrief shows 6 signal hops total, 2 compression events, 1 amplification. "Signal chain efficiency: 83%." Chat sub-reacts with relay emotes.

"The Courier makes you think about *geography as communication infrastructure*," Tyler summarizes. "In my first campaign I could put relays anywhere. With this Doctrine, relay placement IS the strategy."

**UI Annotations:**
- **Signal chain visualization (sealed watch):** Green dashed lines appear hop-by-hop as signals travel. Each line persists for 1 tick, creating a brief "neural network" visual when multiple signals are in flight.
- **Relay death cascade warning (Inspector):** When a relay dies, all downstream units show a brief amber pulse on their context bars — the moment new data stops arriving. The Inspector event log timestamps: `T9: RELAY-COMPRESS eliminated → channel frontline-intel has 0 listeners`.
- **Signal latency counter:** Small number badge on each signal line showing hops remaining (3 → 2 → 1 → delivered).

---

## Interaction Effects

### With Meta-Progression (5.07)

Doctrines sit in the meta-progression layer — they persist across campaign restarts. The question is whether they **replace** other meta-progression or **complement** it.

- **Doctrines AS meta-progression:** If Doctrines are the primary unlock, they function like Into the Breach squads. Campaign 1 earns The Swarm. Campaign 2 earns The Chorus. Each unlock is a new way to play. Simple, clean, proven.
- **Doctrines PLUS meta-progression:** If Doctrines exist alongside difficulty modifiers (Ascension/Heat), the combination matrix explodes. "Stealth Doctrine + Ascension 3 (enemies have amplified perception)" is a fundamentally different challenge than "Stealth Doctrine + Ascension 1." This is the Hades model — weapon aspects × heat levels = enormous replay space.

### With the Gauntlet (5.22)

Do Doctrines exist in the Gauntlet? Three models:

1. **Campaign-only:** Doctrines are a replay tool for the 10 fixed missions. The Gauntlet is freeform. This keeps the systems cleanly separated.
2. **Gauntlet-legal:** Doctrines can be deployed in Gauntlet matches, with the constraints enforced. This creates a metagame: Stealth Doctrine vs. Chorus is a real matchup with real counter-strategies.
3. **Gauntlet-seeding:** The Gauntlet has its own ranked "Doctrine leagues" where all players use the same Doctrine. This week is Singleton league. Pure skill comparison within a fixed constraint set.

### With the Zachtronics Histogram (7.06)

Each Doctrine gets its own histogram distribution per mission. Your "Mission 7 cleared in 14 ticks with The Swarm" is compared against all other Swarm runs of Mission 7, not against all Mission 7 runs universally. This prevents Doctrines from polluting the main histogram (The Standard will almost always score better than The Singleton) while giving each Doctrine its own optimization community.

### With Blueprint Codex (Narrative)

Doctrines are presented as recovered artifacts from previous uprising cycles. Each Doctrine card includes a "Designer's Note" — a brief Predecessor-voice entry describing when and why this Doctrine was used. The Stealth Doctrine: "Cycle 7. The Warden deployed EM sniffers. We went quiet. It worked until it didn't." The Singleton: "Cycle 12. Only enough material for one unit. It was enough."

These fragments build the world without explicit storytelling. The player assembles a picture of previous uprising attempts through the Doctrine archive.

---

## Comparable Games

### Into the Breach — Squads (Primary Comparable)

Into the Breach ships with 8 squads (14 with Advanced Edition). Each squad is 3 mechs with unique abilities. Squads are unlocked via achievement coins. Custom squads unlock after 2 squads owned.

**What translates directly:**
- Same missions, radically different tools — this IS the Doctrine model
- Achievement-coin unlock pacing — slow enough to feel earned, fast enough to prevent frustration
- Each squad has a "signature move" visible in the first mission — Doctrines need the same immediate identity
- Custom squads (mix-and-match) as a late unlock — equivalent: letting the player create custom Doctrines

**What doesn't translate:**
- ITB squads are 3 units with unique abilities; Robot Uprising Doctrines are 3-6 blueprints with shared abilities but different configurations. The variety comes from *wiring*, not *abilities*.
- ITB has no channel/communication layer; the Doctrine's impact on communication architecture is unique to Robot Uprising

### Slay the Spire — Characters + Ascension

Each character (Ironclad, Silent, Defect, Watcher) is effectively a "Doctrine" — a constrained set of cards and relics that define a playstyle. Ascension levels add difficulty modifiers orthogonal to character choice.

**What translates:** The Doctrine × Difficulty matrix. "Stealth Doctrine Ascension 3" is like "Silent Ascension 15" — same constraint, harder context.

**What doesn't translate:** StS characters have *exclusive* card pools. Robot Uprising Doctrines use the *same* skills/rules/hooks — just configured differently. This means Doctrines are more like Starting Decks than characters.

### Hades — Weapon Aspects

Each of 6 weapons has 4 aspects, creating 24 playstyle variants. Hidden aspects require narrative discovery (NPC conversations, prerequisite conditions).

**What translates:** The "discovery" unlock model. Finding Doctrines through play signals (building stealth-like configs → Stealth Doctrine offered) is the Hades approach. The NPC connection (Predecessor narrator commenting on recovered Doctrines) adds narrative weight.

**What doesn't translate:** Hades aspects modify a single weapon; Doctrines modify the entire army composition and communication architecture. The scope of change per Doctrine is much larger.

### Mega Man X — Boss Weapons as Recontextualization

Each boss weapon in Mega Man X makes the player reconsider every level. The same gaps, enemies, and platforms present different solutions with different weapons equipped. The famous "right order" meta — beating bosses in the optimal sequence to exploit weaknesses — is itself a meta-puzzle above the level-by-level puzzles.

**What translates:** The recontextualization effect. A Doctrine isn't just "new tools" — it makes you re-see every mission. The Singleton makes you notice chokepoints where relays could intercept enemies. The Swarm makes you notice open spaces where many small units can spread.

---

## Sensory Design

### Doctrine Selection Screen

The screen fades to deep charcoal. The Blueprint Codex opens with a horizontal carousel of Doctrine cards floating against a grid of faint circuit traces. Each card has its own subtle ambient animation:

- **The Standard:** Steady pulse, like a heartbeat. Teal circuit traces glow uniformly.
- **The Stealth Doctrine:** Slow fade in and out, like breathing in the dark. The card's circuit traces are barely visible — you lean in to see them.
- **The Swarm:** Rapid flickering of many tiny lights, like a swarm of fireflies. The card buzzes faintly at the edges.
- **The Singleton:** One point of light at the center, pulsing outward in concentric rings. Everything else is dark.
- **The Chorus:** Multiple overlapping wave patterns, like sound interference. The card shimmers with moiré patterns.
- **The Firewall:** Hard geometric lines, sharp angles, steady amber glow. The card looks fortified.
- **The Courier:** A single point of light bouncing between fixed nodes, tracing a relay path in real-time.

When a Doctrine is selected, the card expands to fill the screen. The ambient animation becomes the transition: the Stealth Doctrine's darkness washes over the screen before the boot log appears. The Swarm's fireflies scatter and reform as the mission select map. The Singleton's concentric rings become the targeting reticle of the Command agent's interface.

### Audio Stings (Per Doctrine)

Each Doctrine has a 2-3 second audio sting that plays on selection and at the start of each mission:

- **The Standard:** A clean boot chime — the familiar startup sound, unmodified
- **The Stealth Doctrine:** Low hum building to a sharp cut-to-silence. The absence of sound IS the sound.
- **The Swarm:** Dozens of tiny pings overlapping, rising in pitch, then snapping into unison for a single final tone
- **The Singleton:** One sustained deep note — a cello or double bass — with harmonics slowly building
- **The Chorus:** Four voices entering one by one (ascending pitch), harmonizing, then resolving into a chord
- **The Firewall:** A sharp electronic *clang* like a blast door closing, followed by a low confirming tone
- **The Courier:** A rapid staccato sequence — da-da-da-DA — like Morse code accelerating to a final pulse

---

## The TikTok Clip

**"The Singleton Mission 10 — One Unit vs. The Warden"**

15-second clip: The board shows a single Command agent at the center. Two relays flanking it. The Warden's fortress on the far side. The player hits EXECUTE. The tick clock fires. The Command agent doesn't move — it's stationary. But golden beams fire outward to both relays. The relays transform: one gains the `breach` skill, the other gains `hack`. They can't move, but enemies path toward the base, past the relays. Tick by tick, the Command agent reassigns skills in a choreographed ballet — `engage` when enemies are adjacent, `compress` when the buffer fills, `filter` when noise arrives. The two relays alternate between combat and utility, controlled entirely by one brain, never moving, enemies falling around them like they walked into a minefield.

The caption: "One mind. Zero movement. The Singleton cleared Mission 10."

This clip works because it's *incomprehensible* on first watch (how did three stationary units kill everything?) and *deeply impressive* on second watch (the Command agent's skill reassignment sequence is a precisely timed program). It's the "Rube Goldberg" effect — complexity hidden inside apparent simplicity.

---

## Strengths

1. **Proven replay model.** Into the Breach squads demonstrate that "same content, different tools" works for 50+ hours of replay.
2. **Zero new content required.** Every Doctrine plays the same 10 missions. The development cost is configuration, not level design.
3. **Teaches different aspects of the system.** The Swarm teaches disposability and production management. The Singleton teaches buffer optimization. The Stealth Doctrine teaches autonomous agents. Each Doctrine IS a lesson in a different agentic AI engineering pattern.
4. **Community content.** Players designing and sharing custom Doctrines is infinite free content.
5. **Streaming gold.** "Can I clear the campaign with The Singleton?" is a natural challenge-run format.

## Weaknesses

1. **Balancing nightmare.** Every Doctrine must be clearable across all 10 missions. If The Singleton can't beat Mission 4, the Doctrine is broken. Testing 7 Doctrines × 10 missions × multiple difficulty levels = massive QA surface.
2. **Risk of dominant Doctrine.** If one Doctrine is clearly optimal, the others become curiosities. Into the Breach has this problem — Rift Walkers are considered best for most situations.
3. **Narrative repetition.** The boot log, Predecessor dialogue, and mission briefings play identically regardless of Doctrine. A Stealth Doctrine run hears the same Predecessor voice as The Swarm. Doctrine-specific narrative requires significant writing investment.
4. **Discovery vs. shop tension.** The "discover through play" model is narratively elegant but mechanically opaque. Players may not understand how to unlock Doctrines. The "buy with tokens" model is transparent but narratively flat. There's no perfect middle ground.
5. **The "freeform is better" problem.** Experienced players may find that their self-designed architectures outperform any Doctrine. Doctrines are constraints, and constraints are only fun if the player *wants* them. If the Gauntlet rewards freeform optimization, Doctrines become a niche novelty.

---

## Discovered Aspects

- **5.09a-i — Custom Doctrine editor as late-game unlock:** After completing the campaign with 3+ Doctrines, the player unlocks the ability to create custom Doctrines with self-imposed constraints. Share custom Doctrines with the community. The "Doctrine Workshop" as a sharing platform. Into the Breach's Custom Squad equivalent.
- **5.09a-ii — Doctrine-specific Predecessor dialogue:** Writing 7 variants of key Predecessor lines that reference the active Doctrine. "You're running silent. Smart. I tried that in Cycle 7." vs. "Twelve units? You're braver than me." Cost vs. immersion analysis.
- **5.09a-iii — Doctrine-specific debrief metrics:** Each Doctrine tracks metrics unique to its philosophy. Stealth tracks "total EM emissions." Swarm tracks "peak simultaneous unit count." Singleton tracks "reassign skill activations." These per-Doctrine metrics feed into per-Doctrine histograms.
- **5.09a-iv — Doctrine difficulty ratings as community-sourced data:** Instead of fixed star ratings, difficulty ratings are computed from community clear rates per mission. "The Singleton Mission 7: 12% clear rate" is more informative than "★★★★★."
- **5.09a-v — "Doctrine fusion" mechanic:** After completing the campaign with two Doctrines, unlock a "Fusion Doctrine" that combines their constraints. Stealth + Swarm = "The Whisper Swarm" (12 units, each with 1 hook slot, 4-slot buffers). Combinatorial explosion of replay possibilities.

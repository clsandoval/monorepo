# 2.27 — Buffer Exhaustion as Late-Game Mechanic

**Aspect:** 2.27 — Buffer exhaustion as late-game mechanic: long matches (100+ ticks) create a new failure mode — eviction policy breaking down as buffers fill with stale data; "buffer hygiene" as a skill; how architectures gracefully manage a full buffer mid-match; the context-window-overflow problem in Robot Uprising terms
**Wave:** 2 (Core Mechanic Variations)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.06 (Player-Configured Eviction), 2.07 (Automatic Eviction Rules), 2.08 (Panic Eviction), 2.09 (Sticky Memories), 2.21 (Context Efficiency Asymmetry)

---

## The Mechanic: The Slow Rot

Every buffer analysis in this catalog assumes steady state. Signals arrive, signals get evicted, the buffer churns. But what happens at tick 120?

In short matches (30-50 ticks), the buffer is young. Eviction policies work as designed because every signal is recent and probably relevant. In long matches -- the factory-vs-factory grinds of Missions 8-10 that run 100+ ticks -- the buffer has been churning through hundreds of insertion cycles. Individual eviction decisions remain locally correct. The aggregate result is a buffer full of garbage. The unit functions perfectly and makes terrible decisions.

This is not a sudden catastrophe like panic eviction (2.08) or context overload. It is a gradual poisoning. The buffer accumulates stale observations from ticks that no longer matter, relay signals compressed and re-compressed until they carry almost no real information, terrain data from positions the unit left forty ticks ago. The eviction policy protects stale data of a high-priority type exactly as faithfully as it protects fresh data of the same type. An enemy sighting from tick 15 occupies the same priority tier as one from tick 110. The eviction system cannot tell the difference.

**Stale data is defined mechanically.** A datum is stale when its `tick_created` exceeds a signal-type-dependent threshold:

| Signal Type | Fresh Duration (ticks) | Rationale |
|-------------|----------------------|-----------|
| Enemy Position | 5 | Enemies move constantly |
| Friendly Position | 8 | Allies shift slower but still reposition |
| Terrain Observation | 20 | Static, but map awareness decays with distance |
| Threat Alert | 10 | Threats resolve or escalate |
| Compressed Intel | 15 | Half-life of aggregated sources |
| Ambient Noise | 3 | Always stale almost immediately |
| Command Directive | Until superseded | Orders persist until replaced |

When a datum exceeds its fresh duration, it enters a **stale state**: visually flagged, mechanically penalized in rule evaluation (decisions based on stale data are flagged as degraded in the Inspector), but still occupying a buffer slot. The eviction system does not auto-remove stale entries -- that would override the player's configured eviction priority. The stale entry just sits there, a squatter in precious buffer real estate, degrading every decision that touches it.

**Why does staleness accumulate?** Three mechanisms:

1. **The "last of its kind" effect.** If a signal type appears only once (a rare command directive, a one-time terrain scan), that entry persists indefinitely in FIFO. No newer signal of the same type arrives to displace it. At tick 80, it is 70 ticks stale but still present.

2. **Compression contamination.** When the Relay's compress skill operates on mixed-age data, stale observations get baked into the compressed output. A relay compressing every 10 ticks in a long match produces summaries where the stale fraction grows with each cycle. The compressed signal looks clean (one entry, cyan pip) but contains degraded intelligence.

3. **Priority protection of obsolete data.** In player-configured eviction (2.06), a stale "Enemy Sighting (Close)" entry has the same eviction priority as a fresh one. The player's priority stack, designed for the first 30 ticks, becomes a liability by tick 100 -- it is protecting data that no longer deserves protection.

### Buffer Hygiene Tools

The player combats stale data through three tiers of increasing sophistication:

**Tier 1 -- Passive (Mission 1+):** FIFO eviction naturally cycles old entries, but only when new signals arrive. Channel discipline (fewer channels = fewer lingering signal types).

**Tier 2 -- Active (Mission 5+):** The `purge` skill (Relay/Command) flushes all entries older than N ticks, consuming one action tick. The `refresh` skill (Scout) rescans a previously observed tile, replacing stale terrain data. Channel rotation via Command hooks -- rerouting a scout to a new channel gives it a clean information pipeline.

**Tier 3 -- Architectural (Mission 8+):** Decay-aware eviction rules ("evict entries older than 15 ticks before evicting fresh entries"). Relay churn patterns (two relays alternating as primary aggregator every 20 ticks, the inactive one purging). Factory-as-hygiene -- producing fresh units with clean buffers to replace long-lived units with degraded ones. The factory becomes a memory refresh mechanism, not just military reinforcement.

---

## Player Journeys

### Journey 1: Marcus, 34, Software Architect -- Discovery of the Rot

**Context:** Mission 9, factory vs. factory. Marcus has FIFO eviction with priority-ranked signal types. His architecture has worked for every previous mission.

**Minute 0:00** -- Plan screen. Marcus configures his standard: 2 Scouts on patrol routes, 1 Relay with compress, 2 Strikers on `strike-net`, 1 Command with reassign. Context bars on ghost units show moderate fill. He hits EXECUTE with confidence.

**Minute 2:00** -- Sealed watch. Tick 1-30 unfold smoothly. Scouts patrol the left flank. Enemy factory spawns units, scouts detect them, signals propagate through the relay to strikers. Clean kills. Context bars hover at 4/6 (scouts), 7/12 (relay). Signal flow lines pulse green. Marcus nods. "Solid architecture."

**Minute 4:00** -- Tick 50. Both factories are producing steadily. The board has 8 friendly and 6 enemy units. Marcus's scouts have patrolled the same routes for 50 ticks. Their buffers show 6/6 -- full, churning every tick -- but what Marcus cannot see: 3 of 6 slots hold stale terrain observations from ticks 10-20. The scouts keep re-encountering the same tiles, generating fresh observations that coexist with old ones. Only 3 slots cycle with tactical data.

**Minute 6:00** -- Tick 75. A scout spots a new enemy Specialist. It generates an URGENT observation. Buffer is 5/6: 3 stale terrain, 1 stale friendly position (from a Striker that moved 20 ticks ago), 1 fresh threat alert. The URGENT entry evicts the stale friendly position. But the relay downstream is also degraded -- its buffer contains a compressed summary from tick 65 blending stale enemy positions with fresh contacts. The Striker receives this gray data and engages enemies that are no longer at the reported position. It moves to an empty grid square. The real threat advances unopposed.

**Minute 8:00** -- Inspector. Marcus clicks his scout at tick 60. The buffer detail panel shows three entries created at ticks 12, 14, and 18 -- 42 to 48 ticks old, each pulsing with amber stale indicators. Three of six slots are dead weight. The staleness sparkline is a flat line at 100% fill with amber markers rising like a tide from tick 20 onward. By tick 50, 60% of the buffer is stale. The unit was functioning perfectly and slowly going braindead.

**Minute 9:00** -- He redesigns. Adds a Command with periodic `purge` hooks on `admin-net` every 15 ticks. Configures decay-aware eviction on the relay. Redesigns scout patrol routes to cover new ground every 20 ticks. Re-executes. At tick 80, his scouts' buffers show 3/6 fill with all-fresh data. The purge sawtooth is visible: staleness rises, purge fires, staleness drops. He wins at tick 130.

---

### Journey 2: Yuki, 22, Speedrunner -- When Speed Fails

**Context:** Mission 8. Yuki optimizes for fastest completion. She has never let a match pass 50 ticks. No defensive hygiene in her blueprints.

**Minute 0:00** -- Aggressive configuration. 4 Scouts in wide spread, 1 Relay with maximum throughput (no filter), 3 Strikers on `kill-net`. Everything tuned for speed. Context bars projected at 80%+ utilization. "If the match goes past tick 40, I'm doing it wrong."

**Minute 1:00** -- Ticks 1-30 are a blur of combat. 4 enemies destroyed, no losses. Context bars running hot but nobody stunned.

**Minute 2:00** -- Tick 40. The enemy factory escalates with 5 units including a Command-type. Yuki's strikers are out of position -- they chased a decoy east. The relay fires compress at tick 42, but the output blends stale enemy positions from tick 15 with fresh contacts. Striker-1 receives the compressed summary and engages at grid D4 based on the stale portion. The enemies are at G6. The striker walks into empty space while real threats advance on the base.

**Minute 3:00** -- Tick 55. The match has gone longer than Yuki has ever experienced. Her surviving relay has been compressing stale-with-fresh data for 55 ticks. Each compression cycle blends old and new, producing "gray data" -- neither clearly stale nor clearly fresh, just imprecise in a way that compounds. She has no purge skill. She improvises: uses her Command to reroute one scout to a fresh channel (`fresh-net`), creating a clean information pipeline that bypasses the degraded relay entirely. Her remaining striker switches to `fresh-net`.

**Minute 4:00** -- She wins at tick 72. Not a speedrun. In the Inspector, two sparklines tell the story: the `kill-net` striker shows 78% stale data by tick 50. The `fresh-net` striker shows 12% throughout. "The clean channel was always the right answer. I just never needed it before because I finished fast."

---

### Journey 3: Amara, 45, CS Professor -- The Tiered Memory Hierarchy

**Context:** Mission 10, campaign climax, expected 100-150 ticks. Amara teaches distributed systems and recognized buffer mechanics immediately.

**Minute 0:00** -- Plan screen. Amara builds what she calls a "three-tier memory hierarchy." Scout buffers hold raw observations (volatile, 8-tick decay threshold). Relay buffers hold compressed summaries (semi-persistent, 20-tick threshold). Command buffers hold strategic state (long-lived). Two relays alternate as primary aggregator every 20 ticks -- when one goes inactive, it purges completely.

**Minute 3:00** -- Tick 50 inspection. Scout buffers: 4/6, all entries fresh. Inactive relay: 1/12, nearly empty post-purge. Command: 9/14, with entries ranging from fresh directives to 30-tick-old strategic markers. The relay churn is visible as alternating signal density -- a mesmerizing pendulum of information flow. "Scouts are cache. Relay is RAM. Command is disk. Churn is garbage collection."

**Minute 5:00** -- Tick 80. The enemy floods noise signals into `visual-net`. Her decay-aware eviction handles it -- noise entries (3-tick TTL) are evicted first. But at tick 82, a corner case: a noise entry and a genuine observation are both 1 tick old. Same age, different types. The FIFO tiebreaker evicts the genuine entry. She spots the gap in the Inspector: same-age entries need a type-priority tiebreaker. She uses her Command's `reassign` skill to push a new eviction rule to the affected scout mid-match: "Among same-age entries, evict Ambient Noise first." The fix propagates in 1 tick.

**Minute 9:00** -- Tick 131. Victory. Her post-match hygiene metrics: scout average staleness 14%, relay average 8% (churn resets prevent accumulation), command average 22% (intentionally long-lived strategic state). Total overloads: 3 (all during noise floods before the type-priority fix). The aggregate staleness chart shows a sawtooth -- rising during engagement, dropping at each purge/swap, rising again. The peaks never reach 50%. Her tiered hierarchy held.

"This is distributed garbage collection," she tells her stream chat. "Cache invalidation, TTL expiry, generational GC -- it's all in this game."

---

## Strengths

1. **Authentic systems engineering lesson.** Cache invalidation, TTL-based expiry, garbage collection, and capacity planning emerge naturally from the buffer model operating over time. The mechanic is discovered, not taught.

2. **Creates qualitative late-game shift.** Short-match optimizers hit a wall. The progression from "build an aggressive opener" to "build a self-maintaining system" mirrors the junior-to-senior engineer arc. Long matches reward patience and architectural thinking.

3. **Factory-as-hygiene is philosophically rich.** Producing fresh units to replace degraded ones reframes the factory from military reinforcement to memory refresh infrastructure -- the game equivalent of rolling deployments and blue-green deploys.

4. **Emergent without new rules.** Stale data is a natural consequence of the existing buffer model running long enough. No mechanics are bolted on; the player discovers the problem through play.

## Weaknesses

1. **Invisible in short matches.** Most players will not encounter meaningful staleness until Mission 8+, roughly 70% through the campaign. Risks feeling like an arbitrary late-game difficulty spike.

2. **Hard to perceive during sealed watch.** Staleness is aggregate, not individual. A single stale entry looks identical to a fresh one without the Inspector's amber indicators. The rot happens while the player watches combat, not buffer composition.

3. **Punishes defensive players disproportionately.** Slow, methodical architectures run longest and suffer most. Aggressive rush strategies avoid the problem by finishing fast. This double standard could feel unfair.

4. **Purge may become mandatory.** If buffer hygiene is critical in late missions, every competitive blueprint needs purge. This reduces build diversity -- purge becomes a tax, not a choice.

---

## Interaction Effects

**With panic eviction (2.08):** Panic purges the buffer in a one-time cascade. In a long match, a panicked unit accidentally benefits from the hygiene reset -- it loses stale data it could not otherwise shed. Panic becomes paradoxically beneficial. Players might engineer strategic panic moments to clean buffers, creating an ironic synergy between the game's most destructive and most constructive memory operations.

**With relay chains and compression:** Compression is the primary vector for staleness propagation. A relay compressing every 10 ticks in a 100-tick match produces outputs where stale data is baked deeper into each successive summary. Multi-hop relay chains compound this: Scout produces stale observation, Relay-1 compresses it into a summary, Relay-2 compresses that summary into a meta-summary. By the time the Command receives it, the data has been laundered through three compression cycles and the staleness is invisible. The compressed entry looks like a normal cyan pip but contains intelligence from 40 ticks ago.

**With command agents and mid-match reconfiguration:** Command units can push new eviction rules to subordinates mid-match via `reassign`. This means the player's initial hygiene configuration can be patched in real-time -- but only if they have a Command agent, only if `admin-net` is configured, and only if they diagnose the problem during sealed watch. The Command agent becomes the sysadmin of the army, deploying hotfixes to a running distributed system.

**With combat and one-shot-one-kill:** A striker acting on stale enemy position data moves to the wrong grid square. In a one-shot-one-kill system, that wasted movement is often fatal -- the striker is out of position when the real threat arrives. Stale data does not just degrade decisions; it kills units indirectly, through misallocation. The death is quiet and confusing until the Inspector reveals the stale data chain.

**With context efficiency asymmetry (2.21):** Lean architectures (low buffer utilization) evict entries faster, reducing residence time and staleness. Fat architectures (high utilization) accumulate stale data because entries linger. Efficiency is rewarded twice: lean architectures avoid both overload stuns and stale data rot. This double reward risks making lean strategies dominant in late missions.

---

## Comparable Games

**Factorio -- Pollution accumulation:** Pollution builds slowly, is invisible without the overlay, triggers escalating biter attacks, and requires active management (efficiency modules, tree planting). The parallel is structural: both systems create entropy spirals that require architectural mitigation. Factorio's pollution overlay is a model for how Robot Uprising could visualize staleness as an aggregate map layer.

**Slay the Spire -- Deck bloat:** The deck is a buffer. As the run progresses, weak cards dilute the draw pool. Drawing a Strike when you need a Flex is analogous to drawing a stale observation when you need fresh intel. Spire's solutions -- card removal at rest sites (purge), exhaust mechanics (self-eviction), thin deck strategies (lean architecture) -- each have a Robot Uprising parallel.

**Real-world DNS TTL caching:** Each DNS record has a TTL. Too short: excessive query traffic. Too long: stale records route to dead servers. The game's "stale after" threshold per signal type is literally a TTL configuration interface. Teaching TTL management through gameplay is a directly transferable skill.

---

## Sensory Description

**What it looks like:** The rot manifests as a color shift over time. In early ticks, buffer bars glow healthy cyan. By mid-match in the Inspector, they develop a muted yellow-amber undertone -- not the bright amber of a full buffer, but a tarnished brass. Stale entries pulse with a slow, desynchronized heartbeat. Multiple stale entries pulsing out of phase create an unsettling visual rhythm, like watching a row of dying heartbeat monitors. The staleness sparkline shows two lines: total fill (cyan) and fresh fill (green). The gap between them -- the rot gap -- fills with a semi-transparent amber gradient that widens over time. At tick 20, a hairline. At tick 80, a canyon.

When purge fires, amber pips shatter in sequence like dominoes, each fragment dissolving into pixel dust. Fresh pips slide left. A blue-white flash sweeps the bar. Infected amber to healthy cyan in one beat.

**What it sounds like:** A low, persistent hum -- a fluorescent light with a dying ballast. Barely audible, always present in long matches, growing slightly louder as stale entries accumulate. Not alarming; unsettling. The purge skill answers with the game's most satisfying sound: a sharp compressed-air hiss followed by a crystalline chime. It sounds like something being sterilized. The relay churn swap has a deep resonant bell strike marking the transition. Fresh relay activating: rising tone. Old relay purging: falling tone. Together, the churn breathes: inhale, exhale.

**What it feels like:** Gardening. In the early match, everything is planted and growing. By mid-match, weeds appear -- stale entries cluttering the buffer like invasive species. Purge hooks and relay churn are the weeding tools. But beneath the gardening metaphor runs a deeper anxiety: the invisible rot. During sealed watch, you cannot pause or intervene. You watch context bars shift from cyan to amber over 100 ticks and know your carefully designed system is slowly filling with garbage. It feels like watching a codebase accumulate technical debt. Every individual commit is fine. The aggregate is rotting. When you finally open the Inspector and trace the staleness chart, the feeling is recognition -- the same feeling a senior engineer has when they profile production and find the memory leak. "There it is. It's been there the whole time."

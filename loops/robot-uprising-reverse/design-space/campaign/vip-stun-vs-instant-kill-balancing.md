# VIP Stun vs. Instant Kill Balancing

**Aspect:** 5.08e-i — VIP stun vs. instant kill balancing: 3-tick stun window tuning, stun immunity cooldown, difficulty scaling, rescue probability math, comparison with Into the Breach Armored Train variant
**Category:** Campaign / Mission Design
**Wave:** 5 (Campaign & Progression)

---

## The Core Design Tension

Robot Uprising's locked one-shot-one-kill rule says: adjacent striker = instant elimination. No HP. No damage math. The game is about information architecture, not combat optimization.

But escort missions introduce a VIP — a unit the player MUST keep alive. If the VIP follows one-shot-one-kill rules, a single enemy adjacency is an instant mission failure. The player designed everything perfectly, the architecture worked for 40 ticks, one scout slipped through the perimeter on tick 41, and the mission ends. No recovery. No dramatic rescue. No learning — just "you didn't cover every possible approach vector for 60 straight ticks."

This creates the central question: **should the VIP be the one exception to one-shot-one-kill?**

---

## The Six Models

### Model A: "True OSOK" — No Exception

The VIP follows the same rules as every other unit. Adjacent enemy striker = VIP eliminated = mission failed.

**How it works mechanically:**
- VIP has standard unit stats (4-slot buffer, no combat skills, slow movement)
- Any enemy adjacency = instant death
- Mission failure is immediate and absolute

**What it feels like:**
The board is a minefield. Every tick of the sealed watch is a held breath. The VIP's golden border pulses steadily as the escort formation moves across the board. Scouts sweep ahead, their translucent blue perception fans rotating. A gap opens — the eastern scout engaged an enemy two tiles away, breaking formation. An enemy striker appears from a spawner on the VIP's exposed flank. One tile away. The tick clock fires. The striker moves adjacent. A single red flash. The VIP's golden border shatters into amber fragments that scatter and fade. The heartbeat sound flatlines. **MISSION FAILED** appears in stark white. The whole thing took 0.8 seconds from "oh no" to "game over."

**Strengths:**
- **Thematic purity.** The game's identity IS one-shot-one-kill. Exceptions dilute the brand.
- **Maximum tension.** Every tick matters equally. No "it's fine, the VIP can take a hit." The sealed watch for escort missions becomes the most intense experience in the game.
- **Clean design.** No new mechanics. No stun states, no immunity cooldowns, no rescue windows. The rules are the rules.
- **Teaches the right lesson.** In real agentic AI systems, some failures ARE catastrophic and unrecoverable. A production database deletion doesn't have a "stun window." The VIP-as-critical-system-component metaphor is honest.

**Weaknesses:**
- **Binary frustration.** 59 ticks of perfect execution invalidated by 1 tick of failure. The learning signal is too thin — "you failed at tick 41" doesn't tell you HOW to fix the architecture. Was it a perception gap? A hook latency issue? A rule priority mistake? The failure mode is always "something got through" which is uninformative.
- **Into the Breach precedent.** ItB's train missions are widely considered the hardest and most frustrating in the game. The armored train variant was created specifically because the regular train's fragility was too punishing. Even with perfect information (which Robot Uprising doesn't have in sealed watch), binary escort failure frustrated expert players.
- **Anti-spectator.** The TikTok clip of "VIP died at tick 41" isn't interesting. There's no dramatic rescue attempt, no clutch save, no recovery arc. It's just... over. The best escort mission moments in gaming history involve near-misses and recovery, not instant termination.
- **Replay tax.** Each retry costs a full plan→watch→debrief cycle. If escort missions have high failure rates due to OSOK VIP fragility, the per-attempt cost creates grind frustration that compounds with the binary outcome.

**Comparable games:**
- **Into the Breach Supply Train (pre-Armored).** 1 HP train, destroyed on any hit. Community consensus: the most frustrating mission type. The train moved 2 tiles per turn into potential danger zones, and protecting it from all angles simultaneously was often impossible regardless of player skill. The Advanced Edition's Armored Train was a direct response.
- **Fire Emblem NPC escort chapters.** "Battle Before Dawn" is infamous — the NPC you must protect can die before you physically reach them. Binary NPC death on contact creates rage-quit scenarios even in permadeath games where unit death is expected.
- **XCOM 2 VIP escort.** VIPs have minimal HP (3-4), which functions as near-OSOK. Player frustration centers on "I can't control the VIP's positioning perfectly and one stray shot ends the mission." The VIP's ability to Hunker Down provides a thin survival buffer that makes the difference between "fair challenge" and "unfair RNG."

---

### Model B: "The Stun Window" — 3-Tick Grace Period

When an enemy would kill the VIP, instead the VIP enters a **stunned** state for 3 ticks. During the stun window, the escort architecture must eliminate the adjacent threat OR move a unit adjacent to the VIP to "rescue" it (using a new `rescue` skill or by simply being adjacent when the stun timer expires — presence = rescue). If the stun timer reaches 0 with an enemy still adjacent and no ally adjacent, the VIP is eliminated.

**How it works mechanically:**
- Enemy adjacency → VIP enters STUNNED state (3-tick duration)
- VIP stops moving, sparking/jittering visual, amber border replaces golden
- Context window freezes (no new entries, no eviction, no rule evaluation)
- The adjacent enemy remains in place (occupied with "attacking")
- If any player unit moves adjacent to VIP before timer expires → VIP rescued, enemy eliminated, VIP resumes at 50% buffer (half entries evicted from the shock)
- If timer expires with enemy adjacent and no ally adjacent → VIP eliminated → mission failed
- **Stun immunity cooldown:** After rescue, VIP has 5-tick immunity. During immunity, enemy adjacency eliminates the enemy (VIP fights back in survival mode). Golden border pulses white during immunity.
- **Stun stacking prevention:** Only one stun can be active. Additional enemies arriving during stun don't reset or extend the timer.

**What it feels like:**
The escort formation moves across the board. The eastern scout breaks formation to engage. An enemy striker appears on the exposed flank. One tile away. Tick clock fires. The striker moves adjacent to the VIP. But instead of the red flash of death — an amber explosion. The VIP's golden border shatters into amber, then reforms as a flickering amber outline. The heartbeat sound stutters into a rapid, irregular rhythm — *ba-ba-ba-bump, ba-ba-ba-bump*. The VIP unit jitters in place, sparking, a "3" appearing above its head in amber, counting down. The adjacent striker is locked in place, grappling.

The player's heart is pounding. Three ticks. The western scout's rule fires — `IF ally_stunned THEN move_toward(stunned_ally)`. The scout was 2 tiles away. It moves one tile closer. "2" appears above the VIP. The scout moves adjacent. Cyan flash. The striker is eliminated. The VIP's amber border dissolves back to golden, but dimmer — half its context window entries are gone, evicted by the shock. A 5-tick immunity shield appears as a white pulse around the golden border. The heartbeat steadies, slower now but stable.

In the Inspector afterward, the player can see the exact chain: which hook detected the stun, which rule triggered the rescue response, how many ticks the rescue took, what the VIP's buffer looked like before and after. The stun window created a **diagnosable moment** — not just "something got through" but "the rescue chain fired in 2 ticks, and here's exactly why."

**Strengths:**
- **Dramatic rescue moments.** The 3-tick countdown is a designed dramatic beat. "Will the rescue arrive in time?" is inherently compelling. This IS the TikTok clip: amber VIP jittering, countdown at 1, rescue scout arriving at the last possible moment. Chat goes wild.
- **Diagnosable failure.** When the rescue fails, the player knows WHY. Was there no rescue rule? Was the nearest ally too far away? Did the hook chain take too many ticks? Each failure component is fixable in the workbench. The learning signal is rich.
- **Architecture test.** The stun window tests whether the player's escort architecture has **redundancy and reactive capability**, not just whether the perimeter held for N ticks. Building a rescue chain is a more interesting design challenge than building a perfect wall.
- **Teaches real engineering.** In production systems, you design for recovery, not perfection. Circuit breakers, retry logic, graceful degradation — the stun window IS a circuit breaker. "The system got hit, had 3 seconds to recover, and the recovery architecture worked." This is the transferable skill.
- **Buffer shock as secondary teaching.** The 50% buffer eviction on rescue creates a cascade — the VIP's subsequent decisions may be impaired because half its context is gone. This teaches that recovery has costs. "You survived, but your system state is degraded." The player who designs buffer redundancy (context config with quick-refill priority) has a better post-rescue VIP.

**Weaknesses:**
- **Exception complexity.** This is a new mechanic that only applies to VIP units in escort missions. It requires teaching (boot log entry), visual language (amber stun state), audio vocabulary (stuttering heartbeat, countdown pips), and Inspector integration (stun timeline). Non-trivial implementation cost.
- **Optimal rescue trivializes.** Once the player has a reliable rescue chain (a scout with `IF ally_stunned THEN move_toward` rule at priority 1), every stun becomes a 1-2 tick inconvenience rather than a crisis. The dramatic tension evaporates for expert players.
- **Rule dilution.** Every escort unit now needs a rescue rule eating one of its limited rule slots. This reduces the slot space available for other behaviors, creating an implicit "escort tax" on architecture design.
- **Stun immunity as cheese.** The 5-tick immunity period means a skilled player could deliberately let the VIP get stunned in controlled conditions, trigger rescue, then use the immunity window to push through a dangerous section. "Stun tanking" as an unintended strategy.

**Comparable games:**
- **Into the Breach Armored Train.** The armored variant gives the train damage reduction, making it survivable against standard attacks. This is conceptually similar — a buffer between "hit" and "dead" — though ItB uses armor rather than a stun window.
- **Dota 2 Aegis of the Immortal.** A one-time-use item that resurrects the holder after death with a 5-second delay. Creates the exact same "will the team protect the resurrection?" dramatic moment. The Aegis fight is consistently one of the most exciting moments in competitive Dota.
- **Fire Emblem Rescue command.** GBA-era FE lets mounted units pick up adjacent allies, removing them from the board entirely but debuffing the rescuer. The tradeoff — remove the VIP from danger but weaken your strongest unit — creates interesting tactical decisions.

---

### Model C: "The Warning Shot" — 1-Tick Telegraph + Instant Kill

Enemies telegraph their attack on the VIP 1 tick before executing. A red targeting line appears from the enemy to the VIP. On the next tick, if the VIP is still adjacent and unprotected, it dies. If the player's architecture moves the VIP or eliminates the threat in that 1-tick window, the VIP survives.

**How it works mechanically:**
- Enemy moves adjacent to VIP → targeting line appears (red dashed, pulsing)
- VIP's heartbeat accelerates. Amber warning flash on VIP tile.
- On the NEXT tick, if enemy is still adjacent: VIP eliminated.
- The player's architecture has exactly 1 tick to respond: move VIP away (if VIP has movement capability), eliminate the enemy (if a striker is nearby), or push the enemy (if any unit has a displacement skill nearby).
- No stun state, no immunity, no rescue mechanic. Just a 1-tick reaction window.

**What it feels like:**
The enemy striker reaches the VIP. A harsh red targeting line snaps from striker to VIP — a laser sight, thin and deadly, pulsing once per 200ms. The VIP's golden border flashes amber-red-amber-red. The heartbeat sound becomes a rapid staccato alarm, almost a siren. The tick counter is at T+41. One tick. The player's scout has a rule: `IF ally_targeted THEN engage(adjacent_enemy)`. The scout is one tile away. Tick T+42 fires. The scout moves adjacent to the enemy striker and eliminates it. The targeting line snaps off. The VIP's border returns to steady gold. The heartbeat normalizes with a relieved descending tone.

But if no unit responds: tick T+42 fires. The red targeting line brightens to solid red. The striker attacks. Red flash. VIP eliminated. The 1-tick warning existed, but the architecture couldn't respond in time.

**Strengths:**
- **Preserves OSOK identity.** The VIP IS killed by adjacency — just with a 1-tick telegraph. This is closer to how Into the Breach works: enemies telegraph attacks, you have one turn to respond. The kill is real; the warning is fair.
- **Into the Breach alignment.** The locked design already references ItB's "Into the Breach pacing." Telegraphed attacks are core to ItB's design philosophy: "the game tells you what will happen, and you prevent it." This model is the most ItB-native.
- **Tests reactive speed.** The architecture must have a unit within 1-tick response range of the VIP at all times. This tests the *tightness* of the escort formation — how quickly the architecture can redirect a unit to the threat.
- **No new states.** No stun, no immunity, no rescue. The only new element is the telegraph visual/audio. The mechanical complexity is minimal.

**Weaknesses:**
- **1 tick may not be enough.** If signal latency is 1 tick per hop, and the VIP's distress signal must reach a rescuer via a relay, the response takes 2+ ticks. The 1-tick window makes relay-mediated rescue architectures impossible, forcing all escort formations into tight clusters.
- **Degenerates to OSOK.** If the player's architecture can't respond in 1 tick (because no unit is adjacent or because the hook chain is too long), the telegraph is just a prettier version of instant death. Expert players will learn to position redundant guards, making the telegraph irrelevant. The model doesn't create an interesting mid-ground.
- **Sealed watch readability.** At 1 second per tick, the telegraph appears for only 1 second before resolution. On 2x speed, that's 0.5 seconds. The player may not even register the warning before the outcome.

**Comparable games:**
- **Into the Breach.** Direct model. Every enemy attack is telegraphed with red overlay showing target tile. The player has one full turn (all three mechs) to respond. ItB's 3-mech response is more flexible than Robot Uprising's agent-architecture response.
- **Advance Wars (Days of Ruin).** Units on defense terrain get first-strike advantage, functionally a "you see the attack coming and can prepare" mechanic.

---

### Model D: "The Shield Tick" — Proximity-Based Passive Protection

The VIP has no inherent survivability. Instead, adjacent allied units passively "shield" the VIP. If a player unit is adjacent to the VIP when an enemy attacks, the player unit is eliminated instead. If no player unit is adjacent, the VIP dies.

**How it works mechanically:**
- Enemy moves adjacent to VIP
- If a player unit is also adjacent to VIP → player unit is eliminated (bodyguard sacrifice), VIP survives
- If no player unit is adjacent → VIP eliminated → mission failed
- Multiple adjacent player units: the one with lowest priority in production queue sacrifices (newest first — expendable)
- Sacrificed unit's destruction triggers normal hooks (ON_ALLY_DESTROYED)

**What it feels like:**
The escort formation is tight — three units adjacent to the VIP at all times. An enemy striker breaks through the outer perimeter and reaches the VIP. Red flash — but not on the VIP. The nearest scout's tile explodes instead. The scout took the hit. Its icon shatters, its signal lines go dark, its voice drops from the kulintang chord. The VIP is shaken — its heartbeat stutters for one beat — but alive. The formation has a hole now. The remaining escort units must redistribute. The sacrificed scout's ON_ALLY_DESTROYED hook fires, alerting the rest of the network: "unit down, VIP exposed on east flank."

**Strengths:**
- **Creates resource decisions.** Every bodyguard sacrifice costs a unit. The player must decide how many "shields" the VIP needs. More shields = safer VIP but fewer units for perimeter scouting and enemy engagement. The tradeoff is clean and interesting.
- **Emergent narrative.** The bodyguard sacrifice is inherently dramatic. "SCOUT-3 gave its life to protect the VIP." This creates the emotional beats that make escort missions memorable.
- **No new mechanics.** Uses existing one-shot-one-kill rules. The only new concept is "adjacency as protection" which is intuitive.
- **Architecture depth.** The player must design a formation that maintains adjacency while moving. This tests spatial reasoning, movement coordination, and redundancy planning.

**Weaknesses:**
- **Unit attrition spiral.** Each bodyguard sacrifice weakens the escort. After 2-3 sacrifices, the formation is too thin to maintain protection AND perimeter security. This creates a death spiral where the first hit makes the second more likely.
- **Sacrificial unit production.** Optimal play may degenerate to producing cheap scouts solely as disposable shields. This is "meatshield meta" — the least interesting escort strategy.
- **Unfair sacrifice selection.** The "newest unit sacrificed first" rule may feel arbitrary. Why didn't the player get to choose which unit sacrificed? The lack of control during sealed watch means the engine's choice may feel wrong.

**Comparable games:**
- **Chess king protection.** Adjacent pieces can be captured to protect the king. The king itself is the piece you must never lose. The analogy is nearly exact.
- **StarCraft unit tanking.** Moving cheap units in front of expensive ones to absorb damage. A fundamental RTS micro technique.
- **Secret Service protection.** Real-world VIP protection involves bodyguards physically interposing between threat and principal.

---

### Model E: "The Overload Shield" — Context Window as HP

The VIP doesn't die from adjacency. Instead, enemy adjacency floods the VIP's context window with noise (4 entries per tick). When the VIP's context window fills completely, it enters context overload — stunned for 1 tick, then the standard overload compaction happens. If the VIP is overloaded 3 times (cumulative across the mission), it's eliminated.

**How it works mechanically:**
- Enemy adjacency doesn't kill VIP — it floods VIP's buffer with noise at 4 entries/tick
- VIP has a 4-slot context window (tiny), so a single enemy fills it in 1 tick
- Overload = 1-tick stun (locked mechanic), then compaction
- After compaction, VIP resumes with cleared buffer
- 3 cumulative overloads = VIP eliminated (the system crashes from repeated shock)
- Player's architecture can prevent overload: eliminate enemy before buffer fills, use `compress` or `filter` skills on VIP's incoming data, configure VIP's context to ignore noise-type entries

**What it feels like:**
An enemy reaches the VIP. No red flash. Instead, the VIP's tiny context bar — four horizontal pips at the bottom of its tile — starts filling rapidly. Pip 1 flashes red. Pip 2. Pip 3. Pip 4. The bar is full. The VIP sparks and jitters — the familiar overload stun animation. One tick frozen. Then compaction: the pips blink rapidly and reset to 1 (one entry survived eviction priority). The VIP resumes moving, but a small counter appears: "⚡1/3" in amber text. Two more overloads and it's done.

The player's relay was supposed to be running `compress` on VIP's incoming data, reducing each noise entry from 1 slot to 0.25 slots — buying 4x time. But the relay was out of range because the formation drifted. In the Inspector, the player can see: "Tick 41: VIP buffer 0/4 → 4/4 in one tick. RELAY-B compress skill: out of range (3 tiles, max 2). Overload at T+42."

**Strengths:**
- **Uses existing mechanics.** Context overload is already a locked mechanic. This model doesn't introduce stun windows, rescue skills, or bodyguard sacrifice — it reuses the game's core system (buffer management) as the VIP's survival mechanic.
- **Tests the right skills.** The player must manage the VIP's information architecture — exactly what the game teaches. Compress, filter, context config, listen/ignore toggles — every tool in the toolkit is relevant to VIP protection through this model.
- **Graduated failure.** 3 overloads before death means the first hit isn't fatal. The player sees the "⚡1/3" counter and knows the architecture is leaking. They can adjust for the next attempt with specific information about what caused the overload.
- **Thematic coherence.** The VIP-as-fragile-system is protected by information hygiene, not combat capability. The enemy doesn't "attack" the VIP — it "overwhelms" it. The VIP doesn't have "hit points" — it has a context window that gets flooded. Every word of this is native to the game's vocabulary.
- **Scalable difficulty.** Mission designers can tune: VIP buffer size (4 = fragile, 6 = moderate, 8 = sturdy), noise rate (4/tick = aggressive, 2/tick = moderate), overload threshold (3 = standard, 2 = hard, 1 = OSOK equivalent), and whether compress/filter can mitigate the noise.

**Weaknesses:**
- **Obscures combat stakes.** The VIP isn't "in danger" in an immediately readable way. "Its buffer is filling" is less viscerally threatening than "an enemy is about to kill it." The drama is informational rather than physical.
- **Compress as mandatory skill.** If compress is the primary defense against VIP buffer flooding, every escort mission demands a relay with compress skill in range. This constrains architecture diversity.
- **Counter resets between encounters?** If the ⚡ counter resets after 10 ticks with no overload, the mechanic becomes trivially manageable. If it never resets, cumulative pressure across a long mission might feel unfair.

**Comparable games:**
- **Slay the Spire Block mechanic.** Block absorbs damage before HP. Similarly, VIP context filtering absorbs noise before overload. Both create a "preparation beats reaction" dynamic.
- **FTL shield layers.** Shields regenerate over time but each hit penetration does permanent hull damage. The VIP's buffer refills but each overload counts toward the permanent threshold.

---

### Model F: "The Graduated Response" — RECOMMENDED

A hybrid model that combines the dramatic clarity of the stun window with the thematic purity of context overload:

**Phase 1 — Signal Flood (ticks 1-2 of enemy adjacency):**
Enemy adjacency floods VIP buffer at 3 entries/tick. The VIP's context bar fills rapidly. If the player's architecture eliminates the threat or moves the VIP before the buffer fills, no consequences. This is the "clean save" — the architecture prevented the problem. Silent aside from the buffer bar climbing.

**Phase 2 — Overload Stun (buffer full):**
If the buffer fills, standard context overload fires: 1-tick stun, sparking, jitter. The VIP can't act. The "⚡" counter increments. During this tick, the enemy is locked adjacent (pressing the attack). This is the "messy save" window — 1 tick for a rescue unit to arrive and eliminate the threat.

**Phase 3 — Elimination (stun expires with enemy adjacent):**
If the stun tick passes and the enemy is still adjacent, the VIP is eliminated. One-shot-one-kill fires, delayed by the overload sequence.

**The full sequence:** Enemy reaches VIP → buffer floods over 1-2 ticks → overload stun → 1-tick rescue window → elimination if no rescue.

**Total survival window: 2-3 ticks** from enemy adjacency to VIP death, depending on VIP buffer size and existing buffer contents. A VIP with an empty 4-slot buffer gets 2 ticks (fill + stun). A VIP with a pre-occupied 2/4 buffer gets 1 tick before overload.

**Stun immunity:** After a rescue, VIP gains 3-tick immunity (buffer flushes noise, shield glow). No stacking — immunity can't be refreshed until expired.

**Overload counter:** 3 overloads per mission = VIP eliminated regardless of rescue. This prevents indefinite "stun tanking" — the VIP can only survive 3 close calls before the cumulative system shock is fatal.

**What it feels like:**
The escort formation moves through Palawan jungle. Dense canopy tiles limit scout perception. An enemy striker emerges from behind terrain, 2 tiles from the VIP. The outer scout was looking the wrong way — its patrol rule oriented it north, and the enemy came from the east.

Tick T+38: Enemy moves adjacent to VIP. The VIP's context bar starts climbing — pip 1, pip 2. The heartbeat sound accelerates. The VIP's golden border flickers amber at the edges. Signal arrows race outward — the VIP's ON_THREAT hook fires through the relay network. But latency: the closest striker is 3 hops away. 3 ticks minimum response time.

Tick T+39: Buffer at 4/4. OVERLOAD. The VIP sparks, jitters, amber border fully active. "⚡1" appears. The heartbeat becomes a rapid flatline-adjacent stutter. The kulintang chord loses the VIP's voice — a sustained note drops out, leaving a hollow gap in the harmonic texture. The rescue countdown: 1 tick.

Tick T+40: The striker is still 2 hops away. Too far. But SCOUT-2 had a backup rule — `IF ally_overloaded AND distance < 2 THEN move_toward(overloaded_ally)`. SCOUT-2 was 1 tile away. It moves adjacent. The enemy striker is eliminated by the scout's proximity (the rescue mechanic). The VIP's amber border dissolves back to gold. The context bar blinks — compaction evicts the noise, but the VIP lost half its legitimate context too. The dropped kulintang note returns, slightly off-pitch, then settles. Heartbeat normalizes over 3 ticks.

**In the Inspector afterward:**
The player scrubs to tick T+38. Clicks the VIP. Sees: "Buffer: 0/4 → 3/4 (enemy noise flood, 3 entries/tick)." Clicks the Decision Trace tab: "No action — buffer not yet full, rules still evaluating." Tick T+39: "Buffer: 4/4 → OVERLOAD. Stun for 1 tick. Context compaction: evicted entries 2 (oldest, lowest priority)." Tick T+40: "SCOUT-2 moved adjacent. Rescue triggered. Enemy eliminated. Immunity: 3 ticks." The signal genealogy shows the hook chain: VIP ON_THREAT → relay-net → striker (too slow, 3 hops) AND VIP ON_OVERLOAD → direct → SCOUT-2 (1 hop, in time).

The learning: the VIP's ON_THREAT hook went through the relay, adding latency. SCOUT-2's rescue worked because it had a SEPARATE rule triggered by ON_OVERLOAD, which bypassed the relay. The player's architectural insight: **redundant detection paths at different latency tiers** — the relay-mediated strategic response AND the direct-adjacency emergency response. This is exactly how production systems work: the PagerDuty escalation chain AND the on-call engineer's local alert.

**Strengths:**
- **Uses existing vocabulary.** Context overload, buffer flooding, stun — all locked mechanics. The only new element is "enemy adjacency causes noise flooding" which is a natural extension of the information warfare theme.
- **Graduated drama.** Phase 1 (buffer filling) is the warning. Phase 2 (overload stun) is the crisis. Phase 3 (elimination) is the consequence. Each phase has distinct visuals, audio, and player emotions. The sealed watch tells a three-act micro-story for every VIP encounter.
- **Variable survival window.** Buffer state determines how long the VIP survives. An empty-buffer VIP gets 2-3 ticks. A half-full VIP gets 1-2. A VIP already at 3/4 buffer (from legitimate signal traffic) overloads immediately. This creates architecture-dependent fragility — the player who manages VIP buffer health has more rescue time.
- **Architecture-testable.** Every component of the survival chain is visible in the Inspector and tunable in the workbench. Buffer size, noise filter config, rescue rules, hook latency, escort formation tightness — the player has specific levers to pull.
- **Cumulative consequence.** The ⚡ counter creates long-term pressure. Each close call brings the VIP closer to permanent failure. This prevents "stun tanking" while allowing individual recoveries.
- **Difficulty scaling.** Mission designers tune VIP buffer size (4/6/8), noise rate (2/3/4 per tick), overload threshold (1/2/3), and immunity duration (2/3/5 ticks). Early escort missions can be forgiving (6-slot buffer, 2 noise/tick, 3 overloads). Late missions can approach OSOK (4-slot buffer, 4 noise/tick, 1 overload).

**Weaknesses:**
- **Complexity overhead.** New players seeing their first escort mission must learn: noise flooding, buffer-dependent survival time, overload counter, rescue adjacency, immunity window. This is 5 new concepts layered onto an already complex system.
- **Buffer management prerequisite.** This model only works if the player already understands context overload (introduced M3-4) and buffer management. If escort missions appear before this understanding is solid, the model's elegance is invisible.
- **Rescue adjacency ambiguity.** "Any friendly unit adjacent to the VIP during overload stun = rescue" is mechanically clean but may confuse players — why does a scout's physical presence eliminate an enemy striker? The fiction needs a justification. Perhaps: the scout's `evade` skill combined with proximity creates a joint evasion that removes the threat. Or: the rescue isn't combat — it's the scout pulling the VIP away from the danger (a 1-tile displacement).

---

## Difficulty Scaling Matrix

| Parameter | Easy (M6-7) | Standard (M8) | Hard (M9-10) | Nightmare (Gauntlet) |
|-----------|-------------|---------------|--------------|---------------------|
| VIP buffer size | 6 slots | 4 slots | 4 slots | 4 slots |
| Enemy noise rate | 2/tick | 3/tick | 4/tick | 4/tick |
| Overload threshold | 3 overloads | 3 overloads | 2 overloads | 1 overload (OSOK equivalent) |
| Stun immunity | 5 ticks | 3 ticks | 2 ticks | 0 ticks (no immunity) |
| VIP buffer pre-fill | Empty | 1/4 filled | 2/4 filled | Random 1-3/4 |
| Rescue window | 2 ticks (stun + buffer) | 1-2 ticks | 1 tick | 1 tick |

At Nightmare difficulty, the Graduated Response functionally becomes OSOK: 4-slot buffer, 4 noise/tick (fills in 1 tick), 1 overload threshold (first overload = elimination), 0-tick immunity. Expert players who demand True OSOK get it through difficulty scaling, not a separate model.

---

## Rescue Probability Math

For the Graduated Response model, the probability of successful rescue depends on:

**Variables:**
- `d` = distance from nearest rescue-capable unit to VIP (in tiles)
- `w` = survival window in ticks (buffer-dependent: `⌈(buffer_size - current_fill) / noise_rate⌉ + 1` for the stun tick)
- `h` = hook chain length from VIP's distress signal to rescue unit (in hops)
- `s` = rescue unit's movement speed (tiles per tick)

**Rescue condition:** `d / s ≤ w - h`

The rescue unit must arrive within the survival window minus signal latency.

**Example scenarios (Standard difficulty, 4-slot empty VIP, 3 noise/tick):**
- Survival window: `⌈4/3⌉ + 1 = 3 ticks`
- Rescue unit 1 tile away, direct hook (0 relay hops): `1/1 ≤ 3 - 1 = 2` ✅ Rescued at tick 2 of 3
- Rescue unit 2 tiles away, 1-hop relay: `2/1 ≤ 3 - 2 = 1` ❌ Arrives at tick 4, too late
- Rescue unit 1 tile away, 1-hop relay: `1/1 ≤ 3 - 2 = 1` ✅ Rescued at tick 3 of 3 (last tick!)
- Rescue unit 3 tiles away, direct hook: `3/1 ≤ 3 - 1 = 2` ❌ Too far

**Key insight:** Relay-mediated rescue chains are viable only if the rescue unit is already within 1 tile of the VIP. For longer-range rescue, direct hooks (ON_OVERLOAD with no relay) are required. This teaches: **emergency channels should bypass the relay network.** A separate low-latency direct hook for emergencies alongside the relay-mediated strategic channel. This is the "911 vs. email" architecture lesson.

**Formation rescue probability table (Standard difficulty):**

| Formation | Adjacent allies | Nearest ally distance | Rescue probability (assuming 1-hop hooks) |
|-----------|----------------|----------------------|------------------------------------------|
| Diamond (4 adjacent) | 4 | 0 (already adjacent) | ~100% (overload prevented by immediate response) |
| Triangle (3 adjacent) | 3 | 0 | ~95% (one exposed flank) |
| Line (2 adjacent) | 2 | 0 | ~80% (two exposed flanks) |
| Loose escort (1 adjacent, 2 at range 2) | 1 | 1-2 | ~60% (depends on attack direction) |
| Detached escort (0 adjacent, nearest at range 2) | 0 | 2 | ~30% (rescue possible only with direct hook + fast unit) |

---

## Stun Immunity Cooldown Design

The immunity window after rescue serves three purposes:

1. **Prevents stun-lock.** Without immunity, a second enemy arriving immediately after rescue could re-stun the VIP. Two enemies = infinite stun-lock with no recovery.
2. **Rewards rescue architecture.** The immunity period is a brief "safe window" where the escort can reorganize. This is the payoff for having a working rescue chain.
3. **Prevents stun tanking.** The cumulative overload counter (⚡ 1/3, 2/3, 3/3) means immunity doesn't make the VIP invincible — it just spaces out the damage.

**Immunity behavior:**
- During immunity, enemy adjacency has no effect (no noise flooding, no damage)
- Visual: white pulsing aura over golden border, counting down (3... 2... 1...)
- Audio: steady reinforced heartbeat, slightly lower pitch than normal (recovered but shaken)
- The VIP moves normally during immunity but its buffer is partially depleted from the overload compaction

**Immunity duration trade-off:**
- **Too short (1 tick):** Stun-lock still possible with 2+ enemies arriving in sequence. Rescue feels unrewarded.
- **Too long (5+ ticks):** Players route through dangerous areas during immunity. "Stun-then-sprint" becomes optimal play, subverting the escort formation entirely.
- **Sweet spot (3 ticks):** Enough time to reorganize the escort formation. Not enough time to traverse meaningful distance through unprotected territory.

---

## Player Journeys

### Journey: Sofia, 15, Manila — First-Time Strategy Gamer

**Context:** Mission 7 (first escort mission). Sofia has completed M1-6, understands context overload from M3, built her first factory in M5-6. She's configured a diamond escort formation around the VIP based on the boot log's suggestion. Her scouts have basic patrol rules but no rescue-specific rules. This is her first time seeing the VIP unit type.

**Minute 0:00 — Boot Log Introduction**
The mission opens with the boot log: `[SYSTEM] VIP TRANSPORT MODULE — INITIALIZING... Loading entity: SPECIALIST-PRIME. Classification: IRREPLACEABLE. Context window: 4 slots. Combat capability: NONE. Survivability protocol: escort formation required. WARNING: proximity incursion will flood context window. Overload threshold: 3. Each overload degrades system integrity. Third overload is fatal.`

Sofia reads this carefully. She's seen "context overload" before — her relay overloaded in M4 and was stunned for a tick. She understands the mechanic. The "proximity incursion = context flood" part is new. She opens the Blueprint Codex and finds the VIP entry: a golden-bordered card showing a 4-slot buffer, no skills, slow movement, and a description: "Fragile intelligence asset. Must reach extraction point. Enemy proximity floods context with noise. 3 overloads = system failure."

She thinks: "So it's like my relay but way more fragile. I need to keep enemies away from it."

**Minute 1:30 — Planning the Formation**
Sofia arranges her escort: 2 scouts in front (perception 5, wide sweep), 1 striker on each flank (perception 2, but combat-ready), 1 relay behind (stationary, maintaining comms with the factory). She's using the diamond formation the boot log suggested. The ghost preview shows the VIP's path — straight across the board from A4 to H4. She can see enemy spawner positions at E1 and E8. The path crosses through their threat zones.

She doesn't add any rescue-specific rules. She thinks the formation will hold.

**Minute 3:00 — Sealed Watch: The First Breach**
The escort moves smoothly for 20 ticks. At tick 21, an enemy striker spawns at E1 and moves south toward the formation. The northern scout spots it (perception 5) and the hook fires — a cyan signal arrow races to the relay, which forwards to the eastern striker. But the striker is 3 hops away. By tick 24, the enemy has reached the VIP.

The VIP's context bar starts climbing. Pip 1... pip 2... pip 3... pip 4. OVERLOAD. The VIP sparks and jitters. "⚡1" appears in amber. The heartbeat stutters. Sofia gasps — she's seen overload before but the VIP's heartbeat stutter is new and alarming.

The stun tick passes. The enemy is still adjacent. But the eastern striker finally arrives — tick 25 — and eliminates the enemy. The VIP's amber border fades back to gold. The kulintang chord steadies.

Sofia exhales: "Oh my god, that was close." The "⚡1" counter is still visible. Two more of those and the VIP is gone.

**Minute 4:30 — Second Breach**
At tick 35, two enemies converge from both spawners simultaneously. The formation can handle one — the western striker engages the southern enemy. But the northern enemy slips through. The scout that was supposed to cover the north is in the wrong position — its patrol rule sent it east on the previous tick.

The VIP's buffer was already at 2/4 from legitimate signal traffic (the relay had been sending position updates). The noise flood fills the remaining 2 slots in less than a tick. OVERLOAD. "⚡2." The heartbeat is frantic now. The stun tick passes. No rescue unit is adjacent — the nearest scout is 2 tiles away. The enemy is still there.

Tick 37: VIP eliminated. Red flash. Heartbeat flatline. Golden border shatters.

**MISSION FAILED.**

**Minute 5:00 — Inspector Debrief**
Sofia enters the Inspector. She scrubs to tick 35. Clicks the VIP. The decision trace shows: "Buffer at 2/4 (entries: relay-net position update T+33, scout-report T+34). Enemy noise flood: 3 entries/tick. Buffer full at T+35. Overload."

She sees the problem: the VIP's buffer was pre-filled with position updates it didn't need. She opens the VIP's context config in her mind and realizes: she never configured the VIP's listen/ignore toggles. It was listening to everything on the relay channel — including routine position reports. If she'd configured it to ignore position updates and only listen for threat alerts, the buffer would have been empty when the enemy arrived, giving her 2 more ticks of survival time.

She also sees that SCOUT-1's patrol rule sent it east on tick 34, leaving the north unprotected. She needs a rule that overrides patrol when the VIP is threatened.

**Minute 7:00 — Retry**
Sofia returns to the Plan screen. She makes three changes:
1. VIP context config: ignore `position_report` signal type, listen only to `threat_alert` and `move_command`
2. SCOUT-1: adds rule `IF ally_overloaded THEN move_toward(overloaded_ally)` at priority 1 (above patrol)
3. SCOUT-2: same rescue rule

She hits EXECUTE. The sealed watch begins again. At tick 24, the same breach. But this time, the VIP's buffer is empty (no position updates clogging it). The noise flood takes 2 ticks to fill 4 slots at 3/tick. SCOUT-1's rescue rule fires via direct hook (no relay latency). The scout arrives adjacent on the stun tick. Rescue. "⚡1." Immunity activates — white pulse for 3 ticks.

At tick 35, the double-breach. The VIP's immunity has expired but its buffer is clean. The noise flood takes 2 ticks again. SCOUT-2's rescue rule fires. Rescue. "⚡2."

At tick 48, the VIP reaches the extraction point. **MISSION COMPLETE.**

Sofia pumps her fist. "I had to use both rescues but it worked!"

**What she learned:** Buffer hygiene on the VIP is the first line of defense. Rescue rules are the second. The listen/ignore config — something she'd been neglecting since M3 — suddenly matters profoundly.

**UI Annotations:**
- VIP golden border: 2px solid #FFD700, pulses at 60bpm resting
- Overload state: border shifts to #FF8C00 (amber), 3px, 120bpm pulse
- "⚡1/3" counter: 10px amber text, positioned above VIP tile, persistent until mission end
- Immunity aura: white (#FFFFFF at 40% opacity) radial gradient, 1.5 tile radius, pulsing at 80bpm
- Context bar: 4 horizontal pips, each 8×3px, cool blue (#4FC3F7) when empty, amber (#FFB74D) when noise-filled, red (#EF5350) when at capacity

---

### Journey: Datu, 38, Cebu — Network Engineer, Factorio/Screeps Veteran

**Context:** Mission 9, Datu's second escort mission. He completed M7's escort with zero overloads using a tight diamond formation. Now M9 throws a curveball: the VIP must traverse a longer path with 3 enemy spawners, and the board has "signal dead zones" — tiles where relay signals don't propagate (jungle canopy interference). His relay network can't cover the full path.

**Minute 0:00 — Architecture Planning**
Datu sees the problem immediately. The dead zones create two disconnected relay regions. The VIP's path crosses from region A to region B at tile D4. His relay in region A can't communicate with units in region B. If the VIP gets in trouble in the dead zone between regions, no signal will reach the striker in region B.

He thinks: "I need a local emergency protocol that doesn't depend on the relay network. Like a dead man's switch."

He configures two architecture tiers:
- **Tier 1 (relay-mediated):** VIP ON_THREAT hook → relay-net → nearest striker. Works in relay coverage. Latency: 2-3 ticks.
- **Tier 2 (direct emergency):** Every escort unit gets a rule: `IF distance_to(VIP) < 2 AND VIP_buffer > 75% THEN move_toward(VIP)`. No hook chain. No relay. Pure local observation. Latency: 0 ticks (same-tick rule evaluation).

He also configures the VIP's context to aggressively filter: listen only to `threat_alert` with fidelity > 0.6. The 4-slot buffer should stay nearly empty.

**Minute 2:00 — The Dead Zone Crossing**
At tick 30, the VIP enters the dead zone. The relay signal lines on the board go dark — the subway map lines fade to grey as they cross the dead zone tiles. The VIP is now protected only by Tier 2: the local escort units and their direct observation rules.

At tick 33, an enemy emerges from spawner 2, inside the dead zone. SCOUT-1 spots it at perception range 5 — but the hook chain (ON_ENEMY_SPOTTED → relay → striker) goes nowhere. The relay is out of range. The signal arrow launches from the scout, hits the dead zone boundary, and fizzles — a visual of the signal bouncing off a grey wall and dissipating. The kulintang chord loses the relay voice — a sustained tone drops, leaving emptiness.

Datu watches intently. This is where Tier 2 matters.

SCOUT-1's Tier 2 rule fires: the VIP's buffer is at 0/4, but the enemy is 2 tiles away and closing. The scout can't assess VIP buffer percentage directly — but its patrol brings it between the VIP and the threat. The scout engages the enemy.

The enemy is eliminated at tick 35. The VIP never took buffer damage. Tier 2 held.

**Minute 3:30 — The Double Dead Zone Breach**
Tick 41. Two enemies converge from spawners 2 and 3, both inside the dead zone. SCOUT-1 engages one. SCOUT-2's patrol has it facing the wrong direction — it doesn't spot the second enemy until it's 1 tile from the VIP.

Tick 42: enemy adjacent. Noise flood begins. VIP buffer: 0/4 → 3/4. Heartbeat accelerates. Amber flicker.

Tick 43: buffer full. OVERLOAD. "⚡1." Stun tick. SCOUT-2's rescue rule evaluates — the scout is adjacent! Rescue triggers. Enemy eliminated. Immunity activates.

Datu nods. "One overload, but the rescue chain worked locally. No relay needed."

**Minute 5:00 — Inspector Analysis**
Datu scrubs the Inspector timeline, studying the dead zone crossing tick by tick. He pulls up the signal genealogy for the failed relay signal at tick 33 — the arrow that bounced off the dead zone wall. He can see the hypothetical: if the relay had been in range, the striker would have arrived at tick 36. But the local Tier 2 response resolved it at tick 35 without the relay.

He opens a notepad and diagrams: "Dead zones force local autonomy. The relay network is the strategy layer; local rules are the tactics layer. Both must work independently." He maps this to his work: "This is exactly like our microservice mesh when the service discovery goes down. Local health checks keep things alive even when the orchestration layer is offline."

**Minute 6:00 — Retry for Zero Overloads**
Datu wants the clean run. He adjusts SCOUT-2's patrol path to face the spawner 3 direction during the dead zone crossing ticks. He adds a new rule to the VIP itself: `IF buffer > 50% THEN hold_position` — making the VIP stop moving when its buffer gets noisy, rather than continuing into danger.

Retry. Tick 41: SCOUT-2 spots both enemies early due to the adjusted patrol. One engaged by each scout. VIP buffer stays at 0/4. Zero overloads. **MISSION COMPLETE — PERFECT.**

**What he learned:** Two-tier architecture (relay-mediated + local-autonomous) as a robust pattern for unreliable networks. The dead zone forced him to think about what works when the communication layer fails — a skill directly transferable to distributed systems engineering.

---

### Journey: Aisha, 14, Batangas — Mobile Legends Player, First Strategy Game

**Context:** Mission 7, first escort mission. Aisha plays primarily on her older Android phone. She's comfortable with context overload from M3-4 but hasn't internalized buffer management deeply. She tends to use default configurations and learn through trial-and-error rather than planning.

**Minute 0:00 — Boot Log Confusion**
The boot log explains the VIP mechanics. Aisha reads "proximity incursion will flood context window" and thinks: "So enemies fill its brain with junk? Like when my relay got stunned in M4?"

She uses the pre-built escort template suggested by the boot log (a basic triangle formation with 2 scouts, 1 striker, 1 relay). She doesn't modify any of the default rules or context configs. She notices the VIP has a tiny context bar — 4 pips — and thinks: "That's really small. My striker has 8."

**Minute 1:00 — EXECUTE**
She hits EXECUTE without further planning. She's learned from M1-6 that the first attempt is for learning — she'll fix things in the retry.

**Minute 2:00 — The Collapse**
The escort moves for 15 ticks. At tick 16, an enemy reaches the VIP. The context bar fills. OVERLOAD. "⚡1." The stun tick passes — no rescue (default rules don't include a rescue behavior). The enemy is still adjacent.

Tick 17: noise continues flooding. Buffer fills again immediately (only 1 tick since compaction). OVERLOAD. "⚡2." Stun.

Tick 18: same. OVERLOAD. "⚡3."

**VIP ELIMINATED.** Three overloads in 3 ticks. The formation had no rescue capability and the default rules didn't address VIP protection.

**Minute 2:30 — Inspector Learning**
Aisha enters the Inspector. She clicks the VIP and sees the rapid overload sequence. The stun timeline shows three amber blocks in succession — boom, boom, boom. No rescue attempts. No allied units moved toward the VIP.

The Inspector highlights: "No rescue rule detected in escort formation. Consider adding: IF ally_overloaded THEN move_toward(overloaded_ally)."

The suggestion is a diegetic "system recommendation" — the AI (the player character) learning from its own failure. Aisha copies the suggestion and adds it to SCOUT-1's rule list.

**Minute 3:30 — Second Attempt**
With the rescue rule added, the second attempt goes better. At tick 16, the enemy arrives. Buffer floods. OVERLOAD. "⚡1." SCOUT-1's new rescue rule fires. The scout moves adjacent. Rescue. Enemy eliminated.

But at tick 30, another enemy arrives from a different direction. OVERLOAD. "⚡2." SCOUT-1 is too far away this time (it returned to patrol position). SCOUT-2 has no rescue rule — Aisha only added it to SCOUT-1.

Tick 31: enemy still adjacent. VIP eliminated.

**Minute 4:30 — Third Attempt**
Aisha adds the rescue rule to ALL escort units. She also notices (from the Inspector) that the VIP's buffer was pre-filled with 2 entries when the second enemy arrived. She tentatively opens the VIP's context config and toggles "ignore: position_report." She doesn't fully understand why, but the Inspector hinted at it.

Third attempt. Tick 16: overload, rescue by SCOUT-1. "⚡1." Tick 30: this time the buffer is empty (no position reports). The noise flood takes 2 ticks instead of 1 to fill the buffer. SCOUT-2 arrives in time. Rescue. "⚡2."

Tick 48: VIP reaches extraction. **MISSION COMPLETE** with 2 overloads.

Aisha didn't get a perfect run, but she learned: rescue rules need to be on every escort unit, and buffer hygiene matters. She'll optimize in later missions.

**What she learned:** The escort mission taught her to care about listen/ignore configuration — something she'd ignored for 6 missions. The dramatic consequence (VIP death) motivated her to engage with buffer management in a way that abstract context overload on her relay never did.

---

### Journey: DeepAgent_TTV, 28, Twitch Streamer — Diamond-Rank Gauntlet Player

**Context:** Gauntlet escort mission at Nightmare difficulty (1 overload = elimination, 0 immunity, VIP buffer pre-filled 2/4). DeepAgent has 300+ hours, knows every mechanic intimately. Chat has 1,200 viewers. He's running a stealth doctrine: minimal EM emissions, dark network (no relays), direct hooks only.

**Minute 0:00 — "Chat, This Is the One-Tap Escort"**
DeepAgent explains to chat: "Nightmare escort. One overload and the VIP is toast. Buffer starts 2/4, noise rate 4 per tick. That means ONE TICK of enemy adjacency fills the buffer and overloads. Zero margin. We need to prevent any enemy from ever touching the VIP. Period."

Chat: "OSOK VIP let's go 🔥" / "RIP run" / "impossible"

**Minute 0:30 — Architecture**
DeepAgent's config is extreme:
- 4 scouts in a rotating box formation around VIP, each with perception 5 and ON_ENEMY_SPOTTED → direct hook (no relay, no EM) → all 4 scouts simultaneously
- 2 strikers at range 3, patrolling the perimeter in opposite circles
- VIP context: listen to NOTHING. All channels ignored. Buffer stays at 2/4 (pre-filled entries are mission-set and can't be evicted — they're "firmware")
- No relay at all. Zero EM emissions. The enemy can't detect the formation.

The stealth doctrine means no enemy should be able to locate the VIP in the first place. If one does, the buffer math is: 2/4 filled, noise rate 4/tick = overload in 1 tick. One tick. No rescue possible.

**Minute 2:00 — Sealed Watch**
Chat is on edge. The formation moves silently through Bohol hills. No signal lines visible — dark network. The scouts' perception cones sweep ahead. At tick 18, SCOUT-2 spots an enemy at range 4. The direct hook fires — no visible signal line (EM-dark), but a subtle grey pulse travels between scouts (visible only in Inspector afterward). All 4 scouts register the threat. STRIKER-1's rule fires: `IF enemy_spotted AND distance < 4 THEN engage`.

STRIKER-1 intercepts the enemy at tile F3, 2 tiles from the VIP. Clean elimination. No alarm. No buffer damage.

Chat: "CLEAN" / "stealth god" / "VIP didn't even notice"

**Minute 3:00 — The Crisis**
Tick 34. An enemy spawns adjacent to a terrain feature that blocked SCOUT-3's perception cone. By the time SCOUT-3's patrol rotates to face it, the enemy is at range 1 from the VIP.

Tick 35: enemy moves adjacent to VIP. Buffer: 2/4 → noise flood at 4/tick → immediately 4/4+. OVERLOAD. "⚡1/1."

**VIP ELIMINATED.**

The heartbeat flatlines. The golden border shatters. DeepAgent stares at the screen for 2 full seconds.

Chat ERUPTS: "NOOOOO" / "ONE TAP" / "THE TERRAIN BLIND SPOT" / "F F F F F" / "clip it clip it"

**Minute 3:30 — Inspector**
DeepAgent scrubs to tick 34. He clicks the terrain tile and studies SCOUT-3's perception cone. The cone's edge just barely misses the tile the enemy occupied. "Chat, look at this. The cone was ONE TILE off. If I'd had scout-3 patrolling one tile further east, it would have spotted the enemy at range 4 and the striker would have intercepted."

He opens the Plan screen ghost preview and adjusts SCOUT-3's patrol waypoint by one tile. The ghost preview shows the adjusted perception cone now covering the terrain blind spot.

"One tile. That's the margin at Nightmare. One tile."

Chat: "ONE TILE" / "precision gaming" / "this is why I watch"

**What DeepAgent's audience learned:** At maximum difficulty, the Graduated Response model IS effectively OSOK. The drama comes from the analysis — one tile of patrol path adjustment. The clip of the blind-spot elimination will get 50K views. The follow-up clip of the successful retry (clean run, zero overloads, stealth doctrine, VIP never even knows it was in danger) will get 100K.

**UI Annotations:**
- Nightmare difficulty indicator: red skull icon next to VIP portrait, "⚡ 1/1" (one overload = fatal)
- Dark network: no visible signal lines during sealed watch, grey ghost pulses visible only in Inspector
- Terrain blind spot: Inspector shows perception cone as semi-transparent wedge with red highlight on the uncovered tile
- Pre-filled VIP buffer: 2 pips permanently filled in grey (firmware), 2 pips available in blue

---

## Interaction Effects

### × One-Shot-One-Kill (Locked)
The Graduated Response model preserves OSOK's identity by making it the end state, not the first contact. Enemy adjacency still leads to VIP death — just through the buffer system rather than direct combat. At Nightmare difficulty, OSOK is restored in full. The model is a tunable spectrum with OSOK at one end.

### × Context Overload (Locked)
The model reuses the locked overload mechanic. VIP overload IS context overload — same visual (sparking, jitter), same stun (1 tick), same compaction. The only addition is the cumulative counter (⚡) which creates permanent consequence.

### × Signal Latency (Locked — 1 tick/hop)
Rescue viability is directly gated by signal latency. Relay-mediated rescue is too slow for tight survival windows. This teaches players to build low-latency emergency channels (direct hooks bypassing the relay network), which is a critical real-world architecture pattern.

### × Escort Formation Design (5.08e)
The survival window math directly constrains formation design. Tighter formations = more rescue time. Detached formations = near-OSOK fragility. The math is transparent and tunable.

### × EM Emissions (Locked)
Rescue hooks fire signals, which emit EM noise. A rescue in progress reveals the escort's position to enemies. The stealth doctrine (dark network, no relays) trades rescue capability for concealment. This tradeoff is the escort mission's deepest strategic layer.

### × Buffer Management (Core Mechanic)
VIP buffer health determines survival time. A clogged VIP buffer = instant overload on contact. A clean VIP buffer = 2-3 ticks of survival time. Buffer hygiene, previously an optimization, becomes a survival skill in escort missions.

### × Inspector Debrief (Locked)
Every component of the VIP survival chain is traceable in the Inspector: buffer state at each tick, noise flood rate, overload timing, rescue rule evaluation, signal chain latency. The Inspector turns escort mission failures into detailed diagnostic exercises.

### × Difficulty Scaling (Campaign Design)
The six parameters (buffer size, noise rate, overload threshold, immunity, pre-fill, rescue window) create a tunable difficulty space. Early escort missions are forgiving; Nightmare escort missions are functionally OSOK. The same mechanic serves both audiences.

### × Escort Formation Presets (5.08e-ii)
Pre-built escort blueprints (Diamond Formation, Sensor Net, Stealth Escort) can be designed with rescue rules pre-configured, reducing the cold-start problem for new players encountering their first escort mission.

### × VIP Heartbeat Audio (5.08e-iii)
The heartbeat audio vocabulary extends naturally: steady (safe), accelerating (buffer filling), stuttering (overloaded), flatline (eliminated), reinforced (immune). The audio alone tells the story.

---

## The TikTok Clip

**"THE RESCUE AT TICK 39"**

Split screen. Left: the sealed watch board. Right: the player's face (or a reaction overlay).

- Tick 37: enemy appears near VIP. Heartbeat accelerates.
- Tick 38: enemy adjacent. Buffer pips climbing. Amber flash.
- Tick 39: OVERLOAD. VIP sparking. "⚡2/3." One more and it's over. The countdown: 1 tick.
- Tick 40: SCOUT-3 arrives. Cyan flash. Enemy eliminated. VIP recovers. White immunity aura.
- Player exhales visibly. Chat overlay: "CLUTCH" / "RESCUE" / "🫡🫡🫡"

15 seconds. The drama is inherent. The rescue mechanic creates the moment. Without it — without the stun window — the clip would be: "enemy reached VIP, VIP died, mission failed." No drama. No rescue. No clip.

---

## Recommendation

**Model F: The Graduated Response.**

It preserves OSOK's thematic identity through its difficulty scaling (Nightmare = OSOK). It creates dramatic rescue moments that make escort missions the most emotionally intense experience in the game. It reuses existing vocabulary (context overload, buffer management, signal latency) rather than introducing parallel mechanics. It's deeply diagnosable in the Inspector. And it teaches the right real-world lesson: design for recovery, not perfection.

The stun immunity cooldown at 3 ticks (Standard) prevents stun-lock without enabling stun-tanking. The cumulative ⚡ counter (3 overloads = elimination) creates long-term pressure that compounds across the mission. And the buffer-dependent survival window rewards the player who manages VIP context hygiene — turning escort missions into the game's most demanding test of information architecture skills.

---

## New Aspects Discovered

- **5.08e-i-a — Rescue skill vs. adjacency rescue:** Should rescue require a specific `rescue` skill (limited to certain unit types, consuming a skill slot) or should any adjacent ally automatically trigger rescue? Skill-gated rescue creates composition decisions (who has rescue equipped?); adjacency rescue creates formation decisions (who is adjacent?). The skill version adds depth but raises the escort tax on configuration.
- **5.08e-i-b — VIP buffer firmware entries:** The pre-filled buffer entries at higher difficulties (2/4 filled with unremovable "firmware" data). What are these entries? Mission briefing data the VIP is transporting? Encrypted intelligence? Can the player read firmware entries in the Inspector? Do they provide narrative content? The firmware as both difficulty mechanic and worldbuilding opportunity.
- **5.08e-i-c — Enemy noise composition as diagnostic information:** The 3-4 noise entries per tick that flood the VIP buffer — are they uniform garbage, or do they contain readable enemy intelligence? If the player configures the VIP to `compress` rather than `filter` the noise, can useful enemy data be extracted from the flood? "The noise IS the signal" as an advanced escort strategy.
- **5.08e-i-d — Overload counter persistence across retries:** Does the ⚡ counter reset on retry, or does it carry over? Reset = each attempt is independent. Carry-over = cumulative pressure across the mission's retry loop, punishing repeated failures. Most games reset; carry-over is punitive but creates "I can't afford another hit" tension that compounds learning pressure.
- **5.08e-i-e — Multi-VIP escort formations:** Missions with 2-3 VIPs traveling in convoy or splitting to separate extraction points. The formation design challenge multiplies — can one architecture protect multiple fragile targets? The "convoy problem" as a late-campaign design space.

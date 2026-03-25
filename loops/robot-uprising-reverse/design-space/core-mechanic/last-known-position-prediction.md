# 2.25 — The "Last Known Position" Prediction Chain

## The Option

When a unit's buffer contains positional data about an enemy that is several ticks old, the unit faces a fundamental distributed-systems problem: act on stale data, wait for fresh data, or **predict** where the enemy has moved. This is dead reckoning — extrapolating a current position from a last-known position, elapsed time, and an estimated velocity vector. The question is not whether prediction is useful (it obviously is) but **where prediction lives in the architecture** and what costs it imposes on the player's information system.

Three implementation options, each with distinct mechanical consequences:

### Option A: Built-In Skill — Any Unit Can Predict

**Mechanical specification:** A new skill called `predict` is added to the universal skill list. Any unit type can equip it. When `predict` fires, it scans the unit's buffer for positional entries older than a configurable staleness threshold (default: 2 ticks). For each stale entry, it generates a **predicted datum** — a synthetic buffer entry with `signal_type: PREDICTED_POSITION`, containing the original position offset by `(elapsed_ticks * estimated_velocity)`. The predicted datum replaces the stale original in-buffer (same slot), preserving buffer capacity. Estimated velocity defaults to 1 tile/tick in the last-known heading direction. If no heading is available, the prediction fans into a probability cone rendered as multiple candidate positions.

- **Buffer cost:** Zero net slots consumed (replacement, not addition), but the skill activation itself consumes the unit's action for that tick — a unit predicting cannot also move or attack.
- **Accuracy decay:** Prediction error compounds. Each tick of staleness adds +1 tile of potential error radius. A 3-tick-old prediction has a 3-tile error cone. A 5-tick-old prediction on an 8x8 grid is nearly useless — the enemy could be almost anywhere.
- **Skill slot cost:** Occupies one skill slot, competing with engage, compress, patrol, evade, hack, etc.
- **Rule interaction:** Rules can reference `PREDICTED_POSITION` as a distinct signal type, allowing the player to write rules like `WHEN predicted_position AND age < 3 → MOVE_TOWARD` while ignoring predictions older than 3 ticks.

### Option B: Query Modifier — Rule Conditions Reference Predicted Positions

**Mechanical specification:** No new skill. Instead, the rules language gains a `predicted()` modifier that can wrap any positional condition. Writing `WHEN predicted(ENEMY_SPOTTED) → ENGAGE` means: "if my buffer contains an `ENEMY_SPOTTED` entry older than the staleness threshold, evaluate the condition as if the enemy were at its dead-reckoned position." The prediction happens implicitly during rule evaluation — no skill slot consumed, no action spent, no buffer mutation.

- **Buffer cost:** Zero. The prediction is ephemeral — computed during rule evaluation, never stored.
- **Action cost:** Zero. The unit can still move, attack, or use skills on the same tick.
- **Accuracy:** Same compounding error as Option A, but the player has less visibility into the prediction because it never materializes as a buffer entry. The prediction is invisible infrastructure.
- **Rule complexity:** Adds a modifier keyword to the rules language. Interacts with every positional condition. The player must learn when `predicted()` helps and when it creates false confidence.
- **Inspector visibility:** The Inspector would need a "prediction overlay" mode showing what positions were predicted during rule evaluation — otherwise the player cannot debug why a striker moved toward an empty tile.

### Option C: Dedicated Specialist Prediction Unit

**Mechanical specification:** A new Specialist sub-role: the **Predictor**. This is a Specialist configured with a unique `extrapolate` skill that consumes stale positional data from its buffer, computes dead-reckoned positions, and **broadcasts predicted positions on a dedicated prediction channel**. Other units subscribe to the prediction channel via hooks and receive predicted positions as incoming hook messages — treated identically to relay-forwarded scout observations, but tagged with `signal_type: PREDICTED_POSITION` and a confidence score (0.0 to 1.0, decaying with staleness).

- **Buffer cost:** The Predictor's own buffer (10 slots) is consumed by the stale data it processes. Downstream units receive predicted positions as hook messages, consuming one buffer slot each.
- **Architecture cost:** Requires a dedicated unit, a dedicated channel, hook slot allocation on receiving units. The prediction system is a visible, debuggable node in the information architecture — not hidden inside another unit's evaluation.
- **Latency cost:** Prediction adds signal latency. The scout observes (tick N), sends to predictor (arrives tick N+1), predictor extrapolates and broadcasts (tick N+2), striker receives prediction (tick N+3). The prediction is 3 ticks old before the striker acts on it — and the prediction itself was based on data from tick N. Five ticks of total staleness.
- **Architectural resonance:** This option mirrors the game's core design philosophy — information processing happens through wired-together units, not through hidden internal logic. Prediction becomes a visible system the player architects, not a black-box modifier.

---

## Player Journeys

#### Journey: Tomasz, 28, Backend Engineer Who Builds Event-Driven Microservices

**Context:** Mission 6. Tomasz has a working scout-relay-striker chain. His scouts report enemy positions through `east-net`, a relay compresses and forwards on `strike-net`, and two strikers engage. The problem: enemies are moving fast, and by the time a position report traverses scout → relay → striker (3 ticks of signal latency), the enemy has moved 2-3 tiles from the reported position. His strikers keep arriving at empty tiles.

**Minute 0:00 — The Stale Engagement**
Tomasz hits Execute. His Scout-A spots an enemy at F6 on tick 4 and fires on `east-net`. The relay receives at tick 5, compresses, forwards on `strike-net`. Striker-B receives at tick 6 and moves toward F6. By tick 6, the enemy has moved to D4. Striker-B arrives at F6 on tick 8 — nobody there. The enemy is now at C3, four tiles away. Striker-B stands on an empty tile, buffer full of a stale position it dutifully followed.

**Minute 0:45 — The Prediction Hypothesis**
In the Inspector, Tomasz scrubs to tick 6 and examines Striker-B's buffer. He sees the F6 datum, tagged `tick_created: 4`. Two ticks stale. He thinks: "If the striker knew the enemy was heading southwest at 1 tile/tick, it could have aimed for D4 instead of F6." He adds a Predictor Specialist to his architecture, wired between the relay and the strikers. The Predictor subscribes to `strike-net`, extrapolates, and broadcasts on `predicted-strike-net`.

**Minute 2:30 — The Correct Prediction**
Re-execute. Same enemy movement pattern. This time, the Predictor receives the F6 report at tick 6, computes that the enemy was heading southwest (based on two sequential observations from Scout-A), and broadcasts a predicted position of D4 on `predicted-strike-net`. Striker-B receives at tick 7 and moves toward D4. The enemy is at D4 on tick 7. Striker-B arrives tick 8 — kill confirmed. Tomasz watches the sealed replay and pumps his fist.

**UI Annotations:**
- The Predictor unit displays a pulsing concentric ring animation when extrapolating — ripples expanding outward from the unit's tile, visualizing the "projection" of position data into the future
- Striker-B's buffer shows the predicted datum with a dashed-outline icon instead of a solid icon, signaling "this is not a direct observation"
- On the battlefield, the predicted enemy position appears as a **ghost marker** — a translucent, flickering silhouette at the predicted tile, distinct from the solid red icon of a confirmed sighting
- The Inspector's channel view shows `predicted-strike-net` messages tagged with a confidence percentage: "D4 (conf: 72%)"

#### Journey: Priya, 22, CS Student Who Just Learned About Kalman Filters in Class

**Context:** Mission 8. Priya has been using prediction aggressively. She has two Predictors, each covering a quadrant of the board. Her strikers act almost exclusively on predicted positions. She has stopped subscribing her strikers to direct scout channels — why bother with raw data when predictions are better?

**Minute 0:00 — The Prediction Cascade Failure**
Priya executes. Her scout spots an enemy at G2 heading north. The Predictor extrapolates: G1 next tick, then G0... but G0 is off the board. The enemy actually turned east at G1 (it hit the board edge). The Predictor, working from a linear velocity model with no awareness of board boundaries, broadcasts a predicted position of G0 — an invalid tile. The striker's rules have no clause for invalid positions. The striker freezes, evaluating a rule that matches but produces no valid movement. It wastes three ticks standing still.

Meanwhile, the enemy has moved to H1 and is flanking Priya's relay. The relay dies. The prediction channel goes silent. Both strikers lose their only source of targeting data — they unsubscribed from direct scout reports two missions ago. Total information blackout.

**Minute 1:15 — The False Confidence Lesson**
In the Inspector, Priya traces the failure. The Predictor's buffer shows the linear extrapolation. The confidence score was 45% — below 50% — but her striker rules didn't check confidence. She wrote `WHEN predicted_position → ENGAGE` with no confidence threshold. She also sees that her architecture has a single point of failure: the relay. When the relay died, the entire prediction pipeline collapsed because the Predictor was downstream of it.

**Minute 3:00 — The Defensive Redesign**
Priya adds confidence thresholds to her striker rules: `WHEN predicted_position AND confidence > 60 → ENGAGE`. She also re-subscribes her strikers to direct scout channels as a fallback: `WHEN enemy_spotted → ENGAGE` as a lower-priority rule. And she adds a second relay for redundancy. The distributed-systems insight clicks: prediction is a **cache**, and caches need invalidation strategies and fallback paths to the source of truth.

**UI Annotations:**
- Invalid predicted positions flash red with a broken-grid icon — a tile outline with a crack through it
- The confidence percentage on ghost markers changes color: green (>70%), yellow (40-70%), red (<40%)
- When a prediction pipeline breaks (relay death), all downstream ghost markers simultaneously pop and vanish — a burst of translucent shards scattering from each predicted tile, making the cascade failure visually dramatic
- The Inspector's architecture view highlights the dead relay in red, with all downstream connections rendered as broken lines

#### Journey: Marcus, 35, Tabletop Wargamer, No Programming Background

**Context:** Mission 4. Marcus is still learning the basics. He has not unlocked the Specialist unit yet. He is using Option A (built-in predict skill) on a Scout.

**Minute 0:00 — The Accidental Prediction**
Marcus equips his Scout-A with the `predict` skill, replacing `evade`. He doesn't fully understand what it does — the tooltip says "estimate enemy movement from old data." He hits Execute. The scout spots an enemy at C5 on tick 2. The enemy moves out of perception range on tick 3. On tick 4, the scout's `predict` skill fires on the stale C5 datum, replacing it with a predicted position of C4 (one tile south, assuming the enemy continued its last-known heading). The scout's rules say `WHEN enemy_spotted → MOVE_TOWARD`. But the buffer entry is now `PREDICTED_POSITION`, not `ENEMY_SPOTTED`. No rule matches. The scout defaults to patrol.

**Minute 0:30 — The Type Mismatch**
Marcus watches the replay confused — why did the scout stop chasing? In the Inspector, he sees the buffer entry changed from `ENEMY_SPOTTED` (green icon) to `PREDICTED_POSITION` (dashed green icon). His rule only triggers on `ENEMY_SPOTTED`. He needs to add a second rule: `WHEN predicted_position → MOVE_TOWARD`. This is a vocabulary lesson — the prediction system introduces a new signal type that existing rules don't automatically handle.

**Minute 1:30 — The Wasted Action**
Marcus adds the rule and re-executes. Now the scout chases the predicted position. But he notices the scout is slower — it only moves every other tick. The `predict` skill consumes the scout's action on the ticks it fires, preventing movement. The scout is predicting on even ticks and moving on odd ticks, effectively halving its speed. The enemy outruns it. Marcus realizes he traded `evade` (a survival skill) for `predict` (an intelligence skill) on a 6-buffer unit that can barely hold enough data to predict accurately anyway.

**UI Annotations:**
- The scout's action indicator (a small icon below the unit) alternates between a brain icon (predicting) and a boot icon (moving), making the action-cost tradeoff visible
- Predicted positions on the scout's path show as dotted footprints leading toward the ghost marker, versus solid footprints for confirmed-position movement
- When the prediction is wrong (enemy went a different direction), the ghost marker pops with a subtle "miss" animation — the silhouette dissolves into static

---

## Strengths and Weaknesses

### Prediction Accuracy vs. False Confidence

The fundamental tension: prediction converts **known uncertainty** (I have stale data) into **false certainty** (I have a predicted position). Stale data is honest — the buffer entry says "tick 4, position F6" and the player can see it's old. A predicted position says "the enemy is probably at D4" and the unit acts as if it's true. When the prediction is right, the system looks brilliant. When it's wrong, the system looks worse than no prediction at all — because the unit confidently moved to the wrong tile instead of waiting for fresh data or patrolling to gather new observations.

This mirrors the **stale cache problem** in distributed systems. A cache hit on stale data is worse than a cache miss, because the miss triggers a fresh lookup while the stale hit produces a confidently wrong answer. Prediction in Robot Uprising is a cache — and it needs TTL (time-to-live) expiration, confidence thresholds, and fallback strategies, just like a real cache.

### Stale Data Amplification

Prediction doesn't solve staleness — it **launders** it. A 3-tick-old observation becomes a "current" prediction, but the prediction's accuracy depends entirely on assumptions (linear velocity, no direction changes, no board-edge bounces) that degrade rapidly. On an 8x8 grid where units move 1 tile/tick, a 4-tick-old prediction has a potential error radius of 4 tiles — meaning the enemy could be on any of roughly 40 tiles (the area of a circle with radius 4, clipped to the board). The prediction picks ONE of those 40 tiles. It is right roughly 2.5% of the time for a randomly moving enemy. Prediction is only useful when enemy movement is highly predictable (linear, patrol routes) and rapidly becomes noise for enemies that change direction.

### Architectural Tradeoffs by Option

| Dimension | A: Built-In Skill | B: Query Modifier | C: Dedicated Predictor |
|-----------|-------------------|-------------------|----------------------|
| Buffer cost | Zero (replacement) | Zero (ephemeral) | +1 slot per prediction received |
| Action cost | Consumes action | Free | Free for receivers; Predictor dedicates its existence |
| Debuggability | Medium — visible in buffer | Low — invisible during execution | High — visible unit, visible channel, visible messages |
| Architecture cost | One skill slot | One keyword learned | One unit + one channel + hook slots |
| Failure mode | Unit does less (lost action) | Unit acts on invisible bad data | Pipeline failure cascades visibly |
| Teaching value | Moderate | Low | High — mirrors real system architecture |

---

## Interaction Effects

### Signal Latency Compounding

Prediction interacts **multiplicatively** with signal latency. Every hop in a relay chain adds 1 tick of staleness. A scout → relay → predictor → striker chain has 3 hops of latency before the prediction even begins. If the Predictor then extrapolates 3 ticks forward to compensate, it is projecting from a 3-tick-old observation — and its 3-tick projection assumes those 3 ticks of movement followed the velocity vector observed at tick N. Total uncertainty: 6 ticks of compounded error. On an 8x8 grid, this is nearly the entire board diagonal.

This creates a natural design pressure toward **shorter relay chains** when prediction is in play, which conflicts with the game's core relay-chain mechanic. The player must choose: deep relay chains for coverage (wide perception net) or short chains for prediction accuracy (fast, fresh data). This is the **CAP theorem in miniature** — you cannot have full consistency (accurate predictions), full availability (every striker gets data), and partition tolerance (relay chains spanning the board) simultaneously.

### Buffer Aging and Eviction Policy Interaction

Under FIFO eviction, stale positional data is naturally evicted by newer entries. Prediction creates a perverse incentive: if the `predict` skill replaces stale data with a fresh-looking prediction (Option A), the predicted datum resets the age counter, making it appear "new" and resistant to eviction. A buffer could fill up with increasingly inaccurate predictions that look fresh to the eviction system. Under weighted eviction policies, predicted data could be assigned lower weight to counter this — but only if the eviction system is weight-aware and the player configured weights correctly.

### The Teaching Arc: Distributed Systems Concepts

Prediction is where Robot Uprising's distributed-systems curriculum becomes explicit. Without prediction, the game teaches buffer management (memory), signal routing (networking), and eviction policies (cache management). With prediction, it adds:

- **Eventual consistency:** Units may have different predicted positions for the same enemy. Two strikers receiving predictions from different Predictors (with different staleness levels) may converge on different tiles. The system is eventually consistent — if fresh data arrives, predictions update — but in the interim, units disagree about reality.
- **Optimistic vs. pessimistic strategies:** Prediction is optimistic concurrency — "assume the data is close enough and act." The alternative (wait for fresh data) is pessimistic — "don't act until confirmed." Both have costs. Optimistic wastes actions on wrong predictions. Pessimistic wastes ticks waiting while enemies move freely.
- **Vector clocks / causal ordering:** The `tick_created` field on predictions is essentially a Lamport timestamp. Units can use it to determine which prediction is newer, but not whether one prediction causally supersedes another (a prediction from Predictor-A based on Scout-1 data vs. a prediction from Predictor-B based on Scout-2 data — which is more authoritative?).
- **Circuit breakers:** Priya's journey illustrates the need for circuit-breaker patterns — if prediction confidence drops below a threshold, stop acting on predictions and fall back to direct observation. This is exactly the circuit-breaker pattern in microservice architectures.

---

## Comparable Games and Real Systems

### Fog of War in RTS Games (StarCraft, Age of Empires)

RTS fog of war shows last-known positions as static ghost images. An enemy base scouted 5 minutes ago still appears on the minimap where it was last seen — no prediction, no updating, just a snapshot frozen in time. Players learn to distrust old fog-of-war data through experience. The key difference: RTS ghosts are passive (the game shows them), while Robot Uprising prediction is active (the player configures units to compute extrapolations). RTS teaches "old data is unreliable." Robot Uprising teaches "you can try to compensate for old data, but compensation has costs and failure modes."

### Submarine Tracking (Sonar and TMA)

Real-world submarine hunting uses Target Motion Analysis (TMA) — a process almost identical to Robot Uprising's prediction chain. A sonar contact provides a bearing and range at time T. The contact fades. The tracking team plots the last-known position, estimates the submarine's speed and heading, and projects where it should be now. They then direct assets to the predicted intercept point. If the submarine changed course after the last contact, the prediction is wrong and the hunter arrives at empty ocean. The hunter must then re-acquire contact, update the prediction, and try again. This iterative observe-predict-verify loop is exactly the gameplay loop of a well-architected prediction system in Robot Uprising.

### Dead Reckoning in Navigation and Networking

Dead reckoning in maritime navigation — estimating current position from last-known position plus heading and speed — accumulated error that required periodic "fixes" from celestial observation or landmarks. In networked games, dead reckoning is used to interpolate entity positions between network updates: the client predicts where a player is moving based on last-known velocity, then snaps to the corrected position when the server update arrives. The "snap correction" is visually jarring — which is why modern games use smoothing. Robot Uprising's ghost markers serve the same function: the ghost shows the prediction, and when fresh data arrives, the ghost either confirms (fades into a solid icon) or corrects (jumps to the actual position with a visual pop).

### Stale Cache Invalidation (Distributed Databases)

The prediction system is architecturally identical to a read-through cache with TTL-based expiration. The scout's observation is the source of truth (database). The prediction is the cached value. The staleness threshold is the TTL. When the cache expires (prediction confidence drops below threshold), the system must either serve stale data with a warning (act on low-confidence prediction) or block until fresh data arrives (wait for new scout observation). Cache invalidation is famously one of the two hard problems in computer science — and Robot Uprising makes it a game mechanic.

---

## Sensory Description: What Prediction Looks Like on the Battlefield

**Confirmed positions** render as solid red diamond icons on enemy tiles — bright, crisp, fully opaque. A confirmed position has a thin solid border and a subtle drop shadow grounding it to the tile.

**Predicted positions** render as **ghost markers** — translucent silhouettes of the enemy icon, rendered at 40-60% opacity depending on confidence. The ghost marker pulses slowly (one pulse per 2 ticks), breathing in and out as if uncertain of its own existence. Its border is dashed rather than solid — four short dashes forming the diamond outline instead of a continuous line. The color desaturates as confidence drops: a high-confidence prediction (>70%) is a dim red ghost; a medium prediction (40-70%) fades toward gray-red; a low prediction (<40%) is nearly transparent gray, barely visible against the board.

**The transition from confirmed to predicted** is a key micro-animation. When a scout loses visual contact and the position datum ages past the staleness threshold, the solid red diamond does not simply disappear. Instead, it **dissolves** over one tick — the solid fill drains away like ink bleeding out, leaving only the dashed outline. If prediction is active, a ghost marker simultaneously fades in at the predicted position, connected to the dissolving original by a faint dotted line showing the extrapolation vector. The dotted line is the velocity arrow — it shows the player exactly what assumption the prediction is based on.

**When prediction is wrong** — when fresh data reveals the enemy is not at the predicted tile — the ghost marker shatters. The dashed outline fragments into four pieces that scatter outward and fade, a brief burst of visual static lasting 200ms. At the actual enemy position, a solid red diamond snaps into existence with a brief white flash border, the "contact restored" confirmation. The gap between where the ghost was and where the enemy actually is tells the player how wrong the prediction was — a 1-tile error produces a subtle shift; a 4-tile error produces a dramatic cross-board snap that immediately communicates "your prediction system failed badly."

**Multiple conflicting predictions** — when two Predictors or two scouts produce different predicted positions for the same enemy — render as two ghost markers connected by a thin amber line, with a small "?" icon at the midpoint. This is the visual language of **inconsistency** — the system is telling the player that its units disagree about reality. The amber connector line makes architectural problems spatially visible on the battlefield, inviting the player to investigate in the Inspector why their units have divergent predictions.

**The prediction cone** — when no heading data is available and the prediction fans into multiple candidates — renders as a translucent wedge or circle emanating from the last-known position, with the ghost marker at the center of probability mass. The cone's radius equals the elapsed ticks since last observation, making staleness spatially legible. A 2-tick cone is a small fan. A 5-tick cone covers a quarter of the board, screaming "this prediction is useless" through sheer visual area.

---

## Recommendation

Option C (Dedicated Predictor) is the strongest fit for Robot Uprising's architectural philosophy. The game is about wiring together simple units into complex information systems. Hiding prediction inside a skill (Option A) or inside the rule evaluator (Option B) makes it invisible infrastructure — which contradicts the game's core thesis that information architecture should be visible, debuggable, and the player's primary design artifact. A Predictor unit is a node in the architecture graph. It has buffer pressure, channel subscriptions, latency costs, and failure modes — all of which the player can see, reason about, and optimize. It teaches the distributed-systems concepts (caching, staleness, circuit breakers) through architecture rather than through hidden rule modifiers.

However, Option C should not be available until Mission 8+ (when the Specialist is unlocked). Missions 4-7 should teach players the pain of stale data — watching strikers arrive at empty tiles — so that when the Predictor becomes available, its value is immediately understood and its limitations (latency cost, false confidence) are immediately suspicious. The player who has been burned by stale data will approach prediction with healthy skepticism, which is exactly the right pedagogical frame for learning about cache invalidation and eventual consistency.

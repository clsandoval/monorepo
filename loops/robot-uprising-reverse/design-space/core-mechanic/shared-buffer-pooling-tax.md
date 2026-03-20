# 2.05a — Shared Buffer Pooling Tax Calibration

**Aspect:** 2.05a — Shared buffer pooling tax calibration: what's the right capacity reduction coefficient (0.7? 0.8? 0.9?) and should it scale with squad size?
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Design Question

The shared buffer model (2.05, Model A "The Blackboard") pools multiple units' context windows into a single collective buffer. A 3-unit squad (Scout 6 + Striker 8 + Relay 12 = 26 individual slots) shares a single pool reduced by a **pooling coefficient**. At 0.8, the squad gets `floor(26 × 0.8) = 20` shared slots. Six slots are lost — the "cost of communication."

But why 0.8? Why not 0.7 or 0.9? Should a 2-unit squad pay the same percentage tax as a 5-unit squad? Should the coefficient vary by unit composition? This aspect explores the design space of the pooling tax — not whether shared buffers should exist (that's settled in 2.05), but how to tune the tax to create interesting decisions without making sharing obviously dominant or obviously worthless.

---

## The Tuning Problem

The pooling tax must satisfy five constraints simultaneously:

1. **Sharing must never be strictly dominant.** If pooled capacity ≥ sum of individual capacities, every player would always pool. The tax must make sharing cost SOMETHING.
2. **Sharing must never be strictly worthless.** If the tax is so high that pooled capacity < largest individual member, nobody would pool. The shared buffer must enable strategies impossible with individual buffers.
3. **The tax must create a decision curve.** There should be squad sizes where sharing is clearly good, squad sizes where it's clearly bad, and a middle zone where the answer depends on mission context and composition.
4. **The tax must be legible.** The player must be able to mentally calculate (or at least estimate) the shared capacity without a calculator.
5. **The tax must interact with other systems.** The pooling coefficient should create downstream effects on overload risk, signal routing, and production economy.

---

## Six Calibration Models

### Model A — "The Flat Tax" (Fixed Coefficient, No Scaling)

**Coefficient:** A single constant (e.g., 0.8) applied to the sum of all member capacities, regardless of squad size.

**Formula:** `shared_capacity = floor(sum_of_individual_capacities × 0.8)`

**Examples:**
| Squad | Individual Total | Shared (0.8) | Slots Lost | Loss % |
|---|---|---|---|---|
| Scout(6) + Striker(8) | 14 | 11 | 3 | 21% |
| Scout(6) + Striker(8) + Relay(12) | 26 | 20 | 6 | 23% |
| Scout(6) + Relay(12) + Relay(12) + Command(14) | 44 | 35 | 9 | 20% |
| 5 units (max squad) | ~50 | 40 | 10 | 20% |

**Strengths:** Dead simple. The player sees "pool = 80% of total." Mental math is easy. The loss percentage is nearly constant regardless of squad size.

**Weaknesses:** No scaling pressure. A 2-unit squad and a 5-unit squad both lose 20%. This means larger squads are always more efficient per-unit (more shared data, same percentage cost). Creates a "bigger is better" incentive that pushes every player toward maximum squad size.

**Design feel:** "A filing fee. Boring but fair."

### Model B — "The Scaling Tax" (Coefficient Decreases with Squad Size)

**Coefficient:** Decreases as more units join the squad. Each additional member adds coordination overhead.

**Formula:** `shared_capacity = floor(sum × (1.0 - 0.05 × (squad_size - 1)))`

| Squad Size | Coefficient | Example (all Scouts, 6 each) | Per-Unit Shared | Per-Unit Individual |
|---|---|---|---|---|
| 2 | 0.95 | floor(12 × 0.95) = 11 | 5.5 | 6 |
| 3 | 0.90 | floor(18 × 0.90) = 16 | 5.3 | 6 |
| 4 | 0.85 | floor(24 × 0.85) = 20 | 5.0 | 6 |
| 5 | 0.80 | floor(30 × 0.80) = 24 | 4.8 | 6 |

**Strengths:** Creates a natural pressure against oversized squads. 2-unit squads lose only 5% (sharing is almost free). 5-unit squads lose 20% (sharing is expensive). This creates a meaningful decision: is the zero-latency benefit of sharing worth the 20% capacity loss?

**Weaknesses:** The math is slightly harder to calculate mentally. Players might not notice the scaling in the heat of planning.

**Design feel:** "Diminishing returns. The meeting gets more expensive as you add people."

### Model C — "The Per-Unit Tax" (Fixed Slots Lost Per Member)

**Coefficient:** Not a percentage — a flat slot cost per additional member.

**Formula:** `shared_capacity = sum_of_individual_capacities - (squad_size - 1) × tax_per_member`

With `tax_per_member = 2`:

| Squad | Individual Total | Members | Slots Lost | Shared | Effective % |
|---|---|---|---|---|---|
| Scout(6) + Striker(8) | 14 | 2 | 2 | 12 | 85.7% |
| Scout(6) + Striker(8) + Relay(12) | 26 | 3 | 4 | 22 | 84.6% |
| 4 mixed units | 36 | 4 | 6 | 30 | 83.3% |
| 5 mixed units | 50 | 5 | 8 | 42 | 84.0% |

**Strengths:** Extremely legible. "Each new member costs 2 slots." The player can count on their fingers. Creates interesting composition decisions: adding a Scout (6 slots) costs 2 slots in tax — net gain of 4 shared slots. Adding a Relay (12 slots) costs 2 slots — net gain of 10. Relay becomes the efficient pooling member. This creates a natural "Relay as team builder" identity.

**Weaknesses:** Flat cost favors large-buffer units (Relay, Command) over small-buffer units (Scout). A Scout adding 6 slots but costing 2 means 33% tax on the Scout's contribution; a Relay adding 12 but costing 2 means only 17% tax. This might make Scout-heavy squads unviable for pooling.

**Design feel:** "Cover charge. The bouncer doesn't care how much you're carrying."

### Model D — "The Composition-Sensitive Tax" (Unit-Type Modifier)

**Coefficient:** Base coefficient modified by squad composition. Homogeneous squads are more efficient (similar communication protocols). Heterogeneous squads pay extra (translation overhead).

**Formula:** `shared_capacity = floor(sum × base_coeff × diversity_modifier)`

Where `diversity_modifier = 1.0 - 0.05 × (unique_unit_types - 1)`:

| Squad | Types | Base (0.9) | Diversity | Final Coeff | Shared |
|---|---|---|---|---|---|
| Scout + Scout | 1 | 0.9 | 1.0 | 0.90 | floor(12 × 0.9) = 10 |
| Scout + Striker | 2 | 0.9 | 0.95 | 0.855 | floor(14 × 0.855) = 11 |
| Scout + Striker + Relay | 3 | 0.9 | 0.90 | 0.81 | floor(26 × 0.81) = 21 |
| All 5 types | 5 | 0.9 | 0.80 | 0.72 | floor(50 × 0.72) = 36 |

**Strengths:** Creates a fascinating strategic tension: homogeneous squads (all Scouts, all Strikers) pool efficiently but lack capability diversity. Heterogeneous squads (one of each type) pool expensively but have full capability. This mirrors real team composition problems — a team of all frontend engineers communicates efficiently but can't ship a backend.

**Weaknesses:** Two multiplied coefficients is harder to calculate mentally. The composition incentive might be too subtle for most players to notice. Could create a "solved" optimal composition.

**Design feel:** "The Tower of Babel. Everyone speaking the same language is cheaper."

### Model E — "The Diminishing Capacity" (Logarithmic Scaling)

**Coefficient:** Shared capacity scales logarithmically, not linearly, with total individual capacity.

**Formula:** `shared_capacity = floor(base_slots + sum × log_factor × ln(sum / base_slots))`

With `base_slots = 6, log_factor = 0.7`:

| Squad | Individual Total | Shared | Effective % |
|---|---|---|---|
| Scout(6) + Striker(8) = 14 | 14 | floor(6 + 14 × 0.7 × ln(14/6)) = floor(6 + 8.3) = 14 | 100% |
| 3-unit (26) | 26 | floor(6 + 26 × 0.7 × ln(26/6)) = floor(6 + 26.5) = 32 | ~123% |
| 5-unit (50) | 50 | floor(6 + 50 × 0.7 × ln(50/6)) = floor(6 + 74.7) = 80 | 160% |

Wait — this model can give MORE capacity than individual totals for larger squads. That breaks constraint 1 (sharing must not be dominant). The logarithmic curve needs tuning to stay BELOW the linear sum.

**Revised formula:** `shared_capacity = floor(sum × (0.6 + 0.4 × (1 / ln(squad_size + 1))))`

| Squad Size | Coefficient | For 5 Scouts (30 total) | Effective |
|---|---|---|---|
| 2 | 0.6 + 0.4/ln(3) = 0.96 | 28 | 93% |
| 3 | 0.6 + 0.4/ln(4) = 0.89 | 26 | 87% |
| 4 | 0.6 + 0.4/ln(5) = 0.85 | 25 | 83% |
| 5 | 0.6 + 0.4/ln(6) = 0.82 | 24 | 80% |

**Strengths:** Smooth, natural-feeling curve. The tax grows but decelerates — adding the 5th member is less punishing than adding the 3rd. Creates a "soft wall" rather than a hard ceiling.

**Weaknesses:** Impossible to calculate mentally. The player needs the UI to show them the number. Opaque math undermines the "legible design" constraint.

**Design feel:** "Venture capital dilution. Each funding round costs less of your equity, but there's always a cost."

### Model F — "The Tiered Tax" (Discrete Breakpoints) — RECOMMENDED

**Coefficient:** Simple discrete tiers that the player can memorize.

| Squad Size | Coefficient | Mnemonic |
|---|---|---|
| 2 units | 0.90 | "Ten percent fee" |
| 3 units | 0.80 | "Eighty percent" |
| 4 units | 0.70 | "Seventy percent" |
| 5 units | 0.60 | "Sixty percent" |

**Examples:**
| Squad | Individual Total | Shared | Lost | Per-Unit Shared |
|---|---|---|---|---|
| Scout(6) + Striker(8) | 14 | 12 | 2 | 6.0 |
| Scout(6) + Striker(8) + Relay(12) | 26 | 20 | 6 | 6.7 |
| 4 mixed (36) | 36 | 25 | 11 | 6.25 |
| 5 mixed (50) | 50 | 30 | 20 | 6.0 |

**Why this is the recommended model:**

1. **Perfectly legible.** Four numbers to memorize: 90/80/70/60. A player can calculate shared capacity in 2 seconds.
2. **Creates a clear decision curve.** 2-unit squads are cheap to pool (only 10% loss for zero-latency coordination). 5-unit squads are expensive (40% loss). The sweet spot is 3 units — enough diversity for interesting coordination, affordable 20% tax.
3. **Natural breakpoints create build archetypes.** "The Buddy System" (2-unit, 90%): Scout+Striker partners. "The Fire Team" (3-unit, 80%): the campaign's default. "The Platoon" (4-unit, 70%): requires economic justification. "The Army" (5-unit, 60%): endgame power play with massive capacity loss.
4. **Interacts with other systems.** The 5-unit squad at 60% means a 50-slot total becomes 30 shared slots. With 5 units writing observations, that 30-slot pool fills FAST — context overload (squad-wide stun) becomes a real threat. The player must invest in compress skills and filter configuration to make large pools viable. This creates a natural progression: small squads for beginners, large squads as a mastery challenge.
5. **The capacity loss IS the difficulty dial.** The difference between 2-unit (90%) and 5-unit (60%) is 30 percentage points. That's 30% of your total capacity lost to coordination overhead. The game is teaching a real engineering principle: coordination has a cost, and the cost scales with team size. Brooks's Law: "Adding manpower to a late software project makes it later."

---

## Interaction Effects

### Pooling Tax × Context Overload
The pool fills from ALL members' perceptions and hook receptions. A 3-unit squad with a Scout (5 perception range, ~4 observations/tick), a Relay (receiving ~3 hook messages/tick), and a Striker (2 perception range, ~1 observation/tick) generates ~8 entries per tick into a 20-slot pool. The pool has ~2.5 ticks before it's full from scratch. With the pooling tax removing 6 slots, those 6 slots are the difference between "barely manageable" and "cascade overload." The tax is not just a number — it's the margin between stability and catastrophe.

### Pooling Tax × Compress Skill
The compress skill becomes dramatically more valuable in pooled squads. Compress reduces entry size, effectively increasing pool capacity. A Relay running compress in a 3-unit squad mitigates the pooling tax by compacting entries — the 6 lost slots are partially recovered through compression. This creates a "Relay as team medic" pattern: the Relay's primary value in a pool is not communication but information density management.

### Pooling Tax × EM Emissions
Shared buffers bypass hooks for intra-squad communication (zero-latency direct access). This means squads with pools emit LESS EM noise than squads using hook chains. The pooling tax is partially offset by EM savings. Players must weigh: "Do I lose 20% capacity to gain stealth?" This creates a legitimate strategic choice between pool (quiet, smaller buffer) and hooks (loud, full buffer).

### Pooling Tax × One-Shot-One-Kill
When a unit in a pool is destroyed, the pool loses that unit's contribution but the remaining capacity is NOT recalculated — the pool simply has one fewer writer but the same capacity. This is GOOD for the survivors (less input pressure on the same pool). But the lost unit's observations are also lost — the pool develops blind spots. In contrast, losing a unit from a non-pooled squad only affects that unit's individual capabilities.

### Pooling Tax × Factory Economy
Larger squads cost more resources (more units to produce) AND more pool capacity (higher tax). The economic pressure naturally limits squad size: a 5-unit squad at 60% costs 5 units' worth of materials and energy but only gets 60% of the buffer capacity. The per-unit buffer efficiency drops sharply. This creates a "quantity vs. quality" economic decision: many small pools (cheap, efficient per-unit) vs. few large pools (expensive, powerful coordination).

---

## Three Player Journeys

### Journey: Sofia, 22, Computer Science Student (Manila)

**Context:** Sofia is on Mission 6, just introduced to squad formation. She has a Scout, Striker, and Relay available. She's never seen shared buffers before.

**Minute 0:00 — The Squad Formation Panel**
Sofia drags her Scout and Striker into a squad group on the workbench. The UI shows a shared buffer visualization: a wide horizontal bar labeled "SHARED CONTEXT WINDOW — 12 slots (90% of 14)." Below it, two tiny silhouettes (Scout and Striker) with arrows pointing up into the shared bar. A small "TAX: -2 slots" badge in amber sits at the right end of the bar. She thinks: "I lose 2 slots for putting them together. Is it worth it?"

**Minute 1:30 — The Zero-Latency Revelation**
She runs a quick execution. The Scout spots an enemy. In the shared pool, the observation appears INSTANTLY for the Striker — no hook, no channel, no 1-tick delay. The Striker acts on the SAME TICK the Scout observed. Sofia's eyes widen. "That's... no signal latency? My Scout sees it and my Striker knows it at the same time?" She looks at the 2-slot cost. "Two slots for instant communication. That's a bargain."

**Minute 4:00 — The Third Member**
Sofia adds the Relay. The coefficient drops from 90% to 80%. Individual total: 6 + 8 + 12 = 26. Shared: 20. She lost 6 more slots (the Relay brought 12 but cost 6 in additional tax). "Hmm. The Relay costs 50% of its capacity just to join." But the Relay's compress skill now operates on the shared pool — compressing entries for everyone. After compress, the effective capacity rises. The Relay's tax is offset by its utility. Sofia discovers the design intent: Relays are expensive squad members that pay for themselves through information processing.

**Minute 7:00 — The Overload Lesson**
An enemy noise bomb fills the shared pool. ALL THREE UNITS stun simultaneously — the Scout, Striker, and Relay all freeze with sparking jitter animations. "The whole squad went down!" In a non-pooled setup, only one unit would have been stunned. The pool's shared vulnerability means one attack disables three units. Sofia immediately adds filter configuration to the pool — ignoring low-priority noise types. She's learning: shared buffers need shared defenses.

**UI Annotations:**
- Squad formation: drag-to-group gesture, elastic band selection, units snap into squad bracket
- Shared buffer bar: wide horizontal thermometer, colored segments by source unit, amber TAX badge at right end
- Overload cascade: all three unit sprites spark simultaneously, shared bar flashes red, "CONTEXT OVERLOAD — ALL MEMBERS STUNNED" text appears

---

### Journey: Derek, 38, DevOps Engineer (Portland)

**Context:** Derek is on Mission 8, experimenting with multi-squad architectures. He has two squads of 3 units each, plus a solo Command agent.

**Minute 0:00 — The Architecture Decision**
Derek sees the mission map: enemies attack from two flanks. He builds two 3-unit squads (Scout+Striker+Relay each, 80% coefficient = 20 shared slots per squad) and a solo Command unit. The squads handle their flanks independently; the Command coordinates between them using hook channels.

**Minute 3:00 — The Scaling Experiment**
Chat suggests merging into one big 6-unit squad. Derek calculates: 6 units would need a 5-unit max (game constraint) or... wait, max squad size is 5. He can't. But even if he could, 6 units at what coefficient? The tiered model doesn't define 6+. He realizes the 5-unit max exists BECAUSE of the pooling tax — at 60%, a 5-unit pool is already severely taxed. The game design prevents him from building something that would self-destruct.

Instead, he tries a 4-unit squad (adding a second Striker): 6+8+12+8 = 34 individual slots, 70% coefficient = 23 shared slots. He lost 11 slots — nearly a third. But now two Strikers coordinate with zero latency through the shared pool. When the Scout spots an enemy, both Strikers react on the same tick. The 11-slot cost buys him simultaneous coordinated assault.

"This is like my Kubernetes pod scaling," he tells chat. "Adding another replica gives you throughput but costs overhead. The shared buffer IS a resource pool. The tax IS the scheduling overhead."

**Minute 7:00 — The Fragmentation Discovery**
Derek's 4-unit squad faces an enemy that uses area-effect noise attacks. The shared pool, already at 70% capacity, fills rapidly. Squad-wide stun. His separate 2-unit buddy pair (Scout+Striker at 90%) on the other flank is unaffected — their smaller, more efficient pool survives the noise. Derek realizes: multiple small pools are MORE RESILIENT than one large pool. "It's the microservices argument! Monolith goes down, everything goes down. Distributed services can fail independently."

He reconfigures: three 2-unit buddy pairs (90% each) instead of one 4-unit squad + one 2-unit pair. Less coordination power, but no single point of cascade failure. The pooling tax tiering just taught him fault isolation architecture.

**Minute 11:00 — The Stream Clip**
Chat erupts as Derek's three buddy pairs independently react to a three-pronged attack. Each pair acts with zero-latency internal coordination, and the Command unit routes high-level orders between pairs via hooks. "I built a cell-based architecture! Each cell is autonomous, the Command is the service mesh!" The clip title: "DevOps engineer accidentally builds a service mesh in a robot game."

**UI Annotations:**
- Multiple squad brackets visible on the board, each with its own shared buffer bar
- 4-unit squad: wide bar showing rapid fill, amber-to-red gradient
- 2-unit pairs: narrow bars staying comfortably green
- Command unit: solo (no pool), hook connections drawn as lines to each squad's Relay

---

### Journey: Tomás, 16, First-Time Strategy Gamer (Cebu)

**Context:** Tomás is on Mission 6. He just learned about squads. He's cautious — the factory mission was already complex.

**Minute 0:00 — The Simple Question**
The boot log says: "SQUAD FORMATION: ENABLED. Linked units share a common context. They think together. The cost: shared thinking is... smaller thinking." Tomás reads the tooltip: "2 units: 90% capacity. 3 units: 80%. 4 units: 70%. 5 units: 60%." He thinks: "So if I put everyone together, they lose 40% of their brain. That seems bad."

**Minute 2:00 — The Buddy System**
He starts small. Scout + Striker as a 2-unit squad. Individual: 6 + 8 = 14 slots. Shared: 12 slots (90%). "I only lost 2 slots. And now my Striker knows everything my Scout sees, instantly?" He runs the mission. The buddy pair works beautifully — the Scout spots enemies, the Striker reacts immediately. No hooks needed. No channel to configure. The shared pool simplifies his configuration dramatically.

"This is like... a group chat where everyone can see the same messages at the same time," he says. His sister, watching: "Yeah, but a group chat with 5 people gets noisy." Tomás: "Oh. That's why more people costs more." He just internalized Brooks's Law at age 16 without knowing the term.

**Minute 5:00 — The Noise Flood**
He adds the Relay to make a 3-unit squad (80%, 20 slots). The Relay receives hook messages from outside the squad AND shares them with the pool. Suddenly the pool is filling much faster — external signals plus internal observations. The pool hits capacity. Squad-wide stun. "Wait, the Relay brought in TOO MUCH information and it crashed everyone's brain?"

He removes the Relay from the squad, keeping it as a solo unit that communicates with the squad via hooks (1-tick delay instead of zero-latency). The pool pressure drops. The squad stabilizes. Tomás just learned the first principle of shared buffer design: not every unit SHOULD be in the pool. Some units are better as external correspondents than as roommates.

**UI Annotations:**
- Squad formation: simple drag gesture, numbers update live as units are added/removed
- Pool capacity preview: bar shows projected fill rate based on perception ranges and hook subscriptions
- Stun visualization: all squad members spark simultaneously, shared bar cracks down the middle
- Relay removal: elastic snap animation as Relay pops out of squad bracket, pool bar shrinks but turns greener

---

## Recommendation

**Model F ("The Tiered Tax") is the recommended calibration.** Four discrete breakpoints (90/80/70/60) that are instantly memorizable, create a clear strategic gradient (buddy pairs are cheap, armies are expensive), and interact cleanly with compress skills, EM emissions, overload risk, and factory economy.

The key teaching sequence:
- **Mission 6:** Introduce 2-unit squads (90% — sharing is almost free, focus on zero-latency benefit)
- **Mission 7:** Allow 3-unit squads (80% — noticeable tax, introduces capacity management)
- **Mission 8:** Allow 4-unit squads (70% — expensive, requires compress and filter investment)
- **Mission 9-10:** Allow 5-unit squads (60% — mastery challenge, huge tax forces expert-level information architecture)

The pooling tax is not just a balance number. It is a **curriculum**. Each tier teaches a new lesson about the cost of coordination, and the player's growing ability to manage larger pools mirrors their growing mastery of information architecture.

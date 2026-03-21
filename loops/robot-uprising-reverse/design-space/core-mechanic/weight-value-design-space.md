# 2.02a — Weight Value Design Space

**Aspect:** 2.02a — Weight value design space: what's the right weight range, weight inflation across campaign missions, balance implications
**Wave:** 2 (Core Mechanic Deep Dives)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weight System), 1.04d (Hook Semantics)

---

## The Design Question

Every signal in a unit's buffer has a **weight** — a numeric priority value that determines three things:

1. **Eviction priority:** When the buffer is full and new signals arrive, the lowest-weight signal is evicted first. Weight is the tiebreaker that replaces raw FIFO ordering.
2. **Rule match priority:** When multiple rules could fire on the same tick, signals with higher weight get evaluated first. A weight-5 enemy sighting beats a weight-2 ambient noise report.
3. **Transmission priority:** When a unit fires multiple hooks on the same tick, higher-weight signals get transmitted first. On congested channels, this determines what actually reaches the receiver.

The player configures these weights in the Blueprint Editor during the Plan phase. They assign weights to signal types, to specific rules, to hook outputs. The question is: **what range of numbers do they choose from?**

This is not a minor UI decision. The weight range determines the game's entire strategic texture — how many distinct priority tiers exist, how quickly players can differentiate between "important" and "critical," how much room there is for mid-campaign inflation, and what degenerate strategies emerge when players discover flat-weighting or min-maxing.

Three candidate ranges. Each creates a fundamentally different game.

---

## The Three Models

### Model A: The Ternary (1-3) — "The RimWorld Model"

Three weights. Low, Medium, High. That's it. Every signal, every rule, every hook output gets one of three priority levels.

RimWorld uses a nearly identical system for labor priorities: 1 means "do this first," 4 means "do this last," and most players only use 1 and 4, treating the middle values as "I guess medium." The system works because the *number of priority tiers* maps closely to the *number of cognitive categories* players naturally form. People think in threes: important, normal, ignorable.

**How it plays in Robot Uprising:**

In the Blueprint Editor, each signal type shows three pips — bronze, silver, gold — and the player clicks to cycle. A Scout's observation of an enemy gets gold (3). Ambient terrain data gets bronze (1). Hook messages from the Relay get silver (2). Done. Three clicks per signal type, move on.

During execution, the buffer eviction logic is simple: when the 6-slot Scout buffer fills, evict the lowest-weight signal. If there's a tie (two bronze signals), fall back to FIFO within that tier. The player's mental model is: "gold stuff stays, bronze stuff gets pushed out."

**The ceiling problem:** By Mission 4, the player has Scouts generating three signal types and receiving hooks from two sources. That's five signal categories competing for three weight tiers. Two categories must share a weight. Which two? The player has to collapse genuinely different priorities into the same tier, and there's no way to express "I want this to be *slightly* more important than that but less important than the top tier." The ternary model forces coarse grouping.

**The inflation non-problem:** Weight inflation doesn't exist in the ternary model because there's nowhere to inflate *to*. Weight 3 is always the ceiling. The campaign can't gradually increase complexity by introducing higher-weight signals because there are no higher weights. Instead, complexity comes from *more signal types competing for the same three tiers* — the bottleneck is expressive, not numeric.

**Balance math:** If a player sets everything to weight 3 (the "all gold" degenerate strategy), eviction reverts to pure FIFO. The weight system becomes invisible. The game still functions — it just loses the priority layer entirely. This is self-balancing in a perverse way: the degenerate strategy doesn't break anything, it just removes a tool from the player's toolkit.

---

### Model B: The Five-Tier (1-5) — "The Sweet Spot Hypothesis"

Five weights. The range most designers reach for when they want "enough differentiation without analysis paralysis." It's the star rating, the Likert scale, the Netflix thumbs-up with three extra steps.

Five tiers let the player build a proper hierarchy: critical (5), high (4), normal (3), low (2), ignorable (1). This maps to natural language priority — "this is more important than that, but not as important as *that*" — which is the sentence players are thinking when they configure weights.

**How it plays in Robot Uprising:**

The Blueprint Editor shows five horizontal pips per signal type, rendered as tiny circuit-trace segments that illuminate left-to-right as weight increases. Weight 1 is a single dim amber pip. Weight 5 is five bright cyan pips pulsing with a faint glow. The visual weight of the pips communicates the numeric weight — heavier looks heavier.

A mid-campaign Scout configuration might look like:
- Enemy sighting (close range): **5** — five bright pips, never evict this
- Enemy sighting (long range): **3** — three pips, important but not critical
- Relay hook (threat alert): **4** — four pips, trust the network
- Relay hook (position update): **2** — two pips, nice to have
- Ambient terrain observation: **1** — one pip, filler data

This configuration tells a story. The player has decided that direct observation of nearby threats matters most, the network's threat intelligence is trusted but secondary, and terrain data is expendable. Five tiers let them express this hierarchy without compression.

**The sweet spot argument:** Five tiers create 5! = 120 possible orderings of five signal types, compared to 3! = 6 for ternary. But the player doesn't think in combinatorics — they think in relative ordering: "A is more important than B." Five tiers give enough room for five clear priority levels, which is roughly the number of signal sources a typical unit handles (2-3 observation types + 2-3 hook sources). The range matches the problem size.

**Weight inflation across campaign:** The five-tier range has room for a specific inflation pattern. Early missions (1-3): player uses weights 1-3, treating 4-5 as "reserved for really important stuff." Mid-campaign (4-6): player starts using 4s as the baseline, pushing old 3s down to 2. Late campaign (7-10): everything is 4 or 5. This is **The Mana Curve Problem** — the same pattern that forces Magic: The Gathering to reset mana pools every game. Without a reset mechanism, players naturally drift toward the ceiling.

**The anti-inflation tool:** The Command agent (aspect 2.12) can reassign weights mid-battle. If the Command agent has the authority to *lower* weights dynamically, it creates a natural deflation mechanic: the Command periodically resets inflated weights back to meaningful differentiation. This turns weight management into a live strategic layer rather than a static configuration problem.

**Degenerate strategies:** "The Flat Five" — setting everything to weight 5. Same as ternary's "all gold" problem, reverts to FIFO. "The Binary Five" — using only weights 1 and 5, effectively creating a two-tier system with wasted range. "The Anchor" — setting one critical signal to 5 and everything else to 1, creating a system where one signal type is immortal and everything else churns. The Anchor is actually a powerful strategy for units with a single clear purpose (a Scout who only cares about one enemy type), which means the degenerate strategy is sometimes optimal — a sign of healthy design space.

---

### Model C: The Full Dial (1-10) — "The Simulation Model"

Ten weights. Fine-grained control. The player can distinguish between a weight-6 signal and a weight-7 signal, theoretically. In practice, they probably can't — but the system can. This is the model for players who want to feel like they're programming a real AI system, not playing a board game.

**How it plays in Robot Uprising:**

The Blueprint Editor replaces pips with a **slider** — a horizontal track from 1 to 10 with tick marks. The player drags to set weight. Or clicks a number. The visual language shifts from discrete pips to a continuous-feeling spectrum, even though the values are still integers.

A veteran player's Scout configuration in Mission 8:
- Enemy sighting (close range): **9** — almost max, but leaving room for...
- Enemy sighting (flanking angle): **10** — the one signal that must never be evicted
- Relay hook (Command override): **8** — very high, but below direct observation
- Relay hook (threat alert): **6** — mid-high, network intelligence
- Relay hook (position update): **4** — mid-low
- Ambient terrain (obstacle): **3** — occasionally useful
- Ambient terrain (empty): **1** — filler

Seven distinct priority levels in active use. The player has built a precise hierarchy that captures nuances impossible in the 1-5 range: the difference between "close range enemy" (9) and "flanking enemy" (10) expresses a tactical judgment that the flanking signal is *specifically* more critical. In the 1-5 model, both would be weight 5.

**The cognitive cost:** Ten levels demand ten mental categories. Most players cannot maintain ten distinct priority levels in working memory. Cognitive psychology research (Miller's "magical number seven, plus or minus two") suggests that 7+-2 is the limit of distinct categories most humans can hold. A 1-10 range exceeds this, meaning players will naturally cluster values into 4-6 effective tiers anyway, leaving gaps in the range (nobody uses 2, 5, or 7). The range is expressive for the system but exhausting for the human.

**Weight inflation:** Catastrophic. With 10 levels of headroom, players start cautious (using 3-6 range) and creep upward every mission. By Mission 7, the "floor" is weight 6 and everything meaningful is 8-10. The top three values become the only ones that matter, and the bottom seven are wasted. This is **The Volume Knob Problem** — the same phenomenon that makes every audio engineer eventually master at 0dB: when you can always go louder, you always do.

**The sim-player appeal:** For the 15% of Robot Uprising's audience who came from Dwarf Fortress or Aurora 4X, the 1-10 range is a feature, not a bug. These players *want* to assign weight 7 to one signal and weight 8 to another and know that the difference matters. They build spreadsheets. They min-max. They find the degenerate strategies and then find the counter-strategies. The 1-10 range gives them a playground. The other 85% bounce off the weight configuration screen in Mission 3 and never come back.

---

## Player Journeys

#### Journey: Priya, 28, Mobile Puzzle Game Fan

**Context:** Priya plays Monument Valley, Mini Metro, and Baba Is You. She downloaded Robot Uprising because a friend described it as "programming puzzles but you don't need to code." She's on Mission 3 — the first mission where weight configuration is unlocked. She has a Scout and a Striker.

**Minute 0:00 — The Blueprint Editor, Weight Panel**
The mission briefing ended with: *"Your agents now support signal prioritization. Higher-weight signals survive longer in memory."* The Blueprint Editor has a new section: a column of signal types with empty pips next to each. Her Scout has three signal types listed: `enemy_close`, `enemy_far`, `hook_relay`. Each shows five empty circles (the 1-5 model).

**Minute 0:30 — First Click**
She clicks the first pip next to `enemy_close`. It fills in, glowing amber. Weight 1. She clicks again — two pips, brighter. Again — three. The pips make a soft *tick-tick-tick* sound, like a mechanical counter advancing. She sets `enemy_close` to 3, `enemy_far` to 2, `hook_relay` to 1. The choices feel natural: close enemies matter most, far enemies somewhat, network chatter least.

**Minute 1:15 — First Sealed Watch**
She deploys. The Scout moves through the map. On tick 8, three enemies appear within close range simultaneously. The buffer bar at the Scout's base fills rapidly — green pips flooding in. One signal evicts. The eviction flash blinks red at the left edge. She notices the evicted signal was amber-tinted (weight 1 — the relay hook). Her weight configuration worked: the system threw away the least important signal.

**Minute 2:30 — The "Oh" Moment**
The Striker misses a flanking enemy because the Scout evicted the relay hook that contained flanking intel. The debrief shows the signal chain: Relay sent flanking warning (weight 1 in Scout's config) --> Scout buffer full --> flanking warning evicted --> Scout never forwarded to Striker. Priya stares at the chain. She thinks: *"The relay message was actually important. I need to raise its weight."* She goes back to Blueprint Editor and bumps `hook_relay` to 3. Now it ties with `enemy_close`. She pauses. Which should win in a tie? She reads the tooltip: "Tied weights fall back to newest-first." She decides that's fine. Redeploys.

**Minute 4:00 — Success**
The Scout now retains relay hooks through the crowded mid-battle ticks. The Striker gets the flanking warning. Mission complete. Priya's takeaway: weights are about telling the agent what to *remember*, not what to *do*. The five-pip system felt like choosing how many stars to give each signal type. Intuitive.

---

#### Journey: Marcus, 34, Software Engineer and Strategy Gamer

**Context:** Marcus plays Factorio, Rimworld, and dabbled in Screeps. He's on Mission 6. He has 4 unit types deployed: 2 Scouts, 1 Relay, 1 Striker. He's been assigning weights since Mission 3 and has settled into a pattern: critical stuff gets 5, important gets 4, everything else gets 2 or 1. He's hitting a wall.

**Minute 0:00 — The Weight Inflation Realization**
Mission 6 introduces the Jammer enemy — it floods the battlefield with decoy signals. Marcus's Scouts are configured with `enemy_close: 5, enemy_far: 4, decoy_signal: 1`. But the Jammer produces 6 decoy signals per tick, all weight 1, and they still fill the Scout's 6-slot buffer before the weight system can help. The problem isn't weight ordering — it's volume.

**Minute 1:30 — The Ceiling Problem**
Marcus wants to set enemy signals to "way more important than decoys." But 5 is the max. The ratio between 5 and 1 is 5:1, which feels insufficient when decoys outnumber real signals 6:1. He thinks: *"I wish I could set enemies to weight 10 and decoys to weight 1."* This is The Volume Knob Problem arriving from the opposite direction — not inflation, but **range exhaustion**. The player wants more headroom above the current ceiling.

**Minute 3:00 — The Architectural Solution**
Marcus realizes weight alone can't solve a volume problem. He reconfigures: the Relay gets a `filter` skill that drops signals below weight 3 before forwarding. The Scouts set decoys to weight 1, and the Relay's filter acts as a noise gate. The weight system becomes an input to a downstream mechanism rather than the sole defense. He deploys. The Jammer's decoys hit the Scouts, get weight 1, flow to the Relay, get filtered out, never reach the Striker. Clean signal chain. Mission complete.

**Minute 5:00 — Debrief Insight**
The debrief shows a signal flow diagram: 48 decoy signals generated over 8 ticks, all filtered at the Relay. Zero reached the Striker. Marcus's weight configuration is now: everything meaningful at 4-5, everything expendable at 1-2, and the middle range (3) is the filter threshold. He's using weights not as a priority ranking but as a **classification boundary** — a binary split at weight 3, with values above and below serving as tie-breakers within each class. This emergent strategy is only possible with 5 tiers. In ternary (1-3), the filter threshold would be weight 2, leaving only one tier above and one below — no room for sub-ranking within each class.

---

#### Journey: Dr. Kenji Tanaka, 41, Competitive Zachtronics Veteran

**Context:** Kenji has completed every Zachtronics game, holds top-100 leaderboard positions in TIS-100 and Opus Magnum, and optimizes for minimum cycles. He's in Gauntlet mode — the post-campaign endless challenge where missions have randomized constraints and the leaderboard ranks by efficiency metrics. He's running a 6-unit army with every weight painstakingly tuned.

**Minute 0:00 — The Spreadsheet**
Kenji has a spreadsheet open on his second monitor. Columns: unit name, signal type, current weight, historical weight (last 5 Gauntlet runs), eviction rate (from debrief data), "effective priority" (his custom metric: weight * frequency * survival_rate). He adjusts weights by 1 point between runs, measuring the effect on eviction rates. He treats weights as hyperparameters in a machine learning training loop. He *is* the gradient descent.

**Minute 0:45 — The Micro-Optimization**
His front Scout has `enemy_close: 5, enemy_far: 4, hook_command: 5, hook_relay_threat: 4, hook_relay_position: 3, terrain: 1`. He's noticed that `hook_relay_position` (weight 3) gets evicted 40% of the time in dense scenarios, and when it survives, the Striker's accuracy improves by 12%. He bumps it to 4. Now it ties with `enemy_far`. He checks the tie-breaking rule: newest-first within same weight. Since relay position updates are generated *after* Scout observations in the tick order (hooks arrive after observations), the relay position update is always newer and wins ties. The bump to weight 4 is therefore effectively a bump to "4.5" due to tie-breaking. Kenji smiles. He's found an interaction between the weight system and the tick-phase ordering that creates a fractional priority level within integer weights.

**Minute 2:00 — The Meta-Weight Strategy**
Kenji's Command agent has the `reassign_weight` skill — it can change any subordinate unit's weight configuration mid-battle. He's programmed a rule: when the Command detects more than 3 enemies within 4 tiles of any Scout, it fires a hook that triggers a weight reconfiguration on that Scout: `enemy_close` goes from 5 to 5 (unchanged), but `hook_relay_position` drops from 4 to 2 and `enemy_far` goes from 4 to 5. The Command is dynamically shifting the Scout's attention profile based on battlefield density — tightening focus during close engagements, loosening it during lulls. This is a **meta-weight strategy**: using the Command agent to treat weight configurations as a resource that changes over time, not a static plan.

**Minute 4:30 — Gauntlet Leaderboard**
Run complete. Kenji's efficiency score: 94.2. The leaderboard's top score is 96.1. He opens the top player's shared config (Gauntlet configs are public post-run). The top player uses a completely flat weight scheme — all weight 3, every signal, every unit — and compensates with aggressive channel management (turning hooks on/off instead of weighting them). Kenji stares. The weight system he spent 45 minutes optimizing was outperformed by someone who ignored it entirely and solved the problem through a different mechanism. This is **The Flat Three Gambit** — a degenerate strategy that works because channel management is sometimes more powerful than weight management. Kenji opens a new spreadsheet tab labeled "channel optimization."

---

## Strengths and Weaknesses

### Ternary (1-3)

**Strengths:**
- Lowest cognitive load. Three options. Bronze/silver/gold. Instant decisions.
- No analysis paralysis — worst case is a three-way comparison.
- Self-balancing: degenerate strategies (all 3) just revert to FIFO, which still works.
- UI is trivially simple: three pips, three colors, three clicks max.
- Onboarding takes 30 seconds. "High means keep, low means expendable."

**Weaknesses:**
- Expressive ceiling hit by Mission 4 when signal types exceed 3.
- No room for mid-campaign progression — the system doesn't grow with the player.
- Filter thresholds (Relay skills) can only split at weight 2, giving one tier above and one below.
- Veterans find it trivial; no optimization depth for Gauntlet/leaderboard play.
- "The Compression Problem" — forces players to collapse genuinely different priorities into the same tier.

### Five-Tier (1-5)

**Strengths:**
- Maps to natural language priority ("critical/high/normal/low/ignore").
- Enough tiers for typical signal complexity (3-5 signal types per unit).
- Room for classification boundaries (filter at 3 creates meaningful above/below groups).
- Weight inflation is manageable — ceiling is reachable but not catastrophic.
- Supports both casual play (use 1, 3, 5 as effective ternary) and deep optimization.
- The Anchor strategy (one signal at 5, rest at 1) is both degenerate and sometimes optimal — healthy design space.

**Weaknesses:**
- Some players will never use 2 or 4, treating it as a ternary system with wasted range.
- "The Mana Curve Problem" — gradual inflation toward all-5 in late campaign without deflation mechanics.
- Five pips per signal type across 5+ signal types = 25 pip-decisions per unit. Across 4 units = 100 decisions. Approaching tedium.
- Tie-breaking rules (FIFO, newest-first, etc.) become load-bearing design decisions that players must internalize.

### Full Dial (1-10)

**Strengths:**
- Maximum expressive power. Seven or more distinct priority levels for veterans who want them.
- Huge room for classification boundaries (filter at 4, secondary filter at 7 — layered noise gates).
- Weight inflation can be designed as a *feature* — early missions use 1-5 range, late missions unlock 6-10.
- Sim-game audience (Dwarf Fortress, Aurora) finds this native and comfortable.
- Supports emergent fractional-priority tricks via tick-phase ordering interaction.

**Weaknesses:**
- "The Volume Knob Problem" — inevitable upward drift to 8-10 cluster.
- Exceeds Miller's 7+-2 cognitive limit. Most players will waste 30-40% of the range.
- Slider UI is less precise than pips — accidental weight 6 when you wanted 7.
- Onboarding nightmare: "assign a weight from 1 to 10" produces deer-in-headlights in non-gamers.
- Degenerate strategies are harder to diagnose — is weight 6 vs. 7 meaningful or accidental?
- Configuration time scales quadratically with range — more options per signal type times more uncertainty per option.

---

## Interaction Effects

### Weight Range x Buffer Size (6 vs. 14 Slots)

Small buffers (Scout, 6 slots) amplify weight differences — a weight-1 signal in a 6-slot buffer faces eviction every 2-3 ticks in combat. In a 14-slot Command buffer, that same weight-1 signal might survive 8 ticks untouched. The ternary model's coarse granularity is less damaging in large buffers because there's room for low-priority signals to linger. The 1-10 model's fine granularity is most valuable in small buffers where every eviction decision is consequential. **Recommendation:** if the game uses 1-5 weights, Scout builds will benefit most from careful weighting, while Command builds can afford sloppy weights. This creates a natural difficulty gradient tied to unit choice.

### Weight Range x Eviction Policies

FIFO eviction ignores weights entirely (baseline model from aspect 2.01). Priority eviction uses weights as the primary sort key. The weight range only matters under priority eviction — if the game starts with FIFO and introduces priority eviction in Mission 3, the weight range needs to be learnable *before* it becomes mechanically relevant. The ternary model is learnable in Mission 2's tutorial; the 1-10 model needs a dedicated teaching mission. **The Teaching Tax** — more range = more tutorial time before the mechanic becomes useful.

### Weight Range x Signal Types

Each new signal type the campaign introduces creates one new weight decision per unit. With 5 signal types and 1-5 weights, that's 5 decisions per unit (manageable). With 12 signal types (late campaign) and 1-10 weights, that's 12 decisions per unit with 10 options each — combinatorial explosion. **The Configuration Sprawl Problem** — the weight range multiplies the cognitive cost of every new signal type.

### Weight Range x Command Agent Meta-Level

The Command agent can reassign weights mid-battle (aspect 2.12). With ternary weights, the Command can make 3 choices per signal per subordinate — simple enough to encode as rules. With 1-10 weights, the Command's weight-reassignment rules become a programming problem unto themselves: "if enemy_count > 3, set Scout.enemy_close to 8, Scout.enemy_far to 6, Scout.hook_relay to 4" — this is scripting, not configuring. **The Scripting Threshold** — above ~5 weight levels, Command meta-rules feel like writing code rather than choosing priorities.

### Weight Range x UI Representation

- **Pips (discrete dots/segments):** Natural for 1-3 and 1-5. Awkward above 7 — ten pips per signal type create visual noise.
- **Slider (continuous track):** Natural for 1-10. Imprecise for 1-3 — three positions on a slider feel wrong, like a thermostat with only "cold/warm/hot."
- **Dropdown (numeric selector):** Works for any range but feels clinical. Breaks the game's aesthetic of tactile configuration.
- **Dial (rotary knob):** Thematic for 1-10 (like tuning a radio frequency). Requires mouse drag or touch gesture. Satisfying but slow.

**Recommendation:** Pips for 1-5, dial for 1-10, big toggles for 1-3. The UI representation should match the range — never force a continuous control onto a discrete range or vice versa.

### Weight Range x Teaching Curve

- **Ternary:** Teachable in one tooltip. "Gold stays, bronze goes."
- **Five-tier:** Teachable in one mission with one failure. Player sets everything to 3, buffer overflows, debrief shows "if you'd set X to 5, it would have survived."
- **1-10:** Requires a dedicated tutorial mission *and* a reference chart *and* a "suggested weights" default *and* post-mission analytics showing "weights 2, 5, and 7 were never used." The teaching surface area is three times larger than five-tier.

---

## Comparable Games

### RimWorld Priority System (1-4) — "The Near-Ternary"

RimWorld assigns colonist work priorities on a 1-4 scale. In practice, most players use 1 (urgent) and 4 (never), sometimes 2 (important). The value 3 is almost unused — it's too close to 4 to feel different and too far from 1 to feel important. RimWorld's 1-4 range is functionally ternary with a vestigial fourth tier. **Lesson for Robot Uprising:** a 1-4 range buys almost nothing over 1-3 but adds one more "what does this number mean?" decision. Either commit to 5 tiers (enough for a real hierarchy) or stay at 3 (clean and honest).

### Dwarf Fortress Labor Priorities — "The Infinite Range"

Dwarf Fortress doesn't cap labor priorities — players can assign arbitrary importance levels, and the system sorts by those values. In practice, players create ad-hoc tiers (100, 200, 300...) with gaps for future insertion. The gaps are the design insight: experienced players leave room between priority levels so they can insert new priorities later without renumbering. **Lesson:** if Robot Uprising uses 1-10, players will naturally leave gaps (1, 3, 5, 7, 9) and treat odd numbers as "between" tiers. The effective resolution is always half the range.

### XCOM Action Costs (Binary) — "The Two-Action Model"

XCOM's action system is a degenerate weight system: every action costs 1 or 2 actions, with a maximum of 2 per turn. There are no "weight 3" actions. This extreme simplicity means every decision is binary: "can I afford this, and do I end my turn?" **Lesson:** binary systems are incredibly readable but cannot express nuance. Robot Uprising needs at least one step above binary (i.e., ternary minimum).

### Factorio Circuit Network Signal Values — "The Unbounded Integer"

Factorio circuit signals carry arbitrary integer values. Players build comparators (if signal > 50, activate inserter). The values are not bounded, meaning players choose their own scale. The emergent convention is powers of 10 (1, 10, 100) for human readability. **Lesson:** unbounded ranges lead players to invent their own banding, which is personal and non-transferable — bad for shared configurations and community discussion. A bounded range (1-5 or 1-10) creates a shared vocabulary.

### Slay the Spire Energy Costs (1-4) — "The Resource Budget"

Slay the Spire cards cost 0-4 energy, with 3 energy per turn as the baseline budget. The cost range is small but the *budget constraint* makes every point matter. A 2-cost card vs. a 3-cost card is the difference between playing two cards or one. **Lesson:** weight ranges matter more when the budget (buffer size) is tight. A 6-slot Scout with 1-5 weights makes every weight point feel heavy. A 14-slot Command with 1-5 weights makes weight differences feel marginal. The weight range should be calibrated to the tightest buffer, not the largest.

### Magic: The Gathering Mana Costs — "The Curve Problem"

MTG mana costs range from 0 to 10+, but the effective range is 1-6 for most competitive play. Cards costing 7+ are unplayable without ramp acceleration. The mana curve forces players to distribute costs across the range rather than clustering at the top. **Lesson:** Robot Uprising could enforce a "weight budget" per unit (total weights across all signal types cannot exceed X), forcing distribution rather than allowing everything-at-max. This transforms weights from independent assignments into a resource allocation problem — a much deeper strategic layer.

---

## Sensory Description

### The Weight Pip Strip

Five small rectangles arranged horizontally, each 8x4 pixels, with 2px gaps between them. Unfilled pips are dark gunmetal (`#2a2d2e`) with a 1px border of slightly lighter gray. Filled pips illuminate left-to-right in a gradient: the first pip glows dim amber (`#b87a3d`), the second a warmer orange (`#d4873a`), the third a pale gold (`#e8c55a`), the fourth shifts toward cyan-white (`#8fd4d0`), the fifth burns electric cyan (`#00e5ff`) with a subtle 2px bloom. The gradient from amber to cyan communicates weight as *energy* — low weight is warm and dormant, high weight is cold and electric, like a capacitor charging.

### The Click Sound

Each pip click produces a sound: a short, dry **tick** — like a relay switching — pitched slightly higher for each successive pip. Weight 1's tick is at 440Hz (A4), weight 5 at 880Hz (A5). A full sweep from 1 to 5 plays a rising pentatonic scale compressed into five clicks. Sweeping back down reverses the scale. The sound is mechanical, not musical — it's the sound of a dial being set, not a note being played. When the player holds and drags across multiple pips rapidly, the ticks blend into a brief ascending or descending glissando, like a Geiger counter sweeping across a hot zone.

### The Slider Feel (1-10 Model)

If the game uses the 1-10 model, pips are replaced by a horizontal slider track. The track is a thin line (`#3a3d3e`) with ten tick marks. The thumb is a small diamond shape that snaps to integer positions with a satisfying **clunk** — not smooth continuous movement, but ratcheted, like a detented knob on an analog synthesizer. Each snap produces the same pitch-scaled tick as the pip system but with a heavier, lower attack — more **thunk** than **tick**. The number appears above the thumb in a small monospace font, updating as the thumb moves.

### The Buffer Bar Under Load

During Sealed Watch, the buffer bar beneath each unit reflects weight configuration through color intensity. High-weight signals in the buffer render as brighter segments; low-weight signals are dimmer. When eviction occurs, the evicted segment — always the dimmest — contracts leftward and fades to black over 150ms, like a dying pixel on a CRT monitor. The remaining segments shift left to fill the gap. If the evicted signal was high-weight (a failure — the player misconfigured something), the eviction flash is red instead of the usual amber, accompanied by a short dissonant buzz: *zzzp*. This is the sound of the system throwing away something it shouldn't have. Players learn to *listen* for the red buzz during Sealed Watch. Hearing it three times in one run means something is badly mis-weighted.

### The Debrief Weight Histogram

The debrief screen includes a weight utilization histogram: for each weight tier (1-5 or 1-10), a vertical bar showing how many signals existed at that weight across the entire run. A healthy configuration shows a distributed histogram — signals at multiple weight levels. An unhealthy one shows a single tall bar at weight 5 and nothing else. The histogram animates in from left to right as the debrief loads, each bar growing upward with a soft *whirr* sound, like a tape drive spooling. The final bar makes a satisfying *chunk* as it locks into place. If the histogram is flat (all signals same weight), a subtle amber warning glyph appears: a small triangle with an exclamation mark, pulsing once. No text — just the shape. The player learns to read it as "your weights aren't doing anything."

---

## Recommendation

**The Five-Tier (1-5) model is the correct choice for Robot Uprising.**

The ternary model is too restrictive for a game whose complexity ramps across 10+ missions. The 1-10 model's cognitive cost exceeds its expressive benefit for 85% of the audience and creates inflation/sprawl problems that require additional systems (weight budgets, deflation mechanics) to manage. The five-tier model occupies the precise sweet spot:

- **Casual players** use it as an effective ternary (1, 3, 5) and never miss the missing tiers.
- **Mid-skill players** discover weights 2 and 4 organically when they need to express "between high and normal" priority.
- **Veterans** exploit tick-phase tie-breaking interactions within same-weight tiers, getting fractional precision without needing more integers.
- **The Command meta-layer** (dynamic weight reassignment) works at 5 tiers without crossing The Scripting Threshold.
- **The filter boundary** (Relay skills that drop signals below a weight threshold) creates meaningful 2-tier or 3-tier splits within the 5-point range.

If a future expansion needs more range, the correct solution is not 1-10 but **conditional weights** — "this signal is weight 5 when enemies are within 3 tiles, weight 2 otherwise." Conditional weights add depth through context-sensitivity, not through numeric range inflation. The weight *number* stays small; the weight *logic* gets richer.

---

## New Aspects Discovered

- **2.02b — Weight budget per unit:** Should total assignable weight points be capped (e.g., 15 points across all signal types), forcing allocation trade-offs?
- **2.02c — Conditional weights:** Weights that change based on battlefield state (enemy count, unit health, tick number) — the Command agent's dynamic reassignment generalized to static rules.
- **2.02d — Weight visibility to enemies:** Can enemy units "see" a player unit's weight configuration? Implications for counter-play and information warfare.
- **2.02e — Weight inheritance on spawn:** When a unit spawns a child (aspect 1.04c), does the child inherit the parent's weight configuration, get defaults, or get a separately configured set?
- **2.02f — The Flat Weight Gambit:** Deep analysis of when flat weights (all same value) outperform differentiated weights — defining the boundaries of when the weight system adds value vs. when channel management dominates.

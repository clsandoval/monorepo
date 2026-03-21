# 2.02e — Tutorial Progression from Fixed-Slot to Weighted: The Bookshelf Upgrade

**Aspect:** 2.02e — Tutorial progression from fixed-slot to weighted: designing the M1-4 to M5 transition; the "bookshelf upgrade" moment; avoiding invalidating fixed-slot tutorial lessons
**Wave:** 2 (Core Mechanic Deep Dives)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weighted Buffer), 2.02a (Weight Value Design Space), 2.02b (Delivery Richness), 2.02c (Eviction Policies), 2.02d (Compress as Refinery), 5.04 (Complexity Ramp)

---

## The Mechanic: "The Bookshelf Upgrade"

For four missions, the player has lived inside a world where all information is equal. Every observation, every hook message, every compressed report occupies one slot. The buffer is a bookshelf with identical-width books. You put a new book on the right end, the oldest book falls off the left end, and nothing distinguishes one book's right to stay from another's. This is the fixed-slot FIFO model from 2.01, and it teaches the game's most important lesson: information has a cost, and that cost is space.

Then the factory arrives.

Mission 5 introduces production — the player designs blueprints, queues units, manages resources, and for the first time builds their own army rather than configuring pre-placed units. Somewhere in this transformation, the buffer changes too. Signals gain weight. The bookshelf gets labeled priority shelves. A weight-5 enemy sighting report is now fundamentally different from a weight-1 ambient terrain ping — not just in content, but in how tenaciously it clings to existence inside the buffer.

The design question is surgical: **how do you introduce signal weights without making the player feel that everything they learned about fixed-slot buffers was a lie?**

The answer is that FIFO never dies. It becomes the default behavior of a richer system. Weight-1 signals in a buffer where every signal is weight-1 behave identically to the fixed-slot model. The bookshelf still exists. It just grew labeled shelves — and on Mission 5, most of those shelves still say "equal priority." The player's four missions of FIFO intuition remain perfectly valid. Weights are an extension, not a replacement. The floor stays exactly where it was. The ceiling rises.

### The Mechanical Bridge

In fixed-slot (M1-4), eviction is simple: buffer full, new signal arrives, oldest signal is evicted. No decisions. No configuration. The player's only lever is upstream — what channels to listen to, what perception radius to care about, how many hooks feed the unit.

In weighted (M5+), eviction gains a second axis. When the buffer is full:
1. The system checks signal weights
2. The lowest-weight signal is the eviction candidate
3. Ties within the same weight tier are broken by age (oldest first — FIFO within tier)

Step 3 is the bridge. A buffer where all signals are weight-3 (or any uniform weight) evicts by pure FIFO, because every tie is broken by age. The player who assigns uniform weights to everything is playing the exact game they already know. The weight system is dormant until the player activates it by making their first differentiated weight assignment.

This means the transition has a **player-controlled gradient**. A cautious player can assign weight-3 to everything and play M5 with FIFO behavior unchanged. An adventurous player can immediately experiment with weight-5 on threat signals and weight-1 on terrain pings. Both are valid. Both complete the mission. The difference is that the adventurous player discovers the power of priority earlier, while the cautious player discovers it when a later mission's information pressure makes uniform weights insufficient.

### When Exactly Weights Appear: The M4/M5 Decision

Two candidate moments. Each creates a different emotional arc.

**Option A: Late M4 — "The Last Tutorial Lesson"**

Weights appear as Mission 4's final act. M4 already teaches delivery richness (2.02b) — stripped/tagged/structured signal fidelity. The player is already grappling with the idea that not all signals are equal in richness. Weights extend that idea: not all signals are equal in priority, either. The boot log introduces weights as a natural companion to fidelity calibration:

```
[    ] PRIORITY_WEIGHT_MODULE
[INIT] Analyzing signal differentiation...
[    ] Current mode: UNIFORM PRIORITY (all signals weight 1)
[NOTE] Observation: some signals consistently evicted before evaluation
[    ] RECOMMENDATION: Enable per-signal priority weighting
[    ] Weight range: 1 (low) through 5 (critical)
[    ] Default: all signals weight 3 (existing FIFO behavior preserved)
[DONE] Priority weights available in Context Config
```

The key line is **"Default: all signals weight 3 (existing FIFO behavior preserved)."** The boot log explicitly tells the player that nothing has changed unless they choose to change it. The system is self-describing its own backward compatibility.

**Strength:** By the time M5 arrives with the factory, the player already has weights in their vocabulary. M5 can focus entirely on production mechanics without also teaching weights. The cognitive load of M5 (already the campaign's steepest cliff) is reduced.

**Weakness:** M4 already introduces delivery richness. Adding weights in the same mission creates a two-concept tutorial. The player might conflate richness (how much data a signal carries) with weight (how important a signal is). These are orthogonal axes, and teaching them simultaneously risks the player treating them as one slider.

**Option B: Early M5 — "The Factory Comes With Priorities"**

Weights appear as part of the Mission 5 factory introduction. The boot log frames weights as a consequence of production — when you build your own units, you need to tell them what matters:

```
[    ] FABRICATION SUBSYSTEM: ONLINE
[    ] Blueprint Editor: ACTIVE
[    ] New capability detected: PRIORITY WEIGHT ASSIGNMENT
[    ] Pre-placed units operated at uniform priority (weight 3)
[    ] Factory-produced units support configurable priority weights
[    ] Range: 1 (background) to 5 (critical)
[NOTE] Pre-placed unit configs auto-migrated to weight-3 baseline
[DONE] Weights configurable per signal type in Blueprint Editor
```

This framing ties weights to ownership. Pre-placed units were given to you — they came with uniform priorities because someone else configured them. Factory units are yours — you get to decide what matters. The metaphor is compelling: building your own robots means taking responsibility for their judgment.

**Strength:** Clean separation. M4 = delivery richness. M5 = factory + weights. Each mission has one new buffer concept. The narrative link between "I built this unit" and "I decide its priorities" is strong and intuitive.

**Weakness:** M5 is already the campaign's heaviest mission (factory, queue, blueprints, resources). Adding weights makes it heavier. The player might not explore weights at all during M5, focused as they are on learning production. Weights become a feature they technically have but don't use until M6 or M7 forces them to.

**Recommended: Option B with a Delayed Pressure Trigger**

Introduce weights in M5's boot log but don't require them to complete M5. M5's mission design should be completable with uniform weights. Then M6 creates the first scenario where uniform weights fail — a mission where high-priority threat signals get evicted by a flood of low-priority ambient data, and the player's Striker charges in blind because it forgot the enemy position three ticks ago. The debrief in M6's Inspector shows the eviction trace: "weight-3 threat signal evicted in favor of weight-3 terrain ping (FIFO tiebreak: threat was older)." The player sees the problem and thinks: "If that threat signal had been weight-5, it would have survived." They return to the Blueprint Editor and make their first differentiated weight assignment. The lesson is self-directed, not dictated.

This is the Slay the Spire pattern: introduce relics after the first boss, but the first relic is simple and the game doesn't test relic synergy until Act 2. The player has time to hold the new tool before the game demands they wield it.

### The Boot Log Ceremony

The boot log is the game's diegetic framing device for every subsystem unlock. Each new mechanic is introduced as a system initialization sequence in a terminal that boots at the start of each mission. For weights, the ceremony should feel like a system upgrade — not a replacement.

The terminal screen flickers. The standard boot sequence runs:

```
[BOOT] Mission 5: Assembly Line
[    ] Loading saved agent configurations...
[DONE] 4 pre-placed units restored from M4 checkpoint
```

Then a pause. A new section appears, scrolling slower than the standard boot text. The font color shifts from the usual green-on-black to amber-on-black — the color the game reserves for "pay attention, this is new":

```
[>>>>] SYSTEM UPGRADE DETECTED
[    ] FABRICATION MODULE requires enhanced signal management
[    ] Enabling PRIORITY WEIGHTS on all buffers...
```

A brief animation: the buffer bars on the pre-placed units, visible in the background behind the terminal overlay, shimmer. Each segment in the bar briefly flashes with tiny weight pips — five horizontal dots below each buffer entry, all uniformly lit at the third pip (weight 3). The pips appear, hold for one second, then dim to a subtle background state. The message is visual: your existing buffers just gained weight annotations, but nothing changed about their behavior.

```
[    ] Migration complete: all existing signals assigned weight 3 (uniform)
[    ] New factory blueprints support weight range 1-5 per signal type
[    ] FIFO eviction preserved as default tiebreaker within weight tiers
[DONE] Priority weight system: ONLINE
```

The amber text fades back to green. The boot sequence continues normally. The entire ceremony takes eight seconds. The player has been told three things: (1) weights exist, (2) their existing configs are unchanged, (3) new blueprints can use weights. Nothing they need to act on immediately. A seed planted.

### The Blueprint Codex Entry

When weights unlock, a new entry appears in the Blueprint Codex — the game's in-universe reference manual that the player can consult at any time during the Plan phase.

The Codex entry for weights should open with the bookshelf metaphor:

> **SIGNAL PRIORITY WEIGHTS**
>
> Your unit's buffer is a shelf. Until now, every signal on that shelf has been the same height — when the shelf is full and a new signal arrives, the oldest signal falls off the end. Weights change the question from "what arrived first?" to "what matters most?"
>
> Each signal type can be assigned a weight from 1 (background) to 5 (critical). When the buffer is full, the system evicts the lowest-weight signal first. Signals with the same weight are evicted oldest-first — the same FIFO behavior you already know.
>
> **Setting all signals to the same weight reproduces the exact behavior from Missions 1-4.** Weights are an upgrade, not a replacement. Your existing intuitions are still valid.

The final line is the single most important sentence in the transition. It's the anti-invalidation promise. The player who reads this knows they can trust their prior experience.

### Preserving Tutorial Lessons

Four specific lessons from M1-4 must survive the transition intact:

**Lesson 1: "The buffer is finite" (M1).** Weights don't change buffer capacity. A 6-slot Scout buffer still holds 6 signals. Weight doesn't make the buffer bigger — it makes the system smarter about what stays. The finiteness lesson is untouched.

**Lesson 2: "Rules evaluate against buffer contents" (M2).** Rule conditions still check what's in the buffer. Weights affect what survives in the buffer, which indirectly affects which rules fire, but the mechanical link between buffer contents and rule evaluation is unchanged. A rule that says "IF enemy_near THEN engage" still checks for an enemy signal in the buffer. Weight determines whether that signal is still there when the rule evaluates.

**Lesson 3: "Hooks move signals between units" (M3).** Hook semantics are unaffected by weights. A hook fires, a signal travels a channel, it arrives in the receiver's buffer. The signal now carries a weight, but the hook doesn't care about weight — it transmits whatever it's told to transmit. Weight is a buffer-side concern, not a channel-side concern.

**Lesson 4: "Not all data needs the same fidelity" (M4).** Delivery richness (stripped/tagged/structured) taught that signals vary in information density. Weight adds a second dimension: signals also vary in priority. The M4 lesson is not invalidated — it's extended. Richness and weight are complementary axes. A signal can be rich and low-priority (a detailed but irrelevant terrain survey) or stripped and high-priority (a bare ping flagged as critical).

### The "Everything I Learned Is Wrong" Anti-Pattern

The worst version of this transition makes the player feel stupid. It goes like this: Mission 5 starts, weights appear, and the first thing that happens is all their FIFO-optimized configs break. Buffers overload because they haven't set weights. Missions fail. The player thinks: "I spent four missions learning a system that doesn't work anymore."

This is the Civilization VI district adjacency problem. Players learned Civilization V's tile improvement system across dozens of hours. Civ VI replaced it with districts that obsoleted most of that knowledge. The community reaction was hostile — not because districts were bad, but because the transition said "forget what you learned."

The anti-pattern is avoided by three design rules:

1. **Default weights reproduce FIFO.** A player who ignores weights entirely plays the same game they already know. No existing config breaks. No mission suddenly fails because of a mechanic the player hasn't engaged with.

2. **The first weight-dependent scenario is opt-in.** M5 doesn't require weight differentiation. The player chooses to explore weights when they're ready, not when the game demands it.

3. **The first weight failure is legible.** When a player finally encounters a situation where uniform weights hurt them (likely M6), the Inspector shows exactly why: a weight-3 critical signal was evicted by FIFO tiebreak in favor of a weight-3 trivial signal. The fix is obvious: make the critical signal weight-5. The lesson teaches itself.

---

## Player Journeys

#### Journey: Sofia, 14, First Strategy Game

Sofia has never played a strategy game before Robot Uprising. She chose it because her older cousin said it was "like programming but fun." She struggled with Mission 1 but had a breakthrough in Mission 2 when she realized that rules are just "if this, then that" sentences. By Mission 4, she's comfortable. Her Scout listens on two channels, her Striker has three rules, and she understands that when the buffer bar flashes red on the left, something got pushed out.

Mission 5's boot log scrolls. Sofia reads the amber text carefully — she's learned that amber means new. "Priority weights... weight 3... FIFO preserved as default." She doesn't fully understand what weights do, but she registers that her existing stuff is unchanged. She clicks into the Blueprint Editor for the first time, excited about the factory. The weight column is there — five tiny pips next to each signal type — but they're all set to three. She ignores them. She has a factory to figure out.

Her first factory-built Scout enters the field. It works exactly like the pre-placed Scouts she knows. Buffer fills, oldest evicts, rules fire. The weight pips are visible on the buffer bar in the Inspector but they're all the same height, all the same dim amber. Sofia notices them without engaging. "Those are for later," she decides.

Mission 6 hits her hard. Her Striker keeps charging at the wrong target — engaging a weak enemy while a strong enemy flanks from the east. In the Inspector debrief, she scrubs to the critical tick. Her Striker's buffer shows six signals, all weight-3. The strong enemy observation was evicted two ticks ago because it was older than a terrain ping. Sofia stares at this for twenty seconds. Then she opens the Blueprint Editor. She drags the weight on "enemy sighting (close range)" to 5. Five bright cyan pips light up. She drags "terrain observation" to 1. One dim amber pip. She re-runs Mission 6. The Striker holds the strong enemy sighting, evicts the terrain ping, and engages correctly.

Sofia doesn't know she just learned cache priority. She knows that important things should stay longer. The bookshelf has labeled shelves now, and she decides what label goes where.

#### Journey: Datu, 32, Backend Engineer

Datu built distributed systems at a Philippine fintech startup for six years. He recognizes context windows, eviction policies, and priority queues instantly. Missions 1-4 were pleasant but slow — he completed each one on the first try, spending most of his time in the Inspector admiring the buffer visualization rather than debugging failures.

When Mission 5's boot log shows the priority weight system, Datu grins. He immediately opens the Blueprint Codex, reads the weight entry, and thinks "finally, this is LRU with priority classes." He sets his factory-built Relay to weight-5 on threat-net hooks and weight-1 on ambient observations. His Striker gets weight-5 on structured engagement data and weight-2 on everything else. His Scout gets a flat weight-3 across the board — Scouts are data producers, not decision-makers, so weight differentiation matters less for them.

His first M5 run is clean. The weight system does exactly what he expects. But then he notices something in the Inspector that surprises him: his Relay's buffer is 100% threat data. Every ambient observation was evicted immediately because it was always the lowest weight. The Relay has perfect threat intelligence and zero environmental awareness. When the terrain changes mid-mission (a blocked path that forces rerouting), the Relay has no terrain data to relay. The downstream Striker walks into a wall.

Datu recognizes the pattern: priority inversion through over-aggressive weighting. The highest-priority data monopolizes the cache, and secondary-but-necessary data is permanently starved. He adjusts: threat-net stays weight-5, but terrain gets weight-3 instead of weight-1. This guarantees that terrain data survives when the buffer has room, and only loses to threats when space is genuinely contested.

In the Inspector's next run, he watches the weight-3 terrain data coexist with weight-5 threat data during quiet ticks, then gracefully yield during high-threat ticks. "That's backpressure," he says to no one. He takes a screenshot of the buffer bar — a mix of bright cyan high-weight blocks and steady amber mid-weight blocks — and posts it to the game's Discord with the caption "priority queue with guaranteed minimum allocation, no code required."

#### Journey: Abuela Carmen, 67, Retired Librarian

Carmen played Candy Crush for years and her granddaughter installed Robot Uprising on her tablet, saying "Lola, this one is about organizing information — you'll love it." Carmen was skeptical but tried it. She completed Mission 1 on the third attempt, Mission 2 on the fifth. By Mission 4, she had developed her own vocabulary for the game: the buffer was "the card catalog," signals were "borrowed books," and eviction was "returning overdue materials." Her strategy was conservative — she subscribed to fewer channels than necessary, keeping her buffers under-full to avoid eviction entirely.

Mission 5's boot log confuses her initially. "Priority weights" sounds technical. But she reads the Codex entry and the bookshelf metaphor clicks instantly. "Oh," she says aloud. "It's like the reference section. Reference books stay on the shelf. Paperbacks circulate." She doesn't need to think about 1-5 weight ranges. She needs two categories: reference (weight 5, stays forever) and circulating (weight 1, comes and goes freely).

Carmen assigns weight-5 to threat signals on her Striker — "that's the reference book, the unit always needs to know where the enemy is." Everything else stays weight-1. This binary strategy (the "Anchor" pattern from 2.02a, identified as sometimes-optimal for focused units) works beautifully for her. The Striker always knows the latest threat position. Low-priority data flows through the buffer like newspapers through a reading room — read once, recycled.

What Carmen doesn't realize is that her librarian mental model has produced an architecture that many expert players converge on independently: pinned critical data plus a FIFO churn layer for transient awareness. She arrived at the same design through professional intuition rather than systems engineering vocabulary. The game met her where she already was.

In Mission 7, her granddaughter watches over her shoulder and says, "Lola, that's basically a cache with a pinned hot set." Carmen shrugs. "It's a well-organized library."

---

## Strengths

**The transition preserves all prior learning.** Zero tutorial lessons are invalidated. FIFO behavior persists as the tiebreaker within weight tiers, meaning every instinct the player built across M1-4 remains functional. This is the strongest argument for this design — the player never feels betrayed.

**The gradient is player-controlled.** Unlike hard unlocks that force engagement, weight differentiation is opt-in. The player can engage with weights at their own pace. Some players will explore weights in M5. Others will discover them through failure in M6 or M7. Both paths are valid.

**The boot log ceremony is self-describing.** The terminal text explicitly states that existing configs are unchanged. The player doesn't need to infer backward compatibility — the system announces it.

**The metaphor is universally accessible.** "Your bookshelf now has labeled shelves" requires no technical background. Carmen the librarian and Datu the engineer both understand it, through different lenses but with equal accuracy.

**The first failure teaches the solution.** When a player finally encounters a weight-dependent failure, the Inspector shows exactly what happened (low-priority signal survived, high-priority signal was evicted due to FIFO tiebreak) and the fix is obvious (increase the important signal's weight). The diagnostic loop is tight.

---

## Weaknesses

**M5 cognitive load is already extreme.** Even with the recommendation to not require weight engagement in M5, the mere presence of a new system adds to the visual and conceptual load of the campaign's hardest mission. Weight pips appear in the Blueprint Editor alongside factory controls, production queues, and resource counters. Some players will feel overwhelmed by the number of new things on screen, even if only the factory demands immediate attention.

**The "dormant feature" risk.** A player who ignores weights in M5 might continue ignoring them through M6 and M7, even when weight differentiation would solve their problems. The game relies on the Inspector to make the connection visible, but a player who doesn't use the Inspector deeply (common among casual players) might never realize weights are the answer. They might blame their rules or hooks instead.

**Weight and delivery richness can be confused.** Both are "signal properties" that the player configures in the Blueprint Editor. Richness determines how much data a signal carries. Weight determines how long it stays. A player encountering both for the first time (even in different missions) might conflate them — "I already told it this signal is important by making it structured, why do I also need to give it a high weight?" The two axes need clear visual separation in the UI: richness as horizontal width (how fat the signal block is), weight as vertical pips (how many dots glow beneath it).

**The binary weight strategy is a local optimum.** Carmen's "reference vs. circulating" (weight 5 and weight 1 only) works well enough that many players never explore the middle range. Weights 2, 3, and 4 become unused, and the 1-5 range effectively collapses to a binary toggle. This isn't a catastrophic failure — binary weighting is a valid strategy — but it means some players never discover the nuance of the five-tier system. The game would need missions that specifically reward mid-range weight differentiation to push players past the binary local optimum.

---

## Interaction Effects

### Weight Ranges (2.02a)

The 1-5 weight range recommended in 2.02a is designed specifically with this transition in mind. The middle value (3) serves as the "uniform default" — all pre-placed units migrate to weight-3, which means the player's first encounter with weights shows a system that is numerically centered rather than pinned at an extreme. If the range were 1-10, the default would be 5, and the player would face an intimidating ten-tier hierarchy on first contact. Five tiers with a center default is cognitively manageable.

### Eviction Policies (2.02c)

The transition from FIFO to weight-aware eviction is gated by this tutorial moment. During M1-4, the eviction policy dropdown in the Context Config panel should be locked to "FIFO (oldest first)" — the player sees the dropdown but cannot change it. When weights unlock, the dropdown gains additional options: "Lightest-First (low weight evicted first)" becomes available. This staged unlock prevents the player from encountering weight-aware eviction before they understand weights. The FIFO policy remains available after the unlock, providing a familiar fallback.

### Delivery Richness (2.02b)

Richness unlocks in M4; weights unlock in M5. This one-mission gap is critical. The player needs time to internalize richness as a concept before encountering weight. If both appeared simultaneously, the player would face a two-dimensional signal configuration space (richness x weight) before understanding either dimension independently. The gap allows richness to settle before weight is introduced.

The interaction between richness and weight creates the game's deepest buffer engineering decisions. A structured signal (3 buffer slots, rich information) with weight-5 (high priority, rarely evicted) is a very expensive commitment — three slots that almost never free up. A stripped signal (1 buffer slot, minimal information) with weight-1 (low priority, frequently evicted) is nearly invisible — it enters, provides a momentary awareness blip, and evicts on the next tick. The player who understands both axes can fine-tune their information architecture with surgical precision.

### The Boot Log

The boot log is the player's trusted narrator. Every system unlock has been framed through the boot sequence, and the weight unlock must follow the same convention. Critically, the boot log for weights must include the backward-compatibility statement ("existing FIFO behavior preserved"). The boot log has never lied to the player — it described exactly what each subsystem does when it comes online. Maintaining that trust through the weight transition is essential. If the boot log says "nothing changes unless you change it," the player believes it, because the boot log has been reliably honest for four missions.

### Blueprint Codex

The Codex entry for weights serves as the player's reference when they're ready to experiment. The entry should be structured as: metaphor first (bookshelf), mechanic second (weight 1-5, eviction priority), backward-compatibility third (uniform weights = FIFO). The Codex is consulted voluntarily, so it can afford to be more detailed than the boot log. It should include a worked example: "A Scout with all signals at weight-3 evicts oldest-first (FIFO). The same Scout with threat signals at weight-5 and terrain at weight-1 preserves threats and cycles terrain."

### Difficulty Curve

The transition from fixed-slot to weighted is the campaign's second major complexity jump (the first being hooks in M3). The difficulty curve should account for this by making M5's mission objectives achievable with uniform weights. The mission is hard because of the factory, not because of weight configuration. M6 then applies gentle pressure toward weight differentiation — a scenario where uniform weights produce a visible but non-fatal problem. M7 applies strong pressure — a scenario where weight differentiation is effectively required to meet the mission objective within the variant threshold.

---

## Comparable Games

**Slay the Spire: Relics After Learning Cards.** The player spends the first few floors of Act 1 learning card synergy — how attack cards, skill cards, and power cards combine into a deck strategy. Then a boss drops a relic that modifies the rules. The relic doesn't invalidate the deck — it adds a layer on top of it. A relic that gives +1 energy changes how many cards you can play, which reshapes which cards are worth keeping, but the card mechanics themselves are unchanged. Weights are Robot Uprising's relics: a new layer that reshapes buffer strategy without replacing buffer mechanics.

**Factorio: Logistics Networks After Manual Belts.** For the first several hours, Factorio players build with belts — physical conveyor lines that move items from A to B. Then logistics robots unlock. The robots don't replace belts; they supplement them. Most players continue using belts for high-throughput main bus lines while using robots for low-volume or awkward-geometry delivery. The two systems coexist. Similarly, FIFO eviction doesn't disappear when weights arrive — it becomes the within-tier tiebreaker, handling the cases where weights don't differentiate.

**Civilization: Tech Tree Gating.** Each technology in Civilization unlocks new capabilities while preserving existing ones. Researching "Gunpowder" doesn't make your existing Swordsmen disappear — they become obsolete gradually as better options become available. Weights follow the same pattern: fixed-slot behavior isn't removed, it's supplemented by a more expressive system. The player's "Swordsmen" (uniform-weight configs) still work; they're just outperformed by "Musketmen" (differentiated-weight configs) in later missions.

**Chess: Learning Piece Progression.** Beginners learn piece movement sequentially — pawns, then knights, then bishops, then rooks, then queen. Each new piece doesn't invalidate the ones before it; it adds tactical options. The moment a player learns that the bishop can control a diagonal that the rook can't doesn't make the rook useless. Weights are a new piece in the player's tactical vocabulary. The buffer is still the board. FIFO is still a valid move. Weights give the player new moves to make on the same board.

**Portal: Test Chamber Progression.** The first chambers teach one portal. The second set teaches two portals. Critically, the single-portal intuition isn't wrong — it's a subset of two-portal intuition. The player who understands "place portal, walk through" has 100% of the knowledge needed to understand "place two portals, things pass between them." Nothing is unlearned. The fixed-slot buffer is one portal. Weighted signals are two portals.

---

## Sensory Description of the Transition Moment

The player clicks "Begin Mission" on Mission 5. The screen fades to the boot terminal — green monospace text on a near-black background, the same terminal they've seen four times before. The standard initialization runs: mission title, agent restoration, subsystem checks. Each `[DONE]` line produces the familiar soft electronic confirmation chirp, a sound the player associates with "everything is normal."

Then the terminal pauses. A half-second of silence. The cursor blinks three times without new text. In four previous missions, the boot sequence has never paused. This pause says: something different is coming.

The text color shifts. Green characters fade to amber. The shift takes 400 milliseconds — slow enough to notice, fast enough to feel like a system event rather than a cinematic. A low hum begins, barely audible, rising in pitch over two seconds. The hum is the sound of a capacitor charging — it's the game's audio cue for "power-up," used nowhere else. The player has never heard it before. Their ears tell them this is new before their eyes do.

```
[>>>>] SYSTEM UPGRADE DETECTED
```

The four chevrons `>>>>` are new punctuation. Previous boot lines used brackets like `[INIT]` or `[DONE]`. The chevrons pulse once, left to right, like a progress bar completing in a single beat. The hum reaches its peak and holds.

```
[    ] Enabling PRIORITY WEIGHTS on all buffers...
```

Behind the terminal overlay, the game board is visible at 30% opacity. The pre-placed units on the board — the same Scout, Striker, and Relay from M4 — flicker. Their buffer bars, the tiny horizontal strips at the bottom of each unit tile, shimmer. Tiny dots appear beneath each segment of each buffer bar: five horizontal pips per segment, all uniformly lit at the third position. The pips are the same amber color as the boot text. They glow for one second, casting a faint warm light on the tile, then dim to a barely-visible state. The visual message: your buffers just gained weight indicators, and they're all set to the same value.

The hum resolves into a soft chord — three notes, ascending, the game's audio signature for "subsystem online." The amber text fades back to green.

```
[DONE] Priority weight system: ONLINE
```

The standard confirmation chirp plays. Green text. Normal boot sequence resumes. The factory introduction begins. The entire weight ceremony lasted eight seconds. The player felt it as a moment of significance — the pause, the color shift, the hum, the visual shimmer on the existing units — but it didn't demand action. It was an announcement, not an instruction. The bookshelf grew labeled shelves while the player was watching. When they're ready to use those labels, the shelves will be there.

The first time the player opens the Blueprint Editor in M5 and hovers over a signal type, a tooltip appears: "Priority Weight: 3 (default). Click pips to adjust (1-5)." Five horizontal dots. The third is bright. The player looks at it, considers it, and then scrolls down to the factory queue. The weights will wait. They're patient. They know the player will come back when the buffer pressure makes them necessary.

---

## Summary

The fixed-slot to weighted transition is a **backward-compatible extension**, not a replacement. Every lesson from M1-4 survives intact. FIFO becomes the within-tier tiebreaker. Default weight-3 reproduces uniform behavior. The boot log announces the upgrade explicitly. The Blueprint Codex explains it with a bookshelf metaphor. The first weight-dependent failure is diagnostic and self-teaching. The player controls the gradient of engagement — from ignoring weights entirely (valid) to building sophisticated priority hierarchies (rewarded). The transition is the moment the game trusts the player to make their own judgment calls about what matters, and the player trusts the game not to punish them for what they already learned.

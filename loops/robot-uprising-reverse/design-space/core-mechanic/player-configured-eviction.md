# 2.06 — Player-Configured Eviction: Drag to Set Priority Order of What Gets Kept

**Aspect:** 2.06 — Player-configured eviction: drag to set priority order of what gets kept
**Wave:** 2 (Core Mechanic Variations)
**Dependencies:** 2.01 (Fixed-Slot Buffer), 2.02 (Weighted Buffer), 2.02c (Weight-Aware Eviction Policies)

---

## The Design Question

The eviction policies explored in 2.02c (FIFO, lightest-first, heaviest-first, priority-tagged) are algorithmic presets — the player selects one and it governs all eviction decisions uniformly. Aspect 2.06 asks a different question: **what if the player manually specifies the eviction priority order by dragging signal types into a ranked list?**

This is the difference between selecting "lightest-first" from a dropdown and physically arranging a stack of cards that says: "Keep enemy sightings above all else. Then keep relay threat alerts. Then keep terrain observations. Ambient pings can go first." The player is not choosing an algorithm — they are authoring a custom eviction hierarchy, one signal type at a time, by physically arranging them in the workbench.

This is the **most expressive** eviction configuration possible within a visual, non-code interface. It gives the player direct control over what the unit values, in what order, with what granularity. It also introduces a new class of design problems: how do you present a ranked list of 8-15 signal types in a way that is learnable in Mission 2 and still deep enough for Mission 10? How do you prevent "set and forget" — a single priority order that works for every mission? How do you make the drag interaction feel like engineering, not like sorting a to-do list?

The answer to 2.06 defines the tactile heart of the Context Config panel in the Blueprint Editor. This is where the player's hands meet the information architecture.

---

## The Mechanic in Detail

### The Eviction Priority Stack

In the Plan phase, the Blueprint Editor's Context Config section contains a vertical list called the **Eviction Priority Stack** (player-facing name: "Memory Priority"). Each item in the stack represents a **signal category** — a type of information that can occupy a context window slot. The player drags these items to reorder them. Items at the **top** of the stack are kept longest; items at the **bottom** are evicted first.

When the context window is full and a new entry arrives, the unit scans the buffer from bottom-priority upward, finds the lowest-priority entry currently occupying a slot, and evicts it. Ties within the same priority tier are broken by age (oldest evicted first, preserving FIFO as the tiebreaker within tiers).

### Signal Categories Available for Ranking

The signal categories are not individual signals but types. The player ranks types, not instances. The categories available depend on what the unit is configured to receive:

| Category | Description | Icon |
|----------|-------------|------|
| Enemy Sighting (Close) | Enemies within 2 tiles | Red diamond, solid |
| Enemy Sighting (Far) | Enemies 3-5 tiles away | Red diamond, hollow |
| Terrain Observation | Terrain features in perception | Green square |
| Friendly Position | Allied unit locations | Blue circle |
| Threat Alert | Relay-forwarded danger signals | Orange triangle |
| Resource Ping | Tagged node status updates | Yellow hexagon |
| Command Directive | Orders from Command units | Purple star |
| Compressed Intel | Output of compress skill | Cyan bar, condensed |
| Ambient Noise | Low-value environmental data | Gray dot |
| Enemy Transmission | Intercepted enemy comms | Red signal wave |

Not all categories appear for every unit. A Scout with no hooks listening to command channels will not see "Command Directive" in its stack. The stack is dynamically populated based on the unit's channel subscriptions and perception capabilities. A Scout might see 5-6 categories; a Command unit listening on every channel might see 10-12.

### The Drag Interaction

The priority stack is rendered as a vertical column of rectangular cards, each about 40px tall by 200px wide, with the signal category icon on the left, the name in the center, and a grip handle (three horizontal lines) on the right. The stack sits in the right panel of the Blueprint Editor, below the Rules section and above the Listen/Ignore toggles.

**Drag behavior:**
- Grab any card by its grip handle (or anywhere on the card body)
- Drag vertically. Other cards smoothly slide apart to make room, with a spring-physics ease that gives the list a physical weight
- Drop to place. A subtle thud sound plays — deeper if dropped near the top (high priority), higher-pitched near the bottom (low priority). The pitch gradient reinforces the spatial metaphor: top = heavy = kept, bottom = light = expendable
- The top card glows with a faint cyan border pulse — "this is what I will protect above all else"
- The bottom card has a dim red underline — "this is what I will forget first"
- Cards in the middle gradient from cyan-tinted to neutral to red-tinted, a smooth visual spectrum from "safe" to "expendable"

**The divider line:** A dashed horizontal line sits between the last "safe" card and the first "expendable" card. The player can drag this divider up and down independently of the cards. Everything above the divider is **protected** — the unit will enter context overload rather than evict a protected-tier entry. Everything below is **expendable** — fair game for eviction. This combines the priority ordering with the pinning mechanic from 2.02c's Policy D, but with visual granularity: the player sees exactly which categories are above and below the protection line.

Moving the divider all the way to the bottom means nothing is protected (pure priority ordering, no pins). Moving it all the way to the top means everything is protected (the unit will context-overload constantly, identical to pinning everything). The divider's vertical position on the stack is the player's risk tolerance dial — higher divider = more aggressive memory management, lower divider = more conservative protection.

### How Eviction Resolves at Runtime

When the context window is full and a new entry of category C arrives:

1. Find the lowest-priority category currently in the buffer (scan from bottom of the stack upward)
2. If the lowest-priority occupied category is below category C in the stack, evict the oldest entry of that lowest category
3. If category C is itself the lowest priority in the buffer, the new entry is rejected (it would be immediately evicted anyway — the bouncer effect from 2.02c)
4. If all occupied categories are above the protection divider, the unit enters context overload (1-tick stun, incoming entry dropped)

This creates a nuanced eviction cascade. The unit doesn't just drop "the oldest thing." It drops "the oldest instance of the least important type of thing I currently remember." The player has authored a value system for this unit's memory.

---

## Strengths

**Expressiveness without code.** The drag-to-rank interaction communicates complex priority hierarchies through a physical metaphor everyone understands — a stack of cards, most important on top. No conditionals, no syntax, no dropdowns. The priority order IS the interface.

**Per-unit personality.** Different blueprints can have radically different priority stacks. A Scout might prioritize enemy sightings above all else and treat friendly positions as expendable noise. A Relay might prioritize compressed intel and threat alerts, treating raw observations as the most disposable category. The priority stack is a character sheet for the unit's attention.

**Visible consequences.** In the Inspector, the player can see exactly which eviction decisions the priority stack caused. "Tick 14: evicted Terrain Observation (priority 7/8) to make room for Threat Alert (priority 2/8)." The causal chain from plan-phase drag to battle-phase eviction is traceable and learnable.

**Natural difficulty curve.** Mission 2 introduces the stack with only 3 categories. By Mission 8, the player manages 10+ categories across 5+ blueprints. The mechanic scales by adding categories, not by changing rules.

**The protection divider is a risk knob.** It gives the player a single, intuitive control over how aggressively the unit manages its memory. Conservative players leave the divider low (protect most things, risk overload). Aggressive players push it high (evict freely, never overload). The divider position is a bet about the information environment of the upcoming mission.

---

## Weaknesses

**Set-and-forget risk.** Once a player finds a "good enough" priority order, they may never touch it again. If enemy sightings are always most important, the stack becomes static. The game must create missions where the optimal priority order changes — information warfare missions where enemy transmissions should be deprioritized (they are disinformation), or stealth missions where ambient noise becomes critically important (it contains patrol pattern data).

**Cognitive load at scale.** A Command unit listening on 6 channels might present 12+ signal categories in the stack. Ranking 12 items is a meaningful cognitive task. The interaction needs affordances for bulk operations — "move all combat-related categories above all logistics categories" — without introducing a sub-language.

**Doesn't capture conditional priorities.** "Keep enemy sightings unless they are older than 5 ticks" cannot be expressed with a static ranked list. The priority stack is unconditional — category X is always above category Y, regardless of context. Conditional eviction requires the decay buffer (2.03) or rule-based eviction (a potential extension), not the drag-to-rank interface.

**Interaction with weight system.** If signals also carry weights (2.02), the player must understand the interaction between per-entry weight and per-category priority rank. Does a weight-5 Terrain Observation outrank a weight-3 Threat Alert that sits higher in the priority stack? The resolution rule must be unambiguous and visually communicable. The recommended resolution: **priority stack rank always wins; weight is the tiebreaker within the same rank tier.** This keeps the player's authored priority order as the primary authority.

---

## Interaction Effects

**With the Weighted Buffer (2.02):** Weight becomes the within-tier tiebreaker. Two Threat Alerts in the same priority tier — the lighter one is evicted first. This gives weight a clear, bounded role without creating a two-axis priority matrix the player must manage.

**With the Decay Buffer (2.03):** Decay addresses the stale-data problem that static priority stacks cannot. A high-priority enemy sighting decays in weight over time, eventually becoming lighter than a fresh low-priority ambient ping. The priority stack says "enemy sightings matter most." Decay says "but not forever." Together they create a memory system that values both importance and recency.

**With Hook Configuration:** The Listen/Ignore toggles sit directly below the priority stack in the Blueprint Editor. This spatial proximity is deliberate — the player sees the connection: "I can either ignore a channel entirely (no entries of that type) or listen but rank it low (entries arrive but are evicted first)." The toggle is a binary gate; the priority stack is a gradient. The two controls compose naturally.

**With the Rules System:** Rules evaluate against current buffer contents. A Striker's rule "if enemy sighting in close range, engage" depends on enemy sightings surviving long enough in the buffer to be evaluated. If the player ranks enemy sightings low in the priority stack, the rule may never fire because enemy sightings are evicted before the evaluation phase. The priority stack controls what the rules can see — it is a pre-filter on the decision engine.

**With Information Warfare (2.08):** Enemy signal flooding becomes a targetable attack. If the enemy knows (or guesses) that a player's Scouts prioritize enemy sightings, flooding dummy sightings fills the buffer with false data that the Scout refuses to evict because it is high-priority. The counter is conditional eviction (not expressible in the basic stack) or the heaviest-first inversion from 2.02c. The priority stack creates exploitable patterns — this is a feature, not a bug, because it rewards players who vary their configurations.

---

## Comparable Games

**Dwarf Fortress — Labor Priorities:** Dwarf Fortress lets players rank labors for each dwarf in a priority grid (1-7 per labor type). A dwarf with Mining at priority 1 and Hauling at priority 4 will always mine before hauling. The interaction is a grid of dropdown numbers, not a drag list, but the underlying mechanic is identical: the player defines a preference ordering over task types, and the system resolves conflicts by consulting the ordering. Robot Uprising's drag-to-rank is a more tactile version of the same idea.

**RimWorld — Work Tab:** RimWorld's work tab lets players assign numeric priorities (1-4) to work types per colonist. The community mod "Work Tab" extends this to drag-to-reorder within priority tiers. The lesson from RimWorld: numeric priorities are functional but emotionally flat. Dragging a card above another card creates a more visceral sense of "I am choosing X over Y." The physical act of displacement — watching card Y slide downward as card X takes its place — communicates the trade-off better than changing a number from 3 to 2.

**Slay the Spire — Potion Slot Management:** Not a direct analog, but Slay the Spire's limited potion slots force the player to decide what to keep and what to discard when finding a new potion with full slots. The decision is binary (keep or discard), not ordered, but the feeling is the same: "I have limited memory, what is worth remembering?" The eviction priority stack makes this decision systemic rather than one-off.

**Into the Breach — Turn Order Manipulation:** Into the Breach lets players manipulate the order in which enemies act by pushing and pulling them. The priority stack is conceptually similar — the player manipulates the order in which signal categories are valued, knowing that the ordering determines survival outcomes.

---

## Sensory Description

The Eviction Priority Stack lives in the right panel of the Blueprint Editor, occupying roughly 300px of vertical space. The panel background is a dark charcoal (#1a1a2e) with subtle circuit-board trace patterns in slightly lighter charcoal. The section header reads **"MEMORY PRIORITY"** in a condensed sans-serif, cool cyan (#4ecdc4), with a small brain icon to the left.

Each signal category card is a rounded rectangle with 4px corner radius, background a matte dark gray (#2d2d44). The left edge shows the category icon — a 24px pictogram in the category's signature color (red for enemy, blue for friendly, green for terrain, orange for threat, purple for command). The category name is set in a clean 13px sans-serif, white (#e8e8e8), with a subtle letter-spacing of 0.5px. The right edge shows the drag grip — three thin horizontal lines in medium gray (#666), which brighten to white when hovered.

When the player grabs a card, it lifts slightly (2px drop shadow deepens to 6px), the card's background lightens to (#3d3d54), and a gentle haptic-like pulse ripples outward from the grab point — a ring of light that expands and fades in 200ms. The other cards in the stack slide apart with a spring-physics animation (overshoot 5%, settle in 300ms), opening a gap the exact height of the dragged card plus 4px of breathing room. The gap has a faint dashed-line indicator showing where the card will land.

Dropping the card triggers a satisfying **thunk** — a short, percussive sound with bass weight proportional to the card's new position. Drop at position 1 (top priority): deep resonant thud, like a heavy book placed on a desk. Drop at position 8 (lowest priority): a light tap, like a coin landing on felt. The pitch gradient reinforces the spatial metaphor without requiring the player to consciously process it.

The **protection divider** is a horizontal dashed line spanning the full width of the stack, rendered in amber (#f0a500) with a slight glow. The dashes pulse slowly (2-second cycle), drawing the eye. A tiny shield icon sits at the left end of the line, and a small text label reads "PROTECTED" above the line in amber and "EXPENDABLE" below in muted red (#c0392b). Dragging the divider plays a continuous soft hum that rises in pitch as the divider moves up (more things become expendable) and falls as it moves down (more things become protected). The hum is quiet enough to be felt more than heard — an ambient tension indicator.

When the player hovers over any card in the stack, a tooltip appears showing the card's eviction behavior in plain English: "If the context window is full, Terrain Observations will be forgotten before Threat Alerts but after Ambient Noise." This tooltip dynamically updates as the player reorders — it always describes the current card's position relative to its neighbors.

During **Sealed Watch**, the eviction priority stack is not visible — the player sees only the context bars on units. But eviction events are now color-coded: when an entry is evicted, the pip on the context bar flashes in the evicted category's color before disappearing. A red pip flash means an enemy sighting was evicted; a green flash means terrain data was dropped. Players who have internalized their priority stack can read these color flashes in real-time and know exactly what their unit just forgot.

In the **Inspector**, clicking a unit reveals the priority stack alongside the tick-by-tick buffer state. At each tick where an eviction occurred, an annotation shows: "Evicted: Terrain Observation (priority 6/8) — replaced by: Threat Alert (priority 2/8)." The evicted entry appears as a ghost card below the buffer, its category icon dimmed, with a thin red strikethrough. Ghost cards accumulate over the mission timeline — at tick 50, the ghost pile might be 30 entries deep, a graveyard of forgotten data that the player can scroll through, searching for the moment their unit forgot something critical.

---

## Player Journeys

### Journey: Maya, 16, First-Time Strategy Game Player

**Context:** Mission 2 (Siquijor). Maya just completed Mission 1, where she learned basic context windows and saw her Scout get stunned from overload. Mission 2 introduces the priority stack for the first time. She has one Scout and one Striker, pre-placed. The boot log has just finished explaining that units can be taught what to remember and what to forget.

**Minute 0:00 — The Stack Appears**

Maya is on the Plan screen. The Blueprint Editor shows her Scout's configuration. Below the Rules section, a new panel has appeared with the header "MEMORY PRIORITY" in cyan text. The boot log text at the top of the screen reads: "ATTENTION SUBSYSTEM: Memory triage initialized. Units can now be configured to prioritize which observations they retain. Drag to reorder."

She sees three cards in a vertical stack:
1. Enemy Sighting (red diamond icon)
2. Terrain Observation (green square icon)
3. Friendly Position (blue circle icon)

A pulsing arrow animation points at the stack, gently bouncing, with tiny text: "Drag to reorder — top = kept longest." Maya doesn't touch anything yet. She reads each card name, squinting at the icons.

**Minute 0:30 — First Drag**

Maya grabs "Friendly Position" and drags it upward. The other two cards slide apart smoothly, opening a gap above "Enemy Sighting." She drops it at the top. A deep thud plays. The stack now reads:
1. Friendly Position (cyan border pulse — top priority)
2. Enemy Sighting
3. Terrain Observation (dim red underline — lowest priority)

She isn't sure this is right. She thinks: "I want to know where my Striker is, so I should remember friendly positions... right?" She doesn't yet understand that Scouts rarely need to track friendlies — they need to track enemies. But the game hasn't punished her yet. She hits EXECUTE.

**Minute 1:00 — Sealed Watch, First Failure**

The mission plays out. Her Scout moves through the map, spotting enemies. The context bar fills quickly — 6 tiny pips. She notices green pips (terrain) flashing and disappearing from the left edge of the bar. Good, terrain is being evicted. But then she sees blue pips (friendly positions) accumulating — 3 of her 6 slots are now occupied by friendly position data. Her Scout knows exactly where the Striker is (it hasn't moved) but is evicting enemy sighting data (red pips flashing away) because enemy sightings are ranked below friendly positions.

The Scout walks past an enemy without engaging or alerting because its buffer was full of stale friendly-position data. The Striker, receiving no threat alerts from the Scout, walks into an ambush. Both units are eliminated on tick 18.

**Minute 1:40 — The Inspector Lesson**

The Inspector screen appears. Maya clicks her Scout at tick 15. The buffer display shows 6 slots:
- Slot 1: Friendly Position (Striker, T3) — age: 12 ticks. Stale but protected.
- Slot 2: Friendly Position (Striker, T7) — age: 8 ticks. Also stale.
- Slot 3: Friendly Position (Striker, T11) — age: 4 ticks. Current-ish.
- Slot 4: Enemy Sighting (Far, T14) — age: 1 tick. Fresh.
- Slot 5: Enemy Sighting (Close, T15) — age: 0 ticks. Critical.
- Slot 6: Terrain Observation (T15) — age: 0 ticks. Filler.

Below the buffer, a graveyard of 9 ghost entries — all red diamonds. Enemy sightings, evicted in favor of friendly positions. The annotation reads: "Evicted: Enemy Sighting (Close) (priority 2/3) — replaced by: Friendly Position (priority 1/3)."

Maya stares at the ghost pile. Nine enemy sightings forgotten so the Scout could remember where its ally was standing. She drags the timeline scrubber back to tick 10 and watches the moment the critical enemy sighting was evicted. The entry flashes red, slides down into the ghost pile, and a weight-5 friendly position (the Striker hadn't moved in 7 ticks) smugly occupies the freed slot.

"Oh," Maya says. She goes back to Plan.

**Minute 2:30 — The Fix**

Maya opens the priority stack and drags Enemy Sighting to the top. She moves Friendly Position to the bottom. The stack reads:
1. Enemy Sighting (cyan glow)
2. Terrain Observation
3. Friendly Position (red underline)

She hits EXECUTE again. This time, the Scout fills its buffer with enemy data, evicting stale friendly positions freely. The Scout's hook fires a threat alert on tick 8. The Striker receives it, engages, and eliminates the enemy on tick 10. Mission complete.

Maya has learned: **what you choose to remember is what you choose to see.** Friendly positions felt safe and important. Enemy sightings felt scary and disposable. The priority stack forced her to confront her own instinctive valuation and reverse it.

**UI Annotations:**
- **Priority stack cards**: 40px tall, 200px wide, charcoal background with colored left-edge icon. Grip handle on right (three horizontal lines).
- **Drag feedback**: Lifted card gains drop shadow. Other cards spring apart with 300ms ease. Gap indicator is dashed-line at drop position.
- **Drop sound**: Pitch gradient — deep at top, light at bottom. Reinforces spatial metaphor.
- **Inspector ghost pile**: Evicted entries appear below buffer as dimmed, struck-through cards. Red strikethrough line. Scrollable if many evictions occurred.
- **Tutorial arrow**: Pulsing bounce animation pointing at the stack, with instructional text. Disappears after first drag interaction.

---

### Journey: Darius, 28, Software Engineer and Factorio Veteran

**Context:** Mission 7 (Mindanao Jungle). Darius has completed all prior missions and is comfortable with the priority stack, hooks, and channels. He is configuring a 5-unit army: 2 Scouts, 1 Relay, 1 Striker, 1 Command. Mission 7 introduces enemy signal flooding — enemies broadcast fake threat alerts to overwhelm player unit buffers.

**Minute 0:00 — The Configuration Matrix**

Darius is on the Plan screen, rapidly switching between blueprint tabs. He has already configured his Scouts' priority stacks identically:
1. Enemy Sighting (Close)
2. Enemy Sighting (Far)
3. Threat Alert
4. Compressed Intel
5. Terrain Observation
6. Ambient Noise

His Relay's stack is different — the Relay doesn't perceive enemies directly, so it ranks incoming channel data:
1. Compressed Intel
2. Threat Alert
3. Command Directive
4. Enemy Transmission
5. Ambient Noise

He notices a new category in the Relay's stack: "Enemy Transmission" — a signal type introduced in Mission 7. Hovering over it, the tooltip reads: "Intercepted enemy communications. May contain disinformation." Darius pauses. Where should he rank enemy transmissions?

**Minute 0:45 — The Disinformation Dilemma**

Darius knows from the mission briefing that enemies will flood channels with fake signals. His instinct is to rank Enemy Transmission at the bottom — treat it as noise, evict it first. But he also knows that enemy transmissions might contain real intel about enemy positions that his Scouts can't see (enemies beyond perception range).

He considers two configurations:

**Config A — Paranoid:** Enemy Transmission at the bottom. The Relay treats all intercepted enemy comms as disposable. Safe from disinformation but blind to any genuine enemy intel embedded in the transmissions.

**Config B — Analytical:** Enemy Transmission in the middle, below Compressed Intel and Threat Alert but above Ambient Noise. The Relay retains some enemy transmissions, giving its rules a chance to evaluate them. But if the enemy floods the channel, medium-priority enemy transmissions will consume slots that could hold player-generated threat alerts.

Darius opts for Config B. He drags Enemy Transmission to position 4 (out of 5). Then he adjusts the protection divider: he drags it down so that only Compressed Intel and Threat Alert are above the line. Command Directive, Enemy Transmission, and Ambient Noise are all expendable. His logic: "The Relay must always remember player-verified intelligence. Everything else can be sacrificed."

**Minute 1:30 — The Command Unit Priority Stack**

Darius switches to the Command unit's blueprint. The Command has a 14-slot buffer and listens on every channel. Its priority stack has 11 categories. He stares at the list, then begins engineering:

1. Command Directive (self-generated orders — must never forget its own decisions)
2. Compressed Intel (highest-quality player data)
3. Threat Alert (time-sensitive danger)
4. Enemy Sighting (Close) (the Command doesn't perceive, but receives these via hooks)
5. Enemy Sighting (Far)
6. Resource Ping
— PROTECTION DIVIDER —
7. Friendly Position
8. Enemy Transmission
9. Terrain Observation
10. Ambient Noise
11. (Reserved for future signal types — empty category, grayed out)

He sets the divider between position 6 and 7. The top 6 categories are protected — the Command will context-overload rather than lose them. The bottom 5 are expendable, ranked from most to least valuable among the expendables.

Darius hovers over the divider. The tooltip reads: "6 of 14 slots protected. Maximum 8 slots available for expendable categories before context overload." He does the math: if all 6 protected categories have at least one entry each, that leaves 8 slots for expendable data. The Command can absorb 8 expendable entries before it must start evicting. But if the 6 protected categories accumulate multiple entries each (the Command receiving repeated threat alerts, for example), protected entries could consume 10-12 of 14 slots, leaving only 2-4 for expendable data. The divider position is a bet about buffer utilization distribution.

He decides this is acceptable. The Command's job is to maintain strategic awareness, not to be a data warehouse. Expendable data is cheap; strategic context is irreplaceable.

**Minute 2:45 — Execute and Observe**

Darius hits EXECUTE. The sealed watch plays out. At tick 8, the enemy begins flooding. His Scouts' context bars fill rapidly — red pips and orange pips (enemy transmissions arriving via intercepted channels) competing for space. The Scouts' priority stacks keep enemy sightings safe, and the enemy transmissions — ranked low — are evicted immediately. The Scouts are unaffected by the flood. Good.

The Relay is another story. At tick 12, the Relay's context bar is saturated. Enemy transmissions are consuming 3 of its 12 slots (ranked position 4, above ambient noise). The Relay starts evicting ambient noise, then terrain data. By tick 15, the Relay's buffer is: 4 compressed intel (protected), 3 threat alerts (protected), 3 enemy transmissions (expendable but ranked above ambient), 2 ambient noise. The enemy transmissions are displacing useful data.

At tick 18, a critical moment: a genuine threat alert arrives from Scout-1. The Relay's buffer is full. The eviction system scans from the bottom: Ambient Noise is the lowest priority. One ambient noise entry is evicted. The threat alert enters the buffer. Safe — but only because there was still expendable data below the enemy transmissions. If the flood continues, the Relay will eventually have to evict enemy transmissions to make room for new threat alerts, which is correct behavior. But Darius watches the buffer bar nervously, counting the colored pips.

**Minute 3:30 — Inspector Deep Dive**

In the Inspector, Darius clicks the Relay at tick 20. The buffer state shows his priority stack working exactly as configured — threat alerts and compressed intel are preserved, enemy transmissions are being retained at medium priority and slowly displaced as higher-priority data arrives. The ghost pile shows 14 evicted entries: 8 ambient noise, 4 terrain observations, 2 enemy transmissions. No threat alerts or compressed intel were evicted. The protection divider held.

But Darius notices something in the ghost pile: one of the evicted enemy transmissions contained a genuine enemy position report that matched a Scout observation 3 ticks later. It was real intel, and the Relay evicted it. He scrubs back to tick 16 and watches the eviction happen. The enemy transmission entry glows briefly — its content reads "Enemy unit at E4" — and then slides into the ghost pile as a fresh ambient noise entry from a different channel pushes it out. Three ticks later, Scout-2 confirms an enemy at E4. The Relay had the information and threw it away.

Darius considers: should he rank Enemy Transmission higher for the next attempt? But that would make the flood attack more effective — more fake transmissions would consume buffer space. The trade-off is real and mission-specific. He decides to keep the current priority order but add a rule to the Relay: "If Enemy Transmission matches recent Enemy Sighting, elevate to Compressed Intel." This rule-based promotion is a different mechanic (explored in Rules, aspect 3.x), but the priority stack is what framed the decision. The stack created the legible trade-off; the rule addresses the conditional case the stack cannot express.

**UI Annotations:**
- **11-item priority stack**: Scrollable if the panel height is insufficient. Scroll indicators (faint gradient overlay at top/bottom of scrollable region) appear when the list extends beyond the visible area.
- **Protection divider tooltip**: Shows current protected-slot budget ("6 of 14 slots protected") and warns when protected categories exceed 80% of buffer capacity ("Warning: protected categories may consume 12+ of 14 slots, leaving minimal expendable capacity").
- **Inspector ghost pile sorting**: Ghost entries can be sorted by category, age, or eviction tick. Darius sorts by category to see all evicted enemy transmissions grouped together.
- **Priority stack diff view**: When switching between blueprints, cards that are in different positions flash briefly, highlighting the configuration differences between units.

---

### Journey: Grandma Lola, 62, Retired Teacher, Casual Puzzle Game Player

**Context:** Mission 4 (Batanes Highlands). Lola has been playing slowly, replaying each mission 2-3 times. She is comfortable with the basic priority stack (3-4 categories) but has never touched the protection divider. Mission 4 introduces the Relay unit type, which has a 12-slot buffer and receives data from multiple channels. Lola's army is pre-placed: 1 Scout, 1 Relay, 1 Striker.

**Minute 0:00 — Overwhelmed by the Relay's Stack**

Lola opens the Relay's blueprint. The priority stack is longer than she has seen before — 7 categories instead of 3. She reads each one slowly:
1. Compressed Intel
2. Threat Alert
3. Enemy Sighting (Close)
4. Enemy Sighting (Far)
5. Terrain Observation
6. Friendly Position
7. Ambient Noise

The default order was set by the game (a reasonable preset). Lola doesn't know if she should change it. She hovers over each card, reading the tooltips:
- "Compressed Intel: Output of the compress skill. Dense, high-value summaries."
- "Threat Alert: Danger signals forwarded by allied units. Time-sensitive."
- "Ambient Noise: Low-value environmental background data."

She nods. The descriptions help. Compressed Intel sounds important — it stays at the top. Ambient Noise sounds useless — it stays at the bottom. She decides not to change the default order. "If the game set it this way, it's probably fine," she thinks.

**Minute 0:40 — Noticing the Divider**

As Lola is about to switch to the Scout's blueprint, she notices the dashed amber line between Terrain Observation (position 5) and Friendly Position (position 6). She hasn't seen this before. She hovers over it and reads the tooltip: "Entries above this line are PROTECTED — your unit will overload rather than forget them. Entries below are EXPENDABLE — they will be forgotten first when the context window is full."

"Overload" sounds bad — Lola remembers her Scout getting stunned in Mission 1 when the context window overloaded. She doesn't want that to happen to the Relay. She considers moving the divider all the way down (nothing protected, no risk of overload) but the tooltip changes: "0 of 12 slots protected. All entries are expendable. No context overload risk, but critical intelligence may be forgotten under pressure."

"Hmm." Lola looks at the stack. She thinks about what the Relay is supposed to do — it receives messages from the Scout and forwards them to the Striker. The boot log said the Relay is a "communications hub." She reasons: if the Relay forgets a threat alert, the Striker won't know about the enemy. That's worse than a 1-tick stun.

She drags the divider down to sit between Threat Alert (position 2) and Enemy Sighting (Close) (position 3). Now only Compressed Intel and Threat Alert are protected. The tooltip reads: "2 of 12 slots protected. 10 slots available for expendable categories."

"Two important things protected. That seems safe." She is satisfied. She has made a deliberate decision about her Relay's memory priorities without fully understanding the eviction algorithm — she understood the trade-off ("forget vs. stun") and chose a conservative middle ground.

**Minute 1:20 — Execute and Relief**

The mission plays out. The Relay sits in the center of the map, receiving signals from the Scout. Its context bar fills steadily — blue pips (received messages) arriving every few ticks. At tick 14, the bar is full (12 slots occupied). A green pip flash appears at the left edge — terrain observation evicted. Then another green flash. Then a blue flash — friendly position evicted. The Relay is managing its memory, evicting expendable data to make room for incoming signals.

Lola watches the Relay's context bar nervously. She sees orange pips (threat alerts) holding steady, never flashing away. Her protection divider is working — threat alerts are safe. At tick 22, the Scout spots an enemy cluster and fires 4 threat alerts in rapid succession. The Relay's buffer absorbs them, evicting terrain and friendly position data. All 4 threat alerts survive. The Relay forwards them to the Striker, which engages and eliminates the enemy cluster on tick 25.

Mission complete. Lola claps softly. Her Relay didn't overload, didn't forget anything critical, and the protection divider — the one she almost ignored — saved the mission by guaranteeing that threat alerts survived the buffer crunch.

**Minute 2:00 — Inspector Discovery**

In the Inspector, Lola clicks the Relay at tick 22 — the critical moment. The buffer display shows:
- Slots 1-2: Compressed Intel (cyan bar icons, protected — cyan shield badge on the left)
- Slots 3-6: Threat Alert (orange triangle icons, protected — cyan shield badge)
- Slots 7-9: Enemy Sighting (red diamond icons, expendable)
- Slots 10-12: Enemy Sighting (red diamond icons, expendable)

The ghost pile shows 18 evicted entries — mostly terrain observations and friendly positions. All expendable categories. Zero protected entries were evicted. The system reads: "Protection divider held for all 35 ticks. No context overload events."

Lola smiles. She understood what the divider did, set it conservatively, and it worked. She didn't need to understand FIFO, weight tiers, or eviction algorithms. She understood "protect these two, let the rest go." That was enough.

**Minute 2:30 — Voluntary Optimization**

Curiosity strikes. Lola wonders: "What if I protected more things?" She goes back to Plan and drags the divider down to position 4 — now Compressed Intel, Threat Alert, Enemy Sighting (Close), and Enemy Sighting (Far) are all protected. She runs the mission again.

This time, at tick 20, the Relay's context bar shows a different pattern. 8 of 12 slots are protected entries (2 compressed intel, 4 threat alerts, 2 enemy sightings). Only 4 expendable slots remain. When the Scout's burst of 4 threat alerts arrives at tick 22, the first 2 fill the remaining expendable slots (displacing terrain and ambient data). The 3rd threat alert triggers an eviction of the lowest expendable entry. But the 4th — there are no expendable entries left. All 12 slots are now protected (the 4 original protected types have filled the buffer). Context overload. The Relay stuns for 1 tick. The 4th threat alert is dropped.

The Striker receives 3 of 4 threat alerts — still enough to engage, but the timing is delayed by 1 tick due to the stun. The Striker eliminates 2 of 3 enemies. The third enemy reaches the Striker. Mission failed.

Lola stares at the screen. "I protected too much." She drags the divider back up to position 2 — her original configuration. She has learned, through experience, that protection has a cost. More protection means less buffer flexibility means more overload risk. The divider is not a "safety dial" you always push toward maximum — it is a balance point.

**UI Annotations:**
- **Default priority order**: The game provides a sensible default ordering for each unit type. New players can succeed without touching the stack. Defaults are good enough for Missions 1-4 but become suboptimal by Mission 5.
- **Protection divider badge**: Protected entries in the Inspector show a small cyan shield icon to the left of the slot, visually distinguishing them from expendable entries. The shield icon pulses during eviction events to show "this entry was considered for eviction but protected."
- **Context overload replay**: In the Inspector, overload events are highlighted with a red border around the tick pip on the timeline. Clicking shows exactly which incoming entry triggered the overload and which protected entries prevented eviction.
- **Divider drag feedback**: As the divider moves, the background tint of cards above/below transitions in real-time. Cards crossing from expendable to protected gain a faint cyan wash; cards crossing from protected to expendable lose it and gain a faint red wash. The visual transition is immediate and reversible, encouraging experimentation.

---

## The TikTok Clip

Fifteen seconds: A player drags "Enemy Sighting" from the bottom of the priority stack to the top. The cards slide apart with spring physics. Deep thud on drop. Cut to the battlefield — the same Scout that was ignoring enemies now locks on, its context bar full of red pips. Hook fires. Striker engages. Enemy eliminated. Text overlay: "What your AI remembers is what your AI sees." Cut to the priority stack with "Ambient Noise" at the bottom, glowing red. "What it forgets... is what kills it."

---

## Summary of Design Space

The player-configured eviction stack is the most expressive non-code interface for defining memory priorities. It turns eviction policy from an algorithmic preset into a player-authored value system. The drag-to-rank interaction is immediately learnable (everyone understands "top = most important"), the protection divider adds a risk/safety dimension, and the Inspector's ghost pile makes consequences visible and traceable.

The mechanic's primary risk is "set and forget" — mitigated by missions that shift the optimal priority order. Its primary depth comes from the interaction between the stack and other systems (weights, decay, hooks, rules, information warfare). The stack alone is a powerful teaching tool; combined with the full Context Config suite, it becomes the central engineering interface of the game.

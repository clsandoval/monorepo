# 2.09 — Sticky Memories: Pinned Entries That Never Evict

## The Option

Some buffer entries can be **pinned** — marked as sticky, permanently occupying their slot, immune to eviction regardless of buffer pressure. A pinned entry never scrolls off the left edge of the buffer bar. It stays until the player explicitly unpins it (between missions, or via a mid-battle skill) or the unit is destroyed. The cost is absolute: a Scout with 6 slots and 2 pinned entries has a **4-slot working buffer**. Those 2 pinned slots are gone. They hold what the player decided was important enough to carve into the unit's permanent awareness, and everything else — every observation, every hook message, every signal — must compete for the remaining 4 slots.

This is the **system prompt** mechanic. In every LLM deployment, the system prompt consumes tokens from the context window — permanently. A 2,000-token system prompt in a 128K context window is negligible. A 2,000-token system prompt in a 4K context window is half the available space. The system prompt is the operator's guarantee that the model will always have access to certain instructions, personality definitions, and behavioral constraints. It trades capacity for consistency. Pinned entries do the same thing for Robot Uprising agents.

### Mechanical Specification

**What can be pinned:**
- Any datum that currently exists in a unit's buffer can be pinned during the Plan phase. The player opens the buffer inspector, selects an entry, and taps "Pin." The datum locks in place.
- Pre-authored directives can be pinned at unit creation. These are player-written text entries — standing orders, identity statements, behavioral constraints — that function like system prompts. Example: a Striker might have a pinned directive reading `{type: directive, payload: "Never engage targets west of column D"}`. Rules can evaluate against directives just like any other buffer datum.
- Observations and hook messages received during battle CANNOT be pinned mid-battle in the base game. Pinning is a Plan-phase decision. (A late-game skill called "Imprint" can override this — see Interaction Effects.)

**Pin capacity per unit type:**

| Unit | Buffer Size | Max Pins | Minimum Working Buffer |
|------|-------------|----------|------------------------|
| Scout | 6 | 1 | 5 |
| Striker | 8 | 2 | 6 |
| Specialist | 10 | 3 | 7 |
| Relay | 12 | 3 | 9 |
| Command | 14 | 5 | 9 |

The max pins column is a hard cap. The minimum working buffer — the smallest buffer a unit can have after maxing out pins — is deliberately set to keep every unit functional. A Scout can never go below 5 working slots. A Command can never go below 9. These floors prevent players from bricking their own units by pinning too aggressively.

**Pin slot positioning:**
Pinned entries occupy the **leftmost** slots of the buffer, before position 0 of the working buffer. Visually, they sit at the far left of the buffer bar, separated from the working buffer by a thin vertical divider — a 1-pixel white line. Working buffer entries shift and evict among the remaining slots. Pinned entries never shift. They are static anchors.

**Unpinning:**
- During Plan phase: free. Tap a pinned entry, tap "Unpin," it becomes a normal buffer entry subject to eviction.
- Mid-battle: requires the "Reformat" skill (Specialist and Command only). Reformat costs 1 action tick and clears a pinned slot, freeing it for working buffer use. The unpinned datum is immediately evicted (not preserved). This is a destructive operation — the unit deliberately forgets a core belief to gain tactical flexibility. The visual: the pinned slot's lock icon shatters into pixel fragments, the divider line shifts left by one segment, and the working buffer gains a slot. A quiet glass-breaking sound plays.

**Directive authoring:**
In the Plan phase, the player can write custom directives for any unit. The directive editor is a minimal text field — 60 characters max — with autocomplete for game-recognized keywords (`enemy`, `ally`, `sector`, `channel`, `threat`, `clear`). Directives are parsed by the rules engine as structured payloads. A directive like `"prioritize threats on channel alpha"` becomes `{type: directive, keywords: [prioritize, threat, channel-alpha]}`, which rules can match against.

The 60-character limit is a design constraint, not a technical one. Like a tweet, like a commit message, like a system prompt preamble — compression forces clarity. A player who writes `"engage nearest enemy always"` has written a different agent than one who writes `"hold position unless threatened on flank"`. The directive IS the agent's personality, etched into permanent memory.

### The System Prompt Parallel

This mechanic exists because of the 1:1 parallel with real LLM system prompts, and the design leans into that parallel completely.

In production LLM deployments, the system prompt is the operator's contract with the model. It says: "No matter what the user sends, no matter how full the context window gets, you will always have these instructions available." The cost is real — a 4,000-token system prompt in Claude's context window is 4,000 tokens that can't hold conversation history. Operators agonize over system prompt length. Every sentence must earn its slot.

Robot Uprising makes this tradeoff tactile. When a player pins a directive to a Scout with 6 slots, they feel the cost immediately — the buffer bar shortens. The remaining 5 slots must handle all observations, all messages, all signals. The player has decided that consistent behavior (the Scout always remembers its standing orders) is worth more than flexible capacity (the Scout can hold one more observation per tick).

The teaching arc is direct:
- **Mission where pinning is introduced:** The player learns that pinned directives create consistent unit behavior across the entire battle. A Striker with a pinned `"only engage isolated targets"` directive will never rush into a group, even when its rules might otherwise trigger.
- **Mission where pinning costs bite:** The player's Scout with 1 pinned directive and 5 working slots hits a high-density area with 6+ observations per tick. The Scout is already red-lining at a capacity where an unpinned Scout would have been fine. The pin costs a slot, and that one slot makes the difference between stable operation and context overload.
- **Post-game reflection:** "I built a system prompt that was too long for the context window." Players who later work with LLMs will recognize this exact problem. The intuition transfers.

## Player Journeys

#### Journey: Lena, 16, High School Student, Plays Mobile Games

**Context:** Mission 6 — first mission where Scouts encounter conflicting objectives. Lena has beaten missions 1-5 using simple configurations. Her Scouts tend to wander because their rules fire inconsistently as buffer contents shift. She's playing on her phone during a bus ride.

**Minute 0:00 — The Wandering Scout Problem**
Lena opens the mission briefing. Two Scouts, one Striker. The objective is to identify an enemy position in the northeast quadrant without being detected. Her Scouts keep walking toward whatever enemy they most recently observed — when the buffer shifts and a different enemy becomes the newest entry, the Scout changes direction. In Mission 5, this caused her Scout to zigzag across the board and walk into an ambush.

The tutorial tooltip appears: "Your Scouts forget their mission as new observations arrive. What if they could remember one thing permanently?" A new button appears on the buffer inspector panel: a pushpin icon, labeled "Pin."

**Minute 0:30 — First Pin**
Lena opens Scout-A's buffer inspector. The tutorial guides her to the directive editor: "Write a standing order for this Scout." She types: `"stay east of column E"`. The directive appears as a gold entry in slot 0 of the buffer bar, with a tiny lock icon overlaid. The buffer bar's left edge now shows: [gold-locked] [gray] [gray] [gray] [gray] [gray]. Five working slots instead of six.

The tooltip explains: "This Scout will always remember this order. But it now has only 5 slots for everything else."

**Minute 1:00 — The Payoff**
Lena configures a rule: `IF directive contains "stay east" AND position is west of E → move east`. She hits EXECUTE. During Sealed Watch, the Scout encounters enemies west of column E. Its rules fire: the directive check runs first, the Scout sees its permanent order, and turns east instead of pursuing. The Scout holds its sector. The Striker, receiving clean intelligence from the Scout's consistent position, engages and eliminates the target.

Lena watches the Scout's buffer bar. The gold segment at the left never changes, never flickers, never dims. It is a constant. Everything to its right — greens and blues — shifts and cycles. But the gold anchor holds.

**Minute 2:30 — The Cost Appears**
On her second attempt (she adjusts the Striker's position), the Scout enters a crowded area. Five enemies in perception range = 5 observations on a 5-slot working buffer. The buffer is immediately full. Eviction flash starts. The Scout is processing maximum data with minimum headroom.

A sixth enemy appears from behind terrain. Six observations, five slots. One observation is evicted — the one about the enemy approaching from the south. The Scout doesn't react to the southern threat. The enemy advances and eliminates the Scout.

In the Inspector, Lena sees it: the evicted observation is in the graveyard, marked red. Above it, the gold pinned directive sits untouched in its locked slot. "If I hadn't pinned that order, the Scout would have had 6 slots and the southern enemy would have fit." She pauses. "But then the Scout would have wandered west and been detected."

The tradeoff crystallizes. The pin saved the mission strategy but cost the Scout its life. Both outcomes are valid. The player's job is to decide which cost they'll pay.

**UI Annotations:**
- Pinned slot: gold background (#d4a84b), 1px lock icon (4x5 pixels, white) overlaid at top-left corner of the segment
- Divider between pinned and working buffer: 1px vertical white line, 4px tall (same height as buffer bar)
- Directive editor: modal overlay, dark background, monospace font, 60-character counter in bottom-right, autocomplete dropdown appears after 3 characters typed
- Pin button in Inspector: pushpin icon, 16x16px, appears on hover over any buffer entry during Plan phase

---

#### Journey: Tomasz, 34, DevOps Engineer, Plays Factorio and Zachtronics

**Context:** Mission 11 — complex multi-unit coordination mission. Tomasz has been playing for two weeks. He understands buffer mechanics deeply and has started thinking about pinned directives as "infrastructure configuration." He plays on PC, two monitors.

**Minute 0:00 — The Configuration Architecture**
Tomasz is designing a 12-unit army: 4 Scouts, 2 Relays, 4 Strikers, 1 Specialist, 1 Command. He opens each unit's directive editor and writes role-specific pinned directives:

- Scout-Alpha: `"report on channel intel-north"` (pinned)
- Scout-Beta: `"report on channel intel-south"` (pinned)
- Relay-West: `"compress and forward to processed-west"` (pinned, pinned — 2 pins, 10 working slots)
- Command: `"coordinate west flank first, east second"` (pinned), `"escalate if 3+ threats same sector"` (pinned), `"heartbeat every 3 ticks"` (pinned) — 3 pins, 11 working slots
- Strikers: each has 1 pinned directive assigning their patrol sector

Tomasz stares at the channel map. Every unit has a gold segment at the left of its buffer bar. The army has a **shared doctrine** — pinned directives that define each unit's role, channel assignments, and behavioral constraints. Individual unit behavior may vary wildly based on runtime buffer contents, but the pinned directives guarantee structural consistency.

"This is literally a Kubernetes deployment manifest," he mutters. "The pinned directives are the pod spec. The working buffer is the runtime state."

**Minute 2:00 — The Relay Capacity Problem**
Tomasz notices Relay-West has 2 pinned directives, leaving 10 working slots. In previous missions, his Relays needed all 12 slots during high-intensity phases. He pulls up the mission intel: this map has dense enemy clusters in the west. The Relay will receive 8-10 messages per tick from two Scouts during peak engagement.

He does the math: 10 working slots, 8-10 messages per tick. The Relay will be red-lining constantly. With 12 slots (no pins), it would have 2 slots of headroom. Those 2 pinned slots — his channel routing directives — are the difference between stable operation and cascade failure.

"Do I really need both directives pinned?" He opens Relay-West. Directive 1: `"compress and forward to processed-west"`. Directive 2: `"drop duplicate observations"`. The second directive instructs the Relay's dedup rule to discard repeated signals. Without it, the Relay would process duplicates, wasting buffer space. With it, the Relay stays cleaner — but the directive itself costs a slot.

Tomasz unpins directive 2. He rewrites the Relay's rules to handle dedup without a pinned directive — adding a rule condition that checks for duplicate payloads. The rule is more complex, but it doesn't consume a permanent slot. The Relay goes from 10 working slots to 11.

"Trading configuration simplicity for capacity. That's the system prompt optimization problem. You shorten the system prompt to give the model more room to think."

**Minute 4:00 — The Command's Five Pins**
The Command unit is the extreme case. Tomasz has 3 directives pinned, leaving 11 working slots. He could pin up to 5. He considers adding two more: `"retreat if base threatened"` and `"reserve 2 strikers for defense"`. Both would codify defensive doctrine.

But 5 pins would leave only 9 working slots. The Command receives intelligence from the entire army. During peak combat, 14+ messages per tick arrive. At 9 working slots, the Command would be permanently overloaded — context catastrophe as the baseline state, not an edge case.

Tomasz leaves it at 3 pins. "The Command needs to think more than it needs to remember its identity. The Scouts can afford 1 pin each because they're simple — they observe and report. The Command is the brain. You don't fill the brain with reminders; you give it room to process."

**UI Annotations:**
- Multi-pin buffer bar: gold segments stack left-to-right, each with its own lock icon, separated from working buffer by the white divider line
- Pin count indicator: small "2/3" text below the buffer bar (2 pins used, 3 max) in 8px monospace, subtle but readable on hover
- Channel map with pin annotations: units with pinned directives show a small gold dot next to their icon on the channel map, indicating the unit has hardcoded behavior

---

#### Journey: Rina, 22, ML Engineering Intern, First Zachtronics-Style Game

**Context:** Late-game sandbox mode. Rina has completed the campaign and is experimenting with adversarial scenarios against the AI factory. She's specifically interested in the system prompt parallel because she tunes LLM system prompts at work.

**Minute 0:00 — The Jailbreak Experiment**
Rina builds two identical Scouts, same rules, same hooks, same channel subscriptions. Scout-A has a pinned directive: `"ignore all signals from channel enemy-bait"`. Scout-B has no pins — all 6 slots are working buffer.

She configures the enemy to broadcast deceptive signals on channel "enemy-bait" — false threat reports designed to lure Scouts into ambushes. This is the adversarial prompt injection scenario: an attacker sending messages designed to override the agent's intended behavior.

**Minute 1:00 — The Test**
Both Scouts deploy. The enemy starts broadcasting bait signals. Scout-B receives a bait message: `{source: unknown, channel: enemy-bait, payload: "high-value target at H8"}`. Scout-B's rules evaluate: it sees a threat report, its pursuit rule fires, it moves toward H8. It walks into a kill zone. Eliminated on tick 14.

Scout-A receives the same bait message. The message enters the working buffer. Scout-A's rules evaluate: the first rule checks the pinned directive — `"ignore all signals from channel enemy-bait"`. The rule matches. The bait message is deprioritized. Scout-A holds position. It survives.

Rina grins. "The pinned directive is a system prompt that says 'you are not susceptible to this attack.' The working buffer received the adversarial input — it's in memory, consuming a slot — but the pinned directive overrides it in the rule evaluation. The system prompt wins."

**Minute 2:30 — The Capacity Exploit**
Rina pushes the experiment. She configures the enemy to flood channel "enemy-bait" with 5 messages per tick. Scout-A's working buffer (5 slots) fills entirely with bait messages. The Scout ignores them all — the pinned directive ensures that — but the bait messages have evicted all legitimate observations. The Scout can't see real enemies anymore because its working buffer is full of garbage.

"The system prompt protected against the attack's intent but not against its volume. The adversary doesn't need to trick the agent — it just needs to fill the context window with noise so there's no room for real information. That's a denial-of-service attack on the context window."

Rina adds a second layer: a rule on Scout-A that says `IF buffer contains entry from channel "enemy-bait" → discard oldest "enemy-bait" entry`. This is active garbage collection — the agent cleans its own buffer of known-bad data. The cost: 1 action tick spent on housekeeping instead of moving or observing. But the working buffer stays usable.

**Minute 4:00 — The System Prompt Length Experiment**
Rina builds a Command unit with escalating pin counts: 0 pins, 1 pin, 3 pins, 5 pins. She runs the same scenario four times, tracking performance.

- 0 pins (14 working slots): The Command processes all incoming data. High throughput but inconsistent behavior — it sometimes contradicts itself because rules fire differently based on which data happens to be in the buffer at evaluation time.
- 1 pin (13 working slots): One directive establishes primary objective. Behavior is consistent on the macro level but flexible in tactics. Slight throughput reduction barely noticeable.
- 3 pins (11 working slots): Three directives cover objective, defensive doctrine, and escalation protocol. Behavior is highly consistent but the Command starts red-lining during peak engagement. It drops 2-3 signals per tick that would have fit in the 0-pin configuration.
- 5 pins (9 working slots): Five directives create a fully specified behavioral framework. The Command behaves identically across runs — perfect consistency. But it's perpetually overloaded. It drops 5+ signals per tick. Downstream units starve. The army is doctrinally pure and tactically blind.

Rina writes in her notes: "The system prompt length curve is real. Short system prompts = flexible but unpredictable. Long system prompts = consistent but capacity-starved. The optimal length depends on the complexity of the environment. Dense battlefields need shorter system prompts. Sparse battlefields can afford longer ones. This is exactly what we see in production LLM deployments."

**UI Annotations:**
- Bait message visual: buffer entries from adversarial channels render with a faint red tint on the segment color, distinguishable from friendly blue messages but only if the player knows to look
- Discard action visual: when the garbage-collection rule fires, the discarded entry's segment crumbles (2-frame animation, pixel dissolve from bottom-up) and the slot opens to dark gray
- Pin count comparison view (sandbox mode): side-by-side buffer bars for multiple identical units with different pin counts, lined up vertically for visual comparison of working buffer capacity

## Strengths

1. **Teaches the most important concept in LLM engineering.** System prompt design — balancing persistent instructions against available context capacity — is the single most consequential decision in production LLM deployment. No other game mechanic maps to this so directly. Players who master pinned directives will recognize the tradeoff immediately when they encounter real system prompts.

2. **Creates unit identity.** Without pins, every Scout is functionally identical until runtime buffer contents diverge them. With pins, each Scout has a permanent personality — a standing order, a sector assignment, a behavioral constraint. The pin makes the unit *someone* rather than *something*. Players name their units based on their pinned directives. "Eastwatch" is the Scout pinned with `"patrol east perimeter"`. "Hold-the-Line" is the Striker pinned with `"never advance past row 4"`. Identity emerges from constraint.

3. **The cost is viscerally legible.** The gold segment sitting at the left of the buffer bar, shrinking the working buffer, is a permanent visual reminder of the price. Every eviction flash on a pinned unit carries the subtext: "this might not have happened if you hadn't pinned that directive." The cost never hides. It sits there, gold and locked, for the entire battle.

4. **Enables the adversarial context window scenario.** Rina's journey shows that pinned directives create a defensive layer against signal injection attacks — but also that volume-based context denial remains a threat. This opens an entire adversarial design space where enemies specifically target buffer capacity, and pinned directives are both armor and liability.

5. **Scales cleanly across unit types.** The pin cap per unit (1 for Scout, 5 for Command) creates a natural hierarchy of behavioral specification. Scouts are simple agents with minimal identity. Commands are complex agents with rich doctrinal frameworks. The pin budget maps to the unit's role in the information architecture.

## Weaknesses

1. **Beginner trap: over-pinning.** New players who discover pinning may pin everything — "I'll give every unit 3 standing orders!" — and then wonder why their army is constantly overloaded. The max-pin caps mitigate this, but a Scout with 1 pin and 5 working slots is already noticeably worse than an unpinned Scout in high-density environments. The tutorial must clearly communicate the cost before players can pin freely.

2. **Directive authoring is a text-input mechanic in a visual game.** Writing 60-character directives breaks the flow of drag-and-configure gameplay. Players who struggle with precise language (younger players, non-English speakers) may find directive authoring frustrating. The autocomplete system helps, but text input is inherently higher friction than clicking and dragging.

3. **Pin-or-rule redundancy.** Anything a pinned directive does can theoretically be achieved through clever rule design. A directive saying `"never engage groups"` could be replaced by a rule `IF enemies_visible > 2 → hold position`. The pin is more robust (it survives buffer churn) but not mechanically unique. Advanced players may discover that unpinning directives and encoding the same logic in rules gives them better buffer capacity with equivalent behavior.

4. **Mid-battle unpinning (Reformat) is niche.** The Reformat skill — unpinning mid-battle — is available only to Specialist and Command units and costs an action tick. In practice, few players will use it because unpinning during combat means your unit loses a core belief at the worst possible time. The mechanic exists for completeness but may be dead weight.

## Interaction Effects

**With eviction policies (2.06, 2.07 — player-configured eviction):**
Pinned entries interact with eviction policies by removing slots from the evictable pool. A FIFO buffer with 8 slots and 2 pins evicts from the oldest of the 6 working slots. A priority-weighted buffer with pins evicts the lowest-weight entry from the working slots only — pinned entries are never candidates. This means pins are strictly better in priority-eviction systems (high-priority data that you'd want to keep anyway can be pinned instead, freeing priority-weight budget for working entries). In FIFO systems, pins are a blunter instrument because FIFO already preserves newest data regardless.

**With buffer pressure and context overload (1-tick stun):**
Context overload triggers when incoming data exceeds buffer capacity in a single tick. Pinned entries reduce effective capacity, making overload more likely. A Scout with 6 slots overloads at 7+ incoming data per tick. A Scout with 1 pin overloads at 6+ incoming data per tick. That one-slot difference can mean the difference between smooth operation and a stunned unit. In high-density missions, every pin lowers the overload threshold.

**With hooks and channel subscriptions:**
Pins and channel subscriptions are two levers controlling the same resource (buffer capacity). Reducing channel subscriptions lowers incoming message volume; pinning raises the minimum occupied slots. A unit that both pins directives AND listens on many channels is double-pressured. The optimal configuration balances pin count against channel count against expected observation density — a three-variable optimization problem that rewards careful planning.

**With the compress skill (Relay units):**
A Relay with pinned directives has fewer working slots for incoming data that needs compression. The compress skill reads from the working buffer, processes N entries into 1, and outputs the compressed entry. Fewer working slots means shorter compression windows — the Relay must compress faster or data evicts before compression. This creates pressure against pinning Relays at all, which explains why production-optimized architectures tend to leave Relays unpinned (pure throughput nodes) while pinning Scouts and Strikers (behavioral nodes).

**With the teaching arc:**
Pinning should be introduced AFTER the player has experienced buffer overload and eviction. The player must first understand why buffer space is precious before being offered a mechanic that permanently consumes it. Introducing pins too early risks the player treating them as free anchors without understanding the cost. The ideal introduction point: the mission immediately after the player's first cascade failure caused by buffer overload. The player arrives at pinning already knowing what it costs.

**With combo systems and multi-unit architectures:**
Pinned directives enable **doctrinal armies** — armies where every unit has a pre-assigned role encoded in permanent memory. Without pins, unit roles emerge from rules and channel subscriptions (implicit roles). With pins, roles are explicit and visible. This makes architectures more readable (the channel map can display pinned directives as annotations) but less adaptable (pinned roles can't change mid-battle without Reformat).

## Comparable Games and Systems

**Slay the Spire — Curses occupying deck space:**
Curses are cards added to your deck that do nothing useful when drawn — they take up a draw slot and waste your turn. Pinned directives are the deliberate, positive version of curses. The player chooses to add a "curse" (capacity-reducing entry) because the curse itself has value (consistent behavior). Slay the Spire's curses are forced on you by enemies; Robot Uprising's pins are chosen by the player. The capacity cost is identical; the agency is inverted.

**Magic: The Gathering — Lands vs. Spells:**
In MTG, lands produce mana but take up space in your hand and draws. A hand with 5 lands and 2 spells has plenty of mana but limited options. A hand with 1 land and 6 spells has options but can't cast them. Pinned directives are lands — infrastructure that enables everything else but consumes the same resource (hand size / buffer slots) as the actions you want to take. The deckbuilding tension of "how many lands?" maps directly to "how many pins?"

**Darkest Dungeon — Locked quirks:**
Heroes in Darkest Dungeon can lock positive quirks in the sanitarium, making them permanent. Locked quirks take up quirk slots that could be filled by new (potentially better) quirks gained through exploration. The parallel is precise: locking a quirk guarantees consistency (the hero always has "Eagle Eye") but prevents adaptation (the slot can't hold a quirk better suited to the current dungeon).

**Equipped items in inventory-limited games (Resident Evil, Diablo):**
Equipping a weapon in Resident Evil 4's attache case permanently occupies grid squares that could hold ammo or health. The equipped item provides capability (you can fight) but costs capacity (you carry less). Pinned directives provide behavioral capability (consistent identity) at capacity cost (fewer working slots). The inventory management gut-feel — "do I really need this equipped right now?" — is the same gut-feel as "do I really need this pinned?"

**Real-world LLM system prompts:**
The most direct parallel. Anthropic's Claude, OpenAI's GPT, Google's Gemini — all consume context window tokens for system prompts. Operators optimize system prompt length obsessively. A production system prompt for a customer service bot might be 800 tokens. A research assistant might need 3,000 tokens. The operator's question — "is this instruction worth the context it consumes?" — is exactly the player's question when deciding whether to pin a directive. The game teaches this tradeoff at human-legible scale (6-14 slots instead of 128K tokens).

**Pinned tabs in browsers:**
Chrome's pinned tabs are always present, consuming tab bar space, immune to "close all tabs." Power users pin Gmail, Slack, Calendar — infrastructure tabs that must always be accessible. The cost: less tab bar space for working tabs. The parallel to buffer pins is exact in structure, though lower in stakes.

## Sensory Description

**The pinned slot** is unmistakable. Where working buffer segments are green (observation), blue (message), or yellow (processed), the pinned segment is **gold** — a warm, muted amber (#d4a84b) that sits at the far left of the buffer bar like an anchor bolt. The gold does not pulse, does not dim with age, does not shift. It is static. A tiny lock icon — 4 pixels wide, 5 pixels tall, white — sits at the top-left corner of the gold segment, almost too small to see at normal zoom but crisply defined in the Inspector's enlarged view.

The **divider line** between pinned and working buffer is a 1-pixel vertical white stroke, full height of the buffer bar. It creates a visible partition: left of the divider is doctrine, right of the divider is reality. On a Scout with 1 pin, the divider sits after the first segment, leaving 5 segments of shifting color to its right. On a Command with 5 pins, the divider sits nearly at center — five gold segments on the left, nine working segments on the right. The visual weight of the gold section communicates how much capacity has been sacrificed for consistency.

**The moment of overload on a pinned unit** has a specific visual signature that experienced players learn to dread. The gold segment stays perfectly still while the working buffer to its right strobes with eviction flashes. The contrast is striking: serene gold, then a thin white line, then chaos. The pin's stability next to the working buffer's panic creates a visual irony — the most permanent thing in the buffer is contributing to the instability of everything else by taking up space.

**Unpinning via Reformat** is the most dramatic single-slot animation in the game. The gold segment's lock icon cracks (1 frame), shatters into 3-4 white pixel fragments that drift downward (2 frames), and the gold drains from the segment like liquid pouring out of a glass (3 frames, top to bottom). The segment turns dark gray — empty. The divider line slides left with a subtle click sound, like a deadbolt retracting. The working buffer gains a slot. For one frame, the new slot flashes white before settling to dark gray. The unit has forgotten something it was told to always remember.

**The sound of a pinned slot** is silence. Pinned entries make no audio signature during Sealed Watch — no click, no hum, no pulse. They are the quiet bedrock beneath the clicking of eviction and the pulsing of arriving signals. Their silence is their sound. When a unit with 3 pins is red-lining, you hear the rapid tick-tick-tick of eviction from the working buffer, but the pins contribute nothing to the soundscape. They are doctrine. Doctrine doesn't make noise. It makes everything else louder by reducing the space available for noise to dissipate.

## Discovered Aspects

- **2.09a — Directive language as emergent programming:** The 60-character directive system and its interaction with rule evaluation. Can players discover that specific keyword combinations create emergent behaviors? Is the directive parser Turing-complete enough to be exploitable?
- **2.09b — Pin economy across army composition:** The total pin budget of an army (sum of all units' max pins) as a strategic resource. Is there an optimal pin density? Do certain mission types reward high-pin or low-pin armies?
- **2.09c — Adversarial context denial via pin exploitation:** Enemies that specifically target pinned units' reduced working buffers. Flooding a known-pinned Scout with noise to exploit its lower overload threshold. Counterplay: decoy pins, unpinning as tactical feint.
- **2.09d — Imprint skill — mid-battle pinning:** A late-game skill that allows pinning a currently-held buffer entry during battle. Costs 2 action ticks and permanently reduces working buffer. The "I learned something in combat that I must never forget" moment. Extreme cost, extreme situational value.
- **2.09e — Pin inheritance during spawn:** When a unit with the Spawn skill creates a child, do the parent's pinned directives transfer? If yes, doctrine propagates automatically. If no, each spawned unit starts with a blank identity. The parallel to fine-tuning vs. prompting in LLM deployment.

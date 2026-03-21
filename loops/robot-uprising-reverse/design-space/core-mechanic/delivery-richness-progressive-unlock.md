# 2.02b — Delivery Richness as Progressive Unlock

**Aspect:** 2.02b — Delivery richness as progressive unlock: stripped/tagged/structured trichotomy per-channel; when does this unlock; boot log framing; interaction with hook taxonomy (3.08)
**Wave:** 2 (Core Mechanic Variations)
**Category:** core-mechanic

---

## The Mechanic: "The Bandwidth Tradeoff"

Every hook in Robot Uprising transmits signals on a named channel. Currently, signals are uniform — a hook fires, data lands in the receiver's buffer, one slot consumed. Delivery richness replaces this uniformity with a three-tier system where the player configures, per channel per receiving unit, how much detail each incoming signal carries. The fundamental question shifts from "should this unit listen?" to "how much should this unit hear?"

### The Three Tiers

**Stripped (1 buffer slot) — "The Ping"**
Bare minimum. The signal says: *something happened on this channel.* A stripped signal on `threat-net` tells the receiving unit "an enemy was detected" — no coordinates, no type, no context. It is a binary flag: the channel fired. The receiver knows *that* a threat exists but nothing about *what* or *where*. Stripped signals are cheap. A Scout with a 12-capacity buffer can hold twelve stripped signals simultaneously — twelve separate "something happened" flags from twelve channels, giving broad but shallow awareness.

In the workbench UI, a stripped signal appears as a thin hairline pip in the buffer bar, colored by channel. During sealed watch, stripped signals arrive as a brief glow on the channel wire — a single photon traveling the connection line, arriving as a dot that slides into the buffer's leftmost open position. In the Inspector, expanding a stripped signal shows a single line: `[T14] threat-net: SIGNAL (stripped)`. No payload. No fields. A whisper.

**Tagged (2 buffer slots) — "The Memo"**
The signal carries metadata: source unit, content type, one or two key-value fields from the original observation. A tagged signal on `threat-net` says: "enemy detected, type: striker, distance: 3, direction: NE." The receiver can write rules that branch on these fields — `IF threat-net contains tagged signal WHERE type = 'striker' AND distance < 4 THEN engage`. Tagged signals are the workhorse tier. They provide enough information for most tactical decisions without drowning the buffer.

In the workbench UI, tagged signals appear as medium-width blocks in the buffer bar, with a tiny tag icon (a luggage tag silhouette) in the corner. During sealed watch, tagged signals travel the channel wire as a slightly larger pulse with a visible internal structure — two concentric rings rather than one dot. In the Inspector, expanding a tagged signal shows three lines: source, type, and the key-value pairs. Enough to understand at a glance. A memo on a desk.

**Structured (3-4 buffer slots) — "The Dossier"**
Full data package. Every field the originating unit could transmit: entity identity, position, movement vector, threat assessment, historical context, cross-references to prior observations. A structured signal on `threat-net` says: "enemy detected, type: striker, distance: 3, direction: NE, movement pattern: patrol, threat level: high, speed: 1 tile/tick, last seen by SCOUT-B at T11, previously engaged by STRIKER-A at T8 (survived), carrying hack skill." The receiver has complete intelligence. Rules can test any combination of fields. But the signal devours buffer space — three or four capacity units for a single transmission.

In the workbench UI, structured signals appear as wide, dense blocks in the buffer bar, with visible internal segmentation — thin horizontal lines within the block suggesting layered data. The block's color is rich and saturated compared to the washed-out tones of stripped and tagged signals. During sealed watch, structured signals travel the channel wire as a thick pulse with visible data-particle texture inside, like a fiber optic cable carrying a dense packet. The pulse moves slightly slower than stripped signals — visual weight implying data weight. In the Inspector, expanding a structured signal opens a full panel: eight to twelve lines of typed fields, cross-reference links to other signals (clickable), and a confidence annotation. A complete intelligence dossier.

### The Per-Channel Configuration

Delivery richness is set **per channel, per receiving unit**. A Striker listening on `threat-net` might request structured delivery (it needs full targeting data to engage effectively). The same Striker listening on `logistics-net` might request stripped delivery (it only needs to know supplies are available, not the full manifest). A Relay listening on `raw-recon` might request tagged delivery for its compress skill input — enough structure to compress meaningfully, not so much that the Relay's own buffer overloads before compression fires.

This creates a configuration matrix: for each unit, for each channel it subscribes to, the player selects stripped/tagged/structured. The decision is local (per channel) but the consequences are global (total buffer pressure across all channels determines overload risk).

### The Core Tradeoff: "The Fat Pipe Problem"

Richer signals fill buffers faster. A Scout configured to receive structured signals on three channels might fill its 12-capacity buffer in three ticks — four structured signals (4 slots each = 16, already overflowing). The same Scout receiving stripped signals on the same three channels could absorb twelve signals before any eviction. The player choosing structured delivery is betting that *quality of information* outweighs *quantity of history*. The player choosing stripped delivery is betting that *knowing many things shallowly* beats *knowing few things deeply*.

This is the bandwidth tradeoff made visceral. In networking, you choose packet size relative to pipe capacity. In LLM systems, you choose prompt verbosity relative to context window. In Robot Uprising, you choose signal richness relative to buffer capacity. The constraint is identical; the domain makes it tangible.

### When This Unlocks: Mission 4 — "The Noisy Channel"

Delivery richness unlocks at Mission 4, the mission that teaches channel management and signal filtering. The player has already learned:
- Mission 1: Context config (what the buffer is, how data enters)
- Mission 2: Rules (condition-action pairs, rule priority)
- Mission 3: Hooks and relays (channel wiring, signal routing, compression)

By Mission 4, the player understands that hooks transmit data on channels and that buffers can overload. They have experienced buffer overload at least once (Mission 3's deliberate "blind spots" scenario). They understand that not all data is equally useful. They are ready for the question: "How much detail do you actually need?"

### Boot Log Framing: "The Fidelity Calibration"

The unlock ceremony occurs at Mission 4's boot sequence. The terminal renders:

```
[    ] SIGNAL_FIDELITY_MODULE
[INIT] Calibrating channel receivers...
[    ] Default mode: FULL CAPTURE (all signals at maximum fidelity)
[WARN] Buffer pressure analysis: current config exceeds 90% projected utilization
[    ] RECOMMENDATION: Enable per-channel fidelity control
[>>>>] FIDELITY_CONTROL: ONLINE
[    ] Three reception modes available per channel:
[    ]   STRIPPED  — signal presence only      [1 capacity unit]
[    ]   TAGGED    — signal with key metadata  [2 capacity units]
[    ]   STRUCTURED — full signal payload      [3-4 capacity units]
[OK  ] Operator can now configure reception fidelity per channel per unit.
[    ] "Not every ear needs to hear every word."
```

The boot log frames delivery richness as the system *recommending* the player take control of something that was previously automatic. Before Mission 4, all signals arrived at maximum fidelity (structured) — the game silently absorbed the cost by giving tutorial units generous buffers. Now the training wheels come off: buffers are realistic, signals arrive at whatever richness you request, and the buffer pressure is yours to manage.

The closing aphorism — "Not every ear needs to hear every word" — encapsulates the design philosophy. It is the lesson the player will spend the rest of the campaign learning to apply.

---

## Player Journeys

#### Journey: Priya, 26, Data Engineer

**Context:** Mission 4, first encounter with delivery richness. Priya has completed Missions 1-3 over two sessions. She understands hooks and channels but hasn't experienced severe buffer pressure — her Mission 3 relay solved most overload issues. She's comfortable but not yet strategic about information flow.

**Minute 0:00 — The Boot Log**
The Mission 4 terminal loads. Priya reads the boot sequence, her eyes catching the `[WARN]` line about projected utilization exceeding 90%. She's seen warnings before — the game uses them sparingly. The fidelity module comes online. Three modes: stripped, tagged, structured. She reads the capacity costs. "So structured is three or four slots? My scout has twelve capacity. Four structured signals and I'm full." She files it mentally but doesn't feel urgency yet.

**Minute 0:30 — The Plan Screen**
Priya opens her Scout blueprint. She adds a hook listening on `perimeter-watch`. A new dropdown appears where there used to be nothing: **Reception Fidelity** with three icons — a single dot (stripped), a dot with a tag (tagged), and a dense block (structured). She hovers over each. Tooltips explain. She leaves it on structured — she wants all the data. She adds a second hook on `relay-intel`, also structured.

The capacity bar preview at the top of the blueprint shifts. Ghost blocks appear — projected buffer utilization based on typical mission traffic. The bar fills to an estimated 95%. A thin amber line pulses at the 100% mark. Priya notices but doesn't change anything. "It'll be fine. My relay will compress."

**Minute 1:00 — The Sealed Watch**
Execute. Priya's two scouts fan out across a foggy terrain. The first three ticks are calm — green observation slivers slide into buffers, thin and manageable. At tick 4, SCOUT-A enters a contested zone. Three perimeter signals arrive simultaneously from nearby hooks — all structured. Three fat blue blocks slam into the buffer bar. The bar jumps from 40% to 95% in a single tick. Priya's hands tighten on the mouse. "That's a lot of data."

Tick 5. Another structured signal arrives. The bar hits 100%. The leftmost block — a green observation from tick 2 — crushes inward with a white sparkle burst. Evicted. Then a second. SCOUT-A's own perception data is being displaced by incoming structured hook messages. The scout is going blind to its own surroundings because it's drowning in detailed reports from the network.

Tick 8. The disaster. SCOUT-A's buffer is cycling every two ticks — structured signals arrive, old data evicts, new signals arrive, more eviction. The rule engine evaluates: `IF buffer contains threat → signal on threat-net`. It matches — there's a structured threat signal in the buffer. SCOUT-A fires on `threat-net`. But the signal it sends is based on data from tick 5. The threat has moved. STRIKER-A receives the signal and charges to an empty tile. Wasted action. Stale intelligence from a buffer that couldn't hold current data because it was stuffed with detailed old reports.

**Minute 2:30 — The Debrief**
Mission failed. The debrief shows SCOUT-A's buffer timeline: a chaotic churn of fat structured blocks pushing out thin observation slivers. The caption reads: "SCOUT-A's buffer spent 60% of ticks at >95% capacity. Consider reducing reception fidelity on non-critical channels."

Priya opens the Inspector. She scrubs to tick 8 and sees the stale signal that misdirected STRIKER-A. She clicks the structured signal in SCOUT-A's buffer — twelve lines of detailed threat data. She thinks: "I didn't need all of this. The striker just needed to know *where* the enemy was. Type, movement pattern, historical context — the striker doesn't use any of that in its rules."

**Minute 3:30 — The Reconfiguration**
Back to Plan. Priya opens SCOUT-A's channel config. `perimeter-watch`: she switches from structured to tagged. The capacity bar preview drops from 95% to 65%. She stares at the difference. Twenty seconds of silence. Then she switches `relay-intel` to stripped. The bar drops to 40%. The scout will know *that* the relay sent something but not *what*. For a unit whose job is to detect and report, that's fine — the scout doesn't need to understand relay analysis, it just needs to know the relay is active.

She hits Execute again. This time, SCOUT-A's buffer breathes. Tagged signals from `perimeter-watch` arrive as medium blocks — visible but manageable. The buffer stabilizes at 60% through the contested zone. Observations persist for three ticks instead of one. The rule engine fires on fresh data. STRIKER-A receives timely coordinates. Mission passed.

Priya leans back. "It's not about having all the data. It's about having the right amount."

#### Journey: Marcus, 34, Network Administrator

**Context:** Mission 7. Marcus has been playing for a week and has internalized buffer management. He's now optimizing his factory-produced units for a Command-agent mission. He understands delivery richness well but has been using tagged as his default everywhere — the safe middle ground. He hasn't explored the extremes.

**Minute 0:00 — The Stripped Disaster**
Marcus is debugging a failed Mission 7 attempt. His STRIKER-B kept engaging the wrong targets — attacking wounded enemies instead of the dangerous ones approaching from the east. In the Inspector, he traces the problem: STRIKER-B receives threat data on `target-net` at stripped fidelity. The stripped signal says "enemy detected." Nothing more. STRIKER-B's rule says `IF target-net contains signal THEN engage nearest enemy`. The rule matches on the stripped signal but the striker can't distinguish threat levels because stripped signals carry no metadata. It engages whatever is closest, which happens to be a limping, low-priority target.

**Minute 1:00 — The Targeted Upgrade**
Marcus opens STRIKER-B's blueprint. He changes `target-net` reception from stripped to tagged. Now the signal will carry `type` and `threat_level` fields. He rewrites the rule: `IF target-net contains signal WHERE threat_level = 'high' THEN engage source_position`. The rule can now discriminate. He leaves `logistics-net` at stripped — the striker doesn't need supply details, just the ping that supplies exist.

He also upgrades COMMAND-A's reception on `recon-summary` from tagged to structured. The Command unit has 28 capacity — it can afford fat signals. Its rules need cross-referenced intelligence to make reassignment decisions. Structured delivery on the command channel, stripped on the heartbeat channel, tagged on everything else. Each channel gets exactly the fidelity the receiving unit's rules require.

**Minute 2:30 — The Sealed Watch**
Execute. The difference is immediate. STRIKER-B receives a tagged threat signal: `type: striker, threat_level: high, direction: E`. Its rule matches on `threat_level = 'high'` and it pivots east, ignoring the wounded enemy to the south. Meanwhile COMMAND-A's buffer fills with rich structured reports — but at 28 capacity, it can hold seven structured signals simultaneously, enough for a full tactical picture.

Marcus watches the buffer bars during the watch. STRIKER-B's bar hovers at 50% — tagged signals on one channel, stripped on two others. COMMAND-A's bar is at 75% — heavy but sustainable. The visual contrast is striking: the striker's bar is a pattern of thin and medium blocks, mostly air. The command's bar is dense with fat structured blocks packed tight, a shelf loaded with thick reference books.

**Minute 4:00 — The Optimization Insight**
Mission passed. Marcus opens the post-battle stats. Buffer utilization chart shows each unit's capacity over time. He notices SCOUT-C's utilization never exceeded 30% — it was receiving stripped on all channels. "I'm wasting capacity there," he mutters. He could upgrade one of SCOUT-C's channels to tagged, giving it better data for its own decision-making without risking overload. Or he could shrink SCOUT-C's buffer in the blueprint to free resources for another unit.

This is the veteran's optimization loop: match fidelity to function, match buffer size to fidelity budget, waste nothing. Every unit's channel-fidelity matrix is a miniature resource allocation puzzle that interacts with the unit's role, its rules, and the mission's information environment.

#### Journey: Tomoko, 41, High School Teacher

**Context:** Mission 4, first session. Tomoko plays board games on weekends but has never touched a strategy video game. She completed Missions 1-3 over three sessions with her teenage son coaching her. She understands that units have "memory" (buffers) and that hooks let them "talk" to each other. She does not think in terms of bandwidth or payload sizes.

**Minute 0:00 — The Boot Log**
The terminal loads. Tomoko reads the boot sequence slowly. `FIDELITY_CONTROL: ONLINE`. Three reception modes. She reads: "stripped — signal presence only." She says aloud: "So it just tells you something happened?" Her son, watching, nods. "Tagged — signal with key metadata." She asks: "What's metadata?" Her son says: "Like... the subject line of an email versus the whole email." She nods. "Structured — full signal payload." She looks at the capacity costs. "So the email is three times bigger than the subject line."

**Minute 0:45 — The Bookshelf Metaphor**
Tomoko opens the Plan screen. She sees the new dropdown on her scout's hook. She remembers the buffer as a "bookshelf" — the tutorial metaphor from Mission 1. She thinks of it in those terms: stripped signals are sticky notes. Tagged signals are index cards. Structured signals are thick folders. Her scout's bookshelf holds twelve sticky notes, or six index cards, or four folders. Or some mix.

She selects tagged for both channels. The capacity preview shows a comfortable 55%. She doesn't want to risk overload — she remembers the panic of Mission 3 when her buffers went red. "Index cards," she says. "Enough to know what's going on, not so much that the shelf collapses."

**Minute 1:30 — The Sealed Watch**
Execute. Tomoko watches the buffer bars. Medium blue blocks arrive at a comfortable pace. Her scout's bar fills and empties in a steady rhythm — data arrives, old data slides off the left edge, new data enters from the right. No red. No crushing evictions. The scout functions competently with tagged data — its rules match on the metadata fields and make reasonable decisions.

**Minute 3:00 — The Curiosity Moment**
Mission passed on the first attempt. Tomoko is satisfied but curious. She opens the Inspector and clicks a tagged signal in her scout's buffer. Three lines of data: source, type, distance. She wonders what a structured signal would look like. She goes back to Plan, switches one channel to structured, and re-runs the mission as a test. The buffer bar gets tighter. She sees the fat structured blocks and the eviction cascade when two arrive simultaneously. She switches back to tagged.

"I don't need the whole folder," she says. "The index card has everything I need."

She has learned the lesson without any technical vocabulary. The bookshelf metaphor carried her through the entire mechanic. She will never say "bandwidth tradeoff" but she will consistently make correct fidelity decisions because she understands sticky notes versus index cards versus folders on a shelf.

---

## Strengths

**"The Goldilocks Lever"** — Delivery richness gives every player a personal calibration point. Unlike binary listen/ignore, the three-tier system lets players dial in exactly the information density they need per channel. This creates more player expression in the configuration phase and more diagnostic depth when things go wrong.

**Natural vocabulary transfer** — The stripped/tagged/structured trichotomy maps directly to real engineering decisions: log verbosity (DEBUG/INFO/ERROR), API response fields (summary/standard/detailed), database query projections (SELECT id vs. SELECT *). Players who internalize delivery richness have a transferable mental model for payload design.

**Visual legibility during sealed watch** — The three tiers produce visually distinct buffer patterns. A unit receiving all stripped signals has a bar of thin hairlines — sparse, airy, fast-moving. A unit receiving all structured has dense, heavy blocks — packed, slow-churning, visually weighty. The buffer bar becomes a legibility tool: at a glance during sealed watch, you can read a unit's information diet from the texture of its buffer.

**Multiplies the decision space without multiplying the rule count** — The player doesn't learn new rules for delivery richness. They learn a new configuration axis that interacts with existing rules. A rule like `IF threat-net contains signal WHERE type = 'striker'` already exists — delivery richness determines whether that `type` field is available to test. The mechanic deepens existing systems rather than adding parallel ones.

**Creates emergent specialization** — Units naturally differentiate by fidelity profile. Scouts run stripped/tagged (lightweight, broad awareness). Commands run structured (heavyweight, deep analysis). Strikers run tagged on threat channels, stripped on everything else (action-oriented, targeted). The fidelity profile *is* the unit's cognitive personality.

---

## Weaknesses

**"The Obvious Default" problem** — Tagged is almost always the right choice. It costs twice as much as stripped but provides fields that rules can actually test. Structured costs 50-100% more than tagged but the additional fields rarely matter for most rules. The risk: players discover tagged-everywhere as a dominant strategy and never engage with stripped or structured. The two extremes become traps for beginners (structured overload) and curiosities for veterans (stripped for niche builds).

**Configuration fatigue** — In a late-game army with 6 units, each listening on 3-4 channels, the player has 18-24 fidelity dropdowns to configure. Most will be set to tagged and never touched again. The configuration matrix becomes busywork rather than strategy.

**Interaction opacity** — A player who sets one channel to structured and another to tagged may not predict the combined buffer pressure. The capacity preview helps, but it shows projected utilization, not guaranteed utilization. Actual traffic varies by mission and enemy behavior. The player designs for an average and gets surprised by spikes.

**Stripped signals are too weak** — If stripped signals can't carry any testable fields, rules that depend on channel data become impossible at stripped fidelity. The player must upgrade to tagged just to write basic conditional rules, making stripped a non-choice for any unit with non-trivial behavior. Stripped only works for heartbeat/presence channels where the binary "did it fire?" is sufficient.

**Tutorial pacing pressure** — Unlocking at Mission 4 means the player has just learned hooks (Mission 3) and is immediately asked to configure a new dimension of hook behavior. If Mission 3 was hard, Mission 4's fidelity dropdown feels like one more thing to manage during an already-stressful learning curve.

---

## Interaction Effects

### Buffer Size (6 vs. 14 vs. 28 Capacity)

Small buffers (Scout: 12) make delivery richness a survival decision. A Scout receiving structured signals on two channels is perpetually on the edge of overload — four signals and it's full. Fidelity selection on small buffers is *the* primary configuration decision; it determines whether the unit functions at all.

Large buffers (Command: 28) make delivery richness a luxury decision. A Command unit can receive structured signals on four channels and still have headroom. The fidelity choice shifts from "can I afford this?" to "do my rules need this?" Large buffers decouple fidelity from buffer pressure, letting the player focus on information quality rather than capacity management.

This asymmetry is intentional: Scouts are information-constrained, Commands are information-rich. Delivery richness amplifies the cognitive identity of each unit type.

### Eviction Policies

Delivery richness transforms eviction policy selection. Under FIFO eviction, a single structured signal (3-4 slots) arriving at a full buffer evicts 3-4 of the oldest entries — a cascade that clears significant history. Under lightest-first eviction, incoming structured signals survive longer (heavy data resists lightweight eviction) but stripped signals become disposable chaff that gets cleared first regardless of recency or relevance.

**"The Weight Class Massacre"** — Under heaviest-first eviction, structured signals are evicted *first* because they free the most capacity. This creates a paradox: the most detailed intelligence is the most expendable under this policy. A player who pairs structured delivery with heaviest-first eviction is paying premium capacity cost for data that gets evicted preferentially. This is a trap the game should surface in the Inspector's eviction policy comparison view.

### The Compress Skill (Relay)

Compress becomes a **fidelity refinery**. A Relay receiving structured signals (3-4 slots each) can compress three of them into a single tagged signal (2 slots) that retains the key metadata while discarding verbose fields. The Relay's compress skill effectively performs structured-to-tagged conversion at the network level — what the receiving unit would have done by setting tagged fidelity, but applied retroactively to already-transmitted data.

This creates a legitimate architectural choice: transmit structured and compress at the relay (preserving full fidelity until the relay decides what matters), or transmit tagged from the source (saving relay processing but making an irreversible fidelity decision at transmission time). The former is more flexible but requires a relay with compress in the signal path. The latter works without a relay but commits to a fidelity level before the data is needed.

**"The Refinery Pipeline"**: Source transmits structured on `raw-intel` → Relay receives structured, compresses to tagged, retransmits on `processed-intel` → Striker receives tagged on `processed-intel`. The Relay acts as an information refinery, accepting crude high-fidelity ore and outputting refined medium-fidelity product. This mirrors real-world data pipelines (ETL: extract full data, transform to summary, load into consumer).

### The Relay Unit (Filter/Amplify Skills)

**Filter** interacts with delivery richness as selective field stripping. A Relay with the filter skill can receive a structured signal and strip specific fields before retransmission — converting structured to a custom-tagged variant that carries only the fields the downstream consumer needs. This is more granular than the three-tier system: instead of choosing between "all fields" (structured) and "key fields" (tagged), the Relay's filter creates bespoke per-consumer fidelity.

**Amplify** interacts as field enrichment. A Relay with amplify can receive a tagged signal and enrich it with additional context from its own buffer — cross-referencing the tagged threat data with position history to produce a structured signal with fields the original source didn't generate. Amplify performs tagged-to-structured *upgrade*, increasing downstream buffer pressure but improving intelligence quality.

The Relay becomes the central hub of fidelity management: filter reduces fidelity (saves buffer), amplify increases fidelity (costs buffer), compress reduces fidelity while merging multiple signals (saves buffer dramatically). The three Relay skills form a complete fidelity toolkit.

### Information Warfare: "The Structured Flood"

Enemy units can exploit delivery richness as an attack vector. An enemy Specialist with the hack skill injects a hook that transmits structured signals on a high-traffic channel. Each injected structured signal consumes 3-4 buffer slots in the compromised unit. If the player has configured structured reception on that channel, the enemy's injected signals are *maximally expensive* — each one displaces three to four legitimate entries.

**"The Payload Bomb"** — An enemy floods a channel with structured signals carrying plausible but false data. The player's units receive these fat signals, their buffers fill with enemy-generated dossiers, and legitimate intelligence gets evicted. The defense: reduce reception fidelity on compromised channels to stripped. Now the enemy's elaborate structured payloads arrive as single-slot pings — the rich deception data is discarded at reception, and only the "something happened" flag consumes buffer space. Fidelity reduction as a defensive measure: you sacrifice intelligence quality to immunize against payload-based flooding.

This creates a cat-and-mouse dynamic. The enemy invests in crafting structured deception. The player detects the flood and downgrades fidelity. The enemy switches to stripped flooding (volume-based). The player switches eviction policy to handle high-frequency low-weight signals. Each move and countermove involves the delivery richness axis.

### Weight Values (2.02a)

Delivery richness IS weight, or at least its primary determinant. The weight of a signal in the buffer is determined by its delivery richness tier: stripped = weight 1, tagged = weight 2, structured = weight 3-4. This means 2.02a (weight value design space) and 2.02b (delivery richness) are mechanically entangled — you cannot design one without designing the other.

If the weight range is ternary (1-3), delivery richness maps perfectly: one tier per weight value. If the weight range is granular (1-5), structured signals might vary between weight 3 and weight 5 depending on the channel's data complexity — a structured signal on `threat-net` (8 fields) weighs more than a structured signal on `heartbeat` (4 fields). This adds realism but makes the capacity preview less predictable.

The recommended alignment: keep the ternary mapping (stripped=1, tagged=2, structured=3) for the first five missions. Introduce variable structured weight (3-4 depending on channel) at Mission 7 when Command agents arrive and the player needs finer control over information budgets.

### Hook Taxonomy (3.08)

Delivery richness interacts with hook taxonomy through **trigger-to-payload alignment**. If a hook's trigger is `ON_PERCEIVE` (perception event), the signal it generates has a natural fidelity ceiling determined by the perception system — there's a maximum amount of data a perception event produces. Configuring structured reception on a channel that only carries perception events means the signal arrives at its natural fidelity regardless; the "structured" setting just means "give me everything the source has."

But if a hook's trigger is `ON_RULE_MATCH` (a rule fired), the signal's natural fidelity is potentially very rich — it includes the matched rule, the triggering conditions, the action taken, and the buffer state at evaluation time. Here, stripped reception does real work: it reduces a potentially 5-6 slot payload to a single "a rule fired" ping. The savings are dramatic.

This means fidelity selection matters more for some hook triggers than others. Players who understand hook taxonomy can make informed fidelity decisions: "This channel carries perception triggers — tagged is enough, structured adds nothing useful." "This channel carries rule-match triggers — structured is expensive but uniquely valuable because it tells me *why* the unit acted."

---

## Comparable Games and Systems

**TCP vs. UDP (Networking)** — The delivery richness trichotomy mirrors the TCP/UDP spectrum. Stripped signals are UDP datagrams: minimal overhead, no guaranteed structure, fire-and-forget. Structured signals are TCP streams with headers: reliable, complete, expensive in bandwidth. Tagged signals are the middle ground that most real applications use — enough structure for routing and filtering, not so much that it saturates the pipe. The "should I use TCP or UDP?" decision in network engineering maps exactly to "should I use structured or stripped?" in Robot Uprising.

**Factorio Circuit Networks** — Factorio's circuit network signals carry a single value per signal type (iron plates: 47, copper: 12). Players who need richer data multiplex across signal types — using one signal for quantity, another for priority, a third for location. This is effectively a community-invented tagged system built atop Factorio's stripped primitives. Robot Uprising makes the richness explicit rather than requiring player invention, but the underlying tension (more data = more wire complexity) is identical.

**Screeps Memory Management** — In Screeps, each creep has a limited `Memory` object. Players choose between storing minimal state (`{role: 'harvester'}` — stripped) and rich state (`{role: 'harvester', source: '5bbcae9', path: [...], lastRepair: 1200}` — structured). Over-logging consumes the global Memory cap (2MB serialized). The bandwidth tradeoff is identical: richer memory per agent means fewer agents can have memory, or global memory fills faster, or serialization cost per tick increases. Screeps veterans who've learned to minimize creep memory will immediately recognize Robot Uprising's delivery richness as the same problem with a UI.

**Real-World API Payload Design** — REST APIs universally face this tradeoff. GraphQL was invented specifically to let consumers request exactly the fields they need (tagged) rather than receiving full resource representations (structured) or existence-only HEAD requests (stripped). The `fields` query parameter in Google APIs, the `select` parameter in OData, and the `sparse fieldsets` in JSON:API all solve the same problem Robot Uprising is simulating: the consumer, not the producer, should control payload richness.

**Dwarf Fortress Announcements** — Dwarf Fortress generates hundreds of events per tick. The announcement system filters these into categories with configurable verbosity: "Pause on important combat" (structured — full detail, interrupts workflow), "Log minor combat" (tagged — recorded but not interrupting), "Ignore animal births" (stripped — the event happened but nobody needs to know). Veteran players spend significant time tuning announcement verbosity — the exact same optimization problem as delivery richness configuration in Robot Uprising.

---

## Sensory Description: What Each Tier Feels Like

### In the Workbench (Plan Screen)

The channel fidelity dropdown sits below the channel name in the hook configuration panel. Three options arranged horizontally as clickable cards, each with an icon and one-line description:

- **Stripped**: A single thin line icon, like a minimalist dash. Card background is pale, almost transparent. Selecting it makes the capacity preview bar barely change — the cost is nearly invisible. The card has a faintly industrial feel, like a serial number stamped on metal.
- **Tagged**: A line with a small tag hanging from it, like a price tag on a wire. Card background is medium-toned. Selecting it produces a visible but comfortable change in the capacity preview. The card suggests organized efficiency — a labeled cable in a server rack.
- **Structured**: A dense block icon with internal horizontal lines, like a miniature document. Card background is rich and saturated. Selecting it produces a dramatic shift in the capacity preview — the projected utilization bar jumps visibly. The card feels heavy, like selecting "download full resolution" instead of "preview."

### In the Buffer Visualization (Inspector and Sealed Watch)

During sealed watch, the buffer bar beneath each unit shows its current contents as a horizontal strip of colored blocks:

- **Stripped signals**: Thin vertical hairlines, 1-2 pixels wide at normal zoom. They cluster densely at the left edge of the bar as they age, looking like a barcode. When evicted, they disappear with a tiny flicker — barely noticeable, reflecting their low cost and low drama. The visual message: *cheap, disposable, numerous.*
- **Tagged signals**: Medium-width blocks, 4-6 pixels wide. Each shows a faint internal division (a tiny horizontal line at the midpoint) suggesting the two capacity units they consume. When evicted, they collapse with a brief white flash. The visual message: *substantial, workmanlike, the default rhythm of information flow.*
- **Structured signals**: Wide blocks, 8-12 pixels wide, with visible internal stratification — three or four horizontal lines within the block suggesting layered data. The block's color is more saturated than tagged or stripped. When evicted, the block crushes inward with a pronounced sparkle burst and a subtle screen shake if the Inspector is focused on that unit. The visual message: *heavy, important, expensive to lose.*

A buffer containing a mix of all three tiers looks like a city skyline turned sideways: thin stripped hairlines next to medium tagged blocks next to wide structured monoliths. The visual variety immediately communicates the unit's information diet.

### In the Signal Chain (Sealed Watch Animation)

When a signal travels a channel wire during sealed watch:

- **Stripped**: A single dot of light, moving fast along the wire. Almost particle-like. Blink and you miss it. The wire barely brightens — just a flash of color tracing the path. Arrival at the receiving unit's buffer produces a tiny pip sliding into place. Speed suggests lightness.
- **Tagged**: A small pulse with visible internal structure — two concentric rings or a bright core with a dimmer halo. Moves at medium speed along the wire, visibly slower than a stripped dot. The wire brightens noticeably as the pulse passes. Arrival produces a satisfying click into the buffer — the block slots into place with a subtle snap.
- **Structured**: A thick, textured pulse that visibly distorts the wire as it passes — the wire thickens momentarily around the pulse, like a snake swallowing prey. The pulse moves noticeably slower than tagged, with visible internal data particles swirling within it. The wire glows brightly. Arrival at the buffer is dramatic: the block pushes into place and adjacent blocks visibly compress to make room, the buffer bar jolting slightly wider like a shelf sagging under a heavy book.

The speed differential between tiers during sealed watch creates an intuitive understanding of information cost before the player ever reads a tooltip. Stripped signals *look* fast because they *are* cheap. Structured signals *look* heavy because they *are* expensive. The physics of the animation teaches the mechanic.

---

## Open Questions

1. **Should stripped signals carry *any* testable fields?** If stripped is truly "presence only," it becomes useless for any rule more complex than `IF channel fired THEN do thing`. Adding a single field (e.g., `source_unit`) to stripped signals makes them marginally useful for routing without undermining the fidelity hierarchy.

2. **Should the player ever be forced to use stripped?** Some mission scenarios could impose bandwidth constraints (jamming, electromagnetic interference) that reduce all signals to stripped. This would teach the value of stripped-compatible rule design as a defensive capability.

3. **Variable structured weight (3 vs. 4) — when?** Early-game structured signals should be a fixed 3 for predictability. Late-game (Mission 7+), variable structured weight (3-4 depending on channel data complexity) adds a nuance layer. The transition point matters.

4. **Can a unit request different fidelity for the same channel at different times?** Dynamic fidelity switching (structured during calm ticks, stripped during overload) would add tactical depth but massive configuration complexity. Probably too much for the campaign; possibly a Gauntlet-era advanced feature.

5. **Fidelity mismatch: what if you request structured but the source only generates tagged-level data?** The signal arrives at its natural fidelity, costing only 2 slots. The player's "structured" setting is a ceiling, not a floor. This needs to be communicated clearly to avoid confusion about "why is my structured signal only weight 2?"

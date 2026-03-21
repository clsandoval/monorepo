# 3.08b — Channel Naming Conventions as Emergent Culture

## The Option

Channels in Robot Uprising emerge from hooks — you type a name into a hook config, and the channel exists. There is no channel editor, no predefined list, no validation. This means every player invents their own channel vocabulary from scratch. Over time, across the player community, naming conventions will crystallize into a cultural artifact: shared shorthand, competitive meta, standard libraries, and an implicit theory of information architecture encoded in how people name their pipes.

This analysis explores the full design space of what happens when channel naming is freeform — the emergent conventions, the competitive intelligence leaking through names, the community sharing patterns, and how the act of naming shapes how players think about their architectures.

## The Mechanic in Detail

### How Channels Work (Locked Context)

A hook slot on a blueprint has two fields: a **trigger condition** and a **channel name**. The channel name is a free-text string. All units whose blueprints listen on that channel receive all signals sent to it. There is no type system, no hierarchy, no namespacing built into the game. The string IS the channel.

This means:
- `threat` and `Threat` could be different channels (case sensitivity is a design choice — see interaction effects)
- `scout-north-alert` and `north-threat` could carry identical semantics but be incompatible
- A typo in a channel name silently creates a dead channel — signals sent into the void
- Nothing stops a player from using `asdf` or `🔥` as a channel name

### The Naming Spectrum

At one extreme: players who use single letters (`a`, `b`, `c`) — pure abstract wiring with no semantic content. At the other extreme: players who write descriptive names (`enemy-spotted-forward-position-alert-priority-high`) — self-documenting architectures that read like English.

The sweet spot — where the community meta will likely converge — sits somewhere in between, and exploring that convergence is what makes this design space rich.

## The Emergent Convention Landscape

### Convention Family 1: "The Telegram Style" — Role-Based Channels

Players name channels after the *role* of the communication:
- `recon` — scout observations
- `threat` — enemy sighting alerts
- `move` — movement coordination
- `strike` — attack commands
- `status` — health/position updates

**Why it emerges:** This is the most natural first instinct. Players think "what is this message about?" and name accordingly. It maps to how people name Slack channels or radio frequencies.

**Where it breaks:** As architectures grow complex, role-based names collide. Two scouts both sending to `recon` creates noise. A relay that compresses scout data and forwards it — is the output still `recon` or is it `recon-compressed`? The taxonomy fragments.

### Convention Family 2: "The Pipeline Style" — Source-Destination Channels

Players name channels after the *flow* they represent:
- `scout-to-relay` — scout observations forwarded to relay
- `relay-to-striker` — compressed intel forwarded to striker
- `command-broadcast` — command agent to all

**Why it emerges:** Players who think in data flow diagrams naturally name pipes after their endpoints. It makes the architecture legible at a glance in the channel map panel.

**Where it breaks:** Inflexible. If you add a second relay, is it `scout-to-relay2`? If you want strikers to also listen to scout data directly, the name `scout-to-relay` is misleading. The architecture ossifies around the naming.

### Convention Family 3: "The Radio Frequency Style" — Abstract Numbered Channels

Players use short codes or numbers:
- `ch1`, `ch2`, `ch3`
- `alpha`, `bravo`, `charlie`
- `net-1`, `net-2`

**Why it emerges:** Players who have hit the pain of semantic naming collisions retreat to abstract identifiers. Military radio protocol influence. Clean, predictable, no ambiguity.

**Where it breaks:** Zero self-documentation. Opening a blueprint and seeing `hook: ch3` tells you nothing. The player must maintain a mental map (or external notes) of what each channel does. Debugging in the inspector becomes painful — "why did this unit receive a signal on ch3? What even IS ch3?"

### Convention Family 4: "The Prefix Convention" — Hierarchical Namespacing

The most sophisticated convention, likely to emerge in competitive play:
- `t.north` — threat, north sector
- `t.south` — threat, south sector
- `r.raw` — recon, unprocessed
- `r.compressed` — recon, relay-processed
- `cmd.prod` — command, production orders
- `cmd.reorg` — command, reorganization orders

**Why it emerges:** Players who build deep architectures need to distinguish between dozens of channels. Dot-notation or dash-prefixes create implicit hierarchies. This is the convention that competitive players will converge on because it scales.

**Where it breaks:** Requires discipline. New players won't discover this pattern without community exposure. The game itself provides no incentive to namespace — it's purely a readability optimization.

## Standard Libraries: The Community Sharing Layer

### What a "Standard Library" Looks Like

Even without an explicit sharing mechanism, players will converge on channel naming standards the way programmers converge on variable naming conventions. Forum posts, YouTube tutorials, and community guides will establish canonical channel vocabularies:

**"The Basic Three" — Beginner Standard**
Every tutorial will recommend starting with three channels:
- `alert` — any unit spots an enemy
- `move` — movement coordination
- `status` — periodic position/state updates

**"The Military Standard" — Competitive Meta**
Competitive guides will recommend a structured vocabulary:
- `t.contact` — initial enemy contact report
- `t.vector` — enemy movement direction
- `r.summary` — compressed recon digest
- `s.engage` — strike authorization
- `s.complete` — strike completion confirmation
- `c.priority` — command priority override
- `c.reorg` — command reorganization order
- `e.flood` — deliberate noise flooding (counter-intel)

**"The Factorio Standard" — Optimization Meta**
Min-maxers will develop signal-efficient naming:
- Single-character channels to minimize any potential processing overhead (even if none exists — superstition drives convention)
- Color-coded prefixes that align with the auto-generated channel map panel colors

### The Sharing Problem

Because channel names are just strings embedded in blueprint hook configs, sharing a blueprint implicitly shares its channel vocabulary. When a popular streamer publishes their "S-tier relay blueprint," every subscriber inherits their channel naming convention. This creates **de facto standards** — not through design, but through imitation.

**Design implication:** The blueprint sharing/codex system should make channel names visible and editable when importing. A "channel mapping" step during import — "This blueprint uses channel `t.north`. Map to: [your existing channels / create new]" — would be a powerful quality-of-life feature.

## Competitive Intelligence Through Naming

### The Spectator Leak

In any future spectator or replay-sharing mode, channel names leak strategic intent. If a player names their channels `flank-left`, `flank-right`, `bait`, and `ambush`, their entire strategy is readable from the channel map. This creates a fascinating meta-game tension:

- **Readable names** help the player debug and iterate — better for learning
- **Obfuscated names** hide intent from opponents — better for competition
- **Deceptive names** actively mislead — a channel named `retreat` that actually signals an all-in attack

This tension mirrors real-world military communications: clear callsigns for coordination vs. encrypted channels for security.

### The "Code Name" Meta

Advanced competitive players might develop a meta around intentionally misleading channel names in shared replays:
- Name attack channels with defensive terms
- Use random strings for critical channels
- Create decoy channels that carry no real traffic but appear in the channel map

This is emergent depth that costs nothing to implement — it falls out naturally from freeform naming.

## How Naming Shapes Architecture Thinking

The most profound effect of channel naming is cognitive. The act of choosing a name forces the player to articulate what a communication channel is FOR. This is architectural thinking made tangible.

A player who names a channel `stuff` is thinking vaguely. A player who names it `compressed-north-sector-recon` has a precise mental model of their information architecture. The name is not just a label — it is a commitment to a design intent that constrains future decisions.

This maps directly to the "vocabulary is 1:1 with real agentic AI engineering" design goal. In real systems, naming your message queues well is a mark of engineering maturity. The game teaches this implicitly.

---

## Player Journeys

### Journey 1: Mika, 16, First Strategy Game

**Context:** Mission 5 — first time using the factory and blueprints. Has completed the four tutorial missions with pre-placed units. Just unlocked hooks and channels.

**Minute 0:00 — The Blank Slate**
Mika opens the workbench for Mission 5. The blueprint editor shows her Scout blueprint with two hook slots — both empty, outlined in dashed cyan. The right panel shows the production queue (currently empty conveyor belt). In the bottom-left corner, a small "Channel Map" panel shows a gray circle with the text "No channels yet."

She clicks the first hook slot on her Scout blueprint. A hook editor pops open: two fields. The top field is a dropdown for the trigger condition — she picks "enemy_spotted" from the list. The bottom field is a text input labeled "Channel name" with a blinking cursor and placeholder text that reads "type a name..."

She stares at the blinking cursor. Types `danger`. Presses enter.

The Channel Map panel in the corner silently updates: a small cyan dot appears labeled `danger`. A thin dashed line connects from the Scout blueprint icon to the dot. She feels a small thrill — she just created something.

**Minute 0:45 — The First Connection**
She switches to her Striker blueprint. Opens a hook slot. This time the trigger condition is "on_receive" and the channel field shows a dropdown of existing channels — just `danger`. She selects it. The Channel Map now shows two lines converging on the `danger` dot: one outgoing from Scout, one incoming to Striker.

She thinks: "So the Scout sees an enemy and yells 'danger' and the Striker hears it." The metaphor clicks. She drags both blueprints into the production queue.

**Minute 1:30 — The Naming Instinct**
She wants to add a Relay. She knows from the tutorial that Relays can compress signals. She opens the Relay blueprint, sets a hook to listen on `danger`, and sets another hook to send compressed data. The channel name field blinks. She types `safe-danger` — realizes that makes no sense — backspaces — types `danger-info` — pauses — types `relay-out`.

She looks at the Channel Map. Three nodes: `danger` (Scout to Relay), `relay-out` (Relay to Striker). Her Striker's listen hook still points to `danger`. She needs to change it to `relay-out`. She clicks the Striker, changes the listen channel. The map redraws — now a clean pipeline: Scout -> `danger` -> Relay -> `relay-out` -> Striker.

She frowns. "Relay-out" doesn't really say what's in the message. But she can't think of a better name. She hits EXECUTE.

**Minute 3:00 — The Debrief Lesson**
In the inspector, she scrubs to tick 8. Her Scout spotted an enemy and fired a signal on `danger`. Tick 9: the Relay received it, compressed it, sent on `relay-out`. Tick 10: the Striker received `relay-out` and moved toward the enemy. The event log shows:

```
T08  danger    → SENT (Scout-1)
T09  danger    → RECV (Relay-1)
T09  relay-out → SENT (Relay-1)
T10  relay-out → RECV (Striker-1)
```

She reads the channel names in the log and thinks: "Next time I'll name them better. Like `raw-sighting` and `confirmed-threat`." She is already developing naming conventions without being told to.

**UI Annotations:**
- **Hook editor channel field:** Text input with autocomplete dropdown showing existing channels. Placeholder text "type a name..." in italic gray. Accepts any string on Enter.
- **Channel Map panel:** Force-directed graph of channel nodes (cyan dots) with directed edges (dashed lines) to/from blueprint icons. Updates in real-time as hooks are configured. Read-only — no direct interaction.
- **Inspector event log:** Monospace font, left-aligned timestamps (T##), channel names in cyan, action in white (SENT/RECV), source unit in parentheses.

---

### Journey 2: Dante, 28, Software Engineer and Factorio Veteran

**Context:** Mission 8 — first full factory-vs-factory battle. Has beaten missions 1-7 and developed a personal channel naming system. Builds deep architectures with Command agents.

**Minute 0:00 — The Architecture Plan**
Dante opens the plan screen. He already has a mental channel vocabulary he's refined over seven missions. He pulls out a notebook (physical, next to his keyboard) where he's written his convention:

```
Prefix system:
  t. = threat intelligence
  r. = recon data
  c. = command orders
  s. = strike coordination
  p. = production
```

He starts building. Scout blueprint, hook 1: trigger `enemy_spotted`, channel `t.raw`. Hook 2: trigger `ally_destroyed`, channel `t.loss`. The Channel Map grows as he works — dots organizing themselves into clusters by prefix. The `t.` channels cluster together because the auto-layout groups channels that share traffic patterns.

**Minute 1:30 — The Deep Pipeline**
Relay blueprint gets four hooks (max slot count). Listen on `t.raw`, compress and send on `t.digest`. Listen on `t.loss`, amplify and send on `c.alert`. His Relay is a signal processing station — raw threat intel gets compressed into digests, loss reports get escalated to the command channel.

He builds a second Relay variant — "Relay-Sector" — that listens on `t.raw` but only forwards signals from units in the north half of the board (using a filter rule). Output: `t.north`. He creates "Relay-Sector-S" with output `t.south`.

The Channel Map is now a web of cyan dots with descriptive labels. He reads it like a circuit diagram. The prefixes make the information flow immediately legible: threat data flows left-to-right, command data flows right-to-left.

**Minute 3:00 — The Naming Collision**
He wants a Command agent that adjusts production based on battlefield state. He creates a hook that sends on `p.adjust` when too many Scouts are dying. But he also wants the Command agent to send production orders when resources are high — he reaches for `p.adjust` again, then stops. Same channel name, different semantic meaning. Two different signals colliding.

He renames the first to `p.adjust.losses` and the second to `p.adjust.surplus`. The dot-hierarchy deepens. He wonders if there's a limit to how long channel names can be. (There isn't — the game accepts any string.)

He glances at the Channel Map panel. The `p.adjust.losses` and `p.adjust.surplus` labels are getting truncated with ellipses because the dot-layout algorithm can't fit them. He sighs — this is the readability ceiling of the channel map at high complexity.

**Minute 5:00 — The Competitive Insight**
Dante watches a replay from a community tournament (hypothetical future feature). The losing player's channel map shows channels named `attack-left`, `attack-right`, `retreat-signal`. Their entire strategy was readable from the channel map alone. Dante smiles — his own `t.raw`, `c.alpha` naming reveals architecture but not intent. He considers switching to fully abstract names for competitive play but decides readability during debugging is more valuable than opacity in replays.

**Minute 7:00 — The Export**
He finishes his architecture and exports his blueprint set to share on the community forum. The export includes all channel names. He writes a post: "Standard Military Channel Convention v2.3 — 12-channel architecture with sector splitting." Other players import it and adopt his `t.`/`r.`/`c.`/`s.`/`p.` prefix system. A naming standard propagates.

**UI Annotations:**
- **Channel Map at scale (12+ channels):** Dots clustered by traffic pattern. Labels truncated with `...` when node density is high. Hover to see full name in tooltip. Prefix groups get a subtle shared background tint (all `t.` channels have faint red-orange background, all `c.` channels have faint gold).
- **Hook editor with existing channels:** Autocomplete dropdown groups channels by prefix. Typing `t.` shows all threat channels. Typing a new name that doesn't match any existing channel shows "(new channel)" hint.
- **Channel name text input:** No character limit. Accepts letters, numbers, dots, dashes, underscores. Rejects spaces (auto-converts to dashes). Case-insensitive matching (design decision for QoL — `t.Raw` and `t.raw` resolve to same channel).

---

### Journey 3: Priya, 34, Game Design YouTuber and Community Builder

**Context:** Post-campaign. Priya has beaten all 10 missions and is now creating tutorial content. She's developing a "Channel Naming Guide" video for her 50K subscriber channel.

**Minute 0:00 — The Research Phase**
Priya opens the Inspector on her Mission 10 replay. She clicks the Channel Map summary and screenshots it for her video. Her map shows 16 channels organized into five prefix groups. She narrates to her microphone: "Here's what I've learned about channel naming after 10 missions..."

She opens a fresh Mission 5 save to demonstrate bad naming. She creates a Scout with hook channel `stuff`. A Relay listening on `stuff`, sending on `things`. A Striker listening on `things`. She hits EXECUTE.

The battle plays out. She opens the inspector. The event log shows:
```
T04  stuff   → SENT (Scout-1)
T05  stuff   → RECV (Relay-1)
T05  things  → SENT (Relay-1)
T06  things  → RECV (Striker-1)
```

She pauses the recording. "See how useless this is? 'Stuff' was sent. 'Things' was received. You have no idea what these signals mean. Now let me show you the same architecture with good names."

**Minute 2:00 — The Tutorial Build**
She rebuilds the same three-unit pipeline with descriptive names. Scout hook: `threat.spotted`. Relay listen: `threat.spotted`, send: `threat.confirmed`. Striker listen: `threat.confirmed`.

Same architecture, same battle outcome. But the inspector event log now reads:
```
T04  threat.spotted    → SENT (Scout-1)
T05  threat.spotted    → RECV (Relay-1)
T05  threat.confirmed  → SENT (Relay-1)
T06  threat.confirmed  → RECV (Striker-1)
```

"Now you can READ your battle. The Scout spotted a threat. The Relay confirmed it. The Striker acted on the confirmation. Your channel names are your documentation."

**Minute 4:00 — The Community Convention Proposal**
Priya pulls up a spreadsheet she's been building — a "Standard Channel Library" she wants to propose to the community:

| Channel | Purpose | Source | Listeners |
|---------|---------|--------|-----------|
| `threat.raw` | Unprocessed enemy sighting | Scout | Relay |
| `threat.confirmed` | Compressed/validated threat | Relay | Striker, Command |
| `threat.priority` | High-priority escalation | Command | All Strikers |
| `recon.sweep` | Patrol area report | Scout | Relay |
| `coord.move` | Movement coordination | Command | Scout, Striker |
| `coord.converge` | Converge on position | Command | All |
| `prod.request` | Request unit production | Command | (Factory) |
| `noise.flood` | Deliberate noise (counter-intel) | Specialist | (Enemy) |

She records herself explaining each one. "The key insight is: name channels after what the MESSAGE means, not who SENDS it. `scout-output` tells you the source but not the content. `threat.raw` tells you the content — you can figure out the source from the Channel Map."

**Minute 7:00 — The Naming Debate**
In the comments of her video (days later), a debate erupts. One faction prefers her dot-notation (`threat.confirmed`). Another prefers dashes (`threat-confirmed`). A third faction argues for single-word channels (`alert`, `intel`, `strike`) because they're faster to type. A competitive player argues that all channels should be single characters to prevent opponents from reading strategy in replays.

Priya responds with a follow-up video: "The Case for Readable Channel Names" — arguing that debugging value outweighs competitive opacity for 99% of players. The community largely adopts her convention. It becomes the de facto standard, referenced in forum guides as "the Priya standard."

**UI Annotations:**
- **Inspector event log with good names:** Channel names in cyan monospace, full string visible (no truncation in log view). Long names wrap to second line with indent. Hovering a channel name in the log highlights all events on that channel.
- **Channel Map panel — tutorial view:** For video capture, the channel map panel can be popped out into a larger overlay (click the expand icon in the panel header). Expanded view shows full channel names, connection counts, and signal volume per channel (tiny sparkline next to each dot showing messages/tick over the battle).
- **Hook editor autocomplete:** As Priya types `threat.`, all existing `threat.*` channels appear. Selecting one auto-fills. Pressing Tab accepts the top suggestion. This autocomplete is the primary mechanism by which naming conventions propagate — once you establish a prefix, the game helps you stay consistent.

---

### Journey 4: Marcus, 42, Network Engineer and Lurker

**Context:** Mission 9. Marcus has never posted online but reads every community guide. He imported Priya's channel standard and has been modifying it.

**Minute 0:00 — The Professional's Touch**
Marcus looks at the plan screen and smiles. His channel architecture looks like a network diagram from work. He's adopted a convention that mirrors real network engineering:

```
mgmt.health    — management plane, health checks
mgmt.config    — management plane, configuration pushes
data.threat    — data plane, threat intelligence
data.recon     — data plane, reconnaissance
ctrl.engage    — control plane, engagement orders
ctrl.route     — control plane, movement routing
```

His separation of management/data/control planes is instinctive — it's how he thinks about systems at work. The game has become a sandbox for network architecture concepts rendered as a game.

He opens the Channel Map panel. His channels organize into three clean clusters. The management cluster is small (2 channels, low traffic). The data cluster is busy (4 channels, high traffic). The control cluster is medium (3 channels, moderate traffic). He can see the traffic imbalance and considers adding a second Relay to the data plane.

**Minute 2:00 — The Debugging Advantage**
He runs the battle. A Striker is getting stunned from context overload — too many signals arriving simultaneously. He opens the Inspector and checks the Striker's context window at the stun tick. The entries show:

```
Slot 1: [data.threat] enemy at D4 (T=12)
Slot 2: [data.threat] enemy at E5 (T=12)
Slot 3: [data.recon] sector clear F1-H4 (T=11)
Slot 4: [ctrl.engage] priority target D4 (T=13)
Slot 5: [ctrl.route] move to C3 (T=13)
Slot 6: [data.threat] enemy at D3 (T=13)
Slot 7: [data.threat] enemy at E4 (T=13)
Slot 8: [data.recon] sector clear A1-C4 (T=12)
→ OVERLOAD: 2 additional data.threat signals evicted
```

Because his channels are well-named, the diagnosis is instant: the data plane is flooding the Striker. Four `data.threat` signals in two ticks is too many. He needs the Relay to compress harder — or the Striker needs to stop listening on `data.threat` and only receive `data.threat.priority` (a filtered, lower-volume channel).

He goes back to the plan screen. Creates a new Relay variant that listens on `data.threat`, filters for the closest enemy, and sends on `data.threat.priority`. Updates the Striker to listen on `data.threat.priority` instead of `data.threat`. The fix takes 30 seconds because the naming convention made the problem and solution immediately legible.

**Minute 4:00 — The Realization**
Marcus leans back. "This is literally my job," he murmurs. He's debugging message queue congestion, adjusting consumer group subscriptions, implementing content-based routing. The same patterns, the same solutions, the same satisfaction. The channel names are the bridge — they make the game's abstract systems feel like real infrastructure.

He renames `data.threat.priority` to `data.threat.p1` — shorter, still readable, aligns with his work convention of P1/P2/P3 priority levels. He considers adding `data.threat.p2` for lower-priority threats that Strikers can act on if idle. The naming convention is generating architectural ideas.

**UI Annotations:**
- **Context window detail in Inspector:** Each slot shows channel name in colored tag (channel color from map), message content in white, tick number in gray. Overload events shown in red with evicted entries struck through. Channel names in the context view are clickable — clicking jumps the event log to filter by that channel.
- **Channel Map with traffic volume:** Each channel dot pulses with a radius proportional to message volume. High-traffic channels (`data.threat`) pulse large and fast. Low-traffic channels (`mgmt.health`) pulse small and slow. Visual congestion maps directly to architectural congestion — if one dot is pulsing wildly, that's your bottleneck.

---

## Strengths

1. **Zero implementation cost.** Channel naming is emergent — the game just needs a text input. No channel editor, no validation, no predefined lists. The culture builds itself.

2. **Self-documenting architectures.** Good channel names make blueprints, event logs, and inspector views immediately legible. This directly supports the educational goal — players learn that naming things well is an engineering skill.

3. **Community depth.** Naming conventions create a social layer — debates, standards, guides, videos. This is content creation fuel. Every player can have an opinion on channel naming.

4. **Skill transfer.** Channel naming conventions map 1:1 to real-world message queue naming, Kafka topic naming, API endpoint naming. Players absorb software architecture principles through play.

5. **Competitive depth without complexity.** The naming meta (readable vs. obfuscated) adds strategic depth to replay sharing and spectator modes at zero development cost.

## Weaknesses

1. **The blank cursor problem.** New players staring at "type a name..." with no guidance is a moment of friction. The boot log tutorial can mitigate this by showing example names, but the first freeform naming moment will always be slightly intimidating.

2. **Typo fragility.** `threat` vs `threet` creates a silently broken architecture. No error, no warning — the signal goes to a channel nobody listens to. This is realistic (real systems have this problem) but potentially frustrating.

3. **Readability ceiling.** The Channel Map panel has finite space. At 16+ channels with long names, labels truncate and the graph becomes dense. The panel needs thoughtful layout algorithms for complex architectures.

4. **No guided progression.** The game doesn't teach naming conventions — players must discover them independently or from the community. Some players will go 10 missions with channels named `a`, `b`, `c` and never experience the debugging benefits of descriptive names.

## Interaction Effects

- **Inspector quality** scales directly with channel naming quality. Well-named channels make the inspector's event log and context window views dramatically more useful. Poorly-named channels make the inspector cryptic.
- **Blueprint sharing** implicitly shares naming conventions. The import flow should include a channel mapping step.
- **The Boot Log tutorial** for hooks (Mission 3) is the natural place to model good naming. The diegetic narrative — "Initializing communication channel: `threat.detected`" — teaches by example.
- **Channel Map panel** design must accommodate both `a` and `compressed-north-sector-recon-priority-alpha`. Elastic label sizing, tooltip on hover, expandable panel.
- **Autocomplete in hook editor** is the key UX lever. By showing existing channels when the player types, the game nudges consistency without enforcing it.

## Comparable Games & Media

- **Factorio circuit networks:** Players name signals (red/green wires carry named signals). The community developed conventions for signal naming in combinators. Factorio's constraint: signals are from a fixed enum (items), not freeform text. Robot Uprising's freeform naming is more expressive but less guardrailed.
- **Slack/Discord channel naming:** Every organization develops naming conventions (`#proj-`, `#team-`, `#help-`). The pattern of prefix-based namespacing is universal. Players will independently reinvent this.
- **Kubernetes labels and annotations:** Freeform key-value metadata that the community standardized into conventions (`app.kubernetes.io/name`, etc.). Shows how community standards emerge for freeform naming systems.
- **Ham radio callsigns and frequency conventions:** Specific frequency ranges have conventional uses. Operators learn conventions through the community, not through the technology. Direct parallel to channel naming culture.
- **Screeps:** Players name their creep roles, memory keys, and flag names. Community conventions emerged for memory structure naming, directly analogous to channel naming.

## Sensory Description

**The naming moment:** The hook editor's channel name field is a small text input with a cyan border that glows brighter as you type. The blinking cursor is a thin cyan line. As you type, each character appears in a monospace font — the field feels like a terminal prompt, not a form input. When you press Enter on a new channel name, a brief particle effect plays: tiny cyan dots scatter outward from the field and drift toward the Channel Map panel in the corner, where a new dot materializes with a soft chime — like a bubble surfacing in water. The dot glows bright for a moment, then settles to the standard cyan.

**The Channel Map at rest:** A dark panel with cyan dots floating in a force-directed layout. Dashed lines connecting dots to blueprint icons pulse gently — a slow traveling-dot animation along each line, like data packets flowing through wires. Active channels (those that carried traffic in the last battle) glow bright. Unused channels dim to a ghostly gray-cyan. The panel breathes — dots drift slightly, lines flex, the whole thing feels alive and organic despite being a network diagram.

**The autocomplete moment:** You type `t.` and a dropdown unfurls below the input — existing channels matching the prefix listed in a dark panel with cyan text. Each option has a tiny sparkline showing its traffic volume from the last battle. Selecting one plays a soft click — the name fills in, the dropdown folds away, and the Channel Map panel highlights the selected channel's dot with a brief gold flash. The connection is made. The architecture grows.

**The typo disaster:** You type `threet` instead of `threat`. No visual warning — the field accepts it with the same cyan glow and particle effect. A new dot appears in the Channel Map, floating alone with no connections from listeners. During battle, the event log shows `threet → SENT` but no corresponding `RECV`. In the inspector, the orphan channel dot slowly dims to gray while the intended `threat` channel shows zero traffic from this Scout. The silence is the signal that something is wrong — a conspicuously quiet channel in a noisy architecture.

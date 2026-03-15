# Co-Op Channel Naming Protocols and Emergent Communication Conventions

**Aspect:** 7.02a — How player-pairs develop shared vocabulary for cross-boundary signals in co-op mode; the "protocol layer" that emerges from repeated co-op sessions; comparable to software API versioning and team naming conventions.

**Category:** multiplayer/cooperative
**Wave:** 7 — Multiplayer & Community

---

## The Design Problem

In single-player Robot Uprising, channel names are private vocabulary. A player names a channel "danger" or "north-alert" or "scout-report-3" and the only person who needs to understand the name is themselves. The name is a label — it doesn't carry semantic weight beyond personal mnemonic.

In co-op, channel names become **shared language**. When Player A creates a hook that emits on channel "alert" and Player B wires a listener on "alert," the name is no longer a private label — it's a **contract**. Both players must agree on what "alert" means, what signal structure it carries, when it fires, and what a listener should expect. This is not a game design problem. This is a *protocol design* problem. The players are, literally, designing an API between their halves of the architecture.

This aspect explores six approaches to how the game scaffolds (or doesn't scaffold) this shared naming problem, the emergent conventions that arise from repeated play, and how the game can teach protocol thinking as a transferable skill.

---

## Why This Matters Per Co-Op Model

The channel naming problem manifests differently in each of the six co-op models (from 7.02):

| Model | Who creates channels? | Where naming friction occurs |
|-------|----------------------|------------------------------|
| **A: Archon** | Either player, any time | Simultaneous creation of same-named channel with different semantics. "Alert" means enemy-spotted to Player A, buffer-full to Player B. |
| **B: Specialist** | Player B (Networker) creates hooks/channels, Player A (Behaviorist) creates rules that trigger them | Player A writes a rule expecting a signal on "threat" that Player B hasn't wired yet. Player B wires "danger" instead. Semantic gap. |
| **C: War Room** | Player A (Architect) creates everything, but Player B (Analyst) diagnoses issues in channels they didn't name | Player B sees channel "x7" in the Inspector and has no idea what it's supposed to carry. Private naming conventions become diagnostic obstacles. |
| **D: Divided Front** | Each player names channels within their zone; cross-boundary channels must be agreed upon | The "border handshake" — two independent architectures that must speak a common language at the seam. |
| **E: The Relay** | One player controls production, the other controls hooks/communication | Identical to Specialist but with a production dimension — channel names must remain stable across blueprint versions. |
| **F: Rotating** | Both players create channels at different times | Temporal naming drift — the channel semantics shift as roles rotate but the name stays the same. |

The deepest problem surfaces in **Model B (Specialist)** and **Model D (Divided Front)** — the models where channels cross an ownership boundary. These are the models where naming IS gameplay.

---

## Six Approaches to the Naming Problem

### Approach 1: "The Wild West" (No Scaffolding)

**How it works:** The game does nothing. Channel names are freeform text. Players type whatever they want. No validation, no suggestions, no warnings. The channel map panel shows every channel as a plain text label with wiring lines. If two players create channels with the same name, they merge silently — all signals flow to all listeners on that name.

**Mechanical details:**
- Channel creation: type any string in a hook's channel field. Alphanumeric + hyphens + underscores, max 32 characters.
- No namespacing. No prefixes. No type annotations.
- The channel map panel shows channels as labeled nodes with colored lines (cyan for Player A's hooks, amber for Player B's).
- If Player A creates "alert" and Player B also types "alert" in a different hook, they're now on the same channel. No warning, no confirmation.

**What emerges in practice:**

After 3-5 co-op sessions, player pairs develop **naming conventions spontaneously**. These conventions are strikingly similar across different pairs — a convergence phenomenon documented in Hanabi's community (the H-Group conventions) and Factorio's train station naming culture.

Common emergent patterns:
- **Directional prefixes:** "north-alert", "south-scout", "east-threat" — spatial orientation as the first disambiguation tool.
- **Unit-type prefixes:** "scout-report", "relay-forward", "striker-target" — sender identity embedded in the name.
- **Severity suffixes:** "alert-critical", "alert-info", "alert-noise" — signal priority as a naming convention when the game's actual priority system isn't expressive enough.
- **Numbered channels:** "recon-1", "recon-2" — the moment players discover they need more than one channel for the same concept.
- **Emoji channels:** "🔴-danger", "🟢-clear", "📡-relay" — when text feels too slow, players reach for visual shorthand (if the input field supports Unicode).

The Wild West is the **Screeps approach** — the game gives you JavaScript and a persistent world and says "figure it out." Screeps' community developed elaborate alliance protocols, resource-sharing APIs, and diplomatic communication standards with zero game scaffolding. The resulting culture was rich but exclusionary — new players couldn't participate in alliance diplomacy without learning community-developed standards that existed nowhere in the game.

**Strengths:**
- Maximum creative freedom. Players who enjoy the protocol design problem get the full experience.
- The emergent conventions are genuinely educational. Players who develop naming conventions in Robot Uprising co-op are learning the same skill that API designers use professionally.
- Zero tutorial burden. Nothing to teach because there's nothing to learn.
- The conventions themselves become shareable community content — "Here's my co-op naming guide" posts on Discord/Reddit.

**Weaknesses:**
- **The silent merge problem.** The single most dangerous failure mode. Player A creates "alert" for enemy sightings. Player B creates "alert" for buffer overflow warnings. Both now receive both signal types, and neither knows why their agents are acting on irrelevant information. The failure is invisible during Plan phase and catastrophic during Sealed Watch. The Inspector shows the merge, but only retroactively.
- **The blank page problem.** Two new players stare at empty channel fields with no vocabulary. What should they name it? How long should the name be? The game provides zero guidance.
- **Excludes casual pairs.** Players who just want to jump into co-op without negotiating an API specification won't enjoy this.

**Sensory description:** Two empty text input fields, blinking cursors, on opposite sides of a luminous seam. No suggestions, no autocomplete, no placeholder text. Just the cursor. The silence of the blank page before the first word is spoken.

---

### Approach 2: "The Suggestion Engine" (Autocomplete + Conflict Detection)

**How it works:** The game provides an intelligent autocomplete system for channel names. When Player A starts typing in a hook's channel field, the dropdown shows: (a) channels Player A has already created, (b) channels Player B has created (tagged with an amber indicator), and (c) **suggested names** based on the hook's trigger type and the connected unit's role.

Additionally, when both players have a channel with the same name but different hook configurations (different trigger types, different payload structures), a **conflict warning** appears — a small amber triangle next to the channel name with a tooltip: "Both players use 'alert' — Player A: enemy detection, Player B: buffer overflow. Consider renaming one."

**Mechanical details:**
- Autocomplete dropdown appears after 1 character typed. Shows existing channels first (sorted by most recently used), then suggestions.
- Suggestions are generated from: unit type + trigger type + optional direction. e.g., for a Scout with an ON_ENEMY_DETECTED trigger: "scout-enemy", "enemy-spotted", "threat-north" (if the scout is placed in the north quadrant).
- Conflict detection runs whenever a channel has hooks from both players. Conflicts flagged when: same channel name, different trigger types. This is heuristic, not perfect — it can't detect semantic mismatches in same-trigger-type hooks.
- Conflict warnings are dismissible. Players can acknowledge "yes, we want both signal types on this channel" and the warning disappears.
- A "Channel Protocol Panel" sits below the channel map. For each channel, it shows: name, contributors (Player A / B / both), hook count, trigger types, estimated signals per tick. This is the "API documentation" view.

**What the Channel Protocol Panel looks like:** A compact table below the auto-generated channel map. Each row is a channel. The leftmost column shows the channel name in monospace font, color-coded by creator (cyan / amber / teal for shared). The next column shows small hook icons — one per connected hook, with the trigger type as a tiny label. The rightmost column shows a sparkline of estimated signal volume (based on previous runs or simulation). Conflict rows have an amber background wash and a small "⚠ Resolve" link. Hovering any row highlights all connected units on the board with a gentle pulse.

**Strengths:**
- Preserves creative freedom while preventing the worst failure modes.
- The suggestions teach naming conventions by example. After 5 missions, players internalize the pattern and stop using suggestions.
- The conflict detection catches the silent merge problem before it becomes a Sealed Watch disaster.
- The Channel Protocol Panel is the game's way of saying "channels are APIs" without ever using that word.

**Weaknesses:**
- Suggestions can anchor naming conventions artificially. If the game suggests "scout-enemy" often enough, all co-op pairs converge on the same vocabulary, eliminating the rich diversity of emergent naming.
- Conflict detection is heuristic. It can't catch: two hooks on the same channel with the same trigger type but different semantic intent (e.g., both ON_SIGNAL_RECEIVED but one is for compressed intel, the other for raw scouting data).
- The Channel Protocol Panel adds UI complexity to an already-dense Plan screen.

**Sensory description:** You type "a" into the channel field. A dropdown materializes — glass-panel effect, slight blur behind it. Three rows: "alert" (your channel, cyan dot), "attention" (Player B's channel, amber dot, with a small "📡 RELAY-B" tag showing the connected unit), and dimmer below a thin rule line, "alert-enemy" and "alert-buffer" in a lighter grey italic — the suggestions, generated from your scout's trigger type. You hover "alert" — on the channel map above, a cyan line brightens and pulses, connecting your Scout to the Relay on "alert." You notice an amber line also connects to "alert" — Player B wired something there too. A tiny amber triangle appears next to the name in the dropdown. You hover it: "⚠ Player B also uses 'alert' — trigger: ON_BUFFER_FULL (yours: ON_ENEMY_DETECTED). Consider distinct names."

---

### Approach 3: "The Contract" (Typed Channels with Schema)

**How it works:** Channels are not just named strings — they're **typed contracts**. When creating a channel, the player specifies: (a) a name, (b) a signal type (enemy_position, buffer_status, movement_order, general), and (c) optionally, a description. Hooks can only emit on channels whose type matches their trigger category. Listeners can filter by signal type.

This is **the API schema approach**. Channels become interface definitions, not just pipes.

**Mechanical details:**
- Channel creation opens a small modal: Name (text field), Type (dropdown: `threat`, `status`, `command`, `intel`, `custom`), Description (optional text area, max 120 chars).
- Hooks specify which channel types they can emit on. An ON_ENEMY_DETECTED hook can only emit on `threat` or `intel` channels. An ON_BUFFER_FULL hook can only emit on `status` channels. This is enforced — the channel dropdown only shows compatible channels.
- Listeners specify which signal types they accept. A rule's condition `IF signal_type == threat` only matches signals from `threat`-typed channels. No cross-type leakage.
- The Channel Protocol Panel becomes a schema viewer: each channel shows its type badge (colored: red for threat, blue for status, green for command, amber for intel, grey for custom), creator, description, and connected hooks.
- When Player A creates a `threat`-typed channel, Player B can subscribe their listeners to it knowing exactly what signal structure to expect. The type IS the contract.

**Strengths:**
- **Eliminates the silent merge problem entirely.** Two players can't accidentally merge semantically different channels because the type system prevents incompatible hooks from sharing a channel.
- **Self-documenting.** The channel type and description ARE the documentation. No need for external convention negotiation.
- **Teaches API design explicitly.** Players who use typed channels in Robot Uprising are practicing the same discipline as REST API designers who distinguish between `/alerts` and `/status` endpoints.
- **Scales to complex architectures.** When the architecture has 15+ channels, types provide the first level of organization — filter by type to find the channel you need.

**Weaknesses:**
- **Heavyweight for early game.** Two new players on Mission 5 don't need a type system. They need one channel called "help."
- **The type taxonomy is a design opinion.** Who decides that `threat`, `status`, `command`, `intel`, `custom` are the right types? Every possible taxonomy is wrong in some way. `custom` becomes a catch-all that defeats the purpose.
- **Reduces emergent creativity.** The richest co-op naming conventions emerge when players invent their own semantic categories. Imposing types pre-empts that discovery.
- **The description field won't be used.** Optional text fields in games are universally ignored. Players will see the type badge and skip the description.

**Sensory description:** A channel creation modal slides up from the bottom of the workbench panel — dark glass, sharp corners, the aesthetic of a form submission. Three fields: Name (blinking cursor in a monospace input), Type (a row of five colored chips: 🔴 Threat, 🔵 Status, 🟢 Command, 🟠 Intel, ⬜ Custom — tap to select, selected chip enlarges and glows), Description (a faint grey placeholder: "What does this channel carry?"). You tap 🔴 Threat. The modal's border tints red. The channel name field's placeholder updates to suggest: "e.g., north-threat, scout-alert, enemy-incoming". You type "flanking-report." Click Create. On the channel map, a new node appears with a red badge and the name "flanking-report" — and every hook slot on the workbench that could emit on a threat channel now shows it in their dropdown, while buffer-overflow hooks do not.

---

### Approach 4: "The Namespace" (Player-Prefixed Channels)

**How it works:** Every channel automatically gets a namespace prefix: `a/` for Player A's channels, `b/` for Player B's, and `shared/` for explicitly co-created channels. Players type the bare name — "alert" — and the game prepends the prefix. Cross-namespace subscription requires explicit opt-in: Player B must manually add `a/alert` to a listener's channel list.

**Mechanical details:**
- Player A types "alert" in a hook config → channel becomes `a/alert`.
- Player B types "alert" in their own hook → channel becomes `b/alert`. These are distinct channels. No merge.
- To create a shared channel, either player opens the Channel Protocol Panel and clicks "Create Shared Channel" → a `shared/` prefix is applied, and both players can add hooks.
- Cross-namespace subscription: Player B wants to listen on `a/alert`. They open their listener's channel field, type "a/" — the autocomplete shows all of Player A's channels. They select `a/alert`. A cross-boundary subscription line appears on the channel map — a dashed line crossing the luminous seam.
- The channel map organizes channels into three columns: Player A's namespace (left, cyan), shared namespace (center, teal), Player B's namespace (right, amber). Cross-boundary subscriptions draw connecting arcs between columns.

**Strengths:**
- **Makes ownership visible.** At a glance, the channel map shows who created what. Cross-boundary lines are immediately identifiable as "the API surface" between two players' architectures.
- **Eliminates accidental merges** while preserving the ability to deliberately share channels.
- **Teaches namespace thinking.** The `a/alert` vs `b/alert` distinction is directly transferable to software engineering (package namespaces, module scoping, container networking). Players learn that naming is scoped, not global.
- **The shared namespace is a designed social moment.** Creating a shared channel requires both players to agree — it's a mini-negotiation. "Let's make shared/threat-feed — I'll emit, you'll listen." This negotiation IS gameplay.

**Weaknesses:**
- **Visual clutter.** Prefixes make channel names longer. `shared/flanking-report-north` is 29 characters. On the channel map, labels overlap. On the workbench, hook channel fields need to be wider.
- **Three namespaces is two too many** for new players. The distinction between `a/alert` (my channel that you can subscribe to) and `shared/alert` (our channel) is subtle and confusing.
- **Forces explicit cross-boundary wiring.** In the Archon model where both players have full access, namespaces create unnecessary friction. The feature only makes sense in Specialist and Divided Front models.
- **The prefix is game-imposed vocabulary.** `a/` and `b/` are meaningless. Better: use player names or role names. `behaviorist/alert` vs `networker/alert`. But this only works in the Specialist model.

**Sensory description:** The channel map panel is divided into three columns by thin vertical rules. Left column header: "🔵 YOUR CHANNELS" in cyan. Center: "🤝 SHARED" in teal. Right: "🟠 PARTNER'S CHANNELS" in amber. Each column lists channel names in monospace. Between the columns, dashed arcs connect cross-subscribed channels — a `b/scout-report` in the right column has a dashed amber arc sweeping across to a listener indicator in the left column. The arcs glow when signals are flowing during a simulation preview. At the bottom of the center column: a "✚ Create Shared Channel" button, pulsing gently with a teal glow, inviting the first cross-boundary agreement.

---

### Approach 5: "The Protocol Codex" (Evolving Shared Dictionary)

**How it works:** The game maintains a persistent **Protocol Codex** — a living dictionary of channel definitions that persists across missions and grows as the co-op pair develops their vocabulary. Each entry has: channel name, type, description, creation date, usage history (which missions, how many signals, success correlation), and versioning (if the definition changed over time).

The Codex is a shared artifact between two players. It's the co-op pair's institutional memory.

**Mechanical details:**
- First co-op session: Codex is empty. Players create channels ad-hoc during Plan phase. After the mission (during Inspector), the game prompts: "Define your channels? [Yes / Skip]". If Yes, a Codex entry form appears for each channel used in the mission: name, one-line description, expected signal content.
- Subsequent sessions: during Plan phase, the Codex is accessible as a dropdown source for channel names. Previously-defined channels appear with their descriptions and usage history. Players can create new channels (which get Codex entries post-mission) or reuse existing ones.
- **Channel versioning:** If a player changes a channel's meaning between missions (same name, different trigger type or hook configuration), the Codex records a new version: "v1: enemy detection (M5-M7), v2: enemy + terrain (M8+)". The version history is visible in the Codex viewer.
- **Success correlation:** The Codex tracks whether missions using a given channel succeeded or failed. Over time, patterns emerge: "recon-feed" was used in 6 successful missions and 2 failures. "panic-broadcast" was used in 1 success and 4 failures. This data is presented as a subtle red/green bar behind each Codex entry.
- **Codex export:** The Protocol Codex can be exported as a shareable artifact — a compact JSON that another co-op pair can import to bootstrap their channel vocabulary. This is the community convention propagation mechanism.

**What the Protocol Codex looks like:** A slide-out panel on the left side of the Plan screen, triggered by a small book icon with a "📖 Protocol Codex" label. Inside: a scrollable list of channel entries, each rendered as a small card. The card shows the channel name in bold monospace, a one-line description in regular text, a usage sparkline (green/red dots for success/failure per mission), a version badge if multiple versions exist ("v2" in a small rounded rectangle), and contributor indicators (cyan dot = Player A defined it, amber = Player B, both = teal). At the bottom: "✚ New Channel" button and a search bar.

Expanded card view (click to expand): full description, version history timeline, connected blueprints, total signal count, average signal-per-tick, and a "Notes" text area for freeform annotations (e.g., "we stopped using this after M7 because the relay chain got too loud").

**Strengths:**
- **Builds institutional memory.** The Codex captures what individual players forget between sessions. "Why did we create 'echo-suppress' again?" → click → "v1, M7: added to prevent double-relay bounce. Used in 3 missions, all successful."
- **Makes naming conventions durable.** Single-session conventions evaporate. The Codex crystallizes them into a reference that persists across the co-op relationship.
- **The success correlation teaches meta-strategy.** Players start to notice: channels associated with failures might be poorly designed. This is retroactive analysis of their own protocol design — a higher-order skill.
- **Export creates community vocabulary standards.** When top co-op pairs export their Codex, community channel naming conventions propagate naturally. This mirrors Factorio's blueprint sharing culture — the community converges on optimal patterns through shared artifacts.
- **Directly teaches API versioning.** The version history of a channel definition IS API versioning. Players who migrate "alert" from "enemy detection" to "enemy + terrain" between M7 and M8 are performing a breaking API change. The Codex records this, making the versioning decision visible and discussable.

**Weaknesses:**
- **Post-mission friction.** Asking players to define channels after a tense Sealed Watch breaks the emotional rhythm. The debrief should be analysis, not bookkeeping.
- **Codex maintenance is work.** Descriptions become stale. Channels get renamed but old Codex entries persist. Without pruning, the Codex fills with dead entries.
- **Only valuable for repeat pairs.** If two players co-op once and never again, the Codex has no long-term value. The feature is high-investment for committed pairs, zero-value for casual matchmaking.
- **Success correlation can mislead.** A channel used in 3 failures isn't necessarily badly designed — the failures might be unrelated to that channel. Correlation ≠ causation, and the game's visual display implies a causal link.

**Sensory description:** You click the 📖 icon. A panel glides in from the left — warm parchment-colored background, darker than the workbench but lighter than the board. The card list breathes gently — each card has a paper-edge shadow that shifts slightly as you scroll, like flipping through a physical notebook. "recon-feed" shows a sparkline of seven green dots and two red — the green dots glow softly, the red ones are matte. Below: "v2 — expanded to include terrain data after M7 near-miss." The amber contributor dot tells you your partner defined this one. You hover the version badge: a tiny timeline appears — "v1 (M5-M7): enemy positions only → v2 (M8+): enemy + terrain" — each version marked with a small diamond on a horizontal line. The most recent diamond pulses.

---

### Approach 6: "The Handshake" (Explicit Channel Agreement Ritual)

**How it works:** Cross-boundary channels require a formal agreement. When Player A creates a channel in the Specialist or Divided Front model, they send a **channel proposal** to Player B. The proposal includes: name, intended signal type, expected senders, expected listeners, and a brief description. Player B can accept, counter-propose (suggest a different name or type), or reject. Only accepted proposals become active channels.

This is the **pull request model** applied to channel creation. Channels don't exist until both parties agree on the specification.

**Mechanical details:**
- Player A creates a hook and types a new channel name that doesn't exist in the shared namespace. Instead of the channel immediately appearing, a "Propose Channel" modal opens:
  - **Name:** (pre-filled from what they typed)
  - **Type:** (dropdown: threat/status/command/intel/custom)
  - **Description:** (one-line)
  - **I will:** emit / listen / both
  - **I expect you to:** emit / listen / both
- The proposal appears in Player B's workbench as a notification card at the top of their panel — amber border, gentle bounce animation.
- Player B sees the proposal and can:
  - **Accept** (✓) — channel immediately appears in both players' dropdowns.
  - **Counter-propose** (↩) — opens the same modal with Player A's values pre-filled, editable. Player A receives the counter-proposal.
  - **Reject** (✗) — with an optional one-line reason. Player A is notified.
- Accepted channels show a small "🤝" icon in the channel map, indicating bilateral agreement.
- The proposal history is recorded in the Protocol Codex (if Approach 5 is also active) — a "negotiation log" showing how the channel definition evolved through proposals and counter-proposals.

**What a proposal notification looks like:** A card slides down from the top of Player B's workbench panel — amber border, slightly translucent background showing the workbench behind it. Inside: "📡 Channel Proposal from [Player A]" header. Below: the channel spec in a compact layout — Name: "flanking-report", Type: 🔴 Threat, Description: "Scout detects enemy flanking movement, alerts strikers." Role spec: "I will: emit. I expect you to: listen." Three buttons at the bottom: ✓ Accept (green), ↩ Counter (amber), ✗ Reject (muted red). The card has a subtle tick-tick-tick animation on the border — a gentle urgency cue, though there's no actual time limit.

**Strengths:**
- **Makes the naming negotiation explicit and visible.** The conversation that happens verbally in Approaches 1-2 is now captured in the game's UI. The proposal IS the conversation.
- **Counter-proposals teach compromise.** Player A proposes "enemy-alert." Player B counter-proposes "threat-north" because they want directional specificity. Player A accepts. Both have learned something about naming — direction > description. This is API design negotiation.
- **Creates a record of design decisions.** The negotiation log answers "why is this channel named this way?" — because Player B counter-proposed from Player A's original "stuff" to "north-sector-intel."
- **Prevents premature channel creation.** In the Wild West, channels proliferate unchecked. The Handshake forces players to justify each channel — do we really need a new one, or can we reuse "threat-general"?
- **The formal proposal moment is a designed social beat.** Sending a proposal is a declaration of intent. Accepting it is a handshake. The game frames cooperative channel creation as a meaningful event, not background bookkeeping.

**Weaknesses:**
- **Heavy process for small decisions.** Creating a simple "help" channel requires a formal proposal, wait for acceptance, then proceed. For experienced pairs who've already established trust, this is bureaucratic overhead.
- **Assumes both players are online and attentive.** If Player B is deep in their hook configuration and misses the notification, Player A is blocked.
- **Counter-proposal loops.** Player A proposes → Player B counters → Player A counters the counter → deadlock. The game needs a resolution mechanism (auto-accept after 3 rounds? coin flip?).
- **Doesn't work in the Archon model.** Full shared access doesn't need proposals. The feature is model-specific.
- **The "proposal fatigue" problem.** On a complex mission with 8+ channels, the pair sends 8+ proposals. The rhythm becomes: propose → wait → accept → propose → wait → accept. Batch proposal mode would help but adds complexity.

**Sensory description:** You type "flanking-report" into the hook's channel field and press Enter. Instead of the channel appearing immediately, the input field pulses once — a ripple of amber spreading from the text — and a small modal rises: "Propose this channel to your partner?" You fill in the type (🔴 Threat) and description. Click "Send Proposal." On your side, the channel name appears in the hook field but dimmed, with a small hourglass icon: ⏳ Pending. On your partner's screen, a card descends from above — amber-bordered, gently bouncing once as it settles into place, with a soft *ding* notification sound. They read it, smile, tap ✓ Accept. On your screen: the hourglass dissolves into a handshake emoji 🤝, the channel name brightens to full opacity, and on the channel map, a new node appears with a teal glow — the color of mutual agreement.

---

## The Recommended Hybrid: "Progressive Protocol"

**The recommendation:** Layer these approaches across the campaign to teach protocol design progressively, mirroring how real software teams develop API conventions.

| Campaign Phase | Approach | What it teaches |
|---------------|----------|-----------------|
| **M5-6** (first co-op missions) | **Wild West** + **Suggestion Engine** (Approaches 1+2) | Free naming with smart autocomplete. Players discover the naming problem naturally. Conflict detection catches the worst failures. |
| **M7-8** (advanced co-op) | **Add Namespace** (Approach 4, simplified: "yours" / "shared" only, no `a/b/` prefix syntax) | Teaches ownership and cross-boundary subscription. The shared namespace introduces negotiation. |
| **M9-10** (mastery) | **Add Protocol Codex** (Approach 5) + optional **Handshake** (Approach 6 for shared channels only) | Institutional memory, versioning, export. The Handshake for shared channels only — personal channels remain Wild West. |
| **Gauntlet** | Full system active, **Codex export** as community feature | Co-op pairs export their Protocol Codex as community artifact. Top pairs' naming conventions propagate. |

**What the Typed Channels approach (3) becomes:** Not a standalone feature, but a Codex enhancement. Once a channel has been used in 3+ missions, the Codex auto-derives a type from its usage patterns and displays it. The type is descriptive, not prescriptive — it emerges from behavior rather than being declared upfront.

---

## Emergent Conventions: What Players Will Invent

Based on comparable games (Hanabi's H-Group conventions, Factorio's train station naming, Screeps' alliance protocols, software engineering API naming standards), here are the conventions that Robot Uprising co-op pairs will develop:

### The Naming Convention Tree

**Level 1: Directional naming** (first session)
```
north-alert, south-report, east-scout, west-relay
```
Players orient channels around the board's geography. Simple, intuitive, breaks when architecture reorganizes.

**Level 2: Function-first naming** (sessions 2-3)
```
enemy-detected, buffer-warning, movement-order, intel-compressed
```
Players shift from WHERE to WHAT. Channels describe their content, not their origin. More stable across missions.

**Level 3: Sender-receiver naming** (sessions 4-5)
```
scout-to-relay, relay-to-striker, command-broadcast
```
Players embed the communication topology in the name. Useful for debugging — the name tells you who's talking to whom. Mirrors software engineering's "producer-consumer" naming.

**Level 4: Protocol naming** (sessions 6+)
```
recon-net (multi-hop intelligence pipeline)
threat-bus (broadcast alert system)
whisper-line (low-EM covert channel)
heartbeat (periodic status ping)
```
Players name channels after the communication PATTERN, not the content or topology. These names carry architectural intent. "recon-net" implies a multi-hop pipeline. "threat-bus" implies broadcast. "whisper-line" implies stealth. The name IS the design document.

**Level 5: Versioned protocol naming** (advanced pairs)
```
recon-net-v2 (added terrain data)
threat-bus-fast (low-latency variant, higher EM)
heartbeat-compressed (uses less buffer per pulse)
```
Players version their channels when they iterate on a protocol without disrupting existing listeners. This is API versioning, discovered through play.

### The "Slack Channel Problem"

Named after the phenomenon in Slack workspaces where channel names proliferate until nobody knows which channel to use for what. In Robot Uprising co-op, this manifests as:

1. **Session 1:** 3 channels. Clean.
2. **Session 3:** 7 channels. Manageable.
3. **Session 5:** 14 channels. Confusing. "What's the difference between recon-feed and scout-report again?"
4. **Session 7:** Player proposes a "channel cleanup" — archiving unused channels, merging duplicates, renaming for consistency.
5. **Session 8:** 8 channels. Clean again. Players have performed their first API deprecation.

This cycle — proliferation → confusion → cleanup → clarity — is a designed learning experience that mirrors real software architecture evolution. The Protocol Codex makes this cycle visible and trackable.

### The "Dark Channel" Convention

Advanced pairs will develop covert channel naming conventions:

- **Obvious channels:** "recon-feed", "threat-alert" — visible on the channel map, clear function.
- **Dark channels:** "x", "q7", "." — deliberately obscure names for channels that carry sensitive information. In PvP-adjacent co-op (2v2 with cross-pair EM detection), channel names might be visible to opponents through EM sniffing. Obscure names become a security measure.
- **Decoy channels:** "main-attack-plan" — a channel that carries no real information but generates EM noise to draw enemy attention, named to suggest importance.

This convention emerges from the emissions model (hook transmissions emit detectable EM noise) and creates a second-order naming game: names as information warfare.

---

## Comparable Games and Systems

### Hanabi's H-Group Conventions
The closest precedent. Hanabi players developed an elaborate, documented convention system — the "H-Group" — that defines what each type of clue means based on context. A "play clue" vs. a "save clue" vs. a "finesse" — the same action (giving a number/color clue) has different meanings depending on game state. Robot Uprising's channel naming parallels this: the same channel name can carry different conventions depending on the pair's agreed protocol.

Key insight from Hanabi: **conventions propagate through play, not documentation.** New H-Group players learn conventions by playing with experienced players, not by reading the 100-page convention document. Robot Uprising's Codex export mechanism should support this — a new player joining a co-op pair imports the Codex and learns conventions through usage, with the Codex as reference rather than textbook.

### Factorio Train Station Naming
Factorio's community converged on `<Resource> Load` / `<Resource> Unload` as the near-universal train station naming convention. This emerged without game scaffolding — players independently discovered that function-first naming (what the station does) scales better than location-first naming (where it is). The rich text feature (icons in station names) enabled a visual convention layer: `[item=iron-plate] Load` is more scannable than "Iron Plates Load."

Application to Robot Uprising: if channel names support rich text (emoji, icons), visual conventions will emerge. A 🔴 prefix for threat channels, 📡 for relay channels, ⚡ for urgent channels. The game should consider supporting Unicode/emoji in channel names explicitly.

### Keep Talking and Nobody Explodes
The defuser and expert develop shorthand conventions: "big red button" → "BRB", wire colors → "RBY" (red-blue-yellow reading order), module positions → clock positions ("the one at 3 o'clock"). These conventions emerge under time pressure and are never explicitly negotiated — they crystallize through repeated play with the same partner.

Application: Robot Uprising's Plan phase doesn't have time pressure (it's unlimited), which means conventions will develop more slowly but more deliberately. The game could introduce optional Plan phase timers for advanced co-op to catalyze convention development.

### Software Engineering API Conventions
The real-world parallel is exact. REST API designers face the same questions: `/alerts` or `/warnings`? `/v1/users` or `/users?version=1`? Camel case or kebab case? Google's API Design Guidelines, Stripe's API naming conventions, and the OpenAPI specification are all responses to the same fundamental problem that Robot Uprising co-op players face: how do two parties agree on the interface between their systems?

The game has an opportunity to make this connection explicit — a Codex entry tooltip that says "your channel naming convention is similar to how software engineers design API endpoints" is one of the transferable skill moments the game is designed to create.

---

## Interaction Effects

### With Co-Op Models (7.02)
- **Archon:** Naming is a coordination problem (avoid same name, different meaning). Approaches 1-2 are sufficient.
- **Specialist:** Naming is an API design problem (behavior author must agree with network author). Approaches 2-4 are essential.
- **War Room:** Naming is a diagnostic communication problem (Analyst must understand Architect's naming). Approach 5 (Codex) is critical for the Analyst's effectiveness.
- **Divided Front:** Naming is a diplomacy problem (two independent architectures must interoperate). Approach 6 (Handshake) for cross-boundary channels is natural.

### With EM Emissions Model (locked)
Channel names are potentially visible to opponents via EM sniffing in competitive modes. This makes channel naming an information security decision — clear names leak intent, obscure names are harder to coordinate around. The tension between readability and security IS the emergent game.

### With Blueprint Codex (locked)
The Protocol Codex (Approach 5) could integrate with the Blueprint Codex as a "Channels" tab, making channel definitions co-equal with unit definitions, skill definitions, and hook definitions in the game's reference system. The codex entries should use the same card aesthetic as Blueprint Codex entries.

### With Config Necropsy (7.10)
When a co-op pair shares a necropsy, the channel naming conventions are part of the artifact. A necropsy that references "recon-net-v2" is more readable than one that references "channel-7." The Protocol Codex provides the glossary that makes necropsies interpretable by the broader community.

### With Competitive PvP (7.01)
In 2v2 co-op PvP, channel naming becomes adversarial. Teams develop secret conventions. The meta-game of reading opponent channel names from EM intercepts (if visible) creates a naming arms race — clear names for internal channels, decoy names for high-EM channels.

---

## Player Journeys

#### Journey: Yuki, 26, backend engineer, experienced co-op partner

**Context:** Mission 6, third co-op session with her partner Mateo. They've played M5 together (Wild West naming, 4 channels, one accidental merge that caused a relay chain failure). She's determined to be more systematic this time.

**Minute 0:00 — The Channel Planning Conversation**
Yuki opens the Plan screen. The board shows a jungle terrain with two enemy spawners. She looks at the channel map — empty. She turns to Mateo: "OK, last time 'alert' meant different things to both of us and the relay went haywire. Let's agree on names first."

She opens a text document on her phone and starts listing:
- "recon-north" — Scout A → Relay B, enemy sightings in the north sector
- "recon-south" — Scout C → Relay B, enemy sightings in the south
- "threat-bus" — Relay B → all Strikers, compressed threat reports
- "heartbeat" — Command → all units, periodic status check

Mateo looks at the list and counter-proposes: "What about 'recon' for both scouts, let the relay sort by buffer content?" Yuki pauses: "But then the relay can't tell north from south in its buffer without parsing..." Mateo: "Right, separate channels. Your list is good."

**Minute 2:00 — Typing the Agreed Names**
Yuki creates the hook on SCOUT-A: `ON_ENEMY_DETECTED → EMIT on "recon-north"`. She types "recon-north" — the autocomplete dropdown shows: `recon-north (new)` and a suggestion: `scout-a-enemy` (generated from the unit type and trigger). She ignores the suggestion and creates the channel. On Mateo's workbench half, the channel appears in his dropdown with a cyan indicator: "recon-north (Player A)."

Mateo opens RELAY-B's hook config: `ON_SIGNAL_RECEIVED on "recon-north" → compress → EMIT on "threat-bus"`. He also wires `ON_SIGNAL_RECEIVED on "recon-south"` → same compress → same "threat-bus." The channel map updates: two input lines converge on RELAY-B, one output line fans to three strikers. The architecture is visible as a diamond shape — two scouts at top, relay in middle, strikers at bottom.

**Minute 4:30 — The Discovery of the Naming Convention**
Yuki steps back and looks at the channel map. "We're doing function-first naming — 'recon-north' says WHAT it carries and WHERE it comes from. And 'threat-bus' says what it carries and HOW it distributes — it's a bus, not a point-to-point."

Mateo laughs: "We accidentally invented API naming conventions." Yuki: "This is literally my job. Naming REST endpoints."

They both feel the transfer — the game mechanic maps 1:1 to her professional skill. She's enjoying co-op more than single-player because the social negotiation makes the naming problem explicit rather than private.

**Minute 8:00 — EXECUTE and Validation**
They hit EXECUTE. Sealed Watch: the scouts patrol, detect enemies, emit on "recon-north" and "recon-south." Green cell flashes trace the signal path. The relay compresses and broadcasts on "threat-bus" — three simultaneous green flashes as all strikers receive. Strikers converge. Clean kill.

**Minute 9:30 — Inspector Confirms the Protocol**
In the Inspector, Yuki clicks RELAY-B at tick 12. The context window shows: `[slot 1: recon-north signal, age 1, type: enemy_position] [slot 2: recon-south signal, age 1, type: enemy_position]`. The channel names in the context window are color-coded — cyan for her channels, amber for Mateo's. She points: "Look, the naming makes it obvious what's in the buffer. If we'd called them 'a' and 'b' this would be unreadable."

The Protocol Codex prompt appears: "Define your channels?" Yuki clicks Yes and types one-line descriptions for each. The Codex saves. Next session, these names will be pre-populated.

**Minute 11:00 — The Naming Convention Becomes Ritual**
Yuki texts Mateo after the session: "New rule — all our channels follow `function-direction` for point-to-point and `function-bus` for broadcast. Deal?" Mateo: "Deal. Can we export the Codex and share it with the Discord?" The protocol has become a social artifact.

**UI Annotations:**
- Channel autocomplete dropdown: glass panel, 200px wide, shows existing channels with creator-color dots, suggestions below a thin rule line in lighter italic
- Channel map: live-updating directed graph, creator-color edges, hovering highlights connected units with pulse
- Codex prompt: slide-up card after mission, warm parchment tone, optional — "Skip" always available
- Inspector context slots: channel names rendered in creator color within the slot display

---

#### Journey: Tomás, 14, first strategy game, playing with his older sister Elena

**Context:** Mission 5, first co-op session. Neither has played co-op before. Elena is a casual gamer. Tomás has played the single-player tutorial (M1-4). They're using Model A (Archon) for simplicity.

**Minute 0:00 — The Blank Page**
The Plan screen loads with the shared workbench. Tomás sees his cursor (cyan) and Elena's (amber). The board shows the factory, two enemy spawners, and jungle terrain. No channels exist. Tomás opens SCOUT-A's hook config. The channel field blinks.

"What should I call it?" he asks. Elena shrugs: "Uh... 'scout stuff'?"

Tomás types "scout stuff" — the autocomplete suggests: `scout-enemy` and `scout-report`. He looks at the suggestions: "Oh, the game wants us to be specific." He deletes "scout stuff" and types "scout-enemy." Creates the channel.

**Minute 1:30 — The Accidental Merge**
Elena opens RELAY-B's hook config. She wants the relay to forward scout reports. She starts typing "scout" — the autocomplete shows: `scout-enemy (Player A, 🔵)`. She selects it. On the channel map, a line appears connecting Scout A to Relay B through "scout-enemy." So far so good.

Then Elena creates a second hook on RELAY-B: `ON_BUFFER_FULL → EMIT on ???`. She needs a warning channel. She types "warning." Creates it. Fine.

Tomás, independently, creates a hook on STRIKER-C: `ON_SIGNAL_RECEIVED on ???`. He wants the striker to receive threat reports. He starts typing — the autocomplete shows: `scout-enemy`, `warning (Player B, 🟠)`. He doesn't want either of those. He types "alert." Creates it.

But nobody has wired RELAY-B to emit on "alert." The relay compresses scout reports and... sends them nowhere the striker can hear. The gap is invisible.

**Minute 4:00 — The Discovery**
Tomás looks at the channel map. "Wait — the relay gets 'scout-enemy' but emits on 'warning.' My striker listens on 'alert.' There's a break in the chain."

Elena: "Oh no. The relay needs to send to 'alert' too?"

Tomás: "Or my striker needs to listen on 'warning.' But 'warning' is for buffer stuff..."

They stare at the channel map. Three separate channels, no connected path from scout to striker. The map makes the gap visually obvious — three disconnected node clusters.

**Minute 5:00 — The Convention Emerges**
"OK," Tomás says, "let's think about this like a relay race. The scout sees something. The relay compresses it. The striker acts on it. One pipeline."

He renames channels:
- "scout-to-relay" (Scout A's emission)
- "relay-to-striker" (Relay B's emission, Striker C's listener)

Elena: "What about my buffer warning?" Tomás: "That's a different thing. Let's call it 'relay-overflow' so it's clear it's about the relay's buffer, not about enemies."

Three channels, clear names, connected path on the channel map. The naming convention — sender-to-receiver for pipelines, unit-plus-event for diagnostics — emerged from a mistake.

**Minute 6:00 — The Emotional Payoff**
They hit EXECUTE. Sealed Watch: Scout A detects an enemy. Green flash on "scout-to-relay." Relay B compresses, emits. Green flash on "relay-to-striker." Striker C advances and eliminates. Both siblings cheer. Elena: "It actually WORKED. The chain worked!"

Tomás grins: "The names helped. I could see the chain on the map because the names told me what went where."

**UI Annotations:**
- Channel map gap visualization: disconnected nodes have no connecting lines, making "broken chain" visually immediate
- Rename operation: clicking existing channel name in channel map opens inline editor, renaming updates all connected hooks automatically
- Autocomplete partner indicator: amber dot + "Player B" tag on partner-created channels

---

#### Journey: Kwame, 32, Twitch streamer, playing with his co-host Aisha in Specialist co-op

**Context:** Mission 8, their 6th co-op session. Kwame is "The Behaviorist" (skills + rules). Aisha is "The Networker" (hooks + context config). 847 viewers. They have an established Protocol Codex with 11 channel definitions.

**Minute 0:00 — The Protocol Review**
Kwame opens the stream overlay showing their Protocol Codex. Chat sees 11 channel entries, color-coded. "Chat, quick protocol review before we build." He reads: "recon-net — our multi-hop intel pipeline. threat-bus — broadcast alerts. whisper-line — low-EM covert channel, we added this last mission after Aisha's dark network idea."

Aisha, visible in the corner cam: "Today I want to add a new channel. I'm calling it 'pulse' — a periodic heartbeat from the Command agent to all units. It carries a compressed status summary every 3 ticks."

**Minute 0:30 — The Handshake**
Aisha types "pulse" in a new hook on COMMAND-A. The game detects this is a cross-boundary concept (Kwame will need to write rules that respond to the heartbeat) and shows a proposal notification on Kwame's screen: "📡 Channel Proposal: 'pulse' — Type: Status — Command agent periodic heartbeat, every 3 ticks."

Kwame sees it on stream. Chat reacts: "PULSE META" "smart" "finally a heartbeat channel." He clicks ✓ Accept. On both screens, the handshake emoji 🤝 appears next to "pulse" on the channel map. Chat sees the bilateral agreement animated on the overlay.

**Minute 1:00 — The Naming Debate (Content)**
Kwame needs to write rules that respond to pulse signals. He starts: `IF signal_source == "pulse" AND signal_content.status == "all_clear" → maintain patrol`. He reads aloud: "The rule references the signal content... Aisha, what's the pulse payload look like?"

Aisha: "I was thinking: `{status: all_clear | threat_detected | buffer_pressure, source_tick: N}`. Three states."

Kwame: "OK but 'buffer_pressure' is a weird status. Can you split that into a separate channel? Pulse is for battlefield status, buffer stuff should be on 'relay-overflow' where we already track it."

Aisha considers: "Fair. Pulse carries only all_clear and threat_detected. I'll update the Codex description."

Chat: "API DESIGN ON STREAM" "this is literally sprint planning" "they're writing a contract rn."

The game has turned two streamers into API designers, and their audience is watching a protocol negotiation as entertainment.

**Minute 3:00 — The Versioning Moment**
Aisha opens the Protocol Codex and edits "recon-net" — she wants to add terrain data to the intelligence pipeline. The Codex shows: "v1 (M5-M7): enemy positions only." She types: "v2 (M8+): enemy + terrain metadata." The version badge updates from blank to "v2."

Kwame: "Wait, my rules parse recon-net signals assuming enemy-only content. If you add terrain, my rules need to change too."

Aisha: "That's a breaking change. Should I make a new channel instead? 'recon-net-ext' or something?"

Chat explodes: "BREAKING CHANGE" "semver your channels" "this is api governance on twitch" "I literally do this at work."

They decide: keep "recon-net" for backward-compatible enemy-only signals. Create "recon-terrain" for the new terrain data. Both channels feed the relay. The audience has watched a real-time API versioning decision.

**Minute 12:00 — Stream Clip**
Post-mission, Kwame exports the Codex and shares the export code with chat. "If you and your co-op partner want our protocol, here's the code." 47 viewers copy it. The naming convention propagates.

**UI Annotations:**
- Stream overlay: Protocol Codex rendered as a semi-transparent sidebar, updating live as channels are created/modified
- Handshake animation: 🤝 emoji animates from proposal card to channel map node, approximately 0.5s transition, satisfying snap on arrival
- Version badge: small rounded rectangle, increments with a subtle counter-roll animation
- Codex export: generates a compact alphanumeric code (16 chars), displayed in a modal with "Copy" button

---

## New Aspects Discovered

- [ ] 7.02a-i — **Channel name as EM intercept surface:** In competitive co-op (2v2), can opponents read channel names from intercepted EM signals? If so, channel naming becomes an information security game — clear names leak intent, coded names preserve secrecy; the naming arms race as emergent metagame
- [ ] 7.02a-ii — **Protocol Codex as community artifact:** The export/import cycle for naming conventions; how top pairs' protocols propagate through the community; convergence toward "standard protocols" vs. diversity of approaches; the Factorio blueprint library model applied to channel conventions
- [ ] 7.02a-iii — **Cross-pair protocol compatibility:** When two pairs who've developed different naming conventions merge for a 4-player co-op, their Protocol Codexes conflict; the "protocol merge" as a designed 4-player onboarding moment; comparable to API gateway pattern in microservices
- [ ] 7.02a-iv — **The "dead channel" cleanup ritual:** How the game encourages or automates the discovery and removal of unused channels; channel pruning as architectural hygiene; the Slack Channel Problem and its mitigation in gameplay terms
- [ ] 7.02a-v — **Rich text in channel names:** Supporting emoji, icons, and color in channel names as visual convention accelerators; Factorio's `[item=iron-plate]` rich text model applied to Robot Uprising channel names; accessibility implications (screen readers, colorblind modes)

# 3.11 — Hooks UI: How the Player Creates and Manages Hooks

## Overview

Skills have a toggle UI (3.04). Rules have a sentence-strip UI (3.07). But hooks — the primitives that *wire agents together* — face a fundamentally different design challenge. A skill is self-contained ("this unit can compress"). A rule is self-contained ("when X, do Y"). A hook is relational: "when X happens HERE, broadcast Y THERE on channel Z." The hook creation UI must simultaneously configure a local trigger, a named channel (which may or may not exist yet), and a payload — all while communicating spatial consequences the player can't see until battle.

The locked spec establishes:
- **Hooks are reactive fire-and-forget triggers** wired to named channels
- **Hook slots are limited:** Scout: 2, Striker: 2, Relay: 4, Specialist: 2, Command: 6
- **Channels emerge from hooks** — type a channel name in a hook config → channel created. No separate channel editor
- **Channel map panel** is read-only, auto-generated
- **Hooks live in the blueprint editor** alongside skills, rules, and context config
- **Signal latency is 1 tick per hop**

This document explores every possible interaction paradigm for hook creation, from drag-and-wire to form-based to hybrid, with detailed UI annotations and player journeys.

---

## The Design Tensions Unique to Hooks

| Tension | Why Hooks Are Different |
|---------|----------------------|
| **Local vs. relational** | Skills and rules configure one agent. Hooks configure the *space between* agents. The UI must convey "this action affects OTHER units." |
| **Creation vs. discovery** | Typing a channel name creates the channel. The player must understand they're naming something into existence, not selecting from a list. |
| **Slot scarcity** | A Scout with 2 hook slots must make agonizing choices. The UI must make the cost of each slot viscerally clear. |
| **Asymmetric endpoints** | A hook has a SEND side (trigger → channel) and an implicit RECEIVE side (channel → context window). The send side is configured; the receive side is configured elsewhere (context config listen/ignore). The UI must surface this asymmetry. |
| **Channel reuse** | Multiple hooks can broadcast on the same channel. Multiple units can listen on the same channel. The player needs to see the full subscriber graph of a channel while editing a single hook. |
| **Trigger vocabulary** | How many trigger types exist? How are compound triggers expressed? (See 3.08 for taxonomy.) |

---

## Paradigm A: The Plug-and-Socket Strip

**Philosophy:** Each hook slot is a horizontal strip — similar to the rules UI sentence strip (3.07) — that reads left-to-right as "WHEN [trigger] → SEND [payload] ON [channel]." The hook strip is the rules strip's cousin, but with a third zone: the channel destination.

### Mechanical Specification

Each hook slot renders as a 48px-tall strip with three zones:

```
┌───────────────────────────────────────────────────────────────────────┐
│  ⚡  │ WHEN  [enemy_spotted ▾]  →  SEND  [position ▾]  ON  [ recon-net ⌨ ]  │  📡  🗑 │
└───────────────────────────────────────────────────────────────────────┘
```

- **⚡** — Hook icon. Differentiates from rule strips (≡) at a glance. Pulses amber when the hook fired in the last execute's debrief.
- **WHEN** — Fixed label. Same position and font as rules' WHEN. Consistency across primitives.
- **[trigger ▾]** — Click to open radial menu of trigger events (same radial paradigm as rules tokens). Options depend on unit type: Scouts get `enemy_spotted`, `evade_triggered`, `entered_zone`; Relays get `signal_received`, `buffer_threshold`, `compress_completed`; etc.
- **→ SEND** — Fixed label. Visually bridges trigger and payload.
- **[payload ▾]** — Click to open radial menu of payload types: `position` (grid coordinates), `threat_level` (high/medium/low), `unit_id` (which unit was spotted), `compressed_intel` (processed data from compress skill), `tag_status` (tagged/untagged). Payload options vary by trigger type — `enemy_spotted` can send `position` or `threat_level`, but `compress_completed` can only send `compressed_intel`.
- **ON** — Fixed label. The preposition that names the channel.
- **[ channel ⌨ ]** — **Text input field** with autocomplete. This is the critical difference from rules. The player types a channel name freely. If the name matches an existing channel, the input background shifts to that channel's assigned color. If it's new, a subtle "✨ NEW" badge appears to the right, and a color is auto-assigned from the palette. Autocomplete dropdown shows existing channels with subscriber counts: `recon-net (3 listeners)`, `threat-bus (1 listener)`, `command-line (0 listeners)`.
- **📡** — Channel preview icon. Click to expand a mini-panel showing all blueprints currently listening/sending on this channel. A miniature version of the channel map panel, scoped to one channel.
- **🗑** — Delete this hook. Confirmation prompt if channel would become orphaned (no remaining senders or listeners).

### Empty Slot Treatment

Unfilled hook slots show as dashed-outline strips with ghosted placeholder text:

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│  ⚡  │  + Configure hook...                                           │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

The dashed outline pulses very slowly (0.5Hz) — breathing, not blinking. The "+ Configure hook..." text is 50% opacity. Clicking anywhere on the empty slot populates it with a blank hook strip, trigger token pre-focused and radial menu opening automatically.

When all slots are filled, a subtle counter shows "2/2" (for a Scout) in the section header. When there are empty slots: "1/2" with the unused count glowing softly amber, creating gentle pressure to use the slot without demanding it.

### The Channel Name Input: Creation as Typing

This is the most novel interaction in the hooks UI. The channel name field behaves like a smart text input:

1. **Empty state:** Placeholder text "channel name..." in italic, 40% opacity
2. **Typing:** Character-by-character, the autocomplete dropdown appears after 1 character. Existing channels show with their color swatch, subscriber count, and last-fired tick. New names show at the bottom: "Create 'recon-n...' as new channel"
3. **Match:** When the typed text exactly matches an existing channel, the input background smoothly fills with that channel's color (150ms transition). A soft "connection" sound plays — a gentle electronic chirp, like plugging in an aux cable.
4. **New channel:** When the player presses Enter on a new name, the "✨ NEW" badge animates in (scales from 0→100% with bounce), a new color is assigned from the palette, and the input background fills with that color. The sound is different — a higher-pitched "creation" tone, like a sonar ping. The channel map panel in the corner updates instantly, showing the new channel with a single sender (this blueprint) and zero listeners.
5. **Orphan warning:** If the player changes the channel name on the last hook using a particular channel, and no other hook sends on it, a gentle amber tooltip appears: "No other hooks use 'old-channel.' It will be removed." Not blocking — just informational.

### What It Looks Like

The hooks section sits below rules in the blueprint editor panel. Section header: "HOOKS" in monospace, with "1/2" slot counter. Below: one or two strips (for a Scout), each 48px tall, alternating charcoal/slate backgrounds like rule strips. The channel name fields add a pop of color — when connected to a channel, they glow with that channel's color, making the hooks section visually richer than the monochrome rules section above it.

When the player has configured both hooks on a Scout, the hooks section might look like:

```
HOOKS  2/2
┌──────────────────────────────────────────────────────────────────────┐
│ ⚡ │ WHEN  [enemy_spotted]  →  SEND  [position]  ON  [██ recon-net]  │ 📡 🗑 │
├──────────────────────────────────────────────────────────────────────┤
│ ⚡ │ WHEN  [evade_triggered] →  SEND  [threat_level] ON [██ alert]   │ 📡 🗑 │
└──────────────────────────────────────────────────────────────────────┘
```

The `██` blocks are filled with the channel color. `recon-net` might be cyan; `alert` might be coral. At a glance, the player sees: this Scout talks on two channels, one cyan and one coral. The colors match the wires visible on the tactical map preview.

### Sensory Description

The hooks section has a different texture than skills or rules. Skills are toggles — on/off, binary, clean. Rules are sentences — sequential, readable, logical. Hooks are *connections* — they hum with the colors of their channels, like fiber optic cables glowing at their termination points. When you hover over a hook strip, the tactical map preview dims everything except the units listening on that channel, which pulse with the channel color. The connection between "this strip I'm hovering" and "those units over there" becomes physically visible.

Filling in a channel name feels like plugging in a cable. The color fills from left to right across the input field (150ms, ease-out), there's a subtle vibration-like screen shake (1px, 50ms) on mobile, and the aux-cable chirp confirms the connection. Deleting a hook feels like unplugging — the color drains, the wire on the map fades, a soft descending tone plays.

### The TikTok Clip

A player types "r-e-c-o-n" into the channel field. With each letter, the autocomplete filters. On "n", the match locks — the field floods cyan, the map lights up with three units already listening, colored wires spring into existence connecting the Scout to the network. Five seconds of "I just plugged into the matrix."

### Strengths
- **Consistent with rules UI:** Same strip paradigm, same radial menus. Learning transfer from rules to hooks is immediate.
- **Channel creation is lightweight:** Just type a name. No modal, no wizard, no separate editor. Channels emerge naturally from the act of configuring hooks.
- **Color-coded connections:** The channel color in the hook strip visually links to the map wires, creating spatial awareness from a form-based UI.
- **Scales to Command units:** 6 hook slots = 6 strips. Scrollable if needed, but 6 × 48px = 288px — fits comfortably in a workbench panel.

### Weaknesses
- **No spatial sense:** You're configuring a *network* through a *form*. The hook strip tells you WHAT a hook does, but not WHERE the signal goes spatially. The 📡 channel preview helps, but it's a click away.
- **Channel name tyranny:** Naming is hard. New players will create channels called "a", "channel1", "stuff." The game should probably suggest names based on trigger type: configuring an `enemy_spotted` trigger auto-suggests "recon-net" as a default channel name.
- **Trigger-payload coupling opaque:** Some trigger×payload combinations are powerful; others are useless. The radial menu should gray out incompatible payloads when a trigger is selected, but this doesn't teach WHY the pairing matters.

---

## Paradigm B: The Patch Bay — Drag-and-Wire from Trigger to Channel

**Philosophy:** Hooks are wires. The UI should feel like wiring a modular synthesizer or patching an audio console. The left side of the hooks panel shows available triggers; the right side shows channel ports. The player drags a wire from a trigger to a channel.

### Mechanical Specification

The hooks section is divided into two columns:

```
HOOKS  1/2

    TRIGGERS                    CHANNELS
┌─────────────────┐      ┌─────────────────┐
│ ○ enemy_spotted  │──────│ ● recon-net [3] │
│ ○ evade_triggered│      │ ○ alert     [1] │
│ ○ entered_zone   │      │ ○ threat-bus[0] │
│ ○ buffer_full    │      │   [+ new...]    │
│                  │      │                 │
└─────────────────┘      └─────────────────┘
```

- **Left column:** All available triggers for this unit type. Each has a circular output port (○). Triggers with wires show filled ports (●). Each trigger can only connect to ONE channel (one wire per trigger, enforced by hook slot count).
- **Right column:** All existing channels, plus a "new channel" button at the bottom. Each has a circular input port. Channels with incoming wires show filled ports. The number in brackets is the total listener count across all blueprints.
- **Wiring:** Click-and-drag from a trigger port to a channel port. A colored wire follows the cursor during drag, snapping to the nearest port when close. Releasing on a valid port creates the connection with a satisfying magnetic snap and the aux-cable chirp. The wire takes the channel's color.
- **Payload selection:** After connecting a wire, a small payload dropdown appears on the wire midpoint — a tiny token that the player can click to choose what data travels along this wire. Default payload is auto-selected based on the trigger (enemy_spotted → position by default).
- **New channel creation:** Dragging a wire to the "[+ new...]" button opens an inline text input. Type the name, press Enter, channel appears in the list with a fresh color. The wire completes.

### Visual Treatment

Wires are rendered as gentle Bézier curves with a slight downward droop, like real patch cables. Each wire glows with its channel color. When hovering a wire, it brightens and the payload token enlarges, showing the full payload type name. When hovering a port, all compatible endpoints highlight (triggers that can wire to this channel, or channels that this trigger can reach).

The patch bay fits within the same panel space as the strip paradigm. For a Scout (2 triggers that can wire, 2 hook slots), the layout is compact. For a Command unit (many triggers, 6 hook slots), the left column scrolls and more wires create a richer tapestry.

### The Animation: Connecting

1. Player clicks trigger port. Port glows white, slight pulse.
2. Cursor moves right. A semi-transparent wire extends from the port, following the cursor with a slight physical lag (spring physics, 50ms settle time). The wire is white until it nears a channel port.
3. Wire enters a channel port's snap radius (24px). Wire snaps to the port, color transitions from white to channel color over 100ms. Haptic "pre-connection" feedback on mobile.
4. Player releases. Wire solidifies. Payload token fades in at midpoint. The channel port fills (○ → ●). The aux-cable chirp plays. On the tactical map preview, the corresponding wire appears between units.
5. To disconnect: click the wire. It detaches from the channel end and follows the cursor again. Release in empty space to delete. Release on another channel to reroute.

### Sensory Description

The patch bay feels *physical*. The wires have weight — they droop slightly under gravity, they sway gently when the panel scrolls, they pull taut when you drag them to a far-away channel. The ports are round, metallic-looking, with a subtle bevel shadow. When you connect a wire, there's a tiny spark animation at the junction — two bright-white pixels that flash and fade in 100ms. The whole hooks section looks like the back of a vintage telephone switchboard reimagined in cyberpunk neon.

A Command unit with 6 hooks connected creates a striking visual — six colored wires arcing from left to right, crossing and weaving, each a different channel color. It looks like wiring art. It photographs well. Streamers will show this off.

### The TikTok Clip

A player wires a Command unit from scratch. Six wires, six channels, pulled one by one from triggers to ports. Each connection sparks. The final wire completes and the entire network pulses once — all six wires flash simultaneously, the tactical map lights up with the full communication web. Three seconds of silence, then the player hits EXECUTE. Fifteen seconds of pure craftsmanship.

### Strengths
- **Spatial metaphor matches the concept:** Hooks ARE wires. The UI IS wiring. No abstraction gap.
- **Channel topology visible at a glance:** Look at the hooks panel and you SEE the network — not as a description, but as a diagram.
- **Rewiring is fast:** Detach and reattach. No "edit" modal, no text to retype.
- **Scales beautifully for content creation:** Wiring looks cool. Screenshots of complex Command unit wiring become shareable art.
- **Teaches real concepts:** Modular synthesis, patch bays, network wiring — the interaction IS the metaphor.

### Weaknesses
- **Trigger details hidden:** A wire from "enemy_spotted" to "recon-net" doesn't show the payload or any conditional nuance. The payload token on the wire midpoint helps but is small.
- **Channel creation is heavier:** You must click "[+ new...]," type a name, then wire to it. Two steps instead of one.
- **Wire spaghetti at scale:** A Command unit with 6 hooks, especially if some share channels, could get visually tangled. Need auto-routing or user-adjustable wire paths.
- **Precision on touch:** Dragging small wires to small ports on a touch screen requires generous snap radii and possibly a magnification lens.
- **Less scannable:** The strip paradigm reads as natural language ("WHEN enemy_spotted SEND position ON recon-net"). The patch bay reads as a diagram — faster for experts, slower for beginners parsing it for the first time.

---

## Paradigm C: The Socket Board — Inline Blueprint Wiring on the Tactical Map

**Philosophy:** Instead of configuring hooks in a panel, the player wires hooks directly on the tactical map preview. Click a unit's ghost, drag a wire to another unit's ghost, and configure the hook inline. The map IS the hook editor.

### Mechanical Specification

In Plan mode, ghost units on the tactical map each show small colored dots around their tile — one dot per hook slot, arranged at the tile edge. Empty slots show as hollow circles. Configured hooks show as filled circles with channel color.

**Wiring flow:**
1. Player clicks a ghost unit. Hook slot dots enlarge and glow. A radial menu appears at the unit showing available triggers.
2. Player selects a trigger. A wire extends from the unit, following the cursor.
3. Player drags the wire to another ghost unit (or the same unit for self-hooks, or empty space for a broadcast-to-all). Landing on a unit opens a channel name prompt and payload selector.
4. Connection confirmed: wire solidifies with channel color, both units show filled hook dots.

**Inline editing:** Clicking an existing wire on the map opens a small floating inspector showing trigger, payload, and channel name — editable in place.

### What It Looks Like

The tactical map in Plan mode becomes a living network diagram. Ghost units sit on the 8×8 grid, and between them, colored wires trace the hook connections. It's a circuit board made of robots. The workbench panel to the right still shows the blueprint editor, but the hooks section is minimal — just a summary list of "Hook 1: enemy_spotted → recon-net" with a "Edit on map" link.

### Sensory Description

This paradigm makes the Plan screen feel like a *war room*. The tactical map isn't a passive preview — it's an active workspace. Wires between units look like battle plans drawn on a situation map. The player's cursor becomes a pointer tool, selecting units and drawing connections. The whole screen feels less like a form and more like a design canvas.

When you draw a wire, it follows the cursor with a subtle glow trail. When it snaps to a target unit, both units pulse once with the channel color — a visual handshake. The map hums with potential energy — every wire is a promise that "when battle starts, data will flow HERE."

### The TikTok Clip

Overhead view of the 8×8 grid. A player draws wires between five units in rapid succession — click, drag, snap, click, drag, snap. Each wire a different color. In ten seconds, a complete communication network takes shape on the grid, wires crossing and connecting. The player hits EXECUTE and the camera zooms into the sealed watch — those exact wires now carry live signals.

### Strengths
- **Spatial is spatial:** Hooks create spatial relationships. Configuring them ON the spatial map is maximally intuitive.
- **Network topology is the Plan screen:** No need for a separate channel map panel — the map IS the channel map.
- **Scales to multiplayer:** In co-op, both players see each other's wires on the shared map.
- **Dramatic EXECUTE transition:** The wires you drew in Plan are the wires that light up in Watch.

### Weaknesses
- **Crowded map:** On an 8×8 grid with 8+ units and 15+ hooks, the map becomes a wire jungle. The plan screen tactical map is supposed to be a small preview, not the primary workspace.
- **Blueprint vs. instance confusion:** In Plan mode, the player configures BLUEPRINTS (templates), not specific unit instances. But map wiring implies specific spatial connections. If the factory spawns two Scouts from the same blueprint, which one does the wire connect to? This is a fundamental tension.
- **Channel naming friction:** Wiring on the map naturally suggests point-to-point connections, but channels are broadcast (many-to-many). The UI must communicate "this wire isn't from Unit A to Unit B — it's from Unit A to Channel X, which Unit B happens to listen to."
- **Small screen penalty:** On mobile or smaller viewports, the 8×8 grid tiles are already tight. Adding interactive wiring elements around each tile requires pixel-perfect design.

---

## Paradigm D: The Card Plug — Hook Slots as Physical Card Sockets

**Philosophy:** Each hook slot is a physical socket in the blueprint, and hooks are cards that plug into them. The player drags hook cards from a library tray into the blueprint's hook sockets. Each card's face shows the trigger, payload, and channel.

### Mechanical Specification

The blueprint editor shows hook slots as raised rectangular sockets with a card-shaped outline:

```
HOOKS  1/2
┌─────────────────────────────────────┐
│                                     │
│    ┌ ─ ─ ─ ─ ─ ─ ─ ┐              │
│    │  DROP HOOK HERE │    ┌────────┐│
│    └ ─ ─ ─ ─ ─ ─ ─ ┘    │⚡ SPOT │││
│                           │→ pos  │││
│                           │recon  │││
│                           │🟦     │││
│                           └────────┘│
└─────────────────────────────────────┘
```

- **Empty socket:** Dashed outline, 80×60px, "DROP HOOK HERE" ghosted text. Glows when the player drags a hook card nearby.
- **Filled socket:** A card sits in the socket. Card shows: trigger icon (⚡ for combat, 👁 for perception, 📡 for signal), abbreviated trigger name, payload type, channel name, and channel color bar at the bottom.
- **Card library:** Below the sockets, a horizontal scrollable tray shows all possible hook configurations as pre-built cards. The player can drag one into a socket. Alternatively, they can click an empty socket to open a card builder (trigger → payload → channel, step by step).
- **Card customization:** Once a card is in a socket, clicking it opens a flip animation — the card rotates 180° to show its "back," which has the editable fields (trigger dropdown, payload dropdown, channel text input). Flip back to see the summary front.

### The Card Builder Flow

1. Click empty socket → card builder overlay appears
2. Step 1: "WHAT triggers this hook?" — grid of trigger type icons with labels. Click one.
3. Step 2: "WHAT does it send?" — grid of compatible payload types. Click one.
4. Step 3: "WHERE does it go?" — text input for channel name with autocomplete. Existing channels shown as colored chips above the input.
5. Confirm → card materializes in the socket with a satisfying "card dealt" animation (slides in from bottom, slight rotation settling to straight).

### Sensory Description

The card plug paradigm turns hook configuration into a tactile, collectible experience. Each hook card has a matte surface texture with a subtle grain — like a well-worn trading card. The channel color bar at the bottom bleeds slightly into the card body, as if the card is absorbing the channel's identity. When you drag a card from the tray, it lifts with a shadow (card floating above the surface), and the empty socket glows in invitation — warm amber pulsing at the same rhythm as the slot counter.

The flip animation is satisfying — the card rotates around its vertical axis in 300ms, with a slight perspective effect (edges compressed during rotation). The back of the card has a dark surface with clean input fields, like the back of a circuit board showing its solder points. Flipping back shows the clean summary face — the "installed" view.

### The TikTok Clip

A player opens the hook card builder, makes three choices (tap, tap, type), and a new card materializes. They drag it into an empty socket — the card slides in, settles, the channel color bleeds into its edges. The second socket fills the same way. Two cards, two connections, six seconds. Clean.

### Strengths
- **Physicality:** Cards feel tangible. Placing them into sockets feels like assembling a machine.
- **Summary-first:** The card front is a quick-read summary. Details are one flip away.
- **Matches the Blueprint Codex:** If hooks are cards, they fit naturally into the Codex as collectible reference items. "You unlocked the enemy_spotted → position hook card."
- **Slot scarcity is visceral:** Two empty sockets on a Scout. Two cards to fill them. The constraint is physical, not numerical.
- **Undo is intuitive:** Drag a card out of its socket to remove it. The card flies back to the tray.

### Weaknesses
- **Space-hungry:** Cards need surface area. Two 80×60px cards + an empty socket take 240px of width. A Command unit with 6 slots needs careful layout.
- **Channel connectivity hidden:** A card in a socket doesn't show WHO is listening on that channel. Need the 📡 channel preview or the channel map panel.
- **Card builder friction:** Three steps (trigger, payload, channel) is more clicks than the strip paradigm's inline editing. But each step is simpler than parsing a whole strip.
- **Pre-built cards limit creativity:** If the card tray shows pre-built combinations, players might not realize they can customize. The card builder must be equally discoverable.

---

## Paradigm E: The Progressive Hybrid — Strips That Grow Into Wires

**Philosophy:** Start with Paradigm A (strips) for simplicity. As the player's campaign progresses and the network grows more complex, the UI progressively reveals Paradigm B (patch bay) elements. By endgame, the hooks section is a full patch bay. The transition is gradual — strips grow connection lines, connection lines become wires, wires become the primary interface.

### Mechanical Specification

**Missions 1-3 (Tutorial, pre-hooks):** No hooks section visible. Skills and rules only.

**Mission 4 (Hooks introduced):** The hooks section appears with the strip paradigm (Paradigm A). Boot log introduces hooks as "reactive triggers." The strip reads naturally: "WHEN enemy_spotted → SEND position ON recon-net." Two strips maximum. The channel name field has a suggested default pre-filled: "recon-net" for perception triggers, "alert" for threat triggers.

**Mission 5-6 (Factory + channels):** The strips gain a small colored dot on their right edge — matching the channel color. On the tactical map preview, a matching dot appears near the unit's ghost. A faint line connects the dots. The strip is still the primary interface, but the spatial connection is now hinted at.

**Mission 7 (Command agent):** The hooks section gains a toggle: "📊 List / 🔌 Wiring" in the section header. List mode is the familiar strips. Wiring mode flips the section to a miniature patch bay (Paradigm B). Both modes configure the same hooks — they're different views of the same data. The default is list mode, but the boot log mentions wiring mode as "a new way to see your network."

**Mission 8-10 (Full system):** Wiring mode becomes the default. The list mode is still accessible but secondary. The patch bay has matured: wires are smooth, ports are responsive, the auto-routing is clean. The player who has been using strips since Mission 4 finds the patch bay intuitive because the visual language was introduced gradually.

### The Transition Moments

**Mission 5 — The First Dot:** When the player opens the hooks section for the first time in Mission 5, the strip looks normal. Then, after a 500ms beat, a small colored dot fades in on the strip's right edge. On the map, a matching dot appears on the unit ghost. A thin line connects them, pulsing once. The boot log says: "You may notice new indicators in the hook panel. These show where your signals are going." The dot is decorative at first — no interaction. Just ambient connectivity visualization.

**Mission 7 — The Toggle Appears:** The boot log introduces the toggle: "Your communication network is growing more complex. A new view is available." The first time the player clicks "🔌 Wiring," the strips smoothly transform — each strip dissolves into a trigger port on the left and a channel port on the right, with a wire connecting them. The data doesn't change; the representation does. A 600ms animation morphs strip→wire, with each element finding its new position. It's an "oh, I see" moment — the same hooks, now visible as a graph.

### Sensory Description

The progressive hybrid is designed for the *feeling of growth*. In Mission 4, the hooks section is simple, clean, two strips in a quiet corner of the workbench. By Mission 10, it's the most visually complex section — a web of colored wires, a miniature network diagram, the nervous system of the player's architecture made visible. The player's UI has grown alongside their understanding. The hooks section at endgame feels *earned* — it's complex because the player's architecture IS complex, and they built both.

The transition animation (strip → wire) is the key moment. The strip's text elements — "WHEN," "SEND," "ON" — fade to 0% opacity. The trigger token slides left to become a port. The channel name slides right to become a port. A wire grows between them. It takes 600ms and it should feel like watching a caterpillar become a butterfly — the same creature, revealed.

### Strengths
- **No onboarding cliff:** New players never see a patch bay. They see familiar strips.
- **Earned complexity:** The wiring view appears when the player's network actually warrants it.
- **Two mental models:** Players who think in words use list mode. Players who think in diagrams use wiring mode. Both are first-class.
- **Campaign pacing aligned:** Each UI evolution maps to a campaign moment (hooks intro, factory, Command agent).

### Weaknesses
- **Two UIs to maintain:** List mode and wiring mode must stay perfectly synchronized. Bugs where "I edited in list mode but wiring mode didn't update" are trust-destroying.
- **Toggle discovery:** If the player never clicks "🔌 Wiring," they miss the patch bay entirely. The boot log hints help, but some players skip boot logs.
- **Transition confusion:** "Wait, where did my strips go?" could disorient players who accidentally toggle. Clear labeling and a smooth toggle animation are essential.

---

## Paradigm F: The Command Line — Hooks as Typed Expressions

**Philosophy:** For expert players, hooks are most efficiently expressed as terse code-like expressions. The hooks section is a mini-terminal where the player types hook definitions in a structured syntax.

### Mechanical Specification

The hooks section shows a monospace text area with one hook per line:

```
HOOKS  2/2
│ 1 │ enemy_spotted → position @ recon-net
│ 2 │ evade_triggered → threat_level @ alert
│   │ _
```

Syntax: `[trigger] → [payload] @ [channel]`

- **Autocomplete:** After typing 2+ characters, a dropdown shows matching triggers, payloads, and channels. Tab to accept.
- **Syntax highlighting:** Triggers are amber, payloads are white, the `→` arrow is dim gray, `@` is dim gray, channel names are colored with their channel color.
- **Error underline:** Invalid trigger names get a red wavy underline. Hovering shows the error.
- **Line count = slot count:** The text area has exactly N lines for N hook slots. You can't add more lines than you have slots. Line N+1 is dimmed and uneditable, showing the slot limit.

### Sensory Description

This is the Vim user's hook editor. The monospace font, the syntax coloring, the line numbers — it looks like a code editor scoped to exactly the hooks section. The cursor blinks in the familiar way. Autocomplete drops down from the cursor position. It's fast, precise, and completely text-driven.

The expression syntax maps directly to natural language. `enemy_spotted → position @ recon-net` reads as "when enemy is spotted, send position to recon-net." The `→` and `@` operators are visual anchors. An experienced player can configure a hook in under 3 seconds of typing.

### Strengths
- **Speed:** The fastest paradigm for expert players. No clicks, no drags, no menus. Pure typing.
- **Teaches the vocabulary:** Players learn trigger and payload names by typing them. This vocabulary transfers directly to real agentic engineering (event names, payload types, channel routing).
- **Compact:** Minimal vertical space. A Command unit's 6 hooks fit in 6 lines of text.
- **Code-like:** Aligns with the game's educational mission. The hook expression IS a simplified webhook configuration.

### Weaknesses
- **Hostile to beginners:** A blank text area with a cursor is intimidating. No discoverability. "What do I type?"
- **No spatial awareness:** Pure text has zero connection to the map. Channel names are colored, but there's no wiring visualization.
- **Syntax memorization:** Players must learn the trigger vocabulary, payload types, and the `→ @` syntax. Autocomplete helps, but there's still a learning curve.
- **Not appropriate as default:** This should be an expert toggle, not the primary interface.

---

## Cross-Paradigm Comparison

| Dimension | A: Strip | B: Patch Bay | C: Map Wiring | D: Card Plug | E: Progressive | F: Command Line |
|-----------|----------|-------------|---------------|-------------|----------------|----------------|
| **Beginner time-to-first-hook** | 15 sec | 30 sec | 20 sec | 25 sec | 15 sec | 60 sec |
| **Expert hooks-per-minute** | 4 | 6 | 3 | 3 | 6 | 10 |
| **Spatial awareness** | Low | Medium | High | Low | Medium-High | None |
| **Channel discovery** | Autocomplete | Port list | Map topology | Card tray | Both | Autocomplete |
| **Slot scarcity feel** | Numeric counter | Empty ports | Empty dots | Empty sockets | Evolving | Line count |
| **Scales to 6 hooks** | Scrollable | Dense but clear | Crowded map | Space-hungry | Clean in wire mode | 6 lines |
| **Touch-friendly** | Yes | Tricky | Tricky | Yes | Yes (list) / Tricky (wire) | No |
| **Screenshot appeal** | Low | High | High | Medium | High (wire mode) | Low |
| **Blueprint Codex fit** | Moderate | Low | Low | High | Moderate | Low |
| **Educational transfer** | Medium | High | Medium | Medium | High | Very High |
| **Implementation cost** | Low | Medium | High | Medium | High | Low |

---

## Interaction Effects

### With Rules UI (3.07)
Hooks and rules share the blueprint editor panel. If both use strips (A), the visual language is consistent — the player learns one paradigm. If hooks use a different paradigm (B, C, D), there's a jarring visual shift when scrolling from rules to hooks. The progressive hybrid (E) starts consistent and diverges only when warranted.

### With Hook Visualization (3.10)
The hooks UI creates channels; the visualization renders them. A map-wiring hooks UI (C) would make the visualization paradigm for Plan mode redundant — the wiring IS the visualization. A strip-based UI (A) needs the separate visualization layer to show spatial relationships.

### With Hook Taxonomy (3.08)
The trigger vocabulary determines what appears in the radial menus, dropdown lists, and autocomplete. A rich trigger vocabulary (20+ options) favors the strip's radial menu (good for scanning options) over the command line's typed entry (too many to remember).

### With Context Config
Hooks send signals; context config determines what's received. The hooks UI should surface a preview of which blueprints have the receiving channel in their "listen" config. The 📡 mini-panel (Paradigm A) or the patch bay's right column (Paradigm B) can serve this purpose.

### With Campaign Pacing (5.xx)
Hooks are introduced in Mission 4. The UI must be immediately accessible at that moment. Paradigm E (Progressive) explicitly designs for this by starting simple. Other paradigms must ensure their Mission 4 introduction is approachable despite the paradigm's full complexity being visible.

---

## Comparable Games

### Gladiabots — Visual Programming for Robot Behavior
Gladiabots uses a visual node-graph for programming robot AI. Each node is a condition, and edges route to actions. The hooks UI equivalent would be condition nodes (triggers) routing to channel endpoints. Gladiabots' key lesson: **the visual graph IS the game** — 90% of developer time was spent on the node editor UI (developer GDC talks confirm). The patch bay paradigm (B) faces the same challenge — it must be exquisitely polished or it kills the game.

### Factorio — Circuit Network Wiring
Factorio's circuit network UI lets players wire entities with red/green cables by clicking source → clicking target. Each connection creates an implicit channel (the wire color). This is closest to Paradigm C (map wiring). Factorio's lesson: the wiring is simple (click-click) but the *debugging* is where players spend time. The Inspector's hook analysis tools matter more than the creation UI.

### IFTTT / Zapier — Trigger-Action Configuration
Web automation tools use form-based "When THIS happens → Do THAT" configuration. This maps directly to Paradigm A (strip). IFTTT's lesson: the trigger-action paradigm is universally understandable. "When X, do Y" requires zero explanation. Adding "on channel Z" is the only novel element.

### Eurorack Modular Synthesis — Patch Cables
Physical modular synthesizers use patch cables to wire modules together. This is the real-world version of Paradigm B. Key lessons: (1) patch cable spaghetti is both a problem AND an aesthetic — complex patches look impressive; (2) color-coded cables are essential for tracing signal flow; (3) the physical act of patching is deeply satisfying — people do it for the feel, not just the result.

### Unreal Engine Blueprints — Visual Scripting
Unreal's Blueprint system uses color-coded Bézier wires between node ports. Execution wires are white; data wires match the data type's color. Key lessons: (1) wire color = data type is immediately comprehensible; (2) spaghetti prevention requires reroute nodes and alignment tools; (3) zooming and panning are essential for complex graphs.

---

## Player Journeys

#### Journey: Tomás, 14, first strategy game ever

**Context:** Mission 4, hooks tutorial. Has completed M1-3 (context, rules, skills). First time seeing the HOOKS section in the blueprint editor.

**Minute 0:00 — The New Section**
The boot log has just finished explaining hooks: "Your units can now react to events and broadcast messages to other units. This is how they talk to each other." Tomás sees the workbench. Below the familiar RULES section, a new section has appeared: "HOOKS 0/2" with two dashed-outline slots pulsing gently. The rest of the workbench is familiar — skills toggles at top, rules strips in the middle.

He stares at the dashed outlines for a moment, then clicks the first one. [Strip paradigm: the hook strip populates with empty token slots. The trigger radial opens automatically.] The radial shows four options for his Scout: enemy_spotted (yellow diamond), evade_triggered (red bolt), entered_zone (blue boundary), buffer_threshold (orange thermometer). Each has a one-word label and a small icon.

**Minute 0:30 — First Hook**
He picks `enemy_spotted` — it seems obvious, his Scout should react to enemies. The yellow diamond token snaps into the WHEN slot with a soft click. The strip now reads: "WHEN [enemy_spotted] → SEND [___] ON [___]." The SEND token slot pulses, inviting the next choice.

He clicks SEND. The payload radial opens: position, threat_level, unit_id. He doesn't know what these mean. He hovers `position` — tooltip: "The grid coordinates where the enemy was spotted." He hovers `threat_level` — tooltip: "How dangerous the enemy appears (high/medium/low)." He picks `position` because "coordinates" sounds useful. Token snaps in.

Now the channel input. The strip reads: "WHEN [enemy_spotted] → SEND [position] ON [___]." The channel field has a suggestion pre-filled in light gray: "recon-net." He doesn't know what to call it, so he presses Enter to accept the suggestion. The field fills with cyan — a color appears for the first time in the hooks section. A tiny "✨ NEW" badge flashes. On the tactical map, a faint cyan dot appears on his Scout's ghost.

**Minute 1:00 — "Wait, who hears this?"**
Tomás looks at the completed strip: "WHEN [enemy_spotted] → SEND [position] ON [recon-net]." He configured the SEND side. But he thinks: who receives it? He clicks the 📡 icon. A mini-panel expands showing: "recon-net — 1 sender (Scout), 0 listeners." Zero listeners. His message goes nowhere.

He remembers the boot log mentioned "context config" — the listen/ignore toggles. He switches to his Striker's blueprint and scrolls to Context Config. Under "Listen Channels," he sees an empty toggle list. He types "recon-net" — it autocompletes, showing the cyan color. He enables it. Back on the Scout's 📡 preview: "recon-net — 1 sender (Scout), 1 listener (Striker)." The tactical map now shows a faint cyan dashed line between the Scout ghost and the Striker ghost.

**Minute 1:30 — The Connection Moment**
He stares at the cyan line on the map. His Scout will tell his Striker where enemies are. The Striker will know. He hasn't hit EXECUTE yet, but he can already picture the information flowing. This is the moment hooks click. He grins and fills in his second hook slot.

**Minute 3:00 — EXECUTE**
He hits EXECUTE. The sealed watch begins. Tick 3: his Scout spots an enemy. On the board, a green cell flash — signal sent. A cyan dashed line briefly brightens between Scout and Striker. Tick 4: the Striker moves toward the enemy's last known position. The information architecture he built WORKED. He didn't control the Striker. He wired a network and the network did the rest.

**UI Annotations:**
- Hook strip: 48px tall, trigger/payload via radial menu, channel via text input with autocomplete
- 📡 mini-panel: expands inline, shows sender/listener counts per blueprint
- Channel creation: typing + Enter, "✨ NEW" badge, color auto-assigned
- Tactical map: faint colored dots on ghosts, dashed lines between connected units
- Sealed watch: signal delivery flashes channel color on the wire briefly

---

#### Journey: Priya, 28, backend engineer, Factorio veteran

**Context:** Mission 7, Command agent introduced. She has 4 blueprints (Scout, Relay, Striker, Command) and needs to wire a full communication network. She's been using the strip paradigm since Mission 4 and is comfortable with it.

**Minute 0:00 — The Toggle Revelation**
She opens the Command blueprint. The hooks section header reads "HOOKS 0/6" — six slots. She's about to fill them with strips when she notices something new in the section header: "📊 List / 🔌 Wiring." She clicks "🔌 Wiring."

The two existing strips she'd configured on her Scout dissolve. The text fades, the strips reshape — trigger names slide left, channel names slide right, and wires grow between them. In 600ms, her two Scout hooks are now two colored wires in a miniature patch bay. "Oh," she says aloud. "It's a graph."

**Minute 0:30 — Wiring the Command Unit**
She switches to the Command blueprint in wiring mode. The left column shows eight available triggers: `signal_received`, `threshold_reached`, `unit_destroyed`, `stun_detected`, `all_units_idle`, `buffer_full`, `zone_captured`, `enemy_wave_spawned`. The right column shows her existing channels: `recon-net` (cyan, 2 listeners), `alert` (coral, 1 listener), plus "[+ new...]."

She clicks-and-drags from `signal_received` to `recon-net`. A cyan wire follows her cursor and snaps to the channel port. Payload dropdown appears on the wire midpoint — she selects `compressed_intel`. First hook: done. She's wiring the Command to intercept scout reports.

She drags from `unit_destroyed` to "[+ new...]." Types "casualty-report." A new channel appears in magenta. Wire completes. She drags from `threshold_reached` to a new channel "overload-alert" in gold. Three hooks, three wires, thirty seconds. She's grinning — this is faster than strips.

**Minute 2:00 — The Architecture Takes Shape**
Six wires now connect triggers to channels. The patch bay looks like a small diagram — she can see the entire Command unit's communication topology at a glance. Cyan, coral, magenta, gold, white, lime — six colors, six channels. She takes a screenshot. "This is literally a pub-sub configuration," she mutters, thinking of her Kafka work.

She switches to the tactical map. The ghost Command unit sits in the center, and colored wires radiate outward to other ghosts. She can see the whole network — not just one blueprint's hooks, but the combined topology. She spent 3 minutes configuring and now has a full C2 network.

**Minute 4:00 — EXECUTE and Validate**
She hits EXECUTE. The sealed watch shows her network in action. Command receives recon-net signals, processes them, broadcasts compressed intel on a new channel to all Strikers. When a Relay gets stunned (overloaded context), the Command reroutes traffic. She watches the network self-heal — a behavior that emerged from her wiring, not her explicit programming.

In the Inspector afterward, she clicks the Command unit and sees every hook that fired, every tick. The decision trace shows: "Tick 7: signal_received from recon-net → compressed_intel sent on command-net." She traces the full chain: Scout spotted enemy (T5) → sent position on recon-net (T5) → Command received position (T6) → sent compressed intel on command-net (T7) → Striker received compressed intel (T8) → Striker engaged enemy (T9). Five ticks, four hops, one engagement. She identifies a bottleneck and plans to add a direct Scout→Striker fast-path for the next execute.

**UI Annotations:**
- Wiring mode toggle: "📊 List / 🔌 Wiring" in section header
- Strip-to-wire transition: 600ms animation, text fades, endpoints slide to column positions, wire grows
- Patch bay: left column (triggers), right column (channels with color + listener count), Bézier wires between
- Wire payload: small dropdown token at wire midpoint, click to change
- New channel creation: drag to "[+ new...]", type name, Enter, color auto-assigned
- Map integration: wiring mode hooks reflected as colored wires between ghost units

---

#### Journey: Aisha, 42, mobile gamer, never played strategy or programming games

**Context:** Mission 4, hooks tutorial. She plays puzzle games on her iPad. She found the game through a TikTok clip of someone's signal network lighting up during battle.

**Minute 0:00 — Overwhelm Prevention**
The boot log explains hooks with a simple analogy: "Imagine your Scout has a walkie-talkie. You choose which channel to tune it to and what to say when something happens." The hooks section appears with one pre-filled strip and one empty slot. The pre-filled strip reads: "WHEN [enemy_spotted] → SEND [position] ON [recon-net]." It's marked as a "TUTORIAL PRESET" with a small lock icon — she can't edit it yet, just observe.

The boot log continues: "This hook means: when your Scout sees an enemy, it radios the enemy's location on the recon-net channel. Your Striker is already listening on recon-net. Try adding a second hook."

**Minute 0:30 — Guided Creation**
She taps the empty slot. On her iPad, the radial menu appears centered on her tap point, scaled for touch (wedges are 64px minimum). She taps `evade_triggered` — the token snaps in with a haptic tap. She taps the SEND slot — `threat_level` appears highlighted as a "SUGGESTED" option. She taps it. The channel input appears as a mobile-friendly bottom sheet (slides up from screen bottom) with the suggestion "alert" pre-filled and a large "Create Channel" button.

She taps "Create Channel." Coral color fills the channel name. The 📡 mini-panel auto-expands briefly (2 seconds) showing "alert — 1 sender (Scout), 0 listeners" with a pulsing "Add a listener?" hint. She'll figure that out later.

**Minute 1:30 — EXECUTE and Delight**
She hits EXECUTE without configuring a listener. During the sealed watch, she sees the cyan flash from her pre-configured hook (working!) and wonders why she never sees a coral flash (her second hook has no listener). In the Inspector, she taps the Scout and sees: "Hook 2: evade_triggered → threat_level on alert — DELIVERED: 0 (no listeners)." The "0" is amber — not an error, just unheard.

She goes back to Plan, opens her Striker's context config, and adds "alert" to listen channels. Second execute: this time, coral flashes appear when the Scout evades, and the Striker reacts. The connection between "I wired this" and "the robots did that" clicks.

**Minute 3:00 — Understanding**
She's not thinking about triggers, payloads, and channels anymore. She's thinking: "My Scout has two walkie-talkies — one for scouting reports, one for danger alerts." The hook UI abstraction has dissolved into an intuitive mental model. She takes a screenshot of her two hooks and sends it to her daughter with the message "I programmed robots today."

**UI Annotations:**
- Touch radial: 64px minimum wedge targets, centered on tap point
- Mobile channel input: bottom sheet, large buttons, haptic confirmation
- Tutorial preset: locked strip with "TUTORIAL PRESET" label, demonstrates before player acts
- Zero-listener feedback: amber "0" in delivery count, not blocking, gently educational
- 📡 auto-expand: brief auto-show after channel creation, then collapses

---

## Recommended Approach

**Paradigm E (Progressive Hybrid)** is the strongest choice, combining:
- **Mission 4-6:** Strip paradigm (A) with channel color dots, matching the rules UI for consistency
- **Mission 7+:** Toggle between strips (list mode) and patch bay (wiring mode), with wiring mode becoming default
- **Expert option:** Command line expressions (F) available as an advanced toggle for speed players
- **Throughout:** The 📡 channel preview mini-panel from Paradigm A, available in all modes

The Card Plug (D) should be reserved for the Blueprint Codex — hooks displayed as collectible cards in the reference system, even if the workbench uses strips/wires for editing.

The Map Wiring (C) should inform the Plan screen's tactical map *visualization* but NOT be the primary hook *editing* interface, because of the blueprint-vs-instance confusion.

---

## Discovered Aspects

- **3.11a — Hook template presets per unit type:** Should each unit type come with pre-suggested hooks? Scout: "enemy_spotted → position" as a default? How do presets help onboarding without limiting creativity?
- **3.11b — The "dead hook" diagnostic:** When a hook has fired 0 times in the last N executes, should the Inspector flag it as potentially misconfigured? Amber warning on unused hooks in debrief.
- **3.11c — Hook copy-paste between blueprints:** Can the player copy a hook from one blueprint and paste it into another? Channel names carry over, but trigger availability may differ by unit type. How does the paste handle incompatible triggers?
- **3.11d — Channel subscriber count as competitive intelligence:** In multiplayer, can the opponent estimate your channel count from EM emissions? Does the hooks UI surface your own EM footprint as you add hooks?
- **3.11e — Expert keyboard workflow for hook wiring:** Ctrl+H to add hook, Tab between fields, Enter to confirm, Ctrl+Up/Down to reorder. The full mouseless speedrun for competitive players.

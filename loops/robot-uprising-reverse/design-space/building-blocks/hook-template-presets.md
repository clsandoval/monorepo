# 3.11a — Hook Template Presets Per Unit Type: Suggested Wiring for Faster Onboarding

## Overview

The hook system is Robot Uprising's most powerful primitive — and its steepest cliff. Skills are toggle-on. Rules read as sentences. But hooks require the player to simultaneously understand triggers, payloads, channels, and how those channels connect to *other* units they may not have configured yet. The blank hook slot is the game's coldest cold start.

Hook template presets are pre-built hook configurations suggested per unit type. When a player opens an empty hook slot, instead of facing a blank "WHEN [???] → SEND [???] ON [???]" strip, they see a curated list of common configurations: "Scout Alert" (WHEN enemy_spotted → SEND position ON recon-net), "Relay Forward" (WHEN signal_received → SEND compressed_intel ON alert-net), etc. The player can accept a preset with one click, modify it, or dismiss it and build from scratch.

The design tension is ancient: **scaffolding vs. ceiling**. Too many presets and the game feels like assembling IKEA furniture — follow the instructions, get a functional shelf, never learn carpentry. Too few and novices stare at blank strips for minutes, trying to intuit a system they haven't seen in action yet. The right answer lies in how presets *present themselves* — as suggestions that teach the grammar, not as answers that replace the thinking.

This analysis maps the design space of preset systems, from no-presets to full template libraries, with specific attention to how each unit type's preset menu reflects its architectural role.

---

## The Preset Vocabulary Per Unit Type

### Scout (2 hook slots)

The Scout is the sensory organ. Its hooks are overwhelmingly about *reporting what it sees*. Preset hooks for Scouts should reinforce this identity:

| Preset Name | Configuration | Why It Teaches |
|-------------|--------------|----------------|
| **"Scout Alert"** | WHEN enemy_spotted → SEND position ON `recon-net` | The canonical first hook. Shows that scouts broadcast what they see. Introduces the `recon-net` channel name as a convention. |
| **"Evasion Report"** | WHEN evade_triggered → SEND unit_id ON `status-net` | Shows hooks can fire on defensive actions, not just observations. Introduces status reporting. |
| **"Silent Patrol"** | WHEN entered_zone → SEND position ON `patrol-log` | A quieter alternative — only fires on zone transitions. Teaches that fewer emissions = less EM noise. |

**Design intent:** Scout presets always SEND outward. The Scout never listens in its presets. This reinforces the Scout's role as a sensor, not a processor.

### Striker (2 hook slots)

The Striker is the executor. Its hooks are about *announcing actions taken* and *receiving targeting data*:

| Preset Name | Configuration | Why It Teaches |
|-------------|--------------|----------------|
| **"Kill Confirmed"** | WHEN eliminate → SEND position ON `kill-net` | Shows that post-action hooks exist. Other units can react to confirmed kills. |
| **"Threat Response"** | WHEN threat_enter → SEND threat_level ON `alert-net` | Even Strikers observe threats. Their narrow perception (2) means this fires at close range — a last-resort alarm. |

**Design intent:** Striker presets are sparse and aggressive. Two slots, two direct configurations. No subtlety. The Striker's hook menu feels punchy — in, out, done.

### Relay (4 hook slots)

The Relay is the nervous system's backbone. Its presets must teach the *forwarding pattern* — receive, process, retransmit:

| Preset Name | Configuration | Why It Teaches |
|-------------|--------------|----------------|
| **"Compress & Forward"** | WHEN signal_received → SEND compressed_intel ON `alert-net` | The Relay's signature move. Teaches the receive→process→forward chain. |
| **"Signal Amplifier"** | WHEN signal_received → SEND amplified_signal ON `broadcast-net` | Shows that the same trigger can pair with different skills and different output channels. |
| **"Buffer Watchdog"** | WHEN buffer_threshold → SEND alert ON `overload-net` | Teaches context window monitoring. The Relay warns when it's getting overwhelmed. |
| **"Noise Filter"** | WHEN signal_received → SEND filtered_intel ON `clean-net` | Shows filtering as an explicit processing step. Raw signals come in on one channel, clean signals go out on another. |

**Design intent:** Relay presets use four *different* output channels. This is deliberate — it teaches the player that channel naming creates the network topology. Each preset suggests a new channel name, and the player sees the channel map panel populate with four new colored nodes. The Relay's preset menu IS the lesson on channel architecture.

### Specialist (2 hook slots)

The Specialist is the surgical tool. Its hooks are about *targeted intelligence*:

| Preset Name | Configuration | Why It Teaches |
|-------------|--------------|----------------|
| **"Hack Report"** | WHEN hack_complete → SEND extracted_data ON `intel-net` | Shows that skills produce hookable events. Hacking generates intelligence. |
| **"Tag & Track"** | WHEN spot_enemy → SEND tag_status ON `target-net` | Ties into the tagging system. The Specialist sees a target and marks it for others. |

### Command (6 hook slots)

The Command unit is the meta-layer — the agent that manages agents. Its presets must teach *system-level orchestration*:

| Preset Name | Configuration | Why It Teaches |
|-------------|--------------|----------------|
| **"Reassign on Alert"** | WHEN signal_received (from alert-net) → SEND reassign_order ON `command-net` | The meta-hook: receiving alerts triggers command decisions. |
| **"Reroute Traffic"** | WHEN buffer_threshold → SEND reroute_order ON `command-net` | When the Command is overwhelmed, it reroutes signal flow. |
| **"Priority Override"** | WHEN signal_received (from kill-net) → SEND priority_update ON `command-net` | Kill confirmations trigger priority recalculation. |
| **"Network Health"** | WHEN silence_detected → SEND status_request ON `ping-net` | The absence of signal is itself a signal. Teaches negative-space monitoring. |
| **"Cascade Control"** | WHEN signal_received (from overload-net) → SEND throttle_order ON `command-net` | Overload warnings from Relays trigger system-wide throttling. |
| **"Strategic Pivot"** | WHEN buffer_threshold → SEND reassign_order ON `broadcast-net` | When the Command's own context is filling up, it reorganizes the army. |

**Design intent:** Command presets reference channels created by OTHER unit types' presets (alert-net, kill-net, overload-net). This is the key teaching moment: the Command unit is a *listener* that reacts to the network's state. A player who configured Scouts and Relays with presets will see familiar channel names appear in the Command's preset menu. The architecture clicks — "oh, all these channels I created are flowing INTO this unit."

---

## Approach A: The Suggestion Whisper (Recommended)

**Philosophy:** Presets appear as faint suggestions inside empty hook slots, visible but not demanding. The player can accept with one click, or start typing to dismiss and build from scratch. Presets teach by example without blocking the creative path.

### Mechanical Specification

When the player clicks an empty hook slot (the dashed-outline "+ Configure hook..." strip), instead of immediately opening a blank strip, the slot expands to show a compact suggestion panel:

```
┌───────────────────────────────────────────────────────────────────────┐
│  ⚡  HOOK 1 of 2                                              ─ or ─ │
│                                                                       │
│  💡 Suggested:                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Scout Alert                                                    │  │
│  │  WHEN enemy_spotted → SEND position ON recon-net                │  │
│  │  "Report enemy positions to listeners"              [ Use This ]│  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Evasion Report                                                 │  │
│  │  WHEN evade_triggered → SEND unit_id ON status-net              │  │
│  │  "Warn the network when this scout dodges"          [ Use This ]│  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ── or build from scratch ──────────────────────────────────────────  │
│  │ WHEN [  ▾  ] → SEND [  ▾  ] ON [          ⌨ ]                  │  │
└───────────────────────────────────────────────────────────────────────┘
```

**Visual treatment:**
- The suggestion panel has a slightly darker background than the workbench — a recessed area, like a toolbox drawer pulled open beneath the hook slot.
- Each suggested preset is a card with a subtle left-border in cyan (the "template" color), a bold name at top, the full hook sentence in monospace below, and a one-line plain-English description in italic gray.
- The **[ Use This ]** button is a small pill-shaped button in the unit type's accent color (amber for Scout, red for Striker, teal for Relay, purple for Specialist, gold for Command).
- The "or build from scratch" section at the bottom shows a blank hook strip, slightly dimmer than the presets. Clicking anywhere on it expands it into the full hook editor (per the Plug-and-Socket Strip paradigm from 3.11).

**Clicking [ Use This ]:**
1. The suggestion panel collapses with a 200ms slide-up animation.
2. The preset's hook configuration populates the strip — trigger, payload, and channel name all fill in simultaneously.
3. The channel name input gets the channel's auto-assigned color as its background.
4. A soft "plug-in" sound plays — a warm electronic chirp, like connecting a patch cable.
5. If the channel name is new (not yet used by another blueprint), the "NEW" badge appears and the channel map panel updates.
6. Each token (trigger, payload, channel) has a 2-second subtle glow that fades — drawing the eye to the three configurable zones and implicitly saying "you can change any of these."

**Dismissing presets:**
- Clicking the blank "build from scratch" strip dismisses all suggestions instantly (no animation) and opens the full hook editor.
- Pressing Escape dismisses the suggestion panel and returns to the empty dashed-outline slot.
- If the player has already used a preset for slot 1, slot 2's suggestions filter out presets that would duplicate the same channel. If "Scout Alert" was used (recon-net), the remaining suggestions won't suggest recon-net again — teaching channel diversity.

### When Presets Disappear

Presets are NOT permanent training wheels. They phase out via two mechanisms:

1. **Familiarity threshold:** After the player has manually configured 5 hooks from scratch (across any unit type), presets stop appearing by default. A small "💡 Show suggestions" link appears in the empty slot instead, clickable but not default. The game says: "You know how to do this now."

2. **Mission gating:** Presets only appear for missions 1-6. By mission 7, the player has seen every unit type and configured enough hooks that suggestions are noise. The suggestions quietly stop appearing. If the player misses them, the Blueprint Codex has a "Hook Templates" section showing all presets as reference cards.

---

## Approach B: The Recipe Book (Full Template Library)

**Philosophy:** A dedicated panel or modal that presents a searchable library of hook templates, categorized by unit type, by channel pattern, and by strategic intent. More structured than the Suggestion Whisper. The player explicitly browses, selects, and applies templates.

### Mechanical Specification

A small **📖** book icon appears next to the hook section header in the blueprint editor. Clicking it opens a slide-in panel (from the right edge, 320px wide):

```
┌──────────────────────────────┐
│  📖  Hook Templates          │
│  ─────────────────────────── │
│  [Scout ▾] [All intents ▾]  │
│                              │
│  🔍 Search templates...      │
│                              │
│  ── REPORTING ──             │
│  ┌────────────────────────┐  │
│  │ 👁 Scout Alert         │  │
│  │ enemy_spotted → pos    │  │
│  │ ★★☆ Beginner           │  │
│  │         [ Apply ] [👁] │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 🔇 Silent Patrol       │  │
│  │ entered_zone → pos     │  │
│  │ ★☆☆ Advanced           │  │
│  │         [ Apply ] [👁] │  │
│  └────────────────────────┘  │
│                              │
│  ── DEFENSIVE ──             │
│  ┌────────────────────────┐  │
│  │ 🏃 Evasion Report      │  │
│  │ evade → unit_id        │  │
│  │ ★★☆ Beginner           │  │
│  │         [ Apply ] [👁] │  │
│  └────────────────────────┘  │
│                              │
│  ── COMBOS ──                │
│  │ "Pairs with: Relay's   │  │
│  │  Compress & Forward"   │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

**Key features:**
- **Unit type filter** defaults to the current blueprint's unit type. But the player CAN browse other unit types — this teaches cross-unit hook pairing ("if I use Scout Alert, the Relay should use Compress & Forward").
- **Star rating** shows difficulty level, not quality. One star = beginner-friendly. Three stars = requires understanding of advanced concepts (buffer thresholds, silence detection, cascade patterns).
- **[👁] Preview button** temporarily draws the hook's channel as a dashed line on the board preview in the workbench — from this unit's spawn point to any existing listeners on that channel. The player sees the spatial consequences of the hook before committing.
- **"Combos" section** at the bottom suggests hook pairs across unit types. "Scout Alert + Relay Compress & Forward = 2-hop threat detection network." This is where the teaching happens most aggressively — showing that individual hooks are puzzle pieces that fit together.
- **[ Apply ]** populates the next empty hook slot with the template. If no empty slots, the button grays out and shows "No empty slots."

**The danger:** The Recipe Book can become a crutch. If every mission can be solved by browsing templates and clicking Apply, the player never learns the grammar — they learn the cookbook. Mitigation: templates use generic channel names (recon-net, alert-net), but optimal solutions for harder missions require custom channels. The templates get you to 60% — the last 40% requires manual wiring.

---

## Approach C: No Presets (The Blank Canvas)

**Philosophy:** Every hook is built from scratch. The game teaches through the boot log, the Blueprint Codex reference cards, and trial-and-error. No suggestions, no templates, no hand-holding in the hook editor itself.

### Why Consider It

Some of the best puzzle/programming games offer zero templates. Zachtronics games drop you into a blank assembly editor. Baba Is You gives you the rule vocabulary and lets you figure out combinations. The "aha!" moment of discovering a hook pattern independently is more powerful than having it suggested.

**The argument:** If the player discovers that WHEN enemy_spotted → SEND position ON recon-net creates a scouting network *by reasoning about it themselves*, they understand hooks at a fundamentally deeper level than if they clicked "Scout Alert" from a menu. The struggle IS the learning.

**The counter-argument:** Hooks have three simultaneous configuration axes (trigger, payload, channel). This is categorically harder than skills (on/off) or rules (condition → action). The blank canvas works for Zachtronics because their audience self-selects for puzzle masochism. Robot Uprising's spec says "must be accessible to someone who's never played a strategy game." The blank hook slot is a wall for that player.

**When this approach works:** If the tutorial missions (1-4) pre-wire hooks for the player and the boot log explains each one in detail before the player ever sees a blank slot. By the time the player faces an empty hook slot (mission 5+), they've watched hooks work across 4 missions and have the Blueprint Codex for reference. The blank canvas is fine — *if the scaffolding happened earlier in a different form*.

---

## Player Journeys

### Journey: Maya, 16, K-pop fan who's never played a strategy game

**Context:** Mission 3 (Palawan, jungle terrain). Hooks are being introduced for the first time. Maya has two pre-placed Scouts and one Striker. The boot log just explained hooks: "Your observation subroutines can broadcast on channels. Other units listening on those channels receive the data." She has one empty hook slot on each Scout. The Suggestion Whisper approach is active.

**Minute 0:00 — The Empty Slot**
The workbench shows Scout-Alpha selected. The blueprint editor has Skills (patrol ON, evade ON) and Rules (one pre-configured rule: "WHEN enemy_adjacent → evade"). Below rules, the Hooks section: one slot filled (pre-wired from mission setup: WHEN enemy_spotted → SEND position ON recon-net), one slot empty. The empty slot breathes with its slow dashed-outline pulse — not demanding, just present. Maya notices the filled slot first. It reads left-to-right like a sentence. She mouths it: "When enemy spotted... send position... on recon-net." She gets it. That's what the boot log was about.

She clicks the empty slot.

**Minute 0:15 — Suggestions Appear**
The slot expands downward. A recessed panel slides in, slightly darker than the workbench background. Two suggestion cards appear:

- **"Evasion Report"** — WHEN evade_triggered → SEND unit_id ON status-net — *"Warn the network when this scout dodges"*
- **"Silent Patrol"** — WHEN entered_zone → SEND position ON patrol-log — *"Only report when moving to a new area"*

Below both cards, a dimmer blank strip: "or build from scratch."

Maya reads "Evasion Report." The plain-English description clicks: "warn the network when this scout dodges." She thinks about the pre-configured rule — if an enemy is adjacent, the Scout evades. And this hook would *tell other units* that the evasion happened. That means the Striker would know the Scout is in danger.

She clicks **[ Use This ]** on Evasion Report.

**Minute 0:25 — The Preset Fills In**
The suggestion panel slides up and vanishes (200ms). The hook strip fills in simultaneously: the trigger token shows "evade_triggered" with a running-figure icon, the payload shows "unit_id," and the channel name input fills with "status-net" in a fresh green color (auto-assigned from the palette). A warm electronic chirp sounds — the plug-in confirmation. The channel map panel in the corner updates: "status-net" appears as a new colored dot, connected to Scout-Alpha's icon with a dashed line.

Each of the three tokens (trigger, payload, channel) glows softly for two seconds, then fades. Maya's eye tracks across them. She notices the channel name is editable — the cursor is blinking inside the text field. She could change "status-net" to something else. She doesn't — the default name makes sense.

**Minute 0:40 — Configuring the Second Scout**
Maya clicks Scout-Beta in the production queue. Its blueprint editor opens — identical layout, but both hook slots are empty. She clicks the first empty slot. The suggestion panel appears again — but this time, "Evasion Report" is the first suggestion and "Scout Alert" is second (since Scout-Alpha already has Scout Alert from the pre-wired hook, the game avoids suggesting a duplicate channel for the same trigger). Maya clicks "Scout Alert" for this Scout too. Same chirp, same fill animation. Now both Scouts report enemy positions on recon-net.

She clicks the second empty slot. The suggestions panel shows "Evasion Report" and "Silent Patrol" — "Scout Alert" is filtered out because she just used it on slot 1. She picks "Evasion Report." Both Scouts now have the same hook configuration: Scout Alert + Evasion Report. The channel map shows recon-net with 2 senders and status-net with 2 senders.

**Minute 1:10 — The Striker's Listening Side**
Maya selects the Striker. Its context config section shows listen/ignore toggles for each channel. She sees "recon-net" and "status-net" listed — the channels she just created. Both are set to "Listen" by default. The Striker will receive signals from both channels automatically. Maya doesn't fully grasp the listen/ignore system yet, but she sees the green "Listen" toggles and feels reassured: her Scouts' reports will reach the Striker.

She hits EXECUTE.

**Minute 1:30 — Sealed Watch**
Tick 3: Scout-Alpha spots an enemy. The hook fires — a green flash races along a dashed line from Scout-Alpha to Striker. The Striker's context bar gains a slot (a tiny pip lights up). Tick 4: The Striker pivots toward the enemy's reported position. Maya gasps. She configured this. The Scout TOLD the Striker where the enemy was, and the Striker MOVED there. She didn't program "go to the enemy" — she wired information flow, and the behavior emerged from the Striker's rules evaluating the new context data.

Tick 6: Scout-Beta bumps into another enemy, evades. The "Evasion Report" hook fires — an amber flash races to the Striker. The Striker's context bar gains another pip. But the Striker is already heading toward the first threat. Its rules prioritize the older context entry. Maya watches the Striker ignore the second report. She frowns. "Why didn't it go to the other one too?"

**Minute 2:30 — Inspector (Post-Battle)**
Maya clicks the Striker's tile in the Inspector. The decision trace for tick 7 shows: "Rule 1: WHEN threat_in_context → move_toward (evaluated: recon-net signal T3, position E4). Rule 2: WHEN threat_in_context → move_toward (evaluated: status-net signal T6, unit Scout-Beta). Rule 1 matched first — earlier signal, higher priority by rule ordering." Maya reads this slowly. She starts to understand: the Striker has rules that determine which context entry matters most. The hooks just deliver the data — the rules decide what to DO with it.

**Minute 3:00 — Resolution**
Maya returns to the Plan screen. She wants the Striker to respond to evasion reports with higher priority than regular scouting reports. She looks at the Striker's rules and drags the "threat_in_context from status-net" rule above the "threat_in_context from recon-net" rule. She's learning that hooks and rules are separate systems that interact. The preset got her started — she's now customizing beyond the preset's scope.

**UI Annotations:**
- Suggestion panel: 320px tall expansion below the empty slot, 200ms slide-in, recessed background (2 shades darker than workbench)
- Preset cards: 64px tall, cyan left-border (3px), bold name top-left, monospace hook sentence below, italic gray description, pill-shaped [ Use This ] button in unit accent color
- Post-accept glow: Each token (trigger/payload/channel) pulses once from 100% to 0% opacity white overlay over 2 seconds
- Channel map update: New channel node animates in with a 300ms scale-up bounce

---

### Journey: Derek, 34, software engineer, played Factorio for 2000 hours

**Context:** Mission 6 (Manila megacity). Factory is active. Derek has unlocked all unit types. He is building a multi-relay compression network. He has 3 Scouts, 2 Relays, 2 Strikers, and 1 Specialist queued. He knows hooks cold — he's been hand-wiring since mission 3. The Suggestion Whisper has faded (he passed the 5-hook manual threshold two missions ago).

**Minute 0:00 — The First Relay's Blueprint**
Derek opens Relay-Alpha's blueprint. Four hook slots, all empty. No suggestion panel appears — he's past the familiarity threshold. Each slot shows the dashed-outline "+ Configure hook..." placeholder. Derek doesn't hesitate. He clicks slot 1. The blank strip opens: WHEN [▾] → SEND [▾] ON [⌨].

He clicks the trigger dropdown. The radial menu fans out: signal_received, buffer_threshold, compress_completed, filter_completed, amplify_completed. He selects signal_received. Then payload: he picks compressed_intel. Channel: he types "tier-2" — a custom name he's inventing for the second hop of his relay chain. The "NEW" badge pings. Color auto-assigned: burnt orange.

**Minute 0:30 — A System of Custom Channels**
Derek fills all four Relay-Alpha hooks:
1. WHEN signal_received (from recon-net) → SEND compressed_intel ON tier-2
2. WHEN signal_received (from flank-net) → SEND compressed_intel ON tier-2
3. WHEN buffer_threshold → SEND alert ON relay-health
4. WHEN compress_completed → SEND compressed_intel ON priority-net

Four hooks, four different behaviors on one unit. The channel map panel now shows a web of colored lines: recon-net and flank-net feed INTO Relay-Alpha, tier-2 and priority-net flow OUT. Derek studies the topology. He's building a data center.

He right-clicks the suggestion icon — the faded "💡" link at the corner of the hooks section. It opens. He glances at the presets: "Compress & Forward," "Signal Amplifier," "Buffer Watchdog," "Noise Filter." He snorts. These are fine for beginners but his channel names are custom, his trigger filters are specific, and his payload routing is non-standard. The presets would have gotten him maybe 25% of the way. He closes the panel.

**Minute 1:15 — Relay-Beta, Differentiated**
Relay-Beta gets a completely different configuration:
1. WHEN signal_received (from tier-2) → SEND amplified_signal ON command-feed
2. WHEN signal_received (from priority-net) → SEND amplified_signal ON strike-order
3. WHEN buffer_threshold → SEND alert ON relay-health
4. WHEN silence_detected (on recon-net, 3 ticks) → SEND alert ON dead-scout

Relay-Beta is a second-tier amplifier that listens to Relay-Alpha's output. The "dead-scout" hook is Derek's invention — if nothing arrives on recon-net for 3 ticks, a Scout has been destroyed. This negative-space detection is not in any preset. Derek figured it out by reasoning about the absence of signal.

**Minute 2:00 — The Network Diagram**
Derek clicks the channel map panel to expand it. He sees:
- recon-net: 3 senders (Scouts), 1 listener (Relay-Alpha)
- flank-net: 1 sender (Specialist), 1 listener (Relay-Alpha)
- tier-2: 1 sender (Relay-Alpha), 1 listener (Relay-Beta)
- priority-net: 1 sender (Relay-Alpha), 1 listener (Relay-Beta)
- command-feed: 1 sender (Relay-Beta), 1 listener (Command)
- strike-order: 1 sender (Relay-Beta), 2 listeners (Strikers)
- relay-health: 2 senders (both Relays), 1 listener (Command)
- dead-scout: 1 sender (Relay-Beta), 1 listener (Command)

Eight channels, a tiered architecture. Scouts feed Relay-Alpha, Relay-Alpha compresses and feeds Relay-Beta, Relay-Beta amplifies and feeds Command and Strikers. Health monitoring runs on a parallel track. Derek has built a distributed system. None of this came from presets — but the presets taught him the grammar in missions 3-5 before he started improvising.

**Minute 2:30 — Resolution**
Derek hits EXECUTE with quiet confidence. During the sealed watch, he watches the cascade: Scout spots enemy (tick 2) → green flash to Relay-Alpha (tick 3) → Relay-Alpha compresses, amber flash to Relay-Beta (tick 4) → Relay-Beta amplifies, gold flash to Strikers and Command (tick 5) → Strikers converge on position, Command sends reassignment on command-net (tick 6). Six ticks from observation to coordinated response. The signal chain is visible as a branching lightning bolt of colored dashes racing across the board. Derek watches it with the satisfaction of a Factorio player watching a well-balanced production line hum.

**UI Annotations:**
- No suggestion panel (familiarity threshold passed): empty slot goes directly to blank hook strip on click
- "💡 Show suggestions" link: 12px text, 40% opacity, bottom-right corner of hooks section header, clickable but not prominent
- Channel map expanded view: 480px wide modal overlay, channel nodes as colored circles with directional arrows, unit icons at endpoints, subscriber counts on edges
- Custom channel naming: typing in the channel field has 0ms delay, autocomplete dropdown appears after 1 character, existing channels sort by most-recently-used

---

### Journey: Priya, 28, product manager, casual mobile gamer, first strategy game

**Context:** Mission 5 (Cebu, urban terrain). The factory was just introduced. Priya must now create blueprints from scratch for the first time — no pre-placed units. She has never configured a hook from an empty slot. Every previous hook was pre-wired by the mission setup. She's overwhelmed by the blueprint editor: skills, rules, hooks, context config, production queue. She starts with what she knows — skills and rules — and puts off hooks until she can't avoid them anymore.

**Minute 0:00 — Avoidance**
Priya has configured Scout-Alpha's skills (patrol, evade) and one rule (WHEN enemy_adjacent → evade). The hooks section sits below, two empty slots with their breathing dashed outlines. She scrolls past them. She configures the Striker's skills (engage, breach). She adds a rule (WHEN threat_in_context → move_toward). But there's nothing in the Striker's context. How does the Striker know where threats are? She reads the boot log excerpt in the Blueprint Codex: "Hooks broadcast signals on named channels. Units listening on those channels receive the data into their context window."

She scrolls back to the Scout's hooks. She has to do this.

**Minute 0:45 — The Suggestion Whisper Saves the Day**
She clicks the first empty hook slot on Scout-Alpha. The suggestion panel slides in. She sees:

- **"Scout Alert"** — WHEN enemy_spotted → SEND position ON recon-net — *"Report enemy positions to listeners"*
- **"Evasion Report"** — WHEN evade_triggered → SEND unit_id ON status-net — *"Warn the network when this scout dodges"*
- Build from scratch (dimmer strip at the bottom).

She reads "Scout Alert" three times. "Report enemy positions to listeners." She looks at the Striker's context config — yes, the Striker has a "Listen" toggle. If she creates this hook, the Striker will hear the Scout's reports. She clicks **[ Use This ]**.

The strip fills in. The chirp plays. She looks at the channel map: "recon-net" appears, with a line from Scout-Alpha. But no line TO the Striker yet — the Striker isn't listening to recon-net because the channel didn't exist when she configured the Striker. She panics briefly. Then she clicks the Striker's blueprint, scrolls to context config, and sees "recon-net" now listed in the channel list with a "Listen" toggle set to OFF. She toggles it ON. The channel map updates: a dashed line now runs from Scout-Alpha through recon-net to Striker. She exhales.

**Minute 1:30 — The Second Hook: Going Off-Script**
Back on Scout-Alpha, she clicks the second empty hook slot. The suggestion panel shows "Evasion Report" and "Silent Patrol" (Scout Alert is filtered out since she already used it). She reads both. Neither feels right — she wants the Scout to report when it enters a NEW area, not just when it dodges. She looks at "Silent Patrol": WHEN entered_zone → SEND position ON patrol-log. Close, but she doesn't want a separate channel for patrol data. She wants position updates on the same recon-net channel.

She clicks "build from scratch."

The blank strip opens. The trigger dropdown: she selects entered_zone. Payload: position. Channel: she starts typing "recon" — the autocomplete immediately shows "recon-net (1 sender, 1 listener)" with its color swatch. She clicks it. The background fills with recon-net's color. The strip reads: WHEN entered_zone → SEND position ON recon-net.

She just created a custom hook by modifying a preset's concept. She used the preset's vocabulary (she learned "entered_zone" and "position" from reading Silent Patrol's description) but applied it to her own channel topology. The preset was a dictionary, not an instruction manual.

**Minute 2:15 — Understanding Through Presets**
Priya configures the Relay's blueprint next. Four hook slots. The suggestion panel shows four cards — Compress & Forward, Signal Amplifier, Buffer Watchdog, Noise Filter. She reads all four. She picks "Compress & Forward" for slot 1 and "Buffer Watchdog" for slot 3. Slots 2 and 4 she leaves empty — she doesn't feel confident enough to use all four yet.

The channel map now shows: recon-net (Scout → Relay) → alert-net (Relay → Striker). A two-hop network. She didn't design this topology deliberately — the presets' suggested channel names created it. "Scout Alert" used recon-net. "Compress & Forward" listens on implicit input and sends on alert-net. The Striker is set to listen on alert-net. The pipeline emerged from preset defaults.

**Minute 3:00 — First Execute With Self-Built Network**
She hits EXECUTE. The sealed watch plays. Tick 4: Scout-Alpha spots an enemy. Green flash races along recon-net's dashed line to Relay. Tick 5: Relay compresses, teal flash on alert-net to Striker. Tick 6: Striker moves toward the compressed position data. IT WORKS. Priya's first self-wired information network is functioning. She pumps her fist.

The enemy Striker approaches from the east — a direction her Scout didn't cover. The Striker has no data about this threat. It walks into an ambush. Priya loses the Striker at tick 9. But she understands WHY: no Scout was watching that direction. The information architecture had a blind spot. She already knows what to fix: add a second Scout covering the east, or configure the existing Scout's patrol to sweep wider.

**Minute 4:00 — Resolution**
In the Inspector, Priya scrubs to tick 8. She clicks the Striker and sees its context window: only one entry, from recon-net, pointing west. No data about the east. The context window visualization makes the gap obvious — 7 empty slots, one lonely entry. She returns to Plan, adds a second Scout to the production queue, gives it the "Scout Alert" preset pointing to recon-net, and retries.

The presets got Priya from "I have no idea what hooks do" to "I understand information flow and can identify gaps in my network" in 4 minutes. She never needed to understand trigger types, payload options, or channel naming conventions from first principles — the presets demonstrated all three by example. But she's already gone off-script once (the entered_zone custom hook on recon-net), proving that presets don't lock her into a template.

**UI Annotations:**
- Suggestion panel persistence: stays open until player clicks a preset, clicks "build from scratch," or presses Escape
- Channel autocomplete in custom mode: dropdown appears after 1 character, shows channel color swatch + sender/listener count, 200ms appearance delay
- Empty slots after partial configuration: remaining empty slots show updated suggestions (filtering used channels/triggers), counter shows "1/4" with amber glow on unused count
- Context config listen toggle: when a new channel is created via hook preset, any blueprint not yet configured gets the channel added to its listen/ignore list with "LISTEN" as default OFF — the player must explicitly opt in

---

## Strengths and Weaknesses

### The Suggestion Whisper (Approach A)

| Strength | Why It Matters |
|----------|---------------|
| **Teaches grammar, not answers** | The player reads "WHEN enemy_spotted → SEND position ON recon-net" and learns the hook sentence structure. Even if they modify every field, they've seen the template. |
| **Zero commitment** | One click to accept, one click to dismiss. No modal, no separate screen, no workflow interruption. |
| **Contextual filtering** | Suggestions adapt to what's already configured — no duplicates, no redundant channels. The preset menu is a living suggestion, not a static list. |
| **Graceful fadeout** | The familiarity threshold means veterans never see presets unless they ask. No permanent training wheels. |

| Weakness | Why It Matters |
|----------|---------------|
| **Preset channel names become conventions** | If every Scout uses "recon-net" because the preset suggests it, the channel namespace homogenizes. Advanced players may avoid presets specifically to escape default naming. |
| **Cognitive load at mission 5** | The suggestion panel adds visual density to an already-busy blueprint editor. For Priya-type players, MORE information at the moment of confusion can increase overwhelm rather than reduce it. |
| **Hidden combos** | The suggestion panel on a single unit doesn't show how presets on different units interlock. The player must mentally model cross-unit channel wiring. |

### The Recipe Book (Approach B)

| Strength | Why It Matters |
|----------|---------------|
| **Cross-unit pairing visible** | The "Combos" section explicitly shows how hooks on different unit types work together. This is the teaching moment the Suggestion Whisper misses. |
| **Browsable reference** | The library is useful even when not configuring — players can open it to study hook patterns before entering the blueprint editor. |
| **Difficulty ratings** | Star ratings guide players toward age-appropriate complexity. Mission 3 players stick to 1-star presets. Mission 8 players explore 3-star patterns. |

| Weakness | Why It Matters |
|----------|---------------|
| **Cookbook risk** | A searchable library of templates invites "just copy the answer." If every mission has a template combo that works, the player optimizes for template-browsing rather than creative wiring. |
| **UI real estate** | A 320px slide-in panel competes with the blueprint editor, the board preview, and the channel map. On a 1366px-wide laptop screen, this is claustrophobic. |
| **Maintenance burden** | Every new hook trigger, payload, or game mechanic requires new templates. The library becomes stale if not updated alongside the game. |

### No Presets (Approach C)

| Strength | Why It Matters |
|----------|---------------|
| **Maximum "aha!" potential** | Every hook configuration is a discovery. The first time a player independently invents recon-net, they understand hooks deeply. |
| **No conventions** | Channel names are fully creative. Players develop personal naming conventions that reflect their thinking style. |
| **Simplest UI** | No suggestion panels, no recipe books, no fadeout thresholds. Just the hook strip. |

| Weakness | Why It Matters |
|----------|---------------|
| **Cold start wall** | The empty hook strip with three dropdowns and a text field is the most complex single interaction in the blueprint editor. Without ANY scaffolding, non-gamers will struggle. |
| **Slow onboarding** | Players must read the Blueprint Codex, remember the boot log, and reason from first principles. This adds minutes to the first hook configuration — minutes that feel frustrating, not educational. |

---

## Interaction Effects

### With the Rules UI (3.07)
Presets that suggest hook configurations implicitly suggest rule configurations too. A "Scout Alert" hook (WHEN enemy_spotted → SEND position ON recon-net) is only useful if the *listening* unit has a rule like "WHEN threat_in_context → move_toward." The question: should hook presets also suggest companion rules on other blueprints? This risks cascading into a full "blueprint wizard" that auto-configures everything. Recommendation: presets suggest hooks only. The "Combos" section in the Recipe Book (Approach B) can mention companion rules in text, but never auto-apply them.

### With the Channel Map Panel
Presets that use standard channel names (recon-net, alert-net, command-net) create predictable channel topologies. The channel map panel becomes a legibility tool: beginners using presets see clean, labeled networks. Veterans using custom names create dense, personal graphs. The channel map must handle both — a 3-channel preset network and a 12-channel custom network with equal visual clarity.

### With Context Config
Hook presets send signals on channels. But the receiving unit must have that channel set to "Listen" in context config. If presets auto-set Listen toggles on other blueprints, the system becomes too magical. If they don't, the player must manually enable listening — which is a learning moment ("oh, I need to TELL the Striker to listen on recon-net") but also a failure point ("why isn't my Striker responding? Oh, it's not listening"). Recommendation: when a preset creates a new channel, all existing blueprints get that channel added to their listen/ignore list with a default of LISTEN: ON for units with compatible roles (Strikers listen to alert-net, Command listens to everything) and LISTEN: OFF for others.

### With the Boot Log Tutorial
Presets are most powerful when the boot log has already demonstrated the concept. Mission 3's boot log should show a hook firing in the narrative: "Observation subroutine active. Enemy at E4. Broadcasting on channel recon-net... signal delivered." Then when the player opens the hook editor and sees "Scout Alert: WHEN enemy_spotted → SEND position ON recon-net," they recognize recon-net from the boot log. The preset is a callback to the tutorial, not a new concept. Presets without prior narrative grounding feel arbitrary.

### With EM Emissions
Every hook fires EM noise. Presets that fill all hook slots create loud units. Should presets include a "noise budget" indicator? A small EM icon on each preset card showing relative emission levels would teach players that more hooks = more detectable. The "Silent Patrol" Scout preset (entered_zone trigger, which fires less often than enemy_spotted) could show a lower EM indicator, teaching that trigger frequency affects detectability.

---

## Comparable Games

### Slay the Spire — Starter Deck as Template
Slay the Spire gives each character a starter deck (Strikes + Defends + one signature card). This IS the preset system. The starter deck teaches the character's identity through play, not through menus. By Act 2, most starter cards have been replaced. The preset was scaffolding — it got the player through Act 1 while they learned the game's vocabulary. Robot Uprising's hook presets should function the same way: get the player through missions 3-5, then fade as custom configurations replace them.

### Gladiabots — Behavior Templates
Gladiabots offers pre-built AI behavior trees that players can load and modify. New players start by watching templates in action, then tweaking individual nodes. The community shares templates. The risk: Gladiabots' community meta gravitates toward a few "optimal" templates, reducing creative diversity. Robot Uprising's mitigation: mission-specific constraints (terrain, enemy composition, resource budgets) that prevent any single template from being universally optimal.

### Factorio — Blueprint Library
Factorio's blueprint system lets players save and share factory designs. Beginners import community blueprints for smelting arrays and bus layouts. Veterans design from scratch. The blueprint library is the Recipe Book approach taken to its logical extreme — and it works because Factorio's problems are complex enough that no single blueprint solves everything. The player must still understand WHY the blueprint works to integrate it into their factory. Robot Uprising's hook presets should aspire to this: presets that work for the immediate problem but require understanding to extend.

### Into the Breach — No Templates
Into the Breach offers zero templates. Each mech has fixed abilities. The player places mechs and chooses actions each turn. There's no "suggested move." The game trusts that perfect information (you see exactly what enemies will do) is sufficient scaffolding. This works because Into the Breach's decision space is smaller per turn — you have 3 mechs, each with 2-3 actions, on an 8x8 grid. Robot Uprising's hook configuration is a design-time decision with many more degrees of freedom, making the "no templates" approach riskier.

---

## Sensory Description

**The Suggestion Whisper expanding:** The empty hook slot's dashed border solidifies into a thin line as the panel slides down (200ms ease-out). The background darkens by two shades — like a drawer opening in a workbench, revealing tools nested inside. Preset cards fade in sequentially (50ms stagger per card), each one sliding up 8px from its final position. The left border of each card is a 3px cyan stripe — the color of templates/suggestions throughout the UI, distinct from any channel color. The overall feeling is of the game gently offering options, not demanding a choice.

**Clicking [ Use This ]:** The preset card flashes white (50ms), then the entire suggestion panel slides up and disappears (200ms ease-in). The hook strip below fills in left-to-right — trigger token first (100ms), then payload token (100ms delay, 100ms fill), then channel name (100ms delay, 100ms fill). Each token's background shifts from gray to its active color. The channel name input's background floods with the channel's assigned color like ink spreading across paper. A warm electronic chirp sounds — two notes, ascending, like plugging in a patch cable. The total sequence takes about 600ms and leaves the player looking at a fully configured hook strip that they can immediately read as a sentence.

**The fadeout (familiarity threshold reached):** The next time the player opens an empty hook slot after crossing the threshold, the suggestion panel simply doesn't appear. No fanfare, no "you've graduated!" message. The blank strip opens directly. In the bottom-right corner of the hooks section header, a tiny "💡" icon fades in at 40% opacity — the emergency handle if the player wants suggestions back. It's the opposite of a training wheel being removed with ceremony: it's a training wheel that you stop noticing because you stopped needing it.

---

## The TikTok Clip

A 15-second clip: A player opens a Scout's empty hook slot. Two preset cards slide in. They click "Scout Alert" — the strip fills in with a satisfying chirp. Cut to: they open the Relay's hook slots, click "Compress & Forward" — another chirp. Cut to: the sealed watch. Scout spots enemy, green lightning bolt of signal races through the network — Scout to Relay to Striker — the Striker pivots and eliminates the enemy in one tick. Text overlay: "I didn't program the attack. I wired the information flow." The clip sells the fantasy: hook presets make the first network trivially easy to build, and watching it come alive in the sealed watch is the payoff. The preset is the on-ramp to the feeling the game is selling.

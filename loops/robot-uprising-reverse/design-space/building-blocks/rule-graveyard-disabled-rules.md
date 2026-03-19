# 3.07e — The "Rule Graveyard": Disabled but Preserved Rules

## Overview

Every rules panel design (3.07) assumes rules exist in two states: present and absent. But real configuration work demands a third: **disabled**. The programmer's comment-out. The circuit designer's bypass jumper. The musician's muted track. A rule that stays in place, holds its position in the priority order, remains visible — but does not fire.

This is about more than convenience. The ability to gray out a rule without deleting it transforms the rules panel from a **static specification** into a **living laboratory**. A/B testing becomes possible inside a single blueprint. The player can hold two competing theories about how a unit should behave and switch between them in seconds. The rule graveyard is where hypotheses go to sleep, not to die.

The locked spec gives us ordered condition-to-action pairs with drag-to-reorder priority. The Sentence Strip paradigm (3.07 Paradigm A) established the visual language: horizontal strips with WHEN/DO structure, drag handles, token slots. The rules panel at scale (3.07a) introduced "The Cartographer's Rack" with numbered slots and execution heat overlay. This analysis explores what happens when a strip can be **toggled off** — and what that toggling looks, sounds, and feels like.

---

## The Six Models

| Model | Toggle Mechanism | Visual Treatment | Graveyard Location | Comparable |
|-------|-----------------|------------------|--------------------|------------|
| **A. The Dimmer Switch** | Click-to-toggle inline | Opacity fade to 35%, desaturated | In-place (stays in priority order) | DAW track mute, IDE comment-out |
| **B. The Tombstone Row** | Drag to graveyard zone below active list | Collapsed 16px stubs in separate section | Below active rules, above [+ Add Rule] | Git stash, Photoshop hidden layers |
| **C. The Ghost Strip** | Right-click context menu toggle | Dashed border, strikethrough text, 50% opacity | In-place with skip marker | CSS `text-decoration: line-through`, spreadsheet strikethrough |
| **D. The Version Branch** | Named snapshots of entire rule sets | Full-opacity alternates in tabbed views | Separate named tabs per version | Git branches, DAW arrangement views |
| **E. The Comment Wrap** | Long-press to wrap in "disabled" container | Rule wrapped in gray annotation box with player-typed note | In-place, expanded with note field | Code block comments, Notion toggle blocks |
| **F. The Progressive Mute** | Evolves across campaign | Dimmer Switch M5 -> Comment Wrap M8 -> Version Branch M10 | Grows with player capability | Factorio progressive complexity |

---

## Model A: The Dimmer Switch

**Philosophy:** The simplest possible toggle. Every rule strip gains a small power icon to the left of the drag handle. One click: the rule dims. Another click: it revives. The rule never moves. Its priority position is preserved. It simply stops being evaluated during execution.

### Mechanical Specification

The existing Sentence Strip layout gains one element:

```
┌──────────────────────────────────────────────────────────────────┐
│ ◉ ≡ │ WHEN [enemy_spotted ▾] [within 3 ▾] → DO [engage ▾] [nearest ▾] │ ⓘ 🗑 │
└──────────────────────────────────────────────────────────────────┘
```

**◉** — The power toggle. 12x12px circle, filled cyan when active, hollow gray when disabled. Click to toggle. The toggle is the leftmost element, before the drag handle, because the first question about any rule is "is it on?"

When a rule is disabled:
- The entire strip fades to 35% opacity over 200ms (ease-out)
- Token colors desaturate — the amber WHEN accent becomes gray-amber, the cyan DO accent becomes gray-blue
- The strip background shifts from charcoal/slate alternation to a uniform dim gray (#1e1e28)
- The drag handle remains functional — disabled rules can still be reordered
- The rule counter updates: "4/8" becomes "3+1/8" — three active, one disabled, eight maximum. The "+1" renders in the same dim gray as the disabled strip
- A faint diagonal hatch pattern (45-degree lines, 1px wide, 8px spacing, 10% white opacity) overlays the strip — the visual language of "crossed out" without obscuring content

### What It Sounds Like

Disabling: a soft downward two-tone chime — "doo-dum" — like powering down a small device. The second note is one octave lower than the first, both from a muted bell patch. Duration: 180ms total.

Re-enabling: the inverse — "dum-doo" — ascending, brighter, same bell patch but with a slight shimmer reverb tail. The strip glows briefly at 120% brightness before settling to normal, a 300ms flash that says "I'm back."

### The Counter Display

The rules counter in the panel header becomes a first-class diagnostic:

```
RULES  3+1/8
       ^^^
       active + disabled / max
```

When all rules are active: "RULES 4/8" (normal display).
When some are disabled: "RULES 3+1/8" with the "+1" in muted gray text.
When ALL rules are disabled: "RULES 0+4/8" with the count in amber, pulsing gently — a warning that this blueprint has no active behavior.

### Interaction with Execution Heat Overlay (3.07a)

The Cartographer's Rack execution heat overlay (bright = frequently fired, dim = rarely fired, red outline = never fired) interacts naturally with disabled rules. Disabled rules get a **distinct treatment**: not red-outlined (which implies "active but useless") but rendered with the same diagonal hatch pattern they had in the workbench. The message is clear: "this rule didn't fire because you told it not to" vs. "this rule didn't fire and you didn't know why."

### Interaction with Inspector

In the Inspector's decision trace, disabled rules appear in the rule evaluation waterfall as gray entries with a "DISABLED" badge. The trace shows: "Rule 3: [DISABLED — skipped]" in muted text. This is pedagogically critical — the player can see exactly where in the priority cascade the disabled rule would have evaluated, and imagine whether enabling it would have changed the outcome.

---

## Model B: The Tombstone Row

**Philosophy:** Disabled rules should be visually separated from active rules to prevent confusion during rapid iteration. Below the active rule list, a "graveyard" section collects disabled rules as compressed stubs.

### Mechanical Specification

The rules panel splits into two zones:

```
RULES  3/8
┌──────────────────────┐
│ ≡ WHEN enemy → engage │  ← Active strip, full height
│ ≡ WHEN ally → evade   │
│ ≡ WHEN buffer → compress│
└──────────────────────┘
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  ← Dashed separator line, labeled "graveyard"
┌──────────────────────┐
│ ░ threat → flee (disabled) │  ← Collapsed 16px stub
└──────────────────────┘
[+ Add Rule]
```

Dragging a rule downward past the dashed separator disables it. The strip compresses from 40px to 16px — a smooth 300ms shrink animation. The text truncates to a one-line summary. Dragging it back up re-enables it. The player chooses where in the active list to drop it.

**Weakness:** Priority information is lost when a rule enters the graveyard. A rule that was priority 2 becomes an undifferentiated stub. When dragged back, where does it go? The player must remember or guess. This is acceptable for 4-rule blueprints but catastrophic for 15-rule Command units.

**Strength:** Absolute visual clarity. Active rules are active. Graveyard rules are graveyard. No squinting at opacity levels. The separation is spatial, not chromatic — works perfectly for colorblind players.

---

## Model C: The Ghost Strip

**Philosophy:** A disabled rule should haunt its position. It stays exactly where it was, at exactly the priority it held, but rendered as a ghost — dashed borders, strikethrough text, spectral opacity. The rule is a visible absence.

### Visual Treatment

```
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
│ ◉ ≡ │ W̶H̶E̶N̶ ̶[̶t̶h̶r̶e̶a̶t̶_̶d̶e̶t̶e̶c̶t̶e̶d̶]̶ ̶→̶ ̶D̶O̶ ̶[̶f̶l̶e̶e̶]̶              │ ⓘ 🗑 │
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

The solid border becomes dashed. The text gets a single horizontal strikethrough line rendered as an SVG overlay (not actual font strikethrough — too thin). The strip sits at 50% opacity. The priority number on the left (from The Rack) shows in parentheses: "(3)" instead of "3" — mathematical notation for "this slot is occupied but not active."

**Strength:** Strongest priority preservation. The ghost sits in its slot. When re-enabled, it fires at exactly the priority it always had. No ambiguity.

**Weakness:** At 15+ rules, the visual noise of ghost strips interspersed with active strips can create a cluttered, hard-to-scan panel. The Cartographer's Rack minimap would need to distinguish active and ghost strips at 4px height — possible with solid vs. dashed rendering but demanding.

---

## Model D: The Version Branch

**Philosophy:** Instead of disabling individual rules, the player saves the entire rule set as a named version and creates a new one. The "A/B testing" metaphor is literal — Version A and Version B exist simultaneously, and the player picks which to deploy.

### Mechanical Specification

The rules panel header gains a version selector:

```
RULES  v2: "aggressive" ▾  [+ new version]  [diff]
```

Clicking the dropdown shows:
- v1: "cautious" (3 rules)
- v2: "aggressive" (5 rules) ← current
- v3: "experimental" (4 rules)

Switching versions swaps the entire rule list with a horizontal slide animation — the old rules slide left and off-screen, the new rules slide in from the right, 250ms. The version name is player-editable (double-click to rename).

The **[diff]** button opens a split view showing two versions side-by-side with additions highlighted in green and removals in red. This directly maps to git diff — the player is learning version control vocabulary without knowing it.

**Strength:** Maximum power. Complete A/B testing with full context. The version branch model teaches transferable version control skills — naming, comparing, switching, merging.

**Weakness:** Heaviest cognitive load. The player must now manage versions AND rules. Overkill for "I want to try this rule on vs. off." Version management is a late-game power tool, not a tutorial affordance.

---

## Model E: The Comment Wrap

**Philosophy:** A disabled rule is a note to your future self. Wrapping it in a comment block with an annotation turns the graveyard into a design journal.

### Visual Treatment

```
┌─ DISABLED ──────────────────────────────────────────────────────┐
│ "trying without flee to see if scouts survive longer"            │
│ ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐ │
│ │ WHEN [threat_detected] → DO [flee]                           │ │
│ └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘ │
└─────────────────────────────────────────────────────────────────┘
```

The comment field is a single-line text input (expandable to 3 lines) with placeholder text: "why is this disabled?" The entire block has a gray background with a subtle paper-texture — like a sticky note attached to the strip.

**Strength:** Captures intent. Three sessions later, the player knows WHY they disabled this rule. This is the only model that preserves reasoning, not just state.

**Weakness:** Vertical space cost. A commented rule takes 60-80px instead of 40px. On a Command unit with 15 rules and 5 disabled, the panel becomes unwieldy. Also, typing a comment interrupts the flow of rapid iteration — the player may just skip the note, defeating the purpose.

---

## Model F: The Progressive Mute (Recommended)

**Philosophy:** The graveyard evolves with the player. Early missions offer a simple toggle. Later missions unlock annotation, versioning, and A/B comparison. The player never encounters complexity they don't need yet.

### Campaign Progression

| Mission | Graveyard Feature | Unlock Trigger | Boot Log Ceremony |
|---------|-------------------|----------------|-------------------|
| M5 | **Dimmer Switch** (Model A) — simple toggle, no annotation | Factory introduction — more rules = first impulse to experiment | "BEHAVIORAL MODULE STATUS TRACKING: enabled. Units may now retain inactive directives for rapid reconfiguration." |
| M7 | **Comment Wrap** (Model E) — annotation field on disabled rules | Command agent introduction — complex configs need notes | "CONFIGURATION ANNOTATION LAYER: enabled. Inactive directives now accept operator commentary." |
| M9 | **Version Branch** (Model D) — full A/B comparison with diff view | Full system missions — optimization demands comparison | "VERSION CONTROL SUBSYSTEM: enabled. Multiple directive configurations may coexist. Operator selects active configuration at deployment." |

### Why Progressive

Mission 5 is the factory inflection point. The player has been hand-placing units for 4 missions. Now they design blueprints that the factory will produce repeatedly. The impulse to experiment — "what if this rule was different?" — arrives naturally. A simple toggle meets the need without adding cognitive load during an already-complex transition.

By Mission 7, the player manages Command units with 12+ rules. Disabling rules without notes leads to confusion: "why did I turn this off?" The comment wrap arrives just as the need for documentation emerges.

By Mission 9, the player optimizes against factory-vs-factory endgame scenarios. A/B testing entire rule configurations — "cautious relay" vs. "aggressive relay" — is the natural workflow. Version branches arrive for the player who has already internalized the simpler tools.

---

## Player Journeys

### Journey: Sofia, 15, First-Timer

**Context:** Mission 5, first factory mission. Sofia has completed the four hand-placement tutorial missions. She has one Scout blueprint and one Striker blueprint. She is building her first Relay blueprint and has configured 4 rules.

**Minute 0:00 — The Experimental Impulse**
Sofia's relay has a rule at priority 2: "WHEN buffer_full → DO compress." She just watched her relay spend every other tick compressing instead of forwarding signals. She wants to try removing it but doesn't want to lose the rule — she remembers how long it took to get the token selections right.

The rules panel shows four strips. Each has the ◉ power toggle to the left of the drag handle — a small filled cyan circle. Sofia hasn't noticed it yet. She hovers over the delete icon (trash can) on rule 2 and hesitates. Her cursor drifts left across the strip.

**Minute 0:15 — Discovery**
Sofia's cursor passes over the ◉ icon. A tooltip fades in after 300ms: "Toggle rule on/off. Disabled rules are preserved but skipped during execution." She clicks.

The strip exhales. Over 200ms, the opacity drops to 35%. The cyan WHEN accent line desaturates to gray. The diagonal hatch pattern fades in — faint crosshatching like a pencil sketch over a finalized drawing. The downward two-tone chime plays: "doo-dum." The counter in the header animates: "4/8" rolls to "3+1/8", with the "+1" in muted gray.

Sofia grins. The rule is still there. She can see it. She can read it. But it's sleeping.

**Minute 0:30 — The A/B Test**
She hits EXECUTE. The sealed watch plays out. Her relay forwards faster without the constant compression — but by tick 18, the relay's context bar climbs from cool blue through amber to angry red. At tick 20: OVERLOAD. The relay jitters and sparks, stunned for one tick. A striker that was waiting for a forwarded signal gets no data and walks into an ambush.

**Minute 1:45 — The Debrief Revelation**
In the Inspector, Sofia clicks her relay. The decision trace shows ticks 1-20. At every tick, the waterfall includes: "Rule 2: [DISABLED — skipped]" in gray text with the hatch pattern. She scrubs to tick 18. The context window chart shows the buffer climbing. She thinks: "If rule 2 had been on, it would have compressed at tick 14 when the buffer hit 75%..."

She clicks "Return to Workbench." Her cursor goes straight to the ◉ on rule 2. Click. "Dum-doo" — the ascending chime. The strip brightens. The hatch pattern dissolves. "3+1/8" rolls back to "4/8."

**Minute 2:15 — The Refinement**
But now she doesn't just re-enable blindly. She edits rule 2: changes the condition from "buffer_full" to "buffer > 75%." The compress will trigger earlier, before overload. She hit EXECUTE again. This time the relay compresses once at tick 14 and the buffer never reaches red. The striker gets its signal. Mission clears.

**UI Annotations:**
- **◉ Power toggle**: 12x12px, leftmost element on strip, filled cyan (active) / hollow gray (disabled), 200ms transition
- **Disabled strip**: 35% opacity, desaturated accents, diagonal hatch overlay, drag handle still functional
- **Counter**: "3+1/8" format, "+1" in muted gray, animates on toggle
- **Inspector trace**: "DISABLED — skipped" gray badge in waterfall at disabled rule's priority slot

---

### Journey: Dr. Amara, 38, ML Researcher

**Context:** Mission 8, optimizing a 5-unit architecture against an enemy noise-flooding strategy. She has a Command unit with 14 rules. She has been iterating on this mission for 40 minutes across 6 executions.

**Minute 0:00 — The Hypothesis Board**
Dr. Amara's Command unit rules panel is dense: 14 strips in The Cartographer's Rack, with the minimap sidebar showing a compressed overview. She has a theory: rules 8, 9, and 10 — which handle relay rerouting during noise floods — might be interfering with each other. She wants to test them individually.

She clicks the ◉ on rules 9 and 10. Two downward chimes play in quick succession — "doo-dum, doo-dum" — the second slightly lower in pitch to indicate stacking. Both strips fade to 35%. The counter changes: "14/20" becomes "12+2/20." In the minimap sidebar, the two disabled rules render as hatched lines — thin diagonal stripes instead of solid bars — instantly distinguishable at the 4px minimap scale.

**Minute 0:20 — Controlled Experiment**
She executes. The sealed watch reveals: without rules 9 and 10, her relays don't reroute during the noise flood, and the enemy noise overwhelms her forward relay at tick 22. Overload. One tick stun. The scout behind it gets flanked.

Back in the workbench, she re-enables rule 9 (ascending chime) and leaves rule 10 disabled. Executes again. This time the relay reroutes once during the flood (rule 9 fires at tick 19) but doesn't do the secondary reroute (rule 10 would have fired at tick 23). The relay survives. The architecture holds.

**Minute 1:30 — The Diagnosis**
Dr. Amara now knows: rule 10 was the problem. It rerouted the relay a second time, pulling it off the channel the striker was listening to. She opens the Comment Wrap (unlocked at Mission 7). She long-presses on disabled rule 10. The strip expands: a gray annotation box wraps the rule, with a single-line text field and placeholder text "why is this disabled?" She types: "conflicts with striker channel listen — double reroute breaks signal chain."

The wrapped rule now takes 64px instead of 40px. The annotation text renders in a monospace font matching the boot log aesthetic — 11px, gray-300 on gray-800 background. A small timestamp appears: "disabled T+42:15."

**Minute 2:00 — The Archive**
She right-clicks rule 10 and selects "Move to end" — she wants the disabled rule out of the hot zone of her active rerouting logic but still visible. The strip animates downward, sliding past active rules 11-14. It settles at position 15 (below the last active rule but still in the numbered list, not in a separate graveyard). The priority number shows "(15)" in parentheses.

She executes twice more, tweaking rule 9's condition. Both runs succeed. She labels this configuration by opening the version panel (she's on Mission 8, one mission before version branches unlock, but the comment wraps serve as proto-documentation). She adds a comment to rule 9: "primary reroute — fires once per flood event, sufficient."

**UI Annotations:**
- **Stacked disable chimes**: Second chime pitched slightly lower, 50ms delay between
- **Minimap disabled rendering**: Hatched diagonal lines at 4px height, distinguishable from solid active bars
- **Comment Wrap**: Gray annotation box, monospace text field, timestamp, 64px total height
- **Parenthesized priority**: "(15)" for disabled rules — still numbered, but notation signals inactive

---

### Journey: Kwame, 28, Twitch Streamer

**Context:** Mission 10 (final mission), Taal volcano map. Kwame is streaming to 340 viewers. He has been working on his factory-vs-factory endgame architecture for 25 minutes. He has 3 blueprint types, each with 8-15 rules. He has unlocked the Version Branch system at Mission 9.

**Minute 0:00 — The Stream Experiment**
Chat is divided. Half want an aggressive striker configuration ("rush meta") and half want a defensive relay-heavy build ("turtle meta"). Kwame grins at the camera. "Alright, alright. We're doing both. We're doing SCIENCE."

He opens his Striker blueprint. The rules panel header shows: "RULES v1: 'balanced' ▾ [+ new version] [diff]." He clicks [+ new version]. A new tab slides in from the right: "v2: untitled." The rule list is a copy of v1. He double-clicks "untitled" and types "chat rush" — the name renders in the same amber accent as the rules WHEN keywords.

He starts modifying v2: disabling the two defensive rules (flee-on-outnumber, evade-near-base) with quick ◉ clicks. Two descending chimes. Chat explodes with emotes. He adds a new rule: "WHEN enemy_spotted → DO engage immediately." The version now reads "RULES v2: 'chat rush' 6+2/8."

**Minute 0:45 — The Diff View**
Kwame clicks [diff]. The panel splits horizontally: v1 "balanced" on the left, v2 "chat rush" on the right. Rules unique to v1 glow soft green on the left. Rules unique to v2 glow soft green on the right. The two disabled rules in v2 show with the familiar hatch pattern plus a red minus icon — "present in both but disabled in v2." Shared active rules have no highlight.

The diff view border pulses gently in amber — the "comparison mode" visual state. A label at the top reads: "v1: 8 active / v2: 6 active, 2 disabled."

Chat reads the diff on stream. "BRO THE FLEE RULE IS OFF" "this is gonna be a DISASTER" "DO IT"

**Minute 1:15 — Deploy and Watch**
Kwame switches to v2 ("chat rush") and hits EXECUTE. The sealed watch is chaos. His strikers charge forward without retreat logic. Two get eliminated by tick 15 — one-shot kills, red combat flashes, shattered sprite animations. But the aggressive posture means his surviving strikers reach the enemy relay network by tick 20 and start dismantling it. The enemy factory, cut off from scouting data, produces units blind.

By tick 35, Kwame's factory has outproduced the crippled enemy. His replacement strikers (still running "chat rush") swarm the enemy base. Victory at tick 42. Chat erupts.

**Minute 2:30 — The Post-Mortem**
In the Inspector, Kwame opens the Striker decision trace. He scrolls to the two units that died at tick 15. The trace shows: "Rule 3: [DISABLED — skipped] (flee_on_outnumber)." He hovers over it. A counterfactual tooltip appears: "If enabled, this rule would have matched at tick 14. Unit would have fled to D4."

"See chat? If I'd left the flee rule on, this guy lives. But then he doesn't reach the relay network at tick 20. The rush works BECAUSE he dies." He switches to v1 in the version dropdown — the Inspector re-simulates with the balanced config. The striker survives but the enemy relay network stays intact through tick 30. Victory at tick 58 instead of 42.

"Sixteen ticks faster with the rush. The disabled rules aren't just off — they're the sacrifice that makes the strategy work." He clips it.

**UI Annotations:**
- **Version selector**: Dropdown in panel header, version names in amber, [+ new version] and [diff] buttons
- **Diff view**: Horizontal split, green highlights for unique rules, hatch+red-minus for disabled-in-one-version
- **Version switching in Inspector**: Re-simulates with alternate config, comparison mode shows tick-difference
- **Counterfactual tooltip on disabled rules**: "If enabled, would have matched at tick N" with predicted action

---

## Strengths and Weaknesses

### Strengths

**Experimentation velocity.** The toggle takes one click. Delete-then-recreate takes 30-60 seconds of token selection. The ratio is roughly 50:1 in interaction cost. This velocity transforms iteration from "I'll try removing this rule next time" to "let me toggle it right now and see."

**Priority preservation.** Models A and C keep disabled rules in their priority slot. This is critical for debugging. A rule's behavior depends on its position — rule 5 fires differently than rule 2 with the same condition, because rules 2-4 may have already matched. Preserving position preserves diagnostic value.

**Teaching version control.** The progressive unlock from toggle (commit) to comment (commit message) to version branch (branching) mirrors the git learning curve. Players internalize version control concepts through gameplay before encountering them in professional tools.

**Inspector integration.** Showing "DISABLED — skipped" in the decision trace teaches a meta-lesson: the absence of a rule is itself a design decision. The player learns to think about what their configuration does NOT do as deliberately as what it does.

### Weaknesses

**Visual clutter at scale.** A Command unit with 20 rule slots and 7 disabled rules creates a noisy panel. Even at 35% opacity, 7 hatched strips interspersed with 13 active strips demand more scanning than 13 clean strips. The Tombstone Row (Model B) addresses this at the cost of priority preservation.

**Decision paralysis.** With no penalty for keeping disabled rules, players may accumulate 10+ disabled rules they never clean up. The panel becomes a digital hoarder's closet. Mitigation: a gentle prompt after 5+ disabled rules — "You have 7 sleeping rules. Archive to Codex?" — moving them to the Blueprint Codex (locked spec) as historical records while freeing panel space.

**A/B testing as crutch.** The ability to toggle freely might reduce commitment to understanding WHY a rule works. The player toggles until something succeeds without building a mental model. Mitigation: the Comment Wrap forces (or at least invites) articulation of reasoning, and the Inspector's decision trace provides the diagnostic depth that pure toggle-testing lacks.

**Version branch complexity ceiling.** At 3+ versions with 15+ rules each, the diff view becomes its own cognitive challenge. Managing versions of versions is the same complexity cliff that real software teams face. This is either a feature (teaching real skills) or a bug (overwhelming a game UI), depending on the player.

---

## Interaction Effects

**Rules copy-paste (3.07b).** Disabled rules can be copied between blueprints. When pasting a disabled rule into a new blueprint, it arrives disabled — the Comment Wrap annotation travels with it, explaining why it was off in the source. This enables "template rules" — rules that are included in a blueprint as documentation of what NOT to do: "this rule is here as a reminder that flee conflicts with aggressive striker routing."

**Execution heat overlay (3.07a).** The overlay must distinguish three states: frequently-fired (bright), rarely-fired (dim), never-fired-but-active (red outline), and disabled (hatched). Four visual states at minimap scale is demanding. The recommended rendering: bright/dim as luminance, red outline as color, hatched as pattern — three orthogonal visual channels.

**Context config (3.12).** Disabled rules that reference channel messages still appear in the channel map panel's auto-generated summary, but grayed out. This tells the player: "your architecture once used this channel for this rule, but doesn't anymore." The ghost of a channel dependency is valuable routing documentation.

**Boot log narrative (locked).** Each unlock tier gets a boot log ceremony. The diegetic framing — "BEHAVIORAL MODULE STATUS TRACKING: enabled" — reinforces the AI-reading-its-own-spec-sheet feeling. The player isn't toggling a game UI element; the AI subsystem is gaining the ability to retain inactive directives.

**Inspector counterfactual (4.20).** The Minimum Fix Explorer naturally interacts with disabled rules. When searching for the minimum change that flips an outcome, re-enabling a disabled rule is a candidate fix. The Explorer should surface: "Enabling disabled rule 'flee_on_outnumber' at priority 3 would have saved STRIKER-2 at tick 14." This closes the loop between experimentation and verification.

---

## Comparable Games

**Digital Audio Workstations (Ableton, FL Studio).** The track mute button is the direct ancestor of Model A. Musicians mute tracks to isolate sounds, test mixes, and A/B arrangements. The mute is non-destructive, instant, and preserves the track's position in the arrangement. The "solo" button (hear ONLY this track) has no direct analog in rules — but "solo-fire" (execute ONLY this rule for one tick to see what it does) could be a diagnostic tool.

**IDE comment-out (VS Code, IntelliJ).** Ctrl+/ to comment a line of code is the programmer's disable toggle. The commented code stays visible, grayed out, preserving context. Robot Uprising's rule graveyard is the visual-programming equivalent. The key difference: in code, commented lines have no runtime cost. In Robot Uprising, disabled rules have no execution cost but still consume a rule slot — or do they? This is a design choice. If disabled rules don't count against the slot limit, players will "park" rules in disabled state to circumvent constraints. If they do count, the graveyard has a real cost.

**Factorio blueprint library.** Factorio players save entire factory blueprints as named configurations, then swap between them. The Version Branch (Model D) is this pattern applied to rule sets. Factorio's blueprint string — a shareable text encoding of a configuration — maps to Robot Uprising's config codes (7.03e). A version branch could have its own shareable code.

**Photoshop layer visibility.** The eye icon on each layer is exactly Model A's ◉ toggle. Layers can be hidden without deleting, reordered while hidden, and revealed instantly. Photoshop's layer groups map to rule groups (potential future feature). The mental model transfers directly: "layers of behavior" where each layer can be toggled.

**Git stash.** `git stash` temporarily shelves uncommitted changes. The Tombstone Row (Model B) is a visual stash — rules moved to a holding area, retrievable but out of the active workspace. Git stash's weakness (forgetting what you stashed) is addressed by Model E's Comment Wrap.

---

## Sensory Description

**The disable moment.** Click the ◉. A 200ms exhale: the strip's colors drain like watercolor left in the rain. The cyan power dot hollows out — the fill recedes inward to the center point and vanishes, leaving a gray ring. The diagonal hatch pattern materializes over the strip like a pencil gently scratching crosshatch lines, rendered at 10% white opacity. The descending chime — two soft bell tones, the second one whole step lower — plays at 40% volume, intimate, not alarming. The strip settles into its dimmed state. It's still there. It's just resting.

**The re-enable moment.** Click again. The inverse: 300ms inhale. Color floods back from the left edge, the cyan fill expands outward from the center of the power dot like an iris opening. The hatch pattern dissolves. The ascending chime — same bell timbre but brighter, with a 200ms shimmer reverb tail — announces the return. The strip flashes to 120% brightness for 150ms, then settles to 100%. Welcome back.

**The version switch.** Click the version dropdown. Select a different version. The entire rule list slides left in 250ms while the new version slides in from the right — a horizontal page turn. The version name in the header crossfades. If any rules differ between versions, they flash once with a gold border on arrival — "these are the ones that changed." The audio: a soft mechanical click, like rotating a dial to a new position. A rotary selector. The player is tuning a dial on the AI's behavior.

**The diff view.** The panel splits with a subtle paper-tearing sound — a 100ms textured rip, not literal, more like the rustle of separating two sheets. The two versions sit side by side. Unique rules glow with soft green edge accents. Disabled-in-one rules show their familiar hatch pattern plus a small red minus badge. The divider between the two versions pulses gently in amber at 0.5Hz — the heartbeat of comparison mode. The player's eyes scan left-right, left-right, comparing. The rhythm of the pulse matches comfortable reading saccade speed.

---

## The TikTok Clip

Split-screen: left shows the workbench with two rules being toggled off (descending chimes, strips fading). Right shows the sealed watch playing out — the aggressive units charging forward without retreat logic, two dying in red combat flashes, but the survivors reaching the enemy base. Cut to the Inspector showing the disabled rule with "DISABLED — skipped" and the counterfactual tooltip: "If enabled, would have fled. Would have survived. Would have lost." The player's face in the corner: realization that disabling a rule was the winning move. Text overlay: "THE RULE I TURNED OFF WON THE GAME." The graveyard isn't where bad rules go to die. It's where good rules go to make room for better strategies.

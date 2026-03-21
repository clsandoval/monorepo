# 3.08a — Trigger-to-Rule Vocabulary Alignment

## Overview

Robot Uprising has two systems that evaluate conditions: **rules** (ordered condition→action pairs that fire every tick) and **hook triggers** (reactive events that cause a signal to broadcast on a channel). Both answer the question "when should something happen?" — but they answer it in different contexts. Rules govern a single unit's per-tick decision: "given what I know, what should I do?" Hook triggers govern inter-agent communication: "when something happens to me, what should I tell others?"

The design question is whether these two systems should share the same condition vocabulary — the same `TEST` primitives, the same comparisons, the same syntax — or whether they should use distinct languages optimized for their different roles.

This is not an abstract question. It determines:

- **Learning cost:** Does the player learn one condition system or two? If hooks use `ON_SPOT_ENEMY` but rules use `TEST buffer_has ENEMY_SPOTTED`, the player must internalize two naming conventions, two mental models, two sets of icons.
- **Transferability:** Can the player take a condition they wrote in a rule and paste it into a hook trigger? Can understanding one system bootstrap understanding of the other?
- **Design evolution:** If triggers and rules share vocabulary, changing one changes both. If they're independent, each can evolve to serve its unique constraints without breaking the other.
- **Expressive ceiling:** Hook triggers currently fire on events (something happened). Rule conditions currently test state (something is true). These are philosophically different — event-driven vs. state-driven. Sharing vocabulary might blur a distinction that's educationally valuable.
- **UI consistency:** The workbench already has three visual languages — toggle chips for skills, sentence strips for rules, plug-and-socket strips for hooks. Adding a shared condition picker unifies the cognitive model; keeping them separate deepens the visual differentiation.

This document explores three approaches: full shared vocabulary, fully distinct vocabularies, and a hybrid that shares primitives but allows each system its own extensions.

---

## The Current Landscape

From existing analyses (3.05, 3.05a, 3.08, 3.11), the two systems currently look like this:

### Rules Conditions (from 3.05, 3.05a)

Rules use a **TEST → prefix** model inspired by Shenzhen I/O and ARM predicated execution:

```
TEST buffer_has ENEMY_SPOTTED
+ MOVE_TOWARD nearest_enemy
− PATROL
```

The condition vocabulary includes:
- `buffer_has [signal_type]` — is this signal in my context window?
- `signal_age [signal_type] < N` — how old is the freshest signal of this type?
- `buffer_count [signal_type] >= N` — how many signals of this type?
- `buffer_full` — is the context window at capacity?
- `nearest_enemy_distance < N` — spatial proximity test
- `tagged [target]` — is a specific target tagged?

These are **state queries** — they ask "what is true right now in my context window or on the board?"

### Hook Triggers (from 3.08)

Hooks use an **event model** — they fire when something happens:

```
WHEN [enemy_spotted] → SEND [position] ON [recon-net]
```

The trigger vocabulary includes:
- `ON_SPOT_ENEMY` — perception detects an enemy
- `ON_THREAT_ENTER` — enemy enters perception radius
- `ON_THREAT_EXIT` — enemy leaves perception radius
- `ON_RECEIVE_SIGNAL` — signal arrives in context window
- `ON_BUFFER_FULL` — context window reaches capacity
- `ON_EVADE` — evade skill fires
- `ON_ENGAGE` — unit eliminates an enemy
- `ON_COMPRESS` — relay completes compression
- `ON_IDLE` — unit has no action this tick

These are **event detections** — they ask "did something just happen?"

### The Philosophical Gap

The gap between "what is true" and "what just happened" is real and meaningful in software engineering. State-based systems poll; event-based systems react. In real agentic architectures, these are often different codepaths — a cron job checking database state vs. a webhook firing on a write event. Robot Uprising could teach this distinction explicitly, or it could abstract it away.

---

## Approach A: The Shared Dictionary — One Vocabulary, Two Contexts

**Philosophy:** Rules and hooks draw from the same pool of condition primitives. A condition like `buffer_has ENEMY_SPOTTED` works identically in both systems. The only difference is what happens when the condition is true — in a rule, it gates an action; in a hook, it gates a broadcast.

### Mechanical Specification

The game has a single **Condition Catalog** of ~15 primitives. Both the rule editor and the hook editor access the same catalog via the same radial menu UI. The radial menu appears when the player clicks the condition zone of either a rule strip or a hook strip.

In a **rule strip**, the condition gates an action:
```
┌────────────────────────────────────────────────────┐
│ ≡ │ IF [buffer_has ENEMY_SPOTTED] → DO [ENGAGE]    │
└────────────────────────────────────────────────────┘
```

In a **hook strip**, the same condition gates a broadcast:
```
┌──────────────────────────────────────────────────────────────┐
│ ⚡ │ IF [buffer_has ENEMY_SPOTTED] → SEND [position] ON [recon-net] │
└──────────────────────────────────────────────────────────────┘
```

The condition token is identical — same icon, same color, same tooltip. The player learns `buffer_has ENEMY_SPOTTED` once and uses it everywhere.

**Event-to-state translation:** The current event-based triggers (`ON_SPOT_ENEMY`) are rewritten as state tests evaluated every tick. `ON_SPOT_ENEMY` becomes `buffer_has_new ENEMY_SPOTTED` — "is there an ENEMY_SPOTTED signal that arrived this tick?" The event semantics are preserved through a `_new` qualifier, but the underlying primitive is still a state query.

### What It Looks Like

The workbench panel has two sections — RULES and HOOKS — both using horizontal strips. Both strips start with a condition token zone. When the player clicks either zone, the same radial menu appears: a semicircular fan of condition icons, each with a one-word label. The icons are identical in both contexts. The only visual difference is the strip's left icon (≡ for rules, ⚡ for hooks) and the right half (action vs. channel+payload).

The condition tokens are draggable between strips. A player could drag the `buffer_has ENEMY_SPOTTED` token from a rule into a hook's condition zone, and it would work. The cursor shows a green checkmark during the drag — "this is compatible."

### Strengths

- **One learning curve.** The player masters 15 condition primitives and can use them in both rules and hooks. The cognitive overhead drops dramatically. Instead of learning "rules work this way" and "hooks work that way," the player learns "conditions work this way" and applies that knowledge everywhere.
- **Cross-pollination.** A player who discovers `signal_age < 3` as a rule condition immediately realizes they can use it as a hook trigger — "only broadcast fresh signals." This creates "aha" moments that feel earned.
- **Consistent UI.** The radial menu appears in both contexts, reinforcing muscle memory. The player's hands learn one interaction pattern.
- **Reduced token count.** The Blueprint Codex has one "Conditions" section instead of separate "Rule Conditions" and "Hook Triggers" sections. Fewer concepts to catalog.

### Weaknesses

- **Event semantics are awkward.** "When an enemy enters my perception radius" is a natural event. Rewriting it as "when my context window newly contains an ENEMY_SPOTTED signal" is technically equivalent but cognitively tortured. The player has to think in state-change-detection rather than events, which is counterintuitive for reactive wiring.
- **Polling overhead.** If hooks evaluate the same state-based conditions every tick (like rules), hooks lose their reactive fire-and-forget character. They become "rules that broadcast instead of act" — which collapses the conceptual distinction between the two primitives. If there's no meaningful difference between a rule and a hook, why have both?
- **Evolutionary coupling.** Adding a new condition primitive (say, `ally_count_in_radius >= N`) forces the designer to ensure it makes sense in both rule and hook contexts. Some conditions are natural for rules but bizarre for hooks. "IF ally count in radius >= 3, THEN move toward" makes sense. "IF ally count in radius >= 3, THEN broadcast on channel" is valid but rarely useful — leading to UI clutter.
- **Misses a teaching opportunity.** The distinction between "check state" (polling) and "react to event" (event-driven) is one of the most important patterns in real software engineering. Collapsing the distinction into one vocabulary teaches the player that everything is state-checking, which is a less powerful mental model.

### The TikTok Clip

A player drags a condition token from a rule strip into a hook strip. The token slides across the panel, snaps into place with a magnetic click, and the channel color pulses — the hook is now using the same logic as the rule. The player grins: "Wait, I can just reuse conditions?" 15 seconds. The message: this game respects your intelligence. Learn once, use everywhere.

---

## Approach B: The Dual Dictionary — Separate Vocabularies for Separate Worlds

**Philosophy:** Rules and hooks are fundamentally different primitives serving different roles, and their condition languages should reflect that difference. Rules test state. Hooks detect events. The vocabularies are deliberately distinct in naming, iconography, and semantics.

### Mechanical Specification

**Rule conditions** use the TEST/prefix model from 3.05a:
```
TEST buffer_has ENEMY_SPOTTED
+ ENGAGE nearest_enemy
```

Condition primitives are **state queries**: `buffer_has`, `signal_age`, `buffer_count`, `buffer_full`, `nearest_enemy_distance`, `tagged`, `hp_status` (if applicable), `tick_number`. They evaluate to true/false based on the current state of the unit's context window and the board.

**Hook triggers** use the event model from 3.08:
```
WHEN [ON_SPOT_ENEMY] → SEND [position] ON [recon-net]
```

Trigger primitives are **event detections**: `ON_SPOT_ENEMY`, `ON_THREAT_ENTER`, `ON_THREAT_EXIT`, `ON_RECEIVE_SIGNAL`, `ON_BUFFER_FULL`, `ON_EVADE`, `ON_ENGAGE`, `ON_COMPRESS`, `ON_HACK`, `ON_IDLE`. They fire at the instant something occurs, then go dormant until it occurs again.

The two vocabularies share no tokens. The visual language is deliberately different:

| Aspect | Rules | Hooks |
|--------|-------|-------|
| Verb | TEST / IF | WHEN / ON |
| Icons | Square tokens, cool blues and grays | Lightning bolt tokens, warm ambers and corals |
| Evaluation | Every tick, sequential | Reactive, instant |
| Mental model | "Check if true" | "React when happens" |
| UI position | Above hooks in blueprint panel | Below rules in blueprint panel |

### What It Looks Like

The rules section uses square-cornered tokens in a cool palette — steel blue for buffer conditions, slate gray for spatial conditions, ice white for comparators. The font is monospace. The feel is analytical, methodical, like reading a logic table.

The hooks section uses rounded tokens in a warm palette — amber for perception events, coral for combat events, gold for communication events. The font is the same monospace but the tokens have a subtle glow effect — a 1px outer halo that pulses once when the event fires during debrief replay. The feel is reactive, electric, like wiring a circuit board.

When the player opens the rule condition picker, they see a radial menu with square icons on a cool blue background. When they open the hook trigger picker, they see a different radial menu with rounded icons on a warm amber background. The two menus are visually distinct enough that the player never confuses which system they're editing.

### Strengths

- **Teaches the state/event distinction.** The player learns that "checking what's true" and "reacting when something happens" are different operations. This is a genuine transferable insight for anyone who later encounters event-driven architectures, webhooks, or pub/sub systems.
- **Each vocabulary is optimized.** Hook triggers can use natural event language: "when enemy spotted," "when evade fires." They don't need to be contorted into state queries. Rule conditions can use natural query language: "if buffer has," "if signal age less than." Each system speaks the language that's most natural for its role.
- **Independent evolution.** New hook triggers (like `ON_TAGGED_BY_ENEMY` or `ON_CHANNEL_SILENT_FOR_N_TICKS`) can be added without polluting the rule condition space. New rule conditions (like `weighted_priority_score > threshold`) can be added without appearing in the trigger picker.
- **Stronger visual identity per section.** The cool-toned rules section and warm-toned hooks section give each area of the blueprint editor a distinct personality. The player's eye can locate "I'm in rules" or "I'm in hooks" from color alone.
- **No conceptual collapse.** Rules remain "what I decide to do" and hooks remain "what I tell others." The two primitives retain their distinct identity. Having four genuinely different primitives (skills, rules, hooks, context config) is more interesting than having three primitives and one that's just "rules but for broadcasting."

### Weaknesses

- **Double the learning burden.** The player must learn 15 rule conditions AND 12 hook triggers AND understand that they're different categories. For a game that must be "accessible to someone who's never played a strategy game" (locked constraint), this is a real cost.
- **Overlapping semantics cause confusion.** `buffer_full` is a rule condition. `ON_BUFFER_FULL` is a hook trigger. They sound like the same thing — and they almost are. A player will ask: "Why can't I just use `buffer_full` as a hook trigger?" The answer is architecturally sound but pedagogically frustrating.
- **No cross-system reuse.** A player who builds a sophisticated rule condition like `signal_age ENEMY_SPOTTED < 3 AND buffer_count ENEMY_SPOTTED >= 2` can't reuse that logic as a hook trigger. They'd have to mentally translate it into the hook event vocabulary, which may not have equivalent expressiveness.
- **Blueprint Codex bloat.** The Codex needs separate "Rule Conditions" and "Hook Triggers" pages. More pages means more to learn, more to look up, more friction.

### The TikTok Clip

Split screen. Left: the cool-blue rules section, a TEST condition evaluating each tick like a heartbeat monitor — steady, rhythmic, analytical. Right: the warm-amber hooks section, a trigger firing like a lightning strike — sudden, reactive, electric. The two systems pulse in different rhythms on the same unit. The message: this game has two brains — the thinker and the reactor. You wire both.

---

## Approach C: The Bridged Dictionary — Shared Core, Distinct Extensions

**Philosophy:** Rules and hooks share a common core of condition primitives (the ones that make sense in both contexts), but each system also has exclusive primitives that only appear in its own context. The shared core reduces learning cost; the exclusive extensions preserve the state/event distinction where it matters.

### Mechanical Specification

**Shared Core (available in both rules and hooks):**

| Primitive | Description |
|-----------|-------------|
| `buffer_has [type]` | Context window contains a signal of this type |
| `buffer_full` | Context window is at capacity |
| `buffer_count [type] >= N` | Signal count threshold |
| `nearest_enemy_distance < N` | Spatial proximity |
| `tagged [target]` | Target is tagged |
| `tick_number % N == 0` | Periodic timing |

These 6 primitives cover the conditions that are genuinely useful in both systems. "If buffer is full, evict low-priority" (rule) and "if buffer is full, broadcast overload warning" (hook) are both natural uses.

**Rule-exclusive extensions:**

| Primitive | Description | Why rule-only |
|-----------|-------------|---------------|
| `signal_age [type] < N` | Freshness test | Rules evaluate state; hooks fire on events, where age is always 0 |
| `signal_source == [unit]` | Who sent this | Rules need to discriminate between sources; hooks already know their own source |
| `weighted_priority > N` | Priority score threshold | Only meaningful for per-tick decision-making |
| `no_action_available` | No skill can execute | Fall-through condition for rules; meaningless for hooks |

**Hook-exclusive extensions:**

| Primitive | Description | Why hook-only |
|-----------|-------------|---------------|
| `ON_SPOT_ENEMY` | Enemy enters perception for first time | Truly event-driven — fires once on transition, not every tick enemy is visible |
| `ON_THREAT_EXIT` | Enemy leaves perception | Transition event with no state equivalent |
| `ON_SKILL_FIRED [skill]` | Specific skill activated | Hooks react to skill execution; rules don't (rules run before skills) |
| `ON_CHANNEL_SILENT [channel] FOR N` | Silence detection | Negative event — the absence of activity. Can't be expressed as state because state doesn't track "how long since last signal" natively |
| `ON_EVADE` | Evade skill fired | Combat-specific event |
| `ON_ENGAGE` | Unit eliminates an enemy | Combat-specific event |

### What It Looks Like

The condition picker radial menu adapts to context. When opened from a **rule strip**, it shows the shared core primitives in the center ring (white icons, always visible) and rule-exclusive primitives in an outer ring (cool blue icons, labeled "RULES ONLY" in a subtle watermark). When opened from a **hook strip**, the center ring shows the same shared core (same white icons, same positions) and the outer ring shows hook-exclusive primitives (warm amber icons, labeled "HOOKS ONLY").

The center ring is identical in both contexts — same icons, same positions, same colors. The player's muscle memory for shared primitives transfers perfectly. The outer ring changes color and content based on context, but its position (outer ring) consistently signals "this is context-specific."

**The shared primitives use a neutral visual language:** white icons on dark charcoal tokens, no temperature bias. They belong to both worlds. When a shared primitive appears in a rule strip, the token sits on the cool-blue strip background. When it appears in a hook strip, the same white token sits on the warm-amber strip background. The token itself is Switzerland — neutral.

### Visual Hierarchy in the Blueprint Editor

```
RULES  3/5
┌─────────────────────────────────────────────────────────┐
│ ≡ │ TEST [⬜ buffer_has ENEMY_SPOTTED]  + ENGAGE        │  ← shared primitive (white token)
├─────────────────────────────────────────────────────────┤
│ ≡ │ TEST [🔵 signal_age < 3]           + MOVE_TOWARD   │  ← rule-exclusive (blue token)
├─────────────────────────────────────────────────────────┤
│ ≡ │ TEST [⬜ nearest_enemy < 2]         + EVADE         │  ← shared primitive (white token)
└─────────────────────────────────────────────────────────┘

HOOKS  2/2
┌──────────────────────────────────────────────────────────────┐
│ ⚡ │ WHEN [⬜ buffer_has ENEMY_SPOTTED] → SEND pos ON [recon] │  ← shared primitive (white token)
├──────────────────────────────────────────────────────────────┤
│ ⚡ │ WHEN [🟠 ON_THREAT_EXIT]          → SEND clear ON [alert]│  ← hook-exclusive (amber token)
└──────────────────────────────────────────────────────────────┘
```

The white tokens are visually identical in both sections. A player scanning the blueprint sees: "Ah, `buffer_has ENEMY_SPOTTED` appears in both my rules and my hooks. It's the same condition doing double duty." The colored tokens (blue in rules, amber in hooks) signal specialization — "this condition only lives here."

### Strengths

- **Reduced learning cost without collapsing distinction.** The player learns 6 shared primitives first (covering ~70% of early-game configurations). The system-exclusive primitives are introduced gradually as the player's sophistication grows.
- **Natural migration path.** Mission 1-4 can use only shared primitives. The player configures rules and hooks with the same small vocabulary. Mission 5+ introduces rule-exclusive and hook-exclusive primitives as the complexity demands them. The progression feels like unlocking new tools, not learning a new language.
- **Preserves the state/event distinction where it matters.** `ON_THREAT_EXIT` is genuinely event-driven — there's no natural state query equivalent. `signal_age < N` is genuinely state-driven — hooks that fire on events don't have a meaningful "age" to test. The distinction exists where it's real and disappears where it's artificial.
- **Drag-and-drop works for shared primitives.** The player can drag a shared condition token from a rule to a hook (or vice versa) and it works. Dragging an exclusive token across systems shows a red "X" — "this condition only works here." The constraint is visible and explainable.
- **Best Codex organization.** The Blueprint Codex has three subsections under "Conditions": "Core Conditions (used in rules and hooks)," "Rule Conditions," "Hook Triggers." The core section is prominently placed; the extensions are clearly secondary.

### Weaknesses

- **Three categories instead of two.** "Shared," "rule-only," and "hook-only" is more nuanced than "rules stuff" and "hooks stuff." Some players may find the tripartite classification confusing — "why can I use this one in hooks but not that one?"
- **The boundary needs justification.** Every exclusive primitive will prompt the question "why can't I use this in the other system?" The answers are architecturally sound but may feel arbitrary to a new player.
- **Potential for boundary disputes.** `buffer_full` is shared. `ON_BUFFER_FULL` could also exist as a hook-exclusive event trigger. Are these the same? Different? The designer must make a ruling, and the ruling will feel arbitrary to someone.

### Resolution for `buffer_full` / `ON_BUFFER_FULL`

This is the trickiest boundary case. The recommendation: `buffer_full` is in the shared core. When used in a rule, it's evaluated every tick ("is my buffer full right now?"). When used in a hook, it's automatically edge-detected — it fires only on the tick the buffer BECOMES full, not every tick it remains full. The behavior difference is implicit: same token, context-dependent evaluation semantics. A tooltip on the hook strip clarifies: "Fires once when context window fills up." This is a small lie — the primitive isn't truly identical in both contexts — but it's a pedagogically useful lie that matches player intuition.

---

## Player Journeys

### Journey: Rina, 16, Plays Stardew Valley, Has Never Programmed

**Context:** Mission 3, the tutorial mission that introduces hooks. Rina has been using rules for two missions and is comfortable with `buffer_has` and `nearest_enemy_distance`. She has one scout and one striker pre-placed. The boot log has just explained hooks: "Your agents can talk to each other. Configure a hook to broadcast information."

**Minute 0:00 — The Hook Strip Appears**

Rina sees the familiar workbench panel. The RULES section has her two configured rules for the scout: `TEST buffer_has ENEMY_SPOTTED → + PATROL` and `TEST nearest_enemy_distance < 2 → + EVADE`. Below the rules, a new section has appeared: HOOKS 0/2. Two dashed-outline strips breathe gently. Above them, a pulsing tutorial arrow points to the first empty hook slot.

She clicks the empty slot. A hook strip materializes with three zones: a condition zone (pulsing white, inviting a click), an arrow pointing to "SEND [?]", and "ON [channel name]." She recognizes the structure — it's similar to her rule strips but with two extra parts.

**Minute 0:15 — The Familiar Radial**

She clicks the condition zone. The radial menu opens. Her eyes widen — she recognizes it. It's the SAME radial menu from the rules editor. The center ring has the same white icons: `buffer_has`, `buffer_full`, `nearest_enemy_distance`, `tagged`. She already knows what these do. Her hand moves instinctively to `buffer_has ENEMY_SPOTTED` — the condition she's used in three rules already.

She clicks it. The white token snaps into the hook strip's condition zone. A warm amber glow spreads behind it — she's in the hooks section, so the strip background is amber-tinted. But the token itself is the same white square she knows from rules. Familiar in an unfamiliar context. She feels grounded.

**Minute 0:30 — Completing the Hook**

She clicks the payload dropdown: options appear — `position`, `threat_level`, `unit_id`. She picks `position` (the tooltip says "Where the enemy was spotted"). She clicks the channel name field and types "alert" — a soft creation chime plays, a coral color fills the input background, and a "NEW" badge appears. Her first channel.

The channel map panel in the corner updates: a tiny diagram shows her scout connected to a coral-colored line labeled "alert" with zero listeners. She frowns — nobody's listening. She switches to the striker blueprint and finds its CONTEXT CONFIG section. She toggles "alert" to "listen." The channel map updates: scout → alert → striker. A connection sound plays. She grins.

**Minute 1:00 — The Transfer Moment**

Back on the scout's blueprint, Rina notices the hook's outer ring of the radial menu had amber-colored options she didn't explore. She opens the radial again. The center ring is familiar (white shared primitives). The outer ring shows amber icons: `ON_SPOT_ENEMY`, `ON_EVADE`, `ON_THREAT_EXIT`. She hovers over `ON_SPOT_ENEMY` — the tooltip says "Fires the instant your scout detects an enemy." She pauses. That sounds like `buffer_has ENEMY_SPOTTED`, which she already used. What's the difference?

She replaces her hook's condition with `ON_SPOT_ENEMY`. The token changes from a white square to an amber rounded rectangle. The tooltip clarifies: "Unlike 'buffer has enemy spotted' (which checks every tick), this fires ONCE when the enemy first appears." She nods slowly — it's like the difference between an alarm going off once vs. a light staying on. She decides `ON_SPOT_ENEMY` is better for her alert channel — she doesn't want the scout spamming alerts every tick.

**Minute 1:30 — Resolution**

Rina executes the mission. During the sealed watch, she sees her scout spot an enemy — a coral dashed line flashes between the scout and striker for one tick (the hook fired once). The striker receives the position, and its rules kick in: `TEST buffer_has ENEMY_SPOTTED → + MOVE_TOWARD`. The striker moves. Two ticks later, engage. Enemy eliminated.

In the inspector, she traces the chain: Scout's `ON_SPOT_ENEMY` hook → "alert" channel → Striker's context window → Striker's `buffer_has ENEMY_SPOTTED` rule → MOVE_TOWARD. She notices: the hook used an event trigger (amber token), but the striker's rule used a shared state condition (white token). Two different condition types, working together. The event started the chain; the state query finished it.

**UI Annotations:**
- Radial menu: identical center ring (shared core) in both rule and hook contexts. 6 white icons, 40px diameter, arranged in semicircle. Outer ring changes: blue (rule-exclusive) or amber (hook-exclusive).
- Token drag: shared tokens (white) can be dragged between rules and hooks sections. Cursor shows green checkmark. Exclusive tokens (colored) show red X when dragged to wrong section.
- Channel creation: text input field, 160px wide, monospace font. Autocomplete dropdown after 1 character. New channel: coral/cyan/gold assigned from palette, "NEW" badge animates in with bounce.

---

### Journey: Marcus, 28, Backend Developer, Screeps Player

**Context:** Mission 6. Marcus has been playing for 3 hours and understands the four primitives deeply. He's building a multi-unit relay network: two scouts feeding position data through a relay to two strikers. He wants sophisticated conditional broadcasting — the relay should only forward compressed data when at least two scouts have reported the same enemy (triangulation).

**Minute 0:00 — The Relay's Workbench**

Marcus opens the relay's blueprint. The relay has 4 hook slots (the most of any unit except Command). He's already used two: one for forwarding compressed signals on "strike-orders" and one for broadcasting buffer status on "relay-health." He needs to wire the triangulation logic.

He opens the hook condition picker on the third hook slot. The radial menu appears. Center ring: shared primitives. He immediately spots `buffer_count [type] >= N` — a shared primitive. He clicks it, sets type to `ENEMY_SPOTTED`, sets N to 2. The condition reads: "When buffer has 2+ ENEMY_SPOTTED signals." This is a shared primitive, so it works in hooks — but in hook context, it's edge-detected: fires once when the count crosses the threshold, not every tick the count remains above 2.

**Minute 0:20 — Layering Exclusives**

But Marcus wants more. He doesn't just want "2+ enemy spotted" — he wants "2+ enemy spotted with position data that's within 2 tiles of each other." That's a spatial correlation. The shared primitives don't cover this.

He looks at the outer ring. In the hook context, the amber hook-exclusive triggers include `ON_RECEIVE_SIGNAL` and `ON_COMPRESS`. He considers: he could split this into two hooks. Hook 3: `WHEN buffer_count ENEMY_SPOTTED >= 2 → SEND compressed_intel ON strike-orders`. Hook 4: a rule on the relay that uses `signal_source` (rule-exclusive) to compare the two scouts' reports.

Wait — `signal_source` is rule-exclusive (blue). He can't use it in a hook trigger. He switches to the relay's RULES section and writes:

```
TEST buffer_count ENEMY_SPOTTED >= 2      (shared primitive)
+ TEST signal_age ENEMY_SPOTTED < 3       (rule-exclusive: freshness check)
+ SET_FLAG confirmed_threat               (rule action: sets an internal flag)
```

Then he goes back to hooks and configures Hook 3:

```
WHEN [buffer_has confirmed_threat] → SEND compressed_intel ON [strike-orders]
```

The `buffer_has` is a shared primitive — the flag his rule set becomes a context entry that the hook can test. The rule does the sophisticated analysis (using rule-exclusive `signal_age`); the hook does the broadcasting (using shared `buffer_has` to check the rule's output).

**Minute 1:30 — The Architecture Emerges**

Marcus steps back and looks at his relay blueprint. The rules section has blue-tinted exclusive tokens doing analysis. The hooks section has white shared tokens reading the rules' output and amber exclusive tokens detecting events. The two systems aren't redundant — they're a pipeline. Rules analyze. Hooks broadcast. The shared primitives are the interface between them.

He thinks: "This is exactly like how I'd build a real system. The analysis service writes to a shared state store. The notification service reads the store and sends alerts. Same pattern." He feels the 1:1 vocabulary alignment with real engineering that the spec promises.

**Minute 2:00 — Testing and Iterating**

He executes. During the sealed watch, he watches the relay. Two scouts report. The relay's rule evaluates: buffer_count >= 2? Yes. Signal age < 3? Yes. Flag set. Next tick: the hook fires — `buffer_has confirmed_threat` is true (edge-detected: fires once when the flag first appears). Compressed intel flows to strike-orders. The strikers converge.

In the inspector, the decision trace shows the layered logic clearly: Rule 1 (shared primitive) → Rule 2 (rule-exclusive) → Flag set → Hook 3 (shared primitive reading flag) → Broadcast. The color coding makes it legible: white → blue → white → amber. The pipeline is visible in the colors.

**Minute 3:00 — Discovering the Teaching**

Marcus realizes something. The relay's architecture — rules doing analysis, hooks doing broadcasting, shared primitives as the interface — is a publish-subscribe pattern with a processing stage. The rule conditions are the subscriber logic. The hook triggers are the publisher logic. The shared primitives (`buffer_has`, `buffer_count`) are the message bus interface. He's learned event-driven architecture by playing a game, and the vocabulary alignment made the pattern visible.

**UI Annotations:**
- Relay blueprint: 4 hook slots visible, each 48px tall. Rule section above with 5 rule slots. Total blueprint panel height: ~600px, scrollable.
- Decision trace in inspector: color-coded chain showing white (shared), blue (rule-exclusive), amber (hook-exclusive) tokens in sequence. Each node clickable for detail.
- Flag mechanism: `SET_FLAG` adds a named entry to the unit's context window. It's consumed by the first condition that reads it (single-use) unless marked `PERSIST`.

---

### Journey: Anika, 42, Game Designer at a Mobile Studio, Plays Into the Breach Competitively

**Context:** Mission 8, the first full factory-vs-factory mission. Anika has mastered the basic vocabulary and is now working on her Command agent — the meta-level unit that manages other units' configurations. She wants her Command agent to detect when the relay network is overwhelmed and automatically reroute hooks.

**Minute 0:00 — The Command Agent's Blueprint**

Anika opens the Command agent blueprint. 6 hook slots, 14-slot context window. The Command agent's skills include `reassign`, `reroute`, and `prioritize` — meta-skills that modify other units' configurations mid-battle. She needs to wire hooks that detect system-level conditions, not just unit-level events.

She opens the hook condition picker on slot 1. The radial menu appears. The center ring shows the familiar shared primitives. But she needs something different — she needs to detect when a channel is congested. She looks at the outer amber ring. There it is: `ON_CHANNEL_SILENT [channel] FOR N` — a hook-exclusive trigger that fires when no signals have flowed on a named channel for N ticks. She selects it, configures channel: "recon-net", N: 5.

The hook reads: `WHEN [ON_CHANNEL_SILENT recon-net FOR 5] → SEND reroute_order ON [command-line]`.

**Minute 0:20 — The Dual System in Full Flight**

She configures the Command's rules to handle the aftermath. When the reroute order is sent, the Command itself receives it (it listens on command-line). A rule picks it up:

```
TEST buffer_has REROUTE_ORDER        (shared primitive)
+ DO reroute scout-alpha recon-net-backup    (Command-exclusive action)
```

Then she configures a second hook for the positive case — relay network is healthy:

```
WHEN [buffer_count RELAY_STATUS >= 2] → SEND all_clear ON [command-line]
```

This uses a shared primitive (`buffer_count`) in a hook. When 2+ relay status reports are in the Command's context window, it broadcasts all-clear. The rule side handles it:

```
TEST buffer_has ALL_CLEAR            (shared primitive)
+ DO prioritize striker-blueprints production-boost    (Command-exclusive action)
```

**Minute 1:00 — The Meta Architecture**

Anika's Command agent now has a feedback loop: detect silence → reroute → detect recovery → boost production. The hook triggers are a mix of hook-exclusive events (`ON_CHANNEL_SILENT` — only meaningful as a reactive trigger) and shared primitives (`buffer_count` — meaningful in both contexts). The rules are a mix of shared primitives (`buffer_has`) and rule-exclusive analysis tools.

She looks at her full blueprint. The visual tells the story:
- **White tokens** (shared) appear in both sections, creating visual bridges between rules and hooks.
- **Blue tokens** (rule-exclusive) cluster in the rules section, doing analytical work.
- **Amber tokens** (hook-exclusive) cluster in the hooks section, detecting events.
- The two sections are visually distinct but connected through the shared white tokens.

**Minute 1:30 — The Factory Test**

She executes. The sealed watch begins. For 15 ticks, the network hums. Scouts report, relays compress, strikers engage. Then an enemy striker takes out her primary relay. The recon-net channel goes silent. One tick. Two. Three. Four. Five.

On the Command unit, an amber glow pulses — `ON_CHANNEL_SILENT recon-net FOR 5` fires. A dashed line shoots from the Command to all listeners on command-line. The Command's own rule picks up the reroute order. Next tick: `reroute scout-alpha recon-net-backup` executes. The scout's hooks rewire mid-battle. The backup relay picks up the feed. Three ticks later, `buffer_count RELAY_STATUS >= 2` crosses the threshold — the all-clear hook fires. Production shifts to strikers.

Anika watches the comeback unfold. She didn't script it. She configured two condition systems — state and event — and wired them together through shared primitives. The resilient architecture emerged from the vocabulary.

**Minute 3:00 — In the Inspector**

She scrubs back to tick 15, when the relay died. She clicks the Command unit. The decision trace shows: tick 15-19, no rule matches (nothing to react to — rules poll state, and the state doesn't reflect silence). Tick 20: `ON_CHANNEL_SILENT` fires (hook-exclusive event detection catches what rule-based polling missed). The event created a context entry. Tick 21: rule condition `buffer_has REROUTE_ORDER` matches (shared primitive reads the event's artifact). Action executes.

The interplay is clear: the hook-exclusive trigger detected an absence (no state query can detect "nothing happened for 5 ticks" without explicit countdown tracking). The shared primitive bridged the event into the rules system. The rule-exclusive analysis handled the response. Three vocabulary layers, working together.

**UI Annotations:**
- Command blueprint: 6 hook slots visible, dense panel. Slot utilization indicator "4/6" in section header.
- Channel silence detection: the `ON_CHANNEL_SILENT` trigger token shows a small animated timer icon (5 tick countdown visualized as emptying pips) when hovering.
- Reroute skill: when the Command executes `reroute`, a brief animation shows the target unit's hook strip updating — the channel name field smoothly transitions from the old channel color to the new one. This is visible on the board as well: the dashed signal line between scout and dead relay fades, and a new line appears between scout and backup relay.
- Inspector decision trace at tick 20: the `ON_CHANNEL_SILENT` node is amber with a "silence detected" annotation. The subsequent `buffer_has REROUTE_ORDER` node is white (shared). The visual makes the event→state bridge explicit.

---

## Interaction Effects

### With the Blueprint Codex (Locked)

The Bridged Dictionary (Approach C) maps cleanly to the Codex's card-collection metaphor. Three card categories under "Conditions":
- **Core Conditions** (white-bordered cards): 6 cards, each showing both rule and hook usage examples on the card back. Unlocked in Missions 1-2.
- **Rule Conditions** (blue-bordered cards): 4 cards, each showing only rule context. Unlocked in Missions 3-4.
- **Hook Triggers** (amber-bordered cards): 6 cards, each showing only hook context. Unlocked in Missions 3-5.

The color-coding in the Codex matches the radial menu and the token colors in the blueprint editor. A player who sees a blue-bordered card knows it's rule-only before reading a word.

### With the Sealed Watch (Locked)

During the sealed watch, signal chain visualizations use the vocabulary's color coding. When a hook fires, the dashed line between units is amber (event-driven broadcast). When a rule matches, the unit's tile border flashes blue (state-driven decision). When a shared primitive is the bridge between them — a hook creates a context entry that a rule reads — the flash transitions from amber to white to blue over 3 frames. The color language extends from the workbench to the battlefield.

### With Context Config (Locked)

Context config (listen/ignore filters, eviction priority) interacts with both rule conditions and hook triggers. A unit that ignores a channel never receives signals from it — so `buffer_has` conditions referencing those signal types will never be true, and `ON_RECEIVE_SIGNAL` triggers on those channels will never fire. The shared primitives make this interaction legible: the same `buffer_has` token appears in rules and hooks, so the player understands that context config affects both systems equally.

### With the Mission Arc (Locked)

The vocabulary alignment supports the tutorial progression:
- **Mission 1-2:** Only shared primitives. Rules and hooks feel like the same system with different outputs.
- **Mission 3:** Hook-exclusive triggers introduced. The boot log explains: "Your agents can now detect events — things that happen once, not things that are always true."
- **Mission 4:** Rule-exclusive conditions introduced. The boot log explains: "Your agents can now analyze their context more deeply — checking how old signals are, where they came from."
- **Mission 5+:** Both systems at full expressiveness. The player has graduated from shared basics to specialized tools.

---

## Comparable Games and Media

### Gladiabots

Gladiabots uses a single visual programming language for all bot behavior — conditions, actions, and transitions share the same node-based graph. There is no distinction between "event-driven" and "state-driven" logic; everything is a condition node that evaluates per tick. This makes the system easy to learn but prevents the kind of event-driven wiring that Robot Uprising's hooks enable. The lesson: a unified vocabulary lowers the entry barrier but also lowers the ceiling.

### Factorio's Circuit Network vs. Logistics Network

Factorio has two parallel condition systems: the circuit network (wire-based, evaluates signals per tick, state-driven) and the logistics network (request-based, event-driven when items are placed or removed). They share some vocabulary (item types, counts) but have distinct interfaces and distinct mental models. Players who master both can build systems that bridge them — a circuit network detecting low iron counts and triggering a logistics request. This dual-system-with-bridges pattern is closest to Approach C.

### Unix Signals vs. System Calls

In Unix, signals are asynchronous events (SIGTERM, SIGINT) and system calls are synchronous state queries (stat(), read()). They use completely different vocabularies and interfaces. But they interact constantly — a signal handler might set a flag that a later system call reads. This is exactly the event→state bridge pattern in Approach C, where a hook-exclusive event trigger sets a flag that a shared primitive reads in a rule.

---

## Sensory Description

### The Radial Menu in Both Contexts

When the player clicks a condition zone — whether in a rule strip or a hook strip — the radial menu blooms outward from the click point with a soft "whoosh" sound, like a circular aperture opening. The center ring of 6 white icons appears first (100ms), then the outer ring slides outward (200ms total). In rule context, the outer ring icons are steel blue with a subtle frost shimmer. In hook context, the outer ring icons are warm amber with a subtle ember glow. The center ring is always neutral white — cool-warm agnostic, belonging to neither world but welcome in both.

Hovering over a shared primitive in the center ring plays a neutral tone — a clean sine wave ping, middle C. Hovering over a rule-exclusive primitive in the outer blue ring plays a lower tone — D below middle C, slightly reverb-heavy, analytical. Hovering over a hook-exclusive primitive in the outer amber ring plays a higher tone — E above middle C, crisp and sharp, reactive. The three tones form a chord when played together, reinforcing that the three vocabulary layers are harmonious parts of one system.

### Token Colors on the Strip

White shared tokens sit cleanly on both the cool-gray rule strip background and the warm-charcoal hook strip background. They're chameleons — they belong everywhere. Blue rule-exclusive tokens look natural on the cool-gray strip but would look alien on the warm-charcoal strip (which is why they can't be dragged there — the visual dissonance previews the incompatibility). Amber hook-exclusive tokens glow warmly on the hook strip but would clash with the cool rule strip.

### The Drag Feedback

Dragging a white shared token from a rule to a hook: the token floats under the cursor with a gentle white glow. As it crosses the section boundary between RULES and HOOKS, the glow transitions from the cool-gray tint of the rules section to the warm-amber tint of the hooks section — a 200ms color shift. The hook strip's condition zone illuminates with a green "drop here" indicator. On drop, a magnetic snap sound plays and the token settles into the amber strip, its white color now contrasting warmly against the amber background.

Dragging a blue rule-exclusive token toward the hooks section: the token floats with a blue glow. As it crosses the section boundary, the glow turns red. The hook strip's condition zone shows a red X. A low buzzer tone plays — not punitive, just informational. Releasing the token anywhere in the hooks section causes it to float back to its original position with a gentle bounce animation (300ms). The message is clear: this token doesn't belong here. No error dialog, no text explanation needed. The color told the story.

---

## Recommendation

**Approach C (The Bridged Dictionary)** is the strongest design for Robot Uprising. It minimizes learning cost through shared primitives while preserving the state/event distinction that makes the game's dual-system architecture educationally valuable. The color-coded vocabulary (white shared, blue rule-exclusive, amber hook-exclusive) extends naturally to the sealed watch, the inspector, and the Blueprint Codex. The migration path from shared-only (Missions 1-2) to full vocabulary (Mission 5+) aligns with the locked mission arc. And the architecture it teaches — events creating state that rules read, rules creating flags that hooks broadcast — mirrors real-world event-driven systems with fidelity.

The key implementation insight: shared primitives must behave slightly differently in each context (tick-evaluated in rules, edge-detected in hooks). This difference should be communicated through tooltips and the Codex, not through separate tokens. The player sees one token, learns one name, and discovers the contextual nuance through play.

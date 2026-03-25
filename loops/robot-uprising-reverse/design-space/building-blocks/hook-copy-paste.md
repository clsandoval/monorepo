# 3.11c — Hook Copy-Paste Between Blueprints: Channel Portability and Trigger Incompatibility

## Overview

The rules copy-paste analysis (3.07b) explored lifting *rule strips* across blueprints — conditions that reference universal game state, paired with actions that are unit-type-specific. Hooks present a structurally different problem. A hook is not a condition→action pair; it is a trigger→channel→payload triple: "WHEN [trigger event] → SEND [payload] ON [channel name]." When a player copies a hook from one blueprint and pastes it into another, three distinct compatibility questions arise simultaneously:

1. **Is the trigger available on the target unit type?** A Relay hook triggered by `signal_received` is universal — all units can receive signals. But a Scout hook triggered by `ON_SPOT_ENEMY` is perception-gated — Strikers don't have the observation apparatus. The trigger vocabulary is unit-type-specific, just like rule actions are.

2. **Does the channel name make architectural sense on the target?** Channel names are freeform strings. A hook broadcasting on `recon-net` carries over verbatim — the string is just a string. But a Relay hook sending compressed intel on `processed-intel` pasted onto a Scout creates a semantic lie: the Scout cannot compress, so the channel name promises a data format the Scout will never produce. The channel name is portable; the channel's *contract* is not.

3. **Is the payload type producible by the target unit?** A Relay's `compress_completed` trigger can send `compressed_intel` as its payload. A Scout cannot produce compressed intel. Even if the trigger were available, the payload would be empty or malformed.

This is "The Transplanted Nerve Problem." Hooks are not just behaviors — they are wiring endpoints. Copying a hook is like transplanting a nerve ending from one species to another: the nerve itself transfers, but the sensory organ it was attached to might not exist in the new body.

The deeper question: **should pasting a hook onto an incompatible blueprint feel like a wiring error (red flash, fix it yourself) or a rewiring opportunity (the system guides you to the closest compatible trigger)?**

---

## The Core Tension

Four forces collide in hook copy-paste that do NOT collide in rule copy-paste:

1. **Channel continuity** — The player copies a hook because they want another unit participating in the same channel architecture. A Scout broadcasting on `threat-net` and a Striker also broadcasting on `threat-net` creates redundant coverage — both units contribute to the same information channel. The channel name IS the reason for copying. Any paste behavior that changes the channel name defeats the purpose.

2. **Trigger specificity** — Triggers are tightly coupled to unit capabilities. Scouts perceive; Relays receive signals; Specialists hack; Command units coordinate. The trigger vocabulary per unit type is the game's expression of what that unit type *notices about the world*. Unlike rule conditions (which are largely universal — `enemy_count > 2` works everywhere), triggers are the unit's sensory apparatus. You cannot paste a retina into a microphone.

3. **Payload integrity** — Channels carry implicit data contracts. A channel called `processed-intel` that suddenly receives raw observation data (because a Scout was pasted a hook that originally compressed before sending) pollutes downstream consumers. The channel map panel shows subscribers — but it cannot show whether the data flowing through a channel is what subscribers expect.

4. **Slot scarcity amplification** — Hook slots are scarcer than rule slots. A Scout with 2 hook slots cannot afford a broken paste. A rule pasted with an empty action slot is recoverable — the condition is still useful. A hook pasted with an incompatible trigger is a wasted slot occupying one of only two available positions. The cost of a bad paste is proportionally higher for hooks than for rules.

---

## Five Conflict Resolution Patterns

### Pattern 1: "The Red Wire" — Hard Reject with Diagnostic

**How it works:** Paste is attempted. The system checks whether the trigger event exists on the target unit type's trigger vocabulary. If the trigger is unavailable, the paste fails entirely. A diagnostic message names the specific incompatibility: "Scouts cannot trigger on `compress_completed` — this trigger requires the Compress skill (Relay only)."

**Visual description:** The copied hook strip — lifted from its source slot with the same cyan border glow and "shhk" card-slide sound as rule copying — appears as a translucent ghost in the target blueprint's empty hook slot. The trigger zone on the left flashes red three times in 400ms, a rapid pulse that draws the eye to exactly where the incompatibility lives. The channel name zone on the right stays cyan — the channel is fine, the trigger is the problem. After the third pulse, the ghost dissolves into red-tinted particles that drift downward and evaporate. A tooltip appears in amber monospace: `TRIGGER UNAVAILABLE: compress_completed requires Compress skill. Available triggers: ON_SPOT_ENEMY, ON_THREAT_ENTER, ON_RECEIVE_SIGNAL...`

The tooltip lists the target unit's available triggers, giving the player a starting point for manual reconstruction. The clipboard retains the copied hook — the player can paste it elsewhere without re-copying.

**Strengths:**
- Zero ambiguity. The hook either transfers or it doesn't.
- The diagnostic explicitly names which part of the hook is incompatible (trigger, not channel), teaching the player about unit-type-specific trigger vocabularies.
- No risk of creating semantically broken hooks that produce garbage data on channels.

**Weaknesses:**
- Frustrating when the player's intent is clear. Copying a Relay's "ON_RECEIVE_SIGNAL on `recon-net` → compress and forward on `processed-intel`" to a Scout — the player obviously wants the Scout to participate in `recon-net`. The hard reject says "no" without offering the obvious alternative: "ON_SPOT_ENEMY on `recon-net`."
- Multi-hook batch copies where 3 of 4 hooks are compatible reject the entire batch if one fails (or require per-hook granularity, adding complexity).

**Comparable:** TypeScript strict mode refusing to compile on a type mismatch. Shenzhen I/O flagging an incompatible instruction at "compile" time. The error message IS the documentation.

---

### Pattern 2: "The Rewire Bench" — Channel Preserved, Trigger Replaced with Empty Slot

**How it works:** When a hook is pasted with an incompatible trigger, the channel name and payload configuration transfer intact. The trigger zone becomes an empty pulsing slot — identical to the "Skeleton Key" pattern from rules copy-paste (3.07b Model C). The player must select a compatible trigger from the target unit's trigger radial menu. If the trigger is already compatible, the entire hook pastes cleanly.

**Visual description:** The hook strip materializes in the target slot with its right side (channel name) fully rendered — the channel's color fill, the `📡` subscriber icon, the familiar monospace text. The left side (trigger zone) is a dashed rectangle pulsing in slow amber — not cyan like empty rule actions, but amber to signal "this is a trigger problem, not an action problem." The differentiated color prevents confusion with rule copy-paste's cyan empty slots. Inside the dashed rectangle, ghosted text shows the original trigger in strikethrough: `~~compress_completed~~`, communicating what was there before.

A diagonal hatching overlay (45-degree amber lines, 4px spacing, 10% opacity) covers the trigger zone — the "under construction" texture. Clicking the empty trigger zone opens the trigger radial menu filtered to the target unit type's available triggers. Selecting one snaps the trigger into place with the standard magnetic "tchk." The hatching dissolves left-to-right. The hook is live.

**Strengths:**
- Preserves the most valuable part of the copy: the channel wiring. The player copied the hook to get this unit onto `recon-net` — and it IS on `recon-net`, just waiting for a trigger.
- The ghosted strikethrough of the original trigger teaches by comparison: "compress_completed was the Relay's trigger; what's YOUR unit's equivalent?"
- Scales well for batch operations. Four hooks pasted, two compatible (instant), two need triggers (quick radial selection).

**Weaknesses:**
- Payload integrity risk. The channel name transfers, but the payload the new trigger produces might differ from the original. A Relay's `compress_completed` sent `compressed_intel` on `processed-intel`. A Scout's `ON_SPOT_ENEMY` sends `position` data. Same channel, different data shape. Downstream listeners expecting compressed intel now receive raw positions.
- The "partial hook" state occupies a slot. On a Scout with 2 slots, a half-pasted hook in slot 1 means only 1 slot is usable until the player resolves it. If the player forgets or doesn't notice, they've burned a slot.

**Comparable:** CSS paste between documents where selectors transfer but property values need adjustment. Google Docs paste-without-formatting — the structure survives, the styling needs rework.

---

### Pattern 3: "The Nerve Graft" — Automatic Trigger Substitution with Audit Trail

**How it works:** The system maintains a trigger equivalence map — analogous to the action equivalence table in rules copy-paste (3.07b Model B). When pasting a hook with an incompatible trigger, the system automatically substitutes the closest available trigger on the target unit type. The channel name and payload transfer unchanged. An "adapted" badge appears on the hook strip for 5 seconds, and hovering it reveals the substitution: "Original trigger: compress_completed → Substituted: ON_RECEIVE_SIGNAL (closest signal-processing event)."

**The Trigger Equivalence Map (partial):**

| Original Trigger | Scout | Striker | Relay | Specialist | Command |
|-----------------|-------|---------|-------|-----------|---------|
| ON_SPOT_ENEMY | ON_SPOT_ENEMY | ON_THREAT_ENTER | ON_RECEIVE_SIGNAL | ON_SPOT_ENEMY | ON_RECEIVE_SIGNAL |
| ON_RECEIVE_SIGNAL | ON_RECEIVE_SIGNAL | ON_RECEIVE_SIGNAL | ON_RECEIVE_SIGNAL | ON_RECEIVE_SIGNAL | ON_RECEIVE_SIGNAL |
| compress_completed | — (no analog) | — (no analog) | compress_completed | — (no analog) | — (no analog) |
| ON_ELIMINATE | ON_THREAT_EXIT | ON_ELIMINATE | ON_RECEIVE_SIGNAL | ON_SPOT_ALLY | ON_RECEIVE_SIGNAL |
| hack_successful | ON_SPOT_ENEMY | ON_THREAT_ENTER | ON_RECEIVE_SIGNAL | hack_successful | ON_RECEIVE_SIGNAL |

**Strengths:**
- Maximum efficiency. Paste always succeeds. The player's architectural intent ("put this unit on `recon-net`") is preserved instantly.
- The substitution communicates trigger equivalences the player might not have discovered: "oh, the Scout's version of the Relay's `compress_completed` is... nothing. Scouts don't process signals. I need a fundamentally different trigger."

**Weaknesses:**
- The equivalence map is even more suspect for triggers than for actions. `ON_SPOT_ENEMY` and `ON_RECEIVE_SIGNAL` are categorically different events — one is perception, the other is communication. Automatic substitution conflates "seeing something" with "hearing about something." The player thinks the hook "works" but the trigger fires under completely different conditions.
- Triggers with no analog (like `compress_completed` on a Scout) force a fallback to the most generic trigger (`ON_RECEIVE_SIGNAL`), which might fire constantly and flood the channel with noise.
- "Adapted" badge fatigue — players learn to ignore it, and the audit trail becomes invisible.

**Comparable:** Google Translate preserving sentence structure but substituting words that shift meaning. Factorio blueprint paste onto incompatible terrain — entities placed where possible, gaps left where not.

---

### Pattern 4: "The Compatibility Overlay" — Pre-Paste Preview with Conflict Annotation

**How it works:** Before confirming the paste, the system shows a preview overlay on the target blueprint. Compatible hooks display with green check marks. Incompatible hooks display with amber warning icons and inline suggestions. The player can accept, modify, or cancel each hook individually before any slot is consumed. This is a non-modal preview — it overlays the hook slots without a separate dialog.

**Visual description:** The player presses Ctrl+V on the target blueprint. Instead of immediately pasting, the empty hook slots shimmer with a translucent preview of the incoming hooks. Each previewed hook strip has a thin status bar on its left edge:

- **Green bar** (4px wide, #00cc66): Trigger is compatible. Channel transfers. Full paste ready. A small checkmark icon sits at the top of the bar.
- **Amber bar** (4px wide, #d4a017): Trigger is incompatible. The trigger zone shows the original trigger in strikethrough with the system's suggested substitute below it in amber text. The channel zone is green — it transfers fine. A small wrench icon sits at the top of the bar. Clicking the wrench opens the trigger radial for manual selection.

At the bottom of the hook slot area, two buttons appear: "PASTE ALL (accept suggestions)" and "CANCEL." Keyboard: Enter accepts all, Escape cancels, Tab cycles through amber hooks for manual resolution.

The preview persists until the player acts — no timeout. If the player clicks elsewhere on the workbench, the preview cancels with a soft dissolve.

**Strengths:**
- Maximum transparency without modal interruption. The player sees the compatibility state of every hook before committing any slot.
- Inline suggestions educate without forcing. The player sees "ON_SPOT_ENEMY → suggested for Scouts" and learns the trigger vocabulary through paste previews.
- No wasted slots. Nothing occupies a slot until the player confirms.

**Weaknesses:**
- Visual complexity. The preview overlay adds translucent strips with status bars, strikethroughs, suggestions, and action buttons on top of existing hook slots. On a Relay with 4 slots, this could feel cluttered.
- The "PASTE ALL" shortcut encourages accepting suggestions without review, negating the educational value.
- Implementation cost: preview state management, overlay rendering, per-hook accept/reject tracking.

**Comparable:** Git diff preview before committing. IDE refactoring preview showing all affected references. Figma's smart paste preview showing constraint adjustments.

---

### Pattern 5: "The Progressive Nerve Graft" — Follows the Growing Clipboard Timeline

**How it works:** Hook copy-paste sophistication follows the same progressive unlock timeline as rule copy-paste (3.07b Model F), but hooks unlock one mission later than rules — hooks are the more complex primitive. The progression:

- **Missions 1-5:** No hook copy-paste. Players are still learning what hooks are.
- **Mission 6-7:** "Channel Clone" — paste copies only the channel name and payload config into an empty hook slot. The trigger must be configured manually. Boot log: `HOOK CLIPBOARD v1.0 — channel wiring now transferable.`
- **Mission 8-9:** "Compatibility Preview" — the overlay pattern (Pattern 4) activates. Compatible hooks paste silently; incompatible hooks show the preview with suggestions. Boot log: `HOOK CLIPBOARD v2.0 — trigger compatibility analysis online.`
- **Mission 10+:** Full hook pattern library integration — hooks can be saved as named patterns alongside rules in the shared Pattern Library (3.07b Model E). A saved pattern can bundle rules AND hooks: "CIRCUIT_BREAKER_v2 includes 3 rules + 1 hook."

**Strengths:**
- Matches the campaign's progressive disclosure perfectly. Hook copy-paste appears after rule copy-paste (which unlocks at Mission 5), reinforcing that hooks are the deeper primitive.
- Each unlock is a diegetic boot-log moment — the clipboard subsystem's hook module coming online.
- The "Channel Clone" phase (Mission 6-7) teaches the most important lesson first: channel wiring is the reason to copy hooks. Triggers are unit-specific and must be chosen intentionally.

**Weaknesses:**
- Late availability. A player in Mission 7 who has built a beautiful 4-hook Relay architecture and wants to replicate the channel wiring on a second Relay must manually type channel names into each slot.
- Three distinct hook-paste systems across the campaign.

---

## Recommendation: Pattern 5 with Pattern 2 as Foundation

The Progressive Nerve Graft (Pattern 5) aligns with the game's established progressive disclosure and with the Growing Clipboard already recommended for rules (3.07b). Pattern 2 ("The Rewire Bench") provides the right mechanical foundation: channel names are the portable, valuable part of a hook; triggers are the unit-specific part that must be chosen intentionally. The ghosted strikethrough of the original trigger is both a practical reference and a teaching device — it shows the player what the source unit could detect that the target unit cannot.

The differentiation from rule copy-paste is critical: rules use cyan for empty action slots; hooks use amber for empty trigger slots. This color coding teaches a structural lesson — in rules, the *response* differs by unit type; in hooks, the *perception* differs by unit type. Same game, same copy-paste flow, different incompatibility axis.

---

## Player Journeys

#### Journey: Priya, 24, Bangalore — Backend Engineer Who Plays Factorio

**Context:** Mission 7. Priya has a well-architected Relay blueprint ("Switchboard-Alpha") with 4 hooks wired to a channel topology she spent 10 minutes designing: `recon-net`, `threat-bus`, `processed-intel`, and `status-heartbeat`. She's building a second Relay blueprint ("Switchboard-Beta") for a flanking relay position and wants the same channel architecture with different trigger thresholds.

**Minute 0:00 — The Copy**
Priya opens Switchboard-Alpha's hook panel. Four filled slots, each a solid cyan-bordered strip with trigger icons on the left and color-coded channel names on the right. She holds Shift and clicks all four strips — they light up with selection borders. She presses Ctrl+C. The clipboard icon in the workbench corner shows "4 hooks." The strips lift 2px with their cyan glow. She's been using the rule clipboard since Mission 5; hook clipboard is new as of this mission's boot log announcement.

**Minute 0:10 — The Same-Type Paste**
She switches to Switchboard-Beta. Four empty hook slots, dashed outlines pulsing gently. Ctrl+V. All four hooks materialize instantly — green status bars on every strip. Every trigger is compatible (both are Relays; trigger vocabularies are identical). Every channel name transfers: `recon-net` in its teal fill, `threat-bus` in its crimson fill, `processed-intel` in its gold fill, `status-heartbeat` in its gray-blue fill. The magnetic "tchk" plays four times in rapid succession — tchk-tchk-tchk-tchk — like a card dealer snapping out a hand. Counter: "4 / 4 hooks — COMPLETE."

The entire paste took under 2 seconds. Without copy-paste, Priya would have configured 4 trigger dropdowns, typed 4 channel names (with autocomplete), and set 4 payload types — roughly 90 seconds of clicking and typing. The copy saved her a minute of configuration that would have been identical to what she already designed.

**Minute 0:25 — The Threshold Adjustment**
Priya clicks on Switchboard-Beta's second hook — `ON_RECEIVE_SIGNAL on threat-bus → amplify → striker-orders`. She changes the amplify strength parameter from 2x to 3x — the flanking relay is farther from the striker group and needs a stronger signal. She adjusts the buffer threshold on hook 3 from 70% to 50% — Beta should compress earlier because it receives signals from more scouts. Two quick parameter edits. The hooks are identical in architecture but tuned for a different tactical position.

**Minute 0:40 — The Insight**
Priya stares at her two Relay blueprints side by side. Identical channel wiring. Different tuning. She thinks: "This is like deploying the same Kubernetes service to two regions with different environment variables." The channel names are the API contracts; the trigger parameters are the per-environment config. Copy-paste gave her the contracts; manual editing gave her the config.

**UI Annotations:**
- Same-type paste: All green status bars, no amber warnings, no empty trigger slots — fastest possible paste path
- Channel color continuity: Pasted channel names retain their palette colors from the source blueprint, reinforcing visual continuity across the architecture
- Parameter editing post-paste: Click any token in a pasted hook to modify its parameters without rebuilding the whole hook
- Batch selection: Shift+click for range selection across hook slots, Ctrl+click for individual toggle

---

#### Journey: Marcus, 31, Austin — Indie Game Developer and Twitch Viewer

**Context:** Mission 8. Marcus has a Scout blueprint ("Vanguard") with 2 hooks: `ON_SPOT_ENEMY → send position on recon-net` and `ON_THREAT_ENTER → send threat_level on danger-close`. He wants to give his Striker blueprint ("Hammerhead") similar network participation — the Striker should also contribute to `recon-net` and `danger-close` when relevant.

**Minute 0:00 — The Cross-Type Copy**
Marcus copies both hooks from Vanguard. Clipboard shows "2 hooks." He switches to Hammerhead's blueprint. Two empty hook slots. Ctrl+V. The compatibility preview overlay activates — two translucent hook strips shimmer into the empty slots.

Hook 1 preview: **Amber bar.** The trigger zone shows `~~ON_SPOT_ENEMY~~` in strikethrough with a suggestion below: `ON_THREAT_ENTER (closest perception trigger)`. The channel zone shows `recon-net` in its teal fill with a green check — the channel transfers fine. The wrench icon pulses gently.

Hook 2 preview: **Green bar.** `ON_THREAT_ENTER` is available on Strikers. The channel `danger-close` transfers intact. Full paste ready.

**Minute 0:15 — The Conflict Resolution**
Marcus looks at hook 1's amber warning. The suggestion says `ON_THREAT_ENTER` — but that's the same trigger as hook 2. He doesn't want both hooks firing on the same event. He clicks the wrench icon. The trigger radial opens, showing Striker-available triggers: `ON_THREAT_ENTER`, `ON_ELIMINATE`, `ON_RECEIVE_SIGNAL`, `ON_SKILL`. He hovers over `ON_ELIMINATE` — tooltip: "Fires when this unit destroys an enemy." He selects it. The trigger snaps into place: "WHEN enemy eliminated → SEND position ON recon-net." The amber bar transitions to green with a 200ms color slide.

Now hook 1 fires when the Striker kills something (contributing kill locations to recon-net) and hook 2 fires when a threat enters range (contributing threat data to danger-close). Different triggers, same channels, different unit-type-appropriate events. Marcus clicks "PASTE ALL." Both hooks solidify. Tchk-tchk.

**Minute 0:30 — The Architectural Realization**
Marcus opens the channel map panel. `recon-net` now shows two senders: Vanguard (Scout) and Hammerhead (Striker). The Scout sends observation data. The Striker sends kill confirmations. Same channel, two data types. The Relay listening on `recon-net` receives both — scout sightings AND striker kills. Marcus realizes the channel is richer now: the Relay's compress skill will merge observations and kills into a tactical picture that neither unit could produce alone. He didn't plan this. The copy-paste workflow — pasting the channel name, then choosing a unit-appropriate trigger — led him to a compositional architecture he wouldn't have designed from scratch.

**UI Annotations:**
- Compatibility preview: Non-modal overlay on hook slots, green/amber status bars, wrench icon for manual trigger selection
- Trigger radial (during paste): Filtered to target unit type, shows tooltip for each trigger explaining when it fires
- Channel map update: Real-time — the channel map reflects the paste immediately after confirmation, showing new senders/listeners
- Original trigger strikethrough: `~~ON_SPOT_ENEMY~~` in 50% opacity with a thin line through it, positioned above the suggestion text

---

#### Journey: Lena, 42, Berlin — Systems Architect, Late-Campaign Expert

**Context:** Mission 10. Lena has a sophisticated 5-blueprint architecture. She's copying hooks from her Relay blueprint ("Nexus") to her Command blueprint ("Overwatch"). The Relay has 4 hooks; the Command has 6 slots with 3 already filled. She wants to transplant the Relay's channel monitoring hooks onto the Command unit to create redundant signal coverage.

**Minute 0:00 — The Selective Copy**
Lena doesn't want all 4 Relay hooks — just 2 that monitor `threat-bus` and `resource-net`. She Ctrl+clicks hooks 1 and 3 on the Relay. Clipboard: "2 hooks." She switches to Overwatch.

**Minute 0:08 — The Cross-Type Paste with Partial Compatibility**
Ctrl+V. Compatibility preview on Overwatch's empty slots 4 and 5.

Hook 1 (from Relay): `ON_RECEIVE_SIGNAL on threat-bus → compress and forward on striker-orders`. **Amber bar.** The trigger `ON_RECEIVE_SIGNAL` is available on Command units — green check on the trigger. But the action embedded in the hook — "compress and forward" — is a Relay skill. Command units cannot compress. The amber bar flags the payload action, not the trigger. Tooltip: "Command units cannot compress. The hook will receive on threat-bus but cannot compress the payload. Suggested: forward raw signal (no compression)."

Hook 2 (from Relay): `ON_RECEIVE_SIGNAL on resource-net → filter by priority → specialist-orders`. **Amber bar.** Same issue — `filter` is a Relay skill. Command units don't filter; they `prioritize`. The suggestion reads: "Closest alternative: prioritize (reorder by urgency instead of discarding)."

**Minute 0:20 — The Expert Resolution**
Lena studies both suggestions. She agrees with hook 2's suggestion — `prioritize` instead of `filter` is the right Command-unit equivalent. She clicks "Accept" on hook 2. For hook 1, she disagrees — raw forwarding without compression will flood the Striker channel with noise. She clicks the wrench. Instead of changing the trigger, she modifies the payload action to `prioritize and forward` — the Command unit will reorder signals by urgency before forwarding, a different kind of noise reduction than compression but appropriate for a Command unit's skill set. She clicks "PASTE ALL."

Both hooks solidify. The Command blueprint now has 5 of 6 slots filled. The channel map updates: `threat-bus` shows Relay AND Command as listeners. `striker-orders` shows Relay AND Command as senders. Redundant signal processing — if the Relay goes down, the Command unit still routes threat data to Strikers. Different processing (compress vs. prioritize), same channel contracts.

**Minute 0:35 — The Pattern Save**
Lena right-clicks hook 1 on Overwatch. "Save as Pattern." She names it "THREAT_MONITOR_v3" and checks "trigger as placeholder" and "action as placeholder" — the channel names (`threat-bus` → `striker-orders`) are the valuable part. The trigger and action should be filled per-unit-type. The pattern saves to her library. She now has a reusable "monitor channel X, process, forward to channel Y" template that works on any unit type — just fill in the trigger (what causes this unit to process) and the action (how this unit processes).

**Minute 0:50 — The Satisfaction**
Lena opens the Pattern Library. She drags THREAT_MONITOR_v3 onto a new Specialist blueprint she's been meaning to configure. The hook appears with channel names filled (`threat-bus` → `specialist-orders` — she edits the output channel for the Specialist context) and trigger + action as pulsing amber slots. She fills the trigger with `ON_RECEIVE_SIGNAL` and the action with `extract and forward` — the Specialist's version of signal processing. Three different unit types, three different processing skills, same channel monitoring pattern. She's built a signal processing mesh.

**UI Annotations:**
- Payload action incompatibility: Distinct from trigger incompatibility — the amber bar tooltip specifies "action unavailable" vs. "trigger unavailable," teaching that hooks have TWO potential incompatibility axes
- Pattern save with dual placeholders: Checkbox UI allows marking trigger, action, or both as placeholders — channel names are always preserved
- Channel map redundancy indicator: When two blueprints send on the same channel, a small "2x" badge appears on the channel's node in the map, signaling redundancy

---

## Strengths and Weaknesses

**Strengths of hook copy-paste:**
- **Channel architecture reuse is the primary productivity gain.** Typing channel names, matching colors, verifying subscribers — this is the tedious work that copy-paste eliminates. Pasting a hook that already references `recon-net` with its teal color and 3-listener subscriber count saves 15-20 seconds per hook and eliminates typo risk.
- **Cross-type paste teaches the trigger vocabulary.** Seeing `~~ON_SPOT_ENEMY~~` struck through on a Striker, with `ON_THREAT_ENTER` suggested, teaches the player that Strikers don't observe — they react to proximity threats. The paste failure IS the lesson about unit-type sensory differences.
- **Redundant channel coverage emerges naturally.** Pasting a Relay's `threat-bus` hook onto a Command unit creates redundant signal processing. This architectural pattern (multiple processors on the same channel) is hard to discover from scratch but obvious when copy-paste puts two units on the same channel.

**Weaknesses and risks:**
- **False confidence from channel-name portability.** The channel name transfers perfectly, but the data flowing through it changes. A Scout sending raw positions on `recon-net` and a Relay sending compressed intel on `recon-net` are semantically different signals on the same pipe. Downstream listeners may break silently. The channel map shows topology but not data contracts.
- **Payload shape mismatch is invisible.** Unlike trigger incompatibility (which the system can detect and flag), payload shape differences are semantic, not syntactic. The system cannot know that a listener on `processed-intel` expects compressed data, not raw observations. This is the "works at paste time, breaks at runtime" problem — the analog of a function that type-checks but produces wrong results.
- **Slot scarcity makes bad pastes expensive.** A Scout with 2 hook slots who burns one on a half-pasted hook (channel preserved, trigger empty) has halved their reactive capacity until they resolve it. The "incomplete hook" state is more costly for hooks than for rules because of the tighter slot budget.
- **Batch paste across types is rare but complex.** Copying 4 hooks from a Relay to a Command unit requires evaluating 4 triggers, 4 payload actions, and 4 channel names for compatibility. The preview overlay with 4 amber/green bars approaches visual overload. The value proposition (copying one hook at a time is easy enough) may not justify the batch complexity.

---

## Interaction Effects

- **Channel Naming Conventions (3.08b):** Copy-paste is the primary propagation mechanism for channel naming conventions. When a player copies a hook from a community-shared blueprint template, the channel name `recon-net` propagates to their architecture. Over time, the most-copied blueprints establish de facto channel naming standards. Copy-paste is culture transmission.

- **Hook Slot Economy (3.08c):** Every pasted hook occupies a slot. On a 2-slot Scout, pasting 1 hook consumes 50% of the unit's reactive capacity. The paste preview should show the slot counter updating: "1/2 → 2/2 hooks" — making the slot cost viscerally clear before the player commits.

- **Hook Chaining (3.09):** If hooks can trigger other hooks (same-tick chaining), pasting a hook onto a new unit type can create cascade paths that didn't exist before. A hook pasted onto a Command unit that listens on `threat-bus` and sends on `command-net` extends a signal chain by one hop. The channel map should highlight new cascade paths created by paste operations.

- **Rules Copy-Paste (3.07b):** Hook copy-paste and rule copy-paste are complementary operations. A "circuit breaker" pattern includes both rules ("IF context_fill > 80% → DO filter") and hooks ("ON_CONTEXT_FULL → send alert on `status-net`"). The Pattern Library (Mission 9+) should support saving mixed bundles: rules + hooks as a single named pattern. Pasting a mixed pattern applies rule copy-paste logic to the rules and hook copy-paste logic to the hooks — each subsystem handles its own incompatibilities.

- **Blueprint Templates (locked):** Default blueprint templates for each unit type should include pre-wired hooks on canonical channels. When the player creates a new Scout blueprint from the "Standard Sensor" template, it arrives with `ON_SPOT_ENEMY → recon-net` pre-configured. Copy-paste extends templates — the player copies a template hook and modifies the channel name, creating a variant. Templates seed the architecture; copy-paste propagates it.

- **Factory Production Queue:** Pasting hooks between blueprints changes the network topology, which may invalidate production queue assumptions. If the player has 3 Scouts in the queue using "Vanguard" (with 2 hooks on `recon-net`) and then pastes those same hooks onto a new "Vanguard-Beta" blueprint, the production queue might need adjusting — do the rear scouts still need `recon-net` hooks, or should they use Vanguard-Beta with different triggers? Copy-paste creates blueprint variants; the production queue must accommodate variant proliferation.

- **Dead Hook Diagnostic (3.11d):** A pasted hook with a preserved channel name but a substituted trigger might create a "semantically dead" hook — it fires on events that produce data irrelevant to the channel's consumers. The dead hook diagnostic should flag hooks where the trigger type and channel consumer expectations are mismatched: "This hook sends raw position data on `processed-intel`. 2 listeners on this channel expect compressed data."

---

## Comparable Games and Systems

- **IDE Code Copy-Paste with Compile Errors:** Copying a Java method from one class to another. The method body references `this.compress()` — if the target class doesn't have `compress()`, the IDE underlines it in red immediately. You see the error before you run. Robot Uprising's paste preview is the equivalent of real-time compile errors — flagging trigger incompatibilities at paste time, not at battle time.

- **Factorio Blueprint Copy with Entity Substitution:** Factorio lets you copy blueprints and paste them. If the pasted area has different terrain (water instead of land), some entities can't be placed — they appear as red ghosts. The player sees exactly which entities are incompatible and can adjust. Robot Uprising's amber/green status bars serve the same function: "this part transferred, this part didn't."

- **Spreadsheet Paste-with-Formula-Adjustment:** When you copy a cell with `=A1+B1` and paste it one row down, the formula auto-adjusts to `=A2+B2`. The structure (addition of two cells) is preserved; the references shift contextually. Hook copy-paste's trigger substitution is analogous — the structure (trigger → channel) is preserved, but the trigger shifts to the target unit's vocabulary. The difference: spreadsheet adjustment is deterministic (row offset); trigger substitution requires a heuristic equivalence map.

- **VS Code Refactoring — Rename Symbol:** When you rename a function, VS Code shows a preview of all affected files before applying. You see every reference that will change, with before/after comparison. The Compatibility Overlay (Pattern 4) borrows this preview-before-commit pattern — showing the player every hook that will change before any slot is consumed.

- **Terraform Module Reuse:** A Terraform module defines infrastructure in abstract terms (a "load balancer" module). When you instantiate it in a new environment, you provide environment-specific variables (region, instance size, VPC). The module structure is the hook's channel wiring; the variables are the unit-specific triggers. The Pattern Library (Mission 10+) makes this analogy explicit — saved hook patterns are reusable modules with trigger and action as "variables."

---

## Sensory Description

**The Hook Copy:** Selecting a hook strip for copy produces a sound distinct from rule copying — not the papery "shhk" of a card slide, but a sharper electronic "click-snap," like unplugging a patch cable from a mixing board. The strip lifts with a cyan border, but the channel name zone glows slightly brighter than the trigger zone — visually emphasizing that the channel wiring is what's being carried on the clipboard. The clipboard icon shows the hook count with a small lightning bolt overlay (⚡) distinguishing hook copies from rule copies (≡).

**The Compatible Paste:** When all triggers match (same unit type), the paste is fast and musical. Each hook strip materializes with a horizontal scan line sweeping left-to-right — trigger icon first, arrow, then channel name with its color fill flooding in like liquid. The "tchk" snap per hook. On a 4-hook Relay-to-Relay paste, the four tchks play in rapid 80ms intervals — a mechanical burst that sounds like a card shuffler. The channel color fills create a cascade of color: teal, crimson, gold, gray-blue, each flooding its strip in sequence. The hook slots go from four dashed voids to four living circuits in under a second.

**The Incompatible Paste Preview:** The preview state has a distinctive visual temperature — cooler and more tentative than a confirmed paste. Previewed hooks are rendered at 60% opacity, floating 1px above their target slots as if not yet committed. The amber status bars glow with a slow 2-second pulse — warm, cautious, amber light washing across the strip's left edge. The strikethrough text of the incompatible trigger is rendered in a muted red (#cc4444 at 50% opacity), thin line through the center of each character. Below it, the suggestion text in amber (#d4a017) feels warmer, inviting — "here's what could work instead."

The wrench icon for manual trigger selection rotates 15 degrees clockwise and back in a slow oscillation — a subtle "I'm adjustable" animation. Clicking it opens the trigger radial with a soft pneumatic hiss sound — like opening a valve. Selecting a trigger produces the magnetic tchk, and the amber bar transitions to green with a left-to-right color wipe: amber retreating, green advancing, meeting and replacing in 200ms.

**The Mixed Paste Confirmation:** When the player clicks "PASTE ALL" on a batch with some accepted suggestions, the confirmed hooks solidify in sequence — green-bar hooks first (instant, confident, full-opacity snap), then amber-resolved hooks (0.5s delay, the adapted trigger fading from amber to standard cyan as it locks in). The staggered confirmation communicates "these were easy; those required work." A two-note ascending tone plays at the end — lower than the rule completion cascade, with a slightly metallic timbre that says "wiring" rather than "writing."

**The Failed Paste (Pattern 1 only):** If using the hard-reject model, the failure has a distinctive electrical quality. The ghost hook strip in the target slot flickers — not a smooth pulse, but a rapid stutter like a fluorescent light with a bad ballast. The trigger zone sparks with tiny amber particles that scatter outward — 6-8 particles, each a 2px square, trajectories randomized, fading over 400ms. The sound is a brief, dry electrical "bzzkt" — not harsh, but clearly mechanical failure. A blown fuse, not an explosion. The channel name zone stays stable and cyan throughout, visually confirming: "the wiring destination was fine; the source connection point doesn't exist on this unit."

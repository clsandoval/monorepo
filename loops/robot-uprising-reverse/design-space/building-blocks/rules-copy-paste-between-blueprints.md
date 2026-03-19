# 3.07b — Rules Copy-Paste Between Blueprints: The Clipboard Architecture Problem

## Overview

The locked spec defines blueprints as independent configuration bundles — each unit type has its own skills, rules, hooks, and context config. The Rules UI (3.07) explores how the player *constructs* rules within a single blueprint. The Rules Panel at Scale (3.07a) explores how 12-20 rules display on one blueprint. This document explores a different question entirely: **can the player lift a rule strip from one blueprint and paste it into another?**

This is "The Clipboard Architecture Problem." A player who built a solid defensive rule on their Scout blueprint ("IF enemy_spotted AND distance < 2 → DO evade nearest") might want to reuse it on their Striker blueprint. Today, without cross-blueprint copy, they must manually reconstruct every token — the signal type, the distance qualifier, the action verb, the target specifier — from scratch. For a 4-rule Scout, this is tolerable. For a 12-rule Command unit where half the rules share patterns with Relay configurations, it is tedious, error-prone, and anti-fun.

But the problem is not simply "add Ctrl+C / Ctrl+V." Rules reference conditions and actions that are unit-type-specific. A Scout can `evade`; a Relay cannot. A Relay can `compress`; a Striker cannot. A Command unit can `reassign`; nobody else can. Pasting a Scout rule into a Relay blueprint means crossing a type boundary — the condition might still apply, but the action might be illegal. The design must decide what happens at that boundary.

The deeper question: **should cross-blueprint rule sharing feel like copying text between documents, or like transplanting an organ between species?**

---

## The Core Tension

Three forces collide:

1. **Efficiency** — Players who have solved one behavioral pattern want to reuse it everywhere. Rebuilding from scratch is busywork, especially for common defensive patterns ("IF context_overload_imminent → DO evade/compress/filter" depending on unit type). The game should respect the player's time.

2. **Type Safety** — Each unit type has a locked skill set. Scout has `patrol` and `evade`. Relay has `compress`, `filter`, `amplify`. Striker has `engage` and `breach`. Pasting a rule with an incompatible action creates an invalid configuration. The system must prevent, adapt, or surface this incompatibility.

3. **Pedagogical Value** — The differences between unit types ARE the curriculum. A player who copies a Scout's evasion rule onto a Relay without understanding that Relays cannot evade has not learned the unit-type-specific design space. Frictionless copy-paste might let players cargo-cult configurations without comprehension. Some friction teaches.

---

## Six Copy-Paste Models

### Model A: "The Xerox" — Verbatim Copy, Hard Reject on Incompatibility

**How it works:** Select one or more rule strips in a blueprint → Ctrl+C (or long-press + "Copy" on mobile) → switch to another blueprint → Ctrl+V. If every condition and action in the copied rules exists on the target unit type, the rules paste at the bottom of the priority list. If ANY action is incompatible, the paste fails entirely with a red flash and an error tooltip: "Striker cannot perform 'compress' — rule not pasted."

**Visual description:** The copied rule strip lifts with a 100ms scale-up to 102% and a faint cyan border glow — "picked up." Switching blueprints shows a translucent ghost strip at the bottom of the target's rule list, pulsing gently. On paste success: the ghost solidifies with a satisfying magnetic "tchk" and slides into the priority list. On paste failure: the ghost turns red, vibrates 3 times in 300ms (a rapid side-to-side shake of 2px), then dissolves into red particles that drift downward and fade. A tooltip appears in amber: "INCOMPATIBLE ACTION: compress is not available on Striker units."

**Strengths:**
- Zero ambiguity. What you copied is what you get, or you get nothing.
- Forces the player to understand unit-type boundaries — the rejection IS the lesson.
- Simplest implementation. No transformation logic needed.

**Weaknesses:**
- Frustrating at scale. A 6-rule copy where 5 rules are compatible and 1 is not rejects ALL 6. The player must identify the offender, exclude it, and retry.
- Conditions are almost always portable (enemy_spotted, buffer_full, channel_message work everywhere), so the rejection feels disproportionate — one bad action kills an entire batch.
- No guidance on HOW to fix the incompatibility.

**Comparable:** CSS copy-paste between documents — works if the selectors exist, silently fails if they don't. TypeScript strict mode — won't compile if types mismatch.

---

### Model B: "The Transplant" — Copy with Automatic Action Substitution

**How it works:** When pasting a rule into an incompatible blueprint, the system automatically substitutes the closest available action. Scout's `evade` → Relay's `filter` (both are defensive responses). Scout's `patrol` → Striker's `engage` (both involve movement toward objectives). The substitution follows a hand-authored equivalence table mapping all 12 skills to their closest analog on each unit type.

**Visual description:** On paste, the condition tokens appear in their original colors, but the action token slides in with an amber border and a brief shimmer animation — a 400ms golden ripple that travels left-to-right across the substituted token, ending with the new action label fading in. A small "adapted" badge (amber circle with a curved arrow icon) appears on the right edge of the rule strip for 5 seconds, then fades. Hovering the badge shows: "Original action: evade → Substituted: filter (closest defensive response)."

**The Equivalence Table (partial):**

| Original Action | Scout | Relay | Striker | Specialist | Command |
|----------------|-------|-------|---------|-----------|---------|
| patrol | patrol | — (stationary) | engage | hack | prioritize |
| evade | evade | filter | breach | extract | reroute |
| engage | patrol | amplify | engage | hack | reassign |
| compress | evade | compress | engage | extract | prioritize |
| reassign | — | — | — | — | reassign |

**Strengths:**
- Maximum efficiency. Paste always works. The player's intent ("defensive response when threatened") is preserved even when the specific skill changes.
- Teaches unit-type equivalences implicitly — seeing "evade → filter" communicates that filter is the Relay's defensive response.

**Weaknesses:**
- The equivalence table is a lie. `evade` and `filter` are fundamentally different behaviors — one moves the unit, one drops buffer entries. Automatic substitution creates a false sense of correctness. The player thinks their rule "works" but the behavior is entirely different.
- Hides the unit-type design space rather than teaching it.
- The equivalence table is inherently subjective. Is `evade`'s closest Relay analog `filter` or `compress`? Reasonable players would disagree. Any fixed mapping will feel wrong to someone.
- "Adapted" badge fatigue — players learn to ignore it, defeating its pedagogical purpose.

**Comparable:** Google Translate — preserves meaning approximately, but nuance is lost and the result sometimes does the opposite of what you intended. Factorio's blueprint paste into incompatible terrain — items placed where possible, gaps left where not.

---

### Model C: "The Skeleton Key" — Copy Conditions Only, Leave Actions Empty

**How it works:** Cross-blueprint paste copies the CONDITION side of every rule but leaves the ACTION side as an empty slot with a pulsing dashed outline. The player must manually fill in the action for each pasted rule. If the condition itself references a unit-specific capability (rare but possible for conditions like "IF hack_successful"), that condition token also becomes an empty pulsing slot.

**Visual description:** Pasted rules appear with their left (condition) side fully populated — amber-accented tokens in place, familiar from the source blueprint. The right (action) side is a series of hollow dashed rectangles pulsing in slow cyan — each 1.5 seconds, the dashes brighten from 30% to 70% opacity and back, like a heartbeat. The rule strip has a thin diagonal hatching overlay (45-degree lines, 4px spacing, 8% white opacity) across the empty action zone — an "under construction" texture. The overall strip background is slightly lighter than normal rules (#34344a instead of #2a2a3a), marking it as incomplete.

Clicking an empty action slot opens the standard radial menu, but filtered to show only actions available on the target unit type. The slot fills with the standard magnetic "tchk" snap. When all empty slots in a pasted batch are filled, a brief cascade animation runs — each strip's hatching dissolves from left to right in sequence, 100ms apart, with a soft ascending chime for each strip. The final strip triggers a slightly louder "completion" chime — a two-note ascending fifth.

**Strengths:**
- Preserves the useful part (conditions ARE portable — enemy_spotted works everywhere) while forcing engagement with the type-specific part (actions differ by unit).
- The "incomplete rule" visual state is a powerful teaching tool — the player sees exactly WHERE the type boundary lives.
- Scales well for batch operations. 6 conditions pasted, 6 actions to fill, but the conditions were the slow part (distance qualifiers, boolean composition).

**Weaknesses:**
- Still requires manual work for every rule. For a 6-rule paste, the player clicks 6 action slots. Better than rebuilding from scratch, but not zero-effort.
- The "skeleton" state is confusing on first encounter — "why is half my rule missing?"

**Comparable:** Code refactoring with type stubs — the structure is preserved, but every interface implementation must be filled in. Slay the Spire's card transformation — you pick the replacement, the system picks the candidates.

---

### Model D: "The Diplomat" — Interactive Conflict Resolution Dialog

**How it works:** When pasting rules with incompatible actions, a modal dialog appears — "The Embassy" — showing each conflicting rule with the original action on the left and a dropdown of compatible alternatives on the right. The player resolves each conflict before the paste completes. Compatible rules paste silently. Only conflicts require attention.

**Visual description:** The Embassy modal slides up from the bottom of the workbench, dimming the blueprint behind it to 40% opacity. It is a 400px-tall panel with a dark navy background (#1a1a2a) and a thin amber border. The header reads "COMPATIBILITY REVIEW" in monospace, with a subheader "3 of 8 rules need adaptation."

Each conflicting rule is displayed as a horizontal card. The left half shows the original rule in its source blueprint's visual treatment — condition tokens, action token with a red strikethrough line and a small "unavailable" icon (circle-slash). The right half shows a dropdown menu pre-populated with the system's best guess for the closest compatible action, but the player can change it. Below the dropdown, a one-line description explains why the original action is incompatible: "Relay units do not have the 'evade' skill. Closest alternative: 'filter' (defensive response)."

At the bottom: "PASTE ALL" button (fills remaining conflicts with suggested alternatives) and "CANCEL" buttons. Keyboard shortcut: Tab cycles through conflicts, Enter accepts suggestion, Escape cancels.

**Strengths:**
- Maximum transparency. The player sees every incompatibility, understands why it exists, and makes an informed choice.
- The system's suggestion educates without forcing — the player can override.
- Batch-friendly. 5 compatible rules paste instantly; only 3 conflicts need attention.

**Weaknesses:**
- Modal dialog interrupts flow. Copy-paste should be a 200ms operation, not a 15-second dialog.
- For expert players who copy-paste frequently, the dialog becomes a speed bump.
- The "PASTE ALL" shortcut encourages mindless acceptance, negating the pedagogical value.

**Comparable:** Git merge conflict resolution — the system shows conflicts, you resolve them. Figma's "Paste and match style" vs "Paste" distinction. IDE refactoring dialogs that show every affected reference.

---

### Model E: "The Pattern Library" — Named Reusable Rule Templates

**How it works:** Instead of copy-paste between blueprints, the player saves rule PATTERNS to a shared library. A pattern is a condition template with a placeholder action: "IF enemy_spotted AND distance < {threshold} → DO {defensive_response}." When applied to a blueprint, the player fills in the placeholders with unit-specific values. The pattern library is accessible from all blueprints.

**Visual description:** A new section appears at the bottom of the rules panel: "PATTERN LIBRARY" with a small bookshelf icon. The section is collapsed by default, showing only a count badge ("4 patterns"). Expanding it reveals saved patterns as compact horizontal strips — similar to rules but with a distinct visual treatment: a parchment-like background (#3a3428), placeholder tokens rendered in italicized gold text with curly-brace decorations, and a small "template" watermark at 8% opacity.

Dragging a pattern from the library onto the rule list creates a new rule with the condition pre-filled and the action as a pulsing empty slot (same as Model C). Alternatively, right-clicking a pattern opens a "Quick Apply" popup where the player selects the action from a filtered radial menu. The pattern remains in the library after use — it is a stamp, not a consumable.

To create a pattern: right-click any rule strip → "Save as Pattern" → a dialog asks the player to name the pattern ("Defensive Retreat", "Resource Priority", "Signal Relay") and optionally mark which tokens should become placeholders. The default is: conditions stay fixed, action becomes placeholder.

**Strengths:**
- Encourages architectural thinking. Naming a pattern forces the player to abstract their intent — "this is my defensive response pattern" — which is a higher-order design skill.
- The pattern library becomes a personal vocabulary of behavioral building blocks. Over time, the player builds a toolkit that reveals their strategic style.
- Patterns persist across missions. A pattern created in Mission 5 is available in Mission 10.
- Cross-mission transfer matches how real engineers work — reusable config templates, Kubernetes Helm charts, Terraform modules.

**Weaknesses:**
- Higher cognitive overhead than simple copy-paste. The player must learn what patterns are, how to create them, how to apply them.
- The pattern library is a new UI element competing for screen space in an already-dense workbench.
- Naming patterns is itself a design challenge. What if the player doesn't want to name things? What if they create 30 patterns and can't find the one they want?
- The library approach replaces an ad-hoc workflow (copy this one rule) with a formal one (maintain a pattern library). Not every player wants the formality.

**Comparable:** Factorio blueprints — named, reusable, shared. Xcode code snippets. VS Code user snippets. Screeps memory-stored config templates. Terraform modules.

---

### Model F: "The Growing Clipboard" — Progressive Copy-Paste Sophistication

**How it works:** Copy-paste evolves across the campaign:
- **Missions 1-4:** No copy-paste (only 1 blueprint exists at a time — pre-placed units with individual configs). No need.
- **Mission 5-6:** "Condition Clone" unlocked. The player can copy conditions between blueprints. Actions must be filled manually (Model C behavior). Boot log announcement: "CLIPBOARD SUBSYSTEM ONLINE — condition patterns now transferable across blueprints."
- **Mission 7-8:** "Full Transplant" unlocked. The Embassy dialog (Model D) appears for incompatible rules. Compatible rules paste silently.
- **Mission 9-10:** "Pattern Library" unlocked. Save named patterns, apply across blueprints, persist across missions (Model E behavior). Boot log: "PATTERN ARCHIVE INITIALIZED — behavioral templates now cataloged for reuse."

**Visual description:** Each unlock introduces a new visual element. Mission 5: a small clipboard icon appears on the rule strip's hover menu (appears when hovering the right edge of a strip — a translucent clipboard with a small "+" badge). Mission 7: the clipboard icon gains an amber gear overlay, indicating "smart paste." Mission 9: the clipboard icon is joined by a bookshelf icon at the bottom of the rules panel.

**Strengths:**
- Matches the campaign's existing progressive disclosure philosophy perfectly. Copy-paste sophistication grows with the player's understanding of unit types.
- Each unlock is a diegetic boot-log moment — the AI's clipboard subsystem coming online, then upgrading.
- Prevents cargo-culting in early missions (no copy-paste when the player doesn't yet understand type boundaries) while removing busywork in late missions (full pattern library when the player is an expert).
- Every previous model contributes to the progression: C at M5, D at M7, E at M9.

**Weaknesses:**
- Late availability. A player struggling with Mission 6's factory introduction might desperately want copy-paste between their Scout and Striker blueprints — and it only works for conditions, not actions.
- Implementation cost: three distinct copy-paste systems, each with its own UI, tutorial, and edge cases.
- Returning players who restart a campaign must re-earn copy-paste capabilities that feel like basic functionality.

**Comparable:** Factorio's progression from hand-crafting to copy-paste blueprints to blueprint books to blueprint strings. IDE plugin progression from basic editing to code snippets to full refactoring tools.

---

## Recommendation: "The Growing Clipboard" (Model F) with "Skeleton Key" (Model C) as the Foundation

Model F is the strongest fit for Robot Uprising's established progressive disclosure philosophy. The game already unlocks skills, rules, hooks, and context config across the campaign arc. Copy-paste sophistication is simply another subsystem coming online.

Model C ("Skeleton Key") provides the right foundation: conditions are universally portable, actions are type-specific. This mirrors the actual design truth — the WHAT-to-react-to is shared across all units; the HOW-to-respond is what makes each unit type unique. The "incomplete rule with pulsing action slot" visual is both a practical tool and a teaching device.

The Embassy dialog (Model D) at Mission 7+ adds nuance for expert players who want speed. The Pattern Library (Model E) at Mission 9+ rewards players who think architecturally.

---

## Player Journeys

### Journey: Tomás, 16, Manila — First-Time Strategy Player

**Context:** Mission 6. Tomás has just unlocked the factory and has two blueprints: a Scout ("Bantay") and a Striker ("Pana"). His Scout has a solid 4-rule config that he iterated on for 20 minutes across Missions 3-4. His Striker has 2 default template rules. He wants to give the Striker the same "retreat when outnumbered" behavior his Scout has.

**Minute 0:00 — The Desire**
Tomás clicks on his Striker blueprint in the conveyor belt. The workbench opens showing Pana's sparse rules panel — two template rules with the diagonal hatching of unmodified templates. He remembers his Scout has a rule "IF enemy_count > 2 AND distance < 3 → DO evade nearest." He wants the same thing on the Striker, but with `breach` instead of `evade` — "retreat by punching through."

He clicks back to the Scout blueprint. There it is — rule 3, his pride and joy. He right-clicks the rule strip. A context menu appears: a compact dark panel with three options — "Copy Rule," "Duplicate," "Delete." He clicks "Copy Rule." The strip lifts 2px with a cyan border glow and a quiet "shhhk" sound — like sliding a card out of a sleeve. A small clipboard icon appears in the top-right corner of the workbench with a "1" badge.

**Minute 0:15 — The Paste**
He clicks back to the Striker blueprint. The rules panel shows. He hovers over the bottom of the rule list — a faint insertion line appears with a pulsing clipboard ghost. He presses Ctrl+V (he knows keyboard shortcuts from school projects). The rule appears — but not quite right. The left side is fully populated: "IF enemy_count > 2 AND distance < 3" in solid amber tokens. The right side is a pulsing dashed rectangle where the action should be, with cyan heartbeat animation. A thin diagonal hatching covers the action zone. A small tooltip reads: "Strikers cannot evade. Choose an action."

**Minute 0:30 — The Revelation**
Tomás stares at the incomplete rule. He clicks the pulsing action slot. The radial menu opens — but it only shows Striker actions: `engage` and `breach`. No `evade`. No `patrol`. He hovers over `breach` — a tooltip reads "Destroy adjacent obstacle or enemy." He hovers over `engage` — "Move toward and attack target." He realizes: the Striker's response to being outnumbered can't be running away. It can only be fighting through. He selects `breach` — the token snaps into place with a "tchk," the hatching dissolves left-to-right, and a single ascending chime plays.

**Minute 0:45 — The Lesson**
Tomás pauses. He looks at the rule: "IF enemy_count > 2 AND distance < 3 → DO breach nearest." On his Scout, the same situation meant "run." On his Striker, it means "attack." Same perception, different response. He realizes this IS the difference between a Scout and a Striker — not what they notice, but what they do about it. He adjusts the distance threshold from 3 to 2 — the Striker should only breach when enemies are adjacent, not from afar. He drags the rule up to priority 1. The other rules slide down with a smooth animation.

**Minute 1:00 — The Pattern**
He switches back to the Scout blueprint and copies another rule — "IF channel_message(recon-net) → DO patrol toward_source." He pastes it into the Striker. Again, the condition appears fully, the action is empty. He fills in `engage toward_source` — the Striker should attack what the Scout reports, not patrol toward it. He is now copying conditions and adapting actions naturally, without thinking about it.

**UI Annotations:**
- Copy trigger: right-click context menu on rule strip, or Ctrl+C when strip is selected (blue outline)
- Clipboard indicator: 16x16 clipboard icon in workbench top-right corner, "N" badge for count, fades after 10s of inactivity
- Paste target: hover below last rule in target blueprint to see insertion line + ghost
- Incomplete rule: condition tokens solid, action zone dashed cyan pulse, diagonal hatching overlay, tooltip on empty slot
- Action radial: filtered to target unit type's available skills only

---

### Journey: Dr. Amara, 38, Quezon City — ML Infrastructure Lead

**Context:** Mission 8. Dr. Amara has five active blueprints across all unit types. She has developed a sophisticated defensive pattern across her Scout and Relay configs — a three-rule "circuit breaker" that detects context overload pressure, sends a warning signal, and takes a defensive action. She wants to deploy the same circuit-breaker pattern on her Specialist and Command units.

**Minute 0:00 — The Multi-Select**
Dr. Amara holds Shift and clicks three consecutive rule strips on her Scout blueprint — rules 4, 5, and 6, her circuit-breaker trio. All three light up with a cyan selection border. She presses Ctrl+C. The clipboard icon shows "3." She's done this enough times that the animation is muscle memory — she doesn't watch the lift animation anymore.

**Minute 0:10 — The Specialist Transplant**
She switches to the Specialist blueprint. Ctrl+V. Three rules appear at the bottom of the list. Rules 4 and 5 (both condition-only rules — "IF context_fill > 80%" and "IF context_fill > 80% AND channel_quiet(alert)") paste perfectly with all tokens intact. Rule 6 has its condition complete ("IF context_fill > 90%") but the action is empty — the Scout's `evade` doesn't exist on Specialists. She clicks the pulsing slot. The radial shows `hack` and `extract`. She selects `extract` — in her mental model, a Specialist under context pressure should dump its buffer contents to a designated relay, not run away. The extract skill serves as an emergency memory dump. She drags the three rules up to priority 2-3-4, above her Specialist's default behavior but below the always-on authentication rule.

**Minute 0:30 — The Command Transplant**
She switches to the Command unit. Pastes the same three rules. This time, ALL three paste with intact conditions — context_fill and channel_quiet are universal conditions. But the action on rule 6 is again empty — no `evade` on Command units. She selects `prioritize` — a Command unit under context pressure should reprioritize its buffer, not flee. Different unit, different response, same trigger pattern.

She pauses. She has now deployed the same circuit-breaker pattern on four unit types, with four different response actions: Scout evades, Relay filters, Specialist extracts, Command prioritizes. Same perception. Four unit-specific responses. She thinks: "This is exactly like deploying the same monitoring alert across different microservices — same metric, different runbook."

**Minute 0:50 — The Pattern Save**
Dr. Amara right-clicks rule 4 on the Command unit. She sees "Save as Pattern" in the context menu. She clicks it. A small dialog appears — dark navy, amber border, monospace header "NEW PATTERN." A text field for the name, pre-filled with a generated suggestion: "Context pressure circuit breaker." She edits it to "CIRCUIT_BREAKER_v2" — she names things like config files. She checks a box: "Action as placeholder" (already checked by default since the action differs per unit type). She clicks "Save." A brief bookmark animation — a gold ribbon sliding down from the top of the dialog — and the pattern appears in her Pattern Library.

She opens the Pattern Library panel. Four patterns now, each a compact gold-tinted strip. She hovers over CIRCUIT_BREAKER_v2 — a tooltip shows the three rules with the action marked as "{defensive_response}." She drags it onto a new Relay blueprint she's been meaning to configure. Three rules appear with conditions filled and actions as pulsing slots. She fills them all with `filter` in under 3 seconds.

**Minute 1:10 — The Satisfaction**
She checks her clock — deploying a three-rule circuit-breaker pattern across 5 unit types took under 90 seconds. Without copy-paste, she estimates it would have taken 6-8 minutes of token-by-token reconstruction. She clicks EXECUTE. During the sealed watch, she watches her circuit-breaker pattern fire across different units simultaneously — Scouts evading, Relays filtering, Specialists extracting, Command prioritizing — all triggered by the same context pressure wave. Different bodies, same nervous system. She murmurs: "Kubernetes DaemonSet."

**UI Annotations:**
- Multi-select: Shift+click for range, Ctrl+click for individual toggle, blue outline on selected strips
- Batch paste: all selected rules paste in order, maintaining relative priority
- Pattern save dialog: 300px modal, name field + action-as-placeholder checkbox + description (optional) + Save/Cancel
- Pattern Library: collapsible section below rule list, gold-tinted (#3a3428) strips, count badge, drag-to-apply
- Pattern hover preview: tooltip showing all rules in the pattern with placeholder tokens in italicized gold

---

### Journey: Kwame, 28, Cebu — Twitch Streamer and Content Creator

**Context:** Mission 9. Kwame is streaming to 340 viewers. He has a viewer challenge: "Build a new Striker config using ONLY rules copied from your existing blueprints — no original rules allowed." He has 6 configured blueprints. The chat is watching.

**Minute 0:00 — The Frankenstein Challenge**
Kwame creates a new Striker blueprint called "Franken-Pana" (chat voted on the name). The rules panel is empty — zero rules, just a pulsing "+ Add Rule" button. He switches to his Scout blueprint. "Okay chat, what rule should we steal first?" Chat spams suggestions. He copies the Scout's top-priority rule: "IF enemy_spotted AND tagged → DO patrol toward_tagged." He pastes it into Franken-Pana. Condition arrives intact. Action slot is empty — Strikers don't patrol. He hovers the action radial, Facecam showing his expression. "We can't patrol, we can only fight. Let's give it `engage` — charge at the tagged enemy." He selects `engage`. Chat approves with a wave of skull emojis.

**Minute 0:25 — The Relay Heist**
He switches to his Relay blueprint. He copies a signal-forwarding rule: "IF channel_message(recon-net) AND context_fill < 70% → DO amplify recon-net." He pastes into Franken-Pana. Condition intact — "IF channel_message(recon-net) AND context_fill < 70%" — but the action is empty. Strikers can't amplify. He stares at the radial menu. `engage` and `breach`. Neither is a signal-forwarding action. He reads chat: "It literally can't do what the Relay does." He selects `engage nearest` as a placeholder — "When the Striker hears recon chatter and has context headroom, it just attacks whatever's closest. It's a Striker. It strikes." Chat erupts: "CONTEXT-AWARE BERSERKER."

**Minute 0:50 — The Command Theft**
He copies a Command unit's meta-rule: "IF unit_destroyed_within(scout, 3) → DO reassign priority_shift." Both the condition and action fail — Strikers can see the destruction condition (it's universal), but `reassign` is Command-only. The condition pastes intact. The action slot pulses empty. He selects `breach` — "When a Scout dies nearby, the Striker breaches toward the threat. Revenge mode." Chat names it "The Avenger Rule." He drags it to priority 1.

**Minute 1:15 — The Execution**
Franken-Pana has 6 rules, all copied from other blueprints, all with adapted actions. Kwame hits EXECUTE. During the sealed watch, the Frankenstein Striker charges across the board with a chaotic but weirdly effective behavior pattern — it avenges fallen Scouts, charges tagged enemies, and context-aware-berserks when it hears recon chatter. It survives 14 ticks and eliminates 3 enemies before going down. Chat goes wild. "FRANKEN-PANA HIGHLIGHT REEL." The clip gets 12K views.

**Minute 1:45 — The Debrief**
In the Inspector, Kwame clicks on Franken-Pana's instance. The decision trace shows rule priority matches tick by tick. He notices that the "revenge" rule (priority 1) fires on tick 8 when a Scout is destroyed, overriding the tagged-enemy rule that would have sent it to a better position. "Huh. The Avenger Rule is actually costing us. If we moved it to priority 3..." He adjusts. He now understands priority ordering through the lens of copied rules that interact in unexpected ways.

**UI Annotations:**
- Challenge mode: no special UI — the "copy from other blueprints" workflow is the standard clipboard
- Rule origin indicator: a faint watermark showing source blueprint icon on recently-pasted rules (fades after first execute, or on hover "Copied from Bantay (Scout)")
- Stream overlay: clipboard badge with count visible in top-right, visually legible at stream resolution
- Drag reorder: critical for Kwame's final insight — reordering copied rules changes behavior

---

## Strengths and Weaknesses Summary

| Model | Efficiency | Type Safety | Teaching Value | Implementation Cost |
|-------|-----------|-------------|---------------|-------------------|
| A "The Xerox" | Low (hard reject) | Maximum | High (rejection is lesson) | Low |
| B "The Transplant" | Maximum | Low (false equivalences) | Low (hides differences) | Medium |
| C "The Skeleton Key" | Medium (fill actions) | High | High (shows the boundary) | Medium |
| D "The Diplomat" | Medium-High | High | Medium (dialog fatigue) | High |
| E "The Pattern Library" | High (after setup) | High | Very High (naming = abstraction) | Very High |
| F "The Growing Clipboard" | Progressive | Progressive | Maximum (timed to campaign) | Very High |

---

## Interaction Effects

- **Rules UI (3.07):** Copy-paste interacts with every Rules UI paradigm. Sentence Strips (A) copy naturally as horizontal strips. Card Stack (C) copies as cards. NL Bar (E) could support text-based copy-paste of rule expressions. Progressive Template (F) templates are proto-patterns — the pattern library extends the template concept from per-unit-type defaults to player-authored cross-type patterns.

- **Rules Panel at Scale (3.07a):** Copy-paste becomes critical at scale. A Command unit with 14+ rules benefits enormously from batch-copying proven patterns from smaller units. The Minimap sidebar from 3.07a should show "pasted but incomplete" rules with the same pulsing indicator.

- **Rule Conflicts (3.06):** Pasted rules may conflict with existing rules on the target blueprint. The conflict analyzer (3.06 Model B) should flag pasted rules that shadow or are shadowed by existing rules. A rule pasted at position 12 that is always preempted by existing rule 3 should trigger a "shadowed rule" warning.

- **Skills Catalog (3.01):** The skill compatibility matrix IS the copy-paste compatibility matrix. Every action-incompatibility during paste maps directly to the skill availability per unit type. The action radial during paste should match the skill UI's (3.04) visual language.

- **Command Agent Design (3.17):** Command agents benefit most from copy-paste — they absorb patterns from every other unit type as meta-rules. A Command unit's "IF scout_destroyed → DO reassign" pattern might originate from observing a Scout's "IF ally_destroyed → DO evade" and adapting it upward. The Command workbench should have a dedicated "Import from Blueprint" panel.

- **Hook Taxonomy (3.08):** Hook configs should be independently copyable alongside rules. A "defensive circuit breaker" pattern includes both rules AND hooks (the hook that sends the alert, the rule that responds to it). Pattern Library patterns should optionally bundle rules + hooks.

- **Sealed Watch (locked):** Copy-pasted rules create a unique debrief moment — seeing the same condition-pattern fire on different unit types with different actions across the battlefield. The Inspector should highlight "shared condition patterns" as a cross-unit analytical view.

- **Blueprint Codex (locked):** Saved patterns from the Pattern Library should appear as cards in the Blueprint Codex. Each pattern card shows usage count, which unit types it has been deployed on, and mission history.

---

## Comparable Games

- **Factorio (Blueprints):** The gold standard for copy-paste in a strategy game. Players copy entire factory sections as blueprints, share blueprint strings, maintain blueprint books. Key lesson: Factorio's blueprints are spatially grounded — they copy a 2D arrangement of machines. Robot Uprising's rules are linearly ordered — they copy a 1D priority list. The spatial-to-linear difference means Factorio's "paste and adjust" workflow (place blueprint, then modify machines) maps well to "paste conditions, fill actions."

- **Gladiabots (Behavior Tree Copy):** Gladiabots allows copying sub-trees of the behavior tree and pasting them into other bots. Because all bots share the same action vocabulary (move, shoot, pickup, drop), there is no type incompatibility problem. Robot Uprising's type-specific skills make the problem harder and more interesting.

- **Screeps (Code Modules):** Screeps players copy-paste JavaScript functions between creep role definitions. The language runtime handles type checking — calling `heal()` on a creep without HEAL body parts throws an error at runtime. Robot Uprising should catch incompatibilities at paste time (static analysis) rather than at execution time (runtime error).

- **Slay the Spire (Card Transforms):** When a card transforms into another, the player sees the transformation happening — the old card dissolves, the new one materializes. The "adapted" visual treatment in Model B borrows this transformation-as-visible-event pattern.

- **Shenzhen I/O (Copy Code Between Chips):** Players copy assembly instructions between chips with different instruction sets. Incompatible instructions are flagged at compile time. The closest analog to Robot Uprising's type-checking-on-paste approach.

---

## Sensory Description

**The Copy Moment:** Selecting a rule strip for copy triggers a 100ms lift animation — the strip rises 2px above its neighbors, a thin cyan border appears (1px, #00d4ff at 80% opacity), and a soft "shhk" sound plays — like sliding a card from a plastic sleeve. The clipboard icon in the workbench corner pulses once with the same cyan.

**The Paste Success:** When all tokens are compatible, the pasted strip materializes from top to bottom like a fax printing — a horizontal scan line sweeps down the 40px height in 200ms, revealing condition tokens left-to-right, then action tokens. The magnetic "tchk" confirms placement. The strip settles into the priority list with its neighbors shifting smoothly.

**The Partial Paste:** When conditions paste but actions cannot, the scan-line animation plays for the condition side, then stalls at the condition→action boundary. A brief amber flash at the boundary (100ms, #d4a017) signals the type mismatch. The action zone fills with the pulsing dashed outline. A low two-note tone plays — not an error buzz, but a questioning hum, like a doorbell that expected a different visitor. The tone says "something needs your attention" without saying "you did something wrong."

**The Pattern Library:** The library section has a warm, archival feel — slightly warmer color temperature than the rest of the workbench (#3a3428 vs #2a2a3a), as if lit by amber desk lamps instead of blue-white monitors. Pattern strips have a subtle paper texture (6% opacity noise overlay). Dragging a pattern from the library produces a quiet rustle — paper sliding across a desk. Dropping it into the rule list plays the standard "tchk" followed by the pulsing heartbeat of empty action slots.

**The Completion Cascade:** When the last empty action slot in a pasted batch is filled, all modified strips play a synchronized dissolution of their "under construction" hatching — left to right, 100ms apart per strip, with ascending chimes. The final strip's chime resolves to a major chord — a 400ms two-note fifth (C5-G5) that signals "pattern complete." The strips' background color transitions from the lighter "incomplete" shade (#34344a) to the standard rule color (#2a2a3a) in a 300ms ease.

---

## The TikTok Clip

Split screen: left side shows a player painstakingly rebuilding 6 rules token-by-token on a second blueprint, 45 seconds of tedious clicking. Right side shows the same player in Mission 9 — Ctrl+C on 6 rules, switch blueprint, Ctrl+V, six conditions appear instantly, six cyan action slots pulse in unison. The player fills all six with rapid radial-menu clicks in 4 seconds flat. Cut to the sealed watch: the two blueprints executing in perfect coordination, same conditions triggering different actions across different unit types. Text overlay: "Same brain. Different body." The completion cascade chime plays over the sealed watch footage.

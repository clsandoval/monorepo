# 3.11b — The Dead Hook Diagnostic: Flagging Unused Hooks in the Inspector

## Overview

A player configures a hook: "WHEN enemy_spotted → SEND position ON flank-alert." They run three missions. That hook fires zero times across all three. Is it misconfigured? Is it insurance they never needed? Is it wired to the wrong trigger? Is the unit dying before the condition ever triggers? The player doesn't know — and worse, the player might not even *notice*. The hook slot is occupied, the wiring looks clean, the channel name is spelled correctly. The silence is invisible.

The dead hook diagnostic is the Inspector's answer to silent failure. When a hook has fired zero times in the last N executes, the Inspector surfaces an amber warning: "This hook has not fired in your last 3 runs." The design question isn't whether to detect unused hooks — that's straightforward telemetry. The design question is *how to present the finding without creating a false-positive hellscape* that trains players to ignore warnings, and how to respect the legitimate pattern of "insurance hooks" — hooks configured precisely because they *shouldn't* fire often.

This sits at the intersection of three locked systems:
- **Inspector** (analytical debrief, click-to-inspect, decision trace)
- **Hook slots** (scarce resource — Scout: 2, Relay: 4, Command: 6)
- **Blueprint editor** (where hooks are configured, where the player would act on a warning)

The core tension: **slot scarcity makes dead hooks expensive, but insurance hooks are a legitimate strategy.** A hook that fires in 1-out-of-20 runs but saves the entire network when it does is not misconfigured — it's brilliant. The diagnostic must distinguish between "you wired this wrong" and "you built a safety net."

---

## The Detection Model: What Counts as "Dead"?

### Firing History Window

The system tracks hook fire counts across the last N executions of a given mission. Three possible window sizes:

| Window | Name | Philosophy |
|--------|------|-----------|
| **Last 1 run** | "Just now" | Only flags hooks that didn't fire this specific run. Too noisy — many hooks legitimately fire only on certain enemy configurations. |
| **Last 3 runs** | "The Pattern" | Flags hooks that haven't fired in three consecutive runs. Accounts for randomization variance. This is the sweet spot. |
| **Last 5 runs** | "The Trend" | More conservative. Fewer false positives, but a player who runs a mission 3 times and iterates won't see the warning until they've already moved on. |

**Recommended: 3 runs.** The invisible randomization means each execute varies within constraints. Three runs with zero fires means the trigger condition is either impossible, extremely rare, or the unit is dying before the condition arises. All three of those are worth surfacing.

### What Counts as "Firing"?

A hook "fires" when its trigger condition evaluates to true and a signal is dispatched to the channel. Specifically:
- **Fired and delivered** — signal reached at least one listener. Full fire.
- **Fired but no listeners** — trigger matched, signal dispatched, but no unit was listening on the channel. This is a *different* diagnostic (orphan channel) but still counts as "fired" for dead-hook purposes — the trigger logic works, the wiring is broken elsewhere.
- **Trigger evaluated but not matched** — the hook's condition was checked each tick but never returned true. This is the dead-hook case.
- **Never evaluated** — the unit was destroyed before the trigger could be checked, or the unit was never produced (production queue never reached this blueprint). Also dead, but for a different reason.

### Severity Tiers

| Tier | Condition | Visual | Label |
|------|-----------|--------|-------|
| **Amber** | 0 fires in last 3 runs, trigger was evaluated at least once | Amber outline on hook strip | "Hook hasn't fired in 3 runs" |
| **Gray** | 0 fires in last 3 runs, unit was never produced or died before first evaluation | Gray outline, italic text | "Unit didn't survive long enough" |
| **Silent** | Hook fired at least once in last 3 runs | No indicator | — |

The distinction between amber and gray matters enormously. Amber says "your logic might be wrong." Gray says "your unit is dying too fast for this hook to matter — fix the survival problem first."

---

## Presentation: Where and How the Warning Appears

### In the Inspector (Post-Battle)

When the player clicks a unit in the Inspector and opens its hook detail panel, each hook strip shows its fire count for the current run. For dead hooks across multiple runs, the presentation escalates:

**Single-run zero:** The hook strip's fire count reads "0 fires" in neutral gray text. No special treatment. Many hooks legitimately don't fire every run.

**Three-run zero (amber diagnostic):** The hook strip gains a subtle amber left-border (3px solid amber, same treatment as context-overload warnings). The fire count reads "0 fires (3 runs)" in amber text. A small amber triangle icon appears to the left of the hook icon. Hovering the amber triangle reveals a tooltip:

```
┌──────────────────────────────────────────────────┐
│  ⚠ This hook hasn't fired in your last 3 runs.  │
│                                                   │
│  Possible causes:                                 │
│  • Trigger condition never occurs                 │
│  • Unit destroyed before trigger can fire          │
│  • Slot could be used for a more active hook       │
│                                                   │
│  Mark as insurance ↗                              │
└──────────────────────────────────────────────────┘
```

The "Mark as insurance" link is crucial — more on this below.

### In the Blueprint Editor (Plan Screen)

The blueprint editor shows a *persistent* amber dot on hook strips that were flagged in the most recent Inspector session. This is a cross-screen memory: the Inspector diagnoses, the Plan screen reminds. The amber dot sits in the top-right corner of the hook strip, 6px diameter, pulsing slowly (0.5Hz). Hovering shows the same diagnostic tooltip.

This creates a natural flow: run battle → notice amber in Inspector → return to Plan screen → see the same amber on the hook strip → decide to reconfigure or mark as insurance.

### In the Channel Map Panel

The channel map panel (read-only, auto-generated) shows aggregate fire counts per channel. A channel where *no* hook has fired in 3 runs gets a dim amber glow behind its entry. This catches a different failure mode: not a single dead hook, but an entire communication pathway that's dormant. Maybe the player built a whole "emergency-evac" channel network that never activated.

---

## The Insurance Hook Pattern

### The Problem

Some hooks are *supposed* to rarely fire. A Command unit's hook "WHEN ally_destroyed → SEND reassign ON emergency-line" might fire zero times in three consecutive wins — because the player's army didn't lose any units. That hook is not misconfigured; it's a safety net. Flagging it amber punishes good play.

### The Solution: Player-Annotated Intent

The "Mark as insurance" action in the diagnostic tooltip applies a small shield icon (🛡) to the hook strip. Insurance-marked hooks are excluded from the dead-hook diagnostic entirely. The shield icon is visible in both the Inspector and the Blueprint Editor.

**Visual treatment of insurance hooks:**
- Hook strip shows a small 🛡 badge to the right of the hook icon (replacing the ⚡ icon area, or adjacent to it)
- The strip's left border is a cool blue instead of the default gray — visually distinct from both normal hooks and amber-flagged hooks
- In the Inspector, the fire count still shows "0 fires" but in neutral text, not amber
- The tooltip reads: "Insurance hook — excluded from activity warnings. Remove insurance status ↗"

### When Insurance Hooks DO Fire

This is where the design gets delicious. When an insurance-marked hook fires for the first time, the Inspector gives it special celebration treatment:

- The hook strip flashes briefly with a cyan pulse (the "save" color)
- The fire count reads "1 fire ★" with a small star
- A tooltip reads: "Your insurance hook activated! It [describe what the hook did]."

This reinforces the player's strategic thinking: "I was right to keep that hook. It saved me." The insurance-hook pattern transforms from a diagnostic-suppression mechanism into a *strategic vocabulary*. Players start thinking about their hooks in two categories: workhorses (fire every run) and insurance (fire when things go sideways).

---

## False Positive Risks

| Scenario | Dead Hook? | Diagnostic Shows | Correct? |
|----------|-----------|-------------------|----------|
| Hook trigger impossible given enemy composition | Yes | Amber | Yes — player should reconfigure |
| Hook trigger rare but possible; didn't occur in 3 runs | No | Amber | **False positive** — but insurance marking solves it |
| Unit never produced (production queue too long) | No | Gray | Yes — different problem |
| Unit produced but dies tick 1 every time | No | Gray | Yes — survival problem |
| Hook fires on channel with no listeners | Yes (for delivery), No (for trigger) | Silent (trigger worked) | Partially correct — orphan channel diagnostic should catch this separately |
| Player intentionally uses hook as "insurance" | No | Amber until marked | Acceptable — one-click fix |

The biggest false-positive risk is **randomization variance**. The locked spec says "each execute varies within constraints." If the enemy composition rotates and a hook's trigger only applies to certain enemy types, three unlucky rolls could flag a perfectly valid hook. The 3-run window mitigates this but doesn't eliminate it. The insurance marking is the escape valve.

---

## Interaction Effects

### With Hook Slot Scarcity

Dead hook diagnostics gain enormous weight because slots are scarce. A Scout with 2 hook slots running one dead hook is operating at 50% hook capacity. The diagnostic implicitly argues: "You could put something useful here." This creates productive tension — the player must decide whether the insurance value outweighs the opportunity cost of a live hook.

### With the Inspector's Decision Trace

The decision trace already shows "which rule matched this tick, what context entries it evaluated, why this action was chosen." Dead hook diagnostics extend this to the negative case: "which hook *didn't* match, and why." When a player clicks an amber-flagged hook in the Inspector, the decision trace could show the closest the trigger came to firing — "enemy_spotted was never true because no enemy entered this unit's perception range in any tick." This turns a diagnostic into a learning moment.

### With Context Config Listen/Ignore

A hook can fire and deliver a signal, but the receiving unit might have the channel set to "ignore" in its context config. This isn't a dead hook (it fired), but it creates a dead *pathway*. The diagnostic should NOT flag the sending hook — instead, the channel map panel should show a warning on the receiving end: "Listening but ignoring: unit X has recon-net in its ignore list."

### With the Production Queue

If a blueprint is at position 8 in a 6-unit production queue, it may never get produced in short missions. The diagnostic should track "was this blueprint ever instantiated?" and show the gray tier ("Unit never produced") rather than amber. This prevents confusion: the hook isn't broken, the blueprint just never made it off the conveyor belt.

---

## Comparable Games

### Factorio: Unused Inserter Warnings

Factorio doesn't explicitly warn about unused inserters, but players learn to spot them through the production statistics screen. An inserter that shows 0 items/minute in the stats is functionally dead. Factorio trusts the player to notice; Robot Uprising should be more proactive because hooks are harder to visually audit than physical inserter arms. The lesson: **provide the data, let the player decide what to do with it.**

### Slay the Spire: Unplayed Card Tracking

Slay the Spire's run history shows which cards were never played during a run. A card in your deck that you never played once in 50+ combats is deadweight. The game surfaces this data post-run but doesn't warn you during deckbuilding. Robot Uprising can go further because hooks occupy *scarce slots* (Slay the Spire decks have no hard card count limit, just draw probability dilution). The lesson: **when the resource is scarce, the diagnostic should be more aggressive.**

### Into the Breach: Unused Mech Abilities

Into the Breach doesn't track unused abilities, but experienced players notice when a mech's secondary weapon never gets used because positioning never allows it. The community calls these "dead skills" and it's a known deck-building anti-pattern. The lesson: **the community will invent this diagnostic anyway; building it into the Inspector earns trust.**

---

## Sensory Description

**The amber warning at rest:** A thin amber line, 3 pixels wide, runs down the left edge of the hook strip. Not blinking, not pulsing — just *present*, like a sticky note left on a circuit board. The hook's trigger token text shifts from white to a muted amber, readable but distinctly colored. The amber triangle icon in the corner is small enough to ignore, prominent enough to notice.

**Hovering the amber triangle:** The tooltip slides in from the right with a 150ms ease-out, its background a dark panel with amber border. The "Possible causes" list is set in the same monospace font as the boot log — diegetically, this is the AI's self-diagnostic subsystem reporting. The "Mark as insurance" link glows on hover, underlined, cyan — the only non-amber element in the tooltip.

**Marking as insurance:** Click "Mark as insurance." The amber border dissolves outward like a ring ripple on water (300ms). In its place, a cool blue border fades in. The 🛡 shield badge scales up from nothing with a satisfying micro-bounce (150ms scale, 100ms settle). A quiet electronic tone — two ascending notes, like a system acknowledging a command. The amber triangle disappears. The hook strip looks calm, intentional, *chosen*.

**When an insurance hook fires for the first time:** During the Inspector debrief, the hook strip flashes cyan three times (200ms on, 200ms off), then settles with a faint cyan glow that persists for the session. The fire count animates from "0" to "1" with a counter-flip effect. A small star icon (★) appears beside the count, gold, with a single sparkle animation. The tooltip reads in a slightly different voice — less diagnostic, more congratulatory: "Your emergency-line insurance activated at T14 when Scout-2 was destroyed. The Command unit reassigned Striker-1 via this hook." The tone is a warm chime — validation that the player's foresight paid off.

**The channel map panel with a dead channel:** In the auto-generated channel map, a dormant channel's entry shows its colored line at 30% opacity instead of 100%. The subscriber count text is dimmed. A tiny amber dot sits to the right of the channel name. The whole row looks like a circuit board trace that hasn't carried current in a long time — present but dusty.

---

## Player Journeys

### Journey: Amara, 24, Computer Science Student

**Context:** Mission 6. Amara has just unlocked the Command unit. She's built a complex architecture with 4 channels: recon-net (scouts report positions), threat-bus (relays broadcast compressed intel), strike-call (command orders attacks), and fallback-evac (command signals retreat). She's run this mission 4 times, winning twice and losing twice.

**Minute 0:00 — Inspector Opens After a Win**
Amara enters the Inspector after a clean 18-tick victory. The board shows her final positions — two scouts alive, relay intact, striker at the enemy base. She clicks her Command unit, centered at E4. The hook panel slides open in the right sidebar, showing all 6 hook slots. Five show fire counts in white text: "12 fires," "8 fires," "3 fires," "6 fires," "1 fire." The sixth — "WHEN ally_destroyed → SEND reassign ON fallback-evac" — shows "0 fires" with an amber left border and a small amber triangle in the corner. Amara notices the amber immediately; it's the only colored border in the panel.

**Minute 0:15 — Reading the Diagnostic**
Amara hovers the amber triangle. The tooltip slides in: "This hook hasn't fired in your last 3 runs. Possible causes: Trigger condition never occurs / Unit destroyed before trigger can fire / Slot could be used for a more active hook. Mark as insurance ↗" She thinks about it. The last three runs, she hasn't lost any units — her scout positioning has been good. But she *knows* she wants this hook for when things go wrong. She remembers Mission 5 where she lost two scouts and her whole intel pipeline collapsed.

**Minute 0:30 — Marking as Insurance**
She clicks "Mark as insurance." The amber border dissolves smoothly, replaced by a cool blue line. A shield icon (🛡) appears on the hook strip with a subtle bounce. Two ascending electronic notes play. The tooltip now reads: "Insurance hook — excluded from activity warnings." Amara nods — this is intentional design, not a mistake. She closes the Inspector and moves to Mission 7.

**Minute 2:00 — Mission 7, the Insurance Pays Off**
Three missions later, Mission 7 throws a new enemy type that flanks aggressively. Her lead scout is destroyed at tick 6. The fallback-evac hook fires for the first time — ever. In the Inspector afterward, that hook strip glows with a faint cyan pulse. The fire count reads "1 fire ★" with a gold star. The tooltip: "Your insurance hook activated at T6! When Scout-1 was destroyed, Command reassigned Striker-2 to cover the gap." Amara grins. She screenshots the Inspector panel and sends it to her Discord study group.

**UI Annotations:**
- **Amber left border:** 3px solid #E5A836, left edge of hook strip only. No animation at rest.
- **Amber triangle:** 10px equilateral triangle, top-right corner of hook strip. Static, no pulse.
- **Insurance shield:** 🛡 emoji rendered at 14px, positioned right of hook icon. Scale-up animation on creation (0→100%, 150ms, cubic-bezier bounce).
- **Insurance fire celebration:** 3x cyan flash (200ms on/off), then persistent 20% cyan glow on strip background.

---

### Journey: Dante, 31, Factorio Veteran, First-Time Player

**Context:** Mission 3. Dante has just learned hooks. He's configured his first multi-unit architecture: a scout with "WHEN enemy_spotted → SEND position ON intel" and a striker with a hook he's less sure about: "WHEN buffer_threshold → SEND unit_id ON overflow-alert." He chose this trigger because it sounded important, but he doesn't fully understand what buffer_threshold means yet.

**Minute 0:00 — Inspector After Mission 3, Run 3**
Dante opens the Inspector. He's been iterating on this mission — first run was a loss, second was close, third was a win. He clicks his striker. The hook panel shows two hooks. The intel-response hook (listening side) shows "4 fires" in clean white text. But the overflow-alert hook shows "0 fires (3 runs)" with an amber border. The amber triangle catches his eye.

**Minute 0:12 — Understanding the Diagnostic**
He hovers the amber triangle. The tooltip appears: "This hook hasn't fired in your last 3 runs. Possible causes: Trigger condition never occurs / Unit destroyed before trigger can fire / Slot could be used for a more active hook." Dante re-reads the hook: buffer_threshold on a striker. He doesn't know what triggers buffer_threshold. He clicks the hook strip itself and the decision trace expands below.

**Minute 0:25 — Learning from the Decision Trace**
The decision trace shows: "buffer_threshold evaluated 18 times across 18 ticks. Never matched. Striker-1's context window reached maximum 3/8 slots — threshold triggers at 7/8." Dante understands now: his striker's context window never came close to filling up because it only listens on one channel and receives infrequent messages. The buffer_threshold trigger is meant for relays drowning in data, not strikers receiving occasional intel.

**Minute 0:40 — Reconfiguring in the Plan Screen**
Dante returns to the Plan screen. The striker's hook strip still shows the persistent amber dot in the top-right corner — the cross-screen reminder. He clicks the trigger dropdown and browses the radial menu. He spots "engage_completed" — fires after the striker eliminates an enemy. He changes the hook to "WHEN engage_completed → SEND position ON kills-feed." Now his other units will know where enemies have been eliminated. He hits Execute, feeling confident. The amber dot disappears when he changes the trigger.

**Minute 3:00 — The New Hook Works**
In the next Inspector session, the kills-feed hook shows "2 fires." No amber anywhere. Dante now understands buffer_threshold conceptually and trusts the diagnostic system. He'll check for amber on every future Inspector visit.

**UI Annotations:**
- **Decision trace for dead hooks:** Rendered below the hook strip when clicked, same panel style as rule decision traces. Shows trigger evaluation count, why it didn't match, and what values would have caused it to match.
- **Cross-screen amber dot:** 6px diameter, amber (#E5A836), top-right of hook strip in blueprint editor. Pulses at 0.5Hz. Disappears immediately when the hook's trigger or channel is modified.
- **Trigger radial menu:** Same radial paradigm from rules (3.07). Trigger options vary by unit type. Unavailable triggers (e.g., scout-only triggers on a striker) are not shown.

---

### Journey: Ximena, 42, Non-Gamer Project Manager

**Context:** Mission 5. Ximena is methodical and cautious. She's built a conservative architecture with insurance hooks on every unit — "WHEN ally_destroyed" hooks everywhere, "WHEN buffer_threshold" on her relay, "WHEN enemy_spotted AND threat_level_high" on her scouts (but most enemies are low-threat in Mission 5). After her third run, half her hooks are amber.

**Minute 0:00 — Inspector After Run 3: Amber Overload**
Ximena opens the Inspector and clicks her relay. Three of four hook strips have amber borders. She clicks her scout — both hooks are amber. She clicks her striker — one of two is amber. The sheer amount of amber is overwhelming. She feels like she's done something wrong. But she *won* the mission. How can so many hooks be broken if she won?

**Minute 0:20 — Tooltip Reassurance**
She hovers the first amber triangle on her relay. The tooltip's "Possible causes" list includes "Slot could be used for a more active hook" — but also "Mark as insurance ↗." She reads "insurance" and it clicks: some of these hooks are intentionally rare. The fallback hooks, the emergency hooks — she built them *because* she's cautious. She starts clicking "Mark as insurance" on the hooks she knows are intentional: ally_destroyed triggers, buffer_threshold on the relay.

**Minute 0:45 — Distinguishing Real Problems**
After marking three hooks as insurance (shields appearing with satisfying bounces each time), only two amber hooks remain. She looks at them more carefully. One is "WHEN enemy_spotted AND threat_level_high → SEND position ON priority-target" on her scout. The decision trace shows: "threat_level_high never true — all enemies in Mission 5 are threat_level_medium." This IS a real issue — her trigger is too restrictive for this mission. The other dead hook is on a striker that was never produced (gray tier: "Unit not produced — blueprint at position 5 in queue, only 4 units built").

**Minute 1:10 — Acting on the Signal**
She returns to the Plan screen. Two pieces of information: her scout's threat-level filter is too strict, and she's queuing more blueprints than she can produce. She changes the scout's trigger to just "enemy_spotted" (removing the AND threat_level_high compound condition) and moves the unused striker blueprint higher in the production queue. The amber dots disappear as she edits.

**Minute 1:30 — Next Run: Clean Inspector**
After her next run, the Inspector shows zero amber on any hook. Her insurance hooks have their blue shields. Her active hooks all show fire counts. The panel looks *clean* — intentional. Ximena feels in control. She's learned that amber doesn't mean "wrong," it means "worth checking."

**UI Annotations:**
- **Multiple amber hooks:** Each hook strip independently shows its own amber state. No aggregate "you have 5 dead hooks" banner — the per-hook approach prevents alarm fatigue while still being noticeable.
- **Insurance marking batch flow:** Each "Mark as insurance" click is independent. No multi-select. The one-at-a-time interaction forces the player to consciously evaluate each hook — "is THIS one intentional?" This prevents blind "mark all as insurance" dismissal.
- **Gray tier for unproduced units:** Gray left border instead of amber. Italic text on the fire count: "Unit not produced." This is visually quieter than amber — a note, not a warning.

---

## Strengths

1. **Surfaces invisible information.** Without this diagnostic, players must manually track which hooks fired across runs — impossible for architectures with 10+ hooks across 5 blueprints.
2. **Respects player intent.** The insurance marking system turns a potentially patronizing diagnostic into a strategic vocabulary. Players who mark hooks as insurance are making a conscious design statement about their architecture.
3. **Teaches through diagnostics.** Dante's journey shows how the dead-hook flag, combined with the decision trace, becomes a learning tool. The player doesn't just learn "this hook is dead" — they learn *why* it's dead, which teaches them about trigger conditions and unit capabilities.
4. **Leverages slot scarcity.** Because hook slots are limited, a dead hook has real opportunity cost. The diagnostic implicitly asks: "Is this slot earning its keep?"
5. **Cross-screen continuity.** The amber dot persisting from Inspector to Plan screen creates a natural workflow: diagnose, then fix. The player doesn't have to remember which hooks were flagged.

## Weaknesses

1. **Randomization variance.** Three runs may not be enough to distinguish "rare" from "impossible." A hook that fires in 1-out-of-10 runs will generate false amber 72.9% of the time at the 3-run window. The insurance marking is a workaround, not a solution.
2. **Warning fatigue.** Ximena's journey shows the risk: too many amber warnings can feel like the game is criticizing a winning strategy. Cautious players who build lots of insurance hooks will see more amber than aggressive players, which perversely punishes caution.
3. **Insurance marking is manual.** The player must mark each hook individually. There's no way to say "all ally_destroyed hooks are insurance across all blueprints." Repeated marking across units could become tedious in late-game architectures with 20+ hooks.
4. **Gray tier ambiguity.** "Unit not produced" might mean the player's production queue is wrong, OR it might mean the mission ended too quickly for the unit to be needed. The gray diagnostic doesn't distinguish between these cases.

## The TikTok Clip

Fifteen seconds: A player opens the Inspector. Zoom on a hook strip — amber border, "0 fires (3 runs)." They click the decision trace: "enemy_spotted AND threat_level_high — never true. All enemies were medium." Cut to Plan screen: they change the trigger, amber dot disappears. Cut to next run's Inspector: "7 fires." Clean. The hook strip glows with quiet satisfaction. Text overlay: "Your AI told you what was broken."

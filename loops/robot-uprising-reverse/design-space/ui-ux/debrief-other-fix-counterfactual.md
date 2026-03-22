# "What If I'd Chosen the Other Fix?" — Post-Apply Counterfactual

**Aspect:** 4.87 — After applying one fix from an agree-to-disagree result, a one-click simulation showing what pass rate would have been if the other fix had been applied instead; teaches what was traded; reduces regret; interaction with 4.38 counterfactual history and 4.80 "what if I had applied QUICK?" counterfactual.

**Parent:** 4.62 — Agree-to-disagree result
**Siblings:** 4.83 — Agree-to-disagree debt ledger; 4.80 — "What if I had applied QUICK?" counterfactual
**Related:** 4.38 — Counterfactual history; 4.20 — Counterfactual simulation (Minimum Fix Explorer); 4.41 — Cluster-masked failure discovery; 4.75 — Token debt recovery; 8.09 — Diagnostic layer as teaching mechanic

---

## The Core Problem

The agree-to-disagree result (4.62) presents the player with two valid fixes — Focused and Structural — and asks them to choose. The moment the player clicks **Apply** on one fix, the other fix vanishes from the screen. The config increments to v3.3. The match history advances. The debrief closes. The player is back in the plan phase, staring at their updated config.

And then the question arrives. It arrives reliably, predictably, within thirty seconds of applying the fix.

**"What if I'd applied the other one?"**

This is not idle curiosity. It is the specific emotional residue of having made a real choice under genuine uncertainty. The player chose the Focused Fix because it had a higher estimated pass-rate improvement (+28 vs. +22). But the Structural Fix card had that small consequence note: *"This is the structurally smaller change."* The player read it. Processed it. Dismissed it. Applied the Focused Fix. And now, config deployed, match queued, they wonder: would +22 have been enough? Would the structural fix have prevented the *next* failure too? Did they patch a symptom and leave a disease?

This is regret. Not dramatic regret — not "I lost the tournament because of this." Quiet regret. The kind that accumulates into a behavioral pattern: the player starts second-guessing agree-to-disagree decisions. They spend longer staring at the two cards. They hesitate. They lose the crisp decisiveness that the agree-to-disagree panel was designed to cultivate. The irony: a teaching moment designed to build engineering judgment becomes a source of decision paralysis because the player can never verify their choice after the fact.

**The post-apply counterfactual is the verification mechanism.** One click. The game re-simulates the match with the un-chosen fix applied instead of the chosen one. The player sees the concrete pass rate that *would have been*. Not a guess. Not an estimate. A number. The ghost of the road not taken, rendered in exact detail.

This collapses the uncertainty. The player either confirms their choice ("I picked +28 and the other one was +21 — good call") or learns from the trade-off ("I picked +28 but the other one was +26, and it would have also prevented 4 failures in scenarios that my fix didn't touch"). Both outcomes are valuable. Neither is punishment.

The key insight: **retroactive verification of a judgment call is not cheating — it is how expertise develops.** Chess players review games. Surgeons review procedures. Engineers review incident postmortems. The counterfactual is how Robot Uprising teaches the player to evaluate their own diagnostic reasoning, not just their configs.

---

## The Design

### The Trigger: The "Other Fix" Ghost Card

When the player applies a fix from an agree-to-disagree result, the debrief does not discard the un-chosen fix immediately. Instead, the un-chosen fix collapses into a **Ghost Card** — a small, semi-transparent element pinned to the bottom-right of the post-apply summary panel. The Ghost Card shows:

- The name of the un-chosen fix (e.g., "RELAY-C buffer +1")
- A single label: **"What if?"**
- A subtle shimmer animation — a slow pulse at 0.4Hz, like breathing — that draws the eye without demanding attention

The Ghost Card persists for as long as the player remains in the post-apply summary. It does not follow them to the plan phase or the next match. It exists only in the narrow temporal window between "I just applied a fix" and "I'm moving on." This window is the exact moment regret lives.

### The Click: One-Click Counterfactual Simulation

Clicking the Ghost Card triggers a **counterfactual re-simulation**:

1. The game takes the config state *before* the apply (v3.2, the pre-fix state)
2. Applies the un-chosen fix instead of the chosen one
3. Re-simulates the same scenario set used in the original debrief (same missions, same seeds, same opponent configs)
4. Returns the result in 2-4 seconds (same infrastructure as the Minimum Fix Explorer's fork simulations)

The player has not undone their choice. Config v3.3 (with the chosen fix) is still active. The counterfactual is read-only — a simulation, not a deployment.

### The Display: The Split Verdict Panel

The counterfactual result appears in the **Split Verdict Panel** — a horizontal two-column comparison that fills the center of the debrief screen:

```
┌─────────────────────────────┬─────────────────────────────┐
│   YOUR CHOICE (Applied)     │   THE OTHER FIX (Simulated) │
│                             │                             │
│   SCOUT-A filter            │   RELAY-C buffer +1         │
│   remove 'LOW_THREAT'       │                             │
│                             │                             │
│   Pass Rate: 74 → 92        │   Pass Rate: 74 → 88        │
│   ████████████████████░░░░  │   ████████████████░░░░░░░░  │
│                             │                             │
│   Failures Resolved: 28/41  │   Failures Resolved: 22/41  │
│   New Failures: 0           │   New Failures: 0           │
│                             │                             │
│   Unresolved Clusters:      │   Unresolved Clusters:      │
│   • Relay buffer (18)       │   • Scout filter (22)       │
│   • Compound (8, partial)   │   • Compound (8, partial)   │
│                             │                             │
│   ✓ APPLIED                 │   ghost simulation          │
└─────────────────────────────┴─────────────────────────────┘
```

The left column is the player's actual choice. Full color — the same palette used in the fix explorer. The right column is the counterfactual. Rendered in the **ghost palette**: desaturated, slightly translucent, with a faint scan-line texture that reads as "this didn't happen." This is the same ghost palette used in the counterfactual simulation overlay (4.20, Sub-Feature 3), creating visual consistency across all "road not taken" displays.

Below the two columns, a single summary line:

> **You gained +4 pass rate by choosing the Focused Fix. The Structural Fix would have left fewer unresolved clusters (1 vs. 1), but with a larger remaining cluster (22 vs. 18).**

This summary line is the pedagogical payload. It does not say "you chose correctly" or "you chose wrong." It states the trade-off in concrete terms. The player internalizes the arithmetic of their decision.

### The Close: Dismiss and Record

The Split Verdict Panel has two dismiss actions:

1. **"Got it"** — closes the panel, returns to the post-apply summary. The counterfactual result is recorded in the counterfactual history (4.38) as a "post-apply verification" entry.
2. **"I want to switch"** — this button does not exist. The counterfactual is verification, not an undo mechanism. The player cannot reverse their apply. This is a deliberate constraint: if they could switch, the agree-to-disagree choice would have no weight. The counterfactual is for *learning*, not for *hedging*.

The counterfactual result is automatically logged in the config's counterfactual history (4.38) under a new entry type: **Post-Apply Verification**. The history entry records:

```
v3.2 → Counterfactual Session: Mission 9, Post-Apply Verification
  ├── Applied Fix: SCOUT-A filter remove 'LOW_THREAT'  [✓ applied → v3.3]
  └── Verified Alternative: RELAY-C buffer +1           [simulated: 74→88]
      Trade-off: +4 pass rate gained, 1 larger unresolved cluster inherited
```

This entry persists in the config history and is visible in the counterfactual timeline (4.38), the career stats dashboard, and the config necropsy artifact if shared.

### Interaction with the Debt Ledger (4.83)

When the player applies the Focused Fix and the post-apply counterfactual reveals that the Structural Fix *would also have improved pass rate*, the debt ledger (4.83) increments its counter. The ledger entry includes the counterfactual result:

```
Debt Ledger Entry #4:
  Mission 9 — Chose Focused Fix (SCOUT-A filter) over Structural Fix (RELAY-C buffer)
  Pass rate delta: Focused +18, Structural +14
  Unresolved structural issue: RELAY-C buffer remains a failure source
  Post-apply verification: confirmed trade-off (player clicked "What if?")
```

The "confirmed trade-off" tag is significant. When the debt ledger reaches its threshold (5+ deferred structural fixes) and suggests a "debt clearing session," it can show the player: "You verified 4 of these 5 trade-offs with the counterfactual. You knew what you were deferring." This transforms the debt clearing suggestion from a nag into a callback — the player sees their own conscious pattern, not an automated warning.

### Interaction with the QUICK/THOROUGH Counterfactual (4.80)

Aspect 4.80 provides a similar one-click counterfactual, but for a different choice: "What if I had applied the QUICK result instead of the THOROUGH result?" Aspect 4.87 asks a different question: "What if I had applied the other *agree-to-disagree* option?"

The two counterfactuals can coexist when the player has run both QUICK and THOROUGH, received an agree-to-disagree divergence, and applied one of the two results. In this case, the Ghost Card area shows **two** ghost cards:

- **"What if: QUICK result?"** (4.80) — what if I'd applied the QUICK result without running THOROUGH?
- **"What if: other fix?"** (4.87) — what if I'd applied the un-chosen agree-to-disagree fix?

If the player applied the QUICK result (Focused Fix), these two ghost cards are distinct: one asks about the THOROUGH-only result, the other asks about the other agree-to-disagree option (which happens to be the THOROUGH result — but the framing is different because the question is "what if I'd applied the *fix your other mode found*" vs. "what if I'd applied the *other valid fix for a different failure cluster*").

If the player applied the THOROUGH result (Structural Fix), the 4.80 ghost card is: "What if I'd just used QUICK?" — this tests whether running THOROUGH was worth the token spend. The 4.87 ghost card is: "What if I'd applied the Focused Fix?" — this tests whether the fix choice was correct within the agree-to-disagree frame.

The two ghost cards are visually distinguished by icon: 4.80 uses a clock icon (time/budget question), 4.87 uses a forking-path icon (choice question). They can be clicked independently and their Split Verdict Panels stack if both are opened.

---

## Player Journeys

### Journey 1: Mei, 28, UX researcher, three weeks playing Robot Uprising

**Context:** Mission 7 — "Signal Flood." Mei has a 68/100 pass rate. She received her first agree-to-disagree result and chose the Focused Fix because the pass-rate number was higher. She is not confident in her choice.

---

INTERIOR — DEBRIEF SCREEN — NIGHT

The post-apply summary fills the screen. Config v2.4 is now active. The pass-rate bar has climbed from 68 to 84. Green. Satisfying.

MEI notices the Ghost Card in the bottom-right. A small translucent rectangle, breathing slowly. "COMMAND-B hook reroute" — the Structural Fix she didn't pick. The label reads: "What if?"

She stares at it. Her finger hovers. She applied the Scout filter change — it was +16 estimated. The Command hook reroute was +12. Four points less. She should feel fine. She doesn't.

She taps the Ghost Card.

The screen darkens. A loading bar — not a spinner, a horizontal sweep of golden light across the bottom edge. Two seconds. The Split Verdict Panel slides up from the bottom, the two columns materializing side by side.

Left column, full color: **YOUR CHOICE. SCOUT-A filter. 68 to 84. 16 failures resolved.**

Right column, ghost palette — grey-blue, scan-lined, translucent: **THE OTHER FIX. COMMAND-B hook reroute. 68 to 80. 12 failures resolved.**

MEI exhales. She was right. +16 vs. +12. The focused fix was genuinely better for pass rate.

But then she reads the bottom section. Under "Unresolved Clusters":

Her choice: "Command-B hook cascade (12 failures remain as active cluster)."

The other fix: "Scout-A filter overlap (16 failures remain as active cluster)."

The summary line: **"You gained +4 pass rate. The Structural Fix would have left a larger remaining cluster (16 vs. 12) but one with clearer diagnostic signal for next session."**

MEI stares at the phrase "clearer diagnostic signal." She doesn't fully understand it yet. But she files it away. She taps "Got it." The panel dissolves. She queues the next match.

Three sessions later, she's back at another agree-to-disagree. This time the Focused Fix is +14 and the Structural Fix is +13. Almost identical. She remembers the phrase "clearer diagnostic signal." She chooses the Structural Fix.

Post-apply, she clicks the Ghost Card again. Split Verdict: Focused would have been 74 to 88, Structural gave her 74 to 87. One point less — but the unresolved cluster from the Focused Fix would have been messy (compound failures across two agents), while the unresolved cluster from her Structural choice is clean (single-agent, single-element). She nods. She chose the one that makes next session's debrief easier. She's learning to think in diagnostic sequences.

---

### Journey 2: Tomasz, 41, DevOps engineer, four months playing Robot Uprising

**Context:** Mission 14 — "Adversarial Swarm." Tomasz is deep in competitive prep. He needs 90+ pass rate for the weekend tournament bracket. He's been running THOROUGH mode exclusively for three weeks. He receives an agree-to-disagree divergence and agonizes.

---

INTERIOR — HOME OFFICE — LATE EVENING

The agree-to-disagree panel shows two cards side by side. FOCUSED FIX: Striker-B skill swap, replace AREA_SCAN with TRACK_PRIORITY. Estimated +11. STRUCTURAL FIX: Relay-C buffer eviction priority reorder. Estimated +9.

TOMASZ has been staring for forty seconds. In the tournament, two pass-rate points could be the difference between seeding 3rd and 5th. He applies the Focused Fix. +11. Striker-B skill swap goes live.

The Ghost Card appears immediately. "RELAY-C eviction reorder." Breathing. Waiting.

TOMASZ clicks it before the post-apply animation finishes.

The Split Verdict Panel appears. Left column: his choice. 79 to 90. Eleven failures resolved. Right column, ghosted: 79 to 88. Nine failures resolved.

He scans to the bottom. Unresolved clusters for his choice: Relay-C eviction remains (9 failures). Unresolved for the other: Striker-B skill mismatch remains (11 failures), but the Relay-C cluster is gone.

Summary: **"You gained +2 pass rate. The Structural Fix would have eliminated a persistent Relay-C cluster that has appeared in 3 of your last 5 sessions."**

TOMASZ freezes on "3 of your last 5 sessions." He opens his counterfactual history (4.38). Scrolls. There it is: Relay-C eviction priority appeared as an unresolved cluster in sessions 11, 13, and 14. Three sessions. It was the same structural fix each time. He deferred it each time — always for a higher-pass-rate Focused Fix.

He opens the debt ledger (4.83). Four entries. Three of them cite Relay-C.

TOMASZ closes the Split Verdict Panel. Closes the debrief. Opens the plan phase config editor. Manually applies the Relay-C eviction reorder on top of the Striker-B skill swap. Deploys. Re-runs the scenario set.

Pass rate: 93.

Both fixes stack. He should have known. The counterfactual didn't tell him to do this — it showed him the pattern of his own avoidance, and he decided to stop avoiding.

---

### Journey 3: Suki, 22, computer science student, first week playing Robot Uprising

**Context:** Mission 3 — "Broken Relay." Suki just unlocked THOROUGH mode and received her very first agree-to-disagree divergence. She doesn't understand the vocabulary yet.

---

INTERIOR — DORM ROOM — AFTERNOON

SUKI has applied the Focused Fix because it had the bigger number. She's not sure why the game showed her two options. The post-apply summary looks normal — pass rate went up.

She notices the Ghost Card. It pulses. She doesn't know what "What if?" means in this context. She taps it because it's glowing and she taps glowing things.

The Split Verdict Panel appears. Two columns. She reads left: her fix, 52 to 67. She reads right: the other fix, 52 to 63. Her fix was better. The ghost column is grey and faded. She doesn't read the unresolved clusters section — she doesn't know what clusters are yet.

She taps "Got it." She leaves the debrief.

This is the correct experience for Suki. The counterfactual gave her a simple, reinforcing message: your choice was fine. It did not overwhelm her with cluster analysis or debt ledger patterns. The advanced information (unresolved clusters, cross-session patterns) was present but below the fold — in the section she scrolled past because she didn't have the vocabulary to read it.

Eight sessions later, after two more agree-to-disagree encounters, Suki notices the "Unresolved Clusters" section for the first time. She reads it. She doesn't fully understand it, but she notices that one of the cluster names is the same one that appeared in her last debrief's failure analysis. A connection forms. She starts reading the full Split Verdict Panel. The counterfactual is now teaching her.

---

### Journey 4: Ravi, 37, engineering manager, six months playing Robot Uprising

**Context:** Season 3 playoffs. Ravi runs the counterfactual habitually — he clicks the Ghost Card after every agree-to-disagree apply. He uses it as a calibration tool, not a regret tool.

---

INTERIOR — COMMUTE TRAIN — MORNING

RAVI applies the Structural Fix. It's +8, four points lower than the Focused Fix's +12. He doesn't hesitate. He has a theory: the Structural Fix will prevent a cascade that the Focused Fix would merely delay.

Ghost Card. Click.

Split Verdict: His choice, 86 to 94. The Focused Fix, 86 to 98.

His choice was four points worse. He knew that from the estimate. But the estimates were wrong — the actual simulated delta is four, not four. No surprise.

He scrolls to unresolved clusters. His choice: one clean cluster (Scout filter, 6 failures). The Focused Fix: two tangled clusters (Scout filter 6, plus a new Striker routing failure at 4 that didn't exist before the Focused Fix).

RAVI screenshots the Split Verdict Panel. Opens the team Discord. Posts the screenshot with the caption: "The Focused Fix would have created a new failure cluster. Structural Fix cost me 4 pass-rate points now but avoided a new debugging target next session."

Three teammates react with the custom Robot Uprising "ghost" emoji. One replies: "How did you know it would create a new cluster?" Ravi: "I didn't. The counterfactual showed me. That's why I click it every time."

---

## Strengths

1. **Collapses regret into information.** The "what if" question is going to exist in the player's head regardless. The counterfactual externalizes it, makes it answerable, and transforms anxiety into data.

2. **Teaches trade-off literacy.** The Split Verdict Panel does not judge. It shows two concrete outcomes. Over time, the player develops an intuition for "what kind of fix produces what kind of residual problem" — a transferable engineering skill.

3. **Reinforces correct choices.** Most of the time, the player's choice was fine or better. The counterfactual confirms this. Confirmation is not boring — it builds confidence and reduces second-guessing in future agree-to-disagree encounters.

4. **Creates shareable artifacts.** The Split Verdict Panel is screenshot-friendly. The two-column comparison format reads clearly as a social media post. Players will share "look at what I almost chose" moments — organic marketing that teaches the game's concepts to non-players.

5. **Low friction.** One click. Two-second simulation. The feature imposes no cost on players who don't want it (the Ghost Card is ignorable) and minimal cost on players who do.

6. **Integrates cleanly with existing systems.** The counterfactual history (4.38) already has infrastructure for recording forks. The debt ledger (4.83) already tracks deferred structural fixes. The ghost palette and scan-line texture already exist from the counterfactual simulation overlay (4.20). This feature is a new surface on existing infrastructure, not a new system.

---

## Weaknesses

1. **May increase post-apply dwell time.** Players who click the Ghost Card every time spend 5-10 seconds in the Split Verdict Panel. Over a session with 3-4 agree-to-disagree encounters, this adds 20-40 seconds of "looking backward" rather than moving forward. For competitive players in time-sensitive prep, this could feel like a drag.

2. **Simulated results may diverge from actual future outcomes.** The counterfactual re-simulates against the same scenario set. But the player's next match will use a *different* scenario set. The counterfactual's "unresolved clusters" prediction may not match reality. If the player treats the counterfactual as a guarantee rather than an estimate, they may over-trust it. Mitigation: the ghost palette's desaturated, translucent rendering is a constant visual reminder that this result is hypothetical.

3. **The "I want to switch" temptation.** The design deliberately excludes an undo button. Some players will want one. They will see the Split Verdict showing that the other fix was better by some metric and feel frustrated that they cannot switch. This frustration is intentional — the permanence of the choice is what gives the agree-to-disagree moment its weight — but it will generate complaints from players who expect undo mechanics.

4. **Ghost Card may be invisible to some players.** The semi-transparent, bottom-right positioning is subtle by design. Players who don't notice it will never discover the counterfactual. Mitigation: after the player's third agree-to-disagree encounter, a one-time tooltip appears pointing to the Ghost Card: "Wondering what would have happened? Tap to find out." This fires once and never again.

5. **Interaction with two-ghost-card state is potentially confusing.** When both 4.80 (QUICK counterfactual) and 4.87 (other-fix counterfactual) ghost cards are visible, the player must distinguish between two similar-looking "what if?" cards. The icon differentiation (clock vs. forking path) may not be sufficient for all players. Mitigation: tooltip text on hover/long-press makes the distinction explicit.

---

## Interaction Effects

### With 4.38 — Counterfactual History

The post-apply counterfactual generates a new entry type in the counterfactual history: **Post-Apply Verification**. This entry is distinct from explorer candidates and manual forks. It records: what was applied, what was simulated as the alternative, and the concrete pass-rate delta between them.

Over time, a player's counterfactual history becomes a record of their diagnostic decision-making. A player who consistently chooses the Focused Fix will have a history full of "simulated alternative: Structural Fix, +X pass rate deferred" entries. When reviewing their history (or sharing it as a necropsy artifact), the pattern is legible: "This player optimizes for immediate pass rate. They knowingly defer structural fixes."

This is not a judgment. It is a factual record. Some players will look at this record and decide to change their approach. Others will look at it and confirm that their approach is correct for their goals. Both are valid uses of the history.

### With 4.80 — "What If I Had Applied QUICK?"

The two counterfactuals coexist in the Ghost Card area but ask fundamentally different questions:

- **4.80 asks about budget**: "Was spending a THOROUGH token worth it? What would the QUICK result have given me?"
- **4.87 asks about judgment**: "Did I choose the right fix from the two valid options?"

A player can click both. The first teaches token economy. The second teaches fix selection. Together, they provide a complete retroactive evaluation of the debrief session: "Was running THOROUGH worth it?" (4.80) and "Did I pick the right result from THOROUGH?" (4.87).

### With 4.83 — Debt Ledger

The post-apply counterfactual enriches the debt ledger with verified trade-off data. Without the counterfactual, the debt ledger can only record: "Player chose Focused over Structural." With the counterfactual, the debt ledger records: "Player chose Focused over Structural, then verified: Focused was +4 pass rate better, Structural would have cleared a persistent cluster."

This enriched data makes the debt ledger's eventual "debt clearing session" suggestion more compelling. The suggestion can say: "You have 5 deferred structural fixes. In 4 of them, you verified the trade-off with the counterfactual. Here are the unresolved clusters you knowingly carried forward." The player cannot claim ignorance — they saw the trade-off, confirmed it, and chose to defer. The debt clearing session is not a warning; it is a scheduled follow-through on decisions the player already made.

### With 4.41 — Cluster-Masked Failure Discovery

The Split Verdict Panel's "Unresolved Clusters" section directly surfaces the masking effect described in 4.41. When the player applies the Focused Fix and the counterfactual shows that the Structural Fix would have exposed a different failure cluster, the player sees *in advance* what 4.41 would have shown them next session. The counterfactual is a preview of the masking effect, not just a retroactive verification.

---

## Comparable Games and Media

### Fire Emblem: Three Houses — Route Split Consequences

Fire Emblem: Three Houses asks the player to choose one of three factions at a midgame decision point. The other two factions become enemies. The game does *not* show the player what would have happened on the other routes — they must replay the entire game to find out. This creates intense community discussion ("What happens in the Blue Lions route?") and drives replayability, but it also creates lasting unresolved curiosity that some players find frustrating. Robot Uprising's post-apply counterfactual takes the opposite approach: show the road not taken immediately, as data. The trade-off is that the mystery is gone, but the learning is faster. Robot Uprising is a skill-building game, not a narrative game — mystery serves the latter, clarity serves the former.

### Chess Engine Post-Game Analysis

After a chess game, engines like Stockfish evaluate every move and show the "best move" that the player could have made instead. Players routinely review these analyses to understand what they traded by playing their actual move. The post-apply counterfactual is this pattern applied to a single high-stakes decision rather than every move. The emotional arc is the same: "I chose X. The engine says Y was 0.3 pawns better. But X was strategically motivated and I understand why I chose it." Chess players who review engine analysis develop faster. Robot Uprising players who click the Ghost Card will develop faster for the same reason.

### Medical Decision-Making and Outcome Audits

In clinical medicine, outcome audits review treatment decisions after the fact: "We chose Surgery A. The patient recovered in 14 days. Statistical models suggest Surgery B would have produced recovery in 11 days, but with a 3% higher complication rate." These audits are not punitive — they are calibration tools for clinical judgment. The Split Verdict Panel follows this structure: here is what happened, here is what would have happened, here is the trade-off you made. Over time, the clinician (or the player) develops calibrated intuition about which trade-offs are worth taking.

### The Sliding Doors Conceit

The 1998 film *Sliding Doors* shows two parallel timelines diverging from a single small event (catching or missing a train). The audience watches both timelines unfold simultaneously, understanding the consequences of the fork. The Split Verdict Panel is this conceit compressed into a single screen: two outcomes, one fork point, displayed side by side. The ghost palette (desaturated, scan-lined) for the un-chosen path mirrors the film's visual distinction between the "real" and "alternate" timelines.

---

## Sensory Description

### The Ghost Card — Appearance and Behavior

The Ghost Card is a 120x48px rounded rectangle anchored to the bottom-right of the post-apply summary panel. It renders in the **ghost palette**: a base color of `#3a4a5c` (steel blue-grey) at 65% opacity, with a 1px border of `#5a6a7c` at 40% opacity. The card's surface carries a faint **horizontal scan-line texture** — alternating 1px lines of full and 85% opacity — that reads as "simulated" or "unreal" without being visually noisy.

The card breathes. A CSS animation pulses the opacity between 55% and 75% over a 2.5-second cycle (0.4Hz), easing in and out. The effect is organic — it reads as something alive but dormant, waiting to be activated. The shimmer is visible in peripheral vision but does not compete with the pass-rate bar or the config summary for primary attention.

The fix name appears in `#8a9aac` (muted silver), 11px, semi-bold. Below it, the label "What if?" in `#6a8aaa` (desaturated teal), 10px, italic. The entire card has a `cursor: pointer` state that brightens the border to 60% opacity and stops the breathing animation (steady 75%).

### The Loading Sweep

When the player clicks the Ghost Card, the simulation begins. No spinner. Instead, a **horizontal golden sweep** crosses the bottom edge of the screen from left to right, taking 1.8-2.4 seconds. The sweep is a 3px-tall gradient bar: transparent at the leading edge, full gold (`#c9a84c`) at center, transparent at the trailing edge. It moves at constant velocity. The gold color is the same EDT marker gold used throughout the debrief — it signals "the game is computing an outcome."

During the sweep, the post-apply summary panel dims to 40% opacity. Not a modal overlay — the content is still visible, just receding. The dimming signals: "something is replacing this view."

### The Split Verdict Panel — Arrival

The Split Verdict Panel slides up from the bottom of the viewport over 300ms, eased with a cubic-bezier curve that decelerates sharply (fast start, slow settle). The panel is 680px wide and 420px tall (responsive — scales to viewport). It has a dark background (`#1a1e24`, near-black with a blue cast) and a 1px top border in gold (`#c9a84c`, 30% opacity).

The left column (YOUR CHOICE) renders in the **standard debrief palette**: background `#1e2830`, fix name in white (`#e8eaed`), pass-rate numbers in green (`#4caf7c`) for improvement. The pass-rate bar is the standard filled bar — solid green segments on a dark track.

The right column (THE OTHER FIX) renders in the **ghost palette**: background `#1a1e24` with the scan-line texture overlay. Fix name in `#8a9aac`. Pass-rate numbers in `#5a8a7c` — a desaturated green that reads as "hypothetical positive." The pass-rate bar uses dashed segments instead of solid, ghosted to 60% opacity.

Between the two columns, a thin vertical divider: 1px, `#3a4a5c`, with a small forking-path icon centered at the top — two lines diverging from a single point, rendered in `#6a8aaa`.

### The Summary Line

Below both columns, separated by 16px of padding, a single line of text in `#9aaabb` (warm silver), 13px, regular weight. The text is procedurally generated based on the delta between the two outcomes. It reads cleanly, without jargon: "You gained +4 pass rate by choosing the Focused Fix. The Structural Fix would have left fewer unresolved clusters."

### The Dismiss

The "Got it" button sits bottom-center of the panel. Rounded rectangle, 80x32px, border-only (no fill), `#5a6a7c` border, `#8a9aac` text. On hover: border brightens to `#8a9aac`, text brightens to `#c8d0d8`. On click: the panel slides down over 200ms (faster than the arrival — the departure should feel crisp, not lingering). The post-apply summary panel fades back to full opacity over 300ms.

### Audio

The Ghost Card click produces a soft **glass chime** — a single note, C5, with a metallic shimmer decay over 400ms. It reads as "opening a window to another possibility." Not dramatic. Curious.

The Split Verdict Panel's arrival is accompanied by a quiet **stereo divergence sound**: a single tone that splits into two slightly detuned tones panning left and right, settling into a gentle hum. The hum fades over 2 seconds. This is the "forking path" audio motif — the same tonal split used in the counterfactual simulation overlay (4.20) when the ghost replay diverges from the original, shortened here to a single event rather than an ongoing accompaniment.

The "Got it" dismiss produces a soft **convergence click** — the two detuned tones snap back to a single centered tone, lasting 200ms. The fork closes. The player is back in the single timeline.

No audio plays during the loading sweep. The golden bar is silent — its movement is visual rhythm, not auditory. Adding audio to a 2-second load would make the wait feel longer.

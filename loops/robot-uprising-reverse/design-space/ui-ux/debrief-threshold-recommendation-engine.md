# Threshold Recommendation Engine

**Aspect:** 4.69l — Threshold recommendation engine: analyzes the player's last 5 career analyses and recommends a threshold adjustment based on false positive rate and flag dismissal frequency; "you dismissed 4 of the last 5 cluster flags without acting — recommend raising threshold to 4+"; explicit recommendation + one-tap accept.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69k — Cluster flag history; 4.69h — Phase presets
**Related:** 4.63 — Pre-ranking configurable weights; 4.69d — Multi-cluster persistence tracking; 4.68 — Coverage percentage as season health; 4.49 — Cross-mission pattern detection

---

## The Core Problem

The multi-cluster threshold (4.69a) is a personalization parameter. Players set it once — usually at the default N=3 — and forget about it. The problem is that the right threshold changes as the player's config evolves, but the player has no reason to revisit the setting. Three failure modes emerge:

**Failure Mode 1: Threshold rot.** A player who started with 5 agents at N=3 now has 18 agents. At 18 agents, N=3 fires almost every career analysis because the candidate pool naturally distributes across more agents, creating incidental 3-entry clusters. The player has been dismissing cluster flags for 40 matches. Each dismissal costs 3 seconds of attention and erodes trust in the diagnostic system. The player does not think "I should raise my threshold" — they think "this feature is broken." The threshold setting exists (4.69a), but the player has no prompt to use it.

**Failure Mode 2: Suppressed vigilance.** A player who raised their threshold to N=4 during a noisy period now has a cleaner, more segmented config. At N=4, genuine clusters are being missed — an agent with 3 entries in the top 10 is a real signal in a well-segmented 8-agent config, but the flag never fires. The player's coverage trend is flattening (4.68), and they don't connect the flat trend to the silent threshold. They needed to lower the threshold 30 matches ago.

**Failure Mode 3: The permanent dismisser.** A player who has never changed the threshold from N=3 dismisses the flag every time it fires — not because the threshold is wrong, but because they don't understand what the flag means. They have a learning problem, not a calibration problem. The recommendation engine must distinguish between "this player dismisses because the threshold is wrong" and "this player dismisses because they don't understand the feature."

The threshold recommendation engine solves these by analyzing the player's behavioral history with cluster flags and surfacing an explicit, actionable recommendation at the moment it becomes relevant. It is a metacognitive nudge: the game watches how the player interacts with its diagnostic tools and suggests recalibration when the interaction pattern suggests miscalibration.

---

## The Design

### The Recommendation Algorithm

The engine runs after every career analysis, examining the player's last 5 career analysis sessions. It tracks three signals per session:

**Signal 1: Flag outcome.** For each cluster flag that fired in the last 5 sessions, the engine records the player's response:
- **Dismissed** — Player clicked "Dismiss" or "Skip — apply #1 fix anyway" without opening the Agent Audit
- **Read-dismissed** — Player opened the Agent Audit, read it, then dismissed without taking action
- **Acted** — Player applied all cluster fixes, entered redesign mode, or applied individual fixes from the cluster members
- **No flag** — No cluster flag fired in this session (threshold was not reached)

**Signal 2: False positive estimate.** For each acted-on cluster flag, the engine checks whether the player's coverage improved meaningfully in subsequent sessions. If the player redesigned an agent after a cluster flag and coverage improved by 5+ pp in the next 3 sessions, the flag was a true positive. If coverage did not improve (or worsened), the flag may have been a false positive — the redesign was unnecessary or counterproductive. For dismissed flags, the engine checks whether the flagged agent continued to cluster in subsequent sessions: if it did, the dismissal was a missed true positive. If it didn't, the dismissal was a correct rejection.

**Signal 3: Flag frequency.** How many flags fired per session, averaged over the last 5. A session with 3+ simultaneous cluster flags is almost certainly a noisy threshold — no player can meaningfully act on three structural diagnoses at once.

### The Decision Matrix

The engine combines these signals into one of four recommendation states:

```
State: RAISE_THRESHOLD
Trigger: 3+ of last 5 flags were dismissed (not read-dismissed or acted)
         OR average flags per session > 2.0
Recommendation: "You dismissed [N] of the last 5 cluster flags.
                 Recommend raising threshold to [current + 1]."
Action: [Accept — raise to N+1]  [Keep current threshold]
```

```
State: LOWER_THRESHOLD
Trigger: 0 flags in last 5 sessions
         AND at least 1 agent has appeared in 2+ candidate slots
             in 3+ of those 5 sessions (sub-threshold clustering)
         AND coverage trend is flat or rising (4.68)
Recommendation: "No cluster flags in your last 5 analyses, but [AGENT]
                 has appeared in 2 candidate slots consistently.
                 Recommend lowering threshold to [current - 1]."
Action: [Accept — lower to N-1]  [Keep current threshold]
```

```
State: LEARN_MORE
Trigger: 3+ of last 5 flags were dismissed
         AND player has never opened the Agent Audit
         AND player has fewer than 50 matches total
Recommendation: "Cluster flags keep appearing. Try tapping
                 [View Agent Audit] next time to see why."
Action: [Show me an example audit →]  [Dismiss]
Note: This is the learning-problem path, not the calibration path.
      "Show me an example" opens a pre-built demo audit for the
      player's most-recently-flagged agent.
```

```
State: CALIBRATED
Trigger: None of the above conditions met.
         The player is acting on some flags, dismissing others,
         and the frequency is manageable.
Recommendation: None. No banner. No nudge. Silence is the signal
                that calibration is correct.
```

### The Recommendation Surface

The recommendation appears as a **card** inserted at the bottom of the career analysis result panel, below the candidate list and below any active cluster flag. It is not a modal. It does not overlay the results. It is scroll-reachable: the player sees the candidate list, sees any cluster flags, and then — if they scroll past — finds the recommendation card.

The card has a distinct visual identity from cluster flags. Cluster flags are amber. The recommendation card is a cool slate blue — the color of a system-level suggestion rather than a match-level diagnostic. The card is 80px tall, with a left-edge accent stripe in the same slate blue. Its typography is slightly smaller than cluster flag text (14px vs. 16px), signaling that this is metadata about the diagnostic system, not part of the diagnosis itself.

```
┌─ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ─┐
│  THRESHOLD RECOMMENDATION                                  │
│                                                            │
│  You dismissed 4 of the last 5 cluster flags without       │
│  acting. Your current threshold (3+) may be too sensitive  │
│  for your 14-agent config.                                 │
│                                                            │
│  Recommend: raise threshold to 4+                          │
│                                                            │
│  [Accept — raise to 4+]          [Keep at 3+]              │
│                                                            │
│  Last 5 analyses: ✕ ✕ ✕ ✓ ✕                               │
│  (✕ = dismissed, ✓ = acted on)                             │
└─ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ─┘
```

The "Last 5 analyses" row is a compact history strip — five small icons in a row, each representing one session. Dismissed sessions are rendered as small X marks in muted gray. Acted-on sessions are rendered as small checkmarks in teal. No-flag sessions are rendered as small dashes. The strip gives the player an immediate visual summary of their own behavior pattern without requiring them to recall it.

### The One-Tap Accept

The `[Accept — raise to 4+]` button is the critical interaction. It updates the threshold immediately. No confirmation dialog. No navigation to settings. One tap. The button text changes to "Threshold updated to 4+" for 2 seconds (in-place confirmation), then the card fades out with a 300ms ease-out. The next career analysis will use the new threshold.

The one-tap design is deliberate: the recommendation engine has done the analysis work. The player should not have to also do the work of navigating to settings, finding the threshold control, and adjusting it manually. The accept button collapses the entire calibration workflow into a single gesture.

The `[Keep at 3+]` button dismisses the card for this session. The engine will re-evaluate after the next career analysis. If the dismissal pattern continues, the recommendation will reappear. It does not reappear more than once per session — the engine is persistent but not nagging.

### Recommendation Cooldown

After the player accepts a recommendation, the engine enters a 5-session cooldown. It does not issue another recommendation until 5 career analyses have elapsed with the new threshold. This prevents oscillation: accept → lower → raise → lower. The cooldown gives the new threshold time to demonstrate its signal quality before the engine evaluates again.

After the player rejects a recommendation (clicks "Keep"), the engine enters a 3-session cooldown. This is shorter than the accept cooldown because the player's behavior may change faster than the engine's patience — if they continue dismissing, the recommendation should return relatively soon.

---

## Player Journeys

### Journey: Tomoko, 31, UX Designer — The Gradual Threshold Drifter

**Context:** Tomoko is in Season 3, Match 210. She started with 5 agents and now runs 14. She set her threshold to N=3 in Season 1 and has never changed it. Over the last 20 career analyses, she has been dismissing cluster flags with increasing irritation. She doesn't remember that the threshold is configurable.

**Minute 0:00 — Career Analysis #47 Loads**

The career analysis result panel fades in. Tomoko sees the candidate list — 10 entries, well-distributed across her 14 agents. Two agents have 3-entry clusters: RELAY-D and COMMAND-B. Two amber cluster flags slide in from the right, stacking vertically.

She reads the first flag: "RELAY-D appears in 3 of your top 10 candidates." She knows RELAY-D. She patched it last session. The 3 entries are all minor — combined coverage is only 22%, barely above the top candidate alone. She clicks [Dismiss].

She reads the second flag: "COMMAND-B appears in 3 of your top 10 candidates." She checked COMMAND-B's audit two sessions ago and decided it was fine — the cluster was incidental, driven by a specific mission type she doesn't play anymore. She clicks [Dismiss].

Both flags gone. She applies the #1 fix (SCOUT-E hook threshold, 41% coverage). She scrolls down to check if there's anything else.

**Minute 0:45 — The Recommendation Card**

Below the candidate list, below where the cluster flags were, she sees a new card she hasn't seen before. Slate blue accent stripe on the left. The header reads "THRESHOLD RECOMMENDATION."

She reads: "You dismissed 4 of the last 5 cluster flags without acting. Your current threshold (3+) may be too sensitive for your 14-agent config."

Below the text: a row of five small icons. Four gray X marks, one teal checkmark. She recognizes the pattern — that checkmark was the session where she actually redesigned RELAY-D after a genuine cluster event. The other four were noise.

She reads the recommendation: "Recommend: raise threshold to 4+."

She thinks: "4+? That means only flag when an agent has 4 entries in the top 10." With 14 agents, that would require roughly 40% of the candidate pool pointing at one agent. That's a strong signal. She'd only see it when something is genuinely wrong.

She taps [Accept — raise to 4+]. The button text changes to "Threshold updated to 4+" in a brief teal flash. The card fades out. She feels relief — the game noticed she was frustrated and offered to fix it.

**Minute 1:10 — Three Sessions Later**

Tomoko runs three more career analyses. No cluster flags. The candidate lists are clean and actionable. She applies top fixes, runs matches, repeats. The diagnostic experience feels quieter and more focused. She doesn't miss the cluster flags — when one eventually fires (SCOUT-E at 4 entries, genuine architectural drift), she reads it carefully and acts on it. The signal quality is high.

**UI Annotations:**
- The recommendation card appears below the candidate list, requiring a scroll to reach. It is never auto-scrolled to — the player must discover it by scrolling past the main results. This prevents it from feeling like an interruption.
- The five-icon history strip uses 12px icons with 8px spacing. The strip is left-aligned with the recommendation text, creating a visual baseline that connects the behavioral evidence to the recommendation.
- The [Accept] button is styled as a primary action (filled background, slate blue matching the card accent). The [Keep] button is styled as secondary (outlined, no fill). The visual weight difference makes the recommended action the path of least resistance.

---

### Journey: Rafael, 22, Competitive Gamer — The Lowering Recommendation

**Context:** Rafael is in Season 5, Match 340. He raised his threshold to N=4 during Season 3 when his 20-agent config was generating constant noise. Since then, he's streamlined to 8 highly-specialized agents. His threshold is still N=4 — too high for his current config. His coverage trend (4.68) has been flat for 30 matches. He hasn't seen a cluster flag in 12 career analyses.

**Minute 0:00 — Career Analysis #62 Loads**

Rafael sees the candidate list. Clean. No flags. He applies the #1 fix (STRIKER-A hook timing, 38% coverage). He scrolls down, checking for anything below.

**Minute 0:15 — The Lowering Recommendation**

Below the candidate list, the slate blue card appears. He hasn't seen this card before. He reads:

"No cluster flags in your last 5 analyses, but RELAY-F has appeared in 2 candidate slots consistently. Your coverage trend has been flat since Match 310. Recommend lowering threshold to 3+."

The history strip shows five small dashes — no flags fired in any of the last 5 sessions. Below the strip, a secondary detail line: "RELAY-F: 2 entries in 4 of last 5 analyses (sub-threshold)."

Rafael thinks about this. RELAY-F has been quietly appearing twice in every analysis. At N=4, it never triggers a flag. But the persistence — 4 out of 5 analyses — is exactly the kind of gradual degradation that the cluster flag is designed to catch. His flat coverage trend now makes sense: he's been applying element-level fixes while RELAY-F's structural problem goes undetected.

He taps [Accept — lower to 3+]. The card fades. He makes a mental note to watch for RELAY-F in the next analysis.

**Minute 2:00 — Next Career Analysis**

The next analysis fires a cluster flag: "RELAY-F appears in 3 of your top 10 candidates." He opens the Agent Audit. Combined coverage: 54%. Root cause: dependency gap — RELAY-F was tuned for the signals SCOUT-C was producing before Rafael rebuilt SCOUT-C in Season 4.

He redesigns RELAY-F. His coverage drops from 34% to 18% in the next session. The flat trend breaks downward. The recommendation engine correctly identified that his threshold was masking a real problem.

**Minute 5:00 — Silence From the Engine**

Over the next 5 sessions, the recommendation engine is in cooldown (post-accept). No recommendation cards appear. Rafael's new N=3 threshold fires once — he acts on it. The engine evaluates after cooldown and finds: 1 flag in 5 sessions, acted on. State: CALIBRATED. No recommendation issued. Silence.

**UI Annotations:**
- The lowering recommendation includes the sub-threshold clustering data ("RELAY-F: 2 entries in 4 of last 5 analyses") as a secondary detail line in smaller text (12px, medium gray). This is the evidence line — it shows the player what the engine saw that they didn't.
- The coverage trend reference ("flat since Match 310") links to the season health panel (4.68) when tapped. The link is a subtle underline on "flat since Match 310" — not a button, but a navigation affordance for players who want to verify.

---

### Journey: Kai, 15, First Strategy Game — The Learning Path

**Context:** Kai has been playing for 3 weeks. He's in Season 1, Match 55. He has 4 agents, all loosely differentiated. His threshold is the default N=3. Every career analysis fires 1-2 cluster flags. He dismisses all of them because he doesn't understand what "multi-cluster" means. He has never opened the Agent Audit.

**Minute 0:00 — Career Analysis #8 Loads**

Two cluster flags fire. Kai dismisses both without reading, as usual. He applies the #1 fix.

**Minute 0:10 — The Learning Recommendation**

He scrolls past the candidate list and sees the slate blue card. It reads:

"Cluster flags keep appearing. Try tapping [View Agent Audit] next time to see why."

This is the LEARN_MORE state. The engine detected: 5 of last 5 flags dismissed, player has never opened the Agent Audit, player has fewer than 50 matches. This is not a calibration problem — the player doesn't know what the feature does.

Below the recommendation text: [Show me an example audit] and [Dismiss].

Kai taps [Show me an example audit]. The Agent Audit panel slides in from the right, populated with his most-recently-flagged agent (SCOUT-A). He sees the cluster members, the combined coverage number, the root cause hypotheses. The `[?]` info icons are visible on every technical term (first-encounter mode, per 4.69 journey annotations).

He reads: "Role drift: agent design last updated Match 3. Role changed from short-range to mixed-range since Match 30." He understands this — he did change SCOUT-A's patrol area. He didn't know the game was tracking that.

He closes the audit. He doesn't redesign SCOUT-A — he's not ready. But the next time a cluster flag fires, he opens the Agent Audit instead of dismissing. He reads the root cause. He clicks [Apply All Three Fixes].

**Minute 3:00 — The Transition to Calibration**

After Kai has opened the Agent Audit 3 times, the engine re-evaluates. He is no longer in the LEARN_MORE state (he's now engaging with the feature). His dismissal rate drops from 100% to 40%. The engine finds: 2 of last 5 flags dismissed, 3 acted on. State: CALIBRATED. No recommendation. The system taught him what it needed to teach.

Ten sessions later, Kai has 9 agents. The flag fires every other session. He's dismissing 3 of 5 again — but now it's genuine noise from a growing config, not ignorance. The engine enters RAISE_THRESHOLD state and recommends N=4. He accepts. The cycle completes: learn, engage, outgrow, recalibrate.

**UI Annotations:**
- The LEARN_MORE card has a warmer tone than the RAISE/LOWER cards. The accent stripe is a soft amber rather than slate blue — visually connecting it to the cluster flag system rather than the meta-diagnostic system. The message reads as a tip, not a system recommendation.
- [Show me an example audit] opens the Agent Audit panel in a read-only demonstration mode. The "Apply All Three" and "Redesign" buttons are present but disabled (grayed out with tooltip: "This is a preview. Dismiss and tap View Agent Audit on a live flag to take action."). The player sees the full UI without being able to accidentally commit changes from a demo context.
- The transition from LEARN_MORE to CALIBRATED is silent — no card, no confirmation, no "congratulations you learned the feature." The absence of the card is the signal that calibration is proceeding correctly.

---

### Journey: Ananya, 27, Data Scientist — The Rejection and Return

**Context:** Ananya has 12 agents in a well-segmented config. Her threshold is N=3. She dismisses cluster flags selectively — some she reads and dismisses because she disagrees with the root cause hypothesis, others she acts on. The engine evaluates her as RAISE_THRESHOLD because 3 of her last 5 flags were dismissed, but her dismissals are informed, not reflexive.

**Minute 0:00 — The Recommendation Appears**

The slate blue card appears: "You dismissed 3 of the last 5 cluster flags. Recommend raising threshold to 4+."

Ananya reads it and frowns. She dismissed those flags because the root causes were wrong, not because the flags were noise. The 3-entry clusters were real — she just determined that the structural issues weren't worth redesigning right now. She wants to keep N=3 so she can see the clusters and make her own judgment.

She taps [Keep at 3+].

**Minute 0:05 — Three Sessions Later**

The 3-session cooldown elapses. Ananya has dismissed 1 flag and acted on 1. Her 5-session window now shows: dismiss, dismiss, dismiss, act, dismiss. The engine still sees 4/5 dismissed. The RAISE_THRESHOLD recommendation reappears.

She taps [Keep at 3+] again. She understands the engine's logic but disagrees with its conclusion. The engine can't distinguish "informed dismissal" from "reflexive dismissal" — it sees only the outcome.

**Minute 0:10 — The Engine Backs Off**

After two consecutive rejections of the same recommendation, the engine enters an extended cooldown: 8 sessions. It has learned that this player has considered the recommendation and declined. The extended cooldown is specific to the direction — the engine won't recommend RAISE again for 8 sessions, but could still recommend LOWER if conditions change.

When the 8-session cooldown expires, Ananya's pattern has shifted. She acted on 2 of the last 5 flags (she found genuine structural issues). The engine evaluates: CALIBRATED. No recommendation. The system respected her expertise.

**UI Annotations:**
- After the second rejection of the same recommendation, the card shows a subtle addition: "This recommendation won't appear again for 8 sessions." This one line communicates that the engine heard the rejection and will respect it — the player is not fighting an infinite loop.
- The extended cooldown is directional: rejecting RAISE does not prevent LOWER from appearing. The engine treats each direction as an independent recommendation channel.

---

## Strengths and Weaknesses

**Strengths:**

- **Closes the calibration loop.** The threshold setting (4.69a) gives the player a knob. The recommendation engine tells the player when to turn it. Without the engine, the knob exists but is never revisited — a dead setting. With the engine, the knob stays calibrated as the player's config evolves.

- **Behavioral evidence is more persuasive than abstract advice.** "You dismissed 4 of the last 5 flags" is a statement about the player's own behavior, not a design opinion. The player recognizes the pattern in themselves. This is more motivating than "experts recommend N=4 for configs with 14+ agents" — which is prescriptive and impersonal.

- **One-tap accept removes friction.** The entire value proposition of the recommendation engine is that it collapses a multi-step workflow (notice frustration, remember the setting exists, navigate to settings, find the threshold, adjust it) into a single gesture. If the accept required confirmation dialogs or settings navigation, the engine would add friction instead of removing it.

- **The LEARN_MORE path separates calibration problems from comprehension problems.** New players who dismiss flags because they don't understand them get a different intervention than experienced players who dismiss because the threshold is wrong. This prevents the engine from recommending higher thresholds to players who actually need education.

- **Graceful backoff.** The cooldown and extended-cooldown mechanics prevent the engine from becoming another source of notification fatigue. Repeated rejection is respected, not overridden.

**Weaknesses:**

- **Cannot distinguish informed dismissal from reflexive dismissal.** The engine sees "dismissed" as a binary. A player who opened the audit, read the root cause, disagreed with it, and dismissed is indistinguishable from a player who hit Escape without reading. The read-dismissed signal partially addresses this, but a player who reads quickly and disagrees is still counted as "read-dismissed," which the engine treats differently from "dismissed" — this distinction may not be reliable.

- **The 5-session window is arbitrary.** Why 5? A player who had 4 noisy sessions followed by 1 productive session is in the same state as a player who had 1 productive session followed by 4 noisy ones. The temporal ordering within the window is lost. A weighted-recency model (more recent sessions count more) would be more accurate but harder to explain to the player in the recommendation text.

- **Creates a dependency on behavioral tracking.** The engine requires persistent storage of flag outcomes across sessions. If the player switches devices, clears save data, or if the tracking system has a bug, the recommendation will be based on incomplete data. The recommendation text must never show false evidence ("you dismissed 4 of 5" when the actual count is wrong).

- **Recommendation oscillation risk.** A player who accepts RAISE, then encounters a genuine cluster at the new threshold, acts on it, then has 5 quiet sessions could receive LOWER. They lower. Now the noise returns. They get RAISE again. The cooldown mitigates this, but edge cases exist where the player's config is right at the boundary between two thresholds. The engine has no concept of "you're at a boundary — either setting is fine."

- **The LEARN_MORE path assumes flag dismissal equals ignorance.** A new player with fewer than 50 matches who dismisses flags might simply prefer element-by-element play — a valid playstyle. Routing them to the Agent Audit demo could feel patronizing. The opt-out ([Dismiss] on the LEARN_MORE card) mitigates this, but the card still appeared.

---

## Interaction Effects

### With 4.69a — Multi-Cluster Threshold Configurability

The recommendation engine is a companion to the threshold setting, not a replacement. The engine recommends; the setting persists. A player who manually adjusts their threshold in the settings panel bypasses the engine entirely — the engine's next evaluation will use the manually-set threshold as the baseline. If the player manually sets N=5 and then the engine detects sub-threshold clustering, the engine may recommend lowering to N=4. The engine does not assume it is the only writer of the threshold value.

**Design coordination:** The settings panel (4.69a) should show the engine's last recommendation and its status: "Recommendation engine last suggested N=4 (accepted, Match 215)." This creates a paper trail — the player can see when and why the threshold was last changed, whether by their own hand or by accepting a recommendation.

### With 4.69k — Cluster Flag History

The cluster flag history log (4.69k) provides the raw data the recommendation engine consumes. Every flag outcome — fired, dismissed, read-dismissed, acted-on — is recorded in the history. The recommendation engine queries the last 5 entries in this history. If the player opens the flag history, they can see the same pattern the engine detected: "I really have dismissed 4 of the last 5." The history log validates the engine's claim.

**Design coordination:** The recommendation card should include a link to the flag history: "Based on your last 5 analyses [view history]." This lets the skeptical player verify the engine's evidence before accepting or rejecting.

### With 4.69h — Phase Presets

Phase presets allow the player to set different thresholds for different campaign phases (early season: N=4, late season: N=2). The recommendation engine must be phase-aware: if the player is using phase presets, the engine evaluates dismissal patterns within the current phase, not across phases. A player who dismisses flags in early-season (where N=4 is their chosen preset) should not receive a RAISE recommendation — they already have a phase-specific calibration.

**Design coordination:** When phase presets are active, the recommendation card acknowledges them: "Your early-season preset is N=3. You dismissed 4 of 5 flags during early-season analyses. Recommend raising early-season preset to 4+." The recommendation targets the specific preset, not the global threshold.

### With 4.63 — Pre-Ranking Configurable Weights

The pre-ranking weight configuration (4.63) and the threshold recommendation engine share a design philosophy: the game watches how the player uses a diagnostic tool and suggests recalibration when the usage pattern suggests the tool is misconfigured. The weight sliders in 4.63 are the pre-ranking's calibration knob; the threshold is the cluster detection's calibration knob. Both need a feedback mechanism.

**Design coordination:** If both systems issue recommendations simultaneously (rare, but possible after a major config change), they should not stack visually. The recommendation engine card appears below the candidate list; the weight recommendation (if one existed) would appear in the transparency drawer. Different surfaces for different calibration domains.

### With 4.68 — Coverage Percentage as Season Health

The coverage trend is one of the engine's inputs for the LOWER_THRESHOLD state. A flat or rising coverage trend combined with zero cluster flags suggests the threshold is masking structural problems. The engine's recommendation to lower the threshold is essentially saying: "your coverage isn't improving, and you're not seeing the diagnostic that might explain why."

**Design coordination:** The recommendation card for LOWER_THRESHOLD should reference the coverage trend explicitly: "Coverage flat since Match 310." This connects the calibration recommendation to the outcome metric the player cares about — the reason to lower the threshold is not abstract ("you might be missing signals") but concrete ("your coverage stopped improving, and here's a possible reason").

---

## Comparable Games / Media

### IDE Inspection Severity — IntelliJ / VS Code

Modern IDEs allow configuring the severity of code inspections: Error, Warning, Info, or Disabled. Most developers set these once and forget. Some IDEs now offer "inspection profiles" that adapt to the project's codebase size and style — effectively recommending which inspections should be active based on the project's characteristics. The threshold recommendation engine is the same pattern: the game observes the player's interaction with a diagnostic tool and recommends adjusting its sensitivity.

The key difference: IDE recommendations are based on static analysis of the codebase, while the threshold engine is based on behavioral analysis of the player. The engine watches what the player *does* with the warnings, not what the codebase *contains*. This is closer to GitHub's "You've been ignoring Dependabot alerts for 30 days — would you like to adjust your notification settings?" than to IntelliJ's "this inspection is noisy for your project type."

### Notification Management in iOS / Android

Both mobile operating systems now offer notification summaries and focus modes that learn from dismissal patterns. If you dismiss notifications from an app consistently, iOS will offer to move that app's notifications to the summary. The UX is identical: observe dismissal frequency, surface a one-tap recalibration, respect rejection. The threshold recommendation engine borrows this interaction model directly.

The design lesson from mobile notifications: the recommendation must appear at the moment of highest relevance (right after the pattern completes), not in a settings audit screen. iOS shows the notification suggestion in-context, not in Settings > Notifications. The engine follows the same principle: the recommendation appears in the career analysis result panel, not in a settings menu.

### Spotify Discover Weekly — Implicit Preference Detection

Spotify's recommendation algorithm observes skip behavior to infer preferences: songs you skip are negative signals, songs you listen to completion are positive. The threshold recommendation engine uses the same signal taxonomy: dismissed flags are negative, acted-on flags are positive. The engine infers whether the diagnostic threshold matches the player's preferences by watching how they interact with the output.

The difference: Spotify's algorithm is opaque (you don't see "you skipped 4 of 5 pop songs — reducing pop in recommendations"). The threshold engine is transparent: it shows the evidence ("you dismissed 4 of 5 flags") and the recommendation ("raise to 4+"). The transparency is essential — the player must trust the recommendation enough to accept it with one tap, and trust requires legibility.

### Into the Breach — Damage Preview as Implicit Calibration

Into the Breach shows damage previews before every action — every enemy attack is telegraphed. There is no way to turn this off. The designers decided that full information is always better than partial information. The threshold recommendation engine takes the opposite position: it acknowledges that different players want different amounts of diagnostic information, and helps each player find their preferred level. Into the Breach is prescriptive ("you will see all previews"); Robot Uprising is adaptive ("we'll help you find the right amount of diagnostic noise").

---

## Sensory Description

### The Recommendation Card

The card enters the DOM when the career analysis result panel loads, but it does not animate in. It is simply present at the bottom of the panel, below the candidate list, below any cluster flags. The player discovers it by scrolling — no animation draws attention to it. This is deliberate: the recommendation is not urgent. It is there when the player is ready.

The card's background is a very pale cool gray — nearly white but with a slight blue cast, distinguishing it from the warm white of the candidate list cards. The left-edge accent stripe is 4px wide, slate blue (#5B7B9A), running the full height of the card. The header text "THRESHOLD RECOMMENDATION" is in small caps, 11px, medium gray, letter-spaced at 1.5px — the typographic treatment of a system-level label, not a game-level alert.

The recommendation body text is 14px, dark gray (#333), in the same typeface as the career analysis explanations. The tone is conversational but precise: "You dismissed 4 of the last 5 cluster flags without acting." No hedging, no softening. The evidence is stated as fact.

The five-icon history strip sits on its own line, centered vertically within a 24px-tall row. Each icon is 12px: gray X marks for dismissed, teal checkmarks for acted, slate dashes for no-flag sessions. The icons have 8px horizontal spacing. The strip reads left-to-right, oldest to most recent. Below the strip, a legend in 10px text: "(X = dismissed, check = acted on)."

The [Accept] button is pill-shaped, 36px tall, filled with the same slate blue as the accent stripe. Text: white, 13px, medium weight. The [Keep] button is pill-shaped, 36px tall, outlined in slate blue with no fill. Text: slate blue, 13px, medium weight. The buttons sit side by side with 12px spacing, right-aligned within the card.

### The Accept Animation

When the player taps [Accept], three things happen over 600ms:

1. **Button transform (0-200ms).** The [Accept] button's text cross-fades from "Accept — raise to 4+" to "Threshold updated to 4+". The button background shifts from slate blue to a soft teal — the color of successful application throughout the game's design language. The [Keep] button fades to 0% opacity simultaneously.

2. **Card compression (200-500ms).** The card height compresses from 80px to 40px with an ease-out curve. The recommendation text and history strip fade out. Only the confirmation text remains, centered in the shorter card.

3. **Card fadeout (500-800ms).** The compressed card fades to 0% opacity and collapses to 0px height, with the content below it (if any) sliding up to fill the space. The entire motion is smooth and conclusive — the recommendation has been accepted and dismissed in one gesture.

### Audio

The recommendation card has no arrival sound — it appears silently, discovered by scrolling. When the player taps [Accept], a single short tone plays: a clean major second (C to D), 100ms duration, at 60% volume relative to the game's UI sound level. The tone is bright and settled — not a celebration, but an acknowledgment. It is distinct from the cluster flag's arrival chime (rising minor third, D to F) and from the fix-application confirmation (descending perfect fourth, G to D). Each diagnostic action has its own interval, building a tonal vocabulary across the debrief experience.

When the player taps [Keep], no sound plays. The card simply fades. Silence signals "nothing changed" — the absence of audio confirmation mirrors the absence of state change.

### The LEARN_MORE Variant

The LEARN_MORE card uses the same dimensions as the RAISE/LOWER card but with a warmer palette. The accent stripe is soft amber (#D4A574) instead of slate blue. The header reads "TIP" instead of "THRESHOLD RECOMMENDATION." The body text is shorter and friendlier: "Cluster flags keep appearing. Try tapping View Agent Audit next time to see why."

The [Show me an example audit] button is amber-filled, matching the accent stripe — visually connecting it to the cluster flag system rather than the meta-diagnostic system. When tapped, the Agent Audit panel slides in with the same 400ms ease-in-out animation used for live audit panels, but with a thin dashed border around the panel (2px, medium gray, dashed) signaling "this is a preview, not a live view." The dashed border is the only visual distinction between the demo audit and a real audit — the content, layout, and interactive elements are identical (except the disabled action buttons at the bottom).

---

## New Aspects Discovered

- **4.69m — Recommendation engine transparency log:** A persistent log showing every recommendation the engine has issued, the player's response, and the resulting threshold change. Accessible from the career analysis settings panel. Lets the player audit the engine's reasoning history: "why is my threshold at 4? Because I accepted a recommendation at Match 215." The log as a record of the player's metacognitive journey.
- **4.69n — Compound recommendation (threshold + pool size):** The engine recommends not just threshold changes but pool size adjustments: "Your 20-agent config generates noise at top-10, threshold-3. Recommend: top-15, threshold-4." A 2D recommendation that adjusts both calibration axes simultaneously. Requires the pool size to be player-configurable (currently implied by 4.69a but not fully designed).
- **4.69o — Peer-calibration comparison:** Show the player how other players with similar config sizes have their thresholds set: "Players with 12-16 agents typically use threshold 3+ or 4+. You're at 3+." Social proof as a recommendation signal, complementing the behavioral evidence.

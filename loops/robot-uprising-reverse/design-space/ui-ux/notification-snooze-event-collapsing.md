# Notification Audit Log — Snooze Event Collapsing in Long Provenance Chains

**Aspect:** 4.69e-i-a-i-f-i — Snooze event collapsing in long provenance chains

**Parent:** 4.69e-i-a-i-f — Audit log ordering policy (most-recent-first vs. chronological)
**Grandparent:** 4.69e-i-a-i — Import timestamp visibility in notification audit log
**Root chain:** 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → ... → 4.69e

**Sibling:** 4.69e-i-a-i-f-v — "Show only significant events" filter in provenance chain (different approach to the same density problem)

**Cross-references:**
- 4.69e-i-a-i-f — Ordering policy (parent, establishes chronological inner chain)
- 4.69e-i-a-i-f-v — Show only significant events filter (sibling alternative)
- 4.69e-i-a-vi-d — Snooze state visibility in Settings
- 4.69e-i-a-i-i — First-encounter entry creation

---

## The Problem: Snooze Density

The provenance chain records every event that affected a notification's state — first encounter, each snooze, suppression, restores, and imports. For a player who engaged thoughtfully with the system, this is a 3–6 event chain and reads cleanly:

```
Jan 5  — First encounter (toast fired)
Jan 8  — Snoozed for session
Jan 14 — Permanently suppressed by player action
```

But a player who repeatedly deferred instead of deciding creates a much longer chain. A real usage pattern:

```
Jan 5  — First encounter (toast fired)
Jan 5  — Snoozed for session
Jan 7  — Snoozed for session
Jan 7  — Snoozed for session
Jan 9  — Snoozed for session
Jan 10 — Snoozed for session
Jan 10 — Snoozed for session
Jan 12 — Snoozed for session
Jan 14 — Snoozed for session
Jan 15 — Snoozed for session
Jan 16 — Snoozed for session
Jan 19 — Snoozed for session
Jan 21 — Snoozed for session
Jan 22 — Snoozed for session
Jan 26 — Snoozed for session
Jan 28 — Snoozed for session
Feb 1  — Snoozed for session
Feb 3  — Snoozed for session
Feb 5  — Snoozed for session
Feb 8  — Snoozed for session
Feb 10 — Snoozed for session
Feb 12 — Permanently suppressed by player action
```

**22 events.** The decisive action (suppress) is buried at the bottom of 20 identical "Snoozed for session" entries. The chronological ordering means the player must scroll past all of them to reach the resolution. The key informational spine of the chain — first encounter → suppress decision — is swamped by behavioral noise.

This is the snooze density problem. The design question: **how should the UI handle provenance chains where snooze events dominate?**

### What information is actually in those 20 snooze entries?

Before designing a collapsing solution, enumerate what a full snooze history tells you that a summary cannot:

1. **Total count** — 20 snoozes before suppressing signals something about the notification's calibration (too aggressive? fired at wrong moment?)
2. **Date range** — Jan 5 to Feb 12 = 38 days of deferral before deciding. This temporal span communicates "the player knew about this notification for over a month before deciding it wasn't for them"
3. **Snooze velocity** — whether the snoozes were clustered (three times in one day) or spread out (every 2–3 days) tells a different story about the player's engagement state
4. **Individual dates** — rarely needed by typical players, but potentially useful for self-reflection: "I was more active in January, the snooze frequency was higher"

Of these, **1 and 2 are high-value and hard to infer without a summary**, **3 is medium-value and requires the full list**, **4 is low-value for most players**.

The collapsing design must preserve 1 and 2 at minimum, make 3 accessible on demand, and not pretend 4 is a primary use case.

---

## The Options

### Option A — Full Disclosure (No Collapsing)

Show every snooze event individually. No summaries, no collapsing, no compression.

**The chain:**
```
• Timeline
Jan 5  — First encounter (toast fired)
Jan 5  — Snoozed for session
Jan 7  — Snoozed for session
Jan 7  — Snoozed for session
[... 17 more snoozed entries ...]
Feb 12 — Permanently suppressed by player action
```

The "[... 17 more]" above is editorial — in this option, those 17 entries ARE rendered, each as a 32px tall event row with full date and label.

**Arguments for:**
- Complete. Nothing is hidden, nothing requires an extra click to understand.
- Doesn't add engineering complexity. Collapsing algorithms require run detection, expand/collapse state, animation, and edge cases.
- Some players will find the visual density itself informative. "This chain is really long" communicates something before the player even reads the dates.
- Avoids any risk of hiding information the player later wants (no "why can't I see the individual snooze from January 9th?").

**Arguments against:**
- At 22 events, the expand animation creates a very long block inside a Settings panel. The panel may require significant scrolling to see other notifications below. The dominant notification in the list visually suppresses all others.
- The suppress event — the most actionable and meaningful event — is at the bottom of a wall of identical rows. The player's eye must travel past all the noise to find the signal.
- The "Snoozed for session" label provides zero distinguishing information. Each of the 20 rows is textually identical except for the date. This is the definition of visual noise: repeated information that adds no new signal per repetition.
- The chain's purpose is forensics: "how did this notification reach its current state?" The suppress event answers that question. The 20 snooze events provide behavioral context. Full disclosure inverts the emphasis — behavioral context gets 91% of the visual real estate, causal resolution gets 9%.

**Verdict:** Correct for short chains (1–4 snooze events). Wrong as the universal approach. A chain of 20 identical rows is an unsolved design problem, not a feature.

---

### Option B — Total Summation (All Snooze Events → Single Summary Row)

Replace all snooze events with a single summary entry that shows the count and date range.

**The chain:**
```
• Timeline
Jan 5  — First encounter (toast fired)
       ─── Snoozed 20 times · Jan 5–Feb 10 ───
Feb 12 — Permanently suppressed by player action
```

The summary row appears in chronological position — after first encounter, before suppress. It does not carry an expand affordance. It's a fixed-form summary.

**Arguments for:**
- Maximum compression. The chain reduces to three rows regardless of how many snoozes occurred. The structure is always: encounter → [snooze summary] → [suppress/restore/current state].
- Preserves the two high-value pieces of information (count and date range).
- The visual spine of the chain — encounter-to-decision — is immediately legible regardless of snooze count.

**Arguments against:**
- The summary row is a dead end. The player cannot access individual snooze dates. If they want to understand snooze velocity (clustered vs. distributed), the data is unavailable.
- "Snoozed 20 times · Jan 5–Feb 10" says nothing about distribution. Was it 20 snoozes in one week? One snooze per day for 20 days? These are very different patterns.
- If the player has a specific question — "did I snooze this before or after the update that changed the notification text?" — they cannot check without the individual dates.
- A player who notices the summary for the first time and wants to understand what happened cannot drill down. The summary is informative but not interactive, which violates the audit log's purpose as a forensics tool.

**Verdict:** Correct information content, wrong interaction model. The summary text is the right design but should not be a dead end. See Option C.

---

### Option C — Automatic Collapsing with Expand Affordance (The GitHub Model)

Replace snooze runs with a summary row that can be expanded to reveal individual entries.

**The chain (collapsed state — default):**
```
• Timeline
Jan 5  — First encounter (toast fired)
         ▶ Snoozed 20 times · Jan 5–Feb 10   [expand]
Feb 12 — Permanently suppressed by player action
```

**The chain (expanded state — after clicking [expand]):**
```
• Timeline
Jan 5  — First encounter (toast fired)
         ▼ Snoozed 20 times · Jan 5–Feb 10   [collapse]
         Jan 5  — Snoozed for session
         Jan 7  — Snoozed for session
         Jan 7  — Snoozed for session
         [... all 20 entries, each 32px tall ...]
         Feb 10 — Snoozed for session
Feb 12 — Permanently suppressed by player action
```

**Arguments for:**
- Preserves all information (full expand available) while providing a clean default view.
- Directly analogous to GitHub's commit list collapsing in PR views, or the Slack "N older messages" separator — a well-established pattern for dense-but-lower-priority content in otherwise linear lists.
- The summary row (collapsed) gives count + date range = the high-value information. The expand gives snooze velocity and individual dates = the medium and low-value information on demand.
- Chronological ordering is fully preserved in both states. Collapsed: encounter → summary → suppress. Expanded: encounter → individual snooze rows → suppress. The temporal spine is intact.

**Arguments against:**
- "Snooze run" detection needs a definition. What counts as a run? If the player snoozed in January, then took a three-month break, then snoozed again in April, are those two separate runs or one collapsed range? (See Edge Cases section.)
- The expand affordance adds an interaction step for players who want the full data. This is a minor friction, but it's a real one.
- If the player has multiple notifications with collapsed snooze runs, the expand state needs to be managed per-notification, per-session — UI state complexity.
- The collapsed summary must be careful not to look like it's hiding something important. Visual design needs to clearly communicate "this is compressed noise, not compressed signal."

**Verdict:** The strongest option. Collect this as the design recommendation. Threshold: collapse only when N ≥ 4 snooze events in a run (1–3 snooze events should show individually; the visual benefit of collapsing a 2-snooze run is near zero while the additional interaction step costs non-zero).

---

### Option D — Bookend Disclosure (Show First N + Last M, Collapse Middle)

Show the first 2 snooze events and the last 1 snooze event individually; collapse everything in between.

**The chain:**
```
• Timeline
Jan 5  — First encounter (toast fired)
Jan 5  — Snoozed for session
Jan 7  — Snoozed for session
         ··· 17 more snooze events · Jan 7–Feb 8 ···  [show all]
Feb 10 — Snoozed for session
Feb 12 — Permanently suppressed by player action
```

**The rationale for bookend design:**
- The **first snooze** is diagnostically meaningful: it establishes when the player first chose to defer rather than decide. Combined with the first-encounter date, it tells you how quickly the player deferred.
- The **last snooze** before suppress is also diagnostically meaningful: it establishes the final moment of deferral — the snooze that was immediately followed by the suppression decision. This is the "I've had enough" moment.
- The **middle snoozes** are bulk deferral with minimal marginal information per entry.

**Arguments for:**
- Preserves the two bookend events that are individually meaningful without requiring an expand for them.
- Reduces visual length more aggressively than Option C (no large collapsed section that snaps open — the bookend approach keeps the chain compact even in its "full" display).
- Specifically emphasizes the causal proximity of the last snooze to the suppress decision — you see "Feb 10: last snooze → Feb 12: suppress" which gives the impression of "one more time, then done."

**Arguments against:**
- Requires deciding what N and M are. "First 2, last 1" is somewhat arbitrary. Why not first 1, last 1? Or first 2, last 2? There's no principled answer without usage data.
- The bookend entries being individually displayed while middle entries are collapsed creates an implicit hierarchy: "these snooze events matter more than the others." That hierarchy is somewhat defensible (first and last are more meaningful) but could confuse players who expect uniform treatment of identical event types.
- The "··· 17 more ···" separator reads as a collapsed section within a visible chain — a more complex visual structure than Option C's clean collapsed state.
- The "show all" affordance in the middle of the chain (rather than at the start of a collapsed section) is a slightly unusual interaction target. Most "show more" affordances appear at the bottom of a list, not in the middle.

**Verdict:** Elegant logic, awkward execution. The bookend insight (first and last snooze are more meaningful than middle snoozes) is worth preserving as a **secondary element within Option C**: when Option C's collapsed summary row is shown, the expand might reveal "first snooze" and "last snooze" as highlighted bookend entries within the full expanded list, visually distinguished from the bulk middle.

---

### Option E — Manual Collapse Affordance (Show All, Player Can Collapse)

Show all snooze events by default. Provide a [collapse snooze events] button at the top of the expanded chain.

**The chain (default state):**
```
• Timeline
Jan 5  — First encounter (toast fired)
Jan 5  — Snoozed for session
Jan 7  — Snoozed for session
         [... all 20 entries ...]
Feb 12 — Permanently suppressed by player action
         [↑ Collapse snooze events]
```

**Arguments for:**
- No information is hidden by default. The player gets the full picture immediately.
- Players who don't want to see snooze details can collapse them, but the default is transparent.
- No run-detection algorithm needed — the collapse is manual, all snooze events or none.

**Arguments against:**
- "Default is verbose" means the first experience of opening a chain with 20 snooze events is a wall of entries. The first impression of the audit log — already an intimidating forensics panel — becomes worse for habitual snoozers.
- The player hasn't asked for the full history; the expand event indicates curiosity about the chain, not specifically about snooze history. Giving full history by default is over-serving the medium-value information at the expense of the high-value decision events.
- The [collapse] affordance at the bottom of a long list is a small target at the end of a scroll. In contrast, the collapsed-by-default approach puts the expand affordance at eye level in the main chain view.

**Verdict:** Wrong default direction. The audit log's primary use case is debugging current state ("why isn't my toast showing?"), not historical archaeology ("what was my exact snooze behavior in January?"). The default should surface the diagnostic path, not the full behavioral log.

---

## Recommendation: Option C with Bookend Enhancement

**Collapsed by default when N ≥ 4 consecutive snooze events (within a 30-day gap threshold).** The summary row:

```
▶ Snoozed 20 times · Jan 5–Feb 10   [expand]
```

**On expand:**

Individual snooze events render in chronological order. The first and last entries receive subtle visual emphasis (the dot on the timeline connector is slightly larger, 8px vs. 6px, and the date is rendered at 100% opacity instead of #999 opacity). This gives the bookend logic — "first deferral, last deferral" — as a visual hint within the full list without creating an awkward separate design structure.

**Threshold logic:**
- 1–3 snooze events: show individually, no collapsing
- 4+ snooze events within a 30-day gap: collapse into summary row
- Snooze events spanning a gap > 30 days: split into multiple summary rows (see Edge Cases)

---

## Edge Cases

### The Gap Problem: What Counts as a "Run"?

Consider:
- Snooze on Jan 5
- Snooze on Jan 7
- *(player doesn't open the game for 8 weeks)*
- Snooze on Mar 3
- Snooze on Mar 5
- Suppress on Mar 10

Should this collapse into one run ("Snoozed 4 times · Jan 5–Mar 5") or two runs ("Snoozed 2 times · Jan 5–Jan 7" and "Snoozed 2 times · Mar 3–Mar 5")?

**The argument for one run:** The single collapsed row preserves count and total date range. Splitting into two rows (each with only 2 entries) would show them individually anyway (since N < 4), negating the collapsing benefit.

**The argument for two runs:** An 8-week gap between snoozes is behaviorally meaningful — the player stopped playing, returned, and encountered the toast again fresh. Treating the January and March snoozes as the same "run" erases this context. The player who sees "Jan 5–Mar 5" might think they were actively using the game throughout that period.

**Recommendation:** Apply a **gap threshold of 30 days**. If consecutive snooze events span a gap > 30 days, they represent separate engagement periods and should form separate run segments. Each segment is collapsed independently if it meets the N ≥ 4 threshold; segments with < 4 events show individually.

The chain then reads:
```
• Timeline
Jan 5  — First encounter (toast fired)
Jan 5  — Snoozed for session
Jan 7  — Snoozed for session
         ┆ [8-week gap — player inactive]
Mar 3  — Snoozed for session
Mar 5  — Snoozed for session
Mar 10 — Permanently suppressed by player action
```

Because neither run hits N ≥ 4, neither collapses. The gap is represented by the temporal jump visible in the date column (Jan → Mar), not an explicit gap indicator. The player can infer the gap from the dates alone.

But if the runs DO hit the threshold:
```
• Timeline
Jan 5  — First encounter (toast fired)
         ▶ Snoozed 12 times · Jan 5–Jan 28  [expand]
         ┆ [gap]
         ▶ Snoozed 8 times · Mar 3–Mar 22   [expand]
Mar 25 — Permanently suppressed by player action
```

The gap indicator ("┆ [gap]") is optional and mildly controversial — it adds a UI element purely to communicate absence of activity. An alternative: just let the date gap speak for itself (players who notice "Jan → Mar" understand a break occurred). The gap indicator is only useful if the game explicitly shows "you were inactive from Jan 29 to Mar 2," which requires calendar tracking — potentially more complexity than warranted. **Default recommendation: no explicit gap indicator; dates alone communicate the gap.**

### The Imported Suppress with No Native Snoozes

Consider: player imports a profile where the notification was suppressed by the original user after 15 snoozes. The provenance chain shows the suppression was imported. But the 15 snooze events from the original profile — do they exist in the chain?

This depends on whether audit log data travels in profile exports (aspect 4.69e-i-a-i-h). If audit log travels: the 15 snooze entries exist in the imported chain and the collapsing algorithm applies normally. If audit log does NOT travel: the chain shows only the suppress event with an import badge, and there are zero snooze entries. No collapsing needed or possible.

This is a clean case — the collapse algorithm only fires when snooze events are actually present. If there are none (import carried only state, not history), the chain is already short.

### The Single Snooze Type vs. Multiple Snooze Types

The current design uses one snooze type: "Snoozed for session." If the game later implements multiple snooze durations ("Snooze for session / Snooze for 3 days / Snooze for a week"), should mixed snooze types collapse together or separately?

**Pragmatic answer for this analysis:** Mixed-type snooze events that are consecutive still collapse together. The summary row shows the type breakdown: "Snoozed 20 times (12 session · 8 3-day) · Jan 5–Feb 10." This adds text density to the summary but preserves the type information. Alternative: the expand is always required to see type breakdown (summary shows count and range only). Decision deferred to when multiple snooze types ship.

### The Chain After Restore

If a player: encounters → snoozes 20 times → suppresses → restores → snoozes 5 times → suppresses again, the chain has two snooze runs separated by a non-snooze event (the restore).

```
• Timeline
Jan 5  — First encounter
         ▶ Snoozed 20 times · Jan 5–Feb 10   [expand]
Feb 12 — Permanently suppressed by player action
Feb 15 — Restored to default by player action
         ▶ Snoozed 5 times · Feb 16–Mar 1    [expand]
Mar 2  — Permanently suppressed by player action
```

The non-snooze event (restore) acts as a natural run separator. Each run collapses independently. This is clean — the two suppression decisions read as distinct chapters of the chain.

---

## Player Journeys

#### Journey: Theo, 28, Habitual Procrastinator — Confronting His Own Snooze History

**Context:** Theo has been playing Robot Uprising for three months. He's in the middle of a competitive season, and during his early campaign he encountered the sample-size reliability toast constantly. Each time, he clicked "Snooze" — he never had time to read the warning, and he intended to deal with it "later." Two weeks ago he finally suppressed it permanently just to stop seeing it. Now he's opening Settings to check something unrelated and notices his notification history.

**Minute 0:00 — Noticing the Notification Panel**
Theo opens Settings → Notifications for an unrelated reason (he's looking for the unreviewed-flag reminder toggle). The outer notification list loads. The top entry is "Sample size reliability warning" with a grey suppressed dot and "Feb 12, 2026."

He hovers over the row on his way to scrolling down. It expands automatically (he didn't mean to expand it, but cursor-hover on the row triggers preview).

**Minute 0:15 — The Collapsed Summary Appears**
The expanded chain shows:

```
• Timeline
Jan 5  — First encounter (toast fired)
         ▶ Snoozed 20 times · Jan 5–Feb 10   [expand]
Feb 12 — Permanently suppressed by player action
```

Theo reads it in 1.5 seconds. "I snoozed it 20 times." He laughs, alone at his desk.

The collapsed summary is three rows: encounter, summary, suppress. The shape of the chain — encounter almost immediately followed by summary then suppress — gives him an accurate picture in a glance: "I never engaged with this notification, I just kept clicking snooze until I got tired of it."

He doesn't click expand. He doesn't need to. He knows his own snooze behavior.

**Minute 0:30 — Moving On**
He scrolls past the sample-size warning to find the unreviewed-flag reminder. The notification audit log has done its job: it showed him the state (suppressed), gave him the behavioral context (20 snoozes = I wasn't reading this, I was avoiding it), and let him continue without interruption.

**What collapsing did for Theo:**
The collapsed summary gave him the information in one line. He didn't have to scroll through 20 "Snoozed for session" entries to reach the final suppress event. The summary's numerical weight ("20 times") created a moment of self-reflection that the full list would have blunted — 20 individual rows feel administrative; "20 times" as a single number feels like a verdict.

**UI Annotations:**
- Hover-expand preview: the chain shows with reduced height (max 120px, overflow hidden) on hover; clicking the row fully expands; this gives the "gist" of the chain on hover without full expansion commitment
- Collapsed summary row: amber ▶ triangle icon on the left edge of the timeline connector; the text "Snoozed 20 times" in 13px standard body weight; " · Jan 5–Feb 10" in 12px #888 secondary text; "[expand]" in 11px amber-tinted text, right-aligned, interactive; the entire summary row is 40px tall, 8px taller than regular event rows (signaling it represents multiple entries)
- The ▶ icon: 8px equilateral triangle, amber #f5a623, pointing right; rotates 90° clockwise to ▼ on expand; 150ms transition

---

#### Journey: Vera, 34, Data Analyst — Expanding the Collapse to Understand Snooze Velocity

**Context:** Vera is a data scientist by profession and applies her analytical instincts to Robot Uprising. She tracks her own behavior carefully. She has the notification audit log open because she's investigating a specific question: "Was my snooze frequency higher during the two weeks I was struggling with the SECTOR-7 campaign?" She remembers she was frustrated during that period and suspects she was dismissing more notifications than usual.

**Minute 0:00 — Opening the Audit Log**
Vera navigates to Settings → Notifications and expands the "Sample size reliability warning" row. The default collapsed view appears:

```
• Timeline
Jan 5  — First encounter (toast fired)
         ▶ Snoozed 22 times · Jan 5–Feb 15   [expand]
Feb 18 — Permanently suppressed by player action
```

She notes the date range: Jan 5 to Feb 15. SECTOR-7 was mid-January. That's within the range. She clicks [expand].

**Minute 0:30 — Reading the Full Snooze List**
The collapse animates open with the 30ms staggered fade-in. 22 entries appear, oldest at top. Vera reads down the date column:

```
         Jan 5  — Snoozed for session
         Jan 5  — Snoozed for session  ← [slightly larger dot, first snooze]
         Jan 7  — Snoozed for session
         Jan 8  — Snoozed for session
         Jan 9  — Snoozed for session
         Jan 9  — Snoozed for session
         Jan 12 — Snoozed for session
         Jan 14 — Snoozed for session
         Jan 15 — Snoozed for session
         Jan 16 — Snoozed for session  ← [cluster: 9 in Jan 8–16 range]
         Jan 19 — Snoozed for session
         Jan 21 — Snoozed for session
         Jan 22 — Snoozed for session
         Jan 25 — Snoozed for session
         Jan 28 — Snoozed for session
         Jan 29 — Snoozed for session
         Jan 30 — Snoozed for session
         Feb 1  — Snoozed for session
         Feb 3  — Snoozed for session
         Feb 6  — Snoozed for session
         Feb 12 — Snoozed for session
         Feb 15 — Snoozed for session  ← [slightly larger dot, last snooze]
```

Vera's eye catches the density in January 8–16 (4 entries in 8 days, roughly every other day). Then a sparser Jan 19–Feb 3. Then the final cluster Feb 12–15 (three close together before the suppress).

*"Yes. Jan 8–16 was SECTOR-7. I was firing more analyses, getting the warning more frequently, and just clicking snooze."*

She has her answer. The expand gave her the snooze velocity data she needed. Without it, the collapsed "22 times · Jan 5–Feb 15" would have been too coarse.

**Minute 1:30 — Noting the Bookend Emphasis**
Vera notices the slightly enlarged dots on Jan 5 (first snooze) and Feb 15 (last snooze before suppress). She reads them as a visual "bookend" signal: these are the inflection points. She hovers over the Jan 5 first-snooze dot — a tooltip appears: "First snooze (5 days after first encounter)." She hovers over the Feb 15 dot: "Last snooze (3 days before suppress)."

The tooltip text lets her extract the most analytical information from the bookend events without doing the date math herself.

**Minute 2:00 — Collapsing Again**
She's satisfied. She clicks [collapse]. The 22-entry list animates closed (200ms reverse stagger, fading from bottom to top — a clean undo of the open animation). The summary row reappears.

**UI Annotations:**
- Bookend dots: first and last snooze events in the expanded list use 8px dots vs. standard 6px; their dates render at 100% #ddd opacity vs. standard #999 opacity; tooltip on hover shows computed contextual text ("first snooze N days after first encounter," "last snooze N days before suppress")
- The date arithmetic in tooltips: computed from stored event timestamps; displayed in human-readable form ("5 days after," "3 days before," "same day as"); date math uses actual calendar days, not game ticks
- Expand stagger direction: top-to-bottom, 30ms per entry; on collapse, the reverse: bottom-to-top fade, 20ms per entry (slightly faster than open, feels snappy rather than slow reversal)
- The collapsed summary row height: 40px; after expand, it becomes a 36px header row above the individual entries rather than disappearing; it shows "▼ Snoozed 22 times · Jan 5–Feb 15 [collapse]" — the summary text remains visible while the individual entries are expanded beneath it, so the player can reference the total count while scrolling through individual dates

---

#### Journey: Nadia, 23, New Player — First Time Seeing a Collapsed Chain, Building the Mental Model

**Context:** Nadia is 2 weeks into Robot Uprising. She's just completed Act 1 of the campaign. She's been getting the sample-size warning toast repeatedly and has been snoozed it every time because she found the warning text intimidating. A friend told her about the notification settings panel. She opens it for the first time.

**Minute 0:00 — First Impression of the Notification Panel**
Nadia has never opened Settings → Notifications. She navigates there cautiously.

She sees four notification entries, the top one with a grey dot. "Sample size reliability warning — Permanently suppressed." She doesn't remember suppressing it. She must have clicked "Don't show again" at some point.

She clicks the row to see what happened.

**Minute 0:15 — The Collapsed Chain**
The row expands. She sees:

```
• Timeline
Nov 2  — First encounter (toast fired)
         ▶ Snoozed 7 times · Nov 2–Nov 14   [expand]
Nov 14 — Permanently suppressed by player action
```

She reads: "First encounter November second. Snoozed seven times, November second through fourteenth. Permanently suppressed November fourteenth."

The structure makes immediate sense. She recognizes Nov 14 — that was the day she was frustrated and clicked "Don't show again." And Nov 2 was when she first got the warning.

She hadn't realized she snoozed it 7 times in between. That's over two weeks.

**Minute 0:30 — Curiosity About the Collapsed Section**
She notices the ▶ triangle and the "[expand]" text. She's curious what the 7 times looked like. She clicks it.

Seven entries fade in, oldest at top:
```
Nov 2  — Snoozed for session
Nov 4  — Snoozed for session
Nov 5  — Snoozed for session
Nov 7  — Snoozed for session
Nov 9  — Snoozed for session
Nov 12 — Snoozed for session
Nov 13 — Snoozed for session
```

She counts them: seven. The dates map to her play sessions. She didn't know she could trace her own gaming history this precisely.

**Minute 0:45 — Understanding the Notification State**
She sees a [Restore to default] button on the "Permanently suppressed" row. She clicks it — she wants to see what the sample-size warning actually says, now that she's less intimidated.

The chain gains a new bottom entry:
```
Nov 20 — Restored to default by player action
```

The grey dot in the outer list transitions to amber. She closes the drawer and returns to gameplay. The next time she runs a filtered analysis with N=9, the amber toast fires. She reads it. It makes sense now. She doesn't snooze it — she processes it and closes it naturally.

**What the collapse design did for Nadia:**
The collapsed summary was exactly the right first impression: "here's the summary of what happened." For a first-time visitor to the audit log, the collapsed view communicates the arc without overwhelming. The [expand] affordance communicated that more information was available without forcing her to scroll through it to reach the decision event. The expand satisfied her curiosity without being mandatory. The [Restore to default] action was visible in the collapsed view — she didn't need to expand to act.

**UI Annotations:**
- Collapsed view shows the primary action buttons (Restore to default, Reset to active) even when snooze events are collapsed; the action buttons belong to the outer notification row, not to the snooze events, so they remain visible regardless of expand state
- [expand] text: 11px, amber-tinted (#f5a623 at 80% opacity), cursor: pointer; becomes 100% opacity on hover; no underline (consistent with other secondary-action text in the panel); hit area includes the full summary row (not just the [expand] text), since clicking anywhere on the summary row should expand it
- Post-restore animation: the new event entry at the bottom of the chain fades in from bottom (not top — this reversal is intentional: the restore event is "arriving" at the present moment, which is the chain's bottom); 300ms fade-in, no stagger needed since it's a single entry

---

## Strengths and Weaknesses

| Option | Strengths | Weaknesses | Best For |
|--------|-----------|------------|----------|
| **A — Full disclosure** | Complete; no hidden information; visual density itself communicates | Buries suppress event under noise; 20 identical rows; usability failure at scale | Chains with ≤ 3 snooze events |
| **B — Total summation (fixed)** | Maximum compression; preserves count + range; always clean | Dead end; no drill-down; hides velocity data; can't answer "which specific snooze?" | A useful *display format* for the summary row, but wrong as a non-expandable structure |
| **C — Auto-collapse with expand (recommended)** | Clean default; full data on demand; established pattern; preserves chronological order through both states | Run-detection algorithm needed; expand state management; must not look like it hides signal | Default for N ≥ 4 snooze events |
| **D — Bookend disclosure** | Preserves most meaningful snoozes (first + last); elegant logic | Arbitrary bookend count; visual inconsistency between shown/hidden events; awkward middle-of-chain expand | Bookend as a *secondary enhancement* within Option C's expand |
| **E — Manual collapse** | No hidden information by default; player has full control | Wrong default direction; verbose first impression; expand target at bottom of long list | Probably never — Option C with expand already provides the same capability |

---

## Interaction Effects

**4.69e-i-a-i-f-v — "Show only significant events" filter:**
This sibling aspect proposes a toggle hiding snooze events entirely (show only: encounter, suppress, restore, import). The two approaches are complementary rather than competing:
- **Collapsing (this aspect)** is the default behavior for any chain with many snooze events. It keeps snooze events accessible but de-emphasized.
- **Significant-events filter** is a user-activated toggle that removes snooze events from view entirely.
The design should implement collapsing as the default and the filter as an additional option. A player who doesn't want to see snooze events at all can filter them; a player who wants the summary but has the option to drill down gets collapsing.

**4.69e-i-a-i-f — Ordering policy:**
Collapsing preserves chronological ordering within both collapsed and expanded states. The summary row appears in chronological position (between encounter and suppress). Expanded entries are oldest-at-top. No conflict with the MRF outer list / chrono inner chain model.

**4.69e-i-a-vi-d — Snooze state visibility in Settings:**
The parent aspect mentions: "If a player has snoozed the toast twelve times before suppressing it, the chain has twelve snooze entries... a 'collapse snooze events' option (show first snooze, '... and N more snooze events', last snooze before suppress)." This aspect formalizes and extends that aside into a full design.

**4.69e-i-a-i — Import timestamp visibility:**
If a player's suppress was imported from a profile where they had snoozed 30 times, and if audit log data travels with the export (aspect 4.69e-i-a-i-h), the imported chain may have 30 snooze entries. The collapse algorithm applies equally to native and imported chains. The import badge on the summary row: "▶ Snoozed 30 times · Sep 1–Oct 30  [↑ imported]  [expand]" — the import badge applies to the summary row if all snooze events are from the imported profile.

**4.69e-i-a-i-i — First-encounter entry creation:**
If first-encounter entries are included (they should be, per the parent analysis's recommendation), the collapsing structure is: **encounter → [collapsed snooze run] → suppress**. If first-encounter entries are excluded, the structure becomes: **[collapsed snooze run] → suppress** — which loses the temporal anchor of "when did they first see this notification?" The first-encounter entry is load-bearing for the collapsed summary's readability: without it, "Snoozed 20 times · Jan 5–Feb 10" has no context for when the player first saw the toast (was Jan 5 the first encounter, or had they been seeing it since December?).

**4.69e-i-a-vi-a-iv — Notification audit log (not yet analyzed):**
This analysis specifies the collapse algorithm and its data requirements (count per run, date range of each run, individual event dates). The audit log data model must store individual snooze events (not just a count) to support the expand function. If the model only stores a count, Option B (fixed summary) becomes the only option because the expand has nothing to expand to.

---

## Comparable Games / Media

**GitHub Pull Request Commit Lists — The Canonical Collapse Pattern:**
GitHub collapses long commit lists in PR views when a branch has many commits ("42 commits from main are included in this PR"). The collapsed summary shows the count and the date range of the commits. Clicking "Show all commits" expands the full list. This is Option C's direct precedent. The pattern has been in use since at least 2015 and is intuitive to any developer who uses GitHub. The visual language (a summary row with an expand affordance) is directly transplantable to the notification audit log.

**Slack "N older messages" separator:**
When Slack collapses a thread to show only recent messages, a "42 older messages" separator appears at the top of the visible messages. Clicking it loads earlier messages in place. The separator is in chronological position (at the top of the visible content, representing content that precedes it in time). The notification audit log's collapsed run is analogous: the summary row is in chronological position (between encounter and suppress), represents events that occurred in that position, and expands in place.

**iOS Screen Time / Health App — Activity Summary Collapsing:**
iOS's Screen Time shows daily usage, with weekly rollup. Individual app-level data is collapsed under category summaries that can be tapped to expand. The health app similarly collapses dense daily data into weekly trends, with tap-to-expand for per-day detail. The analogy: the notification chain's "20 snoozes" is like a week's worth of screen time — the summary is useful; the per-day is available but only needed for specific investigation.

**Terminal Log Collapsing (iTerm2, VSCode Terminal):**
Some terminal emulators allow collapsing repeated log lines ("last message repeated N times"). This is directly analogous to the snooze event problem: 20 identical "Snoozed for session" entries are structurally identical to a log emitting the same message repeatedly. The terminal solution — "last message repeated 19 times" — is Option B (fixed summary) applied to log lines. It's useful but not expandable. The notification audit log improves on this by adding the expand affordance.

**Zachtronics Solution Histograms:**
Opus Magnum's solution histogram shows a distribution of player solutions across cost/cycles/area. The histogram collapses many individual solutions into a visualization that preserves distribution shape. This is the mental model underlying snooze velocity visualization (described as a future enhancement in the New Aspects section below): instead of showing individual snooze dates, show a histogram of snooze density over time. Not directly applicable to the collapsed summary row design, but a possible enhancement.

---

## Sensory Description

**The collapsed summary row:**

The summary row is 40px tall — 8px taller than a standard event row (32px). The extra height is subtle but communicable: this row holds more than a single event. The timeline connector continues through it, unbroken, but the dot position is slightly different — instead of a single 6px dot at the event point, there's a **vertical cluster of three overlapping dots** (each 4px, spaced 3px apart) at the left edge of the row, representing "multiple events here." The cluster doesn't look like a single dot; it looks like several events compressed into one position.

The amber ▶ icon sits to the left of the cluster dots — not on the timeline, but in the 8px gutter to the left of it. It's small, directional, and amber: "there is more here, and it's worth looking at." The ▶ pulsed once on first expansion (a very brief, 300ms gentle pulse from 100% opacity → 70% → 100%) to draw attention to the affordance. After the first expansion, the pulse doesn't recur.

The summary text: "Snoozed **20 times** · Jan 5–Feb 10" — the count ("20 times") is in slightly heavier weight than the date range (" · Jan 5–Feb 10"), which is in #888 secondary text. This hierarchy says: the count is the headline; the date range is the context. "[expand]" sits right-aligned in the row, in 11px amber-tinted text, cursor:pointer.

**The expansion animation:**

Clicking anywhere on the summary row (not just [expand]) triggers the expansion. The summary row becomes a **32px header** labeled "▼ Snoozed 20 times · Jan 5–Feb 10 [collapse]" — it remains visible as a header above the now-expanded entries. Below it, the 20 individual event rows fade in at 15ms per entry stagger (half the 30ms stagger of a regular chain expansion — because 20 entries at 30ms would take 600ms, which is too slow; 15ms per entry = 300ms total for the snooze run). The audio: a quiet, rapid sequence of very soft ticks — the sound of a card fan being laid down, dense and quick, conveying "many small events in sequence."

**The collapsed state after expand-then-collapse:**

After the player collapses a previously-expanded run, the summary row returns to its ▶ state. But the dots in the cluster are now slightly brighter than on first render — a persistent visual cue that this run has been examined. Not dramatic. Barely perceptible. But it answers the implicit question "have I already looked at this?" without requiring a label.

**The audio texture of "long snooze chain" vs. "short snooze chain":**

For a 3-event chain (no collapse), the expansion plays the standard 3-entry stagger with light, spaced clicks. For a 20-event collapsed run, the collapsed summary's expand plays the rapid dense tick fan. The audio alone communicates volume: "this was a lot of snoozes." Players who have audio on will hear the density before they read the numbers.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α — Temporal gap threshold as a configurable player setting:** The 30-day gap threshold that splits a snooze run into two separate runs is chosen for defensibility but not uniquely correct. A player who takes 45-day breaks between campaign sessions would find their snooze history fragmented into many runs where one would serve. Should the threshold be configurable (in Settings → Notifications → Advanced)? Or should it be derived from the player's own session history (e.g., "auto-detect breaks based on your session frequency")?

- **4.69e-i-a-i-f-i-β — Snooze velocity sparkline as summary row enhancement:** Within the collapsed summary row ("Snoozed 20 times · Jan 5–Feb 10"), embed a miniature sparkline showing snooze density over time — a row of N pixels, each proportional to the number of snoozes in a 7-day window. This encodes velocity information in a single line without requiring expand. High-resolution information in compact form, at the cost of adding a visualization component to what is currently a text-only panel.

- **4.69e-i-a-i-f-i-γ — Snooze:suppress ratio as notification health signal for game designers (analytics):** Aggregate snooze counts across all players before suppress (with consent). A notification where the median player suppresses after 1 snooze (the notification text was informative on first read) is calibrated differently than one where the median is 15 snoozes (players defer repeatedly before deciding it's not useful). This metric, available only to game developers, provides feedback on whether toast notifications are providing the right amount of value at the right frequency. Not a player-facing feature, but the data captured by the collapsing model makes it computable.

- **4.69e-i-a-i-f-i-δ — "Collapse snooze events in all notifications" global setting:** A Settings-level toggle ("Collapse repeated snooze events in notification history: Always / When 4+ / Never") that overrides the per-notification default threshold. Players who always want verbose history choose "Never"; players who always want maximum compression choose "Always"; the default is "When 4+." Interaction with Option E (manual collapse per notification): the global setting is a coarser version of per-notification control.

- **4.69e-i-a-i-f-i-ε — Snooze event collapsing in the full audit log export artifact (4.69e-i-a-i-h):** If audit log data travels in profile exports, should the exported data contain the full snooze event list or the collapsed summary? Exporting the full list preserves data for future debug use; exporting only the summary loses individual dates but reduces file size. The export format decision and the in-app display decision are independent: you can collapse in the UI while exporting the full data, collapse in both, or show full in both. Recommendation: export full (lossless), display collapsed (lossy for typical use, expandable for advanced use).


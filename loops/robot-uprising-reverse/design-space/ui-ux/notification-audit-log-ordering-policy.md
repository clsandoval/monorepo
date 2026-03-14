# Notification Audit Log — Ordering Policy

**Aspect:** 4.69e-i-a-i-f — Audit log ordering policy (most-recent-first vs. chronological)

**Parent:** 4.69e-i-a-i — Import timestamp visibility in notification audit log
**Grandparent:** 4.69e-i-a-vi-a-i — Notification state in profile export
**Root chain:** 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e-i-a-vi → 4.69e-i-a → 4.69e-i → 4.69e

**Siblings:** 4.69e-i-a-i-g (bulk provenance reset), 4.69e-i-a-i-h (audit log as export artifact), 4.69e-i-a-i-i (first-encounter entry creation), 4.69e-i-a-i-j (audit log privacy)

**Cross-references:**
- 4.69e-i-a-vi-a-iv — Notification audit log (the log itself — not yet analyzed)
- 4.69e-i-a-vi-a-i — Notification state in profile export (grandparent — analyzed)
- 4.69e-i-a-vi-d — Snooze state visibility in Settings

---

## The Problem

The notification audit log as established in 4.69e-i-a-i has **two distinct levels of structure**:

**Level 1 — The outer notification list:** All notification types listed in Settings → Notifications, each showing its current state (active / snoozed / suppressed) and a summary of recent activity. This list answers: "What's the current state of each notification, and when did I last interact with it?"

**Level 2 — The per-notification provenance chain:** When the player expands a notification entry, they see a sequential log of every event that affected that notification — first encounter, snoozes, suppress, restores, imports. This chain answers: "How did this notification reach its current state? Who did what, when, and from where?"

The parent analysis (4.69e-i-a-i) made an **implicit design choice** about ordering: it described the outer list with the most-recent event "at the top" (MRF) while drawing the provenance chain with the oldest event at the top reading downward in time — chronological. The parent's illustrative rendering was:

```
▾ Import history
  Jan 10, 2026 — Suppressed permanently (original device)
  Feb 3, 2026  — Restored via import: priya_jan15.rurobot
```

This reads: oldest at top, newest at bottom — a timeline running downward through time.

The implicit hybrid is: **MRF outer list, Chronological inner chain**.

**The design question this aspect addresses:** Is this hybrid correct? Does it create cognitive friction? Should both levels use the same ordering? And if the hybrid is right, how does the visual design make the ordering switch feel natural rather than jarring?

---

## Why Ordering Matters More Than It Seems

In a list of notifications, the player is doing **scanning** behavior: looking for something specific, moving quickly, comparing states across rows. Most-recent-first is the natural partner for scanning: "what changed most recently?" surfaces at the top.

In a provenance chain, the player is doing **narrative comprehension** behavior: trying to understand a causal sequence. "A caused B, which caused C, which led to the current state D." Cause-and-effect is temporal — it reads forward in time. Showing the chain in reverse (most-recent first) means the player reads *effects before causes*, which is backwards for comprehension.

This is not a subtle preference. It's the difference between reading a story forwards ("Once upon a time... [events]... and that's why the toast is suppressed") and backwards ("The toast is suppressed because of an import... which happened because of a suppress... which was a decision made earlier..."). The backwards version requires the reader to hold every step in working memory until they reach the end, then mentally reverse the chain. The forwards version builds understanding incrementally.

**The cognitive load principle:** Chronological narrative minimizes the player's need to mentally reverse the event chain. For a debugging use case — which is the primary reason a player opens the audit log — cognitive load reduction is paramount.

---

## The Options

### Option 1 — MRF Everywhere (Outer List and Provenance Chain)

**The outer list:**
```
Sample size reliability warning     ● Permanently suppressed  · Jan 10, 2026
Coverage score staleness           ● Permanently suppressed  · Nov 4, 2025
Unreviewed flag reminder           ○ Active · last seen 3 matches ago
```
Most-recently-interacted notification at the top.

**The expanded provenance chain (MRF):**
```
▾ Import history
  Feb 3, 2026  — Restored via import: priya_jan15.rurobot
  Jan 10, 2026 — Permanently suppressed by player action
  Jan 7, 2026  — Snoozed for session
  Jan 5, 2026  — First encounter (toast fired)
```
Most recent event at the top. Reading downward takes you back in time.

**The argument for this option:**
- **Consistency** — the player doesn't have to change mental model between levels. "Newest at top" is the rule everywhere.
- **"What happened most recently?" is the debugging entry point** — when a player asks "why isn't this toast showing?", the first thing they want is: "the most recent event that changed its state." That event is at the top in MRF. They find the answer immediately.
- **Modern convention** — most notification logs, activity feeds, and history panels are MRF. Terminal logs are MRF (newest at bottom in some terminals, newest at top in others — but "show new" is the primary behavior). Slack is chrono-at-bottom, but the mental model is "scroll up to go back in time" — functionally MRF navigation.

**The argument against:**
- **Cause-before-effect is how humans understand sequences.** "First I encountered the toast, then I snoozed it, then I suppressed it" is the natural explanation. Reading MRF, the player reads the suppress before the snooze before the encounter — they understand the output before the input.
- **For the import provenance chain specifically**, reading MRF presents the import event before the original suppression event. The import *caused* the state to transfer; the original suppression *preceded* the import. "The transfer happened, and the reason for it was [scroll down] the original suppress" is a comprehension tax.
- **Multi-hop chains become backward detective work.** "Nov 8 import → Oct 5 import → Sep 1 original suppress" read MRF says: "This state arrived Nov 8. Before that it arrived Oct 5. Before that it was set Sep 1." The player mentally reverses: "So Sep 1 was the beginning, then Oct 5, then Nov 8." This reversal is unnecessary work.

---

### Option 2 — Chronological Everywhere (Outer List and Provenance Chain)

**The outer list (chrono — oldest interaction first):**
```
Unreviewed flag reminder           ○ Active · never triggered
Coverage score staleness           ● Permanently suppressed  · Nov 4, 2025
Sample size reliability warning     ● Permanently suppressed  · Jan 10, 2026
```
The notification the player has interacted with most recently sits at the *bottom*.

**The expanded provenance chain (chrono):**
```
▾ Import history
  Jan 5, 2026  — First encounter (toast fired)
  Jan 7, 2026  — Snoozed for session
  Jan 10, 2026 — Permanently suppressed by player action
  Feb 3, 2026  — Restored via import: priya_jan15.rurobot
```
Oldest at top, newest at bottom.

**The argument for this option:**
- **Consistent narrative direction** — the outer list and the inner chain both read "older at top, newer at bottom." Once the player internalizes "time flows downward in this panel," it applies everywhere.
- **Natural for investigation** — debugging reads: "let me understand how this happened from the beginning." The beginning is at the top.
- **Matches timeline visualizations** — Gantt charts, project timelines, version history in IDEs all typically run oldest-at-top (or oldest-at-left). The notification chain is a mini-timeline, and it should look like one.

**The argument against:**
- **The outer list in chrono is wrong for scanning.** When a player opens Settings → Notifications to check what changed recently, they don't want to scroll to the bottom to find the most-recently-interacted notification. MRF is the right model for list scanning.
- **Conventions battle.** News feeds, email inboxes, activity logs, Discord messages — everything digital that is a list of things-that-happened uses MRF or presents navigation that is effectively MRF (infinite scroll that loads newest first). The player's muscle memory says "newest at top." Violating this for the outer list creates friction every time the panel opens.
- **The distinction between list and timeline is precisely about scanning vs. reading.** These are different information needs. Forcing the same ordering on both treats them as the same kind of object when they're not.

---

### Option 3 — MRF Outer List, Chronological Provenance Chain (The Thread Model)

**The outer list:**
```
Sample size reliability warning     ● Permanently suppressed  · Jan 10, 2026  [↑ imported]
Coverage score staleness           ● Permanently suppressed  · Nov 4, 2025
Unreviewed flag reminder           ○ Active · last seen 3 matches ago
```
Most-recently-interacted notification at top.

**The expanded provenance chain (chrono):**
```
▾ Import history
  Jan 5, 2026  — First encounter (toast fired)
  Jan 7, 2026  — Snoozed for session
  Jan 10, 2026 — Permanently suppressed by player action
  Feb 3, 2026  — Restored via import: priya_jan15.rurobot
```
Oldest at top, newest at bottom.

**The argument for this option:**
This is the **email inbox / email thread** model. In every major email client (Gmail, Outlook, Apple Mail):
- The inbox (outer list) is MRF — newest email at top
- The thread (inner chain) is chronological — oldest message at top, newest at bottom

Nobody finds this confusing. The mental model separation is: **"I'm scanning the inbox"** vs. **"I'm reading this conversation."** Scanning and reading require different orderings. The visual cue that you've transitioned from scanning to reading is the expansion — the animation of opening a thread (or the drawer expansion in Robot Uprising's case) signals a context switch, not just a depth change.

**Why this is the right model for Robot Uprising:**
1. **The outer list is navigational** — the player is looking for the notification they care about. MRF surfaces the most-recently-active notification, which is usually the one they're investigating.
2. **The inner chain is explanatory** — the player is reading a causal sequence. Chronological tells the story in the direction human cognition processes cause-and-effect.
3. **The expansion event signals the mode switch.** The 200ms drawer-open animation creates a perceptual break. The player's attention shifts from "scanning" to "reading." The ordering change accompanies this shift naturally — it doesn't fight the transition, it affirms it.
4. **This is what users have already learned.** Email has trained a billion people that outer-list-MRF / inner-thread-chrono is the default structure for "lists of things that each contain a sequence of events." The audit log is structurally identical.

**The cognitive friction concern in the original aspect description:** The concern is that "mixed-order UIs create cognitive friction." This concern applies when the ordering change is within the **same visual scope and the same scanning behavior** — when you're simultaneously navigating two levels and the two levels use different orderings without a clear visual boundary. But that's not this design. The outer list and inner chain are visually, perceptually, and functionally distinct. The expansion creates a clear boundary. The friction concern is neutralized by design separation.

**Verdict:** This is the correct approach. MRF outer list for scanning; chronological inner chain for reading. The email inbox/thread model.

---

### Option 4 — Player-Configurable Ordering (Per-Level Toggle)

**What it adds:** A sort icon (↕) at the top of the outer notification list, toggleable between MRF and chronological. Within a provenance chain expansion, a second sort icon toggleable between chrono and MRF.

**The argument for:**
- Power users can optimize to their workflow
- Users who have internalized one ordering everywhere won't be surprised
- Explicitly acknowledges that reasonable people disagree

**The argument against:**
- This is a settings knob for a preference with a defensible right answer
- Adds UI surface area (two toggle buttons, persistent state, possibly separate settings per level)
- Most players will never touch it and will accept whatever the default is — so the default still needs to be correct
- The player debugging a notification issue doesn't need to configure their audit log first; they need the fastest path to understanding their notification state

**Verdict:** This is the wrong place for configurability. Configurability is appropriate when two equally valid options address genuinely different workflows at scale. This isn't that. The right defaults — MRF outer, chrono inner — serve both casuals and power users. Configurability here adds friction without adding value.

---

### Option 5 — Context-Adaptive Ordering

**What it proposes:** The system detects whether the player is in "scanning mode" (looking for a specific notification quickly) or "investigation mode" (drilling down to understand a specific notification's history), and adapts ordering accordingly. In practice:
- If the player opens the panel and scrolls, MRF serves scanning
- If the player expands an entry, a subtle animation signals "switching to investigation mode," and the chain appears chronological

**The problem:** This is just Option 3 (MRF outer, chrono inner) reframed as intelligence rather than as a static design. The "context adaptation" is structural — not inferred from behavior — because expanding an entry IS entering investigation mode. The "adaptation" happens at the expansion event, which is exactly what Option 3 does.

**Verdict:** This is Option 3 with unnecessary complexity framing. Implement Option 3, don't call it "adaptive."

---

## Recommendation: Option 3 — MRF Outer List, Chronological Provenance Chain

This is the email inbox model. It is correct, well-precedented, and solves the cognitive friction concern through design separation rather than by forcing both levels into the same ordering.

**Key design requirements that make the hybrid work:**

1. **The expansion animation is a mode-switch signal.** The 200ms drawer-open must be distinct enough to tell the player "you've entered a different view." Not just content appearing — a visual transformation that reframes the space.

2. **The inner chain has explicit temporal language.** Every event in the chain has a full date, and the word "then" appears implicitly in the visual structure — a faint vertical connector line running through the event rows, like a timeline. The first event shows an origin icon (●); intermediate events show a connector (│→); the final event shows the terminal state icon. The player reads down: "this happened, then this, then this, then the current state."

3. **The outer list column header reinforces MRF.** A small "↓ Most recent first" label at the top of the list (not a clickable sort control — just a quiet orientation label, 80% opacity, 11px) anchors the expectation. Players who scan quickly get an explicit framing. Players who care about ordering know it's intentional.

4. **No cross-level correlation needed.** The design avoids any scenario where the player must mentally correlate events across multiple notifications' chains at the same time. Each notification is investigated in isolation. There is no "show me all events across all notifications sorted by date" view in the Settings panel — that's a developer/debug use case, not a player use case.

---

## Player Journeys

#### Journey: Arjun, 26, UX Skeptic — Opening the Audit Log for the First Time, Examining the Ordering

**Context:** Arjun is six months into Robot Uprising. He imported his career from his gaming desktop to his work laptop last week. He's methodical and has strong opinions about UX. He opens Settings → Notifications to verify his preferences migrated correctly, and to understand the UI.

**Minute 0:00 — Opening the Panel**
Arjun navigates to Settings (gear icon, top-right of the workbench header), then clicks "Notifications" in the sidebar.

The Notifications panel opens as a right-side drawer — dark background, 400px wide. Four notification entries are listed. The top entry is "Sample size reliability warning" with a grey dot (suppressed) and "Jan 14, 2026" on the right edge.

He clocks immediately: most-recent-first. Jan 14 is more recent than the other dates visible. The second entry says "Nov 22, 2025," the third says "Oct 5, 2025." The pattern is clear: most recently touched notification at top.

*He nods. This is correct. This is how settings panels should work.*

**Minute 0:30 — Expanding an Entry**
He clicks "Sample size reliability warning" to expand it. The row slides open with a 200ms animation — a kind of unfolding that separates the main row from the detailed content below it, as if the row has depth.

Below the main row appears:
```
  • Timeline
  Jan 5, 2026  — First encounter (toast fired)
  Jan 8, 2026  — Snoozed for session
  Jan 14, 2026 — Permanently suppressed by player action
  Feb 2, 2026  — Restored via import: arjun_feb2.rurobot  [↑ imported]
```

Dates read downward in time. Oldest at top, most recent at bottom.

Arjun pauses. He expected the inner list to also be MRF — by the principle of consistency. But reading it, he doesn't have to think. He reads:

*"January fifth, first time I saw it. January eighth, I snoozed it. January fourteenth, I decided to suppress it permanently. February second, the import brought that decision to this device."*

He reads it in five seconds. He understood it without reversing anything. The story made sense forward in time.

**Minute 1:00 — Deliberate Re-examination**
He catches himself and says (to no one in particular): "Wait — why is the outer list MRF but the inner chain chronological?"

He looks at the outer list header. There's a tiny "↓ Most recent first" label above the list. Subtle. He reads it, then looks back at the inner chain. No label — but the faint vertical line running through the event rows and the way dates increment as you read down create an implicit "timeline" framing.

He thinks: *"One is a list; one is a timeline. Lists start with what's new. Timelines start with the beginning."*

He accepts this. He might have argued for MRF-everywhere before reading the chain, but reading the chain chronologically felt natural enough that he's not going to argue against it.

**Minute 2:00 — Checking the Other Notifications**
He quickly scans the outer list: three others, all with correct dates, all matching his memory. He doesn't expand any of them — the summary row is enough. The MRF outer list let him verify all four notifications in 30 seconds by scanning from top to bottom.

If the outer list were chronological, he would have to scroll to the bottom to check the most recently interacted notification (the one most likely to have issues). MRF saved him that scroll.

**Minute 3:00 — Closing the Panel**
He closes the drawer and returns to the workbench. The notification preferences are correct. The ordering was legible. He has no complaint to file.

**UI Annotations:**
- Outer list sort label: "↓ Most recent first" in 11px, 80% opacity white, left-aligned above the first notification row; not a button, just a label; no click target
- Expansion animation: 200ms ease-in-out; the row "unfolds" by increasing max-height with the inner content fading in at opacity 0 → 1 with a 50ms delay after the height animation begins; the effect is that the row breathes open
- Timeline connector: a 1px vertical grey line connecting all event dots within a notification's expanded area; each event marked with a 6px dot; the final event's dot is slightly larger (8px) and matches the state color (grey for suppressed, amber for snoozed); the line runs from the first dot to the last, not beyond
- Inner chain dates: left column, monospace-inspired, consistent width (DD Mon YYYY format, 11 characters); right column describes the event in plain language

---

#### Journey: Saori, 41, Casual Player — Debugging a Missing Toast, Following the Chain Naturally

**Context:** Saori is a casual player, a few months into the game. She doesn't deeply analyze the UI — she plays by feel. Yesterday, she ran a filtered analysis with only N=8 matches and noticed she didn't get the yellow warning toast that her friend described. She thinks maybe she accidentally dismissed it permanently. She opens Settings to check.

**Minute 0:00 — Finding the Right Setting**
Saori opens Settings → Notifications. She scans the list. She doesn't know what "most recent first" means as a design concept — she just looks at the list and sees four items.

She doesn't have to think about the ordering because she doesn't need to rank them. She's looking for the toast about sample size. She reads the names: "Sample size reliability warning." That sounds like the one.

**Minute 0:30 — The Grey Dot Tells the Story**
The "Sample size reliability warning" row has a grey dot. She vaguely remembers from the onboarding that grey meant "turned off." She clicks the row.

It expands. She sees a small timeline-style list with dates.

```
• Timeline
Jan 5, 2026  — First encounter (toast fired)
Jan 8, 2026  — Snoozed for session
Jan 8, 2026  — Snoozed for session
Jan 14, 2026 — Permanently suppressed by player action
```

She reads from top to bottom. "I first saw it on January fifth. I snoozed it twice — January eighth. Then January fourteenth, I turned it off permanently."

She remembers January fourteenth. She was in a long analysis session and the toast kept appearing. She clicked "Don't show again" in a fit of frustration.

*"Oh. I did turn it off."*

**Minute 1:00 — Restoring the Toast**
She sees a grey `[Restore to default]` button on the right side of the "Permanently suppressed" row. She hovers — it turns amber-outlined. She clicks it.

A new entry appears at the bottom of the chain:
```
Feb 3, 2026  — Restored to default by player action
```

The grey dot on the outer row flips to amber (active). She closes the drawer.

**Minute 2:00 — Confirming It Works**
She runs a filtered analysis with N=7. The amber toast fires from the top-right. She reads it — the explanatory text about zones and reliability. She knows what it means now; she learned it months ago. She closes the toast without suppressing it. It's useful information.

**What the chronological ordering did for Saori:**
She never thought about the ordering. She just read the list from top to bottom and the story made sense. "First this, then this, then this" is how human beings understand sequences of events in their own lives. The chronological ordering was invisible to her — it was simply correct.

If the chain had been MRF, she would have read: "Jan 14 — suppressed; Jan 8 — snoozed; Jan 8 — snoozed; Jan 5 — first seen." She might have understood it (the effect before the causes), but she would have been slower. More likely, she would have seen "suppressed" at the top, known she found the answer, and stopped reading — never understanding the full chain that led there. The chronological order encouraged her to read the whole chain, and reading the whole chain gave her a mental model of her own behavior.

**UI Annotations:**
- Grey dot = suppressed state indicator: a solid circle, 8px diameter, #666 (neutral grey); paired with the state label "Permanently suppressed" in secondary text
- "Restore to default" button visibility: appears on hover over the notification entry (not the whole expanded area); positioned right-aligned in the "permanently suppressed" event row specifically; not visible until hovered, to avoid visual clutter
- New entry animation: when "Restore to default" is clicked, the new entry slides into position at the bottom of the chain with a 250ms fade-in; the state dot in the outer row transitions from grey to amber with a 400ms color animation (smooth, not instant — signals that a change happened)
- Amber dot = active-but-recently-changed state: briefly pulses (two 500ms pulses) when it first transitions from suppressed to active, then settles to steady amber

---

#### Journey: Marcus, 33, Systems Thinker — Analyzing a Multi-Hop Import, Relying on Chronological Order to Trace Causality

**Context:** Marcus has been playing Robot Uprising competitively. He maintains three profiles: Main, Experimental, and Archive. Last month, he exported Archive, shared it with his teammate Linh, who imported it, modified it, re-exported it, and sent it back to Marcus as "Linh_Remix." Marcus imported Linh_Remix and is now debugging why a notification he expected to see isn't appearing on the Linh_Remix profile.

**Setup context:**
- Archive profile: Marcus suppressed the sample-size toast on Oct 15 (he's a veteran)
- Linh imported Archive on Nov 5, played on it for a week, never touched notification settings
- Linh exported Linh_Remix on Nov 12
- Marcus imported Linh_Remix on Nov 20

**Minute 0:00 — Noticing the Missing Toast**
Marcus runs a filtered analysis with N=9 on the Linh_Remix profile. The sample-size toast doesn't fire. He knows he should see it — the Linh_Remix profile is practically new, and he expected to be prompted about reliability. He navigates to Settings → Notifications.

**Minute 0:30 — Reading the Outer List**
The outer notification list shows:
```
Sample size reliability warning   ● Suppressed  · Oct 15, 2025  [↑ imported]
```

October 15? Linh_Remix is a November profile. Suppressed before November. And there's an import badge. This is interesting.

Marcus expands the entry.

**Minute 1:00 — Reading the Provenance Chain**
The chain opens:
```
• Timeline
Oct 15, 2025 — Permanently suppressed by player action (Marcus_Archive)  [↑ origin]
Nov 5, 2025  — Passed through import: linh_remix_v1.rurobot  [↑ via Linh]
Nov 20, 2025 — Restored via import: linh_remix_exported.rurobot  [↑ imported here]
```

He reads it chronologically, top to bottom:

*"I suppressed it on Archive on October 15th. Linh imported Archive on November 5 — the suppress traveled with it. Linh never changed notification settings. Linh exported the remixed profile November 12, suppress still set. I imported that export November 20 — and the suppress came with it."*

The full chain of custody is visible. He didn't have to reverse anything. He read forward in time and reconstructed the causal sequence.

**Minute 1:30 — Making a Decision**
He looks at the "Restore to default" button. He clicks it.

New entry at the bottom:
```
Nov 20, 2025 — Restored to default by player action
```

The chain now shows four events: origin, pass-through, import, restore. Reading it chronologically, the story is complete: "I set this. It traveled through Linh's hands. It arrived here. I chose to reset it."

**What the chronological chain gave Marcus:**
The ability to trace provenance through multiple hops without reversing. He was doing forensics — understanding an unexpected state by tracing its causal history. Forensics reads forward: "what happened first, then what happened second, then what do I have now." If the chain had been MRF, he would have read the restore (future), then the import, then the Linh pass-through, then the origin. He would have had to mentally reverse the chain to reconstruct the cause-effect relationship. For a three-hop chain, that's non-trivial working memory load.

**The "passed through" event:**
This aspect implies a new data model detail: for multi-hop imports, intermediate pass-through events need to be recorded. When Marcus imported Archive on Nov 5 (via Linh), the profile's notification state should record "this state has passed through N imports." The implementation question (can a non-native profile's pass-through events be reconstructed without stored chain data?) is an engineering constraint worth flagging as a new aspect.

**Minute 3:00 — Checking One More Notification**
Marcus wants to verify that the coverage-score-stale notification also came from his Archive profile. He clicks that row. Its chain shows:
```
Oct 28, 2025 — Permanently suppressed (Marcus_Archive)  [↑ origin]
Nov 20, 2025 — Restored via import: linh_remix_exported.rurobot  [↑ imported here]
```

No Linh pass-through entry — because Linh used Linh_Remix as a Linh profile after import, and coverage-score-stale has a *different* suppress date (Oct 28 vs. Oct 15). Marcus realizes: the pass-through entry for sample-size was available because the import chain preserved it, but coverage-score-stale shows a simpler two-hop chain because the intermediate export only recorded the final state, not the full provenance of each entry.

This is an edge case that reveals the system's current-state vs. full-history tradeoff — a detail for the 4.69e-i-a-vi-a-iv (notification audit log) aspect to resolve. But Marcus reads it correctly without confusion: two-hop chains and three-hop chains look different in shape but read the same way — chronological, oldest at top.

**UI Annotations:**
- "[↑ origin]" badge: marks the event where the suppress was originally set by a player action (not an import); same amber as the general `[↑ imported]` badge but with a different icon — a filled star instead of an upward arrow — to distinguish "this is where it started" from "this is where it arrived"
- "[↑ via Linh]" badge: when a pass-through event can be attributed to a specific named profile (rather than just a filename), the badge shows the profile name; if the filename is available but no profile name, shows the filename (shorter form)
- Vertical connector line for multi-hop chains: the same 1px grey vertical line, but at each import/pass-through event, a small horizontal tick extends to the right — visually suggesting "branching from one device to another" without getting into actual graph visualization
- Monospace date column: fixed-width, consistent indentation at 16px; all four-event chains align dates vertically so the reader can scan the date column as a coherent temporal spine

---

## Strengths and Weaknesses

| Option | Strengths | Weaknesses |
|--------|-----------|------------|
| **1 — MRF everywhere** | Consistent; "newest at top" as single rule; fast path to most-recent event | Provenance chains read backwards (effects before causes); anti-narrative; cognitive tax for debugging |
| **2 — Chrono everywhere** | Consistent; narrative chains; investigation reads naturally | Outer list wrong for scanning; must scroll to find recently-changed notification; fights universal convention |
| **3 — MRF outer + Chrono inner (recommended)** | Correct ordering for each cognitive task; email inbox model; no new mental model to learn | Requires visual design work to make the mode switch feel natural; minor inconsistency if users actively compare both levels |
| **4 — Player-configurable** | Power-user flexibility | Adds UI surface area; defaults still need to be correct; most players will never touch it |
| **5 — Context-adaptive** | Framing of Option 3 as "smart"; | Unnecessary complexity framing; it's just Option 3 |

---

## Interaction Effects

**4.69e-i-a-vi-a-iv — Notification audit log (not yet analyzed):**
This aspect is a prerequisite constraint for the audit log's data model. The log must support two orderings simultaneously — the outer list sorted by most-recently-interacted notification, and the inner chain sorted chronologically per notification. The schema needs a `lastInteractionAt` field for outer-list sorting *and* an ordered list of events for inner-chain rendering. These are different orderings on different data structures — not a simple "flip a sort flag."

**4.69e-i-a-i (import timestamp visibility):**
The provenance chain rendering described in the parent analysis already implicitly used chronological ordering in all its illustrative examples. This aspect confirms that choice is correct and formalizes it as a design decision rather than an illustration convention.

**4.69e-i-a-i-g — Bulk provenance reset ("Mark all imported entries as mine"):**
The bulk reset action clears provenance metadata from all entries. After this action, all entries in all provenance chains become single-event ("permanently suppressed by player action, [date]"). The chronological chain collapses to a single dot. The visual change is immediate and legible: the player who executes bulk reset sees all their chains simplify to single-event entries. The ordering policy becomes irrelevant for reset entries since there's nothing to order.

**4.69e-i-a-i-h — Audit log as export artifact:**
If audit log data (full event chains per notification) travels in profile exports, the import chain can accurately reconstruct multi-hop provenance. If audit log data does NOT travel in exports, imported entries can only show the state as of export (no full chain), and the provenance chain for the importing profile will be shorter. The ordering policy is unchanged either way, but the richness of the chain differs.

**4.69e-i-a-i-i — First-encounter entry creation:**
The first-encounter event (when the toast first fired on this profile) is the anchor event in the chronological chain — it's always the first row. Its presence grounds the narrative: "this is when it started." If first-encounter entries are included, the chronological chain tells a complete story from first exposure to current state. If they're excluded, the chain begins at the first snooze or suppress event, which is less satisfying narratively but reduces chain length.

**4.69e-i-a-vi-d — Snooze state visibility in Settings:**
Snooze events appear in the provenance chain (as "Snoozed for session, [date]"). If a player has snoozed the toast twelve times before suppressing it, the chain has twelve snooze entries. This creates visual density that may warrant a "collapse snooze events" option (show first snooze, "... and N more snooze events", last snooze before suppress). Chronological ordering is preserved through the collapse — dates are still visible at both ends of the collapsed range.

---

## Comparable Games / Media

**Email Clients (Gmail, Outlook, Apple Mail) — The Definitive Precedent:**
Every major email client uses MRF inbox + chronological thread. This pattern has existed since the 1990s and has been validated by billions of users across every demographic. The mental model it encodes: "I scan my inbox to find what's new; I read the thread to understand what happened." The notification audit log is structurally isomorphic. The inbox = the outer notification list. The thread = the provenance chain. There is no reason to deviate from this pattern unless the specific context demands it, and the specific context here — scanning for recent changes vs. reading causal sequences — validates it.

**Git Log — The Version Control Precedent:**
`git log` by default is MRF (most recent commit at top). But the output of `git log --follow <file>` or a git blame view is effectively chronological (first commit that touched the file shown conceptually as the origin). `git log --reverse` exists for the cases where you want to read a file's history from the beginning. The audit log's design is analogous: `git log` = outer notification list (MRF), `git log --reverse --follow` = provenance chain (chrono). Git's design choices here are instructive: most engineers want MRF by default for the log, but when tracing a specific file's history from origin to present, chronological is the natural reading direction.

**Bug Trackers (Jira, Linear, GitHub Issues) — Activity Log Ordering:**
GitHub Issues and Linear both show the issue list MRF (most recently updated at top) but the individual issue's activity/comment log is chronological (first comment at top, latest at bottom). This is the same model. GitHub explicitly reversed this from an earlier design where comments were MRF — the chronological comments feed was strongly preferred by users for "reading the conversation."

**Medical Records — Encounter List vs. Single Encounter Timeline:**
A patient's encounter list (all visits to the clinic) is ordered most-recent-first: the doctor wants to see the most recent visit first. But within a single encounter record, events are listed chronologically: "patient arrived at 9:00am, vitals taken at 9:10am, physician entered at 9:30am, diagnosis recorded at 10:00am." The outer list is MRF; the inner timeline is chrono. Medical record software has converged on this because the two orderings serve genuinely different clinical tasks.

**Slack — Channel vs. Thread:**
Slack is an interesting case. The channel message feed is chronological (newest at bottom, you scroll up to see older messages). Individual threads expand with most-recent at bottom (continuing the chrono direction). Slack is consistently chronological at both levels — which is the Option 2 analog. But Slack's channel list in the sidebar IS sorted MRF (most recently active channel at top of the recent channels section). The sidebar = the outer list = MRF. The channel itself = inner sequence = chrono. Robot Uprising's panel is analogous to Slack's sidebar (MRF list) + Slack's channel view (chrono sequence).

**Factorio Recipe Tree vs. Research Order:**
Factorio's research queue shows most-recently-started research at the top when you hover (functionally MRF for the queue), but the tech tree itself is a causal graph read left-to-right (earlier research on the left, later on the right — chronological causality). The two views have different orderings because they serve different purposes. No one complains about this "inconsistency" because the contexts are visually and semantically distinct.

---

## Sensory Description

**The outer notification list:**

The panel is dark — a deep #1a1a1a background, structured like a form document but alive. The four notification entries are separated by hairline dividers (#333, 1px). Each entry has three zones:
- **Left**: the notification name in white body text, 14px, 80% weight
- **Center**: the colored state dot (6px circle) with a state label ("Active," "Snoozed," "Permanently suppressed") in 12px secondary text, #aaa
- **Right**: the date of most recent interaction, 12px, right-aligned, #888

The whole row is 48px tall. Compact but not cramped. The list scans quickly.

The "↓ Most recent first" label sits above the first row — 11px, 70% opacity, italicized just slightly. It's not a button. It's environmental. Like a caption beneath a photo. It doesn't demand attention but it's there if you look.

**The expansion:**

You click a row. It doesn't suddenly show new content — it *opens*. The row expands downward at 200ms ease-in-out, max-height transition. Beneath the main row, indented by 16px, a "Timeline" label appears (12px, #666, not white — deliberately not as loud as the notification name above it) and the list of events begins fading in, starting from the top event, each event 30ms after the previous (staggered fade). The effect is the list *composing itself* in front of you, top to bottom, oldest to newest.

This stagger is subtle — only 30ms per item — but it reads as "chronological construction." The list is building itself in time order, which primes the reader to process it chronologically. It's a cheap animation that does real work.

**The events themselves:**

Each event row is 32px tall. The vertical connector line is a 1px solid #444 column on the left, with each event's dot hanging off it. The color of the dot matches the state it represents: grey for suppress, amber for snooze, white for first encounter, amber-with-upward-arrow for import. The event description text is 13px, #ddd. The date is 12px, monospace, #999, left-aligned in a 110px fixed-width column.

Reading an event feels like reading a terminal log — not a game log, a *real terminal log*. The font choice evokes seriousness: this is a record, not a decoration. There's no game-y skeuomorphism here. The notification audit log is the game speaking directly to you as a systems thinker: "here is exactly what happened, in the order it happened."

**The import badge's amber color:**

Amber (#f5a623) appears on three things in this panel: the amber state dot (active-with-recent-activity), the import badge, and the restore-to-default hover state. The player reads amber as "this warrants a second look." Not alarming (red would be alarming), not neutral (grey would be neutral), but **contextually meaningful** — the same amber that warns about small-N analysis reliability, the same amber that marks the directional zone. Amber in Robot Uprising's UI vocabulary means: "you can proceed, but be aware of what you're looking at."

An import badge is amber because "this state came from somewhere else, and knowing that is worth one second of your attention." Not a warning. Just a signal.

**The provenance chain expansion:**

Clicking the `[↑ imported]` badge opens a sub-drawer within the already-expanded row. This is a drawer inside a drawer. The inner drawer uses a slightly different background (#1f1f1f instead of the outer #1a1a1a — 5 points lighter, just enough to signal a depth change). The title is "Import history" in 11px, amber, uppercase. The chain events use the same monospace date column but with additional icons for multi-hop distinguishing. A faint glow around the inner drawer's left edge — a 1px amber-tinted border — marks the provenance chain as "imported content," consistent with the badge vocabulary.

The ambient audio on chain expansion: a very brief (~100ms) soft "archive opening" sound — the sonic analog of a heavy cabinet drawer sliding open. Not a game sound effect (bouncy, musical), not a UI click (percussive, short). Something between: a soft whomp, slightly resonant, the sound of something with history being accessed. It tells the player: you've entered a record.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i — Snooze event collapsing in long provenance chains:** If a player snoozed the same toast 20 times before suppressing it permanently, the provenance chain has 20 snooze entries. The chronological chain becomes visually long. Should snooze events be collapsible ("3 snooze events, Jan 5–Jan 9" → expandable)? Or shown in full? Collapsing loses granularity but improves scannability. Design decision needed with edge case analysis.

- **4.69e-i-a-i-f-ii — Staggered animation direction and cognitive priming:** The 30ms staggered entry animation described above (composing top-to-bottom) is a claim that chronological priming is achievable through animation. This should be validated against alternative: stagger-from-bottom (newest entry fades first) which is the MRF analog. Which animation feels more legible? Warrants UX testing if prototyped.

- **4.69e-i-a-i-f-iii — Multi-hop pass-through data availability:** The Marcus journey reveals that intermediate import-pass-through events are only recorded if the exported profile carries audit log data (aspect 4.69e-i-a-i-h). Without audit log in exports, the middle-hop is invisible and the chain appears shorter than it actually is. The data availability of pass-through events is a direct consequence of the export decision in 4.69e-i-a-i-h — creating a dependency between two aspects that should be resolved together.

- **4.69e-i-a-i-f-iv — "Jump to current state" affordance in long chains:** For a provenance chain with 15+ events, the current state is at the bottom (chronological). A player who opens the chain to understand their current situation (not the full history) has to scroll to the bottom. A small "current state" anchor link or auto-scroll behavior would surface the most immediately relevant event without changing the ordering. Navigation affordance vs. the integrity of chronological reading.

- **4.69e-i-a-i-f-v — "Show only significant events" filter in the chain:** A toggle hiding snooze events and showing only state-changing events (first encounter, suppress, restore, import). The filtered view would be much shorter and immediately communicates the key state transitions. The full view adds context (how many times the player snoozed before deciding to suppress). Both views are useful for different players. Interaction with snooze collapsing (4.69e-i-a-i-f-i) — two approaches to the same density problem.

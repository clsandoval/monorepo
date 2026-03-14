# Notification Audit Log — Import Timestamp Visibility

**Aspect:** 4.69e-i-a-i — Import timestamp visibility in notification audit log

**Parent chain:**
4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e-i-a-vi → 4.69e-i-a → 4.69e-i → 4.69e

**Siblings (children of 4.69e-i-a-vi-a-i):** 4.69e-i-a-i-a (partial export), 4.69e-i-a-i-b (export age warning), 4.69e-i-a-i-c (cross-game portability), 4.69e-i-a-i-d (opt-in consent layer)

**Cross-references:**
- 4.69e-i-a-vi-a-iv — Notification audit log (the log itself — not yet analyzed)
- 4.69e-i-a-vi-a-i — Notification state in profile export (parent — analyzed)
- 4.69e-i-a-vi-d — Snooze state visibility in Settings

---

## The Problem

The parent analysis (4.69e-i-a-vi-a-i) established that **permanent suppress flags travel with profile exports**. When a player imports a profile — whether migrating their own career to a new device or loading a shared community config — the "permanently suppressed" notification state arrives already set in the imported profile.

The notification audit log (aspect 4.69e-i-a-vi-a-iv, not yet written) is a per-profile display in Settings showing the last N interactions with each notification — "you first encountered this toast on Jan 5, you suppressed it permanently on Jan 10." It exists so players can answer "why am I not seeing this notification anymore?" and "when did I decide to stop seeing it?"

When a suppress flag arrived via import rather than via player action, the audit log has a problem: **what timestamp should the log entry show?**

The original suppression happened on a different device, at a different time, by the same player (or a different player). The import event happened today. The log must display *something* — and the choice of what to display shapes what the log communicates.

---

## What a Timestamp in an Audit Log Is For

Before exploring options, it helps to clarify what players ask timestamps to answer:

1. **"When did I learn this?"** — The cognitive question. The answer is the original suppression date: the moment (on any device) when the player decided they no longer needed this notification. For a device-migrating player, this is the meaningful date.

2. **"When did this entry appear in this log?"** — The provenance question. The answer is the import date: the moment this profile on this device acquired the suppress flag. For a player debugging unexpected toast absence, this is the relevant date.

3. **"Is this entry mine, or inherited?"** — The ownership question. Neither a single timestamp answers this; it requires metadata about how the entry arrived.

4. **"How long ago did this happen?"** — The staleness question. If a player exported in November and imported in March, the original date shows 5 months ago; the import date shows today. These tell completely different staleness stories.

The fundamental tension: **original date is more semantically correct; import date is more operationally accurate.** These are not the same.

---

## Option A — Show Original Date Only

**Appearance:**
```
Sample size reliability warning
  Permanently suppressed
  Jan 10, 2026
```

**How it works:** The audit log entry shows the date the suppress was originally set — regardless of when the profile was imported. The import event is invisible in the log.

**The good case (Priya, device migration):**
Priya imports her career profile on Feb 3. She navigates to Settings → Notifications and sees her audit log. The sample-size toast shows "Jan 10, 2026" — which is when she actually suppressed it, months into her career. The timestamp confirms her memory. She knows exactly when she made that decision. The log is an accurate record of her career history.

**The bad case (Kenji, imported community config):**
Kenji is two weeks into the game. He imported VortexArchitect's profile to study it. He opens Settings → Notifications and sees "Jan 10, 2026" as the suppression date for the sample-size toast. He's confused: he's never seen this toast. He creates a profile on Jan 22. The log shows a date 12 days before his account even existed. He doesn't understand what this means. He posts to Discord: "My notification audit log shows a January date but I only started playing last week?"

**The scale problem:** The original date is divorced from the player's memory of their own experience. For a config importer who never saw the toast at all, "Jan 10" is meaningless noise.

**Verdict:** Correct for migration use case. Misleading for config-sharing use case. Works best when the player knows they migrated their own career.

---

## Option B — Show Import Date Only

**Appearance:**
```
Sample size reliability warning
  Permanently suppressed
  Feb 3, 2026
```

**How it works:** The audit log entry shows the date the profile was imported onto this device — not when the suppress was originally set. The original suppression event is invisible.

**The good case (Kenji, imported community config):**
Kenji imported on Jan 22. The audit log shows "Jan 22, 2026." He understands: something happened on Jan 22 that suppressed this notification. He can connect the timeline — he imported VortexArchitect's profile on January 22. The date makes sense in his history.

**The bad case (Priya, device migration):**
Priya suppressed the toast on Jan 10. She migrates to a new device on Feb 3. Her audit log shows "Feb 3, 2026" as the suppression date. But she didn't suppress it on February 3 — she suppressed it on January 10 after months of learning why it fires. The timestamp is technically accurate but semantically wrong: it shows when the preference arrived on this device, not when she made the decision. The log no longer reflects her career history.

For Priya, the audit log has lost its primary use: confirming her memory of her own career arc.

**Verdict:** Operationally accurate. Semantically hollow for migration use case. Correct for "when did this device acquire this state" but wrong for "when did I make this decision."

---

## Option C — Dual Timestamp: Original + Import

**Appearance:**
```
Sample size reliability warning
  Permanently suppressed
  Originally suppressed: Jan 10, 2026
  Restored via import: Feb 3, 2026
```

**How it works:** The audit log entry shows both dates explicitly: when the suppress was originally set, and when it arrived on this device via import. Native (non-imported) entries show only the single original date. Imported entries show both.

**What this communicates:** The dual timestamp says "this entry has a history — it was made on a different device, at a different time, by the same player (or someone else), and was brought here by an import." It is a lineage display, not just a date display.

**The good case (both personas):**
Priya sees Jan 10 as the original date — her real career memory. She also sees Feb 3 as the import date — accurate record of when the preference arrived. Both facts are true and useful.

Kenji sees Jan 10 as the original date — VortexArchitect's suppression date. He sees Jan 22 as the import date — the date he imported. He can read the full story: "someone suppressed this on Jan 10, and I imported that state on Jan 22." He now knows the entry didn't come from his own actions.

**The complexity cost:** Two timestamps per row increases cognitive load. Players who've never imported a profile will never see dual timestamps, so this complexity only appears when relevant — good design. But the labels "Originally suppressed" and "Restored via import" are jargon that new players may not immediately parse.

**The multi-hop problem:** What if Priya imports on Feb 3, uses the game, and then exports for someone else on March 5 — and that person imports on March 10? The chain of custody now has three dates:
- Original suppress: Jan 10
- First import: Feb 3
- Second import: March 10

Do we show all three? A full chain-of-custody display would be accurate but overwhelming. A simpler policy: **always show the most-original date and the most-recent import date, with a "(2nd import)" indicator if applicable.** Alternatively: truncate chain to depth=1, showing only original date and most-recent import.

**Verdict:** Maximum information density. Correct for both migration and sharing use cases. Complexity justified because it only appears when relevant (imported entries). The multi-hop edge case needs a policy decision.

---

## Option D — Original Date with Import Badge

**Appearance:**
```
Sample size reliability warning
  Permanently suppressed
  Jan 10, 2026  [↑ imported]
```

**How it works:** The primary date shown is the original suppression date — the semantically meaningful one. An inline badge or icon (small, amber, not dominant) signals "this entry came from an import." The badge is not a full date — it's a flag that says "there's more to the story here."

**The badge design:**
- `[↑ imported]` — simple text badge, small, secondary color
- `[⇑ via import]` — icon + text, slightly more explicit
- A small chain-link icon ⛓ — more visual, less text-heavy

On hover or click, the badge expands to show: "Restored from import on Feb 3, 2026 — click to see import history."

**What this balances:**
- Primary display answers "when did I suppress this?" (Jan 10)
- Badge answers "where did this entry come from?" (imported)
- Hover/click answers "when did the import happen?" (Feb 3)

Progressive disclosure: the player who doesn't care about import provenance sees a clean date + a small badge they can ignore. The player debugging unexpected notification absence can expand the badge for full context.

**The bad case (new player):**
A player who's never imported a profile sees the badge on an inherited entry and doesn't know what it means. The badge requires learned vocabulary. First-time encounter should have a tooltip: "This notification preference was restored from a profile import. [Learn more]." Tooltips add complexity but the badge without tooltip is incomplete.

**Verdict:** Clean primary display with opt-in detail. Progressive disclosure design. Requires tooltip investment for first-encounter clarity. Probably the best balance between Option A (clean, semantically correct) and Option C (maximum information).

---

## Option E — Audit Log as Full Provenance Chain

**Appearance:**
```
Sample size reliability warning
  PERMANENTLY SUPPRESSED

  Provenance history:
  → Jan 10, 2026: Suppressed permanently by player action (Priya_Main on Device A)
  → Feb 3, 2026: State restored via profile import (from backup priya_jan15.rurobot)
```

**How it works:** The audit log is redesigned around a full provenance model. Each entry is not a single date but a chain of events: when was the notification first triggered, when was it snoozed, when was it suppressed, was it ever restored to defaults, was it imported, etc. The full history of the entry.

**What this enables:**
- Complete debugging capability: "why am I not seeing this toast?" → can trace every event that led to current state
- Full chain-of-custody visibility: a player who imports another player's config can see that "Priya suppressed this on Jan 10" and decide whether that context is relevant to them
- Counterfactual reasoning: "if I restore to defaults now, I'll see the toast as if for the first time"

**The cost:**
This is a significant UX and engineering investment. Most players will never need this level of detail. The provenance chain is useful for power users and for support debugging, but the Settings → Notifications panel will become complex for the vast majority of players who've never imported a profile.

**The right home for Option E:** Not in the default view, but as an expandable "show full history" section — a second layer of progressive disclosure beyond the badge in Option D. The default view shows Option D (date + import badge). Click "show history" to see the full provenance chain.

**Verdict:** Most powerful option. Should live behind progressive disclosure, not in the default view. Combined with Option D as a base, this is the complete solution.

---

## Recommended Design: **Option D as Default + Option E as Progressive Disclosure**

**Default audit log entry (no import):**
```
Sample size reliability warning
  Permanently suppressed  ·  Jan 10, 2026
```

**Audit log entry for imported suppress:**
```
Sample size reliability warning
  Permanently suppressed  ·  Jan 10, 2026  [↑ imported]
```

Hovering the `[↑ imported]` badge shows a tooltip:
> "This preference was restored from an import on Feb 3, 2026."

Clicking `[↑ imported]` expands a provenance section:
```
  ▾ Import history
    Jan 10, 2026 — Suppressed permanently (original device)
    Feb 3, 2026  — Restored via import: priya_jan15.rurobot
```

**Multi-hop policy:** Show the full chain up to depth=3. Beyond depth=3, collapse older hops with "... (2 earlier events)." The original date is always visible; older intermediate hops can be collapsed.

**For entries that have never been imported** (the common case): No badge, no expandable section. Just the single date. The provenance machinery is invisible unless relevant.

---

## Player Journeys

#### Journey: Priya, 34, Software Engineer — Device Migration, Reviewing Her Audit Log

**Context:** Priya successfully migrated her profile from her dead laptop to a new one three days ago. She's playing normally. Today, she notices the sample-size toast never fires — she wants to confirm that her permanent suppress migrated correctly.

**Minute 0:00 — Opening Settings**
Priya navigates to Settings → Notifications. The panel is dark, structured, minimal — a list of all notification types, each with its current state.

Sample size reliability warning: grey dot (suppressed), no toast activity badge.
Coverage score staleness: grey dot (suppressed).
Two others: amber dot (active, never triggered), green dot (active, last seen 3 matches ago).

She clicks on "Sample size reliability warning" to expand its audit log.

**Minute 0:30 — Reading the Audit Log Entry**
The entry expands to show:
```
Permanently suppressed  ·  Jan 10, 2026  [↑ imported]
```

She sees the `[↑ imported]` badge. She knows exactly what it means — she did the import three days ago. She hovers over the badge.

Tooltip appears: "This preference was restored from an import on Feb 3, 2026."

She nods. That's correct. Jan 10 is when she suppressed it — she remembers, it was around match 200, after she'd seen the amber band about fifty times. She clicks the badge to expand the provenance chain.

```
▾ Import history
  Jan 10, 2026 — Suppressed permanently (original device)
  Feb 3, 2026  — Restored via import: priya_jan15.rurobot
```

She reads it. Both dates, both events, clear lineage. The audit log is telling the truth: she suppressed it in January, she moved to the new device in February, the preference came with her. Correct. The system worked.

She closes Settings. She never thinks about this again. The audit log did its job: confirmation, then invisibility.

**Minute 2:00 — Continuing Play**
She deploys a new config. No toasts fire. She runs a career analysis. Results load cleanly. The notification preferences are exactly where she left them.

The audit log review took 90 seconds and required zero support posts. For the migration-heavy use case, this is the success metric.

**UI Annotations:**
- Settings → Notifications: accessible from gear icon in the main navigation; panel opens as a right-side drawer over the workbench
- Notification list: each item is an expandable row; grey dot = suppressed, amber = recent encounter, green = active with recent encounter, no dot = active never triggered
- Audit log expansion: slides open in 200ms; shows last 5 events by default; "show full history" expands to complete chain
- Import badge: warm amber `[↑ imported]` text badge, 11px, right-aligned in the timestamp row; subtle not alarming; tooltip on hover in 400ms delay
- Provenance chain: monospace-inspired font, each line starting with date; slight indent from parent entry; a faint vertical connector line on the left edge

---

#### Journey: Kenji, 19, Student — Studying an Imported Community Config, Confused by Dates

**Context:** Kenji imported VortexArchitect's profile on Jan 22 to study the configuration. He's been using it as a "study profile" alongside his main profile. Three weeks later, he notices that when he runs low-N filtered analyses on the VortexStudy profile, the sample-size toast never fires. He's been seeing it on his own profile but not on VortexStudy. He opens Settings to investigate.

**Minute 0:00 — The Investigation**
Kenji opens Settings → Notifications on the VortexStudy profile.

He sees the same notification list Priya saw, but with a critical difference: the sample-size warning shows a grey dot with a "4 permanently suppressed" subtitle.

He clicks to expand.

```
Permanently suppressed  ·  Nov 18, 2025  [↑ imported]
```

November 18? Kenji's player account was created in January. He's never been in the game in November. He hovers the badge.

"This preference was restored from an import on Jan 22, 2026."

Ah. Now it makes sense. VortexArchitect suppressed the toast on November 18 — months before Kenji started playing — and that state came with the import on January 22. VortexArchitect's decision has been silently active on Kenji's study profile for three weeks.

**Minute 1:00 — Making a Decision**
Kenji clicks to expand the provenance chain:
```
▾ Import history
  Nov 18, 2025 — Suppressed permanently (original device, VortexArchitect_Main)
  Jan 22, 2026 — Restored via import: VortexArchitect_S5_config.rurobot
```

He reads: "VortexArchitect_Main." That confirms this came from someone else's profile, not his own.

He looks at the button beside the entry: `[Restore to default]`.

He clicks it. The grey dot flips to amber. The audit log adds a new entry:
```
  Jan 22, 2026 — Suppressed permanently (original device, VortexArchitect_Main)  [↑ imported]
  Feb 12, 2026 — Restored to default by player action
```

*Now* the toast will fire on this profile when he runs low-N analyses. He can learn the reliability vocabulary from the game's own tutorial language, not from inheriting VortexArchitect's expertise.

**The key insight Kenji draws:** The audit log with the `[↑ imported]` badge + provenance chain let him understand that his study profile had inherited someone else's epistemic state. Without the import badge, November 18, 2025 was just a confusing date before his time. With the badge and provenance chain, it was a clear message: "this isn't yours, and you can reset it."

**Minute 3:00 — Running a Filtered Analysis**
Kenji runs a filtered analysis on VortexStudy: N=9, random opponent from VortexArchitect's history.
The amber toast fires. He reads it — he's seen it enough times on his main profile to know what it says, but reading it on the study profile feels different. He's choosing to see it. He clicks `[Don't show again →]` for this profile, separately from VortexArchitect's suppress decision. This time, the audit log will show his own date.

**UI Annotations:**
- Notification list subtitle: "4 permanently suppressed" shown as muted secondary text below the notification name in the summary view (not the expanded view)
- `[Restore to default]` button: visible on hover within the expanded audit log row; amber-outlined, not filled; communicates reversibility rather than destruction
- Audit log update after restore: new entry appended at top (most-recent-first ordering); previous imported entry remains visible but shifted below, with its `[↑ imported]` badge intact — history is preserved, not rewritten

---

#### Journey: Dev, 28, Solo Dev — Building the Notification System, Debugging Edge Cases

**Context:** This is an in-universe designer journey — useful for defining edge cases. Dev is playtesting their own game and has deliberately imported an old profile backup (6 months old) to test behavior around stale exports. They want to verify that the audit log correctly handles multi-hop imports.

**Context setup:** Original profile: suppress set on Sept 1. First export: Oct 1. First import (Device B): Oct 5. Device B profile exported: Nov 1. Second import (Device C): Nov 8. Device C is where Dev is now testing.

**What should the audit log show?**

**Option 1 — Full chain (all 3 events):**
```
▾ Import history
  Sep 1, 2025  — Suppressed permanently (original device)
  Oct 5, 2025  — Restored via import: backup_oct1.rurobot
  Nov 8, 2025  — Restored via import: backup_nov1.rurobot
```

**Option 2 — Truncated chain (original + most recent):**
```
▾ Import history
  Sep 1, 2025  — Suppressed permanently (original device)
  Nov 8, 2025  — Restored via import: backup_nov1.rurobot
  ... (1 intermediate import)
```

**Option 3 — Flat display (original + count):**
```
  Sep 1, 2025  [↑ imported × 2]
```

Dev tests Option 1 first. Reading the three-event chain is verbose, but it's correct. For a support case ("why is this player's notification suppressed from September when they started playing in October?"), the full chain is the answer.

Dev tries Option 2. The "1 intermediate import" link expands to show Oct 5 — one more click to get the full picture. This feels right for the 80% case (one import) and the 95% case (two imports). Only the most unusual cases need deep expansion.

**Dev's recommendation (to themselves):** Ship Option 2 with depth=2 visible by default. Full chain available via "show all (N intermediate events)" expansion. The audit log should be complete but not noisy.

**Minute 15:00 — The "No Original Timestamp" Edge Case**
Dev imports a profile that was exported before the audit log feature shipped. The exported JSON has a `permanentlySuppressed: true` flag but no `suppressedAt` timestamp — the old format didn't track it.

The audit log needs to handle this gracefully. Dev sees:

```
Sample size reliability warning
  Permanently suppressed  ·  (date unavailable)  [↑ imported]
```

Hover tooltip: "This preference was restored from an import on Nov 8, 2025. The original suppression date is unavailable (exported before date tracking was added)."

The log is honest about what it doesn't know. "Date unavailable" in muted text is better than showing a wrong date, a zero date, or a "Jan 1, 1970" epoch time.

Dev adds this as a QA requirement: backcompat with pre-timestamp exports must degrade gracefully to "(date unavailable)" + explanatory tooltip.

**UI Annotations:**
- "(date unavailable)" text: grey, 70% opacity, italic — clearly distinguished from a real date
- Tooltip for unavailable date: explains the technical reason (pre-feature export) without blame or jargon; single sentence, plain language
- Intermediate import collapse: "... (1 earlier event)" shown as amber text link, same color as the import badge, reinforcing vocabulary

---

## Strengths and Weaknesses by Option

| Option | Strengths | Weaknesses |
|--------|-----------|------------|
| A (original date only) | Semantically correct for migration; matches player memory | Confusing for config importers; no indication of import provenance |
| B (import date only) | Operationally accurate; correct for "when did this device acquire this?" | Semantically wrong for migration; erases original decision history |
| C (both dates, full) | Maximum information; correct for both use cases | Verbose; most players won't need both dates; multi-hop complexity |
| D (original + badge) | Clean default display; badge signals import origin; progressive disclosure | Requires tooltip investment; badge vocabulary must be learned |
| E (full provenance chain) | Complete debugging capability; chain-of-custody | Too heavy for default display; belongs behind progressive disclosure |
| **D+E (recommended)** | **Clean default, full detail on demand; works for both use cases** | **Engineering cost of provenance chain; multi-hop policy needed** |

---

## Interaction Effects

**4.69e-i-a-vi-a-iv — Notification audit log (not yet analyzed):**
This aspect is co-designing the audit log's fundamental data model. The provenance chain described here (origin event + import events in sequence) is a significant commitment to the audit log's schema. When 4.69e-i-a-vi-a-iv is analyzed, it should treat the import-timestamp findings here as a constraint: the log's data model must support multiple timestamped events per entry, not just a single "last_updated" field.

**4.69e-i-a-vi-d — Snooze state visibility in Settings:**
The parent analysis referenced "Restored from backup, Jan 15" as useful metadata in the Settings view. This aspect formalizes that requirement: imported entries should show import provenance at minimum, and ideally the full event chain on demand.

**4.69e-i-a-vi-e — Snooze state on game reset/clear:**
"Clear all progress" must also clear the provenance chain data, not just the suppress flag. If a player resets their career and then starts fresh, old provenance chain entries from pre-reset imports should not linger in the audit log.

**4.69e-i-a-i-b — Notification state in partial (config-only) export:**
A config-only export strips notification state entirely — so a profile imported from a config share will have no audit log entries for suppressed notifications (because no notification state traveled). The audit log for a config-import profile shows factory defaults: all notifications active, no history. The import badge system only appears when notification state actually traveled.

**4.69e-i-a-i-c — Export age warning for stale notification state:**
If the import dialog warns about a stale export (30+ days old), the audit log's original date is the authoritative source for "how stale": showing "Sep 1, 2025 (original)" in the audit log when importing in March 2026 makes the staleness immediately concrete.

**7.10 — Config necropsy culture / community sharing:**
When players share necropsy posts ("here's why my Season 5 config lost"), they may include screenshots of the Settings → Notifications audit log as part of the diagnostic evidence. The import badge system should not appear in those screenshots as confusing noise — if the necropsy is about an original profile, the audit log will show no badges (all native entries). If it's a migrated profile being shared, the badges tell an interesting story about provenance that the community may find valuable context.

---

## Comparable Games / Media

**Git Log — Commit Authorship vs. Committer:**
Git distinguishes `author` (who wrote the change) from `committer` (who applied it to the repo). A cherry-pick preserves the original author date but records a new committer date and timestamp. `git log --format="%ad %cd"` shows both. This is Option C in a version control context — and it's the dominant model in professional engineering precisely because "when was this created" and "when did it arrive in this branch" are different questions that matter in different debugging scenarios. Robot Uprising's provenance chain is a direct analog: original suppression date = author date, import date = committer date.

**Slack Message History — Forwarded vs. Original:**
When a Slack message is forwarded or reposted, the recipient sees both "forwarded from [channel]" and the original sender/timestamp alongside the current channel's delivery timestamp. The dual-timestamp model is familiar to millions of users. The import badge + provenance chain is Slack's forwarding indicator applied to notification state.

**Medical Records — Transcription Date vs. Event Date:**
Clinical notes distinguish "service date" (when the procedure happened) from "entry date" (when it was documented). A note entered a week after the event shows both. Healthcare's commitment to this distinction — enforced by regulation — is because "when did this happen?" and "when did we record it?" are genuinely different questions with different diagnostic implications. The notification audit log is a mini-medical-record for the player's learning history.

**iOS Settings — "Transferred from backup":**
When an iPhone is set up from a backup, Settings shows transferred preferences with no special indication. The original "notification preference last set" date from the backup is invisible — iOS shows only current state. This is Option A/B in practice — no import metadata at all. Players who restore an iPhone from an old backup and then wonder why notifications are configured a certain way have no audit trail. Apple's design prioritizes clean state over provenance, at the cost of debuggability. Robot Uprising should make the opposite choice — debuggability > cleanliness, especially because the game is about understanding systems.

**Factorio Blueprint Library — Imported Blueprints:**
Blueprint books imported from the community appear in the library without provenance data — they look like native blueprints once imported. The only way to tell they're imported is if the player remembers importing them. This has led to community confusion ("where did I get this blueprint?"). The lesson for Robot Uprising: import provenance should be visible, not erased, because players forget what they imported vs. built themselves.

**Browser DevTools — Network Request Origin:**
Chrome's DevTools shows which frame or script initiated each network request. An imported third-party script is clearly labeled by origin URL. This origin-labeling in a debugging tool is exactly what the import badge in the notification audit log provides — a clear signal that "this state did not originate in your actions on this device."

---

## Sensory Description

**The audit log in Settings looks like this:**

The Settings → Notifications panel is a clean, dark-background drawer — the same dark that pervades the game's UI. Three columns per notification entry: **name** (left, white), **state dot** (center, colored — grey/amber/green), **summary text** (right, muted — "Last seen 3 matches ago" or "Permanently suppressed").

Expanding a notification entry unfolds a sub-row with a timeline feel — time runs downward. Each event in the audit log is a small row with a date on the left and a description on the right, connected by a faint vertical line like a timeline chart. The most-recent event sits at the top.

For a **native suppress entry** (no import):
```
  ● Jan 10, 2026  Permanently suppressed by player action
```
Clean. One dot, one date, one line. The dot is a solid grey circle — the same grey as the suppressed state indicator.

For an **imported suppress entry**:
```
  ↑ Jan 10, 2026  Permanently suppressed  [imported]
  ● Feb 3, 2026   Restored via import: priya_jan15.rurobot
```
The `↑` icon is amber — a small upward arrow, like an import icon. The `[imported]` badge is the same amber, in small caps. The Feb 3 line is a slightly brighter dot — the import event itself. Reading downward, the timeline tells the story correctly: the suppress was made on Jan 10, and then on Feb 3 the profile carrying that suppress was imported here.

The color language: **amber = something to pay attention to, something imported, something about reliability** — consistent with the rest of the game's amber vocabulary. The import badge is amber not because it's alarming, but because it's contextually meaningful — the same way an amber reliability band signals "consider what you're looking at."

The `[Restore to default]` button appears on hover, to the far right of the entry row, as an unobtrusive text button. It doesn't look like a danger action (it's not red); it's amber-outlined — you can undo imported state, and doing so is a positive choice, not a mistake.

The provenance chain expansion: click the `[imported]` badge and a drawer within the drawer opens — 250ms, smooth, the content fades in. The chain is monospace-inspired (evokes a terminal, a git log, a medical record) — not the game's rounded-robot aesthetic, deliberately more "technical documentation." This is the power user view. The visual shift communicates: you've entered a detailed view. The ambient audio is quiet — maybe a very soft "document opening" sound, like flipping a page rather than a click.

---

## New Aspects Discovered

- **4.69e-i-a-i-f — Audit log ordering policy (most-recent-first vs. chronological):** The recommended design shows events most-recent-first within each notification's audit log, matching most modern logging UIs. But for the provenance chain (which tells a story), chronological order is more legible. Should the main audit log and the provenance chain use different orderings? Mixed-order UIs create cognitive friction. Design decision needed.

- **4.69e-i-a-i-g — Bulk provenance reset ("Mark all imported entries as mine"):** A migration player who has confirmed everything looks correct might want to retroactively mark all imported entries as "native" — removing the `[↑ imported]` badge from all entries. "I've verified this is my profile; stop distinguishing imported from native." This is a destructive-but-reversible action: clears provenance metadata, preserves suppress flags themselves. Interaction with "clear all progress" (4.69e-i-a-vi-e) and the audit log schema (4.69e-i-a-vi-a-iv).

- **4.69e-i-a-i-h — Audit log as export artifact:** Should the audit log entries themselves be included in profile exports? If yes, the importer can see not just the suppress flag but the full suppression history from the original device. If no, the imported entry just shows `(date unavailable)` for pre-export events. Carrying the audit log adds value for migration but adds size to the export file and potentially reveals private information (specific dates of play sessions).

- **4.69e-i-a-i-i — First-encounter entry creation for the audit log:** The audit log should presumably record not just suppress events but also "first encounter" events — the first time the notification fired on this profile. For an imported profile with a suppress already set, there is no first-encounter entry on this device. Should the audit log show "(notification never encountered on this device)" for imported-suppressed entries? Clarifies to the importer that they never saw the toast before it was suppressed.

- **4.69e-i-a-i-j — Audit log privacy: suppression dates as session metadata:** Suppression dates reveal when the player was actively playing the game. An exported profile with a full audit log reveals not just notification preferences but a timeline of the player's career engagement. A player who shares a config to the community may not want to share "I played a 3-hour session on Nov 18" embedded in notification timestamps. Privacy consideration for community-share exports — audit log should likely be stripped in config-share exports alongside other career data.

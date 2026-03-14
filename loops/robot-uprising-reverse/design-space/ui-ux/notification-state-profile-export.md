# Notification State in Profile Export

**Aspect:** 4.69e-i-a-i — Notification state in profile export: should notification preferences (snooze, permanent suppress) travel with a profile export/import?

**Parent:** 4.69e-i-a-vi-a — Profile-scoped vs. global snooze key
**Grandparent:** 4.69e-i-a-vi — Toast re-entry and session boundary detection
**Great-grandparent:** 4.69e-i-a — Sample size warning threshold
**Siblings:** 4.69e-i-a-vi-a-ii (snooze all profiles action), 4.69e-i-a-vi-a-iii (profile creation inheritance), 4.69e-i-a-vi-a-iv (notification audit log), 4.69e-i-a-vi-a-v (global suppress as super-setting)
**Cross-references:** 4.69e-i-a-vi-d (snooze visibility in Settings), 4.69e-i-a-vi-e (snooze on game reset), 4.69e-i-a-vi-c (generalized session re-entry hook)

---

## The Problem Being Solved

Robot Uprising runs in the browser with no backend. There is no cloud save. For players who want to move their career to a new machine, or back up progress before a risky experiment, the game must support **profile export/import** — a JSON (or binary) file that captures the player's career state.

The parent analysis (4.69e-i-a-vi-a) established that notification state is **profile-scoped** — each profile has its own snooze key and permanent-suppress flag stored in localStorage. This profile-scoping works correctly for multi-tab and shared-device use cases.

But it creates a new question: **when a profile is exported to a file and imported somewhere else, what notification state travels with it?**

---

## Anatomy of Notification State

The notification system has (at minimum) two distinct state types for the sample-size toast:

| State Type | How it's set | Duration | What it means |
|------------|-------------|----------|---------------|
| **Active snooze** | Player clicks `[Snooze for this session]` | Until midnight or 6h floor (Model B+) | "I've seen this today; don't interrupt my analysis session" |
| **Permanent suppress** | Player clicks `[Don't show again →]` in Settings | Indefinite | "I understand small-N analysis; this toast is no longer useful to me" |

These are fundamentally different things. Active snooze is **time-bound and contextual** — it's about the current work session. Permanent suppress is **indefinite and epistemic** — it's a claim about the player's knowledge. This distinction drives the entire export question.

**Key observation:** An active snooze set at 9pm today will have expired by the time any player imports a profile file. Profile export → file → transfer → import takes hours or days at minimum. The Model B+ calendar-day logic means the snooze expires at midnight the same day it was set. Active snooze is effectively **never meaningful to export.** The interesting question is entirely about **permanent suppress.**

---

## The Tension

**For carrying permanent suppress in exports:**
- Permanent suppress represents the player's epistemic state — "I know what this means." That knowledge doesn't evaporate when you get a new laptop.
- If Priya has played 600 matches and permanently suppressed the sample-size toast, she's an expert. On her new computer, she's still an expert. She shouldn't see the introductory toast again.
- A profile export is a career migration, not a profile reset. Complete portability is the mental model.

**Against carrying permanent suppress in exports:**
- The most common use case for exports in web games is not "I got a new laptop" — it's "I want to share my config with the community." A Discord post with an attached `.rurobot` file gets downloaded by 200 players who are NOT the person who suppressed the toast.
- A new player who opens an expert's exported profile should get the full onboarding experience the toast provides — not silently inherit "this player already knows."
- Permanent suppress is a **UX preference**, not a **career achievement.** It's more like browser cookies than save data.
- Notification preferences are device-context state. They sit in localStorage, not in the career database. Structurally, they don't feel like "career data."

---

## Option A: Export Nothing (Always Reset on Import)

**How it works:** The profile export file contains no notification state. On import, all notifications reset to factory defaults — as if the profile had never seen any toast.

**Export format:** No `notificationPrefs` field in the JSON at all. Or an explicit `notificationPrefs: {}` (empty object).

**Import behavior:** Importing a profile on a new device starts with all notifications fresh. The sample-size toast will fire the first time the player runs a filtered analysis with N < 15 on this device/browser.

**The good case (Dominic sharing to Discord):**
200 players download `dominic_s5_config.rurobot`. Every single one of them, when they open the career analysis with a small-N filtered view, sees the reliability toast with full explanatory text. Dominic's permanent suppress doesn't contaminate their onboarding. Each player learns the reliability vocabulary from the game, not from needing to ask Discord what the amber band means.

**The bad case (Priya migrating to new laptop):**
Priya spent 600 matches building her career. She's suppressed the sample-size toast, the coverage-score-stale alert, and two other notifications. On her new laptop, she opens her imported profile and begins a career analysis. Amber toast slides in from the top-right. She closes it. Later, she navigates to Settings to suppress it again. Then a second notification fires. She suppresses it. Then a third. By the end of the session she has clicked "Don't show again" on five notifications that she's already permanently suppressed on her old machine. She's mildly annoyed. It's a one-time cost, but it feels like the game forgot she existed.

**Sensory:** On Priya's new device, the first filtered analysis reveals the amber toast exactly as it appeared in week one of her career — warm amber border pulsing gently, full explanatory text, all three zones defined ("Exploratory below 15 · Directional 15–29 · Reliable 30+"). She knows every word of it. The game is speaking to her as if she's a beginner. She clicks `[Don't show again →]` with practiced efficiency, and the toast fades in exactly 350ms.

**Verdict:** Clean for sharing. Annoying for migration. The right tradeoff if the primary export use case is sharing/community distribution.

---

## Option B: Export Permanent Suppress Only (Not Snooze)

**How it works:** Active snooze is **never** exported (it's time-bound and meaningless in a new context anyway). Permanent suppress flags **are** exported as part of the profile's data.

**Export format:**
```json
{
  "profileId": "uuid_A",
  "displayName": "Priya_Main",
  "careerData": { ... },
  "notificationPrefs": {
    "sampleSizeToast": { "permanentlySuppressed": true },
    "coverageScaleStale": { "permanentlySuppressed": false }
  }
}
```

**Import behavior:** Permanent suppress flags are restored exactly. Active snooze is not included. On the new device, the player is in the same epistemic notification state as on the old device — they won't see toasts they've permanently dismissed.

**The good case (Priya migrating to new laptop):**
Everything is just as she left it. Her profile loads, her career grade is A, and none of the notifications she dismissed reappear. The migration feels seamless. The game treated the export as "the same player, new hardware."

**The bad case (Dominic sharing to Discord):**
200 players download Dominic's config. Dominic has `sampleSizeToast.permanentlySuppressed: true`. So do all 200 players, the moment they import. None of them will ever see the sample-size reliability warning. For every person who downloads an experienced player's profile file, the reliability vocabulary is silently hidden. Community posts proliferate asking "what does the amber band mean?"

**The deeper problem:** The importer doesn't know *why* the suppress flag is set. Priya's suppress means "I spent 600 matches learning this." Dominic's suppress, as inherited by a new player, means... nothing. The knowledge claim is divorced from the knowledge.

**A mitigation: the "shared config" export type:**
What if export had two modes?
- `Export Career (for migration)` → includes permanent suppress
- `Export Config (for sharing)` → strips all notification state

This preserves both use cases but requires the player to consciously choose. Most players exporting for sharing won't think about notification state at all. The distinction might be invisible until something goes wrong.

**Verdict:** Correct for migration. Problematic for sharing unless export modes are clearly differentiated.

---

## Option C: Import-Time Prompt

**How it works:** When a profile is imported, the game detects that the profile file contains notification preferences that differ from factory defaults. A small prompt appears before completing the import.

**Import prompt (if permanent suppress flags present in file):**
```
Restore notification preferences?

This profile has these notifications permanently suppressed:
  ✦ Sample size reliability warning
  ✦ Coverage score staleness alert

Restore these preferences to match the saved profile?
  [Yes, restore preferences]   [Start fresh — reset to defaults]
```

**If the file has no notification state (clean export or factory-default profile):** No prompt. Import proceeds silently.

**What the player experiences:**
- Priya migrating her career: chooses `[Yes, restore preferences]`. Seamless. Her suppressions are back.
- New player importing Dominic's config: sees the prompt and either reads it carefully and chooses `[Start fresh]`, OR doesn't understand it and clicks `[Yes, restore preferences]` — inheriting the suppressions anyway.

**The usability problem:** Most players importing a shared config file are not thinking about notification preferences. They downloaded the file to study the config. They'll click whichever button looks less scary. If `[Yes, restore preferences]` is the primary action and `[Start fresh]` is secondary, most click Yes. If `[Start fresh]` is primary, most click it and accidentally reset a migrating player's preferences.

**The button hierarchy matters enormously.** This is a case where "sensible default" design is doing most of the work, and there's no consensus on what "sensible" means without knowing who's importing.

**The micro-copy question:** "Restore notification preferences?" is opaque to a new player who doesn't know what "notification preferences" means in context. Worse: they may not have read the toast at all if they're brand new. The prompt is more confusing than the choice it's trying to prevent.

**Verdict:** Provides player agency but creates friction at the exact moment players want seamless import. Works best as a secondary fallback in a system that makes the right choice most of the time.

---

## Option D: Export-Time Disambiguation via Intent Label

**How it works:** The export flow asks the player to label the intent of the export before generating the file. This changes what's included in the file, not what happens at import.

**Export dialog:**
```
Export Profile: "Priya_Main"

Export purpose:
  ◉ Moving to a new device — keep my settings and preferences
  ○ Sharing with others — share config only (recommended for community posts)

[Export File]
```

Under "Moving to a new device": includes permanent suppress, notification history.
Under "Sharing with others": strips all notification state from the export.

**What the player experiences:** The choice is made at the moment the player knows the answer — at export time. The player who is moving devices knows they're moving devices. The player who's posting to Discord knows they're posting to Discord.

**The key insight:** Contextual knowledge is asymmetric. At export time, the exporter knows why they're exporting. At import time, the importer doesn't know what the exporter intended. Put the disambiguation where the knowledge lives: at export.

**The failure mode:** Players don't read the export dialog. The developer community has decades of data showing that users click through dialogs without reading them. The player moving devices sees "Moving to a new device ◉" already selected as default and clicks Export. The player sharing to Discord also clicks Export with the migration option selected, accidentally including their suppressions.

**Default radio button logic:** If the game can infer export intent from context (e.g., "Export" triggered from the profile's config-sharing panel vs. from the "backup/migrate" panel), it can pre-select the correct radio. If Export is a single button with one dialog, there's no contextual inference possible.

**Verdict:** Conceptually clean, practically dependent on whether players read dialogs. Best if surfaced with strong visual differentiation between the two modes (an icon, color treatment) that communicates the meaning without requiring the text to be read.

---

## Option E: Export Everything, Let Import-Time Profile Type Govern

**How it works:** The export always includes all notification state. But the import flow checks a **profile type** field on the import: `"type": "career_migration"` vs. `"type": "config_share"`. If the exported file is a config share (no career data), all notification state is ignored on import. If it's a full career migration, notification state is applied.

**The missing piece:** How does the exported file know its type? This requires the export-time design to be solved first. Option E is Option D at the implementation level — the type field IS the intent label — but surfaces the choice differently.

---

## Recommended Approach: **Option B with Export-Mode Differentiation as Phase 2**

**Phase 1 (profiles ship, export/import ships):**

Export permanent suppress flags with the profile. Do NOT export active snooze.

Rationale:
1. Active snooze is time-bound. It expires same-day. Exporting it is mechanically useless — it will be expired by import time in virtually every scenario.
2. Permanent suppress is the meaningful state. For the primary use case (player migrating to a new device), carrying it is correct and expected.
3. The secondary use case (sharing with others) *does* create a problem if the exporter has permanent suppress set. But this problem is partially self-correcting: most community config sharing is of agent configurations, not full career exports. A player posting "here's my S5 config" is likely exporting just the workbench config (skills, rules, hooks, context) — not their full career with match history, season stats, and notification prefs.

**Phase 1 mitigation for shared profiles:**
Add a small notice in the import confirmation UI:
> *"Importing Dominic_S5_Config.rurobot — career data, configuration, and notification preferences. Some notification warnings may be disabled. [Change import options →]*"

The `[Change import options →]` link opens a panel to selectively strip notification state. It's opt-in friction, not mandatory friction. Players who want the full portability get it. Players who notice the warning can strip it.

**Phase 2 (when config sharing becomes a formal feature):**
When the game adds a dedicated "share config" flow (distinct from "export profile"), the share flow simply never includes notification state. The two export types are mechanically differentiated, not label-differentiated.

---

## Player Journeys

#### Journey: Priya, 34, Software Engineer, Device Migration

**Context:** Priya's work laptop just died. IT replaced it with a new one. She's played Robot Uprising for four months — 612 career matches, A-tier grade, three notifications permanently suppressed. She exported her profile last week as a precaution. Now she's on the new laptop.

**Minute 0:00 — Import on New Machine**
She opens the game in the new browser. Clean install state: no profiles, factory defaults.
The empty profile screen shows: `[No profiles yet. Import a saved profile →]`
She drags `priya_main_backup.rurobot` onto the drop zone.
The game reads the file. Profile recognized: "Priya_Main · 612 matches · A tier."
Import confirmation dialog: *"Import profile 'Priya_Main'? Career data, notification preferences, and configurations will be restored."*
Small note below: *"Notification preferences: 3 toasts permanently suppressed. [Review →]*"
She clicks `[Import Profile]` without clicking Review. She doesn't want to review — she wants everything to be how it was.

**Minute 0:30 — Career Analysis**
Profile loaded. She navigates straight to career analysis.
Full-scope: N=612. A tier. Exactly as she left it.
She runs a filtered analysis — "vs. SerialKiller_99," N=41.
No toast. She permanently suppressed the sample-size toast months ago. It's not here. It shouldn't be.
The amber band is not visible — N=41 clears the directional threshold. No warnings at all.
She clicks into the results. Feels exactly like her old laptop.

**Minute 5:00 — Normal Play**
She deploys a new config against SerialKiller_99. Watches the replay. Runs a second filtered analysis. No toasts. No surprises.
She never thinks about notification preferences. The migration was seamless.
This is the best possible outcome: the system is invisible.

**UI Annotations:**
- Import drop zone: full-screen active when file is dragged over browser window; "Drop profile file here" overlay in amber-white on dark background
- Import confirmation: clean modal, profile preview card with grade and match count; notification preferences note is muted secondary text, not prominent
- `[Review →]` link: opens a small drawer listing the 3 suppressed notifications with `[Restore to default]` per item
- After import: brief "Profile imported successfully" confirmation toast (green, top-right, auto-dismisses in 3 seconds)

---

#### Journey: Kenji, 19, Student, Downloading a Community Config

**Context:** Kenji has been playing Robot Uprising for two weeks. He's in a Discord server for the game where players share configurations. A veteran player ("VortexArchitect") posted "My Season 5 build — Gauntlet A-tier consistent" with an attached `.rurobot` file. Kenji downloads it to study the configuration. VortexArchitect has permanent suppress on 4 notifications including the sample-size toast.

**Minute 0:00 — Import**
Kenji opens the game on his own profile ("Kenji_Learn," 31 matches, no suppressions).
He notices the import option in the profile menu: `[Import profile…]`
He wasn't trying to replace his career — he just wants to look at the config. He imports the file into a **new empty profile** named "VortexStudy."

**Minute 1:00 — Opening the Imported Profile**
"VortexStudy" loads. Match history: 847 career matches (VortexArchitect's full career). Grade: A.
Workbench has 6 configured agents. This is what Kenji wanted to see.
He opens career analysis. Full-scope: N=847. The metrics are all of VortexArchitect's matches — not Kenji's opponents, not his matches. This isn't what he wanted, but it's interesting.

**Minute 2:00 — Filtered Analysis**
He tries to run a filtered analysis vs. "Kenji's usual opponent" — but the opponent doesn't exist in this profile's match history. He filters to VortexArchitect's most common opponent instead. N=62. **No toast fires.** That's fine — N=62 is above the directional threshold.

He runs another filter to an uncommon opponent. N=9.
**Toast fires.** Amber, top-right.

Wait — toast fires? VortexArchitect had permanent suppress. Why is the toast firing?

**Because of how Kenji imported:**
Kenji imported VortexArchitect's exported career. The import carried `permanentlySuppressed: true` in the notification prefs. Kenji's "VortexStudy" profile should have inherited that suppress.

**...unless Phase 1 mitigation helped.**

At import time, Kenji saw the note: *"Notification preferences: 4 toasts permanently suppressed. [Review →]*"
He had clicked `[Review →]` out of curiosity (he's a student — he reads things). The drawer showed:
- Sample size reliability warning: OFF (suppressed)
- Coverage score staleness alert: OFF (suppressed)
- Two others...

He had thought: "Hmm, I don't know what these are. I'll reset them so I can learn what they do."
He clicked `[Restore to defaults]` on all four.

**The toast fires correctly.** Kenji reads it — the full explanatory text about N=9 being exploratory. He didn't have to ask Discord what the amber band means. The game told him.

**What would have happened if he'd clicked Import without reviewing:**
The suppress flags would have carried. No toast. Kenji would have studied VortexArchitect's configs for two weeks and never understood the reliability vocabulary. He'd have seen amber bands and assumed they were decorative.

**The lesson:** The `[Review →]` link at import time is doing real educational work — but only because Kenji clicked it. The design must make the notification preferences visible enough to prompt consideration, without making the import flow feel bureaucratic for the player who just wants their career back (Priya).

**Minute 10:00 — Back to Main Profile**
Kenji switches back to "Kenji_Learn." His own notification prefs are untouched. VortexStudy's state is completely isolated.
He opens career analysis on Kenji_Learn. N=31 — still building history.
He runs a filtered analysis, N=6. Toast fires (Kenji's profile has never suppressed it).
He reads it again. He's been seeing it for a week. He knows what it means now.
Next session, he'll probably suppress it permanently.

**UI Annotations:**
- Import flow: the `[Review →]` link for notification preferences should be visually distinct from the "danger" zone (it's not scary, it's educational); warm amber color, not red
- Notification review drawer: each notification shown with its current state (OFF = suppressed) and a brief description of what the notification does; `[Restore to default]` per item, `[Restore all to defaults]` at bottom
- After restore: brief checkmark animation next to each restored item

---

#### Journey: Tanya, 42, Casual Player, Post-Browser-Wipe Restore

**Context:** Tanya cleared her browser data to speed things up, forgetting it would wipe her game save. She's been playing casually for two months — 78 career matches, C+ grade. She had exported her profile two weeks ago. Now she's restoring.

**Minute 0:00 — The Realization**
Tanya opens Robot Uprising. Profile selector shows an empty state — "No profiles."
"Oh no." She searches her Downloads folder. Finds "tanya_career_backup_jan15.rurobot."

**Minute 1:00 — Import**
She imports the file. Profile recognized: "Tanya_Main · 78 matches · C+ · 2 weeks ago."
Import confirmation: *"Import profile 'Tanya_Main'? Your career data and preferences from Jan 15 will be restored."*
Notification note: *"Notification preferences: 1 toast permanently suppressed."*
She clicks `[Import Profile]` without reviewing. She doesn't care about notification settings — she wants her matches back.

**Minute 1:30 — Two Weeks of Lost Matches**
The imported profile shows 78 matches — 16 fewer than she had before the browser wipe. Those 16 matches happened in the past two weeks and weren't in the backup.
She notices the gap. Sighs. "I knew I should have backed up more recently."

She runs a career analysis. Full-scope: N=78. C+ grade. Some matches she remembers, some she doesn't.
She runs a filtered analysis vs. her nemesis opponent. N=7.
**No toast.** She had permanently suppressed the sample-size toast two weeks ago — and that preference came back with the import.
She doesn't notice the missing toast. She knows what the amber band means. The toast was already part of her past.

**The moment that matters:** Tanya's experience of the toast suppression is invisible — which is correct. She's not a new player. She already learned what the amber band means. The import silently restored her epistemic state, and she never had to think about it.

**UI Annotations:**
- Import confirmation for a backup-restore: the "2 weeks ago" timestamp in the profile preview is a gentle reminder that the backup may be stale; muted secondary text, not alarming
- The 78-match count vs. her pre-wipe count is not shown in the import dialog (the game doesn't know what she had before the wipe); she discovers the gap only when she navigates to career analysis
- C+ grade shown as a colored badge (amber-C+) in the profile preview during import

---

## Recommendation Summary

| State Type | Export? | Rationale |
|------------|---------|-----------|
| Active snooze | No | Time-bound; expired by import time in virtually all cases |
| Permanent suppress | Yes | Epistemic state; represents player knowledge; correct for migration use case |

**Phase 1:** Export permanent suppress. Include `[Review →]` link at import time to allow selective reset. Default: restore what was exported. Opt-in: reset to defaults.

**Phase 2:** When config-sharing becomes a formal flow (distinct UI path from profile backup), that flow never includes notification state. The migration vs. sharing distinction is resolved at the system level, not the dialog level.

---

## Interaction Effects

**4.69e-i-a-vi-c — Generalized session re-entry hook:** If other notifications join the system (coverage score stale, unreviewed flags, etc.), each will have its own permanent suppress flag. The export decision here scales to all of them: suppress flags travel, session snoozes don't.

**4.69e-i-a-vi-d — Snooze state visibility in Settings:** The Settings → Notifications panel, after import, should show the restored permanent suppress state clearly — "Restored from backup, Jan 15" as a metadata note would help the player understand why their preferences are as they are.

**4.69e-i-a-vi-e — Snooze state on game reset/clear:** "Clear all progress" should offer to either clear notification prefs along with career data, or preserve them. The import/export use case suggests notification prefs are meaningful state worth preserving independently of a reset.

**4.69e-i-a-vi-a-iv — Notification audit log:** If the game shows a notification history ("last 5 toast encounters on this profile with timestamps"), the imported history entries from a backup should be labeled "restored from backup" rather than showing as if they happened on this device. Helps the player understand the timeline.

**4.69e-i-a-vi-a-iii — Profile creation inheritance:** The export/import case is the strongest argument for NOT inheriting notification prefs on new profile creation — if a player creates a fresh profile, they should get factory defaults, not carry prefs from the profile they're cloning. Export/import is the explicit portability mechanism; profile creation inheritance is not.

**7.10 — Config necropsy culture / community sharing (not yet analyzed):** When Robot Uprising develops a config-sharing community, exported configs posted to Discord will likely strip career data (match history, opponent lists) for privacy. If career data is stripped, notification prefs should probably also be stripped — they're equally personal and equally irrelevant to the config itself.

---

## Comparable Games / Media

**Factorio — Save File Portability:**
Factorio save files (`.zip` archives with binary state) move completely between machines. Game settings and the "game played" flags are embedded in the save. When you open a save on a new machine, it behaves exactly as it did on the old one. Notification-equivalent "hint dismissed" flags are part of the save state and travel with it. This is Option B in practice — all state travels, including "this tutorial tip has been dismissed."

**Slay the Spire — Run State vs. Persistent State:**
StS separates run state (current run cards, relics) from persistent state (unlocks, completed achievements, settings). On game reinstall, runs are lost but settings persist. The "dismissed tutorials" flag is part of settings — persistent. This aligns with Option B: knowledge-state (dismissed = I know this) should persist across device migrations.

**Minecraft — Options.txt:**
Minecraft stores game settings in a plain-text `options.txt` separate from save files. Players who want exact settings on a new machine copy this file manually. Notification-equivalent "tutorial step completed" flags are in the save, not in options.txt. This creates a situation where moving a save to a new machine DOES carry notification state — which is correct if the player is moving their own save.

**iCloud / Steam Cloud — Synced Preferences:**
Games with cloud sync (Dead Cells on Switch sync to Steam, for example) carry the "have seen intro video" and "tutorial dismissed" flags. These travel with the player identity. This is the backend version of Option B: your preferences follow you because you are you, not because you transferred a file.

**The "shared ROM save" problem in emulation communities:**
When retro games are shared as pre-patched ROMs with saves included, recipients often inherit "story beaten" flags or "tutorial dismissed" states from the original player. The result: new players skip story content or miss tutorial context the game designed for them. This is the concrete failure mode of Option B when the export use case is sharing rather than migration.

---

## Sensory Description

A profile export is a file on a hard drive — it has no sensory dimension until import.

The import experience has two sensory moments:

**The drop-zone gesture:** The player drags the `.rurobot` file from their file browser onto the game's import zone. The game window reacts: a soft amber overlay spreads from the cursor to the screen edges, like a force field accepting the file. Ambient hum — a short "data received" tone, not a generic Windows sound but a robot-appropriate bleep at around 440Hz. The overlay resolves into the profile preview card, which fades in smoothly (350ms) with the profile name, grade badge, and match count.

**The notification preferences note:** Below the preview card, in muted secondary text (60% opacity, amber-tinted), a small line reads "3 notification preferences restored." It's not prominent. It doesn't demand attention. But it's there for the player who looks. The `[Review →]` link is the same amber as the reliability band — consistent vocabulary: amber = reliability/attention matters here.

The import confirmation button `[Import Profile]` is the primary action — large, dark background, white text. `[Review →]` is inline text, the size of a footnote. The hierarchy communicates: most players should just click Import, but the exit ramp exists.

For the player who does click `[Review →]`, a drawer opens from the right. Inside: a simple list. Each row has a notification name, its current imported state (a small dot — amber for suppressed, grey for active), and a `[Restore default]` button. The drawer hums open in 200ms. Each `[Restore default]` click produces a small tick sound — satisfying, surgical. The notification state dot flips from amber to grey with a 100ms transition.

**The absence of problems:** When the import completes and everything is as it should be — the seamless migration, no toasts that shouldn't fire, no missing warnings that should — the sensory experience is silence. The right sound of an import that worked correctly is the same sound as the game just loading normally. That's the goal: complete invisibility of the migration mechanism.

---

## New Aspects Discovered

- **4.69e-i-a-i-a — Import timestamp visibility in notification audit log:** When the notification audit log (4.69e-i-a-vi-a-iv) shows a "permanently suppressed" entry that came from an import, should the entry show the original suppression date (from the exported profile) or the import date? Semantic question: did the player suppress the toast on Jan 10 (original), or on Jan 20 when they imported? For debugging purposes, the original date is more informative, but it may confuse players who don't know the entry came from a backup.

- **4.69e-i-a-i-b — Notification state in partial export:** If the game allows "export config only" (just workbench configuration, no career data), what notification state travels? The answer is almost certainly "none" — notification state is tied to career context, not configuration. But this creates a design decision: is there a single export format, or two? If two, how does the player choose? Interaction with community config-sharing culture.

- **4.69e-i-a-i-c — "Export age" warning for stale notification state:** If a profile export file is more than 30 days old and contains permanent suppress flags, should the import dialog note that those suppress preferences are from an old save? Players who've changed their mind about a notification in the past month (e.g., they re-watched a tutorial and now want the toast back) would get their old preferences restored without realizing it.

- **4.69e-i-a-i-d — Cross-game portability of notification state:** If Robot Uprising ever ships a sequel or a sister game (e.g., "Robot Uprising: Campaign"), should notification state from the original transfer? A player who permanently suppressed the sample-size toast in the first game has presumably learned what it means. But the second game may have an extended/redesigned toast with new information. "Carry suppress from v1 to v2" vs. "reset on new game" vs. "carry suppress, but show a 'catch up' notification for new content added to the toast."

- **4.69e-i-a-i-e — Opt-in export of notification state as a consent layer:** Rather than exporting by default or not at all, give the player an explicit opt-in at export time: "Include notification preferences in export? (Recommended for device migration; not recommended when sharing with others)." Pre-selected based on inferred export context. This is a lighter version of Option D — less friction, more informative.

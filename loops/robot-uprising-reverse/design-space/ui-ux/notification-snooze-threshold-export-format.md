# Notification Audit Log — Multi-Threshold Export Format

**Aspect:** 4.69e-i-a-i-f-i-α-i — Multi-threshold export format: which threshold value travels with profile exports?

**Parent:** 4.69e-i-a-i-f-i-α — Temporal gap threshold as player-configurable setting
**Grandparent chain:** 4.69e-i-a-i-f-i → 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e

**Cross-references:**
- 4.69e-i-a-i — Notification state in profile export (establishes export framework for suppress flags)
- 4.69e-i-a-i-f-i-α — Temporal gap threshold parent (establishes 30-day default + configurability)
- 4.69e-i-a-i-f-i-ε — Snooze collapsing in export artifacts (sibling: raw vs. collapsed event export)
- 4.69e-i-a-vi-a-i — Profile-scoped vs. global snooze key (profile isolation principle)
- 4.69e-i-a-i-f-i-α-iii — Community-shared chains and threshold normalization (sibling)

---

## The Problem: A Third Export Category

The prior analysis (4.69e-i-a-i) established a clean two-way split for notification state in exports:

| State Type | Export? | Rationale |
|------------|---------|-----------|
| Active snooze | No | Time-bound; expired by import time |
| Permanent suppress | Yes | Epistemic state; player's knowledge claim |

The gap threshold is **neither of these.** It is not an epistemic claim ("I know what this means") and it is not a time-bound session state ("I've seen this today"). It is a **display preference** — a rendering instruction that controls how existing event data is visualized.

This distinction matters because display preferences have different portability semantics from both types of notification state:

- **Suppress flags** determine whether a notification fires at all. A wrong suppress flag has epistemic consequences: the player either misses a warning they need or sees one they've already internalized. The stakes are medium.
- **Display preferences** determine how already-recorded data looks on screen. A wrong display preference doesn't hide information — the raw events still exist. The stakes are lower.
- **Game data** (match history, career stats, agent configs) is the reason for the export. Non-negotiably travels.

This creates a **three-category export model** that no prior analysis in this chain has had to address:

```
EXPORT CATEGORIES
─────────────────────────────────────────────────────
Category 1: GAME DATA
  - Match history, career stats, agent configurations
  - Always exports. The point of the export.

Category 2: EPISTEMIC NOTIFICATION STATE
  - Permanent suppress flags ("I know this")
  - Exports by default (established in 4.69e-i-a-i)
  - Opt-out available via [Review →] at import

Category 3: DISPLAY PREFERENCES
  - Gap threshold (the subject of this analysis)
  - Sort order (most-recent-first vs. chronological)
  - Collapsed/expanded states, panel layouts
  - Export decision: open question
─────────────────────────────────────────────────────
```

The gap threshold is the **first display preference we've had to specify an export policy for.** The decision made here becomes a template for all display preferences.

---

## The Core Tension

**For exporting the threshold (carrying it in the export file):**

A player who set threshold=90 days did so because the 30-day default doesn't match their engagement rhythm. On a new device, their engagement rhythm hasn't changed. A 5-month gap between gaming periods is still a 5-month gap. The threshold they chose is still correct for them. If the export resets to 30 days, their carefully merged chains fragment on their new device, and they must re-discover the Advanced Settings panel and re-configure it.

Migration fidelity demands that display preferences travel with the profile. The goal is: *the game looks and behaves identically on the new device.* A fragmented chain that was merged on the old device is a visible failure of this goal — the player can see that something changed.

**Against exporting the threshold (resetting to default on import):**

The most common export scenario — especially once community config sharing exists — is not device migration. It's a veteran player sharing their config on Discord. That player has threshold=90 days; the new player importing it has never encountered the snooze collapsing feature. The inherited threshold means:

- The new player's chains are rendered with a 90-day gap threshold
- Short breaks (35 days) that would have correctly split into separate engagement runs are merged into one
- The new player's notification history reads as if they were a seasonal player even if they play weekly
- This doesn't break anything — but it subtly distorts how the new player reads their own history

Unlike inherited suppress flags (which actively prevent a toast from firing), an inherited threshold only affects rendering. The actual snooze events are still in the audit log. But the "wrong" threshold creates a mismatch between how the player experiences their engagement and how the chain represents it.

---

## The Options

### Option A — Threshold Travels with Notification Prefs (Same Category as Suppress)

**Mechanism:** The threshold value is stored alongside permanent-suppress flags in the `notificationPrefs` export blob. If suppress exports, threshold exports.

**Export format:**
```json
{
  "notificationPrefs": {
    "sampleSizeToast": { "permanentlySuppressed": true },
    "coverageScaleStale": { "permanentlySuppressed": false },
    "snoozeChain": {
      "gapThresholdDays": 90,
      "collapseEnabled": true
    }
  }
}
```

**Import behavior:** The threshold=90 is applied to the new device's notification display immediately on profile load. No separate prompt — it's treated identically to suppress flags, which also apply silently with only the opt-out [Review →] path at import.

**The clean case (Hamid migrating to new laptop):**
Hamid spent 30 minutes in Settings → Advanced figuring out that threshold=90 matches his seasonal engagement rhythm. On his new laptop, he drags in his `.rurobot` backup. Profile loads. He opens the notification panel. His single merged "Snoozed 14 times · Jan 10–Aug 6" chain is exactly what it was on his old machine. He never thinks about the threshold setting.

**The messy case (VortexArchitect sharing to Discord):**
VortexArchitect posts their config. Threshold=90 travels silently. A new daily player who imports the config and plays for three months straight has all their snooze history rendered as one continuous run — because threshold=90 means even a 35-day gap doesn't trigger a split. This is almost certainly correct even for a daily player (their gaps won't reach 35 days), but it's a non-default that the player never set and can't explain.

The bigger concern: when the daily player eventually takes their first real break (say, 45 days), the chain correctly doesn't split (threshold=90, so 45-day gap < 90-day threshold). The chain shows one continuous run with a 45-day internal date jump. For a daily player, this might feel like the split they expected *didn't* happen. They may find the chain misleading — their 45-day break looks like a normal gap in a continuous engagement.

**Arguments for:**
- Simplest implementation: threshold is just another field in the notification prefs blob
- Maximum migration fidelity: player's preferences restore exactly
- The threshold affects only display, not behavior — inheriting a "wrong" threshold has no game-mechanical consequences, only cosmetic ones
- Consistent with the established treatment of suppress flags (carry epistemic state, offer [Review →] opt-out)

**Arguments against:**
- Threshold is categorically different from suppress flags: suppress makes a claim about what the player knows; threshold makes a claim about how they engage with the game; the latter is more personal and more likely to be wrong when inherited
- The [Review →] path at import was designed to be used by players who are downloading a shared config, not migrating their own. A new player clicking [Review →] won't understand what "snooze run split threshold" means, and won't know whether 90 days is right for them
- Creates a template for all display preferences to travel by default — a decision that may generate unexpected behavior in future as more display prefs accumulate

**Verdict:** Correct for migration. Adequate but inelegant for sharing. Establishing "all notification prefs travel by default" as a template may be overly broad.

---

### Option B — Threshold is Display Preference; Exports Separately, Imports Differently

**Mechanism:** Create an explicit third blob in the export format: `displayPrefs`. This blob contains the gap threshold, sort order, and any other rendering-only settings. `displayPrefs` exports with the full profile but is handled differently at import.

**Export format:**
```json
{
  "gameData": { ... },
  "notificationPrefs": {
    "sampleSizeToast": { "permanentlySuppressed": true }
  },
  "displayPrefs": {
    "snoozeGapThresholdDays": 90,
    "auditLogSortOrder": "most-recent-first",
    "collapseEnabled": true,
    "collapseSizeThreshold": 4
  }
}
```

**Import behavior:**
- `gameData`: imports directly (no prompt)
- `notificationPrefs`: imports with [Review →] opt-out
- `displayPrefs`: imports with a **separate, distinct acknowledgment path**

The `displayPrefs` acknowledgment is lighter than the `notificationPrefs` [Review →]:

```
Display preferences from this profile:
  Snooze run split threshold: 90 days (your current: 30 days)
  Audit log sort order: most-recent-first (same)

Apply these? Applying won't affect how the game plays — only how your
notification history is displayed.

  [Apply display preferences]   [Keep my current settings]
```

Unlike `notificationPrefs`, the `displayPrefs` dialog **defaults to [Keep my current settings]** rather than applying. The rationale: display preferences are the most personal and least consequential category. The right default is "don't change your view without asking." For suppress flags, the right default is "carry over" because not carrying them causes visible friction. For display prefs, there's no visible friction either way.

**Arguments for:**
- Clean conceptual separation. Developers and players can reason about what each export blob means.
- The distinct import dialog teaches players what a display preference is vs. an epistemic state
- The "keep my current settings" default for display prefs reflects their lower stakes
- Extensible: as new display prefs are added to the game, the template is clear — they go in `displayPrefs`, they get the lightweight "apply/keep" dialog
- Community shares: a player downloading someone else's config will almost certainly click "Keep my current settings" because they don't want their display affected by a stranger's preferences; this is the correct default outcome

**Arguments against:**
- More complex export format (three blobs instead of two)
- Players who are migrating devices will see an extra dialog ("Apply display preferences?") that adds friction to what should be a seamless migration
- The distinction between "notification preference" and "display preference" may not be intuitive to players — both live in Settings, both concern how the game looks/behaves, both aren't "game data"
- The lightweight dialog ("Apply won't affect how the game plays") undersells the stakes for players who have carefully configured their display; to Hamid, threshold=90 matters a lot

**Verdict:** Conceptually cleanest. Correct long-term architecture. May be over-engineered for v1.0 when there is only one display preference (gap threshold) to manage.

---

### Option C — Threshold Never Travels; Re-Rendered Locally at Import

**Mechanism:** The threshold is not stored in the export at all. The export contains only raw event timestamps. The recipient's device always applies its own local threshold (defaulting to 30 days) when rendering the notification chain.

**Export format:**
```json
{
  "notificationPrefs": {
    "sampleSizeToast": {
      "permanentlySuppressed": true,
      "snoozeEvents": [
        { "timestamp": "2026-01-10T21:34:00Z", "type": "session_snooze" },
        { "timestamp": "2026-01-12T19:11:00Z", "type": "session_snooze" },
        ...
      ]
    }
  }
}
```

The chain is re-rendered fresh on each device using that device's threshold setting. If the player is migrating and their new device has threshold=30, their chain splits. Their old threshold (90) does not migrate.

**The logic:** The threshold controls how raw event data is *displayed*. It is no more part of the data than a column width setting or a color theme. You don't export your browser's font size when you export a bookmark list. You don't export your terminal's color scheme when you export your bash history.

**Arguments for:**
- Cleanest possible export format: only data, no rendering preferences
- No possibility of inherited threshold confusing the recipient of a shared config
- For migration, the player re-sets threshold once in Advanced Settings — a one-minute task they already know how to do if they configured it before
- The event timestamps are the canonical record; the threshold is an interpretation layer that should stay local

**Arguments against:**
- For device migration, this forces the player to remember and re-apply a non-obvious Advanced Settings change
- A player who migrates and doesn't remember their threshold setting (or doesn't know it exists) will see their chains differently than on their old device — a visible inconsistency that feels like data loss even though it isn't
- The principle "re-set display preferences once" is reasonable for common settings (sort order, dark mode) but the gap threshold is obscure enough that most players won't know to look for it

**The iCalendar analogy:**
This option is structurally identical to how iCalendar (.ics) files handle timezones: events are stored in UTC (absolute timestamps), and display timezone is always local. When you import a meeting from someone else's .ics file, you see it in your local timezone, not theirs. This is correct behavior for sharing. For migration (your own data), it creates the one-time annoyance of verifying your timezone settings on the new device.

**Verdict:** Architecturally pure. The right mental model for "data vs. rendering." One-time re-configuration cost at migration is acceptable. Recommended for Phase 1 if simplicity is paramount.

---

### Option D — Threshold Travels as Advisory (Suggestion at Import)

**Mechanism:** The threshold value is embedded in the export as metadata. At import, if the exported threshold differs from the recipient device's current threshold, a one-line contextual suggestion appears in the notification audit log (not in the import dialog — in the audit log itself, when the player first opens it).

**The suggestion appears inline in the chain, identically to the "N days passed · Settings → Advanced" annotation from Option A of the parent analysis (4.69e-i-a-i-f-i-α):**

```
• Timeline (rendered at your local threshold: 30 days)
Oct 5  — First encounter (toast fired)
         ▶ Snoozed 6 times · Oct 5–Nov 18   [expand]
         ↳ 76 days passed  ·  Settings → Notifications → Advanced to adjust
         ▶ Snoozed 8 times · Feb 2–Feb 24   [expand]
Feb 28 — Permanently suppressed by player action

  ╌╌ Original profile used 90-day threshold. Apply? [Yes, apply 90d →] ╌╌
```

The suggestion appears exactly once (dismissed permanently after first decision). Clicking "Yes, apply 90d →" changes the local threshold to 90 and re-renders the chain. Ignoring the suggestion (it doesn't auto-dismiss — requires explicit close or action) leaves the local threshold at 30.

**Arguments for:**
- The threshold travels as information, not as a command
- Migration player: one click applies threshold. More discoverable than "re-configure Advanced Settings from scratch."
- Sharing recipient: ignores the suggestion (their chain doesn't look wrong because the suggestion's location is within a context that explains itself — they see the 76-day gap annotation and the original-profile note simultaneously)
- The suggestion is contextual and single-appearance — it's the Option E pattern from the parent analysis, but applied specifically to the migration context

**Arguments against:**
- Adds yet another inline prompt variant to the chain display. The chain has: event rows, collapsed summary rows, gap annotations, and now migration threshold suggestions. Each is a conditional element; the chain's rendering code grows in complexity.
- The migration player may not even open the notification audit log immediately after migration — they go straight to workbench. The suggestion fires in a panel they didn't open, at a time they weren't expecting it.
- "Original profile used 90-day threshold" language may confuse a recipient who doesn't know this is someone else's exported profile — they may think the suggestion is a system recommendation

**Verdict:** Elegant in theory; adds chain complexity. The right insight (threshold as advisory data, not command data) is implemented more cleanly in Option B's explicit `displayPrefs` blob.

---

## The Calendar Model: A Reference Design

All four options orbit one design principle, and the iCalendar specification provides a concrete prior art resolution.

**How .ics files handle the analogous problem:**

An iCalendar event has:
```
DTSTART;TZID=America/Los_Angeles:20260314T090000
VTIMEZONE component (optional, embedded)
```

The `TZID` is a rendering hint: "this event was created in Pacific Time." The `VTIMEZONE` component optionally embeds the full timezone definition so the recipient's calendar app doesn't need to look it up. When you import someone else's calendar event:
- The event time is stored as an absolute moment (UTC-equivalent)
- The recipient's app renders it in their local timezone by default
- The original creator's timezone is preserved as metadata but doesn't override local rendering
- The recipient can "apply original timezone" if they explicitly want to view it as the creator saw it

This is **Option D's structure**, but applied to timezone rather than threshold. The iCalendar community considered "timezone as advisory, not command" for 30 years and it works.

**Applied to gap threshold:**

```
SNOOZE_CHAIN_THRESHOLD: 90d   (advisory metadata in export)
```

The import renders using local threshold (30 days default). The advisory metadata is available for display in the audit log ("original author used 90d"). Clicking through applies the advisory value.

---

## Recommendation: Phased Implementation Following the Three-Category Model

The core insight from this analysis: the export format needs to distinguish three categories of data, and the gap threshold is the first concrete element that forces this distinction.

**Phase 1 — Two-blob format, threshold in displayPrefs, carries silently for migration:**

```json
{
  "formatVersion": "1.0",
  "gameData": { "matchHistory": [...], "careerStats": {...}, "agentConfigs": [...] },
  "notificationPrefs": {
    "sampleSizeToast": { "permanentlySuppressed": true },
    "coverageScaleStale": { "permanentlySuppressed": false }
  },
  "displayPrefs": {
    "snoozeGapThresholdDays": 90
  }
}
```

At import:
- `gameData` imports silently
- `notificationPrefs` imports with existing [Review →] opt-out path (established in 4.69e-i-a-i)
- `displayPrefs` imports **silently for full career migration**, with a footnote in the import confirmation: *"Display preferences (including snooze history layout): restored from backup."* No additional dialog. No separate prompt.

The rationale for silent `displayPrefs` import (no prompt): display preferences are low stakes, and the player who is migrating their own career wants seamless restoration. Adding a dialog for display prefs on top of the existing dialog for notification prefs is compounding friction without proportionate benefit.

**Phase 2 — When config-sharing flow exists:**

When the game adds a formal config-sharing export mode (distinct from full career export), that flow's format strips `displayPrefs` entirely:

```json
{
  "formatVersion": "1.0",
  "exportType": "config",
  "gameData": {
    "agentConfigs": [...]  // Only agent configurations, not match history
  }
  // notificationPrefs: absent
  // displayPrefs: absent
}
```

The mechanical distinction between export types (career migration vs. config share) resolves the threshold inheritance problem at the source: config shares simply never contain display preferences.

**Phase 3 — Display preferences dialog:**

If players accumulate multiple display preferences (threshold, sort order, collapse thresholds, animation speeds, panel layouts), the import flow adds a lightweight `displayPrefs` review panel — separate from the `notificationPrefs` review — that shows a diff between the imported display settings and local settings with per-preference [Apply] / [Keep local] toggles.

---

## Player Journeys

#### Journey: Hamid, 41, Seasonal Gamer — The Seamless Migration

**Context:** Hamid spent 30 minutes in a previous session (documented in 4.69e-i-a-i-f-i-α) setting his gap threshold to 90 days. His chains now show clean merged runs that match his seasonal engagement. He's migrating to a new laptop. His old `.rurobot` backup file was created three days ago.

**Minute 0:00 — Import on New Machine**
Hamid drags `hamid_main_backup.rurobot` onto the game's import zone.

The amber overlay spreads from the drop zone. Profile preview card fades in:
```
Hamid_Main
412 matches · B+ · Last backed up 3 days ago
[Import Profile]
```

Below the card, in muted secondary text at 10px:
*"Career data, 1 notification permanently suppressed, display preferences: restored from backup."*

Hamid reads "display preferences: restored from backup." He doesn't fully know what this means, but it sounds right. He clicks `[Import Profile]`.

**Minute 0:30 — Opening Notification Panel**
Profile loaded. Hamid navigates to Settings → Notifications to verify his sample-size suppress is still active.

He opens the notification panel. He sees:

```
• Timeline
Jan 10 — First encounter (toast fired)
         ▶ Snoozed 14 times · Jan 10–Aug 6   [expand]
Aug 12 — Permanently suppressed by player action
```

One run. 14 merged snoozes. Exactly as it was on his old machine.

He feels nothing — and feeling nothing is the right outcome. The migration was invisible.

He clicks through to the Advanced settings out of curiosity. The threshold shows:
```
Snooze run split threshold: 90 days ◉
```

His setting. His value. Right where he put it.

**Minute 1:00 — Return to Play**
Hamid opens the workbench. He hasn't thought about notification state since the import confirmation. He's thinking about his Season 3 config. The migration was a three-minute operational task that didn't interrupt his mental model of the game.

**UI Annotations:**
- Import confirmation footnote text: 10px, #888, single line; "display preferences" links to an inline drawer listing the preferences and their values with [Review] toggle; the drawer defaults closed
- The threshold restoration produces no animation, no toast, no confirmation — the preference is just applied as part of loading the profile
- Advanced Settings panel after migration: threshold selector shows 90 days selected; no "imported" badge or migration indicator — the preference is now local state, not imported metadata

---

#### Journey: Yusra, 24, Competitive Player — Inheriting a Stranger's Threshold via Community Download

**Context:** Yusra has been playing Robot Uprising for six weeks. She plays every day, sometimes twice a day. She found a config on the community Discord from a top-ranked player ("IronCortex_7") labeled "Gauntlet S5 — Penetrating Strike Composition." She's downloading it to study the agent structure.

IronCortex_7 plays Robot Uprising in long tournament sprints — two weeks intense, then two months off. His threshold is set to 90 days. He exported a full career profile to share his config (because the game doesn't yet have a dedicated config-share flow in Phase 1).

**Minute 0:00 — Import of IronCortex's Config**
Yusra imports the `.rurobot` file into a new temporary profile she names "IronStudy."

Import confirmation:
```
IronCortex_7 · 891 matches · A tier
[Import Profile]
```
Below: *"Career data, 4 notifications permanently suppressed, display preferences: restored from backup."*

Yusra clicks `[Import Profile]`. She doesn't read the footnote carefully — she's here for the config.

**Minute 2:00 — Opening Notification Panel (by accident)**
While navigating the menus to find the workbench, Yusra accidentally opens Settings → Notifications.

She sees the sample-size warning chain for IronCortex's profile:
```
• Timeline
Apr 3  — First encounter (toast fired)
         ▶ Snoozed 22 times · Apr 3–Nov 14   [expand]
Nov 20 — Permanently suppressed by player action
```

Yusra stares at this. 22 snoozes across 7 months — that's one snooze roughly every 10 days. But the single merged run doesn't look weird to her; it looks like "someone who took a long time to commit." The 90-day threshold is invisible to her. She's never set a threshold and doesn't know the feature exists.

**Minute 3:00 — Her Own Profile, Three Weeks Later**
Yusra switches back to her main profile ("Yusra_main") to check her own notification history. She's been playing daily for 8 weeks and has no gaps > 30 days.

Her chain:
```
• Timeline
Week 1 — First encounter (toast fired)
          ▶ Snoozed 11 times · Week 1–Week 6   [expand]
Week 6 — Permanently suppressed by player action
```

One run, 11 snoozes, 5-week span. The 30-day default never fired (her longest gap is 7 days). Her chain looks clean. Her profile's display prefs were never touched.

**The consequence of the inherited threshold:**
The threshold=90 on the IronStudy profile has zero effect on Yusra's main profile. The IronStudy profile's threshold=90 is contained within that profile's display preferences. If Yusra plays matches through the IronStudy profile (unlikely but possible), her snooze chains on that profile would render at 90 days — correct for IronCortex's engagement pattern, potentially misleading for Yusra's. But IronStudy is a reference profile, not a play profile; she won't accumulate snooze events on it.

**What Yusra never notices:** The threshold inheritance happened. It is contained in a profile she uses for reference only. It had no effect on her main career. The design worked as intended: per-profile isolation means display preferences are scoped to the profile where they were set, and the profile was used as a read-only reference.

**What could go wrong:** If Yusra imported IronCortex's config directly into her main profile (overwriting her career data — a destructive import), her threshold would become 90 days. Her 7-day snooze gaps would no longer split (they're well under 90 days anyway), so this would be harmless in practice. But semantically, her main profile would carry IronCortex's engagement preferences. This is the argument for the Phase 2 config-share flow: allow importing just agent configurations without any career data or display prefs.

**UI Annotations:**
- Profile import UI should make clear whether a full career import or a config-only import is happening; in Phase 1, there's only one import mode — the footnote "career data, notifications, display preferences" is the signal that a full career is being imported
- The imported profile's threshold is never shown unless the player navigates to Advanced Settings; it's not surfaced in the notification audit log chain unless a chain actually splits (which won't happen for IronCortex's chains at threshold=90)

---

#### Journey: Daniela, 37, Accessibility-First Player — Discovering the Three-Category Split

**Context:** Daniela is beta-testing Robot Uprising for a disability advocacy organization. She's specifically looking for friction in the export/import flow for players who use assistive technology or who play on shared devices. She imports a profile exported by another tester and pays close attention to what changes.

**Minute 0:00 — Examining the Import Confirmation**
She imports a test profile. The confirmation shows:

```
TestAccount_Beta · 144 matches · C+ tier
[Import Profile]
```
Footnote: *"Career data, 2 notifications permanently suppressed, display preferences: restored from backup."*

Daniela reads the footnote carefully. She clicks the underlined "display preferences" link to see what's being restored.

**The drawer opens:**
```
DISPLAY PREFERENCES — from imported profile
──────────────────────────────────────────────
  Snooze run split threshold:  90 days  (your current: 30 days)
  Audit log sort order:  most-recent-first  (same)

These affect how your notification history is displayed.
[Review individual preferences →]
──────────────────────────────────────────────
```

Daniela reads: "Snooze run split threshold: 90 days." She doesn't know what this means.

**Minute 1:00 — Following the Help Path**
She clicks `[Review individual preferences →]`. The drawer expands to show:

```
Snooze run split threshold
Value being imported: 90 days
Your current setting: 30 days (default)

This setting controls how gaps between notification snooze events are
displayed in your notification history. A longer threshold merges more
snooze events into a single period; a shorter threshold shows them as
separate engagement periods.

[Apply 90 days]   [Keep 30 days (default)]   [Learn more →]
```

Daniela clicks "Keep 30 days (default)." She's not a seasonal player and doesn't know what 90 days would mean for her history.

**What this journey reveals:** The drawer-within-confirmation pattern — where the footnote links to an optional review — is the right accessibility model. The default behavior (apply everything silently) works for the majority of players (Hamid, who wants seamless migration). The opt-out path (Daniela, who reads carefully) provides full transparency and control without blocking the fast path.

**What Daniela reports to the advocacy org:**
- The import confirmation footnote uses "display preferences" language — she recommends that this be changed to "layout settings" or "appearance settings," which are more universally understood terms outside of software engineering contexts
- The [Review →] path is available but requires two clicks to reach individual controls; one-click access to the threshold review specifically (since it's the only divergent display preference in this import) would be cleaner
- The "Learn more →" link in the expanded preference review should open an in-game tooltip, not the documentation website — players who use screen readers have better in-game tooltip support than browser-to-website navigation

**UI Annotations:**
- The display preferences drawer within the import confirmation: renders as a collapsible section below the notification prefs note (which itself is collapsible); two collapsible sections in an import dialog is complex — consider consolidating into a single "preferences" section
- The `[Review individual preferences →]` expansion: uses progressive disclosure within the drawer; the per-preference view shows a simple table with "imported value" and "your current value" columns; divergent values are highlighted in amber; identical values are dimmed
- The preference name "Snooze run split threshold" should be accompanied by a one-line plain-language description even in the unexpanded drawer view; showing the raw setting name without context is opaque to accessibility-first players
- Screen reader order: the import confirmation should read: profile name, match count, grade, import button (primary action), then footnote text (supplementary info); accessibility-first design requires the primary action to be announced before supplementary details

---

## Strengths and Weaknesses

| Option | Strengths | Weaknesses | Best For |
|--------|-----------|------------|----------|
| **A — Threshold with notif prefs** | Simple; max fidelity; one export blob | Conflates display prefs with notification state; wrong template for future prefs | v1.0 if simplicity wins |
| **B — Explicit displayPrefs blob** | Clean architecture; correct long-term model; extensible | Adds import dialog complexity; third-blob distinction not obvious to players | v2.0 foundation |
| **C — Threshold never travels** | Purest data/rendering separation; no inheritance risk | One-time re-configuration cost on migration; invisible inconsistency until noticed | When config sharing is primary use case |
| **D — Advisory metadata** | Advisory matches iCalendar precedent; contextual suggestion | Adds yet another chain annotation variant; suggestion timing is awkward | If chain annotations become first-class navigation |
| **Phased B (recommended)** | Correct architecture from Phase 1; silent for migration (no friction); explicit for sharing; extensible | Two-phase ship requires planning; Phase 1 silent import may confuse players who expect a dialog | v1.0 + v2.0 long-term |

---

## Interaction Effects

**4.69e-i-a-i — Notification state in profile export:**
This analysis establishes a third export category (`displayPrefs`) alongside the two categories in 4.69e-i-a-i (`gameData` and `notificationPrefs`). The threshold export policy should be specified in the same section of the export format documentation as the suppress flag policy — players reading about what exports should see both explained together.

**4.69e-i-a-i-f-i-ε — Snooze collapsing in export artifacts:**
That aspect addresses whether the export contains raw individual snooze events or pre-collapsed run summaries. This aspect assumes raw events (correct — always export lossless event data). The threshold does not affect what is exported; it affects how the imported events are rendered. The two decisions are independent: export raw events (4.69e-i-a-i-f-i-ε), and also export the threshold that was used for display (this aspect). On import, apply threshold to re-render the raw events.

**4.69e-i-a-i-f-i-α-iii — Community-shared chains and threshold normalization:**
That sibling aspect asks: when exporting a chain screenshot for community sharing, should it be rendered at the player's personal threshold or the default 30-day threshold? This aspect asks the same question about the export file format. The answer aligns: community share exports should normalize to default threshold (or strip display prefs entirely). The Phase 2 config-share flow addresses both aspects simultaneously by stripping all display prefs.

**4.69e-i-a-i-f-i-α-ii — Threshold preview before confirming:**
If the player can preview how their chains look at a given threshold before confirming the setting, this preview operates on locally-stored event data using the candidate threshold value. The threshold in the export file is separate from this preview mechanism — import happens first, preview happens after. The sequencing matters: a player who imports threshold=90 and then uses the preview to explore "what would 30 days look like?" is working with imported state, not their original local state.

**4.69e-i-a-vi-a-iii — Profile creation inherits notification prefs:**
That aspect explores whether new profile creation inherits prefs from the current profile. The conclusion there leaned against inheritance (new profiles should get fresh starts). This aspect's three-category model supports that conclusion: a new profile getting `gameData` (none — new profile), `notificationPrefs` (reset to defaults), and `displayPrefs` (reset to defaults) is the clean initialization. Display prefs, like notification prefs, are earned through use — a new profile hasn't earned any particular threshold preference.

**4.69e-i-a-i-f-i-δ — "Collapse snooze events in all notifications" global setting:**
The collapse toggle (always/N≥4/never) is another display preference that should live in the `displayPrefs` blob. It travels with the same rules as the threshold: silently on migration, stripped on config share. The collapse toggle and threshold are functionally related (both affect snooze chain display) and should appear together in the `displayPrefs` blob and in the import drawer review.

---

## Comparable Games / Design Patterns

**iCalendar (RFC 5545) — Timezone as Advisory Metadata:**
The canonical example. An .ics file stores event times as UTC-anchored absolute moments. A `VTIMEZONE` component can optionally embed the creator's timezone definition. Calendar apps honor the embedded timezone when rendering "native" calendar entries but apply local timezone for imported entries. The threshold/display-preference parallel: store events as absolute data, carry the original rendering preference as advisory metadata, default to local rendering on import. The iCalendar resolution is 25 years old and works correctly in all major calendar apps. Robot Uprising's threshold export should follow this precedent.

**VS Code — Settings Sync:**
VS Code separates "user settings" (preferences that should follow you across machines, synced via Settings Sync) from "workspace settings" (preferences scoped to a specific project). The user settings/workspace settings distinction maps cleanly to `displayPrefs` vs. `gameData`. Settings Sync carries user settings across devices silently; workspace settings stay with the workspace (project/profile). The gap threshold is a "user setting" — it should follow the player across devices because it reflects their personal engagement rhythm.

**Obsidian — Community Themes:**
When you install a community theme in Obsidian, the theme is applied to your vault's visual rendering. If you share your vault with someone (e.g., for a knowledge-base template), the theme is typically stripped — the vault ships with no theme, and the recipient applies their own. This is the Phase 2 config-share behavior: strip all display preferences (themes, threshold values) when creating a share artifact. The share artifact contains only data; display is always local.

**Git — `.gitattributes` vs. `.gitignore`:**
`.gitattributes` travels with the repository (it's committed data that affects how git processes files). `.gitignore` is traditionally committed but can also be local-only (`.git/info/exclude`). The distinction: `.gitattributes` is data that affects how the repository is used by *everyone* (line endings, diff rendering). `.gitignore` can be personal. The gap threshold is more like a local `.gitignore` exclusion than a committed `.gitattributes` rule — it's personal, it affects only your view, and it shouldn't be assumed to be correct for others.

**Adobe Photoshop — Action Recordings:**
Photoshop "Actions" record a sequence of operations that can be replayed. When an Action is recorded with specific display preferences (ruler units in pixels vs. mm), those preferences are embedded in the Action and applied when the Action runs. Recipients who run the Action may find their ruler preference changed unexpectedly. This is the failure mode of Option A (threshold travels silently with notification prefs): a preference that was correct for the creator changes the recipient's environment without announcement. Photoshop's solution: "Action-specific" overrides are highlighted in the Action panel as potential environment changes before running.

---

## Sensory Description

**The Export File: Invisible Until Needed**

A `.rurobot` export file sits on the filesystem as a dull grey rectangle with a small robot-head icon. It does not glow, pulse, or indicate that inside it are three distinct categories of player identity: their battle record, their knowledge state, their display habits.

When dragged onto the import zone, the file becomes alive: the amber overlay, the hum, the profile card. But the three-category structure is only visible if the player opens the review drawer.

**The Display Preferences Drawer: Surgical and Quiet**

The review drawer for display preferences is not the amber pulsing language of "reliability warning" or the gold diamond of "decisive pivot." It is typeset in 11px primary-text color on a slightly indented background. It has the visual register of a settings panel, not a notification.

The threshold row reads:
```
  Snooze gap threshold  →  90 days  (was 30 days on this device)
```

The arrow (→) communicates direction of change: this value is being updated. The parenthetical "(was 30 days on this device)" is in #888 italic, tertiary text. The whole row fits in 28px height. It looks like a diff, not an announcement.

If all display preferences match (no changes needed), the entire "display preferences" section collapses:
```
Display preferences: ✓ no changes from your current settings
```

A small green checkmark (12px), muted text (10px). The checkmark is the only color in the line. For the majority of migration imports (where the player never changed any display preference on the old device, so threshold=30 matches both), this is all that appears. The message: "nothing to see here."

**The Threshold After Import: Already Indistinguishable from Local**

Once the threshold has been applied from the import, it is local state. There is no "imported from backup" badge in the Advanced Settings panel — no provenance metadata for display preferences (unlike the suppression dates in the audit log, which carry import provenance as established in 4.69e-i-a-i-a).

This is intentional. Display preferences are preferences — they belong to the player now. The migration brought them here; they are now local. The player who checks Advanced Settings a week after migration should see:

```
Snooze run split threshold: 90 days ◉
```

Not:
```
Snooze run split threshold: 90 days ◉  [Imported Feb 14]
```

The import timestamp is relevant for epistemic notification state (suppress flags — the player might want to audit when they decided to suppress something). It is not relevant for display preferences — there is no question of "when did I decide to display at 90 days?" that the import timestamp helps answer.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A — Display preferences as a general export category: the full list of what belongs in `displayPrefs` blob.** This analysis identified the threshold as the first display preference requiring an export policy, but the `displayPrefs` blob will eventually contain: sort order, collapse enabled/disabled, collapse size threshold, animation speed preferences, panel layout states. A complete inventory of what qualifies as a "display preference" vs. a "notification preference" vs. "game data" needs specification. Edge cases: is the audit log sort order a display preference (affects rendering, not data) or a notification preference (affects how you interact with notification history)? The three-category model needs a decision rule for ambiguous entries.

- **4.69e-i-a-i-f-i-α-i-B — Version compatibility for display preferences export:** The `displayPrefs` blob includes a threshold value ("90 days"). If a future version of Robot Uprising changes the valid range for the threshold (e.g., adds support for values > 365 days, or introduces new units), what happens when an old export file with `gapThresholdDays: 90` is imported into a new version? The export format needs a `formatVersion` field and a migration path for display preference values that become invalid or change meaning across versions. The threshold is currently a simple integer (days); if it becomes a more complex data structure in a future version, backward compatibility requires explicit handling.

- **4.69e-i-a-i-f-i-α-i-C — "Display preferences" label clarity for non-technical players:** The term "display preferences" is technical. Player testing should evaluate whether "layout settings," "appearance settings," or "how your history looks" communicates the same concept more accessibly. The label appears in the import confirmation footnote (primary exposure), the review drawer header (secondary exposure), and the Settings panel section name (tertiary exposure). All three should use consistent language, and the language should be chosen by user research, not developer preference.

- **4.69e-i-a-i-f-i-α-i-D — Multi-profile import and display preference isolation:** If a player has three profiles on their device (Main, Study, Tournament), each with different display preferences, and they export all three to a new device, each profile should import with its own display preferences — isolated from each other. This is a correctness requirement, not an open design question, but it needs to be explicitly tested and specified: the `displayPrefs` blob is profile-scoped, not device-scoped, and import applies each profile's display prefs only to that profile.

- **4.69e-i-a-i-f-i-α-i-E — Threshold normalization as a one-click export action:** Separately from the Phase 2 config-share flow, a player who wants to share a notification chain screenshot (or a chain export artifact) may want to re-render their chain at the default 30-day threshold before sharing, so community viewers can compare it to their own chains. A "normalize to default threshold" one-click action in the notification panel — separate from changing the actual threshold setting — would produce a view that the player can screenshot/export without permanently changing their display preference. This addresses 4.69e-i-a-i-f-i-α-iii (community-shared chains and threshold normalization) at the chain-display level rather than the export-file level.

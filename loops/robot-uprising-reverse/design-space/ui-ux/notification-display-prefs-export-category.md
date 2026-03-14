# Display Preferences as a General Export Category

**Aspect:** 4.69e-i-a-i-f-i-α-i-A — Display preferences as a general export category: complete inventory of what belongs in `displayPrefs` blob; decision rule for ambiguous entries (sort order: display or notification pref?); edge cases at the category boundary

**Parent:** 4.69e-i-a-i-f-i-α-i — Multi-threshold export format (established the three-category export model)
**Grandparent chain:** 4.69e-i-a-i-f-i-α → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i — Multi-threshold export format (founding member of displayPrefs: gap threshold)
- 4.69e-i-a-i-f — Audit log ordering policy (audit log sort order is a displayPref candidate)
- 4.69e-i-a-i-f-i — Snooze event collapsing (collapse threshold is a displayPref)
- 4.69e-i-a-i — Notification state in profile export (notificationPrefs category)
- 4.69e-i-a-i-f-i-α-i-B — Version compatibility for displayPrefs (sibling)
- 4.69e-i-a-i-f-i-α-i-C — Label clarity for non-technical players (sibling)
- 4.69e-i-a-i-f-i-α-i-D — Multi-profile import and displayPrefs isolation (sibling)

---

## The Problem: A Category Needs Its Boundaries

The previous analysis (4.69e-i-a-i-f-i-α-i) established the three-category export model for Robot Uprising profile exports:

| Category | What it contains | Export behavior |
|----------|-----------------|-----------------|
| `gameData` | Career stats, match history, workbench configs, progress, unlocks | Always exports |
| `notificationPrefs` | Permanent suppress flags for individual notifications | Exports with `[Review →]` opt-out affordance |
| `displayPrefs` | How existing data is rendered/displayed | Exports silently for migration; stripped for config-share |

The gap threshold (how many days of silence between snooze events before the collapsing algorithm splits them into separate runs) became the founding member of `displayPrefs`. But the category was defined by one example, not a principle.

This analysis answers: **what else belongs in `displayPrefs`, and how do you decide when something new comes along?**

---

## The Decision Rule

### The Three-Part Test

A setting belongs in `displayPrefs` if it passes all three:

**1. The Rendering-Only Test:** Changing this setting never alters what underlying data is stored, computed, or considered. It changes only how existing data is presented. The underlying events, states, and records are identical whether the setting is on or off.

**2. The Re-Configuration Test:** If a player loses this setting (e.g., imports a profile without it), the cost is a one-time manual re-configuration — not data loss, not corrupted progress, not missed notifications. The player can be back to their preferred state in under 30 seconds.

**3. The Expectation Test:** A player migrating from Device A to Device B would be **pleasantly surprised** to find this setting carried over ("Oh nice, my display is already configured"), not **unsettled** by it ("Wait, why does my new device already know I had this expanded? That's weird").

Settings that fail **Test 1** belong in `gameData` (they affect computation, not just rendering).
Settings that fail **Test 3** are device-specific state and should **not travel at all**.

### The Distinguishing Questions

When a setting is ambiguous, ask:
- **Does changing it change which records are fetched/computed, or just how they're displayed?** → If it changes fetch/compute: `gameData`. If display only: `displayPrefs`.
- **Would a player be surprised if this setting persisted across a fresh install?** → If yes (device-specific): don't export. If no (personal preference): `displayPrefs`.
- **Is this setting about "what the player has decided about the game's content" or "how the player likes to look at things"?** → Decided about content: could be `notificationPrefs` or `gameData`. Aesthetic preference: `displayPrefs`.

---

## Complete Inventory

### Tier 1: Confirmed `displayPrefs` Members

These clearly pass all three tests. Every one of these should travel silently with profile migration.

#### Audit Log Display

| Setting | Description | Default |
|---------|-------------|---------|
| `auditLog.sortOrder` | MRF vs. chronological for the outer notification list | `mostRecentFirst` |
| `auditLog.provenanceChainOrder` | Chronological vs. MRF for inner provenance chains | `chronological` |
| `auditLog.snoozeCollapseThreshold` | N snooze events in a run before auto-collapse triggers | `4` |
| `auditLog.snoozeCollapseGapDays` | Silence gap in days before snooze run is split | `30` |
| `auditLog.defaultExpansionState` | Whether notification history panel opens expanded or collapsed | `collapsed` |
| `auditLog.showOnlySignificantEventsDefault` | Default state of the "significant events only" filter | `false` |

#### Replay & Debrief Display

| Setting | Description | Default |
|---------|-------------|---------|
| `replay.defaultPlaybackSpeed` | Starting playback speed multiplier | `1.0x` |
| `replay.showProbehookAnnotations` | Whether probe hook results are overlaid on replay by default | `true` |
| `replay.showSignalGenealogy` | Whether signal genealogy panel is open by default during replay | `false` |
| `replay.falseAivotAnnotationsVisible` | Whether the gold diamond and grey markers are shown by default | `true` |
| `debrief.defaultTab` | Which tab opens first in the debrief screen (`overview` / `analysis` / `history`) | `overview` |
| `debrief.edtTrajectoryWindowSize` | How many matches are shown in the EDT trajectory graph | `30` |
| `debrief.fixExplorerMode` | Default mode for the Minimum Fix Explorer (`quick` / `thorough`) | `quick` |

#### Workbench Display

| Setting | Description | Default |
|---------|-------------|---------|
| `workbench.bufferVisualizationStyle` | How the agent context buffer is rendered (`thermometer` / `slots` / `number` / `heatmap`) | `thermometer` |
| `workbench.hookConnectionLineStyle` | Visual style for hook connection lines (`bezier` / `straight` / `elbow`) | `bezier` |
| `workbench.showBufferFillPercentLabel` | Whether the numeric percentage is shown alongside the thermometer | `false` |
| `workbench.agentLabelVerbosity` | How much text appears on agent nodes (`icon-only` / `short` / `full`) | `short` |
| `workbench.gridSnap` | Whether dragging elements snaps to grid | `true` |

#### Global Display

| Setting | Description | Default |
|---------|-------------|---------|
| `global.colorTheme` | Light / dark / system-default | `systemDefault` |
| `global.animationIntensity` | Full / reduced / none (accessibility) | `full` |
| `global.fontScale` | Text scaling factor | `1.0` |
| `global.uiDensity` | Compact / comfortable / spacious | `comfortable` |
| `global.numberFormat` | Locale-style number formatting (1,234 vs. 1.234 vs. 1 234) | inferred from locale |

### Tier 2: Ambiguous Entries — Resolved

These are settings that initially seem ambiguous but resolve cleanly with the three-part test.

#### Career History Sort Order

**Question:** If the player has sorted their career match history by "EDT descending" instead of the default "date descending," is that a display preference or game state?

**Resolution:** `displayPrefs`. The underlying match records are identical. Changing the sort order changes what's prominent on screen but nothing about the data. The player can re-sort in two clicks if it doesn't carry. Passes all three tests.

**One nuance:** A sort preference *combined with a filter* (e.g., "show only Gauntlet matches, sorted by EDT") is still displayPrefs — the filter is a display instruction, not a fetch instruction (since all matches are stored locally in the no-backend architecture).

#### Debrief Panel Sizes / Layout Proportions

**Question:** If the player has dragged the debrief's side panel to 40% width instead of 30%, is that a display preference?

**Resolution:** `displayPrefs`, but **only if the preference is profile-level, not device-level**. Panel widths are tricky — on a laptop, 40% might be ideal; on a wider monitor, 30% might look better. The display preference should be stored as a **fraction**, not a pixel value, so it adapts. If stored as fraction, it qualifies as displayPrefs. If stored as pixel value, it's device-specific and should **not travel**.

**Decision rule clarification:** Any layout preference expressed as an absolute pixel value is device-specific and must not be included in `displayPrefs`.

#### Probe Hook Annotation Visibility

**Question:** Probe hook annotations show which agents emitted signals at which ticks. Toggling them off hides diagnostic information. Is that a display pref or does hiding it affect "what the player sees of the game content"?

**Resolution:** `displayPrefs`. The annotations are an optional overlay on top of the match events. The underlying match still happened the same way. The annotations can be re-enabled in one click. Passes all three tests. The fact that hiding it makes diagnostics harder is not relevant — the underlying data is intact.

**Contrast with:** The probe hook itself being added to the config is `gameData` — it changes what data is recorded. The visibility toggle for the annotation of that data is `displayPrefs`.

#### "Advanced Debrief Mode" Enabled State

**Question:** The player unlocked "Advanced Debrief Mode" (a progression unlock). They've toggled it on. Is the toggle state game data or display preference?

**Resolution:** The **unlock** is `gameData`. The **toggle state** (whether advanced mode is currently active) is `displayPrefs`. These travel separately. On import: the unlock travels in `gameData`, the toggle state travels in `displayPrefs`. If the imported profile didn't have the unlock but has the toggle set to `true`, the game renders advanced mode as `disabled` until unlocked — the toggle state is "remembered" but dormant.

#### Notification Summary Verbosity

**Question:** A player has changed the notification summary header from verbose ("You have 3 new notifications requiring attention") to terse ("3 notifications"). Display pref?

**Resolution:** `notificationPrefs`, not `displayPrefs`. This feels like a display preference but it changes **what the player considers noteworthy about their notification state** — it's a preference about the notification system's communication with them, not about how game data is rendered. The distinction: verbosity level is a communication preference (belongs with other notification preferences), while audit log sort order is a data presentation preference (display).

**The test that distinguishes them:** Is the preference about *how game data is visualized*, or about *how the game communicates with the player*? The former is `displayPrefs`; the latter is `notificationPrefs`.

### Tier 3: Not `displayPrefs` — Where They Actually Belong

These are settings that might seem like display preferences but aren't.

| Setting | Might Seem Like | Actually Belongs In | Why |
|---------|----------------|--------------------|----|
| Permanent suppress flags | Display (hiding a notification) | `notificationPrefs` | Epistemic state: player's claim about their knowledge |
| Career filter presets (saved "Gauntlet vs. Omega_9 only") | Display (filter is a view) | `gameData` | Saved filter = named artifact the player created; has identity, can be shared |
| Unlocked advanced features toggle state | Display (show/hide mode) | `displayPrefs` (toggle) + `gameData` (unlock) | Separated (see above) |
| Workbench layout save states | Display (panel arrangement) | `gameData` if named, `displayPrefs` if unnamed default | Named saves are artifacts; unnamed default layout is a preference |
| Tutorial completion markers | Not display-related | `gameData` | Affects what content appears; failure to carry = re-triggering tutorials on migration |
| "I've seen the onboarding modal for X" | Display (hides modal) | `gameData` (specifically: `tutorialState`) | Same as above — triggers content display, not style |

---

## Edge Cases at the Category Boundary

### The Accessibility Settings Problem

Colorblind modes, reduced motion, font scaling, and high-contrast themes feel like "preferences" but for many players they are **requirements**. A player who needs reduced motion and migrates without that setting carrying over isn't mildly inconvenienced — they're hit with a seizure risk trigger on first launch.

**Design implication:** Accessibility settings belong in `displayPrefs` AND get elevated treatment in the import flow. Other `displayPrefs` are imported silently. Accessibility settings should be imported silently AND confirmed with a specific notification: "Your accessibility settings have been restored." This is not an opt-out scenario.

**Practical difference:**
- Regular `displayPrefs`: import silently with a footnote in the confirmation dialog
- Accessibility `displayPrefs`: import silently AND emit a one-time confirmation toast ("Reduced motion preference restored from imported profile")

Consider tagging accessibility settings in the schema: `"reducedMotion": { "value": true, "category": "accessibility" }` so the import logic can handle them with elevated priority.

### The Device-Specific Display State Problem

Some display state is inherently device-specific and must not travel:

- Window size and position (absolute pixels, meaningless on different hardware)
- Panel widths in absolute pixels (see above)
- Last scroll position in a list (session state, not preference)
- Recently viewed notifications (session state)
- Currently expanded accordion panels (session state vs. persistent preference is a design choice — resolve by asking: would the player want this to persist across sessions on the *same* device? If no, it's session state. If yes and cross-device, it's `displayPrefs`.)

**Guard:** Any `displayPrefs` entry should be validated on import: if a value is out of range for the target device (e.g., a pixel value larger than the screen), clamp to a sensible default. Never let `displayPrefs` cause layout corruption.

### The `displayPrefs` Value That Becomes Semantically Stale

The gap threshold (30-day default, the founding member of `displayPrefs`) travels silently. But what if in a future version the gap threshold is renamed, split into two settings, or the collapsing algorithm changes entirely such that the old value produces confusing results?

This is addressed in sibling aspect 4.69e-i-a-i-f-i-α-i-B (version compatibility for display preferences export). The key principle: every `displayPrefs` entry should have a `formatVersion` field, and the import logic should validate + migrate on read. Stale values that can't be migrated should fall back to the default rather than cause an error.

### The Shared Config Export Contamination Problem

Config-share exports (when a player shares their workbench config on the community hub) should carry **zero** `displayPrefs`. The player's color theme is irrelevant to someone downloading their scout configuration.

But there's a subtlety: `workbench.bufferVisualizationStyle` is in `displayPrefs`, but someone sharing a workbench config might *also* want to share how they visualize the buffer — it might be pedagogically relevant ("I use heatmap mode, which is why my screenshots look like this").

**Resolution:** `displayPrefs` is stripped from config-share exports by default. But workbench-specific display preferences can be included in a separate, optional "workbench display" section of config-share exports, gated by an explicit opt-in checkbox: "Include my workbench display settings (buffer visualization, connection line style, etc.)." This is distinct from `displayPrefs` in the profile export — it's a separate opt-in for a specific subset.

---

## Player Journeys

#### Journey: Petra, 34, UX designer who plays Robot Uprising to decompress

**Context:** Petra has accumulated 85 hours in Robot Uprising over six months. She's customized her setup deeply: dark theme, compact UI density, elbow-style hook lines (she finds bezier curves illegible), EDT trajectory window at 60 matches instead of 30, and she's set reduced motion because she has vestibular issues. She's just bought a new MacBook and is importing her profile for the first time.

**Minute 0:00 — The Import Dialog**
Petra navigates to Profile → Import Profile. She selects her backup file. A modal appears:

> **Import Profile: "Petra_Main"**
>
> The following will be imported:
> - Career data (87 matches, 12 workbench configurations)
> - Notification preferences (4 permanently suppressed notifications)
> - Display settings (your visual preferences and layout settings)
>
> [Import All] [Review →] [Cancel]

The "display settings" line is new — she didn't see it in the old version. She clicks "Review →".

**Minute 0:30 — The Review Drawer**
A sidebar expands with three sections. She scrolls to "Display settings":

> **Display settings** — Carries over silently
> Your visual preferences are restored automatically. These only affect how information is displayed, not your progress or game data.
>
> *Includes: Color theme (Dark), Animation (Reduced), UI density (Compact), Hook line style (Elbow), EDT trajectory window (60 matches), Buffer visualization (Thermometer), ... and 8 others*
>
> [Collapse ▲]

She scans the list. She sees "Animation (Reduced)" and feels a quiet satisfaction — that's the important one. She clicks [Import All].

**Minute 1:00 — Post-Import**
The game loads. It's dark-themed. The hook lines are elbows. The UI is compact. A small toast appears in the bottom-right corner:

> **Accessibility preference restored**
> Reduced motion mode is active from your imported profile. [Settings]

She reads it. She's pleased. The toast disappears after 6 seconds.

**What Petra learned:** She doesn't know or care about the three-category export model. She experienced: "my stuff came back." The important accessibility setting got a specific acknowledgment, which felt respectful. She didn't have to re-configure anything.

**UI Annotations:**
- **Import dialog**: Three-section structure with clear labels. "Display settings" label, not "displayPrefs." Brief plain-language description: "your visual preferences and layout settings."
- **Review drawer**: Bullet list of what's included. Not a JSON blob — human-readable setting names and values.
- **Accessibility toast**: Specific to accessibility settings, not a generic "display prefs restored" message. Links to Settings for inspection. Auto-dismisses in 6 seconds (longer than standard 4-second toasts, given the stakes).
- **Post-import state**: Everything looks right immediately. No refresh required.

---

#### Journey: Desmond, 22, competitive Gauntlet player, config-sharer

**Context:** Desmond has been playing for 3 months and has built a scout configuration that's been crushing Gauntlet. His Discord server wants him to share it. He exports a config-share file. He's done this before — but there's a new "display settings" option in the export dialog he hasn't seen.

**Minute 0:00 — The Config Export Dialog**
Desmond navigates to Workbench → Export Config. A modal appears:

> **Export: "Desmond_Scout_v7"**
>
> This export contains your workbench configuration only — no career data, no personal preferences.
>
> [Optional] Include workbench display settings?
> ☐ Buffer visualization style (Heatmap)
> ☐ Hook connection style (Bezier)
> ☐ Agent label verbosity (Full)
>
> *Useful if you want recipients to see it exactly as you see it.*
>
> [Export] [Cancel]

Desmond looks at the optional checkboxes. He uses heatmap mode because he finds it easier to spot capacity issues at a glance — and he's made a YouTube tutorial showing his setup, where heatmap mode is visible. He checks "Buffer visualization style."

The other two he leaves unchecked. He clicks [Export].

**Minute 0:15 — On Discord**
Desmond pastes the config. Three people download it. One of them messages him: "your config imported but my buffer shows as thermometer not heatmap?"

Desmond is briefly confused, then remembers — heatmap is only carried when you opt in. He tells them to check the "Optional" section of the export dialog. They redo it with the checkbox. The problem is resolved.

**What Desmond learned:** Config-share exports don't carry display settings by default. This is probably correct — most of the time you just want the configuration logic, not someone else's aesthetic choices. The opt-in for workbench-specific display settings is useful for content creators who want recipients to see their exact setup.

**UI Annotations:**
- **Export dialog**: Clear framing — "no career data, no personal preferences" communicates what this is NOT exporting. The optional checkboxes are visually secondary (below a thin divider, smaller font).
- **Optional section header**: "Optional" label + italicized explanation "Useful if you want recipients to see it exactly as you see it" — gives a use case without requiring it.
- **Default state**: All checkboxes unchecked. Opt-in, not opt-out. Respects that most shares don't need display settings.

---

#### Journey: Rasha, 41, game developer at a small studio, evaluating Robot Uprising's export design for their own game

**Context:** Rasha is building a game that also has a notification/audit system. She's been playing Robot Uprising as a design reference. She's specifically looking at the export system to see how they handle the "display preferences" category boundary. She wants to understand the decision rule so she can apply it to her own game.

**Minute 0:00 — The Settings Panel**
Rasha navigates to Profile → Export → [Review →]. She reads every section of the review drawer carefully. She finds herself asking: "Why is `auditLog.sortOrder` a display pref but notification verbosity a notification pref?"

She doesn't have an in-game answer. She goes to Robot Uprising's community wiki.

**Minute 5:00 — Community Wiki**
She finds the "Profile Export Format" article. It documents the three-category model:

> **How do we decide what's a display preference?**
>
> A setting is in `displayPrefs` if: (1) changing it doesn't affect what data is computed, only how it's rendered; (2) losing it means a one-time re-configuration, not data loss; and (3) a player migrating between devices would be *pleased* to find it carried over, not confused.
>
> Sort order passes all three. Notification verbosity is about how the game communicates with you — a different kind of preference — so it lives in `notificationPrefs`.

Rasha writes this down. She applies the three-part test to her own game's settings: 17 settings she'd previously lumped into a single "preferences" blob now separate cleanly into three categories.

**What Rasha learned:** A clear decision rule makes category boundaries maintainable as the game grows. The three-part test is memorable and can be applied consistently by anyone on the team. The community wiki is the right place to document this — not in-game, but discoverable by the developer audience.

**UI Annotations:**
- **Community wiki article**: Structured with headers, decision rules as numbered lists, examples with both passing and failing cases. Not just "here's what's in displayPrefs" but "here's HOW to decide."
- **In-game**: No visible exposure of the decision rule — players don't need it. Only the category label and a human-readable list of what's included.

---

## Sensory Description: The Import Confirmation Modal

The import modal shouldn't feel clinical. It should feel like unpacking a familiar bag in a new room:

The modal background is slightly frosted glass over the main menu. Three sections, each with a soft left-border indicator — **green** for game data (this is your progress, it's safe), **amber** for notification preferences (this affects how the game talks to you, worth a glance), **blue** for display settings (this is how you like things to look — personal touch).

The "Display settings" section's blue border matches the cool informational blue used throughout the workbench for non-critical, non-urgent state. Not a warning color. The message it sends: "we remembered how you like things."

When the import completes, the display settings visually "snap into place" — there's a brief 200ms flash as the color theme switches (if dark mode is being restored), the density shifts, and the hook lines re-render in the player's preferred style. If the screen is already in the right state (same theme as the device default), nothing flashes. The subtlety is intentional: settings that were already correct don't announce themselves.

The accessibility toast uses a softer animation than standard toasts — it slides in from the bottom rather than dropping from the top, uses 0 bounce easing (appropriate for reduced-motion players who might have just triggered it), and its icon is a small shield rather than the standard info circle. The shield communicates: "we've got you."

---

## Comparable Systems

**VS Code Settings Sync:** Separates user settings (follow the person), workspace settings (follow the project), and machine-specific settings (follow the device). The "machine-specific" category is VS Code's equivalent of "don't export this." Font size and key bindings are user settings; file watcher exclusion patterns are machine-specific. Robot Uprising's three-category split maps cleanly: `gameData` = workspace settings, `notificationPrefs` + `displayPrefs` = user settings, device-specific layout state = machine settings.

**Obsidian:** Community themes and plugin UI preferences don't travel when you share a vault configuration. Core settings (note graph layout, theme) do. The community understands this via convention, not enforcement — Robot Uprising should enforce it via export format design.

**iOS iCloud Photo Library Settings:** When you sign into iCloud on a new device, your photos appear, your albums appear, and your face grouping preferences appear — but your display zoom setting (which is device-specific) does not. The UX is frictionless because the categories are handled correctly. Robot Uprising should aspire to this: migration feels effortless because the right things carry.

**Android's Backup API:** Distinguishes "app data" (always backs up), "device-specific data" (never backs up), and "developer-controlled" categories. The failure mode of the Android system — most developers put everything in "app data" — illustrates exactly what happens if Robot Uprising doesn't maintain category discipline: settings that shouldn't travel do, causing confusion on fresh installs.

---

## Interaction Effects

**With 4.69e-i-a-i-f-i-α-i-B (Version compatibility):** Every member of the `displayPrefs` inventory defined here needs version migration coverage. The inventory is the input; the migration spec is the output.

**With 4.69e-i-a-i-f-i-α-i-C (Label clarity):** The human-readable description of `displayPrefs` in the import dialog ("your visual preferences and layout settings") must cover the breadth of the inventory. If `displayPrefs` expands to include, say, workbench grid settings, the label must still be accurate.

**With 4.69e-i-a-i-f-i-α-i-D (Multi-profile isolation):** Every `displayPrefs` member must be scoped to a profile on import. If Player A imports a second profile (Player B's settings), Player A's `displayPrefs` must not be overwritten.

**With 4.69e-i-a-i-f-i-α-v (Threshold normalization):** If the gap threshold can be "normalized to default for community export," this action should apply to all `displayPrefs` members — the "normalize for sharing" export path strips or defaults all `displayPrefs`.

**With 3.x buffer visualization paradigms:** The workbench display preferences in `displayPrefs` (buffer viz style, label verbosity) will grow as more visualization options are added. The inventory here is initial — every new viz option added to the game generates a new `displayPrefs` candidate. Maintaining the inventory is a continuous design task, not a one-time deliverable.

---

## The TikTok Clip

A 15-second clip of the import flow: someone opens Robot Uprising on a brand-new laptop. They select their profile backup. The screen flickers to dark mode. The workbench opens in their preferred layout. Everything is already exactly right. The caption: "imported my whole setup in 10 seconds."

The clip communicates: *the game respects your preferences*. The settings travel because the design team cared enough to categorize them correctly.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i — Accessibility settings elevation protocol:** The import flow for accessibility display preferences (reduced motion, font scale, colorblind modes) needs elevated treatment beyond standard silent displayPrefs import — specifically a confirmation toast. Full design of the toast: wording, icon, duration, dismiss behavior, interaction with global reduced-motion state.

- **4.69e-i-a-i-f-i-α-i-A-ii — Panel size portability (fraction vs. pixel storage):** Layout preferences stored as absolute pixel values are device-specific and must not travel; preferences stored as fractions can travel. Full design of the fraction-vs-pixel decision for every resizable panel in the game; impact on `displayPrefs` validation on import.

- **4.69e-i-a-i-f-i-α-i-A-iii — Workbench display opt-in in config-share exports:** The optional workbench display settings section in config-share exports (buffer viz style, connection line style, label verbosity) needs full design: which settings qualify, how the opt-in UI works, how imported workbench display settings interact with the recipient's existing `displayPrefs`.

- **4.69e-i-a-i-f-i-α-i-A-iv — The `displayPrefs` registry as a living design artifact:** As new settings are added to the game, they must be classified into the correct export category before shipping. Design of the classification checklist, the three-part test as a PR review requirement, and how the community wiki article stays in sync with the game's actual export format.

- **4.69e-i-a-i-f-i-α-i-A-v — Notification verbosity vs. display pref distinction for players:** The decision that notification verbosity belongs in `notificationPrefs` rather than `displayPrefs` may not be intuitive to players. The import dialog's label for `notificationPrefs` must cover verbosity settings accurately; potential UX confusion when a player can't find their verbosity setting in the "display settings" section of the review drawer.

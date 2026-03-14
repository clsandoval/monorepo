# Accessibility Settings Elevation Protocol

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-i — Accessibility settings elevation protocol: the import flow for accessibility display preferences (reduced motion, font scale, colorblind modes) needs elevated treatment beyond standard silent `displayPrefs` import — specifically a confirmation toast; full design of the toast: wording, icon, duration, dismiss behavior, interaction with global reduced-motion state

**Parent:** 4.69e-i-a-i-f-i-α-i-A — Display preferences as a general export category (established that accessibility settings belong in `displayPrefs` AND get a confirmation toast; identified the problem but did not design the toast)

**Grandparent chain:** 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f → 4.69e-i-a-i → 4.69e-i-a-vi-a-i → 4.69e-i-a-vi-a → 4.69e-i-a → 4.69e-i → 4.69e

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A — Display preferences as general export category (parent)
- 4.69e-i-a-i-f-i-α-i — Multi-threshold export format (three-category model)
- 4.69e-i-a-i — Notification state in profile export (import confirmation modal design)
- 4.69e-i-a-vi — Session boundary detection (toast session behavior)
- 4.69e-i-a — Don't-show-again placement decision (toast dismiss patterns)
- 4.69e-i-a-vi-a — Profile-scoped snooze key (per-profile state isolation)
- 4.69e-i-a-i-f-i-α-i-A-ii — Panel size portability (sibling, also an edge case in this same file)

---

## The Problem: When "Preference" is "Requirement"

The parent analysis (A) noted the core tension: accessibility settings pass the three-part test for `displayPrefs` (they affect rendering only, are re-configurable in under 30 seconds, and players would be pleased to find them carried over), but the cost of them *not* carrying over is asymmetric.

For typical `displayPrefs`:
- **Not carried:** player re-configures in 30 seconds, mild annoyance
- **Silently carried:** pleasant surprise

For accessibility `displayPrefs`:
- **Not carried:** player with photosensitive epilepsy sees full-animation launch screen. Player with severe deuteranopia reads color-coded buffers they cannot distinguish. Player with low vision squints at default-scale text. In the worst case, the first 10 seconds on a new device are a health hazard.
- **Silently carried:** the player's device is accessible before the first pixel renders

The parent file resolved this: accessibility settings travel silently AND emit a confirmation toast. This analysis designs everything the parent left unspecified.

---

## Step 0: What Counts as an Accessibility Setting?

Before designing the toast, we need a precise definition of which settings are in scope. Not everything in `displayPrefs` is an accessibility setting.

### Confirmed Accessibility Settings

These are settings whose primary use case is enabling access that would otherwise be blocked:

| Setting Key | Display Name | Accessibility Function |
|-------------|--------------|----------------------|
| `global.animationIntensity` set to `reduced` or `none` | Reduced Motion | Photosensitivity, vestibular disorder, motion sickness |
| `global.reducedFlash` set to `true` | Reduce Flashing Effects | Photosensitive epilepsy (distinct from reduced motion: specifically suppresses rapid luminance cycles, not all animation) |
| `global.colorblindMode` set to any non-default | Color Adjustment | Color vision deficiency (deuteranopia, protanopia, tritanopia, monochromacy) |
| `global.highContrast` set to `true` | High Contrast | Low vision, contrast sensitivity loss |
| `global.fontScale` set above `1.2` (threshold to be designed — see sub-aspect i) | Large Text | Low vision, dyslexia, reading difficulty |
| `global.uiDensity` set to `spacious` (when explicitly set, not default) | Spacious Layout | Fine motor control difficulty (larger hit targets) |

### Not Accessibility Settings (Even Though They Feel Like It)

| Setting | Why It's Not Elevated |
|---------|----------------------|
| `global.colorTheme` (dark / light / system) | Primarily aesthetic; safety impact only in edge cases |
| `global.fontScale` at `1.0`–`1.2` | Default-to-mild range; re-configuration cost is low |
| `replay.defaultPlaybackSpeed` | No health or access dimension |
| `workbench.bufferVisualizationStyle` | Aesthetic; cognitive preference but not access barrier |

### The `fontScale` Threshold Problem

Where does "font size preference" end and "font size accessibility need" begin? There is no clean line. Three approaches:

**Option 1 — Hard threshold:** Any `fontScale` ≥ 1.2 (20% above default) triggers elevated treatment. Simple to implement, misses players who need 115% and gets false positives from players who just like slightly larger text.

**Option 2 — Explicit accessibility tag in the schema:** When the player sets font scale from the Accessibility settings panel, the value is tagged `"source": "accessibility"`; when set from the Display panel, it's tagged `"source": "preference"`. The elevated treatment is triggered by the tag, not the value. Requires two entry points in settings, which is architecturally honest about the distinction.

**Option 3 — No threshold; always elevate fontScale:** Any non-default `fontScale` triggers the toast. Slightly over-eager (player who set 1.1 for aesthetics gets an accessibility toast), but never under-eager (never misses a genuine need).

**Recommendation:** Option 2 (source tagging) is the cleanest long-term design and teaches the distinction between "how you like things to look" and "how you need things to be accessible." It requires a clear Settings screen architecture with an "Accessibility" section and a "Display" section. The implication: if Robot Uprising has a unified Settings screen, it needs an Accessibility subsection.

---

## The Chicken-and-Egg Problem

This is the most important implementation constraint and the one most likely to be gotten wrong.

**The problem:** The confirmation toast announces "Your accessibility settings were restored." But if the game renders the toast BEFORE applying the restored settings, the toast itself may be animated, displayed at default scale, or rendered in the uncorrected color palette. A player whose profile restored `animationIntensity: none` should not see the toast slide in from the side with a spring animation.

**The required order of operations:**

```
1. Parse imported profile
2. Extract accessibility settings from displayPrefs blob
3. Apply accessibility settings to the renderer (BEFORE first render)
   - Set CSS custom properties: --animation-intensity, --font-scale, --colorblind-filter
   - Apply reduced-flash supressor
   - Apply high-contrast stylesheet
4. Render first frame (already accessible)
5. Emit accessibility confirmation toast (already rendered in accessible context)
   - Toast inherits the applied settings
   - Toast itself is non-animated (or uses reduced animation regardless of animationIntensity)
6. Continue with normal import flow (non-accessibility displayPrefs applied silently)
```

**The implication for the toast itself:** The confirmation toast for accessibility settings should be **intrinsically non-animated** — not just because the player may have reduced motion enabled, but because it's the FIRST thing they see after a migration. Even if the player somehow has a valid `animationIntensity: full` in their profile (because they set it to full before their condition developed), the accessibility confirmation toast is one place that should not animate-in.

This is a design rule: **The accessibility confirmation toast never animates. It appears. It does not slide, fade, bounce, or pop. It materializes.**

---

## Toast Design

### The Core Design Question: What Does the Toast Say?

There are five distinct design options ranging from minimal to maximal.

---

#### Option A — Generic Acknowledgment Toast

**Copy:** `"Accessibility preferences restored from imported profile."`
**Icon:** A small universal access symbol (person-with-outstretched-arms-in-circle, or a simplified shield/checkmark in the game's visual vocabulary)
**Duration:** 8 seconds auto-dismiss (longer than typical 3-second toasts; accessibility settings warrant more reading time)
**Dismiss:** Click/tap anywhere on the toast to dismiss early
**Size:** Same as a standard game toast, no special size

**What it does well:** Minimal. Non-distracting. The player knows something happened. Fast to read.

**What it does poorly:** The player doesn't know *which* settings were restored. If a player imported a profile from a different device and isn't sure the colorblind mode carried, this toast gives no evidence. A cautious player will navigate to Settings to verify.

---

#### Option B — Itemized Toast

**Copy:**
```
Accessibility settings restored:
• Reduced motion: enabled
• Color adjustment: Deuteranopia (red-green)
• Font scale: 140%
```
**Icon:** Accessibility symbol, same as A
**Duration:** 12 seconds (more to read)
**Dismiss:** Click/tap anywhere; or click "Settings →" button in toast footer
**Size:** Taller than standard toast; uses a compact list layout

**What it does well:** Verifiable at a glance. Player sees exactly what came over. No need to navigate to Settings. High-stakes settings (reduced flash, colorblind mode) are explicitly named.

**What it does poorly:** Verbose. Players who have 3+ accessibility settings see a very tall notification. The specific setting names must be human-readable without jargon (e.g., "Color adjustment: Deuteranopia (red-green)" not `colorblindMode: deuteranopia`). Requires localization work for each setting's plain-language display name.

**Edge case:** If the player has 6 accessibility settings restored, the itemized toast becomes a list that might overflow the standard toast area. Needs a truncation rule: show up to 3 items, then "and 3 more — View in Settings."

---

#### Option C — Generic Toast + View Settings Affordance (Recommended)

**Copy:** `"Your accessibility settings were restored from the imported profile."`
**Secondary action:** `"View Settings →"` as a link in small text below the main copy
**Icon:** Accessibility symbol
**Duration:** 10 seconds
**Dismiss:** Click/tap anywhere; clicking "View Settings →" dismisses and opens Settings → Accessibility
**Size:** Slightly taller than standard toast due to secondary action row

**What it does well:** Balances brevity with verifiability. The player who wants to verify can with one tap. The player who trusts the import can let it auto-dismiss. Does not require enumerating all restored settings in the toast itself.

**What it does poorly:** The "View Settings" affordance is only useful if Settings → Accessibility is easy to navigate. If the Settings screen is complex, opening it might be confusing rather than reassuring.

---

#### Option D — Review Drawer (Parallels `notificationPrefs` Import Flow)

Mirrors the `[Review →]` affordance from the `notificationPrefs` import flow. The import confirmation modal gains a new section: "Accessibility settings" with a collapsible list. The player can review and deselect specific settings before completing import.

**What it does well:** Gives maximum control. A player who set up their colorblind profile on their personal computer but is importing onto a work laptop (shared with colleagues in standard-vision mode) could choose not to carry the colorblind mode.

**What it does poorly:** This is the wrong mental model for accessibility settings. The `notificationPrefs` flow gives `[Review →]` because suppressed notifications represent decisions (not requirements) that may be outdated. Accessibility settings are not decisions — they're requirements. Offering to "not import" reduced motion to a player with photosensitivity creates risk that the player accidentally unchecks it. The design should not offer that affordance.

**Verdict:** Not recommended as the primary flow. Could be offered as a late-stage escape hatch ("I need to adjust this" from Settings after import) but not as the default import interaction.

---

#### Option E — OS-Level Accessibility API Integration

On platforms with OS-level accessibility APIs (macOS VoiceOver, Windows Narrator, iOS/Android accessibility settings), the game could read the OS's accessibility flags on first launch and apply them without any import at all. The import flow for accessibility becomes less critical because the settings are already applied.

**What it does well:** Zero migration friction. Player with reduced motion set in their OS never has to set it in the game.

**What it does poorly:** Web game in the browser. OS accessibility APIs are partially accessible via CSS media queries (`prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`). But the game's custom settings (colorblind mode type, font scale level, specific reducedFlash behavior) are not available via media queries. The game can read the *direction* ("this user has asked for reduced motion") but not the user's specific configured preference within the game.

**Verdict:** Valuable as a fallback for the *first-ever launch* (before any profile exists to import). `prefers-reduced-motion: reduce` should set `global.animationIntensity = 'reduced'` as the default. But this is separate from the import elevation protocol.

---

### Recommendation: Option C with OS Fallback on First Launch

**Primary import toast:** Option C — generic acknowledgment with "View Settings →" affordance. Non-animated. 10-second auto-dismiss.

**First launch (no profile):** Check `prefers-reduced-motion`, `prefers-contrast`, `prefers-color-scheme` and use as initial defaults. Do not show a toast for this — it's the expected behavior. Show a one-time prompt during onboarding: "We've set some defaults based on your system preferences. You can adjust them in Accessibility Settings."

---

## Toast Anatomy — Complete Specification

**Visual Layout:**
```
┌─────────────────────────────────────────────────┐
│  [♿]  Accessibility settings restored           │ ← 16px title, main color
│                                                   │
│  From your imported profile.                     │ ← 12px secondary text, muted
│                                                   │
│                          View Settings →         │ ← 12px link, accent color
└─────────────────────────────────────────────────┘
```

**Exact copy candidates:**
- Title: `"Accessibility settings restored"` (5 words, unambiguous)
- Body: `"From your imported profile."` (4 words; confirms provenance without redundancy)
- Action: `"View Settings →"` (linked to Settings → Accessibility tab)

**Icon:**
- The game's visual vocabulary uses signal-ring iconography for agents. The accessibility toast should NOT use game-world iconography — this is a system-level notification, not a game event. Use a neutral geometric symbol: a shield outline with a checkmark, rendered in the game's secondary text color. Not the universal access symbol (wheelchair icon), which carries specific disability connotations the player may not want on their screen in a shared context.
- Size: 20px icon on left margin of toast, vertically centered to the title text

**Color:**
- Background: `--surface-elevated-2` (same as other system toasts — NOT a success green, NOT an alert amber; this is neutral information)
- Border: 1px solid `--border-default` — same as other toasts. No special color treatment.
- Reasoning: Green would imply "something good happened." Amber implies warning. Neither is correct for accessibility restoration — it's a neutral operational fact.

**Animation:**
- None. The toast appears at its final position in a single frame.
- The toast should occupy its final layout position without any positional change.
- If the game has a "toast tray" at the bottom-right, the toast appears at the top of the tray occupying its full width — it does not slide in from below.
- Auto-dismiss: opacity fades to 0 over 400ms after the display duration. Even this 400ms fade may violate reduced-motion expectations. **Decision:** if `global.animationIntensity === 'none'`, even the fade-out is suppressed; the toast disappears in a single frame. If `animationIntensity === 'reduced'`, the 400ms fade is present (it is not rapid motion).

**Duration:** 10 seconds from appearance. Rationale: accessibility settings are high-stakes; 10 seconds gives the player time to read the copy and optionally click through to Settings. Standard game toasts (e.g., "match results available") use 3 seconds. The 3.3x multiplier acknowledges that accessibility settings carry more weight.

**Dismissal:**
- Click/tap anywhere on the toast: dismiss immediately
- Click "View Settings →": dismiss and navigate to Settings → Accessibility, scrolled to the section listing all currently-active accessibility settings
- Auto-dismiss at 10 seconds

**Positioning:** Top of the toast tray (right side, bottom of viewport per the UI standard). Priority: accessibility toasts appear ABOVE any other pending toasts. They are not queued behind match notifications or system messages.

**Persistence:** The toast is shown ONCE per import event. It does not re-appear if the player dismisses it and then opens Settings. It does not re-appear on subsequent sessions. The import event is logged (with timestamp) in the audit log.

---

## Interaction with the `[Review →]` Drawer for `notificationPrefs`

When a profile is imported, the import confirmation modal handles both `notificationPrefs` and `displayPrefs` at the same time. The modal typically shows:

1. Career data summary ("You'll import X matches, Y configs")
2. Notification preferences section (permanent suppresses with `[Review →]` opt-out)
3. Display preferences footnote ("Display preferences restored silently")

With accessibility elevation:

The display preferences footnote should be upgraded when accessibility settings are present:

**Without accessibility settings to restore:**
```
Display preferences: restored silently (sort order, playback speed, buffer style).
```

**With accessibility settings to restore:**
```
Accessibility settings: Reduced motion · Deuteranopia filter · Large text (140%)
Other display preferences: restored silently.
```

The accessibility settings are called out by name BEFORE the import is confirmed. This means the player can see what's coming before clicking "Import." If they need to change one (e.g., they're on a new device with a different screen that doesn't need the 140% scale), they can navigate to the relevant settings BEFORE importing, or adjust AFTER. They are not offered an in-dialog checkbox to exclude individual accessibility settings — that's the Option D risk — but they have awareness.

**The ordering:** Accessibility settings appear BEFORE the notification preferences section in the import dialog. Reason: they are applied first (Order of Operations from Section above), and their position in the UI should reflect their operational priority.

---

## Interaction with the `reduced-motion` State

The most complex edge case: what if the imported profile sets `global.animationIntensity: none`, and the confirmation toast system itself uses animation?

The implementation must handle three scenarios:

**Scenario 1: Before import, animationIntensity is 'full'. Import sets it to 'none'.**
- Before the import completes, the game renders with full animation
- At import completion: animationIntensity is applied to the renderer (CSS custom property update)
- The accessibility toast appears — by this point, animationIntensity is already 'none'
- The toast must not animate even though the renderer has just switched to no-animation mode
- **Correct behavior:** The toast appears instantly. The player's first new-device experience is: full-animation loading screen → instant accessibility toast → no more animation. The transition happens at the correct moment.

**Scenario 2: Before import, animationIntensity is 'none' (already set). Import restores 'none'.**
- The toast appears with no animation (already in no-animation mode)
- No transition occurs — the setting was already correct
- The toast still appears to confirm that the setting "stuck"
- **Edge case question:** Should the toast appear even if the setting being restored already matches the current value? Answer: Yes. The toast is about the import event, not about a state change. The player may have set the game to no-animation manually as a workaround on this device; they deserve to know that their profile's accessibility settings have been fully applied, even if the end state looks the same.

**Scenario 3: Before import, animationIntensity is 'full'. Import sets it to 'reduced' (not 'none').**
- At import completion: animationIntensity transitions to 'reduced'
- Under 'reduced', some transitions exist but rapid motion is suppressed
- The toast's 400ms fade-out opacity transition is present (it is considered "reduced" motion)
- The toast itself still does not animate on entry (by design; see above)
- **Correct behavior:** The 400ms fade is the only motion in the toast lifecycle.

---

## Sensory Description

A player with photosensitive epilepsy (Sasha, 34, longtime strategy game player) imports her profile on a new laptop:

The import confirmation modal shows. Above the green "Import" button, between the notification suppresses section and the footer:

*"Accessibility settings — Reduce flashing effects · Reduced motion · Large text (140%)"*

The three items glow gently with a lighter weight than the notification items above them — they are displayed but not interactive. They are facts, not choices.

She clicks "Import."

The modal closes.

The game reloads — and this is the moment. The launch animation, normally a cascade of hexagonal circuit nodes igniting in sequence across the screen, does not run. The title screen is simply there, as if it had always been there. The circuits are still. The nodes are present, not assembled.

In the bottom-right corner, a small rectangular toast card appears without motion — it does not slide in or fade in — it simply occupies its space:

```
[☑] Accessibility settings restored
    From your imported profile.                 View Settings →
```

The shield-checkmark icon is rendered in the muted icon color of the UI, not a success green. The copy is Roboto Medium 15px. The secondary line is 12px in `--text-muted`. The View Settings link is in `--accent-teal`.

After 10 seconds the toast vanishes in a single frame (no fade, because Sasha has `animationIntensity: none`).

Sasha notices: nothing bounced. Nothing slid. The game is already accessible before she does anything.

---

## Player Journeys

#### Journey: Sasha, 34, Strategy Game Veteran, Photosensitive Epilepsy

**Context:** Sasha has been playing Robot Uprising for 6 months on her old machine. She got a new laptop from work and wants to continue her campaign. She exported her profile last week via Settings → Export Profile. Her profile has `reducedFlash: true` and `animationIntensity: none` — she configured these on day one after the launch screen caused eye discomfort.

**Minute 0:00 — First Launch**
The game opens in the browser. The default launch animation would normally cascade hex nodes across the screen. But Sasha has not yet imported her profile. She sees the full animation for the first time in 6 months. Her eyes tighten immediately. She navigates quickly to Settings → Accessibility and manually sets reduced flash and no animation before doing anything else. This is the failure state she's working around. She makes a note to import immediately.

**Minute 0:30 — Import Modal**
She opens Settings → Account → Import Profile and drops in the exported JSON file. The modal appears. She sees:

```
Importing profile: sasha_profile_2026-03-14.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Career data
  ✓ 247 matches, 43 configurations, 8 campaign missions

Accessibility settings
  Reduce flashing effects · No animation · Large text (140%)

Notification preferences
  [Review →]  3 suppressed notifications

Display preferences
  Restored silently (sort order, buffer style, debrief defaults)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              [Cancel]   [Import →]
```

Sasha sees "Accessibility settings" listed above the notification section. She reads: "Reduce flashing effects · No animation · Large text (140%)." These are her settings. She clicks Import.

**Minute 0:45 — The Transition**
The modal closes. The game refreshes. This is the key moment.

The title screen is static. No cascade. No hex animation. The settings she temporarily set manually (reduced flash, no animation) match what the import just applied — so from her perspective, nothing visually changes. But now they're profile-backed, not manual workarounds.

In the bottom-right: the accessibility toast appears without motion. She reads it. She nods. She clicks "View Settings →" to verify.

**Minute 1:00 — Verification**
Settings → Accessibility shows:
- Reduce flashing effects: ON ✓
- Animation: None ✓
- Font scale: 140% ✓

All three match. She navigates back to the campaign map.

**What Sasha thinks:** "It knew. I didn't have to set anything. The toast told me it happened so I could verify."

**What the game successfully did:** Applied critical safety settings before first render. Confirmed via toast so the player knows the import was complete. Provided a one-tap path to verify without hunting through menus.

**UI Annotations:**
- Import modal accessibility section: appears between career data and notification prefs; no interactive elements (not checkboxes); items separated by interpuncts; lighter font weight than section headers
- Accessibility settings applied at import-completion moment (before first render after modal close)
- Toast: appears at bottom-right; does not animate; 10s duration; no fade-out (animationIntensity: none)
- "View Settings →" in toast: navigates to Settings → Accessibility with 140px scroll offset to show all three active settings

---

#### Journey: Clem, 45, Commuting Player, Deuteranopia

**Context:** Clem plays Robot Uprising on his work computer during lunch breaks. His personal laptop has his full profile with deuteranopia filter active — he's red-green colorblind and the default signal-health color coding (red = failing, green = healthy) is illegible without the filter. He's installing on a second work computer (his laptop is at his desk, he needs his desktop machine today).

**Minute 0:00 — Cold Start**
Clem opens Robot Uprising on the work desktop for the first time. The title screen. He launches a quick Gauntlet match to check it out while the profile export email loads in his inbox. In the mission prep screen, he glances at the agent status panel: the signal health indicators are colored red and green. He can tell they're different colors in abstract but can't read them diagnostically.

**Minute 1:30 — Import**
His profile export arrives in email. He downloads the JSON and imports it. The modal shows:

```
Accessibility settings
  Color adjustment: Deuteranopia (red-green shift)
```

(His profile only has one accessibility setting — just the colorblind filter. No reduced motion, no font scale.)

He clicks Import.

**Minute 1:45 — Immediate Visual Shift**
The modal closes. The page refreshes — and the color palette is different. Immediately. The signal health indicators that were red/green are now amber/blue-teal. The workbench connection lines that used red to indicate blocked hooks are now a warm orange. The battlefield health rings that pulse green-for-healthy are now a cooler cyan.

The toast appears:
```
[☑] Accessibility settings restored
    From your imported profile.    View Settings →
```

Clem glances at it. He doesn't tap View Settings — he can already see the filter is active from the colors on screen.

**Minute 2:00 — Back to Work**
He navigates to the mission he was trying before. The signal health panel is now readable. He has 45 minutes of lunch left.

**What Clem thinks:** "Good. It just worked." He didn't have to remember which of the colorblind modes he'd configured. He didn't have to navigate through Settings. The import confirmed it.

**What could go wrong that didn't:** If the colorblind filter was applied after first render (instead of before), Clem would have seen an uncorrected color frame for a fraction of a second. Imperceptible for most but potentially disorienting for a player already calibrating for colorblindness. The order-of-operations constraint prevents this.

**UI Annotations:**
- The toast appears even though only one accessibility setting was restored (not multiple)
- Single-setting itemized display in the import modal: the accessibility section appears as a single line rather than a bullet list
- Color filter change is visible immediately after modal close (before toast appears); the toast is redundant confirmation, not the primary signal
- "View Settings →" in toast leads to Settings → Accessibility → Color Adjustment section, showing Deuteranopia as selected

---

#### Journey: Ben, 17, First-Generation Gamer, Low Vision

**Context:** Ben has mild low vision and uses large text across all his apps (140–160% scaling). His friend Maya helped him configure Robot Uprising on her laptop a month ago — she spent 20 minutes in Settings getting everything right: font scale 150%, spacious density, high contrast. Then she exported his profile and gave him the JSON file. Ben now has his own laptop for the first time.

**Minute 0:00 — First Own Device**
Ben opens Robot Uprising for the first time on his own machine. Default text. He can read it but it's uncomfortable — he's used to larger text. He knows Maya set something up. He drops the JSON file onto the import dialog (he figured out drag-and-drop from watching her).

**Minute 0:30 — Import Modal**
The import modal shows:

```
Accessibility settings
  High contrast · Large text (150%) · Spacious layout
```

Ben stares at the modal. He recognizes "Large text" and "Spacious." He knows "High contrast" is something Maya mentioned helps with the buffers. He clicks Import.

**Minute 0:45 — The Change**
The game refreshes. Immediately the text is larger. The panels are more spread out. The UI has higher contrast.

The toast:
```
[☑] Accessibility settings restored
    From your imported profile.    View Settings →
```

Ben reads it. "Restored." He knows what "restored" means in this context — the things Maya configured for him have been preserved.

He taps "View Settings →" not because he needs to verify — he can see the text is bigger — but because he's curious what the settings actually say.

**Minute 1:00 — Exploring Settings**
Settings → Accessibility shows the three active settings. Ben looks at "Font scale: 150%." He didn't know it was 150% — he just knew it was "the bigger text Maya set." He moves the slider from 150% to 160% — slightly bigger — and watches the settings panel text re-render in real time as a preview. He decides he likes 155% and commits. The export of his profile would now say 155% instead of Maya's 150%.

**What happened:** The accessibility settings elevation gave Ben something valuable — not just the correct settings, but the correct settings labeled in terms he can now read and adjust. The toast was the entry point; the Settings navigation made his configuration his own.

**UI Annotations:**
- Font scale change is visible across the entire UI immediately after import close
- High contrast changes the visual language: instead of the default `--surface-elevated-2` card background, contrast between cards and backgrounds is sharper
- Spacious density increases padding on buttons, card interiors, and agent node labels — the workbench feels less cramped
- Settings → Accessibility shows a live preview slider for fontScale; re-renders the Settings panel text in real time as the slider moves
- "Export" from Settings now includes Ben's adjusted 155% (the exported setting overwrites Maya's 150%)

---

## Strengths and Weaknesses of the Recommended Design

### Strengths

**Safety-first order of operations.** By applying accessibility settings before first render, the design eliminates the window during which the game could be inaccessible after import. The player never sees a pre-accessibility frame.

**Non-intrusive confirmation.** The toast appears once, for 10 seconds, and never again. Players who don't need to verify can ignore it. Players who want to verify get one tap to Settings. The confirmation doesn't interrupt gameplay.

**The import modal as advance warning.** Listing accessibility settings in the import modal (before the player clicks Import) means there are no surprises. The player knows what's coming and can adjust expectations.

**Extensibility.** The schema-based approach (`"category": "accessibility"` tag on settings values) means new accessibility settings automatically receive the elevated treatment without code changes to the import flow.

**Works with reduced motion.** The toast is intrinsically non-animated, making it the only component in the game that guarantees accessibility before being confirmed as accessible.

### Weaknesses

**The toast can't be the first line of defense.** If the player imports on a device and immediately closes the browser before the toast dismisses, the toast is lost. The only durable record is the import event in the audit log. A player checking "did my accessibility settings actually import?" needs to know to check the audit log — which is a more obscure location than a toast.

**No per-setting granularity in the toast.** The recommended Option C toast is generic. A player with five accessibility settings doesn't know which five. They must navigate to Settings to verify. This is an extra tap compared to Option B (itemized). The trade-off is justified by brevity, but some players would prefer the explicit list.

**Shared-device tension.** A player who imports their profile on a shared/lab computer will apply their accessibility settings to that browser session. If the colorblind filter and 150% font are visible to the next user of that machine (who hasn't signed in), the shared device is configured as an accessibility device. The import flow has no "import but don't apply accessibility settings globally" affordance — and probably shouldn't, for safety — but the shared-device scenario is an edge case the design doesn't fully address.

---

## Comparable Games and Precedents

**iOS Settings Backup & Restore.** When an iPhone is restored from an iCloud backup, the Accessibility settings panel shows a confirmation that accessibility settings were preserved. This is the closest real-world precedent: the settings appear as a group, not individually, and the user is notified after restore.

**Android Backup Service.** Android's system restore applies accessibility settings (large font, TalkBack, accessibility shortcuts) as part of the backup restoration. No explicit notification — the user discovers the settings are correct when they use the phone. The lack of notification is a gap that Robot Uprising's toast improves on.

**Steam Deck Accessibility.** The Deck's accessibility panel in Steam Settings is a separate category (not in the general Display settings), which is the architectural precedent for separating accessibility settings from display preferences — the same distinction recommended in Option 2 (source tagging).

**Web Platform `prefers-reduced-motion`.** CSS media query that the game can read on first launch before any profile exists. Already recommended as the first-launch fallback.

**Windows Accessibility Color Filters.** When a colorblind user enables Windows color filters (Settings → Accessibility → Color Filters), the OS shows a brief "Color filters are on" overlay banner — a direct precedent for the confirmation toast model.

**Figma Accessibility Panel.** In Figma's accessibility checker, accessibility issues are surfaced in a dedicated panel that does not mix with general design feedback — the architectural separation principle applied to a tool, not a game.

---

## The TikTok Clip for This Feature

A streamer opens Robot Uprising on a new computer live. The launch animation plays — hex nodes cascading across the screen. They say: "All right, importing my profile now." They drop the JSON. The import modal appears. The accessibility section is visible at the top: "Reduced motion · High contrast."

They click Import.

The screen refreshes. The next frame: the title screen, still. No cascade. The circuits are already lit. The streamer says "oh—" and pauses. "It just... it's already quiet. I didn't do anything."

The toast appears in the bottom right. No motion. It's just there.

"Accessibility settings restored."

The streamer: "Every game should do this. It just knew."

---

## New Sub-Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i-1 — Toast copy localization standards for accessibility notifications:** "reduced motion" and "color adjustment" are plain-English terms in English; what are the standards for localized versions? Some languages require formal register for accessibility copy (legal language, not casual). What's the localization decision process for accessibility toast text?

- **4.69e-i-a-i-f-i-α-i-A-i-2 — First-launch OS preferences integration:** if `prefers-reduced-motion: reduce` is detected on first launch (no profile), what default is applied and with what UI acknowledgment? Interaction with the onboarding flow (4.69e-i-a-i-f-i-α-i-A-i maps to import, this sub-aspect is for the pre-import new-player case)

- **4.69e-i-a-i-f-i-α-i-A-i-3 — Shared device "session-only" accessibility import mode:** when a player explicitly marks a device as "shared" in their profile settings, accessibility settings could be flagged as "apply for this session only" rather than persisting in localStorage; interaction with profile export scope and session boundary model (4.69e-i-a-vi)

- **4.69e-i-a-i-f-i-α-i-A-i-4 — Accessibility confirmation in audit log:** the audit log entry for an import event should note which accessibility settings were applied; design of that audit log entry and how it differs from a standard import event entry; interaction with the broader audit log design (4.69e-i-a-i-f)

- **4.69e-i-a-i-f-i-α-i-A-i-5 — Accessibility settings conflict resolution on import:** if the player has manually set an accessibility setting on the target device BEFORE importing (as Sasha did in Journey 1), and the imported profile has a different value, which wins? The imported profile (it's the canonical source) or the manual setting (the player just set it)? Design of the conflict dialog if values differ.

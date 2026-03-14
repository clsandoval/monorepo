# Notification Audit Log — Temporal Gap Threshold for Snooze Run Splitting

**Aspect:** 4.69e-i-a-i-f-i-α — Temporal gap threshold as player-configurable setting

**Parent:** 4.69e-i-a-i-f-i — Snooze event collapsing in long provenance chains
**Grandparent:** 4.69e-i-a-i-f — Audit log ordering policy
**Root chain:** → 4.69e-i-a-i-a → 4.69e-i-a-vi-a-i → ... → 4.69e

**Cross-references:**
- 4.69e-i-a-i-f-i — Snooze collapsing parent (defines the 30-day threshold as arbitrary-but-defensible)
- 4.69e-i-a-i-f-i-δ — "Collapse snooze events in all notifications" global setting (sibling configurability)
- 4.69e-i-a-i-f-i-ε — Snooze collapsing in export artifacts (export format independence)
- 4.69e-i-a-i-f-ii — Staggered animation direction (same cognitive priming problem space)
- 4.69e-i-a-vi-d — Snooze state visibility in Settings

---

## The Problem: Arbitrary Constants in Personal Data

The snooze collapsing algorithm (4.69e-i-a-i-f-i) uses a **30-day gap threshold** to determine when two consecutive snooze events represent separate "engagement runs" vs. a single continuous deferral period.

The choice of 30 days is defensible:
- It corresponds roughly to a calendar month — an intuitive unit
- It catches the common case of a casual player who takes a "winter break" from gaming
- It's not so short (7 days) that a brief vacation fragments a genuine single deferral period
- It's not so long (90 days) that it ignores meaningful inactivity

But it is **not uniquely correct.** The right threshold is different for every player:

| Player archetype | Typical session gap | 30-day threshold effect |
|-----------------|---------------------|------------------------|
| Daily player | < 2 days | 30-day threshold never triggers; snooze runs never split; no issue |
| Weekly player | 5–10 days | Threshold triggers on any break; occasionally fragments intentional runs at expected gaps |
| Casual player (monthly) | 20–35 days | Threshold regularly splits what the player experiences as a single campaign-of-engagement |
| Seasonal player | 90–180 days | Every gap > 30 days splits; a player who played Sep–Nov and Mar–May gets two run segments even if they snoozed 5 times in each period — clean data, but potentially not the player's mental model |
| Tournament-sprint player | Plays intensely for 1 week, then stops for 2+ months | The sprint period compresses into one run (correct); the post-sprint return may surprise them with a separate run |

The problem is sharpest for **casual and seasonal players** whose natural engagement rhythm spans longer than 30 days. These players will see their snooze history fragmented into multiple runs where they experienced it as one continuous deferral, and the gap between runs will appear unexpectedly large.

The design question: **should the 30-day threshold be fixed, player-configurable, or auto-derived from session behavior?**

---

## The Options

### Option A — Fixed 30-Day Threshold (No Configuration)

The threshold is a constant baked into the algorithm. Players cannot change it. Documentation mentions it only if advanced players ask.

**The chain for a seasonal player (30-day gap = 45 days between gaming periods):**

The player snoozed 6 times in November (early access period) and 8 times in February (after a 75-day break). The 30-day threshold fires:

```
• Timeline
Oct 5  — First encounter (toast fired)
         ▶ Snoozed 6 times · Oct 5–Nov 18   [expand]
         ┆ [date gap: Nov 18 → Feb 2, 76 days]
         ▶ Snoozed 8 times · Feb 2–Feb 24   [expand]
Feb 28 — Permanently suppressed by player action
```

The player sees two separate runs. From their perspective, this is accurate — they did have two separate periods of engagement. The 76-day gap is behaviorally real. But the player might also wonder: "Why is this split? I snoozed it, I came back, I snoozed it again. It's all just 'I kept deferring.'"

**Arguments for:**
- Zero complexity. No settings panel. No algorithm for deriving the threshold. No UI to design.
- The 30-day value is justifiable as a standard "calendar break" indicator applicable to most players.
- Consistency: every player's chains are processed identically, making the audit log comparable across players in community contexts (sharing chain screenshots, discussing notification behavior).
- Most players will never notice the threshold — daily and weekly players will rarely trigger it; the players who do trigger it are those with gaps > 30 days, who are likely to find the split informative rather than frustrating.
- Configurability of low-stakes presentation details adds cognitive overhead to the Settings panel without addressing a sharp pain point.

**Arguments against:**
- A 35-day break between sessions (not unusual for a casual player) creates a split that the player experiences as surprising and arbitrary.
- The player who sees "Snoozed 6 times · Oct 5–Nov 18" and "Snoozed 8 times · Feb 2–Feb 24" and thinks "but those are the same thing" cannot reconcile the display with their mental model.
- The threshold is invisible. There's no way for the player to understand *why* their chain split. "Because you didn't play for 76 days" is not surfaced anywhere.
- The 30-day constant will be wrong for a predictable class of players (those with seasonal engagement) in a predictable direction (over-splitting). Knowingly shipping a constant that misfires for a known population when a simple fix exists is a design debt decision, not just an omission.

**Verdict:** Correct for the majority of players; brittle for seasonal players. Acceptable as v1.0, poor as a permanent design.

---

### Option B — Player-Configurable Threshold (Settings → Notifications → Advanced)

A numeric input (or segmented control) in Settings → Notifications → Advanced lets the player set the gap threshold manually.

**The UI:**

```
NOTIFICATIONS → ADVANCED

─────────────────────────────────────────────────────────────
Snooze run split threshold

When grouping snooze events in your notification history, treat
gaps longer than this as separate engagement periods.

  ● 14 days     ○ 30 days (default)     ○ 60 days     ○ 90 days
  ○ Custom: [ 45   ] days

Applies to all notification chains. Changes retroactively
update existing chain displays.
─────────────────────────────────────────────────────────────
```

The four presets (14, 30, 60, 90) cover the most common playstyle gaps. Custom entry covers edge cases. The "changes retroactively update" note is important — the player who adjusts this should see the effect immediately in their existing chains, not just future snooze events.

**Interaction with the chain:**

If the player who gets frustrated by the Nov–Feb split changes the threshold to 90 days:

```
• Timeline (with 90-day threshold)
Oct 5  — First encounter (toast fired)
         ▶ Snoozed 14 times · Oct 5–Feb 24   [expand]
Feb 28 — Permanently suppressed by player action
```

The two runs merge into one. The chain reads as a single continuous deferral, which matches the player's mental model of "I kept putting it off for months."

**Arguments for:**
- Directly solves the seasonal player problem. The player who takes 45-day breaks sets the threshold to 60 days and gets a chain that matches their experience.
- Respects player agency over their own historical data display. The audit log is a personal tool; personal tools should be configurable.
- The retroactive update makes the configuration feel powerful — the player immediately sees the effect of their change, creating a feedback loop that teaches them what the threshold controls.
- The "Custom" input handles truly unusual cases (players who take 120-day breaks between gaming seasons) without needing an option for every conceivable value.

**Arguments against:**
- Very few players will ever open Settings → Notifications → Advanced. The players most likely to be affected (seasonal players who notice the split) may also be least likely to know a configuration option exists.
- The numeric custom input introduces localization considerations (decimal separator conventions vary) and validation (what happens at 0 days? at 365 days?).
- Retroactive updates, while useful, mean that changing the threshold can make existing chain records look different from how they appeared in previous sessions. A player sharing a screenshot of their chain, then another player changing their threshold and getting a different visual, creates confusion in community contexts.
- For most players, this setting will live in Advanced Options and never be touched. The design and engineering cost is non-trivial for a setting that primarily helps 5–10% of players.

**The "Custom" input edge cases:**
- 0 days: every single-day snooze run splits into individual events. Functionally identical to Option A (No Collapse), applied per-event rather than per-run. Should clamp to 1 day minimum.
- 1 day: any pair of snooze events on different calendar days form separate runs. Almost certainly not what any player wants. Educational note: "At 1 day, snooze events on different days are never grouped."
- 365+ days: every snooze history collapses to a single run, spanning any amount of inactivity. Technically valid; corresponds to "I treat all my snoozes as one continuous deferral regardless of breaks." Allow, but note: "Gaps over 1 year will be grouped with surrounding snooze events."

**Verdict:** Correct solution for the problem. High design and engineering cost for low reach. Recommend as v2.0 feature behind a "show advanced options" disclosure toggle to keep the Settings surface clean in v1.0.

---

### Option C — Auto-Derived Threshold from Session Frequency History

Instead of asking the player to set a threshold, the game infers it from their own session behavior. The algorithm:

1. Look at the player's session history (timestamps of all gameplay sessions)
2. Find the distribution of inter-session gaps
3. Identify the "natural break" boundary — the point where a gap transitions from "normal rest between sessions" to "significant hiatus"
4. Use that as the threshold for snooze run splitting

**The algorithm in detail:**

A robust approach uses a bimodal gap distribution. Inter-session gaps naturally cluster into two populations:
- **Short gaps** (rest, sleep, weekday/weekend rhythm): typically 0–10 days
- **Long gaps** (breaks, vacations, life interruptions): typically 30–180 days

The threshold is the valley between these two distributions. This can be computed simply:
- Collect all inter-session gaps from the past 12 months
- Find the 85th percentile of gaps (empirically, this tends to fall near the "natural break" boundary for most playstyle distributions)
- Use that value, floored at 7 days and capped at 90 days, as the threshold

For a weekly player: the 85th percentile gap might be 14 days (they occasionally take two weeks off). Threshold = 14 days.
For a seasonal player: the 85th percentile might be 65 days (most breaks are a few months). Threshold = 65 days.

**The player never sees the threshold directly.** They see only the result — chains that split in a way that matches their own engagement rhythm because the splits are derived from that rhythm.

**The chain annotation:**

When a chain splits due to a gap exceeding the derived threshold, a subtle annotation in the chain explains the split:

```
• Timeline
Oct 5  — First encounter (toast fired)
         ▶ Snoozed 6 times · Oct 5–Nov 18   [expand]
         ┆ Extended break detected (76 days)
         ▶ Snoozed 8 times · Feb 2–Feb 24   [expand]
Feb 28 — Permanently suppressed by player action
```

The "Extended break detected" text uses the player's own session history to label the gap — the word "extended" is relative to their normal play pattern. A 76-day gap is "extended" for a seasonal player whose 85th percentile is 65 days; it would not be labeled at all for a daily player where 76 days far exceeds any normal gap.

**Arguments for:**
- Personalization without manual configuration. The threshold adapts to the player's own behavior without asking them to provide any input.
- Self-referential correctness: the threshold for "what counts as a gap in my snooze history" is derived from "what counts as a gap in my play history." These are naturally aligned because snooze events can only occur during active sessions.
- Produces chains that match the player's mental model of their own engagement — they won't see "arbitrary" splits because the splits correspond to real breaks in their play history.
- The "Extended break detected" annotation adds transparency about why the split occurred, in language that is self-explanatory.

**Arguments against:**
- Requires session history tracking. If the game doesn't already log every session timestamp, this feature requires that infrastructure to exist first.
- The algorithm (85th percentile, floored/capped) is more complex than a fixed constant. It will have edge cases:
  - New players with < 30 sessions have insufficient data for a reliable distribution. What is the threshold before the player has history?
  - Players who just started but plan to play seasonally will have an under-estimated threshold for their first few months.
  - A player who changes their play rhythm (daily for 6 months, then seasonal) will have a threshold that lags their current behavior.
- The 85th percentile itself is an arbitrary choice. Why not 80th or 90th? The algorithm obscures a constant (the percentile) rather than eliminating it.
- If the algorithm fires on a gap that the player doesn't experience as "extended" (they went on vacation for 6 weeks and consider that normal), they see a split that feels unwarranted.
- Community comparability suffers even more than in Option B: two players with the same snooze history but different session frequencies get different chain displays.
- "Personalized" thresholds that the player can't inspect or override are a known source of player frustration in other contexts (recommendation algorithms, matchmaking ELO, etc.). Invisible personalization can feel manipulative.

**Verdict:** The right insight (threshold should reflect personal engagement rhythm), wrong execution (hidden algorithm is fragile and un-inspectable). Recommend as an **auto-suggestion** within Option B rather than a standalone automatic mode. See Option E.

---

### Option D — Tiered Default Thresholds by Detected Playstyle

A middle path: the game observes session frequency during onboarding (or first week of play) and silently selects one of three threshold presets:

| Detected playstyle | Session frequency | Auto-selected threshold |
|-------------------|-------------------|------------------------|
| Regular | More than 3 sessions/week | 14 days |
| Casual | 1–3 sessions/week | 30 days (the current default) |
| Seasonal | < 1 session/week on average | 60 days |

The player can see and override this in Settings → Advanced. The auto-selection is a suggestion, not a lock.

**Arguments for:**
- Better out-of-box experience for the most mismatched case (seasonal players) without requiring any manual configuration.
- The three tiers are simple and explainable: "Based on how often you play, we've set this to 60 days." The mechanism is transparent even if the player never explicitly chose it.
- Retains full configurability (Settings override) for players whose playstyle doesn't fit any tier.

**Arguments against:**
- Detecting "playstyle" from early session frequency is noisy. A player who plays daily for the tutorial week but then becomes casual will be miscategorized as "Regular."
- Three tiers with specific day values (14, 30, 60) are still somewhat arbitrary. A seasonal player who plays every 45 days gets threshold=60, which is close enough; a player who plays every 90 days still gets the wrong default.
- Adding a third layer of auto-detection complexity on top of the collapsing algorithm and the threshold configurability generates significant technical debt.

**Verdict:** The right direction (better defaults without manual work), but overengineered for v1.0. A simpler improvement: keep 30-day default, but surface the setting proactively when the game detects that a gap threshold has been triggered and the player is in the Settings panel (see Hybrid Option E).

---

### Option E — Auto-Derive with Manual Override (Hybrid)

The algorithm watches for the **first time the threshold fires** on any notification chain. At that moment (when the player next opens the notification history), a contextual prompt appears inline within the affected chain:

```
• Timeline
Oct 5  — First encounter (toast fired)
         ▶ Snoozed 6 times · Oct 5–Nov 18   [expand]
         ╌╌ Break detected: 76 days ╌╌
         ┌──────────────────────────────────────────────────────────┐
         │  We split this run at a 76-day gap.                      │
         │  Is this the right split for your play pattern?          │
         │  [Split at 30d ✓]  [Merge all snoozes]  [Set threshold →]│
         └──────────────────────────────────────────────────────────┘
         ▶ Snoozed 8 times · Feb 2–Feb 24   [expand]
Feb 28 — Permanently suppressed by player action
```

The prompt fires exactly once (per chain, per player). Clicking "Split at 30d ✓" dismisses it permanently, meaning: "yes, this is right for me." Clicking "Merge all snoozes" sets the threshold to 90 days for this player (a heuristic: "merge all" players are typically seasonal). Clicking "Set threshold →" opens the Advanced settings panel to the threshold configuration.

If the player ignores the prompt (doesn't click any of the three options), it disappears after 15 seconds and never reappears.

**Arguments for:**
- Teaches the feature exactly when it becomes relevant. The player who has a gap > 30 days in their history encounters the prompt in context — they can see the split, understand that it's controllable, and make a decision without ever having to find Settings → Advanced independently.
- Respects that most players will never encounter the prompt (it only fires when the threshold triggers) while still providing a clear path for the minority who are affected.
- The three-option design surfaces the most common responses directly: "yes, this is right" / "no, merge everything" / "let me configure this properly." 90% of affected players will find what they want in the first two options.
- The prompt is contextual and single-appearance — it doesn't feel like a configuration wizard, it feels like a responsive system noticing a relevant state and offering a choice.

**Arguments against:**
- Adds yet another inline prompt/toast to a system (the notification audit log) that already has significant information density. The player who is already in the audit log to debug a notification state now gets a meta-prompt about how the audit log itself is configured.
- The three-option inline choice introduces UI complexity into the chain display — the chain can no longer be described as "a simple timeline of events." The meta-prompt is a conditional element that appears in the chain.
- "Merge all snoozes" is a heuristic (sets threshold to 90 days) that may not accurately represent the player's actual intent. If the player plays every 100 days, "merge all snoozes" sets a threshold that still splits their history.
- The 15-second auto-dismiss means a player who is reading the rest of the chain carefully may lose the prompt before they interact with it. A timeout on a settings decision (even a low-stakes one) is hostile to thoughtful users.

**Verdict:** The most discoverable solution. The 15-second timeout is a design flaw — should use click-outside-to-dismiss rather than timeout. The "Merge all snoozes" option needs to be "Set threshold higher →" or a direct numeric input rather than a hidden 90-day heuristic. Recommend as v2.0 feature, after v1.0 ships the fixed 30-day threshold and surfaces the Setting in Advanced without an inline prompt.

---

## Recommendation: Phased Approach

**v1.0:** Fixed 30-day threshold, but surface it transparently.

When a split occurs (a chain displays two or more run segments), annotate the gap in the chain:

```
▶ Snoozed 6 times · Oct 5–Nov 18   [expand]
  ↳ 76 days passed  ·  Settings → Notifications → Advanced to adjust
▶ Snoozed 8 times · Feb 2–Feb 24   [expand]
```

The annotation is tiny (10px, secondary color) and appears only when a split occurs. It's not a prompt, not a toast — just an explanation of why the split happened, with a path to fix it. This makes the threshold visible and configurable for players who want it, without adding any new prompt/wizard complexity.

**v2.0:** Add the Settings → Notifications → Advanced panel with the threshold configuration (Option B), with presets at 14 / 30 / 60 / 90 days + custom input. The inline annotation's "Settings → Advanced" link navigates directly to the threshold control.

**v3.0 (if session history is tracked):** Add the auto-derive suggestion in the settings panel ("Based on your session history, we recommend 60 days"). The suggestion is advisory, not automatic. The player chooses to apply it.

---

## Player Journeys

#### Journey: Hamid, 41, Seasonal Gamer — Confused by the Split

**Context:** Hamid plays Robot Uprising in intensive two-week periods, twice a year — once in winter (January) and once in summer (July). It's the end of August. He's in his second season. He's been getting the sample-size toast all summer and finally opened Settings to understand it. He's never been to Settings → Notifications before.

**Minute 0:00 — Opening Notification History**
Hamid navigates to Settings → Notifications. He sees the "Sample size reliability warning" entry, grey dot. He clicks it.

The chain expands:

```
• Timeline
Jan 10 — First encounter (toast fired)
         ▶ Snoozed 9 times · Jan 10–Jan 28   [expand]
         ↳ 167 days passed  ·  Settings → Notifications → Advanced to adjust
         ▶ Snoozed 5 times · Jul 14–Aug 6    [expand]
Aug 12 — Permanently suppressed by player action
```

Hamid stares at the two collapsed run segments. He's confused — he didn't think he snoozed it that many times, but more than that, he doesn't understand the split. He's one player who played one game. Why are there two separate snooze clusters?

**Minute 0:20 — The Annotation Clarifies**
He notices the tiny "167 days passed · Settings → Notifications → Advanced to adjust" line between the two run segments. He reads it. *Oh. It split because of the 5-month gap between January and July.*

He instantly understands. He didn't play between February and July — that was the gap. The split is accurate. He hadn't thought of himself as a "seasonal player" but the chain is showing him something true about his behavior.

He hovers over the "Settings → Notifications → Advanced" link in the annotation. His cursor shows a pointer. He clicks it.

**Minute 0:40 — Advanced Settings**
Settings panel navigates to the threshold control:

```
Snooze run split threshold: 30 days (default)
● 14 days   ○ 30 days   ○ 60 days   ○ 90 days   ○ Custom: [   ]
```

He reads: "14 days... 30 days (default)... 60 days... 90 days."

He thinks about his rhythm. He plays for two weeks, then stops for 5–6 months. If he sets it to 90 days, the January and July snoozes would merge into one. He selects "90 days."

**Minute 1:00 — Retroactive Update**
He navigates back to the notification history. The chain has updated:

```
• Timeline
Jan 10 — First encounter (toast fired)
         ▶ Snoozed 14 times · Jan 10–Aug 6   [expand]
Aug 12 — Permanently suppressed by player action
```

The split is gone. 14 total snoozes across his two seasons, displayed as a single continuous deferral. This matches his mental model: "I kept putting it off whenever I played."

**Minute 1:30 — Retrospective Insight**
He expands the collapsed run out of curiosity. The 14 individual entries appear — 9 in January, then a visible jump to July 14 in the date column, then 5 more. The dates themselves communicate the gap (Jan 28 → Jul 14) without requiring a split at all. The chronological jump in the date column is the only "gap indicator" needed.

He collapses it again. He's satisfied. The 90-day threshold is right for him.

**UI Annotations:**
- The inline annotation "167 days passed · [link]": rendered at 10px in #888 on a single line between the two run segments; the link text is "Settings → Notifications → Advanced to adjust" — the full path, not an icon, because the player needs to know where they're going; the link underline uses dotted underline (10px, #888, secondary-interactive style) rather than solid underline (primary interactive style) because this is advisory, not required
- The retroactive chain update: when the player changes the threshold in Settings and returns to the notification panel, the chain is re-rendered with the new threshold; no toast, no animation — the chain simply appears updated; the previously-split chain now shows the merged run; 200ms fade on the new collapsed summary row (the previously two rows becoming one)
- The date column in the expanded merged run: Jan 28 → Jul 14 creates a visible jump without explicit annotation; the timeline connector is an unbroken vertical line, but the absence of entries between the two date clusters is visually apparent; the player doesn't need a "[gap]" label — the dates speak for themselves

---

#### Journey: Priya, 29, Data-Conscious Regular Player — Discovering the Threshold Exists

**Context:** Priya plays Robot Uprising 4–5 times per week, intensely. She has never taken a break longer than 10 days. She's in the notification audit log for a completely unrelated reason (she's investigating the import behavior for her work laptop profile). While in the Settings panel, she notices the "Advanced" section for the first time.

**Minute 0:00 — Noticing "Advanced" in Settings**
While scrolling through Settings → Notifications to find the import section, Priya spots a collapsible "Advanced" section at the bottom of the panel. She clicks it.

The section expands:

```
ADVANCED

Snooze run split threshold
When grouping snooze events in your notification history, treat gaps
longer than this as separate engagement periods.

● 30 days (default)  ○ 14 days  ○ 60 days  ○ 90 days  ○ Custom: [   ]
```

She reads it. She hasn't thought about snooze run splitting before, but the concept is immediately clear. She's a data scientist; a 30-day gap threshold makes intuitive sense as a default.

**Minute 0:30 — Verifying Against Her Own History**
She navigates to her sample-size warning chain (she knows she snoozed it several times before suppressing it last month). The chain shows:

```
• Timeline
Feb 3  — First encounter (toast fired)
         ▶ Snoozed 18 times · Feb 3–Mar 14   [expand]
Mar 16 — Permanently suppressed by player action
```

One run, 40 days, 18 snoozes. No split. The 30-day threshold never fired because she never took a break > 30 days. She nods — the default is correct for her.

**Minute 1:00 — Testing the Custom Input**
Out of curiosity, she types "5" in the Custom input box and hits Enter. The chain immediately re-renders:

```
• Timeline
Feb 3  — First encounter (toast fired)
Feb 3  — Snoozed for session
Feb 5  — Snoozed for session
         ▶ Snoozed 3 times · Feb 7–Feb 12   [expand]
Feb 12 — Snoozed for session
Feb 14 — Snoozed for session
         ▶ Snoozed 4 times · Feb 19–Feb 26   [expand]
Feb 26 — Snoozed for session
         [... etc — multiple fragments ...]
Mar 16 — Permanently suppressed by player action
```

Her single elegant chain has fragmented into many small runs. She laughs. *That's what too-small a threshold looks like.* She changes it back to 30 days. The chain returns to the clean single-run display.

**Minute 1:45 — Sharing the Finding**
Priya takes a screenshot of the Settings panel showing the threshold control. She shares it in the Robot Uprising community Discord with the caption: "TIL there's an advanced setting for how the notification history splits snooze runs. If you play seasonally, set this to 90 days."

**What this journey illustrates:**
Priya never needed to change the setting herself. But the discovery interaction — trying the Custom input and watching the chain fragment in real time — was genuinely educational. She immediately understood what the threshold controls without reading any documentation. The retroactive update on threshold change is critical to this journey: without live re-rendering, she couldn't have had the "ah, too small" moment.

**UI Annotations:**
- The Advanced collapsible section: uses a ▶ / ▼ chevron at right edge of the "Advanced" row; 200ms ease-in-out animation for section open/close; always-visible Advanced row (not hidden behind account unlocks); the section's contents are grayed out during the first 30 minutes of a session (anti-jitter: prevents accidental changes during early learning)
- The Custom input field: 48px wide, 3 digits maximum (max value enforced at 365); "days" label immediately to the right of the field, in 12px #888; Enter key confirms; clicking outside the field with a valid value also confirms; clicking outside with the field empty resets to previous value; field shows red border + tooltip "Must be between 1 and 365 days" if an invalid value is entered
- Retroactive chain update: the re-render happens within 300ms of the threshold change being confirmed (not waiting for the player to navigate back to the notification list); the transition uses a quick cross-fade rather than slide/scroll animation; the updated chain is the canonical version — a refresh won't revert it

---

#### Journey: Luz, 52, Accessibility-Focused Casual Player — The Annotation Saves Her

**Context:** Luz has mild cognitive fatigue from a health condition that means she plays only when she's feeling good — some weeks daily, other weeks nothing, with occasional 6-8 week gaps. She has been playing Robot Uprising for 5 months. She has never heard the phrase "snooze run split threshold" and would find a Settings panel with a numeric input intimidating. She's in the notification audit log because a tooltip told her she could "restore" a notification she accidentally suppressed.

**Minute 0:00 — Accidental Discovery of the Split**
Luz opens the notification panel to restore the "Low coverage alert" that she accidentally suppressed. While there, she notices the "Sample size warning" entry. She clicks it, curious.

The chain expands:

```
• Timeline
Dec 4  — First encounter (toast fired)
         ▶ Snoozed 4 times · Dec 4–Dec 16   [expand]
         ↳ 52 days passed  ·  Settings → Notifications → Advanced to adjust
         ▶ Snoozed 3 times · Feb 6–Feb 20    [expand]
Mar 1  — Permanently suppressed by player action
```

Luz sees two snooze runs. She's confused: "Why is it in two pieces?"

**Minute 0:30 — Reading the Annotation**
She notices the grey line between the two runs: "52 days passed." She immediately understands. *I didn't play for 52 days, so it thinks those were separate.* The human-readable annotation does the explanatory work without using the word "threshold" or requiring any settings knowledge.

She doesn't want to adjust anything. The split doesn't bother her — it reflects reality, she did take a two-month break. She just needed to understand why.

**Minute 0:45 — Restoring the Other Notification**
Luz returns to her original task (restoring "Low coverage alert") without touching the threshold setting. The audit log has served her: she got a clear forensic picture of her snooze history without needing to configure anything.

**What this journey illustrates:**
For accessibility-first users, the key is explanation over configuration. Luz didn't need to change the threshold — she needed to understand the split. The "52 days passed" annotation provided that understanding in plain language. The link to Advanced settings exists for those who want to act on the information, but it doesn't force itself on users who don't need it.

**UI Annotations:**
- The annotation text "N days passed · [link]": uses the exact calendar gap (not a rounded value — "52 days" not "about 2 months") because the player is looking at dates and can verify; "52 days" is precise and matches the chain's date display
- The link style: 10px, dotted underline in secondary-interactive color; not bold, not prominent — it's a footnote, not a call to action; players who need it will click it; players who don't need it won't be drawn to it
- Font size and color: the annotation row uses 10px text at #888 (the smallest text in the panel); this is intentional — the annotation is contextual noise for most players (who understand splits or don't care), and should occupy minimal visual real estate
- No toast, no modal, no interruption: the annotation is passive, not proactive; it explains without demanding attention

---

## Strengths and Weaknesses

| Option | Strengths | Weaknesses | Best For |
|--------|-----------|------------|----------|
| **A — Fixed 30 days** | Zero complexity; correct for daily/weekly players; consistent across players | Silently wrong for seasonal players; threshold invisible; no escape hatch | v1.0 with annotation transparency |
| **B — Player-configurable** | Directly solves the problem; retroactive update is educational; respects agency | Low reach (most players won't find Advanced); edge cases in custom input; breaks community comparability | v2.0, discovered via annotation link |
| **C — Auto-derived** | No manual work; personalized; self-referential accuracy | Requires session history infrastructure; algorithm complexity; invisible personalization risks trust | v3.0 as optional suggestion in settings |
| **D — Tiered playstyle defaults** | Better out-of-box for seasonal players; still overridable | Noisy detection; arbitrary tiers; regression if playstyle changes | Not recommended; C is strictly better |
| **E — Inline prompt at first trigger** | Most discoverable; contextual; directly actionable | Adds UI complexity to chain display; timeout is hostile; "merge all" heuristic is imprecise | v2.0 with timeout removed, cleaner 3-option design |

---

## Interaction Effects

**4.69e-i-a-i-f-i — Snooze collapsing (parent):**
This aspect is a direct dependency of the collapsing algorithm. The parent established the 30-day threshold as a recommendation; this aspect explores whether and how that recommendation should be configurable. The annotation design (Option A enhancement) requires the collapsing algorithm to pass gap size through to the display layer — a minor addition to the data model.

**4.69e-i-a-i-f-i-δ — Global "collapse snooze events" toggle:**
Both this aspect and the global toggle are configurable properties of the snooze collapsing system. They interact: if the global toggle is set to "Never collapse," the gap threshold has no effect (there are no runs to split). If "Always collapse" (collapse even 1–3 snooze events), the threshold still applies to split multi-period runs. The Settings → Advanced panel should show both controls in proximity, with a dependency note: "This threshold only applies when snooze events are grouped (above setting)."

**4.69e-i-a-i-f-i-ε — Snooze collapsing in export:**
If the player changes their threshold, what happens to the exported audit log? The export format decision (export individual events vs. export collapsed summary) is independent of the display threshold — exporting individual events allows any threshold to be applied on import. If the export carries the player's threshold setting alongside the event data, an import on a new device would reconstruct chains identically. Interaction: export format should include the threshold value used at export time, even if it stores individual events.

**4.69e-i-a-vi-a-i — Notification state in profile export:**
If threshold configuration travels with profile exports (it should — it's a notification preference), the imported profile will apply the previous device's threshold to the new device's chains immediately. A player who set threshold=90 days on Device A and exports to Device B will have threshold=90 on Device B without reconfiguring. This is generally correct behavior but should be noted in the import dialog.

**4.69e-i-a-i-f-ii — Staggered animation direction:**
The annotation row (Option A enhancement) renders between two collapsed run segments. Its position in the chain is fixed (between the runs chronologically). Unlike the snooze entries themselves, the annotation does not participate in the stagger animation — it is not an event row. It fades in simultaneously with the chain (0ms delay) rather than as part of the entry stagger.

**4.69e-i-a-i-f-v — "Show only significant events" filter:**
If the significant-events filter is active (sibling aspect: hides snooze events entirely), the gap threshold has no visual effect — there are no snooze runs to split, so no annotation appears. The threshold is still computed and stored, but its result is not displayed. An edge case: a player with the filter active changes their threshold; should the chain re-render? No — there is nothing to re-render because snooze events are hidden. But if the player turns the filter off, the new threshold should apply to the now-visible chains.

---

## Comparable Games and Design Patterns

**Obsidian / Notion — User-configurable metadata thresholds:**
Obsidian's Dataview plugin allows users to define their own date-range groupings for calendar views and task lists. The concept is directly analogous: "how many days counts as 'this week' vs. 'last week' for sorting purposes?" Users who want ISO week definitions can configure them; users who want "7-day rolling window" can configure that. The configuration lives in a settings panel with a small input and a note about what happens at edge values. The Robot Uprising threshold setting could follow the same pattern: simple numeric input, note about minimum and maximum valid values, immediate effect on the affected display.

**Spotify "Recently Played" Window:**
Spotify groups listening history by "Today," "Yesterday," and "Recent weeks." The cutoffs are fixed and invisible. Power users regularly complain that "Yesterday" sometimes means 20 hours ago and sometimes means 40 hours ago depending on when they opened the app. This is the Option A failure mode: an arbitrary invisible threshold that misfires for a predictable minority. Spotify has never made this configurable. The Robot Uprising lesson: make the threshold visible, even if not configurable, to prevent the same complaint.

**GitHub Repository Insights — "Active since" heuristics:**
GitHub's contribution graphs show "streaks" of activity, with gaps treated differently based on their length. The exact threshold for "does a Sunday gap break a streak?" varies by timezone configuration. GitHub has made timezone configurable (and retroactive) because getting it wrong was a source of persistent frustration for non-US developers whose contributions appeared in the wrong timezone. The retroactive reconfiguration fix is directly analogous to the recommended Option B retroactive chain update.

**Beeminder — Derailment grace periods:**
Beeminder (goal-tracking service) allows users to configure "flatline days" — the number of days with no data before a goal is considered in jeopardy. Users explicitly set this to match their expected data-entry patterns (a weekly weigh-in vs. daily). The Beeminder mental model — "I know my own behavior frequency, let me tell the system" — is exactly the argument for Option B. Users who set correct flatline values have fewer false alarms; the correct value is personal and not inferrable by the system.

**iOS Health App — Step counting with "irregular data" detection:**
The iOS Health app detects unusual gaps in step-counting data (when the phone wasn't carried) and shows "irregular data periods" in the activity graph. The detection algorithm is invisible to the user and occasionally misfires (flagging a day you left your phone at home as "irregular"). Apple has not made the detection threshold configurable. The result: a known class of users (people who don't always carry their phones) sees their health data annotated in ways that feel inaccurate. Robot Uprising should learn from this: when an algorithm fires on a user's personal data, the user should be able to inspect and override it.

---

## Sensory Description

**The inline annotation row (v1.0 transparent fixed threshold):**

A single horizontal line, flush with the timeline connector, sits between the two collapsed run segments. It is not an event dot — it has no dot on the left edge of the timeline, just a subtle em-dash connector (—) in #555. The text reads in two parts: "**52 days passed**" in 11px #999 weight, followed by a thin separator (·), followed by "Settings → Notifications → Advanced to adjust" in 10px #777 with a dashed underline.

The visual weight is deliberately minimal. On a first pass reading the chain, the annotation reads as a footnote — a whispered parenthetical between two event rows. Only players who stop and look for it will notice it. This is intentional: the information is available for the player who wants it, invisible to the player who doesn't.

On hover, the link text brightens to #aaa and the cursor becomes a pointer. No animation, no tooltip. The affordance is simple and immediate.

**The Advanced Settings panel (v2.0 configurable threshold):**

The threshold control lives in a Settings panel with a subtle indented background (#1a1a1a, 2px darker than the panel background). It reads as "inside the panel" rather than "at the panel level." The segmented control for preset values (14 / 30 / 60 / 90 days) uses capsule buttons, 36px tall, spaced 8px apart. The active selection has a solid amber fill; inactive options are text only with a 1px #444 border.

The Custom input, when the player tabs into it, shows a blinking amber cursor. The field itself is minimally styled — a 1px #444 border that transitions to 1px amber on focus. No placeholder text; a "days" label to the right clarifies the unit. The field is designed to look like an inline annotation, not a form control — it fits into the Settings panel's text density without feeling like a database entry form.

**The retroactive chain update:**

When the player changes the threshold and navigates back to the notification history, the changed chain does not slide or bounce. It cross-fades. The old chain (fragmented) fades out over 150ms. The new chain (merged or re-split) fades in over 150ms. The two animations overlap, producing a 300ms dissolve. The audio: nothing. No confirmation sound. The chain just... changes. The silence is appropriate — this is a settings change taking effect, not a game event. The visual change is the only feedback needed.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i — Multi-threshold export format: which threshold value travels with profile exports?** When a player has customized their gap threshold to 90 days, and they export their profile to a new device or share a config, should the threshold value be included in the export? Including it preserves personal configuration across devices (correct for migration); including it in a community share export might surprise recipients who don't expect personal display settings alongside gameplay configs. The export format decision should distinguish "display preferences" (threshold, sort order, etc.) from "game data" (snooze events, suppress state) and allow selective export of each category.

- **4.69e-i-a-i-f-i-α-ii — Threshold preview before confirming: "show me what this would look like"** In the Advanced Settings panel, before the player confirms a threshold change, an inline preview panel could show how their top 3 notification chains would look under the new threshold. This removes the "change setting, go back, see effect, go back, adjust" loop and makes the threshold instantly comprehensible. Tradeoff: requires rendering chain previews within the Settings panel, which is a non-trivial UI component.

- **4.69e-i-a-i-f-i-α-iii — Community-shared chains and threshold normalization** When a player shares a notification chain screenshot or exports it as a community artifact, should the chain be rendered with the player's personal threshold or with the default 30-day threshold? A chain exported with a 90-day personal threshold will look different from how it appears to another player viewing it with a 30-day threshold. Community comparability requires a "normalized export" option that re-renders the chain with the default threshold before exporting.

- **4.69e-i-a-i-f-i-α-iv — Threshold-crossed history: showing where snooze runs *would have* split at the default threshold** For a player who uses a custom threshold, offer an optional annotation in the expanded snooze list marking where the default 30-day threshold *would have* split the run. This lets the player see both their personal view and the default view simultaneously, useful for understanding the threshold's effect and for explaining their chain to community members who use the default.

- **4.69e-i-a-i-f-i-α-v — Negative feedback loop: threshold calibration from annotation engagement rate** If the inline annotation ("N days passed · Settings → Advanced to adjust") is clicked by a high percentage of players who encounter it (say, > 30% click-through to Advanced), this suggests the default 30-day threshold is misaligned for a significant population. This engagement rate is a product health metric that could inform whether to raise the default threshold in a future version (e.g., to 45 or 60 days). Not a player-facing feature, but a design health signal derivable from the annotation link click event.

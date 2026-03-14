# Fork-and-Deploy Shortcut

**Aspect:** 4.37 — After finding a winning fork via the Minimum Fix Explorer (4.20) or Multi-Scenario MFE (4.36), a one-click button applies the winning change to the active workbench config and opens the deploy queue; removes friction of manually finding and applying the change; risk: removes the learning step of "find the element in the config yourself"; design tension between helpfulness and pedagogy.

**Parent:** 4.20 — Counterfactual Simulation as Advanced Debrief Feature; 4.36 — Multi-Scenario MFE
**Siblings:** 4.38 — Counterfactual history as config evolution record; 4.39 — Adversarial counterfactual mode; 4.40 — First-viable-fix vs. minimum-fix toggle
**Related:** 4.44 — Regression check during fork-and-deploy; 5.19 — Pass-rate plateau problem; 8.09 — Diagnostic layer as teaching mechanic; 8.08 — Real-language vocabulary claim

---

## The Core Problem

The Minimum Fix Explorer ends with a list. "Here are three changes, any of which would have flipped this match. The smallest: add one buffer slot to the relay's fallback filter."

The player understands the fix intellectually. They feel the relief of diagnosis completed. And then they have to go find it.

Open the workbench. Navigate to the relay agent. Find the context config panel. Find the filter list. Find the fallback filter. Add a slot. Return to the deploy view. Queue the next run.

This takes between 30 seconds (expert who knows their config cold) and 5 minutes (player who built this configuration 3 sessions ago and isn't sure where the fallback filter lives). During those minutes, the diagnostic insight the explorer generated starts evaporating. The player forgets exactly what was recommended. They make an approximation. The next run fails for a different reason, but they're not sure if they applied the fix correctly.

**The fork-and-deploy shortcut collapses the distance between "identified fix" and "deployed fix."**

One click: apply the explorer's winning change directly to the active config, open the deploy queue, run it.

This is an ergonomics decision dressed as a pedagogical one. But the pedagogical implications are real: if the game applies the change for the player, the player never has to internalize *where in their config the fix lives*. Next mission, same architectural mistake, same fix needed — except now they don't know how to apply it because they never did it themselves.

Every navigation aid in a complex tool is also a geography lesson removed.

---

## Option Space

There are seven distinct resolutions to this tension, each making a different bet about what kind of player is sitting down.

---

### Option A: One-Click Apply (The Frictionless Path)

**What happens:** A button in the explorer results panel labeled **"Apply & Deploy"** or **"Fix and Run."** Pressing it applies the winning change directly to the active config and navigates to the deploy queue with the next run pre-queued.

**The bet:** Most players will iterate faster and learn more from running the corrected config than from spending time navigating to the config element. Seeing the fix in action teaches better than finding the fix location. The game is about iteration cycles, not about finding config elements.

**Implementation details:**
- The button only appears after an explorer result is selected (not on the results list itself — prevent accidental applies)
- A brief confirmation dialog: "Applying: Relay agent fallback filter +1 buffer slot. This changes your active config v3.2 → v3.3. Proceed?" with a dismiss button
- After apply, the workbench opens briefly with the changed element highlighted in a green glow, then fades to normal — the player *sees* what changed even if they didn't navigate there themselves
- The deploy queue auto-opens with the modified config pre-selected

**Risk:** The player builds a working config without building a mental model of why it works. Three missions later, they're blocked again and don't know where to go.

**Mitigation:** The green-glow moment. Even in the frictionless path, the game shows where the change was made for 2 seconds before continuing. This is the minimum geography lesson — not enough to fully teach, but enough to register.

---

### Option B: Guided Apply — Reveal, Then Confirm (The GPS Model)

**What happens:** After selecting a fix, the workbench opens with the relevant config element **highlighted in amber** and a contextual overlay explaining the change: "This is the fallback filter on your Relay agent. The explorer suggests adding one buffer slot here. Click to confirm." The player must click the highlighted element to apply the change.

**The bet:** The act of clicking — even if it's a single click on a pre-identified element — is a different cognitive act than watching a change happen. It requires the player to *see* where the change is and *confirm* their understanding of it.

**The GPS analogy:** A GPS tells you exactly where to turn, so you never learn the route. But a GPS that shows you the turn and asks you to confirm it ("Turn left on Elm — confirm?") is doing slightly more teaching. Still not as much as navigating from a map, but more than nothing.

**Implementation details:**
- Workbench opens in "guided mode" — everything except the highlighted element is visually dimmed
- A floating panel explains: "Explorer recommendation: [change description]. This change had [X] effect in the fork simulation. Click the highlighted element to apply."
- The player can dismiss the overlay and explore freely instead of applying (no forced path)
- After the click: apply + deploy, same as Option A

**Interaction with config complexity:** For simple configs (7 agents, 20 rules), the highlighted element is easy to find and the geography lesson is clear. For complex configs (15 agents, 60+ rules), even highlighting may not fully communicate the element's *role* in the architecture. The overlay description compensates for this.

**Cost:** Adds one mandatory click + one read of explanatory text vs. Option A. For players running 10 iterations/session, this adds ~2 minutes total. Probably worth it.

---

### Option C: Reveal-Only — Show But Don't Touch (The Anatomy Lesson)

**What happens:** After selecting a fix, the workbench opens with the relevant element highlighted, the overlay explains what the change would be, but **no apply button exists at this stage.** The player must make the change themselves.

The overlay says: "Explorer recommends: increase fallback filter buffer by 1 slot. The relevant control is highlighted. Make the change manually." Once the player makes the change (the game detects the config state matching the recommendation), the overlay transforms to a green confirmation and the deploy queue opens.

**The bet:** The act of physically making the change — dragging a slider, clicking an increment button, editing a value — encodes the location and the action into motor memory. The player who adds the buffer slot themselves knows where buffer slots live. The player who watches the game add it only knows that buffer slots exist.

**The anatomy lesson model:** When medical students learn anatomy, they don't watch an animation. They dissect. The dissection is uncomfortable and imprecise, but the tactile memory of finding the correct structure is what makes the learning stick. Robot Uprising's config is the anatomy.

**Implementation details:**
- The overlay persists as long as the recommendation hasn't been applied
- If the player makes a *different* change than recommended, the overlay notes the discrepancy: "This is different from the explorer recommendation. Your change: [X]. Explorer recommendation: [Y]. You can apply the explorer's recommendation or proceed with your change."
- This creates a branching moment: the player might have a *better* idea than the explorer. Reveal-only honors that possibility.
- The detect-and-confirm mechanic requires the game to monitor config state for the recommended change — technically lightweight but architecturally necessary

**Risk:** Some players will find this patronizing. "I know where it is, just let me apply it." These players are probably experts. For them, the guided overlay is noise. An opt-out should exist.

---

### Option D: Teaching Mode Toggle (The Accessibility Dial)

**What happens:** A global setting governs fork-and-deploy behavior:
- **Guide me** (beginner): Option B — Guided Apply with amber highlights and overlay
- **Show me** (intermediate): Option C — Reveal-Only, workbench navigates to element, player makes change
- **Do it** (expert): Option A — One-Click Apply, change applied immediately, green flash, deploy queue opens

The player sets this once during onboarding (or at first explorer use) and can change it in settings. The default for first-time players is "Guide me."

**The bet:** Different players have different learning styles and different needs at different points in their learning curve. A veteran on their 200th session wants zero friction. A new player needs the geography lesson. Letting both be satisfied without compromise is the right call for a game with this range of depth.

**The Minecraft precedent:** Minecraft survival, creative, and peaceful modes serve different player motivations simultaneously. The game doesn't judge; it accommodates. Robot Uprising's teaching mode dial is similar: it accommodates the pragmatist who wants to iterate, the learner who wants to understand, and the expert who wants speed.

**Cost:** The UI now has a setting that new players need to discover and configure. If the default is "Guide me," most players will see the guided experience and may not realize "Do it" exists. The setting should appear prominently at first explorer use, not buried in a menu.

---

### Option E: Deferred Apply with Annotation (The Commit Message)

**What happens:** One-click apply works as in Option A, but the change is applied with an **automatic annotation** on the modified config element:

> _"Auto-applied from MSMFE session — Mission 7 [2026-03-14] — Relay fallback filter +1 — Fixed 22/35 failing scenarios."_

This annotation is visible in the workbench as a small info icon on the affected element. The player can read it at any time, showing them *where* the change is and *why* it was made.

**The version control model:** Every `git commit` should have a message explaining why the change was made. A config change applied without explanation is a mystery when the player opens their config three days later. The auto-annotation is the commit message.

**Implementation details:**
- Info icon appears on modified elements in the workbench, styled in the same teal as the MSMFE
- Hovering reveals the annotation: "Changed by explorer on [date]. Original value: [X]. Explorer recommendation applied: [Y]. Result: +22 scenarios."
- The annotation persists until the player manually clears it or overwrites the element
- After a second MSMFE session on the same element, annotations stack: the history builds

**Interaction with 4.38 (Counterfactual history as config evolution record):** This is essentially 4.38 implemented at the element level rather than the config level. The annotation feeds the history. Option E and 4.38 are complementary: 4.38 records the full session history, Option E records the individual change provenance.

---

### Option F: Fork-Only, Don't Apply (The Branch Model)

**What happens:** The fix is applied not to the **active config** but to a **new fork**: v3.2 → v3.3 (Fork from MSMFE). The player can deploy v3.3 to test without contaminating their v3.2 baseline. They can also diff v3.2 and v3.3 to see exactly what changed.

**The bet:** The active config is precious. A player who has spent hours on v3.2 doesn't want a one-click button to modify it without full control. The fork-only model gives the player the benefit (fast iteration on the fix) without the risk (permanent modification to their baseline).

**The Git branch model:** You don't commit directly to `main` when testing a fix. You branch, test, merge if it works, discard if it doesn't. Config versions in Robot Uprising should work the same way.

**Implementation details:**
- The "Fork & Test" button creates v3.3 (Fork from MSMFE)
- The deploy queue shows both v3.2 and v3.3 as separate options
- After v3.3 results come in: a "Merge to baseline" button appears in the debrief if v3.3 improved the pass rate
- The player can deploy v3.2 and v3.3 in the same Gauntlet session (both configs run against the same opponent pool) for a direct A/B comparison

**Interaction with 1.06c-ext-B (Config version control as first-class infrastructure):** Fork-only is only coherent if config versioning is first-class. If the game doesn't have explicit version management, "fork" is just "create a copy," which is confusing. 1.06c-ext-B needs to be implemented for this option to function cleanly.

---

### Option G: Annotated Diff View — Show the Delta (The Code Review)

**What happens:** Before applying, the game shows a **diff view** of the config change: the exact field that would change, the before value, the after value, and the expected impact.

```
PENDING CHANGE
Agent:   Relay-7
Section: Context Config > Buffer > Fallback Filter
Before:  max_slots = 2
After:   max_slots = 3
Impact:  +22/35 failing scenarios resolved (MSMFE projection)
```

Two buttons: **"Apply this change"** (Option A behavior) and **"Navigate to element"** (Option C behavior). The player chooses how much hand-holding they want at this specific moment.

**The code review model:** Professional developers review a PR diff before merging. They understand exactly what changed without needing to navigate to every file. The diff view gives the player the same comprehension at a glance. If the change is exactly what they expected, they click "Apply." If it's surprising, they click "Navigate" and investigate.

**Cost:** Adds a step (reading the diff) that experts will skip mentally. The diff view can be collapsed to a summary line for experts: "Relay-7 fallback filter: 2→3 slots (+22 scenarios)" with an expand arrow.

---

## Recommendation: Graduated Autonomy

The ideal implementation combines aspects of Options B, E, and F:

**Default behavior (first 20 uses):**
Option B — Guided Apply. The workbench opens to the highlighted element, explains the change, requires one confirming click. The annotation (Option E) is applied automatically. The config version increments to v3.N.

**After 20 uses (unlocked):**
The explorer results panel shows a new button: **"Simplify flow."** Clicking it opens settings with three modes: Guide me / Navigate me / Apply immediately. The player makes a deliberate choice to reduce friction, with the tradeoff clearly stated: "Apply immediately will apply changes without navigating to the config element first."

**Config versioning (always):**
Every explorer-applied change creates a new version (Option F behavior for the *record*), but applies to the active config (not just a fork). The player can always revert. The version history shows: "v3.3 — Auto-applied from MSMFE, 2026-03-14."

**The regression check (4.44):**
Regardless of mode, after applying via fork-and-deploy, the game runs the regression check before opening the deploy queue: all 100 scenarios with the new config, not just the failing subset. This runs in the background (5–10 seconds). The deploy queue shows: "+22 fixed, 0 regressed, net +22. Deploy?" Regression check cannot be skipped — it is always mandatory for explorer-applied changes, never for manually-applied changes (respecting player agency).

---

## Player Journeys

---

#### Journey: Maya, 24, UX Designer (First time using the explorer)

**Context:** Mission 7 of the campaign, 63/100 passing. Maya discovered the MSMFE two sessions ago when the debrief offered to run it. She ran it, saw the results, but closed the window and manually made the change herself because she didn't trust the button. She got to 78/100. Tonight, the MSMFE found a new recommendation: relay agent fallback filter +1 buffer slot. She trusts it more now. She hovers over the "Apply & Navigate" button.

**Minute 0:00 — The explorer results panel**
The screen shows the MSMFE results: three candidate changes ranked by pass-rate delta. The top result glows softly amber:

```
1. Relay-7 fallback filter: max_slots 2→3
   Scenario improvement: +22/35 failing scenarios
   Change size: 1 field
   [Apply & Navigate] [See ghost overlay] [Dismiss]
```

Maya pauses on the "Apply & Navigate" button. She hasn't used it before. The tooltip reads: "Opens your workbench with this change highlighted. You confirm it." She clicks.

**Minute 0:08 — Workbench opens**
The workbench appears, but it looks different. Everything is slightly dimmed except one element: a horizontal row in the Context Config panel of the Relay-7 agent's card. It's glowing amber. A floating panel has anchored to it:

> **Explorer Recommendation**
> Increase fallback filter buffer to 3 slots.
> This small change resolved 22 of your failing scenarios in the fork simulation.
> Click the + button below to confirm.

Maya looks at the element. *The fallback filter. I've never actually understood what that does.* She reads the label more carefully. "Fallback Filter: signals to keep when primary targets are unavailable." Oh. When the relay can't find what it's looking for, it falls back to this filter — and she only gave it 2 slots, so it was evicting signals before it could use them.

This is the geography lesson. She just learned where the fallback filter lives and what it does.

She clicks the **+** button next to max_slots. It increments from 2 to 3. The amber glow turns green. The floating panel reads: "Change applied. Config updated to v3.3."

The deploy queue opens. The regression check runs silently in the corner — a small spinner with "Verifying changes across all 100 scenarios." Eight seconds later: "+22 fixed, 0 regressed, net +22. Ready to deploy."

**Minute 0:45 — Deploy**
Maya clicks deploy. The mission launches. She watches the execution with the expectation of 85+/100.

**What Maya learned:** She saw where the fallback filter lives. She made the change herself — even if the game highlighted it. She understands now why it was causing failures. Next time she builds a relay agent, she'll check the fallback filter buffer before deploying.

**UI Annotations:**
- **Explorer results panel**: Three rows, each with a one-line summary, pass-rate delta in green, change-size indicator (1 dot, 2 dots, 3 dots), and action buttons. Top result pre-selected with subtle amber highlight.
- **"Apply & Navigate" button**: Primary action. Amber text on dark background. Tooltip explains the flow before clicking.
- **Workbench guided mode**: 80% opacity dimming on non-relevant elements. Targeted element glows amber with a 2px border.
- **Floating panel**: 240px wide, anchored to the highlighted element via a thin amber line. "Explorer Recommendation" header in amber. Change description in plain language. "Click the + button below to confirm" instruction.
- **+ button**: Enlarged in guided mode (40px instead of 24px). Amber glow. Turns green and emits a soft chime when clicked.
- **Regression check spinner**: Small, bottom-right corner of deploy queue. "Verifying 100 scenarios..." with a progress ring. Takes 5–10s. Result: "+22 fixed, 0 regressed" in green.

---

#### Journey: Marcus, 31, Software Engineer (Expert, 180-hour player)

**Context:** Gauntlet season, current Elo is Strategist tier. Marcus just lost a match where the single-match explorer found that one hook reroute would have flipped the outcome. He's in Apply Immediately mode (set it on hour 40 of playtime). He has 4 more matches queued this session. He wants to apply the fix, deploy, and get to the next match.

**Minute 0:00 — Explorer results panel**
Marcus is in the single-match explorer, having just seen the Minimum Fix Explorer find a winning change: "Scout-3 flank hook: reroute from Channel 4 → Channel 2." One candidate. Clear. He knows exactly what this means — Scout-3's hook was pointed at a dead channel because he forgot to update it when he renamed his relay network last week.

He clicks **"Apply & Deploy"**. No confirmation dialog (he dismissed "always ask" in settings on his 12th use). The button label pulses once, amber-to-green, as the change applies.

**Minute 0:03 — Config v4.7 created**
The workbench flashes for one second showing Scout-3's hook panel. The rerouted hook pulses green — the only element on screen, bright against dim surroundings. Then the screen transitions immediately to the deploy queue.

A small badge in the version history reads: "v4.7 — Auto-applied: Scout-3 flank hook → Channel 2 (single-match fix, Match #47)."

**Minute 0:05 — Deploy queue**
Regression check has already completed (it ran during the 2-second workbench flash): "0 fixed / 0 regressed. 1 config change from previous deploy. Ready."

Marcus queues the deploy. Match 48 starts.

**What Marcus got:** Three seconds of friction removed. He knows his config cold — he didn't need the geography lesson, he already knew where the hook lived. The auto-apply saved him 45 seconds of navigation. Over 4 matches this session, that's 3 minutes. Not much individually, but it's the *feeling* of flow that matters. The explorer→deploy cycle feels seamless, not like switching contexts.

**What Marcus lost:** Nothing. He already knew the geography.

**UI Annotations:**
- **"Apply & Deploy" button**: Solid amber background, full-width in the explorer results panel. In Apply Immediately mode, no confirmation dialog — the pulse is the feedback.
- **Workbench flash**: 1-second display of the changed element before transitioning. Serves as both feedback ("here's what changed") and minimum-geography-lesson.
- **Version badge**: Tiny, bottom-left of deploy queue. Teal color. Expandable to full annotation on hover.
- **Regression check**: Pre-computed during the workbench flash, result appears instantly when deploy queue opens.

---

#### Journey: Cass, 17, Twitch Streamer (150 viewers, playing on stream)

**Context:** Cass is on Mission 9, currently at 71/100. She's been running the MSMFE live for the past 6 minutes while her chat watches. The explorer found a recommendation: "Hook chain latency: reduce ACK timeout on Command-1 from 3 ticks to 1 tick. Fixes 18/29 failing scenarios." Chat is excited — they've been arguing about whether the ACK timeout was the issue since tick 40 of the last run.

Cass has the annotation opt-out turned on (she's a streamer), but for the MSMFE she's running without the fork-and-deploy shortcut visible — she showed earlier that she'd find the element herself and fix it, as a learning moment for chat.

**Minute 0:00 — Explorer results**
The MSMFE display shows:

```
SCENARIO IMPROVEMENT: 18/29 failing scenarios
CHANGE: Command-1 hook config > ACK timeout: 3→1 tick
CHANGE SIZE: 1 field
```

Cass turns to camera. "Chat, I'm going to navigate there myself rather than using the apply button, because I want to show you exactly where this lives in the config." Chat: "GOT IT" "smartgirl" "she knows better" "do it manually."

She dismisses the explorer overlay and opens the workbench manually. The element is not highlighted — she chose to navigate herself.

**Minute 1:00 — Navigation challenge**
She's in the Command-1 card. She finds Hook Config. She sees three hooks. The ACK timeout... she scans for it. "Wait where is... hook config > ACK timeout... is this it?" She hovers over "Response window (ticks)." The tooltip reads "Maximum ticks to wait for acknowledgment signal." Chat: "THATS IT" "YES" "click it."

She finds it. Sets it from 3 to 1.

**Minute 2:00 — The moment**
"Okay. I found it. Chat called it at tick 40, I didn't believe it until the MSMFE confirmed it. Let's see if this actually does what the explorer said." She hits deploy.

**What Cass got:** A 2-minute navigation moment that generated engagement. Her chat participated in finding the element. The "navigate myself" choice created content that the "apply immediately" choice would have flattened. For a streamer, the geography lesson IS the content.

**The insight:** Fork-and-deploy's pedagogical value is highest for solo players who lack external accountability (no chat to tell them when they found the right element). For streamers, the navigation IS the engagement loop — the apply shortcut removes content rather than friction.

**The design implication:** Fork-and-deploy should be present and discoverable, but streaming-oriented players will naturally opt out of it in favor of the manual path. The streamers who do use the shortcut will use it for efficiency-demonstration content ("look how fast you can iterate when you understand the system") rather than learning content.

**UI Annotations:**
- **Explorer dismiss button**: Small X in top-right, non-destructive (explorer results remain accessible via the timeline if she navigates back)
- **Manual navigation mode**: Workbench opens normally, no highlighting, no guided mode. The player is on their own.
- **"Apply & Navigate" button remains visible**: She could press it at any time. Her choice not to is deliberate. The button's presence makes her choice visible — she's explicitly declining the shortcut.

---

## Strengths

**Reduces iteration friction at the moment friction is most costly.** The player has just spent 2–5 minutes in the debrief, built diagnostic insight, identified a specific fix. The mental model is maximally clear at this moment. If the apply step takes 3 minutes of navigation, that clarity will decay before they've confirmed the fix.

**Makes the debrief loop feel like a tight cycle.** Debrief → explorer → apply → deploy should feel like a single diagnostic session, not like switching contexts. The shortcut preserves the session's momentum.

**Serves late-game expert players appropriately.** A player on their 200th session knows their config cold. Making them navigate to confirm a change they already understand is an insult to their expertise. The Apply Immediately mode respects hard-won familiarity.

**The annotated version history is a gift to future self.** Every auto-applied change carries a reason. "v3.3 — MSMFE 2026-03-14, +22 scenarios" tells the player exactly what changed and why when they open their config next week. The annotation makes the shortcut's action legible across time.

---

## Weaknesses

**The learning step removal is real.** Players who use Apply Immediately mode for every fix will eventually hit a novel failure that the explorer can't solve (structural failure, not parametric failure). At that point, they need to navigate their config manually — and they haven't been building that navigation skill.

**The regression check adds mandatory latency.** Even in Apply Immediately mode, the regression check runs before the deploy queue opens. For a player running 15 iterations/session, this adds 1.5–2.5 minutes of cumulative wait time. Some players will find this frustrating — "I pressed Apply, just let me deploy." The regression check cannot be made optional (it prevents introducing silent regressions) but it should be made legible: show the progress explicitly so the player understands the wait.

**Multi-fix conflicts.** If the player has run both the single-match explorer (finding fix A) and the MSMFE (finding fix B) in the same session, and both fixes have been marked as "pending apply," applying both sequentially may create conflicts. Fix A changes agent X; fix B also changes agent X. The system needs to detect this and surface a conflict resolution dialog. This is a nontrivial UX problem.

**The "apply wrong fix" failure.** The explorer presents multiple candidate fixes ranked by quality. If the player accidentally applies fix #3 instead of fix #1, the change is made, the regression check runs, and the result is an improvement but not the optimal one. The confirmation flow (Option B/G) prevents this; Apply Immediately mode does not.

---

## Interaction Effects

**With 4.38 (Counterfactual history as config evolution record):** Fork-and-deploy is the write path for 4.38. Every applied fix creates a history entry. If 4.38 is implemented, fork-and-deploy must write to it. If 4.38 is deferred, the auto-annotation (Option E) serves as a lightweight substitute.

**With 4.44 (Regression check during fork-and-deploy):** The regression check is mandatory for explorer-applied changes. The fork-and-deploy button should not open the deploy queue until the regression check completes. The UI must communicate this: the deploy queue is "loading" during the regression check, with a clear progress indicator.

**With 1.06c-ext-B (Config version control as first-class infrastructure):** Fork-and-deploy requires version numbering to be coherent. If configs are unnamed and unsaved (just "current config"), auto-apply has nowhere to write "v3.3." Version control must be first-class for auto-apply to be meaningful. The shortcut *reveals* the need for proper versioning — it can't exist cleanly without it.

**With 2.00a (Fully deterministic execution):** The regression check (100-scenario re-run) is computationally feasible only because execution is deterministic and fast. If the execution model uses LLM agents (2.00d), re-simulating 100 scenarios would be prohibitively expensive. Fork-and-deploy is architecturally coupled to the deterministic execution model.

**With 5.19 (Pass-rate plateau problem):** The pass-rate plateau is "players who get 80/100 and feel done." Fork-and-deploy may *exacerbate* this by making 80→90 iterations feel fast enough that 90→100 still feels like extra work. The shortcut reduces friction in the 63→85 range but doesn't help with the last 15 scenarios, which require structural redesign rather than single-element fixes. The game should communicate this: once the explorer returns "0 changes that improve pass rate," the shortcut disappears and the game implicitly signals "structural redesign needed."

**With 8.09 (Diagnostic layer as teaching mechanic):** Fork-and-deploy is the apply end of the diagnostic loop: observe (debrief) → diagnose (explorer) → apply (fork-and-deploy) → verify (deploy). Option B/C's guided navigation reinforces the diagnostic loop by making the apply step visible. Apply Immediately mode preserves loop speed but sacrifices visibility of the apply step. The teaching arc should start visible (Option B, early campaign) and let the player unlock invisibility (Apply Immediately, after demonstrating mastery).

---

## Comparable Games / Precedents

**Git `git apply` vs. manual patching:**
When a bug report includes a patch file, you can apply it with `git apply [patch]` or read the diff and make the changes manually. Expert developers use `git apply` for reviewed patches — they read the diff first, understand it, then automate the mechanical application. Beginners are sometimes told to apply manually because the act of touching each changed line builds comprehension. The fork-and-deploy shortcut is precisely this tradeoff, with the game's explorer-generated recommendation as the patch file.

**IDE quick-fix actions (IntelliJ / VS Code):**
When an IDE detects a code issue, it offers a "quick fix" lightbulb. Clicking applies the fix automatically. Senior developers use quick fixes constantly — they already understand the pattern ("add missing import," "convert to lambda"). Beginners are sometimes advised to not use quick fixes until they understand *why* the fix is correct, because blind quick-fix use produces code the developer can't maintain.

Robot Uprising's fork-and-deploy is a game quick-fix. The same tension applies.

**Slay the Spire's card upgrade system:**
When you choose to upgrade a card in Slay the Spire, the game shows you exactly what changes (before/after the upgrade). You can't apply the upgrade without seeing it. This is Option G's diff view applied to a roguelike. The player always understands what they're doing — the upgrade UI enforces comprehension before action.

**Chess.com's "explore" vs. "practice" modes:**
Chess.com's post-game analysis lets you "explore" variations interactively (move pieces yourself) or "follow best moves" (the engine applies moves for you). The explore mode builds understanding; the follow mode shows optimal play but teaches less. Both exist. Players use both for different purposes.

**Opus Magnum's solution sharing:**
You can download and watch another player's solution, but you can't import it directly into your own puzzle — you must build your own version inspired by what you saw. This is a deliberate pedagogy choice: understanding a solution and being able to implement one are different skills. Robot Uprising's Option C (reveal-only) is the same bet applied to config changes.

---

## Sensory Description

**The "Apply & Navigate" button:**
A warm amber rectangle, 120px wide, 36px tall, with rounded corners. The text reads "Apply & Navigate" in medium-weight sans-serif. On hover, the amber deepens slightly and a subtle glow extends 4px outward. On click, the button color shifts through amber-to-white-to-green in 200ms, then the workbench transition begins.

**The guided workbench view:**
The normal workbench is a dense grid of agent cards and config panels in dark navy with bright accent lines. In guided mode, a 60% opacity black layer settles over the entire screen except the targeted element. The targeted element sits in a clear pool, surrounded by an amber border that pulses slowly — a 2-second cycle, 1px to 2.5px and back, like a heartbeat. The floating panel appears from below the element, expanding smoothly from 0 to full height over 300ms.

**The confirmation click:**
When the player clicks the + increment button (or the equivalent input for the targeted change), two things happen simultaneously: a soft chime in the high register (C5, 80ms decay) and the amber border transitions to green in 400ms — not instantly, but a smooth color cycle that communicates "good change applied, not error." The floating panel's instruction text changes to: "Done. Your config is updated." The green border fades over 2 seconds, leaving the element highlighted in green-tinted normal coloring.

**The Apply Immediately flash:**
In expert mode, the workbench appears for exactly 1 second before transitioning to the deploy queue. During that second, the entire screen is normal workbench lighting except the changed element, which is vivid green, oversaturated compared to the rest of the UI. A brief sound: a single synthetic "click" in the low register (G3) followed immediately by the chime. The combination sounds like "acknowledged and done." Then the deploy queue slides in from the right.

**The regression check:**
The deploy queue appears with a horizontal progress bar at the top, animated left-to-right in teal. Above it: "Verifying changes across 100 scenarios..." in small text. The bar takes 5–10 seconds. When complete, the bar resolves to a summary line: "+22 fixed · 0 regressed · net +22" in bright teal on dark background. Then it fades and the deploy button becomes active.

**The pending-apply badge (when not yet applied):**
While the explorer has found a result but the player hasn't applied it, a small amber badge appears on the workbench tab button in the navigation: a dot 8px in diameter, amber, not blinking. On hover: "1 pending explorer recommendation." It persists until applied or dismissed. It's the "uncommitted changes" indicator of the debrief loop.

---

## The TikTok Clip

The clip opens mid-debrief: the MSMFE progress bar completes, and the result appears: "+22/35 scenarios." The player hovers the "Apply & Navigate" button, clicks. The workbench slides in, dim everywhere except one glowing amber element — a single buffer slot counter labeled "fallback filter: max_slots." The player clicks + once. The amber turns green. A soft chime. The deploy queue opens. "+22 fixed, 0 regressed." One more click: deploy.

Cut to execution: 84/100 scenarios resolved. The scenario grid fills green.

Total time from "explorer result found" to "mission running": 22 seconds.

Text overlay: "17 minutes of debrief → 1 change → 84/100."

Caption: "Robot Uprising teaches you to debug your own AI. This was my third iteration this session."

---

## New Aspects Discovered

- **4.45 — The "pending apply" badge on the workbench:** a persistent amber dot when a fork-and-deploy fix is pending, visible on the workbench tab/button in navigation; the badge as a "uncommitted changes" / "commit pending" metaphor from version control; whether it should pulse (urgent) or remain static (informational); interaction with multi-fix queuing when multiple explorer sessions have found pending changes.

- **4.46 — Multi-fix queuing and conflict resolution:** when multiple explorer sessions (single-match + MSMFE, or two MSMFE sessions) have found pending changes affecting the same agent, the game must detect conflicts and surface resolution UI; "apply in order" vs. "merge" vs. "choose one" as resolution options; what a config merge conflict looks like in Robot Uprising's UI vs. in a text diff; whether the player can preview the merged result.

- **4.47 — The autonomy dial as game-wide accessibility mechanism:** fork-and-deploy's teaching mode toggle (Guide me / Navigate me / Apply immediately) is one touchpoint of a broader "autonomy dial" setting that governs how much the game does for the player across all diagnostic tools — auto-annotation, always-on diagnostic ring, guided debrief Act 2 walkthrough, guided hook wiring; a single master setting that shifts all tools simultaneously rather than per-tool configuration; the dial as a meaningful difficulty axis orthogonal to enemy scaling.

- **4.48 — Undo for applied fixes:** since fork-and-deploy creates a config change that can be deployed and create regressions, a one-click "undo last auto-applied fix" action should exist; the undo creates a new version (v3.4: reverted) rather than destructively overwriting v3.3; what the undo affordance looks like in the workbench and in the version history; how long the undo history is preserved (session only vs. permanent).

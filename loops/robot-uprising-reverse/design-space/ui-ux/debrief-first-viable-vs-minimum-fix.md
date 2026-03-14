# "First Viable Fix" vs. "Minimum Fix" Toggle in the Explorer

**Aspect:** 4.40 — Stopping at first candidate that flips the outcome vs. checking all candidates for smallest change; "find first flip" faster (early termination), "find minimum fix" more precise; surfacing this tradeoff as a player choice is itself an educational moment about search strategies.

**Parent:** 4.20 — Counterfactual Simulation as Advanced Debrief Feature
**Siblings:** 4.36 — Multi-Scenario MFE; 4.37 — Fork-and-deploy shortcut; 4.38 — Counterfactual history; 4.39 — Adversarial counterfactual mode
**Related:** 1.04e — 100-test-case robustness pattern; 4.41 — Cluster-masked failure discovery; 4.44 — Regression check during fork-and-deploy; 8.09 — Diagnostic layer as teaching mechanic; 8.08 — Real-language vocabulary claim

---

## The Core Concept

The Minimum Fix Explorer enumerates candidate config changes, runs each through a simulation, and reports which changes would have flipped the outcome. The word "minimum" in the name implies exhaustiveness — you find the *smallest* change that works, not just *any* change.

But exhaustiveness has a cost: you run every candidate. With 150 candidates and 200ms per simulation, that's 30 seconds of wall-clock time. Acceptable. But the MSMFE (Multi-Scenario) multiplies that by the number of failing scenarios. Suddenly the exhaustive minimum-fix search becomes 3–17 minutes.

**The "first viable fix" mode is early termination:** stop as soon as the first candidate that flips the outcome is found.

The tradeoff is classic and well-known in search algorithm design:
- **First viable fix**: O(1) expected if the search space is ordered well, but returns an *arbitrary* fix — not the smallest, not the most architecturally meaningful, not the one that generates least technical debt. Fast. Possibly wrong diagnosis.
- **Minimum fix**: O(n) — must evaluate all candidates to know which is minimum. Returns the structurally purest diagnosis. Slow. Definitely right diagnosis (within the defined candidate space).

**The design question is not "which is better?"** — both are useful in different contexts. The design question is:

1. Should this choice be exposed to the player at all?
2. If yes, how is it framed? What language makes the tradeoff legible?
3. Does the act of making this choice *teach something about search strategies*?
4. Should the game recommend a default, or let the player discover which they prefer?

This document explores all four questions and the full option space.

---

## Why This Is Pedagogically Loaded

Robot Uprising's vocabulary claim (aspect 8.08) is that the game uses the same words as real agentic AI engineering. Skills, rules, hooks, context — same concepts, no metaphor. When a player leaves the game and goes to build a real agent, the concepts transfer directly.

**The first-viable-fix vs. minimum-fix distinction is a real engineering decision** that players will encounter outside the game:

- When writing test harnesses: do you fix the first failing assertion or find all failures before fixing anything?
- When debugging distributed systems: do you patch the first cause-and-effect chain you trace, or do you enumerate all contributing causes before touching production?
- When doing performance optimization: do you fix the first profiled bottleneck, or do you profile the entire system and rank by impact?
- When doing red-team security analysis: do you stop at the first exploit found, or do you enumerate all attack surfaces?

The professional answer is "it depends on your goal, your time budget, and the cost of deploying an imperfect fix." The game can teach this distinction directly — not through a tutorial that says "here's a concept called early termination" but through the visceral experience of choosing speed and getting an arbitrary fix vs. choosing precision and waiting.

**The TikTok clip for this mechanic:** Player hits "Find First" and a fix appears in 4 seconds. They click Apply. The next run fails for a totally different reason. They rerun the explorer in "Find Minimum" mode, wait 25 seconds, and discover there was a *smaller* underlying fix the first one masked. The "aha" expression is the clip.

---

## The Search Space and How It's Ordered

Before discussing options, the technical reality:

The Minimum Fix Explorer generates candidates by enumerating mutations to the active config:
- Buffer size ±1 slot (per agent, per context config)
- Rule priority swap (reorder two adjacent rules in a ruleset)
- Hook threshold ±1 (numeric trigger condition)
- Skill enable/disable toggle (enable a skill that was off, disable one that was on)
- Filter add/remove (add or remove one entry from a context filter list)

With a typical mid-game config of 4 agents × 3 context configs × 4 rules × 5 hooks, the candidate space is approximately 80–200 mutations. Each requires a full match simulation (~200ms deterministic tick replay) to evaluate.

**Total exhaustive search time: ~30 seconds (single match, ~150 candidates).**

When ordered naively (in config-file order), the "first viable fix" mode depends entirely on which candidate happens to appear first. If the fix is buffer-related, and buffer mutations come before hook mutations in the enumeration order, "first viable" finds the fix quickly. If the fix is a hook threshold, and hooks come last in enumeration, "first viable" may run through 140 candidates before finding the fix — almost as slow as exhaustive.

**The interesting design: can the enumeration be ordered intelligently?**

Yes. The explorer can pre-rank candidates by a heuristic before running simulations:
- Put single-element changes before compound changes
- Put elements that were "active at the pivot tick" first (the scout agent was processing at tick 52 when the match turned — mutations to the scout are ranked higher)
- Put elements the player recently modified first (if you changed the relay's buffer 3 sessions ago, that's a likely suspect)
- Put elements with high "volatility scores" first (elements that produced the most distinct states across replay ticks)

With smart pre-ranking, "find first flip" becomes a much stronger heuristic: you're not just stopping at the first arbitrary fix, you're stopping at the first fix *among the most likely candidates*. The result is more often architecturally meaningful even in "first flip" mode.

This pre-ranking is invisible infrastructure that makes "first flip" a less misleading default. But it's worth surfacing as a player-legible option because it opens a meta-conversation: "how does the game decide what to try first?"

---

## Option Space

### Option A: No Toggle — Always Minimum Fix

**What happens:** The toggle does not exist. The explorer always runs exhaustively and returns the minimum fix. The player has no choice about search strategy.

**Framing:** "ANALYZING... (23 seconds)" with a progress bar.

**The bet:** Players don't need to understand search strategies — they need good diagnostic results. Surfacing the tradeoff as a choice adds cognitive overhead that benefits few players. The game's teaching happens through use, not through meta-commentary on algorithms.

**Strengths:**
- Consistent results across all players — everyone gets the same diagnostic quality
- No decision fatigue at debrief (player just waits for the answer)
- Minimum fix is the *correct* answer to the question being asked — any other answer is incomplete
- Simpler UI: no toggle to design, explain, or maintain

**Weaknesses:**
- 30+ seconds is a noticeable wait — some players will click away, miss the result, or lose the diagnostic moment entirely
- Doesn't surface a real engineering distinction that has transfer value
- Misses the pedagogical opportunity to teach "search strategy as a design choice"
- For MSMFE with many failing scenarios, exhaustive may become genuinely unacceptable (3–17 minutes)

**Who this serves best:** Players who want clean, authoritative diagnostic results and are willing to wait for them. Zachtronics veterans who expect precise tooling.

---

### Option B: No Toggle — Always First Viable Fix (with Smart Pre-ranking)

**What happens:** The toggle does not exist. The explorer runs with smart pre-ranking and stops at the first flip. Returns in ~4 seconds (usually finding the fix in the first 15–25 candidates with good pre-ranking).

**Framing:** "FIX FOUND: Relay fallback filter +1 slot" — appears quickly, no visible wait.

**The bet:** Players want instant feedback. Speed generates more iteration cycles, and more iteration cycles generate more learning. The pre-ranking heuristic is good enough that "first flip" is nearly always architecturally reasonable. The game is about managing systems quickly, not about perfect static analysis.

**Strengths:**
- Feels instant and magical — the game "knows" what's wrong almost immediately
- High iteration velocity — players run the explorer 5 times in the time it takes Option A to run once
- Pre-ranking makes the first-flip result more often meaningful than purely arbitrary
- No cognitive overhead for the player

**Weaknesses:**
- The first-flip result will sometimes be wrong — a symptom rather than a cause, a local fix rather than a structural one
- Players will apply fixes that mask deeper problems, leading to recurring failures (the "cluster-masked failure" problem, aspect 4.41)
- The pre-ranking is invisible — players can't tell why this fix was found first or whether a better fix exists
- Misses the teaching moment entirely — players never learn there's a tradeoff here at all

**Who this serves best:** Casual players, early-game players, players who prefer fast iteration over deep diagnosis.

---

### Option C: Toggle with UI — Player Chooses Every Time

**What happens:** The explorer UI has a clearly visible toggle at the top of the panel:

```
[ FIND: (○) FIRST VIABLE FIX  (●) MINIMUM FIX ]
         ~4 seconds              ~30 seconds
```

The time estimates update dynamically based on config complexity. Player selects mode before running.

**The bet:** This is a decision with real consequences and educational value. Surfacing it explicitly teaches search strategy as a first-class concept. Players who care will engage with it. Players who don't care will pick one and stick with it.

**Framing language options:**
- "First Viable Fix / Minimum Fix" (technical, matches real engineering vocabulary)
- "Fast Scan / Deep Analysis" (accessible, hides the algorithmic logic)
- "Quick Fix / Thorough Diagnosis" (intuitive, slightly misleading — "quick fix" implies the fix itself is lower quality, not just the search)
- "Stop at First / Check All" (literal, but sounds like a modal dialog, not a game)

**UI anatomy — the toggle panel:**

The toggle sits at the top of the Fix Explorer results panel. Below it: the candidate list (which populates as results come in, even in exhaustive mode — each result appears as it's confirmed, so the player sees progress rather than a static loading bar). The currently-highlighted result (the one the player is hovering) shows: what changes, which agent, what field, the estimated impact.

In "FIRST VIABLE" mode, the list populates quickly and then shows a single confirmed entry plus a grayed-out indicator: "1 of potentially N fixes found — run in MINIMUM FIX mode to find the smallest change."

In "MINIMUM FIX" mode, the list populates progressively, each new entry potentially displacing the previous "minimum" as a smaller fix is found: the minimum indicator bounces down the list as search proceeds. When the search completes, the final minimum is highlighted with a gold border.

**Strengths:**
- Teaches a real engineering concept through a real choice with real stakes
- Both modes are available, for different use cases
- The time estimates contextualize the tradeoff concretely: 4 seconds vs. 30 seconds is legible in a way that "O(1) vs. O(n)" is not
- Players who discover the tradeoff through play (I applied the first fix, got a different failure, realized I should have run minimum) will have a genuine learning moment

**Weaknesses:**
- Cognitive overhead on every explorer invocation — players must make a meta-decision before getting their diagnostic answer
- The toggle is UI surface area that needs to be designed, explained, and maintained
- New players won't understand what "Minimum Fix" means and may just pick arbitrarily
- "30 seconds" may feel like a punishment for picking the "right" answer

**Mitigation:** Default to MINIMUM FIX. Most players will leave the default, get the thorough answer, and occasionally be curious about the faster mode. Players who care about speed will discover the toggle. The framing communicates that MINIMUM FIX is the more thorough option, not just the slower one.

**Who this serves best:** Players who are actively engaged with the diagnostic layer and want to understand what the tool is doing. Mid-to-late game players who have already encountered both modes organically.

---

### Option D: Adaptive Mode — Game Chooses Based on Context

**What happens:** The toggle does not exist as a player choice. Instead, the game selects the mode based on context rules:
- In tutorial missions: First Viable Fix (fast feedback, don't punish new players with waits)
- In early campaign missions (1–4): First Viable Fix
- In late campaign missions (5+): Minimum Fix
- In Gauntlet/competitive mode: Minimum Fix always
- In MSMFE with >50 failing scenarios: First Viable Fix per scenario (too slow otherwise)
- If the player has previously been given a "first viable" result that turned out to be masking a deeper failure (detected by recurring failure pattern analysis, aspect 4.49): Minimum Fix for this session

**The bet:** The game can be smarter about context than any player-configurable toggle. The player's goals change across the game arc; the tool should adapt.

**Strengths:**
- No cognitive overhead — the player just runs the explorer and gets results
- Adaptive design means the tool is usually doing the right thing for the player's current situation
- The first-viable-to-minimum-fix progression mirrors the real engineering arc: junior devs fix the first thing they find, senior devs root-cause before touching production
- The "recurring failure triggered minimum fix" mode is a sophisticated learning signal: the game notices you've been applying first-viable fixes and silently upgrades you

**Weaknesses:**
- Invisible — players don't know why their explorer sometimes runs for 4 seconds and sometimes 30 seconds; this feels inconsistent and may be frustrating
- The adaptive rules are complex and edge-case-prone: what if a late-game player is in a speed-run mindset and wants fast results?
- The "silently upgrades to minimum fix because of recurring failures" behavior needs to be explained or it will be confusing
- Misses the explicit teaching moment — even if the game always makes the right call, the player never internalizes the distinction

**Mitigation:** Show the mode being used in the UI, with a brief label: "Deep Analysis" or "Quick Scan" — not a toggle, but visible state. If the mode was auto-selected, a small tooltip: "Deep Analysis selected — you've had recurring failures in this config area." The player sees the decision, even if they didn't make it.

**Who this serves best:** Casual players who don't want to think about tool internals. Players who trust the game's guidance.

---

### Option E: Progressive Discovery — Start Hidden, Surface Over Time

**What happens:** The explorer always starts in First Viable Fix mode. The toggle doesn't exist yet. At a specific trigger — the player's third time encountering a different failure after applying a first-viable fix — the game surfaces the toggle for the first time:

**Debrief panel, after third recurrence:**
> *"This failure pattern has appeared before. You may be fixing symptoms rather than causes. A more thorough analysis takes 30 seconds but finds the structurally smallest fix — not just the first one that works. Enable thorough mode for this run?"*

From this point forward, the toggle is always visible. The player has earned it by demonstrating they're ready for it.

**The bet:** The toggle has no meaning until the player has experienced the difference. Unlocking it through play ensures it arrives with context — the player already knows what "first viable fix led me astray" feels like, so "minimum fix" has meaning.

**Strengths:**
- Progressive disclosure — complexity arrives when the player is ready for it
- The unlock trigger (three recurrences) ensures the lesson arrives with lived experience behind it
- Mirrors real engineering learning: you don't know about root-cause analysis until you've been burned by patching symptoms
- No cognitive overhead for new players

**Weaknesses:**
- Some players will never trigger the recurrence condition — they'll play in first-viable mode forever without realizing there's more
- The "three recurrences" trigger assumes the player is paying attention to failure patterns — not all players are
- Feels paternalistic to withhold tooling based on behavior tracking
- The explanation text when the toggle unlocks needs to be careful not to feel like the game is accusing the player of doing something wrong

**Mitigation:** Ensure the unlock trigger fires on any three total recurrences across the campaign (not just in one mission), and keep the unlock text neutral and curious rather than corrective.

**Who this serves best:** New players who don't need to think about search strategies. Veterans who will hit the trigger quickly and not be annoyed by the initial absence.

---

### Option F: Expose the Enumeration Order — Make Pre-ranking Visible

**What it is:** A third mode, beyond First Viable and Minimum Fix: **Ranked Mode**. The explorer runs exhaustively but sorts results by the pre-ranking heuristic — most likely to be architecturally meaningful first. It still finds all fixes (Minimum Fix territory) but displays them in priority order rather than size order.

The top result in Ranked Mode may not be the smallest fix, but it's the fix that affects the element most active at the pivot tick. The player can see why it's ranked first: a small info-tag shows "ranked #1: RELAY-C was active at pivot tick 52."

This is a third axis: not speed vs. accuracy, but *ordering heuristic* — "what dimension do you care about most in this list?"

**The three-way toggle:**
```
FIND: (○) FIRST VIABLE  (●) MINIMUM FIX  (○) RANKED
       ~4 sec              ~30 sec            ~30 sec
       first flip         smallest          most relevant
```

**Strengths:**
- Exposes the pre-ranking as a player-legible concept (not just invisible infrastructure)
- Ranked Mode may generate more useful results than Minimum Fix for players who care about the *cause* more than the *size*
- Makes explicit that "smallest fix" and "most relevant fix" are different dimensions of "best"
- High transfer value: this is how you think about search results in real systems (relevance ranking vs. size ranking vs. chronological)

**Weaknesses:**
- Three modes is probably one too many for a debrief tool
- The distinction between Minimum Fix and Ranked Mode is subtle and may not be legible to most players
- Ranked Mode's results are heuristic-dependent — if the pre-ranking is wrong, Ranked Mode is worse than Minimum Fix

**Who this serves best:** Deep-engagement players who want to understand not just what to fix but *why the game thinks that element is relevant*.

---

## Recommended Design: Option C with Option E Gating

The toggle (Option C) has clear pedagogical value. The progressive discovery gating (Option E) ensures it arrives with context.

**Implementation:**

**Phase 1 — First Viable (Hidden Toggle):**
- Explorer always runs in First Viable mode
- Results appear in ~4 seconds
- The toggle control exists in the DOM but is hidden (opacity: 0, pointer-events: none)
- Results panel shows a small faint label: "QUICK SCAN" in the corner

**Phase 2 — Toggle Unlocked (after first recurrence):**
- On the player's first "you already fixed this area and it failed again" debrief, the toggle fades into view:
  > *"Analysis mode unlocked: this fix may have a deeper cause. Try a thorough scan."*
- The toggle is now visible, defaulted to MINIMUM FIX
- The label changes to "THOROUGH SCAN" in the corner
- A subtle one-time tooltip: "Thorough scan checks all possible fixes and returns the smallest one. Takes ~30 seconds."

**Phase 3 — Player owns the toggle:**
- The toggle is persistent (remembered per-session, not per-run)
- Players who prefer speed can switch back to QUICK SCAN; it's their choice
- The game never hides the toggle again
- The label always shows which mode is active

---

## The Toggle UI — Visual Design

The toggle lives in the top-right corner of the Fix Explorer panel, opposite the "Run Analysis" button.

**Visual treatment:**

Two pill-shaped buttons side by side:

```
[⚡ QUICK]  [◎ THOROUGH]
```

- **QUICK** (lightning bolt icon): cool blue background when active, dim when inactive. Icon is a lightning bolt — fast, immediate, imprecise. Time estimate appears on hover: "~4 sec"
- **THOROUGH** (target/crosshair icon): deep violet background when active, dim when inactive. Icon is a targeting reticle — precise, deliberate. Time estimate on hover: "~25 sec"

When QUICK is active and there's a pending result, the result card has a thin yellow border and a small tag: "FIRST MATCH — may not be smallest."

When THOROUGH is active and the search is running, each candidate result appears as a dim card in the list before being confirmed — a ghost of a result, width pulsing gently, that brightens to full opacity when that candidate's simulation completes. The current "leading minimum" is highlighted in violet. As smaller fixes are found, the leading minimum shifts — old minimums fade, new minimum brightens. The player watches the minimum shrink in real-time.

**Audio:**
- QUICK mode: a fast three-note ascending chord when the result appears. Feels like a ping. Immediate.
- THOROUGH mode: a slow building sound — low drone while candidates are evaluated, followed by a resonant tone when the final minimum is confirmed. Feels like a radar lock completing.

**The moment of switching modes:**
If the player switches from QUICK to THOROUGH after already seeing a quick result, the existing result fades out and the full search begins. A brief transition: "Running thorough analysis — checking all 147 candidates..." The ghost cards populate and begin confirming one by one.

---

## Player Journeys

### Journey: Nadia, 29, software engineer, first month playing Robot Uprising

**Context:** Mission 6 — "Relay Threshold Problem." Nadia is 3 weeks in, has built a working 4-agent config, but keeps failing at a consistent ~65/100 pass rate. She's used the Fix Explorer twice before but always just clicked whatever appeared first.

**Minute 0:00 — The Debrief Opens**

The debrief screen loads. Nadia sees the familiar two-panel layout: left side shows the match timeline with the pivot tick diamond (tick 41), right side shows the Fix Explorer panel, already open from her last session.

She's in QUICK mode (the lightning bolt is blue). She doesn't remember what that means — she just knows it gives her a result fast. She clicks "Run Analysis."

Four seconds later: "FIRST VIABLE FIX: Scout agent — beacon threshold –2 ticks."

She recognizes the scout. She's tweaked that agent a lot. The fix seems plausible. She clicks Apply & Deploy (fork-and-deploy, aspect 4.37). The mission re-runs.

Pass rate: 61/100. Worse.

Nadia blinks. She applied the recommended fix and got worse results.

**Minute 1:30 — The Game Surfaces the Toggle**

The debrief opens again. This time, the Fix Explorer panel has a small amber banner at the top:

> "Your pass rate dropped after applying the previous fix. The quick scan found the first matching candidate, not necessarily the best one. Thorough mode checks all candidates and returns the smallest fix."

Below the banner, a toggle control fades into view. The THOROUGH button pulses once — not aggressively, just a single soft pulse, like a notification clearing.

Nadia hovers over it. A tooltip: "Checks all 143 candidates. ~28 seconds. Returns the smallest config change that would have improved this scenario cluster."

She clicks THOROUGH. Clicks Run Analysis.

She watches the ghost cards appear in the results list. Dim cards, pulsing gently. One by one they brighten or fade. At second 8, a result settles: "Relay agent — fallback filter, remove 'NOISE' tag." At second 14, a smaller result appears and displaces it: "Relay agent — context buffer +1 slot." At second 22, no further displacement — the search completes.

Final result: "MINIMUM FIX: Relay agent — context buffer +1 slot." Smaller than what she found last time.

She applies it. Pass rate: 79/100.

**Minute 3:00 — The Learning Moment**

Nadia pulls up the counterfactual history (aspect 4.38). She sees two entries:
- v3.1 → v3.2: Scout agent beacon threshold –2 ticks (QUICK SCAN result). Pass rate: 61/100. ↓
- v3.2 → v3.3: Relay agent context buffer +1 slot (THOROUGH result). Pass rate: 79/100. ↑

The quick fix changed the scout's behavior — which slightly helped one failure cluster but exposed a worse failure in a different cluster. The minimum fix found a different element entirely: the relay's buffer was the root cause. The scout threshold was a downstream symptom.

Nadia stares at this for a moment. She types in the chat tool (if the game has a community feature): "wait, did anyone else notice that quick scan can give you *worse* results than no fix?"

**What she wants to do next:** Run thorough mode again, but this time on the multi-scenario explorer she's been avoiding because it seemed slow. Now slow seems reasonable.

**UI Annotations:**
- Toggle panel: amber banner fades in from above the toggle after pass-rate regression detected; pulses once then holds static
- Toggle pill buttons: QUICK shows lightning bolt, THOROUGH shows crosshair
- Ghost cards in results list: 40% opacity, width oscillates ±2px on a 2-second cycle, brighten to 100% when candidate confirmed
- Leading minimum: violet highlight, replaces previous minimum with a brief slide animation (old card dims, new card brightens and slides to top)
- Config diff in result card: shows the element in red → green diff format: "context.buffer: 4 → **5**"

---

### Journey: Marcus, 44, project manager, casual player, on his commute

**Context:** Mission 4 — "Forward Sentry Chain." Marcus plays in 15-minute sessions on his phone (mobile version or Steam Deck). He has a working config that passes 80/100 scenarios, wants to push to 90/100 before moving on.

**Minute 0:00 — The Debrief Is Fast**

Marcus opens the debrief. He's familiar with the Fix Explorer — it usually just gives him an answer in a few seconds. He hasn't noticed the toggle exists; it's in the corner and he ignores UI elements he hasn't explicitly needed.

He runs the explorer. QUICK mode by default. Four seconds: "FIRST VIABLE FIX: Striker agent — patrol radius +2 tiles."

He applies it. 83/100. Progress.

He runs the explorer again. Four seconds: "FIRST VIABLE FIX: Striker agent — patrol radius +2 tiles." (Same result — the same element is still the dominant candidate in the pre-ranking.)

He applies it again. 85/100.

**Minute 4:00 — The Diminishing Returns**

He runs the explorer a third time. Same result. He applies it. 85/100 — no change.

He tries again. Same result. No change.

Marcus is in a pass-rate plateau (aspect 5.19, mentioned in 4.36). The same first-viable fix keeps appearing because the pre-ranking keeps surfacing the scout element (it was active at the pivot tick), but applying the fix twice already means further changes to it produce no benefit. The underlying root cause is somewhere else.

If Marcus were running THOROUGH mode, he'd get a different result: a different element, possibly a smaller change, that addresses a different failure cluster.

**Minute 8:00 — The Silent Plateau**

Marcus doesn't know why he's stuck. He opens the Fix Explorer, runs it, applies the result, sees no change, feels frustrated. He closes the app.

He doesn't know about the toggle. He doesn't know THOROUGH mode exists. This is an information architecture failure.

**What the game should have done:**

After the second application of the same fix with diminishing returns (85% → 85%), the game should surface the toggle. The amber banner: "The same fix has been applied twice with decreasing effect. A thorough scan may find a different, smaller change targeting a different failure cluster."

With this prompt, Marcus would try THOROUGH mode, wait 28 seconds (slightly annoying on commute but acceptable), and get a different diagnostic result. His plateau would break.

Without this prompt, Marcus exits. The plateau stays. He may not return.

**UI Annotations:**
- Plateau detection trigger: same fix applied twice, no pass-rate improvement on second application
- Banner copy variant for plateau: "Thorough scan finds the smallest change across all candidates — not just the most likely one. Try it when quick scan returns the same fix repeatedly."
- Mobile consideration: the toggle pill buttons should be larger (44px tap target minimum) and the time estimates should read "~4s" / "~30s" not "~4 seconds" / "~28 seconds" — character count matters at small sizes

---

### Journey: Zara, 22, CS student, late-game competitive player

**Context:** Gauntlet mode, preparation phase. Zara is optimizing her config before a rated match. She's in the planning phase, running test scenarios against the mission preview set to tune her config.

**Minute 0:00 — Zara Already Knows About the Toggle**

Zara discovered the toggle in Week 2. She uses THOROUGH mode by default — she's a CS student and immediately understood "first viable vs. minimum" the first time she saw the toggle language. The lightning bolt / crosshair icons make her smile: yes, she wants the crosshair.

She runs the MSMFE (multi-scenario) in THOROUGH mode. It's going to take a while — she has 41 failing scenarios out of 100.

**Minute 0:30 — Watching the Live Search**

The ghost cards populate. Zara watches the leading minimum shift across the result list. She's mentally narrating:

"That's the relay's hook threshold — it appeared first because the relay was at the pivot tick. Now it's being displaced by... the scout's attention filter. That's smaller. Now displaced by... relay buffer +1. Even smaller."

She's watching the search converge. At second 18, she has a hypothesis: the root cause is the relay's buffer, not any single hook or filter.

At second 24, the search confirms: minimum fix is relay context buffer +1 slot. Her hypothesis was right.

**Minute 2:00 — The Meta-Lesson**

Zara opens the browser. She googles "search algorithm early termination" not because the game told her to — because she's curious about what's happening under the hood. She finds articles about branch and bound, beam search, A* heuristics.

She comes back to the game and tries something: she switches to QUICK mode for one run, then THOROUGH mode, and compares the two results. The quick result found a different element — the scout's attention filter, which appeared first in the pre-ranking because the scout was active at the pivot tick but the relay was the deeper cause.

"So the pre-ranking isn't perfect," she thinks. "It prioritizes elements that were active during the failure, not elements that caused the failure. Those aren't always the same thing."

She writes a post in the community forum titled "QUICK vs THOROUGH: when pre-ranking misleads you." It gets 47 upvotes.

**Minute 6:00 — Resolution**

She deploys the THOROUGH result. Her pass rate goes from 59/100 to 81/100. She queues the match.

**What she wants to do next:** Write a guide on when to use QUICK (you're early in diagnosis, want a fast hypothesis to test), when to use THOROUGH (you've already applied quick fixes and they're not converging), and when to use the MSMFE thorough scan (you're in the endgame optimization pass before a rated match).

**UI Annotations:**
- Live search in THOROUGH mode: ghost cards appear at 40% opacity in a staggered 150ms delay between each (not all at once, which would be visually overwhelming with 147 candidates); each card shows agent name, field name, direction (+ or –), and current rank in size order
- Leading minimum indicator: a violet "◎ CURRENT MINIMUM" label floats next to the current champion card; it slides down the list each time it's displaced, with a smooth 300ms ease-out transition
- Search complete animation: the final minimum card brightens to full opacity, the crosshair icon in the toggle button briefly becomes a solid filled circle (search locked), then returns to outline — a subtle "locked on target" visual metaphor
- Comparison affordance: after a run completes, hovering over the QUICK/THOROUGH toggle shows a comparison tooltip if both modes have been run: "QUICK found: Scout attention filter. THOROUGH found: Relay buffer +1. These are different fixes."

---

## Interaction Effects

**With 4.37 (Fork-and-Deploy Shortcut):**
Fork-and-deploy is aware of which mode was used to find the fix. If the player applies a QUICK result via fork-and-deploy, the confirmation dialog notes: "Applying a quick scan result — this may not be the smallest possible fix. Run thorough scan first?" Players can dismiss this. It's a nudge, not a gate.

**With 4.41 (Cluster-Masked Failure Discovery):**
THOROUGH mode is more likely to encounter cluster masking — because it runs all candidates, it will sometimes find a fix that resolves the dominant failure cluster and reveals a previously invisible sub-cluster. The explorer can surface this: "This fix resolves 22 failing scenarios. However, 8 newly-visible failures may emerge — the dominant cluster was masking them. Proceed?"

**With 4.44 (Regression Check During Fork-and-Deploy):**
THOROUGH mode's results should be run through the regression check before applying. QUICK mode's results may skip the regression check by default (speed-oriented players want to stay fast). The autonomy dial (aspect 4.47) governs whether regression checks are mandatory or opt-in.

**With 4.49 (Cross-mission Pattern Detection):**
If the same element appears as the MINIMUM FIX result in three separate missions, this feeds the career-level architectural debt signal. QUICK mode results are less reliable for this pattern detection — the same first-viable result appearing multiple times might be pre-ranking bias, not architectural debt. Only THOROUGH mode results are used to feed the 4.49 career pattern detector.

**With 8.08 (Real-Language Vocabulary Claim):**
The toggle language matters enormously here. "First Viable Fix" and "Minimum Fix" are the correct technical terms — these map directly to how engineers discuss search strategies in debugging, optimization, and testing contexts. "Quick Scan" and "Thorough Scan" are accessible but lose the precision. The final design should use technical terms with accessible metaphors: "QUICK (first viable)" and "THOROUGH (minimum fix)" — the parenthetical carries the vocabulary even if the player doesn't engage with it.

---

## Comparable Games and Media

**Git bisect:** The canonical "find minimum change" tool. `git bisect` doesn't stop at the first bad commit it finds — it binary-searches to find the *specific* commit that introduced the regression. "Find the exact commit" is minimum fix thinking. Robot Uprising players who later use `git bisect` will recognize the mental model immediately.

**Debuggers with "run to cursor" vs. "find all breakpoints":** The IDE parallel. "Run to cursor" (first viable) vs. stepping through every frame (exhaustive). Most developers learn to use "run to cursor" for known suspects and exhaustive stepping for unknown failures. Same tradeoff.

**A\* vs. Dijkstra:** For players with CS background, the toggle is instantly recognizable as an admissible-heuristic vs. exhaustive-search choice. A* finds a path quickly but relies on a heuristic; Dijkstra finds the shortest path always. The game's pre-ranking is the heuristic.

**Into the Breach — perfect information design:** Into the Breach always shows exactly what will happen. No search, no uncertainty — the player sees the minimum fix directly. Robot Uprising's diagnostic layer is the imperfect complement: the player has to *find* the minimum fix through search, which Into the Breach's design deliberately avoids. The contrast is instructive.

**Google Search "verbatim" mode:** The user-facing parallel for non-technical players. Normal search uses heuristics and synonym expansion. Verbatim mode is exact and slower. Most users never use verbatim mode; power users reach for it when normal search keeps returning irrelevant results. The QUICK/THOROUGH toggle is the same pattern.

---

## Sensory Description

**QUICK mode result:**

A three-note ascending ping — like a light sensor triggering. The result card slides in from the right edge of the panel, crisp and fast. The background of the card is a pale electric blue, slightly iridescent. A small lightning bolt in the top-left corner of the card. The agent name glows briefly white, then settles to its normal color.

The card has a thin yellow-amber border — subtle enough that it reads as "normal" to a new player, but is actually a warning signal to a trained eye. The border color is the same as the "pending change" amber used elsewhere in the UI.

Sound: clean, fast, almost dismissive. The game found something. It might be right.

**THOROUGH mode — in progress:**

A low, steady drone in the key of A minor — not unpleasant, but alert. Like the sound of a sonar system sweeping. Each candidate card appears at 40% opacity, fading in on a 150ms stagger. The leading minimum card has a soft violet glow, pulsing slowly — 1.5 seconds on, 1.5 seconds off.

As the leading minimum is displaced, the old champion dims and the new champion brightens — a handoff animation, 300ms ease-out. The displaced card doesn't disappear; it settles into the list at reduced opacity.

The drone modulates slightly as the search progresses — not enough to be distracting, but perceptible on headphones. A subtle progression toward resolution.

**THOROUGH mode — complete:**

The drone resolves to a single chord: a major seventh, bright and precise. The leading minimum card flashes once — pure white, 100ms, then settles to violet. The crosshair icon in the toggle fills from outline to solid for 500ms, then returns to outline: the targeting lock completed.

The search complete moment should feel like the sonar found the target. Like a lock-on tone in a flight sim. Like the cursor stopped bouncing and settled.

**Switching from THOROUGH back to QUICK:**

The lightning bolt in the toggle brightens. The thorough result card dims slightly and a small tag appears: "THOROUGH RESULT — not the first viable fix found." The panel doesn't clear — the player can still see the thorough result. But switching modes communicates: we're now talking about a different kind of answer.

---

## Discovered New Aspects

1. **4.58 — Pre-ranking transparency panel:** A collapsible "why is this ranked #1?" panel in the Fix Explorer that explains the pre-ranking heuristic for the top candidate — "RELAY-C was active at tick 52 (pivot tick) and was modified 3 sessions ago (recent change signal)"; teaching the heuristic makes QUICK mode less opaque; interaction with 8.08 vocabulary claim.

2. **4.59 — "Minimum fix across multiple matches" vs. "minimum fix per match":** In Gauntlet mode, after 5+ matches, a deeper exhaustive search that finds the single config change that would have improved the most matches (not just the current one); the "career minimum fix" as an architectural debt metric; much slower (~5 minutes) but extremely high signal.

3. **4.60 — Search budget as a player resource:** Instead of QUICK/THOROUGH as a binary toggle, the player has a "compute budget" resource that regenerates between sessions; exhaustive search costs more budget; encourages players to decide strategically when to use thorough analysis; interaction with early-game scarcity design.

4. **4.61 — "Why did QUICK find a different fix than THOROUGH?" explainer:** When a player has run both modes and gotten different results, a dedicated comparison view shows both results side by side with an explanation: "QUICK found this element because it was ranked first by the pre-ranking heuristic. THOROUGH found a smaller fix because it checked all candidates. The pre-ranking heuristic prioritizes recent changes and elements active at the pivot tick — not architectural minimality."; the explainer as an in-game search algorithm lesson.

5. **4.62 — The "agree to disagree" result:** When QUICK and THOROUGH find different fixes and both would improve pass rate, the explorer shows both with a "both valid" label and lets the player choose; teaches that there is no single correct answer to "what is the best fix" — it depends on your diagnostic goal; echoes real engineering debates about patching symptoms vs. fixing root causes.

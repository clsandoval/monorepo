# Career Minimum Fix — Cross-Match Architectural Debt Analysis

**Aspect:** 4.59 — "Minimum fix across multiple matches" vs. "minimum fix per match": in Gauntlet mode after 5+ matches, a deeper exhaustive search finding the single config change that would have improved the most matches (not just current); the "career minimum fix" as architectural debt metric; much slower (~5 minutes) but extremely high signal.

**Parent:** 4.40 — First-viable fix vs. minimum fix toggle; 4.36 — Multi-scenario MFE
**Siblings:** 4.20 — Counterfactual simulation; 4.37 — Fork-and-deploy; 4.38 — Counterfactual history; 4.39 — Adversarial counterfactual
**Related:** 4.49 — Cross-mission pattern detection; 4.41 — Cluster-masked failure discovery; 5.22 — Gauntlet as third act; 8.07 — Robustness vs. efficiency tension; 8.08 — Real-language vocabulary claim

---

## The Core Concept

The per-match Minimum Fix Explorer (4.20) answers: **"What is the smallest change to my config that would have flipped THIS specific match?"**

It runs 150 simulations, each replaying the match with a single-element mutation. It takes 25–30 seconds. It returns the minimum fix for one data point.

The **Career Minimum Fix** answers a fundamentally different question: **"What is the single config change that would have improved the MOST matches in my Gauntlet history?"**

It runs 150 simulations × N past matches. At N=10, that is 1,500 simulations × 200ms = 5 minutes. At N=20, it is 10 minutes. Genuinely slow. And the signal is worth every second.

The distinction sounds academic until you understand what it means architecturally:

- A per-match fix might reflect noise — your opponent happened to run a hook that exploited one specific threshold on one specific tick. Fix it and it never matters again.
- A cross-match fix reflects structure — the same element appears as the minimum fix in 7 of your last 10 losses. It is not a random vulnerability. It is debt you are carrying in your architecture. You have been patching downstream symptoms while the upstream cause persists.

**The career minimum fix is Robot Uprising's equivalent of a code coverage report.** It is the question "where is my architecture weakest across the full distribution of adversarial inputs?" answered concretely.

---

## The Computation Model

### What "improved" means across matches

For Gauntlet (PvP) matches: a candidate change "improves" a match if, when the simulation is replayed with that change applied to the player's config, the player wins. Binary flip. The coverage score is `matches_flipped / matches_analyzed`.

For PvE robustness matches: a candidate change "improves" a match if it increases the scenario pass rate. Continuous delta. The coverage score is `average_pass_rate_delta`.

These two modes have different meaningful thresholds for "high coverage." A change that flips 6/10 Gauntlet matches is profound. A change that improves 10 PvE scenarios by 3 pass-rate points each may or may not be meaningful.

### The config evolution problem

Between match 1 and match 10, the player's config has changed. Match 1 was played with config v2.3. Match 10 was played with config v3.8. The cross-match search must decide: **which config does the candidate change apply to?**

Three approaches:

**Approach A — Current-config forward (recommended for most players):**
Take the player's *current* config. Enumerate 150 candidate mutations to the current config. For each candidate, simulate it against all N past matches using the current-config-with-mutation. This answers: "If I make this change NOW, how many of my past adversarial inputs would I have beaten?"

This is the most actionable answer — the fix is a change you can apply today.

Weakness: It conflates architectural improvement with version drift. Match 1 was designed for a config that no longer exists. Simulating match 1 with the current config is a counterfactual on a counterfactual.

**Approach B — Version-locked analysis:**
Only analyze matches where the player was running the same major config version. If the player has been on v3.x for 8 matches, analyze those 8. Ignore earlier matches entirely.

Advantage: Historical fidelity — every simulated match had the same architectural baseline.
Weakness: Restricts the sample size. New players may not have 5 matches on a single config version.

**Approach C — Historical-accurate simulation:**
For each past match, use the config version that was active *at the time of that match*. Enumerate candidate mutations against each historical config separately. This is the most correct computation but requires storing every past config version (the counterfactual history feature, 4.38, provides this infrastructure).

Advantage: Precise historical fidelity.
Weakness: The result is harder to act on — "if you had applied this change to your v2.3 config, it would have helped 7 matches." But v2.3 no longer exists. What does the player do with this information?

**Recommended:** Approach A (current-config forward) for the player-facing Career Minimum Fix feature, with Approach C available as a toggle for deep-analysis players who have the counterfactual history infrastructure.

### Minimum across matches vs. most common across matches

A subtle distinction: "minimum fix across matches" could mean two things:

1. **Coverage maximizer:** Find the single change that improves the *most* matches. This is the standard interpretation and what the frontier spec describes.

2. **Minimum-minimum:** Find the single smallest change (fewest elements modified) that appears as *any* minimum fix across the most matches. This is a more precise formulation — it filters out "large" fixes that happen to improve many matches but are not structurally minimal.

The difference matters when the coverage maximizer is a medium-sized change (e.g., a filter with 3 entries added) that improves 8/10 matches, while the minimum-minimum is a single-entry filter change that improves 6/10. The minimum-minimum is smaller but less impactful. The coverage maximizer is more impactful but less minimal.

**Design choice:** The player-facing result should present **both** as labeled options if they differ materially: "Broadest fix (improves 8/10): Relay — filter +3 entries. Smallest fix (improves 6/10): Relay — filter +1 entry." Let the player choose which axis they care about.

---

## Design Options

### Option A: No Cross-Match Mode — Emergence Only

**What happens:** The career minimum fix feature does not exist. Players who want cross-match insights must manually compare their per-match MFE results across sessions and notice patterns themselves.

**The bet:** Players who care about architectural patterns will naturally discover them through repeated use of the per-match explorer. Surfacing it as a dedicated feature adds UI complexity for a use case that most players will never reach.

**Strengths:**
- Zero additional UI surface area
- The emergence of patterns through manual observation is itself a teaching mechanic — players who make the connection are more invested in the insight
- No computation cost or waiting

**Weaknesses:**
- Most players will never make the connection manually — cognitive overhead is too high
- Repeating the same per-match fix multiple times is a silent failure mode (the plateau problem, aspect 5.19)
- The architectural debt signal is the highest-value diagnostic in the game and should not depend on the player running manual correlation analysis
- Misses the explicit pedagogical opportunity to name "architectural debt" as a concept

**Who this serves:** Deep-engagement players who are already maintaining mental models of their config weaknesses. Not most players.

---

### Option B: Heat Map of Per-Match Fix Frequency

**What it is:** Not a separate computation, but a synthesis layer on top of existing per-match MFE results. After the player has run the per-match MFE on 5+ matches, a new visualization appears in the Debrief hub: a **Fix Frequency Heat Map** — a table of every config element, with a color intensity showing how often it appeared as a minimum fix across their history.

No new computation. Just aggregation of existing results. Fast.

```
CONFIG ELEMENT          | APPEARANCES AS MIN FIX | LAST SEEN
Relay — context buffer  | ████████████ 7/10       | 2 matches ago
Scout — hook threshold  | ████ 3/10               | 4 matches ago
Striker — patrol radius | ██ 2/10                 | 7 matches ago
```

**Strengths:**
- Zero additional computation — synthesizes work already done
- Immediately legible — the player sees at a glance which element has appeared most often
- Available much earlier than Option C (works from match 1, not match 5)
- Does not require the player to understand "career minimum fix" as a concept — the heat map speaks for itself

**Weaknesses:**
- Only aggregates matches where the player bothered to run the per-match MFE — lazy players get a sparse heat map
- Different matches had different config versions — the same "Relay context buffer" in match 1 may be structurally different than in match 7 after architecture changes
- Does not answer "what single change would help the most" — only "what single change has appeared most often as the answer"

**Who this serves:** Mid-level players who run the per-match MFE regularly. The heat map arrives naturally as a byproduct.

---

### Option C: True Cross-Match Exhaustive Search — The Career Minimum Fix

**What it is:** A dedicated button in the Debrief hub: **"CAREER ANALYSIS (5 min)"**. Available after 5+ Gauntlet matches. Runs the full cross-match computation: 150 candidates × all N past matches × 200ms each.

Returns: a single config change labeled with its cross-match coverage score and a ranked list of runners-up.

```
CAREER MINIMUM FIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Relay — context buffer: +1 slot
Coverage: 7/10 matches improved

Runners-up:
  Scout — hook threshold –2    (5/10)
  Relay — fallback filter +1   (4/10)
  Striker — patrol radius +2   (3/10)

Analysis confidence: THOROUGH (all candidates checked)
Config version: v3.8 (current)
Matches analyzed: 10 (last 30 days)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**The 5-minute wait design:**
The player should not stare at a loading bar for 5 minutes. Options:
- **Background queue:** Player queues the analysis, gets a push notification / in-game notification when it completes. They can close the debrief and do something else.
- **Foreground with live partial results:** The results table populates in real-time as candidates are evaluated across matches. At 30 seconds, the player already has a strong preliminary result. At 5 minutes, the final ranking is confirmed.
- **Scheduled analysis:** The career analysis runs automatically at session end (after the debrief screen), with results available at the start of the next session.

**Recommended:** Foreground with live partial results, plus a "keep running in background" button if the player wants to leave. This keeps the discovery moment immediate (the player can see the frontrunner emerge after 30 seconds) while not holding them hostage to the full computation.

**Strengths:**
- The highest-signal diagnostic in the game — true architectural debt, not match-by-match noise
- Names "architectural debt" as a concept explicitly, with direct transfer to software engineering vocabulary
- The coverage score ("7/10 matches") is immediately emotionally resonant — the player feels the weight of the pattern
- The runners-up list teaches the player that their config has a ranked structural weakness profile, not just one problem

**Weaknesses:**
- 5-minute wait is a significant UX friction point — some players will queue it and forget it, or never run it at all
- Requires N ≥ 5 matches on a reasonably stable config to produce meaningful results
- The current-config-forward approach produces a valid result but the player must understand that this is a forward-looking recommendation, not a historical reconstruction
- High computation cost may be prohibitive in web-demo / resource-limited environments

**Who this serves:** Dedicated Gauntlet players, competitive players in the Architect+ tier who are optimizing their configs seriously.

---

### Option D: Persistent Architectural Debt Indicator

**What it is:** A persistent, lightweight version of the career minimum fix that surfaces as a **Debt Signal** — a small badge on the player's Config Workshop. Not the full 5-minute analysis. Instead, a background job that runs between sessions (using session-end idle computation or server-side) and updates a persistent "top structural weakness" indicator.

The Debt Signal appears as a small amber badge on the config element it identifies:

```
[RELAY-C] [⚠ RECURRING FIX — 5 MATCHES]  context buffer
```

The badge appears in:
- The Config Workshop, next to the element
- The Debrief summary panel ("Recurring structural debt: Relay context buffer — 5 matches")
- The Gauntlet pre-match preparation panel ("Unresolved structural debt detected — consider applying the suggested fix before this match")

**Strengths:**
- Always visible — no player action required to surface the signal
- Lightweight — the background computation can be incremental (add each new match to the running aggregate, not re-run everything)
- Pre-match visibility creates actionable tension: "I know this is my weakness and I haven't fixed it yet"
- Clears when the player addresses the root element, providing a satisfying closure loop

**Weaknesses:**
- The indicator is persistent but not accompanied by the full coverage score or ranked list — the player sees "5 matches" but not "5 out of 7 analyzed"
- Background computation must be triggered at session end — requires server-side infrastructure or a local worker (web-based constraint)
- May feel invasive or prescriptive if the player has intentionally chosen to leave the "debt" element unchanged (e.g., they deprioritized buffer size because of other config choices)

**Mitigation:** The debt signal should always be dismissible ("I know, not fixing it right now") and the count should include context: "5/7 analyzed matches."

**Who this serves:** All Gauntlet players — the signal is always available but never forced.

---

### Option E: The Structural Necropsy — Scheduled Deep-Analysis After Season End

**What it is:** At the end of each Gauntlet season (or campaign chapter), the game runs the full career analysis automatically and presents it as a **Season Necropsy** — a summary screen that appears at the start of the next session:

```
SEASON 3 RECAP — STRUCTURAL ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Win rate: 38% (11/29)
eEDT trend: improving (+0.15)

STRUCTURAL DEBT IDENTIFIED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Relay — context buffer (+1 slot)
Would have improved 17/29 matches.
This single change was the most
impactful fix across your season.

Apply to config? [APPLY]  [REVIEW]  [IGNORE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

The season necropsy runs the full analysis silently in the background between sessions (after season end, before the next session starts), so the computation cost is invisible.

**Strengths:**
- Zero in-session friction — the 5-minute computation is completely hidden from the player
- The season boundary provides natural emotional framing for a retrospective — "what should I do differently in Season 4?"
- The concrete "17/29 matches" number with "apply?" button creates a strong action loop
- The ritual of the season recap is itself engaging (like year-in-review wrap-up products)

**Weaknesses:**
- The signal arrives at season end, not during active improvement — a player might have benefited from knowing about the relay buffer in week 2 of the season, not week 8
- Requires Gauntlet season structure (which may not exist in early game or for casual players)
- The "apply?" framing at season start may feel mechanical — the player is being asked to push a button before they've had a chance to think about whether they want to

**Mitigation:** The necropsy should be a full screen with multiple slides, not a modal dialog with a button. The player should spend 30–60 seconds with the data before being offered any action.

---

## Recommended Design: Option D + Option C Behind Unlock

**Phase 1 — Persistent Debt Signal (Option D):**
The debt signal appears from match 5 onward. It is lightweight, persistent, and actionable. The player does not have to do anything to see it — it surfaces automatically. The amber badge on the recurring element provides ambient notification that architectural debt exists.

**Phase 2 — Career Analysis Unlocked:**
At match 10, the Debrief hub gains the "CAREER ANALYSIS" button (Option C). A one-time tooltip: "After 10 matches, you can run a full cross-match analysis — the single config change that would have improved the most of your recent losses. ~5 min."

The player now has both surfaces: the lightweight persistent indicator (always visible, always current) and the deep full-coverage analysis (manual, deliberate, high signal).

**Phase 3 — Season Necropsy (Option E, post-launch):**
For Gauntlet seasons, the end-of-season recap incorporates the career analysis automatically. The 5-minute computation runs at season end, silently. The recap screen is the delivery vehicle.

---

## Player Journeys

### Journey: Zara, 22, CS student, Architect-tier Gauntlet player

**Context:** Zara has been playing Gauntlet for 3 weeks. Win rate: 52%. She uses the per-match MFE after every loss. She's noticed the relay buffer keeps appearing in her results but has been dismissing it because "the relay is fine in most of my wins."

**Minute 0:00 — The Debt Signal She's Been Ignoring**

Zara opens the Debrief hub after her 12th Gauntlet loss. The match summary panel shows the familiar layout: match timeline on the left, Fix Explorer panel on the right. In the Config Workshop shortcut panel at the bottom, there is an amber badge she has learned to treat as background noise:

`RELAY-C ⚠ RECURRING FIX — 7 MATCHES`

She's seen it for two weeks. She's never clicked it.

Today, for no particular reason, she clicks it.

A small popover appears: "RELAY-C context buffer has appeared as the minimum fix in 7 of your last 12 analyzed matches. This is your most persistent structural weakness. Run Career Analysis for full details (~5 min)."

There's a button: "RUN CAREER ANALYSIS."

She clicks it.

**Minute 0:30 — Watching the Computation**

A new panel opens — wider than the Fix Explorer, darker background, like a server spinning up. A header: "CAREER MINIMUM FIX — CROSS-MATCH ANALYSIS."

A progress bar fills. Below it, results start appearing live:

After 30 seconds: "Current frontrunner: Relay context buffer +1 slot — 4/12 matches improved."

After 90 seconds: "Updated frontrunner: Relay context buffer +1 slot — 7/12 matches improved."

After 3 minutes: "Updated: 9/12 matches improved." The frontrunner has not changed. Zara is watching the number climb.

She thinks: "Nine matches. I've been losing nine matches because of a single buffer slot."

After 5 minutes: "Analysis complete. Relay context buffer +1 slot — 9/12 matches improved."

Runners-up appear below: Scout hook threshold –2 (6/12), Striker patrol radius +2 (4/12), Relay fallback filter +1 entry (3/12).

**Minute 6:00 — The Structural Audit**

Zara stares at the result. She opens a text document and types:
- "9 out of 12 losses were potentially caused by one buffer slot on the relay."
- "But I've been running the relay at buffer 4 for six weeks."
- "Why haven't I fixed it?"

She goes back to her config and looks at RELAY-C's context config. Buffer: 4. She has set it to 4 deliberately — she thought 5 was too expensive and would slow the relay's eviction response time.

She looks at the analysis result again: "+1 slot." Cost: one slot. She had been weighing the cost of one slot against a vague intuition that it would slow things down. The career analysis shows that she has been paying a tax of 9 Gauntlet losses to preserve a configuration choice she made based on an unfounded heuristic.

She increases the buffer to 5.

**Minute 8:00 — Next Match**

She queues into Gauntlet. First match with the new config. The relay holds a signal 2 ticks longer than before. An opponent hook fires at tick 48 that would have evicted the relay's critical routing entry — but it doesn't, because the buffer has room.

She wins.

**What she wants to do next:** Run the career analysis again in two weeks, with the relay buffer fixed, to find out what the second structural weakness is. She is planning to iterate through the ranked runner-up list systematically.

**UI Annotations:**
- Amber debt badge: 16×16px amber circle with "!" glyph, positioned top-right of config element name in both Config Workshop and Debrief summary panel; tooltip on hover shows count and "Run Career Analysis" link
- Career analysis panel: 480×640px overlay, midnight-blue background, monospace font for results table; live frontrunner row highlighted in violet with gentle breathing pulse; coverage score increments as matches are evaluated, never decrements (previous frontrunner dimmed but not removed)
- Progress bar: dual-track — outer track shows candidates (0–150), inner track shows matches (0–12); subtle binary-cascade animation for each simulation completing; low steady hum audio through the computation
- Completion animation: frontrunner card brightens from violet to white pulse (300ms), then settles to solid violet; a major seventh chord identical to the single-match THOROUGH completion — deliberate callback, signal continuity

---

### Journey: Marcus, 44, project manager, casual Gauntlet player

**Context:** Marcus plays 2–3 sessions per week. Win rate: 41%. He sometimes runs the per-match Fix Explorer but often just queues the next match. He has 18 matches in his Gauntlet history. He has never noticed the debt badge.

**Minute 0:00 — The Push Notification**

Marcus is between sessions. His phone shows a notification: "Robot Uprising — Career analysis available. Your most persistent structural weakness identified after 18 Gauntlet matches."

He opens the game.

**Minute 0:30 — The Season Summary Dashboard**

Marcus is at the post-session Gauntlet hub. A new card has appeared in his dashboard — he hasn't seen it before. It's slightly larger than the other cards, with a violet background:

```
CAREER ANALYSIS — COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━
Relay context buffer +1 slot
Would improve: 11/18 matches
━━━━━━━━━━━━━━━━━━━━━━━━━
[VIEW FULL ANALYSIS]  [APPLY FIX]
```

Marcus blinks. Eleven out of eighteen. He clicks "VIEW FULL ANALYSIS."

**Minute 1:00 — Reading the Report**

The full career analysis panel opens. Marcus is not a deep-engagement player — he doesn't immediately understand all the fields. But two things hit him immediately:

1. The number: 11/18. Sixty-one percent of his Gauntlet losses traceable to one element.
2. The element: "Relay context buffer." He has seen the relay in the Fix Explorer before. He remembers clicking away from it because he didn't understand what "context buffer" meant.

There is a plain-language explanation panel below the results table:

> "Your relay agent is running out of memory too quickly. When a signal arrives that it can't store, it gets dropped — and later agents that depend on that signal can't react in time. Adding one memory slot to the relay would have helped you win 11 of your last 18 matches."

Marcus reads this twice. "Adding one memory slot." He looks at the [APPLY FIX] button.

He clicks it.

A confirmation dialog: "This will fork your current config (v3.4 → v3.5) and increase RELAY-C context buffer from 4 to 5. Your next match will use the new config. Previous configs remain available in your config history."

He clicks Confirm.

**Minute 3:00 — The Action Loop**

Marcus queues a match. The pre-match panel shows: "Config v3.5 — 1 recent change: Relay context buffer +1." A small green indicator: "Pending structural debt fix."

He plays the match. He wins, 68–32 EDT. He doesn't know if the relay buffer was the reason — he never does, in single matches. But the career analysis card in his hub now shows:

`Career analysis: Stale — run again after 5+ new matches.`

The violet card has dimmed. The amber badge on RELAY-C is gone.

Marcus feels, vaguely, like he has done maintenance. Like he replaced a filter in his car. He doesn't fully understand why it worked. But the 11/18 number felt real, and the fix felt specific. That is enough.

**UI Annotations:**
- Push notification: standard OS notification format; text: "[Game name] — Career analysis complete. Your most persistent structural weakness identified." No spoiler of the result in the notification — the player should discover it in the game
- Dashboard card: violet-tinted card with gold border (distinguishes it from standard match summary cards); "CAREER ANALYSIS — COMPLETE" header in caps with a small waveform icon; coverage score in large numerals (bolded); plain-language one-liner below the score; two CTA buttons ("VIEW FULL ANALYSIS" and "APPLY FIX"); "APPLY FIX" button available directly from dashboard card (does not require opening full analysis)
- Plain-language explanation panel: 3-4 sentence paragraph, no jargon; appears in the full analysis view beneath the results table; expandable to "Technical view" toggle that shows field names, simulation methodology, config version used

---

### Journey: Keiko, 31, software engineer, Commander-tier veteran

**Context:** Keiko has been playing Robot Uprising for 6 months. Win rate: 68%. She uses the career analysis as a pre-season ritual: every 30 matches, she runs the full analysis, identifies her top structural debt, fixes it, and re-analyzes. She treats it like a quarterly engineering retrospective.

**Minute 0:00 — The Ritual**

Keiko opens the Debrief hub. She has 28 matches since her last career analysis. She navigates to the Career Analysis button and clicks it. No hesitation.

A note she has written to herself: "Always run after 25+ matches. Never act on the result immediately — wait 24 hours and re-read it cold."

**Minute 0:30 — Watching the Live Feed**

Keiko watches the computation run. She is tracking the frontrunner's coverage score as it updates:

2 minutes: "Scout hook threshold –2: 9/28 matches. Coverage: 32%."

3 minutes: "Updated frontrunner unchanged: 9/28."

4.5 minutes: "Updated frontrunner: Scout hook threshold –2: 12/28 matches. Coverage: 43%."

Keiko notes: 43%. Lower than her last career analysis (which showed 61%). Her architecture has become more robust — no single element accounts for as many losses as it used to. She interprets this as improvement.

The runners-up list: Relay fallback filter (8/28), Striker patrol radius (7/28), Scout attention filter (6/28).

She exports the full results as a JSON file (a feature in the full analysis panel). She pastes them into her personal config notebook (an external document where she tracks her architectural evolution across all sessions).

**Minute 6:00 — The Cold Read**

The next day, Keiko opens her config notebook and reads yesterday's results. The scout hook threshold has appeared as a fix in 12/28 matches. But looking at the runners-up, she notices a pattern: the scout appears in 3 of the top 4 results (hook threshold, attention filter, and a filter entry). The relay appears in 2.

She recognizes this pattern from software engineering: when multiple small issues cluster around the same component, the component itself may be the problem. The scout is not failing in three independent ways — it may be architecturally underspecified. She needs to rebuild the scout's role in her config, not just increment the hook threshold.

She runs the career analysis again, filtered to matches from the last 2 weeks only (a filter option in the full analysis panel). The result: relay fallback filter appears at 5/7, dominating. The scout's multi-issue pattern may have been diluted by older matches where the scout architecture was different.

She updates her config notebook: "Scout multi-cluster flag. Investigate holistically. Relay fallback filter is the near-term fix."

**Minute 10:00 — The Architectural Retrospective**

Keiko graphs her per-season top-coverage scores in her external notebook:

- Season 1: 61% (relay context buffer — fixed)
- Season 2: 57% (scout hook threshold — fixed)
- Season 3 (current): 43% (scout hook threshold again — not yet fixed)

The declining coverage percentage is her primary architectural health metric. Season 3's 43% means her config is more robust than Season 1's 61%, but she's plateaued — the same scout issue is recurring.

She labels this in her notebook: "The Scout Echo Problem — three independent scout fixes appearing across two seasons. Architectural, not parametric."

She plans to run a full scout redesign before Season 4.

**What she wants to do next:** Build a "scout-free config" and run it against her Gauntlet history to see if the scout is genuinely load-bearing or if she's over-invested in it as a signal source.

**UI Annotations:**
- JSON export button: small button in the full analysis panel, top-right corner, "↓ Export Results (JSON)"; exports: candidate list with coverage scores, per-match breakdown (which matches each candidate would have improved), config version, analysis timestamp, methodology flag (current-config-forward vs. version-locked)
- Date range filter: a "MATCHES ANALYZED" dropdown in the full analysis panel; options: "Last 7 days," "Last 30 days," "All time," "Current season," and a custom date range picker; filter updates coverage scores in real-time (requiring re-computation if the range changes significantly)
- Coverage percentage history: a small sparkline in the Gauntlet profile card showing top-coverage percentage per career analysis run; this is the inverse of robustness — lower is better; unlocks after 3 career analyses
- "Scout multi-cluster" detection: automatic detection if the same agent appears in 3+ distinct top-10 runner-up entries; surfaced as a note beneath the results table: "RELAY-C appears in multiple runner-up fixes. Consider reviewing this agent's overall configuration rather than individual elements."

---

## Interaction Effects

**With 4.40 (First-Viable vs. Minimum Fix Toggle):**
The career minimum fix always runs in THOROUGH mode — exhaustive cross-match search. There is no "first viable career fix" mode. The computation cost is already high; doing it in first-viable mode would save 20% of the time but produce a worse result with no option to upgrade. Career analysis is always thorough.

**With 4.38 (Counterfactual History):**
The counterfactual history stores every config version the player has deployed. The career analysis can optionally use Approach C (historical-accurate simulation) — simulating each past match against the config version that was active at the time — if the player enables "historical mode" in the analysis panel. This requires the full config history to be stored, which counterfactual history provides. Historical mode is slower (each match uses a different baseline config) but produces more precise attribution.

**With 4.49 (Cross-Mission Pattern Detection):**
Cross-mission pattern detection (per-campaign-mission minimum fix patterns) is the PvE analog to the career minimum fix. The two surfaces should share visual vocabulary: the same amber debt badge, the same coverage score format, the same "run career analysis" button pattern. Players who use one will intuitively understand the other.

**With 5.22 (Gauntlet as Third Act):**
The career analysis is the keystone feature of Gauntlet-as-third-act. If Gauntlet is the game's endgame loop, the career minimum fix is the primary endgame feedback mechanism. A player in Season 3 with 200 matches should have a career analysis that reveals deep structural patterns that no per-match tool can surface. The feature's depth scales with play time.

**With 8.08 (Real-Language Vocabulary Claim):**
"Architectural debt" is a real software engineering term. Robot Uprising using it in the UI — explicitly labeling the career minimum fix result as "structural debt" — makes a direct vocabulary claim. A player who encounters "architectural debt" in a real codebase will recognize the concept from Robot Uprising. This is the highest-fidelity vocabulary transfer in the diagnostic layer.

**With 4.41 (Cluster-Masked Failure Discovery):**
The cross-match analysis may exhibit cluster masking at scale: the fix that improves 9/12 matches may be masking a second independent structural weakness that only becomes visible once the first is resolved. The career analysis panel should note this: "After applying this fix, run a new career analysis. A secondary structural weakness may emerge." This is the sequential refinement pattern from the MSMFE (4.36) applied to the career arc.

---

## Comparable Games and Media

**Code coverage tools (coverage.py, Istanbul, JaCoCo):**
The career minimum fix is Robot Uprising's coverage report. Code coverage answers "which lines are never executed?" Career minimum fix answers "which config change would have helped the most?" Both are aggregate diagnostic tools that reveal patterns invisible in individual test runs. Engineers who use coverage tools will immediately recognize the epistemic structure of the career analysis.

**Technical debt tracking in software projects:**
The "architectural debt" framing maps directly to how real engineering teams track and prioritize tech debt. High-coverage-score elements are high-priority debt items. The quarterly retrospective pattern Keiko uses (quarterly career analysis → identify debt → fix → re-analyze) mirrors how mature engineering teams manage tech debt backlogs. The game is teaching this practice pattern.

**Factorio production analytics:**
Factorio players who are serious about efficiency regularly run bottleneck analyses: "which single resource constraint is limiting my throughput the most?" This is the Factorio equivalent of the career minimum fix — finding the one bottleneck that, if eliminated, would improve the most downstream systems. The belt-transport throughput analysis tool mods (like Factory Planner) formalize this as explicit computation.

**Chess.com Accuracy across games:**
Chess.com's Accuracy score is computed per-game and also shown as a rolling average. A player can see "my average accuracy in bishop endgames is 71% vs. 84% in rook endgames" — a cross-game weakness pattern. Robot Uprising's career analysis is a more active version: not just aggregating a metric, but identifying a specific single change that would address the weakness.

**Slay the Spire meta-analysis tools:**
Third-party Slay the Spire analyzers (SpireSpy, Jorbs's spreadsheet) track which card choices correlate with win rates across runs. They are a community-built version of career analysis: "players who took Early Peck on Floor 1 won 3% more often than those who didn't." The career minimum fix formalizes this within the game itself.

**Scientific A/B testing:**
The career minimum fix is conceptually a retroactive A/B test. "What if I had changed X in all my past matches?" This is the counterfactual reasoning pattern that underlies scientific causal inference. Players who encounter this framing will recognize it when they later encounter A/B testing in product or research contexts.

---

## Sensory Description

**The career analysis panel — awaiting results:**

A dark panel appears over the debrief hub with a slow animation — like a heavyweight drawer being pulled open against resistance. The background is near-black with faint circuit-trace lines in dark violet. The header reads "CAREER MINIMUM FIX — CROSS-MATCH ANALYSIS" in small caps.

A dual-track progress bar runs across the top of the panel. The outer track is thin and rapid, cycling every few hundred milliseconds — one tick per candidate simulation. The inner track is slower, advancing one segment per match completed. Together they create a visual rhythm: small ticks inside a longer counting motion, like seconds within minutes.

Audio: a very low sustained tone in the sub-bass register — not unpleasant, almost like a server room hum. Every time a match is fully evaluated (inner track advances), a soft bass drum hit. The cadence creates a slow pulse: every 15–30 seconds, a beat.

**The frontrunner card:**

The first result to appear as frontrunner is a full-width card in dark violet, slightly raised (box shadow). The coverage score appears in large numerals — not the whole number at once, but digit by digit, like a mechanical counter: "6" → "7" → "9" as more matches confirm the candidate's dominance. The config element name is in monospace font. A small glyph shows the change type: an upward arrow with a plus sign for "+1 slot."

When a new frontrunner displaces the old one, the old card slides left and dims. The new card slides in from the right, brightening as it locks into position. The transition takes 400ms — slow enough to feel meaningful, fast enough to feel responsive.

**Completion:**

The final result settles. The dual-track progress bar completes — both tracks reach 100% simultaneously, with a short synchronized pause before the completion animation fires.

The completion animation: the frontrunner card brightens from dark violet to a pure white flash (100ms), then resolves to a bright solid violet — a shade brighter than the in-progress state. The circuit-trace lines in the background briefly light up as a radial pulse from the frontrunner card, expanding outward and fading over 800ms.

Audio: the sustained bass hum cuts cleanly. A major seventh chord — the same chord used for the single-match THOROUGH analysis completion — but voiced lower, fuller, two octaves deeper. It sustains for 2 seconds, then releases.

The career analysis complete state should feel like receiving the results of a long scientific assay. Like a protein gel developing. Like a satellite image resolving from noise to clarity. The wait is meaningful because the result is meaningful.

---

## Discovered New Aspects

1. **4.68 — Cross-match coverage percentage as season health metric:** Graphing the top-candidate coverage percentage across each career analysis run as a "structural robustness trend" — declining coverage = improving architecture; flat or rising coverage = plateaued or regressing; the long-arc view of architectural quality that no single match metric can provide.

2. **4.69 — "Scout multi-cluster" detection:** Automatic detection of when the same agent appears in multiple distinct runner-up slots across the career analysis result — surfaces a note that the agent may need holistic redesign, not incremental fix; interaction with 4.49 cross-mission pattern detection.

3. **4.70 — Career analysis filtered by opponent archetype:** Running the cross-match analysis filtered to "only matches against opponents running heavy hook architectures" or "only matches ending before tick 60"; find the structural weakness specific to each opponent class, not your overall weakness; interaction with 2.28 scenario fingerprinting.

4. **4.71 — Comparative career analysis between two config versions:** "If I had stayed on v2.3 and applied the career minimum fix, vs. the full rebuild to v3.8 — which would have produced better cross-match results?"; the hypothetical counterfactual on your architectural strategy rather than your parametric choices.

5. **4.72 — The "debt-free" season achievement:** A season in which the top-candidate career analysis coverage score is below 20% (no single element responsible for more than 20% of losses); "structurally diverse failure distribution" as the highest-level architectural health certificate; analogous to a codebase with no single module owning more than 20% of bugs.

# Pre-ranking Transparency Panel

**Aspect:** 4.58 — Pre-ranking transparency panel: a collapsible "why is this ranked #1?" panel in the Fix Explorer explaining the pre-ranking heuristic for the top candidate — "RELAY-C was active at tick 52 (pivot tick) and was modified 3 sessions ago (recent change signal)"; teaching the heuristic makes QUICK mode less opaque; interaction with 8.08 vocabulary claim.

**Parent:** 4.40 — "First viable fix" vs. "minimum fix" toggle
**Siblings:** 4.59 — Career minimum fix; 4.60 — Search budget as resource; 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result
**Related:** 4.20 — Counterfactual simulation; 4.36 — MSMFE; 4.37 — Fork-and-deploy; 8.08 — Real-language vocabulary claim; 8.09 — Diagnostic layer as teaching mechanic; 4.16 — Signal genealogy viz; 4.15 — Probe hooks

---

## The Core Concept

The Fix Explorer's QUICK mode works because of a **pre-ranking heuristic**: before running any simulations, it orders candidate config mutations by how likely they are to be the root cause. When QUICK mode stops at the first flip, it's not stopping at a random candidate — it's stopping at the first candidate from a thoughtfully ordered list.

The three heuristic signals (from 4.40):

1. **Pivot-tick activity**: Was this agent/element actively processing at the tick the match turned? If the relay agent was sending signals at tick 52 (the EDT), mutations to the relay are ranked higher.
2. **Recency**: Has the player modified this element recently? If you changed the scout's attention filter three sessions ago, that filter is a likely suspect — recent changes introduce risk.
3. **Volatility**: Did this element produce the most distinct states across replay ticks? High-volatility elements (those whose state changed frequently) are higher-signal candidates for "what was different in this run."

These signals combine into a ranking score. The top-ranked candidate appears first in the QUICK mode result list, and QUICK mode stops there.

**The problem:** This is entirely invisible. When the Fix Explorer shows "FIRST VIABLE FIX: Relay agent — context buffer +1 slot," the player has no idea why that element was surfaced first. Is it because it was active at the pivot? Is it because the player changed it recently? Is it because the pre-ranking heuristic is just alphabetical?

**The opportunity:** Surfacing the pre-ranking explanation directly teaches the player how to develop their own diagnostic priors. The goal is not to expose algorithm internals for their own sake — it's to give players a mental model of "what should I look at first?" that transfers to real engineering contexts.

**The analogy this unlocks:** Google's "Why am I seeing this ad?" button. Spotify's "Recommended because you listened to X." A linter's "This is flagged because it matches rule ESLint/no-unused-vars." All of these are **explainable recommendations** — they don't just tell you what, they tell you why. The transparency panel is Robot Uprising's "why am I seeing this recommendation?"

---

## Why This Is Architecturally Important

The Fix Explorer's pre-ranking heuristic is making a claim about causation: *"This element was active at the moment the match turned, therefore it's probably the cause."*

This claim is often right. Sometimes it's wrong. **The player needs to know the claim exists before they can evaluate it.**

Without the transparency panel:
- Player applies QUICK result, gets improved pass rate, attributes success to the fix
- Pre-ranking was right for the wrong reason — the fix worked, but not because of the pivot-tick activity signal
- Player builds false confidence in the pre-ranking's infallibility
- First time the pre-ranking is wrong (noisy pivot tick, correlation ≠ causation), the player is blindsided

With the transparency panel:
- Player sees: "Ranked #1 because RELAY-C was active at tick 52 (pivot tick) and was modified 2 sessions ago"
- Player learns: the pre-ranking is a heuristic, not ground truth — it uses circumstantial evidence, not proof
- Player develops their own heuristic: "if my relay was busy at the pivot, it's probably worth checking first"
- When pre-ranking is wrong, player can recognize it: "hm, the relay was active but I didn't change it recently — this seems less likely"

**The pedagogical claim:** Understanding the pre-ranking heuristic teaches the player how to do diagnostic reasoning. The heuristic is a formalization of what experienced engineers do intuitively: "what was running when it broke?" and "what did I change last?" The panel makes that intuition legible.

---

## The Full Design Space

### Option A: Tooltip Only — Hover to Reveal

**What happens:** Each candidate card in the Fix Explorer results list has a small `ⓘ` info badge in the corner. Hovering over the badge reveals a tooltip:

```
WHY THIS CANDIDATE?
• Active at pivot tick (tick 52): relay processing signal
• Modified 2 sessions ago (recent change)
• Volatility score: 0.71 (high — state changed 18 times)

Combined rank score: 0.84 / 1.0
```

The tooltip appears on hover only, 150ms delay. No persistent panel. No screen real estate consumed by default.

**Strengths:**
- Zero additional screen real estate
- Discoverable for curious players, ignorable for goal-oriented players
- Works on every candidate card, not just #1 — the player can compare why #2 and #3 are ranked differently

**Weaknesses:**
- Hover-to-reveal is invisible — players may not discover the `ⓘ` badge
- Mobile/touch targets can't hover; the info needs a tap interaction with potentially annoying full-screen tooltip
- Tooltip pattern is passive — the player has to seek the explanation rather than encountering it naturally

**The TikTok clip for this option:** None — hover tooltips don't make clips.

---

### Option B: Inline Explanation — Always Visible, Compact

**What happens:** Each candidate card has a small, always-visible explanation line below the fix description:

```
┌─────────────────────────────────────────────────────────────┐
│ ◈ RELAY-C — context buffer +1 slot                         │
│   ranked #1 · pivot-tick active · modified recently        │
└─────────────────────────────────────────────────────────────┘
```

The explanation is 2–3 compressed tokens (not a full sentence) displayed in a dim caption style. Long enough to carry meaning, short enough not to compete with the fix itself.

**Strengths:**
- Always visible — every player sees the reasoning, not just curious ones
- Compact — adds ~12px of vertical space per card, not a panel
- Comparable candidates can be compared at a glance: card #1 says "pivot-active · recent," card #2 says "high-volatility," card #3 says "single-element-change" — the ranking becomes legible across the list

**Weaknesses:**
- Caption text may be ignored — players in goal-oriented mode skim for the fix, not the explanation
- Requires the explanation vocabulary to be learned (what is "pivot-active"? requires prior context)
- With 147 candidates in THOROUGH mode, inline explanations become visual noise on the lower-ranked cards

**Mitigation:** Show inline explanations on top-5 cards in QUICK mode; collapse to icon-only for cards below rank 5 in THOROUGH mode.

---

### Option C: Collapsible Panel — Dedicated Explanation Drawer

**What happens:** Below the top result card, a collapsible drawer:

```
▼ WHY IS THIS RANKED #1?
──────────────────────────────────────────────────────────────
RELAY-C was active at tick 52 — the pivot tick.
The match turned when RELAY-C's signal didn't reach STRIKER-A.
This element is a likely root-cause candidate.

RELAY-C was modified 2 sessions ago (most recent config change).
Recent changes are higher-risk — they may have introduced the issue.

RELAY-C produced 18 distinct states during the match (volatility: 0.71/1.0).
High-volatility elements are more likely to be the cause.

Overall rank score: 0.84 — highest in the candidate set.
▲ Collapse
```

The drawer is collapsed by default in early-game. Expands on click. Once the player expands it once, it defaults to open in future sessions (remembered per-player).

**Strengths:**
- Enough space to write human-readable explanation with context, not compressed tokens
- The connection to the replay timeline is explicit: "active at tick 52 — the pivot tick" references something the player can verify by scrubbing back to tick 52
- Progressive disclosure: collapsed by default for players who don't want it, always available for players who do
- The explanation vocabulary teaches the heuristic incrementally — "pivot tick," "recent change," "volatility" are all concrete concepts the player can verify

**Weaknesses:**
- Requires screen real estate — when open, the drawer may push the candidate list down, requiring scrolling
- Only explains #1 by default — the player may want to understand why #2 was ranked below #1

**Mitigation:** Add a "Compare with #2" link at the bottom of the drawer that expands a side-by-side comparison:

```
WHY #1 BEFORE #2?
RELAY-C: pivot-active + recent (score 0.84)
SCOUT-B: pivot-active only (score 0.61)
RELAY-C ranked higher because it was also modified recently.
```

**The TikTok clip for this option:** Player opens the drawer for the first time, reads "RELAY-C was active at tick 52 — the pivot tick," clicks the timestamp link in the explanation and the replay scrubs to tick 52, RELAY-C's signal is highlighted mid-transmission. The player says "oh — that's exactly when it failed." The drawer revealed the smoking gun.

---

### Option D: Animated Highlight — Visual, Not Textual

**What happens:** When a QUICK mode result appears, the pre-ranking explanation is not text — it's a visual animation on the battlefield replay. The three contributing signals are shown as highlights:

1. The replay scrubs briefly to the pivot tick (tick 52). RELAY-C glows with a bright amber ring for 1 second — "active at this moment."
2. A config diff panel briefly flashes showing RELAY-C's most recent modification — "changed 2 sessions ago."
3. RELAY-C's portrait shows a flickering volatility heatmap — 18 distinct states, rendered as rapid state changes.

All three highlights happen in sequence over 2 seconds, then the result card settles. The player has *seen* why RELAY-C was ranked first, without reading a word.

**Strengths:**
- No reading required — purely visual and temporal
- Connects the explanation directly to the battlefield replay, not an abstract text description
- Feels like the game "showing its work" — visceral and cinematic

**Weaknesses:**
- 2-second animation plays every time QUICK mode returns a result — may become annoying after the 10th use
- Can be skipped (spacebar), but players who skip it miss the explanation
- Doesn't teach the vocabulary — player learns the heuristic visually but may not be able to articulate it

**Mitigation:** Play the full animation for the first 3 QUICK-mode results. After that, collapse to a 0.5-second highlight (just the amber ring at tick 52). Player can re-expand via the info badge. The first few uses give the full lesson; subsequent uses give the reference.

---

### Option E: Heuristic Weight Visualizer — Three-Bar Breakdown

**What happens:** The top result card includes a small three-bar visualization showing how the pre-ranking score was composed:

```
RELAY-C — context buffer +1 slot    [score: 0.84]
■■■■■■■■░░ PIVOT ACTIVITY    0.78
■■■■■░░░░░ RECENCY           0.62
■■■■■■░░░░ VOLATILITY        0.71
```

Each bar is labeled, filled proportionally, and color-coded (pivot-activity: amber, recency: teal, volatility: violet). The combined score 0.84 is shown as a thin bar above the three.

Players can hover any bar for a one-sentence explanation. They can click "Show all candidates" to see the three-bar breakdown for every candidate in the list — turning the results list into a sortable data table.

**Strengths:**
- Scannable at a glance — no reading, just three bars
- Sortable: player can click "VOLATILITY" column header to re-sort by volatility score alone, discovering different top candidates
- Directly comparable across candidates: "RELAY-C has high pivot-activity but SCOUT-B has higher volatility — interesting"

**Weaknesses:**
- Three-bar visualization requires learning the three signals before it's meaningful
- The "show all candidates" data table is complex UI for a debrief screen — might belong in an advanced view
- Score values (0.78, 0.62, 0.71) are precise but may feel arbitrary — why is 0.78 "high"?

**Recommended Design: Option C with Option D for first exposure**

The collapsible panel (C) has the best depth-to-legibility ratio. The animated highlight (D) gives the strongest first-impression explanation without requiring reading. Combine them:

- **First exposure:** When QUICK mode returns its first result ever, play the Option D highlight animation. The text drawer is closed but gets a pulsing amber border: "See why this was ranked first ▼"
- **Subsequent exposures:** Drawer remains at whatever state the player left it. No auto-animation. The `ⓘ` badge on each card reveals a condensed tooltip.
- **Advanced mode:** Option E's three-bar visualization appears inside the drawer when expanded, replacing the prose explanation for players who have unlocked it (defined as: opened the drawer at least 5 times or played 15+ sessions).

---

## Player Journeys

### Journey: Tomás, 34, backend engineer, Week 3 of play

**Context:** Mission 7 — "Distributed Response." Tomás has been using the Fix Explorer for 2 weeks. He's in QUICK mode by default and has had several good diagnostic results from it. He's noticed QUICK sometimes finds a different fix than THOROUGH but he's been ignoring it. Tonight he got a first-viable fix, applied it, and the pass rate dropped from 71 to 64.

**Minute 0:00 — The Confusing Regression**

The debrief opens. Tomás is annoyed. He applied the QUICK fix last session — scout beacon threshold –2 — and things got worse. He runs the explorer again in QUICK mode.

New result: "FIRST VIABLE FIX: Scout agent — beacon threshold –2 ticks."

Same fix. The pre-ranking is surfacing the same element again because the scout was active at the pivot tick (tick 52) and the scout was recently modified (by Tomás, last session).

He doesn't know any of this. He applies the fix again. Pass rate: 63. Getting worse.

**Minute 1:00 — The Drawer Appears for the First Time**

After the third failed application, the game triggers a new UI behavior. The top result card has a pulsing amber border and a new section below it:

> "The same candidate has been ranked #1 across 3 consecutive runs. The pre-ranking heuristic may be surfacing a symptom, not the root cause."

And below that, the collapsible drawer, now lit:

> "▼ WHY IS THIS RANKED #1? — understand the pre-ranking heuristic"

Tomás clicks it.

The drawer expands:

```
SCOUT-B was active at tick 52 — the pivot tick.
This is the most recent tick where a key signal routing decision occurred.

SCOUT-B was modified in your last session (1 session ago).
Recent changes are prioritized because they introduce highest risk.

SCOUT-B produced 22 distinct states during the match (volatility: 0.81/1.0).
High-volatility elements are strongest candidates for "what was different."

Overall rank score: 0.91 — highest in the candidate set.
```

Below this: a timestamp link: **[See tick 52 in replay →]**

Tomás clicks it. The replay scrubs to tick 52. SCOUT-B glows amber. He can see the signal — SCOUT-B sent a beacon signal to RELAY-C. But RELAY-C's buffer was full and the signal was dropped.

Wait. RELAY-C dropped the signal. Not SCOUT-B's fault. RELAY-C's buffer.

**Minute 2:30 — The Reframe**

Tomás is now reading the drawer again. "Active at tick 52." But SCOUT-B was active *sending* — the failure happened at *receiving*. The pre-ranking surfaced SCOUT-B because SCOUT-B was active at the pivot tick. But SCOUT-B's activity was a symptom of RELAY-C's buffer being full.

He switches to THOROUGH mode. 28 seconds. New result: "MINIMUM FIX: RELAY-C — context buffer +1 slot."

Pass rate: 79/100.

**Minute 4:00 — The Learning**

Tomás is looking at the two results side by side (the drawer shows both since he's already used THOROUGH). He's thinking about the pre-ranking: "it surfaced the sender, not the receiver. It found the thing that was *active*, not the thing that *failed*."

He types a note to himself in the session notes panel (if it exists): "pre-ranking = most active, not most broken. Look downstream from the ranked element."

He wants to know: can he make the pre-ranking account for "what received signals from the active element, not just the active element itself."

**Minute 5:00 — Resolution**

He opens the compare drawer: "Compare with candidates 2-5."

The table shows:
```
SCOUT-B:     pivot-active · recent-change · high-volatility    → 0.91
RELAY-C:     pivot-active · not-recent   · medium-volatility   → 0.68
STRIKER-A:   not-pivot    · not-recent   · low-volatility      → 0.22
```

RELAY-C was #2 in the pre-ranking. It was active at the pivot tick but not recently modified. The pre-ranking correctly identified it as a suspect — but ranked it lower than SCOUT-B because SCOUT-B had the recency signal.

The fix was right there at #2. QUICK mode just didn't reach it.

**What Tomás wants to do next:** Check if there's a way to adjust the heuristic weights — give less weight to recency and more weight to "was this the receiver not the sender."

**UI Annotations:**
- Pulsing amber border on result card: appears after third application with no improvement; pulses at 2-second intervals; stops after drawer is opened
- Drawer expand animation: 200ms ease-out, expands from top of drawer downward
- Timestamp link: appears inline as teal underlined text; clicking it opens the replay panel split-view with the result panel still visible on the right
- SCOUT-B highlight at tick 52: amber ring on portrait, 600ms fade-in, 1-second hold, amber signal beam toward RELAY-C
- Compare table: accessible via "Compare with #2–5" link at drawer bottom; appears as a compact data table replacing the prose explanation

---

### Journey: Maya, 19, art student, new player, Mission 3

**Context:** Maya is 4 hours into the game. She's never used the Fix Explorer in THOROUGH mode — she uses QUICK because it's fast and she doesn't understand the difference. She just lost a mission she thought she had figured out.

**Minute 0:00 — The Friendly Panel**

Maya opens the debrief. The Fix Explorer panel is familiar by now. She clicks Run Analysis.

4 seconds: "FIRST VIABLE FIX: SCOUT-A — attention filter, remove 'low-priority' tag."

Below the result card, the drawer is visible but collapsed:

> "▼ Why was this ranked first?"

The copy is simple — not "pre-ranking heuristic," just "why was this ranked first." The vocabulary step will come later.

Maya clicks it. She's curious.

```
SCOUT-A was busy at the moment the match turned (tick 34).
Things that were busy when something went wrong are worth checking first.

SCOUT-A's attention filter hasn't been changed recently — but it was very busy this run
(changed between 14 different states). Busy things are more likely to be the cause.

This was ranked #1 out of 89 candidates.
```

The language is plain. No "volatility score." No "pre-ranking heuristic." Just "busy when something went wrong" and "very busy this run."

**Minute 1:00 — The Animation**

Maya hovers over "tick 34" in the explanation. The replay panel shows a faint highlight at the tick 34 position on the timeline. She clicks it.

The replay scrubs to tick 34. SCOUT-A is visible — she can see it moving, the attention filter active. She doesn't fully understand what she's watching, but she recognizes SCOUT-A. She can see it was busy.

She applies the fix. Pass rate goes from 57 to 71. The fix worked.

**Minute 2:00 — The Quiet Lesson**

Maya doesn't think about the drawer again. But she absorbed something: the game looked at *what was happening when the match turned* and used that to guess what was wrong. That's... reasonable? She would have done the same thing.

Three sessions later, she's debugging a config manually and she notices she's doing the same thing: looking at what was active at the pivot tick. She doesn't realize she learned this from the drawer. It feels obvious.

**What Maya wants to do next:** She doesn't think about the drawer's pedagogy at all. She just runs the explorer and applies fixes. But the plain-language explanation stuck — she has a mental model of "check what was busy when it broke."

**UI Annotations:**
- Drawer is collapsed but visible below first result card; no pulsing border in early game (no amber urgency signal, just a gentle chevron)
- Copy uses "busy" not "active," "moment the match turned" not "pivot tick," "89 candidates" not "candidate enumeration"
- Tick 34 appears as a teal hyperlink inside the drawer text; clicking opens split-view replay focused on that tick
- Plain-language mode auto-enabled for players in their first 5 hours of play (tracked by total session time); switches to technical vocabulary after milestone

---

### Journey: Zara, 22, CS student, Gauntlet prep, 150 hours in

**Context:** Zara is preparing for a Gauntlet match. She runs the MSMFE in THOROUGH mode and gets a set of results across 32 failing scenarios. She's confident in the minimum-fix results. But she's curious about something: why did the QUICK mode result (which she ran first) surface a different candidate than the THOROUGH minimum?

**Minute 0:00 — The Comparative Analysis**

Zara opens the drawer under the THOROUGH result (the minimum fix is RELAY-C — buffer +1). She switches to the comparison view by clicking "Compare with QUICK result."

The drawer shows a side-by-side:

```
QUICK RESULT (pre-ranking #1):          THOROUGH RESULT (minimum fix):
SCOUT-B                                 RELAY-C
pivot-active: 0.91                      pivot-active: 0.68
recency: 0.88 (modified 1 session ago)  recency: 0.12 (not recently changed)
volatility: 0.81                        volatility: 0.44
rank score: 0.87                        rank score: 0.42

Why QUICK found SCOUT-B first:
SCOUT-B was the most-active element at tick 52 AND was recently modified.
The pre-ranking heuristic weighted these signals highly.

Why SCOUT-B wasn't the minimum fix:
SCOUT-B's volatility was caused by its own high activity, not by a configuration error.
The minimum fix (RELAY-C buffer +1) is smaller and resolves 32 failing scenarios.
SCOUT-B's modification would have resolved only 11.
```

**Minute 1:30 — The Meta-Insight**

Zara is reading the "Why SCOUT-B wasn't the minimum fix" section. She's connecting this to something she's been thinking about: the pre-ranking uses circumstantial evidence (was it active? was it changed recently?), not causal evidence (did this config change directly cause the failure?).

This is a fundamental limitation of all heuristic search — the heuristic approximates likelihood of cause but can't prove causality. The minimum fix is the empirical result (it changed the outcome), but the pre-ranking is the prior (it's probably the cause).

She opens a browser window and googles "Bayesian priors vs. empirical posteriors" — not because the game told her to, but because she's making that connection herself.

She comes back and reads the comparison again. The pre-ranking got the right neighborhood (the relay chain area) but the wrong specific element (sender vs. receiver). It's a reasonable mistake. The heuristic is doing the best it can with circumstantial evidence.

**Minute 3:00 — The Practical Takeaway**

Zara decides on a workflow for Gauntlet prep:
1. Run QUICK first to get a fast hypothesis
2. Read the pre-ranking drawer to understand *why* the hypothesis was surfaced
3. Check whether the pre-ranking reasoning is valid for this specific failure type
4. If the reasoning seems sound (pivot-active + recent-change + high-volatility all pointing the same direction), apply the QUICK fix tentatively
5. If the reasoning seems suspect (high recency but the element wasn't logically connected to the failure), run THOROUGH and override

She writes a forum post: "How to use the pre-ranking drawer to triage QUICK vs. THOROUGH decisions." It gets 61 upvotes.

**Minute 5:00 — A New Question**

Zara discovers something in the drawer: there's a small "heuristic accuracy" stat at the bottom — shown only to players who have opened the drawer 10+ times:

```
Pre-ranking accuracy (your history):
QUICK result matched THOROUGH minimum: 71% of your sessions
Average candidate rank of minimum fix: 2.8 (within top 3)
```

She stares at this. 71% accuracy. The pre-ranking is right more than two-thirds of the time. But one-third of the time, QUICK leads her away from the root cause. Given that she uses QUICK for initial diagnosis, one-third of her initial hypotheses were wrong.

This is a real number about the quality of a tool she uses every session. It's deeply interesting.

**What Zara wants to do next:** Try to improve her pre-ranking accuracy by comparing her config choices to sessions where the pre-ranking was wrong — can she find a pattern in when the heuristic fails?

**UI Annotations:**
- Comparison view: appears as a two-column layout replacing the single-column prose explanation; column widths are equal
- "Why X wasn't the minimum fix" section: appears only when QUICK and THOROUGH results differ; yellow-amber background to distinguish from the ranking explanation (which is neutral)
- Heuristic accuracy stat: a small dim row at the bottom of the drawer; appears after 10 drawer-opens; dim gold text "#OP accuracy: 71% (71/100 of your sessions)"
- Forum link affordance: none in-game, but Zara's discovery that 71% accuracy is interesting should inform the design of whether to surface this stat to all players (it may discourage use of QUICK mode if players don't understand that 71% is actually high for a diagnostic heuristic)

---

## Strengths

- **Makes the invisible visible**: The pre-ranking heuristic works and is genuinely useful, but players who don't know it exists can't evaluate it. The transparency panel creates a feedback loop: player uses QUICK, sees why the result was surfaced, evaluates the reasoning, uses that to build diagnostic intuition.

- **Directly maps to real engineering**: "Check what was active when it broke" and "check what you changed recently" are the first two things any engineer does when debugging. The pre-ranking panel formalizes this as a named, legible system. Players who go on to debug real systems will recognize the mental model immediately.

- **Reveals failure modes gracefully**: When the pre-ranking is wrong (SCOUT-B instead of RELAY-C), the drawer can show *why* it was wrong without the game feeling broken. The heuristic worked correctly given its inputs — the inputs just didn't capture the real causation. This teaches the difference between "the tool failed" and "the heuristic has limitations."

- **Generates comparison affordances**: Once the player can see *why* candidates are ranked, they can ask "why is #2 ranked lower than #1?" This comparison creates a whole layer of diagnostic depth that wouldn't exist if the ranking were opaque.

- **Rewards curiosity without requiring it**: The drawer is collapsible and off by default. Players who never open it still get the fix. Players who open it get a lesson. No one is punished for not engaging.

---

## Weaknesses

- **Explanation vocabulary must be learned separately**: "Pivot-tick active," "recency signal," "volatility score" — these terms need to be introduced somewhere before the drawer uses them. If the drawer is the first place a player encounters "pivot tick," the explanation will be circular. The drawer should build on established vocabulary, not introduce it.

- **Risk of over-explaining**: A player who runs the Fix Explorer 200 times doesn't need the full explanation every time. The panel must degrade gracefully from "full lesson" to "quick reference" as the player accumulates experience.

- **"Heuristic accuracy" stat is a double-edged sword**: Showing that the pre-ranking is right 71% of the time is reassuring to sophisticated players and possibly discouraging to players who don't have context on what 71% means for a diagnostic heuristic. Surfacing this stat requires framing it correctly.

- **Accuracy stat creates a leaderboard incentive**: If heuristic accuracy is visible and varies per-player, players may start optimizing for it (always running THOROUGH to verify, never just using QUICK) rather than using it diagnostically. The stat should be informational, not a performance metric.

---

## Interaction Effects

**With 4.40 (QUICK vs. THOROUGH toggle):**
The pre-ranking drawer is the direct companion to the toggle. The toggle gives the player a choice of search strategy; the drawer explains the pre-ranking that makes QUICK mode non-arbitrary. Without the drawer, QUICK mode feels like a black box. With the drawer, QUICK mode is a transparent first-hypothesis system.

**With 4.61 (QUICK vs. THOROUGH explainer):**
The 4.61 aspect asks for a dedicated comparison view when QUICK and THOROUGH find different results. The drawer's compare affordance is the natural home for that explainer. Rather than a separate panel, the comparison logic lives inside the transparency drawer as a conditional section that appears when results diverge.

**With 4.16 (Signal genealogy visualization):**
The pivot-tick activity signal in the pre-ranking is related to the signal genealogy: which elements were processing signals at the pivot tick? The signal genealogy already shows this as a graph. The drawer should link directly to the relevant node in the signal genealogy: "See RELAY-C's signal activity at tick 52 →" This makes the drawer an entry point into the signal genealogy, not a separate tool.

**With 8.08 (Real-language vocabulary claim):**
The drawer is a direct vocabulary teaching surface. Every term it introduces — "pivot tick," "recency," "volatility," "pre-ranking heuristic" — should be consistent with real engineering vocabulary. "Pivot tick" is Robot Uprising-specific, but the concept (the moment the match outcome became effectively determined) maps to "the time of failure" in incident reports. "Recency" maps directly to "recent changes" in debugging. "Volatility" maps to "churn" in code quality metrics. The drawer should use Robot Uprising vocabulary with real-engineering parentheticals — not as tutorialization but as vocabulary alignment.

**With 8.09 (Diagnostic layer as teaching arc):**
The transparency panel is part of the larger diagnostic teaching arc. Players progress through: (1) watching replays passively → (2) noticing pivot annotations → (3) using the Fix Explorer → (4) understanding QUICK mode's pre-ranking → (5) building their own diagnostic priors that transfer to real engineering. The drawer is step 4 in that progression.

**With 4.15 (Probe hooks):**
Probe hooks are "always-be-observable" debug taps on specific elements. The pre-ranking drawer could surface probe hooks as a follow-on action: "RELAY-C was active at tick 52. Add a probe hook to RELAY-C to capture its state in the next match →" This converts the transparency panel from passive explanation to active diagnostic tool.

---

## Comparable Games and Media

**Google's "Why am I seeing this ad?"**: The canonical consumer-product transparency feature. Surfaces algorithm inputs in plain language for non-technical users. Key lesson: the framing matters more than the detail. "Based on your recent activity" is more useful than "because your session cookie matched segment 4A." Robot Uprising's drawer should frame the pre-ranking in terms of player actions ("you modified this recently"), not algorithm internals ("recency weight: 0.88").

**Spotify's "Recommended because you listened to X"**: Connects algorithmic decision to player history. Creates a feedback loop: player recognizes the input (X), evaluates whether it's a good basis for the recommendation, and calibrates their trust in the algorithm. Same pattern for the pre-ranking drawer: "ranked because SCOUT-B was active at tick 52 — do you think that's the right place to look?"

**Linter explanations (ESLint, Pylint):** Every linting violation has a rule code and a brief explanation: "no-unused-vars: 'result' is assigned but never used." This pattern is the exact model for the pre-ranking drawer. The fix is the "linter violation." The pre-ranking explanation is the "rule code + rationale." Engineers who use linters regularly will recognize this pattern instantly.

**Chess engine evaluation with move reasons**: Stockfish's interface can show "why this move?" — the top contributing factors to the evaluation. "Control of e4 (+0.3), king safety (+0.2), development tempo (+0.1)." Robot Uprising's three-bar breakdown (Option E) is this pattern. The chess analogy is strong for players who have used chess.com's analysis features.

**Incident postmortem culture**: Engineering postmortems routinely distinguish between "what was active when the failure occurred" (contributing factors) and "what caused the failure" (root cause). The pre-ranking drawer teaches this distinction directly — SCOUT-B was contributing (active at pivot tick) but RELAY-C was causal (buffer overflow). Players who go on to write incident postmortems will have seen this distinction modeled.

**Explainable AI (XAI) research**: The academic field of making ML model decisions legible. LIME, SHAP, attention visualization in neural networks. The pre-ranking drawer is a toy version of XAI — it makes a heuristic algorithm's reasoning legible to the person affected by its decisions. The vocabulary ("feature importance," "contributing factors," "heuristic vs. causal") is well-developed in this field and could inform the drawer's language design.

---

## Sensory Description

**The drawer in its default state (collapsed):**

A thin horizontal bar below the top result card. Not prominent — a secondary element. Light grey background, slightly recessed. A small chevron icon on the left (▶ collapsed), a label in dim type: "why is this ranked first?" On the right, a faint score display: "0.84." The whole bar is 24px tall.

When the player first opens a session, the bar pulses gently once — a brief brightening of the grey to off-white — as if reminding the player it's there. Then it settles.

**Opening the drawer:**

A smooth 200ms expansion. The content slides down from beneath the bar, not from off-screen. The expansion has a gentle spring — slightly overshoots by 4px then settles. A soft "click" sound — like a card being placed on a felt surface, clean and precise.

**Inside the drawer — the explanation text:**

The prose explanation is in a slightly larger, more readable typeface than the rest of the panel. The three contributing signals are visually separated with small colored indicators:

- **Pivot-tick activity**: A small amber diamond (matching the EDT diamond language used throughout the debrief). The text "active at tick 52" is a teal hyperlink.
- **Recency**: A small teal clock icon. "Modified 2 sessions ago" — the session count is in a bolder weight.
- **Volatility**: A small violet waveform icon. "22 distinct states" — the number is slightly larger than surrounding text.

The rank score at the bottom: "Overall rank score: 0.84 / 1.0" — displayed as a thin horizontal bar, amber-filled to 84% width. The bar's color is the same amber as the pivot-activity diamond: this element's rank is amber-tinted, connecting it to the "pivot was the key signal" framing.

**When the timestamp link is clicked:**

The debrief timeline panel animates — the playhead jumps to tick 52 with a short ease-out motion. On the battlefield, the ranked element (RELAY-C or SCOUT-B) briefly illuminates with a warm amber ring — not a harsh flash, a warm glow, like a spotlight finding a subject. The ring pulses once and fades over 800ms.

At the same time, the drawer doesn't close — it stays open. The player can look at tick 52 on the battlefield with the explanation still visible, comparing what they see to what the drawer says.

**The comparison view (when QUICK ≠ THOROUGH result):**

The drawer expands by an additional 120px. The comparison section has a clear visual separation: a thin yellow-amber line above it and the label "WHY RESULTS DIFFER" in a small, slightly warm-tinted typeface. The two columns are color-coded: QUICK result column has a faint amber tint on the header; THOROUGH result column has a faint violet tint.

The "Why [QUICK result] wasn't the minimum fix" section has a slightly different background — warmer, like old paper — to signal that it's a different kind of content (post-hoc analysis, not forward-facing explanation).

**Closing the drawer:**

Smooth 150ms collapse. A small, quiet click — the same as opening but reversed in pitch (slightly lower note). The chevron icon flips back to collapsed position.

---

## Discovered New Aspects

1. **4.63 — Player-configurable pre-ranking weights**: A late-game unlock allowing the player to adjust the three heuristic signals (pivot-activity, recency, volatility) by slider — "I care more about recency than pivot activity"; teaches that the pre-ranking is a configurable belief system, not a fixed algorithm; interaction with 8.08 vocabulary claim ("this is how you tune a heuristic").

2. **4.64 — Pre-ranking accuracy as a displayed stat**: After 30+ sessions, the drawer shows "pre-ranking accuracy: your QUICK result matched THOROUGH minimum 71% of sessions"; teaches what 71% means for a diagnostic heuristic (high, because the baseline is 1/N ≈ 0.7%); risk of players optimizing for the stat vs. using it diagnostically.

3. **4.65 — Pre-ranking adversarial surface**: Enemy configs can be deliberately designed to fool the pre-ranking heuristic — engineer a config where the element that appears causally responsible (high pivot-activity, high volatility) is actually a decoy, and the real vulnerability is elsewhere; "pre-ranking poisoning" as an advanced PvP attack vector; interaction with adversarial counterfactual mode (4.39).

4. **4.66 — Signal genealogy as pre-ranking source**: Link the pivot-tick activity signal in the pre-ranking directly to the signal genealogy graph (4.16); clicking "active at tick 52" in the drawer highlights the relevant node in the signal genealogy; unifies the two diagnostic tools into one coherent vocabulary.

5. **4.67 — Probe hook suggestion from transparency panel**: When the drawer identifies an element as high-volatility or high-pivot-activity, surface a one-click action: "Add probe hook to capture [RELAY-C] state in next match →"; converts passive explanation into active diagnostic step; probe hooks (4.15) as the natural follow-on to understanding the pre-ranking.

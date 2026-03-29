# 4.94 — "Gut Calls": Committed-to-QUICK Sessions-Only Accuracy

**Aspect:** Tracking accuracy specifically in sessions where the player ran QUICK and made a config change without verifying with THOROUGH — the "did you trust it correctly?" metric. Eliminates survivorship bias from selective THOROUGH usage. Requires tracking whether THOROUGH was run before vs. after the config change was applied. The most honest possible accuracy measurement.

**Parent:** 4.64 — Pre-ranking accuracy as a displayed stat
**Siblings:** 4.93 — Accuracy stat confidence interval display; 4.95 — Accuracy leaderboard opt-in; 4.96 — Accuracy-vs.-complexity scatter plot
**Related:** 4.60 — Search budget as resource; 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result; 4.63 — Player-configurable pre-ranking weights; 4.25 — EDT trajectory; 8.09 — Diagnostic layer as teaching arc

---

## The Name: "Gut Calls"

A single bold number rendered in a hand-drawn sketch font — as if scrawled on a napkin — sits above the label **Gut Calls**. Below it, a thin timeline shows each committed session as a dot: green for correct, crimson for wrong, the dots clustering like a heart-rate monitor. The napkin aesthetic is deliberate. This is the metric that strips away every safety net the player has built. No THOROUGH verification. No second opinion. Just you, QUICK's output, and the decision to trust it. Scrawling on a napkin is what you do when you're confident enough not to open a spreadsheet.

The standard pre-ranking accuracy stat (4.64) has a structural lie at its center: it only counts sessions where the player ran both QUICK and THOROUGH. A player who selectively runs THOROUGH on easy cases — confirming wins they already suspected — inflates the number. A player who only verifies on hard cases deflates it. Neither tells the truth.

Gut Calls eliminates this entirely. It asks: **in sessions where you trusted QUICK alone and moved on, was QUICK actually right?**

The tracking is silent and total:

1. Player runs QUICK. Candidate A surfaces.
2. Player applies candidate A's config change.
3. Player does NOT run THOROUGH before executing the next mission.
4. The game runs a deferred THOROUGH computation in the background — asynchronously, invisibly, between sessions.
5. The background result is compared to what the player applied.
6. Match = justified trust. Divergence = the player shipped a suboptimal fix without knowing it.

The denominator is every session where the player committed to QUICK without verification. The numerator is every session where QUICK happened to be correct. No curation. No survivorship. The pop quiz, not the take-home exam.

---

## The Display

### At Rest in the Transparency Drawer

Below the standard accuracy line, separated by 8px of whitespace. The label "Gut Calls" is rendered in warm amber (#D4A574) — visually distinct from the analytical teal (#6BB5B5) of the standard metrics. Amber reads as honest, slightly grave, like a surgeon's voice when they stop using jargon.

The percentage is the same font size as the standard accuracy — equal visual weight, two truths side by side. Below it, in lighter weight: "(22 qualifying sessions)" in grey. The Gut Calls stat earns credibility through sample-size transparency.

The dot timeline stretches across the full drawer width: each dot is a committed session. Green (#4ADE80) for correct, crimson (#DC2626) for wrong. The dots march left to right chronologically, most recent on the right, spaced evenly at ~6px intervals. When the player hovers a crimson dot, a whisper-thin line drops down to a micro-tooltip: "Mission 24 — QUICK said Scout-B beacon -2. Minimum was Relay-C buffer +1." The tooltip is the ghost of the answer the player never asked for.

### The Gap Indicator

When both stats are present:

```
Standard accuracy:  71%
Gut Calls:          64%
Gap:               -7pp
```

The gap's sign is amber for negative (unverified trust is worse), teal for positive (unverified trust outperforms). Below the number, nearly subliminal grey text: "-17pp" yields "your unverified trust is significantly less accurate." "-4pp" yields "within normal range." "+3pp" yields "your unverified trust slightly outperforms." The text is so light it is more felt than read.

### Divergence Magnitude

Below the Gut Calls percentage, a secondary line:

```
avg divergence: 2.4 config units
```

A horizontal amber gradient bar sits behind the number, proportional to the divergence value. At 1.0 (same element, wrong dose), the bar barely extends past the digits. At 5.0+ (completely wrong element), it stretches across the full drawer. The bar is a thermometer of how far off the player was when they were wrong.

### First Appearance

When Gut Calls crosses its minimum threshold (20 qualifying sessions), the amber label fades in over 400ms on the next drawer open. The percentage materializes character by character, left to right, like a terminal readout. A single resonant hum in a minor key — not a chime, not a bell. This metric is not celebrating. It is reporting.

---

## The Session State Machine

Tracking requires distinguishing three session types:

| Type | Behavior | Contributes to |
|------|----------|----------------|
| A — Verified before apply | Ran QUICK, ran THOROUGH, then applied | Standard accuracy (4.64) |
| B — Committed unverified | Ran QUICK, applied, never ran THOROUGH | **Gut Calls** |
| C — Verified after commit | Ran QUICK, applied, later ran THOROUGH | **Gut Calls** (trust happened at the moment of apply) |

Type C counts as Gut Calls because the metric cares about the moment of commitment. Running THOROUGH retroactively does not un-trust the decision. The question is "were you right when you decided?" not "did you eventually find out?"

The state machine per session:

```
DEBRIEF_STARTED
  -> ran QUICK         -> QUICK_AVAILABLE
  -> ran THOROUGH      -> THOROUGH_AVAILABLE

QUICK_AVAILABLE
  -> applied config    -> COMMITTED_TO_QUICK  (Type B candidate)
  -> ran THOROUGH      -> BOTH_PRE_APPLY      (Type A)

COMMITTED_TO_QUICK
  -> next mission      -> GUT_CALL_CONFIRMED   (Type B)
  -> ran THOROUGH      -> GUT_CALL_THEN_VERIFIED (Type C — still Gut Calls)
```

---

## Player Journeys

#### Journey: Luis, 34, Data Engineer
**Context:** Mission 31, seven-agent relay mesh, 110 hours played. His standard accuracy hovers at 73%. He suspects it is inflated — he tends to run THOROUGH when QUICK "feels right," confirming wins rather than testing losses.

**Minute 0:00 — The Second Number**
Luis runs QUICK after a tight match. Scout-A's perception range surfaces with high pivot-activity (0.82). He nods — feels right. Opens the transparency drawer out of habit. Below the familiar 73% standard accuracy, something new. An amber label he has not seen before. The hand-drawn sketch font reads **56%** above the word "Gut Calls." The dot timeline underneath is a scatter of green and crimson — more crimson than he expected, clustering in the middle sessions like a rash.

He stops scrolling. 56%. Not 73%. The gap line below: `-17pp (your unverified trust is significantly less accurate)`. Minus seventeen percentage points. When he does not check his work, he is wrong nearly half the time.

**Minute 1:30 — The Data Engineer's Reckoning**
He is a data engineer. He understands instantly. His 73% was computed only on sessions where he ran THOROUGH — which he did when the QUICK result looked plausible. He was cherry-picking the easy cases for verification. The hard cases — the ones where QUICK was ambiguous, where he should have checked — went unverified. And those are the sessions Gut Calls is counting.

He hovers over the divergence line: "avg divergence: 2.4 config units." The tooltip floats in after 200ms, 280px wide, with a scale: 1.0 = same element wrong dose, 2.0-3.0 = causally adjacent element, 3.0+ = completely wrong. His 2.4 means QUICK was usually in the neighborhood. Not random. Not precise either.

**Minute 3:30 — The Protocol Change**
He decides: for the next ten sessions, run THOROUGH when QUICK's pivot-activity score is below 0.6. Target the uncertain cases instead of the confident ones. He wants the gap to narrow toward zero — not by inflating the standard stat, but by testing the hard cases honestly.

**Minute 5:00 — Resolution**
He applies the QUICK recommendation and runs the next match. But for the first time, he carries a calibrated expectation: there is roughly a 44% chance he just applied the wrong fix. If the pass rate does not improve, he will not blame the match — he will blame the diagnosis.

**UI Annotations:**
- **"56%" in sketch font**: Same visual weight as standard accuracy percentage; no alarm styling, no red; the number is stark enough
- **Dot timeline**: 18 dots, 10 green, 8 crimson; hovers reveal per-session QUICK-vs-THOROUGH comparisons; crimson dots cluster in sessions 8-14 where his architecture was mid-transition
- **Gap line "-17pp"**: Amber dash, light grey descriptor; "significantly less accurate" threshold is |gap| > 10pp; smaller gaps show "slightly less accurate" (5-10pp) or "within normal range" (<5pp)
- **Divergence tooltip**: 200ms delay, floating card, the player's specific 2.4 highlighted in the 2.0-3.0 range band

---

#### Journey: Amara, 19, First-Year CS Student
**Context:** Mission 8, 30 hours played. She has used QUICK exclusively for four missions. She has never run THOROUGH — "it takes forever and I don't get the difference." She has 28 committed-to-QUICK sessions and zero standard accuracy sessions.

**Minute 0:00 — The Only Number**
Amara opens the debrief after a rough mission — 51% pass rate. She runs QUICK. Striker-B's rule priority order surfaces. She opens the transparency drawer (a loading-screen tip mentioned it last session).

The standard accuracy section is greyed out: "Pre-ranking accuracy (both modes): not enough data. Need 30 sessions with both QUICK and THOROUGH — you have 0." A dim progress bar sits at 0/30, nearly invisible.

But below it, in amber, the sketch font: **61%**. "Gut Calls." The dot timeline shows 28 dots, mostly green with a spray of crimson toward the early sessions. This is the only accuracy number she has ever seen.

**Minute 0:30 — The Question Mark**
She taps the "?" icon. A floating card:

> Every time you run QUICK and apply the fix without checking THOROUGH, the game quietly verifies whether QUICK found the best fix.
>
> 61% means: in 17 out of 28 sessions, QUICK nailed it. In the other 11, a smaller fix existed that QUICK missed.
>
> This is normal for early-campaign players (typical: 55-70%). As you learn your architecture, this number usually rises.
>
> Want to improve? Try running THOROUGH occasionally to see what QUICK might miss.

Two things register. First: "55-70% is normal." She is not bad at this. Second: "the game quietly verifies." Slightly eerie. Like discovering the teacher was grading her scratch paper all along.

**Minute 1:30 — The Nudge**
After dismissing the popup, the THOROUGH button on the Fix Explorer gains a faint amber pulse — a one-time animation, 3 seconds, never replayed. She notices. She clicks it. Waits 26 seconds. THOROUGH agrees with QUICK: Striker-B's rule priority is the minimum fix.

She does not know it, but the 0/30 standard accuracy counter just ticked to 1/30.

**Minute 3:00 — The First Divergence**
Mission 9. QUICK says Relay-A buffer +2. She runs THOROUGH. 28 seconds. THOROUGH says Relay-A buffer +1. Same element, smaller dose. The divergence explainer (4.61) fires with side-by-side cards. She applies THOROUGH's result.

She has now learned through direct experience what the 61% was telling her: QUICK is directionally correct but sometimes over-prescribes. The Gut Calls stat primed this learning. Without it, she would never have questioned QUICK's output.

**Minute 4:00 — Resolution**
Over five sessions, she alternates: three QUICK-only, two QUICK-then-THOROUGH. Her Gut Calls ticks to 63%. Her standard accuracy starts at 2/2 (meaningless sample, but the progress bar shows 2/30). She develops an informal rule: "run THOROUGH when the Fix Explorer shows more than three candidates close together." She does not know she is implementing a confidence-based verification heuristic. She just knows "when it seems uncertain, check."

**UI Annotations:**
- **Standard accuracy greyed out**: 0/30 progress bar, dim, clearly subordinate to the populated Gut Calls stat; visual hierarchy says "this metric exists but isn't ready"
- **One-time THOROUGH pulse**: Amber glow, 3-second fade, triggered exactly once per player after first Gut Calls popup dismissal; matches the amber color family
- **"Typical: 55-70%"**: Range shifts by campaign progress — early campaign shows 55-70%, mid-game shows 60-80%; benchmark matched to experience level

---

#### Journey: Tomoko, 52, Retired Math Professor
**Context:** Gauntlet mode (competitive endgame), 320 hours, 14 agents across three configurations. She runs THOROUGH on every session. She has never once applied a QUICK result without verification. Standard accuracy: 76% over 120 sessions. Gut Calls sessions: zero.

**Minute 0:00 — The Absent Metric**
Tomoko opens the transparency drawer. Her 76% standard accuracy is familiar. Below it, in dim grey — no amber, no sketch font — a single line:

> Gut Calls: no qualifying sessions.
> You always verify with THOROUGH before applying changes.

No progress bar. No fraction. The metric cannot predict when the player will choose not to verify, so it shows no denominator. It simply states what it observes. The faint text reads like an AI system that noticed a behavioral pattern and noted it — diegetically consistent with the game's "you are reading your own telemetry" narrative.

She reads the last line twice. She expected a number. Instead, the game is telling her something about herself.

**Minute 1:30 — The Experiment**
She is a mathematician. She designs a controlled trial. In her physical notebook:

```
Experiment: Gut Calls data generation
Hypothesis: GC accuracy ~ 76% (matches standard accuracy)
Protocol: 25 consecutive QUICK-only Gauntlet sessions.
          No THOROUGH. Apply immediately.
Start: Session 321.
```

**Minute 3:00 — Sessions 321-335: The Data Accumulates**
She plays fifteen matches, applying QUICK each time without verification. It feels wrong — like driving without mirrors. After fifteen sessions, the amber sketch font materializes for the first time. The resonant hum plays as the number resolves character by character:

**70%**

The dot timeline is short — fifteen dots, eleven green, four crimson. Below: "avg divergence: 1.4 config units." Below that, the gap appears for the first time: `-6pp (slightly less accurate)`.

She notes the preliminary nature. At n=15, the 95% interval is enormous. She continues.

**Minute 5:00 — Session 345: The Full Run**
After 25 QUICK-only sessions:

```
Gut Calls: 72%  (18/25)
avg divergence: 1.6 config units
Gap: -4pp (within normal range)
```

72% Gut Calls vs. 76% standard. Her null hypothesis — gap > 5pp — is not rejected. The difference is within normal variation. Her architecture is modular enough that QUICK performs consistently regardless of verification.

**Minute 7:00 — The Permission**
She now has actionable information: QUICK is right 72% of the time even when she does not check. Running THOROUGH on every session cost ~28 seconds times 300+ sessions — roughly 2.5 hours of her life confirming QUICK's result three-quarters of the time. She revises her protocol: THOROUGH only when her subjective confidence in QUICK is below 3 on a 1-5 scale.

The Gut Calls stat gave her permission to trust QUICK. Without it, she was verifying defensively — "just in case." Now she knows the "in case" is a 28% event.

**UI Annotations:**
- **"You always verify" text**: Appears only when player has 0 qualifying Gut Calls sessions and 20+ standard accuracy sessions; dim grey, no judgment; behavioral observation only
- **Insufficient data state**: No progress bar (denominator unknowable); explanatory text instead of a fraction
- **First appearance at n=15**: Stat appears at lower threshold (10 sessions) than standard accuracy (30) because Gut Calls inherently has fewer qualifying sessions; "(preliminary — small sample)" in light grey below percentage

---

## Strengths

**Eliminates the most fundamental measurement bias in the system.** The standard accuracy stat's survivorship bias is structural, not incidental. It makes the number systematically misleading for most players. Gut Calls fixes this by measuring the decisions that actually mattered — the unverified ones. The pop quiz, not the take-home.

**Creates a natural bridge to THOROUGH for QUICK-only players.** For players like Amara, Gut Calls is the only accuracy number they will ever see. It provides the first evidence that QUICK is not infallible — and suggests trying THOROUGH. The metric acts as a pedagogical instrument without a single line of tutorial text.

**Reveals confirmation bias to selective verifiers.** The gap between standard and Gut Calls accuracy is a mirror showing Luis that his verification behavior is non-random. A -17pp gap means: "you verify the easy cases and trust the hard ones." A genuinely useful insight most games never surface.

**Gives permission to relax for always-verify players.** Tomoko generates the data deliberately and learns she can trust QUICK. The stat saves her hours of unnecessary THOROUGH computations by quantifying the risk of not verifying.

**The background computation is invisible.** Deferred THOROUGH runs silently between sessions. The player never waits, never triggers it. The metric appears omniscient — reinforcing the game's theme of operating within an intelligent system that knows more than it says.

**Divergence magnitude adds a second axis.** "64% accuracy" alone is ambiguous. With "avg divergence: 1.8" attached, the player knows QUICK was usually in the right neighborhood. "64% accuracy, divergence 5.4" would mean QUICK was frequently lost. The magnitude contextualizes the percentage.

---

## Weaknesses

**Background computation has a snapshot problem.** The deferred THOROUGH must run on the pre-change config state. If the game snapshots after the player applies QUICK's recommendation, the THOROUGH computation runs on different data and the comparison is meaningless. Requires careful state management: snapshot at debrief entry, not after apply.

**Penalizes correct-but-not-minimal fixes.** A player applies QUICK's recommendation and it works — pass rate jumps. But THOROUGH would have found a smaller fix. The stat counts this as a miss. The player improved their config but the headline number says "wrong." The divergence magnitude partially addresses this (0.8 divergence is barely a miss), but the percentage still stings.

**Zero-data problem for always-verify players.** Tomoko had to deliberately generate data through a controlled experiment. Most rigorous players will not do this — they will simply never see the metric. The game cannot force players to not verify. Gut Calls is structurally unavailable to the most careful players unless they deliberately choose to be less careful.

**Phantom accuracy without actionable detail.** Gut Calls tells the player "you were wrong 36% of the time" but does not show which sessions were wrong or what the right answer was. Surfacing per-session divergence logs requires additional UI (a "Gut Call review" panel). Without it, the stat is a number without a path forward.

**Early-player anxiety.** A 55% Gut Calls accuracy means "your diagnostic tool is barely better than a coin flip." This might discourage QUICK usage entirely rather than encouraging strategic THOROUGH verification. The contextualizing copy ("typical: 55-70% for early campaign") partially mitigates, but the number feels low in absolute terms.

**Invisible computational cost.** Deferred THOROUGH on every unverified session means potentially hundreds of background computations. Each takes 25-35 seconds of CPU. On lower-end machines, this accumulates. Implementation needs a cap — perhaps only the 30 most recent qualifying sessions, purging older replay data.

---

## Interaction Effects

**With 4.64 (Standard accuracy):** Together they bracket true diagnostic accuracy. The gap between them is itself a metric — it measures verification selection bias. A player who understands both numbers has a genuinely sophisticated model of their own diagnostic process.

**With 4.60 (Search budget as resource):** If THOROUGH costs tokens, Gut Calls quantifies the cost of not spending them. "64% Gut Calls accuracy" translates to "if I don't verify, there's a 36% chance I ship a suboptimal fix." The budget decision transforms from "should I spend a token?" to "can I afford a 36% error rate?"

**With 4.63 (Player-configurable pre-ranking weights):** Gut Calls is a better feedback signal for weight tuning than standard accuracy. Adjusting weights and playing unverified sessions lets the CQ stat reflect the change's effect on real diagnostic accuracy — the honest metric, not the curated one.

**With 4.25 (EDT trajectory):** Complementary career health indicators. EDT measures "is my config improving?" Gut Calls measures "am I diagnosing correctly when I don't verify?" Improving EDT with falling Gut Calls is an unstable state — configs are getting better but diagnostic process is degrading.

**With 4.93 (Confidence intervals):** Gut Calls has inherently fewer data points, so its confidence interval is wider. Displaying both stats with intervals creates nuance: standard might be "71% +/- 8pp (n=34)" while Gut Calls is "64% +/- 12pp (n=22)." Overlapping intervals tell the player the gap might not be meaningful yet.

**With 8.09 (Diagnostic teaching arc):** Gut Calls is the arc's "self-awareness" phase — the player learns to evaluate their own evaluation process. Genuine metacognition that maps directly to real-world calibrated confidence in engineering judgments.

---

## Comparable Games and Media

**Clinical trial intention-to-treat analysis.** In medical research, intention-to-treat counts every patient assigned to a treatment group — even those who dropped out or switched. It prevents selection bias that inflates treatment effect. Gut Calls is intention-to-treat for diagnostic decisions: every session where the player intended to trust QUICK is counted, regardless of later verification. Per-protocol analysis (standard accuracy) systematically overestimates. Intention-to-treat (Gut Calls) gives the honest number.

**Poker hand tracking — showdown vs. non-showdown winnings.** PokerTracker splits winnings into showdown (hands that went to reveal) and non-showdown (hands won through pressure without reveal). Non-showdown is the "unverified" metric — performance in situations where ground truth was never exposed. Gut Calls has identical structure. The poker community learned decades ago that non-showdown performance is often where the real edge — or real leak — lives.

**Chess blitz vs. classical accuracy.** A player's move accuracy in classical (long think) versus blitz (pattern recognition only) reveals how much their verification process adds. A small gap means strong intuition. A large gap means heavy reliance on calculation. The Gut Calls gap measures the same thing: how much does THOROUGH actually add to this player's diagnostic accuracy?

**Software deploy rollback rates.** The rollback rate counts only deploys that shipped and failed — the committed decisions. A deploy caught in staging does not count. Gut Calls has identical structure: only sessions where the player shipped the QUICK result. The analogy extends further — a team that tests exhaustively before every deploy will never generate rollback data, just as Tomoko never generated Gut Calls data without deliberate effort.

**Forecasting calibration (Metaculus, Good Judgment Project).** When forecasters say "70% confident" and are right 70% of the time, they are well-calibrated. A player who feels "fairly confident" in QUICK and applies it is implicitly expressing ~70% confidence. If their Gut Calls is 56%, they are systematically overconfident. If 78%, well-calibrated. The connection to forecasting literature is direct and provides rich design language for future extensions — calibration plots, Brier scores, reliability diagrams.

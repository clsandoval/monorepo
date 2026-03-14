# "Why Did QUICK Find a Different Fix Than THOROUGH?" — The Divergence Explainer

**Aspect:** 4.61 — When a player has run both QUICK and THOROUGH modes and gotten different results, a dedicated comparison view shows both results side by side with an explanation of why the pre-ranking heuristic diverged from the minimality criterion; the explainer as an in-game search algorithm lesson.

**Parent:** 4.40 — "First viable fix" vs. "minimum fix" toggle
**Siblings:** 4.58 — Pre-ranking transparency panel; 4.59 — Career minimum fix; 4.60 — Search budget as resource; 4.62 — Agree-to-disagree result
**Related:** 4.20 — Counterfactual simulation; 4.36 — MSMFE; 4.37 — Fork-and-deploy; 4.38 — Counterfactual history; 4.63 — Player-configurable pre-ranking weights; 8.08 — Real-language vocabulary claim

---

## The Core Concept

The Fix Explorer has two modes:

- **QUICK**: Pre-ranks candidates by heuristic, stops at the first flip. Returns in ~4 seconds.
- **THOROUGH**: Exhaustively evaluates all candidates, returns the smallest change that flips the outcome. Returns in ~25–35 seconds.

Most of the time, these modes agree. The pre-ranking puts the minimum-fix candidate near the top, QUICK finds it first, and THOROUGH confirms it. Agreement is the happy path.

But a meaningful fraction of the time — perhaps one session in four for mid-game players — they **diverge**. QUICK says "fix Scout-B's beacon interval." THOROUGH says "fix Relay-C's context buffer." Both would improve pass rate, but THOROUGH's fix is smaller, and different.

**This divergence is not a failure.** The pre-ranking did its job — it surfaced a strong hypothesis quickly. It just didn't happen to be the minimum hypothesis. The divergence is a data point: it means the pre-ranking's circumstantial evidence (active at pivot, recently modified, high volatility) pointed at an element that was involved but not the root cause.

**The design question:** When QUICK and THOROUGH diverge, what does the player see? What do they learn? What does the game say about what just happened?

This is distinct from the pre-ranking transparency panel (4.58), which explains why a specific candidate was ranked first. The 4.61 explainer is triggered by a specific event — the divergence moment — and its job is to explain the *gap* between the two modes, not just the reasoning behind one candidate.

---

## Why Divergence Happens: The Four Scenarios

Before designing the explainer, catalog the structural reasons QUICK and THOROUGH diverge:

### Scenario 1 — The Symptom-Before-Cause Pattern

QUICK found element **A** because A was active at the pivot tick. THOROUGH found element **B** because B's modification is *smaller* and more upstream.

What happened: A was busy reacting to B's failure. B failed first; A processed the fallout. The pre-ranking surfaced A (visible, active, at the right moment) but the root cause was B (quieter, upstream, more architecturally fundamental).

**Engineering analogy:** Your logging service is throwing errors. You fix the logging service. Errors decrease slightly. You run a deeper analysis and find the database is timing out — the logging errors were a symptom.

### Scenario 2 — The Recency Bias Pattern

QUICK found element **A** because the player modified A three sessions ago (high recency signal). THOROUGH found element **B** because B's fix is smaller and B has never been touched.

What happened: The pre-ranking assumed "what you changed recently is what broke." In this case, it was wrong. A long-standing configuration in B had a subtle constraint that only manifested in this new scenario distribution. A was innocent — the recent change was just coincidence.

**Engineering analogy:** You added a feature two weeks ago. A bug appears. You blame your feature. The actual bug is in a library that's been there for two years — your feature just called a new code path that exposed the existing bug.

### Scenario 3 — The Volatility False Signal

QUICK found element **A** because A produced 22 distinct states during the replay (high volatility). THOROUGH found element **B** because B's one-unit change is smaller.

What happened: A was volatile because it was *responding* to a chaotic environment — its many states were adaptive behavior, not buggy behavior. High volatility from a reactive element looks the same as high volatility from a broken element to the pre-ranking heuristic.

**Engineering analogy:** A circuit breaker trips repeatedly. High "volatility" in the circuit breaker state. The breaker is working correctly — it's tripping in response to overcurrent. The root cause is the overcurrent source, not the breaker.

### Scenario 4 — The Magnitude Gap

QUICK found element **A** and a fix that would change A's value by +3. THOROUGH found the same element **A** but a fix that changes it by +1.

Both are valid fixes. THOROUGH's is smaller — it passes the "minimum fix" criterion. QUICK stopped before it could discover the +1 fix because +3 was the first flip it found.

This is the most benign divergence: same element, different magnitude. Not wrong, not right — just not minimal.

---

## Design Space: The Explainer Options

### Option A: The Side-by-Side Cards — Visual Comparison First

**What happens:** When THOROUGH completes and its result differs from QUICK's, the explorer panel shows two result cards side by side instead of replacing the QUICK card:

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ ⚡ QUICK RESULT               │  │ ◎ THOROUGH RESULT             │
│ ─────────────────────────    │  │ ─────────────────────────     │
│ SCOUT-B                      │  │ RELAY-C                       │
│ beacon interval –2 ticks     │  │ context buffer +1 slot        │
│                              │  │                               │
│ Expected: +9% pass rate      │  │ Expected: +14% pass rate      │
│                              │  │                               │
│ "First viable fix found      │  │ "Minimum fix —                │
│  — stopped early"            │  │  smallest change that works"  │
│                              │  │                               │
│ [Apply →]  [Compare ▾]       │  │ [Apply →]  [Why different? ▾] │
└──────────────────────────────┘  └──────────────────────────────┘
```

The layout uses equal-width columns. The QUICK card has the lightning bolt icon in the header; THOROUGH has the crosshair. Both show expected pass rate improvements — crucially, this reveals that THOROUGH's result is often *better* (higher improvement), not just different.

Clicking "Why different?" on the THOROUGH card opens the divergence explanation inline (see Option B).

**Strengths:**
- The comparison is immediate and visual — the player sees both results at once without reading a word
- Expected pass rate difference motivates engaging with the explanation: "THOROUGH's fix is better AND different — I want to know why"
- The player can apply either fix without committing to a specific understanding of the divergence
- Low-cost first encounter: the player can ignore the comparison entirely and just click Apply on the THOROUGH result

**Weaknesses:**
- Side-by-side cards require horizontal space; narrow screens (mobile, Steam Deck portrait) must stack vertically
- The comparison doesn't explain *why* — it shows that results differ but not the mechanism
- Some players will apply the THOROUGH result without ever reading the explanation, missing the learning moment

**Who this serves:** Players in goal-oriented mode who want the better result and are satisfied with visual comparison. Also works as a non-intrusive first exposure — the "Why different?" button is there when curiosity arrives, not forced.

---

### Option B: The Narrative Explanation — Scenario Classification

**What happens:** When divergence is detected, the system classifies which of the four scenarios caused it (symptom-before-cause, recency bias, volatility false signal, magnitude gap) and generates a plain-language explanation:

```
WHY DIFFERENT RESULTS?
────────────────────────────────────────────────────────────

QUICK found SCOUT-B because the pre-ranking surfaced it first:
  • SCOUT-B was active at tick 52 (pivot tick) ✓
  • SCOUT-B was modified 2 sessions ago (recent change) ✓
  • SCOUT-B produced 18 distinct states (high volatility) ✓

THOROUGH found RELAY-C because it checked all 143 candidates:
  • RELAY-C requires a smaller change (+1 slot vs. –2 ticks)
  • RELAY-C's change improved 32 failing scenarios; SCOUT-B's
    change would have improved only 14

WHY SCOUT-B WASN'T THE ROOT CAUSE:
SCOUT-B was active at tick 52 because it was responding to
RELAY-C's buffer overflow — not causing it. The pre-ranking
found the element closest to the failure event. THOROUGH found
the element furthest upstream with the smallest fix.

This is a SYMPTOM → ROOT CAUSE divergence. The pre-ranking
surfaced a downstream effect. The minimum fix is upstream.

[See RELAY-C at tick 52 in replay →]   [See SCOUT-B's activity at tick 52 →]
```

The scenario type ("SYMPTOM → ROOT CAUSE") is always explicitly named. This gives players a vocabulary for this class of diagnostic mistake that transfers to real engineering.

**Strengths:**
- Named scenario types (Symptom-Before-Cause, Recency Bias, Volatility False Signal, Magnitude Gap) create a learnable taxonomy
- The explanation connects directly to the replay: the "See X at tick Y" links let the player verify the causal chain
- Teaches the pre-ranking's actual limitation — "it found the element closest to the failure event, not furthest upstream" is a precise and memorable framing

**Weaknesses:**
- Scenario classification can be wrong — if the game misclassifies the divergence type, the explanation is actively misleading
- Prose explanation requires reading; goal-oriented players will skip it
- The "root cause" vs. "symptom" distinction requires conceptual setup — players who haven't internalized causality vocabulary will find the explanation abstract

**Mitigation:** Don't classify silently. Show the classification with a confidence indicator: "Likely cause: Symptom-Before-Cause pattern (70% confidence — other factors may apply)." The explicit confidence prevents players from treating the classification as ground truth.

---

### Option C: The Animated Causal Trace — Visual, Non-Textual

**What happens:** When the divergence explanation is opened, a short (8–12 second) animation plays:

1. The replay panel activates and scrubs to the pivot tick (tick 52).
2. The THOROUGH result element (RELAY-C) is highlighted first — a steady violet ring — with a label: "minimum fix"
3. Then a causal arrow traces forward from RELAY-C: a signal that RELAY-C was supposed to send but didn't (buffer overflow)
4. The signal travels forward in slow-motion to SCOUT-B, which is highlighted amber — "where the pre-ranking looked"
5. A dotted line connects RELAY-C → SCOUT-B: "pre-ranking followed the signal forward; minimum fix lives at the source"

The animation ends with both elements highlighted simultaneously: RELAY-C in violet (root, minimum fix), SCOUT-B in amber (downstream, pre-ranking result). A simple caption: "QUICK looked here. THOROUGH looked there. The smaller fix was upstream."

No scenario taxonomy, no prose analysis, no vocabulary. Just the causal chain, visually rendered.

**Strengths:**
- Zero reading required — purely visual and temporal
- The causal chain is directly visible in the actual replay, not in an abstract diagram
- Works for players who are confused by text-heavy explanations
- Makes the divergence visceral: you can *see* the signal not reaching its destination

**Weaknesses:**
- The animation only works cleanly for Symptom-Before-Cause divergences — Recency Bias divergences don't have a clean visual causal chain to trace
- 8–12 seconds of mandatory animation gets annoying for experienced players who understand divergence; must be skippable
- The animation is beautiful but doesn't teach the vocabulary — player learns visually but may not be able to articulate or transfer the lesson

**Best use:** As the first exposure. When QUICK and THOROUGH first diverge in a player's history, play the animation. On subsequent divergences, show the narrative explanation (Option B) with a "Show animation again" affordance.

---

### Option D: The Heuristic Autopsy — Deep Dive Breakdown

**What happens:** An expanded view, unlocked after the player has encountered divergence 3+ times, that shows exactly where the pre-ranking made its bet and where that bet was wrong:

```
QUICK VS. THOROUGH — HEURISTIC AUTOPSY
─────────────────────────────────────────────────────────────────

PRE-RANKING INPUT SIGNALS (what QUICK used to rank candidates):

Element        Pivot-Active  Recency  Volatility  Rank Score
──────────────────────────────────────────────────────────────
SCOUT-B        ████ 0.91    ███ 0.75  ████ 0.82   0.87  ← QUICK stopped here
RELAY-C        ███  0.68    █   0.18  ██   0.45   0.46
STRIKER-A       █   0.22    ██  0.31  ███  0.54   0.34

POST-SIMULATION RESULTS (what THOROUGH actually found):

Element        Fix Magnitude  Scenarios Fixed  Rank Score
──────────────────────────────────────────────────────────
RELAY-C        +1 slot        32 scenarios     0.91  ← THOROUGH minimum
SCOUT-B        –2 ticks       14 scenarios     0.47
STRIKER-A      N/A            —                —

DIVERGENCE TYPE: Symptom-Before-Cause (confidence: 0.78)
  Pre-ranking trusted: high pivot-activity + high recency
  Post-simulation revealed: RELAY-C upstream of SCOUT-B's activity

SIGNAL ACCURACY AUDIT (your history):
  Pivot-activity signal:  correctly predicted minimum fix 68% of sessions
  Recency signal:         correctly predicted minimum fix 54% of sessions
  Volatility signal:      correctly predicted minimum fix 44% of sessions
  All three aligned:      correctly predicted minimum fix 81% of sessions
```

The Heuristic Autopsy is the comprehensive diagnostic debrief for the diagnostic tool — a meta-layer that lets players understand the pre-ranking's accuracy profile over time.

**Strengths:**
- Reveals per-signal accuracy from the player's history — "the recency signal is right 54% of the time for your configs" is actionable
- The table format allows direct comparison between what the heuristic predicted and what exhaustive search found
- Teaches the concept of *signal quality* directly: "which of my diagnostic priors are reliable?" is a real engineering question

**Weaknesses:**
- This is advanced content — requires the player to understand pre-ranking signals, simulation results, and signal accuracy before any of the table is legible
- 30+ sessions of history needed for reliable per-signal accuracy statistics; early-game players see very limited data
- Risk of overwhelming casual players who just want to know which fix to apply

**Unlock gate:** Available only after the player has encountered divergence 5+ times. In the drawer, accessible via "Advanced view →" — progressive disclosure keeps it out of the way for players who don't need it.

---

### Option E: The Disambiguation Prompt — When Both Are Valid

**What happens:** When QUICK and THOROUGH diverge but both fixes would improve pass rate (which is common), the game doesn't just present THOROUGH as "the right answer." Instead it surfaces a disambiguation prompt that acknowledges both:

```
TWO VALID FIXES

Both the QUICK result and THOROUGH result would improve your pass rate.
They fix different problems.

⚡ QUICK RESULT: SCOUT-B — beacon interval –2 ticks
   Addresses: Scenario cluster where scouts reach target late
   Pass rate impact: +9% (from 67% to 76%)
   Fix type: Symptom correction — adjusts for downstream effect

◎ THOROUGH RESULT: RELAY-C — context buffer +1 slot
   Addresses: Relay buffer overflow causing signal loss
   Pass rate impact: +14% (from 67% to 81%)
   Fix type: Root cause — upstream architectural fix

WHICH SHOULD YOU APPLY?
• Apply QUICK result if: you want to address the scout timing cluster specifically
  and plan to investigate relay architecture separately.
• Apply THOROUGH result if: you want the smaller structural fix that resolves
  more failure scenarios with less configuration change.

[Apply QUICK result]   [Apply THOROUGH result]   [Apply both in sequence →]
```

The key addition is the "Apply both in sequence" option — which opens a staged fork-and-deploy workflow where THOROUGH's minimum fix is applied first, then QUICK's fix is applied on top. The game simulates the combined result before committing.

**Strengths:**
- Teaches that "which fix is better?" depends on your diagnostic goal — root cause vs. symptom management
- The "both valid" framing respects the player's autonomy without hiding the fact that THOROUGH found something smaller
- The combined-apply option is a practical power tool for players who want comprehensive repair

**Weaknesses:**
- The disambiguation prompt adds a decision step the player might not want — they ran THOROUGH to get the definitive answer, not to be given a choice
- "Fix type: Symptom correction" vs. "Fix type: Root cause" framing may feel judgmental — players may feel the game is implying their QUICK result was "wrong"
- The combined-apply workflow is a new complexity surface that needs its own UI and explanation

**Recommended framing:** Make the disambiguation prompt appear only when pass rate improvement from QUICK and THOROUGH are within 5% of each other — genuinely close calls where choosing matters. When THOROUGH is clearly better (+14% vs. +9%), show the comparison with a gentle default toward THOROUGH, without manufacturing a false equivalence.

---

## Recommended Design: Tiered Explainer

Three tiers, revealed based on player history and engagement:

**Tier 1 — First divergence (ever):** Play the animated causal trace (Option C). 10-second animation, skippable. Shows the causal chain visually, no vocabulary required. End of animation: "QUICK found the downstream effect. THOROUGH found the upstream cause. See details ▾"

**Tier 2 — Subsequent divergences (2nd–10th):** Show the side-by-side cards (Option A) with the narrative explanation (Option B) available via "Why different?" button. The narrative explanation classifies the scenario type. The player has vocabulary from previous encounters with the debrief system.

**Tier 3 — Advanced players (divergence 11+, or explicit unlock):** The Heuristic Autopsy (Option D) is accessible via "Advanced view →" inside the narrative explanation. The disambiguation prompt (Option E) appears for genuinely close-call divergences. Per-signal accuracy stats are visible in the transparency drawer.

---

## Player Journeys

### Journey: Priya, 27, UX designer, Week 2, Mission 5

**Context:** Priya is 8 hours into the game. She's discovered the Fix Explorer and has used QUICK mode three times. She just unlocked THOROUGH mode (per the progressive discovery mechanic from 4.40) after her second regression-after-applying-quick-fix. Tonight is her first time running THOROUGH and getting a different result.

**Minute 0:00 — The First THOROUGH Run**

The debrief panel. Mission 5 — "Parallel Flank." Priya is at 61% pass rate. She ran QUICK last session: "SCOUT-B — beacon interval –2 ticks." She applied it. 63%. She applied it again. 62%. She's confused.

Tonight the amber banner appeared: "Try thorough scan when the quick scan result keeps returning the same fix." She switches to THOROUGH. Clicks Run Analysis.

She watches the ghost cards appear. Dim, branching. She's counting them — there's a lot. The animation is satisfying, somehow. It looks like the game is working hard for her.

**Minute 0:28 — The Different Result**

THOROUGH completes. But something is different — the result panel doesn't just show one card. It shows *two*, side by side.

Left card: a slightly dimmed version of the QUICK result she knows. "SCOUT-B — beacon interval –2 ticks." A lightning bolt icon. "Expected: +8%."

Right card: brighter, with the crosshair icon. "RELAY-C — context buffer +1 slot." "Expected: +14%."

Priya stares. She didn't expect this. She thought THOROUGH would either confirm what QUICK found or tell her something completely different. She didn't expect them to both be present at the same time.

She hovers over the right card. "Why different?" A button. She clicks it.

**Minute 0:32 — The Animation**

The replay panel activates automatically. It scrubs to tick 52. The battlefield is visible, small agents moving.

A violet ring appears around RELAY-C. It steadies. A small label: "minimum fix lives here."

Then an amber-tinted signal pulse traces forward from RELAY-C — a dotted arc toward SCOUT-B. SCOUT-B lights up amber as the signal arrives. Label: "pre-ranking found this."

A dotted line between them, with an arrow pointing back from SCOUT-B to RELAY-C. Small caption: "QUICK followed the signal. THOROUGH found where the signal came from."

The animation holds for 3 seconds — both elements highlighted, the arrow between them — then fades.

A new caption settles:
> "SCOUT-B was reacting to RELAY-C's failure. RELAY-C ran out of buffer space and couldn't pass its signal. SCOUT-B went into backup mode. QUICK found the symptom. THOROUGH found the source."

**Minute 1:00 — The Application**

Priya applies the THOROUGH result. She's not fully sure she understood the animation, but she caught the key idea: "QUICK found the symptom, THOROUGH found the source."

Pass rate: 79%.

She tries the QUICK result anyway (she forks the config to test). Pass rate: 69%.

The THOROUGH result was definitively better. The source fixed more than the symptom.

**Minute 2:30 — The Memory**

She doesn't think about "symptom vs. root cause" formally. But a week later, she's talking to a colleague about a bug in their design tool and she says, almost without thinking: "I wonder if that's a symptom. What happened before it?"

Her colleague says: "That's a surprisingly systematic way to approach this."

Priya says: "Oh, I picked it up from a video game."

**What Priya wants to do next:** Run THOROUGH again on the next mission, earlier in the session — not waiting for QUICK to fail first.

**UI Annotations:**
- Side-by-side cards: appear only when QUICK and THOROUGH results diverge; QUICK card is at 70% opacity (dimmed but readable); THOROUGH card is at full opacity with a subtle violet glow on the border
- Animation replay: plays automatically when "Why different?" is clicked; skippable via spacebar or by clicking anywhere on the replay panel; total runtime 10 seconds
- Causal arrow animation: amber dotted arc, 600ms to trace from RELAY-C to SCOUT-B; the arc uses the same visual language as hook connections in the workbench — connecting the explanation to a familiar visual vocabulary
- Final caption: appears after the animation, 14px type, centered below the replay panel, 3-second display then fades to a "See written explanation ▾" affordance

---

### Journey: Dae-Jung, 38, senior software architect, Month 1, Mission 10 (Gauntlet prep)

**Context:** Dae-Jung is a seasoned engineer who plays Robot Uprising seriously. He has 40+ hours in the game, has read everything in the debrief panels, and understands the pre-ranking heuristic conceptually. He's preparing for his first Gauntlet match and has been deliberately running both QUICK and THOROUGH on every diagnostic session to compare them. He's noticed a pattern: QUICK and THOROUGH agree 70–75% of the time. Tonight they disagree, and he's interested in why.

**Minute 0:00 — Deliberate Comparison**

Dae-Jung opens the debrief with a clear protocol:
1. Run QUICK, read the transparency drawer, form a hypothesis about whether it's right
2. Run THOROUGH, compare

QUICK result: "HOOK-3 (relay hook) — trigger threshold +3 ticks." He opens the pre-ranking drawer. Pivot-activity: 0.88. Recency: 0.72 (he changed HOOK-3's threshold last week during Mission 8). Volatility: 0.67.

He looks at this. High recency — he changed it recently. But he remembers *why* he changed it: he was tuning it for Mission 8's scenario distribution, which was different from Mission 10's. He may have over-tuned. And volatility: 0.67 is medium-high, but he expects high volatility from a hook — hooks fire based on events, so their state changes naturally.

His hypothesis: "QUICK is probably surfacing HOOK-3 because of recency bias. The recency signal is high because I changed it, but the change was appropriate for Mission 8, not necessarily wrong. The minimum fix might be elsewhere."

**Minute 0:34 — THOROUGH Confirms His Suspicion**

THOROUGH result: "SCOUT-A — attention filter, remove 'LOW-PRIORITY' tag. Expected +17%."

Different result. And a different element entirely — SCOUT-A's attention filter has been unchanged since he built the config. No recency signal. But apparently it's a structural constraint.

The divergence explainer appears. He's seen the animation before — he skips it and goes directly to the narrative explanation.

```
WHY DIFFERENT RESULTS?

QUICK found HOOK-3 because of pre-ranking signals:
  • Active at pivot tick 52 (score: 0.88) ✓
  • Modified recently — 1 session ago (score: 0.72) ✓
  • Medium-high volatility: 19 distinct states (score: 0.67) ✓
  Combined rank score: 0.78 — highest in candidate set

THOROUGH found SCOUT-A because of exhaustive search:
  • SCOUT-A's change (+remove LOW-PRIORITY tag) requires
    modifying 1 field vs. HOOK-3's +3 ticks (same field, larger delta)
  • SCOUT-A's change improves 27 failing scenarios;
    HOOK-3's change would improve 11

DIVERGENCE TYPE: Recency Bias (confidence: 0.74)
  The pre-ranking heavily weighted HOOK-3's recent modification.
  Post-simulation showed the modification was not the root cause.
  SCOUT-A has been unchanged — a long-standing structural constraint.
```

Dae-Jung nods. He was right — recency bias. The system agreed with his pre-run hypothesis.

**Minute 1:30 — The Heuristic Accuracy Screen**

He opens the Advanced View. He's earned it (15+ divergence encounters). The Heuristic Autopsy shows:

```
YOUR SIGNAL ACCURACY (37 sessions):
  Pivot-activity signal:  matches minimum fix in 71% of sessions
  Recency signal:         matches minimum fix in 52% of sessions
  Volatility signal:      matches minimum fix in 48% of sessions
```

Recency is his weakest signal — 52%. He's been changing things a lot between sessions as he builds out his config. His config is "young" — recent changes are everywhere, so recency isn't a reliable discriminator for him. It's more useful for stable configs where a recent change truly stands out.

He thinks about this. The recency signal's reliability depends on how often you change things. A player who makes major config changes every session — like him — has high recency noise. A player who makes small surgical changes will have high recency signal quality.

**Minute 2:30 — The Meta-Insight He'll Share**

He opens a forum post draft. Title: "Recency signal reliability depends on your build velocity."

The content: recency works best when you have a stable config and make a specific change for a specific reason. If you're actively rebuilding, recency becomes noise — everything has high recency, so the signal has no discriminating power. He recommends: "when you're in active rebuild mode, lower the recency weight in your pre-ranking configuration (unlock at Mission 12). When you're in optimization mode, raise it."

This is the real lesson — not "the pre-ranking is wrong" but "the pre-ranking's signals have conditions under which they're reliable, and understanding those conditions makes you a better diagnostician."

**Minute 4:00 — Resolution**

He applies the THOROUGH result. Pass rate goes to 86%. He applies a follow-on QUICK result. 89%. He's satisfied.

He finishes writing the forum post. It gets 83 upvotes. A developer from another programming game comments: "This is a surprisingly precise way to think about debugging heuristics. Did you come up with this yourself?"

Dae-Jung: "No, a game taught me."

**UI Annotations:**
- Skip affordance for animation: the animation shows a "Skip animation ▸" button in the lower-right corner from frame 1; players who've seen it before can skip to the narrative explanation immediately
- Narrative explanation layout: prose text in a 600px-wide panel below the side-by-side cards; each fact is on its own line with a small ✓ or context icon; the "DIVERGENCE TYPE" classification is in a slightly larger, bolder typeface with the confidence indicator in smaller grey type
- Heuristic Autopsy: accessible via "Advanced view →" text link at the bottom of the narrative explanation; the link only appears when the player has 10+ divergence encounters; a small dot indicates this is new for players who haven't seen it before
- Signal accuracy stats: a three-row table with a small fill bar for each percentage; below 50% is displayed in amber, 50–70% in white, above 70% in teal — a quick visual read of which signals are reliable

---

### Journey: Kenji, 15, high school student, Week 4, Mission 7

**Context:** Kenji plays 30-45 minutes after school. He's never read any of the help text. He's been using the Fix Explorer as a black box — run it, get a result, apply it, see if it helps. He doesn't know what QUICK or THOROUGH means. He just runs "analysis" and sometimes it takes longer. Tonight is his first time where the analysis takes 28 seconds and shows him two cards instead of one.

**Minute 0:00 — The Confusing Two-Card Layout**

Kenji runs analysis. It takes forever (28 seconds — he nearly switched tabs). Then the result panel shows two cards. He's confused. The game usually shows one card.

He reads both cards. Left: "SCOUT-B — something about interval." Right: "RELAY-C — context buffer plus one slot."

He hovers over the right card because it says "+14%" and the left says "+8%". More is better, right?

He clicks Apply on the right card.

Pass rate: 82%. Better than before (67%).

He didn't read the explanation. He didn't understand why there were two cards. He just picked the higher number.

This is fine. The right result was applied. The learning will come later.

**Minute 5:00 — The Curiosity Arrives Later**

In a later session (four sessions later), Kenji runs analysis again. Two cards again. This time he's used to seeing two cards — he recognizes the pattern. He applies the THOROUGH result (+11%) again.

But this time he notices the "Why different?" button. He's less rushed today. He clicks it.

The animation plays. He watches RELAY-C light up violet, the signal trace forward to SCOUT-B lighting up amber. The caption: "QUICK followed the signal. THOROUGH found where the signal came from."

He watches it twice.

He doesn't know the word "symptom." He doesn't know the phrase "root cause." But he has now seen, twice, that the game found something earlier in a chain that fixed more problems. And he's watching the causal chain trace backward from the visible failure to the upstream origin.

**Minute 6:00 — The Intuition That Arrives**

Two weeks later, Kenji is playing a different game — a tower defense — and he's debugging why his towers aren't firing on the right enemies. He's about to adjust the tower's targeting settings. Then he stops.

He thinks: wait, is this the symptom or the source? He follows the logic backward. He finds that an economy building is not generating enough energy to power the towers at full rate. The targeting seemed like the problem but the energy was the source.

He fixes the energy building. The towers work perfectly.

He didn't get this from Robot Uprising explicitly. But the pattern — follow the signal back to its origin — embedded itself through repeated visual exposure to the animated causal trace.

**What Kenji wants to do next:** He doesn't have a goal about the explainer — he just continues playing. The learning happened without him knowing it was happening.

**UI Annotations:**
- For young/casual players, the animation is never auto-skipped and plays at full speed — it's designed to be legible without any context
- The "Why different?" button copy uses "why different" not "heuristic divergence" — plain language for first encounters
- The caption beneath the animation is rendered in a slightly larger typeface (16px vs. the standard 13px) for the first 3 divergence encounters — legibility optimization for first-exposure learning moments
- No vocabulary terms (symptom, root cause, heuristic) appear in the first-tier animation explainer — those terms appear only in the second-tier narrative explanation, which Kenji hasn't opened

---

## Strengths

**Names the gap between two valid strategies.** The QUICK/THOROUGH divergence exists in every session of real debugging — every time an engineer applies a fast heuristic-based fix vs. a thorough root-cause analysis. Naming this divergence as an event, giving it a visual design and an explanation, makes a common but invisible engineering pattern legible for the first time.

**Teaches the limitation of heuristics without undermining confidence in them.** The pre-ranking heuristic is right 70% of the time. The explainer doesn't say "the pre-ranking was wrong." It says "the pre-ranking made a reasonable bet with the information available. Here's why the bet didn't land this time." This is the correct epistemics for any heuristic — they're probabilistic, not certain.

**Scenario taxonomy creates transferable vocabulary.** "Symptom-Before-Cause," "Recency Bias," "Volatility False Signal," "Magnitude Gap" — these named patterns can be referenced in the community ("that was a classic recency bias divergence"), written about in guides, and most importantly, recognized in real-world engineering contexts where they have no names at all.

**Builds meta-diagnostic skill.** The Heuristic Autopsy's per-signal accuracy stats give advanced players a mirror: "my recency signal has only 52% accuracy because I change my config constantly." This is a real insight about the player's own diagnostic workflow that they can act on — by changing how they build, or by adjusting the pre-ranking weights.

**The TikTok clip:** THOROUGH result card appears. Two cards visible. Player clicks "Why different?" The replay panel activates — no text yet, just visual. RELAY-C glows violet. The causal arc traces forward to SCOUT-B. Player's face: "oh." They apply the THOROUGH result. +17%. Player's face: wider smile. Cut to: applying the QUICK result on the same config: +9%. Cut back to the THOROUGH result card, still glowing. Caption over-rendered on the video: "QUICK found the symptom. THOROUGH found the source." 15 seconds. Every viewer who's ever applied a patch instead of a fix feels something.

---

## Weaknesses

**Scenario classification is a hard problem.** Determining which of the four divergence scenarios applies in a given match requires causal graph analysis — not just correlation. A naive implementation that misclassifies frequently will teach wrong lessons. The confidence indicator mitigates but doesn't eliminate this.

**The animation becomes annoying.** A beautiful 10-second animated causal trace that teaches the concept perfectly the first time is an annoying 10-second delay the thirtieth time. The skip affordance is necessary and must be discoverable from the first frame, not discoverable after the player has waited through the animation 15 times.

**Players who always use THOROUGH never see the divergence.** If a player discovers THOROUGH early and defaults to it, they'll rarely have a QUICK result to compare against. The divergence explainer only activates when the player has run both modes in the same session. This is fine for the learning arc, but means some players who would benefit from the explainer never encounter it.

**The "both valid" framing risks ambiguity.** When QUICK and THOROUGH find fixes that both work, presenting them as equivalents can feel like the game is hedging. Players who ran THOROUGH for a definitive answer don't want a choice — they want the result. The disambiguation prompt (Option E) must default clearly toward THOROUGH while still acknowledging QUICK's validity.

---

## Interaction Effects

**With 4.40 (QUICK vs. THOROUGH toggle):**
The toggle is what creates the divergence event. Without the toggle, there's no divergence to explain. The explainer is the consequence of surfacing the toggle to the player — every player who discovers the toggle will eventually encounter divergence. The explainer must be designed alongside the toggle, not as an afterthought.

**With 4.58 (Pre-ranking transparency panel):**
The transparency panel explains why a specific candidate was ranked #1. The divergence explainer explains why that #1 candidate turned out to not be the minimum fix. They're complementary: the panel teaches the pre-ranking's reasoning, the explainer teaches the pre-ranking's limits. Together they give a complete picture of what QUICK mode is doing and where it can fail.

**With 4.60 (Search budget as resource):**
The budget creates a strong incentive to use the explainer: if the player spent a THOROUGH token and got a different result, they want to know if spending was worth it. The explainer becomes the post-spend review — "did THOROUGH find something meaningfully different, and was the token well-spent?" The explainer closes the feedback loop on budget decisions.

**With 4.62 (Agree-to-disagree result):**
When QUICK and THOROUGH find different fixes that are both valid and genuinely close in pass rate improvement, aspect 4.62 handles the resolution: "both valid, player chooses." Aspect 4.61 handles the explanation: "why are there two valid fixes?" These are sequential — 4.61 explains the divergence, 4.62 handles the choice when neither fix is clearly dominant.

**With 4.38 (Counterfactual history):**
Every divergence event is a version history moment: the player applied either the QUICK or THOROUGH result, and the history records which one was chosen. Over time, the counterfactual history shows a pattern: when the player chose QUICK over THOROUGH in divergence events, what happened next? Did pass rate improve more or less than when they chose THOROUGH? This cross-session analysis is the long-arc complement to the per-session divergence explainer.

**With 4.49 (Cross-mission pattern detection):**
If the same divergence scenario type (e.g., Recency Bias) appears in multiple missions, the game can surface a career-level diagnostic: "You've had 7 sessions where the pre-ranking was misled by recent changes. Your config tends to have high recency noise — consider a more conservative change discipline." This career-level insight is only possible because the divergence type was classified and logged.

**With 8.08 (Real-language vocabulary claim):**
The four divergence scenario names are vocabulary investments. "Symptom-Before-Cause" is not a game-specific term — it's a real pattern in debugging, security, and systems engineering. "Recency Bias" is a real cognitive bias with well-studied literature. "Volatility False Signal" maps to "churn as a noise source" in software quality metrics. The names must be chosen to maximize real-world resonance while being legible in-game.

---

## Comparable Games and Media

**Git bisect — the canonical "find the exact commit" tool:** Git bisect binary-searches through commit history to find the minimum commit that introduced a regression. The "minimum fix" is exactly what THOROUGH mode finds. Players who later use git bisect will recognize the search pattern — exhaustive candidate evaluation, stopping at the minimum change. The divergence explainer prepares the player for git bisect: "the first commit you try might not be the one that introduced the bug."

**Debugging a distributed system — "correlation ≠ causation" in practice:** In distributed systems debugging, the service that throws the error is often not the service that has the bug. Log aggregation surfaces errors from downstream services; the upstream cause is silent. The Symptom-Before-Cause divergence scenario is this exact pattern in game form. Engineers who have debugged distributed systems will recognize it immediately. Players who learn it here will have a mental model for distributed debugging before they ever encounter a real distributed system.

**Chess analysis — Stockfish showing "refutation lines":** In chess, after a human makes a move, Stockfish often shows the "refutation" — the line the human thought was working, and the deeper line that defeats it. The QUICK result is the "human's first instinct." The THOROUGH result is Stockfish's refutation: yes, your move works locally, but this is the more precise line. The game doesn't say you were wrong — it says the board admitted a more precise line.

**A/B testing — "first significant result" vs. "stopping at minimum detectable effect":** In product experimentation, stopping an A/B test at the first statistically significant result (QUICK) vs. waiting for the minimum detectable effect to be clearly isolated (THOROUGH). The "peeking problem" in A/B testing is exactly the Recency Bias divergence scenario: the test is stopped early because the most-recently-touched metric moved, when the actual causal mechanism is something more upstream.

**Sherlock Holmes vs. Watson problem-solving:** Holmes doesn't fix the first thing that could be the cause. He traces backward from observable effects to upstream causes. Watson (and most of us) fix the first thing that explains the immediate observation. The divergence explainer teaches the Holmes vs. Watson distinction: "the quick fix fixed the symptom; the minimum fix fixed what Holmes would have found."

---

## Sensory Description

**The divergence event — two cards appearing:**

When THOROUGH completes and the result differs from QUICK, the panel doesn't just swap cards. The QUICK result card slides left to a smaller position (70% width, 70% opacity). A new THOROUGH card slides in from the right, at full size and full opacity. The panel briefly widens by 20% to accommodate both cards — a smooth CSS expansion over 300ms.

The QUICK card has a thin amber border in this state — not alarming, just marked. The THOROUGH card has a thin violet border. The visual language is consistent with the mode buttons: amber = quick/lightning, violet = thorough/crosshair.

Sound: as the THOROUGH card slides in, a two-note resolution: the lower note for the QUICK result (still present, still valid), a higher note for the THOROUGH result (new information, higher clarity). The two notes are a minor third apart — harmonious but with tension.

**The "Why different?" button:**

A teal text link below the THOROUGH card. Not a button — a link. Subtle. This is not a primary action; it's an invitation to go deeper. On hover, a brief tooltip: "See why the pre-ranking found a different element than the exhaustive search."

The teal color is consistent with all explanatory text in the system — tooltips, links to replay timestamps, help text. Teal means "this explains something."

**The animated causal trace:**

The replay panel activates with a soft ambient sound — a low hum, barely audible, like servers powering up. The battlefield renders at 40% saturation — muted, preparatory. The playhead scrubs to tick 52 with a fast but smooth motion, 300ms.

RELAY-C highlights violet: a ring appears from the element's center, expanding to 150% of its radius over 400ms, then contracting to a stable 120%. The ring is not harsh — it's translucent, like stained glass illuminated from behind.

The causal arc trace: a dotted amber line that animates from RELAY-C toward SCOUT-B, tip-to-tip, over 600ms. The dots are spaced 4px apart. As the line traces, a soft digital "trace" sound — a series of 12 ascending clicks, one per dot cluster, over the 600ms duration.

SCOUT-B highlights amber as the arc arrives: the same ring animation as RELAY-C, but in amber, 300ms.

A thin dashed return arrow from SCOUT-B back to RELAY-C: dotted, lighter weight, with a small arrowhead. This is the "pre-ranking followed this path" marker — showing the forward direction of the pre-ranking's attention and the backward direction of the actual causation.

The two elements, both highlighted, hold for 3 seconds. Then the caption animates in: each word fades in left-to-right, 40ms per word, in 16px type centered below the battlefield. "QUICK followed the signal. THOROUGH found where the signal came from." Soft, unhurried.

**Closing the explainer:**

The QUICK card gently dims further (to 50% opacity) if the player applies the THOROUGH result. It remains visible but recedes — "the path not taken," archived but not deleted. The THOROUGH card stays at full opacity, now marked "Applied" with a small checkmark.

When the player comes back to the debrief panel in a future session, the QUICK card is gone — archived in counterfactual history (aspect 4.38) but not displayed by default. The THOROUGH card remains. The divergence was resolved.

---

## Discovered New Aspects

1. **4.78 — Cross-session divergence frequency as architecture health metric:** Tracking what percentage of the player's Fix Explorer sessions produce QUICK/THOROUGH divergence over time; a player whose divergence rate drops from 35% to 15% as their architecture matures has reduced pre-ranking mismatches — their configs are generating cleaner causal chains where active-at-pivot and minimum-fix reliably align; a config quality metric orthogonal to pass rate.

2. **4.79 — Divergence replay export as pedagogical artifact:** Exporting a divergence event — the QUICK result, THOROUGH result, and the animated causal trace — as a shareable clip or static screenshot suitable for community discussion; "this is why QUICK was wrong this time" as a standardized community artifact; extends the necropsy culture (7.10) to the explainer layer.

3. **4.80 — Counterfactual: "What if I had applied QUICK?":** In the debrief for a session where the player applied THOROUGH, a one-click simulation asking "if I had applied the QUICK result instead, what would my pass rate be?"; shows the concrete pass rate difference between the two decisions; the most direct possible feedback on "was running THOROUGH worth it?"; interaction with 4.60 search budget and the THOROUGH token spend.

4. **4.81 — The "consistent divergence" flag:** When a player has run QUICK then THOROUGH on the same config version 3+ times and gotten divergence each time (same or different scenario), the game surfaces "your config consistently produces pre-ranking mismatches — the pre-ranking's heuristic signals may not be well-calibrated for your architecture style"; prompts exploring pre-ranking weight configuration (4.63) or the heuristic autopsy (4.61 Advanced View).

5. **4.82 — Divergence type distribution as career stat:** Displaying the breakdown of which scenario types caused divergence in the player's history — "40% Symptom-Before-Cause, 30% Recency Bias, 20% Volatility False Signal, 10% Magnitude Gap"; a distribution that reflects the player's architectural habits; players who rebuilt aggressively (high recency noise) vs. players with stable configs (more Symptom-Before-Cause); career stat available in the profile view alongside EDT trajectory.

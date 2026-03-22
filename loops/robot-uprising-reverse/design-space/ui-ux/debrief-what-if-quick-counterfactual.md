# "What If I Had Applied QUICK?" — The Counterfactual Debrief Simulation

**Aspect:** 4.80 — Counterfactual "what if I had applied QUICK?": In the debrief for a session where the player applied THOROUGH, a one-click simulation showing what pass rate would have been if the QUICK result had been applied instead; the most direct feedback on "was running THOROUGH worth it?"; interaction with 4.60 search budget and the THOROUGH token spend decision.

**Parent:** 4.60 — Search budget as a player resource
**Siblings:** 4.75 — Token debt recovery; 4.61 — QUICK vs. THOROUGH explainer; 4.76 — Voluntary budget cap
**Related:** 4.38 — Counterfactual history; 4.20 — Counterfactual simulation; 4.36 — Multi-scenario fix explorer; 4.74 — Diagnostic efficiency metric; 8.09 — Diagnostic layer as teaching mechanic

---

## The Core Problem

The search budget mechanic (4.60) makes THOROUGH mode expensive. The token debt recovery mechanic (4.75) softens the sting of confirmation spends. The QUICK vs. THOROUGH explainer (4.61) teaches the player *why* the two modes diverge. But none of these mechanics answer the question the player actually asks after every THOROUGH spend:

**"Was it worth it?"**

Not in an abstract pedagogical sense. Not "did I learn something about search algorithms." The player wants a number. They spent a token. They got a fix. They applied it. They achieved a pass rate. They want to know: *if I had just applied the QUICK result and saved the token, what would my pass rate be right now?*

This is not a hypothetical desire. It emerges from the fundamental asymmetry of the two modes. QUICK returns in 4 seconds. THOROUGH takes 28. QUICK is free. THOROUGH costs a token. The player who chose THOROUGH incurred real costs — time and tokens. They want to know if those costs produced a measurably better outcome, or if QUICK would have gotten them to the same place.

When THOROUGH confirms QUICK (same element, same fix), the answer is obvious: the outcome would be identical. The token debt refund (4.75) addresses this case. But when THOROUGH diverges — when it finds a different element, a different fix, a different magnitude — the question becomes genuinely unanswerable without simulation. THOROUGH found RELAY-C buffer +1. QUICK had suggested SCOUT-A beacon -2. The player applied RELAY-C. Pass rate: 84%. What would have happened with SCOUT-A? 84%? 79%? 88%? The player doesn't know, and not knowing erodes their confidence in the THOROUGH decision over time.

This erosion is subtle but real. Without counterfactual feedback, the player develops superstitions. "THOROUGH always finds a more conservative fix." "QUICK's fix would have been fine." "I wasted that token." Or conversely: "THOROUGH always saves me — I should never trust QUICK." Both superstitions are harmful. The first leads to under-spending tokens (the player stops using THOROUGH in cases where it would matter). The second leads to over-spending (the player runs THOROUGH on every fix, burning through budget, never developing QUICK intuition).

The counterfactual simulation resolves this by making the comparison concrete. One click. One number. The pass rate that QUICK's fix would have produced, simulated against the same scenario distribution, displayed next to the pass rate that THOROUGH's fix actually produced. The delta between those two numbers is the **value of the token**, measured in pass-rate points.

This is the most direct feedback loop the game can provide on the search budget decision.

---

## The Design

### Where It Lives: The Debrief Summary Bar

After the player applies a THOROUGH-derived fix and runs the updated configuration, the debrief screen shows the results. In the session summary bar — the horizontal strip at the top of the debrief that shows the match outcome, pass rate, and key stats — a new element appears when the applied fix came from a THOROUGH run that diverged from QUICK:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SESSION 14 — MISSION 9: "SIGNAL MAZE"                                  │
│ Pass Rate: 84% (+9%)  ·  Config v3.3  ·  1 THOROUGH token spent        │
│                                                                        │
│  ┌──────────────────────────────────┐                                  │
│  │  ◈ WHAT IF QUICK?               │                                  │
│  │  You applied THOROUGH's fix.    │                                  │
│  │  See what QUICK would have done.│                                  │
│  │           [ Simulate ]          │                                  │
│  └──────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

The **WHAT IF QUICK?** card is a muted rectangle — thin border, no fill, secondary to the main debrief content. It does not demand attention. It invites it. The word "Simulate" sits inside a pill-shaped button, outlined, not filled. The card only appears when all three conditions are met:

1. The player ran THOROUGH during this session.
2. THOROUGH diverged from QUICK (different element, different parameter, or different magnitude beyond 1 unit).
3. The player applied THOROUGH's result (not QUICK's).

If THOROUGH confirmed QUICK, the card does not appear — the token debt refund (4.75) handles that case. If the player applied QUICK's result despite running THOROUGH, the card does not appear — the player already chose QUICK, so the counterfactual is "what if THOROUGH?" which is a different question with different design implications (and belongs to a future aspect).

### The Simulation Itself

When the player clicks **Simulate**, the game runs QUICK's suggested fix against the same scenario distribution that the current match used. This is not a new search — it replays the existing scenarios with a different config applied. The simulation takes 3-6 seconds (substantially faster than a full match replay, since it only needs to evaluate pass/fail per scenario, not animate the full grid).

During the simulation, a small loading indicator appears inside the card — a horizontal progress bar, thin, filling left to right, the same amber tone used for the token debt refund animations. No spinner. No modal. The debrief remains fully interactive around the card. The player can read other debrief panels while the simulation runs.

### The Result: The Delta Card

When the simulation completes, the card expands vertically to reveal the comparison:

```
┌──────────────────────────────────────────────────────────────────────┐
│ ◈ WHAT IF QUICK?                                                     │
│                                                                      │
│  THOROUGH applied:  RELAY-C buffer +1          → 84% pass rate       │
│  QUICK would have:  SCOUT-A beacon interval –2 → 79% pass rate      │
│                                                                      │
│  ┌───────────────────────────────────────────┐                       │
│  │  THOROUGH ADVANTAGE: +5 points            │                       │
│  │  Token value: 5 pass-rate points          │                       │
│  │  ■■■■■□□□□□□□□□□□□□□□  5 / 20             │                       │
│  └───────────────────────────────────────────┘                       │
│                                                                      │
│  3 scenarios flipped by THOROUGH's fix that QUICK's fix missed:      │
│   Scenario 41 (adversarial · dense spawn) — QUICK: ✗  THOROUGH: ✓   │
│   Scenario 67 (standard · open field)     — QUICK: ✗  THOROUGH: ✓   │
│   Scenario 88 (adversarial · choke point) — QUICK: ✗  THOROUGH: ✓   │
│                                                                      │
│  2 scenarios where QUICK would have done better:                     │
│   Scenario 23 (standard · corridor)       — QUICK: ✓  THOROUGH: ✗   │
│   Scenario 55 (standard · open field)     — QUICK: ✓  THOROUGH: ✗   │
│                                                                      │
│  Token cost: 1.00  ·  Net value: +5 points per token                │
│  [ View scenario details ]                  [ Dismiss ]              │
└──────────────────────────────────────────────────────────────────────┘
```

### The Delta Bar: Token Value Visualization

The horizontal bar labeled "5 / 20" inside the result card is the **Token Value Bar** (named: the **Worth Meter**). It visualizes the delta between THOROUGH's outcome and QUICK's outcome on a fixed scale of -20 to +20 pass-rate points. The bar is centered at zero:

- **Positive delta (THOROUGH was better):** Bar fills rightward from center in amber. Text reads "THOROUGH ADVANTAGE: +N points."
- **Zero delta (identical outcome):** Bar is empty. Text reads "NO DIFFERENCE — same pass rate." This case is rare when the card appears (it requires divergence in fix but convergence in outcome).
- **Negative delta (QUICK would have been better):** Bar fills leftward from center in a cool blue-grey. Text reads "QUICK WOULD HAVE WON: +N points."

The negative case is crucial. The game must be honest. If QUICK's fix would have produced a better outcome, the simulation says so. This honesty is what gives the positive cases their credibility. A player who has seen the Worth Meter show negative deltas knows that the positive deltas are real, not manufactured. Trust in the feedback loop depends on the game being willing to say "you spent a token and got a worse result than the free option."

### The Scenario Breakdown

Below the Worth Meter, the card lists the specific scenarios where THOROUGH and QUICK outcomes differ. Each scenario shows:

- The scenario ID and descriptor (e.g., "Scenario 41 (adversarial, dense spawn)")
- QUICK outcome for that scenario (pass/fail)
- THOROUGH outcome for that scenario (pass/fail)

Scenarios where both modes produce the same outcome are not listed — only the disagreements. This list is capped at 5 entries per category (THOROUGH-better and QUICK-better), with a "View all N" expansion link if there are more.

Clicking a scenario row navigates to that scenario's replay in the debrief viewer, pre-loaded with a comparison overlay showing both QUICK's fix and THOROUGH's fix applied side by side. This connects the numerical delta to the spatial, tactical reality of the grid — the player can see *why* THOROUGH's fix won scenario 41 and lost scenario 23.

### The Session History Integration

Each WHAT IF QUICK simulation result is recorded in the counterfactual history (4.38) as a special entry type:

```
v3.2 → Counterfactual Session: Mission 9
  ├── THOROUGH applied: RELAY-C buffer +1  [84% pass rate]
  ├── QUICK counterfactual: SCOUT-A beacon –2  [79% simulated]
  └── Token value: +5 points
```

Over time, the player accumulates a **career token-value history** — an aggregate metric of how much value their THOROUGH spends have generated across their entire career. This metric, the **Cumulative Token Value** (CTV), lives in the career statistics panel and answers: "Across all the THOROUGH tokens I have ever spent that diverged from QUICK, did I come out ahead?"

```
CAREER TOKEN VALUE
  Sessions with THOROUGH divergence: 14
  Average THOROUGH advantage: +3.2 points
  Total pass-rate points gained over QUICK: +45
  Total tokens spent on divergent runs: 14
  Points per token: 3.2

  QUICK would have won: 4 of 14 sessions (28%)
  THOROUGH won: 9 of 14 sessions (64%)
  Tied: 1 of 14 sessions (7%)
```

This is the player's lifetime report card on their THOROUGH spending decisions.

---

## Player Journeys

### Journey 1: Nina, 19, CS undergrad, Week 1, Mission 4

**Context:** Nina is 5 hours into the campaign. She unlocked THOROUGH mode three missions ago. She has a budget of 3 tokens per session (starter tier). She ran THOROUGH once on Mission 2 — it confirmed QUICK, she felt she wasted the token, she has not used THOROUGH since. She is currently on Mission 4, "Relay Chain," with a 61% pass rate. She just ran QUICK and got a result she's skeptical about.

---

NINA sits at her desk, bottom lip between her teeth. The Fix Explorer shows:

```
⚡ FIRST VIABLE FIX: STRIKER-A — attack priority reorder
Expected pass rate: 68% (+7%)
```

She opens the pre-ranking drawer. Pivot-active: 0.44. Recency: 0.90. Volatility: 0.31. Low pivot correlation, very high recency. She modified STRIKER-A last session. The pre-ranking is guessing based on recency, not behavior.

NINA
(muttering)
That doesn't feel right. I didn't change anything important on Striker.

She hovers over the THOROUGH button. The tooltip reads: "1 token. ~28 seconds. 3 remaining this session."

She hesitates. Remembers Mission 2 — the confirmation, the wasted token. She clicks anyway.

28 seconds. The branching tree animation fills the explorer panel. Candidates expand. Contract. A few glow briefly and dim. The search narrows.

Result:

```
◎ THOROUGH RESULT — DIVERGENCE
  RELAY-B — context window +2 slots
  Expected pass rate: 74% (+13%)

  Different from QUICK's suggestion (STRIKER-A — attack priority reorder).
```

NINA
(leaning forward)
Plus thirteen? QUICK was plus seven.

She applies RELAY-B's fix. Runs the match. Pass rate: 73%. Close to the estimate.

The debrief loads. Session summary bar appears at the top. And there, below the pass rate, a card she has never seen before:

```
┌──────────────────────────────────┐
│  ◈ WHAT IF QUICK?               │
│  You applied THOROUGH's fix.    │
│  See what QUICK would have done.│
│           [ Simulate ]          │
└──────────────────────────────────┘
```

NINA
(reading aloud)
"What if Quick..."

She clicks Simulate. A thin amber progress bar fills inside the card. Three seconds.

The card expands:

```
  THOROUGH applied:  RELAY-B context window +2   → 73% pass rate
  QUICK would have:  STRIKER-A priority reorder   → 65% pass rate

  THOROUGH ADVANTAGE: +8 points
  Token value: 8 pass-rate points
  ■■■■■■■■□□□□□□□□□□□□  8 / 20
```

Nina stares at the number. Eight points. Not abstract. Not theoretical. Eight percentage points of pass rate that she would not have if she had listened to her instinct and skipped THOROUGH. She spent one token and bought eight points.

NINA
(quiet, to herself)
Okay. Okay, that was worth it.

She looks at the scenario breakdown. Three scenarios flipped. Scenario 22 — adversarial, choke point. She clicks it. The replay loads with a comparison overlay: on the left half of the grid, STRIKER-A's fix applied, the choke point collapses at tick 34 as relays run out of context. On the right half, RELAY-B's fix applied, the relay chain holds through tick 34, agents route around the choke.

The spatial difference is visceral. She can see the chain breaking on the left and holding on the right. The number — 8 points — now has a picture.

She dismisses the card. But something has shifted. The next time she sees QUICK return a suspicious result — low pivot correlation, high recency — she will spend the token. Not because the game told her to. Because she saw what the token bought her.

---

### Journey 2: David, 35, infrastructure engineer, Month 2, Gauntlet Match 3

**Context:** David is a methodical player. He runs THOROUGH on almost every fix, treating QUICK as a preview rather than a recommendation. He has 8 tokens per session. He has seen the WHAT IF QUICK card seven times across his career. Five times, THOROUGH won (average +4.2 points). Twice, QUICK would have been better (average -1.5 points). He checks the card every time it appears. His CTV is +17 points across 7 divergent sessions.

---

Gauntlet Match 3. David's config is at 91% pass rate after two rounds of refinement. He runs QUICK on the residual failures:

```
⚡ FIRST VIABLE FIX: COMMAND-A — spawn timing –1 tick
Expected pass rate: 93% (+2%)
```

Pre-ranking: pivot-active 0.88, recency 0.15, volatility 0.62. Low recency — he hasn't touched COMMAND-A in weeks. Good pivot signal though. David runs THOROUGH.

```
◎ THOROUGH RESULT — DIVERGENCE
  SCOUT-C — attention radius +1
  Expected pass rate: 94% (+3%)
```

Different element, slightly higher projected pass rate. He applies SCOUT-C. Runs the Gauntlet round. Pass rate: 93%. Close to projection.

Debrief loads. The WHAT IF QUICK card appears.

DAVID
(clicking Simulate without hesitation — this is routine now)

Three seconds.

```
  THOROUGH applied:  SCOUT-C attention radius +1  → 93% pass rate
  QUICK would have:  COMMAND-A spawn timing –1     → 93% pass rate

  NO DIFFERENCE — same pass rate
  Token value: 0 pass-rate points
  ···········■··········  0 / 20
```

David exhales through his nose. Same outcome. The fixes were different elements, different parameters, but the pass rate converged. The token bought him nothing — in terms of pass rate. He looks at the scenario breakdown:

```
  2 scenarios flipped by THOROUGH's fix that QUICK's fix missed:
    Scenario 31 (adversarial · multi-spawn) — QUICK: ✗  THOROUGH: ✓
    Scenario 78 (adversarial · corridor)    — QUICK: ✗  THOROUGH: ✓

  2 scenarios where QUICK would have done better:
    Scenario 12 (standard · open field)     — QUICK: ✓  THOROUGH: ✗
    Scenario 44 (standard · dense spawn)    — QUICK: ✓  THOROUGH: ✗
```

A wash. Different scenarios, same total. David notes: THOROUGH's fix won the adversarial scenarios but lost two standard ones. QUICK's fix was stronger on standard layouts. In a Gauntlet context — where opponents submit adversarial distributions — THOROUGH's fix might be slightly more robust even though the aggregate is identical.

DAVID
(opening his notebook, writing)
SCOUT-C: better adversarial resilience. COMMAND-A: better standard floor.
Token value: 0 on aggregate, but adversarial edge. Worth it for Gauntlet.

He dismisses the card. The career CTV doesn't change — zero delta adds zero. But the scenario-level breakdown gave him strategic intelligence that a single number would have missed. The card's value extended beyond the Worth Meter.

---

### Journey 3: Priya, 28, data scientist, Month 4, Career Review Screen

**Context:** Priya has been playing for 16 weeks. She has never once clicked the WHAT IF QUICK button. Not out of ignorance — she knows exactly what it does. She skips it because she has a personal policy: "I trust THOROUGH. I don't need to validate my spending decisions after the fact. The token was spent. The fix was applied. Looking backward is a waste of attention." She is reviewing her career statistics for the first time in weeks.

---

Priya opens the career panel. She scrolls past win rates, config version history, pass-rate evolution curves. She reaches the Career Token Value section:

```
CAREER TOKEN VALUE
  Sessions with THOROUGH divergence: 31
  Simulations run: 0 of 31

  ┌──────────────────────────────────────────────┐
  │  No simulations recorded.                     │
  │  You have 31 unsimulated divergent sessions.  │
  │  [ Run all counterfactuals ]                  │
  └──────────────────────────────────────────────┘
```

PRIYA
(raising an eyebrow)
All thirty-one? That's... a lot of data I'm leaving on the table.

She clicks "Run all counterfactuals." The game runs batch simulations against all 31 historical divergent sessions, using the original scenario distributions. A progress indicator fills — "Simulating session 1 of 31..." — each session takes 2-3 seconds. The batch completes in about a minute.

The career panel updates:

```
CAREER TOKEN VALUE
  Sessions with THOROUGH divergence: 31
  Average THOROUGH advantage: +2.8 points
  Total pass-rate points gained over QUICK: +87
  Total tokens spent on divergent runs: 31
  Points per token: 2.8

  QUICK would have won: 9 of 31 sessions (29%)
  THOROUGH won: 19 of 31 sessions (61%)
  Tied: 3 of 31 sessions (10%)
```

Priya stares at the aggregate. Sixty-one percent of the time, THOROUGH produced a measurably better outcome than QUICK. Twenty-nine percent of the time, she would have been better off with QUICK. The average advantage is +2.8 points per token.

Below the aggregate, a sparkline chart shows the token value for each of the 31 sessions, plotted chronologically. A thin amber line oscillates above and below zero. Early sessions are volatile — some +8, some -3. Later sessions cluster closer to +2 to +4. Her THOROUGH spending is becoming more efficient over time, not because the algorithm improved, but because she learned which situations warrant THOROUGH (high-recency pre-ranking signals, adversarial scenario distributions) and which don't (high-pivot, low-volatility signals where QUICK is usually correct).

PRIYA
(leaning back)
I'm getting better at knowing when to spend. That's... huh.

She had never looked at this data. She trusted her instinct and her instinct was good — 61% hit rate, improving over time. But seeing the trajectory makes her realize something: her early THOROUGH spends were essentially random — sometimes great, sometimes costly. Her recent spends are consistently positive. She developed diagnostic intuition without realizing it. The counterfactual simulation, run in batch months later, made the invisible learning curve visible.

She bookmarks the career panel. She will check it monthly now. Not to validate individual decisions — her policy stands — but to track the trajectory. The counterfactual became a self-improvement metric.

---

## Strengths

1. **Answers the question the player is actually asking.** Not "what did I learn?" but "was it worth it?" — the concrete, numerical, undeniable answer.

2. **Builds trust in the feedback loop.** Because the simulation can show QUICK winning, it earns credibility when it shows THOROUGH winning. The player trusts the delta because the game doesn't hide unflattering results.

3. **Creates a career-level learning curve metric.** The CTV sparkline shows the player their own improvement in spending decisions over time — an invisible skill made visible.

4. **Low-friction interaction.** One click. Three seconds. The player doesn't have to configure anything, navigate anywhere, or understand search algorithms. Click, see number, done.

5. **Honest about the 29% case.** When QUICK would have been better, the game says so. This honesty prevents the mechanic from becoming propaganda for THOROUGH spending.

## Weaknesses

1. **Outcome bias.** The simulation measures outcomes, not decision quality. A THOROUGH spend that looked correct given available information but happened to produce a worse result (because of scenario-specific noise) will register as negative. The player might learn "don't spend THOROUGH" when the correct lesson is "that scenario distribution was unusual."

2. **Hindsight devaluation.** After seeing "QUICK would have been +2," the player might retroactively feel bad about a decision that was perfectly reasonable at the time. Post-hoc regret is a known cognitive hazard that the mechanic amplifies.

3. **Simulation fidelity assumptions.** The counterfactual assumes QUICK's fix would produce the same pass rate as if the player had actually applied it and played normally. In reality, applying a different fix might have changed the player's subsequent decisions (running a different follow-up fix, deploying at a different time, etc.). The simulation only measures the first-order effect — "this fix in these scenarios" — not the cascading second-order effects.

4. **Batch simulation creates false precision.** Running 31 historical counterfactuals and producing a career average implies a stability that doesn't exist. The scenario distributions evolved, the player's configs evolved, the game's difficulty evolved. Averaging across these contexts produces a number that feels authoritative but may not be predictive.

5. **Attention cost of negative results.** A player who sees "QUICK would have won: 3 of the last 4 sessions" might stop using THOROUGH entirely, even in situations where THOROUGH is structurally likely to find better fixes. Short-term negative streaks can override long-term positive trends.

---

## Interaction Effects

### With 4.60 — Search Budget

The WHAT IF QUICK simulation directly prices the budget's core resource. A THOROUGH token costs 1 unit of budget. The Worth Meter tells the player what that 1 unit purchased: N pass-rate points. If the player's average token value is +3 points, they can reason: "Each token in my budget is worth approximately 3 pass-rate points. Is spending one here, on this mission at 88% pass rate, worth potentially gaining 3 points?" This transforms the budget from an abstract scarcity mechanic into a *priced* resource with understood value.

The danger: if the player's CTV trends negative (QUICK would have won more often), the entire budget mechanic collapses. The player concludes THOROUGH is not worth tokens, ever, and the budget becomes irrelevant idle currency. The search budget only creates interesting decisions if the player believes THOROUGH is sometimes worth spending. The counterfactual simulation can undermine that belief if negative results cluster.

### With 4.61 — QUICK vs. THOROUGH Explainer

The explainer tells the player *why* the modes diverged. The counterfactual tells them *whether it mattered*. These are complementary: understanding the structural reason for divergence (symptom-before-cause, recency bias, volatility false signal) and seeing the numerical consequence of that divergence give the player both the "how" and the "so what." A player who sees "+8 THOROUGH advantage" and then reads "divergence caused by symptom-before-cause pattern" learns: "when QUICK is chasing a symptom, the token is worth a lot."

### With 4.75 — Token Debt Recovery

The refund mechanic handles the confirmation case (THOROUGH agrees with QUICK). The WHAT IF QUICK simulation handles the divergence case (THOROUGH disagrees with QUICK). They are complementary halves of a complete system:

- Confirmation: Refund + "Confirmation is diagnostic work" message.
- Divergence: Worth Meter + scenario breakdown.

Together, they ensure that every THOROUGH spend — whether it confirms or diverges — produces a concrete, legible consequence beyond the fix itself. No THOROUGH spend goes unexamined.

### With 4.38 — Counterfactual History

Each simulation result is stored as a history entry, feeding into the config evolution record. The WHAT IF QUICK data enriches the history with comparative outcomes: not just "what forks were tested" but "what would have happened on the road not taken." This makes the config history a richer artifact for sharing and for the player's own retrospective analysis.

---

## Comparable Games and Media

**Poker HUDs (PokerTracker, Hold'em Manager):** Post-session analysis tools that show players their expected value on every hand — "you called with 30% equity against a pot odds requirement of 35%, this was a -EV decision." The WHAT IF QUICK simulation functions identically: it assigns a numerical value to the player's decision, divorced from outcome. The key difference is that poker HUDs measure decision quality against known probabilities, while the WHAT IF QUICK simulation measures outcome quality against a simulated alternative — a subtly different claim.

**Chess engine analysis (Lichess, Chess.com):** After a game, the player can run engine analysis to see what the engine would have played at each move. The engine's evaluation bar shows "your move was +0.3, the best move was +1.1, you lost 0.8 centipawns." The Worth Meter functions like a compressed version of this: "your choice (THOROUGH) produced X, the alternative (QUICK) would have produced Y, the delta is Z." Chess analysis is move-by-move; the WHAT IF QUICK simulation is decision-by-decision. But the emotional payload is the same: concrete feedback on a choice you already made.

**Into the Breach — timeline reset:** Into the Breach lets the player reset a turn, seeing the consequences of their original move before undoing it. The WHAT IF QUICK simulation is a non-interactive version of this: you see what would have happened, but you can't change your choice. The information is retrospective, not actionable in the moment. This is deliberate — the goal is learning, not optimization. If the player could rewind and apply QUICK instead, the THOROUGH spend decision would lose all weight.

**XCOM — post-mission statistics:** XCOM shows hit percentages, damage dealt, turns taken, soldiers lost after each mission. Players obsess over these stats, comparing their performance to what was "optimal." The WHAT IF QUICK card functions as a single, focused stat: "how did your diagnostic tool choice compare to the alternative?" It benefits from the same compulsive review behavior that XCOM's post-mission screen generates.

**Scientific A/B testing dashboards (Optimizely, LaunchDarkly):** In the real world, A/B testing platforms show the outcome of the treatment group vs. the control group. The WHAT IF QUICK simulation is a personal A/B test: THOROUGH is the treatment, QUICK is the control, the pass rate is the conversion metric. The player is both the experimenter and the subject. The CTV career metric is their cumulative experiment log.

---

## Sensory Description

### The Card at Rest

The WHAT IF QUICK card sits in the session summary bar, bottom-right, below the pass rate and config version labels. It is a rectangle with a 1-pixel border in a muted amber — hex `#C4975A`, the same amber used throughout the token debt system. The interior is transparent, showing the summary bar's dark background (`#1A1D1F`) through it. The text "WHAT IF QUICK?" is set in the game's monospace display font (the same family used for agent stat readouts), 13px, letter-spacing +1px, in a warm off-white (`#E8DDD0`). The subtext — "You applied THOROUGH's fix. See what QUICK would have done." — is 11px, same font, in a dimmer tone (`#8A8070`). The Simulate button is a pill shape, 28px tall, outlined in the same amber, text in amber, no fill. On hover, the pill fills with amber at 15% opacity and the text brightens to full white.

The card breathes. A subtle border opacity animation cycles between 60% and 100% over 4 seconds — slow enough to read as a gentle pulse, not a distraction. When the player scrolls past it, the pulse continues in the background. When they scroll back, it's still there, patiently waiting.

### The Simulation Loading State

When the player clicks Simulate, the pill button text changes from "Simulate" to "Running..." in a slightly dimmer tone. The border pulse stops — the card becomes static, grounded. Inside the card, below the subtext, a thin horizontal line appears — 2px tall, the full width of the card interior. It fills left to right in amber, taking 3-6 seconds depending on simulation complexity. The fill is not linear — it accelerates in the middle and decelerates at the end, mimicking the feel of a search that finds quick answers for most scenarios but takes longer on the edge cases.

No sound plays during loading. The silence is deliberate — the simulation is a quiet reflection, not an event.

### The Result Expansion

When the simulation completes, the card expands downward. The expansion takes 0.4 seconds, eased with a deceleration curve — fast at the start, settling gently at the end. The content fades in 0.2 seconds after the expansion completes, so the card reaches its full size before the text appears. This prevents the content from appearing to "stretch" with the card.

The Worth Meter bar appears with a fill animation. If the delta is positive (THOROUGH won), the bar fills rightward from center in amber (`#C4975A`), each segment appearing in sequence over 0.8 seconds, accompanied by a quiet ascending tone — a soft synthesized note that rises in pitch proportional to the number of segments filled. A +2 delta produces a brief, modest rise. A +8 delta produces a longer, more satisfying climb. The tone is clean, sine-wave-based, with a light reverb tail — it sounds like a signal confirming good reception, not a fanfare.

If the delta is negative (QUICK would have won), the bar fills leftward from center in a cool blue-grey (`#6B7A8A`). The accompanying tone descends in pitch — a gentle falling note, not punitive, more like a "huh" than a "wrong." The game does not punish the player for a negative delta. It simply reports it.

If the delta is zero, no bar fills. A single soft click sound plays — a neutral acknowledgment. The text "NO DIFFERENCE" appears in the same off-white as the card header.

The "THOROUGH ADVANTAGE" or "QUICK WOULD HAVE WON" label appears in the respective color — amber for THOROUGH advantage, blue-grey for QUICK advantage. The text is 14px, bold weight, slightly larger than the surrounding content. The token value line below it ("Token value: N pass-rate points") is 11px, regular weight, in the dimmer tone.

### The Scenario Breakdown Lines

Each scenario line fades in sequentially, top to bottom, 0.1 seconds apart. The scenario descriptor is in the standard dim text color. The QUICK and THOROUGH outcomes are represented by small icons: a circle-check (`✓`) in green (`#5A9E6F`) for pass, a circle-cross (`✗`) in a muted red (`#9E5A5A`) for fail. The icons are 10px, vertically centered with the text.

Hovering over a scenario line highlights it — the background brightens by 8%, and a small arrow icon appears at the right edge, indicating the line is clickable. Clicking opens the replay viewer for that scenario. The transition is a lateral slide — the debrief content slides left as the replay viewer slides in from the right, maintaining spatial continuity.

### The Career CTV Sparkline

In the career statistics panel, the CTV sparkline is a thin line chart — 120px wide, 24px tall — plotted in amber for positive values and blue-grey for negative values. The zero line is drawn as a 1px dashed line in `#3A3D3F`. Each data point represents one divergent session. The sparkline uses no axes, no labels, no grid — just the line and the zero reference. Hovering over the sparkline expands it to a full-width chart (480px wide, 80px tall) with labeled axes and individual data point tooltips.

The sparkline's shape tells a story at a glance: a volatile early section that gradually trends upward and stabilizes means the player is learning. A flat line near zero means the player's THOROUGH spends are roughly break-even. A downward trend means the player is spending tokens in situations where QUICK would have sufficed — a signal that their spending heuristic needs recalibration.

The sparkline pulses once — a single gentle brightness cycle — when a new data point is added after a simulation. Then it settles. The pulse says: "Something changed." The stillness after says: "Here is the new shape of your history."

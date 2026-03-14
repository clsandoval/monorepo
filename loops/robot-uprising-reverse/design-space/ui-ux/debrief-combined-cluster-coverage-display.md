# Combined Agent Coverage Score Display

**Aspect:** 4.69b — Combined agent coverage score display: showing "if ALL of this agent's clustered elements were fixed, combined coverage = X%" as a first-class metric in the career analysis panel; question of whether this number should be pre-computed or on-demand.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69a — Multi-cluster threshold configurability; 4.69c — Agent redesign mode; 4.69d — Multi-cluster persistence tracking
**Related:** 4.59 — Career minimum fix; 4.36 — Multi-scenario fix explorer; 4.60 — Search budget as player resource; 4.68 — Coverage percentage as season health

---

## The Core Concept

When the career analysis runner-up list surfaces three RELAY-C candidates at coverage levels of 62%, 24%, and 17%, the naive sum is 103% — obviously impossible, because matches overlap. Multiple fixes can address the same match. The *combined* coverage requires computing the **union** of addressed matches across all cluster members: "how many distinct matches would be improved if *all three* RELAY-C elements were fixed simultaneously?"

```
Individual entries (naive sum = 103%, overlapping):
  RELAY-C context buffer     → improves matches {1,3,5,8,12,...}  (28 of 45 = 62%)
  RELAY-C fallback filter    → improves matches {3,5,9,11,...}    (11 of 45 = 24%)
  RELAY-C priority queue     → improves matches {1,5,8,15,...}    (8 of 45 = 17%)

Union across all three:       matches {1,3,5,8,9,11,12,15,...}   (32 of 45 = 71%)

Combined coverage: 71%        (vs. 62% from top candidate alone — +9pp)
Unreachable loss: 29%         (matches RELAY-C fixes can't address regardless)
```

The combined coverage number answers a different question than the individual candidates: not "what is the best single fix?" but "what is the ceiling for this agent's impact?" The ceiling tells the player whether a holistic overhaul is worth their time. If the ceiling is 63% and the top candidate alone achieves 62%, holistic redesign is nearly value-neutral — the extra 1pp gain doesn't justify the effort. If the ceiling is 71% and the top candidate is 62%, there are 9pp stranded in the other cluster members — a concrete argument for going deeper.

This is the **architectural ROI metric**: how much upside does fixing the whole agent unlock, vs. fixing just its most visible symptom?

---

## The Pre-Computed vs. On-Demand Design Space

### Why This Question Is Non-Trivial

The individual candidate scores are cheap to compute: for each candidate element X, scan the match history and count matches where changing X would have changed the outcome. These are independent computations, parallelizable, O(m) per candidate where m = number of analyzed matches.

Combined cluster coverage requires the **union across cluster members** — which matches are addressed by *any* of the cluster elements. This is O(k*m) where k = cluster size, but more importantly, it requires the system to store and access the full match-attribution set for each candidate (not just the count), and then compute a set union. On a 200-match career analysis with 5 cluster candidates, this is still fast (milliseconds), but:

1. **The career analysis run is already slow.** Players experience it as a 3–8 second computation. Adding another pass — even a fast one — extends a flow that already feels like waiting.
2. **The result is only used when a cluster is detected.** Computing combined coverage for every career analysis run, most of which have no cluster, wastes computation on every run for a result that appears rarely.
3. **Pre-computation changes the semantics.** If combined coverage is always shown, it becomes a standard metric — players expect it, design around it, and notice when it's missing. If it's on-demand, it is a tool the player chooses to use, preserving the "you triggered this diagnostic" agency.

### Option 1 — Eager Pre-Computation (Always Available)

The combined cluster coverage is computed as part of the main career analysis engine pass. The moment a cluster is detected, the combined score is available to display immediately alongside the flag.

**Mechanics:** The career analysis engine, which already computes per-element match attribution sets, retains those sets in memory. After the candidate ranking is complete, if a cluster is detected, it immediately unions the attribution sets of the cluster members and computes the combined percentage. No extra data fetch, no extra user-facing wait.

**UI treatment:** The combined coverage number appears in the cluster flag header — immediately visible when the flag slides in:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠  RELAY-C multi-cluster detected                           │
│     3 elements — combined coverage if all fixed: 71%         │
│     (vs. 62% from top fix alone — +9pp architectural upside) │
│     [View Agent Audit →]  [Skip — apply #1 fix]              │
└──────────────────────────────────────────────────────────────┘
```

The "+9pp architectural upside" line is the key: the combined coverage is contextualized as *incremental value over the top fix*, not just as an absolute percentage.

**Strengths:**
- Zero friction: the number is there the instant the flag appears
- No "waiting for calculation" UX to manage
- The number is immediately comparable to the top-fix coverage — a natural decision input
- Players who want to quickly dismiss and apply the top fix still see the number in passing — passive exposure to the metric

**Weaknesses:**
- Every career analysis run pays the computation cost even when no cluster exists
- The number is always present — players may anchor to it as a target even when it isn't meaningful (e.g., a 3-entry cluster with combined coverage of 63% vs. top-fix 62% is not architecturally significant, but the displayed "+1pp upside" may feel like a goal)
- Pre-computation ties this number to the career analysis window (the N matches analyzed). If the player asks "but what would this be across all 200 career matches?" they can't get that without re-running analysis.

---

### Option 2 — Lazy On-Demand Computation (Player-Triggered)

The combined cluster coverage is not computed during the main career analysis pass. Instead, the cluster flag appears with the individual cluster members and a call-to-action:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠  RELAY-C multi-cluster detected                           │
│     3 elements flagged (context buffer, fallback, queue)     │
│     Combined coverage: [Calculate →]                         │
│     [View Agent Audit →]  [Skip — apply #1 fix]              │
└──────────────────────────────────────────────────────────────┘
```

When the player clicks `[Calculate →]`, the computation runs (300–500ms in most cases), and the number replaces the button:

```
│     Combined coverage: 71% (+9pp over top fix alone)         │
```

**Mechanics:** The attribution sets are not retained after the career analysis pass (to save memory). Re-triggering the calculation requires a partial re-run of the attribution step for just the cluster members. This is fast enough to feel responsive (< 500ms for 200 matches, 3 cluster members).

**Strengths:**
- Clean separation of concerns: the career analysis answers "what are the best fixes?" and the combined coverage calculation answers "how much does holistic redesign help?" — two different questions, two different triggers
- The on-demand trigger makes the combined coverage feel like a *diagnostic tool the player chose to use*, reinforcing the "you are an engineer running deliberate analysis" identity
- No computation waste on non-clustered career analysis runs
- The act of clicking `[Calculate →]` creates a micro-moment of deliberate attention — the player is actively choosing to investigate the combined value, making them more likely to actually read the result

**Weaknesses:**
- Adds a click to a flow that already has many clicks
- Players who don't know to click `[Calculate →]` miss the combined coverage entirely — the number is invisible unless sought
- The UX of "click to compute" feels slightly archaic — like a spreadsheet that needs a "Recalculate" button. Players may expect modern UIs to just show the number.
- On-demand calculation may confuse players about *why* this one number requires a separate trigger when all the other numbers were pre-computed

---

### Option 3 — Background Computation (Hybrid)

The combined coverage is computed asynchronously after the career analysis completes — not during the main pass, not on explicit player request, but in a background thread that runs while the player is reading the candidate list.

**Mechanics:** The main career analysis completes and the candidate list renders. If a cluster is detected, a background computation is queued. Within 1–2 seconds (while the player is reading), the combined coverage resolves and fills in. The flag initially shows a loading placeholder:

```
⚠  RELAY-C multi-cluster detected
   3 elements — combined coverage: ···
```

After 1.5 seconds, the placeholder cross-dissolves to the result:

```
⚠  RELAY-C multi-cluster detected
   3 elements — combined coverage: 71% (+9pp over top fix)
```

**Strengths:**
- No user-facing latency: by the time the player reads the cluster flag text, the number is already there
- No wasted computation on non-clustered runs (background job only queued when cluster detected)
- The "loading then resolves" pattern is familiar from modern UIs (lazy loading, progressive enhancement)
- Preserves the feel that "this took work to compute" — the brief loading state signals the number isn't trivial

**Weaknesses:**
- If the player is fast (dismisses the flag before the computation resolves), they never see the number
- Async computation introduces timing dependencies that can fail (what if the background job errors? what if the user navigates away?)
- The loading placeholder for 1.5 seconds in a modal-style flag card may feel strange — the card renders "empty" for a moment
- A fast player on a slow device might experience a longer background compute than intended

---

### Option 4 — Approximation First, Exact On-Demand

The flag shows a fast-approximate combined coverage immediately (using a formula that corrects for expected overlap), with an option to compute the exact value:

```
⚠  RELAY-C multi-cluster detected
   3 elements — combined coverage: ~68% (approx.) [Exact →]
```

The approximation formula is simple: `combined ≈ 1 - ∏(1 - coverageᵢ)` — the inclusion-exclusion approximation assuming pairwise independence. For three cluster members with coverages 0.62, 0.24, 0.17:

```
~combined = 1 - (1-0.62)(1-0.24)(1-0.17) = 1 - 0.38 × 0.76 × 0.83 ≈ 0.76 (76%)
```

The true value (71%) is lower because the matches are correlated — the same 5 hardest matches are often covered by multiple candidates. The approximation (76%) is close enough for most decisions but can be misleading when overlap is high.

**Strengths:**
- Instant display, no latency, no background job
- The "~" prefix signals the approximation is not exact, teaching that correlation matters
- Exact computation is available for players who need precision

**Weaknesses:**
- The independence assumption will often be wrong (cluster members tend to be highly correlated — they fail in the same matches). The approximation is often optimistic.
- Showing an optimistic approximate value first might cause the player to inflate the value of holistic redesign (76% "ceiling" vs. true 71% ceiling)
- The `[Exact →]` trigger still requires a click and a wait — doesn't fully solve the on-demand UX problem

---

## Display Format Options

Beyond when the number is computed, the format of the combined coverage display shapes how players use it.

### Format A — Absolute Percentage Only

```
Combined coverage: 71%
```

Simple, direct. Tells the player the ceiling. Requires the player to recall the top-fix coverage (62%) to compute the delta.

**Best for:** Players who have internalized coverage benchmarks and can contextualize 71% without a reference.

---

### Format B — Absolute + Delta from Top Fix (Recommended)

```
Combined coverage: 71% (top fix alone: 62% — +9pp from full overhaul)
```

The delta is the decision input — the player needs to judge whether +9pp justifies redesign effort. This format delivers the delta explicitly.

**Best for:** All players. The "top fix alone: 62%" anchor makes the delta legible even for players who don't track percentages.

---

### Format C — Upgrade Framing

```
Addressing all 3 RELAY-C elements unlocks an additional 9pp win rate vs. the top fix alone.
```

Reframes from "combined percentage" to "unlocked gain." The word "unlocks" is motivational and evokes the upgrade economy that drives player decisions throughout the game.

**Risk:** Players may misread "9pp" as "you will gain 9pp" — it's actually "up to 9pp, if this career analysis window is representative." The framing implies certainty.

---

### Format D — Bar Visualization

Instead of (or in addition to) the percentage text, render the combined coverage as a horizontal bar that extends beyond the top-fix bar:

```
Top fix (RELAY-C buffer):  [████████████████████░░░░░░░░] 62%
Combined cluster ceiling:  [█████████████████████████░░░] 71%
Unreachable losses:                              [░░░░░░░] 29%
```

The bar visually communicates that the combined ceiling covers more of the loss band. The unreachable losses bar makes it clear that 29% of losses are outside the cluster's reach entirely — even a perfect overhaul won't address them.

**Best for:** Players who process information visually rather than numerically.

**Risk:** The bar encoding requires understanding what "unreachable losses" means — needs tooltip support on first encounter.

---

### Format E — Coverage Budget Metaphor

```
RELAY-C cluster covers 71 of your 100 "loss budget."
Fixing all three returns 9 budget points beyond the top fix.
29 budget points require other agents or different strategies.
```

Reframes coverage as a budget — each lost match is a "point," and the cluster covers some budget, the top fix covers some, and the remainder belongs elsewhere. The "budget" vocabulary connects to the game's broader language of resource management.

**Risk:** This adds a third vocabulary on top of "coverage" and "percentage" — may increase cognitive load for new players.

---

## Prominence: First-Class Metric vs. Secondary Detail

The parent 4.69 design places combined coverage inside the Agent Audit panel — secondary to the cluster flag, accessed by clicking through. The aspect 4.69b asks whether this number should be **first-class** — visible in the career analysis panel itself, not only after clicking through.

### The Case for First-Class Prominence

The combined coverage number answers the question every player has when they see a multi-cluster flag: "How much does this actually matter?" If the answer ("+1pp") is hidden behind a click, players will make decisions without it. The flag's primary purpose is to prompt a specific question; the combined coverage number is the answer to that question. Hiding the answer behind a click undermines the flag's value.

**Position in the career analysis panel:**

```
Career Analysis (M145–M190, 45 matches analyzed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠  RELAY-C MULTI-CLUSTER                       [View Audit →]
   All 3 elements fixed: 71% coverage  (+9pp over top fix)
   ──────────────────────────────────────────────────────

#1  RELAY-C context buffer    62%  ─┐  [Apply Fix →]
#2  SCOUT-A hook threshold    31%   │  [Apply Fix →]
#3  RELAY-C fallback filter   24%  ─┤  [Apply Fix →]
#4  STRIKER-B patrol radius   18%   │  [Apply Fix →]
#5  RELAY-C priority queue    17%  ─┘  [Apply Fix →]
```

The cluster banner lives between the panel header and the candidate list, is two lines tall, and displays the combined coverage prominently before the player reaches any individual fix buttons. This forces the player to register the ceiling before choosing the easy path.

### The Case for Secondary Positioning

Putting combined coverage in the main panel adds visual complexity to a screen that is already information-dense. For players whose cluster ceiling is only +2pp over the top fix (a low-value cluster), the prominent display creates false alarm — the banner draws attention to a number that says "don't bother with the overhaul." For players whose cluster ceiling is +15pp (a high-value cluster), the prominent display is exactly right. The display value is asymmetric: it matters more when the ceiling is high than when it's low.

**A conditional prominence design:** Display the combined coverage number prominently (in the banner) when the delta exceeds a threshold (e.g., +5pp or more). When the delta is small (< 5pp), show only the flag annotation on the candidate list, without a prominent banner. This prevents the "RELAY-C cluster, +1pp" banner from training players to ignore multi-cluster signals.

---

## Player Journeys

### Journey: Marcus, 35, Product Manager — First Time Seeing the Combined Score

**Context:** Marcus is in Season 2, Match 190. He has just run his fourth career analysis. He has seen multi-cluster detection twice before but has not yet encountered the combined coverage display (the previous runs used the flag-only Option A). This run is the first where the full combined coverage appears prominently.

**Minute 0:00 — Career Analysis Loads**

Marcus clicks "Run Career Analysis." The 4-second spinner. The result panel fades in.

He sees the cluster banner slide down immediately — before he can start reading the candidate list. The banner is amber, two lines:

> ⚠ **RELAY-C MULTI-CLUSTER — 3 elements**
> All 3 elements fixed: **71% coverage** (+9pp over top fix alone)

Marcus reads the number. 71%. The top fix — he can see it in the candidate list below — is 62%. The math is visible: the cluster ceiling is 9pp higher than the top fix.

He pauses. 9pp feels like a lot. He wins roughly 60% of matches now. If fixing RELAY-C holistically gets him to 71%, that's a real improvement. But is it worth rebuilding the whole agent?

He hasn't clicked anything yet. He's doing arithmetic in his head.

**Minute 0:30 — The Decision Calculus**

Marcus hovers over `[View Audit →]` in the banner. A tooltip appears: "See RELAY-C's full history, root cause hypotheses, and a one-click path to redesign mode."

He clicks. The agent audit panel slides in. The combined coverage is displayed prominently there too — in the highlighted teal box. He reads the root cause: "Role drift. RELAY-C was last redesigned Season 1 for single-hop relay. It has since been expanded to 3-hop relay."

He understands. He clicks `[Redesign RELAY-C →]`.

**Minute 1:00 — Entering Redesign Mode**

The workbench opens. RELAY-C is isolated. The coral modal header reads "REDESIGN MODE — RELAY-C."

Marcus spends 20 minutes rebuilding from scratch. He isn't certain he did it right, but he knows he asked the right question: "Is RELAY-C designed for the role it has now?" The combined coverage number gave him the decision frame.

**Minute 22:00 — Post-Redesign Check**

After deploying and playing 30 matches, Marcus runs career analysis again. RELAY-C does not appear in the top 10 candidates. No cluster flag. He checks the season health trend: top-candidate coverage has dropped from 62% to 31%. The sparkline shows a clear inflection point at today's session.

He remembers the "+9pp" number from the banner. The actual improvement in top-candidate coverage (31pp reduction, from 62% to 31%) vastly exceeded the cluster ceiling estimate. The ceiling was about RELAY-C's contribution to losses — fixing the architecture also improved how other agents operated downstream of RELAY-C.

He files a mental note: "The combined coverage number is a floor estimate, not a ceiling."

**UI Annotations:**
- Cluster banner height: 72px (two-line height), amber background, bold agent name + element count on line 1; coverage + delta on line 2 in large (18px) type
- "+9pp" delta rendered in a slightly larger font size (20px) and with a teal color accent — same teal as positive indicators elsewhere in the debrief UI
- `[View Audit →]` button flush right in the banner, consistent with action button positioning across the debrief panel
- Candidate list below the banner: cluster bracket connects the three RELAY-C rows visually, amber vertical line left-edge

---

### Journey: Yuki, 17, Optimizer — Using Combined Coverage as a Triage Filter

**Context:** Yuki is in Season 3, Match 280. Her config has 18 agents. Her multi-cluster threshold is N=2 (she raised it from N=3 two sessions ago after finding N=2 fires too much). At N=2, she sees combined coverage prominently on almost every career analysis run — two cluster entries are common. She has developed a personal decision rule: "Only pursue redesign if combined coverage delta is ≥10pp."

**Minute 0:00 — Career Analysis Runs**

The result panel loads. She sees two cluster banners:

```
⚠ SCOUT-A MULTI-CLUSTER — 2 elements
   Both elements fixed: 48% coverage  (+3pp over top fix alone)

⚠ RELAY-C MULTI-CLUSTER — 2 elements
   Both elements fixed: 44% coverage  (+2pp over top fix alone)
```

She reads both deltas instantly: +3pp and +2pp. Both are below her 10pp threshold. She dismisses both flags without clicking View Audit. She applies the top fix from SCOUT-A (45% coverage). She does not redesign either agent.

**Minute 0:30 — Fast Workflow**

Yuki's use of combined coverage is not exploratory — it's a triage gate. The number lets her make a Go/No-Go decision in seconds. She never clicks into the agent audit when the delta is small. The combined coverage display, for her, is a *filter* not a *diagnostic*.

She applies 1 fix, deploys, and closes the debrief screen in under 90 seconds. She notes in her session log: "SCOUT-A +3pp cluster — not worth redesign."

**Minute 5:00 — The High-Delta Run**

Two sessions later, career analysis loads. She sees one cluster banner:

```
⚠ COMMAND-A MULTI-CLUSTER — 3 elements
   All 3 elements fixed: 61% coverage  (+18pp over top fix alone)
```

Yuki stops. +18pp is far above her threshold. She reads the banner twice to make sure she isn't misreading. She clicks `[View Audit →]`.

The audit shows the three entries. Combined coverage 61%. Top fix alone: 43%. The delta is massive — 18pp stranded in the two smaller cluster members.

Root cause hypothesis: "Dependency gap: COMMAND-A's attention filter has not been retuned since RELAY-C was rebuilt in session 280."

She rebuilt RELAY-C two sessions ago. She never updated COMMAND-A. This makes sense — COMMAND-A depends on RELAY-C's output and was tuned for the old signal profile.

She spends 45 minutes rebuilding COMMAND-A's attention filters from scratch. This is the right call; her threshold rule correctly identified it.

**What Yuki Validated:**
- The combined coverage delta is a reliable triage signal: low delta = symptom fix is sufficient; high delta = structural work is justified
- Her personal threshold of 10pp was calibrated through experience — she'd like the game to suggest a starting threshold for new players
- The number enables fast workflow when small and thoughtful investigation when large

**UI Annotations:**
- When two cluster banners fire simultaneously, they stack vertically; each is its own card with dismiss buttons
- Yuki's rapid-dismiss UX requires that both banners be independently dismissible without opening the audit — the dismiss action on the banner itself is primary, not buried
- The combined coverage delta should be color-coded by significance: < 5pp in gray (low signal), 5-15pp in amber (worth checking), ≥15pp in teal (strong architectural signal)

---

### Journey: Soren, 17, Student — First Encounter, Learning What the Number Means

**Context:** Soren is in Season 2, Match 130. He has never seen the combined coverage display before. He barely remembers what "coverage" means (the number of analyzed matches where a fix would have helped). When the banner appears showing "71% combined coverage (+9pp)", he doesn't understand what either number means.

**Minute 0:00 — Banner Appears**

Soren's career analysis loads. The amber banner slides in:

```
⚠  SCOUT-A MULTI-CLUSTER — 3 elements
   All 3 elements fixed: 71% coverage  (+9pp over top fix alone)
```

Soren reads it. "71% coverage." He doesn't know what this means. Is 71% good? Bad? Does "all 3 elements fixed" mean he has to do 3 things?

He clicks the `[?]` info icon next to "combined coverage."

**Minute 0:20 — The Tooltip**

A tooltip expands (240px wide, below the banner):

> **Combined coverage** — if you fixed all 3 SCOUT-A elements the career analysis flagged, your config would have won 32 of the 45 analyzed matches (71%). Right now, the single best fix addresses 28 of 45 matches (62%). The extra 9% means fixing all three would have won 4 more matches.

Soren reads it slowly. "Won 4 more matches" clicks for him. The abstract "9pp" becomes concrete: 4 extra wins.

He looks at the banner again. The number is no longer mysterious — it's a count of extra wins, expressed as a percentage.

He clicks `[View Audit →]`.

**Minute 0:50 — The Audit Panel**

The audit opens. He sees the three SCOUT-A entries. He scrolls to the combined coverage box — the teal highlighted box with "71% combined vs. 62% top candidate (+9pp)" on two lines.

He sees `[Apply All Three Fixes →]` and `[Redesign SCOUT-A →]` and `[Dismiss]`.

He clicks `[Apply All Three Fixes →]`. The three fixes apply. He plays 30 more matches. Wins 4 more.

He doesn't yet understand "root cause" or "structural redesign." But he understood "4 extra wins," and that was enough.

**What Soren Needed:**
- The tooltip that translates "+9pp" into "4 extra wins from 45 analyzed matches" on first encounter
- The plain-language version: "right now: 28 wins; with all fixes: 32 wins" — concrete counts, not percentages
- The percentage should be secondary text; the absolute match counts should be primary for first-time players

**What Would Have Lost Soren:**
- Showing only the percentage with no match-count context
- Requiring him to compute the match count himself from the percentage and the "45 matches analyzed" header
- A combined coverage number with no tooltip on first encounter

**UI Annotations:**
- `[?]` info icon appears on first encounter with "combined coverage" in any banner; after 3 encounters, the icon still exists but the tooltip must be explicitly hovered
- Tooltip content for first-time players: matches-won format primary, percentage secondary: "Fixing all 3 would win 32/45 analyzed matches (71%). Top fix alone wins 28/45 (62%). Difference: 4 matches."
- The match counts (28/45, 32/45) are stored in the career analysis result and are always available to render in tooltips — no additional computation needed

---

### Journey: Priya, 30, Software Engineer — Using the Number Adversarially

**Context:** Priya is in Season 4 competitive Gauntlet. She plays against human opponents. She has just run career analysis after an opponent's config has been crushing her RELAY-C. She suspects her opponent is deliberately attacking RELAY-C across multiple attack vectors. She wants to use the combined coverage number to distinguish "structural problem" from "adversarial targeting."

**Minute 0:00 — Career Analysis on Match Set vs. One Opponent**

Priya runs career analysis filtered to matches against Opponent X (see 4.70 — career analysis filtered by opponent archetype). The result shows a RELAY-C cluster with combined coverage 68% (+14pp).

She looks at this number and thinks: 68% combined coverage against *this one opponent*. If this were a structural problem, the cluster would also appear in matches against other opponents. She runs a second career analysis on matches against all *other* opponents. No RELAY-C cluster. Top candidate coverage: 31% (SCOUT-A, no cluster).

The combined coverage number in the adversarial context becomes a diagnostic: a cluster appearing in one-opponent analysis but not cross-opponent analysis is adversarial targeting, not structural failure. The delta (+14pp) is large, which looks alarming — but the combined coverage is 68% *only against this specific opponent's attack pattern*, not against the field.

**Minute 3:00 — Interpreting the Number**

Priya realizes: the combined coverage number's value depends on the match set it was computed over. A 68% combined coverage against 45 matches from one opponent means something different than 68% combined coverage across 45 matches from diverse opponents. The metric itself is silent about this distinction.

She wants the banner to show the match set scope:

```
⚠  RELAY-C MULTI-CLUSTER — 3 elements (matches vs. Opponent X only)
   All 3 elements fixed: 68% coverage  (+14pp over top fix alone)
   [Compare across all opponents →]
```

The `[Compare across all opponents →]` link would re-run the cluster analysis on the full match history and show whether the cluster persists — the structural vs. adversarial disambiguation built into the metric display itself.

**What Priya Discovered:**
- Combined coverage is a ratio that depends entirely on the match set it was computed over
- High combined coverage against a single opponent is weaker evidence of structural failure than high coverage across diverse opponents
- The match set scope should be visible in the combined coverage display — not hidden in the career analysis settings panel
- The adversarial use case for combined coverage (distinguishing structural from targeted) is a powerful PvP tool

**UI Annotations:**
- When career analysis is run on a filtered subset (e.g., matches vs. one opponent), the cluster banner should include the subset label: "(45 matches vs. Opponent X)"
- `[Compare across all opponents →]` is a one-click action that re-runs the cluster analysis against the full match history and shows the comparison side-by-side; this is an on-demand computation (not pre-computed)
- Side-by-side comparison: "vs. Opponent X: 68% combined (+14pp)" next to "vs. all opponents: 41% combined (+4pp)" — the delta between deltas is the adversarial signal

---

## Strengths and Weaknesses

### Strengths

- **Makes the architectural ROI decision legible.** Without the combined coverage number, players are comparing individual fix candidates but have no way to evaluate the *ceiling* of holistic redesign. The number provides the decision input that justifies (or dismisses) deeper work.
- **Works at all experience levels** — absolute percentage for veterans, match-count tooltip for beginners, delta framing for decision-makers.
- **The bar visualization format** (Format D) is especially accessible for spatial thinkers who don't process percentages intuitively.
- **Enables the "triage filter" workflow** that expert players like Yuki naturally develop — they don't need to open the audit for every cluster; the delta number in the banner is sufficient.
- **The adversarial use case** (structural vs. targeted clustering) adds a PvP depth layer that enriches the competitive meta without requiring additional mechanics.

### Weaknesses

- **The number is optimistic about architectural impact.** It measures the ceiling from fixing the cluster elements, not from redesigning the agent holistically. A redesign might address root causes that aren't captured in the current cluster and achieve a lower combined coverage than expected — while a redesign that introduces new problems could overshoot in the wrong direction. The combined coverage number is an estimate based on the current config's failure modes, not a guarantee.
- **High deltas can create false urgency.** A +18pp combined coverage delta sounds dramatic. If the player's win rate is 45%, going to 63% is significant. But if the player's win rate is 78%, the same +18pp gets them to 96% — an almost impossible-to-reach ceiling. The metric needs to be contextualized by current win rate, not presented as an absolute imperative.
- **The pre-computation decision affects every career analysis run.** If pre-computed, any change to the career analysis engine must maintain the match attribution sets for potential union computation. This is a permanent coupling between the career analysis implementation and the combined coverage display.
- **Match-set sensitivity is non-obvious.** As Priya's journey illustrates, the combined coverage number changes meaning depending on the match set. A player who doesn't understand this might overreact to high combined coverage in a narrow (opponent-filtered) analysis.

---

## Interaction Effects

### With 4.69a — Multi-Cluster Threshold Configurability

At lower thresholds (N=2), clusters fire more often and combined coverage is computed more often. The combined coverage delta at N=2 clusters is systematically smaller (two-entry clusters have less unreachable overlap than three-entry clusters), so the "+Xpp" delta displayed in the banner will often be small. This means:

- **At N=2**, combined coverage is more useful as a filter (low deltas = skip the audit) than as a motivation for redesign
- **At N=4**, combined coverage is almost always meaningful when displayed — a four-entry cluster with high combined coverage is a very strong architectural signal

The threshold and the combined coverage display should be tuned together: if the player is on N=4 (expert mode), the combined coverage display can be more prominent (the rare case when it fires is important). If the player is on N=2 (vigilant mode), the combined coverage should be more subdued (it fires often and is often noise).

### With 4.36 — Multi-Scenario Fix Explorer (MSMFE)

The MSMFE finds the minimum single-element fix across multiple scenario types. Combined cluster coverage finds the ceiling from multiple element fixes within a single agent. These are **orthogonal measurements:**

- MSMFE answers: "What is the minimum change to fix the most scenario types?"
- Combined coverage answers: "If I fix all the problems in this specific agent, how high can I go?"

An agent might have a low MSMFE ranking (no single element fix will help much across scenarios) AND a high combined cluster coverage (fixing all elements together helps a lot). This is the signature of an agent where no single fix addresses the root cause — only holistic redesign does.

### With 4.60 — Search Budget as Player Resource

THOROUGH mode costs search budget. The combined coverage computation (at least in the on-demand or background-computation variants) also requires computation. If the combined coverage calculation is classified as a budget cost, players will face a decision: "Is this cluster worth spending 1 budget point to compute the combined coverage?"

This creates interesting scarcity: early-season players may not be able to afford combined coverage calculations on every cluster. They must decide which clusters to investigate. This makes the first glimpse of the combined coverage display meaningful — it's a resource they had to spend to get.

### With 4.68 — Coverage Percentage as Season Health

The season health trend shows top-candidate coverage percentage over time. The combined cluster coverage provides a forward-looking complement: it estimates what the top-candidate coverage *could* become if the cluster is addressed. Plotting the combined coverage ceiling on the same chart as the actual top-candidate coverage trend shows the player how far they are from the architectural ceiling:

```
Season health chart:
Week 1: top-fix coverage 71%, cluster ceiling 73% (close — apply element fix)
Week 2: top-fix coverage 65%, cluster ceiling 79% (gap growing — consider redesign)
Week 3: top-fix coverage 62%, cluster ceiling 88% (large gap — redesign is overdue)
```

The gap between the trend line (actual coverage) and the ceiling line (combined cluster coverage) is a visual representation of architectural debt. Widening gap = accumulating structural problems. Narrowing gap = successful incremental improvement. This composite view could be the most powerful display format for the number.

---

## Comparable Games / Media

### Hearthstone — Deck Simulation Tools

Hearthstone deck-building tools (e.g., HSReplay, Firestone) compute "win rate contribution" for individual cards in a deck. Advanced analyzers offer "what would happen if I swapped all of X?" — analogous to combined coverage for a cluster of cards in the same mana slot or role. The tools compute this prospectively (simulated win rate change) rather than from match history, but the decision-support function is identical: "is it worth reworking this whole role in my deck?"

### Factorio — Throughput Calculator Tools

External Factorio throughput calculators (Factorio.school, Kirk McDonald's calculator) compute "what is the bottleneck limiting my factory's throughput?" and show the combined effect of upgrading all modules of a specific type. Players use these tools to answer "if I upgraded all 12 speed modules, how much throughput gain would I get vs. just upgrading the single bottleneck inserter?" This is combined coverage for production chains.

### Excel — What-If Analysis / Data Tables

Excel's "What-If Analysis" tool computes the combined effect of changing multiple input cells simultaneously and shows the output change. Business users use this to answer "if I simultaneously improved margin, volume, and churn — what would be the combined impact vs. just improving one?" The combined cluster coverage display is this same "multiple input" analysis for game agent configs.

### Opus Magnum — Cost vs. Clean Animation

The Zachtronics histogram (cycles, cost, area) doesn't offer a "combined optimization score." Players have to decide personally whether to optimize one metric, all three, or some priority. The game doesn't surface "if you optimized all three, you'd be in the top 5%" — that number doesn't exist. Robot Uprising's combined coverage display is exactly the thing Zachtronics never provides: a synthesized score for "if you optimized all the elements of this one component, how good would you be?"

---

## Sensory Description

The combined coverage number in the cluster banner glows with a warm teal — not the urgent amber of the warning itself, but a secondary accent color that signals "this is a measurement, not an alarm." The number is the largest text in the banner: 22px, medium weight. Below it, in 13px gray: the delta line "(+9pp over top fix alone)," the lower number rendered in a slightly darker shade to ground it.

When the combined coverage loads via background computation, the placeholder is a short horizontal amber shimmer animation — a single bright pulse moving right to left across a gray bar, like a scanning indicator. When the number resolves and replaces the shimmer, it enters with a fast cross-dissolve (150ms) and a very slight upward translation (4px) — the number "arrives" from just below its final position. The motion is minimal but legible: something computed, something settled.

In the bar visualization format (Format D), the combined coverage bar renders in teal, extending past the amber top-fix bar. The extension — the "architectural upside" portion — is rendered in a lighter, more translucent teal to distinguish it from the already-achievable portion. The unreachable loss portion (the right end of the bar) is rendered in dim, cool gray — visually receding, not demanding attention.

The audio, when the combined coverage loads, is a short three-note ascending arpeggio in a major key — distinct from the cluster flag's two-tone warning chime. The flag chime says "pay attention." The coverage arpeggio says "here's the answer." The distinction is subtle but communicates: the number is an *answer*, not another problem.

---

## The TikTok Clip

The player's career analysis loads. The amber banner slides in: "RELAY-C multi-cluster — 3 elements — **71% combined (+18pp)**." The player freezes. Their voice: "Eighteen percent points. That's — wait." They hover over the banner. The tooltip expands: "4 more wins per 45 matches." They don't click anything for 3 seconds. Chat is typing. Then they click Redesign. The workbench opens, RELAY-C isolated. Coral header: "REDESIGN MODE." 90 seconds of rapid workbench editing. Deploy. Career analysis runs again. No cluster banner. Top-candidate coverage: 24%. Season health sparkline dips sharply downward. A small badge: "Architectural overhaul — coverage reduced 38pp." The player says: "That's what an 18pp delta looks like." The clip: the moment the number becomes a decision, and the decision pays off.

---

## Newly Discovered Aspects

From this exploration:

- **4.69m — Match-set scope label on combined coverage**: requiring the career analysis panel to display which match set the combined coverage was computed over (full career, filtered-by-opponent, filtered-by-scenario-type); prevents misinterpretation of adversarially-high coverage in narrow match sets
- **4.69n — Gap chart: actual coverage vs. cluster ceiling over time**: a dual-line chart on the season health dashboard showing the top-candidate coverage trend alongside the combined cluster coverage ceiling trend; the widening gap is a visual representation of accumulating architectural debt
- **4.69o — "4 extra wins" plain-language translation of coverage deltas**: first-time-encounter tooltip that translates percentage deltas into absolute match counts ("4 more wins from 45 analyzed matches"); gradually replaced by percentage-only display as player gains experience
- **4.69p — Combined coverage as a budget-cost computation**: classifying the combined coverage calculation (or only its on-demand variant) as a search budget expenditure; creates scarcity around the diagnostic and makes each use of the combined coverage intentional
- **4.69q — Prospective combined coverage**: computing the combined coverage not from match history but from a simulated future match set based on the player's current config and upcoming opponents; forward-looking vs. historical ceiling estimates; interacts with scenario fingerprinting (2.28)
- **4.69r — Combined coverage sensitivity to match window size**: how different match window sizes (20 matches vs. 200 matches) affect the combined coverage number; small windows have high variance (one unusual match can swing the number significantly); recommended minimum window size for reliable combined coverage estimates

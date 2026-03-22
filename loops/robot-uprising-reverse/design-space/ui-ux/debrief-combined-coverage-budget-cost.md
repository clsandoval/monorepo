# Combined Coverage as a Budget-Cost Computation

**Aspect:** 4.69p — Combined coverage as a budget-cost computation: classifying the combined coverage calculation (or only its on-demand variant) as a search budget expenditure (see 4.60); creates scarcity around the diagnostic and makes each use intentional; early-season players must choose which clusters to investigate; interacts with search budget resource design.

**Parent:** 4.69 — Agent multi-cluster detection in career analysis
**Siblings:** 4.69b — Combined coverage display; 4.69a — Multi-cluster threshold configurability; 4.69i — Combined coverage threshold gate
**Related:** 4.60 — Search budget as player resource; 4.36 — Multi-scenario minimum fix explorer (MSMFE); 4.61 — QUICK vs. THOROUGH explainer; 4.59 — Career minimum fix

---

## The Core Problem

The combined coverage calculation is currently free. When the career analysis detects a multi-cluster — RELAY-C appearing in 3 of the top 5 candidates — the player can click `[Calculate →]` or see the pre-computed combined coverage number (71%, +9pp over the top fix alone) at no cost. The number appears, the player reads it, the player decides whether to redesign or patch. No resource was spent. No trade-off was made. The information arrived for free.

Free information is not valued information. A player who sees "71% combined coverage, +9pp architectural upside" on every cluster detection begins to glaze over the number. It appears, it's always there, it costs nothing to produce, so it becomes background noise — a number on a panel alongside twelve other numbers. The player doesn't stop and weigh whether they *need* this number right now, because the question of needing never arises. Need presupposes scarcity. Without scarcity, there is no decision about whether to investigate. Without a decision, there is no learning.

The search budget system (4.60) already establishes that THOROUGH analysis is a limited resource: early-game players have 1-2 tokens per session, mid-game players have 3-5, and late-game players unlock unrestricted compute. QUICK is always free. MSMFE costs 3 tokens. Career minimum fix costs 5 tokens. Each of these costs reflects the computational depth and strategic value of the analysis.

Combined coverage sits in an awkward middle ground. It is not as computationally cheap as checking whether a cluster exists (that's a loop over 10 candidates — essentially free). It is not as expensive as a full career minimum fix (which analyzes all matches exhaustively). It requires re-running the attribution step for cluster members and computing a set union — roughly equivalent to a single THOROUGH analysis in computational weight. And its strategic value is high: it tells the player whether a full agent redesign is worth the effort, which can redirect 15-30 minutes of play time.

**The question this aspect asks:** Should the combined coverage calculation cost search budget tokens? And if so, how much, and under what conditions?

Making it cost tokens creates a nested decision: *"I have 3 tokens. I could spend 1 on THOROUGH for the current match, or I could spend 1 on combined coverage to learn whether RELAY-C's cluster is worth a full redesign."* The player who spends the token on combined coverage is investing in architectural understanding rather than match-level diagnosis. The player who skips it is betting that the top fix alone is good enough. Both are valid decisions. Neither was possible when combined coverage was free.

---

## The Design

### Cost Structure

The combined coverage calculation costs **1 search budget token** when triggered on-demand. This places it at the same tier as a single THOROUGH analysis, which is the correct analogy: both require re-running attribution computations against the match history, and both produce a single high-value diagnostic number.

The cost hierarchy within the search budget system becomes:

```
ANALYSIS TYPE                    TOKEN COST    TIME
──────────────────────────────────────────────────────
QUICK (single match)             0             ~4 sec
Combined coverage (cluster)      1             ~2 sec
THOROUGH (single match)          1             ~28 sec
MSMFE (multi-scenario)           3             ~2 min
Career minimum fix               5             ~3 min
```

Combined coverage is cheaper in *time* than THOROUGH (2 seconds vs. 28 seconds — the attribution sets are smaller because they only cover cluster members, not all candidates) but costs the same in *tokens*. This is intentional. The token cost reflects strategic value, not computation time. Knowing whether a cluster is worth a full redesign is as strategically significant as knowing the minimum fix for a single match.

### When the Cost Applies

The cost applies **only to the on-demand combined coverage calculation** — the `[Calculate →]` button that appears in the cluster flag when using Option 2 (lazy on-demand) from aspect 4.69b. The cluster detection itself remains free. The individual candidate coverages remain free. Only the combined coverage union computation — "what is the ceiling if all cluster elements are fixed together?" — costs a token.

This means the cluster flag still fires at no cost:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚠  RELAY-C multi-cluster detected                           │
│     3 elements flagged (context buffer, fallback, queue)     │
│     Combined coverage: [Calculate — 1 token →]               │
│     [View Agent Audit →]  [Skip — apply #1 fix]              │
└──────────────────────────────────────────────────────────────┘
```

The player sees the cluster. They know RELAY-C appears in 3 of 5 candidates. They know the individual coverages from the runner-up list (62%, 24%, 17%). What they don't know — without spending a token — is the combined coverage after overlap removal. They can estimate it mentally ("probably around 70-something percent, those definitely overlap") but they don't have the exact number.

The exact number matters when the player is making a high-stakes decision: redesign RELAY-C (30 minutes of work) versus apply the top fix (10 seconds of work). The 9pp gap between 62% and 71% is the ROI metric for that decision. Without it, the player is guessing. With it, they're deciding.

### The Early-Game Scarcity Dynamic

A player in early campaign has 1 THOROUGH token per session. If they spend it on combined coverage, they cannot run THOROUGH on the current match. This is the core trade-off the mechanic creates.

Consider the decision tree:

```
Player has 1 token. Cluster detected on RELAY-C.

Option A: Spend token on combined coverage
  → Learn the architectural ceiling (+9pp? +2pp? +15pp?)
  → Cannot run THOROUGH this session
  → Must rely on QUICK for match-level diagnosis

Option B: Spend token on THOROUGH for this match
  → Learn the minimum fix for this specific match
  → Cannot calculate combined coverage
  → Must estimate cluster value from individual numbers

Option C: Save the token
  → Use QUICK for everything
  → Retain optionality for a harder match later
  → No architectural insight, no deep match insight
```

This is a genuine three-way decision. Each path sacrifices something. The player who has been patching RELAY-C for three sessions in a row and suspects a structural problem should lean toward Option A — the combined coverage number will confirm or deny the suspicion. The player who is one fix away from passing a critical mission should lean toward Option B — the match-level THOROUGH result is more immediately actionable. The player who is confident in their QUICK results and wants to keep the token for the Gauntlet match should lean toward Option C.

None of these decisions existed when combined coverage was free.

### The Mid-Game and Late-Game Fade

As players unlock more tokens (3-5 per session by mid-game, unlimited by late-game), the combined coverage cost becomes progressively less meaningful. A player with 5 tokens can spend 1 on combined coverage, 1 on THOROUGH, and still have 3 for MSMFE — no real scarcity. A player with unlimited tokens treats combined coverage as effectively free.

This is by design. The budget mechanic is a teaching tool, not a permanent tax. The early-game scarcity forces the player to think about when architectural diagnosis matters versus when match-level diagnosis matters. Once the player has internalized that distinction, the scarcity can fade. The player who has unlimited tokens and still chooses to run combined coverage is doing so because they've learned *when* the number is useful — not because they have nothing else to spend on.

### Token Recovery and Cluster-Specific Dynamics

A variant worth noting: the search budget system could offer a **partial refund** when combined coverage reveals a low-value cluster. If the combined coverage result is within 2pp of the top fix alone (e.g., combined = 63% vs. top fix = 62%), the token is refunded with a message:

```
Combined coverage: 63% (+1pp over top fix alone)
The cluster overlap is nearly complete — individual fixes address
almost all the same matches. Full redesign not indicated.

⟳ Token refunded — low architectural signal.
```

This refund mechanic rewards the player for investigating while preventing the "I wasted my only token on a useless number" frustration. The refund threshold (2pp) is tight enough that meaningful clusters still cost the token, but near-zero-value clusters don't punish curiosity.

---

## Player Journeys

### Journey: Dara, 22, Mechanical Engineering Student — Week 2, Mission 7, Budget = 1

**Context:** Dara is 12 hours into the game. She has 1 THOROUGH token per session — she hasn't unlocked any research upgrades yet. She's stuck at 71% on Mission 7, "Signal Relay Gauntlet." She just ran her career analysis and the multi-cluster flag fired for the first time on SCOUT-B.

---

**Minute 0:00 — The Flag**

The career analysis result loads. Dara reads the top candidates:

```
#1  SCOUT-B beacon interval       52%  (18/35 matches)
#2  RELAY-A context depth          29%  (10/35 matches)
#3  SCOUT-B attention radius       21%  (7/35 matches)
#4  STRIKER-C hook timing          15%  (5/35 matches)
#5  SCOUT-B filter threshold       14%  (5/35 matches)
```

The amber banner slides down — 300ms ease-out, the familiar two-tone chime (rising minor third, D to F, soft volume).

```
⚠  SCOUT-B multi-cluster detected
   3 elements flagged (beacon, radius, filter)
   Combined coverage: [Calculate — 1 token →]
   [View Agent Audit →]  [Skip — apply #1 fix]
```

Dara reads it. She's seen the cluster flag mentioned in the codex but never encountered it live. She looks at the `[Calculate — 1 token →]` button. Then she looks at her compute budget display in the upper corner of the panel:

```
COMPUTE BUDGET  █░░░░  1 of 1 THOROUGH remaining
```

One token. The calculate button costs one token. She also wanted to run THOROUGH on this match — she's been relying on QUICK and getting inconsistent results.

---

**Minute 0:30 — The Deliberation**

She hovers over `[Calculate — 1 token →]`. A tooltip appears:

> "Computes the combined coverage if all 3 SCOUT-B elements were fixed together. Shows how much additional value a full agent overhaul provides beyond the top fix. Costs 1 compute token."

She hovers over the THOROUGH option in the mode dropdown for comparison. Tooltip:

> "Exhaustive search for the minimum fix — the smallest config change that flips the outcome. Costs 1 compute token."

Two different diagnostics. Same price. She can only afford one.

She thinks: "SCOUT-B keeps showing up. Three of the top five are SCOUT-B. If I apply the top fix again, will I be back here next session patching the next SCOUT-B element?" She's been in that loop before — patching RELAY-A's buffer three sessions in a row, each time fixing a different element of the same agent.

She clicks `[Calculate — 1 token →]`.

---

**Minute 0:32 — The Computation**

A brief animation runs — the `[Calculate — 1 token →]` button transforms into a small progress indicator, a thin teal line sweeping left to right across the button area. Two seconds. The compute budget display updates: the single filled square dims from bright white to empty grey. A faint descending tone — the "token spent" audio cue, a single soft note (C4, staccato, 200ms) — plays beneath the ambient.

The result resolves in place:

```
⚠  SCOUT-B multi-cluster detected
   3 elements — combined coverage: 68% (+16pp over top fix alone)
   Top fix alone: 52%  •  Combined ceiling: 68%
   [View Agent Audit →]  [Skip — apply #1 fix]
```

---

**Minute 0:40 — Reading the Number**

Dara stares at "+16pp over top fix alone." That's significant. She's at 71% pass rate. If SCOUT-B's cluster is responsible for 68% of her losses (across the analyzed matches), and the top fix alone only captures 52% of those losses, there are 16 percentage points of improvement stranded in the other two SCOUT-B elements.

The number changes her mental model. She was planning to apply the #1 fix and move on. Now she's thinking: "If I just fix the beacon interval, I'm leaving 16pp on the table. Those other two SCOUT-B elements are not independent problems — they're part of the same structural issue."

She clicks `[View Agent Audit →]`.

---

**Minute 1:15 — The Agent Audit Without THOROUGH**

The agent audit panel slides in from the right. She reads the cluster members, the root cause hypotheses ("role drift — SCOUT-B designed for short-range in Mission 2, now used for long-range since Mission 5"). She sees the three action buttons:

```
[Apply All Three Fixes →]  [Redesign SCOUT-B →]  [Dismiss]
```

She clicks `[Redesign SCOUT-B →]`.

She spends 20 minutes rebuilding SCOUT-B from scratch — larger attention radius, deeper filter stack, beacon interval calibrated for long-range. When she deploys, her pass rate jumps to 84%.

---

**Minute 22:00 — The Reflection**

The next session opens. Her compute budget is refreshed: 1 of 1 THOROUGH remaining. She thinks: "Last session I spent my token on combined coverage instead of THOROUGH, and it was the right call — the combined number told me SCOUT-B needed a full redesign, not just the top fix."

She opens the research tree. "Parallel Analysis I: +1 THOROUGH per session." She unlocks it. Now she has 2 tokens per session — enough to run both combined coverage and THOROUGH if a cluster fires again.

**UI Annotations:**
- The `[Calculate — 1 token →]` button uses the same token-cost formatting as the THOROUGH dropdown option: small token icon (filled square) followed by "1 token" in the same amber text used for search budget costs throughout the game
- When the token is spent, the compute budget display updates in real time — the filled square dims from white to grey over 400ms, synchronized with the progress animation in the button
- The "token spent" audio cue (C4 staccato) is the same sound used when spending a THOROUGH token from the mode dropdown — consistent audio vocabulary for "you just spent a compute resource"
- The result resolves with a teal cross-dissolve, replacing the button area; no additional modal or confirmation — the information appears exactly where the button was, preserving spatial continuity

---

### Journey: Jonas, 31, Data Scientist — Month 3, Budget = 4, Two Clusters in One Analysis

**Context:** Jonas has been playing for 10 weeks. He has "Parallel Analysis II" unlocked — 4 THOROUGH tokens per session. He's preparing for a ranked Gauntlet match. He runs career analysis on his last 60 matches and gets an unusual result: two separate clusters detected. RELAY-C appears in 3 candidates and STRIKER-B appears in 3 candidates.

---

**Minute 0:00 — Double Cluster**

The career analysis loads. Two amber banners appear, stacked:

```
⚠  RELAY-C multi-cluster detected (3 elements)
   Combined coverage: [Calculate — 1 token →]

⚠  STRIKER-B multi-cluster detected (3 elements)
   Combined coverage: [Calculate — 1 token →]
```

Jonas has 4 tokens. Calculating both clusters costs 2 tokens, leaving him 2 for match-level THOROUGH analysis. He could calculate one cluster and save the other token. He could skip both and run THOROUGH twice on specific matches. He could calculate both and run THOROUGH once afterward.

---

**Minute 0:15 — The Triage**

Jonas looks at the individual coverages in the runner-up list. RELAY-C's top element is at 41%. STRIKER-B's top element is at 38%. Close enough that neither cluster dominates — but the combined coverages might tell a different story. If RELAY-C's combined is 55% and STRIKER-B's combined is 42%, RELAY-C is the clear priority for redesign.

He calculates both. Two tokens spent. Budget: 2 of 4 remaining.

The results resolve:

```
⚠  RELAY-C — combined coverage: 58% (+17pp over top fix alone)
⚠  STRIKER-B — combined coverage: 44% (+6pp over top fix alone)
```

The numbers are asymmetric. RELAY-C's cluster has 17pp of stranded value — the three elements have significant non-overlapping coverage, meaning they're failing in different matches for different reasons, all traceable to the same agent. STRIKER-B's cluster has only 6pp of stranded value — the three elements mostly overlap, meaning one fix captures most of the benefit.

**The decision this creates:** Jonas should redesign RELAY-C (high stranded value, diverse failure modes) and apply only the top fix for STRIKER-B (low stranded value, overlapping failures). Without the combined coverage numbers, both clusters look equally severe — 3 elements each. The budget-gated calculation revealed the asymmetry.

---

**Minute 0:45 — Spending the Remaining Budget**

Jonas has 2 tokens left. He applies the STRIKER-B top fix (free — applying fixes never costs tokens), then enters RELAY-C redesign mode. After redesigning RELAY-C, he deploys and runs 5 more matches. He uses 1 THOROUGH token on a match where the redesigned RELAY-C still loses — to check whether his redesign addressed the right elements. The THOROUGH result confirms the redesign is correct but reveals a new secondary issue (COMMAND-A's routing table is slightly suboptimal).

He saves his last token. "One token left — I'll need it during the Gauntlet if something unexpected appears."

**UI Annotations:**
- Double cluster banners stack vertically with a 4px gap, each independently expandable; the stacking order matches the runner-up list priority (higher combined coverage on top, though order is unknown until calculated)
- After both are calculated, the banners reorder by combined coverage (RELAY-C moves to top if it has higher combined value) with a smooth 300ms slide animation — the numbers inform the visual hierarchy
- Budget display shows real-time depletion: 4 → 3 → 2 as each calculation triggers, with the dimming animation on each token

---

### Journey: Keiko, 40, UX Researcher — Week 1, Budget = 1, Chooses NOT to Calculate

**Context:** Keiko is 4 hours into the game. She has 1 THOROUGH token. She's on Mission 3, "Flanking Sweep," at 66% pass rate. A cluster fires on RELAY-A (3 elements). She has never used THOROUGH mode yet.

---

**Minute 0:00 — The Flag**

The amber banner appears. Keiko reads it. She sees `[Calculate — 1 token →]` and checks her budget: 1 of 1 remaining.

She doesn't know what "combined coverage" means in practice. The tooltip says "shows how much value a full overhaul provides" but she hasn't done an overhaul yet — she doesn't have a frame of reference for the number.

She thinks: "I should use my one token on something I understand."

---

**Minute 0:20 — The Alternative**

She dismisses the cluster banner with `[Skip — apply #1 fix]`. She applies the top RELAY-A fix. Then she opens the mode dropdown and selects THOROUGH. Spends her token on a full THOROUGH analysis of the current match.

The THOROUGH result finds a different fix than QUICK — SCOUT-B filter depth, not RELAY-A beacon interval. She applies it. Pass rate jumps from 66% to 73%.

She feels good about the token spend. She found something QUICK missed. The cluster — she'll think about it when she has more tokens and more experience with what "combined coverage" actually means.

---

**Minute 3:00 — The Deferred Learning**

Three sessions later, Keiko has unlocked Parallel Analysis I (2 tokens per session). She encounters another cluster — this time on SCOUT-B. She has 2 tokens. She runs THOROUGH first (1 token), gets the minimum fix. Then she clicks `[Calculate — 1 token →]` on the cluster.

The result: combined coverage 61%, +14pp over top fix alone.

Now the number means something to her. She's already applied the THOROUGH minimum fix — which addressed 47% of failures. The combined coverage says that *within the SCOUT-B cluster*, there's a 14pp ceiling beyond what she already captured. She clicks `[View Agent Audit →]` and, for the first time, reads the root cause hypotheses with real comprehension.

**What Keiko's journey demonstrates:** The budget cost doesn't just create scarcity — it creates *sequenced learning*. Keiko learned THOROUGH first (session 1), then learned combined coverage second (session 4). Each required a separate token investment, and each was learned at the right time. If combined coverage were free, she would have seen it in session 1 alongside THOROUGH — two new concepts at once, neither fully understood.

**UI Annotations:**
- The `[Skip — apply #1 fix]` button does not show a warning or "are you sure?" dialog — skipping is a valid choice and the UI should not discourage it
- When the player dismisses the cluster banner, it collapses smoothly (200ms) and the runner-up list shifts up to fill the space; no residual indicator that a cluster was detected-and-dismissed, to avoid guilt
- The next time a cluster fires (future session), the banner appears fresh — no "you dismissed this last time" language; each encounter is treated as independent

---

## Strengths and Weaknesses

### Strengths

**Creates a genuine resource decision.** The budget cost transforms combined coverage from a passive metric ("here's a number") into an active diagnostic choice ("should I investigate this cluster?"). Active choices are remembered and learned from. Passive metrics are scanned and forgotten.

**Paces architectural thinking.** Early-game players are still learning match-level diagnosis. Making architectural diagnosis (combined coverage, cluster analysis) cost the same tokens as match-level diagnosis (THOROUGH) means players cannot shortcut to architectural thinking before mastering match-level thinking. The progression is: QUICK (free, always available) → THOROUGH (1 token, learned first) → combined coverage (1 token, learned after THOROUGH is familiar) → MSMFE (3 tokens, learned last). The token cost creates an implicit curriculum.

**Rewards diagnostic intuition.** A player who can estimate combined coverage from the individual numbers ("three elements at 52%, 21%, 14% — probably around 65% combined after overlap, the beacon and filter probably fire in the same matches") doesn't need to spend the token. The player who develops this estimation skill saves tokens for other uses. The mechanic rewards the very skill it's trying to teach.

**Scales appropriately.** The 1-token cost is meaningful for early-game players (budget = 1-2) and irrelevant for late-game players (budget = unlimited). The mechanic does its teaching work in the window where it matters and then fades. No permanent tax on experienced players.

**Creates multi-cluster triage.** When two clusters appear simultaneously (Jonas's journey), the token cost forces the player to decide which cluster to investigate first — or whether to investigate both. This triage decision is itself a learning moment: it teaches the player to prioritize by observable signals (individual coverage levels, agent age, failure distribution) before spending compute.

### Weaknesses

**May discourage cluster investigation entirely.** A player with 1 token who always spends it on THOROUGH will never learn about combined coverage. If the player never calculates it, they never learn the difference between "patching symptoms" and "identifying architectural scope." The mechanic intends to create a choice, but it might create avoidance instead — especially for risk-averse players who stick with the tool they know.

**The 2-second computation feels overpriced at 1 token.** THOROUGH costs 1 token and takes 28 seconds. Combined coverage costs 1 token and takes 2 seconds. A player who experiences both may feel the combined coverage token is a bad deal — "I paid the same price for something that took 1/14th the time." The token cost represents strategic value, not compute time, but this is a subtle framing that some players won't internalize.

**Estimation without the exact number may be sufficient.** If a player can look at individual coverages (52%, 21%, 14%) and correctly estimate that the combined coverage is roughly 65%, the calculated number (68%) adds only 3pp of precision. Is 3pp of precision worth a token? For most decisions, no. The player who decides to redesign based on an estimate of 65% would have made the same decision at 68%. The mechanic might cost tokens for information that doesn't change decisions.

**Partial-refund variant adds complexity.** The proposed refund for low-value clusters (within 2pp of top fix) addresses the "wasted token" frustration but introduces a conditional cost that is harder to reason about. "This diagnostic costs 1 token unless the result is uninteresting, in which case you get the token back." Players may learn to game this: "I'll calculate because I might get a refund." The refund undermines the scarcity the mechanic was designed to create.

---

## Interaction Effects

### With 4.60 — Search Budget as Player Resource

The combined coverage cost slots directly into the search budget cost hierarchy. The key interaction is **token competition**: combined coverage competes with THOROUGH and MSMFE for the same limited pool. This competition is the entire point — it forces the player to choose between diagnostic modes rather than running all of them on every analysis.

The interaction with the search budget's recommended design (Model A + Model D hybrid, session budget with permanent unlocks) creates a natural progression curve. At budget = 1, the player chooses between THOROUGH and combined coverage — this teaches the distinction between match-level and architectural diagnosis. At budget = 3, the player can afford both but must still prioritize MSMFE — this teaches the distinction between single-match and multi-scenario diagnosis. At budget = unlimited, all diagnostics are free and the player has internalized when each is appropriate.

A potential friction: the 4.60 recommended design was calibrated without combined coverage as a cost item. Adding a new 1-token expense means the early-game budget (1 token) now has three candidates for spending (THOROUGH, combined coverage, and saving), which may stretch the budget too thin. The calibration should be tested: does the player feel genuinely constrained at 1 token with three potential uses, or just frustrated?

### With 4.69b — Combined Coverage Display

Aspect 4.69b explores four display options: eager pre-computation (always available), lazy on-demand (player-triggered), background computation (async), and approximation-first. The budget cost mechanic is **only compatible with Option 2 (lazy on-demand)**. If combined coverage is pre-computed or background-computed, the number appears automatically — there is no moment where the player can choose to spend a token, because the computation happens without their input.

This means adopting 4.69p locks the 4.69b design into Option 2. That is a significant constraint. Option 2's weaknesses (extra click, invisible to unaware players, feels archaic) become permanent costs of the budget mechanic. The trade-off is explicit: budget-gated scarcity buys teaching value at the cost of discoverability.

An alternative hybrid: the combined coverage slot in the cluster banner shows a low-precision estimate for free (the independence-assumption approximation from 4.69b Option 4, showing "~68%") and the exact computation costs 1 token. This preserves some of the teaching value ("the exact number costs something") while giving all players at least a rough sense of the combined value. The risk is that the rough estimate is usually close enough, making the exact computation feel wasteful.

### With 4.69i — Combined Coverage Threshold Gate

If the combined coverage score is used as a gate — "combined coverage must exceed X% before the [Redesign] button unlocks" — and the combined coverage calculation costs a token, then the player is paying to unlock a gate they might not pass. A player who spends 1 token and gets a combined coverage of 55% (below the gate threshold) has spent a token on a number that doesn't open any new action.

This interaction requires careful design. The gate threshold should be visible *before* the player calculates: "Redesign mode requires combined coverage above 60%. Calculate to check." This way the player knows the stakes before spending. Alternatively, the gate could use the free approximate value, and the exact calculation could be reserved for when the player is near the threshold and needs precision.

### With 4.36 — Multi-Scenario Minimum Fix Explorer (MSMFE)

The MSMFE costs 3 tokens and analyzes fixes across multiple scenarios. Combined coverage costs 1 token and analyzes the cluster's aggregate impact across the career analysis window. These are complementary diagnostics: MSMFE asks "what single fix helps the most scenarios?" while combined coverage asks "what is the ceiling for fixing an entire agent?"

A player with 4 tokens might run combined coverage (1 token) to determine whether RELAY-C's cluster is worth investigating, then run MSMFE (3 tokens) focused on RELAY-C's elements to see which specific scenarios the cluster fails in. This 1+3 = 4-token spend produces a complete diagnostic picture: the scope of the architectural problem (combined coverage) and the specific scenario distribution of failures (MSMFE). The budget forces this to be a planned expenditure, not a casual "run everything and see what sticks."

---

## Comparable Games / Media

### Darkest Dungeon — Scouting as a Consumed Resource

In Darkest Dungeon, scouting reveals upcoming rooms and corridors before the player enters them. Scouting is not free — it consumes provisions or requires specific hero abilities. The player must decide whether to scout the next corridor (information) or save the provision for camping (healing). This is the same structure as combined coverage: information about the future state (architectural ceiling) competes with a direct tactical benefit (THOROUGH match-level fix) for the same limited resource.

The lesson from Darkest Dungeon: information resources work best when the alternative use is *concrete and tactical*. "Spend 1 provision to scout" versus "save 1 provision to camp and heal" — both are tangible. "Spend 1 token on combined coverage" versus "spend 1 token on THOROUGH" has the same tangibility. The player can weigh architectural insight against tactical precision.

### XCOM 2 — Scanning as Opportunity Cost

In XCOM 2's strategy layer, the Avenger can scan one site at a time. Scanning a supply drop gives resources. Scanning a rumored council mission gives information. Scanning an alien facility gives strategic advantage. The player can only scan one at a time, and scanning takes real in-game days. The choice of *what to learn about* is a resource decision.

Combined coverage as a budget cost creates the same dynamic at a smaller scale: the choice of *which diagnostic to run* is itself a strategic decision, not just a UX convenience.

### Magic: The Gathering — Scrying vs. Card Advantage

In MTG, some cards let you "scry" — look at the top cards of your library and decide their order. Scrying costs mana (or a card slot). You're paying a resource for *information about what's coming*, not for a direct game advantage. Combined coverage is a scry: you're paying a token to see the architectural ceiling before committing to a redesign. The information might change your plan, or it might confirm what you already suspected. Either way, you paid for the knowledge.

### Oxygen Not Included — Research Queue Prioritization

In Oxygen Not Included, the research queue competes for duplicant labor. Researching advanced agriculture means those duplicants aren't digging or building. The player must prioritize: learn something new (research) or execute on existing knowledge (build). Combined coverage's token cost creates the same trade-off: learn something about your architecture (combined coverage) or execute a diagnostic you already know is useful (THOROUGH).

---

## Sensory Description

### The Calculate Button

The `[Calculate — 1 token →]` button sits in the amber cluster flag banner. Its visual treatment differs from ordinary buttons: it has a thin amber border (2px, #FFB347), a slightly darker amber fill (#FFA52C at 15% opacity), and a small filled-square token icon to the left of the text. The token icon matches the compute budget display's visual language — a small 8x8px white square, identical to the filled squares in the budget bar. The arrow glyph (→) pulses gently — a 2-second sine wave between 60% and 100% opacity — to draw attention without urgency.

When the player hovers, the button fill deepens to 30% opacity amber and the tooltip appears above: a dark tooltip card (charcoal background, white text, 12px) with the description of what combined coverage reveals and what it costs. The tooltip includes the current budget count: "You have 1 token remaining this session."

### The Token Deduction

When the player clicks `[Calculate →]`, three things happen simultaneously over 400ms:

1. **The button transforms.** The text and icon fade out (200ms) and a thin teal progress line appears where the button text was — a horizontal line that sweeps from left to right across the button width over 2 seconds. The line is 2px tall, teal (#4ECDC4), with a soft glow (4px blur, same teal at 40% opacity). The sweep is not linear — it uses an ease-in-out curve, slowing slightly at the end to signal "computation completing."

2. **The budget display responds.** The rightmost filled square in the compute budget bar dims from bright white to hollow grey over 400ms. A faint ring animation — a small circle expanding outward from the token square and fading — marks the moment of spend. The ring is white, expands to 16px diameter, fades to 0% opacity.

3. **The audio cue plays.** The "token spent" sound: a single staccato note, C4 on a soft mallet instrument (marimba or similar), 200ms duration, low volume (40% of UI sound level). This is the same sound used when spending a THOROUGH token from the mode dropdown — consistent audio vocabulary across all search budget expenditures.

### The Result Arrival

After 2 seconds, the teal progress line completes. The line morphs into the result text via a cross-dissolve: the line fades down (200ms) while the result text fades up (200ms) in the same horizontal space. The result text reads:

```
Combined coverage: 71% (+9pp over top fix alone)
```

The "71%" is rendered in larger text (16px vs. the banner's 13px body text), teal color (#4ECDC4), to signal "this is the number you paid for." The "+9pp" is in parenthetical amber text — the delta is visually secondary to the absolute number but still prominent.

A subtle audio confirmation plays simultaneously: a two-note ascending chime (C4 to E4, soft bell, 300ms total duration). This differs from the cluster-detection chime (D to F, minor third) — the ascending major third signals "result delivered, information gained" versus the minor third's "diagnostic warning."

### The Empty-Budget State After Calculation

After the token is spent, if the budget is now 0, the compute budget display enters its depleted state: all squares are hollow grey, and a small text label appears below the bar: "Resets next session." The label is dim (60% opacity white text, 10px), unobtrusive but visible. No alarm, no modal, no red warning — just the quiet fact that the budget is empty.

If the player hovers over the depleted budget display, a tooltip shows: "All compute tokens spent this session. QUICK analysis remains available. Budget resets at the start of your next session." The tooltip includes a subtle link: "Unlock more capacity →" pointing to the research tree.

The cluster banner, now showing the computed result, remains visible until dismissed. The `[View Agent Audit →]` button glows slightly brighter than before the calculation — a very subtle luminance increase (from 90% to 100% button brightness) suggesting that the audit is now more useful because the player has the combined coverage context. This is a micro-affordance: the button doesn't change shape or color, just becomes fractionally more visually present.

### The Ambient Texture Shift

When a token is spent on combined coverage (or any diagnostic), the ambient background audio in the debrief panel shifts very subtly. A low frequency pad — a held drone at approximately 80Hz, barely audible — fades in over 3 seconds and persists for 15 seconds before fading out. The pad is not melodic; it is a textural change that signals "you are now in a deeper diagnostic state." The player will not consciously notice it. Over many sessions, they will associate the feeling of "I just spent compute on something important" with this low-frequency warmth. It is the audio equivalent of the workshop getting quieter when you pick up the precision tool.

---

## Newly Discovered Aspects

From this exploration, the following new aspects should be added to the frontier:

- **4.69q** — Partial refund for low-value cluster calculations: when combined coverage is within 2pp of the top fix alone, the spent token is refunded; prevents "wasted token" frustration for near-total-overlap clusters; risk of undermining scarcity; interaction with player expectations around cost predictability
- **4.69r** — Free approximate + paid exact hybrid: the cluster banner shows a free independence-assumption estimate (~68%) and the exact union computation (68% actual) costs 1 token; teaches the player about correlation and overlap; risk that the approximate is usually sufficient, making the exact computation feel wasteful
- **4.69s** — Combined coverage as a prerequisite gate for MSMFE: before running MSMFE on a cluster (3 tokens), the player must first calculate combined coverage (1 token) to confirm the cluster's architectural scope exceeds a threshold; creates a mandatory 1+3 token pipeline; risk of over-constraining the diagnostic workflow
- **4.60g** — Budget cost rebalancing with combined coverage included: recalibrating the early-game token allowance (currently 1 per session) now that there is a third 1-token diagnostic competing for the budget; should the starting budget be 2 instead of 1? Should combined coverage cost 0.5 tokens (introducing fractional costs)?
- **4.69t** — Cluster calculation history: tracking which clusters the player has calculated combined coverage for and which they skipped; the skip pattern reveals which agent types the player considers unimportant; this data could feed into adaptive tutorial nudges ("You've skipped 3 RELAY cluster calculations — RELAY agents are often the source of structural debt in mid-campaign")

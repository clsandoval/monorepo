# Search Budget as a Player Resource

**Aspect:** 4.60 — Search budget as a player resource: instead of QUICK/THOROUGH as a binary toggle, the player has a "compute budget" resource that regenerates between sessions; exhaustive search costs more budget; encourages strategic decisions about when to use thorough analysis; interaction with early-game scarcity design.

**Parent:** 4.40 — "First viable fix" vs. "minimum fix" toggle
**Siblings:** 4.58 — Pre-ranking transparency panel; 4.59 — Career minimum fix; 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result
**Related:** 1.04e — 100-test-case robustness pattern; 4.36 — Multi-scenario fix explorer; 4.20 — Counterfactual simulation; 4.37 — Fork-and-deploy; 5.19 — Pass-rate plateau problem; 8.09 — Diagnostic layer as teaching mechanic

---

## The Core Concept

The current Fix Explorer design treats QUICK mode and THOROUGH mode as a binary toggle — always available, always free. Run QUICK, wait 4 seconds, get a hypothesis. Switch to THOROUGH, wait 28 seconds, get the minimum. No cost. No consequence. No decision.

**The question this aspect asks:** What if THOROUGH mode isn't always available?

Making exhaustive search a limited resource transforms a UI toggle into a **strategic decision**. The player who has three THOROUGH searches available before a Gauntlet match must decide: burn one now on this mid-campaign mission where I'm already at 74% pass rate? Or save it for the decisive match where one extra data point might flip the outcome?

This is the difference between "I could run THOROUGH but QUICK is faster" and "Should I spend THOROUGH here?" The first is a convenience trade-off. The second is a game decision.

**The tension at the heart of this option:**

1. **Scarcity creates stakes, stakes create engagement** — every strategic game knows this. Magic: The Gathering mana, Slay the Spire gold, Factorio circuit network energy. Limiting a powerful tool makes using it meaningful.

2. **Artificial scarcity creates frustration** — mobile games built entire hate-cultures around energy bars. Players despise being told "you can't play now, wait 4 hours." The difference between good resource design and bad energy-bar design is: does the scarcity generate a real decision, or just delay?

The design space lives in this tension. The goal is resource designs that create genuine strategic decisions without making the player feel controlled by artificial pacing.

---

## The Full Design Space

### Model A: The Session Budget — Fixed Weekly Allowance

**How it works:** Each week of in-game time (or each "chapter"), the player receives a fixed allocation of THOROUGH tokens. QUICK mode is always free, always unlimited. THOROUGH costs 1 token per use. The MSMFE (multi-scenario) costs 3 tokens. Career minimum fix costs 5 tokens.

```
┌─────────────────────────────────────────────────┐
│ DIAGNOSTIC COMPUTE                              │
│ ██████████░░░░░░░░░░  7 / 12 remaining          │
│ Resets: next chapter (3 sessions away)          │
└─────────────────────────────────────────────────┘
```

The token display lives in the Fix Explorer header — always visible, never hidden. The player sees their remaining budget before running every analysis.

**The regeneration curve:** Simple — chapter boundary resets to max. No regen between sessions within a chapter.

**Strengths:**
- Clean math, legible resource — "I have 7 of 12 tokens left"
- Resets naturally with campaign pacing — spending heavily in one mission doesn't haunt the player forever
- The MSMFE and career minimum fix feel expensive relative to single-match THOROUGH — creating a clear cost hierarchy

**Weaknesses:**
- Weekly/chapter reset is arbitrary — why does compute regenerate at chapter boundaries? It breaks immersion
- Player who accidentally burns all 12 tokens early in a chapter is locked to QUICK for the rest — frustration without meaningful recovery
- Endgame players with no more chapters feel no scarcity — the mechanic dissolves when the tutorial structure ends

---

### Model B: The Earned Budget — Performance Generates Compute

**How it works:** The player earns compute credits by performing well. Each match won generates +2 credits. Each mission completed at 80%+ pass rate generates +5 credits. Losing generates 0 credits (or -1 in a harsh variant). Credits decay slightly between sessions (3% per day, rounded down) — a "use it or lose some" pressure.

QUICK: 0 credits. THOROUGH: 15 credits. MSMFE: 40 credits. Career minimum: 80 credits.

```
┌─────────────────────────────────────────────────┐
│ COMPUTE CREDITS                    ⚡ 127        │
│ +2/match win · +5/mission 80%+                  │
│ Slow decay between sessions                     │
└─────────────────────────────────────────────────┘
```

**The loop:** Winning generates compute. Compute spent on THOROUGH generates better fixes. Better fixes generate more wins. The diagnostic loop is self-funding for a well-performing player — and self-constraining for a player who's stuck.

A player at 45% pass rate is losing compute faster than they earn it. They're forced to rely on QUICK mode — developing their own diagnostic intuition — until their performance improves enough to fund exhaustive search.

**Strengths:**
- Thematic coherence — in-universe, the AI uprising has limited computational resources; better tactical performance frees up more capacity
- Creates a positive feedback loop for strong players (earn → spend → earn more) and a difficulty pressure for weak players (lose → no compute → must learn manually)
- Decay pressure encourages using credits rather than hoarding them — anti-hoard design

**Weaknesses:**
- Positive feedback loops can create a runaway rich-get-richer dynamic — the strongest players never feel the scarcity that makes the resource interesting
- Performance-gated diagnostic tools can feel punishing at exactly the moment the player needs them most (stuck at 45% pass rate, can't afford THOROUGH to figure out why)
- Decay between sessions creates real-time pressure, which many players dislike — "I have to log in before Tuesday or I lose credits" is mobile-energy-bar territory

**Critical design question:** Should compute be scarce when players are failing, or when they're succeeding? This model makes it scarce when failing — which may be counterproductive.

---

### Model C: The Sliding Scale — Depth as Continuous Dial

**How it works:** Instead of QUICK (binary) and THOROUGH (binary), the player has a **search depth dial** from 1 to 10. The dial controls how exhaustively the explorer searches the candidate space.

```
SEARCH DEPTH
1 ──────────●────────── 10
  Quick               Thorough

Depth 1: 0.3 sec  · top-1 candidate  · 0 credits/use
Depth 3: 2.1 sec  · top-5 candidates · 3 credits/use
Depth 5: 8.4 sec  · top-20 candidates · 8 credits/use
Depth 8: 32 sec   · top-80 candidates · 18 credits/use
Depth 10: 89 sec  · all candidates   · 30 credits/use
```

The dial is a horizontal slider in the Fix Explorer UI. The player can see the estimated time and credit cost update in real-time as they drag. "I'll use depth 5 — I have 40 credits, that's 8 credits, and 8 seconds feels worth it for this mission."

The MSMFE at depth 10 becomes the "maximum exhaustive multi-scenario" option — expensive in time and credits, but complete.

**Strengths:**
- The intermediate depths are new gameplay options that didn't exist in the binary model — "depth 3 gives me the top-5 candidates for almost no cost; that's useful even if I can't afford depth 10"
- Players can calibrate to their situation: depth 5 for early diagnosis, depth 10 for the final hard mission
- The time cost is itself a resource — a depth 10 run on a 100-scenario MSMFE might take 8 minutes, which is a real wait

**Weaknesses:**
- Continuous dials are harder to reason about than discrete options — "is depth 5 meaningfully different from depth 6?"
- The candidate set at depth 5 (top-20) is harder to explain to the player than "this is the minimum fix" (which requires depth 10)
- Time cost + credit cost = two resources to manage simultaneously; this may feel unnecessarily complex

**Mitigation:** Offer named breakpoints ("SURFACE" / "THOROUGH" / "EXHAUSTIVE") that the dial snaps to, with custom positions available. Players use the breakpoints by default; advanced players drag to intermediate values.

---

### Model D: The Research Tree — Unlock Higher Capacity

**How it works:** Compute capacity is not a consumed resource but a capacity limit. THOROUGH uses a slot in the "active analysis capacity." In early game, capacity is 1 — only one THOROUGH run per mission debrief. Upgrading the research tree increases capacity.

```
ANALYSIS CAPACITY:  ██░░░░  2 / 6 slots unlocked

Research Node: "Parallel Analysis I"
  → Unlock: +1 THOROUGH slot per debrief
  → Cost: 3 research points
  → Prerequisite: THOROUGH mode used 10+ times
```

Capacity doesn't regenerate — it's a permanent unlock. Early game: 1 THOROUGH slot per debrief session. Mid-game: 3 slots. Late game: unlimited. Once a player reaches full capacity, the resource mechanic fades entirely — late-game players are not constrained by it, only early-game players are.

**Strengths:**
- The scarcity is designed as a tutorial mechanic, not a permanent constraint — it fades when the player doesn't need it anymore
- Research unlocks give the player agency: "I can unlock more THOROUGH capacity, or I can unlock a different research node"
- Players who engage heavily with diagnostic tools are rewarded with more diagnostic capacity — the mechanic rewards the behavior it's teaching

**Weaknesses:**
- If capacity is permanent and always-increasing, the budget mechanic is really just "THOROUGH mode is temporarily locked" — not a genuine ongoing resource decision
- Research trees introduce progression complexity; players who ignore the diagnostic research branch are permanently constrained to early-game capacity
- The "unlock then forget" pattern can feel like a tutorial mechanic with no lasting strategic texture

---

### Model E: The Risk-Reward Budget — Compute Gambles

**How it works:** QUICK mode is free. THOROUGH mode costs nothing if it confirms the QUICK result. THOROUGH mode costs 10 credits if it finds a different, smaller fix than QUICK. MSMFE costs 25 credits regardless.

The logic: spending compute to confirm what QUICK already found is wasteful. Spending compute to discover the QUICK result was wrong is valuable and therefore should be "priced" to reflect the cognitive work the system did.

```
THOROUGH RESULT:
◆ MINIMUM FIX: RELAY-C — context buffer +1 slot  [pass +12%]

This differs from the QUICK result (SCOUT-B).
Cost: 10 compute credits (THOROUGH found a smaller fix)

QUICK RESULT:
◆ FIRST VIABLE: SCOUT-B — filter threshold –2  [pass +8%]

Confirming: 0 compute credits
```

**Strengths:**
- The cost is calibrated to actual value — you pay more when THOROUGH does real work
- Creates an interesting decision: do I trust QUICK enough to skip THOROUGH? If I run THOROUGH and it finds the same thing, I lose nothing. If it finds something better, I pay for the improvement.
- Teaches the player to think about the quality of their QUICK hypothesis before spending compute

**Weaknesses:**
- Payment on confirmation rather than usage is counterintuitive — the player doesn't know the cost before running the analysis
- Creates perverse incentive to *not* use THOROUGH when QUICK results seem shaky (the player fears paying)
- If QUICK and THOROUGH usually agree, the player rarely pays — the mechanic never activates

---

### Model F: The Asymmetric Recovery Budget — Spend Down, Earn Back Slowly

**How it works:** The player starts each campaign with a large budget (100 credits). QUICK costs 1. THOROUGH costs 10. MSMFE costs 30. Budget does not reset between chapters — it accumulates or depletes across the full campaign.

Recovery: the player earns 3 credits per match played (win or lose). 5 credits per session completed. 15 credits per mission completed. Credits are earned slowly and spent quickly — the player is always managing a slow-recovery resource against sudden expenditure decisions.

**The intended feel:** Like managing fuel in a long road trip. You don't refuel every gas station. You watch the gauge and decide when it's worth stopping.

**Strengths:**
- Long arc resource decisions — "I've been conservative all campaign, now I have 220 credits and can spend heavily on Gauntlet prep"
- Win-or-lose earn rate means players who are stuck (losing repeatedly) still accumulate credits over time — no punishing runaway
- The ability to "bank" credits gives patient players an advantage, which is a reasonable reward for conservative diagnostic practice

**Weaknesses:**
- If players can accumulate hundreds of credits, the resource stops being a constraint — the budget becomes a scorekeeping system rather than a real decision
- Long arc requires players to think campaign-scale, which is a significant cognitive load
- A new campaign always starts at 100 — the early-game scarcity is exactly as designed, but the specific number (100) requires careful calibration

---

## Recommended Design: Model A + Model D Hybrid — "Starter Budget + Permanent Unlocks"

The strongest design combines two mechanics:

1. **Session budget (Model A):** Each session begins with a budget of N THOROUGH uses. This budget resets every session. N starts at 1 in early game, increases to 3 at mid-game, to unlimited in late game.

2. **Permanent unlocks increase N (Model D):** Research nodes permanently raise the per-session budget. Unlocking "Parallel Analysis I" raises N from 1 to 2. Unlocking "Parallel Analysis III" raises N to 5. Unlocking "Unrestricted Compute" removes the cap entirely.

The session budget creates the scarcity mechanic without cross-session anxiety. The unlock progression ensures the mechanic fades before it becomes annoying. Players who invest in diagnostic research early unlock unlimited THOROUGH relatively quickly — rewarding engagement without punishing players who don't know about the research tree.

```
COMPUTE BUDGET   [Chapter 2, Session 4 of 6]
█████░░░░░  2 of 4 THOROUGH remaining this session

[Unlock +1 per session for 5 research points →]
```

---

## Player Journeys

### Journey: Maya, 19, art student, Week 1, Mission 4

**Context:** Maya is 6 hours into the game. She's in early-campaign, budget is 1 THOROUGH per session. She's never used THOROUGH mode. The budget display has been visible but she hasn't processed what it means. She's currently stuck at 62% pass rate on Mission 4 — "Distributed Sweep."

---

**Minute 0:00 — The First Look**

The debrief opens after a 62% loss. Maya sees the familiar Fix Explorer panel. She runs QUICK — 4 seconds, result appears: "FIRST VIABLE FIX: SCOUT-A — beacon interval –3 ticks."

She applies it. Pass rate: 65%. Marginal improvement.

She runs QUICK again. Same result. She applies it again. Pass rate: 63%. Worse.

She stares at the panel. For the first time, she notices the compute display above the Run Analysis button:

```
COMPUTE BUDGET  █░░░░  1 of 1 THOROUGH remaining this session
```

She hovers over it. A tooltip appears:
> "THOROUGH mode searches more deeply — it finds the minimum fix, not just the first viable fix. Costs 1 compute token per session. Resets next session."

---

**Minute 1:00 — The Decision**

Maya looks at the QUICK result card. Beacon interval –3 ticks. She's applied it twice and things got slightly worse then better then worse. The QUICK result feels unreliable.

She has 1 THOROUGH token. She looks at the Run Analysis button. There's a small dropdown: [QUICK ▾]. She clicks it. A small menu appears:

```
QUICK    (0 tokens · ~4 sec)   ✓ unlimited
THOROUGH (1 token · ~28 sec)   ⚡ 1 remaining this session
MSMFE    (3 tokens · ~2 min)   ✗ requires 3 tokens
```

She has exactly 1 THOROUGH token. MSMFE requires 3 — greyed out.

She selects THOROUGH. A small confirmation: "Spend 1 compute token? You have 1 remaining this session." A [Confirm] and [Cancel] button.

Her cursor hovers over Confirm for two seconds. Then she clicks.

---

**Minute 1:28 — The Wait**

28-second progress bar. The bar is not just a fill — it shows a brief animation of the search tree expanding: a small branching diagram where new candidates appear and disappear as the exhaustive search runs. It looks like a root system growing through soil. Each branch represents a candidate being evaluated.

Maya watches the branching animation. She doesn't fully understand what she's seeing, but it's clearly doing *more* than the QUICK search.

---

**Minute 1:56 — The Different Result**

The result appears:

```
MINIMUM FIX: RELAY-C — context buffer +1 slot
Expected pass rate: 74% (+12%)

Differs from QUICK result (SCOUT-A: beacon interval –3 ticks)
▸ See why results differ
```

Maya blinks. This is a different fix. The game found something the QUICK search didn't. She applies it.

74% pass rate. First time she's cracked 70% on this mission.

---

**Minute 3:00 — The Budget is Empty**

She checks the compute display:

```
COMPUTE BUDGET  ░░░░░  0 of 1 THOROUGH remaining this session
Session resets: next session
```

She wants to run THOROUGH again — see if there's another fix. But she can't. THOROUGH is greyed out in the dropdown. QUICK is still available.

The scarcity just became real. She used her token. She got a good result. She has to live with that choice until the next session.

She's not angry — she got a better result. But she's thinking: "I want more of these tokens."

She opens the research tree for the first time. She finds "Parallel Analysis I: +1 THOROUGH per session." Cost: 3 research points. She has 5. She unlocks it.

Next session opens: "COMPUTE BUDGET: 2 of 2 THOROUGH remaining this session."

---

**Minute 5:00 — The Behavior Change**

Over the next three sessions, Maya's pattern shifts:

Old pattern: Run QUICK repeatedly. Apply result. Check if better. Repeat.
New pattern: Run QUICK first. Evaluate the result. Decide if it's worth a THOROUGH token.

She's not always right about when to spend. She wastes a THOROUGH token on a mission where QUICK would have found the same answer. But she's developing a prior: "If QUICK found something last session and it made things worse, spend THOROUGH. If QUICK matches what I'd expect, trust it."

This is the diagnostic reasoning the game is trying to teach. The scarcity prompted it. QUICK-as-free-and-unlimited didn't prompt it.

**UI Annotations:**
- Compute budget display: horizontal token bar above Run Analysis button, always visible; each token is a small square, filled squares are bright white, empty squares are dim grey with an hourglass icon
- Dropdown for search mode: appears on clicking the mode label; each option shows token cost, estimated time, and availability; greyed-out options have a tooltip explaining requirement
- Confirmation dialog: small, non-modal, appears inline below the dropdown; 2-second auto-confirm if the player doesn't cancel (prevents accidental spends but also doesn't require deliberate confirmation every time)
- Branching animation during THOROUGH: visible only when player is watching the wait screen; a 28-second animation of expanding search tree; soft blue-green color, branching out from a central node
- Budget-empty state: the THOROUGH option in the dropdown has a red-amber tint when at 0; tooltip says "THOROUGH depleted this session — resets next session"; no pop-up, no alarm
- Research tree unlock prompt: appears at session end when budget hits 0 for the first time; "Unlock more THOROUGH capacity?" with [Open Research] button; soft pulse, not intrusive

---

### Journey: Tomás, 34, backend engineer, Month 2, Mission 12 (Gauntlet prep)

**Context:** Tomás has been playing seriously for 8 weeks. He's unlocked "Parallel Analysis III" — he has 5 THOROUGH tokens per session. He's preparing for his first ranked Gauntlet match. He's running Mission 12 — "Cascading Failure" — as pre-match practice. His pass rate is 81% and he's trying to identify the last architectural weakness before the match.

---

**Minute 0:00 — The Budget as Ration**

Tomás opens the debrief after a 81%/100 run. The compute display:

```
COMPUTE BUDGET  █████  5 of 5 THOROUGH remaining this session
```

He has a full budget. He's learned not to just spend tokens immediately. He runs QUICK first — always. The pre-ranking transparency panel is open (he opened it weeks ago and it stays open). The QUICK result:

"FIRST VIABLE FIX: HOOK-2 (relay hook) — trigger threshold +2 ticks."

He reads the pre-ranking drawer. Pivot-active: 0.88. Recency: 0.31 (he hasn't changed HOOK-2 recently). Volatility: 0.77.

The high pivot-activity and high volatility with low recency pattern. He's seen this before — it often means the element was reacting to a problem elsewhere, not causing it. The pre-ranking may be surfacing a symptom.

He decides this is worth a THOROUGH token. He spends it.

---

**Minute 0:34 — The Confirmation**

THOROUGH result: same fix — HOOK-2, trigger threshold +2 ticks.

He reads the "Why results agree" section (a new section that appears when QUICK and THOROUGH find the same candidate):

```
QUICK and THOROUGH agree: HOOK-2 is the minimum fix.
This is uncommon when HOOK-2 has low recency — suggests HOOK-2's
threshold is a structural constraint, not a recent change error.
The pre-ranking caught it despite the low recency signal.
```

He applies it. Pass rate: 87%.

---

**Minute 2:00 — The Second Token**

New pass rate is 87%. He still has 4 tokens. He wants to know: is there another fix layered under HOOK-2? A structural issue that HOOK-2's adjustment was masking?

He runs THOROUGH again. Different result: "MINIMUM FIX: CONTEXT BUFFER, RELAY-C +2 slots — but requires HOOK-2 fix first."

The explorer shows a dependency annotation — this is a compound fix. RELAY-C's buffer needs expanding, but only after the HOOK-2 threshold is corrected. A "secondary minimum fix" surfaced after the primary.

He has 3 tokens remaining. He's spending thoughtfully.

He applies both fixes. Pass rate: 93%.

---

**Minute 4:30 — The Hard Decision**

He has 3 tokens left. He's at 93%. He could run MSMFE — but MSMFE costs 3 tokens, which would drain his budget entirely. The MSMFE might find a fix that improves a broader range of scenarios (not just the modal scenario).

He hesitates. If he runs MSMFE, he has no tokens left for the rest of the session. If the MSMFE result isn't actionable, he wasted the budget.

He looks at the compute display. A new element appears when he hovers over the MSMFE option:

```
MSMFE (3 tokens)
At 93% pass rate, MSMFE is most useful when: your top failure cases share a structural pattern.
Run "Failure Cluster Check" first to see if your failures are clustered (0 tokens).
```

There's a new zero-cost diagnostic: "Failure Cluster Check." It takes 1 second, costs nothing, and tells him whether the remaining 7% failures share a common root or are distributed randomly.

He runs it. Result: "Your 7 failures are spread across 4 distinct scenario types — MSMFE is unlikely to find a single fix."

He doesn't spend the 3 tokens. He saves them. He's satisfied with 93% and wants tokens for tomorrow's Gauntlet prep.

---

**Minute 6:00 — The Gauntlet Match**

He logs into the Gauntlet match. His compute budget:

```
COMPUTE BUDGET  █████  5 of 5 THOROUGH remaining this session
```

Full budget. He approaches the Gauntlet differently than a practice mission — knowing he can only use THOROUGH 5 times, he plans: "I'll use 2 tokens on early analysis, hold 3 for the mid-match pivot."

The budget turns the Gauntlet debrief into a resource management minigame on top of the diagnostic minigame. He's managing compute like mana in a long Magic match — planning ahead, holding for when it counts.

**UI Annotations:**
- Failure Cluster Check: a zero-cost diagnostic that appears as a suggested action when the player hovers over MSMFE; instant result, no wait animation; small text output below the MSMFE option in the dropdown
- "Why results agree" section in transparency drawer: appears when QUICK and THOROUGH find the same candidate; has a slightly different visual treatment — dark green background instead of neutral grey — to signal positive confirmation
- Dependency annotation on compound fixes: a small chain link icon next to the secondary fix; clicking it reveals "this fix is contingent on [primary fix] being applied first"; the player must apply fixes in order
- Budget ration behavior: when MSMFE cost equals remaining budget, the dropdown shows an amber warning: "Spending this will deplete your session budget"

---

### Journey: Zara, 22, CS student, Week 12, Gauntlet Season 2

**Context:** Zara has unlocked "Unrestricted Compute" — the final research node removes the session budget cap entirely. THOROUGH is now unlimited for her. She's been playing for 3 months and is in the top 200 Gauntlet players. The budget mechanic no longer applies to her. But she's teaching a newer player (Tomás) how to approach the Fix Explorer.

---

**Minute 0:00 — The Post-Scarcity Perspective**

Zara runs the Fix Explorer for her own practice session. Unlimited THOROUGH. She uses it constantly — sometimes running THOROUGH 8 times in a single debrief, building an exhaustive picture of her architecture's failure modes.

She's watching her compute display out of habit. It says:

```
COMPUTE BUDGET  ∞  Unrestricted Compute unlocked
```

The infinity symbol. No bars, no token count. Just ∞.

She remembers when she had 2 tokens per session. She remembers the specific decision to spend her last token before a Gauntlet match and whether she made the right call. Those decisions felt weighty. Now they don't.

She's thinking about this because Tomás messaged her: "I have 5 tokens and I keep wasting them. How do you know when to spend?"

---

**Minute 2:00 — The Teaching Moment**

Zara writes a forum post. The title: **"How to ration compute tokens (a guide for players with fewer than 8 tokens/session)"**

The core of her advice, shaped by months of budget decisions:

1. **Always run QUICK first, every time.** QUICK is free and the pre-ranking drawer is your fastest diagnostic. Run it before you decide if THOROUGH is worth it.

2. **Spend THOROUGH only when QUICK result feels wrong.** The drawer will tell you *why* the candidate was ranked first. If the reasoning (pivot-active, recent-change) matches what you know about the match, QUICK is probably right. If it doesn't — spend the token.

3. **Hold 1 token for the end of the session.** After you've applied fixes and re-run, sometimes you want one final THOROUGH to confirm your architecture is solid. Don't burn all tokens early.

4. **Never spend MSMFE unless you're above 80% pass rate.** Below 80%, your architecture has basic structural problems that QUICK can find. MSMFE is for tuning, not for fixing.

5. **Cluster check before MSMFE.** Free. Always. If failures are distributed, MSMFE won't find a universal fix.

---

**Minute 5:00 — The Irony She Notices**

Writing this guide, Zara realizes: the token budget made her a better diagnostician than unlimited compute would have. Having to choose made her pay attention to *when* THOROUGH was worth it. Now that she has unlimited compute, she sometimes runs THOROUGH out of habit rather than because the pre-ranking drawer gave her a reason.

She adds a line to her post:

> "I have unlimited compute now. Honestly? Sometimes I wish I still had the cap. The scarcity forced me to think before running. Now I just run everything. I'm not sure that's actually better."

It gets 94 upvotes. Players with budget caps reply that they're nervous to get unlimited compute because of exactly this.

---

**Minute 7:00 — The Meta-Design Insight**

Zara realizes what the budget mechanic actually teaches:

**The budget teaches you to have an opinion before you run the tool.**

With unlimited THOROUGH, a player can just run it and let the result form their opinion. With a limited budget, the player has to answer "do I think THOROUGH will find something different?" before spending. That pre-run hypothesis is the whole game. It's what real debugging looks like — you form a hypothesis, then you test it. The budget makes testing expensive enough that you have to actually think before testing.

This is the real pedagogical function of the scarcity mechanic. Not the scarcity itself, but the **deliberation the scarcity forces.**

**UI Annotations:**
- Unrestricted Compute display: replaces the token bar with an ∞ symbol; the bar area becomes a subtle gradient, no longer a resource indicator
- Forum post affordance: the debrief session notes panel has a "Post to community →" link; this opens a composing view with markdown support; the post is tagged with the player's current config version and mission context
- No UI annotation for Zara's insight — it emerges from the mechanic, not from an in-game prompt

---

## Strengths

**Turns a toggle into a decision.** The difference between "QUICK vs. THOROUGH" as a preference and "QUICK vs. THOROUGH" as a resource decision is enormous. Preferences are selected once and forgotten. Decisions are made every session, every match, every time the player opens the Fix Explorer.

**Creates meta-engagement between sessions.** "Do I have enough tokens for the Gauntlet match tonight?" is a question that exists outside the game. It's thinking about the game when not playing. This is the "one more turn" vector for diagnostic-focused players.

**Paces the teaching arc naturally.** With limited THOROUGH in early game, players develop QUICK-mode intuition before exhaustive search is freely available. By the time they unlock unlimited compute, they understand what THOROUGH is doing and when it's worth running. The budget mechanic is a tutorial for diagnostic reasoning without ever calling itself a tutorial.

**Makes the research tree feel meaningful.** Unlocking "Parallel Analysis II" is not an abstract improvement — it's "+1 chance per session to find the real fix." Research nodes that directly affect a visible, limited resource are immediately tangible.

**Generates genuine regret.** A spent token that found the same thing as QUICK is a real mistake the player can learn from. "I should have trusted the pre-ranking drawer" is a lesson that budget-free play never teaches. Regret is underrated in learning design — if mistakes have no cost, they have no lessons.

---

## Weaknesses

**Scarcity during failure is doubly punishing.** A player who is stuck at 45% pass rate and runs out of THOROUGH tokens has lost their best diagnostic tool at exactly the moment they most need it. This is the central design risk. Every version of the resource mechanic must include a safety valve for players who are genuinely struggling.

**The safety valve may defang the mechanic.** If struggling players always get their tokens back, or always have a fallback, the scarcity has no teeth for the players it most affects. Finding the right balance between "meaningful constraint" and "not punishing failure" is the hardest design problem this option creates.

**Unlimited compute in late game dissolves the mechanic.** If "Unrestricted Compute" is a reachable unlock, every player who plays long enough will eventually have it. The budget mechanic is meaningful only during the journey to unlimited. Once reached, it disappears. This is fine if the goal is purely tutorial pacing — but if the goal is ongoing strategic texture, the mechanic needs to extend into endgame (perhaps by making MSMFE and career minimum fix never truly free).

**Mobile-energy-bar anxiety.** The research showing that energy systems in mobile games generate significant player hostility is well-documented. The difference between this mechanic and bad energy systems is: (1) sessions reset, not real-time; (2) the limited resource generates a real decision, not just delay; (3) there is always a free option (QUICK). These distinctions must be clearly communicated. Players will arrive with strong priors about "limited energy = bad."

**The infinite-compute player's regret** (Zara's insight): Players who unlock unlimited compute may lose the diagnostic discipline the budget taught them. This is a success-state failure — the player succeeds (unlocks unlimited), then loses something they didn't know they valued. Worthy of a dedicated design response.

---

## Interaction Effects

**With 4.40 (QUICK vs. THOROUGH toggle):**
This aspect fundamentally changes the toggle. The toggle becomes a "spend or not spend" decision rather than a preference. The toggle UI must change accordingly — it's no longer a switch but a chooser with cost attached. The pre-ranking transparency panel (4.58) becomes even more important: the player needs the drawer to make an informed spend decision.

**With 4.36 (Multi-scenario fix explorer):**
The MSMFE is the most expensive analysis in the budget model. Its cost (3 tokens in the recommended design) forces the player to evaluate: "Is this mission important enough for MSMFE?" This creates a natural hierarchy — regular debrief uses 1-token THOROUGH; important Gauntlet prep uses 3-token MSMFE. The budget teaches the difference between exploration and decisive action.

**With 4.58 (Pre-ranking transparency panel):**
The transparency drawer is the zero-cost companion to THOROUGH. Players with tight budgets should be encouraged to read the drawer before spending tokens — it's the information that lets them decide whether THOROUGH is worth it. The drawer and the budget are synergistic: the budget creates the decision need, the drawer provides the information to make the decision.

**With 4.61 (QUICK vs. THOROUGH explainer):**
The budget creates the scenario where QUICK and THOROUGH find different results (because the player uses QUICK to decide whether to spend, then spends and finds something different). The 4.61 explainer becomes a post-spend review: "Was spending my token worth it? Did THOROUGH find something better?" The explainer is the debrief for the budget decision.

**With 4.63 (Player-configurable pre-ranking weights):**
If the player can configure the pre-ranking weights, they're essentially trying to make QUICK mode good enough that they don't need to spend tokens. A player who invests in pre-ranking calibration is a player who is actively trying to reduce their dependency on THOROUGH — an interesting meta-strategy: "I'll use my research points on better pre-ranking instead of more tokens."

**With 8.09 (Diagnostic layer as teaching arc):**
The budget mechanic is a teaching tool, not a punishing constraint. In the teaching arc model (8.09), the budget functions as the scaffold that forces deliberate practice with QUICK mode before THOROUGH is freely available. The arc becomes: (1) QUICK only → (2) QUICK with 1-2 THOROUGH tokens → (3) THOROUGH unlocked progressively → (4) Unrestricted compute. The budget controls the pace of this progression.

**With early-game scarcity design (general):**
The budget must be calibrated against the early-game difficulty curve. Mission 1-3 players should never feel stuck because they've run out of THOROUGH tokens. The recommended design gives 1 token from session 1 — enough to feel the mechanic without creating frustration. The safety valve for struggling players (more frequent token refills? QUICK always finding a meaningful result?) must be designed in parallel.

---

## Comparable Games and Media

**Magic: The Gathering — mana as action resource:**
The most studied limiting resource in game design. You can only cast spells you have mana for. The mana system doesn't feel arbitrary because every spell shows its cost, and you build your deck around your resource curve. Robot Uprising's compute budget should feel this way: not arbitrary scarcity but a resource curve the player builds around. The key lesson from Magic: the resource should enable decision-making, not just prevent it. Mana creates "what can I do this turn?" not just "what can't I do?"

**Slay the Spire — gold as scarcity through choice:**
Gold is spent at shops. The decision isn't "can I afford this?" but "is this better than what I might see next?" Slay the Spire's gold creates comparative decision-making (this relic vs. that potion vs. upgrading later) not just absolute limits. Compute tokens could work similarly: spending on THOROUGH now vs. holding for MSMFE later.

**Opus Magnum — optimization across multiple dimensions:**
Players optimize for cycle count, cost, and area simultaneously. No single metric is the right answer. The compute budget adds "tokens spent" as a metric — a player who solved Mission 12 using 2 tokens where the community average is 4 has demonstrated better diagnostic efficiency. This opens a leaderboard dimension (tokens per session, diagnostic efficiency score) that Opus Magnum's histogram system captures well.

**Factorio — power grid as real-time resource:**
In Factorio, electricity is produced and consumed continuously. Building a factory that consumes more power than you generate immediately breaks things. Factorio's power grid teaches players to think about throughput (rate of production) and capacity (maximum load). Compute tokens are a simpler version: discrete units, not continuous flow. But the design lesson from Factorio is: the resource constraint should be visible before it becomes a crisis. The compute bar should always be visible, not just when it's low.

**Hearthstone — card draw as tempo resource:**
In Hearthstone, drawing cards is a resource. Burning cards (drawing past 10) is a real cost. The constraint creates a meta-game around hand management. Compute tokens are simpler — the deck isn't the resource, just the count — but the tempo-management lesson applies: players learn to manage their token count across the session the way Hearthstone players manage their hand.

**TIS-100 / Shenzhen I/O — limited instruction slots:**
The programs have instruction count limits. Players can't just write arbitrarily long programs — they have to be efficient. This constraint is the exact mechanic the compute budget emulates: "you can be thorough, but thoroughness has a cost." The Zachtronics histogram system (see 1.03, Opus Magnum) even surfaces efficiency as a community metric — the player who solved the puzzle in the fewest instructions is celebrated. Compute budget creates a similar celebration: the player who diagnosed correctly using the fewest THOROUGH tokens.

**Real engineering context — "compute time as resource":**
In real ML/AI engineering, running a large exhaustive search (hyperparameter sweep, full model evaluation) costs money and time. Engineers develop heuristics for when it's worth running the expensive job: "Has my change moved the validation metric by more than 0.5%? Then run the full eval." The compute budget mechanic teaches this real engineering heuristic directly. When a player spends a THOROUGH token on a diagnostic that confirms QUICK's result, they've "wasted a GPU run" in real engineering terms. Learning not to waste the expensive compute is a directly transferable skill.

---

## Sensory Description

**The compute budget bar — default state:**

A horizontal row of square tokens, positioned directly above the Run Analysis button. Each token is a 12×12px square with slightly rounded corners. Full tokens: bright white fill with a soft inner glow, like a lit LED. Empty tokens: dim grey, flat, no glow, with a small hourglass icon inside (12×12px, 4px tall hourglass).

For a player with 5 tokens: five bright squares in a row. Clean, organized, clear. The white squares seem almost to hum with readiness.

For a player with 1 token remaining: one bright square, four dim hourglass squares. The lone bright square is visually isolated — it reads as "last one." Not alarming, but clear. The four dim squares are not threatening red, just... resting. They'll be back.

For a player at 0 tokens: five dim hourglass squares, all grey. The display doesn't turn red. No alarm. Just quiet depletion. The session-reset timer appears below the row: "Resets next session →" in small, calm grey type.

**The THOROUGH dropdown — cost indicator:**

When the player opens the search mode dropdown, each option has a cost indicator on the right side. For QUICK (free): a small dash "–". For THOROUGH (1 token): a small bright-white square matching the token UI. For MSMFE (3 tokens): three small bright-white squares in a row. The visual language is direct — the option shows you exactly how many tokens it will consume.

When the player selects an option that would deplete their last token: the option briefly glows amber as they hover — not red, not alarming, just warm. "This is your last one." The confirm dialog appears without blocking the choice.

**The THOROUGH wait animation:**

28 seconds. Not just a progress bar. A small branching diagram grows from a central root node. Each new branch is a candidate being evaluated. Early branches (first 5 seconds): thick, confident — these are the pre-ranked candidates. Later branches: thinner, more exploratory — the search going deeper, farther from the obvious candidates.

The sound design: a low, continuous digital hum with subtle clicks as each new branch is added. Not annoying — it sounds like servers working, not like a machine struggling. The hum is in a minor key, slightly tense. When the analysis completes: a single clean tone, neutral pitch, like a bell struck once and allowed to ring. The branching diagram freezes, then fades into the result card.

**The token spend moment:**

When the player confirms a THOROUGH spend: a single white square in the budget bar dims from bright white to grey with a small animation — the square's inner glow fades outward, like a light source being extinguished. A soft "tick" sound — precise, like a switch being thrown. The square is dim for the rest of the session.

It should feel like a real expenditure — not a punishment, but a conscious act. The sound is clean and final. Not sad. Just decisive.

**The session reset:**

When a new session begins: all dim squares re-illuminate simultaneously. The hourglass icons dissolve and the squares fill from outside-in, the white glow spreading from the square's border to its center over 300ms. A gentle ascending tone as each square lights up — staggered by 60ms per square, so five squares produce a brief ascending scale. It sounds like the day beginning.

---

## Discovered New Aspects

1. **4.70 — The "Failure Cluster Check" zero-cost diagnostic:** A pre-MSMFE analysis (free, instant) that classifies remaining failures as "clustered" (sharing a structural pattern, MSMFE likely to find a universal fix) or "distributed" (varied causes, MSMFE unlikely to help); teaches the player when exhaustive multi-scenario search is worth its cost; interaction with 4.36 MSMFE and 4.60 search budget.

2. **4.71 — Diagnostic efficiency as a leaderboard metric:** A public stat showing "average THOROUGH tokens spent per session" for a given pass-rate band; players with better pre-run judgment (fewer tokens spent per unit of diagnostic improvement) are recognized; extends the Opus Magnum histogram pattern (1.03) to the Fix Explorer; risk of optimizing for the stat vs. actual diagnostic reasoning.

3. **4.72 — "Token debt" recovery mechanic:** When a player spends a THOROUGH token that confirms the QUICK result (finds no smaller fix), they receive a partial refund (0.5 token, tracked as fractional, rounds down to 1 when two confirmations accumulate); teaches that "confirming a hypothesis is valid diagnostic work" rather than penalizing spent tokens that don't find new information; alternative to pure-loss scarcity.

4. **4.73 — The "I wish I still had the cap" experience:** A late-game unlock notification telling the player "You now have unrestricted compute" could include an optional reflection: "Would you like to temporarily re-enable a personal budget cap? Some players find constrained budgets promote better diagnostic discipline"; voluntary scarcity as an advanced mode option; interaction with accessibility design and player-controlled difficulty.

5. **4.74 — Compute budget as Gauntlet meta-resource:** In competitive Gauntlet, both players have the same compute budget for the session; spending more tokens on pre-match debrief analysis may give an edge, but token counts are visible to opponents; creates a strategic meta-game where revealing your analysis depth is information the opponent can use; interaction with 4.54 adversarial exposure policy.

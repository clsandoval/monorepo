# Token Debt Recovery Mechanic — Partial Refund on Confirmation

**Aspect:** 4.75 — "Token debt" recovery mechanic: When a THOROUGH run confirms the QUICK result (finds no smaller fix), the player receives a partial token refund (tracked fractionally, rounds down); teaches that "confirming a hypothesis is valid diagnostic work" rather than punishing spent tokens that don't find new information; alternative to pure-loss scarcity design.

**Parent:** 4.60 — Search budget as a player resource
**Siblings:** 4.74 — Diagnostic efficiency metric; 4.76 — Voluntary budget cap
**Related:** 4.61 — QUICK vs. THOROUGH explainer; 4.62 — Agree-to-disagree result; 4.36 — Multi-scenario fix explorer; 8.09 — Diagnostic layer as teaching mechanic

---

## The Core Problem

The search budget mechanic (4.60) creates a genuine strategic decision around THOROUGH mode. Scarcity generates stakes. But it introduces a specific emotional wound: the **confirmation spend**.

The scenario plays out like this. A player runs QUICK. Gets a result: SCOUT-A, beacon interval -3 ticks. The result looks plausible but uncertain — maybe the pre-ranking got lucky, maybe not. The player has learned from past experience that QUICK's heuristic sometimes surfaces a symptom rather than a root cause (Scenario 1 from 4.61). They decide to spend a THOROUGH token to verify.

28 seconds pass. The branching search tree animation plays. Candidates are evaluated and discarded.

Result: THOROUGH confirms QUICK. Same element, same fix, same magnitude. SCOUT-A, beacon interval -3 ticks. The minimum fix is the first viable fix. QUICK was right.

The player looks at their compute budget. One token gone. The result is identical to what they already had. The tokens feel *wasted*.

This is the confirmation spend problem. From an information-theoretic perspective, the THOROUGH run did real work — it elevated a hypothesis to a proof. The player now knows, with certainty, that SCOUT-A's fix is the smallest available. Before the THOROUGH run, they were guessing. After it, they know. That knowledge has value. But from the player's *felt experience*, they spent a scarce resource and got nothing new. The screen looks the same. The fix explorer card didn't change. The pass rate didn't improve. They paid for confirmation and confirmation feels like standing still.

Over time, this creates a behavioral distortion: players begin to skip THOROUGH when they suspect QUICK is correct. They only spend tokens when they suspect QUICK is *wrong*. This inverts the intended design — the budget was supposed to make THOROUGH feel weighty, not avoidable. Players who skip confirmation runs develop worse diagnostic reasoning. They apply QUICK results uncritically when QUICK "looks right" and only interrogate results that surprise them. This is the opposite of scientific methodology, which demands rigor precisely when expectations match observations.

The token debt recovery mechanic addresses this by making confirmation spend feel less punitive without eliminating the cost entirely.

---

## The Design

### The Refund Rule

When a THOROUGH run confirms the QUICK result — same element, same fix, same magnitude or smaller magnitude within 1 unit — the player receives a **partial token refund**. The refund rate depends on the search depth and agreement quality:

| Agreement Type | Refund Rate | Rationale |
|---|---|---|
| Exact match (same element, same fix, same magnitude) | 0.60 tokens | Strongest confirmation — QUICK's heuristic was perfectly calibrated |
| Same element, smaller magnitude | 0.40 tokens | THOROUGH found a tighter fix on the same element — QUICK was close but not minimal |
| Same element, different parameter | 0.25 tokens | THOROUGH agrees on root cause but found a different lever — partial confirmation |
| Different element entirely | 0.00 tokens | THOROUGH diverged — the player got new information, no refund needed |

### Fractional Tracking

Tokens are tracked to two decimal places internally. The display rounds down to the nearest integer for the main budget bar, but a secondary fractional display shows the accumulated partial value.

```
COMPUTE BUDGET   ████░░░░░░  4 of 10 THOROUGH remaining
                 ▸ +0.60 banked (rounds to +1 at 1.00)
```

When the fractional accumulator reaches 1.00 or higher, a full token is added to the budget and the fractional remainder is carried forward. If the player has accumulated 0.60 from one confirmation and then earns another 0.60 from a second confirmation, the accumulator hits 1.20 — one token is restored, 0.20 remains banked.

The fractional display is always visible but secondary — it sits below the main budget bar in a smaller font, subtly pulsing when a refund is added.

### The Refund Moment

The refund is not instant. When THOROUGH completes and confirms QUICK, the following sequence plays:

1. **Result card appears** — same format as a normal THOROUGH result, but with a new annotation:

```
◎ THOROUGH RESULT — CONFIRMATION
  SCOUT-A — beacon interval –3 ticks
  Matches QUICK result exactly.

  ┌─────────────────────────────────────┐
  │ ◆ HYPOTHESIS CONFIRMED              │
  │ THOROUGH validated QUICK's finding. │
  │ Confirmation is diagnostic work.    │
  │                                     │
  │ PARTIAL REFUND: +0.60 tokens        │
  │ Banked: 0.60 / 1.00                │
  └─────────────────────────────────────┘
```

2. **Refund animation** — A small, warm animation plays on the compute budget bar. The fractional indicator ticks up. A thin amber line traces from the result card to the budget display, carrying a small glowing dot — the recovered fraction — back into the bar. The animation takes 1.2 seconds. It is quiet and satisfying, not flashy. It communicates: you got something back.

3. **Tooltip on hover** — After the refund, hovering over the banked amount shows: "Earned from 1 confirmation run. 0.40 more to recover a full token."

### The Pedagogical Message

The refund box always includes the line: "Confirmation is diagnostic work." This is not flavor text — it is the game's thesis about the scientific method, delivered at the exact moment the player might feel they wasted a resource. The message reframes the confirmation from "nothing happened" to "you proved your hypothesis." Over dozens of confirmations, this reframing becomes internalized.

### Budget Display States

The full budget display now has four states:

**State 1 — Full budget, no banked fraction:**
```
COMPUTE BUDGET   ██████████  10 of 10 THOROUGH remaining
```

**State 2 — Partial budget, no banked fraction:**
```
COMPUTE BUDGET   ████░░░░░░  4 of 10 THOROUGH remaining
```

**State 3 — Partial budget with banked fraction:**
```
COMPUTE BUDGET   ████░░░░░░  4 of 10 THOROUGH remaining
                 ▸ +0.60 banked (0.40 to next token)
```

**State 4 — Token recovered from bank:**
```
COMPUTE BUDGET   █████░░░░░  5 of 10 THOROUGH remaining
                 ▸ +0.20 banked (0.80 to next token)  ↑ +1 recovered!
```

The "+1 recovered!" annotation flashes briefly (2 seconds) when a token is restored, then fades to the standard banked display.

---

## Player Journeys

### Journey 1: Leah, 22, cognitive science student, Week 2, Mission 6

**Context:** Leah is 10 hours into the campaign. She has 4 THOROUGH tokens per session (unlocked Parallel Analysis I). She's on Mission 6 — "Sensor Cascade" — with a 68% pass rate. She has used THOROUGH three times in her career: twice it diverged from QUICK (she learned something new both times), once it confirmed (she felt annoyed about wasting the token). The confirmation spend left a bad taste. She's now reluctant to use THOROUGH unless she's "pretty sure QUICK is wrong."

---

**Minute 0:00 — The Familiar Setup**

Debrief opens. 68% run. Fix Explorer panel. Leah runs QUICK. 4 seconds. Result:

```
⚡ FIRST VIABLE FIX: RELAY-D — context window –1 slot
Expected pass rate: 73% (+5%)
```

She reads the pre-ranking drawer. Pivot-active: 0.91. Recency: 0.72. Volatility: 0.55. The numbers look reasonable. RELAY-D was active at the pivot tick, she modified it recently, moderate volatility. The pre-ranking's case is coherent.

Her instinct says: "QUICK is probably right. Don't spend a token."

But she hesitates. The +5% improvement feels thin. She wonders if there's a deeper fix she's missing.

---

**Minute 0:45 — The Spend**

She opens the search mode dropdown:

```
QUICK    (0 tokens · ~4 sec)   ✓ unlimited
THOROUGH (1 token · ~28 sec)   ⚡ 4 remaining this session
```

She selects THOROUGH. Confirmation dialog: "Spend 1 compute token? You have 4 remaining."

She clicks Confirm. The branching animation begins. She watches the tree grow — 28 seconds of candidates expanding and contracting as the exhaustive search runs.

---

**Minute 1:17 — The Confirmation (With Refund)**

Result appears:

```
◎ THOROUGH RESULT — CONFIRMATION
  RELAY-D — context window –1 slot
  Matches QUICK result exactly.

  ┌─────────────────────────────────────┐
  │ ◆ HYPOTHESIS CONFIRMED              │
  │ THOROUGH validated QUICK's finding. │
  │ Confirmation is diagnostic work.    │
  │                                     │
  │ PARTIAL REFUND: +0.60 tokens        │
  │ Banked: 0.60 / 1.00                │
  └─────────────────────────────────────┘
```

Leah's budget bar shifts:

```
COMPUTE BUDGET   ███░░░░░░░  3 of 4 THOROUGH remaining
                 ▸ +0.60 banked (0.40 to next token)
```

The amber trace animation plays — a warm line from the result card to the budget display, carrying a small glowing dot. The fractional counter ticks from 0.00 to 0.60. A soft chime sounds — brief, metallic, with a warm overtone. Not triumphant. More like a coin settling on a wooden surface.

Leah reads: "Confirmation is diagnostic work." She pauses. She did not get nothing. She got a confirmation — and she got 0.60 tokens back. The spend was not free, but it was not a full loss either.

She looks at the banked display: "0.40 to next token." One more confirmation and she'll recover a full token. The fractional tracking creates a small forward momentum — a reason to confirm again rather than avoid it.

---

**Minute 2:30 — The Behavior Shift**

She applies the confirmed fix. Pass rate: 74%. She runs QUICK again on the residual. New result: HOOK-3, trigger delay +1 tick.

The pre-ranking drawer shows pivot-active: 0.62. Recency: 0.10. Volatility: 0.88. Low recency, high volatility. She has seen this pattern before — often a false signal (volatility from reaction, not causation). In the past, she would have run THOROUGH on this because the pre-ranking pattern looks suspicious. But she would also have hesitated because she hates losing tokens.

Now she has 3 tokens and 0.60 banked. If THOROUGH confirms, she loses 0.40 net (1.00 cost minus 0.60 refund). If THOROUGH diverges, she loses 1.00 but learns something new. The downside is capped. She spends a second token.

---

**Minute 3:10 — The Divergence**

THOROUGH result: BUFFER-A, context depth +2. Different element. No refund (divergence = the player got new information).

```
COMPUTE BUDGET   ██░░░░░░░░  2 of 4 THOROUGH remaining
                 ▸ +0.60 banked (0.40 to next token)
```

The banked amount didn't change — divergence means no refund. But Leah doesn't feel cheated. The THOROUGH run found a genuinely different fix. She applies it. Pass rate: 82%. She learned something real.

The refund mechanic worked as designed: it encouraged her to run a second THOROUGH (which she would have skipped without the banked cushion), and the second THOROUGH happened to find real information.

**UI Annotations for Journey 1:**
- Confirmation result card: Distinguished from divergence cards by a thin amber border (divergence cards have a blue-green border). The word "CONFIRMATION" appears in the header in amber text.
- Refund animation: 1.2 seconds. Amber trace line from result card to budget bar. Small glowing dot travels along the line. Budget fractional counter animates from 0.00 to 0.60.
- Audio: Soft metallic chime on refund. Two-note ascending, C to E. 0.4 seconds duration. Muted, not celebratory.
- Banked display: Appears below the main budget bar in 80% font size. Monospace numbers. Slightly dimmer than the main bar. Pulsing glow when first populated (one pulse cycle, then static).

---

### Journey 2: Marcus, 41, product manager, Month 3, Gauntlet Match 5

**Context:** Marcus is deep into the competitive loop. He has 8 THOROUGH tokens per session (Parallel Analysis III unlocked). He's preparing for Gauntlet Match 5 — the first match where opponents can submit adversarial scenario distributions. His pass rate on the practice run is 89%. He wants 95%+ before entering the match queue. He has been playing for 10 weeks and has accumulated 2.80 banked tokens across dozens of confirmation runs.

---

**Minute 0:00 — The Bank Matters**

Marcus opens the debrief after an 89% practice run.

```
COMPUTE BUDGET   ████████░░  8 of 8 THOROUGH remaining
                 ▸ +2.80 banked (0.20 to next token)
```

He notices: 0.20 to the next token. One more confirmation run and he'll recover a full token, bringing his effective budget to 9 instead of 8. Over his 10-week career, the fractional refunds have accumulated into almost three full bonus tokens. He has never had to make a resource decision based on the banked tokens — the main budget is always sufficient. But the banked total is a quiet metric of his diagnostic discipline. 2.80 banked means he has run approximately 5-7 confirmation runs across his career. Each confirmation was a moment he verified his QUICK hypothesis instead of blindly trusting it.

He runs QUICK: HOOK-5, attention weight rebalance -0.3.

The pre-ranking drawer shows a textbook "confident" profile: pivot-active 0.95, recency 0.85, volatility 0.70. Everything points at HOOK-5. Marcus is 90% sure THOROUGH will confirm. He spends a token deliberately — not because he doubts QUICK, but because he wants certainty before the Gauntlet.

---

**Minute 0:32 — The Token Recovery**

THOROUGH confirms. HOOK-5, attention weight rebalance -0.3. Exact match.

```
◎ THOROUGH RESULT — CONFIRMATION
  HOOK-5 — attention weight rebalance –0.3
  Matches QUICK result exactly.

  PARTIAL REFUND: +0.60 tokens
```

The banked counter ticks: 2.80 + 0.60 = 3.40. But 3.40 >= 1.00, so a full token is recovered. The display shows:

```
COMPUTE BUDGET   ████████░░  8 of 8 THOROUGH remaining
                 ▸ +0.40 banked (0.60 to next token)  ↑ +1 recovered!
```

Wait — he spent 1 token (going from 8 to 7) and immediately recovered 1 token (back to 8). His displayed budget is unchanged. The net cost of this confirmation was zero in whole tokens, with 0.40 banked toward the next recovery.

A brief flash of amber light washes across the budget bar — the "+1 recovered!" annotation appears for 2 seconds, then fades. The chime plays, slightly louder than usual because a full token recovered (not just a fractional increment). A second note is added: C-E-G instead of C-E. A small resolution.

Marcus smiles. The diagnostic discipline he built over 10 weeks just paid a concrete dividend. The 5-7 previous confirmation runs that each contributed 0.60 tokens have now, cumulatively, given him 3 free THOROUGH runs. The system rewarded his methodical approach without him ever noticing the individual increments adding up.

---

**Minute 1:15 — The Strategic Implication**

Marcus applies the fix. Pass rate: 92%. He wants to push further. He has 7 tokens remaining (he spent 1, recovered 1, then the display shows 8 minus the applied spend... let him recalculate). He had 8. Spent 1: 7. Recovered 1: 8. But the recovery came from banked reserves, so his active budget is 8, but he used one analysis. The system tracks: 7 remaining (active tokens), +0.40 banked. The recovery restored a spent token — it didn't add a new one above the cap.

He runs three more THOROUGH analyses across the session. Two diverge (new information, no refund). One confirms (0.60 refund, banked goes from 0.40 to 1.00, another token recovered).

End of session: he spent 4 tokens but recovered 2, for a net spend of 2. His diagnostic discipline turned an 8-token budget into a 10-token effective budget. The fractional system rewards players who use THOROUGH consistently, not just when they expect divergence.

**UI Annotations for Journey 2:**
- Full token recovery: The budget bar briefly flashes amber. The recovered token square fills with a warm glow that fades to the standard bright white over 1.5 seconds. The "+1 recovered!" text animates in with a slight upward drift, holds for 2 seconds, then fades.
- Recovery chime: Three-note ascending (C-E-G), 0.6 seconds. Warmer and more resonant than the standard two-note refund chime. Played only on full token recovery, not on fractional refund.
- Net-spend calculation: Not shown to the player directly — the system tracks gross spend and gross recovery separately. The player sees "X remaining" and "Y banked." Session-end summary shows "Tokens spent: 4 | Tokens recovered: 2 | Net: 2."

---

### Journey 3: River, 16, high schooler, Day 3, Mission 2

**Context:** River is brand new. 3 hours of play. They have 1 THOROUGH token per session (no research unlocks yet). They have used THOROUGH once — on Mission 1, it diverged from QUICK and they got a better fix. They now associate THOROUGH with "get a different, better answer." They don't understand that confirmation is also a valid outcome. They are on Mission 2 — "Signal Split" — with a 55% pass rate.

---

**Minute 0:00 — The Expectation**

River runs QUICK. Result: SCOUT-B, filter threshold +1. Pass rate would go to 60%.

They look at the THOROUGH option. They have 1 token. Their mental model: "THOROUGH finds a better fix than QUICK." They're hoping for a divergence. They spend the token.

---

**Minute 0:30 — The Unwanted Confirmation**

THOROUGH returns: SCOUT-B, filter threshold +1. Same result. River's face falls. "It didn't find anything better."

But the confirmation card appears:

```
◎ THOROUGH RESULT — CONFIRMATION
  SCOUT-B — filter threshold +1
  Matches QUICK result exactly.

  ┌─────────────────────────────────────┐
  │ ◆ HYPOTHESIS CONFIRMED              │
  │ THOROUGH validated QUICK's finding. │
  │ Confirmation is diagnostic work.    │
  │                                     │
  │ PARTIAL REFUND: +0.60 tokens        │
  │ Banked: 0.60 / 1.00                │
  └─────────────────────────────────────┘
```

The amber trace animation plays. The budget bar shows:

```
COMPUTE BUDGET   ░░░░░  0 of 1 THOROUGH remaining
                 ▸ +0.60 banked (0.40 to next token)
```

River reads: "Confirmation is diagnostic work." They don't fully internalize it yet. But the refund catches their attention. 0.60 tokens back. They didn't lose the full token. The amber glow, the returning dot, the chime — the sensory feedback says "something came back."

---

**Minute 1:00 — The Question That Changes Understanding**

River hovers over the banked display. The tooltip says:

> "You've banked 0.60 tokens from confirmation runs. When this reaches 1.00, you recover a full THOROUGH token. Confirming a QUICK result means the pre-ranking heuristic worked well — that's useful information."

River reads: "That's useful information." They think about it. Before the THOROUGH run, they didn't know if QUICK was right. They were guessing. Now they know. The fix is confirmed — they can apply it with confidence.

They apply the fix. Pass rate: 61%. Not spectacular. But confirmed.

---

**Minute 2:00 — Next Session, The Accumulation**

Next session opens. Budget: 1 of 1 THOROUGH remaining, 0.60 banked.

River plays through Mission 2 again. Runs QUICK. Runs THOROUGH. Confirmation again — same element, same fix.

Banked: 0.60 + 0.60 = 1.20. Token recovered. 0.20 remains.

```
COMPUTE BUDGET   █░░░░  1 of 1 THOROUGH remaining
                 ▸ +0.20 banked (0.80 to next token)  ↑ +1 recovered!
```

River stares. They had 0 tokens (spent the 1). But the system gave one back. They now have 1 token again — from accumulated confirmation refunds across two sessions. The three-note chime plays (C-E-G). The recovered token square glows amber, then settles to white.

River's mental model shifts. THOROUGH does not only mean "find a different answer." THOROUGH also means "confirm the answer I have." Confirmation runs cost less than divergence runs (0.40 net vs 1.00 net). Confirmation builds toward free tokens. The mechanic taught them, through direct experience and sensory reinforcement, that verifying a hypothesis is not waste.

**UI Annotations for Journey 3:**
- First-time confirmation: The pedagogical message box is slightly larger for players who have never seen a confirmation result. An additional line appears: "QUICK and THOROUGH agreed. This means QUICK's pre-ranking was well-calibrated for this scenario."
- Tooltip on banked display: For new players (fewer than 5 THOROUGH uses), the tooltip includes the full explanatory text. For experienced players, it shortens to just the numeric progress.
- Cross-session accumulation: The banked value persists across sessions. It does not decay. It does not reset at chapter boundaries. Only the main budget resets — the bank is permanent progression.

---

## Strengths and Weaknesses

### Strengths

**1. Reframes confirmation as productive work.** The single most important function. Without the refund, confirmation runs feel like waste. With the refund, they feel like a discounted verification step. The pedagogical message ("confirmation is diagnostic work") is delivered at the moment of maximum receptivity — when the player is deciding how to feel about a spent resource.

**2. Creates a secondary accumulation loop.** The fractional bank gives players who use THOROUGH consistently a slow, steady reward. Over a 10-week career, a player who runs THOROUGH on every debrief will accumulate 15-25 free tokens from refunds alone. This rewards the exact behavior the game wants to teach: rigorous verification rather than heuristic trust.

**3. Softens scarcity without eliminating it.** The refund is 0.60, not 1.00. The player still pays 0.40 tokens for a confirmation. Scarcity is preserved — the player cannot run THOROUGH infinitely, even with perfect confirmation rates. But the scarcity is gentler than pure-loss design.

**4. Avoids unpredictable costs.** Unlike Model E from 4.60 (pay more when results diverge), the refund mechanic never surprises the player with a cost they didn't expect. The cost is always 1.00 upfront; the refund is a bonus, not a bill. Losses are known before the spend. Gains are a pleasant surprise after.

**5. Works across all budget models.** The fractional refund is compatible with session budgets, earned budgets, research tree unlocks, and sliding scale depths. It is an overlay mechanic, not a replacement.

### Weaknesses

**1. Fractional tracking adds cognitive load.** Players must understand: tokens (integer), banked tokens (fractional), refund rates (per-confirmation), and recovery thresholds. This is more complex than "you have 4 tokens." The secondary display mitigates this — players can ignore the bank and only notice when a full token recovers. But the system is inherently more complex.

**2. Refund rates require careful calibration.** If 0.60 is too high, confirmation becomes nearly free and the scarcity mechanic dissolves. If too low (0.20), the bank accumulates so slowly it feels irrelevant. The 0.60 rate was chosen so that two confirmations recover one token (1.20 accumulated, 1.00 recovered, 0.20 carried). This means a player who alternates confirmation and divergence is spending at roughly 70% of the unrefunded rate. Whether 70% is the right discount is an empirical tuning question.

**3. May create "confirmation farming."** A player who discovers the refund mechanic might deliberately seek scenarios where QUICK is likely correct (easy missions, well-tuned configurations) and run THOROUGH repeatedly to farm refunds. The per-session cap on main budget tokens limits this, but the banked tokens are uncapped. A player could, over many sessions, accumulate a large bank. Mitigation: the bank only pays out in 1.00-token increments and the banked value does not itself generate refunds — there is no compound interest.

**4. The tiered refund table may be invisible.** The difference between 0.60 (exact match), 0.40 (same element, smaller magnitude), and 0.25 (same element, different parameter) is subtle. Most players will only experience the 0.60 and 0.00 rates (exact confirmation or full divergence). The intermediate rates exist for completeness but may never be noticed. Consider simplifying to binary: 0.60 for any same-element result, 0.00 for different-element results.

**5. Cross-session bank persistence creates invisible state.** A player returning after a week-long break has a banked value they may not remember accumulating. The display helps — it is always visible — but the "why do I have 0.40 banked?" question may arise. The tooltip addresses this, but the mechanic assumes a player who understands the system, which new or returning players may not.

---

## Interaction Effects

### With 4.60 — Search Budget

The refund mechanic is a direct modifier of the search budget. It does not replace the budget — it adjusts the effective cost of THOROUGH from 1.00 to 0.40 (on confirmation) or 1.00 (on divergence). The budget models from 4.60 remain structurally intact. The refund adds a variable cost dimension: the *expected* cost of a THOROUGH run depends on the player's estimate of QUICK's accuracy. If they believe QUICK is correct, the expected cost is 0.40 tokens (1.00 minus 0.60 refund). If they believe QUICK is wrong, the expected cost is 1.00 (no refund on divergence). This expected-value calculation is exactly the kind of diagnostic reasoning the game wants to teach.

### With 4.61 — QUICK vs. THOROUGH Explainer

The divergence explainer (4.61) activates when results differ. The confirmation card (4.75) activates when they agree. These are complementary — every THOROUGH run triggers exactly one of the two. The confirmation card should match the visual language of the divergence explainer: same panel size, same position in the Fix Explorer, same level of detail. The only difference is border color (amber for confirmation, blue-green for divergence) and the refund block (present only on confirmation).

### With 4.74 — Diagnostic Efficiency Metric

The diagnostic efficiency metric tracks how well the player spends THOROUGH tokens. Confirmation refunds complicate the efficiency calculation. Should a confirmed THOROUGH run count as "efficient" (the player verified correctly) or "inefficient" (the player didn't learn anything new)? The refund mechanic's thesis says: efficient. The efficiency metric should weight confirmed runs positively, reflecting the game's position that verification is valid work. A player who runs THOROUGH on every debrief and gets 80% confirmations has a high confirmation rate — this should increase, not decrease, their diagnostic efficiency score.

### With 4.76 — Voluntary Budget Cap

If the player can voluntarily cap their budget (4.76), the refund mechanic interacts with the cap in an interesting way. A player who caps at 3 tokens per session and runs 3 THOROUGH analyses that all confirm receives 1.80 banked tokens (3 x 0.60). This exceeds 1.00, so a token is recovered — but the player is at their voluntary cap. Does the recovered token exceed the cap? Two options: (a) recovered tokens can exceed the voluntary cap, rewarding the player's discipline; (b) recovered tokens are held in the bank but do not convert to active tokens until the cap is raised. Option (a) is cleaner and more rewarding.

---

## Comparable Games and Media

**Slay the Spire — Rest vs. Smith at campfires.** Resting heals HP (safe, conservative). Smithing upgrades a card (risky, progressive). There is no "partial rest" option. But the player who rests does not feel punished — resting is a legitimate strategic choice, and the game never frames it as waste. The token debt recovery mechanic borrows this philosophy: confirming QUICK (the conservative choice) is legitimate, and the game should never frame it as waste. The partial refund is the mechanical expression of this philosophy.

**FTL: Faster Than Light — Fuel management with event refunds.** FTL's fuel is a scarce resource. Some events refund fuel (discovering a fuel cache, defeating pirates with fuel cargo). The refund is never guaranteed — it's a possible outcome of exploration. The player who explores aggressively (spending fuel) sometimes discovers fuel. The parallel to token debt recovery: the player who spends THOROUGH tokens sometimes recovers tokens. The difference is that FTL's refunds are random, while token debt recovery is deterministic — confirmation always refunds. Deterministic refunds are stronger pedagogically because the player can form a reliable mental model.

**Magic: The Gathering — Cycling mechanic.** Cards with Cycling can be discarded to draw a new card (usually for a small mana cost). The original card is "lost" but the player doesn't feel it as pure loss — they traded a bad card for information (a new draw). Token debt recovery has a similar structure: the player trades a token for information (confirmation that QUICK was correct) and recovers a partial token as compensation for the "unexciting" result.

**Outer Wilds — Revisiting known locations.** In Outer Wilds, returning to a location the player has already explored provides no new information but deepens understanding. The game does not punish revisits — time loops are free. The emotional parallel is that confirmation (revisiting a hypothesis you already have) is framed as deepening rather than wasting. The refund mechanic provides a mechanical incentive that mirrors Outer Wilds' structural one.

**Software engineering — Test suites that pass.** In professional software development, a test suite that passes is not a "wasted" test run. It is a verification that the system works as expected. The team does not say "we wasted CI credits because all tests passed." The token debt recovery mechanic applies this real-world principle to the game's diagnostic metaphor. THOROUGH-confirms-QUICK is the game equivalent of "all tests pass" — valid, useful, worth the compute.

---

## Sensory Description

### Colors

**Confirmation amber: #D4A855.** A warm, burnished gold — not bright yellow (which reads as warning) and not orange (which reads as urgency). This amber says "something returned to you." It is the color of a coin, a recovered resource, a second chance. Used for: confirmation card border, refund animation trace line, refund amount text, recovered token flash.

**Banked display grey: #8A8A8A on #1A1A1A background.** The banked token display is deliberately muted — it is secondary information, not primary. The grey text sits below the main budget bar, visible but not competing for attention. When a refund is added, the grey briefly pulses to amber (#D4A855) for one cycle (0.8 seconds), then returns to grey.

**Standard budget bar: bright white (#EAEAEA) for filled tokens, dim grey (#3A3A3A) for empty slots.** Unchanged from 4.60. The refund mechanic does not alter the primary display — it adds a secondary display below.

### Animations

**Refund trace animation (1.2 seconds).** Triggered on confirmation. A thin line (1.5px, amber, slight glow) extends from the bottom-right corner of the confirmation card to the banked display in the budget bar. A small dot (3px, bright amber, soft bloom) travels along the line. When the dot reaches the banked display, the fractional counter animates upward (odometer-style, each digit rolling). The line fades over 0.5 seconds after the dot arrives.

**Token recovery burst (0.8 seconds).** Triggered when banked value reaches 1.00. The empty token slot that is being recovered flashes amber, then fills with a bright white wash that settles to the standard filled-token color. Simultaneously, the banked counter rolls down (subtracting 1.00) and the recovered token slot emits a single outward ripple — a concentric ring of amber light that expands to 20px radius and fades. The "+1 recovered!" text fades in with a 4px upward drift, holds for 2 seconds, then fades out.

**Confirmation card entrance (0.6 seconds).** The confirmation card slides in from the right (same as divergence cards from 4.61). The amber border draws itself — starting from the top-left corner and tracing clockwise at a speed that completes in 0.4 seconds. The "HYPOTHESIS CONFIRMED" header fades in 0.2 seconds after the border completes. The refund amount appears last, 0.1 seconds after the header.

### Audio

**Refund chime — two-note ascending (C5 to E5).** Played on fractional refund (no full token recovery). Duration: 0.4 seconds. Instrument: synthetic bell with warm overtones, slight reverb. The sound is quiet — 60% of the volume of the standard THOROUGH completion sound. It should feel like a small, satisfying return, not a celebration.

**Recovery chime — three-note ascending (C5 to E5 to G5).** Played on full token recovery (banked value reached 1.00). Duration: 0.6 seconds. Same instrument as the refund chime, but with an added harmonic on the G5 — a slight shimmer, like a bell that rings true. Volume: 80% of the standard THOROUGH completion sound. This is a more significant moment — a full token returned — and the audio reflects that.

**Silence on divergence.** When THOROUGH diverges from QUICK, no refund chime plays. The divergence has its own audio cues (defined in 4.61). The absence of the refund chime is itself a signal — the player learns to associate silence-after-THOROUGH with "I got new information" and the chime with "I got confirmation plus a partial refund." Over time, the chime becomes a Pavlovian indicator: the sound means "QUICK was right, and you got something back."

### Typography

**"HYPOTHESIS CONFIRMED" header.** Set in the same monospace typeface used throughout the Fix Explorer (the game's diagnostic interface font). All caps. Letter-spacing: 0.08em. Color: amber (#D4A855). Weight: bold. This header is the most prominent text element on the confirmation card — it should be readable at a glance.

**"Confirmation is diagnostic work."** Set in the body typeface (sans-serif, regular weight). Color: soft white (#CCCCCC). Slightly smaller than the header. This line is the pedagogical payload — it must be readable but not dominant. It occupies the same visual weight as a tooltip: present, legible, not shouting.

**Banked display numerics.** Monospace. Two decimal places always shown (0.60, not .6 or 0.6000). Color: grey (#8A8A8A), switching to amber (#D4A855) briefly on update. The fractional precision communicates that the system is tracking carefully — the player's partial contributions are not rounded away or lost.

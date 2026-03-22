# Voluntary Compute Budget Cap as an Advanced-Mode Option

**Aspect:** 4.76 — Voluntary compute budget cap as an advanced-mode option: a late-game setting letting unlimited-compute players re-enable a personal budget cap; supports players who find constrained budgets promote better diagnostic discipline; "I wish I still had the cap" experience as a designed late-game option; interaction with accessibility design and player-controlled difficulty.

**Parent:** 4.60 — Search budget as a player resource
**Siblings:** 4.74 — Diagnostic efficiency leaderboard metric; 4.75 — Token debt recovery mechanic; 4.77 — Compute budget as Gauntlet meta-resource
**Related:** 4.40 — "First viable fix" vs. "minimum fix" toggle; 4.58 — Pre-ranking transparency panel; 4.61 — QUICK vs. THOROUGH explainer; 4.36 — Multi-scenario fix explorer; 8.09 — Diagnostic layer as teaching mechanic; 5.22 — The Gauntlet as a third act; 8.03d — Mode shock tonal transition

---

## The Core Problem

The search budget mechanic (4.60) works. It creates genuine diagnostic decisions during early and mid-game. Players learn to form hypotheses before spending THOROUGH tokens. They develop pre-ranking drawer literacy. They ration MSMFE runs for missions that warrant them. The budget teaches the most important skill in the game: deliberation before computation.

Then they unlock "Unrestricted Compute."

The 4.60 exploration identified this explicitly in Zara's journey: "Sometimes I wish I still had the cap. The scarcity forced me to think before running. Now I just run everything. I'm not sure that's actually better." That observation got 94 upvotes from a fictional community. In real player behavior research, this pattern is well-documented: players who master a constraint often feel its removal as a loss, not a gain. The constraint was generating cognitive engagement they didn't realize they valued until it was gone.

**The paradox this aspect addresses:** The budget mechanic is designed to fade as the player progresses. But the best players — the ones who most fully internalized the mechanic — are exactly the ones who miss it when it's gone. They've been trained to treat compute as precious. Then the game tells them it's free. The skill they developed (deliberation under scarcity) has no structure supporting it anymore.

This is not a failure of the budget design. It's a success-state side effect. The mechanic did its job: it taught diagnostic discipline. The question is whether the game should offer a way to keep practicing that discipline voluntarily, after the training wheels are no longer mandatory.

**The deeper question:** Is voluntary scarcity a meaningful game mechanic, or is it just difficulty masochism? The answer depends entirely on whether the constraint generates different play — not harder play, but structurally different reasoning patterns. If capped players think about diagnostics differently than uncapped players, the cap is a mode, not a difficulty slider. If capped players just do the same thing but slower, the cap is artificial friction.

---

## The Design

### The Voluntary Cap System: "Diagnostic Discipline Mode"

When a player unlocks "Unrestricted Compute" — the final research node that removes the session budget — a new option appears in the Settings panel under **Diagnostic Preferences**:

```
DIAGNOSTIC DISCIPLINE MODE                          [OFF]
Re-enable a personal compute budget per session.
Some players find constrained budgets sharpen
diagnostic reasoning.

Budget level:  ●○○○○  Strict (3/session)
               ○●○○○  Standard (5/session)
               ○○●○○  Generous (8/session)
               ○○○●○  Mentor (12/session)
               ○○○○●  Custom...

Affects: THOROUGH token count per session
Does NOT affect: QUICK mode (always free),
                 research unlocks, Gauntlet ranking
```

The toggle is a simple on/off. When enabled, the player's compute budget bar reappears in the Fix Explorer UI — the same bright-white squares they remember from early game. The infinity symbol is replaced by the familiar token count.

### Cap Levels

Five preset levels, plus custom:

| Level | Tokens/Session | MSMFE Cost | Intended For |
|-------|----------------|------------|--------------|
| **Strict** | 3 | 3 (entire budget) | Players who want maximum deliberation pressure. Running MSMFE means zero remaining THOROUGH for the session. Every token is a hard decision. |
| **Standard** | 5 | 3 | The mid-game experience revisited. Enough for meaningful diagnostic work, tight enough to force prioritization. Most popular among returning-cap players. |
| **Generous** | 8 | 3 | Light constraint. Players who want a soft reminder to think before running, not a hard restriction. Rarely runs out in a typical session. |
| **Mentor** | 12 | 3 | For players who are teaching newer players and want to model budget discipline. Enough tokens that the cap never actually constrains them, but the visible bar reminds them to narrate decisions. |
| **Custom** | 1–20 | 1–5 | Full control. The player sets both total tokens and MSMFE cost. For challenge runners and community leaderboard participants who run on extreme budgets. |

### The Cap Toggle UI

The toggle lives in Settings, not in the Fix Explorer. This is deliberate. The decision to enable or disable the cap should be a session-start reflection, not a mid-analysis panic switch. A player cannot toggle the cap during a debrief session — it's locked once the session begins.

When the player enables Diagnostic Discipline Mode:

1. **Session start:** The boot log includes a new line: `COMPUTE ALLOCATION: Voluntary cap active — [N] THOROUGH tokens loaded.` The line is displayed in the same amber text as system parameters, not in Predecessor voice. It's a system setting, not a narrative event.

2. **Fix Explorer:** The compute budget bar reappears above the Run Analysis button. Identical visual language to the early-game bar: bright-white filled squares, dim grey hourglass empties. One difference — a small voluntary icon (a tiny toggle switch glyph, 8x8px) appears to the left of the bar, distinguishing it from the mandatory early-game budget.

3. **Session end:** A brief summary appears in the debrief notes: `Session diagnostic efficiency: 4/5 tokens spent. 2 THOROUGH confirmations, 2 THOROUGH discoveries.` This summary is new — it doesn't appear for uncapped players. It gives the capped player a concrete record of how well they spent their budget.

### The "Discipline Score"

When Diagnostic Discipline Mode is active, the game tracks a secondary stat: **Discipline Score**. This measures the ratio of productive THOROUGH spends (those that found a different result from QUICK) to total THOROUGH spends.

```
DISCIPLINE SCORE THIS SESSION: 0.67
  3 THOROUGH runs
  2 found different result from QUICK (productive)
  1 confirmed QUICK result (confirmatory)

CAREER DISCIPLINE SCORE: 0.71 (top 12% of capped players)
```

A productive THOROUGH spend — one where THOROUGH found a smaller fix than QUICK — means the player correctly identified that the QUICK result was insufficient. Their pre-run hypothesis was correct: "QUICK might be wrong here." A confirmatory spend means the player's hypothesis was wrong: "I thought QUICK would miss something, but it didn't."

The Discipline Score is not a punishment for confirmatory runs. Confirmation is valid diagnostic practice. But a high Discipline Score means the player has strong pre-run judgment — they can predict when THOROUGH will add value. This is the skill the budget mechanic was designed to teach.

The Discipline Score is visible only to the player. It's not on any public leaderboard. It's a personal metric, like a speedrunner's personal best. The purpose is self-assessment, not competition.

### Interaction with Token Debt Recovery (4.75)

When Diagnostic Discipline Mode is active, the token debt recovery mechanic (4.75) takes on new significance. Under 4.75, a confirmatory THOROUGH spend (one that matches QUICK) generates a 0.5 token partial refund. Two confirmations return 1 token.

For a capped player on Strict (3 tokens): a confirmatory spend costs only 0.5 effective tokens. This means a player who is uncertain about QUICK's result has a lower-stakes path — spend the token, and if QUICK was right, you get half back. The refund mechanic softens the punishment for confirmatory runs while still creating the deliberation the cap is designed to generate.

For an uncapped player: token debt recovery is meaningless (unlimited is unlimited). The 4.75 mechanic only has teeth when the budget is finite — making the voluntary cap and the recovery mechanic natural partners.

### Interaction with Gauntlet Meta-Resource (4.77)

In competitive Gauntlet (4.77), compute budget is a shared resource: both players have the same token count. If one player has voluntarily capped their budget, they're competing with the same constraint as their opponent.

The voluntary cap creates an interesting Gauntlet option: **Capped Gauntlet.** A matchmaking filter that pairs only capped players. Both players have the same voluntary budget. The constraint is symmetric, so no competitive disadvantage exists. The Capped Gauntlet becomes a separate competitive ladder — a "purist" mode where diagnostic discipline is the primary skill axis.

```
GAUNTLET MATCHMAKING
  ○ Open (any budget)
  ● Capped (5-token matches only)
  ○ Strict (3-token matches only)
```

Capped Gauntlet matches display the token bar for both players (anonymized until match end). The tension of watching your opponent's token count tick down — "they spent 3 already, I still have 4" — adds a resource-management spectator layer.

---

## Player Journeys

### Journey: Zara, 22, CS student, Week 16, Post-Unrestricted

**Context:** Zara unlocked Unrestricted Compute four weeks ago. She's in the top 200 Gauntlet players. She wrote the forum post about budget discipline that got 94 upvotes. She's been playing uncapped for a month. Something has changed.

---

**Minute 0:00 — The Realization**

Zara opens a Gauntlet practice debrief. Her pass rate: 88%. She needs to push to 92% to break into the top 150. She runs the Fix Explorer. QUICK result: "FIRST VIABLE FIX: HOOK-3, trigger threshold –1 tick."

She doesn't look at the pre-ranking drawer. She goes straight to THOROUGH. 28 seconds. Result: same fix. HOOK-3, trigger threshold –1 tick.

She runs THOROUGH again on the next failure cluster. Same fix. She runs it a third time on a different scenario subset. Same fix.

She's spent three THOROUGH runs confirming what QUICK told her in 4 seconds. She didn't form a hypothesis before any of them. She didn't check the drawer. She just ran the expensive tool because it was free.

She pauses. Opens the pre-ranking drawer for the first time this session. Pivot-active: 0.93. Recency: 0.85. Volatility: 0.12. Low volatility, high recency, high pivot-activity — the classic "this is the obvious fix" signature. QUICK was always going to find it. She knew this pattern. She ignored it because THOROUGH was free.

She opens Settings. Scrolls to Diagnostic Preferences. She sees it for the first time:

```
DIAGNOSTIC DISCIPLINE MODE                          [OFF]
Re-enable a personal compute budget per session.
```

She reads the description. She hovers over the cap levels. Standard: 5 per session. That's what Tomás has. She remembers coaching him on token rationing. She remembers how carefully he reads the drawer before every spend.

She enables it. Standard. 5 tokens.

---

**Minute 0:30 — The Toggle**

A small confirmation appears: "Diagnostic Discipline Mode: ON. Budget: 5 THOROUGH tokens per session. This takes effect at the start of your next session."

She can't change it mid-session. Good. If she could, she'd turn it off the moment she runs out.

She finishes the current session uncapped. Her THOROUGH usage for the session: 11 runs. Her Discipline Score — shown retroactively — is 0.27. Three of her eleven THOROUGH runs found something different from QUICK. Eight were confirmatory.

```
DISCIPLINE SCORE THIS SESSION: 0.27
  11 THOROUGH runs
  3 productive (found different result from QUICK)
  8 confirmatory (confirmed QUICK result)
```

She stares at 0.27. She knows the early-game players she coaches average 0.55-0.65. They have better diagnostic discipline than she does. The cap she discarded made them sharper than she is now.

---

**Minute 2:00 — The Next Session**

New session loads. The boot log:

```
> COMPUTE ALLOCATION: Voluntary cap active — 5 THOROUGH tokens loaded.
> Discipline Mode: Standard (5/session).
```

The Fix Explorer opens. Above the Run Analysis button, the compute budget bar is back:

```
COMPUTE BUDGET  ⚙█████  5 of 5 THOROUGH remaining this session
```

The small toggle icon (⚙) to the left distinguishes this from mandatory budgets. Five bright-white squares.

Zara's first instinct: run THOROUGH immediately. She catches herself. She has 5 tokens. She might need them later. She runs QUICK first.

QUICK result: "FIRST VIABLE FIX: RELAY-B, context buffer +2 slots."

She opens the pre-ranking drawer. Pivot-active: 0.71. Recency: 0.19. Volatility: 0.83. High volatility, low recency — this suggests RELAY-B is reacting to instability elsewhere, not causing the problem itself. The pre-ranking might be surfacing a symptom.

She decides: worth a THOROUGH token. She spends it.

THOROUGH result: "MINIMUM FIX: SCOUT-A, scan interval –2 ticks."

Different. THOROUGH found a smaller fix that QUICK missed. The pre-ranking drawer's volatility signal was right — RELAY-B was a symptom.

She applies SCOUT-A. Pass rate: 91%.

One token spent. One productive result. Discipline Score: 1.00 so far.

She smiles. She'd forgotten what it feels like to have the spend matter.

**UI Annotations:**
- Voluntary cap toggle icon: small gear-switch glyph (⚙) 8x8px, rendered in muted amber, positioned left of the token bar; distinguishes voluntary from mandatory budget
- Boot log compute allocation line: amber system text, not Predecessor voice; appears between system diagnostics and mission briefing; approximately 0.5 seconds display time during boot sequence
- Discipline Score: appears at session end in debrief notes panel; three lines — total runs, productive count, confirmatory count; score displayed as decimal to two places; no color coding (not a judgment, just a measurement)
- Session-lock confirmation: small inline dialog below the toggle in Settings; "Takes effect next session" in grey text; no modal, no alarm

---

### Journey: Kwame, 32, Twitch streamer, Month 5, Capped Gauntlet Season

**Context:** Kwame streams Robot Uprising to 4,200 regular viewers. He hit Unrestricted Compute two months ago. His stream format is "high-speed Gauntlet runs with commentary." He's noticed his commentary has gotten worse since going unlimited — he used to narrate budget decisions ("Should I spend the token?") which generated chat engagement. Now he just runs THOROUGH silently. His stream analytics show a 15% drop in chat messages per session since Unrestricted.

---

**Minute 0:00 — The Content Decision**

Kwame is planning tonight's stream. He's been thinking about the voluntary cap for a week. Three of his top-clipped moments from the last six months are budget decisions — "DO I SPEND IT CHAT? DO I SPEND IT?" with hundreds of "SPEND" and "SAVE" messages scrolling. Those clips don't happen anymore.

He enables Diagnostic Discipline Mode. Strict. 3 tokens.

He announces it at the start of stream: "Chat, we're going Strict tonight. Three tokens. That's it. You tell me when to spend."

Chat explodes. 890 messages in the first 30 seconds. "STRICT MODE KWAME" trending in the game's Discord.

---

**Minute 8:00 — The First Decision Point**

Kwame is in a Capped Gauntlet match. Both players have 3 tokens. The first debrief opens after a 71% pass rate.

QUICK result: "FIRST VIABLE FIX: HOOK-1, priority –3."

He opens the pre-ranking drawer on stream. Reads it aloud: "Pivot-active 0.82, recency 0.55, volatility 0.44. Mid-range everything. Chat, is this a THOROUGH situation?"

Chat splits. "SPEND" and "SAVE" in roughly equal volume. A subscriber types: "Volatility is mid — QUICK probably has it right. Save for later."

Kwame reads the message aloud. Pauses for four seconds — the camera on his face, the compute bar visible on screen with three bright squares.

"I'm saving it. QUICK feels right here. Let's trust the drawer."

He applies the QUICK result. Pass rate: 76%. Five-point improvement. QUICK was good enough.

```
COMPUTE BUDGET  ⚙███  3 of 3 remaining
```

Chat: "GOOD SAVE" "3 tokens clean" "discipline mode hits different"

---

**Minute 15:00 — The Crisis**

Second debrief. Pass rate dropped to 68% after opponent's configuration change. QUICK result: "FIRST VIABLE FIX: CONTEXT BUFFER, RELAY-C +1 slot."

Kwame checks the drawer. Pivot-active: 0.39. Recency: 0.91. Volatility: 0.88. Low pivot-activity, extremely high recency and volatility — this element was recently changed and is thrashing. QUICK might be chasing noise.

"Chat. 0.39 pivot-active. 0.91 recency. 0.88 volatility. This is a symptom read, not a root cause. I need THOROUGH."

He hovers over the THOROUGH option. The dropdown shows:

```
THOROUGH (1 token · ~28 sec)   ⚡ 3 remaining this session
```

He selects it. The confirmation appears: "Spend 1 compute token? You have 3 remaining."

"Spending. Chat, we're going in."

The branching animation plays. 28 seconds of the search tree growing. Kwame narrates what he sees — thick early branches (pre-ranked candidates), thinner exploratory branches deeper in the tree. Chat is engaged — they're watching the animation with him, seeing the search literally explore.

Result: "MINIMUM FIX: SCOUT-A, scan priority +4 ticks."

Different from QUICK. THOROUGH found a different fix entirely. "SCOUT-A! Chat, QUICK said RELAY-C but THOROUGH says SCOUT-A. The drawer was right — RELAY-C was a symptom. Let's go."

He applies SCOUT-A. Pass rate: 79%.

```
COMPUTE BUDGET  ⚙██░  2 of 3 remaining
```

Chat: "THOROUGH CLUTCH" "productive spend W" "discipline score going up"

---

**Minute 22:00 — The Budget Cliff**

Third debrief. Pass rate: 83%. Two tokens remaining. He wants to run MSMFE to find a cross-scenario fix, but MSMFE costs 3 tokens on Strict and he only has 2.

```
MSMFE    (3 tokens · ~2 min)   ✗ requires 3 tokens (you have 2)
```

MSMFE is greyed out. Chat notices before he does: "NO MSMFE" "strict mode pain" "should have gone Standard"

Kwame laughs. "This is what Strict mode IS. I can't MSMFE. I have two single THOROUGH runs left. Let's make them count."

He runs QUICK. Studies the drawer for 15 seconds on stream — an eternity in Twitch time, but chat is watching him think, not waiting for an animation. He reads each pre-ranking signal aloud. He forms a hypothesis: "I think the remaining failures are distributed across scenario types. THOROUGH won't find a universal fix. I'm going to save my tokens."

He applies the QUICK result. Pass rate: 86%.

One more debrief. He has the choice: spend 1 token for a final THOROUGH, or trust QUICK and enter the next match with 2 tokens banked.

He trusts QUICK. Applies it. Pass rate: 89%.

Final compute bar:

```
COMPUTE BUDGET  ⚙██░  2 of 3 remaining
```

He finished the match spending only 1 of 3 tokens. Discipline Score: 1.00 — his only THOROUGH spend was productive.

Chat: "CLEAN" "1 spend 1 productive" "discipline score perfect"

The clip — "discipline score perfect" — gets 12,000 views. It's not a flashy combat moment. It's a streamer demonstrating that he knew when not to spend.

**UI Annotations:**
- Capped Gauntlet matchmaking filter: three radio buttons in queue screen; shows opponent's cap level after match (not during); both players' token bars visible on spectator view but anonymized ("Player 1: 2/3, Player 2: 3/3")
- MSMFE greyed-out state: the three small token squares in the dropdown are dim grey; the option text shifts to 40% opacity; a small "requires N tokens" note appears in amber beneath the cost indicator
- Stream overlay compatibility: the compute budget bar has a transparent background option for OBS capture; streamers can position it independently of the Fix Explorer panel; the voluntary cap icon (⚙) is visible at stream resolution (1080p minimum)
- Discipline Score on stream: appears as a small overlay in the debrief notes panel; streamers can pin it to screen with a hotkey; the score updates live as each THOROUGH result resolves

---

### Journey: Dr. Reyes, 45, professor of computer science, Month 3, Pedagogical Mode

**Context:** Dr. Reyes uses Robot Uprising as a supplementary teaching tool in her "Software Debugging" graduate seminar. She unlocked Unrestricted Compute weeks ago. She's noticed her students — who are in early-game with mandatory budgets — make better diagnostic decisions than she does in office-hour demonstrations. She wants to model budget-constrained reasoning during live classroom demos.

---

**Minute 0:00 — The Classroom Setup**

Dr. Reyes is preparing a live demo for tomorrow's class. Topic: "When to trust your hypothesis vs. when to verify." She wants to show students the difference between a well-formed hypothesis (where QUICK suffices) and a poorly-formed one (where THOROUGH reveals something QUICK missed).

She enables Diagnostic Discipline Mode. She selects **Mentor** level: 12 tokens per session. Enough that she won't run out during a 50-minute class, but visible enough that the budget bar creates a frame for discussion.

Boot log:

```
> COMPUTE ALLOCATION: Voluntary cap active — 12 THOROUGH tokens loaded.
> Discipline Mode: Mentor (12/session).
```

She projects the game on the lecture hall screen. The compute budget bar is visible in the Fix Explorer. Twelve bright-white squares.

---

**Minute 5:00 — The Demonstration**

She opens a debrief at 58% pass rate. QUICK result: "FIRST VIABLE FIX: HOOK-2, trigger threshold +2 ticks."

She turns to the class: "Before I decide whether to run THOROUGH, what does the pre-ranking drawer tell me? What's my hypothesis about whether QUICK is right?"

A student reads the drawer: "Pivot-active 0.91, recency 0.04, volatility 0.78."

Dr. Reyes: "Low recency. This element hasn't been changed recently. But high pivot-activity and high volatility. What does that combination suggest?"

Another student: "It's reacting to something else. It's a downstream effect, not the root cause."

Dr. Reyes: "Good hypothesis. Let's test it." She spends a THOROUGH token. The class watches the branching animation together.

THOROUGH result: "MINIMUM FIX: RELAY-A, context buffer –1 slot."

Different. The student's hypothesis was correct — HOOK-2 was a downstream symptom.

Dr. Reyes points to the compute bar: "I spent one of twelve tokens. Was it worth it?"

The class discusses. The THOROUGH spend was productive — it found a different, smaller fix. The student's reading of the pre-ranking drawer correctly predicted that QUICK would be wrong. The token spend validated a diagnostic reasoning process, not just a diagnostic tool.

She points to the Discipline Score in the debrief notes: "1 run, 1 productive. Discipline Score: 1.00. This number measures whether I'm forming good hypotheses before spending. If I'd spent the token and THOROUGH found the same thing as QUICK, my score would be 0.00. The score isn't about being right — it's about knowing when verification will teach me something new."

---

**Minute 25:00 — The Intentional Waste**

She runs a second scenario. QUICK result: "FIRST VIABLE FIX: SCOUT-B, scan interval –1 tick."

Pre-ranking drawer: Pivot-active 0.95, recency 0.90, volatility 0.11. High pivot-activity, high recency, very low volatility. The classic "obvious fix" signature.

Dr. Reyes: "Class, my hypothesis: THOROUGH will find the same thing. This is a straightforward fix with strong signals. I'm going to spend a token anyway, so you can see what a confirmatory result looks like."

She spends. THOROUGH: same fix. SCOUT-B, scan interval –1 tick.

```
DISCIPLINE SCORE THIS SESSION: 0.50
  2 THOROUGH runs
  1 productive
  1 confirmatory
```

"Discipline Score dropped from 1.00 to 0.50. I predicted THOROUGH would confirm — and it did. Was this a waste?"

A student argues yes: "You could have just applied the QUICK result."

Another argues no: "Confirming validates your hypothesis about the drawer. You learned that your reading of the pre-ranking signals is accurate."

Dr. Reyes nods. "Both are right. The score measures prediction accuracy, not diagnostic value. Sometimes confirmation is worth the token. Sometimes it isn't. The point is: I knew what I expected before I spent. That's the discipline the budget teaches — not 'don't spend,' but 'know why you're spending.'"

The budget bar:

```
COMPUTE BUDGET  ⚙██████████░░  10 of 12 remaining
```

She has plenty of tokens for the rest of class. The Mentor level ensures she's never actually constrained. But the visible bar, the score, the explicit decision to spend — these create a pedagogical frame that unlimited compute cannot.

**UI Annotations:**
- Mentor-level budget bar: 12 squares, visually wider than Standard (5) but using the same square-size; the bar extends further across the Fix Explorer header; each square remains 12x12px with the same bright-white fill and dim-grey empty states
- Discipline Score in debrief notes: three-line summary identical to other cap levels; appears regardless of cap level; at Mentor level, the score is typically high (the player rarely runs out); its pedagogical value is in the visibility, not the constraint
- Classroom projection: the Fix Explorer renders well at 1080p projection resolution; the compute budget bar uses high-contrast white-on-dark-grey; the pre-ranking drawer text size is configurable in Accessibility settings for lecture-hall legibility

---

## Strengths

**Honors the player's earned skill.** The voluntary cap doesn't take anything away. The player has earned Unrestricted Compute. The cap is an option, not a regression. This framing is critical — it's "I choose to play this way" not "the game took my unlock away." The toggle's placement in Settings, not in the Fix Explorer, reinforces this: it's a deliberate preference, not an in-the-moment compromise.

**Creates a late-game strategic identity.** Uncapped players and capped players develop different diagnostic patterns. Capped players read the pre-ranking drawer more carefully. Uncapped players explore more broadly. Both are valid. The voluntary cap gives late-game players a way to identify with a diagnostic style — "I'm a Strict-3 player" becomes a statement about how you think, not just how many tokens you have.

**Generates streaming and community content.** Kwame's journey demonstrates this directly. Budget decisions are more engaging to watch than unlimited diagnostics. The voluntary cap gives streamers a built-in dramatic structure: the token count is a visible resource that the audience can track, predict, and react to. "SPEND or SAVE" is a better Twitch chat interaction than "she ran THOROUGH again."

**Supports pedagogical use without requiring it.** Dr. Reyes uses the Mentor level for classroom demos. The game doesn't market itself as an educational tool — but the voluntary cap, by making diagnostic decisions visible and structured, naturally supports teaching contexts. The Discipline Score is a ready-made discussion prompt.

**Extends the budget mechanic's lifespan.** Without the voluntary cap, the budget mechanic is a mid-game feature that dissolves in late game. With the cap, the mechanic can be permanent for players who want it. This means the budget design (4.60) remains relevant across the full player lifecycle — it's not just a tutorial that expires.

**Enables Capped Gauntlet as a competitive format.** The voluntary cap creates the possibility of a separate competitive ladder where both players operate under the same constraint. This is a genuine new competitive mode, not a handicap. Symmetric constraints create different meta-games — Capped Gauntlet rewards pre-ranking literacy and hypothesis formation more than raw THOROUGH volume.

---

## Weaknesses

**Risk of "real gamers play capped" gatekeeping.** If the community decides that voluntary caps are the "hardcore" way to play, uncapped players may feel implicitly judged. The game must be careful not to reward capped play in ways that make uncapped play feel inferior. Discipline Score should remain private. Capped Gauntlet should be a separate ladder, not a replacement for open Gauntlet. The toggle's framing ("Some players find...") is deliberately neutral.

**Complexity creep in an already-complex system.** The Fix Explorer already has QUICK, THOROUGH, MSMFE, the pre-ranking drawer, the explainer panel, the signal genealogy link. Adding a voluntary cap with five levels, a Discipline Score, and a Capped Gauntlet mode is more system surface area. Each new element competes for the player's attention. The cap must be tucked away in Settings, not surfaced proactively. It's an opt-in for players who seek it, not a prompt for everyone.

**The Discipline Score may become a source of anxiety.** Even as a private metric, a score that measures "how well you predicted THOROUGH's value" can create performance pressure. Players may avoid spending tokens to protect their Discipline Score — the opposite of the mechanic's intent. The score should be presented as a reflection tool, not a rating. No trend graphs, no career-high notifications, no "your score dropped" alerts.

**Session-lock prevents mid-session course correction.** If a player enables Strict (3 tokens) and realizes mid-session they need more, they can't switch. This is by design — the constraint should be real. But it may frustrate players who misjudge their needs. The session-lock prevents the cap from being a "difficulty I can remove whenever I'm stuck" option, but it also prevents legitimate re-evaluation.

**Custom level invites degenerate values.** A custom cap of 20 tokens is functionally unlimited for most sessions. A custom cap of 1 token is a challenge run, not a diagnostic practice tool. The custom range should have a floor (2) and a ceiling (15) to prevent the mechanic from being trivially gamed in either direction.

---

## Interaction Effects

**With 4.60 (Search budget as player resource):**
The voluntary cap is the endgame extension of 4.60. The mandatory budget trains the skill; the voluntary cap preserves the practice environment for players who want it. The two mechanics share the same UI — token bar, spend confirmation, session reset — ensuring visual continuity. A player returning to capped play after months of unlimited should feel instant recognition: "I know this bar."

**With 4.74 (Diagnostic efficiency leaderboard metric):**
The diagnostic efficiency metric (4.74) tracks "average THOROUGH tokens spent per session for a given pass rate." For uncapped players, this metric is unbounded — they can spend dozens of tokens. For capped players, the metric is naturally constrained — spending 3 of 3 tokens is 100% utilization, not 3 out of infinity. The voluntary cap gives the efficiency metric a meaningful denominator. Capped players' efficiency scores are more legible: "She solved it spending 2 of 5" is clearer than "She solved it spending 2 of unlimited."

**With 4.75 (Token debt recovery):**
Token debt recovery only matters when tokens are finite. For uncapped players, 4.75 is invisible. For voluntarily-capped players, 4.75 becomes a real mechanic again: a confirmatory THOROUGH spend returns 0.5 tokens, softening the Discipline Score penalty for confirmation runs. The voluntary cap and token debt recovery are symbiotic — the cap creates the scarcity, the recovery creates the partial safety net within that scarcity.

**With 4.77 (Compute budget as Gauntlet meta-resource):**
The voluntary cap enables Capped Gauntlet — a symmetric competitive mode. In open Gauntlet (4.77), one player might be capped and the other unlimited, creating asymmetry. Capped Gauntlet matchmaking ensures both players operate under the same constraint. The meta-game shifts: in open Gauntlet, raw diagnostic volume matters. In Capped Gauntlet, diagnostic judgment matters more than volume. The two ladders attract different player populations with different skill profiles.

**With 8.09 (Diagnostic layer as teaching mechanic):**
The budget mechanic is part of the teaching arc (8.09). The voluntary cap extends the arc past its designed endpoint. If the teaching arc is: (1) QUICK only, (2) limited THOROUGH, (3) unlimited THOROUGH — the voluntary cap adds a fourth phase: (4) voluntary return to limited THOROUGH as a self-directed practice mode. This is the difference between a tutorial (phases 1-3) and a discipline (phases 1-4). The voluntary cap transforms the budget from a scaffolding to a practice tool.

**With 8.03d (Mode shock tonal transition):**
The voluntary cap also interacts with the campaign-to-Gauntlet transition. Players who enter Gauntlet with Unrestricted Compute may find the open format overwhelming — too many diagnostic options, no structure. Enabling a voluntary cap before their first Gauntlet match gives them familiar structure in an unfamiliar competitive environment. The cap is a comfort object during mode shock.

**With accessibility design:**
The voluntary cap must respect accessibility settings. Players using screen readers should hear the token count announced before each spend decision. Players using simplified UI modes should see the cap toggle in the same Settings location, not buried behind progressive disclosure. The cap is an accessibility-adjacent feature: it reduces cognitive load by constraining options, which benefits players who find unlimited choices overwhelming.

---

## Comparable Games and Media

**Celeste — Assist Mode as player-controlled difficulty:**
Celeste lets players adjust game speed, add dashes, and enable invincibility through Assist Mode. The mode is framed as: "This is your game. Play it how you want." No judgment. No reduced rewards. The voluntary cap should use the same framing. Celeste proved that player-controlled difficulty doesn't diminish the game — it extends its audience. The key lesson: never call the option "easy mode" or "hard mode." Call it what it is. "Diagnostic Discipline Mode" is a practice description, not a difficulty label.

**Slay the Spire Ascension — voluntary difficulty escalation:**
After beating the game, Slay the Spire unlocks Ascension levels that add difficulty modifiers. Players choose to make the game harder because the base game no longer generates the tension they want. The voluntary cap is the same impulse — "the game is too easy with unlimited compute, I want the constraint back." Ascension levels are numbered and community-recognized: "I cleared A20" is a status statement. Strict-3 cap could serve the same function: "I run Gauntlet on Strict-3" is a diagnostic skill declaration.

**Chess clock — voluntary time pressure as skill test:**
In casual chess, there's no clock. In competitive chess, the clock creates time pressure that transforms the game. Blitz chess (3-5 minutes per player) is not "chess with less time" — it's a different game that rewards pattern recognition over deep calculation. The voluntary cap is Robot Uprising's clock: it transforms the diagnostic experience from "exhaustive search" to "deliberate search." Capped Gauntlet is to open Gauntlet as blitz is to classical chess.

**Ironman modes in strategy games (XCOM, Stellaris, Civilization):**
Many strategy games offer "Ironman" mode — no save-scumming, one save file, every decision is permanent. Players choose this mode because the permanence makes decisions meaningful. The voluntary cap is a diagnostic Ironman: every token spend is permanent for the session. No "undo" — the token is gone. The permanence creates the weight.

**Speedrunning — voluntary constraint as community practice:**
Speedrunners impose constraints the game doesn't require: any%, 100%, no-glitch, low%. The constraints create structure that generates community, competition, and content. The voluntary cap's custom level (1-20 tokens, 1-5 MSMFE cost) is the game's built-in "category" system. Community-defined cap profiles ("The Purist: Strict-3, MSMFE cost 3") could emerge naturally, like speedrun categories.

**Real engineering — self-imposed review limits:**
Senior engineers sometimes impose voluntary constraints on their debugging process: "I'll look at the logs for 15 minutes before I attach a debugger." "I'll read the code for 30 minutes before I run it." These self-imposed limits develop diagnostic intuition. The voluntary cap is the game version of this real engineering practice — limiting the expensive tool to develop intuition with the cheap tool.

---

## Sensory Description

**The voluntary cap toggle — in Settings:**

The toggle is a horizontal switch, 48x24px, positioned to the right of the "DIAGNOSTIC DISCIPLINE MODE" label. Off state: the switch track is dark grey (#2a2d2f), the switch knob is a muted neutral circle. On state: the track glows a warm amber (#d4a853), the knob slides right with a 200ms ease-out transition. The amber is not the game's alert-red or error-amber — it's a warm, contemplative amber, closer to firelight than to warning. The sound on toggle: a soft mechanical click, like a brass switch being thrown. Precise. Deliberate. Not loud.

When the toggle turns on, the five cap level options animate in below: a 300ms slide-down reveal, each level appearing with a 40ms stagger. The radio buttons are small circles, 10px diameter. Selected level: filled with the same warm amber. Unselected: hollow with a 1px amber border. The custom option has a small text input that appears when selected, with a numeric stepper (up/down arrows) for token count and MSMFE cost.

**The voluntary cap icon (⚙) on the budget bar:**

A tiny gear-switch glyph, 8x8px, rendered in muted amber (#d4a853 at 60% opacity). Positioned to the left of the first token square, with 4px spacing. It's unobtrusive — visible on close inspection, invisible at a glance. Its purpose is to distinguish voluntary from mandatory budgets for the player who cares about the difference. It does not animate, does not pulse, does not glow. It's a quiet marker.

**The Discipline Score — session-end reveal:**

The Discipline Score appears at the end of each capped session in the debrief notes panel. It fades in over 400ms, positioned below the session summary statistics. The score number is displayed in a monospace font, 16px, in neutral white (#e8e8e8). The breakdown lines (productive / confirmatory) are in smaller text, 12px, in grey (#888888). No color coding — a 0.27 score is the same visual treatment as a 1.00 score. The game does not judge; it reports.

If the Discipline Score improved from the previous session, a small upward-pointing triangle (▲) appears next to the score in muted green (#6b8f6b). If it decreased, a small downward triangle (▼) in muted rose (#8f6b6b). If unchanged, no triangle. The triangles are 6px tall. They're noticeable only if you're looking for them.

**The Capped Gauntlet queue screen:**

When a player selects Capped Gauntlet matchmaking, the queue screen shows the standard matchmaking animation (rotating grid pattern) with a new element: a small token bar in the center showing the cap level. Strict-3 shows three amber squares. Standard-5 shows five. The squares pulse gently at 0.5Hz — a slow heartbeat — while waiting for an opponent.

When a match is found, both players' cap levels are revealed. If they match (both Strict-3), a brief confirmation: both bars align horizontally, a connecting line draws between them, and a clean tone sounds — a unison note, two identical pitches. If they differ (one Strict-3, one Standard-5), the bars appear at different widths, a slight dissonance in the match tone — still clean, but with a perceptible interval. The matchmaking filter ensures symmetric matches in Capped Gauntlet, so the dissonant tone only appears in open Gauntlet where a capped player matches an uncapped one.

**Audio — the voluntary cap session start:**

When a capped session begins, the boot log's compute allocation line is accompanied by a brief audio motif: three ascending notes on a marimba-like instrument (a kulintang reference from the game's broader audio design), played at moderate volume, lasting 1.2 seconds. The notes are in a major key — warm, not tense. They're an acknowledgment: "You chose this. Here are your tokens."

The same three notes play in reverse (descending) when the session ends and the Discipline Score is revealed. The descending motif creates a bookend: session-start ascending = "ready," session-end descending = "complete." Players who hear the descending notes associate them with reflection.

**Audio — token spend under voluntary cap:**

The token spend sound is identical to the mandatory budget's spend sound: a soft "tick" like a switch being thrown. But with the voluntary cap, the sound has a barely-perceptible warm overtone — a harmonic that sits one octave above the base click. The difference is subliminal. A player who has heard both (mandatory in early game, voluntary in late game) might notice the warmth without being able to name it. The warmth signals: "You chose to have this constraint. This is your discipline, not the game's imposition."

At zero tokens remaining, the voluntary cap display does not alarm. No red. No warning sound. The five squares are dim grey with hourglass icons, exactly like the mandatory budget's empty state. The session-reset note appears: "Resets next session →" in calm grey text. But beneath it, a new line that only voluntary-cap players see: "Discipline Mode active. You can disable in Settings between sessions." A gentle reminder that the constraint is self-imposed and revocable — without encouraging the player to revoke it.

---

## Discovered New Aspects

1. **4.76a — Discipline Score as private skill metric:** The ratio of productive THOROUGH spends (those finding different results from QUICK) to total THOROUGH spends, tracked per session and career; designed as a self-assessment tool not a competitive metric; risk of score-protection behavior where players avoid spending to maintain score; interaction with 4.71 diagnostic efficiency leaderboard (public) vs. Discipline Score (private).

2. **4.76b — Capped Gauntlet as a separate competitive ladder:** A matchmaking mode pairing only voluntarily-capped players under symmetric budget constraints; creates a competitive format where diagnostic judgment matters more than diagnostic volume; separate rankings from open Gauntlet; interaction with 4.77 compute budget as Gauntlet meta-resource and community tournament formats.

3. **4.76c — Community-defined cap profiles:** Player-created and shared cap configurations ("The Purist: Strict-3, MSMFE-3," "The Speedrunner: Custom-2, MSMFE-1") that function like speedrun categories; discoverable through the Config Gallery (5.21); interaction with open-source architecture community and streaming content formats.

4. **4.76d — Cap-level progression challenges:** A series of optional challenges tied to specific cap levels — "Clear Mission 10 on Strict-3" or "Achieve 90%+ pass rate with Discipline Score above 0.70 on Standard-5"; rewards are cosmetic (unique voluntary-cap-themed token bar skins, amber glow variants); interaction with replayability design (5.19) and meta-progression.

5. **4.76e — Mentor-cap pedagogical toolkit:** An extension of the Mentor cap level with built-in teaching affordances — a "Pause and Discuss" button that freezes the session timer, an "Annotate Decision" text field that saves the player's reasoning for each spend/save decision, and a "Session Replay with Annotations" export for classroom review; interaction with accessibility (platform/accessibility-comprehensive.md) and the embedded document reference UI (5.16).

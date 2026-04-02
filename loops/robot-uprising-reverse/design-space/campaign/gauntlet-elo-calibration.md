# 5.22b — Gauntlet ELO Calibration Match Design

**Aspect:** 5.22b — Calibration match design for the first 5 Gauntlet matches
**Category:** Campaign / Competitive Transition
**Wave:** 5 (Campaign & Progression)

---

## The Design Question

The player has just completed Mission 10. The Warden is defeated. The boot log prints `GAUNTLET MODE AVAILABLE`. They click through. And now what? Their first five Gauntlet matches are calibration matches — the system is trying to figure out where this player belongs on the skill ladder. But the player does not know this. Or they do know this. Or they half-know it, piecing it together from the UI. Each of these states produces a radically different emotional experience.

This is the "placement anxiety" problem. League of Legends, Overwatch, and Chess.com all grapple with it: the first N matches in a competitive system carry disproportionate weight on the player's rating. Players who understand this feel pressure. Players who do not understand this feel confused when their rating later stabilizes. Players who half-understand it — the majority — feel a vague dread that something important is happening and they might be blowing it.

Robot Uprising has a unique wrinkle: the sealed watch. The player cannot intervene once EXECUTE is pressed. In League of Legends, a nervous player can still try harder — play more cautiously, ward more aggressively, pick a comfort champion. In Robot Uprising, the player's only lever is the architecture they designed *before* the match. Calibration anxiety in this game does not manifest as in-match jitters. It manifests as pre-match paralysis: endlessly tweaking blueprints, afraid to press EXECUTE because the stakes feel permanent.

The question: **How should the game handle the calibration period? Should the player know their rating is being determined? Should calibration matches feel mechanically or tonally different? And how does the system communicate rating uncertainty without triggering the paralysis that kills competitive onboarding?**

---

## How Rating Calibration Works (Technical Context)

The Gauntlet uses a Glicko-2-style rating system internally. Every player starts with a default rating (e.g., 1500) and a high Rating Deviation (RD) — the system's measure of uncertainty. High RD means the system does not know where you belong yet. Each match result adjusts the rating by a large amount (because RD is high). After approximately 5 matches, RD drops enough that rating changes become smaller and more predictable. The player has been "placed."

This is not an on/off switch. There is no moment where "calibration ends" in the math. RD decreases continuously. But perceptually, there is a phase transition: the first 5 matches swing the rating by 100-200 points per match. Match 6 onward, swings drop to 20-40. The player will feel this discontinuity whether or not the game explains it.

Chess.com handles this by hiding the rating entirely until 5 games are played — the number does not display. League of Legends uses an explicit 5-match "placement" phase with a distinct UI: a progress bar showing "Match 2 of 5" and a rank reveal at the end. Overwatch 2 historically used 10 placement matches per season (now reduced to annual placements), displaying rank only after completion. Each approach produces a different emotional signature.

---

## Option A: "Silent Calibration" — The Player Never Knows

### How It Works

There is no placement phase. No "Match 1 of 5" indicator. No special UI. The player enters the Gauntlet, plays matches, and sees their rating update after every match — starting from Match 1. The rating swings are large early on but the game does not explain why. The RD value is hidden entirely. From the player's perspective, every Gauntlet match is the same kind of match.

### The Boot Log

```
[>>] GAUNTLET — Match 01
    Opponent: Architecture #4471
    Rating: 1500
    EXECUTE when ready.
```

After the match:

```
[OK] GAUNTLET — Match 01
    Result: VICTORY
    Rating: 1500 → 1687  (+187)
```

The large jump is visible but unexplained. By Match 6, the jumps shrink:

```
[OK] GAUNTLET — Match 06
    Result: DEFEAT
    Rating: 1723 → 1691  (-32)
```

### Strengths

- **No placement anxiety.** If the player does not know these matches are special, they cannot be anxious about them being special. The architecture design process stays pure — the player tweaks blueprints because they want to win, not because they are terrified of a placement outcome.
- **Consistent experience.** Every match feels the same. No mode-within-a-mode. The Gauntlet is the Gauntlet from Match 1.
- **Honest to the math.** Glicko-2 does not actually have a discrete "placement phase." RD is continuous. Silent calibration reflects the actual system.

### Weaknesses

- **Confusion about rating volatility.** The player wins one match and gains 187 points. They win another and gain 140. Then they lose and drop 95. Then they win and gain only 35. The inconsistency feels like a bug. Without understanding RD, the player thinks the rating system is broken or rigged.
- **Missed narrative opportunity.** The campaign-to-Gauntlet transition is the game's biggest emotional moment. Treating the first 5 matches as identical to all subsequent matches wastes the chance to frame calibration as a meaningful rite of passage.
- **Retroactive regret.** Once the player learns (from community wikis, forum posts, friends) that their first 5 matches mattered more, they may regret not taking them more seriously — or resent the game for hiding this information.

---

## Option B: "The Placement Bracket" — Explicit 5-Match Calibration with Rank Reveal

### How It Works

The first 5 Gauntlet matches are visually and narratively distinct. The boot log frames them as a "calibration sequence." The player sees a progress indicator: "Calibration Match 2 of 5." No rating number is shown during calibration — only the match count and results (VICTORY/DEFEAT). After Match 5, a rank reveal screen displays the player's initial rating and tier placement.

### The Boot Log

```
[>>] GAUNTLET — CALIBRATION SEQUENCE
    The system is measuring your architecture.
    Match 2 of 5.
    Opponent: Architecture #7823
    EXECUTE when ready.
```

No rating displayed. After Match 5:

```
[OK] GAUNTLET — CALIBRATION COMPLETE
    5 matches analyzed.
    Architecture profile: Aggressive scout-relay, 
      weak late-game adaptation.
    
    ┌────────────────────────────────┐
    │   INITIAL RATING: 1687        │
    │   TIER: Signal Architect      │
    │                               │
    │   Your architecture performed │
    │   above median in 3 of 5     │
    │   calibration scenarios.      │
    │                               │
    │   [ENTER THE GAUNTLET →]      │
    └────────────────────────────────┘
```

### Strengths

- **Clear expectations.** The player knows what is happening. "These 5 matches determine my starting rank" is a clean mental model. No confusion about why early rating swings are large.
- **Narrative ceremony.** The rank reveal is a moment — a reward for completing calibration. It gives the Gauntlet entry a sense of occasion that the silent approach lacks.
- **Reduces post-calibration confusion.** The player understands from Match 6 onward why their rating changes are smaller: calibration is over, the system knows them now.

### Weaknesses

- **Placement anxiety. This is the big one.** League of Legends players famously delay their placement matches for weeks. The knowledge that "these 5 matches matter more" creates a pressure cooker. Players spend hours tweaking blueprints before Match 1 of calibration — not because they are learning, but because they are afraid of being placed too low. The sealed watch amplifies this: you press EXECUTE and then you can only watch. If your architecture fails, you cannot course-correct mid-match. You just watch it lose. During a match that "counts extra." The helplessness is acute.
- **Artificial boundary.** Glicko-2 does not actually have a 5-match boundary. The system is still calibrating at Match 6, Match 10, Match 20. Drawing a line at 5 creates a false sense that "calibration is done" when the rating will continue to be somewhat volatile for many more matches.
- **Smurf incentive.** If players know calibration matches weight more, experienced players on new accounts will deliberately optimize their calibration — picking known-strong architectures rather than experimenting. This poisons the calibration pool.

---

## Option C: "The Confidence Meter" — Visible Rating Uncertainty That Fades

### How It Works

The rating is always visible, starting from Match 1. But next to the rating number, a confidence indicator shows how certain the system is. Early on, the rating displays with wide error bars: `1500 +/- 300`. After each match, the error bars shrink. By Match 5-7, the error bars are small enough that the system removes them and displays just the number. The player watches their rating *become certain* over time.

### The Boot Log

```
[>>] GAUNTLET — Match 01
    Opponent: Architecture #4471
    Your Rating: 1500 (confidence: LOW — 1 match played)
    ████░░░░░░ certainty
    EXECUTE when ready.
```

After Match 3:

```
[OK] GAUNTLET — Match 03
    Result: VICTORY
    Rating: 1712 ± 140  (confidence: MODERATE — 3 matches)
    ██████░░░░ certainty
```

After Match 7:

```
[OK] GAUNTLET — Match 07
    Result: DEFEAT
    Rating: 1689 ± 45  (confidence: HIGH — 7 matches)
    █████████░ certainty
    
    Your rating has stabilized. The system knows your architecture.
```

### Strengths

- **Honest and educational.** The player sees the actual mathematical reality: the system is uncertain, and certainty grows. This maps directly to how Glicko-2 works. It also teaches a transferable concept — uncertainty quantification — which aligns with the game's ethos of teaching real engineering concepts through play.
- **Reduces anxiety by reframing stakes.** The wide error bars communicate "this number does not mean much yet." A loss that drops the rating from 1600 to 1450 feels less devastating when the display shows `1450 +/- 280` — the player can see that 1450 is within the noise. Compare this to Option B, where a loss in "Match 3 of 5" feels catastrophic because the player has no framework for how much a single loss matters.
- **No artificial boundary.** Certainty is continuous. There is no "calibration complete" moment — just a gradual transition from uncertain to certain. This is more truthful and avoids the false cliff of Option B.
- **Diegetically perfect.** The game is about AI systems. Rating deviation IS a real concept in AI/ML model calibration. Showing it is not breaking the fourth wall — it is extending the game's educational mission into the meta-progression layer.

### Weaknesses

- **Information overload.** A player fresh from the campaign, still learning to read the Gauntlet UI, now also needs to understand confidence intervals, plus/minus notation, and a certainty progress bar. The campaign-to-Gauntlet transition already carries cognitive load (see 8.03d Mode Shock). Adding statistical notation may overwhelm.
- **The error bars are ugly.** `1712 +/- 140` is visually noisy. It competes with the clean terminal aesthetic established by the boot log. The certainty progress bar helps, but the numerical notation clutters.
- **Some players will ignore it.** A segment of players will see `1500 +/- 300` and read only `1500`. The error bars will be invisible to them. For these players, Option C degrades to Option A — large unexplained swings — but with extra visual noise.

---

## Player Journeys

### Journey 1: "The Optimizer" — Experienced Strategy Player, First Gauntlet Entry

**Player profile:** Played Factorio, Into the Breach, Zachtronics games. Completed the campaign in one sitting. Already iterated their architecture three times during the campaign. Understands that calibration probably exists — they have played ranked games before.

**Under Option A (Silent):**
The Optimizer enters the Gauntlet and immediately recognizes the large rating swings. "Ah, high K-factor. Provisional period." They treat the first 5 matches as data-gathering: intentionally trying different architecture variants to see which performs best against real opponents, knowing the rating will stabilize later. They lose Match 2 badly — their scout-heavy config gets overwhelmed by a striker rush. They do not panic. They open the Inspector, study the replay, redesign the scout's context filters, and queue Match 3. By Match 5, they have converged on a strong architecture and their rating is approximately correct. *The silent system worked perfectly for this player because they already understood the math.* Total time in calibration: 45 minutes.

**Under Option B (Placement Bracket):**
The Optimizer sees "Calibration Match 1 of 5" and tenses. They recognize placement matches from League of Legends. They spend 20 minutes tweaking their architecture before Match 1 — not learning, just anxiety-driven micro-optimization. They win Match 1 and feel relief disproportionate to the stakes. They lose Match 2 and feel dread disproportionate to the consequence. By Match 4 they are exhausted from the emotional weight. The rank reveal at Match 5 is satisfying — "Signal Architect, 1702" — but they arrive at the same rating they would have reached under Option A, having spent twice as long and enjoyed it half as much. *The explicit bracket turned calibration from a learning opportunity into a performance evaluation.*

**Under Option C (Confidence Meter):**
The Optimizer sees `1500 +/- 300` and nods. "Glicko. Smart." They treat early matches as experiments — the wide error bars give them permission to try things. When they lose and the rating drops to 1380, they see `+/- 250` and think "noise." They iterate freely. By Match 7, the error bars narrow to `+/- 50` and they see their true rating: 1710. The confidence meter made the mathematical reality visible, which let the Optimizer do what they do best — optimize without emotional interference. *This is the best option for this player.*

### Journey 2: "The Storyteller" — Casual Player, Emotionally Attached to Campaign Agents

**Player profile:** Loved the campaign for its narrative. Named their agents. Grieved when Scout-1 (Talim) was eliminated in Mission 7. Completed the campaign over several sessions. Entering the Gauntlet because the game invited them to, not because they crave competition.

**Under Option A (Silent):**
The Storyteller enters the Gauntlet tentatively. They press EXECUTE with their campaign architecture — the one they built for Talim and the squad. They win Match 1. The rating jumps to 1687. They feel... nothing. The number is meaningless to them. They do not know what 1687 means, whether it is good, or why it jumped so much. They play Match 2 and lose. The rating drops to 1520. They feel the loss — not the rating drop, but the loss. Their agents failed. In the Inspector, they see Scout-1 getting overwhelmed by noise. They feel sad for the agent, then confused: should they redesign the agent, or is the opponent just better? The game gives them no guidance. They play 2 more matches, winning one and losing one, then stop. The rating is 1580. They never return to the Gauntlet. *The silent system gave this player nothing to hold onto. No story, no ceremony, no sense of progression.*

**Under Option B (Placement Bracket):**
The Storyteller sees "Calibration Match 1 of 5" and understands immediately: this is a test. Five challenges. A narrative arc. They lean in. Each match is a chapter. They lose Match 2 and feel the sting — but the progress bar says "Match 3 of 5" which means the story is not over. They win Matches 3 and 4. Match 5 feels like a boss fight — the final calibration match. They win. The rank reveal screen types out slowly: "Architecture profile: Defensive scout-relay with strong signal hygiene." They feel *seen*. The system described their architecture in words. The rating number (1650) matters less than the description. They screenshot it. They share it. They keep playing the Gauntlet because the placement bracket gave them a story to tell about entering it. *For this player, the explicit bracket was not anxiety — it was narrative structure.*

**Under Option C (Confidence Meter):**
The Storyteller sees `1500 +/- 300` and their eyes glaze. They do not know what this means. They play 3 matches, win 2, and the display reads `1640 +/- 160`. They still do not know what this means. The certainty bar is partially filled but it does not connect to anything they care about. They would have preferred a story. *The confidence meter is invisible to this player.*

### Journey 3: "The Anxious Perfectionist" — Competitive but Insecure Player

**Player profile:** Played League of Legends for 3 years. Peaked at Gold II. Delayed placement matches every season for weeks. Knows exactly what calibration is and dreads it. Completed the campaign carefully, optimizing every mission. Wants to enter the Gauntlet but is afraid of being "placed wrong."

**Under Option A (Silent):**
The Anxious Perfectionist enters the Gauntlet and sees no calibration indicator. Relief — or paranoia? They suspect calibration is happening but cannot confirm it. They play Match 1 with their best architecture and win. The rating jumps +187. They think: "Provisional period. I knew it." Now they are afraid. The next match matters. But wait — do they *know* the next match matters more? The game did not say so. Maybe the system is just volatile. The ambiguity is worse than certainty in either direction. They play Match 2 nervously, lose, and spiral: was that a calibration match? Was that permanent? They check forums. They find a Reddit thread titled "PSA: First 5 matches are calibration, don't throw them." Now they are furious at the game for hiding this. *The silent system turned uncertainty into conspiracy theory.*

**Under Option B (Placement Bracket):**
The Anxious Perfectionist sees "Calibration Match 1 of 5" and their stomach drops. This is League all over again. They spend 40 minutes on their architecture before pressing EXECUTE. They alt-tab to check if anyone has posted calibration strategy guides. They find one. They copy a meta architecture from the guide instead of using their own. They win 3, lose 2. The rank reveal places them at 1580. They feel it is too low — those 2 losses "ruined everything." They are now in the same headspace that made them quit League. *The explicit bracket confirmed this player's worst fears and imported all their prior trauma.*

**Under Option C (Confidence Meter):**
The Anxious Perfectionist sees `1500 +/- 300` and pauses. The error bars are enormous. They think: "So even if I lose, the rating could be anywhere from 1200 to 1800? The system does not know yet?" This is... actually calming. The wide error bars mean a single loss genuinely does not matter — not as a platitude, but as a mathematical fact visible on screen. They lose Match 1 and the rating drops to 1350 +/- 280. The range still includes 1630. They breathe. They redesign and play Match 2. By Match 5, the rating is 1640 +/- 90 and they feel ownership of the number because they watched it converge. *The confidence meter defused the anxiety by making uncertainty tangible and temporary.*

---

## Interaction Effects

### Campaign-to-Gauntlet Transition

The calibration system is the first thing a player encounters after the tonal shift described in 8.03d (Mode Shock). If the game uses "The Ceremony" transition (Approach 2 from 8.03d), the calibration design must harmonize with it. A ceremony that says "What follows is deployment" pairs naturally with Option B's placement bracket — both frame the transition as a deliberate passage. A ceremony followed by Option A's silent calibration would feel contradictory: the game made a big deal of the transition, then pretended nothing special was happening.

Option C's confidence meter pairs best with "The Fade" transition (Approach 1 from 8.03d) — both are gradual, both communicate uncertainty transparently, and neither creates a hard boundary between campaign and competitive.

### Sealed Watch Emotional Design

The sealed watch is uniquely punishing during calibration. In every other competitive game with placement matches, the player can *do something* during the match. In Robot Uprising, they press EXECUTE and watch. A calibration loss feels like watching a car crash in slow motion — you designed the car, you aimed it at the road, and now you see the flaw and cannot fix it.

This means the *Inspector* phase after calibration matches is critical. The two-act debrief (watch, then analyze) must be extra generous during calibration. Option B could extend the Inspector phase during calibration matches — more prominent "here is what went wrong" framing, perhaps even the Predecessor ghost mentor making one final appearance: "Your scout's context eviction is FIFO. Consider priority-based. This is the last time I'll intervene." A calibration-specific debrief turns the anxiety of the sealed watch into a learning cycle.

### Architecture Iteration

Calibration systems in other games (League, Overwatch) do not let you change your "build" between placement matches in any fundamental way — you pick a champion, you play. Robot Uprising is different: the player can completely redesign their architecture between every calibration match. This changes the calibration psychology entirely. Under Option B, the player might feel pressure to find "the best" architecture and stick with it. Under Option C, the visible uncertainty gives permission to experiment — the rating is not real yet anyway.

The game should explicitly encourage iteration between calibration matches. A post-match prompt in the Inspector: "You now have new information about opponent strategies. Would you like to adjust your blueprints before the next match?" This reframes calibration from "test" to "tuning" — the system is not evaluating a fixed architecture, it is evaluating the player's *ability to iterate*, which is the actual skill the game teaches.

---

## Recommendation: Option C with Narrative Scaffolding

Pure Option C (Confidence Meter) is the most mathematically honest and produces the best outcomes for the Anxious Perfectionist — the player most at risk of churning. But pure Option C fails the Storyteller, who needs narrative structure.

The hybrid: **show the confidence meter, but wrap it in boot log narrative.**

```
[>>] GAUNTLET — Match 01
    System confidence: LOW
    ██░░░░░░░░
    The system does not yet know your architecture.
    This match is a hypothesis. Win or lose, 
    the system learns.
    
    Rating: 1500 (provisional)
    EXECUTE when ready.
```

After Match 5:

```
[OK] GAUNTLET — Match 05
    System confidence: HIGH
    █████████░
    
    5 matches analyzed. The system knows your architecture.
    
    Architecture profile: Aggressive scout-relay network.
    Strong: signal routing, early detection.
    Weak: late-game context management under noise.
    
    Rating: 1687 (stabilizing)
    
    From here, each match refines.
    The large swings are over.
    Your rating is yours now.
```

The word "provisional" does the work of Option B's placement bracket without the rigid "Match 3 of 5" framing. The architecture profile description gives the Storyteller their narrative moment. The confidence bar gives the Optimizer their data. The phrase "This match is a hypothesis" gives the Anxious Perfectionist permission to lose.

No match counter. No rank reveal ceremony. Just a system that is honest about what it knows and what it does not, delivered in the voice of a terminal that has been talking to the player for 10 missions already.

---

## Comparable Games Reference

| Game | Calibration Matches | Visibility | Anxiety Level | Key Lesson |
|------|---------------------|-----------|--------------|------------|
| League of Legends | 5 per split | Progress bar, rank hidden until complete | Very high — players delay for weeks | Explicit placement creates performance pressure |
| Overwatch 2 | 10 initially, now annual | Rank hidden during placement | High — amplified by team blame | Frequent resets erode investment in rank |
| Chess.com | Rating hidden for first 5 games | No rating displayed, then sudden appearance | Low-moderate — 1v1 removes social pressure | Hiding the number reduces fixation on it |
| Dota 2 | ~10 matches, Glicko-based | Rank hidden, then calibrated | Moderate — MMR is semi-visible | Uncertainty-aware systems produce fairer matches |
| StarCraft 2 | 5 placement matches per season | "Placement Match" label, league reveal | Moderate — 1v1 context reduces blame | Architecture games (like SC2, like Robot Uprising) have less social anxiety than team games |

The critical insight from this survey: **team games produce worse placement anxiety than 1v1 games.** In League and Overwatch, a calibration loss can be blamed on teammates, but the rank penalty is still personal — a toxic combination. Robot Uprising is 1v1 (architecture vs. architecture), which puts it closer to Chess.com and StarCraft 2. The anxiety is real but the social amplifier is absent. This means the game can afford more transparency about calibration without triggering the worst-case anxiety spirals seen in team games.

---

## Open Questions

1. **Should calibration match opponents be curated?** Rather than random matchmaking, the first 5 opponents could be selected to test specific architectural weaknesses: one opponent with heavy noise (tests context management), one with rush strategy (tests early-game), one with command agents (tests architectural depth). This produces a more accurate calibration but feels "designed" rather than organic.

2. **Can the player replay calibration?** If a player is unhappy with their placement, can they reset and recalibrate? This is common in competitive games (season resets) but dangerous for anxiety: "I should reset and try again" becomes a loop. The recommendation is no — the rating is continuous, there is no reset, only iteration.

3. **What happens if the player stops during calibration?** If they play 2 matches and leave for a week, does the RD grow (as Glicko-2 specifies for inactivity)? The confidence meter would show regression: `██████░░░░` dropping back to `████░░░░░░`. This could feel punitive. The game should freeze RD decay during the first 10 matches to prevent "use it or lose it" pressure during onboarding.

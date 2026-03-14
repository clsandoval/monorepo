# Concentration Threshold Calibration for Dense Opponent Pools

**Aspect:** 4.69e-vi — Concentration threshold calibration for dense opponent pools: false adversarial detection in small competitive ladders where players naturally match against same opponents repeatedly; graduated concentration thresholds based on opponent pool size; "expected concentration at N matches" as contextual denominator.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-v — Adversarial density as career season metric (APS); 4.69e-vii — Per-cluster adversarial exclusion; 4.69e-viii — Tag expiry and automatic sunset; 4.69e-iii — Per-opponent threshold override
**Related:** 4.69e-iii-a — Compound adversarial detection; 4.69e-v-c — APS false inflation from small opponent pools; 1.14 — Auto Chess TFT matchmaking analysis; 7.10 — Necropsy culture

---

## The Core Problem: Small Pools Make Everyone Look Adversarial

The adversarial detection system — concentration caps (4.69e-iii), compound detection (4.69e-iii-a), APS scoring (4.69e-v) — was designed assuming a reasonably large opponent pool. When a player has 50 distinct opponents in a season and IronPulse99 contributes 45% of STRIKER-A's cluster, that's a screaming signal: IronPulse99 played only ~8% of the player's matches but dominates the cluster at 5.6× their expected frequency. The concentration is suspicious *because the denominator is large*.

But what happens in a competitive ladder with 12 active players?

In a 12-player bracket where the matchmaker distributes roughly evenly, each opponent appears in ~9% of matches (100% / 11 opponents). A player who plays 40 matches in a season faces each opponent approximately 3-4 times. If one opponent happens to play a config that stresses RELAY-B's context buffer, and that player appears in 3 of the 4 RELAY-B cluster elements — that's a 75% concentration. The cap threshold fires. The APS computation adds a tagged opponent. The compound detection starts checking pairs.

**But there's nothing adversarial happening.** In a 12-player pool, 75% concentration from one opponent can arise from pure chance. With only 40 total matches and 11 opponents, the variance in match-opponent distribution is enormous. Three matches against the same player in a 40-match season is 7.5% of total matches — barely above the 9% expected frequency. The "adversarial" signal is actually just the small-number problem: high concentration emerges naturally when the denominator is small and the sample size is low.

**The current system has no concept of "expected concentration given pool size."** Every threshold — the 50% default cap, the 40% pairwise removal gate, the APS density calculation — operates on absolute percentages. A 60% concentration means the same thing whether you have 200 opponents or 8. This is statistically incoherent.

**The damage:** In small brackets, every player looks somewhat adversarial to every other player. False positives cascade: false tags inflate APS, inflated APS triggers redesign warnings (4.69e-v-e), unnecessary redesigns waste player time, and the diagnostic system loses credibility. In the worst case, the player learns to ignore adversarial warnings entirely — which means they'll also miss *real* adversarial targeting when it happens.

---

## The Statistical Foundation: Expected Concentration

If a player plays M total matches against N distinct opponents with a uniform distribution, the expected concentration of any single opponent in any single cluster is:

```
E[concentration] ≈ 1/N
```

But clusters don't sample uniformly from the match set — they sample from matches that produced a specific diagnostic outcome (e.g., RELAY-B's fallback filter fired). If that outcome occurs in K matches out of M, and the opponents in those K matches are drawn proportionally to overall match frequency, then the expected per-opponent concentration in the cluster is still approximately 1/N.

**The key insight:** what matters isn't the raw concentration but the *excess concentration* above expected:

```
excess_concentration = observed_concentration - expected_concentration
                     = observed_concentration - (1/N)
```

And the *significance* of that excess depends on the sample size (number of cluster elements):

```
significance ≈ excess_concentration / sqrt(expected_concentration × (1 - expected_concentration) / K)
```

Where K is the number of elements in the cluster. This is a standard binomial proportion test — is this opponent overrepresented in this cluster beyond what chance would produce?

**In a 12-player pool (N=11 opponents), expected concentration = 9.1%.** A 50% concentration cap fires at 50% — which is 5.5× the expected frequency. In a large pool (N=100), expected concentration is 1%, and the same 50% cap fires at 50× expected. The absolute threshold doesn't scale.

**In a 200-player pool (N=199), expected concentration = 0.5%.** A player at 15% concentration is 30× overrepresented — highly suspicious. But 15% is *below* the default 50% cap, so the system doesn't flag it at all. **The absolute threshold fails in both directions:** too sensitive in small pools, too permissive in large ones.

---

## Option A: The Contextual Denominator — "Expected Concentration at N"

### How It Works

Replace all fixed concentration thresholds with pool-size-adaptive thresholds computed from the player's actual opponent pool. Every threshold in the system becomes a function of N (distinct opponents faced):

```
adaptive_threshold(N) = base_multiplier × (1/N) + floor_value
```

The **base_multiplier** determines how many times the expected frequency an opponent must exceed before flagging. The **floor_value** prevents the threshold from dropping below a minimum in very large pools (where 1/N approaches zero and even tiny absolute concentrations would flag).

**Default calibration:**

| Pool Size (N) | Expected Conc. (1/N) | Multiplier (3×) | Floor (5%) | Effective Threshold |
|---------------|----------------------|------------------|------------|---------------------|
| 8 | 12.5% | 37.5% | 5% | 37.5% |
| 12 | 8.3% | 25.0% | 5% | 25.0% |
| 20 | 5.0% | 15.0% | 5% | 15.0% |
| 50 | 2.0% | 6.0% | 5% | 6.0% |
| 100 | 1.0% | 3.0% | 5% | 5.0% (floor) |
| 200 | 0.5% | 1.5% | 5% | 5.0% (floor) |

**What changes:**
- **Cap threshold (4.69e-iii):** The ⚡ Cap default position shifts from 50% absolute to 3× expected concentration. In a 12-player pool, the default cap is 25% — an opponent must appear in 3× their expected frequency before their matches are suppressed.
- **Pairwise removal gate (4.69e-iii-a):** The 40% absolute combined threshold becomes 5× combined expected concentration. In a 12-player pool, a pair must contribute ~42% combined (5 × 8.3%) to trigger pairwise analysis. In a 50-player pool, the gate drops to ~10% combined.
- **APS calculation (4.69e-v):** The adversarial density denominator shifts from raw match count to "excess adversarial match count" — matches above what random chance would produce against tagged opponents given the pool size.

**Where the system displays pool size:**

The career analysis header gains a contextual element:

```
┌──────────────────────────────────────────────────────────────────┐
│  SEASON 7 CAREER ANALYSIS                                        │
│                                                                  │
│  Matches: 48    Opponents: 11    Expected frequency: 9.1%        │
│  Adversarial threshold: 25% (3× expected)                        │
│                                                                  │
│  ℹ Small bracket detected. Thresholds calibrated for 11-player   │
│    opponent pool. Concentration must exceed 25% to flag.          │
└──────────────────────────────────────────────────────────────────┘
```

The info badge is small and unobtrusive — a single line in light gray beneath the season header — but it communicates immediately that the system is aware of the pool size and has adapted. Players in large brackets never see this badge (it only appears when N < 30, where calibration meaningfully changes thresholds).

### The UI: Threshold Ruler with Pool Context

The existing concentration cap slider (from 4.69e-iii) gains a contextual marker:

```
┌─────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: IronPulse99                                    │
│                                                                     │
│  ● ⚡ Cap — suppress when concentration exceeds:                    │
│                                                                     │
│  0%    10%    20%    30%    40%    50%    60%    70%    80%          │
│  ├──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┤         │
│                ▲                     ●                               │
│           expected (9%)        your cap (45%)                        │
│                                                                     │
│  ⚙ Auto-calibrate: set cap to 3× expected (25%)  [Apply]           │
│                                                                     │
│  Pool context: 11 opponents this season. Expected opponent           │
│  frequency is 9.1%. The default threshold for this pool size        │
│  is 25%. Your manual cap of 45% is more permissive than default.    │
└─────────────────────────────────────────────────────────────────────┘
```

The **expected frequency marker** (▲) is always visible on the slider, drawn in a muted gray with a dotted vertical line extending upward. It moves as the player's pool size changes season to season. This teaches the player to think in terms of relative excess rather than absolute percentages — they see that 45% in an 11-player pool is 5× expected, whereas 45% in a 50-player pool would be 22.5× expected.

The **auto-calibrate button** offers a one-click shortcut: set the cap to the system default for the current pool size. Players who don't want to think about thresholds can always auto-calibrate and get a statistically sensible default.

### Strengths

- **Statistically rigorous.** The threshold scales with the actual information content of the data.
- **Prevents false positives in small pools.** A 12-player bracket stops triggering adversarial warnings on normal match variance.
- **Catches real adversaries in large pools.** A 15% concentration in a 200-player pool (30× expected) now properly flags, where the absolute 50% threshold missed it entirely.
- **Educates the player.** The expected frequency marker teaches probabilistic reasoning — a transferable skill that maps directly to understanding context buffer capacity and eviction probabilities.
- **Backwards-compatible.** Existing absolute thresholds become the floor values; no player's settings break.

### Weaknesses

- **Conceptual complexity.** "3× expected concentration" is harder to explain than "50%." Players who don't think statistically may find the adaptive threshold confusing — "why does my threshold change when I move to a different bracket?"
- **Non-uniform matchmaking.** The 1/N expected concentration assumes roughly uniform opponent distribution. Real matchmakers use skill-based matching, so higher-ranked opponents are overrepresented. In a 50-player pool where skill-based matching focuses 60% of matches against the top 10 opponents, the "expected" concentration for those opponents is much higher than 1/50. The contextual denominator needs matchmaker-awareness.
- **Pool size instability.** N changes throughout a season as new players join and others stop playing. Early-season N might be 8; late-season N might be 25. The threshold shifts mid-season, potentially reclassifying previously-flagged opponents as non-adversarial (or vice versa). This creates instability in the diagnostic output.

---

## Option B: The Bayesian Prior — "Surprise Score"

### How It Works

Instead of thresholding concentration directly, compute a **surprise score** for each opponent's concentration: how unlikely is this concentration given the observed match frequency and pool size?

The surprise score uses Bayesian reasoning: given that this opponent appeared in F% of total matches, what is the probability of them appearing in C% of a specific cluster's elements purely by chance?

```
surprise = -log₂(P(concentration ≥ C | match_frequency = F, cluster_size = K))
```

Where P is computed from the binomial distribution: K trials (cluster elements), each with probability F of being against this opponent, observing C×K or more successes.

**Example calculations:**

| Opponent | Match Freq (F) | Cluster Conc (C) | Cluster Size (K) | Surprise (bits) | Interpretation |
|----------|----------------|-------------------|-------------------|-----------------|----------------|
| AlphaRush | 9% | 75% | 4 | 8.2 bits | Highly surprising — very unlikely by chance |
| BetaGrid | 9% | 25% | 4 | 2.1 bits | Mildly surprising — possible by chance |
| GammaPulse | 20% | 50% | 6 | 2.8 bits | Moderate — elevated but explainable by high match frequency |
| DeltaWave | 3% | 33% | 3 | 5.4 bits | Very surprising — extremely overrepresented for their frequency |

**The threshold:** Flag opponents whose surprise score exceeds a significance level — say, 4 bits (roughly equivalent to a p < 0.06 one-tailed test). This automatically adjusts for both pool size and individual match frequency: a frequent opponent needs much higher concentration to surprise, while a rare opponent at moderate concentration is very surprising.

**The UI:** The match-source breakdown in the debrief gains a **surprise indicator** next to each opponent bar:

```
RELAY-B cluster — Match-Source Breakdown

vs. AlphaRush    ████████████████████░  75%  ‼ 8.2 bits  [FLAGGED]
vs. BetaGrid     ██████░░░░░░░░░░░░░░  25%    2.1 bits
vs. GammaPulse   ██████████░░░░░░░░░░  50%    2.8 bits
vs. DeltaWave    ████████░░░░░░░░░░░░  33%  ⚠ 5.4 bits  [FLAGGED]
vs. Others (7)   ████░░░░░░░░░░░░░░░░  17%    —

ℹ Surprise measures how unlikely this concentration is given
  match frequency. >4 bits = worth investigating.
```

The surprise score renders as a small number in a muted typeface to the right of the concentration bar. Flagged opponents (above threshold) get a bold marker and their bar shifts to amber. The flag is non-destructive — it doesn't suppress matches, it only highlights statistical anomalies for the player to investigate.

### The Surprise Score as Teaching Tool

The surprise score naturally teaches the player to think about *expected vs. observed* — the exact cognitive skill that makes agentic AI engineering intuitive. When the player reads "AlphaRush at 75% concentration with 8.2 bits surprise," they learn: "75% is high, but 8.2 bits tells me it's *statistically anomalous*, not just big." When they see GammaPulse at 50% with only 2.8 bits, they learn: "high concentration can be normal if the opponent is a frequent matchup."

This directly parallels the game's core mechanic: a context buffer that's 90% full might be perfectly healthy if the agent is processing complex multi-signal scenarios, or dangerously overloaded if it's on a simple patrol route. Absolute values mean nothing without context. The diagnostic system teaches the same principle.

### Strengths

- **Statistically optimal.** The surprise score is the information-theoretically correct measure of "does this concentration demand explanation?"
- **Automatically handles non-uniform matchmaking.** Because it conditions on the opponent's actual match frequency (not the pool-average), skill-based matching distortions are absorbed.
- **Pool-size invariant without explicit pool computation.** The binomial distribution naturally produces smaller surprises for the same concentration in smaller pools (fewer trials = higher variance = harder to be surprised).
- **Compositional.** Surprise scores for multiple opponents can be summed for compound detection: if three opponents each have modest individual surprises (2.5 bits each) but their combined surprise is 7+ bits, the coalition signal emerges naturally.
- **Teaches transferable reasoning.** "Expected vs. observed given sample size" is the foundational insight for understanding context buffer health, signal quality, and diagnostic confidence.

### Weaknesses

- **"Bits" is unfamiliar vocabulary.** Casual players will not understand what "8.2 bits" means. The UI needs to translate this into intuitive language: "very unlikely," "possible by chance," "expected." But the translation loses the precision that makes the metric useful for advanced players.
- **The numbers are small and weird.** Unlike concentration percentages (which range 0-100 and feel intuitive), surprise scores range from 0 to ~15 and have no natural anchor. "Is 5 bits a lot?" requires calibration.
- **Requires computing binomial CDFs.** Not computationally expensive per-opponent, but the system must evaluate the CDF for every opponent × every cluster × every career analysis. With 15 opponents and 8 clusters, that's 120 evaluations per analysis — feasible but nontrivial.
- **False confidence in statistical authority.** The binomial model assumes independent match outcomes, which isn't strictly true (players adapt configs between matches). A sophisticated player might over-trust the surprise score's authority and ignore qualitative signals.

---

## Option C: The Graduated Threshold Table — "Bracket-Aware Defaults"

### How It Works

The simplest approach: provide a lookup table of default thresholds based on opponent pool size, and let the player override manually. No statistical computation, no surprise scores — just sensible defaults for common pool sizes.

```
┌────────────────────────────────────────────────────────────────┐
│  ADVERSARIAL DETECTION SETTINGS                                │
│                                                                │
│  Your bracket: 11 opponents (Season 7)                         │
│                                                                │
│  Recommended thresholds for 11-player pools:                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Cap threshold:           30%  (vs. 50% in large pools) │    │
│  │  Pairwise gate:           45%  (vs. 40% in large pools) │    │
│  │  APS sensitivity:         Low  (vs. Standard)           │    │
│  │  Auto-tag threshold:      3.5× (vs. 2× in large pools)  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ○ Use recommended thresholds for my bracket                   │
│  ○ Use large-pool defaults (may produce false positives)       │
│  ● Use custom thresholds ↓                                     │
│                                                                │
│  Cap threshold:     [====●=========] 40%                       │
│  Pairwise gate:     [======●=======] 45%                       │
│  APS sensitivity:   [Medium ▼]                                 │
│  Auto-tag multiplier: [====●=======] 3.0×                      │
└────────────────────────────────────────────────────────────────┘
```

**The table:**

| Pool Size | Cap Default | Pairwise Gate | APS Sensitivity | Auto-Tag Multiplier |
|-----------|-------------|---------------|-----------------|---------------------|
| 5-8 | 40% | 55% | Very Low | 4.0× |
| 9-15 | 30% | 45% | Low | 3.5× |
| 16-30 | 25% | 40% | Standard | 2.5× |
| 31-60 | 20% | 35% | Standard | 2.0× |
| 61-100 | 15% | 30% | High | 1.8× |
| 100+ | 10% | 25% | High | 1.5× |

**The "recommended" prompt:** At the start of each season (or when the player's opponent pool crosses a tier boundary), the system shows a one-time prompt:

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 BRACKET SIZE UPDATE                                         │
│                                                                 │
│  Your opponent pool this season: 11 players                     │
│  Last season: 23 players                                        │
│                                                                 │
│  Your adversarial thresholds are calibrated for a 23-player     │
│  pool. In an 11-player pool, these settings may flag normal     │
│  match variance as adversarial.                                 │
│                                                                 │
│  Would you like to adjust thresholds for your current bracket?  │
│                                                                 │
│  [Auto-adjust]        [Keep current]        [Customize]         │
└─────────────────────────────────────────────────────────────────┘
```

### Strengths

- **Immediately understandable.** No statistical vocabulary. "Your bracket has 11 players, so thresholds are higher" is intuitive.
- **Low cognitive load.** Players who don't want to think about thresholds pick "auto-adjust" and get sensible defaults.
- **Explicit control.** The custom mode gives advanced players full slider access while communicating the recommended range.
- **Stable.** Thresholds change only when the player crosses a tier boundary, not continuously as pool size fluctuates.

### Weaknesses

- **Crude granularity.** A 9-player pool and a 15-player pool get the same thresholds despite very different variance profiles.
- **Doesn't handle non-uniform matchmaking.** If 60% of matches are against 3 opponents (skill-based matching), the pool size of 20 is misleading — the "effective pool" for concentration purposes is much smaller.
- **Arbitrary tier boundaries.** Why is the 16-30 tier boundary at 16 and not 18? The lookup table hides its assumptions behind false precision.
- **Doesn't compose.** The cap threshold, pairwise gate, APS sensitivity, and auto-tag multiplier are set independently, but they interact. Adjusting one without adjusting others can create inconsistent detection behavior.

---

## Option D: The Effective Pool Size — "Matchmaker-Corrected N"

### How It Works

The core insight: what matters isn't how many opponents exist in the bracket, but how many opponents the matchmaker *effectively* distributes matches across. A 50-player bracket where skill-based matching concentrates 70% of matches against 8 opponents has an effective pool of ~12, not 50.

**The computation:**

```
effective_N = 1 / Σ(fᵢ²)
```

Where fᵢ is the fraction of total matches against opponent i. This is the **inverse Herfindahl-Hirschman Index** — a standard measure of market concentration adapted to matchmaking concentration.

**Examples:**

| Scenario | Actual N | Match Distribution | Effective N |
|----------|----------|-------------------|-------------|
| Perfectly uniform | 20 | 5% each | 20.0 |
| Mild SBMM | 20 | Top 5 at 12% each, rest at 2.7% | 13.2 |
| Aggressive SBMM | 50 | Top 3 at 20% each, rest at 0.85% | 7.8 |
| Tiny bracket | 6 | ~17% each | 6.0 |
| One dominant rival | 20 | One at 40%, rest at 3.2% | 5.9 |

The effective N captures what raw N misses: the actual diversity of the player's competitive experience. All threshold computations use effective N instead of raw N.

**The UI displays both:**

```
SEASON 7 CAREER ANALYSIS

Matches: 62    Opponents: 34    Effective pool: 14.2
Adversarial threshold: 22% (3× expected at effective pool)

ℹ Skill-based matching concentrates your matches against fewer
  opponents than your bracket size suggests. Thresholds are
  calibrated for your effective opponent diversity of ~14 players.
```

The **effective pool** number renders slightly larger than the raw opponent count, communicating its importance. A subtle animation plays when the player hovers: a small distribution chart appears showing the match frequency spread, with the "effective pool" marked as the point where the distribution's concentration equalizes.

### Strengths

- **Handles non-uniform matchmaking correctly.** The effective N absorbs SBMM distortion, making thresholds appropriate for the player's actual competitive landscape.
- **Single correction point.** Replace N with effective N everywhere, and all downstream computations (cap, pairwise gate, APS, compound detection) inherit the correction.
- **Information-theoretically motivated.** The inverse HHI is the number of equally-weighted opponents that would produce the same concentration distribution — it's the "true" pool size for information purposes.
- **Matches player intuition.** "I keep facing the same 8 people even though there are 50 in my bracket" is a common competitive player experience. Effective N formalizes this feeling.

### Weaknesses

- **Requires full match history access.** Computing the HHI needs the complete opponent frequency distribution, which means the career analysis system must track per-opponent match counts (it probably does already, but this is a dependency).
- **Volatile early-season.** In the first 10 matches of a season, effective N fluctuates wildly as each new opponent dramatically changes the distribution. The system needs a minimum match count before effective N stabilizes (perhaps 20 matches).
- **Harder to explain than raw N.** "Your bracket has 34 players but your effective pool is 14" requires explanation. Some players will interpret this as the system being wrong about how many opponents they have.
- **Can be gamed.** A deliberately adversarial player could spread their targeting across multiple accounts to inflate the target's effective N and avoid detection. (This is a very niche concern but worth noting.)

---

## Interaction Effects

### With Per-Opponent Cap (4.69e-iii)
The cap slider's default position changes from a fixed 50% to pool-adaptive. In Option A, the slider shows the expected frequency marker. In Option B, the slider is replaced by a surprise threshold. In Options C/D, the slider default shifts but retains the same interaction model. **Critical interaction:** when a player manually sets a cap, should it be stored as an absolute value or a relative-to-expected value? If absolute: the cap doesn't adapt when pool size changes between seasons. If relative: the cap auto-adjusts, which may surprise the player ("I set it to 40% last season, why is it 25% now?").

### With APS (4.69e-v) and Small Pool Inflation (4.69e-v-c)
All four options directly address the APS inflation problem identified in 4.69e-v-c. Options A and D provide continuous correction; Options B and C provide discrete correction. The choice here determines whether APS inflation is a solved problem or a mitigated-but-present concern.

### With Compound Detection (4.69e-iii-a)
Pool calibration significantly affects compound detection thresholds. In a 12-player pool, three opponents at 20% each (60% combined) would trigger the compound pairwise gate at 40%. But with pool-corrected thresholds (Option A raises the pairwise gate to 45% for N=12), two of these three pairs fall below the gate. The compound detection becomes less trigger-happy in small pools — which is appropriate, since three opponents at 20% each in a 12-player pool is *expected*, not adversarial.

### With Tag Expiry (4.69e-viii)
Pool size changes across seasons affect tag validity. A tag set during a 10-player season (where thresholds were high) may be invalid when the player moves to a 50-player season (where the same opponent's concentration would be much more suspicious at lower absolute values). Tag expiry and pool calibration interact: should tags include the pool context in which they were set? "Tagged IronPulse99 as adversarial at 65% concentration in an 11-player pool (threshold was 30%)" — this tag remains valid when the pool grows to 40, because the excess (65% vs. 30% threshold) was genuine. But a tag set at 32% in an 11-player pool (barely above the 30% threshold) becomes much more significant when the pool grows to 40 (where the threshold drops to 15%).

### With Mission Design (Campaign)
In campaign mode, the "opponent pool" is the set of enemy configurations the mission presents. A mission with 3 distinct enemy types effectively has N=3, meaning adversarial detection thresholds must be extremely high or disabled entirely. **Pool calibration should be disabled or drastically relaxed in campaign mode** — adversarial detection is a multiplayer feature, and single-player missions have no concept of adversarial opponents. The system should detect game mode and adjust accordingly.

---

## Comparable Games and Systems

### Chess.com Arena Tournaments
Chess.com arenas (rapid, blitz, bullet) match players repeatedly from a small active pool. The platform doesn't have "adversarial detection" per se, but players frequently complain about being "sniped" — repeatedly matched against the same opponent who has prepared an anti-opening. The platform's response: an "Avoid Player" button with a limited budget (2-3 avoids per arena). This is a binary tool that doesn't scale — our concentration calibration system is the sophisticated version of the same problem.

### Dota 2 / League of Legends Ranked Matchmaking
At high MMR (top 500 players), the pool is small enough that players recognize regular opponents. Both games track "match quality" metrics internally but don't expose them. Neither system explicitly addresses the small-pool statistical problem — they accept higher variance at high ranks. Robot Uprising can do better by making the pool-size correction visible and controllable.

### VALORANT's Riot ID Encounter System
VALORANT tracks how often you face specific opponents and uses this for internal matchmaking quality metrics. Players at Radiant rank (top 500) frequently face the same opponents and report adversarial-feeling patterns that are actually just small-pool variance. Riot's solution is broader matchmaking windows (accepting wider skill gaps to increase pool diversity). Our system takes the opposite approach: keep the pool small but calibrate the detection system for it.

---

## Sensory Description

### The Expected Frequency Marker (Option A)

A thin vertical line in desaturated teal, extending from the slider track upward to a small triangle marker (▲). The marker sits where "expected concentration" falls on the slider — for an 11-player pool, it hovers at the 9.1% mark, far left of the slider's range. As the player drags the cap slider, the distance between the marker and the cap handle is visually emphasized: a faint gradient ribbon connects them, shifting from teal (near expected) to amber (moderately above) to orange (far above). The ribbon communicates *excess* without numbers — a wide amber ribbon says "this cap is well above expected," while a narrow teal ribbon says "this cap is barely above baseline."

When the player first enters a new season with a different pool size, the expected frequency marker performs a gentle slide animation from its old position to its new one — taking 300ms with an ease-out curve. This communicates "the landscape has changed" without requiring the player to read text.

### The Surprise Score (Option B)

The surprise score renders in a fixed-width monospace font, right-aligned after the concentration bar. Scores below 4 bits appear in slate gray. Scores between 4-6 bits shift to amber with a subtle ⚠ prefix. Scores above 6 bits render in warm orange with a ‼ prefix and the number gently pulses once (a single 600ms brightness oscillation, then steady). The pulsing draws the eye to the anomaly without creating visual noise.

When the player hovers over a surprise score, a compact tooltip appears: "AlphaRush appears in 75% of this cluster but only 9% of your matches. There is a 0.4% chance this happened by random matchmaking." The tooltip translates bits into a probability statement the player can verify against their intuition.

### The Bracket Size Update Prompt (Option C)

The prompt appears as a slide-down panel at the top of the career analysis screen, with a frosted-glass background and a 📊 icon in the top-left. The panel background carries a subtle gradient from cool blue (left, representing the old bracket size) to warm amber (right, representing the new, smaller bracket). The gradient visually communicates "your competitive landscape has shifted."

The three buttons are spaced evenly. "Auto-adjust" has a subtle glow — it's the recommended action. "Keep current" is neutral. "Customize" is smaller and secondary. Keyboard shortcuts: A for auto, K for keep, C for customize. The prompt auto-dismisses after 10 seconds if ignored, defaulting to "keep current" — the safe default that doesn't change anything.

### The Effective Pool Hover Chart (Option D)

When the player hovers over "Effective pool: 14.2" in the season header, a compact sparkline chart appears below:

A horizontal bar for each opponent, sorted by match frequency, longest to shortest. The bars form a descending staircase. A vertical dotted line marks the "effective pool" boundary — the point where cumulative match concentration reaches a threshold. Opponents to the left of the line are "core" matchups (high frequency); those to the right are "occasional" matchups. The core opponents' bars glow slightly warmer (amber tint), while occasional opponents fade to cool gray. The visual immediately communicates: "these 14 opponents are your real competitive landscape, even though you've faced 34."

The chart renders in 150ms (CSS transition), appears 200ms after hover begins (debounce to prevent flicker), and disappears 150ms after the cursor leaves. It's small — 200px wide, 120px tall — and positioned below the header text, pushing content down with a smooth animation rather than overlapping.

---

## Player Journeys

### Journey: Priya, 28, Diamond-rank competitive player in a small regional bracket

**Context:** Season 7, 11 active players in the Southeast Asia Diamond bracket. Priya has been playing for 4 seasons and is familiar with career analysis. She noticed STRIKER-A keeps flagging as a persistent cluster, and last season she tagged two opponents as adversarial. But this season feels different — the flags keep coming even after tags.

**Minute 0:00 — Opening Career Analysis**
Priya clicks the career analysis tab after her 30th match of the season. The header loads:
```
SEASON 7 CAREER ANALYSIS
Matches: 30    Opponents: 10    Expected frequency: 10%
Adversarial threshold: 30% (3× expected)
```
She notices the info line — "expected frequency: 10%." She remembers last season, when the threshold was 20% in a 22-player bracket. "Oh, the pool is smaller this season." The expected frequency marker on her existing caps has shifted rightward — IronPulse99's cap of 40% now shows the marker at 10%, making the gap between expected and cap visually wider.

**Minute 0:45 — Reviewing STRIKER-A Cluster**
STRIKER-A has 4 elements and fires with 72% coverage. The match-source breakdown shows:
```
vs. CloudNine    ████████████████░░░░  62%  ⚠ surprise: 5.1 bits
vs. VortexBlue   ██████████░░░░░░░░░░  38%    surprise: 2.3 bits
```
In the old system, CloudNine at 62% would have been instantly alarming. But with the pool calibration, Priya reads the surprise scores: CloudNine at 5.1 bits is genuinely suspicious (they played 12% of her matches but contributed 62% to this cluster). VortexBlue at 38% with 2.3 bits is unremarkable — they played 15% of her matches, so 38% concentration is only 2.5× their frequency. In a 10-player pool, that's noise.

**Minute 1:30 — Setting a Pool-Calibrated Cap**
Priya opens CloudNine's treatment panel. The cap slider shows the expected frequency marker at 10%, with the auto-calibrate suggestion at 30%. She drags the cap to 35% — slightly above auto-calibrate, because CloudNine does play a legitimately aggressive style that might over-contribute even without targeting. The preview updates: STRIKER-A's cluster dissolves (CloudNine's 62% exceeds 35%, matches suppressed). RELAY-B's cluster is unaffected (CloudNine at 22% is below cap). She clicks [Apply Cap ⚡].

**Minute 2:15 — Checking APS with Pool Correction**
Priya navigates to the season health sidebar. The APS widget shows:
```
APS: 0.14 (Light Pressure)
Pool-corrected APS: 0.06 (Clean)
```
The raw APS of 0.14 would have triggered advisory footnotes on cluster flags. But the pool-corrected APS — which subtracts expected adversarial density for a 10-player pool — is 0.06, well within the clean range. The footnotes don't appear. Priya exhales: "This season isn't adversarial, it's just small."

**Minute 3:00 — Resolution**
Priya realizes that one of her two tags from last season (on VortexBlue) may have been a false positive driven by the small pool. She considers removing the tag. The system shows a helpful annotation: "VortexBlue was tagged in Season 6 (22-player pool, threshold 20%). At current pool-corrected thresholds (30%), VortexBlue's concentration of 31% would be marginal." She decides to keep the tag but lower the cap to 35% — not fully suppressed, but de-emphasized if concentration spikes.

**UI Annotations:**
- Expected frequency marker: teal ▲ at 10% on the slider track, connected to the cap handle by a gradient ribbon
- Surprise scores: monospace text right-aligned after each opponent bar, amber ⚠ for scores ≥4 bits
- Pool-corrected APS: shown in parentheses below raw APS, uses the corrected value for all dashboard annotations
- Auto-calibrate button: small, right-aligned, with the computed threshold shown inline

---

### Journey: Tomás, 19, new competitive player, first season in ranked

**Context:** Season 1 of ranked play. Tomás has completed the campaign and jumped into competitive. His bracket has 8 players — the smallest tier. He has no adversarial tags. He's never used career analysis.

**Minute 0:00 — First Career Analysis**
Tomás opens career analysis for the first time after 20 matches. The header shows:
```
SEASON 1 CAREER ANALYSIS
Matches: 20    Opponents: 7    Expected frequency: 14.3%
Adversarial threshold: 43% (3× expected)
```
He doesn't fully understand "expected frequency" but the info badge says "Small bracket detected." He mentally files this away.

**Minute 0:30 — RELAY-B Cluster Flag**
RELAY-B flags with 3 elements, 58% coverage. Match-source breakdown:
```
vs. SolarWind    ████████████████████  80%    surprise: 4.8 bits
vs. NovaStar     ██████████░░░░░░░░░░  40%    surprise: 1.4 bits
vs. Others (5)   ████░░░░░░░░░░░░░░░░  20%    —
```
Without pool calibration, Tomás might panic — 80% concentration from one opponent! But the system shows a contextual annotation on the cluster:

```
⚙ Small-pool advisory: In a 7-opponent pool, concentration above
  43% may indicate adversarial targeting or may reflect normal
  variance. SolarWind's surprise score of 4.8 bits suggests
  genuine overrepresentation. Consider investigating before tagging.
```

The advisory is in muted gray-blue text, pitched as informational rather than alarming. It uses "may" deliberately — the system doesn't know if this is adversarial, it's calibrating the player's expectations.

**Minute 1:15 — Learning the Expected Frequency**
Tomás hovers over "Expected frequency: 14.3%." A tooltip expands: "With 7 opponents, each opponent appears in roughly 14% of your matches by chance. Concentration significantly above this may indicate targeting." Tomás nods — this makes sense. He opens SolarWind's match-source detail and sees that SolarWind appeared in 5 of his 20 matches (25% of total), and 4 of those 5 produced RELAY-B cluster elements (80% cluster concentration). The system shows: "SolarWind plays 25% of your matches but contributes 80% of RELAY-B's cluster — 3.2× overrepresented."

**Minute 2:00 — Deciding Not to Tag**
The 3.2× overrepresentation gives Tomás pause. But the surprise score is 4.8 bits — just barely above the 4-bit threshold. And with only 5 matches against SolarWind, the sample is tiny. The system subtly communicates this: "Based on 5 matches. Confidence increases with more data." Tomás decides to wait — play more matches, see if SolarWind's concentration persists or regresses to the mean. He's learning statistical reasoning without knowing it.

**Minute 2:45 — Resolution**
Tomás closes career analysis with a better mental model of what "normal" looks like in a small pool. He didn't tag anyone. He didn't adjust thresholds. The system's pool calibration prevented him from making a false-positive tag on his first competitive analysis — which would have poisoned his understanding of the adversarial system going forward.

**UI Annotations:**
- Small-pool advisory: gray-blue text block below the cluster, only appears when pool size < 15
- Expected frequency tooltip: 200px wide, positioned below the header stat, 200ms hover delay
- "Based on 5 matches" confidence note: small italic text below the surprise score, only shown when match count < 10
- No tag prompt or cap suggestion — the system is deliberately passive for first-season players with small samples

---

### Journey: Wei, 35, Grandmaster-rank veteran, 200-player bracket

**Context:** Season 12. Wei has been in the top competitive tier for 6 seasons. Their bracket is massive — 200+ active players, skill-based matchmaking concentrating ~60% of matches against the top 30. Wei has 5 existing adversarial tags. They're interested in the effective pool correction (Option D).

**Minute 0:00 — Season Start, Pool Calibration Prompt**
Wei opens career analysis at match 50. The bracket size update prompt slides down:
```
📊 BRACKET SIZE UPDATE
Your opponent pool this season: 187 players (Effective pool: 28.4)
Last season: 193 players (Effective pool: 31.1)

Your adversarial thresholds are calibrated for effective pool 31.
Skill-based matching concentrates your matches among ~28 core opponents.
Would you like to recalibrate?

[Auto-adjust]     [Keep current]     [Customize]
```

Wei hovers over "Effective pool: 28.4" and the sparkline chart appears: a descending staircase of 187 bars, with the first 15 significantly taller (these are the GM players Wei faces repeatedly). The effective pool line sits at opponent #28 — beyond this, opponents appear rarely enough that their contribution to concentration metrics is negligible.

**Minute 0:30 — Inspecting the Effective Pool Chart**
The chart reveals something Wei didn't realize: one opponent (PhantomEdge) appears in 8.5% of Wei's matches — the second-highest frequency after KaijuStrike at 9.2%. But Wei hasn't tagged PhantomEdge. In a raw 187-player pool, 8.5% frequency seems modest. But in the effective 28-player pool, expected frequency is 3.5%, and PhantomEdge is at 2.4× expected — not enough to flag alone, but worth watching.

**Minute 1:00 — Auto-Adjust and Review**
Wei clicks [Auto-adjust]. The cap defaults shift:
```
Previous: 10% cap (calibrated for effective pool 31)
New: 11% cap (calibrated for effective pool 28)
```
The change is small — only 1 percentage point. At high N, pool fluctuations produce minor threshold adjustments. Wei's existing tags are unaffected: all five tagged opponents exceed 11% concentration by wide margins. The system confirms: "No existing tags or caps affected by recalibration."

**Minute 1:30 — Investigating PhantomEdge**
Wei opens the match-source breakdown for their RELAY-C cluster, which has been persistent for 3 seasons:
```
RELAY-C cluster — Match-Source Breakdown (Effective Pool Context)

vs. KaijuStrike   ████████████████░░░░  34%  ‼ 8.9 bits  [TAGGED]
vs. PhantomEdge   ████████████░░░░░░░░  28%  ⚠ 5.7 bits
vs. NeuralGhost   ██████████░░░░░░░░░░  18%    3.4 bits
vs. Others (14)   ████░░░░░░░░░░░░░░░░  20%    —
```

KaijuStrike is already tagged — 34% concentration with 8.9 bits surprise. But PhantomEdge at 28% with 5.7 bits is new. In previous seasons, 28% concentration was below Wei's 30% cap. But with the effective pool correction, the expected concentration for any opponent is 3.5%, and PhantomEdge is at 8× expected. The surprise score confirms: this is statistically anomalous.

**Minute 2:15 — Applying a Surgical Cap**
Wei sets a ⚡ Cap on PhantomEdge at 15% — below their 28% cluster concentration but above their 8.5% match frequency. The preview shows: RELAY-C cluster dissolves completely when both KaijuStrike (tagged) and PhantomEdge (capped) are suppressed. But SCOUT-A cluster is unaffected — PhantomEdge contributes only 6% there, below the 15% cap.

The compound detection (4.69e-iii-a) also fires a new insight: "KaijuStrike + PhantomEdge compound surprise: 11.2 bits. Coalition signature detected." Wei notes this — two opponents from the same competitive team may be running coordinated counter-configs.

**Minute 3:00 — Resolution**
Wei commits the cap and checks the pool-corrected APS: 0.42 (Moderate Pressure, amber shield). Without pool correction, the raw APS was 0.28 (Light Pressure). **The effective pool correction *increased* the APS** — because Wei's effective pool is smaller than raw N, the same adversarial density represents more concentrated targeting than the raw number suggests. This is correct: in a 28-opponent effective pool, 3 targeted opponents is 11% of the competitive landscape. In a raw 187-opponent pool, the same 3 opponents are 1.6%.

Wei appreciates that the system got smarter as they got better. At lower ranks with larger effective pools, the system was permissive. At Grandmaster with aggressive SBMM, the system correctly identifies that the competitive landscape is narrower and adjusts detection sensitivity accordingly.

**UI Annotations:**
- Effective pool sparkline: 200×120px, sorted descending, effective-N line at opponent #28
- Compound coalition badge: amber border around paired opponent bars with combined surprise score
- Pool-corrected APS: always displayed alongside raw APS at GM tier, uses effective N for computation
- Auto-adjust confirmation: shows before/after threshold delta and confirms no existing settings are broken

---

## Discovered Aspects

- **4.69e-vi-a — Minimum match count before pool calibration activates:** How many matches must a player complete before the effective pool computation is reliable? Early-season N is volatile; premature calibration creates threshold instability. Comparable: Dota 2's 10-match calibration period.
- **4.69e-vi-b — Pool size display as competitive intelligence:** Showing "Effective pool: 28" reveals information about the player's competitive tier and matchmaking concentration. Should this be hidden, abstracted, or fully visible? Privacy implications of exposing matchmaking internals.
- **4.69e-vi-c — Cross-season pool drift and threshold migration:** When a player's bracket grows from 12 to 50 between seasons, thresholds drop dramatically. Old tags set under permissive (small-pool) thresholds may no longer meet the stricter (large-pool) criteria. Automatic tag review prompt when pool size changes significantly.
- **4.69e-vi-d — Pool calibration in asymmetric matchmaking (smurf detection):** A player in a 50-player bracket who repeatedly matches against one opponent (because the opponent is smurfing or queue-sniping) has an effective pool much smaller than the bracket suggests. Pool calibration correctly identifies this as anomalous — but should the system distinguish "adversarial targeting" from "matchmaking failure"?

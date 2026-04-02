# Coverage Percentile vs. Community Distribution

**Aspect:** 4.112 — Coverage percentile vs. community distribution: after 3+ career analyses, showing the player where their current coverage sits relative to all players at similar match counts — "your current coverage (19%) is in the top 15% of Gauntlet players at 200 matches"; the community distribution makes the absolute coverage number meaningful and motivating; risk of discouraging players who are in low percentiles despite genuine improvement

**Parent:** 4.59 — Career Minimum Fix (cross-match architectural debt)
**Siblings:** 4.113 — Failure Concentration Ratio as advanced coverage metric; 4.114 — Coverage recurrence map
**Related:** 4.68 — Coverage percentage as season health; 4.25 — EDT trajectory as career metric; 4.69b — Combined agent coverage score display; 4.70 — Career analysis filtered by opponent archetype; 7.12 — Community-visible EDT distributions per config archetype

---

## The Core Concept

Coverage in career analysis is a number without a reference frame. A player whose career analysis reports "top candidate coverage: 34%" has no way to know whether 34% is catastrophically concentrated, typical, or impressively distributed. The number floats in a void. Is 34% coverage good? Bad? It depends on what everyone else looks like — and the player has no visibility into what everyone else looks like.

The coverage percentile takes the player's current top-1 coverage and plots it against the distribution of all Gauntlet players at a similar match count. "Your coverage (34%) is in the 62nd percentile of Gauntlet players at 150-250 matches." Now the number has gravity. 62nd percentile means most players at this experience level have even more concentrated failure profiles — the player is doing better than average at distributing their weaknesses. Or: "Your coverage (58%) is in the 91st percentile" — nearly everyone at your experience level has a less concentrated profile, meaning this player has a single dominant failure mode that most peers have already addressed.

The critical design decision: **lower coverage is better.** Coverage measures what percentage of failures are attributable to the dominant config element. A player with 19% coverage has a distributed failure profile — no single element dominates. A player with 62% coverage has a structural monoculture — one element is responsible for the majority of losses. So the percentile must be framed carefully: "top 15%" means the player's coverage is *lower* than 85% of peers. The language must celebrate low coverage without requiring the player to invert the natural "higher number = better" assumption.

### The Cohort Problem

Comparing a 50-match player against a 500-match player is meaningless. The 50-match player hasn't had enough career analyses to stabilize their coverage. The 500-match player has iterated through multiple architectural generations — their coverage should be lower because they've had more opportunities to fix dominant weaknesses.

Cohort bands must be wide enough to produce statistically meaningful comparison groups but narrow enough that players feel they're being compared to genuine peers. The proposed bands:

| Cohort | Match Range | Expected Population |
|--------|-------------|-------------------|
| **Novice** | 30-99 matches | Largest cohort — most players are here |
| **Developing** | 100-249 matches | Substantial population |
| **Established** | 250-499 matches | Committed players |
| **Veteran** | 500-999 matches | Dedicated architects |
| **Elder** | 1000+ matches | Long-term community pillars |

The cohort label is never shown to the player directly. They see "players at 150-250 matches" — a specific range centered on their match count, not the band label. The bands exist for backend aggregation; the frontend displays the range in plain language.

### The Minimum Career Analyses Gate

The percentile unlocks after 3 completed career analyses, not after a specific match count. This gate ensures the player has actually engaged with the career analysis system — they've seen their coverage number at least three times, they've (probably) fixed at least one dominant element, they understand what coverage means in context. Showing the percentile to someone who just ran their first career analysis and got 72% coverage would be punishing before the player has any basis for understanding the number.

Three analyses is enough to establish a trend: first analysis (baseline), second analysis (did the fix work?), third analysis (has a new dominant element emerged?). At that point, the percentile adds a new layer: "your current trajectory compared to everyone else's."

---

## The Percentile Display

### The Distribution Chart

The community distribution appears as a **density curve** — not a histogram, not a bar chart. A smooth, continuous curve showing the probability density of coverage values across the player's cohort. The horizontal axis runs from 0% (perfectly distributed failures) to 100% (single-element dominance). The vertical axis is unlabeled — the height communicates relative frequency, not absolute counts.

The curve is rendered in a muted steel-blue (`#6B7F99`), filled beneath with a gradient that fades to transparent at the bottom edge. The player's position is marked by a vertical line in the same amber-to-green palette used elsewhere in the career analysis UI: amber if coverage is above the cohort median, green if below. The vertical line extends from the x-axis through the curve with a small diamond marker where it intersects the density curve — the same diamond shape used for EDT markers, creating visual language consistency.

Beside the diamond, a floating label:

```
YOUR COVERAGE: 19%
TOP 15% OF GAUNTLET PLAYERS AT 150-250 MATCHES
```

The label is right-aligned if the player is on the left half of the distribution, left-aligned if on the right half — always pointing away from the curve's mass so it doesn't overlap.

Below the chart, a single line of plain-language interpretation:

- **Top 10%:** "Your failure profile is highly distributed. Few players at your experience level have addressed their dominant weaknesses this thoroughly."
- **Top 25%:** "Your architecture has fewer concentrated weaknesses than most players at this stage."
- **Middle 50%:** "Your coverage is typical for players at this match count. Most peers have a similar concentration of failures."
- **Bottom 25%:** "Most players at your experience level have reduced their dominant weakness further. Consider whether your top candidate is a recurring structural issue."
- **Bottom 10%:** "Your failure profile is more concentrated than most peers. Your career analysis history may reveal a persistent element that hasn't been addressed."

The language never says "bad" or "poor." It describes the structural situation and, in the lower percentiles, gestures toward the career analysis tools that could help.

### The Reveal Animation

When the percentile is shown for the first time (after the third career analysis), the distribution curve draws itself left-to-right over 2 seconds — a smooth wipe, as if the data is being scanned into existence. The curve appears in muted steel-blue. Then, after a 0.5-second pause, the player's vertical line drops from the top of the chart area, landing at their coverage position with a subtle bounce and a quiet, clear tone — the same tonal register as the signal-in-buffer sound. The diamond marker appears at the intersection point. The percentile text fades in over 0.8 seconds.

For subsequent career analyses, the animation is abbreviated: the curve is already present, and only the vertical line animates — sliding horizontally from its previous position to its new one, tracing the change. If coverage dropped (improvement), the line slides left with a green trail. If coverage rose (regression), it slides right with an amber trail. The trail fades after 1 second. The percentile text updates with a delta: "Top 15% (was Top 22%)."

### The Sparkline History

Below the main distribution chart, a small sparkline shows the player's coverage values across their career analysis history — each dot is one career analysis run, plotted chronologically. The y-axis is coverage percentage (inverted: lower is higher on the chart, reinforcing "down = better"). The 30-analysis rolling average, if available, appears as a smooth overlay line.

This sparkline makes the percentile longitudinal. A player who started at 58% coverage (bottom 30%) and has worked it down to 22% (top 20%) can see the trajectory. Even if their current percentile isn't impressive in absolute terms, the slope tells the story.

---

## Player Journeys

### Journey: Ren, 28, Methodical player, 220 Gauntlet matches, 6 career analyses

**Context:** Ren runs career analysis religiously every 30-40 matches. He treats coverage percentage as his primary health metric. His last three analyses showed coverage at 41%, 33%, and 19%. He has been systematically eliminating dominant config elements — replacing monoculture openers with distributed multi-path architectures. He knows his coverage is improving. He does not know how his trajectory compares to anyone else.

**The reveal:**

Ren completes his sixth career analysis. The results load: top candidate SCOUT-B priority weighting at 19% coverage — his lowest ever. Below the standard results panel, a new section appears: "Community Comparison." The density curve draws itself. The distribution is right-skewed — most players in the 150-250 match cohort have coverage between 30% and 55%, with a long tail toward 70%+. The mass of the curve sits in the 35-50% range.

His vertical line drops. It lands at 19%, well to the left of the curve's mass. The diamond sits on the rising edge of the distribution where the curve is still thin — few players live here.

**YOUR COVERAGE: 19%**
**TOP 15% OF GAUNTLET PLAYERS AT 150-250 MATCHES**

Ren stares at this for ten seconds. He knew his coverage was low. He did not know it was *unusual.* He assumed most serious players were doing what he was doing — systematically distributing their failure profile. The distribution shows him that most players in his cohort still have a single dominant element eating 40%+ of their losses. His six career analyses and deliberate redistribution have put him in rare territory.

**The emotional payload:** Validation. Not "you're winning more" — his win rate is 56%, unremarkable. But his *architecture* is in the top 15% for structural health. He's not a better competitor. He's a better *architect.* The distinction matters because it maps to what Ren cares about: systemic quality, not match outcomes.

He screenshots the distribution chart and posts it to the community Discord with: "Six analyses, six fixes. Down from 58% to 19%." He includes the sparkline history. Someone replies: "How did you fix the RELAY-C cluster at analysis 3?" A config necropsy conversation starts, anchored by the percentile chart as proof that the work produced results.

**What worked:** The distribution validated effort that win rate couldn't measure. The sparkline told the story of intentional improvement. The community comparison made the absolute number *meaningful* — 19% is not just low, it's structurally rare.

---

### Journey: Ava, 19, Aggressive player, 180 Gauntlet matches, 4 career analyses

**Context:** Ava plays a rush-heavy meta. Her win rate is 64% — one of the better performers in her cohort. She runs career analysis when the game prompts her, not proactively. Her last coverage was 52%. She has never thought about coverage distribution as a concept.

**The reveal:**

After her fourth career analysis, the community distribution appears for the first time. Coverage: 52%. The curve draws. The density mass peaks around 40%. Her vertical line drops at 52% — to the right of the peak.

**YOUR COVERAGE: 52%**
**59TH PERCENTILE OF GAUNTLET PLAYERS AT 150-250 MATCHES**

Ava reads "59th percentile" and her first reaction is confusion. In school, 59th percentile is barely passing. In coverage, 59th percentile means 59% of peers have lower (better-distributed) coverage. She's below average. Her failure profile is more concentrated than most players at her match count.

**The emotional risk:** Ava's win rate is 64%. She's *winning.* Being told her architecture is "below average" in structural health feels contradictory. She wins most of her games — how is she worse than players who might be winning less?

**The interpretation gap:** Coverage percentile and win rate measure different things, but the game has not yet taught Ava this distinction. She's experiencing the coverage percentile for the first time and doesn't have the conceptual scaffolding to understand that a 64% win rate with 52% coverage means "you're winning *because of* one dominant strategy, and if anyone counters that strategy, you collapse." The coverage number is a fragility warning, not a skill judgment.

**What happens next:** Ava closes the distribution panel and queues another match. She doesn't act on the information. But over the next two weeks, she loses four matches in a row to players running the same counter — a hook-chain architecture that neutralizes her rush opener. She remembers the 52% coverage number. She opens her career analysis results and sees SCOUT-A burst timing at 52% — the element that dominates her wins and her losses. The counter is targeting the exact thing the percentile was warning about.

She runs her fifth career analysis, this time with the opponent archetype filter (4.70) set to "Hook Fortress." Coverage against hook-heavy opponents: 71%. The community percentile for that filtered view: 88th percentile — nearly everyone has distributed their anti-hook weakness better than she has.

Now the number means something. Not "you're bad" but "you're exposed."

**What the design must do:** The community percentile must never be the first diagnostic a player encounters. It should appear *below* the career analysis results, not above them. The standard coverage number and the career minimum fix recommendation come first. The percentile is context for the coverage number, not a replacement for it. Players like Ava who don't yet understand coverage should encounter the raw number, the fix, and the percentile as a sequence — not the percentile as a headline.

---

### Journey: Tomasz, 35, Returning player, 340 Gauntlet matches, 8 career analyses

**Context:** Tomasz played heavily for two months (matches 1-200), took a three-month break, and returned. During his active period, he got his coverage down to 24% (top 20% at the time). When he returns, the meta has shifted. His architecture, optimized for the old meta, is now being countered by strategies that didn't exist when he left. His first post-return career analysis shows coverage at 47%.

**The percentile shock:**

Before his break, Tomasz was in the top 20%. After his first career analysis back: coverage 47%, 55th percentile. The distribution has also shifted — the community median has moved from ~38% to ~35% as the player base matured during his absence. He's not just worse than he was; the bar moved.

The sparkline tells the story brutally. Eight dots: a downward slope from 61% to 24% over six analyses, then a gap (the break), then a sudden jump to 47%. The rolling average, which was trending down, now has a visible discontinuity.

**YOUR COVERAGE: 47%**
**55TH PERCENTILE OF GAUNTLET PLAYERS AT 250-500 MATCHES**

Tomasz notices two things. First, he's now in a higher match-count cohort (250-500 instead of 150-250). The peers are more experienced. Second, his percentile dropped from top 20% to 55th — below median in a harder cohort.

**The discouragement risk:** This is the scenario the aspect description flags as dangerous. Tomasz *improved genuinely* during his active period. He did the work. He distributed his failure profile from 61% to 24%. The game is now telling him that improvement has been partially erased by absence and meta shift. A player with less intrinsic motivation might interpret this as "the game punishes you for leaving" and not return.

**Mitigation — the "personal best" annotation:** The distribution chart should show not just the current position but a ghost marker at the player's best-ever percentile position: a faded diamond at the 24% coverage mark, labeled "Personal Best (Analysis #6)." This ghost marker tells Tomasz: you achieved this once. The architecture that got you here is knowable — it's in your career analysis history. The current regression is a meta-adaptation problem, not a skill problem.

**What Tomasz does:** He opens his career analysis history (4.114 — coverage recurrence map) and compares analysis #6 (24% coverage) against analysis #8 (47% coverage). The delta shows two new config elements appearing in the top-5 candidates that weren't there before: HOOK-D timing and BUFFER-A overflow. These are the meta-shift weaknesses — elements that weren't exploited three months ago because nobody was running the strategies that expose them.

He builds targeted fixes for HOOK-D and BUFFER-A. After 20 matches, he runs analysis #9: coverage 31%, 28th percentile. The ghost marker at 24% is close. The sparkline's discontinuity is being corrected.

**The lesson for the design:** The percentile must be accompanied by personal trajectory context. Without the sparkline and the personal-best ghost, the percentile is a snapshot that punishes breaks and meta shifts. With those elements, it's a recovery target.

---

## Strengths

**Makes the abstract number actionable.** A coverage percentage in isolation requires expertise to interpret. 34% means nothing to a player who hasn't seen other players' coverage. The percentile instantly contextualizes: "most players at your level have higher coverage, so your distributed profile is genuinely unusual." This is the difference between a diagnostic number and a motivating signal.

**Creates a new aspiration axis independent of win rate.** Players who plateau in win rate but continue improving architecturally now have a visible metric showing that improvement. The coverage percentile trajectory can trend upward (better distribution) while win rate stays flat — exactly the same motivational function that eEDT provides, but measuring a different quality (structural health vs. contest depth).

**Rewards the career analysis habit.** The percentile only appears after 3+ career analyses. This gates the feature behind the diagnostic behavior the game wants to encourage. Players who ignore career analysis never see the percentile, which means they never feel judged by it. Players who engage with it get a reward proportional to their engagement.

**Enables community benchmarking without exposing individual data.** The distribution curve is aggregate — no individual player's coverage is identifiable. The player sees their own position against an anonymous crowd. This provides competitive context without privacy violation or direct shaming.

**The personal-best ghost prevents "loss aversion spiral."** By showing the player's historical best alongside their current position, the system acknowledges that improvement is non-monotonic. Breaks, meta shifts, and experimental phases cause temporary regressions. The ghost says: "you've been here before, you can get back."

---

## Weaknesses

**The lower-is-better inversion is confusing.** Every other percentile system in gaming (ELO percentile, rank percentile, accuracy percentile) follows higher-is-better. Coverage percentile inverts this: low coverage is good, so "top 15%" means your number is low. This is learnable but creates guaranteed first-encounter confusion. Players will misread "59th percentile" as positive when it means 59% of peers have better-distributed profiles. The plain-language text below the chart must do heavy lifting to prevent misinterpretation.

**Cohort bands hide important context.** A player at 249 matches is compared against the 150-250 cohort. A player at 251 matches jumps to the 250-500 cohort — a harder comparison group. This boundary effect can cause sudden percentile drops that feel arbitrary. Mitigation: use a sliding window centered on the player's match count (e.g., +/- 75 matches) instead of fixed bands. This smooths boundary effects but makes the backend aggregation more expensive.

**Can discourage players who are improving but remain in low percentiles.** A player who went from 72% coverage to 55% coverage has made genuine progress — but if the cohort median is 38%, they're still in the bottom third. The sparkline shows improvement. The percentile says "still below average." These can feel contradictory, and some players will weight the percentile more because it's comparative. The design must ensure the sparkline trajectory is *at least as visually prominent* as the percentile number.

**Cheesing via config fragmentation.** A player could artificially distribute their failure profile by splitting one logical config element into three aliased variants. If RELAY-C is responsible for 45% of failures, renaming its three sub-components as separate elements might report each at 15% — technically distributed, structurally unchanged. The career analysis engine must detect aliased clusters (4.69 — agent multi-cluster detection) and report them as a single logical element. But if the aliasing is subtle, the coverage percentile can be gamed.

**Community size dependency.** In early Gauntlet life (first few months after launch), each cohort band might contain only 50-100 players. Percentile rankings from small populations are noisy — a player at "top 15%" might be 8th out of 53 players, and one new entrant could shift them to top 20%. The system should display a cohort size indicator ("compared against 53 players") and suppress the percentile entirely if the cohort contains fewer than 30 players: "Not enough players in your match range for community comparison yet."

---

## Interaction Effects

**With 4.25 (EDT trajectory as career metric):** A player with low coverage AND high eEDT is the ideal Robot Uprising architect — distributed failure profile AND deep contest matches. These two metrics together define "architectural maturity" more completely than either alone. The profile card could show both side by side: eEDT sparkline (contest depth over time) and coverage sparkline (structural health over time). If both are in the top 25%, a combined visual treatment — both sparklines glowing in green — signals "elite architect" without needing a named badge.

**With 4.70 (Career analysis filtered by opponent archetype):** Ava's journey shows the power move: filtering the coverage percentile by opponent type. "Your coverage against Rushdown opponents is in the 88th percentile" is far more diagnostic than the unfiltered percentile. The interaction creates a matrix: coverage percentile x opponent archetype. A player might be top 10% overall but bottom 30% against Hook Fortress opponents — revealing a specific blind spot that the aggregate percentile masks.

**With 4.113 (Failure Concentration Ratio):** FCR is the advanced version of the same concept — instead of top-1 coverage, it uses the full distribution across top-5 candidates. The FCR percentile would be a strictly better metric than coverage percentile, but it requires 5+ career analyses to unlock and is harder to explain. Coverage percentile should be positioned as the accessible version; FCR percentile as the advanced version for players who want more precision. Showing both would be noise.

**With ELO/Gauntlet Rank correlation:** Players will immediately ask: "does low coverage correlate with high rank?" The answer is probably yes — weakly. Players who distribute their failure profiles are harder to counter with a single strategy, which produces more consistent Gauntlet performance. But coverage and rank are not the same thing. A rush player with 55% coverage and 68% win rate outranks a distributed player with 22% coverage and 52% win rate. The correlation exists but isn't destiny. The system should *not* show the correlation explicitly — it would create a false equivalence between structural health and competitive success.

**With community toxicity potential:** Percentile rankings create a hierarchy. Players in the bottom 25% are identifiable by their peers if they share screenshots. "You're bottom-quartile coverage at 200 matches" could become a dismissal in competitive discussions. Mitigation: the distribution chart does not show quartile boundaries, only the player's position. There are no named tiers ("Bronze coverage," "Gold coverage"). The plain-language text is descriptive, not evaluative. The system provides no tools for comparing two players' percentiles directly — each player only sees their own position against the anonymous distribution.

---

## Comparable Games and Media

**Overwatch career stats and hero percentiles:** Overwatch shows per-hero stats (damage/10min, healing/10min, deaths/10min) with percentile comparisons against other players of the same hero and rank. The percentile is shown as a colored bar — green for top 25%, yellow for middle 50%, red for bottom 25%. This is the most direct analogue: a per-player stat compared against a peer cohort. Key lesson: Overwatch's color-coded system (green/yellow/red) creates an immediate value judgment that Robot Uprising should avoid. The density curve is more nuanced than a three-color bar — it shows the shape of the distribution, not just a bucket.

**Chess rating distributions (Chess.com, Lichess):** Both platforms show the player's ELO as a position on a bell curve of all players at their time control. Lichess's distribution chart is particularly clean: a smooth curve with a vertical line at the player's rating. Players understand immediately: "I'm here, most people are there." The visual language is almost identical to the proposed coverage percentile display. Key lesson: Chess rating distributions are intuitive because higher is always better and the curve is normal. Coverage distributions are right-skewed (most players cluster at higher coverage) and lower is better — the curve shape will look different from what players expect, and the inverted axis must be explained.

**Duolingo leagues and weekly XP percentiles:** Duolingo places users in weekly leagues (Bronze, Silver, Gold, etc.) based on XP earned. The league screen shows the user's position relative to ~30 other users in their league, with promotion/demotion thresholds visible. The motivational effect is strong: players push to stay in the top 10 to avoid demotion. Key lesson: Duolingo's system is explicitly competitive — you're ranked against named opponents with visible scores. Robot Uprising's coverage percentile is anonymized and non-competitive by design. The Duolingo model shows that even non-competitive players respond to positional information, but the system must avoid creating a "league" feel that pressures players into grinding career analyses for percentile position rather than using them as genuine diagnostic tools.

**Spotify Wrapped yearly listening percentiles:** "You were in the top 0.5% of listeners for this artist." Spotify Wrapped proved that percentile statistics, when framed positively and delivered as celebration, create massive sharing behavior. The coverage percentile could learn from this framing for high-performing players: the "top 15%" label is inherently shareable. But Spotify only shows flattering percentiles — they never tell you "you're in the bottom 30% of podcast listeners." Robot Uprising must show the full range, which means the sharing incentive is asymmetric: top-percentile players share, bottom-percentile players don't. This asymmetry is acceptable — it's organic community content creation without forced virality.

---

## Sensory Description

The community distribution chart occupies a panel 600px wide and 200px tall, positioned below the career analysis results and above the sparkline history. The background is the same dark matte (`#1A1D21`) as the rest of the career analysis screen. The density curve is rendered with anti-aliased edges, filled in a gradient from steel-blue at the peak (`#6B7F99`) fading to near-transparent at the base. The curve's peak — where most players cluster — has a subtle inner glow, as if the density itself is luminous. The horizontal axis is marked with thin tick lines at 10% intervals, each labeled in small monospace text (`10%`, `20%`, ..., `90%`). No vertical axis labels.

The player's vertical line is 2px wide, rendered in solid amber (`#D4A855`) if above the cohort median, or solid sage-green (`#6BA35C`) if below. Where the line intersects the density curve, a diamond marker — 8px diagonal — appears in the same color, with a 1px white stroke to separate it from the curve fill. The diamond casts no shadow. It sits precisely on the curve, as if pinned.

The percentile text floats beside the diamond in the same monospace font used throughout the career analysis UI. Two lines: the coverage value in regular weight, the percentile statement in bold. The text color matches the line color (amber or green). Below the chart, the plain-language interpretation appears in a lighter grey (`#9CA3AF`), slightly smaller font, left-aligned beneath the chart's left edge.

When the player's coverage improves between career analyses, the vertical line slides leftward with a green luminous trail — the trail lingers for 1.2 seconds, a phosphor-decay effect reminiscent of old oscilloscope screens. The density curve itself does not animate between sessions — it updates silently, since the community distribution changes slowly. The player's line is the only moving element, making the personal position the visual focus against the stable community backdrop.

The personal-best ghost marker is a hollow diamond (stroke only, no fill) in a desaturated version of the green (`#6BA35C` at 40% opacity), positioned at the player's lowest-ever coverage value. A thin horizontal dotted line connects the ghost to the current position, spanning the distance between "where you've been" and "where you are." If the current position matches or beats the personal best, the ghost disappears and the current diamond gets a brief gold pulse — the same gold used for growth events in the eEDT sparkline.

---

## Discovered New Aspects

- **4.115 — Sliding-window cohort matching vs. fixed bands:** Whether to use fixed match-count bands (30-99, 100-249, etc.) or a sliding window centered on the player's match count for percentile computation; tradeoffs between computational cost, boundary effects, and cohort interpretability
- **4.116 — Coverage percentile filtered by opponent archetype:** Showing separate percentile positions for each opponent archetype filter — "top 10% overall, bottom 30% against Hook Fortress" — creating a per-archetype structural health diagnostic
- **4.117 — Minimum cohort size threshold for percentile display:** The population floor below which the percentile is suppressed; early Gauntlet launch behavior when cohorts are small; the "Not enough players" placeholder and its motivational implications
- **4.118 — Coverage percentile sharing and community screenshot culture:** Designing the percentile chart as a self-contained shareable artifact — does the chart include enough context (match count, analysis count, personal best) to be interpretable outside the game client?
- **7.16 — Community-wide coverage distribution as meta-health indicator:** Using the aggregate coverage distribution shape (right-skewed = healthy meta with diverse strategies; left-skewed = solved meta where most players have distributed profiles; bimodal = two distinct player populations) as a season health metric visible to developers and potentially to the community

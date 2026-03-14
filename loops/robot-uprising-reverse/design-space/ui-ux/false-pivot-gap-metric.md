# False Pivot Gap as a Standalone Metric

**Aspect:** 4.26 — EDT to "most dramatic moment" distance as a displayed stat; "False Pivot Gap: 52 ticks" as a community-shareable number; used in config necropsy posts to communicate how misleading the sealed watch was; high false pivot gap = rich sealed experience but harder diagnostic work

**Parent:** 1.06c-ext-A-ii — The False Pivot Anti-Pattern
**Siblings:** 4.18 — Effective Outcome Timestamp; 4.19 — False Pivot Annotation Opt-Out; 4.20 — Counterfactual Simulation; 4.27 — Pivot Accuracy as Displayed Stat
**Related:** 4.04b — Two-Act Debrief Structure; 7.10 — Config Necropsy as Community Artifact; 4.25 — EDT Trajectory as Career Metric; 7.13 — Community "Find the Pivot" Tournament Format

---

## The Core Concept

Every match with false pivots has a shape. The EDT tells you *when the outcome was actually decided*. The false pivot markers tell you *when the match looked most decided*. The **False Pivot Gap (FPG)** is the distance between these two things — measured in ticks — and it is one of the richest single-number descriptions of a match's narrative texture.

A match with `FPG: 0` had no misleading moments. The match looked decided exactly when it was decided. The sealed watch was tense all the way to the moment it resolved.

A match with `FPG: 52` looked completely decided 52 ticks before it actually was. For 52 ticks, the player watching the sealed replay thought they had already won or lost — while in fact the outcome was still genuinely contingent for most of that time (or, more precisely, the match entered its "foregone conclusion" phase 52 ticks after its most dramatic-looking moment).

Wait — that's backwards. Let me be precise:

**FPG = EDT − most_dramatic_false_pivot_tick**

Where:
- `EDT` is the minimum-counterfactual tick (last tick a small change could have flipped outcome)
- `most_dramatic_false_pivot_tick` is the tick of the largest false pivot (the moment that looked most decisive but wasn't)
- FPG is always positive when false pivots exist (the false pivot occurs before the EDT by definition — things look decided before they actually are)
- FPG = 0 means there were no false pivots or the most dramatic moment was exactly at EDT

A large positive FPG means: **the player thought the match was over long before it actually was.** The most thrilling visible moment in the sealed watch was a *misdirection* — the real crux came much later.

This is counterintuitive and important: high FPG is simultaneously:
- **Great for sealed watch tension** — the player spent a long time in anxious uncertainty after what felt like the decisive moment
- **Hard for diagnostic work** — the most emotionally salient event was not the actual cause of the outcome, requiring the player to look past the obvious moment and find the real one

---

## The Calculation

### Identifying "Most Dramatic Moment"

The most dramatic false pivot is not simply the grey marker closest to the EDT. It's the grey marker with the highest **drama score** — a composite of:

1. **Score differential width at that tick** — how decisive did the match look numerically at this moment?
2. **Duration of apparent resolution** — how many ticks after this moment did the match continue to *look* decided in the wrong direction before reverting?
3. **Proximity to end of match** — false pivots near the end are more dramatic than ones near the start (higher emotional investment)
4. **Buffer event salience** — if this tick corresponds to a visible agent event (large unit death, clear flanking maneuver completing), it scores higher regardless of score differential

The drama score is computed by the same tick-scheduler that computes agent states, using replay data already in memory. No additional simulation required.

### FPG Display Precision

FPG is always displayed in ticks, not percentages. This is important:
- Ticks are concrete (the player saw each tick happen in the sealed watch)
- Percentage would normalize away meaningful differences (FPG 52 out of 100-tick match vs. FPG 52 out of 200-tick match are very different experiences)
- Community can compare FPG values across matches only when the denominator (max_ticks) is also shown — so FPG is displayed as `52 / 120 ticks` not just `52`

The full display: **False Pivot Gap: 52 / 120 ticks (43%)**

The percentage provides cross-match comparability without replacing the raw tick count.

---

## What FPG Looks Like in the Debrief

### Visual Treatment on the Timeline

The debrief scrubber timeline shows:
- Gold diamond at the EDT position
- Grey triangles at each false pivot position
- A **teal horizontal bracket** spanning from the most-dramatic false pivot to the EDT — this bracket is the FPG visualization

The bracket appears only after Act 1 completes (after seal break). During Act 1's sealed watch, none of these markers exist. The bracket materializes as part of the Act 2 tool assembly sequence, along with the gold diamond and grey markers.

**The bracket's appearance:** A cool teal/cyan color, chosen specifically to contrast with both the warm gold of the EDT diamond and the neutral grey of the false pivot markers. It glows faintly, pulsing once when it materializes, then settling to a steady dim glow. At either end, small tick marks show the exact tick numbers. In the center of the bracket, the FPG number floats: `52 ticks`.

If there are no false pivots, the bracket does not appear at all. If there are multiple false pivot clusters, only the bracket to the most dramatic one appears as the primary FPG visualization — secondary brackets appear in a lighter, dotted style for the other false pivots, labeled "secondary gap."

### The Stat Block

In the post-match statistics panel (right side of debrief screen), the FPG stat appears below EDT:

```
Effective Outcome Timestamp:   Tick 68  (EDT)
False Pivot Gap:               52 ticks  (43%)
Most Dramatic Moment:          Tick 16   ◇ false pivot
```

The three-line grouping makes the relationship clear: EDT is where it was actually decided, FPG is how far back the most deceptive moment was, "Most Dramatic Moment" is the tick number of that moment.

A **small contextual tooltip** on hover over FPG explains: "The distance between the match's most dramatic-looking moment and when the outcome was actually sealed. A large gap means the match appeared decided long before it was — making the sealed watch more tense but the diagnostic work harder."

---

## Why FPG Matters to Different Players

### The Diagnostic Player

For players doing serious config necropsy work, FPG is a triage signal before they even touch the scrubber.

**Low FPG (0–15 ticks):** "The match looked decided right when it was decided. Whatever I see as the dramatic moment probably IS the actual cause. Clean diagnostic — focus there."

**Medium FPG (15–40 ticks):** "There's some misdirection. The obvious dramatic moment may or may not be the real cause. I need to check both the false pivot tick AND the EDT tick and understand the causal chain between them."

**High FPG (40+ ticks):** "The match was seriously misleading. The most dramatic thing I saw in the sealed watch was almost certainly NOT the deciding factor. I need to ignore my first instinct and go straight to the EDT bracket in the signal genealogy. This will take longer."

This is exactly the kind of pre-analysis meta-reasoning that expert players develop — FPG makes it explicit and teaches it to beginners by naming it.

### The Community Poster

A config necropsy post on the community forum or Discord typically starts with:
> "Lost 4/10 on the Gauntlet B3 map this week. EDT: tick 68. FPG: 52 ticks. Here's what actually happened..."

The FPG number communicates to readers: *this match had a serious red herring, so the real failure mode was not what the sealed watch made it look like*. Readers approach the necropsy already primed to look for the non-obvious analysis, rather than jumping to the first dramatic event they remember from their own watch.

Without FPG, a poster has to explain this context in prose. With FPG, it's a single number that conveys the same information to anyone who understands the vocabulary.

### The Streamer

For a streamer doing live debrief commentary, FPG appears on screen and shapes the commentary arc automatically:

- **FPG: 5 ticks** → Streamer: "OK so the gold diamond landed basically right where that flanking move was — this is a clean read, I know exactly what to fix."
- **FPG: 52 ticks** → Streamer: "Wait, the gap is 52 ticks? So that unit elimination at tick 16 that looked huge... wasn't actually the cause? The real crux was way later? OK we need to scrub forward carefully, something happened between 16 and 68 that I missed."

The 52-tick FPG creates a live puzzle for the streamer's audience: what happened in those 52 ticks? The streamer doesn't know. The audience doesn't know. Together they scrub forward looking for the real cause — turning the debrief into collaborative investigation. This is excellent streaming content specifically because of the misdirection structure.

---

## Player Journey 1: Kalani, 24, First False-Pivot Debrief

**Context:** Kalani has been playing for 3 weeks, reached the Gauntlet for the first time, just played her first sealed match. She's seen EDT before on campaign missions but this is the first match where the FPG bracket appears.

**Tick 0:00 — The Sealed Watch**

Kalani watches the sealed replay. Her scout swarms early, gets a kill at tick 12, and for the next 40 ticks her opponents seem to be scrambling. Everything looks fine. Then at tick 68, something unexpected happens — a relay chain she didn't account for triggers a counter-offensive that destroys her command agent. Match ends at tick 82. She lost.

She feels certain she knows why: her scouts overextended in the early game and that killed her.

**Tick 2:30 — The Seal Break**

The materialization sequence plays. Gold diamond at tick 68. Grey triangle at tick 12. A teal bracket appears between tick 12 and tick 68, labeled `56 ticks`. The stat block appears on the right: `False Pivot Gap: 56 ticks (68%)`.

Kalani doesn't know what the FPG bracket is yet — this is her first time seeing it. She hovers over it. The tooltip appears: "The distance between the match's most dramatic-looking moment and when the outcome was actually sealed. A large gap means the match appeared decided long before it was."

Her eyes go wide. "Wait. Tick 12 was the false pivot? That early kill wasn't actually the problem?"

**Tick 3:15 — The Realization**

She clicks on the grey triangle at tick 12. It highlights her scout's kill. She was right that something happened there — but the match stayed genuinely undecided until tick 68, 56 ticks later.

She looks at the bracket. 56 ticks of "I thought I was winning but the match was still actually open." She scrubs forward slowly from tick 12 to tick 68, watching her agents. There's something building in that 56-tick window she completely missed during the sealed watch because she thought she'd already won.

At tick 41, she sees it: her relay chain went silent for 3 ticks due to a buffer overflow. She'd never looked at this because she was watching the front line celebrate.

**Tick 4:00 — Resolution**

"Oh. OH. The early kill made me stop paying attention. I missed the relay failure completely. The FPG bracket is literally showing me 'this is where your attention went wrong' as a number."

She writes in the game's note field: "FPG 56 = I watched tick 12, missed relay failure at tick 41. Fix: add probe hook to relay before next run."

**UI Annotations:**
- FPG bracket: teal, 4px height, appears during Act 2 materialization sequence with a brief left-to-right sweep animation
- FPG tooltip: appears on hover, dismisses after 3 seconds, shows once-per-session without hover after first debrief
- Bracket tick labels: small, grey, positioned above the bracket line, show exact start and end ticks
- FPG stat in right panel: same row height as EDT, visually grouped with it by a 2px separator

---

## Player Journey 2: Marcus, 38, Config Necropsy Expert

**Context:** Marcus has 200+ hours, maintains a config that ranks top 50 in the Gauntlet. He's posting a necropsy for his community Discord. He's lost 3/5 recent Gauntlet matches on the same map.

**Opening the Debrief**

Marcus opens one of the three losses. He looks at the stat block immediately — he doesn't watch Act 1 again. He's already seen the sealed watch. He needs diagnosis.

`EDT: tick 89. FPG: 12 ticks.`

He exhales. "Low FPG. Clean match. The dramatic moment was the actual cause. Easy to explain."

He clicks the gold diamond. Signal genealogy lights up. He scrubs backward 12 ticks from 89. The false pivot at tick 77 shows a near-kill that looked decisive. The EDT at 89 shows the actual kill. The gap is one agent's survival and a hook chain that executed in those 12 ticks.

**Opening the Second Loss**

`EDT: tick 34. FPG: 48 ticks.`

He sits up straighter. "High FPG. 48 ticks. The match looked decided at tick 34 minus 48 = at tick... no wait, FPG = EDT minus false pivot tick. So false pivot was at tick 34−48? That's negative. Something's off."

He re-reads: `Most Dramatic Moment: Tick 34. EDT: Tick 82. FPG: 48 ticks.`

Right — EDT is tick 82, false pivot is tick 34, FPG is 48. The match looked decided at tick 34, but was actually decided at tick 82. He spent 48 ticks post-false-pivot thinking he was winning (or losing?).

He glances at the win/loss indicator: **Loss.** So he thought he was winning at tick 34, kept winning-looking for 48 ticks, then something at tick 82 flipped everything.

This is a *late-stage reversal* — not a diagnostic he expected. The FPG told him immediately: "don't look at your early game. Something in your late-game configuration failed." He goes straight to tick 82.

**The Necropsy Post**

He writes:
> "Match 2: EDT 82, FPG 48. Classic late-stage surprise. Whatever happened at tick 34 was NOT the issue — I kept up momentum past that for 48 ticks before a failure I hadn't anticipated. Turns out my command agent hit a buffer overflow at tick 79 which silenced three hooks simultaneously. The FPG almost perfectly maps to the command agent's degraded window. This is a buffer hygiene problem, not an opener problem."

The community immediately understands from `FPG: 48` that this analysis would be non-obvious, and trusts the rest of the necropsy accordingly.

**UI Annotations:**
- FPG in stat block: displayed with an intensity indicator — low FPG (< 15) shows teal; medium (15–40) shows amber; high (40+) shows red-tint; signal to expert players about analysis complexity before they begin
- FPG calculation direction tooltip: on hover, a small diagram shows `Most Dramatic Moment ←←← FPG →→→ EDT` with an arrow, clarifying which direction the gap points

---

## Player Journey 3: Priya, 16, Watching a Streamer

**Context:** Priya has never played Robot Uprising. She's watching a streamer (Cass) do a live debrief on stream. The streamer's match just sealed.

**What Priya Sees**

The debrief loads. A gold diamond appears on the timeline. Grey triangles appear. A teal bracket spans between them. The streamer reads: "FPG 37 ticks. Oh man. OK. So something I saw at tick 23 was a complete fake-out."

Priya types in chat: `what is FPG?`

The streamer explains: "It's how far apart the most dramatic-looking moment was from when the match actually ended up decided. 37 ticks means I thought something huge happened at tick 23 but the real decisive moment wasn't until tick 60. So anything I thought I noticed early in the match was probably a red herring."

Priya gets it immediately. She watches the streamer scrub the 37-tick gap, narrating what they find. There's a visible relay chain that builds over those 37 ticks, invisible during the action but clear in the signal genealogy view. Priya watches the streamer discover the relay chain failure in real time, saying "there it is!"

Priya's reaction: "Oh this is like a murder mystery. The false clue was at tick 23, the real weapon was the relay. And the FPG number told you to go looking."

She types in chat: `going to get this game, this looks so good`

**What FPG Did for the Streamer's Content**

Without FPG, the streamer would have started by analyzing tick 23 (the dramatic moment) and probably either found the real cause through luck, or posted a wrong analysis. The FPG number:
1. Immediately told the streamer they needed to look past the obvious
2. Gave them a specific tick range to explore (23→60)
3. Created a live puzzle for the audience

The streamer's discovery of the relay chain failure is a *designed viral moment* — and FPG is the mechanism that engineered it. Without the 37-tick bracket pointing to "something you missed in this window," the streamer doesn't do the scrubbing. Without the scrubbing, there's no discovery. Without the discovery, there's no viral clip.

**UI Annotations:**
- Teal bracket is visible to stream viewers without any hover — its existence as a persistent visual element makes it a conversation starter
- FPG number is large enough to be readable at 720p stream quality (minimum 14pt font equivalent)
- Bracket pulses once when Act 2 materializes — the pulse is visible in clipped highlights without sound

---

## Strengths and Weaknesses

### Strengths

**Makes the debrief tractable.** Before FPG, a player opening a 120-tick match debrief doesn't know where to look. EDT narrows it to one tick. FPG tells them whether that tick is reliably the dramatic one or whether there was misdirection along the way, helping them calibrate their scrubbing strategy.

**Community communication shorthand.** Config necropsy posts with FPG numbers are immediately parse-able to community members. `FPG: 52` needs no prose explanation — veterans read it as "this analysis will be non-obvious, the poster had to look past a significant red herring."

**Teaches false pivot literacy passively.** New players who haven't done the tutorial mission 5.24 still encounter FPG brackets on every debrief where false pivots exist. The bracket's shape — "something dramatic happened here, the real cause was here, the gap between them is this wide" — teaches the concept visually before any text explanation.

**Streamer content engineering.** High-FPG matches generate better streaming content because the debrief becomes a visible investigation. The FPG bracket points at the investigation window without revealing the answer. This is a deliberate piece of virality engineering.

**Config quality signal.** A player whose configs consistently produce high-FPG matches is building architectures with long failure chains — many interdependent pieces that mask the actual failure mode. This may indicate brittleness. FPG trajectory in the career stats (like eEDT trajectory in 4.25) could reveal whether a player is building tighter or looser causal chains over time.

### Weaknesses

**Computationally noisy.** The "most dramatic moment" calculation involves subjective-ish components (drama score). Two configs with identical match dynamics might get slightly different drama scores due to timing artifacts. Players who analyze this deeply may notice inconsistencies. The drama score algorithm must be deterministic and its components must be documentable.

**FPG without context is meaningless.** `FPG: 52` means nothing if you don't know max_ticks. The `52 / 120 ticks (43%)` format solves this but adds visual weight. Some players will see the display and initially misread it.

**Not useful for zero-false-pivot matches.** If no false pivots exist, FPG doesn't appear. Players who are building clean, efficient architectures (where the match looks decided right when it is decided) never see FPG. They might start *wanting* false pivots to get the community-shareable number, incentivizing less legible match dynamics for the wrong reasons. Mitigation: celebrate `FPG: 0 (No false pivots)` as a positive — clean architecture, clean narrative.

**Potential for gaming.** A player could intentionally design architectures to maximize FPG for social signaling purposes — "look at my 68-tick gap" — even if those architectures perform worse. This is probably not a significant problem (losing configs don't look desirable regardless of FPG), but should be monitored.

---

## Interaction Effects

### FPG + EDT (4.18)
FPG is meaningless without EDT as its anchor. They are co-dependent metrics displayed as a unit. The visual design must make their relationship immediately clear: EDT is the destination, FPG is the distance from the most misleading waypoint. Neither number alone tells the full story — the pair does.

### FPG + Two-Act Debrief (4.04b)
FPG appears only in Act 2, after seal break. Withholding it during Act 1 is critical — if the player could see FPG during the sealed watch, it would immediately tell them whether the dramatic moment they're experiencing is real or a fake. The emotional misdirection that makes a high-FPG match such a rich sealed experience depends entirely on the player not knowing FPG during the watch.

### FPG + Annotation Opt-Out (4.19)
When streamers suppress annotations with the opt-out toggle, FPG is also suppressed — it's an annotation-tier metric. This means streamers doing "find the pivot" commentary must identify the false pivot AND reason about the gap completely blind. This raises the stakes of the commentary format appropriately.

### FPG + Pivot Accuracy (4.27)
If pivot accuracy tracking is implemented, FPG interacts with it as a difficulty modifier. A player who correctly identifies the real pivot (gold diamond location) on a `FPG: 52` match should get much more accuracy credit than one who identifies it on a `FPG: 3` match. FPG-adjusted accuracy tracking would make the pivot accuracy stat meaningful rather than just rewarding easy-to-read matches.

### FPG + Career Metric (4.25)
EDT trajectory tracks architectural improvement over time. FPG trajectory could be a second dimension: are the player's false pivots getting smaller (tighter causal chains, cleaner architectures) or larger (more complex interdependencies)? A player whose FPG trend is `Large → Small` is building more legible, efficient architectures. A player whose FPG trend is `Small → Large` may be building increasingly baroque systems that are harder to diagnose. Both are valid design choices — FPG trajectory is diagnostic, not prescriptive.

### FPG + Config Necropsy Culture (7.10)
FPG is arguably the single most important piece of community vocabulary for necropsy culture. Before FPG, a poster had to explain in prose whether their failure analysis was "the obvious thing" or "not the obvious thing." After FPG, `FPG: 52` does that work in a number. This compression of diagnostic complexity into a single sharable number is the primary driver of FPG's community value — it's a common vocabulary for match narrative texture.

### FPG + "Find the Pivot" Tournament (7.13)
Tournament format explicitly benefits from FPG disclosure before the submission window. Participants knowing a match has `FPG: 48` are primed to look past the obvious moment — this could either make the tournament harder (no false leads) or easier (the gap is a search window). Design choice: reveal FPG in tournament format but not EDT; players know there's a 48-tick gap between the fake and real pivots but must identify which tick the fake is at and count forward.

---

## Comparable Games and Media

### Poker Hand Analysis
Professional poker coaching uses the concept of "key streets" — the specific decision point (pre-flop, flop, turn, river) where the hand was decided. A hand can *look* decided by the turn while actually being decided by a specific river card. Poker players learn to identify the "actual decision" vs. the "apparent decision" — this is exactly FPG in a different medium. Poker's after-action review tools often show a hand equity graph that explicitly labels the "Key Mistake" point separate from the "Dramatic Moment" — the gap between them is, functionally, FPG.

### Sports Analytics: Expected Goals vs. Actual Goals
In soccer analytics, xG (expected goals) can diverge from actual outcome. A team can dominate xG all match and lose 1-0. Post-match analytics show the "turning point" (the actual divergence event) separately from the "dominant period" (where xG was highest). FPG is the equivalent: the false pivot is the high-xG moment, the EDT is the actual turning point, the gap is how misleading xG was. Soccer analysts deal with FPG-equivalent concepts regularly.

### Film Editing: The "Chekov's Mislead"
Suspense thrillers deliberately plant scenes that look like the setup to the climax but aren't — the audience experiences a false resolution, then a real one. The gap between fake climax and real climax is a deliberate narrative device. In "Gone Girl," the fake-resolution moments are separated from the actual twist by a carefully designed gap. FPG is this narrative device made quantitative, with a number.

### Incident Response Postmortems
Engineering incident postmortems distinguish between the "triggering event" (what appeared to cause the incident — often the most dramatic signal) and the "proximate cause" (the actual first link in the failure chain). The gap between these in time is something SRE teams estimate qualitatively. FPG quantifies exactly this gap in a game context — and by training players to reason about FPG, the game explicitly teaches incident response reasoning.

---

## Sensory Description

**When the FPG bracket appears:**
The materialization sequence for Act 2 begins with the gold diamond landing at EDT — a warm gold pulse, a soft bell tone. Then the grey triangles appear at false pivot positions, each with a brief grey shimmer. Finally, the teal bracket sweeps in from the leftmost false pivot to the EDT, left to right, like a highlighter stroke. The sweep takes 0.4 seconds. As the bracket reaches the EDT diamond, the gold diamond pulses once in response — acknowledging the connection between the two elements.

The bracket itself glows with a cool teal bioluminescence — steady, calm, neither the warm urgency of gold nor the neutral grey of the false pivots. The FPG number floats centered on the bracket in the same teal color, 18pt, bold, no shadow.

**When hovered:**
The bracket brightens. The two endpoint markers (at false pivot and EDT) flare slightly. The tooltip appears in a dark translucent panel to the upper right of the bracket.

**When a high-FPG match opens:**
For matches with FPG over 40 ticks, the bracket appears with a slightly longer sweep animation (0.6s), as if emphasizing the distance. The FPG number fades in a half-beat after the bracket settles, giving the player a moment to see the visual before reading the number.

**In the stat block:**
For `FPG: 40+`, the teal number is slightly larger than normal (20pt vs 18pt). For `FPG: 0 (No false pivots)`, the stat line shows in light grey italics: `False Pivot Gap: — (clean match)` — positive framing, not absence.

**Audio:**
The bracket sweep has a soft synthesizer chord — two notes a fifth apart, rising in pitch left to right as the bracket extends. Higher pitch = further from EDT. The chord sustains for 1.5 seconds after materialization, fading slowly. In high-FPG matches, the same chord is stretched in duration (2.5s), creating a subtle sense of distance.

---

## The TikTok Clip

**15-second scenario:** Streamer watching sealed replay. Dramatic unit destruction at tick 23. Streamer: "OK that's GG, mission over—" Act 2 materializes. Gold diamond at tick 61. Teal bracket: `38 ticks`. Streamer: "Wait. Wait wait wait. 38 ticks?? That dramatic thing I thought decided the match was a FAKE?" Scrubs forward. Relay chain building silently in the background the whole time. Streamer: "THE RELAY CHAIN. I never saw it. The scouts were a DISTRACTION." Cut to the relay chain resolution at tick 61. The streamer is losing their mind. Text overlay: "False Pivot Gap: 38 ticks."

This clip is great because:
1. The reversal is visible in the stat number before the explanation
2. The streamer's discovery is live, real, and highly reactive
3. "False Pivot Gap" as vocabulary is introduced naturally, not explained in a tutorial
4. No context required — viewer understands "thing they thought happened didn't matter, real thing happened later" from pure reaction

---

## Open Questions / Discovered Aspects

**4.32 — FPG trajectory as career diagnostic:** Should FPG trend (are my false pivots getting shorter?) appear in the career stats alongside eEDT trend? A player whose FPG trend moves Large→Small is building more legible causal chains. How is this displayed? What threshold constitutes a "meaningful" FPG shift?

**4.33 — FPG per map archetype:** Different Gauntlet maps have characteristic FPG distributions — some maps structurally produce high false pivot density due to their geometry. Should maps show their "average FPG" as a map metadata stat so players can set diagnostic expectations before deploying? (Parallels 4.18's EDT ratio as map quality indicator.)

**4.34 — FPG as match recommendation engine:** A "Show me a high-FPG match from my history" or "show me community matches with FPG > 40" as a way to find entertaining sealed content for re-watching; FPG as a quality filter for match browsing.

**4.35 — The FPG leaderboard inversion:** Unlike win rate or eEDT, there's no "good" direction for FPG — low FPG means clean architecture, high FPG means complex false pivots, both are neutral. A leaderboard that rewards "most interesting FPG distribution" rather than any specific value would be novel community content — "who produces the most narratively rich matches regardless of win rate?"

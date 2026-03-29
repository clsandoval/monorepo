# The Shrinking Wings

**Aspect:** 4.93 — Accuracy stat confidence interval display: showing not just "71%" but "71% +/- 14pp (n=30)"; the confidence interval shrinks as n grows, making data accumulation feel meaningful; teaches statistical uncertainty without a statistics lecture; interaction with vocabulary claim (statistical confidence as transferable engineering concept).

**Design Option Name:** The Shrinking Wings

---

## What It Is

Every accuracy percentage in Robot Uprising is a lie of omission. "71%" says nothing about whether that number was measured across 8 sessions or 800. The Shrinking Wings treatment corrects this by rendering every accuracy stat as a living organism with a wingspan: the percentage text sits inside a horizontal bar that stretches and contracts — wide wings of translucent amber when n=5, narrowing to a razor-thin gold line by n=100, the shrinking interval a visual reward for persistence.

The display format:

```
71% +/- 14pp  (n=30)
```

Below the text, a horizontal band — the wings — spans from the lower confidence bound to the upper. At n=30, those wings stretch from roughly 57% to 85%, a yawning gap of translucent amber occupying nearly a third of the full 0-100% axis. At n=150, the same 71% accuracy pins itself between 63% and 79%, the wings pulled tight against the body, the amber hardened to a dense gold. At n=300, the wings are barely visible — a 4-pixel sliver of warm gold flanking a bright white center tick. The number has stopped trembling.

The player never encounters the phrase "confidence interval." They encounter a shape that breathes wide when uncertain and cinches tight when proven. The mathematics — a Wilson score interval computed internally, conservative rounding on the half-width — remain invisible. What the player sees is a creature that grows calmer the more data it eats.

### Why "Wings"

The visual metaphor emerged from the bar's behavior at low sample sizes. When n is small, the two translucent extensions flanking the center tick look like outstretched wings — broad, feathered at the edges, trembling with potential. As data accumulates, the wings fold inward, the creature settles. A butterfly pinned mid-flight, gradually coming to rest. The name gives players a shared vocabulary: "my accuracy wings are still wide" means "I don't have enough data yet." "My wings collapsed to +/- 4" means "this number is real."

---

## The Sensory Design

### The Bar at Rest

The bar occupies a 200px-wide horizontal strip, 8px tall, positioned directly beneath the accuracy text in the Transparency Drawer footer. It is composed of three layers painted onto a single canvas:

**Layer 1 — The Axis Ghost.** A 1px line of grey at 8% opacity running the full 200px width. This is the 0% to 100% reference. It is nearly invisible — a graphite whisper beneath the data. No tick marks. No labels. Its job is to establish scale without demanding attention.

**Layer 2 — The Wings.** Two translucent rectangles extending left and right from the center tick, filling the region between the lower and upper confidence bounds. At n=30 with an accuracy of 71%, the left wing stretches from the 57% position to the 71% mark (approximately 28px), and the right wing from 71% to 85% (another 28px). Total wingspan: 56px out of 200px. The wings are rendered in a warm amber (#D4A34B) at variable opacity:

- **n < 50:** 18% opacity. The wings are ghostly — suggestions of color, like tea stains on parchment. The edges feather outward with a 3px Gaussian blur, making the boundaries feel soft, approximate, honestly imprecise.
- **50 <= n < 120:** Opacity scales linearly from 18% to 40%. The amber solidifies. The edge blur tightens from 3px to 1px. The wings are becoming real.
- **n >= 120:** Opacity scales from 40% toward 55% (never higher — the wings never become fully opaque, because no finite sample grants total certainty). The blur drops to 0px. Clean edges. The wings are now a measured gold, steady and earned.

**Layer 3 — The Center Tick.** A 2px-wide vertical line at the point estimate position, extending 3px above and 3px below the bar. Rendered in pure white (#FFFFFF) at 90% opacity. This is the "best guess" — the single number the player would see without the wings. It sits inside the wingspan like the body of the insect, small and precise, anchored by the data flanking it.

**Bound Labels.** Two numbers in 8px monospace type, rendered in the same amber as the wings, positioned 2px below the left and right wing tips. At n=30: "57%" on the left, "85%" on the right. At n=200: "65%" and "77%". The labels track the wing edges, sliding inward as the interval contracts. When the wings are very narrow (under 12px total), the labels are suppressed to avoid overlapping — the band alone communicates tightness.

### The Contraction Animation

When the player opens the Transparency Drawer and the interval has changed since last viewed, the wings animate from their previous width to their current width. Duration: 700ms. Easing: cubic-bezier(0.25, 0.1, 0.25, 1.0) — a gentle deceleration that slows at the end, the wings settling into position rather than snapping. The left wing edge slides rightward; the right wing edge slides leftward. They converge on the center tick like hands closing around something precious.

If the interval has widened (rare — happens when accuracy shifts after a config change or when the player switches between measurement modes), the wings spread outward with the same timing. The expansion feels like an exhale, an admission of renewed uncertainty.

If the change is less than 2px of total width, no animation plays. Imperceptible motion is worse than stillness.

### The Milestone Chime

The first time the wings contract below +/- 10pp, a sound plays: a single sustained note on a glass marimba, beginning at middle C and bending upward by a major second over 400ms, then releasing. Not triumphant. Not celebratory. The sound of a lens clicking into focus. Volume: 12% of the game's ambient level. It plays once in the player's career, marking the moment their data crossed from "rough estimate" to "useful measurement."

A second chime — the same instrument, now a rising perfect fourth — plays the first time the wings drop below +/- 6pp. This is the "reliable" threshold. The player has accumulated enough data that their accuracy stat would be considered publishable in a professional context. The chime is slightly louder (18% ambient), slightly longer (500ms). It acknowledges the hours of play that produced this precision.

No further chimes. Past +/- 6, the diminishing returns make each additional contraction imperceptible. The silence itself teaches: eventually, more data stops mattering as much.

---

## Player Journeys

### Journey: Dalisay, 27, UX designer, 40 hours in

**Context:** Dalisay works at a Manila-based fintech startup. She plays Robot Uprising on commute rides, two or three sessions per sitting. She has just completed Mission 7 — "Cordillera Relay Fog" in the Benguet province campaign. She uses a 4-agent architecture with 3 hooks. She has never taken a statistics course. She opened the Transparency Drawer for the first time last week because a loading screen tip mentioned it.

**Minute 0:00 — The First Sighting**

Dalisay taps into the Transparency Drawer after a successful mission. She scrolls past the pre-ranking candidates list, past the signal genealogy summary, down to the footer. New content since her last visit:

```
pre-ranking accuracy  ·  64% +/- 16pp  ·  n=32
```

Below it, a thin horizontal bar. A wide smear of pale amber stretches across nearly a third of the bar's length, ghostly and diffuse, its edges bleeding into nothing. A tiny white tick sits slightly left of center within the amber cloud.

She reads "64%" — that part makes sense. She reads "+/- 16pp" — and her eyes skip over it. She does not know what "pp" means. She does not process the "+/-" as a range indicator. She sees the number 16 and thinks *that seems like a lot of something.*

She looks at the bar. The amber smear is wide. She looks at the white tick. It is small inside the smear. She has an imprecise but correct intuition: *the white tick is where the game thinks my accuracy is, and the amber stuff is... how sure it is?*

She taps the "+/-" text. A tooltip fades in over 200ms, rendered in a dark card with rounded corners:

```
What does +/- 16 mean?

Your true accuracy is probably somewhere between 48% and 80%.
With only 32 sessions of data, the estimate is rough.

Play more sessions and this range will shrink:
  At 100 sessions:  +/- ~9
  At 200 sessions:  +/- ~6

More data = more certainty.
```

She reads "somewhere between 48% and 80%." She looks at the amber smear again. The left edge sits near a position she now maps to 48%. The right edge near 80%. The smear IS the range. The visual and the words click simultaneously.

**Minute 0:40 — The Mental Model**

Dalisay scrolls back up, then back down. She is building a model. The amber cloud is doubt. The white tick is the guess. More games makes the cloud smaller. She does not articulate this in statistical terms. She articulates it in design terms: *the amber is like a loading indicator — it shows how uncertain the system still is.*

She screenshots the stat and sends it to her design team's Slack with the message: "This game shows uncertainty as a physical width. Why don't we do this for our conversion rate dashboard?"

Her engineering lead responds: "That's literally a confidence interval. Our analytics tool already computes them but we never display them."

Dalisay replies: "Maybe we should."

**Minute 0:00 (Session 58, two weeks later) — The Narrowing**

Dalisay opens the drawer after Mission 11 — "Visayan Archipelago Handoff." The footer:

```
pre-ranking accuracy  ·  67% +/- 12pp  ·  n=58
```

The wings contract on screen. She watches the amber edges slide inward over 700ms — from where she remembers them being (wide, diffuse) to their new position (tighter, slightly more saturated). The amber is no longer ghostly. It has thickened to something approaching substance, the edge blur reduced, the color a shade warmer.

She thinks: *it got smaller. I played more games and it got smaller.* She feels a small but genuine satisfaction — not from her accuracy improving (it moved from 64% to 67%, barely noticeable) but from the wings shrinking. The measurement is becoming more trustworthy. Her data is becoming real.

She taps the bar. No new tooltip. She doesn't need one. She knows what is happening.

**Minute 1:10 — The Transfer Moment**

That evening, Dalisay reviews a competitor analysis report at work. A table shows: "Feature adoption rate: 23% (n=47)." No confidence interval. No margin of error. She thinks — for the first time in her career — *that number could be anywhere from 12% to 37%. There are only 47 users in that sample. The wings would be huge.*

She adds a column to the report: "Margin of error." She uses an online calculator to compute Wilson intervals for each row. Her product manager asks where she learned about confidence intervals. She says: "A game."

**UI Annotations:**
- **Accuracy text row:** `pre-ranking accuracy  ·  64% +/- 16pp  ·  n=32` rendered in 13px system font; the "64%" is white, the "+/- 16pp" is amber (#D4A34B) at 70% text opacity, the "(n=32)" is white at 40% opacity — a deliberate hierarchy where the point estimate dominates, the margin qualifies, and the sample size whispers
- **Wings bar:** 200px wide, 8px tall, positioned 4px below the text row; amber wings at 18% fill opacity with 3px edge blur; white center tick at 2px width; bound labels "48%" and "80%" in 8px amber monospace
- **Tooltip card:** 240px wide, dark background (#1A1A1A at 95% opacity), 12px body text, appears on tap/hover over the "+/-" value; includes the shrinkage schedule as a visual promise
- **Contraction animation:** 700ms cubic-bezier ease-out; edges slide inward; opacity increases from 18% to ~24% between n=32 and n=58

---

### Journey: Renz, 16, high school student, 85 hours in

**Context:** Renz plays Robot Uprising competitively with his school's esports club in Cebu. He runs aggressive multi-agent architectures — currently 6 agents with 11 hooks. He treats the game primarily as a puzzle optimizer. He is in the late campaign, approaching Mission 9 — "Mindanao Signal Cascade." He checks his accuracy stat after every session because a club mate told him "anything below 60% means your pre-ranking is basically random." He has a solid grasp of the wings from 50+ sessions of exposure but has never read the tooltip.

**Minute 0:00 — The Architect's Dilemma**

Renz just redesigned his entire hook chain — collapsed four detection hooks into two compound hooks, added a new relay-priority hook, removed an obsolete failover hook. Net change: 11 hooks down to 9, but with more complex trigger conditions. He opens the Transparency Drawer expecting his accuracy stat to reflect the improvement.

```
pre-ranking accuracy  ·  71% +/- 8pp  ·  n=112
```

The wings are modest — a strip of warm gold, 30px wide, edges clean, opacity around 38%. He knows this shape. He has watched it contract over weeks of play. The 71% feels solid to him — not because he understands Wilson intervals but because the wings are small.

But something nags him. He changed his config dramatically. Will the next 10 sessions pull his accuracy up or down? He doesn't know, and the current stat is contaminated by sessions played under the old config.

**Minute 0:25 — The Config-Reset Snap**

Renz navigates to the accuracy stat's filter toggle (a small icon resembling a funnel, positioned right of the n= value). He taps "Current config only." The display snaps:

```
pre-ranking accuracy  ·  — +/- —  ·  n=2  (current config)
```

The wings explode outward. Where there was a controlled 30px gold band, there is now a sprawling amber haze occupying nearly the entire 200px bar — the confidence interval at n=2 spans from roughly 5% to 95%, the Wilson interval for 2 observations near any moderate proportion. The amber is at its most translucent: 12% opacity, edges blurred to 4px, barely distinguishable from the background. The center tick floats alone in a fog.

Renz stares. Two sessions on the new config. The game is telling him, in a language he has learned to read over 85 hours of play: *you know nothing about this config yet.*

He feels the loss. Not of accuracy — of certainty. The wings were narrow and golden. Now they are wide and ghostly. He built something new and the game reset his proof.

**Minute 0:50 — The Grind Decision**

Renz switches the filter back to "All configs." The wings snap tight again: 71% +/- 8pp, n=112. Solid. Earned. He switches back to "Current config only." The wings blow wide. n=2. Fog.

He toggles back and forth twice more. The contraction-expansion animation plays each time — 700ms of the wings folding in, 700ms of them spreading out. The visual oscillation is dramatic. Tight-wide-tight-wide. Certainty-doubt-certainty-doubt.

He makes a decision: he will play 30 sessions on the new config before evaluating it. Not because anyone told him 30 is a useful sample size. Because he has watched the wings enough times to know that they are still enormous at n=10, annoying at n=20, and tolerable at n=30. His body knows the convergence curve even if his math class has not yet covered it.

He messages the club group chat: "Rebuilt my hooks. Wings are massive right now. Need like 30 games before I know if it's better."

Three club members immediately understand what he means. They have all watched their own wings shrink.

**Minute 0:00 (Session 142, three weeks later) — The Verdict**

```
pre-ranking accuracy  ·  76% +/- 13pp  ·  n=32  (current config)
```

The wings have contracted from the n=2 fog to a recognizable shape — still wider than he'd like, but the amber has thickened, the edges sharpened, the bound labels now visible: "63%" and "89%". The center tick sits at 76%. Five points higher than his career average.

He looks at the all-configs view: 72% +/- 7pp, n=144. The new config is pulling his career average up. He can see it in the center tick position — it shifted rightward by a few pixels since last month.

He switches back to current-config view. The wings are still substantial at +/- 13, but 76% is high enough that even the lower bound (63%) is above his old career accuracy (71%). He thinks: *even if the wings are right and I'm only at 63%, that's still decent.* He has, without knowing it, performed an informal hypothesis test — checking whether his new config's lower confidence bound exceeds his baseline. The concept of "statistically distinguishable from the old performance" has entered his reasoning through the wings' geometry.

**UI Annotations:**
- **Config filter toggle:** Small funnel icon (12x12px, white at 50% opacity) positioned 8px right of the n= value; tapping cycles between "All configs" and "Current config only"; the label changes accordingly
- **Config-reset expansion:** When switching to a low-n filtered view, the wings animate outward over 700ms; the opacity drops, the blur increases, the bound labels fade out (suppressed below n=8); the visual regression from tight-gold to wide-amber is the primary emotional payload
- **Toggle oscillation:** No cooldown on the filter toggle; rapid toggling produces rapid wing animations; this is intentional — the contrast between narrow and wide teaches through direct comparison
- **Lower-bound reasoning:** No UI element explicitly supports "is my lower bound above my old average?" — the player infers this from the wing geometry and the bound labels; the game trusts the player to reason spatially

---

### Journey: Tita Grace, 58, retired school principal, 200 hours in

**Context:** Tita Grace plays Robot Uprising on her tablet in the evenings. Her grandson introduced her to the game. She is methodical, cautious, and patient. She runs a conservative 3-agent architecture with 5 hooks and has never changed it — the same config for 180+ sessions. She does not play competitively. She plays because the Sealed Watch phase reminds her of watching her students take exams: you prepare them, you release them, you observe what happens. She has the tightest wings of anyone she knows.

**Minute 0:00 — The Tight Gold Line**

Tita Grace opens the Transparency Drawer after her 187th session. She scrolls to the accuracy stat, which she calls "my grade":

```
pre-ranking accuracy  ·  74% +/- 6pp  ·  n=187
```

The wings are a tight gold ribbon — 22px of saturated amber at 50% opacity, edges perfectly crisp, flanking the white center tick. The bound labels read "68%" and "80%", tucked close together. The bar looks almost like a solid gold line with a white dot in the middle. No blur. No ghostliness. Just a confident, earned stripe.

She remembers what it looked like at n=30 — the wide amber wash, the blurry edges, the feeling that 74% was just a guess. She remembers the tooltip's promise: "this range will shrink." It shrunk. Over six months of evening sessions, the amber pulled tight like a drawstring.

She touches the bar — a habit she developed around session 60, tapping it the way she would tap a thermometer to check if it's settled. Nothing happens on tap (the tooltip is on the "+/-" text, not the bar). But the gesture is meaningful to her. She is checking: *are you still steady?*

**Minute 0:20 — The Grandson Conversation**

Her grandson Marco, 14, is watching over her shoulder. He plays too — he is in Renz's esports club. He looks at her screen.

"Lola, your wings are so small."

"Because I play a lot."

"No, because you never change your config. Look." He pulls up his own stat on his phone: 69% +/- 11pp, n=48 (current config). His wings are wide and translucent. "I keep rebuilding, so my n keeps resetting."

Tita Grace looks at his screen, then hers. His wings are more than twice as wide. She says: "But yours could be higher than mine. 69 plus 11 is 80."

Marco stares at her. She has just articulated the concept that overlapping confidence intervals mean the true values could be in either order — that his higher upper bound (80%) exceeds her point estimate (74%), so his config might actually be more accurate despite showing a lower number. She learned this from six months of watching a gold bar.

Marco tries to explain that "+/- 11 means it could also be as low as 58," but Tita Grace is already ahead of him: "That's why you need to play more. Make the wings smaller first, then we'll see."

She has, in her own language, stated the statistical principle: *do not compare point estimates when the confidence intervals overlap. Collect more data until the intervals separate.*

**Minute 1:00 — The Trust Decision**

Tita Grace is considering whether to change her hook priorities for the first time. A community guide suggested reordering her detection hooks to prioritize relay-chain failures, which are her most common issue. But she hesitates. She looks at her wings: +/- 6pp, n=187. If she changes her config, the "current config only" view will reset to n=0. The wings will blow wide again. She will lose her proof.

She weighs this for a full thirty seconds, staring at the tight gold line. Then she decides to change one hook ordering and nothing else. A minimal intervention. She reasons: *if I change one thing, the wings will grow but not as much as if I change everything.* This reasoning is incorrect — the confidence interval resets based on n regardless of change magnitude — but her instinct (small changes preserve more information) maps to a real statistical concept: if two configs share most of their structure, a Bayesian prior from the old config can tighten the interval on the new one faster.

The game does not implement Bayesian priors. But Tita Grace's intuition has invented the concept independently, because the wings made uncertainty a thing she could see and touch and reason about.

**Minute 2:30 — The Next Evening**

She has played 4 sessions on the modified config. Current-config view:

```
pre-ranking accuracy  ·  75% +/- 22pp  ·  n=4  (current config)
```

The wings are huge again. A wide amber fog, blurry at the edges, barely colored. She shakes her head and switches to all-configs view: 74% +/- 6pp, n=191. The tight gold line, slightly adjusted. She exhales.

She will check the current-config wings every evening. She is watching them contract the way she used to watch her garden grow — slowly, patiently, knowing that every session brings them a little closer.

**UI Annotations:**
- **Tight gold line at high n:** At +/- 6pp, the total wingspan is approximately 24px (mapping the [68%, 80%] interval onto a 200px axis); the amber is at 50% opacity with 0px blur — a crisp, solid strip; the bound labels ("68%" and "80%") are rendered in gold (#D4A34B) at 50% text opacity, close enough together to nearly touch
- **Cross-device comparison:** When Marco shows his phone screen, the visual contrast between wide/translucent wings and narrow/solid wings is immediately legible even at tablet distance; the wings communicate certainty level faster than reading the numbers
- **Config change reset:** The transition from n=187 (tight) to n=4 (wide) on the current-config filter is the most dramatic contraction-expansion the player has experienced; the 700ms animation feels slow and deliberate, the amber dissolving outward like fog
- **All-configs fallback:** The all-configs view absorbs new sessions into the full dataset; the wings barely move (adding 4 sessions to 187 changes the interval by fractions of a pixel); this stability provides emotional anchor while the current-config view is volatile

---

## Strengths

**Data accumulation becomes a tangible, visible reward.** In most strategy games, playing more sessions yields more unlocks, more resources, more progression. Here, every session tightens the wings — a visual reward that maps to epistemic reward. Session 31 is not "another game." It is the session that moved the amber edge 3 pixels inward. The player can see their data becoming real. This makes repetition feel purposeful in a way that XP bars cannot: the progression is toward truth, not toward a number going up.

**The teaching is invisible and durable.** No tutorial screen. No statistics lecture. No glossary entry for "confidence interval." The player learns by watching a shape change over weeks. The knowledge deposits slowly, like sediment: wide means uncertain, narrow means proven, more games means narrower. By the time the player encounters a confidence interval in a medical report or a news article, they already have the embodied model. They picture the wings. They know what +/- 4 looks like versus +/- 15. The learning persists because it was never framed as learning — it was framed as watching.

**The config-reset snap teaches a profound concept.** When the player changes their config and the current-config wings blow wide, they feel the loss of certainty. This single moment teaches two principles that entire university courses struggle to convey: (1) measurement validity depends on the thing being measured staying the same, and (2) past data does not automatically apply to changed systems. The emotional sting of watching tight wings dissolve into fog is worth a hundred lectures on external validity.

**The diminishing returns curve is felt, not explained.** The wings contract rapidly at first (n=30 to n=60 is visually dramatic) and then slowly (n=200 to n=300 is barely perceptible). The player does not need to know about 1/sqrt(n) scaling. They feel it: the early sessions mattered more. This intuition transfers directly to professional contexts — A/B test sample size planning, survey design, quality audits — where knowing when to stop collecting data is as important as knowing how to analyze it.

**Shared vocabulary emerges organically.** Players say "my wings are wide" or "wings collapsed to +/- 4" the way they say "my health is low." The metaphor is spatial, intuitive, and compact. It gives the community a way to discuss statistical uncertainty without using the word "statistics." When Renz messages his club about his wings being massive after a config rebuild, every member understands the implication: *he doesn't have enough data yet.* The wings become social shorthand for epistemic honesty.

---

## Weaknesses

**The +/- notation alienates non-quantitative players.** "71% +/- 14pp" looks like a math problem to players who avoid math. The wings mitigate this by providing a visual channel, but the text itself — with its "pp" jargon and "+/-" symbol — may cause some players to skip the entire stat. A player who never engages with the accuracy footer never sees the wings and never receives the teaching. The visual form is self-explanatory; the text form is not.

**The pedagogical arc requires hundreds of sessions.** The wings contract meaningfully only over 50-200 sessions. At two sessions per sitting, three sittings per week, reaching n=100 takes roughly four months. Many players will stop playing before the wings narrow enough to feel "tight." The concept of diminishing returns cannot be experienced without experiencing the diminishing — which requires sustained engagement that casual players will not provide. The game teaches statistics only to its most committed players.

**False precision worship is a real risk.** A player like Tita Grace who values narrow wings may refuse to change her config — not because the config is optimal, but because change resets the wings. The narrow band becomes a sunk cost that discourages experimentation. This is the opposite of good engineering practice: the player should change configs when they have reason to believe a change will help, regardless of how much data they have accumulated on the current config. The wings can become a trap that punishes adaptation.

**Asymmetric intervals displayed as symmetric.** The Wilson score interval is asymmetric — the wings should be wider on one side near the boundaries (0% or 100%). Displaying "+/- 14pp" as though the interval is symmetric is a simplification that misleads players whose accuracy is near the extremes. A player at 92% accuracy does not have an interval of [78%, 106%]; the Wilson interval is something like [82%, 97%]. Rounding to a symmetric "+/-" loses this nuance. Players with extreme accuracy scores may notice that the upper bound label exceeds 100% or that the wings look oddly shaped near the edges.

**Visual noise in an already dense footer.** The Transparency Drawer footer already contains the accuracy stat, trend sparkline, and filter controls. Adding a 200px horizontal bar with animated wings, bound labels, and opacity transitions increases the visual density of a UI region that many players already find overwhelming. The wings compete for attention with the accuracy number itself. Some players may find the bar more confusing than clarifying — a chart they didn't ask for, appended to a stat they're still learning to interpret.

---

## Interaction Effects

**With 4.64 (Pre-ranking accuracy as displayed stat):** The wings are the uncertainty layer on top of the point estimate. Without 4.64's accuracy number, the wings have nothing to wrap around. Without the wings, the accuracy number is a naked point estimate that invites over-interpretation. The two are inseparable: the number is the claim, the wings are the confidence in the claim.

**With 4.63 (Player-configurable pre-ranking weights):** When a player adjusts their pre-ranking weights, the accuracy stat's meaning changes — it now measures a different heuristic. The wings should reset (or widen dramatically) to reflect the invalidated calibration. This interaction creates a pedagogically powerful moment: the player watches their hard-earned narrow wings dissolve because they changed the measurement instrument. The message — *new instrument means new calibration* — is a core metrology principle taught through emotional experience.

**With 4.94 ("Committed to QUICK" sessions-only accuracy):** The committed-to-QUICK metric has its own sample size (typically smaller than the total accuracy n, since many sessions include THOROUGH verification). The wings on the committed-to-QUICK stat are therefore wider than those on the standard accuracy stat, even at the same career stage. Showing both stats with their respective wings teaches a second-order lesson: *the same data, sliced differently, has different precision levels.* A player who sees 71% +/- 8pp (all sessions) alongside 73% +/- 14pp (committed-to-QUICK only) learns that restricting a dataset reduces sample size and widens uncertainty.

**With 4.95 (Accuracy leaderboard opt-in):** Community-level accuracy comparisons gain a new dimension when every player's accuracy has visible wings. Two players with 71% and 68% accuracy appear to differ — but if their wings overlap (71% +/- 8 and 68% +/- 10), the visual makes it obvious that the difference might not be real. This is the concept of statistical significance rendered as wing overlap, with no need to explain p-values or hypothesis testing. Players who compare wings on the leaderboard are performing visual inference tests.

**With 4.96 (Accuracy-vs.-complexity scatter plot):** Each dot on the scatter plot represents a config version's accuracy. If dots carry mini-wings (tiny horizontal error bars), the scatter plot becomes a forest of varying certainty — some dots precise (config versions with many sessions), others fuzzy (config versions used briefly). The player learns that not all data points are equally trustworthy, and that the scatter plot's story depends on which dots have enough data behind them. A dot in the "Rare Mastery" quadrant with wings spanning half the vertical axis is not proof of mastery — it is a hope with insufficient evidence.

**With 8.08 (Real-language vocabulary claim):** The wings are the vocabulary claim's strongest test case. The "+/-" in the game IS the "+/-" in a professional statistical report. The n= in the game IS the n= in a research paper. No metaphor. No analogy. No translation needed. A player who reads "71% +/- 8pp (n=112)" in Robot Uprising can read "conversion rate: 3.2% +/- 0.4pp (n=1,200)" in a business dashboard with zero additional training. The form is identical. The concept transfers at 100% fidelity.

**With 8.09 (Diagnostic layer as teaching arc):** The wings are one station in a larger pedagogical arc that includes the diagnostic system, the EDT trajectory, and the pre-ranking transparency panel. Each system teaches a different aspect of data literacy: the diagnostic system teaches causal reasoning, the EDT trajectory teaches trend analysis, and the wings teach measurement uncertainty. Together, they produce a player who can reason about cause, trend, and confidence — the three pillars of quantitative literacy.

---

## Comparable Games and Media

**FiveThirtyEight's election needle (2016-2024).** Nate Silver's real-time election forecast displayed a needle that swayed left and right as results came in, with the oscillation range reflecting the model's uncertainty. Early in the evening, the needle swung wildly — wide wings. As precincts reported, the swings dampened — narrowing wings. The Shrinking Wings borrow this exact dynamic: early data produces wide visual uncertainty, accumulated data produces stability. FiveThirtyEight proved that mainstream audiences can engage with uncertainty visualization when it is tied to something they care about. Robot Uprising applies the same principle to a personal stat.

**Hearthstone's "games played" ranking decay.** Hearthstone's ranked mode requires sustained play to maintain rank — decay pushes inactive players downward. This creates a similar "data accumulation as progression" dynamic, but Hearthstone's version is punitive (lose rank if you stop) while Robot Uprising's is epistemic (lose certainty if you change configs). The Shrinking Wings reward persistence without punishing absence — the wings stay narrow even if the player takes a break. They widen only when the measured system changes.

**Clinical trial interim analyses (medicine).** Pharmaceutical trials compute confidence intervals at interim checkpoints — after 100 patients, 500 patients, 1000 patients. The interval narrows at each checkpoint, and the trial continues until the interval is narrow enough to support a regulatory decision. The Shrinking Wings mirror this process: the player accumulates sessions the way a trial accumulates patients, and the narrowing interval signals when the data is "enough." The parallel is not metaphorical — the underlying mathematics (binomial proportion intervals) are identical.

**XCOM's hit probability display.** XCOM shows "65% chance to hit" on every shot. It does not show a confidence interval, because the probability is deterministic (computed from game parameters). But players famously mistrust XCOM's probabilities — "65% feels like 30%" is a community meme. The mistrust arises because XCOM never communicates the *type* of uncertainty involved. Robot Uprising's wings solve this by showing the player exactly how imprecise the number is. A player who sees "71% +/- 14" will not feel betrayed when QUICK is wrong — they were told the number was uncertain. XCOM's design failure (presenting uncertain-feeling certainty) is Robot Uprising's design opportunity (presenting honest uncertainty that the player can watch resolve).

**Kerbal Space Program's orbital uncertainty.** KSP displays projected orbits as lines that become dotted or faded further into the future, signaling that long-term predictions are less reliable. This is a spatial confidence interval: solid line = certain, dotted line = approximate. The visual grammar is the same as the wings: opacity and crispness encode certainty. KSP teaches orbital mechanics intuition; Robot Uprising teaches statistical estimation intuition. Both use the same visual channel — translucency as doubt — to embed quantitative concepts in spatial reasoning.

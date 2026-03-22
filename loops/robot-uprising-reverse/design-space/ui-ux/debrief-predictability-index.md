# Predictability Index for Gauntlet Agree-to-Disagree

**Aspect:** 4.85 — Each agree-to-disagree card shows a "predictability score" based on aggregate data from players in similar config states — "high predictability" means skilled opponents are likely to have predicted this fix; turns agree-to-disagree into adversarial information game; interaction with 4.39 adversarial counterfactual and 4.57 threat model report.

**Parent:** 4.62 — Agree-to-disagree result
**Siblings:** 4.39 — Adversarial counterfactual mode; 4.57 — Threat model report
**Related:** 4.77 — Compute budget as Gauntlet meta-resource; 4.36 — Multi-Scenario Minimum Fix Explorer (MSMFE); 4.60 — Search budget as a player resource; 7.10 — Config necropsy culture; 4.54 — Adversarial exposure policy

---

## The Core Problem

The agree-to-disagree result (4.62) presents the player with two valid fixes: the QUICK-path symptomatic patch and the THOROUGH-path structural repair. Today, the player chooses between them based on pure engineering judgment — which weakness is more urgent, which change is more architecturally hygienic, which pass-rate improvement is more immediately useful.

In campaign mode, this is the correct frame. The choice is private. Nobody is watching. Nobody is trying to predict what you will do next.

In Gauntlet, someone is *always* trying to predict what you will do next.

The agree-to-disagree moment in competitive play is not just an engineering decision. It is an information leak. Whichever fix the player applies becomes their next deployed config version. That version is visible to opponents post-match. Opponents running adversarial counterfactual mode (4.39) can analyze the new config and deduce which weakness was patched — and which was *left open*. Opponents reading threat model reports (4.57) can correlate the timing of the config change with debrief tool use and infer the decision path.

The question the predictability index addresses: **if your opponent could see both agree-to-disagree cards, which one would they expect you to pick?**

A "high predictability" fix is one that most players in similar config states have historically chosen. It is the obvious move. The move that a scout running adversarial counterfactual against your new version will assume you made. If you pick the high-predictability fix, your opponent has a head start on countering it — they can pre-build an attack vector against the version of your config that includes the obvious patch.

A "low predictability" fix is the surprising move. The structural repair nobody expected. The choice that makes your next config version harder to model because it deviates from the aggregate pattern. It may be the less immediately impactful fix. But it is the one your opponent's threat model did not account for.

The predictability index transforms the agree-to-disagree moment from a pure engineering choice into a game-theoretic one. You are no longer asking "which fix is better?" You are asking "which fix is better *given that my opponent will try to predict which fix I chose?*"

This is the core of adversarial information theory applied to a debrief card.

---

## The Design

### The Predictability Score

Each agree-to-disagree card receives a **predictability score** — a percentage displayed on the card face, ranging from 0% (completely unpredictable) to 100% (every similar player made this choice).

The score is computed from aggregate data across all Gauntlet players who have encountered a structurally similar agree-to-disagree divergence:

- **Config similarity:** players whose configs share the same agent archetypes, similar buffer sizes, similar hook thresholds, and similar rule structures. This is a fuzzy-match across the config feature space, not an exact match. A player running a 3-agent relay-compression architecture with buffer sizes 4/4/3 is matched against other relay-compression players with buffer sizes in the 3-5 range.

- **Divergence similarity:** the specific pair of fixes must be categorically similar. "Scout filter change vs. Relay buffer change" is a category. "Hook threshold adjustment vs. attention priority reorder" is a different category. The predictability score aggregates across players who faced the same *type* of choice, not the same exact parameters.

- **Tier weighting:** choices made by players at your tier and above are weighted more heavily than choices made by lower-tier players. This is because the predictability index answers the question "what would a skilled opponent expect?" — and skilled opponents model you based on what other skilled players do, not what beginners do.

- **Recency weighting:** choices from the current season are weighted 3x over choices from prior seasons. The meta shifts. What was unpredictable last season may be obvious this season.

```
AGREE TO DISAGREE — Two valid fixes found
────────────────────────────────────────────────────────────

┌──────────────────────────────┐  ┌──────────────────────────────┐
│  QUICK RESULT                │  │  THOROUGH RESULT             │
│                              │  │                              │
│  SCOUT — attention filter    │  │  RELAY-B — buffer +1 slot    │
│  Remove 'FAR_ENEMY' tag     │  │  Capacity 4 → 5              │
│                              │  │                              │
│  Pass rate: +28              │  │  Pass rate: +22              │
│                              │  │                              │
│  PREDICTABILITY: 73%  ████░  │  │  PREDICTABILITY: 31%  ██░░░  │
│  "Most players patch this"   │  │  "Uncommon structural fix"   │
│                              │  │                              │
│  [Apply Fix]                 │  │  [Apply Fix]                 │
└──────────────────────────────┘  └──────────────────────────────┘
```

### The Label Language

The predictability score is accompanied by a short plain-language descriptor:

| Range | Label | Meaning |
|-------|-------|---------|
| 80-100% | "Near-universal choice" | Almost every similar player picks this fix. Your opponent will assume you did too. |
| 60-79% | "Most players patch this" | The majority move. Safe, expected, modelable. |
| 40-59% | "Coin-flip territory" | Neither choice dominates. Opponents cannot confidently predict. |
| 20-39% | "Uncommon structural fix" | A minority choice. Harder for opponents to anticipate. |
| 0-19% | "Almost nobody does this" | Extremely rare choice. Your next config version will surprise. |

### The Adversarial Framing Toggle

Below the two cards, a toggle switch labeled **"Show Adversarial Context"** activates additional annotations on each card:

**When toggled on:**

- Each card gains a sub-label: **"If you choose this fix, opponents running adversarial counterfactual (4.39) against your next version will likely search for attack vectors targeting [the other weakness]."** This makes the information leak explicit. Choosing the Scout filter fix means your Relay buffer weakness persists — and any opponent who runs adversarial mode on your next match will find it.

- A small amber warning icon appears on the high-predictability card: **"Caution: this fix has been the dominant choice in 73% of similar situations. Opponents with threat model data may pre-position against it."**

- A small teal opportunity icon appears on the low-predictability card: **"Opportunity: this fix is chosen in only 31% of similar situations. Opponents modeling your likely behavior may not account for this change."**

The toggle defaults to OFF in Strategist tier and below. It defaults to ON in Commander tier and above. The game assumes that competitive players want the adversarial context by default; less competitive players can opt in when ready.

### The Predictability History Panel

Accessible via a small chart icon on each card, the predictability history panel shows how the predictability score for this type of fix has shifted across seasons:

```
PREDICTABILITY HISTORY — Scout attention filter fixes
─────────────────────────────────────────────────────
Season 2:  89%  █████████░  (dominant meta: everyone patches scout filters)
Season 3:  71%  ███████░░░  (relay buffers gaining recognition)
Season 4:  58%  ██████░░░░  (meta shifting — more structural fixes)
Season 5:  73%  ███████░░░  (counter-shift: scout patches effective again)
```

This history communicates meta-evolution. A fix that was "near-universal" two seasons ago and is now "coin-flip territory" tells the player something about how the community's understanding has matured. A fix that was rare and is now common tells a different story: the community discovered something.

---

## Player Journeys

### Journey: Anouk, 29, Penetration Tester, Commander Tier, Season 5 Week 4

**Context:** Anouk's day job is literally red-teaming. She breaks into systems for a living. She picked up Robot Uprising because a colleague called it "the only game that teaches adversarial thinking correctly." She's 11-3 this season, running a tightly-tuned relay-compression architecture (v5.4) that she iterates on weekly. She just lost to phase_drift — EDT 0.69, a grinding mid-game collapse where her relay's compression chain failed to suppress a coordinated hook attack. She's in the debrief, Act 2 loaded, and the agree-to-disagree result has appeared.

**Minute 0:00 — The Two Cards**

The results panel shows two cards side by side. Both have green "VALID FIX" badges. Both are single-element changes. The left card: SCOUT — increase threat-tag retention priority by 1 tier. Pass rate: +24. The right card: RELAY-B — add conditional compression bypass when buffer occupancy exceeds 85%. Pass rate: +19.

Anouk's eyes go to the predictability scores before anything else.

Left card: **PREDICTABILITY: 78%** — "Most players patch this."
Right card: **PREDICTABILITY: 26%** — "Uncommon structural fix."

She exhales through her nose. A small, professional exhale. The kind she makes at work when a vulnerability scan returns something interesting.

**Minute 0:30 — The Adversarial Toggle**

The adversarial context toggle is already ON — it defaults to ON at Commander tier, and she's never turned it off. Below the left card, the annotation reads: *"If you choose this fix, opponents running adversarial counterfactual against your next version will likely search for attack vectors targeting your relay's compression chain under high buffer occupancy."*

Below the right card: *"If you choose this fix, opponents running adversarial counterfactual against your next version will likely search for attack vectors targeting your scout's threat-tag retention deprioritization."*

Anouk reads both annotations. She thinks about phase_drift specifically. phase_drift runs OPEN BOOK exposure policy — Anouk checked the community feed last week and saw phase_drift running THOROUGH on two of their prior matches. phase_drift is studying her. phase_drift will run adversarial counterfactual on this match. phase_drift will find whatever weakness she leaves open.

The 78% predictability score on the scout fix means: if phase_drift is modeling her as a typical Commander-tier relay player, they will assume she patched the scout. They will build their next config to exploit the relay weakness she left unpatched. That is the 78% bet.

If Anouk picks the 26% fix — the relay compression bypass — phase_drift's model breaks. phase_drift builds a config expecting the scout weakness to persist. But the scout weakness *does* persist. phase_drift's attack hits the scout... and Anouk's improved relay compression absorbs the fallout that would have cascaded from the scout's failure. The scout weakness is real but contained. The relay fix makes the scout weakness survivable.

Anouk clicks the right card. RELAY-B — conditional compression bypass. Pass rate +19. Predictability 26%.

**Minute 1:00 — The Deploy**

She queues v5.5 via fork-and-deploy (4.37). Before closing the debrief, she opens the predictability history panel on the left card — the scout fix she did not choose. Season 3: 89%. Season 4: 82%. Season 5 current: 78%. A slowly declining trend. More players are choosing structural relay fixes over symptomatic scout patches. But still a solid majority.

She notes: the predictability scores are converging. By next season, this might be coin-flip territory. When that happens, the adversarial advantage of choosing the minority fix disappears. She'll need a different edge.

She closes the debrief. On her notepad: *"v5.5 deployed. Relay compression bypass. Scout weakness persists — deliberate. phase_drift expected to attack scout weakness next match. If correct, relay bypass will contain the damage. If wrong, scout weakness costs me ~5 pass rate vs. the alternative. Acceptable risk."*

**UI Annotations:**
- **Predictability score placement:** Bottom-third of each agree-to-disagree card. Left-aligned percentage, followed by a 5-segment fill bar, followed by plain-language label. The bar segments are amber at high predictability (bright = expected = modelable = dangerous) and teal at low predictability (cool = surprising = harder to counter).
- **Adversarial context annotations:** Below each card, in smaller text, italicized. The annotation for each card describes the weakness that *persists* if the player chooses *that* card. This inversion is intentional: the annotation is about the cost of choosing, not the benefit.
- **Predictability history chart:** Small inline sparkline, 4-5 seasons of data points, rendered in the same amber-to-teal gradient as the score bar. Hovering over a data point shows the season number and exact percentage.

---

### Journey: Kwame, 22, Mathematics Student, Strategist Tier, Season 5 Week 2

**Context:** Kwame has been playing for six weeks. He completed the campaign in four and entered Gauntlet two weeks ago. His config v2.1 is a lightly modified campaign architecture — three agents, standard hook thresholds, nothing fancy. He's 4-5, learning what competitive play demands. He just won his second match in a row — EDT 0.54, a contested mid-game where his striker's burst timing happened to synchronize with a gap in the opponent's relay coverage. He ran QUICK and THOROUGH on the match out of curiosity, and for the first time, he's seeing an agree-to-disagree result.

**Minute 0:00 — The First Agree-to-Disagree**

Two cards. Green badges on both. Kwame hasn't seen this before. He reads the header text: "TWO VALID FIXES FOUND — both improve pass rate, each targeting a different weakness. Choose based on your priorities."

Left card: STRIKER — reduce burst delay by 1 tick. Pass rate: +16.
Right card: RELAY — increase hook threshold from 3 to 4. Pass rate: +14.

Both pass-rate improvements are modest. But then Kwame notices the numbers at the bottom of each card. Numbers he hasn't seen before.

Left card: **PREDICTABILITY: 82%** — "Near-universal choice."
Right card: **PREDICTABILITY: 34%** — "Uncommon structural fix."

He doesn't immediately understand what "predictability" means in this context. He hovers over the score. A tooltip appears: *"82% of players in similar config states chose this type of fix when faced with a similar agree-to-disagree result. A high predictability score means skilled opponents are more likely to anticipate this change in your next config version."*

Kwame reads it twice. He thinks: *wait. Opponents can predict what I'm going to do based on what most people do?*

**Minute 0:30 — The Toggle**

He notices the "Show Adversarial Context" toggle. It's OFF by default at Strategist tier. He toggles it ON.

New text appears below each card. Below the left card: *"If you choose this fix, opponents running adversarial counterfactual against your next version will likely search for attack vectors targeting your relay's hook threshold — the weakness you did not patch."*

Below the right card: *"If you choose this fix, opponents running adversarial counterfactual against your next version will likely search for attack vectors targeting your striker's burst timing — the weakness you did not patch."*

Kwame stares at the screen. He hasn't thought about his config choices as information before. He's been thinking about them as engineering: which fix makes the pass rate go up more? The answer was obvious — pick the bigger number. +16 beats +14.

But now there's another dimension. The +16 fix is what 82% of players would do. If his next opponent is any good — if they run adversarial mode — they'll assume he made the +16 fix. They'll attack his relay threshold. They'll find it unchanged at 3.

He picks the right card. RELAY — hook threshold from 3 to 4. Pass rate: +14. Predictability: 34%.

It's the first time he's chosen a lower pass-rate fix for a strategic reason.

**Minute 1:00 — The Reflection**

Kwame deploys v2.2. He's not sure he made the right call. The +14 fix is objectively weaker in immediate impact. But the predictability framing planted a seed: *my opponents are trying to model me. My config choices are not private. Every change I make is a signal.*

He opens the predictability history panel on the left card. He doesn't understand the seasonal trends yet — he's only been playing for six weeks. But he sees that the striker burst-delay fix has been the dominant choice for three seasons straight. That means three seasons of opponents expecting it. Three seasons of adversarial counterfactual runs pre-targeting the relay weakness that remains after the obvious fix.

He closes the panel. He's starting to think about Gauntlet differently.

**UI Annotations:**
- **First-encounter tooltip:** On the player's first agree-to-disagree with predictability scores, the predictability score area pulses gently with a soft border glow for 3 seconds, drawing attention. The tooltip auto-expands (no hover required) and remains visible for 8 seconds before fading. This ensures the player reads the explanation at least once.
- **Adversarial context toggle label:** At Strategist tier, the toggle label reads "Show opponent modeling context" rather than "Show Adversarial Context." The word "adversarial" is introduced at Commander tier. This respects vocabulary pacing.
- **Pass-rate comparison visual:** When the predictability scores diverge significantly (>30 percentage points apart), a thin connecting line appears between the two cards with a subtle label: "Higher pass rate vs. harder to predict." This frames the trade-off without prescribing a choice.

---

### Journey: Yuki, 33, Professional Poker Player, Overseer Tier, Season 5 Week 7

**Context:** Yuki plays Robot Uprising the way she plays poker: every visible action carries information, every decision is made with opponent modeling as the primary axis. She's ranked 8th globally this season. Her config v8.3 is a defensive relay architecture built explicitly to be hard to model — she's been choosing low-predictability fixes deliberately for three seasons, and her adversarial counterfactual history shows that opponents consistently fail to find attack vectors against her latest versions because her config evolution doesn't follow the community's expected patterns.

She's in a critical match week. Her next opponent is signal_collapse — a player she's faced four times this season, splitting 2-2. signal_collapse has spent 19 credits studying Yuki (she checked the community ledger feed — signal_collapse runs OPEN BOOK). She just won their fifth meeting, EDT 0.41, and the agree-to-disagree result is showing.

**Minute 0:00 — The Leveled Game**

Two cards. Left: SCOUT — widen attention radius from 3 tiles to 4 tiles. Pass rate: +21. Predictability: 61%. Right: RELAY — add signal-age priority rule: evict oldest signal first when buffer full. Pass rate: +18. Predictability: 44%.

Yuki's reaction is immediate and instinctive: neither predictability score is extreme. 61% and 44%. Coin-flip territory on the right card; slight majority on the left. This is the hardest agree-to-disagree scenario — no obvious adversarial play. If the predictability split were 85/15, the choice would be trivially the 15% card. But 61/44 gives almost no information edge either way.

She opens the predictability history panel. The scout-radius fix: Season 3: 72%. Season 4: 65%. Season 5: 61%. Declining but slowly. The relay-eviction-priority fix: Season 3: 22%. Season 4: 38%. Season 5: 44%. Rising steadily. The two scores are converging. In two more seasons, they'll cross.

**Minute 0:30 — The Second-Order Reasoning**

Yuki thinks about signal_collapse specifically. signal_collapse has been studying her for 19 credits this season. signal_collapse has access to her prior config versions. signal_collapse knows — from the config diff between v8.1 and v8.2, and between v8.2 and v8.3 — that Yuki has been choosing low-predictability fixes consistently.

Which means signal_collapse expects Yuki to choose the low-predictability fix again.

The 44% relay fix is the lower-predictability card. If Yuki picks it, she's following her own pattern. signal_collapse, who has been studying her pattern, will anticipate exactly that. signal_collapse will pre-position against the scout weakness that persists. The "low predictability" fix becomes high-predictability *for Yuki specifically* because her behavioral pattern is itself predictable.

This is the Keynesian beauty contest problem. You don't pick what you think is best. You don't pick what you think most people will pick. You pick what you think *your specific opponent thinks you will pick* and then deviate from that.

Yuki picks the left card. SCOUT — attention radius 3 to 4. Pass rate: +21. Predictability: 61%. The majority choice. The obvious move. The move that signal_collapse, who has been modeling Yuki as a contrarian, will not expect from her.

She's playing against signal_collapse's model of her, not against the aggregate predictability score.

**Minute 1:00 — The Counter-Counter**

She deploys v8.4. Then she opens adversarial counterfactual mode on her own win. She runs it against the current match result. Cost: 20 compute credits. She has 31 remaining.

The adversarial scan finds 2 vectors. One targets the relay's eviction policy — the weakness she left open by choosing the scout fix. If signal_collapse finds this vector (and they will — they've been studying her), signal_collapse will build a config that pressures her relay's buffer eviction in the next match.

Yuki now opens the standard Minimum Fix Explorer, not on the adversarial variant, but on a hypothetical where signal_collapse has already countered the relay weakness. She's thinking three moves ahead: she chose the scout fix (level 1), signal_collapse will attack the relay weakness (level 2), so she pre-prepares a relay counter-fix that she'll deploy as v8.5 *after* signal_collapse has committed to the relay attack (level 3).

She saves the relay counter-fix in a private note but does not deploy it. v8.4 goes live with the scout fix only. The relay counter-fix waits in reserve.

**Minute 2:00 — The Poker Player's Edge**

Yuki closes the debrief and opens her season journal. She writes:

*"v8.4: scout radius fix. Predictability 61% — high for me, but signal_collapse models me as a contrarian. Choosing the majority fix is the surprise move against an opponent who expects me to be surprising. Relay weakness persists — deliberately. Counter-fix staged for v8.5 deployment after signal_collapse commits to relay attack. Expected timeline: 1-2 matches."*

This is the game-within-the-game that the predictability index enables. The score itself is just a number. The number becomes a strategic weapon only when the player starts reasoning about what their opponent believes about the number, and what their opponent believes about the player's relationship to the number.

**UI Annotations:**
- **Convergence indicator:** When two predictability scores are within 15 percentage points, a small "~" symbol appears between the two cards with a tooltip: "These fixes are similarly predictable. The adversarial advantage of choosing either is minimal based on aggregate data — consider opponent-specific modeling instead."
- **Personal predictability trend:** For players with 10+ agree-to-disagree decisions in their career, a small inline annotation appears below the predictability score: "Your historical choice: low-predictability fix 8/10 times." This makes the player's own pattern visible — and therefore gameable. Yuki sees "8/10 times" and knows that any opponent who checks her history will expect the low-predictability choice.
- **Staged fix notepad:** A small notepad icon on each card allows the player to save a fix without deploying it. The note is private — not part of the config version history, not visible in the compute ledger, not accessible to opponents. This supports multi-step adversarial planning without information leakage.

---

## Strengths

**Transforms a binary choice into a strategic landscape.** Without predictability scores, agree-to-disagree is "pick the bigger number." With them, it is "pick the bigger number, or pick the harder-to-predict number, or pick the number your specific opponent won't expect you to pick." The depth scales with the player's strategic sophistication.

**Teaches adversarial information theory through play.** The concept that your own decisions are information visible to opponents — and that optimal decision-making must account for opponent modeling — is central to game theory, poker, cryptography, and strategic planning. The predictability index makes this abstract concept tactile: a number on a card, a percentage, a label.

**Creates emergent depth from aggregate data.** The predictability scores require no hand-designed content. They emerge naturally from player behavior. As the meta shifts, the scores shift. As players start choosing low-predictability fixes more often *because* of the scores, the "low predictability" fixes become higher predictability — and the cycle continues. The system is self-balancing.

**Rewards opponent-specific modeling over aggregate reasoning.** Yuki's journey demonstrates the ceiling: a player who reasons about what their specific opponent expects, rather than what the aggregate says, gains an edge that the predictability score alone cannot provide. The score is a starting point, not an answer.

**Integrates cleanly with existing adversarial systems.** The predictability index does not require new computation engines. It annotates an existing UI element (the agree-to-disagree card) with aggregate data that already exists in the system. The adversarial counterfactual (4.39) and threat model (4.57) systems provide the context in which the predictability score becomes meaningful.

---

## Weaknesses

**Herding risk.** If players uniformly start choosing low-predictability fixes because the UI frames them as "adversarially advantageous," the low-predictability fixes become high-predictability. The scores auto-correct over time (that's the self-balancing property), but the transition period produces a meta where everyone is trying to be contrarian simultaneously — which is itself a form of predictability. The system must update scores frequently enough (weekly aggregation minimum) to capture this convergence.

**Cold start problem.** For new config archetypes or unusual agree-to-disagree pairings with insufficient data (fewer than 50 similar decisions in the database), the predictability score is unreliable. Displaying a low-confidence score may mislead players. Mitigation: show "INSUFFICIENT DATA" instead of a score when the sample size is below threshold, and explain why.

**Over-indexing on the score.** Some players will treat the predictability score as a directive rather than a signal — always choosing the lowest percentage, treating every agree-to-disagree as a pure information game rather than also considering the engineering merits of each fix. The score should inform the decision, not replace it. The pass-rate numbers must remain visually prominent so that the engineering dimension is not lost.

**Complexity ceiling for mid-tier players.** The adversarial framing is natural for Overseer-tier players who already think in game-theoretic terms. For Strategist-tier players, the predictability score adds a dimension they may not be ready to reason about. The tiered defaults (adversarial context OFF at lower tiers) help, but the score itself is always visible. A number that the player doesn't understand how to use is noise, not signal.

**Privacy concern with personal predictability trend.** Showing "Your historical choice: low-predictability fix 8/10 times" is a powerful self-awareness tool, but it also means the system is tracking and surfacing behavioral patterns. If opponents can access similar data (through threat model reports or config version diffs), the personal trend becomes exploitable intelligence. The design must ensure that the personal trend annotation is visible only to the player, never to opponents — even indirectly.

---

## Interaction Effects

**4.39 Adversarial counterfactual:** The predictability index is the *input* to adversarial counterfactual reasoning. When an opponent runs adversarial mode on your post-fix config, they are searching for the weakness you left open. The predictability score tells you which weakness most players leave open in your situation — which is the weakness opponents will search for first. A player who chooses the high-predictability fix is essentially handing their opponent a roadmap: "most players leave this weakness open, and so did I."

**4.57 Threat model report:** Post-season, the threat model report can now include a section on "predictability profile" — how often the player chose high- vs. low-predictability fixes across the season. A player who chose low-predictability fixes 90% of the time has a predictability profile that is, paradoxically, highly predictable. The threat model report makes this visible: "This player is a systematic contrarian. Expect the non-obvious fix." This is exactly the insight that signal_collapse would have used against Yuki — if Yuki hadn't anticipated it.

**4.77 Compute budget meta-resource:** The adversarial context toggle and predictability history panel are free to view — they don't consume compute credits. But the *response* to predictability information often involves compute: running adversarial counterfactual to validate that the left-open weakness is truly exploitable, or running MSMFE to find a multi-scenario fix that addresses both weaknesses simultaneously (sidestepping the agree-to-disagree entirely). The predictability index creates demand for compute-intensive analysis tools.

**4.62 Agree-to-disagree:** The predictability index is an overlay on the agree-to-disagree UI, not a replacement. The base agree-to-disagree design (two cards, pass-rate comparison, engineering framing) remains the primary decision surface. The predictability score adds a second axis of evaluation. The two systems must be visually harmonious: the pass-rate numbers dominant, the predictability scores present but subordinate. The engineering decision comes first; the adversarial decision is a refinement for players who want it.

**7.10 Config necropsy culture:** Community necropsies that include predictability analysis become richer: "v5.4 to v5.5, Anouk chose the 26% fix (relay compression bypass) over the 78% fix (scout filter patch). This is consistent with her adversarial play style — she systematically leaves the expected weakness open and hardens the structural foundation instead." The predictability score gives necropsy authors a vocabulary for discussing not just *what* changed but *why it was surprising*.

**4.54 Adversarial exposure policy:** Under OPEN BOOK, a player's agree-to-disagree choices are visible in near-real-time via the community feed. Combined with predictability scores, this means spectators can see: "Player X faced a 78/26 predictability split and chose the 26% fix." This is a legible, shareable moment — the kind of decision that generates community discussion. Under SEALED or REDACTED, the choice is visible only post-season, but the predictability context still enriches the delayed disclosure.

---

## Comparable Games/Media

**Poker GTO vs. exploitative play.** In modern poker theory, GTO (game-theory optimal) play is the strategy that cannot be exploited — it is the Nash equilibrium. Exploitative play deviates from GTO to target specific opponent weaknesses. The predictability index creates exactly this tension: the "high predictability" fix is the GTO-adjacent choice (it's what most people do, and there's a reason most people do it). The "low predictability" fix is the exploitative deviation — it sacrifices some immediate value to gain an information advantage. Expert poker players toggle between GTO and exploitative strategies based on opponent reads. Expert Robot Uprising players will toggle between high- and low-predictability fixes based on opponent modeling.

**Yomi in fighting games.** David Sirlin's concept of "yomi" — reading the opponent's mind — describes the layered prediction game in competitive fighting games. Rock beats scissors, but if your opponent *knows* you'll throw rock, they throw paper. The predictability index is a quantified yomi layer: the score tells you what "most opponents" would throw. The strategic depth comes from reasoning about what *your specific opponent* expects *you* to throw, given what they know about your history.

**Spy vs. spy intelligence analysis.** In Cold War intelligence, analysts studied not just what the enemy was doing but what the enemy *expected them to know*. A deliberately placed piece of disinformation (a "dangle") was designed to be found by the opposing side's analysts and to shape their behavior. Yuki's staged counter-fix — saving a relay repair for later deployment after signal_collapse commits to a relay attack — is a dangle in reverse: she's leaving a weakness visible, expecting the opponent to exploit it, and preparing a counter for when they do.

**The Keynesian beauty contest.** John Maynard Keynes described a newspaper contest where readers had to pick the face that *most other readers* would find attractive — not the face they personally found attractive. The winner was whoever best predicted the crowd's prediction. The predictability index is a literal Keynesian beauty contest: the score tells you the crowd's historical choice. The strategic question is whether to follow the crowd, deviate from the crowd, or deviate from what your opponent expects you to do given that you know the crowd's behavior.

**Wargaming "most dangerous course of action" analysis.** Military intelligence briefings include a section on the enemy's "most dangerous course of action" (MDCOA) and "most likely course of action" (MLCOA). The predictability score is the MLCOA annotation: "most players choose this fix." The adversarial counterfactual result is the MDCOA: "here's the worst thing your opponent could do with the weakness you left open." Together, they give the player the same analytical framework that military commanders use.

---

## Sensory Description

**The predictability score on the card.** The percentage appears in the lower third of each agree-to-disagree card, rendered in a weight heavier than the pass-rate text but slightly smaller in point size. The fill bar beside it is composed of five discrete segments, each approximately 8 pixels wide, separated by 2-pixel gaps. At high predictability (60%+), the filled segments glow a warm amber — the same amber used for caution states throughout the debrief UI. At low predictability (below 40%), the filled segments are a cool teal — the diagnostic color, the color of information and opportunity. In the 40-60% range, the segments transition through a neutral warm grey, communicating the absence of a strong signal in either direction. The plain-language label beneath the bar is set in the game's standard body typeface, italicized, one shade lighter than body text. It does not demand attention. It offers context when sought.

**The adversarial context toggle.** A small horizontal switch in the space between the two cards, aligned to the center axis. The switch track is 32 pixels wide, dark charcoal, with a circular toggle handle that slides left (OFF, grey) or right (ON, amber). When toggled ON, the switch emits a single soft click — not mechanical, more like a relay engaging inside the debrief console. The annotations below each card fade in over 600ms, line by line, top to bottom. The text is rendered in a muted amber italic, visually distinct from the card's main content. The amber is not alarming; it is cautionary. It says: *this is additional context, not a warning.*

**The moment a player first sees divergent predictability scores.** Two cards, side by side. The left card's predictability bar is four segments filled, glowing amber. The right card's bar is two segments filled, glowing teal. The visual asymmetry is immediate: warm on the left, cool on the right. Danger and opportunity, rendered in color before the player reads a single word. The eye is drawn to the teal because it's the cooler, calmer color — but the amber is brighter, more insistent. The tension between the two colors is the tension of the choice itself: the obvious move glows warmly; the surprising move sits in cool shadow.

**The predictability history sparkline.** When the player clicks the chart icon on a card, a small panel expands below the predictability bar — 120 pixels wide, 40 pixels tall. The sparkline renders as a series of connected dots, each representing one season's aggregate score. The line color shifts along the amber-to-teal gradient as the score changes across seasons. A score that drops from 89% in Season 2 to 58% in Season 4 is rendered as a line that starts hot amber on the left and cools to warm grey on the right. The dots are 4 pixels in diameter, filled. On hover, each dot expands to 6 pixels and displays its season label and exact percentage in a 12px tooltip. The sparkline's ambient state is subtle — it does not animate, does not pulse, does not compete for attention. It is data. It waits to be read.

**The convergence indicator.** When two predictability scores are within 15 points, a small tilde (~) character appears centered between the two cards, rendered at 18px in a neutral grey, with a tooltip on hover. The tilde is the quietest element on the screen. It is a shrug. It says: *the numbers are close. The aggregate can't help you here. You're on your own.* The absence of a strong signal is itself a signal — and the tilde communicates that absence without drama.

**The personal predictability trend annotation.** For veteran players, a thin horizontal line appears below the predictability score, 80 pixels wide, with small markers along its length. Each marker represents one prior agree-to-disagree decision: amber if the player chose the high-predictability fix, teal if they chose low. A player who has made 10 decisions and chosen low 8 times sees eight teal markers and two amber. The pattern is visible at a glance: a field of teal with occasional amber exceptions. The annotation text to the right reads, in muted grey, "Your pattern: low 8/10." The line does not judge. It observes. But the player, seeing their own pattern laid bare, will feel the weight of it — the realization that their "unpredictable" strategy has itself become a pattern. That realization is the teaching.

---

## New Aspects Discovered

- **4.86 — Predictability score manipulation as deliberate strategy:** Players deliberately choosing high-predictability fixes for several matches to establish a pattern, then pivoting to low-predictability in a critical match; the long con within the predictability meta-game; interaction with personal predictability trend and opponent threat model analysis
- **4.87 — Cross-opponent predictability profile in threat model report:** A section in the threat model report (4.57) showing the player's aggregate predictability choices across all matches in a season — "this player chose the low-predictability fix in 9/12 agree-to-disagree decisions"; making behavioral patterns a formal component of the post-season intelligence product
- **4.88 — Predictability score confidence intervals:** Displaying not just the percentage but the sample size and confidence interval — "73% (n=412, +/-4%)" vs. "34% (n=28, +/-18%)"; teaching players to distrust low-sample-size statistics; interaction with cold-start problem for novel config archetypes
- **4.89 — Agree-to-disagree both-fix option as compute-gated escape:** For players willing to spend additional compute budget, the ability to run MSMFE on the combined state (applying *both* fixes simultaneously) to determine if both can coexist — sidestepping the agree-to-disagree entirely at the cost of significant compute; the "why not both?" option as a luxury good in the compute economy

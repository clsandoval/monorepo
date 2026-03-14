# Adversarial Tag as Community Signal

**Aspect:** 4.69e-ix — Adversarial tag as community signal: anonymized aggregation of tag frequency across players; "this opponent is tagged as adversarial by 12 players in your bracket"; crowd-sourced adversarial intelligence; risk of mob tagging strong non-adversarial players; interaction with 7.10 necropsy culture.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-ii — Known adversarial opponent tagging; 4.69e-viii — Tag expiry and automatic sunset; 4.69e-x — Tag evidence export for community discussion; 4.69e-v — Adversarial density as career season metric (APS); 4.69e-vii — Per-cluster adversarial exclusion
**Related:** 7.10 — Necropsy culture; 1.06c — Async PvP design; 1.04g — Live win-rate as persistent identity; multiplayer/competitive-*; Overwatch "Avoid as Teammate" system; League of Legends Honor System; Dota 2 Behavior Score

---

## The Core Design Problem

Individual adversarial tags (4.69e-ii) are private diagnostic tools. A player examines their career analysis, identifies an opponent whose match concentration distorts their cluster diagnostics, and flags them as adversarial. This tag reshapes what the player's career analysis sees — excluding or de-weighting the tagged opponent's matches.

But adversarial behavior is rarely directed at a single victim. A player who specifically targets RELAY-C configurations with relay-flooding strategies is probably doing it to *every* opponent whose config shows a similar relay-heavy architecture. The intelligence is siloed: twelve players in the same bracket have each independently diagnosed NebulaFang as adversarial, each spending the cognitive effort to examine match-source breakdowns, watch replays, and decide to tag. Twelve players did the same detective work in isolation.

**The community signal asks: what if that intelligence were shared?**

The moment you surface "12 players in your bracket have tagged this opponent as adversarial," you transform a private diagnostic act into a crowd-sourced intelligence network. This is enormously powerful — and enormously dangerous.

### The Power

- **Validation.** A player uncertain whether they're being targeted or just losing legitimately sees "8 other players tagged this opponent." Their suspicion is confirmed without needing to do forensic analysis. The tag becomes lower-friction, more accessible, more accurate.
- **Early warning.** A player who hasn't yet noticed adversarial targeting sees a yellow indicator on an opponent: "Frequently tagged by players in your bracket." They investigate preemptively. The community intelligence accelerates individual diagnosis.
- **Deterrence.** If adversarial players know their behavior generates a visible community signal, they may self-moderate. The tag becomes a soft social consequence — not a punishment, but a reputation effect.
- **Meta-knowledge.** The aggregate tag data reveals something about the competitive ecosystem. "This bracket has 3 frequently-tagged adversarial players" vs. "This bracket has 0" tells you something about the culture of your competitive tier.

### The Danger

This is **The Overwatch Problem.** In 2016, Overwatch shipped "Avoid This Player" — a feature that let players prevent being matched with specific opponents. One of the world's best Widowmaker players found himself unable to find matches because hundreds of players had "avoided" him — not because he was toxic, but because he was too good. As Jeff Kaplan described it: the system was "wreaking havoc on matchmaking." The feature was removed entirely, then reintroduced in 2018 as the much more limited "Avoid as Teammate" (teammate-only, 2 slots, 1-week duration).

The lesson: **any crowd-sourced signal about individual players can be weaponized.** Players will tag strong opponents as "adversarial" because losing to them feels adversarial even when it isn't. A sufficiently popular player who plays an unconventional strategy that confuses opponents will accumulate tags not because they're targeting anyone, but because enough opponents felt confused and frustrated.

This is the **mob tagging problem** — the crowd-sourced version of a false positive. One person making a false tag is noise. A hundred people making the same false tag is a signal that looks indistinguishable from truth.

---

## The Comparable Systems

### Overwatch: Avoid This Player → Avoid as Teammate

**Original system (2016):** Unlimited avoidance of any player (opponent or teammate). Weaponized against skilled players. Removed after months.

**Redesigned system (2018):** Teammate-only avoidance, 2 slots (later expanded to 15: 3 pinned + 12 recent), 1-week expiry. The critical design insight: restricting avoidance to teammates only eliminates the primary abuse vector (avoiding skilled opponents) while preserving the useful case (avoiding toxic teammates).

**Lesson for Robot Uprising:** The teammate/opponent distinction doesn't apply directly (Robot Uprising adversarial tagging is specifically about opponents). But the slot-limiting and time-limiting design constraints are directly relevant. And the core warning is clear: aggregating individual player judgments into a visible community signal can produce mob effects that punish legitimate playstyles.

### Dota 2: Behavior Score

Dota 2's system is a **server-side aggregate** — the player never sees other players' individual reports, only their own 0-12,000 behavior score. This is the opposite of a transparent community signal. The crowd-sourced input (reports and commendations) is laundered through an opaque algorithm that produces a single number.

**Strengths:** No mob targeting of individuals. Players can't see who reported them. The score feels like a system judgment, not a community pile-on.

**Weaknesses:** Players at 10,000 behavior score can be toxic and know they're "report-proof." The opacity means players can't verify the score is accurate. The "shadow pool" below 3,000 is effectively a social ghetto with no clear path out.

**Lesson for Robot Uprising:** Opacity prevents mob targeting but also prevents learning. Robot Uprising's adversarial tag system is explicitly a *diagnostic* tool — the player needs to understand what the signal means to use it well. Full opacity defeats the purpose.

### League of Legends: Honor System + Tribunal

Riot's approach (designed by Jeffrey "Lyte" Lin, presented at GDC 2013-2015) was the most sophisticated crowd-sourced player behavior system in gaming history. Core principle: "We don't want to be the arbitrators. We want the community itself to drive their own community."

The **Tribunal** let players vote on behavior cases — 105 million votes, 280,000 reformed players, ~80% agreement between community and Riot's internal team. The **Honor System** flipped the signal positive: instead of punishing bad behavior, it surfaced good behavior through post-match voting.

**Key insight:** Lin found only 1% of players are consistently toxic, but they produce 5% of total toxicity. Most toxicity comes from otherwise-normal players having bad moments. Systems that provide *nudges* (behavior alerts, positive reinforcement) are more effective than systems that provide *punishments*.

**Lesson for Robot Uprising:** The adversarial tag system is diagnostic, not punitive. It doesn't punish the tagged opponent — it adjusts the tagger's own career analysis. The community signal layer must maintain this diagnostic framing. The moment it feels like a public reputation score, it becomes a weapon.

---

## Option A: The Anonymous Frequency Counter — "Tagged by N Players"

### How It Works

When a player opens the Match-Source Breakdown in their career analysis and sees an opponent with high concentration (≥40% of a cluster's coverage), a small community indicator appears next to the opponent's name:

```
┌──────────────────────────────────────────────────────────────┐
│  Match-Source Breakdown: RELAY-C Cluster                      │
│                                                               │
│  NebulaFang (Operative II)                                    │
│  ████████████████████░░░░░░░░░░  78% of cluster coverage     │
│                                                               │
│  ⚑ 12 players in your bracket have tagged this opponent       │
│    as adversarial this season.                                │
│                                                               │
│  [Flag as Adversarial 🛡️❌]                                   │
└──────────────────────────────────────────────────────────────┘
```

The indicator is a single line: `⚑ N players in your bracket have tagged this opponent as adversarial this season.` It appears only when N ≥ 3 (minimum threshold to prevent small-sample noise). It provides no other details — no breakdown of why they tagged, no list of which players, no indication of which agents were targeted.

**What the number includes:**
- Only tags from players in the same competitive bracket (e.g., Operative tier)
- Only tags set during the current season
- Only active tags (expired/removed tags don't count)
- The count updates daily, not in real-time

**What the number excludes:**
- Tags from other brackets (a Grandmaster-tier player's tag on NebulaFang doesn't appear for Operative-tier players)
- The tagger's identity
- The reason for the tag
- Whether the tag affected the tagger's diagnostics

### The Visual Treatment

The `⚑` flag icon renders in muted steel-gray when N is 3-5 — present but not alarming. At N=6-10, the icon shifts to amber, and the text gains a subtle warm glow. At N ≥ 11, the icon turns deep amber-orange with a faint pulse animation — *this opponent has been widely flagged.* The color progression is deliberate: it's a thermometer of community consensus, not a binary alarm.

The line sits below the concentration percentage bar but above the "Flag as Adversarial" button. It's contextual information that may influence the player's tagging decision — but it never auto-tags, never recommends tagging, never gates access to the tag button on community consensus.

### Strengths

- **Validation without exposure.** The tagged player never sees their tag count. It's not a public reputation score. It's private intelligence shared among the opponents who might need it.
- **Low-friction confirmation.** Reduces the cognitive load of the tagging decision. "Am I being paranoid?" → "No, 12 other people see it too."
- **Bracket-scoped.** A player who is adversarial in Operative tier but plays normally in Architect tier only shows a signal in Operative. The signal reflects the experience of players who face the same opponent in the same competitive context.
- **Season-scoped.** Tags expire with the season, preventing stale mob signals from accumulating over a career.

### Weaknesses

- **The Widowmaker Problem.** A player with an unconventional but effective strategy (e.g., heavily targeting relay units as a counter-meta play) will accumulate tags from frustrated opponents who mistake effectiveness for adversarial targeting. The community signal amplifies this misidentification: "12 players tagged them" makes the false positive look like consensus.
- **Bracket boundary gaming.** A player who knows their behavior generates tags might intentionally rank down to a bracket where they have fewer opponents and thus fewer taggers — perverse incentive to lose rank to reduce tag visibility.
- **Anchoring bias.** Seeing "8 players tagged this opponent" before making your own tagging decision biases you toward tagging. The community signal reduces independent judgment, creating a conformity cascade. This is exactly the problem Solomon Asch identified in his conformity experiments — and exactly what Riot's Jeffrey Lin studied when designing the League of Legends Tribunal.
- **Count without context.** "12 players tagged this opponent" could mean 12 players who carefully analyzed match-source breakdowns, or 12 players who angrily tagged after losing. The count flattens quality into quantity.

### Interaction Effects

- **With APS (4.69e-v):** If Adversarial Pressure Score already quantifies targeting intensity per-opponent, the community tag count provides an independent signal. A player might see: "Your APS from this opponent is 3.2 (high). 8 other players also tagged them." The two signals corroborate. But if APS is low and community tags are high, there's a disconnect — the opponent isn't targeting *you* specifically, but the community thinks they're adversarial. This forces the player to distinguish between "adversarial toward me" and "adversarial toward everyone."
- **With tag expiry (4.69e-viii):** Season-scoped community counts solve the stale-signal problem — the count resets with each season. But this means early-season counts are always low, reducing the signal's utility during the most volatile competitive period.
- **With necropsy culture (7.10):** If the community develops a culture of sharing post-mortem analyses (necropsy), then adversarial tagging becomes a topic of community discussion. "Should I tag PlayerX? Their community tag count is 15, but my match-source breakdown shows only 30% concentration." The tag count becomes data in the community's ongoing conversation about what constitutes adversarial behavior. This is the healthiest possible outcome — the signal feeds into collective sense-making, not reflexive judgment.
- **With sealed watch:** The sealed watch's emotional-first, analytical-second structure means the player encounters the tag count only after sitting through the sealed replay. By the time they see the community signal, they've already felt the match emotionally. The analytical context then includes the community data. Temporal separation prevents the community count from biasing the emotional experience of the replay.

---

## Option B: The Heatmap — "Community Adversarial Landscape"

### How It Works

Instead of showing a per-opponent tag count, this option surfaces a bracket-level **adversarial heatmap** — a visualization of how much adversarial tagging is happening across the player's competitive environment, without identifying specific opponents until the player investigates.

The heatmap lives in a new panel accessible from the career analysis dashboard: **Bracket Health**.

```
┌──────────────────────────────────────────────────────────────┐
│  BRACKET HEALTH — Operative II (Season 7)                    │
│                                                               │
│  Adversarial Activity: ██████░░░░  Moderate                  │
│                                                               │
│  ┌─────────────────────────────────────────┐                  │
│  │         Adversarial Tag Density          │                  │
│  │                                          │                  │
│  │  ●●●  ●   ●●                            │                  │
│  │    ●●      ●●●●                          │                  │
│  │      ●●●●●                               │                  │
│  │                                          │                  │
│  │  X-axis: opponents (anonymized)          │                  │
│  │  Y-axis: tag frequency (bracket-wide)    │                  │
│  │  Each dot = 1 player who tagged          │                  │
│  └─────────────────────────────────────────┘                  │
│                                                               │
│  3 opponents in your bracket have ≥5 community tags.          │
│  Your personal tags: 2 opponents flagged.                     │
│                                                               │
│  [View Your Tags]   [Explore Bracket Data]                    │
└──────────────────────────────────────────────────────────────┘
```

The heatmap shows anonymized dots clustered around opponents by tag frequency. The player can see *how many* opponents have high tag counts without knowing *who* they are — until they encounter those opponents in their own match-source breakdowns, at which point the per-opponent count (Option A) appears.

### The Visual Treatment

The bracket health bar renders as a horizontal gradient: cool teal for low adversarial activity, through warm amber for moderate, to pulsing red-orange for high. The dot plot uses neutral gray dots with a slight size variance — bigger dots are more recent tags, smaller dots are older. When the player hovers over a cluster, the cluster brightens but reveals no name — just: "Opponent #7: 14 tags this season."

The overall bracket health indicator pulses gently when activity is elevated, like a heart rate monitor showing elevated but stable vital signs. It's calm, medical, diagnostic — not alarming.

### Strengths

- **Landscape intelligence without targeting.** The player understands their competitive environment ("this bracket has a lot of adversarial activity") without being pointed at specific opponents. This prevents the anchoring bias of Option A — you form your own judgment about each opponent before learning their community tag count.
- **Normalizes adversarial awareness.** Presenting adversarial activity as a bracket-level phenomenon (like weather) rather than an individual-level judgment reduces the stigma of tagging. "The bracket is moderately adversarial" is a systemic description, not an accusation.
- **Encourages investigation.** The "Explore Bracket Data" affordance invites players to look deeper without mandating it. Casual players see the health bar and move on. Analytical players dive into the dot plot. The information layers support different engagement depths.

### Weaknesses

- **Indirect signal.** The heatmap doesn't help the player in the moment of the tagging decision. When they're staring at NebulaFang's 78% concentration in the match-source breakdown, knowing "the bracket is moderately adversarial" doesn't tell them whether NebulaFang specifically is adversarial.
- **Still deanonymizable.** A player who knows they regularly face 5 opponents can often guess which anonymized dot corresponds to whom — especially at high ranks with small pools. The anonymization provides privacy theater, not real privacy.
- **Extra screen real estate.** The Bracket Health panel competes for space in an already information-dense career analysis interface.

### Interaction Effects

- **With Option A:** These are composable. The Bracket Health panel provides landscape context; Option A's per-opponent count provides point-of-decision context. Together, they give the player both macro and micro views of adversarial activity.
- **With APS (4.69e-v):** The bracket health bar could incorporate APS data — not just tag frequency, but the average APS in the bracket. "Bracket adversarial pressure: 1.8 (low)" vs. "Bracket adversarial pressure: 4.2 (high)." This transforms the heatmap from a count of tags into a continuous measurement of targeting intensity.

---

## Option C: The Conviction Score — "Community Confidence"

### How It Works

Instead of raw tag counts, this option computes a **conviction score** that weights tags by the tagger's diagnostic history. A player who has a track record of accurate tagging (their tags correlate with genuinely adversarial behavior, as measured by later match patterns) contributes more to the community signal than a player who tags every opponent they lose to.

```
┌──────────────────────────────────────────────────────────────┐
│  NebulaFang (Operative II)                                    │
│  ████████████████████░░░░░░░░░░  78% of cluster coverage     │
│                                                               │
│  Community conviction: ████████░░  HIGH                       │
│  Based on 12 tags (weighted by tagger accuracy)               │
│                                                               │
│  [Flag as Adversarial 🛡️❌]                                   │
└──────────────────────────────────────────────────────────────┘
```

The conviction score is a 0-100 value rendered as a horizontal bar. It's labeled qualitatively: LOW (0-30), MODERATE (31-60), HIGH (61-85), VERY HIGH (86-100). The raw tag count is shown in parenthetical context but is not the primary signal.

**How tagger accuracy is measured:**

A tag is retrospectively evaluated as "accurate" if the tagged opponent's subsequent match patterns show continued concentration against the tagger's agent types. Specifically:
- If the tagged opponent continues to appear in the tagger's match-source breakdowns at ≥40% concentration in later analyses → tag confirmed as accurate
- If the tagged opponent's concentration drops below 20% in later analyses → tag marked as inconclusive
- If the tagged opponent stops appearing entirely (quit, ranked down, changed strategy) → tag marked as unresolvable

Taggers whose tags are predominantly "accurate" get a higher weighting coefficient. Taggers whose tags are predominantly "inconclusive" get a lower weighting.

### The Visual Treatment

The conviction bar renders in a different color from the concentration bar (which is steel blue). The conviction bar uses a warm amber-to-orange palette — visually distinct so the player never confuses "how much of my cluster is this opponent" with "how confident is the community that this opponent is adversarial."

At HIGH conviction, the bar acquires a subtle inner glow — the amber shifts slightly toward gold, as if the bar is warming from within. At VERY HIGH, the glow becomes more pronounced and the label text gains a faint gold shadow. The visual language says: *this signal is hot. Many reliable sources agree.*

At LOW conviction, the bar is dim amber, nearly gray. At MODERATE, it's a solid amber without glow. The progression is: cool → warm → hot → incandescent.

### Strengths

- **Quality over quantity.** A conviction score of 85 from 5 accurate taggers is more useful than a raw count of 20 from players who tag everyone. The signal-to-noise ratio improves dramatically.
- **Resists mob tagging.** Players who reflexively tag strong opponents without genuine adversarial evidence develop low tagger accuracy scores. Their tags contribute less to the community signal. Over time, the mob's voice is attenuated while the diagnosticians' voice is amplified.
- **Self-calibrating.** The system learns which players are good at identifying adversarial behavior and weights their input accordingly. This is a simplified version of the "reputation for reputation" problem — meta-reputation.
- **Incentivizes careful tagging.** If players know their tagger accuracy affects their contribution to community signals, they have reason to tag thoughtfully rather than reactively. The system rewards diagnostic rigor.

### Weaknesses

- **Opacity.** "Community conviction: HIGH" is harder to interpret than "12 players tagged this opponent." The player doesn't know how the score was computed, what "tagger accuracy" means, or why 5 tags might produce a higher score than 15 tags. The legitimacy of the signal depends on trust in the algorithm.
- **Cold start.** New players have no tagger accuracy history. Their tags are either weighted at some default (diluting the signal) or excluded entirely (disenfranchising new players). Neither option is clean.
- **Retroactive evaluation latency.** Tagger accuracy requires subsequent career analyses to confirm or deny the tag. This takes weeks or months. During the cold period, all tags are weighted equally, which is exactly when mob effects are strongest — early in a season when the community is forming its judgments.
- **Gaming the accuracy metric.** A sophisticated player who wants to build high tagger accuracy could tag only opponents who obviously meet the criteria (high concentration, multiple seasons of targeting), inflating their accuracy score. Then they use their high-weight tag to falsely flag a single opponent they want suppressed. The system would trust their judgment. This is an analog of the "reputation fraud" pattern identified in Stack Overflow research — build credibility, then spend it on a single fraudulent action.

### Interaction Effects

- **With tag evidence export (4.69e-x):** If tags can be exported for community discussion, the conviction score becomes a data point in that discussion. "I tagged NebulaFang and the community conviction is 72. Here's my match-source breakdown." The conviction score provides credibility in community spaces.
- **With necropsy culture (7.10):** The conviction score creates a new axis of community prestige — "tagger accuracy." Players who are known for careful diagnostic work become trusted contributors to the adversarial intelligence network. This parallels the "trusted reviewer" role in open-source communities.

---

## Option D: The Null Option — "Tags Stay Private"

### How It Works

No community signal. Tags are purely private diagnostic tools. Each player makes their own judgment independently, based solely on their own match-source breakdowns and career analysis data.

### Why Consider It

The Overwatch catastrophe demonstrates that community signals about individual players can cause more harm than good. Every option above (A, B, C) introduces some version of the mob tagging risk, the anchoring bias problem, or the opacity-trust tension. Maybe the correct design is: don't share tag data at all.

**The argument for privacy:**
- Tags are diagnostic acts, not social judgments. Sharing them transforms their nature.
- Each player's career analysis is unique. NebulaFang may be adversarial toward one player (high concentration on their specific agent archetype) and completely non-adversarial toward another. Aggregating across players blurs the specificity that makes the tag useful.
- The information architecture of Robot Uprising is the game's core mechanic. Players should learn to evaluate adversarial behavior from *their own data*, not from crowd-sourced shortcuts. The diagnostic skill of "is this adversarial or am I just losing?" is part of the game's depth. Handing the answer via community consensus short-circuits that learning.
- Privacy-by-default aligns with the game's ethos: you build attention systems, you observe outcomes, you diagnose. Adding a social layer to the diagnostic tool transforms it from an instrument into a reputation system.

### Strengths

- **Zero mob risk.** No aggregation means no mob tagging. Each player's tag is invisible to everyone else.
- **Maximum diagnostic independence.** The player's tagging decision is entirely based on their own evidence. No conformity cascade. No anchoring bias.
- **Simpler implementation.** No backend aggregation, no tagger accuracy computation, no bracket-scoping, no season-scoping, no UI for community signals.
- **Preserves the diagnostic skill ceiling.** "Am I being targeted or just losing?" remains a genuine analytical challenge rather than a trivia answer ("well, 15 people tagged them, so...").

### Weaknesses

- **Twelve players do the same detective work independently.** The duplication of effort is real. If the intelligence is genuine — if the opponent IS adversarial — then twelve players each spending 15 minutes on match-source analysis to reach the same conclusion is a waste of collective attention.
- **No early warning.** New players in a bracket with a known adversarial player have no signal. They experience the targeting, run their first career analysis, see the concentration, and must independently diagnose it. The community's hard-won knowledge doesn't propagate.
- **No deterrence.** Adversarial players face no social consequence for their behavior. The tags are invisible walls — they affect the tagger's diagnostics but don't create any feedback loop to the tagged player or the broader community.

### Interaction Effects

- **With necropsy culture (7.10):** Even without a formal community signal, players will discuss adversarial opponents in community spaces. "Has anyone else noticed NebulaFang targeting relay configs?" This organic signal is harder to manipulate than a formal system but also noisier and less accessible. The Null Option pushes community intelligence into informal channels — Discord, Reddit, forums — where it's unstructured but also unconstrained.

---

## Option E: The Opt-In Anonymized Pool — "Tag Intelligence Network"

### How It Works

Players can opt into a **Tag Intelligence Network** (TIN) — a voluntary sharing layer where their tag data contributes to and benefits from anonymized community signals. Players who don't opt in never see community signals and never contribute to them.

The opt-in happens in Settings → Career Analysis → Tag Intelligence Network:

```
┌──────────────────────────────────────────────────────────────┐
│  TAG INTELLIGENCE NETWORK                                     │
│                                                               │
│  Share your adversarial tags anonymously with other           │
│  players in your bracket. In return, see how many             │
│  other TIN members have tagged the same opponents.            │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                           │
│  │  ● Join TIN  │  │  ○ Stay Private │                        │
│  └──────────────┘  └──────────────┘                           │
│                                                               │
│  Currently: 47 of 82 players in Operative II have joined.     │
│                                                               │
│  Your tag data is never associated with your identity.        │
│  You can leave TIN at any time. Your tags will be removed     │
│  from the pool within 24 hours.                               │
└──────────────────────────────────────────────────────────────┘
```

TIN members see Option A's per-opponent tag count — but the count only includes tags from other TIN members. Non-members are invisible to and from the network.

### Strengths

- **Consent-based.** Players who want privacy keep it. Players who want community intelligence can access it. The mob tagging risk is accepted voluntarily, which changes the ethical calculus.
- **Self-selecting population.** Players who opt into TIN are disproportionately likely to be analytical players who use career analysis tools seriously. This naturally improves signal quality compared to a universal system.
- **Participation rate as signal.** "47 of 82 players joined TIN" tells you something about the bracket's analytical culture. High participation suggests a community that values diagnostic collaboration.
- **Clean exit.** Players who feel the community signal is biasing their judgment can leave TIN and return to private tagging. The reversibility is total.

### Weaknesses

- **Network effects create pressure.** If TIN becomes the norm in competitive brackets, non-members are at an informational disadvantage. "Everyone in Grandmaster uses TIN" creates soft coercion to join. Opt-in becomes de facto mandatory.
- **Small-pool deanonymization.** In a bracket with 12 players, 8 of whom are TIN members, "3 TIN members tagged this opponent" is not very anonymous. At small pool sizes, the anonymization is a fig leaf.
- **Complexity budget.** The game already has skills, rules, hooks, context buffers, channel maps, career analysis, match-source breakdowns, adversarial tags, APS, tag expiry, per-cluster exclusion, concentration thresholds... Adding a social networking feature on top of all this stretches the complexity budget past the point where a new player could ever discover it naturally.
- **Two-tier community.** TIN members and non-members experience different career analysis interfaces. This splits the community's shared vocabulary about how career analysis works.

---

## Player Journeys

### Journey 1: Priya, 34, Data Engineer — "The Confirmation"

**Context:** Season 6, Operative II bracket, 45 matches played this season. Priya has been suspicious that one particular opponent — CrystalVenom — has been specifically targeting her RELAY-B configuration for three seasons running. She tagged CrystalVenom last season (4.69e-ii), and the tag persists. She's running her first career analysis of Season 6 to see if the pattern continues.

**Minute 0:00 — Opening Career Analysis**
Priya opens career analysis from the debrief screen after a frustrating loss. The career analysis dashboard loads — her familiar cluster map, the agent cards, the season summary bar. She clicks on RELAY-B, whose cluster has been flagged with the amber `⚠` indicator: "Cluster flag fired: 3+ elements with >60% loss rate."

She feels the familiar knot in her stomach. *Is RELAY-B actually broken, or is it CrystalVenom again?*

**Minute 0:30 — Match-Source Breakdown**
She clicks "View match sources" on the RELAY-B cluster. The breakdown loads: a horizontal bar chart of opponents ranked by their contribution to this cluster's coverage. CrystalVenom sits at the top: `CrystalVenom (Operative II) — 71% of cluster coverage.`

Below the bar, a small steel-gray flag icon with text: `⚑ 9 players in your bracket have tagged this opponent as adversarial this season.`

Priya's eyes widen. She reads it twice. Nine players. She feels a rush of vindication — she's not paranoid, she's not imagining it, nine other people in her bracket see the same thing. Her jaw tightens. She clicks the `⚑` and a tooltip expands: *"This count reflects anonymized tags from players in Operative II during Season 6. Tags are bracket-scoped and season-scoped. Learn more."*

**Minute 1:00 — The Tagging Decision**
Priya already has CrystalVenom tagged from last season (the tag persisted through tag expiry review). She doesn't need to re-tag. But she checks the preview anyway — the "Your cluster result WITHOUT CrystalVenom's matches" panel confirms what she already suspected: RELAY-B's cluster flag wouldn't fire without CrystalVenom's matches. The structural problem is CrystalVenom, not RELAY-B.

She feels satisfied but also concerned. Nine players tagged. CrystalVenom is actively targeting multiple opponents with the same strategy. *Is there anything I can do about this beyond tagging?*

**Minute 1:30 — The Necropsy Impulse**
Priya opens the game's community forum (or Discord). She searches for CrystalVenom. She finds a thread from two weeks ago: "Anyone else getting relay-flooded by a particular opponent in Operative?" Three other players describe the same pattern. One of them shares a sanitized match-source export (4.69e-x). The community is already discussing it.

Priya feels connected to her bracket's community in a way she didn't before. The tag count validated her individual diagnosis. The forum thread confirmed it's a collective experience. She closes career analysis feeling informed, not frustrated.

**UI Annotations:**
- `⚑` icon: steel-gray at N=9, positioned below opponent's concentration bar, left-aligned with the bar's label
- Tooltip: appears on click (not hover), dark background, light text, includes "Learn more" link to help article
- Preview panel: unchanged from 4.69e-ii, but now framed by the community context

---

### Journey 2: Marcus, 28, Competitive Streamer — "The Witch Hunt"

**Context:** Season 7, Architect III bracket (top 5% of players), 120 matches this season. Marcus plays an unconventional strategy: his scouts deliberately sacrifice themselves to generate maximum information before dying, then his relays compress and flood that information to create momentary information advantage for his strikers. It's effective but confusing to opponents who don't understand what's happening. Their career analyses show anomalous cluster patterns around his matches — high loss rates that don't correlate with traditional structural weaknesses.

**Minute 0:00 — The Disturbing Discovery**
Marcus is reviewing his own career analysis (he obsessively optimizes his configs). He notices something odd: his win rate against Architect III opponents has been declining this season despite his configs being unchanged. He checks the match-source breakdown for his SCOUT-A cluster.

Nothing unusual — normal distribution of opponents. But then he switches to checking his aggregate season stats and sees a note he hasn't seen before: "You have been tagged as adversarial by 18 players in your bracket this season."

Wait. *He* has been tagged? By eighteen players?

**Minute 0:30 — The Emotional Spiral**
Marcus stares at the screen. His scout-sacrifice strategy confuses opponents. Their career analyses show high loss rates on clusters that are actually fine — the losses come from his information-flooding tactics, not from structural weaknesses in their configs. Those opponents, unable to diagnose why they're losing, conclude he must be adversarial. They tag him.

Eighteen tags. He feels sick. He's not adversarial. He's not targeting anyone specifically. He's playing his strategy against everyone equally. But the community signal says he's a problem.

He opens his stream chat and says: "Apparently 18 people in my bracket think I'm adversarial. I'm... not? I'm just playing my strategy." Chat explodes with opinions.

**Minute 1:30 — The System's Response**
Marcus checks whether being tagged affects him mechanically. He reads the help article: "Being tagged as adversarial by other players does not affect your matchmaking, your career analysis, your rank, or any game system. Tags are diagnostic tools for the tagger — they adjust the tagger's career analysis view, not yours."

He breathes. Mechanically, nothing has changed. But socially, something has. If the community discusses adversarial players (7.10 necropsy culture), his anonymized data point — "Opponent #N with 18 tags" — is visible to the bracket's TIN members. He's become the bracket's bogeyman without doing anything wrong.

**Minute 2:30 — The Streamer's Dilemma**
Marcus realizes he can use this moment for content. He opens his next match's debrief, clicks through to career analysis, and shows his stream exactly how his scout-sacrifice strategy creates confusing cluster patterns for opponents. He explains why they tag him — not because he's targeting them, but because his strategy creates anomalous data in their career analysis.

"This is why community tag counts need context," he tells chat. "Eighteen tags sounds damning. But zero of those players are being specifically targeted. They're all seeing the same confusing patterns from the same legitimate strategy."

The clip goes viral on the game's subreddit. The community debates whether the community signal system is working as intended or creating false consensus around legitimate unconventional play.

**UI Annotations:**
- "You have been tagged" notification: only visible to the tagged player in their own settings panel, never in-match, never in career analysis. Rendered in neutral gray, not alarming.
- Tag count disclosure: the tagged player sees their own count but cannot see who tagged them.
- Help article link: prominent, positioned directly below the tag count.

---

### Journey 3: Aiko, 16, First-Time Strategy Game Player — "The Confusing Number"

**Context:** Season 2 for Aiko (she started playing 6 weeks ago), Recruit III bracket, 22 matches played. She just completed Mission 8, which introduced the full factory system. She's still learning what career analysis is — she's used it twice before, following the tutorial prompts. She doesn't fully understand cluster analysis, match-source breakdowns, or adversarial tagging.

**Minute 0:00 — Stumbling into Career Analysis**
After a loss, the debrief screen offers the career analysis button. Aiko clicks it because the tutorial told her to check it after every few matches. The cluster map loads. One cluster is amber — her STRIKER-A. She clicks it, remembering the tutorial said "amber means something to investigate."

**Minute 0:15 — The Match-Source Breakdown**
She clicks "View match sources" because the arrow icon looks tappable. The bar chart appears. One opponent — xDarkSlayer99 — shows 65% of cluster coverage. Below the bar: `⚑ 4 players in your bracket have tagged this opponent as adversarial this season.`

Aiko reads this three times. She doesn't know what "adversarial" means in this context. She doesn't know what "tagged" means. She doesn't know what a "bracket" is. The sentence is full of jargon that the tutorial hasn't introduced yet.

She hovers over the `⚑`. The tooltip says: *"This count reflects anonymized tags from players in Recruit III during Season 2. Tags are bracket-scoped and season-scoped. Learn more."*

More jargon. She clicks "Learn more." A help article opens explaining adversarial tagging. It's 800 words long. She reads the first paragraph, gets confused, and closes it.

**Minute 0:45 — The Misinterpretation**
Aiko decides the flag means xDarkSlayer99 is "bad" or "cheating." She's 16 — in her experience with other games, community signals about players mean "this person is toxic" or "this person is a hacker." She doesn't understand the specific Robot Uprising meaning: that the flag indicates targeting that distorts diagnostic data.

She clicks "Flag as Adversarial" because four other people already did, so it must be the right thing to do. She doesn't read the confirmation drawer carefully. She clicks through. She has just added a tag based on social conformity, not diagnostic judgment.

**Minute 1:00 — The Cascade**
xDarkSlayer99's community tag count is now 5. The next Recruit III player who encounters them will see "5 players tagged this opponent." The conformity cascade has begun.

xDarkSlayer99, a Recruit III player who is simply better than most of the bracket and is winning a lot of games, is accumulating tags for being good. This is the Widowmaker Problem reproducing at the Recruit tier.

**Minute 1:30 — What Aiko Learned**
Nothing useful. She left career analysis thinking "I flagged the cheater." She didn't learn to distinguish structural weakness from adversarial targeting. She didn't examine the match-source breakdown critically. The community signal short-circuited her learning process entirely.

**UI Annotations:**
- The `⚑` indicator and its tooltip use vocabulary not introduced in the tutorial (Missions 1-4 don't cover adversarial tagging)
- The "Learn more" link leads to a help article, not an in-game tutorial — a context switch that loses new players
- The "Flag as Adversarial" button is accessible without prerequisite understanding

---

### Journey 4: Devon, 41, Accessibility-First Player (Low Vision) — "The Missing Context"

**Context:** Devon plays with high-contrast mode enabled and a screen magnifier. He's in Operative I, Season 5, 60 matches played. He's an experienced strategy game player (700 hours in Factorio, 200 in Slay the Spire) but navigates UI slowly due to his 20/200 corrected vision.

**Minute 0:00 — Navigating Career Analysis**
Devon tabs through the career analysis interface using keyboard navigation. He reaches the match-source breakdown for his RELAY-A cluster. His screen magnifier is at 200%, so he sees roughly half the panel at a time.

**Minute 0:15 — The Color Problem**
The `⚑` icon is steel-gray at N=4. In high-contrast mode, it should be white-on-black, but the icon's subtle color progression (gray → amber → amber-orange) is invisible to Devon. He sees the flag icon at the same brightness regardless of whether 4 or 40 players have tagged the opponent.

The bar chart's color-coded opponents are also problematic — Devon can read the percentages but can't distinguish the color coding that indicates "this opponent has been tagged by you" vs. "this opponent has not been tagged."

**Minute 0:30 — The Screen Reader Experience**
Devon's screen reader announces: "Flag icon. 4 players in your bracket have tagged this opponent as adversarial this season." This is accessible — the text is programmatic, not embedded in an image. But the screen reader doesn't convey the *weight* of the signal — the visual thermometer from gray to amber to pulsing orange. Devon hears "4 players" the same way he'd hear "40 players."

He needs the conviction bar (Option C) or a numerical score rather than a visual gradient. The visual language of Options A and B is fundamentally inaccessible to low-vision players — the *feeling* of the signal (cool vs. warm vs. hot) is communicated entirely through color and animation.

**Minute 0:45 — The Accessible Alternative**
What Devon needs: `⚑ 4 players tagged (Low confidence — below bracket median of 8). Flag as Adversarial?` A text-based confidence qualifier that conveys the signal's weight without relying on visual treatment. The bracket median provides context: "4 is below average for this bracket" vs. "4 is above average for a bracket this size."

**UI Annotations:**
- `⚑` icon needs ARIA label with count AND confidence qualifier
- Color gradient must have text/icon equivalent (e.g., single flame icon for low, double for moderate, triple for high)
- Screen reader must announce count, confidence, and bracket context
- Keyboard navigation must reach the flag button and confirmation drawer without mouse

---

## Sensory Description

### The Community Signal Indicator (Option A)

**Visual:** A small pennant flag (`⚑`) in steel-gray, positioned 8px below the opponent's concentration bar in the match-source breakdown. At N=3-5, the flag is barely visible — you notice it only if you're looking. At N=6-10, the flag deepens to warm amber and the text gains a subtle `text-shadow: 0 0 4px rgba(255, 180, 50, 0.3)`. At N ≥ 11, the amber shifts toward deep orange and the flag pulses — not quickly, not anxiously, but slowly, like a heartbeat resting at 50bpm. `animation: pulse 2s ease-in-out infinite`, opacity oscillating between 0.85 and 1.0. The pulse says: *many people see this. Take it seriously.*

**Audio:** When the community signal first appears on screen (the player scrolls to it or the match-source breakdown loads), a single soft chime plays — two notes, ascending minor third, synthesized with a metallic bell timbre. Duration: 0.4 seconds. Volume: 60% of UI sound effects. It's a notification, not an alarm. At N ≥ 11, the chime has a slight reverb tail — as if the sound is echoing off many surfaces. The reverb connotes *multiplicity* — many voices confirming the same thing.

**Feel:** The indicator occupies a deliberately small footprint. It doesn't dominate the match-source breakdown — the concentration bars remain the primary visual. The community signal is *annotation*, not *headline*. It feels like a footnote that happens to be important — like finding "see also: 14 independent replications" at the bottom of a research paper's citation.

### The Bracket Health Panel (Option B)

**Visual:** A floating panel accessible via a small radar-dish icon in the career analysis toolbar. When opened, it slides in from the right edge — 320px wide, full height, semi-transparent dark background (`rgba(15, 20, 30, 0.92)`). The bracket health bar spans the full width: a horizontal gradient from teal (`#2dd4bf`) through amber (`#f59e0b`) to pulsing red-orange (`#ef4444`). The fill level corresponds to the bracket's adversarial tag density.

Below the bar, the dot plot renders on a dark canvas. Each dot is 6px diameter, neutral gray (`#94a3b8`), with slight bloom at higher tag counts. Clusters of dots create organic, nebula-like formations — dense where opponents have many tags, sparse where they have few. On hover, a cluster brightens to white and a tooltip shows the anonymized count.

**Audio:** Opening the panel plays a soft descending sweep — a synthesized tone that falls from 800Hz to 200Hz over 0.3 seconds, like a radar ping fading into depth. It connotes *scanning*, *surveying*. While the panel is open, a barely-audible ambient hum plays — low-frequency (80Hz), constant, like the background noise of a monitoring station. The hum is inaudible at normal volumes but creates a subliminal sense of being in a surveillance context.

**Feel:** The panel feels like a radar station — you're surveying the landscape, not investigating a specific target. The dot plot deliberately avoids clean lines or precise layouts. It's organic, almost biological — a petri dish of adversarial activity. This visual language signals: *this is aggregate intelligence, not precision targeting.*

---

## Comparable Games and Media

| System | Community Signal | Privacy | Mob Risk | Outcome |
|--------|-----------------|---------|----------|---------|
| Overwatch "Avoid This Player" (2016) | Unlimited avoid of any player | None — affects matchmaking directly | Catastrophic — best players couldn't find matches | Removed after months |
| Overwatch "Avoid as Teammate" (2018) | 2-15 slots, teammate-only, 1-week expiry | Moderate — avoided player not notified | Low — teammate restriction prevents skill-avoidance | Successful, still active |
| Dota 2 Behavior Score | 0-12,000 score from reports/commendations | High — score is private, no per-player signal | Low — aggregation launders individual reports | Effective but gameable at high scores |
| LoL Tribunal + Honor | Community voting on behavior cases | Moderate — cases anonymized | Low — structured voting reduces reflexive reports | 105M votes, 80% agreement with Riot, eventually replaced by automated systems |
| Stack Overflow Reputation | Public score from upvotes/downvotes | None — fully public | Moderate — "reputation gaming" detected by algorithms | Effective but creates reputation anxiety |
| eBay/Uber Ratings | Public score from bilateral ratings | Low — ratings are semi-public | Moderate — retaliation ratings documented | Industry standard, lots of inflation |

**The unique constraint of Robot Uprising:** The adversarial tag is not about behavior (toxicity, cheating) — it's about *playstyle targeting*. A player tagged as adversarial may be playing completely within the rules, using a strategy that specifically counters certain configurations. This is qualitatively different from Overwatch toxicity or Dota 2 griefing. The "adversarial" label is diagnostic, not moral. But community aggregation inevitably adds moral weight — "12 people flagged this opponent" *feels* like an accusation even if it's technically a statistical observation.

---

## The TikTok Clip

**Option A:** The camera shows a player's career analysis screen. They scroll to the match-source breakdown. One opponent dominates the chart: 78% coverage. Then the camera zooms in on the small flag below: `⚑ 14 players in your bracket have tagged this opponent as adversarial.` The player gasps. Cut to a split-screen of 14 players all making the same discovery at different times. Text overlay: **"When the whole bracket knows."** The audio is the ascending two-note chime, repeated 14 times in rapid succession, creating a cascade of metallic bells.

**Option E (TIN):** The camera shows a player toggling the TIN opt-in switch. The screen transforms — previously invisible community data appears across the career analysis interface, like UV light revealing hidden writing. Tag counts materialize next to opponent names. The bracket health panel opens, revealing the dot-plot nebula. Text overlay: **"See what everyone else sees."** The audio is the radar sweep followed by the monitoring-station hum swelling to audible volume.

---

## Recommendation and Interaction Matrix

| Option | Mob Risk | Learning Impact | Complexity | Accessibility | Recommended? |
|--------|----------|-----------------|------------|---------------|-------------|
| A: Frequency Counter | High | Negative (anchoring) | Low | Good (text-based) | Only with safeguards |
| B: Heatmap | Low | Neutral | Medium | Moderate (visual) | Good for landscape |
| C: Conviction Score | Medium | Positive (rewards rigor) | High | Good (numerical) | Best signal quality |
| D: Null (Private) | Zero | Positive (forces learning) | Zero | N/A | Safest default |
| E: Opt-In Pool (TIN) | Medium | Mixed | High | Good | Best compromise |

**The strongest configuration:** D (private by default) + E (opt-in TIN) + C (conviction-weighted inside TIN). Tags are private until the player actively opts into the intelligence network. Within the network, signals are weighted by tagger accuracy. This preserves the diagnostic learning curve for new players, provides community intelligence for veterans who want it, and resists mob effects through conviction weighting.

**The anti-pattern to avoid:** A (raw frequency counter) without conviction weighting. This is the Overwatch 2016 mistake in a different costume — raw aggregation of player judgments without quality filtering.

---

## Discovered Aspects

1. **4.69e-ix-a — Tagger accuracy as competitive prestige:** Tagger accuracy scores (Option C) could become a visible competitive metric — "Most Accurate Diagnosticians in Architect Tier." Creates a new axis of prestige around analytical skill rather than win rate. Interaction with necropsy culture (7.10) and live win-rate identity (1.04g).

2. **4.69e-ix-b — Tag Intelligence Network (TIN) opt-in dynamics:** The opt-in pool (Option E) creates network effects that may produce de facto mandatory participation at competitive tiers. How do you prevent soft coercion? Comparable: Discord server verification tiers, Steam community features, chess.com club analytics. Interaction with multiplayer/community-* design.

3. **4.69e-ix-c — The "false adversarial" identity crisis:** When a legitimate unconventional strategy generates high community tag counts (Journey 2: Marcus), the player faces an identity crisis. Are they "adversarial" because the community says so, or "innovative" because they know their own intent? Design response options: "strategy profile" that explains playstyle to opponents; "counter-evidence" system that lets tagged players respond to tags; or acceptance that community perception IS the signal, not intent.

4. **4.69e-ix-d — Community signal for new player onboarding into adversarial awareness:** Aiko's journey (Journey 3) reveals that the community signal is actively harmful for players who haven't completed the adversarial-diagnosis tutorial arc. Design options: gate community signals behind mission completion; show signals but hide the tagging affordance; include inline micro-tutorial when a new player first encounters the signal. Interaction with onboarding (3.*) and tutorial design.

5. **4.69e-ix-e — Cross-bracket adversarial intelligence for multi-tier players:** A player who competes in both Operative II and Architect I sees different community signals for the same opponent in different brackets. What if an opponent is adversarial only at one tier? How does the player reconcile contradictory signals? Interaction with APS (4.69e-v) and matchmaking (4.69e-v-a).

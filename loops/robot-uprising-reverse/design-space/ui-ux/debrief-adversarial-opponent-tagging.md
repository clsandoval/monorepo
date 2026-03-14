# Known Adversarial Opponent Tagging

**Aspect:** 4.69e-ii — Known adversarial opponent tagging: UI for adding an opponent to the "known adversarial" list from within the career analysis agent audit; how the tag persists across sessions; what changes in career analysis behavior when an opponent is tagged; how to remove a tag.

**Parent:** 4.69e — Adversarial multi-cluster poisoning
**Siblings:** 4.69e-iii — Per-opponent threshold override; 4.69e-iv — Counter-poisoning config design; 4.69e-v — Adversarial density as career season metric; 4.69e-vi — Concentration threshold calibration for dense opponent pools
**Related:** 4.65 — Pre-ranking adversarial surface; 4.57 — Threat model report; 4.54 — Adversarial exposure policy; multiplayer/competitive-* (PvP competitive design); 4.69a — Multi-cluster threshold configurability; 4.69d — Multi-cluster persistence tracking; 7.10 — Necropsy culture

---

## The Core Design Problem

The match-source breakdown (4.69e) reveals when a disproportionate share of a cluster's coverage comes from a single opponent. It shows the ⚠ warning: *"78% of this cluster's coverage comes from one opponent. This may be adversarial targeting rather than a structural flaw."* The player reads this and thinks: *yes, NebulaFang IS specifically targeting my RELAY-C. I've known this for three seasons.*

But right now the player has no way to **act on that knowledge**. Every time they run career analysis, NebulaFang's targeted matches pollute the aggregate. Every time, the system re-discovers the same adversarial pattern. Every time, the player must mentally subtract NebulaFang's contribution to decide if RELAY-C has a real structural problem.

**The tag is the player externalizing a diagnosis.** It says: *I have examined this opponent's contribution to my career analysis, and I have concluded that their impact is adversarial — not indicative of structural weakness in my config. Exclude or de-weight their matches when computing cluster diagnostics.*

This is a powerful action. It changes what the diagnostic system sees. Misuse — tagging an opponent who is genuinely exposing a real weakness — blinds the player to structural problems. The design must make the tag feel weighty, reversible, and transparent about its consequences.

---

## Option A: The Inline Tag Button — "Flag as Adversarial"

### How It Works

The tag affordance lives inside the **Match-Source Breakdown** section of the Agent Audit panel (4.69e), directly next to the opponent's contribution bar. It appears only when a single opponent contributes ≥40% of a cluster's coverage — the system won't offer tagging when coverage is distributed across many opponents.

**The button:** A small shield icon with a red slash through it (🛡️❌), positioned to the right of the opponent's name in the match-source bar chart. On hover, it expands to read: `Flag as adversarial`. On click, a **confirmation drawer** slides down from the bar.

**The confirmation drawer:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  FLAG OPPONENT AS ADVERSARIAL                                               │
│                                                                             │
│  Opponent: NebulaFang (Operative II)                                        │
│  Matches analyzed: 20 of 45 total                                           │
│                                                                             │
│  This will:                                                                 │
│  ✦ Exclude NebulaFang's matches from future career analysis by default      │
│  ✦ Show a ⚑ flag next to NebulaFang in all match history views              │
│  ✦ Add NebulaFang to your Adversarial Watchlist (Settings → Opponents)      │
│                                                                             │
│  Your cluster result WITHOUT NebulaFang's matches:                          │
│  ┌──────────────────────────────────────────────────────┐                    │
│  │  RELAY-C cluster: 1 element (was 3)                  │                    │
│  │  ① context buffer size   Coverage: 14% (was 62%)     │                    │
│  │  ✓ Cluster flag would NOT fire at threshold N=3      │                    │
│  └──────────────────────────────────────────────────────┘                    │
│                                                                             │
│  ⚠ Tagging hides real weaknesses if the opponent is genuinely exposing      │
│    structural flaws. You can remove this tag at any time.                   │
│                                                                             │
│                              [Cancel]   [Flag as Adversarial ⚑]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The preview is the key affordance.** Before the player commits, they see exactly what career analysis would look like without this opponent's matches. If the cluster flag still fires even without NebulaFang — the structural problem is real, and tagging won't help. The preview teaches the player to distinguish structural from adversarial without needing the system to decide for them.

### Persistence

The tag persists in the player's **profile settings**, not in any individual career analysis result. It's a standing instruction: *whenever you compute career analysis, exclude this opponent's matches from the primary aggregate.*

**Storage model:**
```
adversarial_tags: [
  {
    opponent: "NebulaFang",
    tagged_at: "Season 4, Analysis #3",
    reason_context: "78% coverage concentration on RELAY-C cluster",
    affected_agents: ["RELAY-C"],
    tag_type: "full_exclusion"
  }
]
```

The tag survives across sessions, across seasons, across config versions. If the player redesigns RELAY-C entirely, NebulaFang's tag remains — because the tag is about the opponent's behavior, not the player's config.

### What Changes When Tagged

1. **Career analysis primary view:** NebulaFang's matches are excluded from the default aggregate. Cluster detection, coverage computation, combined coverage — all computed over the filtered match set. A small `⚑ 1 adversarial opponent excluded` note appears at the top of career analysis, clickable to expand the exclusion list.

2. **"Include adversarial" toggle:** A toggle in the career analysis header lets the player flip back to the full unfiltered aggregate at any time. The cluster result updates live. This lets the player see both views — "my config's real structural health" and "what happens when NebulaFang is included."

3. **Match history:** Every match against NebulaFang shows a small red ⚑ flag next to the opponent name. Hovering the flag shows: `Tagged as adversarial (Season 4)`. The matches are still visible — they are not hidden or deleted. They are annotated.

4. **Season health dashboard:** The season health metrics (4.68) show two numbers: health score with adversarial matches excluded (primary), and health score with all matches (secondary, smaller, in parentheses). If both scores are low, the player knows the problem isn't just adversarial.

5. **Persistence tracking (4.69d):** The persistent offender counter excludes adversarial-tagged matches. If RELAY-C only clusters because of NebulaFang, the persistence counter stays at 0 after tagging. If RELAY-C clusters for other reasons too, the counter only counts non-adversarial clusters.

6. **Threat model report (4.57):** NebulaFang gains a dedicated section in the threat model as a "known adversarial opponent" with their targeting pattern documented. This is the offensive intelligence view — the player can study how NebulaFang attacks and design counter-measures.

### How To Remove

**From the career analysis panel:** If the player clicks the `⚑ 1 adversarial opponent excluded` note, the exclusion list expands. Each entry has a small `×` button. Clicking it opens a micro-confirmation: `Remove adversarial tag for NebulaFang? Their matches will be included in future career analyses. [Cancel] [Remove]`

**From settings:** `Settings → Opponents → Adversarial Watchlist` shows all tagged opponents with full context (when tagged, why, which agents were affected). Each entry has a `Remove Tag` action.

**Automatic review prompt:** Every 2 seasons after tagging, the game surfaces a gentle prompt in career analysis: `You tagged NebulaFang as adversarial 2 seasons ago. Your config has changed since then. [Review tag] [Keep tag]`. This prevents stale tags that no longer reflect the opponent's behavior or the player's config.

### Sensory Description

**The tagging moment:** The player clicks `Flag as Adversarial ⚑`. The opponent's bar in the match-source chart fades from its normal color to a muted gray-red, with a subtle strikethrough animation. The ⚑ flag icon — a small pennant in crimson — materializes next to the opponent name with a satisfying *tink* sound (like a pin being pushed into a corkboard). The cluster result recomputes with a 0.3-second cascading update: numbers roll down, bars shrink, and if the cluster flag no longer fires, the entire cluster section folds closed with a soft exhale sound and the border shifts from amber to neutral gray.

**The "include adversarial" toggle:** A small switch in the career analysis header, styled as a physical toggle with a red indicator dot. Flipping it produces a muffled *click*. The career analysis numbers shift: bars expand, new cluster entries unfold, the cluster border flares back to amber. The toggle's red dot pulses gently to remind the player they're viewing the unfiltered state.

**The review prompt:** Two seasons later, a thin amber banner appears at the top of career analysis on first open: `📌 Adversarial tag review: NebulaFang (tagged Season 4). Your config has changed significantly since then.` The banner has a warm amber glow, not urgent red — this is a maintenance prompt, not an alert.

---

## Option B: The Watchlist-First Approach — Opponent Profiles

### How It Works

Rather than a quick inline tag, Option B routes through a dedicated **Opponent Profile** page. The match-source breakdown links to the opponent's profile, and the tagging action lives there alongside full match history, pattern analysis, and threat assessment.

**The flow:** In the Agent Audit panel, the `[View opponent config →]` button (from 4.69e) opens the **Opponent Profile** — a full-screen sidebar or modal that aggregates everything the player knows about this opponent.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT PROFILE: NebulaFang                                    [Close X] │
│  Rank: Operative II  │  Matches: 20  │  Win rate vs. you: 65%              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TARGETING ANALYSIS                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Agent targeting concentration:                                    │     │
│  │  RELAY-C  ████████████████████████░░░░░  78%                      │     │
│  │  SCOUT-A  ████░░░░░░░░░░░░░░░░░░░░░░░░  12%                      │     │
│  │  Other    ███░░░░░░░░░░░░░░░░░░░░░░░░░  10%                      │     │
│  │                                                                    │     │
│  │  Targeting style: FOCUSED (single-agent concentration)            │     │
│  │  Elements targeted: buffer size, fallback filter, priority queue  │     │
│  │  Consistency: HIGH (similar pattern across 18 of 20 matches)      │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  MATCH HISTORY (last 20)                                                   │
│  S4-M12  Loss  RELAY-C buffer overflow → cascade failure                   │
│  S4-M11  Loss  RELAY-C fallback saturated → striker blind                  │
│  S4-M10  Win   RELAY-C survived → opponent's hook timing off               │
│  S4-M09  Loss  RELAY-C priority storm → 3 dropped signals                  │
│  ...                                                                        │
│                                                                             │
│  ADVERSARIAL ASSESSMENT                                                     │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │  Diagnostic impact: HIGH                                           │     │
│  │  Without this opponent, RELAY-C cluster: DOES NOT FIRE             │     │
│  │  Career analysis coverage shift: 71% → 14%                        │     │
│  │                                                                    │     │
│  │  This opponent's matches disproportionately influence your         │     │
│  │  diagnostic results for RELAY-C. Tagging as adversarial will      │     │
│  │  exclude their matches from default career analysis.              │     │
│  │                                                                    │     │
│  │            [Flag as Adversarial ⚑]                                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  NOTES                                                                      │
│  [Add a note about this opponent...]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Approach

Option B treats tagging as an **informed decision embedded in context**, not a quick action. The player sees the full picture — match history, targeting pattern, win rate, diagnostic impact — before deciding. The Opponent Profile page also serves other purposes: studying an opponent's strategy, preparing for a rematch, understanding their config tendencies.

The profile page exists independently of the tagging feature. Tagging is just one action available within it. This means the design investment in the Opponent Profile serves multiple features.

### Persistence & Removal

Same as Option A. Tag persists in profile settings, affects career analysis computation, removable from the profile page or settings. The Opponent Profile page shows the current tag status prominently at the top: `⚑ FLAGGED AS ADVERSARIAL (Season 4)` with a `Remove Tag` action.

### Sensory Description

**Opening the Opponent Profile:** A slide-in panel from the right edge, 60% screen width, with a slight parallax shift of the career analysis panel behind it (dims to 30% opacity). The panel header shows the opponent's rank badge (circuit-glyph tier emblem from the competitive tier system) and handle in their tier color. The targeting analysis section uses the same bar chart visual language as the career analysis match-source breakdown, maintaining visual continuity.

**The targeting concentration chart:** Each agent bar is colored with the agent's assigned color from the player's workbench palette. RELAY-C's bar dominates — a wide teal band stretching across 78% of the width. The "FOCUSED" targeting style label appears in small caps with a crosshair icon (⊕), glowing a dim red. Hovering over the bar shows individual element breakdowns as sub-bars that separate with a soft accordion animation.

**The tagging action:** The `Flag as Adversarial ⚑` button sits inside a bordered assessment section with a subtle red-tinted background — not alarming, but distinct from neutral UI. Clicking it triggers a brief confirmation toast (not a full modal): `NebulaFang flagged as adversarial. Matches excluded from default career analysis.` The profile header updates live: the opponent's name gains a small ⚑ pennant, and the text `FLAGGED AS ADVERSARIAL` fades in below the rank badge.

---

## Option C: The Contextual Smart Suggestion — System-Initiated Tagging

### How It Works

The system proactively suggests tagging when its own analysis detects a strong adversarial pattern. Instead of the player needing to notice the concentration and decide to tag, the career analysis panel surfaces a **tagging recommendation** when:

1. A single opponent contributes ≥60% of a cluster's coverage, AND
2. The cluster would not fire without that opponent's matches, AND
3. The opponent has appeared in ≥3 consecutive career analyses with similar concentration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  💡 ADVERSARIAL TARGETING DETECTED                                          │
│                                                                             │
│  NebulaFang has contributed ≥60% of RELAY-C's cluster coverage in your      │
│  last 3 career analyses. Without their matches, this cluster does not       │
│  fire.                                                                      │
│                                                                             │
│  Recommendation: Flag NebulaFang as adversarial to isolate their impact     │
│  from your structural diagnostics.                                          │
│                                                                             │
│  [View Evidence]   [Dismiss]   [Flag as Adversarial ⚑]                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The "View Evidence" path:** Opens a compact evidence summary showing the three career analyses side by side, with NebulaFang's contribution highlighted in each. The visual pattern — three adjacent analysis panels with the same opponent's bar dominating — makes the adversarial pattern viscerally obvious.

### Why This Approach

Option C addresses the **expertise gap**. New competitive players may not know to look at the match-source breakdown, may not understand what adversarial concentration means, and may not realize tagging is an option. The system-initiated suggestion teaches the mechanic by demonstrating it in context.

The risk: if the system suggests tagging too aggressively, players may tag opponents who are legitimately exposing weaknesses. The triple-condition threshold (≥60% + cluster-wouldn't-fire + ≥3 consecutive analyses) is conservative — it only fires when the evidence is overwhelming.

### Persistence & Removal

Same as Options A and B. The system-initiated tag carries the same weight as a manual tag. The career analysis records whether a tag was player-initiated or system-suggested (metadata only — no behavioral difference).

### Sensory Description

**The suggestion appearing:** The 💡 box fades in above the cluster results with a gentle amber glow — the same amber used for non-urgent informational prompts throughout the debrief system. It enters with a subtle slide-down from the top of the panel, pushing the cluster results down by exactly the box's height. A single soft chime (two ascending notes, like a doorbell but quieter) accompanies the appearance — distinct from the alert sounds used for warnings.

**The evidence view:** Clicking `[View Evidence]` expands the box downward, revealing three miniature career analysis snapshots arranged horizontally. Each snapshot is a simplified version of the cluster result: just the match-source breakdown bars, with NebulaFang's contribution highlighted in red-amber and all other opponents in muted gray. The three snapshots are connected by thin dotted lines, showing the temporal progression. A label below reads: `Season 3 Analysis #5 → Season 4 Analysis #1 → Season 4 Analysis #3`. The repetition is the argument — seeing the same red-amber bar dominate three consecutive analyses is immediately legible even to a player who doesn't fully understand the math.

---

## Option D: The Graduated Response — Tag Levels

### How It Works

Instead of a binary "adversarial / not adversarial" tag, the player assigns one of three graduated response levels to an opponent:

**Level 1 — Watch (👁):** The opponent's matches are annotated but not excluded. Career analysis runs normally, but the match-source breakdown always shows this opponent's contribution separately, even if they're below the normal visibility threshold. The player is saying: *I'm aware of this opponent. Show me their impact, but don't change the math.*

**Level 2 — Discount (⚖️):** The opponent's matches are included in career analysis but at 50% weight. Their contribution to coverage is halved. The player is saying: *I think this opponent is partially adversarial — some of their impact is real, some is targeted. Split the difference.*

**Level 3 — Exclude (⚑):** Full exclusion, same as Option A's binary tag. The player is saying: *this opponent's matches are pure adversarial noise. Remove them entirely.*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OPPONENT TREATMENT: NebulaFang                                             │
│                                                                             │
│  ○ Normal — include all matches at full weight                              │
│  ○ 👁 Watch — annotate but include at full weight                           │
│  ○ ⚖️ Discount — include at 50% weight                                     │
│  ● ⚑ Exclude — remove from default career analysis                         │
│                                                                             │
│  Preview with selected treatment:                                           │
│  RELAY-C cluster: 1 element (was 3)                                         │
│  Combined coverage: 14% (was 71%)                                           │
│  Cluster flag: DOES NOT FIRE                                                │
│                                                                             │
│                              [Cancel]   [Apply Treatment]                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why This Approach

The graduated model acknowledges that adversarial targeting is not binary. An opponent who happens to be strong against RELAY-C — not because they're deliberately poisoning diagnostics, but because their playstyle naturally stresses relay units — shouldn't be fully excluded. But their consistent impact on RELAY-C shouldn't dominate the aggregate either. The "Discount" level captures this ambiguity.

The risk: three levels creates decision paralysis for players who would have easily committed to a binary tag. The additional cognitive load may not be worth the increased precision for most players.

### The Discount Math Problem

The 50% weight for "Discount" is arbitrary. Why not 30%? Why not 75%? One approach: the discount weight is derived from the opponent's concentration ratio. If NebulaFang contributes 78% of RELAY-C's cluster coverage but only played 44% of the player's matches (20/45), the "expected" contribution if NebulaFang's impact were proportional would be ~44%. The excess is 78% - 44% = 34 percentage points. The discount could target this excess: include NebulaFang's matches but reduce their weight so that their contribution matches the proportional expectation. This is more defensible than a flat 50% but harder to explain.

### Sensory Description

**The graduated selector:** Four radio buttons arranged vertically, each with its icon. When the player selects a level, the preview panel below updates with a smooth interpolation — the coverage numbers count down (or up) to the new values, and the cluster bar chart animates to the new state. The transition between levels uses a consistent 0.4-second ease-out. Selecting "Watch" adds a subtle blue eye icon overlay to the opponent's bar; "Discount" adds a balance-scale icon and dims the bar to 50% opacity; "Exclude" grays out the bar entirely with a strikethrough.

---

## Interaction Effects

### With 4.69e-iii (Per-opponent threshold override)

Tagging and threshold override are complementary systems. Tagging adjusts **whether/how much** an opponent's matches influence aggregate diagnostics. Threshold override adjusts **how sensitive** the cluster detection is when run over a subset of matches. A player might: tag NebulaFang as adversarial (exclude from aggregate), but ALSO run a filtered career analysis specifically against NebulaFang with a lower threshold (N=2) to study their targeting pattern in isolation. The tag cleans the aggregate; the threshold override sharpens the scalpel for targeted investigation.

### With 4.69a (Multi-cluster threshold configurability)

If the player raises their global threshold to N=4 instead of tagging adversarial opponents, they might suppress adversarial clusters — but also suppress legitimate structural signals. Tagging is more surgical than threshold adjustment: it removes specific opponents rather than raising the bar for all signals. The two mechanisms should be presented as different tools for different problems. Threshold = "I get too many cluster flags in general." Tag = "I know exactly which opponent is polluting my diagnostics."

### With 4.69d (Multi-cluster persistence tracking)

The tag directly interacts with persistence tracking. If RELAY-C's multi-cluster persistence counter is at 3 (persistent offender badge), and the player tags NebulaFang, the system must recalculate: were all 3 persistence events caused by NebulaFang's matches? If so, the persistence counter drops to 0, and the persistent offender badge dissolves. If 2 of 3 were NebulaFang-driven and 1 was structural, the counter drops to 1. This retroactive recalculation is a powerful moment — the player literally watches their config's "health record" clean up as they identify the true source of apparent dysfunction.

### With 4.54 (Adversarial exposure policy)

The adversarial exposure policy governs what opponents can see about the player's career analysis. If the player tags an opponent as adversarial, the exposure policy might automatically tighten for that opponent — reducing what diagnostic information is visible to them in the post-season summary. This connection should be surfaced in the tagging confirmation: `Note: NebulaFang will see less diagnostic detail about your config in the post-season summary.`

### With 4.57 (Threat model report)

Tagged opponents automatically appear in the Threat Model Report as "known adversarial" entries. The report aggregates all tagged opponents, their targeting patterns, and the player's counter-measures (config changes made in response). This creates a **scouting dossier** — the player's accumulated intelligence about their competitive rivals. The tag is the entry point; the threat model report is the dashboard.

### With 7.10 (Necropsy culture)

Community sharing of adversarial tagging patterns becomes a social phenomenon. Players share: "I tagged NebulaFang after analyzing their targeting pattern against my relay stack — here's the evidence." This extends necropsy culture from self-analysis to opponent analysis. Shareable tagging evidence (screenshot of the match-source breakdown with concentration highlighted) becomes a community artifact. Risk: naming opponents publicly as "adversarial" could create social toxicity. The sharing UI might anonymize opponent handles by default, showing only the pattern, not the person.

---

## Comparable Games & Media

### Chess — Opponent Preparation & Opening Books

In competitive chess, serious players maintain **preparation files** on frequent opponents. They study their opponent's opening repertoire, typical middle-game structures, and endgame tendencies using databases like ChessBase. The adversarial tag is analogous to marking an opponent's preparation in your database: *this player always plays the Sicilian against me, so my analysis of my King's Indian performance is biased by their absence.* The tag doesn't change how the game is played — it changes how you interpret your results.

### Poker — Player Notes & Color Tags

Online poker platforms (PokerStars, GGPoker) let players **tag opponents with color-coded labels**. A player might tag a frequent opponent as "LAG" (loose-aggressive) or "NIT" (tight-passive). These tags persist across sessions and appear as colored dots on the player's avatar. The tags inform how the player interprets their hand history stats when filtered by opponent. Robot Uprising's adversarial tag is the same concept: marking an opponent to adjust how you interpret your results. Poker's implementation is the closest direct analog — persistent, per-opponent, affects analysis interpretation, removable.

### League of Legends — Dodge Lists & Third-Party Tools

LoL players maintain informal "dodge lists" — opponents they avoid queuing into. Third-party tools like op.gg and porofessor surface opponent tendencies. The community has built the infrastructure that Riot didn't provide natively. Robot Uprising's advantage: building the tagging system as a first-class feature rather than leaving it to third-party tools means the tag can actually affect the diagnostic computation, not just the player's mental model.

### Baseball — Scouting Reports & Pitch Tendency Charts

MLB teams maintain detailed scouting reports on opposing batters and pitchers. A team's analytics department might flag a batter as "pulls against our shift" — which changes how they weight the batter's contribution to their defensive metrics. The adversarial tag is directly analogous: flagging an opponent as "targets our relay" changes how their matches are weighted in diagnostic analysis.

---

## Player Journeys

### Journey: Zara, 24, Competitive Ladder Player (Architect I)

**Context:** Season 5, Week 3. Zara has been grinding competitive ladder for two seasons. She runs career analysis weekly to track her config health. Last analysis flagged RELAY-C as a multi-cluster candidate for the second time. She suspects NebulaFang, an opponent she faces frequently in her rank bracket, is deliberately targeting her relay stack.

**Minute 0:00 — The Third Cluster Alert**

Zara opens the debrief panel after her latest session. The career analysis runs over her last 50 matches. The cluster detection fires: RELAY-C, 3 elements, combined coverage 68%. The amber border pulses. She's seen this before.

She sighs. She knows her relay is fine — she redesigned it last season and it performs well against the field. But the cluster keeps firing.

**Minute 0:15 — Examining the Match-Source Breakdown**

She expands the match-source breakdown section. The bar chart loads:

```
vs. NebulaFang           ████████████████████░░░░  72%
vs. All others (31)      ████░░░░░░░░░░░░░░░░░░░  14%
```

The ⚠ warning appears: *"72% of this cluster's coverage comes from one opponent."* Zara nods. She's seen this concentration pattern twice before but never acted on it.

This time, she notices a new element: the small shield icon (🛡️❌) to the right of NebulaFang's name. She hovers. `Flag as adversarial` expands. *When did they add this?* she thinks.

**Minute 0:30 — The Confirmation Preview**

She clicks the shield icon. The confirmation drawer slides down. She reads:

*"Your cluster result WITHOUT NebulaFang's matches: RELAY-C cluster: 1 element (was 3). Coverage: 11% (was 68%). Cluster flag would NOT fire at threshold N=3."*

Her eyebrows rise. Without NebulaFang's matches, RELAY-C isn't even close to clustering. The structural signal was an illusion. She scrolls down to the warning: *"Tagging hides real weaknesses if the opponent is genuinely exposing structural flaws."*

She considers. NebulaFang runs a heavy signal-flood comp that specifically targets relay stacks. She's studied their config — it's designed to overload communication channels. Against every other opponent, her relay handles traffic fine. The problem isn't her relay. The problem is one opponent who specialized in breaking relays.

**Minute 0:45 — Pulling the Trigger**

She clicks `Flag as Adversarial ⚑`. The *tink* sound fires. NebulaFang's bar fades to muted gray-red with a soft strikethrough. The cluster results recompute: the cascading number update rolls through — 68% drops to 11%, the cluster section folds closed, the amber border dissolves to neutral gray.

At the top of career analysis, a small note appears: `⚑ 1 adversarial opponent excluded`. Zara exhales. For the first time in two seasons, RELAY-C is clean.

**Minute 1:00 — Verifying the Decision**

She clicks the `⚑ 1 adversarial opponent excluded` note. The exclusion list expands, showing NebulaFang with the context: *"Tagged Season 5, Analysis #3. 72% coverage concentration on RELAY-C cluster."* She notes the `×` removal button — good, she can undo this if she's wrong.

She toggles the "Include adversarial" switch. The numbers snap back: cluster fires again, 68% coverage, amber border returns. She toggles it off again. The clean result returns. The toggle gives her confidence — the tag isn't destroying information, just filtering the default view.

**Minute 1:15 — Next Steps**

Zara navigates to Settings → Opponents → Adversarial Watchlist. NebulaFang appears as the sole entry. She sees the `affected_agents: RELAY-C` field and thinks: *I should also check if NebulaFang is affecting my other agents' diagnostics.* She makes a mental note to look at this next analysis.

She closes the debrief feeling lighter. Two seasons of RELAY-C guilt — two seasons of wondering if her relay design was fundamentally broken — resolved by one tag. The problem was never her config. It was her data.

**UI Annotations:**
- Shield icon (🛡️❌): 16×16px, right-aligned next to opponent name in match-source bar, hover-expands to text label with 200ms delay
- Confirmation drawer: slides down from bar with 300ms ease-out, full-width within the panel
- Preview section: bordered box with green checkmark if cluster would not fire, amber exclamation if it still would
- Cascading number update: 300ms staggered animation, numbers count down individually
- `⚑` note: top of career analysis panel, left-aligned, small caps, clicking expands inline (not modal)
- "Include adversarial" toggle: right side of career analysis header, 40×20px toggle switch with red indicator dot

---

### Journey: Marcus, 31, Returning Player After Break

**Context:** Season 6, first session back after a 3-month break. Marcus was a Specialist-rank player who took a break. His config is outdated, and the competitive meta has shifted. He's running career analysis for the first time in months.

**Minute 0:00 — The Overwhelming Analysis**

Marcus opens career analysis over his last 30 matches (played over the past week since returning). Everything looks different from when he left. Three agents are clustering. His season health score is 38% — deep red. He feels overwhelmed.

RELAY-B: 4 elements, combined coverage 79%. STRIKER-A: 3 elements, combined coverage 45%. SCOUT-C: 3 elements, combined coverage 41%.

**Minute 0:20 — Discovery Through Exploration**

He expands RELAY-B's cluster first (highest coverage). The match-source breakdown shows:

```
vs. IronPulse99         ████████████████░░░░░░░  62%
vs. CrystalNet          █████░░░░░░░░░░░░░░░░░░  18%
vs. All others (12)     ████░░░░░░░░░░░░░░░░░░░  15%
```

No ⚠ warning appears — IronPulse99 contributes 62%, which is above the 40% threshold, but the system doesn't flag it automatically because this is Marcus's first analysis (Option C's triple-condition threshold requires 3 consecutive analyses). However, the shield icon (🛡️❌) still appears next to IronPulse99's name.

Marcus doesn't recognize this UI element. He hovers, reads `Flag as adversarial`, and wonders what this does. He clicks it.

**Minute 0:35 — Learning Through the Preview**

The confirmation drawer opens. Marcus reads the explanation for the first time. He's particularly struck by the preview:

*"RELAY-B cluster WITHOUT IronPulse99: 2 elements (was 4). Coverage: 31% (was 79%). Cluster flag WOULD fire at threshold N=3."*

Wait — even without IronPulse99, the cluster still fires? That means RELAY-B has real structural problems that IronPulse99 is exacerbating, not fabricating. Marcus cancels the tag. He thinks: *IronPulse99 is hard on my relay, but the relay also has real issues. I shouldn't hide this signal.*

**Minute 0:50 — Trying STRIKER-A**

He moves to STRIKER-A's cluster. The match-source breakdown:

```
vs. IronPulse99         ████████████████████░░░  82%
vs. All others (14)     ██░░░░░░░░░░░░░░░░░░░░░  7%
```

The ⚠ warning blazes: *"82% of this cluster's coverage comes from one opponent."* He opens the tag confirmation. Preview: *"STRIKER-A cluster WITHOUT IronPulse99: 0 elements. Cluster flag would NOT fire."*

This one is clean. IronPulse99 is specifically targeting his striker, but the striker is structurally sound. He tags IronPulse99 for STRIKER-A's analysis.

**Minute 1:05 — The Nuance Moment**

Marcus realizes: IronPulse99 is tagged as adversarial now, but only because of the striker analysis. The tag will also exclude IronPulse99's matches from the RELAY-B cluster computation. He checks the toggle — flips "Include adversarial" on. RELAY-B's cluster goes back to 4 elements/79%. He flips it off: 2 elements/31%.

He thinks: *I actually want IronPulse99's matches for the relay analysis — they're revealing real problems — but not for the striker analysis.* He looks for a per-agent or per-cluster tagging option. He doesn't find one (that would be 4.69e-iii's per-opponent threshold override or per-cluster exclusion, a more granular system not yet designed).

For now, he decides to keep the tag on and address RELAY-B's structural issues independently, using the "Include adversarial" toggle to check his progress against IronPulse99 occasionally.

**Minute 1:20 — The Learning Arc**

Marcus has learned three things in this session:
1. The adversarial tag exists and what it does
2. The preview is the key tool — it tells you whether the structural signal persists without the opponent
3. A binary per-opponent tag is a blunt instrument when an opponent exposes real weaknesses in some agents but not others

He saves a mental note: *If they ever add per-cluster exclusion, I'd use it.* (This is the desire that motivates 4.69e-iii.)

**UI Annotations:**
- Shield icon appears even without the ⚠ warning — it's always available when an opponent contributes ≥40% of a cluster
- Preview showing "cluster WOULD fire" uses amber styling, not green — visually distinct from "WOULD NOT fire" (green)
- Toggle state persists within a session but resets to "exclude adversarial" on next career analysis open — the filtered view is the default
- The tag is per-opponent, not per-cluster — this limitation is visible in the confirmation drawer text ("exclude NebulaFang's matches from future career analysis" — all matches, all clusters)

---

### Journey: Tomás, 16, First Competitive Season, Playing on Mobile

**Context:** Season 2. Tomás has been playing single-player campaign for a month and just started competitive play. He's in Bronze II. He runs career analysis for the first time after 15 competitive matches.

**Minute 0:00 — First Career Analysis**

The career analysis panel opens. Tomás has only played against 5 different opponents (small Bronze bracket). His first analysis shows one cluster: RELAY-A, 3 elements, combined coverage 55%.

He taps the cluster to expand it. The match-source breakdown loads:

```
vs. xXBladeRunnerXx      ████████████████████  80%
vs. All others (4)       ███░░░░░░░░░░░░░░░░░  12%
```

The ⚠ warning appears. But Tomás doesn't know what "adversarial targeting" means. He's faced xXBladeRunnerXx 8 times out of 15 matches — in a small Bronze bracket, the same opponents recur naturally. xXBladeRunnerXx isn't a poisoner; they're just the most frequent matchup.

**Minute 0:20 — The Accidental Tag**

Tomás sees the shield icon and taps it curiously. The confirmation drawer opens on mobile — a bottom sheet that slides up, covering the lower 60% of the screen. He reads the preview: *"Without xXBladeRunnerXx: RELAY-A cluster: 0 elements. Cluster flag WOULD NOT fire."*

He thinks: *Cool, if I exclude this player, the problem goes away.* He doesn't understand that this might hide a real weakness. He taps `Flag as Adversarial ⚑`.

**Minute 0:30 — The Consequence**

His career analysis cleans up. RELAY-A looks healthy. But RELAY-A isn't healthy — xXBladeRunnerXx is exposing real weaknesses that all Bronze players could exploit. They happen to face each other often, creating the concentration pattern, but the targeting isn't adversarial.

Tomás proceeds to the next 10 matches with an unpatched relay. He loses several matches where opponents stumble into the same RELAY-A weaknesses that xXBladeRunnerXx exploited consistently. After 10 more matches, he runs career analysis again. Now the cluster fires from multiple opponents (the match pool is more diverse). But it took him 10 losing matches to re-learn what the diagnostic already knew.

**Minute 1:00 — The Review Prompt (2 Seasons Later)**

Two seasons later, Tomás is in Silver I. The review prompt appears: *"You tagged xXBladeRunnerXx as adversarial in Season 2. Your config has changed significantly since then."* By now Tomás understands the system better. He reviews the tag, sees that his current config handles relay stress fine against everyone, and removes the tag — it no longer matters because he's fixed the underlying relay issues through organic play.

But the important lesson: the tag delayed his growth in Season 2. The design needs to protect against this.

**Minute 1:05 — What Should Have Happened (Design Critique)**

Option C's system-initiated suggestion (which requires ≥3 consecutive analyses before suggesting) would not have fired for Tomás — he only had 1 analysis. The shield icon's availability at ≥40% concentration is the problem: in small opponent pools, 40% concentration is normal, not adversarial.

This journey reveals that **4.69e-vi (concentration threshold calibration for dense opponent pools)** is a prerequisite for safe tagging. In pools of ≤5 opponents, the tagging UI should either be hidden or show a stronger warning: *"You've played against only 5 opponents. High concentration from one opponent is expected. Tagging is recommended only when you believe targeting is deliberate."*

**UI Annotations (Mobile):**
- Bottom sheet confirmation: slides up covering 60% of screen, with rounded top corners, drag handle at top for dismiss
- Preview section: full-width card within bottom sheet, left-aligned text, larger touch targets (44px minimum)
- Shield icon: 24×24px on mobile (larger than desktop 16×16) for touch target compliance
- Warning text: uses system body font at 16pt, not small caps — readability on small screens
- "Include adversarial" toggle: moved from header to a dedicated row within the filter section on mobile, with full-width tap target

---

### Journey: Keiko, 29, Streamer, Champion II

**Context:** Season 8. Keiko streams Robot Uprising competitive play to 2,000 concurrent viewers. She's in Champion II and faces the same top-50 players repeatedly. She has 4 opponents tagged as adversarial. She's running career analysis live on stream.

**Minute 0:00 — The Filtered Analysis**

Keiko opens career analysis. The header shows: `⚑ 4 adversarial opponents excluded (47 of 120 matches filtered)`. Her viewers see the clean analysis: no clusters firing, season health at 82%.

Chat messages fly: "4 tagged opponents? who??" "show the unfiltered version" "she's hiding the data lol"

**Minute 0:10 — The Toggle Performance**

Keiko grins and clicks the "Include adversarial" toggle. The career analysis transforms: two clusters fire (COMMAND-A and RELAY-D), season health drops to 61%. Chat erupts: "SIXTY ONE PERCENT" "the tag is doing SO much work" "relay-d is COOKED"

She explains to chat: "These four players all run anti-relay flood comps. They're specifically targeting my relay stack because they know it's my strongest system. Without their matches, my config is clean. The tag lets me see my REAL structural health vs. my health-against-their-specific-counter."

**Minute 0:30 — The Community Teaching Moment**

She clicks the `⚑ 4 adversarial opponents excluded` note to expand the list. Chat sees four anonymized entries (opponent handles are starred out in the stream overlay — Keiko uses a custom stream filter): `⚑ ******* (tagged S6), ⚑ ******* (tagged S7), ⚑ ******* (tagged S7), ⚑ ******* (tagged S8)`.

"I don't show their names on stream," she says. "Tagging isn't about calling someone out. It's about my diagnostic hygiene. If I showed their names and said 'this person is adversarial,' that'd be toxic."

She demonstrates the toggle again, flipping between filtered and unfiltered views: "See how COMMAND-A only clusters when these four are included? That's pure adversarial pressure. But RELAY-D clusters at 22% coverage even WITHOUT them — that's a real issue. The toggle helps me see both."

**Minute 1:00 — The Stream Clip**

A viewer clips the toggle moment — the split-second where the career analysis transforms from clean to two-cluster chaos — and posts it with the caption: "the real game is in the diagnostics." It gets 50,000 views.

**UI Annotations:**
- `⚑ N adversarial opponents excluded` note: expandable inline, shows opponent entries with context
- Stream overlay integration: opponent handles can be starred/anonymized (this is a client-side display setting, not part of the game's core tagging system, but important for the streamer use case)
- Toggle animation on stream: the 0.3-second transition between filtered/unfiltered states is visually dramatic enough to create clip-worthy moments
- The "47 of 120 matches filtered" count is the key number — it shows the tag's scope at a glance

---

## Strengths and Weaknesses

### Strengths

1. **Player agency over diagnostics.** The tag puts the player in control of what their analytical tools see, mirroring real-world data science practice (excluding known outliers from analysis).

2. **Teaches adversarial thinking.** The mere existence of the tagging system teaches players that their diagnostic data can be poisoned. This is a transferable skill — recognizing when data is influenced by adversarial selection bias.

3. **The preview is educational.** Seeing what career analysis looks like with and without an opponent teaches causal reasoning: *is this opponent revealing a problem, or creating the illusion of one?*

4. **Low-risk reversibility.** Tags can be removed at any time. The "Include adversarial" toggle lets the player see both views without removing the tag. No information is destroyed.

5. **Creates a natural progression.** Watch → Discount → Exclude (Option D) maps to increasing player confidence in their adversarial assessment. It rewards nuanced thinking.

### Weaknesses

1. **False confidence from premature tagging.** Tomás's journey shows the core risk: tagging an opponent who is genuinely exposing weaknesses blinds the player. The preview mitigates this (it shows whether the structural signal persists), but players may not read it carefully.

2. **Binary tag in a gradient world.** Options A-C are binary: tagged or not. But adversarial impact exists on a spectrum. Option D's graduated approach addresses this but adds complexity.

3. **Small pool distortion.** In small competitive brackets where the same 5-8 opponents recur, high concentration from one opponent is statistically expected, not adversarial. The tagging UI must account for opponent pool size (see 4.69e-vi).

4. **Social toxicity potential.** Tagging an opponent as "adversarial" has social implications if the tag is visible or shareable. Keiko's streamer journey shows the healthy version (anonymizing opponent names). The unhealthy version: players publicly naming "adversarial" opponents as a form of griefing or blame-shifting.

5. **Tag maintenance burden.** Over many seasons, a player might accumulate many adversarial tags that become stale. The automatic review prompt (every 2 seasons) helps, but a player with 10+ tags faces a maintenance chore. An automatic expiry mechanism (tags auto-expire after 3 seasons unless renewed) might be needed.

---

## The TikTok Clip

**The toggle moment:** A player opens career analysis showing clean diagnostics (82% health, no clusters). They flip the "Include adversarial" toggle. The screen transforms: health drops to 51%, two clusters fire, bars extend, amber borders pulse. The camera shows the player's face — a knowing smirk. Caption: "This is what my config looks like if I pretend my rivals aren't specifically trying to destroy my relay. Thank god for the tag." 15 seconds, devastating, instantly shareable.

---

## New Aspects Discovered

1. **4.69e-vii — Per-cluster adversarial exclusion**: Marcus's journey reveals the need to tag an opponent as adversarial for specific clusters but not others. Instead of a blanket per-opponent tag, the player tags the opponent's contribution to specific agent clusters. "Exclude IronPulse99 from STRIKER-A's analysis but include them in RELAY-B's." More surgical, more complex. The per-cluster exclusion interacts with 4.69j (per-agent threshold override) — both are mechanisms for per-agent diagnostic tuning.

2. **4.69e-viii — Tag expiry and automatic sunset**: Tags that persist forever become stale as configs change, opponents change, and the meta evolves. Design for automatic tag expiry after N seasons (3?) with a renewal prompt. Interaction with the review prompt (every 2 seasons) — the expiry could fire at the 3rd review if the player hasn't renewed.

3. **4.69e-ix — Adversarial tag as community signal**: If tag frequency is aggregated across the community (anonymized), the game could surface "this opponent is tagged as adversarial by 12 players in your bracket." This transforms the individual tag into crowd-sourced intelligence. Risk: mob tagging of strong players who aren't adversarial. Interaction with 7.10 necropsy culture.

4. **4.69e-x — Tag evidence export for community discussion**: Shareable artifact that shows the match-source breakdown, the preview, and the tagging rationale — without revealing opponent identity. Enables community discussion of "when should I tag?" as a skill. Interaction with necropsy culture (7.10) and Opus Magnum histogram sharing culture (1.03).

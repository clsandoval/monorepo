# Community Moderation Infrastructure

**Aspect:** 7.03b — Grief prevention (impossible bounties, bad Evolution Chain contributions, offensive names), report system, automated quality detection, trust levels

**Category:** multiplayer/community
**Wave:** 7 — Multiplayer & Community

---

## The Core Design Problem

Robot Uprising's community content ecosystem is unusually diverse. Players can share:
- **Config Codes** — full attention architectures as compressed strings (7.03a)
- **Puzzle Boxes** — intentionally-broken configs with modification budgets (7.03 Model 1)
- **Gauntlet Seeds** — scenario designs without player configs (7.03 Model 2)
- **Evolution Chains** — iterative challenges where each solver adds constraints (7.03 Model 4)
- **Config Necropsies** — annotated version histories with commentary (7.10)
- **Bounties** — reward-gated challenges on specific scenarios (7.03 Model 6)
- **Blueprint templates** — partial configs for community reuse
- **Channel names** — player-authored strings that become audio signatures (6.02d)
- **Rule labels, hook names, session notes** — freeform text embedded in shared configs

Each content type has a different abuse surface. A Config Code is mathematically verifiable (it either works or doesn't). A Puzzle Box can be unsolvable. An Evolution Chain can be poisoned by a single bad link. A channel name can be offensive. A bounty can promise rewards the creator can't deliver. A necropsy annotation can contain harassment disguised as "feedback."

The fundamental tension: **Robot Uprising's community sharing is the game's greatest strength AND its greatest vulnerability.** The config necropsy culture (7.10), the histogram sharing loop (Opus Magnum precedent), the async challenge ecosystem — all depend on players feeling safe to share, experiment, and receive feedback. One toxic experience can permanently disincentivize a player from ever sharing again.

The design must solve for a web-based game (locked tech stack: React + Pixi.js + Vite, no backend initially) that may eventually need backend services for community features. Moderation infrastructure should be designed to work in phases: client-side-only at launch, optional backend services for competitive/community features later.

---

## Six Moderation Models

### Model A: "The Circuit Breaker" (Automated Validation Layer)

**How it works:** Every piece of shared content passes through an automated validation pipeline before becoming visible to other players. The pipeline has three tiers: **structural validation** (does the content conform to the schema?), **quality heuristics** (does the content meet minimum viability thresholds?), and **text filtering** (do any player-authored strings contain prohibited content?). Content that fails any tier is rejected with a specific, actionable error message. Content that passes all three goes live immediately — no human review queue.

**Structural validation tier:**
- Config Codes: Parse → verify all referenced skills/rules/hooks exist in the current game version → verify slot limits respected → verify channel names resolve
- Puzzle Boxes: All of the above + verify author solved their own puzzle (Proof of Solvability, already locked from 7.03) + verify modification budget is sufficient (at least one valid solution exists within budget)
- Gauntlet Seeds: Verify enemy composition is within defined bounds → verify scenario is completable by at least one known-valid config archetype (automated solver or author proof)
- Evolution Chains: Verify each link's constraint doesn't make subsequent links impossible → verify chain endpoint is still solvable
- Bounties: Verify scenario is solvable + verify reward is within creator's available budget (circuit tokens, see 7.03c)

**Quality heuristics tier:**
- **Trivial content detection:** Puzzle Boxes where the "flaw" is a disconnected unit (no hooks, no rules) → rejected as trivially solvable. Gauntlet Seeds where 1 scout can sweep the board → rejected as trivially easy.
- **Duplicate detection:** Hash-based similarity check against recently published content. Configs that differ by only a channel rename from an existing published config → flagged as potential duplicate.
- **Difficulty estimation:** Based on number of interacting systems (hooks × rules × units), estimated solve difficulty on a 1-5 scale displayed to solvers but not gating publication.

**Text filtering tier:**
- All player-authored strings (channel names, rule labels, session notes, necropsy annotations, bounty descriptions, player display names) pass through a multi-layer filter:
  1. **Static blocklist** with substitution-aware matching (catches leetspeak, homoglyphs, symbol insertion)
  2. **Context-aware classification** using a lightweight ML model (distinguishes "I killed it" from threats, handles game-specific vocabulary like "hack," "attack," "eliminate" that would false-positive on generic filters)
  3. **The Penistone Problem handler:** A curated allowlist of game terms, Philippine place names, unit names, and common config vocabulary that would otherwise trigger false positives. "Hack" is a game skill. "Siquijor" contains no profanity. "Context overload" is a game mechanic.

**What the rejection screen looks like:**
The player hits PUBLISH. A progress bar fills left-to-right with three segments labeled STRUCTURE → QUALITY → CONTENT. Each segment lights cyan as it passes. If a segment fails, it turns amber and a panel slides down below the progress bar with the specific issue:

```
⚠ QUALITY CHECK: Puzzle Box rejected
Your modification budget (1 change) has no valid solution.
The only fixable element (RELAY-B Hook #2) requires 2 changes
to resolve. Try increasing the budget to 2.
[Edit Budget] [Cancel]
```

The tone is diagnostic, not punitive. The game treats failed validation like a build error, not a moral judgment. The rejection panel uses the same visual language as the Inspector — amber borders, monospace detail text, actionable suggestions.

**Strengths:**
- **Zero human moderation cost at launch.** The entire tier can run client-side for structural/quality checks, with a lightweight API for text filtering.
- **Instant feedback.** No waiting for human review. Failed content is rejected in <2 seconds with specific fix instructions.
- **Teaching function.** Validation errors teach content creation skills. "Your puzzle has no valid solution" teaches puzzle design. "Your Gauntlet seed is trivially easy" teaches scenario design.
- **Composable.** Each validation check is an independent module. New checks can be added without restructuring.

**Weaknesses:**
- **Quality heuristics are imperfect.** A puzzle that's technically solvable but deeply unfun passes structural validation. A scenario that requires a hyper-specific config archetype passes but feels unfair.
- **Text filtering false positives.** Filipino cultural content is rich with words that contain substrings matching English profanity lists. Aggressive filtering will block legitimate cultural content; permissive filtering will miss creative abuse.
- **No social context.** The system can't detect harassment-via-valid-content: a player who repeatedly publishes configs named after a specific player they're targeting, or a necropsy annotation that's technically factual but socially cruel ("this config is what Bronze players think Diamond looks like").
- **Evolution Chain poisoning.** The hardest structural validation case. A chain link can be technically valid but designed to make the chain converge toward a degenerate strategy, only visible 3-4 links later.

**Sensory description:**
The publish progress bar has a satisfying mechanical quality — each segment clicks into place with a soft metallic *tick* like a circuit breaker engaging (hence the name). When all three light cyan, a brief flourish: the bar transforms into a pulsing connection line that animates off the right edge of the screen, symbolizing the content entering the network. The *tick-tick-tick-whoosh* sequence becomes Pavlovian — players learn to anticipate the third tick.

When validation fails, the third segment doesn't tick — it buzzes with a low-frequency hum and the segment border pulses amber. The rejection panel descends with a soft *thud* like a drawer opening. The Inspector-style diagnostic text appears character-by-character over 300ms, as if the system is analyzing the problem in real time.

---

### Model B: "The Trust Circuit" (Progressive Trust Levels)

**How it works:** Every player has a Trust Level (TL) from 0-5 that determines what community actions they can perform. Trust is earned through participation quality, not just quantity. Higher trust unlocks more powerful — and more potentially abusive — community features.

**Trust Level progression:**

| TL | Name | Earned By | Unlocks |
|----|------|-----------|---------|
| 0 | **Spark** | New account (default) | Browse community content. Import Config Codes. Attempt Puzzle Boxes and Gauntlet Seeds. |
| 1 | **Conductor** | Complete Mission 3 + import 5 community configs + 10 hours playtime | Publish Config Codes. Rate community content (thumbs up/down). Report content. |
| 2 | **Architect** | Complete Mission 7 + publish 3 configs with ≥10 imports each + 0 upheld reports against you | Publish Puzzle Boxes and Gauntlet Seeds. Add Evolution Chain links. Write necropsy annotations. Create channel name presets. |
| 3 | **Engineer** | Complete campaign + 20 published items with average rating ≥3.5/5 + community upvote ratio ≥2:1 | Create Evolution Chains (as chain owner). Create Bounties. Pin featured content on profile. Nominate content for curation. |
| 4 | **Fabricator** | TL3 for 30+ days + 50 published items + 5 items featured by curators + 0 upheld reports in 60 days | Curate content (feature/unfeature from public feeds). Flag content for expedited review. Edit community wiki entries. Moderate Evolution Chain disputes. |
| 5 | **Overseer** | Invitation-only from developer team | All moderation powers. Ban/restrict users. Adjudicate appeals. Access moderation dashboard. Set seasonal moderation policies. |

**Trust decay mechanics:**
- Upheld report = −1 TL (but never below TL1 if campaign is complete).
- 90 days of inactivity = −1 TL (frozen, not lost; activity restores immediately).
- Publishing content that fails quality validation 3 times in 24 hours = temporary TL reduction (cooling-off period, 24 hours).
- Trust is a **ratchet with friction** — easy to lose, slow to regain. Regaining a lost TL requires meeting the original earn criteria again PLUS a 30-day clean record.

**What the Trust Level looks like in the UI:**
The player's profile card (visible in the workbench sidebar and on published content) shows a small circuit-board badge with 0-5 illuminated nodes. TL0 is a single dim node. Each level adds a lit node, with the highest forming a horizontal chain that glows the player's chosen accent color. The badge is small — 24×24px — but distinctive enough to be read at a glance on published content cards.

Hovering the badge shows a tooltip: "Trust Level 3 — Engineer. Earned: 2026-03-15. Can create Evolution Chains and Bounties." The tooltip also shows a progress bar toward TL4: "Next level: 14/50 published items, 2/5 featured."

**The Trust Level ceremony:**
When a player crosses a trust threshold, a boot-log-style message appears on their next session start:

```
> COMMUNITY SUBSYSTEM: trust circuit updated
> behavioral analysis: POSITIVE
> new clearance: ARCHITECT (TL2)
> unlocked: puzzle authoring, chain participation, necropsy annotation
> "Your architectures are trusted. Build for others."
```

The message types character-by-character with the boot-log sound effect. The new TL badge illuminates with a brief cyan flash. The unlocked features are listed as bullet points that the player can click to immediately try.

**Strengths:**
- **Feature gating prevents drive-by abuse.** A new account can't publish a Puzzle Box with offensive content or create a bounty they can't fulfill. They must earn the right through legitimate play.
- **Campaign completion as trust baseline.** Completing Mission 7 (TL2 requirement) means the player understands the game's systems well enough to create meaningful content. This is a natural quality floor.
- **Social proof loop.** Publishing content that gets imported/upvoted raises trust, which unlocks more publishing capabilities, which creates more opportunities for social proof. Virtuous cycle.
- **Comparable precedent works.** Dota 2's Behavior Score (0-10,000 scale) directly affects matchmaking quality. Overwatch 2's Endorsement system gates features (Level 2+ for match chat). League of Legends' Honor system (5 levels) gates seasonal rewards. All three have measurably reduced toxic behavior.

**Weaknesses:**
- **Smurf accounts.** A banned TL4 player creates a new account, speedruns to TL2, and resumes moderate-level abuse. Mitigation: device fingerprinting, but privacy-hostile and bypassable.
- **Trust farming.** Publishing 50 items of mediocre-but-harmless content to reach TL4, then using curation powers to promote a friend's content or demote a rival's. Mitigation: quality-weighted trust scoring (a featured item counts 5× a merely published one).
- **Cold start problem.** New players see community content but can't participate until Mission 3 (potentially 2+ hours of play). This could feel exclusionary. Mitigation: TL0 can still import and rate locally (ratings don't publish until TL1).
- **Elitism risk.** High-TL players developing a caste mentality. "TL2s shouldn't be allowed to add Evolution Chain links." Mitigation: TL is never displayed prominently in competitive contexts; Gauntlet rating is the competitive metric.

---

### Model C: "The Necropsy Norm" (Community Self-Moderation Culture)

**How it works:** Instead of top-down moderation infrastructure, the game designs social norms and tools that make the community self-regulating. The core mechanism: **every piece of shared content has a public discussion thread**, and the discussion thread's culture is shaped by structural affordances that make constructive engagement easier than destructive engagement.

**The discussion thread design:**
Every published config, puzzle, challenge, and necropsy has a discussion tab. The tab shows comments in a threaded format, but with two key structural constraints:

1. **Every comment must be categorized.** A dropdown selector at the top of the comment field offers: "Question" (cyan), "Suggestion" (amber), "Bug Report" (red), "Appreciation" (green), "Fork" (purple — links to a derived config). Free-form "general" comments are allowed but displayed in grey at lower visual priority. The category system isn't moderation — it's communication architecture. It makes the discussion thread scannable and categorized without requiring anyone to moderate.

2. **Comments can include inline config diffs.** Instead of typing "I'd change your relay's hook," the commenter can click "Suggest Edit" which opens a mini-workbench where they modify the author's config. The modification is displayed as an inline diff (amber highlights, strikethrough for removals) embedded in the comment. The author can one-click-apply the suggestion. This turns destructive criticism ("your config sucks") into constructive contribution ("here's a specific improvement").

3. **The "Fork" action.** Any comment can include a fork — a complete derivative config based on the original. Forks are displayed prominently with a branching tree icon. The original author sees their "fork tree" — a visualization of all configs derived from theirs. This turns "your config sucks, here's mine" into "your config inspired this, here's my variation" — same information, different social frame.

**What the discussion thread looks like:**
Below the config's main display (workbench view of the shared architecture), a horizontal tab bar reads: DETAILS | DISCUSSION | FORKS | STATS. The Discussion tab shows a vertical stream of categorized comments. Each comment is a card with a colored left border (matching its category), the commenter's avatar + TL badge, and the comment body. "Suggestion" comments have an additional panel below the text showing an inline config diff with an "Apply" button. "Fork" comments show a thumbnail of the forked config with an "Open" button.

The stream is sorted by category tabs: ALL | QUESTIONS (cyan) | SUGGESTIONS (amber) | FORKS (purple) | APPRECIATION (green). Bug Reports and general comments appear in ALL but don't get their own tab — this structural choice makes questions and suggestions more visible than complaints.

**The "Community Standard" for Config Necropsies:**
Because necropsies (7.10) are the highest-value community content, they get additional self-moderation tools:
- **Inline fact-checking.** Any factual claim in a necropsy annotation ("this config loses to scout rush 80% of the time") can be challenged by any viewer who clicks a "Verify" button. The game then runs the claimed scenario 10 times and displays the actual win rate. Public, automated, non-confrontational.
- **Annotation quality scores.** Community members rate individual annotations within a necropsy (not the whole necropsy) on a "Helpful / Not helpful" binary. Annotations with >70% "Not helpful" ratings collapse to a single line with a "Show anyway" toggle.
- **The "Better Explanation" button.** Instead of commenting "your explanation is wrong," a reader can write a replacement annotation that appears alongside the original. The community votes on which explanation is more helpful. This is Wikipedia's "edit, don't argue" norm transplanted to game content.

**Strengths:**
- **Scales with the community.** Self-moderation works when the community is 100 people or 100,000 people. No moderation staff bottleneck.
- **Constructive by design.** The structural affordances (categorized comments, inline diffs, forks) make it physically easier to be constructive than destructive. It's faster to suggest an edit than to type an insult.
- **Culture-building.** The fork tree, fact-checking, and "Better Explanation" patterns establish norms that new players absorb. The first thing a new player sees in a discussion thread is categorized helpful feedback, not a flame war.
- **Comparable precedent:** Opus Magnum's histogram creates a "show, don't tell" culture. GitHub's pull request review culture makes suggestions concrete. Wikipedia's "edit, don't argue" norm has sustained a global encyclopedia.

**Weaknesses:**
- **Bad actors can still abuse categorized comments.** A "Suggestion" that reads "Suggestion: delete your account" technically uses the category system. Requires fallback to reporting.
- **Fork-spam.** A player publishes 50 trivially-different forks of a popular config to flood the fork tree. Requires rate limiting.
- **Community consensus failure.** When the community itself develops toxic norms ("git gud" as standard response to questions), self-moderation amplifies the problem. Requires TL4+ curator intervention.
- **Doesn't prevent the first offense.** Self-moderation is reactive. The offensive content exists in the thread until someone acts on it.

**Sensory description:**
The discussion thread has a warm, workshop quality — like a collaborative workbench rather than a comment section. Categorized comments have rounded card borders with subtle circuit-trace decorations in the category color. The inline config diff uses the game's established visual language: amber for changes, red for removals, green for additions, with the same scan-line materialization animation as the boot log. Suggestion diffs shimmer slightly, inviting the author to click "Apply." Fork thumbnails are rendered as miniaturized workbench views — you can see the topology at a glance.

The "Verify" button on necropsy claims has a small beaker icon. When clicked, a loading animation shows 10 tiny battle simulations running in parallel (10 tiny 8×8 boards, each progressing through ticks at 10× speed). Results appear as a simple bar chart: "Actual win rate: 73% (7/10 runs)." The bar is green if it matches the author's claim (±10%), amber if it diverges. No judgment language — just data.

---

### Model D: "The Emission Scanner" (Behavioral Pattern Detection)

**How it works:** Beyond filtering individual content items, the system monitors patterns of player behavior over time to detect coordinated abuse, harassment campaigns, and quality degradation before they become visible to the community. Named after the game's EM emission mechanic — just as units emit detectable signals, abusive players emit detectable behavioral patterns.

**Behavioral patterns monitored:**

| Pattern | Detection Signal | Response |
|---------|-----------------|----------|
| **Grief targeting** | Player A reports or downvotes >50% of Player B's content | Suppress A's votes on B's content; flag for review |
| **Vote ring** | 5+ accounts consistently upvote each other's content and downvote competitors | Reduce vote weight for all ring members to 0.1× |
| **Content flooding** | >10 publications in 24 hours with <5 imports each | Publish rate limit: 3/day at TL1-2, 5/day at TL3+, unlimited at TL4+ |
| **Evolution Chain poisoning** | A player's chain links have >60% "skip this link" rate from solvers | Flagged chain links auto-collapsed with "Community-flagged: expand?" label |
| **Necropsy harassment** | Comments with >3 reports from different users on the same thread | Thread auto-locked for 24 hours; TL4+ can unlock |
| **Name cycling** | Changing display name >3 times in 7 days (evading name-based blocks) | Name changes locked to 1 per 30 days after first detection |
| **Smurf detection** | New account with gameplay patterns (APM, config complexity, win rate) matching a restricted account | Flag for TL5 review; no automated action (false positive risk too high) |

**What the moderation dashboard looks like (TL4+):**
A dedicated panel accessible from the community hub sidebar (gear icon with a shield overlay). The dashboard shows:
- **Flagged content queue:** A list of content items flagged by automation or user reports. Each item shows: the content thumbnail, the flag reason, the number of reports, the reporter TL average, and two action buttons: DISMISS (grey, removes flag) and RESTRICT (amber, hides content pending TL5 review).
- **Behavioral alerts:** A stream of detected patterns with confidence scores. "Vote ring detected: 73% confidence. Members: [5 avatars]. Evidence: mutual upvote rate 94% vs. baseline 12%." Alerts below 60% confidence are collapsed.
- **Community health metrics:** Three gauges: Publication Rate (how many items published per day, with historical trend), Quality Score (average rating of recent publications), and Report Rate (reports per 1000 active users). Green/amber/red zones.

The dashboard's visual style mirrors the Inspector — analytical, data-forward, no emotional coloring. It uses the same sparkline charts, the same amber/cyan/red color language, the same monospace detail text. The message: moderation is diagnosis, not punishment.

**Strengths:**
- **Catches coordinated abuse.** Individual vote manipulation is invisible; patterns across accounts are detectable. Vote rings, targeted harassment campaigns, and smurf accounts all generate distinctive behavioral signatures.
- **Proportional response.** The system reduces the impact of bad actors (suppressed votes, rate limits, collapsed links) rather than banning them outright. This minimizes false positive damage.
- **Inspector-native framing.** Presenting moderation as "behavioral pattern detection" aligns with the game's core vocabulary. Players who understand the Inspector understand behavioral monitoring. The transition from "debugging your agents" to "debugging community behavior" is conceptually smooth.

**Weaknesses:**
- **Requires backend infrastructure.** Behavioral pattern detection needs persistent cross-session data and server-side computation. This conflicts with the "no backend" locked tech stack for initial launch. Mitigation: this model is a Phase 2 addition when community features need backend services.
- **False positives at community edges.** A small group of friends who consistently play together and share configs will look like a vote ring. A passionate player who publishes 15 configs in a creative burst will look like a content flooder. Mitigation: all automated actions are reversible by TL4+ curators.
- **Surveillance discomfort.** Players who learn their behavior is monitored may feel surveilled. Mitigation: full transparency about what's monitored (published in a "Community Health" section of the Blueprint Codex) and all behavioral data is aggregate, never individual-level visible to other players.

---

### Model E: "The Breaker Panel" (Moderation-as-Game-Mechanic)

**How it works:** Instead of hiding moderation behind admin tools, the game surfaces moderation actions as visible community events that players can observe, learn from, and participate in. When content is restricted, the restriction is visible — not as punishment theater, but as diagnostic information. The metaphor: the game's circuit breaker trips when something goes wrong, and the trip is an observable event.

**Visible moderation events:**
- **Content restriction:** When a published item is restricted (by automation or curator), it doesn't disappear. Instead, its card in community feeds gains a distinctive visual treatment: a diagonal amber stripe across the thumbnail, like hazard tape. The card is still visible but de-prioritized in sort order. Clicking it shows the restriction reason in the same diagnostic format as the Inspector: "RESTRICTED: Text content flagged by automated filter. Reason: Channel name 'offensive-term' violates community guidelines. [Appeal]"
- **Trust Level changes:** When a player's TL drops due to an upheld report, their profile badge dims one node with a brief amber flash. This is visible to anyone who views their profile. No announcement — just a quiet state change.
- **Evolution Chain circuit breakers:** When a chain link is flagged, the chain visualization (a linear sequence of linked nodes) shows the flagged link as a dimmed node with a bypass arrow around it. Solvers can still attempt the chain but automatically skip the flagged link.
- **Bounty cancellation:** When a bounty is cancelled by its creator or by moderation, the bounty card shows a "CIRCUIT BROKEN" stamp with the cancellation reason. Completed attempts before cancellation still receive any earned rewards.

**What a restriction event looks like:**
A published Puzzle Box receives 3 reports for offensive channel naming. The automated filter validates the reports (the channel name matches the blocklist). The Puzzle Box card in community feeds smoothly transitions: the thumbnail desaturates over 500ms, the amber hazard stripe appears with a diagonal wipe animation, and the card slides down in the feed order. There is no notification to other players — the change is visible only to those browsing the feed. The author receives a boot-log-style notification:

```
> COMMUNITY SUBSYSTEM: content circuit breaker tripped
> item: "The Relay Maze" (Puzzle Box)
> reason: channel name violates community guidelines
> action: RESTRICTED (visible but de-prioritized)
> resolution: rename channel → restriction lifts automatically
> [Edit Config] [Appeal] [Acknowledge]
```

The tone is mechanical, not moral. "Circuit breaker tripped" frames moderation as a systems event, not a judgment. The resolution is actionable — rename the channel, restriction lifts. The system doesn't assume malice; it assumes a configuration error.

**Strengths:**
- **Transparency builds trust.** Players can see that moderation happens, that it's proportional, and that it has clear reasoning. Hidden moderation breeds conspiracy theories ("my content was shadow-banned"). Visible moderation builds legitimacy.
- **Diagnostic framing reduces shame.** "Your circuit breaker tripped because of a channel name" feels like a build error, not a character indictment. Players are more likely to fix and less likely to rage-quit.
- **Teaching function.** Seeing restricted content in feeds (with reasons visible) teaches other players what the community norms are. New players learn the boundaries without reading a rulebook.
- **Consistent with game vocabulary.** The circuit breaker metaphor is native to the game's electrical/networking theme. Moderation doesn't feel bolted on; it feels like part of the world.

**Weaknesses:**
- **Visibility of restriction can be stigmatizing.** Even with diagnostic framing, having your content visibly restricted is publicly embarrassing. Some players may prefer invisible moderation.
- **Bad faith actors can weaponize visibility.** "I got restricted for saying X, this is censorship" — visible moderation provides ammunition for grievance narratives. Mitigation: restriction reasons are specific and factual, not vague.
- **Hazard tape fatigue.** If too many items in a feed are restricted, the community feels unhealthy. Mitigation: restricted items are only visible in "All" feed; curated/trending feeds never show restricted content.

---

### Model F: "The Relay Network" (Distributed Community Moderation)

**How it works:** Moderation responsibility is distributed across the community using the game's own relay/channel metaphor. Instead of a single moderation queue, reports flow through "moderation channels" where different players with different expertise review different types of content. A text-content report goes to the "Naming Standards" channel. A Puzzle Box quality report goes to the "Puzzle Design" channel. A harassment report goes to the "Community Safety" channel. Each channel has its own pool of qualified reviewers.

**Moderation channel structure:**

| Channel | Qualification | Reviews | Response Time Target |
|---------|--------------|---------|---------------------|
| **Naming Standards** | TL2+ | Offensive text in any player-authored string | <4 hours |
| **Puzzle Design** | TL3+ with 10+ published puzzles | Puzzle quality: unsolvable, trivially easy, misleading | <24 hours |
| **Scenario Balance** | TL3+ with Gauntlet rank ≥ Gold | Gauntlet seed/scenario fairness and quality | <24 hours |
| **Chain Integrity** | TL3+ with 5+ completed Evolution Chains | Evolution Chain link quality and poisoning | <12 hours |
| **Community Safety** | TL4+ (curators) only | Harassment, targeted abuse, coordinated griefing | <2 hours |
| **Appeals** | TL5 (Overseers) only | All appeal types | <48 hours |

**What the review queue looks like:**
A player qualified for "Naming Standards" review sees a tab in their community hub: "Review Queue (3)" with a small badge count. The tab opens a card-based queue where each card shows:
- The reported content with the specific text highlighted in amber
- The reporter's comment (categorized: offensive / misleading / spam / other)
- Three action buttons: **APPROVE** (content is fine, dismiss report), **RESTRICT** (content violates guidelines, apply restriction), **ESCALATE** (uncertain, forward to Community Safety)

Two reviewers must agree for an action to take effect (jury model). If two reviewers disagree, the item automatically escalates to the next-higher channel.

**What the reviewer incentive looks like:**
Reviewing content earns "moderation XP" displayed as a separate track from competitive rating. Moderation XP unlocks:
- 50 XP: "Community Relay" title (visible on profile)
- 200 XP: Exclusive profile frame (circuit-board border with a shield motif)
- 500 XP: Early access to new community features (beta test new challenge types)
- Agreement rate visible on profile: "Review accuracy: 94% (agrees with final outcome)"

Agreement rate is calculated by comparing the reviewer's decision to the eventual outcome (including escalation decisions). High agreement rate = trusted reviewer. Low agreement rate = reviews deprioritized in queue assignment.

**Strengths:**
- **Expertise-matched review.** A competitive Gauntlet player reviews scenario balance. A prolific puzzle creator reviews puzzle quality. Reviews are higher quality because reviewers understand the domain.
- **Scalable.** As the community grows, the reviewer pool grows with it. No fixed moderation team bottleneck.
- **Community ownership.** Players who moderate feel invested in community health. The "Community Relay" title and agreement rate create social capital around moderation.
- **Comparable precedent:** Riot's retired Tribunal (community jury) processed 105 million votes and reformed 280,000 players. The jury model works when reviewers are motivated and qualified. Wikipedia's nested moderation tiers (editor → admin → bureaucrat → steward) have sustained a global project.

**Weaknesses:**
- **Cold start problem.** At launch, there aren't enough TL3+ players to staff moderation channels. Requires developer-staffed moderation for the first 3-6 months.
- **Review fatigue.** Volunteer moderation is a burnout machine. Even with XP incentives, most players review for 2-3 weeks then stop. Requires constant recruitment of new reviewers.
- **The Juror Problem.** Some reviewers consistently vote to restrict because they enjoy the power. Agreement rate partially catches this, but a bloc of restrictive reviewers can shift the calibration baseline.
- **Latency.** Community review takes hours; automated systems take seconds. Reports about offensive names sit visible for hours until reviewers act.

---

## The Recommended Hybrid: "The Three-Layer Grid"

No single model handles all abuse surfaces. The recommendation is a layered system that combines the strengths of multiple models:

**Layer 1: Automated Validation (Model A)** — All content passes through structural validation, quality heuristics, and text filtering before publication. This is the first line of defense. Zero latency. Catches 80% of low-effort abuse and 100% of structural invalidity.

**Layer 2: Trust-Gated Access (Model B) + Cultural Norms (Model C)** — Trust levels gate what players can publish. Discussion thread structure and fork culture make constructive engagement the path of least resistance. This prevents most intentional abuse and shapes community behavior over time.

**Layer 3: Behavioral Detection (Model D) + Distributed Review (Model F) + Visible Moderation (Model E)** — Pattern detection catches coordinated abuse. Distributed review handles edge cases automation misses. Visible moderation events maintain transparency and build norm awareness.

**Implementation phasing:**

| Phase | Content | Infrastructure |
|-------|---------|----------------|
| **Phase 1 (Launch)** | Config Code sharing only | Client-side structural validation + static text filter + TL0-1 only |
| **Phase 2 (Month 2)** | Puzzle Boxes, Gauntlet Seeds | Lightweight backend for text filtering API + TL0-3 |
| **Phase 3 (Month 4)** | Evolution Chains, Necropsies | Behavioral pattern detection + discussion threads + TL0-4 |
| **Phase 4 (Month 6)** | Bounties, full community features | Distributed moderation channels + full TL0-5 |

---

## Player Journeys

### Journey: Rosa, 62, Retired Electrical Engineer, Cebu

**Context:** Rosa completed the campaign two months ago and has been publishing relay-focused configs to the community. She recently achieved TL3 (Engineer) and is excited to create her first Puzzle Box. She's also noticed some rude comments on her configs and wants to understand how moderation works.

**Minute 0:00 — Creating a Puzzle Box**
Rosa opens the community hub and clicks "Create Puzzle Box." The familiar workbench loads, but with the constraint toolbar at the top. She loads her Palawan relay-chain config — the one that won her Diamond in Gauntlet. She deliberately disconnects RELAY-C's hook from the `threat-compress` channel, sets the modification budget to "1 change," and hits PUBLISH.

The progress bar appears: STRUCTURE *tick* → QUALITY *tick* → CONTENT *tick* → *whoosh*. Her Puzzle Box is live. The publish ceremony feels crisp. A small circuit-board card appears in the "Your Publications" panel with a green "Published" badge.

**Minute 1:30 — Receiving a Suggestion**
An hour later, Rosa sees a notification badge on her community hub. She opens it: a "Suggestion" comment (amber border) from a TL2 player named Kwame. The comment reads: "Great puzzle! But I solved it by changing RELAY-B's eviction priority instead of reconnecting RELAY-C. Is that the intended solution?"

Below the text, an inline config diff shows Kwame's modification: RELAY-B's eviction priority changed from "oldest first" to "lowest priority first." Rosa clicks "Preview" and watches a 5-tick mini-simulation of Kwame's solution. It works — but for a different reason than her intended fix. She replies categorized as "Appreciation": "Clever! Not my intended fix but a valid alternative. I'll add a hint for players who want the intended path."

**Minute 3:00 — Encountering Moderation**
Rosa scrolls to an older config she published. Someone left a general comment (grey border, low priority) that reads "this is what happens when retired people try to play competitive games." The comment already has a small flag icon with a red "1" badge — another player reported it. Rosa clicks "Report" and categorizes it as "Harassment." A confirmation toast appears: "Report submitted. Thank you. This content will be reviewed by the Community Safety channel."

Two hours later, Rosa checks back. The comment now has the amber hazard stripe. A small system note below it reads: "This comment was restricted following community review. Reason: targeted personal attack." The commenter's display name shows they dropped from TL2 to TL1. Rosa nods — diagnostic, proportional, resolved.

**Minute 5:00 — Reviewing Content**
Rosa notices a new tab in her community hub: "Review Queue (2)." She qualified for the "Puzzle Design" moderation channel when she hit TL3. She clicks it. Two cards appear:

Card 1: A Puzzle Box reported as "unsolvable." Rosa clicks it, opens the mini-workbench, and spends 3 minutes testing solutions. She finds a valid solution the reporter missed. She clicks APPROVE with the note: "Solvable — requires changing SCOUT-A's patrol rule AND RELAY-B's listen channel (2 changes)."

Card 2: A Puzzle Box with modification budget "unlimited" and only one unit on the board. The "puzzle" is trivially easy — just enable one hook. Rosa clicks RESTRICT with the note: "Trivially solvable — budget should be constrained for meaningful challenge." The card gains the amber stripe in the public feed.

Rosa's moderation XP ticks up from 35 to 45. Her profile shows "Review accuracy: 91%." She feels a quiet pride — maintaining the community is part of the game.

**UI Annotations:**
- **Review Queue tab:** Appears in community hub sidebar after qualifying for any moderation channel. Badge count shows pending items.
- **Inline config diff:** Same visual language as Inspector's decision trace — amber highlights, strikethrough, side-by-side comparison.
- **Report button:** Small flag icon on every comment, no confirmation dialog, one-click + category selection.
- **Restriction visibility:** Desaturated thumbnail + amber diagonal stripe, public but de-prioritized in feeds.

---

### Journey: Kai, 19, CS Student, Manila

**Context:** Kai is a competitive Gauntlet player at Diamond tier who publishes config necropsies regularly. He's TL3 and aspires to TL4. Today he encounters a vote ring that's been boosting mediocre configs to the trending feed.

**Minute 0:00 — Noticing the Problem**
Kai opens the trending configs feed. Three of the top 5 configs are from accounts he doesn't recognize — all created within the past week, all with suspiciously high ratings (4.8/5) and very few imports. He clicks into the first one. The config is technically valid but uninteresting — a basic relay chain with no innovations. The discussion thread has 12 "Appreciation" comments, all one-line ("great config!", "love it!", "awesome work!"), all from accounts with TL0-1.

Kai's instinct says vote ring. He can't prove it, but the behavioral pattern is obvious to anyone who's spent time in the community.

**Minute 1:00 — Reporting**
Kai clicks the flag icon on each of the three suspicious configs and selects "Suspected coordinated manipulation" from the report categories. A confirmation toast: "Report submitted. Behavioral patterns are analyzed by the Emission Scanner. You'll be notified of outcomes."

**Minute 2:00 — The System Responds**
The next day, Kai sees a notification. The Emission Scanner detected the vote ring independently — 7 accounts with 96% mutual upvote rate against a community baseline of 11%. All 7 accounts had their vote weights reduced to 0.1×. The three configs dropped off the trending feed as their inflated ratings deflated. The configs themselves weren't restricted (they're valid content) but their rankings now reflect genuine community interest.

Kai's notification reads:

```
> EMISSION SCANNER: coordinated pattern detected
> confidence: 94%
> action: vote weight reduction applied to 7 accounts
> your report: contributed to detection (3 of 5 reports)
> moderation XP: +15
```

The boot-log style notification feels satisfying — the system worked, his instinct was validated, and his contribution is acknowledged.

**Minute 3:00 — Teaching Moment**
Kai opens one of the deflated configs. Its rating dropped from 4.8 to 2.3 as the ring votes were de-weighted. He notices a new system-generated comment at the top of the discussion thread (blue border, "System" category): "This item's rating was adjusted following detection of coordinated vote manipulation. The content itself was not restricted." The note is factual, not accusatory. Players browsing the thread understand what happened without the system naming or shaming the ring participants.

**UI Annotations:**
- **Emission Scanner notification:** Boot-log style, confidence percentage, specific action taken, contributor acknowledgment.
- **Vote weight indicator:** Never shown publicly. Players don't know their vote weight has been reduced — they just see their votes stop influencing rankings.
- **System comment:** Blue left border, "System" author label, appears at top of discussion thread, undismissable.

---

### Journey: Tala, 17, Student, Batangas

**Context:** Tala is new to Robot Uprising, just completed Mission 5, and has TL1. She's excited to share her first config but anxious about community reception. She's also encountering the text filter for the first time through her channel naming choices.

**Minute 0:00 — First Publication Attempt**
Tala finishes a config she's proud of — a relay chain that uses a channel she named `putangina-net` (a Filipino expression she uses casually with friends). She hits PUBLISH. The progress bar starts: STRUCTURE *tick* → QUALITY *tick* → CONTENT — the third segment buzzes amber.

A rejection panel slides down:

```
⚠ CONTENT CHECK: Channel name flagged
Channel "putangina-net" contains language that may be
inappropriate in community content.
[Rename Channel] [Appeal] [Cancel]
```

Tala is surprised — she didn't think of the name as offensive (it's casual Filipino slang among friends). She clicks [Appeal], which opens a short form: "Why do you think this name should be allowed?" She writes: "It's a common Filipino expression, not meant offensively." The appeal enters the Naming Standards review queue.

**Minute 1:00 — Navigating the Filter**
While waiting for the appeal, Tala renames the channel to `recon-net` and republishes. The progress bar completes: *tick-tick-tick-whoosh*. Her first config is live. She feels a small thrill — her architecture is out there for others to try.

**Minute 2:30 — Appeal Resolution**
The next day, Tala gets a notification. Her appeal was reviewed by two Naming Standards reviewers. The decision: "UPHELD — this term is context-dependent and can be used offensively in community content. Recommended alternative channel names that preserve the cultural reference: `kabayan-net`, `kababayan-relay`."

Tala appreciates that the resolution acknowledges the cultural context rather than just saying "bad word." The suggested alternatives preserve the Filipino identity she wanted. She notes this for future naming.

**Minute 3:30 — Community Welcome**
Tala's published config gets its first import notification. Then a "Question" comment from a TL2 player: "Interesting relay placement! Why did you put RELAY-B in the corner instead of center?" The question is genuine. Tala replies with an explanation of her terrain-based positioning strategy. The exchange feels warm.

A week later, Tala has 3 published configs, 15 total imports, and a growing confidence in community participation. She's at TL1 — halfway to TL2. The trust progression feels earned, not arbitrary.

**UI Annotations:**
- **Text filter rejection:** Same diagnostic format as build errors. Amber, specific, actionable. "Rename" button opens the workbench with the flagged channel pre-selected.
- **Appeal form:** Simple text field + category (cultural/context-dependent/game-term/false-positive). 200-character limit. Enters Naming Standards queue.
- **Appeal resolution:** Boot-log notification with specific reasoning and constructive alternatives. No punitive language.
- **Import notification:** Small toast in corner: "Your config 'Palawan Chain v1' was imported by 3 players." Satisfying but not interrupting.

---

### Journey: DeepAgent_TTV, 28, Streamer, Singapore

**Context:** DeepAgent is a TL4 Fabricator who streams Robot Uprising to 500 concurrent viewers. He's also a content curator, responsible for featuring high-quality community content on the trending feed. Today he's dealing with a complex moderation situation: a popular Evolution Chain that's been subtly poisoned.

**Minute 0:00 — The Poisoned Chain**
DeepAgent opens his moderation dashboard during a stream. A behavioral alert has flagged an Evolution Chain: "Chain #847: 'The Silent Relay Challenge.' Alert: Link #5 (of 7) has 73% skip rate. Chain completion rate dropped from 45% to 8% after link #5 was added."

He opens the chain visualization. Links 1-4 flow smoothly — each adds a constraint that teaches a specific relay technique. Link #5, added by a player named "xX_chaos_Xx," changes the scenario from "open terrain" to "all units start with 4/6 buffer slots filled with noise." This makes the accumulated constraints from links 1-4 nearly impossible — the noise fill removes the buffer headroom that previous strategies depended on.

**Minute 2:00 — Diagnosis on Stream**
DeepAgent pulls up Link #5 in the Inspector-style chain analysis tool. He runs the chain endpoint (all 7 constraints simultaneously) against 10 automated solver attempts: 0/10 pass. He removes Link #5 and re-runs: 7/10 pass. "Chat, this is classic chain poisoning," he narrates. "Link 5 isn't just hard — it makes everything before it irrelevant. The noise fill means your relay strategy from links 1-4 doesn't matter anymore."

Chat responds: "PogChamp the chain detective" / "report that" / "maybe it's just really hard?"

**Minute 3:00 — Taking Action**
DeepAgent clicks RESTRICT on Link #5 with the note: "Chain poisoning — this link invalidates the teaching progression of links 1-4. Noise pre-fill makes accumulated relay strategies irrelevant, converting a skill-building chain into a buffer-clearing puzzle unrelated to the chain's theme." He adds a curator tag: "Chain integrity violation."

The chain visualization updates: Link #5 dims and a bypass arrow routes around it. Links 6-7 (which were added after Link #5 and compensate for the noise fill) are automatically flagged for chain integrity review — they may need modification now that Link #5 is bypassed.

**Minute 4:00 — Explaining to Chat**
"This is why chain moderation matters," DeepAgent tells chat. "Evolution Chains are supposed to be progressive skill builders. If anyone can add a link that nukes the whole progression, chains become a griefing vector instead of a teaching tool. The bypass system means the chain survives — we just route around the bad link."

Chat: "circuit breaker goes brrr" / "protect the chains" / "can we see xX_chaos_Xx's profile?"

DeepAgent checks: xX_chaos_Xx is TL2, has 3 upheld content restrictions in 30 days. "Three strikes in a month," DeepAgent notes. "The system will likely reduce their trust level at the next automated review. I don't need to do that manually — the Emission Scanner handles patterns."

**UI Annotations:**
- **Chain visualization:** Linear node sequence. Bypassed nodes are dimmed with dotted border and a curved arrow routing around them. Active nodes glow cyan.
- **Chain integrity analysis:** Inspector-style 10-run automated test with pass/fail bar chart. Remove-and-retest button for any individual link.
- **Curator restriction note:** Requires specific reasoning (freeform text) + tag from a curated list (chain integrity, quality, naming, harassment, spam).
- **Cascading review flag:** When a link is bypassed, downstream links that reference the bypassed link's constraints auto-flag for review.

---

## Interaction Effects

**× Config Code sharing (7.03a):** Text filtering applies to all strings embedded in Config Codes — channel names, rule labels, hook descriptions. A Config Code with offensive channel names is blocked at the structural validation layer before it can be imported. Config Code diff visualization (7.03a-ii) inherits the moderation state of its source configs.

**× Config Necropsies (7.10):** Necropsies are the highest-stakes moderation surface because they contain extended player-authored commentary. The "Better Explanation" mechanic and inline fact-checking are necropsy-specific self-moderation tools. Necropsy annotations with upheld restrictions appear with amber strikethrough + replacement text from the "Better Explanation" contributor.

**× Gauntlet competitive play (5.09):** Trust levels interact with competitive integrity. A player with TL0 (restricted) cannot publish Gauntlet replays or share competitive configs — preventing restricted players from maintaining competitive social presence as a reward. Gauntlet rank is unaffected by trust level — you can be a Diamond player with TL1 (your skill is acknowledged even if your community behavior isn't).

**× Channel audio signatures (6.02d):** Channel names are filtered at creation time, not just at publication time. A player can't create a channel with an offensive name even in private (single-player) because channel names persist in Config Codes that might be shared later. This is a proactive design — block at source, not at share-point.

**× Boot log narrative (locked):** Trust level changes are communicated in boot-log style, maintaining diegetic consistency. Moderation notifications feel like system diagnostics, not admin correspondence. "COMMUNITY SUBSYSTEM: content circuit breaker tripped" rather than "Your content has been flagged by moderators."

**× Inspector (locked):** The moderation dashboard for TL4+ curators uses Inspector visual language — sparkline charts, amber/cyan/red colors, monospace detail text, scrubable timelines. The conceptual link: moderation IS inspection. Debugging agent behavior and debugging community behavior use the same analytical tools.

**× Blueprint Codex (locked):** Community guidelines are accessible as Codex entries — cards with portraits and descriptions, just like game mechanics. "Naming Standards" is a Codex card. "Chain Integrity" is a Codex card. Players look up moderation rules the same way they look up "how does compress work?" — in the Codex.

**× Filipino cultural content (locked — Philippine archipelago campaign):** The text filter must be culturally calibrated for Filipino language and expressions. The Penistone Problem is especially acute when place names (Siquijor, Batanes, Ifugao) and cultural terms (bayanihan, kundiman, kulintang) are in the game's DNA. The allowlist for game-specific and cultural terms must be comprehensive from launch. Community reviewers from the Philippines should be actively recruited for the Naming Standards channel.

---

## Comparable Games & Systems

**Riot Games (League of Legends, Valorant):** The GATES system (Game Agnostic Text Evaluation Service) increased disruptive text detection by 15× using ML models deployed May 2023. Riot processes ~3 billion player reports per year across all titles. Only 5% of players are consistently disruptive; 87% of reported players are "net neutral to positive." Key lesson: the problem is smaller than it feels — a small percentage of players generate the majority of abuse. System design should focus on that 5%, not burden the 95%.

**Dota 2 Behavior Score:** 0-10,000 scale directly affects matchmaking quality. Score below 3,000 disables voice and text chat. Score above 10,000 unlocks coaching. The hidden score creates behavioral incentives without gamification. Key lesson: behavior scoring works best when it's invisible and affects matchmaking, not when it's a visible badge that becomes a status symbol.

**Overwatch 2 Endorsement System:** 5 levels with decay. Level 2+ required for match chat. Level 3+ for public custom games. Endorsement level decays slightly after every match, requiring sustained positive behavior. Key lesson: decay prevents "earn and abandon" — players can't reach a high trust level and then behave badly.

**Steam Workshop:** Developer/community moderator hierarchy with "Hide as Incompatible" / "Hide as Inappropriate" / "Ban" tiers. Approval queue for spam-targeted workshops. Key lesson: content that's technically valid but "incompatible" (wrong hub, wrong format) needs a separate handling path from content that's "inappropriate" (offensive). Robot Uprising needs both paths.

**Opus Magnum / Zachtronics:** Creator-must-solve-own-puzzle requirement. Community curation through developer-featured "Journal of Alchemical Engineering." Mathematical verifiability of solutions means griefing via shared content is largely impossible. Key lesson: when content is verifiable (configs that either work or don't), the moderation surface shrinks dramatically. Robot Uprising should lean hard into verifiability.

**Roblox:** 111M+ daily active users, text filters processing 750,000 requests per second. Age-based filtering (under-13 most restrictive). Behavioral models detect grooming and harassment from interaction patterns, not just text content. Key lesson: scale matters. Robot Uprising won't need Roblox-scale infrastructure at launch, but designing for scalability from the start prevents painful migrations later.

**Factorio Blueprint Sharing:** Largely unmoderated. Known problems include broken blueprints after game updates, blueprint theft, multiplayer griefing via blueprint deletion, and crash-inducing malformed blueprint strings. Key lesson: no moderation is its own kind of problem. Factorio's community is mature enough to self-moderate via Reddit and Discord, but a new game's community won't have that maturity.

**Wikipedia's "Edit, Don't Argue" Norm:** The most successful large-scale self-moderation system in history. Contributors are encouraged to improve content rather than argue about it. Talk pages exist but editing is prioritized. Nested trust levels (editor → admin → bureaucrat → steward) distribute moderation responsibility. Key lesson: making constructive contribution easier than criticism is the single highest-leverage moderation design decision.

---

## Sensory Description

**The moderation system should feel like the game's own infrastructure.** Every moderation event uses the game's visual and audio vocabulary:

- **Content restrictions** use the amber hazard stripe — the same amber used for modified content in config diffs. The stripe says "changed state," not "bad content."
- **Trust level notifications** use the boot log typewriter — character-by-character reveal with the soft mechanical keystroke sound. Trust changes feel like system updates, not disciplinary actions.
- **The publish progress bar** has three segments that click into place with the same metallic *tick* as the Sealed Watch tick clock. Successful publication's *whoosh* mirrors the EXECUTE button's commitment ceremony.
- **The moderation dashboard** uses Inspector visual language — sparklines, scrubbers, amber/cyan/red, monospace text. Curators are inspectors of community behavior.
- **Report confirmation toasts** are brief (2 seconds), amber-bordered, with a single line of text and a small flag icon. They disappear without requiring dismissal.
- **Behavioral pattern alerts** pulse with a low amber glow, like a warning light on a circuit board. They don't demand immediate attention — they accumulate in the dashboard for review.

The overall feeling: moderation is **maintenance**, not punishment. The game is a machine. The community is a machine. Sometimes circuit breakers trip. You diagnose, you fix, you move on. The vocabulary of moderation is the vocabulary of engineering.

**The TikTok clip:** Split screen. Left: a player publishes a config with an offensive channel name. The progress bar buzzes on the third segment. Rejection panel: "Channel name flagged." Player renames. *Tick-tick-tick-whoosh*. Right: a curator reviews a flagged Evolution Chain link. Inspector-style analysis. Bypass arrow routes around the bad link. Chain continues. Text: "The system protects itself."

---

## What This Analysis Does NOT Cover (Gaps for Future Exploration)

1. **Legal compliance (GDPR, COPPA, regional content laws):** How trust levels and behavioral data interact with privacy regulations. Whether age-gating is required. Whether behavioral data can be stored.
2. **Moderation tooling for developers:** Internal analytics dashboard separate from the in-game curator dashboard. Aggregate metrics, trend detection, policy iteration tools.
3. **Cross-platform moderation consistency:** If a player is restricted on PC, does the restriction carry to mobile? How does cloud sync interact with moderation state?
4. **Moderation during live events/tournaments:** Tournament-specific moderation needs (real-time chat moderation, stream sniping prevention, competitive integrity enforcement).
5. **Internationalization of moderation:** How text filtering works across Filipino, English, Japanese, Korean, and other languages. Whether moderation channels need language-specific review pools.

# 4.100 — The Canary Lexicon: Community Notation for Poisoning Strategies

**Aspect:** 4.100 — Canary-aware community notation: a standardized community shorthand for documenting poisoning strategies in config notes and necropsy artifacts; "canary" as a recognized design vocabulary term (like "lure" in competitive Pokemon); community guides describing specific opponents' canary elements as collective intelligence; the vocabulary emerging organically vs. being in-game defined; interaction with 7.10 config necropsy culture

**Category:** multiplayer/community
**Wave:** 4 (Debrief & Diagnostic UI) / 7 (Community Cross-Cutting)
**Parent:** 4.65 — Pre-ranking adversarial surface; 7.10 — Config necropsy culture
**Siblings:** 4.99 — Fog of canaries architecture; 4.101 — Honest decoy variant; 7.09 — Meta-evolution arms race
**Related:** 4.39 — Adversarial counterfactual mode; 4.58 — Pre-ranking transparency panel; 4.63 — Player-configurable pre-ranking weights; 4.69e — Adversarial multi-cluster poisoning; 8.08 — Real-language vocabulary claim; 5.12c — Community-authored predecessor voices; 2.12 — Deception signals

---

## The Core Concept

Every competitive community invents language. Smogon coined "wallbreaker," "pivot," "hazard control." The fighting game community standardized "frame trap," "meaty," "okizeme." Chess has "fianchetto," "zwischenzug," "prophylaxis." These terms did not appear in the games' official documentation. They emerged from players needing to communicate specific strategic concepts faster than natural language allows. The vocabulary IS the competitive culture. A community that has named a concept has understood it deeply enough to teach it.

Robot Uprising will generate this vocabulary around its unique mechanic: attention architecture design. And the richest, most distinctive vocabulary will emerge around **canaries** — the decoy elements players engineer to poison adversarial pre-ranking analysis (4.65). Canaries are perfect vocabulary generators because they exist at the intersection of three things players love to talk about: deception, diagnostic mastery, and config craftsmanship.

The term "canary" itself is already loaded. In cybersecurity, a canary is a tripwire — a token placed to detect unauthorized access (canary tokens, canary releases, the coal mine canary). In Robot Uprising, the meaning inverts: the canary is not a detector but a *decoy* — an element placed to be detected, drawing attention away from the real vulnerability. This inversion is deliberate and will become a point of community pride. "In security, canaries warn you. In Robot Uprising, canaries lie to you." The semantic drift from real-world usage to game-specific usage is exactly how competitive vocabulary establishes identity.

The question this aspect explores: **what does the community notation system look like when it matures?** What shorthand do players use in necropsy posts, Discord discussions, stream commentary, and config notes? How does this notation spread? And what role (if any) should the game's UI play in acknowledging, supporting, or formalizing the notation?

---

## The Notation System: What Emerges

### Tier 1 — Element-Level Canary Tags

The most basic notation: marking which element in a config is the canary. In necropsy posts (7.10), players adopt a convention for annotating config blueprints. The notation stabilizes around a bird glyph or bracket syntax:

**In text/Discord:**
```
RELAY-B [canary] — 12 rules, high-volatility, fires at pivot window
STRIKER-A — real carry, 3 rules, low-vol, pre-pivot setup
COMMAND-A — routing hub, standard
SCOUT-C [canary-adjacent] — feeds RELAY-B to inflate its activity
```

The `[canary]` tag becomes the community's most basic annotation. A necropsy post without canary tags on a competitive config is considered incomplete — like a Pokemon team report without EV spreads. The `[canary-adjacent]` tag emerges for elements that support the canary's statistical profile without being canaries themselves.

**In stream commentary:**
"Look at ManilaFlash's config — RELAY-B is clearly the canary. Twelve rules, all conditional branches, fires twenty times in the pivot window. The real architecture is STRIKER-A with three rules that never show up in QUICK mode."

### Tier 2 — Canary Classification Vocabulary

As the meta matures, the community distinguishes canary types. This vocabulary maps directly to the engineering methods described in 4.65:

| Community Term | Formal Description | Origin |
|---|---|---|
| **Pivot canary** | Element engineered for high pivot-tick activity | First documented by `@archipelago_kai` in a Season 2 necropsy |
| **Recency bait** | Element with inflated edit history | Named after the strategy of making trivial edits before deployment |
| **Volatility farm** | Element with many conditional branches that cycle states rapidly | From the agricultural metaphor — "farming" volatility stats |
| **Honest canary** | A canary that also serves a genuine strategic purpose (4.101) | The community's highest compliment for canary design |
| **Dead canary** | A canary that has been identified and documented by the community | "Their RELAY-B is a dead canary — everyone knows" |
| **Fog canary** | One element in a fog-of-canaries architecture (4.99) | Plural: "fog canaries" or just "the fog" |
| **Ghost canary** | An element falsely identified as a canary that is actually strategic | The meta-deception: making opponents ignore your real element |

The classification vocabulary enables precise communication. "KaiArchitect is running a pivot canary on RELAY-B with a volatility farm backup on SCOUT-C" conveys an entire adversarial strategy in one sentence. Without the vocabulary, the same information requires a paragraph.

### Tier 3 — Opponent-Specific Canary Profiles

The most advanced notation: community-maintained documentation of specific high-ranked players' canary tendencies. This emerges as collective intelligence — no single player has faced `@visayas_queen` enough times to map her canary patterns, but the community aggregates observations across dozens of matches.

**Format that stabilizes in Discord/forum guides:**

```
## @visayas_queen — Canary Profile (Season 3, updated W14)

Known canary positions:
- RELAY slot (confirmed dead canary since W8)
- SPECIALIST slot (suspected pivot canary, unconfirmed)

Canary tells:
- Always uses 10+ rules on canary element
- Canary hooks fire on channels ending in -aux
- Never places canary in COMMAND slot

Real vulnerability history:
- S2: STRIKER eviction policy (discovered by @cebu_relay_god, W22)
- S3W1-W6: SCOUT perception radius tuning (exposed in Amara's stream necropsy)
- S3W7+: Unknown — config shifted after S2 vulnerability was published

Counter-strategy:
- Skip QUICK mode entirely, run THOROUGH on non-canary elements
- Weight recency to 0 (she always recency-baits)
- Focus analysis on elements with <3 rules and low volatility
```

This format — structured, versioned, community-maintained — mirrors Smogon's Pokemon analyses, which document each Pokemon's standard sets, common partners, checks, and counters. The canary profile is the Robot Uprising equivalent: documenting not a character's moveset but a player's deception architecture.

### Tier 4 — Inline Config Annotation Syntax

Players begin annotating their own config exports with canary information. When sharing configs in the workshop or in necropsy posts, a lightweight inline syntax emerges:

```
# Config: RelayChain v8.2
# Canary strategy: pivot + vol on RELAY-B
# Real carry: STRIKER-A (pre-pivot buffer setup)
# Honest: COMMAND-A (real routing + recency bait)

RELAY-B:
  role: canary/pivot+vol
  rules: 12 (branching, non-strategic)
  hooks: threat-aux, recon-aux (decoy channels)

STRIKER-A:
  role: carry
  rules: 3 (tight, pre-pivot)
  hooks: cmd-net (real chain)
```

The `role:` field becomes the community's most-copied annotation pattern. Config exports without `role:` annotations are considered "unsigned" — the author hasn't declared their intent, and the community must reverse-engineer it from the necropsy.

---

## Organic Emergence vs. In-Game Definition

### The Case for Organic Emergence (Recommended)

The game should NOT define "canary" as an in-game term. The pre-ranking transparency panel (4.58) uses neutral language: "high-activity elements," "pre-ranking candidates," "adversarial surface." The game's tutorials and Predecessor annotations (5.12) never use the word "canary."

**Why organic emergence is better:**

1. **Ownership.** When the community invents the term, they own it. "Canary" becomes Robot Uprising's word — not a developer-imposed label. This creates cultural pride. Smogon's entire vocabulary is community-owned. "Stealth rocks" is the official move name, but "hazards" as a strategic concept (and "hazard control" as a role) is Smogon's invention. The vocabulary is the community's intellectual property.

2. **Precision.** Community-evolved terms are more precise than developer-defined ones because they respond to actual usage needs. The distinction between "pivot canary" and "volatility farm" will emerge only when players need to distinguish them — probably in Season 2 or 3, when both strategies are common enough that saying "canary" alone is ambiguous. Developer-defined terms tend to be premature and imprecise.

3. **Teaching signal.** The vocabulary's existence teaches the concept. A new player who reads a necropsy post and encounters `[canary]` for the first time will Google it, find the community guide, and learn about pre-ranking poisoning through the community's explanation — which is likely more vivid, more practical, and more current than any in-game tutorial could be. The vocabulary IS the onboarding.

4. **Meta-evolution coupling.** As the meta shifts, the vocabulary shifts. If a new canary technique emerges in Season 4 that doesn't fit existing categories, the community coins a new term. Developer-defined vocabulary can't keep up with meta evolution without constant patching.

### The Case for Minimal In-Game Acknowledgment

The game should acknowledge the vocabulary **after** it stabilizes — not by defining it, but by referencing it. Specific mechanisms:

- **Necropsy template fields (7.10):** The structured necropsy template (Model 3 in the necropsy design) includes a "Failure Type" dropdown. After the community has used "canary" for 2+ months, the dropdown gains an option: "Pre-ranking decoy / Canary." This validates the community term without inventing it.

- **Predecessor voice (5.12):** A late-campaign Predecessor — The Paranoid — could use canary-adjacent language in config annotations: "I always keep a loud, busy element in the relay slot. Gives the enemy something to stare at." This plants the seed without naming the concept, letting the community recognize and label it.

- **Config notes field:** The workbench config export includes a free-text "Notes" field. No structured canary annotation — just a place where players can write `role: canary` in their own syntax. The game provides the blank canvas; the community paints on it.

---

## Player Journeys

#### Journey: Renzo, 22, Computer Science Student, Cebu

**Context:** Season 2, Week 9. Renzo is Gold tier in Gauntlet, climbing steadily. He has just lost three consecutive matches to `@visayas_queen`, a Platinum player whose config his adversarial counterfactual mode (4.39) keeps pointing at RELAY-B as the primary fix target. He has run QUICK mode three times. Each time, RELAY-B tops the pre-ranking. He has spent two hours trying to build a config that counters RELAY-B's apparent routing weakness. His win rate against her has not improved.

**Minute 0:00 — The Discord Revelation**
Renzo opens the Robot Uprising Discord and types in `#competitive-gauntlet`: "Anyone have notes on @visayas_queen? My counterfactual keeps pointing at her RELAY-B but I can't find the exploit." Within four minutes, a reply from `@manila_architect`: "RELAY-B is her canary. Everyone falls for it. Check her STRIKER-A — three rules, never shows in QUICK. Run THOROUGH with recency weight at 0."

Renzo stares at the message. He does not know the word "canary" in this context. He has played 60 hours of Robot Uprising. He has never encountered this term in the game's UI, tutorials, or Predecessor annotations.

**Minute 0:45 — The Guide Search**
He searches the Discord for "canary." Forty-seven results. A pinned post in `#guides-and-resources` titled "Canary Identification for Intermediate Players" by `@cebu_relay_god`. He reads it. The guide opens: "A canary is a config element designed to score high on pre-ranking signals without being strategically important. If your adversarial counterfactual keeps pointing at the same element and your counter-builds never improve your matchup, you are probably looking at a canary."

The guide includes a checklist:
- Does the suspect element have 8+ rules? (Volatility farming signal)
- Does the suspect element fire actively at the pivot tick? (Pivot canary signal)
- Does the suspect element's output route to a secondary chain? (Parallel-branch signal)
- Has the suspect element been edited recently relative to other elements? (Recency bait signal)

Renzo mentally checks all four boxes against `@visayas_queen`'s RELAY-B. His stomach tightens. He has wasted two hours attacking a decoy.

**Minute 2:30 — The Reanalysis**
He loads his last match against `@visayas_queen` and opens adversarial counterfactual mode. This time, he manually overrides the pre-ranking: he drags recency weight to 0, volatility weight to 0.2, and pivot-activity weight to 0.3. He clicks "Re-rank." RELAY-B drops from position 1 to position 9. STRIKER-A rises to position 2. He runs THOROUGH mode on STRIKER-A.

The counterfactual reveals: STRIKER-A's eviction policy uses a non-standard priority ordering that causes it to retain stale data during the pre-pivot window. A config that floods STRIKER-A's buffer with NORMAL-priority signals in ticks 5-15 would force it to evict its own setup data, collapsing the pre-pivot staging that her entire architecture depends on. The vulnerability was invisible to QUICK mode because STRIKER-A's three rules produced almost no volatility, its low edit count gave it minimal recency, and it completed its critical work before the pivot tick — scoring near-zero on all three pre-ranking signals.

**Minute 5:00 — The First Canary-Tagged Necropsy**
Renzo writes his first necropsy post in `#config-necropsies`:

```
## Necropsy: vs @visayas_queen (Gold → Plat climb, S2W9)

Summary: Wasted 2 hours attacking her canary. Real vulnerability
is STRIKER-A eviction policy.

Config breakdown:
- RELAY-B [canary/pivot+vol] — 12 rules, fires 20x at pivot,
  routes to dead-end aux channel. DO NOT TARGET.
- STRIKER-A [carry] — 3 rules, pre-pivot buffer staging,
  nonstandard eviction. THIS is the exploit.
- SCOUT-C [canary-adjacent] — feeds RELAY-B to inflate activity

Attack: flood STRIKER-A buffer with NORMAL signals ticks 5-15.
Eviction policy drops its staging data. Architecture collapses
by tick 20.

Lesson: if QUICK mode points at the same element 3+ times and
your counter never improves, you're looking at a canary.
Zero out recency, reduce volatility weight, re-rank.
```

This is Renzo's first use of the community's canary vocabulary. He uses `[canary/pivot+vol]`, `[carry]`, and `[canary-adjacent]` — terms he learned from the guide thirty minutes ago. He has already internalized the notation.

**UI Annotations:**
- **Pre-ranking weight sliders:** Three horizontal sliders in adversarial counterfactual panel: Pivot Activity, Recency, Volatility. Default: all at 1.0. Draggable to 0.0. Slider track is teal; thumb is white. Changing any slider triggers a 200ms re-rank animation where candidate tiles shuffle position.
- **Re-rank button:** Amber pill button below weight sliders, text "Re-rank candidates." Pulses once after weight change to draw attention.
- **Candidate position numbers:** Each element in the pre-ranking list shows its ordinal position (1, 2, 3...) in a small circle. When re-ranked, the numbers animate — the circle slides vertically to its new position with a 300ms ease-in-out. Elements that move more than 3 positions flash amber during the transition.

---

#### Journey: Amara, 31, Twitch Streamer, Metro Manila

**Context:** Season 3, Week 2. Amara streams Robot Uprising 4 nights a week to 800-1200 concurrent viewers. She has become the community's most popular necropsy content creator. Tonight she is doing a "Canary Clinic" — a stream format she invented where viewers submit configs and she identifies the canary elements live on stream.

**Minute 0:00 — Stream Opening**
Amara's overlay shows the Robot Uprising Inspector with a config loaded from the first viewer submission. Her facecam is in the bottom-right. Her stream title: "CANARY CLINIC S3 — Send your configs, I'll find the bird." The chat is already active: "find the canary speedrun," "bet it's the relay again," "canary% WR."

She loads the first config. Five elements. She narrates: "Okay, first pass — rule counts. COMMAND has 4, RELAY-A has 11, RELAY-B has 3, STRIKER has 2, SCOUT has 6. Eleven rules on RELAY-A. That's our first suspect. Chat, what do we think?"

Chat erupts: "vol farm," "classic canary," "bait," "it's the scout, always the scout."

**Minute 1:30 — The Diagnostic Process**
Amara opens the pre-ranking transparency panel. She points at RELAY-A's scores: pivot activity 0.89, recency 0.72, volatility 0.91. "Triple-high. This is textbook. If this ISN'T a canary, this player has accidentally built the most suspicious-looking element I've ever seen." She pauses. "But let's not assume. Let me check the hook wiring."

She clicks RELAY-A's hook connections. The wiring diagram shows RELAY-A receiving signals from SCOUT on `recon-aux` and outputting to... nothing. The output channel `relay-aux-out` has no subscribers. "Dead end. RELAY-A processes signals and sends them into the void. This is a pivot canary with a dead-drop output. Confirmed canary. Chat, mark it."

Chat explodes with bird emojis. Someone clips the moment. The clip title: "amara finds another dead canary in 90 seconds."

**Minute 3:00 — Finding the Real Architecture**
Amara zeroes the pre-ranking weights for recency and volatility. Re-ranks. STRIKER rises to position 1. "Two rules on the Striker. Low volatility, low recency, but..." She opens STRIKER's config detail. Rule 1: `IF buffer_has ENEMY_POSITION AND signal_age < 2 AND fidelity > 0.8 THEN ENGAGE`. Rule 2: `IF buffer_pressure > 60% THEN COMPRESS_AND_HOLD`. "Two rules. Tight. Clean. This player knows what they're doing. The Striker does one thing — engage on fresh high-fidelity data — and one fallback — compress under pressure. The entire architecture funnels data to this Striker. RELAY-A is the decoy. STRIKER is the weapon."

She annotates on her stream overlay: "RELAY-A: canary/pivot+vol. STRIKER: carry. RELAY-B: honest (real routing). COMMAND: standard. SCOUT: canary-adjacent (feeds RELAY-A)."

A viewer asks in chat: "how do you beat this?" Amara: "Flood the Striker's buffer. Two rules means two possible states. If you can push buffer pressure above 60% before tick 15, the Striker never gets to Rule 1. It spends the whole match compressing instead of engaging. The canary protects the Striker by making you stare at the wrong relay."

**Minute 6:00 — The Notation Moment**
Amara pulls up a shared Google Doc that her community maintains: "Amara's Canary Field Guide, Season 3." She adds the submitted config as a new entry, using the community's stabilized format:

```
## Submission #47 — @davao_stealth_main (Diamond)

Architecture type: Single-carry with pivot canary
Canary: RELAY-A (pivot+vol, dead-drop output)
Carry: STRIKER (2-rule engage/compress, pre-pivot dependent)
Support: RELAY-B (honest routing), SCOUT (canary-adjacent feed)
Counter: Buffer flood STRIKER pre-tick-15

Canary quality: 8/10 (clean dead-drop, high scores, but
11-rule count is a tell — experienced players will spot it)
```

The "Canary quality" rating is Amara's invention — a 1-10 score assessing how difficult the canary is to identify. The community has adopted it. A canary rated 9 or 10 becomes a discussion topic. An "honest canary" (4.101) that also serves a real purpose is the only way to reach 10.

**UI Annotations:**
- **Hook wiring diagram:** Accessed from element detail in the Inspector. Shows input channels (left arrows), the element (center), output channels (right arrows). Dead-end outputs render with a dashed line terminating in a small X glyph — the visual equivalent of an unplugged cable. The X is dim red.
- **Pre-ranking triple-high indicator:** When all three pre-ranking signals exceed 0.7, the element's card in the candidate list gains a thin amber border. No tooltip or label — the border is a subtle visual cue for players who know to look for it. New players will not notice it. Experienced players will immediately recognize it as "suspicious."
- **Stream overlay config annotation:** Not a game feature. Amara uses an OBS text source with manual input. The game exports config data as structured text that streamers can parse and annotate with external tools.

---

#### Journey: Danilo, 45, Network Engineer, Davao

**Context:** Season 4, Week 1. Danilo is a Grandmaster-tier player who has never posted a necropsy. He plays silently, climbing the ladder through meticulous config engineering. He reads every necropsy posted about his configs with quiet interest. This week, a community guide has been published documenting his canary patterns across Seasons 2-4, and the profile is wrong.

**Minute 0:00 — Reading the Profile**
Danilo opens the community wiki's player profile page for his tag, `@davao_stealth_main`. The canary profile reads:

```
## @davao_stealth_main — Canary Profile (S4, updated W1)

Known canary positions:
- RELAY slot (confirmed pivot canary, S2-S3)
- SPECIALIST slot (suspected vol farm, S3W14+)

Canary tells:
- Consistently uses 8-12 rules on canary elements
- Output channels ending in -aux are always dead-drops
- Real carry is always in STRIKER slot with <4 rules

Counter-strategy:
- Ignore RELAY and SPECIALIST entirely
- Run THOROUGH on STRIKER, target buffer pressure pre-tick-15
- Weight recency to 0 (standard recency bait)
```

Danilo reads it twice. The profile describes his Season 2 and Season 3 configs accurately. The "counter-strategy" section is exactly what beats his old architecture. But this is Season 4. His config has changed.

**Minute 1:30 — The Ghost Canary**
In Season 4, Danilo has inverted his strategy. His RELAY is now his actual carry — a sophisticated 8-rule relay that performs real signal compression, routing, and prioritization. It scores high on all three pre-ranking signals because it IS doing important work. His STRIKER has 6 rules — more than his old 2-rule carry — but Rule 4 through Rule 6 are purely cosmetic branches that inflate volatility without affecting outcomes. The STRIKER is the canary now.

The community profile says "ignore RELAY, target STRIKER." Opponents who follow this advice will attack Danilo's canary and ignore his real architecture. The community's own collective intelligence has become his shield.

Danilo does not correct the profile. He does not post. He queues for Gauntlet.

**Minute 3:00 — The Match**
His opponent is `@manila_architect` — a Diamond player who Danilo knows reads community profiles religiously. The match plays out. `@manila_architect`'s config is clearly tuned to flood STRIKER's buffer — high-frequency NORMAL signals targeting the unit's perception radius, exactly the counter-strategy the community profile recommends.

Danilo's STRIKER absorbs the flood. Rules 4-6 fire busily, producing high volatility. The STRIKER looks like it is struggling. In the sealed watch, `@manila_architect` will see a busy, stressed STRIKER and assume the attack is working. Meanwhile, RELAY processes clean data on its real channels, compresses and routes to COMMAND, and COMMAND directs a flanking maneuver that collapses `@manila_architect`'s formation by tick 30.

**Minute 4:30 — The Post-Match Moment**
`@manila_architect` runs adversarial counterfactual. QUICK mode points at RELAY-A — high pivot activity, high volatility. But `@manila_architect` has been trained by the community: "RELAY is always the canary for @davao_stealth_main." He dismisses RELAY-A and drills into STRIKER. He finds nothing — the flood was absorbed, the STRIKER's cosmetic rules handled the pressure without affecting the real outcome. He is confused.

The ghost canary has worked. The community's correct (but outdated) profile became a more effective decoy than any in-config engineering could produce. The community notation system — the very collective intelligence designed to defeat canaries — has been weaponized as a meta-canary.

**UI Annotations:**
- **Community profile (external):** Not an in-game feature. The community wiki is a fan-maintained resource. The game provides structured config export data that the wiki parses.
- **Ghost canary identification:** No in-game UI. This is a purely social phenomenon — the gap between community documentation and a player's actual current config. The game could surface "your config has been analyzed in 14 community necropsies" as a social stat, but this risks making ghost canary strategy too explicit.
- **Outdated profile warning:** The community wiki could auto-flag profiles that reference configs from 2+ seasons ago, but this is a community moderation decision, not a game design decision.

---

#### Journey: Sofia, 17, High School Student, Iloilo

**Context:** Season 2, Week 3. Sofia is Silver tier and has just encountered the word "canary" for the first time in a necropsy post she found while trying to understand why she keeps losing to the same opponent. She does not yet know what pre-ranking is.

**Minute 0:00 — The Vocabulary Wall**
Sofia reads a necropsy post: "RELAY-B [canary/pivot+vol] — classic dead-drop. STRIKER [carry]. Run THOROUGH with recency 0." She understands maybe 40% of this. She knows what a relay and a striker are. She does not know what "canary" means here, what "pivot+vol" refers to, what a "dead-drop" is in this context, or what "recency 0" means.

She types in Discord `#new-players`: "what is a canary?"

**Minute 0:30 — The Community Response**
Three replies in two minutes. The first is terse: "decoy element that wastes your analysis time." The second is a link to the community's "Canary 101" guide. The third is from a moderator: "You don't need to worry about canaries until Platinum. Focus on building clean architectures first. When you start losing to configs that don't seem breakable, that's when canaries matter."

Sofia clicks the guide. It opens with: "A canary is a config element designed to look important. When you use the game's analysis tools (adversarial counterfactual mode, pre-ranking) to figure out how to beat an opponent, a canary is what the analysis points at. But the canary is a trap. The real weak point is somewhere else. The canary exists to waste your time."

This explanation uses no jargon. It describes the concept in terms of what the player experiences — "the analysis points at it" — rather than the mechanic's formal name. The guide then builds up: "The term 'canary' comes from competitive players who noticed that some elements consistently show up as targets in pre-ranking analysis but never lead to real counter-strategies. These elements are designed to score high on the pre-ranking's three signals: pivot activity, recency, and volatility..."

**Minute 2:00 — The Conceptual Click**
Sofia re-reads the original necropsy post. `[canary/pivot+vol]` now parses: canary (decoy), pivot (high activity at the match's turning point), vol (high volatility — lots of state changes). `Dead-drop` she infers: the output goes nowhere. `[carry]` she understands by analogy to MOBAs — the element doing the real damage. `Recency 0` she now understands as a pre-ranking weight adjustment.

She has learned four new vocabulary terms in two minutes from a community post, not from the game's tutorial. The vocabulary has taught her the concept. The concept has taught her how expert players think about adversarial analysis. She is 50 hours from needing this knowledge — but the community's notation system has pre-loaded the concept, and when she reaches Platinum and encounters her first real canary, she will recognize it.

**UI Annotations:**
- **No in-game UI is relevant here.** This journey is entirely community-mediated. The game's role is to provide the mechanical substrate (pre-ranking, adversarial counterfactual, config export) that generates the community vocabulary. The game does not need to teach "canary" — the community teaches it more effectively than the game ever could.

---

## Strengths

**Community ownership creates cultural depth.** When the community invents and maintains the vocabulary, it becomes part of the game's identity. "Canary" is not a game feature — it is a cultural artifact. This makes Robot Uprising's competitive culture feel distinctly its own, not a reskin of another game's community. The vocabulary is a moat.

**Notation accelerates skill transfer.** A new competitive player who reads ten necropsy posts with canary annotations absorbs the concept through repeated exposure, without needing a tutorial. The notation is self-teaching. Each `[canary/pivot+vol]` annotation is a compressed lesson. This is how Smogon teaches Pokemon strategy — not through guides alone, but through thousands of annotated team reports that normalize the vocabulary through sheer volume.

**Collective intelligence scales adversarial analysis.** No single player faces an opponent enough times to fully map their canary strategy. Community profiles aggregate observations from dozens of players, creating a knowledge base more comprehensive than any individual could build. This is genuinely emergent collective intelligence — the kind of coordination that the game's own agents model at the mechanical level. The meta-game mirrors the game.

**Ghost canary strategy creates meta-depth.** When the community's own profiles can be weaponized as decoys (Danilo's journey), the notation system generates its own adversarial layer. Players must now evaluate not just "is this element a canary?" but "is the community's profile of this player still accurate?" This is an information-trust problem — the same problem the game teaches through fidelity spoofing (5.14e). The community vocabulary teaches the same lesson at the social layer that the game teaches at the mechanical layer.

---

## Weaknesses and Tradeoffs

**Vocabulary barrier for new players.** Competitive notation is exclusionary by nature. A Silver player reading a Diamond necropsy post encounters a wall of jargon. The community's "Canary 101" guide mitigates this, but the guide must be written, maintained, and discoverable. If the guide falls out of date or is buried in a Discord channel, new players face an opaque culture. The game can partially address this by linking community resources from the necropsy viewer (7.10), but this creates a dependency on external content.

**False canary identification causes harm.** When the community incorrectly labels an element as a canary, opponents who trust the community profile will ignore a real vulnerability. This is the ghost canary problem in reverse — the community has been tricked. If wrong canary profiles circulate widely, lower-ranked players who rely on community intelligence will make worse decisions than players who ignore the profiles entirely. The notation system's value depends on its accuracy, and accuracy degrades when top players deliberately mislead or when community analysts are simply wrong.

**Notation standardization pressure.** Organic vocabulary works when the community is small (500-2000 active competitive players). At scale (10,000+), competing notation systems emerge. One Discord server uses `[canary]`, another uses `[decoy]`, a third uses `[bait]`. Forum posts mix notations. Config exports become harder to parse. The community either converges on a standard (requiring social coordination) or fragments into dialects. The game can nudge convergence by adopting the most popular notation in its necropsy template dropdown — but this risks freezing vocabulary at a moment when it should still be evolving.

**Over-documentation kills canary viability.** If every competitive player's canary strategy is documented, canaries stop working. The meta shifts to ghost canaries (Danilo's journey), then to "canary profiles are unreliable" (meta-ghost canaries), then potentially to a world where nobody trusts community intelligence at all. This is the arms race reaching a degenerate state. The counter-argument: the arms race itself is content. Each layer of deception and counter-deception creates discussion, necropsy posts, stream content, and community engagement. The degeneracy is the point.

---

## Interaction Effects

**Config necropsy culture (7.10).** The canary vocabulary becomes the backbone of necropsy posts. A necropsy without canary annotation is considered incomplete in competitive contexts. The structured necropsy template (Model 3) gains "Canary Strategy" as a section header. The visual config diff (Model 1) gains community-contributed tag overlays — when viewing a shared config, elements that community profiles have tagged as canaries show a small bird icon in the diff view. This bidirectional flow (community tags inform in-game display, in-game display normalizes community tags) creates a feedback loop that accelerates vocabulary adoption.

**Pre-ranking transparency panel (4.58).** The transparency panel's three-signal display is the substrate that generates canary vocabulary. Without the panel, players cannot see why the pre-ranking pointed at a specific element, and the vocabulary around "pivot canary" vs. "volatility farm" cannot emerge. The transparency panel is necessary infrastructure for the community notation system. Conversely, the community notation system validates the transparency panel's design — if players are using the panel's signals as the basis for a rich analytical vocabulary, the panel is showing the right information.

**Meta-evolution arms race (7.09).** Canary notation documents the meta's current state. The community's canary profiles are a snapshot of the meta — "RELAY-slot canaries are common in Season 2, SPECIALIST-slot canaries emerged in Season 3." This documentation becomes a resource for meta-evolution analysis. Designers and players can read the canary profile archives to understand how the meta has shifted. The notation system is both a product of the meta and a tool for understanding it.

**Fog of canaries (4.99).** The community notation for fog-of-canaries architectures requires an extension to the basic `[canary]` tag. The community will need syntax for "this entire config is designed so that no single element is identifiable as THE canary." The notation might evolve to `[fog: 3 elements]` or `[fog architecture]` as a top-level config annotation, distinct from element-level canary tags. This notation challenge will drive community discussion and potentially vocabulary innovation.

**Adversarial multi-cluster poisoning (4.69e).** Canary-aware notation interacts with cluster poisoning vocabulary. A player who documents an opponent's canary strategy is also documenting the diagnostic poisoning attack surface. The community profile for `@visayas_queen` contains, implicitly, the information an attacker needs to identify which agent the diagnostic poisoning targets. The canary profile and the cluster-poisoning profile are complementary — "this opponent uses canaries to mislead your pre-ranking AND targets your RELAY-C to poison your career analysis." The notation system must eventually handle both.

---

## Comparable Games and Media

**Pokemon competitive notation (Smogon/Victory Road).** The closest precedent. Smogon's analyses document each Pokemon with standardized sections: Moves, Ability, Item, EVs, Nature, and free-text "Overview" and "Set Details." Players share team reports in standardized formats with role annotations ("wallbreaker," "pivot," "cleaner"). The vocabulary is entirely community-created — Game Freak does not use the term "wallbreaker" anywhere. Robot Uprising's canary notation follows the same pattern: game provides mechanics, community provides analytical vocabulary. The key difference: Smogon documents game objects (Pokemon), while Robot Uprising's notation documents player-created objects (config elements). This means the vocabulary must handle authorial intent ("this element was DESIGNED to be a canary"), which Pokemon notation does not need to address.

**Fighting game frame data notation.** The FGC standardized frame data notation (startup, active, recovery, advantage-on-block, advantage-on-hit) decades ago. This notation is not in any fighting game's UI — it is community-derived from testing. Frame data notation enabled the competitive culture because it allowed precise communication about why a move is good or bad. Robot Uprising's canary notation serves the same function: it enables precise communication about why an element is suspicious or trustworthy. The frame data analogy suggests that Robot Uprising's notation will eventually include numerical shorthand — "pivot: 0.89, vol: 0.91, rec: 0.72" — alongside the categorical terms.

**Chess algebraic notation and annotation symbols.** Chess notation includes evaluation symbols: `!` (good move), `?` (bad move), `!!` (brilliant), `??` (blunder), `!?` (interesting), `?!` (dubious). These symbols are community-standardized, not FIDE-defined. Robot Uprising's canary notation may develop similar evaluative symbols: a canary quality rating (Amara's 1-10 scale), a "confirmed/suspected/debunked" status, or a "dead canary" flag for canaries that have been publicly identified and are no longer effective. The evaluative layer transforms the notation from description to analysis.

**Magic: The Gathering sideboard guides.** MTG tournament reports include sideboard plans: "vs. Aggro: -2 Counterspell, +2 Wrath of God." This shorthand communicates matchup-specific adjustments. Robot Uprising's canary profiles include "counter-strategy" sections that serve the same function: "vs. @visayas_queen: weight recency to 0, run THOROUGH on non-canary elements." The parallel suggests that canary profiles will eventually include matchup-specific counter-configs — complete config modifications optimized for specific opponents' canary strategies.

**Intelligence community tradecraft vocabulary.** Real-world intelligence uses terms like "legend" (false identity), "dead drop" (covert message exchange), "mole" (infiltrator), and "limited hangout" (partial truth used to conceal deeper secrets). Robot Uprising's community has already adopted "dead drop" for a canary's unused output channel. The intelligence vocabulary parallel is deeper than other game references because Robot Uprising's core mechanic IS intelligence (in the espionage sense) — agents gathering, routing, and acting on information under adversarial conditions. The community vocabulary will naturally draw from intelligence tradecraft because the problems are isomorphic.

---

## Sensory Description

**The necropsy post as artifact.** A canary-annotated necropsy post in the Discord `#config-necropsies` channel has a specific visual texture. The config breakdown uses Discord's code-block formatting — monospace text on a dark grey background, each element on its own line. The `[canary]` tag appears in amber text (Discord role color assigned to the community's "Canary Analyst" role). The `[carry]` tag is in white. `[canary-adjacent]` is in dim amber. The post's header includes the author's rank badge (a small shield icon in the rank's color — silver, gold, platinum, diamond, grandmaster) and the season/week tag. Embedded in the post: a compact replay link that renders as a small card preview showing the match's outcome, duration, and a tiny battlefield thumbnail with the pivot tick highlighted by a gold diamond.

**The stream overlay.** Amara's Canary Clinic stream has a custom OBS overlay: a semi-transparent panel on the left side of the screen listing the current config's elements in a vertical stack. Each element is a rounded rectangle with the unit's class icon, name, and a blank role field. As Amara identifies each element's role, she types the annotation and it appears in the overlay with a typewriter animation — letter by letter, 40ms per character. The `[canary]` annotation renders in amber. A small bird silhouette icon (the community's unofficial canary glyph — a simple 16px vector silhouette of a canary bird, created by a community artist and adopted as standard) appears next to the tag. When Amara confirms a canary identification, a subtle amber pulse radiates from the element's card in the overlay — a visual punctuation mark for the viewer.

**The community wiki page.** The player profile page on the community wiki has a structured layout: player tag and rank at the top, a "Canary History" timeline on the left (showing which slots held canaries in which seasons, rendered as a vertical swimlane chart with amber bars for canary periods and white bars for non-canary periods), and a "Current Profile" panel on the right with the structured canary profile text. Outdated entries are greyed with a small clock icon and "last verified: S3W14" in dim text. The page loads with a subtle parallax scroll — the timeline moves slightly faster than the profile panel, creating depth. The wiki's color scheme echoes the game's: dark background, teal accents, amber for canary-related elements, white for structural annotations.

**The moment of canary identification.** In the game's Inspector, there is no "canary detected" alert. The moment of identification is cognitive, not visual — it happens in the player's mind when they see the dead-drop output, the triple-high pre-ranking scores, the twelve-rule volatility farm. But the community has created a sensory marker for this moment in stream culture: Amara and other streamers play a sound effect (a short, descending two-note whistle — a "canary call") when they identify a canary on stream. The sound has become memetic. Community members post the two-note whistle as an audio clip reaction in Discord when someone identifies a canary in a necropsy post. The sensory experience of canary identification is community-created, not game-created. The game provided the substrate. The community built the ritual.

---

## New Aspects Discovered

- **7.10a — Necropsy template canary section:** A structured section in the Model 3 necropsy template (7.10) specifically for canary documentation. Fields: canary element(s), canary type (pivot/vol/recency/honest/fog), canary quality rating (1-10), dead-drop channels, and "confirmed by" (linking to other necropsies that identified the same canary). This section is pre-populated with the element's pre-ranking scores but requires the player to make the interpretive judgment.

- **4.100a — Ghost canary detection heuristic:** A community-developed (not in-game) analytical method for detecting ghost canaries: compare the community's canary profile against the player's most recent config version. If the config has changed structurally since the profile was last verified, the profile may be a ghost canary shield. Requires the game to expose "config last modified" timestamps in config exports, which the community wiki can parse.

- **7.14 — Canary vocabulary pacing in seasonal meta reports:** The community's canary vocabulary serves as a leading indicator of meta sophistication. When new canary terms emerge (e.g., "fog canary" appearing in Season 3), this signals that the meta has evolved past simple single-element poisoning. Tracking vocabulary emergence across seasons provides a qualitative meta-health metric for designers — a rich, growing vocabulary indicates a healthy, evolving meta.

---

*Aspect 4.100 fully documented. ~3,000 words. 4 full player journeys. 3 new aspects discovered.*

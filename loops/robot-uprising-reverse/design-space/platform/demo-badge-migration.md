# 6.11d-ii — Demo-to-Full-Game Badge Migration

## Overview

A player earns a "Top 10 Season 3" badge in the browser demo's Seasonal Circuit. They complete a 14-day Daily Config streak. They hit Top 1% in four weekly challenges. Then they buy the full game on Steam. **What happens to those badges?**

This is "The Veteran's Passport Problem." The demo's competitive infrastructure (6.11d) generates meaningful player achievements — seasonal rankings, streak records, bounty solves, histogram percentiles. These achievements represent hours of engagement and genuine skill development. If they vanish on purchase, the upgrade feels like a **demotion** — the player was someone in the demo and nobody in the full game. If they transfer uncritically, the full game's Gauntlet community sees a flood of unfamiliar badges from a system they may not respect.

The design space spans six models for badge migration, each making different trade-offs between veteran prestige, community integrity, badge meaning, and technical complexity.

---

## What Badges Exist in the Demo

From the competitive infrastructure design (6.11d), the demo generates these achievement types:

| Badge Category | Examples | Emotional Weight | Rarity |
|---|---|---|---|
| **Seasonal Circuit rankings** | "Top 100 Season 3," "Top 10 Season 5," "#1 Season 2" | Very High — permanent positional achievement | Scarce (100 per season) |
| **Daily Config streaks** | "Seven Cycles" (7-day), "Iron Streak" (30-day), "Perpetual Motion" (90-day) | High — represents sustained daily commitment | Medium (7-day common, 90-day rare) |
| **Weekly Challenge percentiles** | "Top 1% Week 12," "Histogram Hunter" (top 5% on all 3 axes simultaneously) | Medium — weekly accomplishments accumulate | Medium |
| **Bounty Board solves** | "Bounty Hunter" (10 solves), "Architect" (created bounty with 100+ attempts) | Medium — community participation signal | Medium-Low |
| **Evolution Chain contributions** | "Chain Link" (improved a seed config), "Chain Breaker" (#1 on an evolution chain) | Low-Medium — collaborative signal | Low |
| **Sandbox milestones** | "Perfect Clear" (all enemies, zero overloads), "Minimalist" (win with ≤3 rules total) | Low — self-challenge markers | Common |

**Total badge surface:** A committed demo player over 6 months could accumulate 15-40 badges depending on participation breadth.

---

## Model 1: "The Full Transplant" — Everything Migrates As-Is

### How It Works

Every badge earned in the demo transfers 1:1 to the full game profile. The player's demo profile becomes their Gauntlet profile. Season badges, streak records, percentiles — all visible to other players in the full game's competitive spaces.

### The Emotional Beat

**First Gauntlet launch:**
The player opens their Gauntlet profile. Their badge shelf is already populated — "Top 10 Season 3" gleams gold, their 30-day streak chain glows amber, their weekly percentile markers line the bottom row. Other Gauntlet players inspecting their profile see this full history. The boot-log voice during the System Upgrade ceremony (6.11a Model F) reads: *"Competitive history imported. 23 commendations transferred. Operational reputation: intact."*

### Strengths
- **Zero emotional loss.** The player's demo investment is fully respected.
- **Social proof on day one.** The player enters Gauntlet as "someone" not "no one."
- **Simple implementation.** Badges are data — include them in the migration payload alongside campaign progress and blueprints.

### Weaknesses
- **Badge inflation.** Full game players who didn't play the demo see unfamiliar badges from a system they couldn't participate in. "Top 10 Season 3" from a demo with 200 players is not the same as Top 10 from a Gauntlet season with 50,000.
- **Authority asymmetry.** Demo badges may be perceived as "easy mode" by full-game veterans. "You got Top 10 when the demo had 200 people; I got Top 100 against 50,000."
- **Badge namespace collision.** If the full game's Gauntlet has its own seasonal rankings, the demo's "Season 3" and the Gauntlet's "Season 3" could mean completely different things.

### Comparable Games
- **Hearthstone:** When game modes are added or retired (Wild vs. Standard), old rank achievements persist on profile with no disambiguation. Players routinely argue about whether Legend rank in Wild "counts" as much as Standard.
- **League of Legends:** Season rewards are permanent but clearly labeled by season number. Season 1 rewards carry extreme prestige precisely because the population was small — scarcity from a smaller era enhances, not diminishes, value.

---

## Model 2: "The Demo Shelf" — Separate Display, Separate Namespace

### How It Works

Demo badges transfer but are displayed in a **dedicated "Demo Era" section** of the player's profile, visually distinct from full-game Gauntlet badges. Demo badges have a different border treatment — a subtle amber tint vs. the Gauntlet's cyan — and are labeled with their origin: "Demo Season 3" not "Season 3."

### The Emotional Beat

**Profile inspection:**
The player's profile has two rows. Top row: "GAUNTLET ACHIEVEMENTS" — empty, fresh, waiting to be earned. Bottom row, behind a horizontal divider with the text "DEMO OPERATIONS": their demo badges, each with a thin amber border and a small "DEMO" tag in the bottom-right corner. The demo section has a slight sepia tint — like a photograph from a previous era. Hovering over any demo badge shows: "Earned during pre-deployment operations — [date]."

The top row being empty creates **hunger**. The player sees where their Gauntlet badges will go. The demo shelf validates their past while the empty Gauntlet shelf motivates their future.

### Strengths
- **Clear provenance.** No confusion about where a badge came from.
- **Prestige layering.** Demo badges become "founding era" markers — like having a low Steam ID number or a Day 1 badge.
- **No namespace collision.** "Demo Season 3" and "Gauntlet Season 3" are unambiguous.
- **Community health.** Full-game players can't feel their Gauntlet badges are devalued by demo-era equivalents.

### Weaknesses
- **Second-class citizen feel.** The "DEMO" tag could feel dismissive — "your old achievements don't count here."
- **Visual clutter.** Two badge rows on every veteran's profile.
- **Maintenance burden.** Two visual systems for badges — demo style and Gauntlet style.

### Comparable Games
- **Destiny 2:** Legacy achievements from Destiny 1 carried over as a separate "Legacy" triumph section — visible but clearly from a different era. Veterans wore them as experience markers; new players ignored them.
- **World of Warcraft:** "Feat of Strength" achievements for retired content. Can't be earned anymore. The scarcity makes them prestigious.

---

## Model 3: "The Conversion" — Demo Badges Become Full-Game Equivalents

### How It Works

Demo badges are mapped to equivalent full-game achievements through a conversion table. "Top 10 Season 3 (Demo)" becomes "Seasonal Veteran" — a generic badge acknowledging competitive placement without specifying rank or population size. Streak badges convert to "Dedicated Operator" tier markers (7-day → Bronze, 30-day → Silver, 90-day → Gold). The conversion deliberately **loses specificity** to prevent comparison problems.

### The Conversion Table

| Demo Badge | Full-Game Equivalent | What's Preserved | What's Lost |
|---|---|---|---|
| Top 100 Season N | "Circuit Pioneer — Bronze" | Competitive participation | Exact rank, season identity |
| Top 10 Season N | "Circuit Pioneer — Silver" | High-level competitive success | Exact rank, population context |
| #1 Season N | "Circuit Pioneer — Gold" | Championship-level achievement | The flex of "#1" |
| 7-day streak | "Steady Operator" | Habit demonstration | Exact streak length |
| 30-day streak | "Dedicated Operator" | Sustained commitment | Exact streak length |
| 90-day streak | "Perpetual Operator" | Extreme dedication | Exact streak length |
| Top 1% weekly | "Sharp Diagnostician" (per occurrence) | Optimization skill | Which week, which metric |
| Bounty Hunter (10+) | "Community Contributor" | Participation breadth | Solve count |
| Chain Breaker | "Evolutionary Architect" | Creative contribution | Specific chain context |

### The Emotional Beat

**The Conversion Ceremony:**
During the System Upgrade (Model F from 6.11a), after the standard migration text, a new sequence plays:

```
TRANSLATING OPERATIONAL COMMENDATIONS...

  Demo Season 3 — Rank #7 → CIRCUIT PIONEER — SILVER
  Daily Config — 34-day streak → DEDICATED OPERATOR
  Weekly Top 1% × 4 → SHARP DIAGNOSTICIAN × 4
  Bounty solves: 12 → COMMUNITY CONTRIBUTOR

  23 demo commendations → 8 deployment-grade citations.

  Some specificity lost in translation.
  Operational record preserved.
```

The "some specificity lost in translation" line is crucial — the AI acknowledges the conversion isn't lossless. It's honest about the trade-off. The player sees their demo rank (#7) one last time before it converts. The last glimpse is bittersweet and respectful.

### Strengths
- **Clean namespace.** Full-game badges are one system, no "Demo" tags needed.
- **Comparable across eras.** "Circuit Pioneer — Silver" means the same thing whether earned in demo or Gauntlet.
- **No authority arguments.** The conversion abstracts away population size.
- **Elegant lossy compression.** The AI's acknowledgment of information loss is on-brand for a game about context windows and eviction.

### Weaknesses
- **Emotional loss.** "#7 in Season 3" is a much more powerful memory than "Circuit Pioneer — Silver." The conversion flattens the story.
- **Feels bureaucratic.** "Your personal achievement has been processed into a standardized category."
- **Ambiguity.** A "Circuit Pioneer — Silver" holder might have been #2 or #10 — the badge no longer tells you.
- **Conversion disagreements.** Is a 30-day streak in a 200-player demo really equivalent to "Dedicated Operator" in a 50,000-player ecosystem? The mapping is inherently debatable.

### Comparable Games
- **Overwatch → Overwatch 2:** Competitive rank history was "converted" from the SR system (1-5000 numerical) to a new tier system (Bronze-Grandmaster with divisions). Many players felt their specific rank history was erased — "I was 4200, not just 'Grandmaster.'" The backlash was significant.
- **Final Fantasy XIV:** When the stat system was overhauled, old achievements were converted to "Legacy" equivalents with different names but similar tier structure.

---

## Model 4: "The Founding Badge" — Single Prestige Marker

### How It Works

All demo achievements collapse into **one** badge: **"Demo Veteran"** with a tier based on the highest achievement level reached. The tier is visually distinct — a hexagonal badge with a circuit-pattern border whose complexity increases with tier.

| Tier | Requirement | Visual |
|---|---|---|
| Demo Veteran — Bronze | Completed any demo challenge | Simple hex, copper border, single circuit trace |
| Demo Veteran — Silver | Top 20% in any challenge OR 7-day streak | Refined hex, silver border, branching circuit traces |
| Demo Veteran — Gold | Top 1% OR 30-day streak OR Season Top 100 | Ornate hex, gold border, full circuit mesh |
| Demo Veteran — Diamond | Season Top 10 OR 90-day streak OR perfect sandbox clear | Prismatic hex, animated border pulse, cascading circuit pattern |
| Demo Veteran — Founder | Season #1 OR all-time Top 3 sandbox | Unique frame, no tier label, recognized by sight alone |

### The Emotional Beat

**Profile display:**
One badge. One slot. Everyone who sees it knows: "This player was there before the game launched." The tier tells how deep they went. A Diamond Demo Veteran entering their first Gauntlet match has immediate credibility — not because of transferred ratings, but because the badge's rarity speaks for itself.

The badge sits in a **"Founding" slot** on the profile — a dedicated position above the Gauntlet badge row, permanently occupied. It can never be earned again after the demo's competitive infrastructure sunsets. The Founding slot exists on every profile — but for players who never played the demo, it's empty. A greyed-out hexagonal outline with the text: "Demo Era — No record found." The absence is visible, creating soft envy.

**The TikTok Clip:**
A player inspects a Gauntlet opponent's profile. Above a wall of prestigious Gauntlet badges, a single prismatic hexagon pulses. They mouse over it: "Demo Veteran — Diamond. Earned during pre-deployment operations. Season 3: Rank #7. Daily streak record: 34 days." The tooltip preserves the specific history — the badge abstracts, but the details are still there on hover.

### Strengths
- **Maximum prestige impact.** A single rare badge is more powerful than a shelf of common ones. Think: low Steam ID, original WoW Collector's Edition pet, TF2 earbuds.
- **Zero badge pollution.** One badge, one slot, no namespace confusion.
- **Scarcity by design.** The badge can never be earned again. Its value only increases over time.
- **Tooltip depth.** The badge is simple on the surface, detailed on inspection. "Easy to learn, hard to master" applied to profile design.

### Weaknesses
- **All-or-nothing.** A player who earned 15 demo badges sees them reduced to one. "I had a whole shelf, now I have one hex."
- **Tier pressure.** Players who are Silver may grind the demo before buying the full game specifically to reach Gold — this could be a feature (extended demo engagement) or a bug (delayed conversion).
- **Empty slot as negative space.** Non-demo players seeing "No record found" in their Founding slot could feel excluded rather than motivated.

### Comparable Games
- **Team Fortress 2 — Proof of Purchase:** Players who bought the original retail game got a unique hat called "Proof of Purchase." It was one item, one slot, but it became legendary — years later, players recognized it on sight as a "day one" marker. The simplicity of "one badge, permanent" created more prestige than any achievement wall could.
- **Halo: The Master Chief Collection:** "Legacy" nameplate for players who completed the original game. One visual marker, immediately recognizable.
- **Warframe — Founders Pack:** Excalibur Prime, available only during the Kickstarter era, remains the single most prestigious item in the game a decade later. Its power comes entirely from being permanently retired.

---

## Model 5: "The Archive" — Full History, Hidden by Default

### How It Works

Every demo badge, every specific rank, every streak — all of it migrates. But the demo history is stored in a collapsible **"Operations Archive"** section of the profile that is **collapsed by default**. The player can expand it to show their full demo record. Other players visiting the profile see a single line: "Demo Operations: Active" (or a discrete amber indicator) — and can expand to view the full archive only if the player has set it to public.

### The Emotional Beat

**Profile configuration:**
After migration, the player's profile settings include a toggle: "Demo Operations Archive — Public / Private / Friends Only." The default is **Private**. The player chooses who sees their demo history. This is the social media model — you control your history's visibility.

When expanded, the archive displays like a boot-log readout: chronological entries in monospace text, each badge with its original name, date earned, and context.

```
OPERATIONS ARCHIVE — PRE-DEPLOYMENT ERA

2026-04 | Season 2 — Rank #42/187 | SEASONAL CIRCUIT
2026-04 | Seven Cycles — 7-day streak | DAILY CONFIG
2026-05 | Top 1% Week 8 — Stealth axis | WEEKLY CHALLENGE
2026-05 | Season 3 — Rank #7/234 | SEASONAL CIRCUIT ★
2026-06 | Iron Streak — 34-day run | DAILY CONFIG
2026-06 | Bounty Hunter — 12 solves | BOUNTY BOARD
...

TOTAL: 23 commendations | 2 seasons ranked | 34-day peak streak
```

The "★" marks the player's highest achievement — their proudest moment, auto-detected or manually pinned.

### Strengths
- **Zero information loss.** Everything is preserved, exactly as earned.
- **Player agency.** The player controls visibility — they can flex or stay modest.
- **Narrative richness.** The archive reads like a service record. It has a story: the player got better over time, peaked in Season 3, grinded streaks.
- **No badge pollution.** The main profile is clean. The archive is there when you want it.

### Weaknesses
- **Discovery problem.** If hidden by default, most players never know the feature exists.
- **Social friction.** A "Private" archive creates a missed connection — two demo veterans might never know they share that history.
- **Implementation complexity.** Storing, formatting, and rendering a variable-length achievement history is more complex than a badge shelf.

### Comparable Games
- **LinkedIn:** Work history is public by default but can be hidden. The "archive" model is essentially a resume — what you choose to show vs. what you leave off.
- **Steam:** The "Badges" section on Steam profiles is expandable and can be made private. Most players never look at it. But the ones who do appreciate the detail.

---

## Model 6: "The Hybrid" — Founding Badge + Archive + Conversion

### How It Works

Combines Models 2, 3, and 4:

1. **One "Demo Veteran" badge** (Model 4) in the Founding slot — visible on the main profile, tiered by highest achievement, permanently earned.
2. **Operations Archive** (Model 5) — full demo history stored, expandable, visibility-controlled.
3. **Converted generic badges** (Model 3) — demo achievements mapped to full-game equivalents for any system that needs badge-count or badge-type data (matchmaking confidence, community trust levels, recommendation algorithms).

The player sees: one prominent badge + an expandable history. Other players see: the badge (always) + the history (if public). Internal systems see: converted badge-count data for matchmaking and trust.

### The Emotional Beat

**The Three-Layer Migration Ceremony:**

```
SYSTEM UPGRADE: COMMENDATION PROCESSING

Layer 1: FOUNDING RECOGNITION
  Analyzing operational history... Peak achievement: Season 3, Rank #7.
  Minting: DEMO VETERAN — DIAMOND ◆

Layer 2: ARCHIVAL PRESERVATION
  23 commendations archived in full fidelity.
  Access: Profile → Operations Archive

Layer 3: SYSTEM INTEGRATION
  Commendations translated to deployment-grade metrics.
  Community trust level: Established
  Matchmaking confidence: High

All layers preserved. Nothing lost. Some things transformed.
```

The "nothing lost, some things transformed" line is the game's thesis on migration — it's the context window eviction policy applied to the player's own achievements. Information is compressed, not discarded. The game practices what it preaches.

---

## Player Journeys

### Journey: Sofia, 15, First Strategy Game Player

**Context:** Sofia played the demo for 3 months after seeing a TikTok clip. She earned "Seven Cycles" (7-day streak), participated in 2 Seasonal Circuits (highest: rank #87/312 in Season 4), and completed 6 bounties. Her mom bought the full game for her birthday. She uses Migration Model 6 (Hybrid).

**Minute 0:00 — The System Upgrade**
Sofia launches the full game. The System Upgrade ceremony plays. Her blueprint names appear (scout-chan, big ears). She's grinning. Then the new sequence:

```
COMMENDATION PROCESSING...
```

She watches her demo rank (#87) appear on screen one last time. The Diamond badge minting animation plays — a hexagonal outline draws itself on screen, circuit traces fill in from the edges, the border shifts to gold, and the word "GOLD" materializes inside. (She's Gold tier — Season Top 100 qualifies.) A crystalline chiming sound, like a fork striking a tuning fork, plays at the moment the badge completes.

*"Demo Veteran — Gold. Minted."*

Her Demo Veteran badge appears in the Founding slot on her profile preview. She opens her full profile — the Gauntlet achievement row is empty but waiting. Below, a collapsed section: "Operations Archive (23 items)." She expands it. Every badge, every streak, every rank — all there, formatted as a boot-log readout. She reads through them like a yearbook.

**Minute 0:45 — The Social Discovery**
She enters her first Gauntlet lobby. Other players' profiles are visible as compact cards in the pre-match screen. She notices her card has the gold hexagonal badge in the top corner. Another player in the lobby has a **Diamond** badge. She hovers over theirs: "Demo Veteran — Diamond. Season 3: Rank #7." She whispers to herself: "They were Top 10..."

She clicks "Inspect Profile." Their Operations Archive is public — she scrolls through: Season 2, Season 3, Season 4, a 52-day streak. "They played every day for almost two months." She feels a mix of intimidation and aspiration. She sets her own archive to Public.

**Minute 2:00 — The First Match**
The match begins. She loses — her demo-era configs aren't optimized for Gauntlet-level opponents. But her profile card still shows the gold badge. The opponent who beat her hovers over it, clicks inspect. They see her demo history. In the post-match chat: "Nice, you're a demo vet! Your relay config was clever, just needed faster hook timing." The badge opened a social door — it signaled "this person has context, they're worth talking to."

**UI Annotations:**
- Demo Veteran badge in lobby: 24×24px hexagon, positioned top-right of player card, gold border with circuit trace interior
- Hover tooltip: "Demo Veteran — Gold. Tap to see full operations archive."
- Archive panel: monospace font, teal text on dark navy background, scrollable, each entry on one line with date | achievement | category format
- Public/Private toggle: in profile settings, radio buttons with preview of what others see

---

### Journey: Marcus, 38, Software Engineer, Factorio Veteran

**Context:** Marcus played the Steam demo for 2 weeks during Next Fest. He earned Demo Veteran — Silver (Top 20% weekly challenge, no season participation because Next Fest was between seasons). His demo data migrated automatically via Shared Cloud (Model B from 6.11a). He did not grind badges — he was evaluating the game for purchase.

**Minute 0:00 — The Understated Arrival**
Marcus's migration is invisible — his save was already synced. The System Upgrade ceremony plays. His 3 demo badges convert: "Silver" tier Demo Veteran badge mints. He barely registers it — he's more interested in whether his blueprint configurations survived intact. He opens the workbench. Everything is there. He starts Mission 5.

**Minute 5:00 — The Discovery**
After his first Gauntlet match (a loss), he inspects his own profile. He notices the Founding slot with his Silver hexagon. He notices the Operations Archive — expands it — and finds his Next Fest history preserved: the specific weekly challenge, his percentile, his configuration's tick count. "Oh, they kept that." He doesn't change the archive visibility — it stays on Private (default). He's not interested in flexing demo history.

**Minute 10:00 — The Encounter**
Weeks later, Marcus has earned several Gauntlet badges. His profile card now shows Gauntlet Gold tier (top 5% of players). In a lobby, he notices another player with a **Founder** tier Demo Veteran badge — the rarest tier, the one with the prismatic animated border. He clicks inspect. Their archive is public: "Season 1: Rank #1. Season 2: Rank #3. Season 3: Rank #2." Three seasons of near-championship performance in the demo. "That person was essentially the best player in the game before it even launched."

Marcus sends a friend request. The Founder badge was the signal — "this person has been here from the beginning and was dominant."

**UI Annotations:**
- Founder badge: animated prismatic border (subtle hue rotation, 8-second cycle), no tier text — the visual is unmistakable
- Auto-migration from Steam demo: no import UI, badge minting ceremony still plays on first full-game launch
- Friend request from profile: button at bottom of profile inspection panel, "REQUEST LINK" in boot-log style

---

### Journey: Tala, 22, Graphic Design Student, Manila

**Context:** Tala played the browser demo casually for 6 months — daily configs whenever she commuted on the MRT, occasional weekly challenges on her laptop. She earned Demo Veteran — Diamond (34-day streak qualified her). She designed bounties that got 200+ attempts — her aesthetic sense produced visually interesting constraint sets that the community loved. She cannot afford the full game but her demo badges are her pride.

**Minute 0:00 — The Demo Continues**
Tala doesn't buy the full game. She keeps playing the demo. Her Demo Veteran badge exists in the demo's own profile system — it's not a full-game feature. Or is it?

**The Design Question:** Do demo badges exist ONLY in the demo, waiting to be migrated? Or does the demo have its own badge display system that mirrors the full game's?

**Recommendation:** The demo has its own badge shelf. Demo badges are visible to other demo players. When the player buys the full game, the migration process transfers these badges into the full game's profile system (with the conversion/archive/founding treatment described above). But if the player never buys the full game, their demo badges still exist and have social value within the demo's own community.

Tala's profile in the demo shows her Diamond badge, her streak record, her bounty reputation. Other demo players see her and respect her. The badge system is self-contained within the demo — it doesn't require the full game to have meaning.

**The Conversion Moment (Eventually):**
When Tala's birthday arrives and her friends pool money for the full game, the migration ceremony processes her 6 months of demo badges. The archive is enormous — 47 entries. The Conversion Ceremony takes 15 seconds to scroll through. The boot-log voice reads her history with clinical precision. At the end: *"47 commendations archived. Operational history: exceptional."* The word "exceptional" — used nowhere else in the boot log's vocabulary — is earned by badge count. Only players with 40+ demo commendations trigger it. Tala screenshots it.

**UI Annotations:**
- Demo-internal badge shelf: same visual language as full game's Founding slot, but rendered in the demo's profile view
- 40+ commendation threshold for "exceptional" descriptor: hidden threshold, not shown in UI, discovered by the community
- Extended Conversion Ceremony: ceremony length scales with badge count (base: 8 seconds, +0.15 seconds per badge beyond 10)

---

### Journey: Dr. Reyes, 45, CS Professor

**Context:** Dr. Reyes's 30 students each have demo profiles from the educational deployment (6.11d-v). Students earned badges from Lab Sandbox scenarios — not the same badges as the competitive demo. Lab badges include "Scenario Clear" markers, "Optimal Solution" indicators, and instructor-assigned commendations. The department bought a site license. Do lab badges migrate?

**Minute 0:00 — The Educational Badge Problem**
Dr. Reyes wants his students' lab achievements to carry over — they represent graded work. But lab badges are fundamentally different from competitive demo badges:

| Dimension | Competitive Demo Badge | Lab Badge |
|---|---|---|
| Issued by | Automated system (leaderboard position, streak tracker) | Hybrid (scenario clear = automated; commendation = instructor) |
| Trust model | Self-verified (system generates badge from player performance) | Instructor-mediated (commendation requires instructor action) |
| Portability | Universal — any player in the demo can earn them | Scoped to classroom — only students in Dr. Reyes's class see these |
| Value context | Competitive — badge value comes from relative ranking | Educational — badge value comes from concept mastery |

**Recommendation:** Lab badges migrate into a separate **"Academy"** section of the Operations Archive — neither Demo Era nor Gauntlet, but a third category for educational context. Academy badges don't convert to any competitive equivalent (no "Circuit Pioneer" mapping). They're purely a record: "This player completed these scenarios in an educational setting." The Academy section exists for the player's own reference and for instructors who might want to verify prior coursework.

**Minute 0:30 — The Institutional Export**
Dr. Reyes uses the batch migration tool (command-line `--import-code` from 6.11a). Each student's demo save includes their lab badges. The full game recognizes lab badge data and routes it to the Academy archive. Students see their class history alongside any competitive demo badges they earned independently.

**UI Annotations:**
- Academy section: distinct from Demo Era, below it in the Operations Archive, with a graduation-cap icon
- Lab badges: grey-green border (vs. amber for demo, cyan for Gauntlet)
- Instructor commendations: include instructor name and class identifier (e.g., "Dr. Reyes — CS 271, Spring 2026")

---

## Cross-Model Comparison Matrix

| Dimension | M1: Full Transplant | M2: Demo Shelf | M3: Conversion | M4: Founding Badge | M5: Archive | M6: Hybrid |
|---|---|---|---|---|---|---|
| Information preserved | 100% | 100% | ~40% (lossy) | ~5% (peak only) | 100% | 100% |
| Profile clutter | High | Medium | Low | Minimal | Low (hidden) | Low |
| Prestige signal | High but debatable | Medium, clearly labeled | Medium, standardized | Very High, singular | Variable (public/private) | Very High + deep on demand |
| Community confusion risk | High | Low | Low | Very Low | Very Low | Very Low |
| Implementation complexity | Low | Medium | Medium | Low | Medium-High | High |
| Player emotional satisfaction | High initially, debatable long-term | Medium-High | Low-Medium (loss feels real) | High (if you got high tier) | High (nothing lost) | Highest (layered satisfaction) |
| Namespace collision risk | High | None | None | None | None | None |
| Matchmaking utility | Direct (can count badges) | Direct (separate display) | Direct (converted to standard) | Tier only | Count from archive | All three layers available |

---

## The Sunset Problem: When the Demo Dies

The demo's competitive infrastructure may not run forever. Servers hosting leaderboards might shut down. Daily challenges might stop rotating. When the demo goes dark:

### Scenario A: Demo Stays Live as Static Archive
The demo stops generating new challenges but preserves all historical data. Players can still access their profiles, view old leaderboards, export migration codes. Badges stop being earnable but existing badges remain. The demo becomes a **museum** — you can visit but nothing new happens.

**Effect on badge migration:** No change. Existing migration paths work. New players cannot earn demo badges. The Founding badge's scarcity increases every day the demo is in archive mode.

### Scenario B: Demo Shuts Down Completely
The domain expires or redirects to the full game's purchase page. All demo-specific data lives only in localStorage on the player's original browser. Players who migrated are safe; players who didn't lose everything.

**Effect on badge migration:** Creates urgency. The game should send a "sunset warning" email/notification to all demo accounts with competitive history: "Your demo operations archive will be preserved until [date]. Export your migration code before then." The sunset warning itself becomes a conversion event — "you're about to lose your badges, buy the game to preserve them." Ethically grey (manufactured urgency) but effective.

**Recommendation:** Scenario A. The demo should be kept in static archive mode indefinitely. The cost is near-zero (static files on a CDN). The value is permanent: every demo veteran's history remains accessible, and the museum itself becomes a prestige artifact.

### Scenario C: Demo Gets Seasons in Perpetuity
The demo continues running competitive events even after the full game launches — a permanent free competitive tier, like Fortnite's free-to-play mode sitting beneath the paid Battle Pass layer. Demo badges continue being earnable. The "Demo Veteran — Founder" tier transitions from "played during beta" to "played during era X."

**Effect on badge migration:** The Founding badge must be versioned. "Founding Era: 2026 Q2" vs. later eras. The earliest era is the rarest. Badges migrate at purchase regardless of when the purchase happens — whether during the founding era or 3 years later.

---

## Interaction Effects

- **6.11a — Save migration (all models):** Badge data travels in the same migration payload as campaign progress and blueprints. The migration code/file includes a `badges` array in the save schema. Badge migration is not a separate system — it's a field in the save data.
- **7.03e — Cross-platform sharing:** If a player shares a Config Code that includes their profile snapshot (for "who designed this?" attribution), the profile snapshot should include their Demo Veteran badge. The badge travels with shared configs as an author credential.
- **7.10 — Config necropsy culture:** Demo veterans' necropsies carry more credibility because the badge signals depth of experience. The badge is a trust signal in community discourse.
- **Campaign progression (locked):** Demo badges are orthogonal to campaign progress. A player can have Diamond Demo Veteran with zero campaign missions complete in the full game (if they only played competitive demo modes). The two histories coexist without interaction.
- **Gauntlet ratings (locked):** Demo badges do NOT affect initial Gauntlet MMR. A Demo Veteran — Diamond does not start at a higher Gauntlet rating than a fresh player. Badges are social proof, not mechanical advantage. However, the converted badge data (Model 6, Layer 3) could feed into **matchmaking confidence** — the system's certainty that it knows the player's skill level. A player with 23 demo commendations should be placed confidently after fewer calibration matches than a complete unknown.
- **8.04e — MVG as web demo:** If the minimum viable game IS the demo, then badge migration is the transition from "free web game" to "paid expanded game." The badge system must exist from the MVG's first deployment.
- **4.69e-i-a-vi-a — Profile-scoped settings:** Badge visibility settings (Public/Private/Friends Only) must be profile-scoped. If multi-profile exists, each profile has independent badge visibility.

---

## Sensory Design

**The Badge Minting Animation:**
The Demo Veteran badge materializes in three phases. Phase 1 (0-800ms): a hexagonal outline draws itself clockwise from the top vertex, thin teal line on dark background, accompanied by a high-pitched crystalline hum that rises in pitch as the outline completes. Phase 2 (800-1600ms): circuit traces fill in from the edges toward the center, each trace a slightly different shade of the tier color (copper/silver/gold/prismatic), with tiny sparkle particles at the leading edge of each trace — the sound transitions to a crackling electric sizzle, like solder touching a circuit board. Phase 3 (1600-2200ms): the tier text fades in at center ("GOLD"), the border shifts to its final color, and a single resonant tone (different per tier — C4 for Bronze, E4 for Silver, G4 for Gold, C5 for Diamond, a major chord for Founder) rings and sustains with 3-second reverb. The badge settles into its Founding slot position with a gentle 200ms ease-out bounce.

**The Archive Scroll:**
When the Operations Archive expands, entries appear one at a time with a 60ms stagger — each entry sliding in from the left with a soft typewriter keystroke sound (mechanical keyboard, Cherry MX Blue profile). The total expansion takes `entry_count × 60ms + 200ms` (a 23-entry archive takes ~1.6 seconds). Collapsing the archive plays the same animation in reverse at 2× speed with a softer, lower-pitched keystroke cascade — entries slide right and fade. The scroll area has a subtle scanline overlay (3% opacity horizontal lines at 2px spacing) evoking a CRT terminal readout.

**The Founder Badge (Rarest Tier):**
The Founder badge has a continuously animated border — not flashy, but alive. The circuit traces in the border slowly shift hue through the visible spectrum (8-second full cycle), giving it a subtle prismatic quality. In low ambient light (dark UI theme), the badge casts a faint glow onto adjacent UI elements (a 4px radial gradient at 8% opacity). When another player hovers over a Founder badge on someone else's profile, the cursor changes to a small magnifying glass and the badge scales up 120% with a 200ms ease-out — the inspection gesture itself is designed to feel like examining a rare artifact.

---

## Recommendation

**Model 6 (The Hybrid)** for all player-facing systems, with these specifics:

1. **Founding Badge:** Demo Veteran in five tiers (Bronze/Silver/Gold/Diamond/Founder). Always visible in the dedicated Founding slot. Permanently earned, never re-earnable after the demo era concludes.
2. **Operations Archive:** Full demo history, expandable, visibility-controlled (default: Private). The archive is the player's property — they choose who sees it.
3. **System Integration Layer:** Converted badge counts feed matchmaking confidence (not MMR) and community trust level. Invisible to the player but improves their early full-game experience by reducing calibration match count.
4. **Academy Section:** Lab/educational badges in a separate archive partition, never mixed with competitive badges.
5. **Sunset Plan:** Demo enters static archive mode (Scenario A) after full game launches. Demo badges remain accessible but stop being earnable. The Founding slot's scarcity increases over time.

The layered approach respects the game's own design philosophy: information can be compressed (Founding Badge) without being destroyed (Archive). The same principles the player learns about context window management — eviction, compression, prioritization — apply to their own achievement history.

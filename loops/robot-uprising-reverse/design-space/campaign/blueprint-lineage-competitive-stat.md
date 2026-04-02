# Blueprint Lineage as Competitive Stat

**Aspect:** 5.20c — Blueprint performance histories as competitive Gauntlet metadata
**Category:** Campaign / Competitive Progression
**Wave:** 5 (Campaign & Progression)
**Depends on:** [5.22 — The Gauntlet as third act](gauntlet-as-third-act.md), [7.10 — Config necropsy as community artifact](../multiplayer/config-necropsy-community-artifact.md), [1.04g — Live win-rate as persistent identity](../competitive-analysis/live-winrate-persistent-identity.md)

---

## The Design Question

Every blueprint in Robot Uprising has a story. It was created at some point during the campaign or Gauntlet, iterated over dozens of matches, deployed hundreds or thousands of times. Units spawned from it lived and died. Some survived entire matches. Others were shredded in the first 30 ticks.

The question is: **should the game track and display this history, and if so, what does it mean when your opponent can see that your "Ironclad Relay v14" blueprint has been deployed 347 times with a 71% unit survival rate?**

This is a question about three things simultaneously:

1. **Craft pride.** When a woodworker marks their furniture with a signature, the signature carries meaning proportional to the body of work behind it. A blueprint with a deep history is a signed piece of engineering. The stat line is the craftsman's mark.

2. **Competitive intelligence.** If opponents can see your blueprint lineage stats before or during a Gauntlet match, those stats become scouting data. A blueprint with 200+ deployments and a high kill-per-unit ratio signals danger. A brand-new v1 blueprint signals either experimentation or a surprise pivot. Both create pre-match psychological texture.

3. **Emergent narrative.** A blueprint that has evolved from v1 through v14 across 50 Gauntlet matches carries a narrative arc that the player lived through but nobody else witnessed. Lineage stats make that invisible arc partially visible --- turning private iteration history into a public-facing identity artifact.

The tension: **the more data you expose, the richer the competitive metagame becomes, but the more exploitable the information asymmetry becomes.** A player who pads their stats in low-Elo matches, a player who hides their real blueprint behind a fresh-named decoy, a player who studies opponent lineage stats more than they study their own architecture --- these are all failure modes of a system designed to celebrate craft.

---

## What Gets Tracked Per Blueprint

### Tier 1: Core Performance Stats

These are the numbers that define a blueprint's operational history:

- **Total Deployments** --- how many individual units have been spawned from this blueprint across all matches. A high number signals commitment to a design. Low hundreds are common for campaign-only blueprints; Gauntlet regulars accumulate thousands.
- **Survival Rate** --- percentage of spawned units that were alive when the match ended (win or loss). A 90% survival rate means the blueprint produces durable units. A 15% survival rate means the units are disposable --- which might be intentional for aggressive scout builds.
- **Average Lifespan** --- mean tick count from spawn to destruction (or match end for survivors). Contextualizes survival rate: a 50% survival rate with a 400-tick average lifespan tells a different story than a 50% survival rate with a 30-tick average lifespan.
- **Kills Per Unit** --- average number of enemy units destroyed per deployed unit. A relay blueprint might have 0.0 kills per unit and still be the most valuable piece of the architecture. A combat specialist might average 3.2. Neither number is inherently "better" --- they reveal role, not quality.
- **Win Contribution** --- the percentage of matches won where this blueprint was part of the deployed architecture. A blueprint with 200 deployments across 40 matches, where 32 of those matches were won, has an 80% win contribution. This is the stat most resistant to gaming --- you can inflate deployments by spawning units pointlessly, but you cannot inflate wins.

### Tier 2: Lineage Metadata

These track the blueprint's evolution as a design artifact:

- **Version Count** --- how many iterations this blueprint has gone through. v1 is the original. v14 means 13 modifications were made. Each version is a saved snapshot (see config necropsy, aspect 7.10).
- **First Created** --- timestamp of v1. A blueprint born in Mission 3 that is still active in Gauntlet Season 4 carries different weight than one created yesterday.
- **Lineage Depth** --- if this blueprint was forked from another player's shared config, the fork chain is tracked. "Forked from @kai_architect's Ironclad Relay v5, itself forked from @null_signal's Dense Buffer v2." A deep lineage signals community provenance. An original (depth 0) signals independent invention.
- **Parent Blueprint** --- if this blueprint was derived by splitting or specializing an earlier design, the parent relationship is preserved. "Evolved from Scout Array v3" tells other players that this blueprint shares DNA with a known design.

### Tier 3: Contextual Performance

These stats are match-context-sensitive and only meaningful in aggregate:

- **Elo Range Performance** --- survival rate, kills per unit, and win contribution broken down by the Elo band of the match. A blueprint that performs at 85% win contribution below Elo 1200 but drops to 40% above 1400 has a visible ceiling. This is the most competitively dangerous stat to expose.
- **Counter Profile** --- which enemy blueprint archetypes this blueprint performs best and worst against, derived from post-match classification. "Strong against scout-rush (78% win rate), weak against hack-disrupt (31% win rate)." This is scouting gold if visible.
- **Peak Streak** --- longest consecutive win streak involving this blueprint. A vanity stat, but streaks are psychologically potent. "This blueprint was part of a 17-match win streak in Gauntlet Season 2."

---

## How Lineage Versioning Works

Every time a player modifies a blueprint in the workbench and deploys it (queues it for production in a mission or Gauntlet match), the game auto-saves the pre-modification state as a version snapshot. The player never has to manually "save" --- the version history is automatic, like an undo stack that never clears.

Versions are numbered sequentially: v1, v2, v3. The player can optionally name versions ("pre-hack-experiment," "anti-scout-final") but auto-naming generates two-word descriptors from the blueprint's configuration ("relay-heavy," "dual-channel," "hack-stealth").

The version history is accessible from the workbench's clock icon (established in the config necropsy design, aspect 7.10). Stats are computed per-version AND aggregated across the entire lineage. A player can see that v8 of their blueprint had a 45% survival rate while v9 jumped to 72% --- the modification that bridged those versions was meaningful.

**Forking creates a new lineage.** If a player imports someone else's shared blueprint, it begins a fresh lineage at v1 with zero stats --- but carries a "forked from" attribution tag. The original creator's stats do not transfer to the fork. This prevents stat inheritance exploits and ensures every lineage represents actual deployment history.

---

## Player Journeys

### Journey 1: Mira, Gauntlet Veteran — The Pride of the Lineage

**Context:** Mira has been playing Gauntlet for two months. Her primary architecture centers on a blueprint called "Signal Cascade" --- a relay-specialist hybrid that compresses and redistributes information across her entire formation. It is now at v11, with 483 total deployments across 87 Gauntlet matches.

**The Moment:** Mira opens her workbench before queueing for a Gauntlet match. She hovers over Signal Cascade's blueprint card. Beneath the name, a compact stat line reads:

```
SIGNAL CASCADE v11 — 483 deployed / 68% survival / 0.4 kills/unit / 74% win
Est. 2026-02-14 — Original lineage
```

She has seen this stat line grow over weeks. The survival rate was 41% at v3 --- that was before she added the eviction priority change that stopped buffer overflow under scout-flood conditions. She remembers the specific match where v3 failed catastrophically: 8 relay units all evicting the same critical signal simultaneously, creating a dead zone that the enemy walked through unopposed. v4 fixed that. The survival rate jumped to 58%. By v7, after adding a hook that let relays warn each other about buffer pressure, it hit 65%. The current 68% represents three more incremental refinements.

The 0.4 kills/unit is low. Signal Cascade is not a combat blueprint. But Mira knows that her combat blueprint, "Puncture Wing v6," averages 2.8 kills/unit specifically because Signal Cascade feeds it targeting data with sub-tick latency. The stats tell an incomplete story in isolation. Together, they describe an architecture.

Mira screenshots her blueprint panel --- Signal Cascade's stat line next to Puncture Wing's --- and posts it to the community hub with: "Two months of iteration. 87 matches. Every version taught me something." Twelve reactions within the hour. A Commander-tier player replies: "That survival rate curve from v3 to v11 is a textbook case of convergent relay design. Would you share the v3→v4 diff? I hit the same wall."

**What matters here:** The stat line is not a leaderboard position. It is a craft signature. Mira's pride is not in being ranked #47 on the Gauntlet ladder. It is in the visible evidence that she iterated, learned, and improved a specific design over a sustained period. The stats are proof of work.

### Journey 2: Tomasz, Pre-Match Scout — Reading the Opponent

**Context:** Tomasz is a Gauntlet player who has developed a habit of studying opponent blueprints in the pre-match lobby. Before each Gauntlet match, both players' blueprint names and Tier 1 stats are visible (but not the actual configurations).

**The Moment:** Tomasz queues into a Gauntlet match. The pre-match screen loads. His opponent's architecture shows three blueprints:

```
DENSE RELAY v22 — 1,247 deployed / 81% survival / 0.1 kills/unit / 69% win
GLASS CANNON v3 — 34 deployed / 12% survival / 4.7 kills/unit / 69% win
WATCHDOG v8 — 201 deployed / 55% survival / 1.1 kills/unit / 69% win
```

Tomasz reads the stats like a poker player reading betting patterns. Dense Relay v22 with 1,247 deployments: this is the opponent's core. Twenty-two versions deep. Eighty-one percent survival. This blueprint is battle-hardened and refined to a degree that suggests the opponent has been running relay-heavy architectures for a long time. The 0.1 kills/unit confirms it --- pure information infrastructure, not a combat unit.

Glass Cannon v3 is new. Only 34 deployments, only three versions. The name and the 12% survival rate tell the same story: disposable damage dealers. The 4.7 kills/unit is alarming --- each Glass Cannon takes out nearly five enemies before dying. But v3 means the opponent is still iterating. There might be a weakness in the current version that hasn't been refined away yet.

Watchdog v8 at 55% survival is the pivot point. It is probably a defensive or command unit --- moderate survivability, moderate kills. The 201 deployments mean it is established but not as core as the relay.

Tomasz's read: "Relay-anchored architecture with expendable damage spikes. The Glass Cannon is the recent addition --- probably a response to losing against tanky opponents. I should target the Dense Relay. If I disrupt the information backbone, the Glass Cannons lose their targeting data and become expensive noise."

He adjusts his blueprint loadout accordingly. He swaps in his hack-specialist blueprint --- one he has been experimenting with for exactly this kind of relay-dependent opponent.

**What matters here:** The lineage stats did not reveal the opponent's configuration. Tomasz does not know the rules, hooks, context config, or skill loadout of any enemy blueprint. But the metadata --- deployment count, version depth, survival rate, kill ratio --- gave him a structural read. He inferred the opponent's design philosophy from the numbers. This is competitive intelligence derived from craft history, not from viewing the actual config.

### Journey 3: Yuki, New Gauntlet Entrant — The Intimidation Factor

**Context:** Yuki just finished Mission 10 and entered her first Gauntlet match. Her blueprints are all v1 through v3, with deployment counts in the single digits. She has never seen an opponent's stat line before.

**The Moment:** The pre-match screen loads. Her opponent:

```
IRON SPINE v19 — 892 deployed / 77% survival / 0.3 kills/unit / 72% win
SWARM FANG v15 — 1,103 deployed / 23% survival / 2.9 kills/unit / 72% win
NERVE CENTER v12 — 445 deployed / 88% survival / 0.0 kills/unit / 72% win
```

Yuki stares at the numbers. Her own blueprints:

```
BASIC SCOUT v2 — 8 deployed / 50% survival / 0.5 kills/unit / 60% win
FACTORY DEFAULT v1 — 4 deployed / 75% survival / 0.0 kills/unit / 60% win
```

The disparity is visible and immediate. Her opponent has deployed over 2,400 units. She has deployed 12. Their blueprints have been refined through 46 combined versions. Hers have been modified once.

Yuki's first emotional response: intimidation. This person has been doing this for a long time. The numbers are a wall of experience she has not accumulated.

Her second response, 10 seconds later: curiosity. Nerve Center v12 has 0.0 kills per unit and 88% survival. What IS that? A pure command agent? An information node that never engages in combat but somehow contributes to a 72% overall win rate? That is a design concept she has not considered. She files it away.

The match plays out. She loses --- predictably, comprehensively. But the debrief reveals something specific: her opponent's Swarm Fang units were being dynamically retargeted by the Nerve Center. The 0.0-kill command node was the brain; the 2.9 kills/unit swarm was the teeth. The architecture was legible in the stats, if she had known how to read them.

**What matters here:** The intimidation is real, but it is also informative. Yuki did not feel cheated by a hidden advantage --- the opponent's advantage was visible, understandable, and earned through iteration. The stat disparity motivated rather than demoralized because it was accompanied by legible design information. She did not lose to a black box. She lost to 46 versions of refinement, and she can see the shape of what she needs to build.

---

## Strengths and Weaknesses

### Strengths

**Craft visibility creates long-term motivation.** Unlike Elo, which is a single number reflecting recent performance, lineage stats tell a story of sustained design effort. A player who has iterated a blueprint through 20 versions has physical evidence of their engineering journey. This is the "GitHub contribution graph" effect --- the accumulation itself is rewarding, independent of the current state.

**Pre-match scouting adds strategic depth without revealing secrets.** The stat line tells you the opponent's design philosophy (relay-heavy, swarm-based, command-centered) without revealing the actual configuration. This creates a layer of competitive reading that rewards experience --- veteran players develop literacy in "stat line interpretation" the way poker players develop literacy in betting patterns.

**Blueprint pride drives community sharing.** Players who are proud of a lineage are more likely to share changelogs, write necropsies, and participate in community discussion. The stat line is a conversation starter: "How did you get that survival rate so high on a hack blueprint?" This feeds directly into the config necropsy culture (aspect 7.10).

**Version depth signals trustworthiness for shared blueprints.** When browsing community-shared blueprints, a v22 blueprint with 1,200 deployments is a different proposition than a v1 with 3 deployments. The stats serve as a credibility signal for community content curation.

### Weaknesses

**Stat padding is an obvious exploit.** A player could inflate deployment counts by running throwaway Gauntlet matches against low-Elo opponents, spawning maximum units, and surrendering. The numbers would look impressive but represent nothing. Mitigation: weight stats by Elo band, or only count deployments above a minimum match-Elo threshold.

**Information asymmetry punishes experimentation.** If opponents can see your stat lines, fielding a v1 blueprint in a competitive match broadcasts that you are experimenting. Experienced opponents will target your new design specifically because the low deployment count signals vulnerability. This creates pressure to never experiment in competitive matches --- the opposite of the "iterate boldly" ethos the game wants to foster. Mitigation: allow players to hide stat lines for blueprints below a threshold (e.g., fewer than 20 deployments), or restrict stat visibility to post-match only.

**Survival rate is misleading for intentionally disposable units.** A scout-rush blueprint with a 15% survival rate looks terrible on paper but might be the optimal design for its role. Players who do not understand the full architecture might judge a blueprint by its survival rate alone. This creates a risk of "stat vanity" --- players optimizing for stat-line appearances rather than architectural effectiveness. Mitigation: provide context labels ("Combat," "Support," "Recon," "Command") that frame the stats appropriately.

**Veteran stat lines intimidate new players.** Journey 3 illustrates this directly. The first time a new Gauntlet entrant sees a 1,000+ deployment opponent, the match feels predetermined. If this happens repeatedly in early matchmaking, it could drive attrition. Mitigation: matchmaking should weight deployment-count disparity as a soft factor, or the pre-match screen should be optional for players below a certain Elo.

**Scouting meta could calcify.** If stat-line reading becomes the dominant pre-match activity, players might converge on "safe" architectures whose stat lines give away nothing --- balanced deployment counts, moderate survival rates, no extreme kill ratios. The most interesting architectures (extreme specialists, unconventional roles) would be legible from their stats and therefore counterable. Mitigation: limit the granularity of pre-match stats (e.g., show deployment bands --- "100+", "500+", "1000+" --- instead of exact numbers).

---

## Interaction Effects

### Gauntlet Matchmaking

If stat lines are visible pre-match, the matchmaking system needs to account for perception, not just Elo. Matching a brand-new Gauntlet entrant (12 total deployments) against a veteran (2,400 total deployments) at similar Elo creates a perception of unfairness even if the match is actually balanced. Options: (a) show stats only to the stat-owner, never to the opponent; (b) show stats only after the match; (c) delay stat visibility until both players have 50+ Gauntlet matches, creating a "fog of war" period for newcomers.

### Config Necropsy Culture

Blueprint lineage stats are the natural entry point for config necropsies. When a player posts "Signal Cascade went from 41% survival at v3 to 68% at v11," the version-specific stats provide the narrative backbone. The changelog feature (aspect 7.10, Model 1) is enhanced by lineage stats because the stats give each version transition a quantifiable before/after. The community can discuss whether a v8-to-v9 change was worthwhile by looking at the stat delta --- "survival went up 4% but kills/unit dropped 0.3, was that a good trade?" --- rather than arguing purely from configuration inspection.

### Architecture Sharing and Forking

When shared blueprints carry lineage stats, the community workshop becomes a marketplace of proven designs. Players browse not just by blueprint configuration but by deployment history: "Sort by: most deployed," "Filter: survival rate > 70%," "Filter: version count > 10." This creates a quality signal that helps newcomers find battle-tested starting points. The fork attribution chain means popular designs develop visible genealogies --- "this blueprint was forked 47 times" becomes a community endorsement.

### The "Retired Number" Phenomenon

Long-running blueprints develop sentimental weight. A player who retires a v22 blueprint after it stops being competitive --- replacing it with a fresh design informed by everything the old one taught --- might want to "retire" it visibly, preserving its stats as a museum piece. This parallels jersey retirement in professional sports: the design served its purpose, its record stands, and it is preserved as history rather than discarded as obsolete. The workbench could have a "Retired" shelf where old blueprints sit with their full stat lines visible but grayed out, no longer deployable.

---

## Comparable Games

### Pokemon: The Hidden Stat Culture

Pokemon tracks hidden stats (IVs, EVs, natures) that dramatically affect competitive performance but are invisible to opponents during battle. The community built an entire subculture around stat optimization --- IV calculators, EV training guides, breeding chains to produce perfect-stat Pokemon. The stats are tracked, cherished, and discussed, but never displayed to the opponent. Robot Uprising's blueprint stats are the inverse: visible to opponents, creating scouting rather than hidden optimization. The risk is that visible stats incentivize stat-line gaming rather than genuine design improvement.

Pokemon also has a "shiny" mechanic --- rare visual variants that carry no mechanical advantage but enormous social prestige. A shiny competitive Pokemon signals dedication (hours of breeding/hunting). Blueprint lineage depth serves a similar function: a v22 blueprint does not fight better than a v3 blueprint because of its version number, but the version number signals sustained investment that the community recognizes and respects.

### CS:GO StatTrak Weapons

CS:GO's StatTrak weapons track kill counts on weapon skins. The kill counter is visible to anyone who picks up the weapon or spectates the player. A StatTrak AK-47 with 15,000 kills tells a story: this player has used this specific weapon skin for hundreds of hours of competitive play. The counter has no mechanical effect. It is pure prestige.

The critical design lesson from StatTrak: **players will optimize for the counter.** Some players refused to use non-StatTrak weapons even when the skin was inferior, specifically to keep building their kill count. Some purchased high-kill-count StatTrak weapons on the marketplace to display inflated numbers. CS:GO eventually added a "StatTrak Swap Tool" to transfer counts between weapons, acknowledging that the number had become emotionally significant enough to warrant infrastructure.

Robot Uprising should expect the same behavior: players will become attached to their blueprint stat lines and resist replacing designs, even when replacement is the correct competitive move. This is both a strength (emotional investment) and a weakness (design rigidity).

### Breeding Lineages in Pokemon and Monster Hunter Stories

Pokemon breeding chains produce offspring whose stats are partially inherited from parents. Competitive breeders maintain detailed lineage records --- which parent contributed which IVs, how many generations of selective breeding produced the final specimen. Monster Hunter Stories 2 has a similar system where monster genes are inherited through a rite of channeling, creating traceable genetic lineages.

Blueprint forking in Robot Uprising creates an analogous lineage structure. A blueprint forked from a community-shared design, modified through 8 versions, then forked again by another player creates a three-generation lineage. If the system tracks and displays these fork chains, the community can trace "design genealogies" --- which foundational designs influenced the current Gauntlet meta, who the original architects were, how designs diverged after forking.

### Dwarf Fortress: Legendary Artifacts with Embedded History

Dwarf Fortress generates procedural descriptions for legendary artifacts that include the circumstances of their creation, the materials used, and the events depicted in their engravings. A legendary steel hammer might be described as "encircled with bands of iron" and "decorated with an image of dwarves and goblins in copper, relating to the siege of 1053." The object carries its history physically.

A blueprint with deep lineage stats is Robot Uprising's equivalent of a legendary artifact. The stat line IS the engraving --- it records where the blueprint has been, what it has survived, and how it evolved. The version history is the procedural narrative. If the game rendered this history as part of the blueprint's visual identity (see below), the parallel would be exact.

---

## Sensory Descriptions: The "Veteran Blueprint" Visual Language

### The Blueprint Card

Every blueprint is represented in the workbench as a card: a rectangular panel showing the blueprint name, a schematic icon representing its primary role, and its configuration summary. Lineage stats modify the card's visual treatment based on deployment history.

**Fresh Blueprint (v1, < 10 deployments):** The card has clean, sharp edges. The schematic icon is drawn in thin cyan lines on a dark background. The surface is matte. The card looks factory-new --- no wear, no history. The stat line reads in dim, low-contrast text: barely there, because there is barely anything to report.

**Established Blueprint (v3-v8, 50-200 deployments):** The card edges develop a subtle bevel. The schematic icon lines thicken slightly, as if the circuit traces have been reinforced. A faint patina appears on the card surface --- not damage, but use. Like a well-handled tool whose grip has been worn smooth. The stat line text brightens to standard contrast. The version number is now prominent.

**Veteran Blueprint (v10+, 500+ deployments):** The card edges gain a distinctive border --- a thin amber line that pulses faintly, like a circuit carrying current. The schematic icon is now drawn in thicker, confident lines with occasional branching details that suggest complexity accrued over time. The card surface has a visible grain, like brushed metal that has been handled thousands of times. The stat line text is fully bright, and the deployment count is displayed in a slightly larger font. A small glyph appears in the card's corner: a tiny version-history graph, no bigger than a thumbnail, showing the survival-rate trend across all versions as a miniature sparkline.

**Legendary Blueprint (v20+, 1000+ deployments):** The amber border becomes a full frame. The schematic icon gains fine filigree details --- decorative line work that serves no functional purpose but signals age and refinement, like the scrollwork on a master craftsman's signature tool. The card surface has a warm metallic sheen. The sparkline in the corner is now accompanied by a second line showing the win contribution trend. The overall effect is unmistakable: this card looks different from every other card in the workbench, and anyone who sees it in a pre-match screen or a community post knows immediately that this blueprint has been through hundreds of matches.

### The Pre-Match Display

In the Gauntlet pre-match screen, both players' blueprint cards are displayed in a horizontal row beneath their player names. The visual aging of cards is immediately apparent: a row of veteran and legendary cards conveys experience at a glance, before any stat is read. The amber-framed legendary card stands out from fresh cards the way a battle-scarred veteran's equipment differs from a recruit's issue gear.

Between the two players' rows, a thin dividing line pulses slowly --- the match is about to begin. The stat lines beneath each card fade in sequentially, left to right, with a typewriter cadence: each number appearing with a soft mechanical click, like a ticker tape printing results. Total deployments first (the big number), then survival rate, then kills per unit. The effect is deliberate revelation --- each stat adds a layer to the opponent's profile.

### The Post-Match Stat Update

After a Gauntlet match ends, during the debrief, each surviving blueprint card receives an updated stat line. The new numbers replace the old with a brief counter-roll animation: the deployment count ticks up by the number of units spawned that match, the survival rate adjusts, the kills/unit recalculates. If the match was a win, the win contribution percentage adjusts with a green flash. If a loss, a red flash.

If a blueprint crosses a visual threshold during this update (e.g., from 499 to 512 deployments, crossing the 500-deployment "veteran" mark), the card undergoes its visual transformation in real time: the amber border fades in, the line work thickens, the sparkline appears. This is a quiet celebration --- no fanfare, no popup, just the card itself acknowledging that a threshold has been passed. The card looks different now. It earned it.

The sound design for this moment: a single low tone, like a forge hammer striking an anvil at a distance. Not triumphant. Workmanlike. The sound of a tool that has been used enough to change.

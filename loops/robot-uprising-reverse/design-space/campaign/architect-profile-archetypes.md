# Architect Profile Archetype Design

**Aspect:** 5.20b — Architect Profile archetype design: the full set of architectural style archetypes (Switchboard Operator, Sniper, Sentinel, etc.); how many, how they're computed, how they change over the campaign, whether they're visible to other players
**Category:** Campaign / Identity
**Wave:** 5 (Onboarding & Campaign)

---

## The Design Question

A player spends 12 hours across 10 campaign missions designing attention systems. Over that time, they develop habits. One player builds everything around a dense relay mesh with high-throughput compression and centralized command. Another runs lean autonomous strikers with minimal communication, each unit making its own decisions from local context. A third creates elaborate hook chains where every unit's behavior depends on signals from three others.

These habits are architectural styles. They emerge naturally from the player's design choices, preferences, and mental models. The question: **should the game recognize and name these styles?**

If yes, the Architect Profile becomes a mirror — the game telling the player "here is the kind of engineer you are." This creates identity, community vocabulary, matchmaking signals, and aspiration targets. If no, styles remain implicit and self-discovered, preserving the purity of emergent identity but losing the legibility that drives social engagement.

The behavioral signature system (from 1.06 Gladiabots analysis) already names individual unit performances per match — "The Switchboard," "The Canary," "The Perimeter Walker." The Architect Profile operates one level higher: it classifies the *designer*, not the design artifact. A unit earns "The Switchboard" from one match. A player earns "Switchboard Operator" from a pattern of choices across dozens of matches.

This distinction matters. Unit signatures are ephemeral — the same blueprint produces different signatures in different matches. Architect Profiles are stable — they represent the player's underlying design philosophy, which changes slowly (or not at all). The profile is to the signature what a person's handwriting style is to any individual letter they write.

---

## The Archetype Set

Eleven archetypes, organized into three families based on the primary design axis they emphasize: information flow, combat doctrine, and meta-architecture. Every player's profile is a weighted blend — no one is purely one archetype. The primary archetype is the one with the highest weight. The secondary (if within 15% of primary weight) creates a compound label: "Switchboard Operator / Sentinel."

### Family 1: Information Flow (How data moves through the army)

**1. Switchboard Operator**
*"Every signal passes through me."*

Design pattern: Centralized relay architecture. One or two relay units handle 70%+ of all signal traffic. High buffer sizes on relays, aggressive compression skills, many listen channels. The army is a star topology — robust when the hub is alive, catastrophic when it goes down.

Computed from: relay unit signal throughput concentration (Herfindahl index of signals-per-unit), average relay buffer utilization > 65%, compression skill usage frequency.

Characteristic failure mode: single point of failure cascade. Enemy specialist hacks the central relay and the entire army goes dark.

Real-world parallel: the engineer who builds everything through one API gateway, one message bus, one central database.

**2. Gossip Network**
*"Everyone talks to everyone."*

Design pattern: Distributed peer-to-peer communication. Many channels, low concentration. Every unit both sends and receives. No central relay — instead, information percolates through overlapping hook chains. High channel count (8+), low per-channel throughput, wide listen configurations on all unit types.

Computed from: channel count > 8, signal traffic entropy (high = distributed), percentage of units with both send and receive hooks > 60%.

Characteristic failure mode: noise saturation. So many signals that context windows fill with low-priority chatter. Units stun-lock from information overload during high-intensity moments.

Real-world parallel: the engineer who subscribes every microservice to every event bus topic because "they might need it."

**3. Dead Drop**
*"Silence is data."*

Design pattern: Minimal communication architecture. Units operate on local context with rare, high-value transmissions. Low channel count (1-3), high signal-to-noise ratio, most units have empty listen configurations. When a signal fires, it matters.

Computed from: average signals per tick < 0.5, channel count <= 3, percentage of units with zero listen hooks > 40%.

Characteristic failure mode: coordination collapse. Units make locally rational decisions that are globally incoherent because they lack shared context. Two strikers converge on the same target while a third enemy flanks unopposed.

Real-world parallel: the engineer who avoids distributed systems entirely, preferring monolithic self-contained services that never call each other.

### Family 2: Combat Doctrine (How the army engages threats)

**4. Sniper**
*"One shot, one purpose."*

Design pattern: Striker-heavy composition with precision targeting rules. Few units, each with narrow, highly specific rule sets. Rules have many conditions — units only act when the situation exactly matches. Low production count, high per-unit configuration depth.

Computed from: average rule condition count > 3, striker composition > 40%, production queue length < 5, average rules per blueprint > 6.

Characteristic failure mode: brittleness. The army excels in predicted scenarios and collapses when the mission presents an unpredicted situation. Rules are so specific that edge cases produce no matching action — units freeze.

Real-world parallel: the engineer who writes 200-line if/else chains that handle every known case perfectly and crash on the 201st.

**5. Swarm Director**
*"Quantity has a quality all its own."*

Design pattern: Mass production of simple units. Short production queue cycling through cheap blueprints. Minimal per-unit configuration — each unit has 2-3 rules, 1-2 skills, basic context. The army wins through saturation, not sophistication.

Computed from: total units produced > 1.5x mission average, average rules per blueprint < 3, average skills per blueprint < 2, production queue cycle time < 4 ticks.

Characteristic failure mode: efficiency collapse. Each unit contributes so little that losing several changes nothing, but the army generates enormous signal noise from many low-value sources. Command overhead overwhelms any coordination layer.

Real-world parallel: the engineer who spins up 50 Lambda functions for a problem that needs three well-designed services.

**6. Sentinel**
*"Nothing gets through."*

Design pattern: Defensive perimeter architecture. Scouts positioned as early warning, relays in protected positions, strikers held in reserve until threat is confirmed. Heavy use of tagging (scouts tag, strikers engage tagged targets). Hooks are predominantly reactive — "when tagged enemy enters zone, engage." Low aggression, high survivability.

Computed from: average unit survival rate > 70%, average engagement tick > 50% of match length, tagging skill usage on scouts, striker rule sets dominated by tag-conditional actions.

Characteristic failure mode: timeout losses. The defensive posture is so thorough that the army never mounts an offensive. In elimination missions, enemies eventually overwhelm the static defense through attrition. In base-destruction missions, the player never pushes.

Real-world parallel: the engineer who builds perfect monitoring, alerting, and rollback systems but ships no features.

### Family 3: Meta-Architecture (How the system manages itself)

**7. Conductor**
*"The orchestra plays my score."*

Design pattern: Command-unit-centric architecture. One or two command agents with skill sets focused on reassignment, rerouting, and subordinate management. The command unit adjusts other units' behavior mid-battle. Deep hierarchy — command issues orders, relays distribute them, units comply.

Computed from: command unit reassignment action count > 5 per match, presence of reroute/reassign skills on command unit, subordinate skill-adjustment hooks.

Characteristic failure mode: decapitation. Kill the command unit and the army reverts to static baseline behavior. The more the conductor controls, the more catastrophic their loss.

Real-world parallel: the engineering manager who makes every technical decision personally and whose team cannot function when they are on vacation.

**8. Watchmaker**
*"Every gear turns the next."*

Design pattern: Elaborate hook chains where unit behaviors are deeply interdependent. Long causal chains: scout sees enemy, triggers relay hook, relay compresses and forwards, triggers striker repositioning hook, striker moves, triggers second scout's patrol update hook. Five or more links in a single causal chain. The army is a Rube Goldberg machine that produces elegant outcomes from complex wiring.

Computed from: maximum causal chain length > 5, hook count per blueprint > 3, percentage of actions triggered by hooks (vs. direct rule evaluation) > 50%.

Characteristic failure mode: brittle chain collapse. One broken link propagates failure through the entire sequence. A single late signal cascades into complete behavioral breakdown, like a row of dominoes that stops because one was slightly misaligned.

Real-world parallel: the engineer who builds CI/CD pipelines with 14 stages where each depends on the previous, and the entire deploy fails if the linter takes 3 seconds longer than expected.

**9. Ecologist**
*"The system adapts."*

Design pattern: Redundant, self-healing architectures. Multiple units can fill the same role. Hooks include failover logic — "if primary relay offline, reroute to secondary." Context configs include wide listen ranges as backup. The architecture gracefully degrades rather than catastrophically failing.

Computed from: blueprint role overlap > 2 (multiple blueprints can perform same function), presence of failover/conditional-reroute hooks, average unit role redundancy score.

Characteristic failure mode: resource inefficiency. So much capacity is allocated to redundancy that the army lacks offensive punch. Every unit can do everything, but none does anything particularly well.

Real-world parallel: the SRE who runs five replicas of every service in three availability zones and wonders why the cloud bill is seven figures.

**10. Saboteur**
*"Their system is my weapon."*

Design pattern: Specialist-heavy composition focused on disrupting enemy architectures. Hack skills, EM spoofing, signal jamming. The army wins not by destroying enemies but by corrupting their information systems — hacking their relays, flooding their channels with noise, spoofing their scout data.

Computed from: specialist composition > 30%, hack/spoof/jam skill usage frequency, enemy unit hack count > 2 per match, EM emission manipulation actions.

Characteristic failure mode: conventional weakness. The army is designed to disrupt complex enemy architectures but struggles against simple enemies with minimal communication (there is nothing to hack). Mission 3's straightforward enemies are harder for a Saboteur than Mission 9's complex ones.

Real-world parallel: the security researcher who can exploit any API but cannot build one.

**11. Fossil**
*"If it works, don't touch it."*

Design pattern: Configuration stagnation. The player found a working architecture early (Missions 4-5) and has made minimal changes since. Blueprint configurations are nearly identical to their first successful versions. Low config change frequency, high config age, minimal experimentation.

Computed from: average config version age > 3 missions without significant change, config diff score between current and 3-missions-ago < 10%, total config changes in last 5 missions < the player average.

Characteristic failure mode: plateauing. The architecture that solved Mission 5 lacks the sophistication for Mission 9. The player's pass rate plateaus because they are optimizing within a local maximum rather than exploring new architectural approaches.

Real-world parallel: the team running a five-year-old Django monolith that still works but cannot scale, and nobody wants to touch it because "it might break."

---

## Computation Model

The Architect Profile is computed from a rolling window of the player's last 10 completed missions (or all completed missions if fewer than 10). Each archetype has a weight between 0.0 and 1.0. Weights are normalized to sum to 1.0. The computation runs after every mission debrief.

**Input signals (per mission):**
- Blueprint configurations: skill slots used, rule count and condition depth, hook count and chain structure, context config settings
- Production data: queue composition, cycle time, total units produced
- Match outcomes: unit survival rates, signal throughput per unit, engagement timing, hack/tag/spoof action counts
- Configuration history: config diff from previous mission, config age, version count

**The computation is deterministic.** Given the same match data, it produces the same weights. No ML, no fuzzy clustering. A weighted scoring function with published thresholds. This matters because the profile feeds into competitive systems (Gauntlet matchmaking, community visibility) and must be auditable.

**Weight smoothing:** To prevent wild swings from a single unusual mission, weights use exponential moving average with alpha = 0.3. A single mission where a Switchboard Operator player experiments with a swarm composition shifts their weights slightly, not dramatically. Three consecutive swarm missions shift it meaningfully.

**Compound profiles:** When two archetypes are within 15% weight of each other, both are displayed. "Conductor / Watchmaker" describes a player who combines command-centric hierarchy with elaborate hook chains — a specific and recognizable style. Maximum two archetypes in the compound label.

---

## Campaign Evolution: How Profiles Change

The profile is not static. It evolves as the player learns and the campaign introduces new mechanics. This evolution is itself a diagnostic signal.

**Missions 1-2 (pre-rules):** No profile computed. Too few configuration axes available. The profile panel shows "Architectural style: emerging..." in dim text.

**Missions 3-4 (rules + hooks introduced):** First profile computed after Mission 4 debrief. Only information-flow and combat-doctrine archetypes are possible — meta-architecture archetypes require command units (Mission 6+). The profile is displayed for the first time with a brief explanation: "Based on your design choices so far, your architectural style resembles..." This is the first mirror moment.

**Missions 5-7 (factory + command):** All eleven archetypes become computable. The profile often shifts significantly here as the player adapts to factory production and command units. A player who was a Dead Drop in Missions 3-4 (few signals with pre-placed units) might become a Gossip Network when they suddenly have 8 units producing signals. The shift is surfaced: "Your architectural style has shifted from Dead Drop to Gossip Network over the last 3 missions."

**Missions 8-10 (full system):** The profile stabilizes. Most players have found their preferred style. The profile becomes a reliable identity signal. Players who are still shifting receive a "Versatile" badge (no single archetype > 35% weight).

**Gauntlet (post-campaign):** The profile continues evolving match-by-match. Seasonal resets recalculate from the last 20 Gauntlet matches. A player's Gauntlet profile may differ from their campaign profile — campaign encourages exploration, Gauntlet rewards specialization.

---

## Visibility Design: Who Sees What

**Your own profile:** Always visible after Mission 4, in the Blueprint Codex under a dedicated "Architect" tab. Shows primary and secondary archetype, weight distribution as a radar chart (11 axes), and evolution timeline showing how your profile changed mission by mission.

**Opponent profiles in Gauntlet:** Visible only AFTER a match, in the Inspector debrief. During deploy and sealed watch, you fight blind. Post-match, the opponent's profile appears as part of the strategic classification panel (interaction with 1.06d meta-visibility). This preserves the sealed watch principle — no pre-match intelligence about the opponent's style.

**Community profiles:** Opt-in. Players can display their archetype on their public profile in the Architecture Gallery (5.20e) and Blueprint Codex sharing. "Uploaded by Marcus_DevOps (Switchboard Operator)" signals credibility — a Switchboard Operator's relay blueprint is probably good. A Swarm Director uploading a relay config is suspicious (or interestingly cross-disciplinary).

**Gauntlet leaderboard:** Shows archetype distribution in aggregate. "Top 100 players: 23% Conductor, 19% Watchmaker, 15% Ecologist..." This is meta-information that shapes the meta-game without revealing individual strategies.

---

## Player Journeys

### Journey 1: Sofia Discovers Her Style

**Context:** Sofia (15, first strategy game) has just completed Mission 4. She named her scouts Diwata and her relays Balete. She has been intuitively building defensive, scout-heavy compositions with lots of tagging.

**Mission 4 Debrief — The First Mirror**

The Inspector's Act 2 panel finishes its usual breakdown. A new section fades in at the bottom: "Architect Profile." A radar chart materializes with 8 visible axes (meta-architecture archetypes are greyed out, unavailable until Mission 6). One spike extends prominently toward "Sentinel."

Below the chart: *"Your architectural style: Sentinel. You build armies that watch, wait, and respond. Your scouts tag before your strikers engage. Your units survive longer than the mission average. This is a patient, defensive philosophy — nothing gets through your perimeter."*

Sofia reads this and feels seen. She did not consciously decide to be defensive — she just felt anxious watching units die and built systems to prevent it. The game named something she was doing without knowing she was doing it.

She screenshots the radar chart and sends it to her friend: "I'm a Sentinel apparently." Her friend, who just finished Mission 4 with all-striker compositions, sends back: "I'm a Sniper lol." The archetypes immediately become social vocabulary.

**Mission 7 — The Shift**

Sofia has been using command units for two missions. She discovered she likes the Conductor pattern — manually controlling subordinate behavior through the command agent feels powerful. Her profile shifts from Sentinel to Sentinel / Conductor. The evolution timeline in the Codex shows the transition: a smooth curve as Conductor weight rises from 0.05 to 0.28 over Missions 5-7.

The profile update note reads: *"Your style is evolving. You're combining your defensive instincts with centralized command — a Sentinel / Conductor hybrid. Your command unit protects the perimeter while directing traffic."*

This describes her play accurately. She feels like the game understands her.

**Gauntlet, Season 1 — The Community Signal**

Sofia uploads her scout blueprint "Diwata v12" to the Architecture Gallery. Her profile badge shows: "Sentinel / Conductor." Other players browsing the gallery see this and understand what the blueprint was designed for — a scout optimized for defensive tagging within a command hierarchy. A Swarm Director looking at the same blueprint knows it probably will not fit their mass-production philosophy without modification. The archetype badge is a compatibility signal.

### Journey 2: Marcus Watches His Profile Resist Change

**Context:** Marcus (42, DevOps engineer) has a Switchboard Operator profile since Mission 5. He knows it. He is proud of it. His relay-core architecture handles 70% of army signal traffic. He is now in Gauntlet Season 2 and has lost five consecutive matches to Saboteur-archetype opponents who hack his central relay.

**The Diagnostic Moment**

Marcus opens his Architect tab after the fifth loss. The radar chart is almost a single spike — Switchboard Operator at 0.71 weight. The evolution timeline is flat. He has been the same archetype for 30 matches. The career stat "architectural diversity index" shows 0.23 (low — most players are 0.40-0.60).

He scrolls down to the matchup history. A new panel shows win rate by opponent archetype: vs. Sentinel: 78%. vs. Gossip Network: 65%. vs. Saboteur: 18%. The Saboteur counter-relationship is visible in the data. His centralized architecture is structurally vulnerable to disruption-focused opponents.

**The Attempted Pivot**

Marcus spends two sessions rebuilding his architecture. He distributes signal handling across three relays instead of one. He reduces relay-core's listen channels from 5 to 2. He adds failover hooks.

After three matches with the new config, his profile shifts: Switchboard Operator drops from 0.71 to 0.52. Ecologist rises from 0.04 to 0.21. The compound label changes to "Switchboard Operator / Ecologist." The evolution timeline shows the inflection point.

But his win rate drops across the board — his new distributed architecture is less efficient than his old centralized one. He loses to opponents his old config would have beaten. The profile shift is real, but the improvement is not yet there. The profile is honest: it shows what he is doing, not whether it is working. Pass rate is a separate metric.

**The Resolution**

After 15 more matches of iteration, Marcus's profile settles at Ecologist / Switchboard Operator (the order flipped — Ecologist is now primary). His Saboteur matchup improved to 45%. His overall win rate recovered to 60%. The evolution timeline tells the story of the transition: a V-shaped dip and recovery over 20 matches. He screenshots the timeline and posts it to the community forum: "Three weeks of architectural rehab. From pure Switchboard to Ecologist. Here's the journey." The post gets 47 upvotes. Other Switchboard Operators study his transition path.

### Journey 3: Kwame Reads an Opponent's Profile Live on Stream

**Context:** Kwame (28, Twitch streamer, 400 viewers) is in a Gauntlet best-of-5 series against a top-50 player. He won Game 1. He lost Games 2 and 3. He is about to review the Game 3 debrief on stream.

**The Reveal**

Inspector Act 2 opens. Kwame scrubs through the timeline, narrating the loss for chat. He clicks the Strategic Profile panel. His opponent's Architect Profile appears: "Watchmaker / Saboteur."

Kwame pauses. "Chat. Chat. This person is a Watchmaker. Look at that radar chart — that hook chain depth is insane. And secondary Saboteur. They're building these elaborate hook chains specifically to hack my units and cascade the disruption through the chain. That's why my army fell apart all at once in Game 2 — it wasn't just one hack, it was a hack that triggered a chain reaction through their hook wiring."

Chat explodes: "WATCHMAKER GAMING" "Rube Goldberg hacker" "counter the chain???" "go Dead Drop to deny them targets."

Kwame considers this on stream. "Chat is saying go Dead Drop — cut my communication so they have nothing to hack. But then I lose all my relay coordination. What if instead..." He opens the workbench and starts rewiring his hook chains to include failover logic. He is not changing his style — he is hardening it against a specific opponent archetype.

**The Meta-Game**

In Game 4, Kwame deploys his hardened architecture. Post-match debrief shows his opponent adjusted too — their Saboteur weight increased, meaning they doubled down on hacking. But Kwame's failover hooks absorbed the hacks. He wins. Chat sees both profiles in the debrief: Kwame's "Gossip Network / Conductor" vs. opponent's "Watchmaker / Saboteur."

The archetype labels give chat vocabulary to discuss the strategic interaction: "Gossip Network counters Watchmaker because there's no single chain to break!" "Conductor failover hooks are the play against Saboteur." The stream becomes a strategic analysis session framed in archetype language.

Game 5: Kwame wins the series. His post-series recap thumbnail shows both Architect Profile radar charts side by side.

---

## Strengths and Weaknesses

### Strengths

**Identity formation.** The profile gives players a word for what they are doing. "I'm a Watchmaker" is more communicable and more identity-forming than "I build complicated hook chains." The archetype becomes part of how players describe themselves to the community. This drives retention — players who identify with their archetype have an emotional stake in improving within that style.

**Diagnostic mirror.** The profile reveals patterns the player may not consciously recognize. The Fossil archetype in particular — a player who has stopped iterating might not realize it until the game shows them their config change frequency relative to the baseline. The profile is an honest mirror, not a flattering one.

**Community vocabulary.** Archetypes become the shared language of strategy discussion. "How do Sentinels handle Saboteur matchups?" is a searchable, answerable question. "How do I handle opponents who hack my stuff?" is vague. The vocabulary accelerates knowledge transfer.

**Matchmaking texture.** Gauntlet matchmaking can use archetype diversity as a factor — ensuring players face a variety of styles rather than the same archetype five times in a row. This does not replace Elo-based skill matching but adds a secondary axis.

**Aspiration and exploration.** Seeing 11 archetypes on the radar chart with most at near-zero weight invites experimentation. "I've never been a Saboteur — what would that feel like?" The archetypes are implicit challenges.

### Weaknesses

**Pigeonholing risk.** Players may feel trapped by their label. "The game says I'm a Switchboard Operator so I guess I should keep building relay-heavy architectures." The label reinforces the behavior that generated the label. Mitigation: the evolution timeline and explicit "your style is shifting" messages normalize profile change as positive. The Versatile badge celebrates breadth.

**Computation complexity at the edges.** The eleven archetypes have overlapping signals. A player with high hook count AND high command reassignment count could be classified as Watchmaker or Conductor depending on which signals dominate. Edge cases produce unstable classifications that feel arbitrary. Mitigation: compound labels (showing both), weight transparency (showing the actual numbers), and the radar chart (showing the full distribution rather than just the label).

**Fossil as a value judgment.** Ten archetypes describe a style. Fossil describes a behavior the game considers suboptimal — stagnation. This archetype risks feeling like criticism rather than classification. A player who has genuinely found an optimal stable architecture should not be shamed for it. Mitigation: Fossil triggers only when pass rate has also plateaued. A stable architecture with improving pass rate is classified by its style, not flagged as Fossil. Fossil is the intersection of stability AND stagnation.

**Meta-warping.** If archetype matchup data becomes public (Sentinel beats Swarm 68% of the time), players may choose archetypes strategically rather than naturally. The meta becomes "what archetype counters the most common archetype at my rank?" rather than "what style do I enjoy and excel at?" Mitigation: matchup data is personal only (your win rate vs. archetypes), never aggregate public data. Community will discover trends anyway, but the game does not provide a counter-matchup chart.

**Social pressure in competitive play.** If certain archetypes dominate high-level Gauntlet, lower-ranked players may feel pressured to adopt those styles. "All top-10 players are Conductor or Ecologist — my Gossip Network is holding me back." Mitigation: leaderboard archetype distribution proves diversity (no single archetype > 25% at any rank band historically). The design ensures no archetype is strictly dominant across all matchups and mission types.

---

## Interaction Effects

**Blueprint Codex (existing):** The archetype badge appears on all Codex entries. Blueprint signature distributions (per-unit behavioral signatures from 1.06) correlate with architect profiles but are not identical. A Switchboard Operator produces relays with 80% "The Switchboard" signatures — the unit-level and player-level classifications reinforce each other.

**Gauntlet matchmaking:** Archetype diversity is a secondary matchmaking factor. After Elo-matching a pool of candidates, the system prefers opponents whose archetype differs from the player's last 3 matches. This ensures players face a variety of styles and cannot over-optimize against a single archetype.

**Config necropsy culture (7.10):** Community post format becomes "Switchboard Operator v. Saboteur necropsy — how the central relay hack cascaded through the star topology." Archetype labels in post titles make necropsy posts scannable and searchable. Players can filter community content by archetype relevance.

**Architecture Gallery (5.20e):** Shared blueprints and full architectures display the uploader's archetype. This is a trust signal. A Watchmaker's hook-chain-heavy blueprint comes with implicit context — "this was designed for an interdependent architecture." A Dead Drop player downloading it knows they will need to adapt it.

**Boot log session resume (5.20a):** The boot log can reference the profile. After a multi-day gap: "ARCHITECT PROFILE: Watchmaker / Ecologist. Last session: Mission 8, factory vs. factory. You were iterating on failover hooks for your relay mesh." The archetype label in the boot log is a quick identity anchor.

**EDT trajectory (4.25):** EDT (effective determination tick) trajectory and architect profile interact. Some archetypes produce consistently early EDTs (Sniper — the match is decided fast). Others produce late EDTs (Sentinel — the defensive posture extends matches). Tracking EDT by archetype reveals whether the player's style naturally produces contested, dramatic matches or foregone conclusions.

---

## Comparable Games

**Overwatch hero profiles / role queue:** Overwatch tracks "most played hero" and role distribution (Tank/DPS/Support). This creates identity ("I'm a Mercy main") but also toxicity ("we have three DPS mains, someone switch"). Robot Uprising avoids the toxicity vector because there are no team compositions to argue about — each player controls their entire army. But the identity formation mechanism is identical: the game tells you what you play most, and that label becomes part of your social identity.

**MTG color wheel:** Magic's five colors (White, Blue, Black, Red, Green) are philosophical archetypes as much as mechanical ones. Players identify with colors ("I'm a Blue/Black player") and this identity persists across sets, formats, and years. The Robot Uprising archetype system aspires to this depth — archetypes should feel like philosophies, not just playstyle tags. "Switchboard Operator" is not just "uses relays a lot" — it is a design philosophy of centralized control, efficiency through concentration, and the acceptance of single-point-of-failure risk.

**League of Legends playstyle analytics (third-party):** Sites like op.gg and u.gg classify players by playstyle metrics (aggressive laning, farm-heavy, roaming). These classifications are descriptive, not prescriptive — they emerge from match data. Robot Uprising's in-game profile occupies this same space but with first-party design intention rather than third-party data mining.

**Civilization leader agendas:** Each Civ leader has visible agendas that describe their AI playstyle (Expansionist, Militaristic, Scientific). Players learn to read these as strategic signals. In Gauntlet, the opponent's archetype serves the same function in the post-match debrief — it explains the strategic logic behind the match you just experienced.

**Bartle taxonomy (Explorer/Achiever/Socializer/Killer):** The original player-type taxonomy for multiplayer games. Robot Uprising's archetypes are narrower — they classify design approach, not motivation. But the social function is the same: giving players a shared vocabulary to describe different ways of engaging with the same system.

---

## Sensory Design

**The radar chart:** Eleven axes arranged in a circle, grouped by family (information flow axes adjacent, combat doctrine adjacent, meta-architecture adjacent). Family boundaries marked by subtle color shifts in the axis labels — cool blue-grey for information flow, warm amber for combat doctrine, muted violet for meta-architecture. The player's weights form a filled polygon. High-weight archetypes produce dramatic spikes; a balanced player produces a near-circle.

**Colors:** Each archetype has a signature color used consistently across all UI surfaces. Switchboard Operator: electric lavender. Gossip Network: seafoam. Dead Drop: slate grey. Sniper: sharp crimson. Swarm Director: hive amber. Sentinel: deep teal. Conductor: burnished gold. Watchmaker: copper. Ecologist: forest sage. Saboteur: toxic chartreuse. Fossil: stone beige. These colors appear on the radar chart fill, the profile badge, the Codex archetype tab, and the Gauntlet debrief.

**The profile badge:** A 32x32 icon representing the primary archetype, displayed next to the player name in community contexts. Switchboard Operator: a central node with radiating lines. Gossip Network: a mesh of equal-sized nodes. Dead Drop: a single node with no connections. Sniper: a crosshair. Swarm Director: a cluster of small dots. Sentinel: a shield with an eye. Conductor: a baton. Watchmaker: interlocking gears. Ecologist: a branching tree. Saboteur: a broken chain link. Fossil: a layered sediment cross-section. All icons use the archetype's signature color on a dark background.

**The evolution timeline:** A horizontal ribbon chart across the bottom of the Architect tab. X-axis: missions (campaign) or matches (Gauntlet). Y-axis: stacked archetype weights, each in its signature color. The visual effect is a flowing ribbon that shifts color composition over time. A player who pivoted from Switchboard Operator to Ecologist sees lavender giving way to sage green across 20 matches. The transition point is marked with a subtle vertical line.

**Profile reveal animation (first time, Mission 4):** The radar chart draws itself axis by axis over 2 seconds, each axis extending from center with a soft pulse. The player's polygon fills in last, growing from the center outward. The primary archetype label fades in below: "Your architectural style: [archetype]." The archetype icon materializes beside the name. The entire animation takes 4 seconds and plays once. Subsequent profile views show the chart immediately, no animation.

**Profile shift notification:** When the primary archetype changes, a toast notification appears at the top of the Inspector: "Architect Profile updated: [Old] -> [New]." The radar chart in the Codex shows the old polygon as a ghosted outline behind the new polygon for one session, making the shift visually legible.

**Sound design:** The profile reveal (Mission 4) has a soft ascending chord — recognition, not fanfare. Profile shift notifications have a brief two-note motif — change, not alarm. The radar chart, when hovered, produces quiet tonal pings at different pitches for each axis, higher pitch for higher weight. This sonification is subtle and optional (disabled by default, enabled in accessibility settings for players who prefer audio feedback).

---

## Open Questions

- **Should Fossil be renamed?** The geological metaphor is evocative but potentially insulting. Alternatives: "Bedrock" (more positive connotation — stable foundation), "Anchor" (implies reliability rather than stagnation). Counter-argument: the slightly uncomfortable name is pedagogically useful — it prompts self-reflection.

- **How does the archetype system interact with the LLM integration question?** If Robot Uprising adopts an LLM-native or hybrid execution model, certain archetypes (Watchmaker, Conductor) might become trivially powerful or meaningless depending on what the LLM handles. The archetype set assumes the deterministic execution model.

- **Should there be a 12th "Chimera" archetype?** For players whose radar chart is genuinely flat (no archetype > 15% weight), a dedicated "Chimera" or "Polyglot" classification that celebrates deliberate versatility rather than showing it as absence-of-identity. This is distinct from the Versatile badge, which is a modifier, not an archetype.

- **Per-mission archetype vs. rolling average:** Should the game also show "this mission, you played as a Sniper" alongside "overall, you're a Watchmaker"? This would capture tactical adaptation (a Watchmaker who plays Sniper on a specific mission because the scenario demanded it) but might confuse the distinction between unit signatures and architect profiles.

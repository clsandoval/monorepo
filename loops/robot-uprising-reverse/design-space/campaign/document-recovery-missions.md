# 5.11c — Document Recovery Missions

**Aspect ID:** 5.11c
**Wave:** 5 (Campaign & Progression)
**Category:** Campaign
**Related aspects:** 5.11a (document-as-corrupted-surface), 5.11b (corrupted diff as endgame escalation), 5.11e (corruption as enemy characterization), 5.08 (mission variety types — Infiltration), 5.14 (detection skills as complexity gate), 3.01 (skills catalog — extract/hack), 4.20 (counterfactual simulation), 5.15 (voice candidates — tactical document)

---

## The Core Idea

Document recovery missions are a mission type where the **primary objective is not destroying enemies or defending a position — it is recovering lost information**. The player's tactical document has been hit hard: entire pages redacted, configuration tables purged, critical reference entries blanked out. The mission's victory condition is deploying Specialist units to physically recover the original document content from enemy communications infrastructure on the battlefield.

This inverts the standard relationship between document and mission. Normally, the document informs the mission — the player reads their reference, configures their agents, and fights. In a recovery mission, the mission informs the document — the player fights *in order to read*. The battlefield objective is a piece of text. The reward is knowledge restored.

The mechanic rests on two locked primitives: the **Specialist unit** (10-slot context window, medium perception, `hack` and `extract` skills, 7m cost, 2e/tick) and the **document-as-corrupted-surface** (5.11a). The `extract` skill, previously used for pulling data from enemy units and structures, is repurposed here as the tool that physically recovers redacted document content from enemy communication nodes scattered across the 8x8 grid.

### Why This Matters

Document recovery missions solve three design problems simultaneously:

1. **The Specialist justification problem.** The Specialist is the most expensive non-Command unit (7m) with medium combat stats and no direct offensive capability. Without missions that specifically demand `hack` and `extract`, the Specialist is a luxury — nice to have but never essential. Recovery missions make it the star.

2. **The document relevance problem.** By Mission 7-8, players have internalized most of the tactical document. Recovery missions create missions where the document *itself* is incomplete — where winning means filling in gaps the player needs for future missions. The document stays alive as a resource to defend and reclaim.

3. **The "information as objective" thesis.** Robot Uprising's core claim is that information architecture matters more than combat. Recovery missions literalize this: the mission objective IS information. You don't win by killing enemies. You win by reading their mail.

---

## The Recovery Mechanic: "The Dead Drop"

### How It Works

Enemy communication nodes appear on the battlefield as stationary structures occupying one tile each. They look like corrupted data terminals — isometric server racks wrapped in red static, pulsing with a deep crimson heartbeat glow. Each node contains one fragment of the redacted document content.

**Node placement:** 2-4 nodes per mission, placed in tactically challenging positions — behind enemy lines, adjacent to enemy spawners, in corners of the map that require crossing open ground. The nodes are visible from Mission Start on the board preview, marked with a document icon overlaid with a red `[REDACTED]` stamp.

**The extraction process:**
1. A Specialist must reach an adjacent tile to the node (not the node's tile — the node is impassable terrain)
2. The Specialist uses `extract` on the node. This takes **3 ticks** — the Specialist is stationary and vulnerable during extraction
3. During extraction, the Specialist's context window fills with recovered data (3-4 slots consumed by the incoming document fragment)
4. On completion, the node's red static dissolves into cyan data particles that stream toward the Specialist, and the recovered content appears in the tactical document with a `[RECOVERED]` tag and a faint cyan border
5. The node becomes inert — grey, dim, no longer pulsing

**The vulnerability window:** 3 ticks of stationary extraction is an eternity in a one-shot-one-kill game. The Specialist cannot move, cannot evade. Any adjacent enemy striker kills it instantly. The player must architect a defensive perimeter — scouts providing early warning, strikers positioned to intercept, relays forwarding threat data — all to protect a unit that is standing still, reading.

**Context window pressure:** The 3-4 slots consumed by recovered data are real. A Specialist with 10 slots now has only 6-7 available for tactical awareness during extraction. If the player hasn't configured proper eviction priorities, the extraction data might push out critical threat warnings. The Specialist successfully reads the document — and gets killed because it forgot about the striker approaching from the south. This teaches the lesson that **knowledge acquisition has a cost in attention**.

### Document Integrity as a Resource

Each mission briefing shows the tactical document's current state: percentage of content intact, number of redacted sections, and which topics are affected. A document might be at 78% integrity with 3 sections redacted (hook configuration details, relay placement guidelines, and a section on enemy patrol patterns).

**The integrity meter** appears on the campaign map as a vertical bar next to each completed province. Provinces glow brighter cyan when their document sections are fully recovered. A province with redacted sections shows amber patches in its glow — visible scars on the archipelago.

**Progressive degradation:** As the campaign advances, the enemy becomes more aggressive about purging document content. Early missions (M7) might redact flavor text and historical notes. By M9, the enemy is redacting critical configuration parameters and skill interaction tables. By M10, entire pages go dark.

**Recovery as optional objective:** Some recovery missions offer a choice: pursue the primary military objective (destroy enemy base, defend position) or divert resources to recover documents. Recovering all nodes might require sacrificing combat efficiency — pulling a striker off the front line to escort a Specialist to a corner node. The player who recovers everything gets better reference material. The player who skips recovery can still win the mission but enters the next one with gaps in their knowledge.

---

## Six Recovery Mission Designs

### Design A: "The Archive Raid" — Pure Extraction Sprint

**Premise:** An enemy communications archive has been identified in Palawan province. Four data nodes contain the complete contents of a purged section on hook chaining mechanics. No enemy base to destroy — the mission is pure extraction. Victory condition: recover 3 of 4 nodes within 60 ticks.

**Board layout:** Jungle terrain. Four nodes in a diamond pattern across the center of the board. Enemy spawner in the northeast producing scout-striker pairs every 8 ticks. No player factory — pre-placed units only (2 Specialists, 2 Scouts, 2 Strikers).

**The design tension:** Two Specialists, four nodes. Each extraction takes 3 ticks plus travel time. The player must route both Specialists efficiently while the escort formation covers both extraction points. Splitting forces is dangerous but necessary. Keeping forces together is safe but slow — the 60-tick clock is real.

**What it teaches:** Resource allocation under time pressure. The player cannot protect everything simultaneously. They must decide which nodes to prioritize (the content varies — one contains a critical skill reference, another contains historical flavor text), which Specialist takes the longer route, and when to abandon a node extraction if enemies close in.

### Design B: "The Relay Intercept" — Mobile Recovery

**Premise:** The enemy is transmitting the purged document fragments across a relay chain. Three mobile relay units are crossing the board from east to west, each carrying one fragment. The fragments are only accessible while the relay is alive. If a relay reaches the western edge, its fragment is lost permanently.

**Board layout:** Urban Cebu terrain. Three enemy relays spawn at staggered intervals on the eastern edge, moving west at 1 tile per 2 ticks. Enemy strikers escort each relay. The player's factory is in the southwest.

**The design tension:** The player must intercept each relay, kill its escort, and extract data from the relay before it reaches the edge — but killing the relay destroys the data. The Specialist must use `hack` on the relay (2 ticks, adjacent) to freeze it, then `extract` (3 ticks) to pull the fragment. Five ticks total of Specialist vulnerability per relay, while enemy reinforcements continue spawning.

**What it teaches:** The difference between `hack` and `extract` as a two-step pipeline. Time management across staggered objectives. The cost of letting information escape versus the cost of overcommitting to interception.

### Design C: "The Contested Archive" — Tug-of-War Recovery

**Premise:** A single massive data archive sits in the center of the board. It contains the complete purged section — but it takes 10 ticks of continuous extraction to fully recover. If the Specialist is interrupted (moves, takes damage, context overloads), the extraction resets to zero.

**Board layout:** Batanes highlands. The archive in D4/D5. Both player and enemy factories present. Enemy sends waves every 12 ticks. The archive has a progress bar visible to both sides.

**The design tension:** 10 uninterrupted ticks is nearly impossible without a robust defensive architecture. The player must build a perimeter that holds against multiple waves while the Specialist sits motionless in the center of the board. Every defensive failure forces an extraction restart. The mission becomes a test of the player's ability to build a self-sustaining defensive system — exactly the "autonomous agents" thesis of the entire game.

**What it teaches:** System resilience. The Specialist is a fixed point that the entire architecture must protect. This is the "database migration" of Robot Uprising — you need the system to stay alive and quiet for an extended period while a critical operation completes.

### Design D: "The Breadcrumb Trail" — Sequential Recovery

**Premise:** The enemy has fragmented a single document page across 6 nodes, each containing one sentence. The nodes must be extracted in order — Node 1 before Node 2 before Node 3 — because each fragment contains the decryption key for the next. Out-of-order extraction yields scrambled data.

**Board layout:** Siquijor mystic island. Nodes arranged in a winding path from A1 to H8. Each node is progressively deeper in enemy territory.

**The design tension:** The Specialist must follow a specific route, which the enemy can predict and ambush. The player must clear a path and maintain it — earlier nodes are behind the Specialist but enemy reinforcements can spawn in cleared areas. The sequential constraint transforms the mission from a parallel optimization problem into a linear one, forcing a fundamentally different architectural approach.

**What it teaches:** Pipeline thinking. The constraint maps directly to sequential data processing — each stage depends on the previous stage's output. The player who understands pipelines from relay chains will recognize this pattern and apply the same architectural principles (forward scouts, relay-assisted threat warning along the pipeline).

### Design E: "The Double Agent" — Recovery Under Deception

**Premise:** Two of the four data nodes contain legitimate document fragments. Two contain enemy-injected false content designed to corrupt the document further if extracted. The Specialist's `hack` skill can identify authentic nodes (genuine nodes show green data streams; compromised nodes show green data streams that flicker amber for 1 tick every 5 ticks — a subtle tell).

**Board layout:** Manila megacity. Dense urban grid with line-of-sight obstacles. Four nodes in different quadrants. Enemy patrols on predictable routes.

**The design tension:** The player must invest 2 ticks of `hack` per node just to verify authenticity before committing 3 ticks of `extract`. Extracting a compromised node actively damages the document — worse than not recovering at all. But under time pressure, the player might skip verification. The mission tests whether the player has internalized the "verify before trusting" lesson from the corruption mechanic (5.11a).

**What it teaches:** Authentication and verification as a cost worth paying. This is the prompt injection defense lesson made tactical — the player learns that extraction without verification is dangerous, directly paralleling the real-world AI engineering principle that you must validate inputs before processing them.

### Design F: "The Burning Library" — Recovery Under Destruction

**Premise:** The enemy is actively destroying data nodes. Six nodes start on the board, and the enemy sends dedicated "purge units" (enemy Specialists) that target nodes for permanent destruction. Every 8 ticks, one node is destroyed if undefended. The player races to extract as many fragments as possible before they are gone forever.

**Board layout:** Ifugao rice terraces. Nodes scattered across elevated terrain. Enemy purge units spawn from multiple points. Player factory in the southwest corner.

**The design tension:** The player cannot save everything. Six nodes, staggered destruction schedule, limited Specialist production capacity. The mission forces triage — which fragments are most valuable? Which can the player afford to lose? This creates genuine permanence: unrecovered content stays redacted for the rest of the campaign.

**What it teaches:** Triage under irreversible conditions. The real-world parallel is incident response — when multiple systems are failing, you prioritize the most critical. The emotional weight of watching a node pulse red, then crack, then dissolve into grey static while the Specialist is two tiles away is designed to burn in the lesson that information has finite lifespans.

---

## Player Journeys

### Journey: Luz, 28, Game Developer from Cebu

**Context:** Mission 8 (Cebu urban terrain). Luz has been playing for about 4 hours total across multiple sessions. She completed Missions 1-7, has a solid understanding of hooks and relays, and noticed in Mission 7 that two sections of her tactical document were redacted. She tried to configure scouts with the information from those sections and had to guess at parameter values. She lost Mission 7 twice before succeeding with conservative estimates. Now Mission 8's briefing mentions the redacted content can be recovered.

**Minute 0:00 — The Briefing**
The campaign map shows Cebu province pulsing gold. Luz clicks it. The boot log initializes: `MISSION 8: CEBU METROPOLITAN — PRIORITY: SIGNALS INTELLIGENCE`. Below the mission parameters, a new panel she has not seen before: `DOCUMENT STATUS`. A miniature version of her tactical document appears with two sections highlighted in amber, marked `[REDACTED — RECOVERABLE]`. The status reads: `Document Integrity: 82% — 2 sections compromised. Enemy communication nodes detected on battlefield. Specialist extraction authorized.`

She feels a small thrill — she has been annoyed by those redactions since Mission 7. The missing hook chaining reference cost her two failed attempts. Now she can get it back.

**Minute 0:45 — The Plan Screen**
The board preview shows the 8x8 Cebu urban grid. Two data nodes are visible: one at C2 (near the player factory) and one at F7 (deep behind enemy lines, adjacent to the enemy spawner). Both are rendered as small server rack icons wrapped in pulsing red static. Hovering over a node shows a tooltip: `Enemy Comm Node — Contains: Hook Chaining Reference (Section 3.09 excerpt). Extraction: 3 ticks. Requires: Specialist adjacent.`

Luz opens the workbench. She has been running Scout-Relay-Striker compositions. Now she needs to fit a Specialist into her production queue. The Specialist costs 7m — more than a Scout (3m) and almost as much as a Striker (8m). She drags a Specialist blueprint into the production queue between her first Striker and second Scout. The conveyor belt shifts. The cost preview updates: the Specialist delays her second Striker by 7 ticks.

She configures the Specialist's context window. She gives it 3 listen channels: `threat-alert` (the same channel her scouts broadcast on), `extract-ready` (a new channel she creates by typing it into a hook config), and `escort-status`. She sets eviction priority to keep `threat-alert` entries longest — the Specialist needs to know about nearby enemies even while extracting.

**Minute 2:30 — The Escort Architecture**
Luz realizes the far node at F7 is the one with the hook chaining reference — the content she actually needs. The near node at C2 contains a historical note about the uprising's Visayan campaign. Useful flavor but not critical.

She redesigns her production queue: Scout first (for early intelligence), then Specialist, then two Strikers as escort. She adds a hook to her lead Scout: `ON_DETECT enemy_striker → SEND threat-alert "HOSTILE AT {position}"`. She adds a rule to her Specialist: `IF threat-alert AND distance < 3 THEN evade`. But then she hesitates — if the Specialist evades during extraction, does the extraction reset?

She opens the Blueprint Codex and searches for `extract`. The card shows: `EXTRACT: 3-tick channel. Target: adjacent structure. Interruption: movement or context overload resets progress. Output: target data → context window (3-4 slots).`

Movement resets it. So `evade` would cancel the extraction. She removes the evade rule. Instead, she relies entirely on her escort strikers to intercept threats before they reach the Specialist. She adds a rule to her Strikers: `IF threat-alert AND distance_to_specialist < 4 THEN engage_nearest_hostile`. She creates the `escort-status` channel and has her Strikers broadcast their position on it so the Specialist knows its escort is alive.

**Minute 4:15 — The Sealed Watch**
EXECUTE. The tick clock begins. Her Scout spawns first and sweeps northeast. Tick 8: the Specialist emerges from the factory, a darker chassis with visible antenna arrays and tool attachments. It moves toward the near node at C2 first — Luz chose the safer target first to test the extraction process.

Tick 14: the Specialist reaches B2, adjacent to the C2 node. The node's red static intensifies as the Specialist begins extraction. A new element appears on the Specialist's tile: a thin progress bar, empty, marked with three tick marks. The Specialist's context bar shifts — 3 slots suddenly fill with incoming data, rendered as cyan pips mixed among the green observation pips.

Tick 15: one-third progress. Tick 16: two-thirds. An enemy scout appears at E5 — her scout detected it, sent a `threat-alert`, the signal reached her striker, the striker moved to intercept. The Specialist does not move. Its context bar shows the `threat-alert` entry but the rule does not trigger movement because Luz removed the evade rule.

Tick 17: extraction complete. The C2 node's red static shatters into cyan particles that stream into the Specialist. A small document icon appears briefly above the Specialist with a checkmark. On the sealed watch HUD, a tiny notification: `[RECOVERED] Uprising History: Visayan Campaign`. The node dims to grey.

Luz exhales. One down. But the hard one — F7, behind enemy lines — is the one she needs.

**Minute 6:00 — The Deep Extraction**
Ticks 25-40: the Specialist navigates toward F7 with two Strikers flanking. Enemy density increases near the spawner. At Tick 36, an enemy striker eliminates one of her escort Strikers. Signal chains light up — her relay forwards the `escort-status` channel's sudden silence (no more position broadcasts from the dead Striker). The remaining Striker shifts to cover the exposed flank.

Tick 42: the Specialist reaches E7, adjacent to the F7 node. Extraction begins. The progress bar appears. But the enemy spawner at H7 is only 2 tiles away. Tick 43: an enemy striker spawns. Tick 44: it moves to G7. One tile from the Specialist. The remaining escort Striker is at E6 — one tile away from the enemy. Tick 45: simultaneous resolution. The escort Striker engages the enemy striker at G7. One-shot-one-kill: both are eliminated. The Specialist's extraction continues — two-thirds done. But there is no escort left.

Tick 46: extraction complete. The F7 node shatters into cyan. `[RECOVERED] Hook Chaining Reference (Section 3.09)`. The Specialist is alone, deep in enemy territory, context window nearly full with recovered data and threat alerts. A new enemy scout appears at G6.

The mission continues — the primary objective is still to hold the defensive position. But Luz has her document content back. She watches the Specialist attempt to retreat, evading one enemy scout but eventually getting caught at D5 by a flanking striker on Tick 53. One-shot-one-kill. The Specialist is destroyed — but the recovered data persists. The document updates are permanent.

**Minute 8:30 — The Inspector**
After the sealed watch ends (mission success — primary objective completed on Tick 58), Luz opens the Inspector. She clicks the Specialist. The decision trace shows the extraction sequence tick by tick: context window state at Tick 42 (3 empty slots, 7 occupied — just enough room for the 3-slot extraction payload), the moment recovered data entered the buffer, the eviction that pushed out an old `escort-status` entry to make room.

She opens her tactical document. The two previously amber sections now glow with a faint cyan border, marked `[RECOVERED — Mission 8]`. The hook chaining reference is back. She reads it, comparing it to her current hook configuration. She realizes she has been wiring hooks in a pattern that the reference explicitly describes as "latency-costly" — a three-hop chain where a two-hop variant would work.

She feels a specific satisfaction: she fought a battle to earn the right to read a paragraph, and that paragraph immediately made her a better player.

**UI Annotations:**
- **Data node (board):** 1-tile server rack icon, red static pulse at 0.5 Hz, `[REDACTED]` stamp overlay, tooltip on hover showing contained content and extraction requirements
- **Extraction progress bar:** 24px wide horizontal bar below Specialist tile, three tick marks, fills left-to-right in cyan, resets to empty on Specialist movement
- **Context window during extraction:** 3-4 slots transition from empty to cyan-filled over 3 ticks, incoming data entries labeled `[EXTRACTING...]` then `[RECOVERED: {title}]`
- **Recovery notification (sealed watch):** 120px wide toast notification, document icon with cyan checkmark, content title, 3-second fade
- **Document status panel (briefing):** Miniature document with amber-highlighted redacted sections, integrity percentage, `[RECOVERABLE]` tags on nodes visible on board
- **Recovered content (tactical document):** Faint cyan border, `[RECOVERED — Mission N]` tag, content identical to pre-corruption original

---

### Journey: Marcus, 42, Site Reliability Engineer

**Context:** Mission 9 (Mindanao jungle). Marcus is a veteran Factorio/Zachtronics player in his second campaign playthrough. He is running the Ascension Protocol with two stacking modifiers (buffer -2, latency +1). His tactical document is at 71% integrity — he deliberately skipped recovery nodes in his first playthrough to test whether he could win without the reference material. Now on Ascension, the reduced buffer sizes make the recovery content far more valuable. He needs the context config optimization guide that was purged in Mission 8.

**Minute 0:00 — The Strategic Assessment**
Marcus reads the Mission 9 briefing. Three recovery nodes, staggered across the Mindanao jungle grid. Primary objective: survive 80 ticks against escalating enemy waves. The boot log notes: `WARNING: Document integrity degraded. Context configuration guidance unavailable. Specialist extraction authorized — PRIORITY: HIGH.`

He opens the Plan screen and immediately begins cost-benefit analysis. Three nodes, each requiring a Specialist (7m + 3 ticks extraction). With the Ascension buffer penalty (all units -2 slots), his Specialist runs on 8 slots instead of 10. Three recovered fragments will consume 3 slots each during extraction — that is 9 slots of incoming data on an 8-slot buffer. The third extraction will cause context overload.

He pauses. This is a genuine architectural problem, not just a tactical one. He needs to configure the Specialist's eviction priority so that during extraction, the oldest recovered data gets compressed or evicted to make room for new fragments. But if he evicts recovered data, does he lose the document content?

He checks the Codex. `EXTRACT output persists to document regardless of subsequent eviction. Context window entries are working copies — document recovery is permanent on extraction completion.` The recovered data persists even if the Specialist's buffer evicts it afterward. Relief.

**Minute 1:30 — The Pipeline Design**
Marcus designs what he calls "The Recovery Pipeline" — a two-Specialist relay system. Specialist Alpha extracts from the two nearest nodes. Specialist Beta handles the far node. A dedicated Relay sits between them, compressing and forwarding threat intelligence on a filtered channel so both Specialists maintain situational awareness without buffer flooding.

He configures the Relay with `compress` on the `threat-alert` channel and `filter` to strip position data older than 4 ticks. This reduces each threat alert from 2 buffer slots to 1. On Ascension's reduced buffers, this compression is the difference between the Specialist having room for extraction data and context overloading mid-extract.

His production queue: Scout, Relay, Specialist Alpha, Striker, Specialist Beta, Striker. Total cost: 38m. With passive income at approximately 2m per tick, the full pipeline is operational by Tick 19 — cutting it close against the first major enemy wave at Tick 20.

**Minute 3:00 — The Extraction Sequence**
EXECUTE. The pipeline deploys as planned. Specialist Alpha reaches Node 1 at Tick 22, extracts successfully by Tick 25. The recovered content is a context config optimization table — exactly what Marcus needs. The cyan particles flow into the Specialist and the node dims.

Node 2 at Tick 30. Extraction begins — but on Tick 31, enemy density spikes. Three enemy scouts converge. Marcus's single escort Striker cannot cover all three approach vectors. The Specialist's buffer fills with compressed threat alerts from the Relay. Tick 32: one enemy scout reaches B4 — tags the Specialist's tile. Tick 33: an enemy striker spawns at the enemy base, targeted at the tagged position. Marcus watches the extraction progress bar: two-thirds complete. One tick remaining. The enemy striker is 3 tiles away — it will arrive on Tick 36. Extraction completes on Tick 33. The Specialist has one tick to move. It evades south. The enemy striker arrives at the empty tile on Tick 34.

One tile. One tick. The compressed threat alerts from the Relay gave the Specialist just enough advance warning to trigger its evade rule immediately after extraction completed. If Marcus had not configured the Relay's compression, the raw uncompressed alerts would have overloaded the Specialist's buffer on Tick 31, causing a 1-tick stun — and the extraction would have been interrupted.

**Minute 5:30 — The Triage Decision**
Specialist Beta is en route to Node 3 — the far node containing advanced hook interaction patterns. But enemy waves are intensifying. Marcus's defensive perimeter is crumbling. He has two Strikers left, one damaged Relay (context overloaded from the wave, temporarily stunned), and both Specialists exposed in the field.

The mission timer shows 52 of 80 ticks elapsed. Primary objective is survival. If Marcus pulls Specialist Beta back to the defensive perimeter, he preserves the unit but loses the Node 3 content permanently (the enemy is sending a purge unit toward it — it will be destroyed on Tick 60).

He lets Specialist Beta continue. The extraction begins at Tick 55. The purge unit is at F6, moving toward the F7 node at 1 tile per tick. It will arrive on Tick 58. Extraction completes on Tick 58 — simultaneous resolution. The Specialist completes extraction in the same tick the purge unit arrives. But the purge unit targets the node, not the Specialist. The node is already extracted — the purge unit's action resolves against an inert node. Recovery successful.

Marcus leans back. The mission continues to Tick 80. He survives with two units remaining. All three nodes recovered. Document integrity climbs from 71% to 83%.

**UI Annotations:**
- **Ascension buffer penalty:** All unit context bars show 2 fewer segments, rendered as permanently darkened slots at the top of the bar with a faint red `X` overlay
- **Purge unit (enemy Specialist):** Distinct enemy sprite with red tool attachments, moving directly toward data nodes ignoring player units, countdown timer visible as a pulsing red number above the targeted node
- **Document integrity meter (campaign map):** 120px vertical bar on province tooltip, percentage with color gradient (green > 90%, amber 70-90%, red < 70%), recovered sections animate from amber to cyan on mission completion

---

### Journey: Aisha, 14, First-Time Strategy Game Player from Manila

**Context:** Mission 7 (first recovery mission, Mindanao introductory). Aisha has never played a strategy game before Robot Uprising. She has completed Missions 1-6 using a trial-and-error approach, rarely reading the tactical document. She has not noticed the redactions because she does not reference the document frequently. The boot log for Mission 7 explicitly tells her something is wrong.

**Minute 0:00 — The Forced Awareness**
The boot log initializes differently this time. Instead of the usual subsystem check, it reads:

```
ALERT: DOCUMENT INTEGRITY COMPROMISED
Hostile subsystem accessed tactical reference.
Sections removed: 1 (Specialist skill overview)
Recovery possible. Enemy communication node detected.
Deploying Specialist unit for first time.
```

Aisha has not used a Specialist before — it was introduced in Mission 6's Codex but she never built one, preferring Scouts and Strikers. The boot log continues: `NEW UNIT AVAILABLE: Specialist. Skills: hack, extract. See Codex entry.`

She opens the Blueprint Codex. The Specialist card shows a detailed portrait — a medium-chassis unit with visible antenna arrays and a tool arm. The skills section describes `extract`: "Recovers data from adjacent structures. 3 ticks. Unit stationary during extraction." She reads it twice. Three ticks of not moving. In a game where one touch kills you.

**Minute 1:30 — The First Specialist Build**
On the Plan screen, one data node is visible at E5, center of the board. The tooltip reads: `Contains: Specialist Skill Overview. This content will help you understand your new unit.` A gentle nudge — recover this, and you will understand what you just recovered.

Aisha adds a Specialist to her production queue after her Scout and Striker. She does not modify its default configuration — she does not understand context window management well enough to customize eviction priorities. The default is fine for this mission, which is designed to be completable with default configs.

She hits EXECUTE.

**Minute 2:30 — The Extraction Discovery**
Her Scout sweeps the board. Her Striker takes a forward position. On Tick 15, her Specialist spawns and moves toward the node. On Tick 20, the Specialist reaches D5, adjacent to the E5 node.

Something new happens: the Specialist's tile gets a new visual element. A thin cyan ring begins drawing around the node, and a progress bar appears. The Specialist's context bar changes — cyan pips begin filling in, pushing the bar from half-full toward capacity. The node's red static flickers, weakens.

Tick 21: one-third. Tick 22: two-thirds. An enemy scout appears at G5 — three tiles away. Aisha tenses. Her Striker is at C3 — too far to intercept.

Tick 23: extraction complete. Cyan data particles explode outward from the node in a starburst pattern, streaming into the Specialist. The node goes dark grey. A toast notification: `[RECOVERED] Specialist Skill Overview`. The Specialist immediately begins moving away from the approaching enemy.

The enemy scout reaches E5 on Tick 25 — the node is already inert. The Specialist has retreated to C5 behind the Striker's protection.

**Minute 4:00 — The Reward**
After the mission ends (primary objective completed on Tick 45), Aisha opens her tactical document. A new section glows with a cyan border: `Specialist Skill Overview [RECOVERED — Mission 7]`. She reads it for the first time. The section explains `hack` and `extract` in detail, with examples of how to use `hack` to freeze enemy units and `extract` to pull data from them — not just from nodes.

She did not know you could `extract` from enemy units. The recovered document teaches her a capability she did not know existed. She immediately wants to replay Mission 7 to try hacking an enemy scout and extracting its patrol pattern data.

The circular reward: she fought to recover a document that teaches her to fight better, which makes her want to fight again.

**UI Annotations:**
- **First Specialist spawn:** Brief 1-second highlight animation distinguishing Specialist from other units — tool arm extends and retracts, antenna array unfolds
- **Extraction visual (first time):** Slower particle effect than normal (1.5x duration), giving the player more time to read what is happening; subsequent extractions play at normal speed
- **Toast notification (first recovery):** Slightly larger (140px) than standard toast, with a brief bounce animation, 4-second display (vs. standard 3s)
- **Recovered content highlight (document):** Persistent cyan border with gentle pulse for 10 seconds on first view, then settles to static border

---

## Strengths

1. **Information as objective literalizes the game's thesis.** The player is not fighting for territory or kills — they are fighting for the right to read. This is Robot Uprising's deepest claim made into a mission type.

2. **The Specialist becomes essential.** Recovery missions are the only content that absolutely requires the Specialist unit, justifying its 7m cost and unique skill set. Without recovery missions, the Specialist risks being a niche luxury.

3. **Context window pressure during extraction is organic.** The 3-4 slots consumed by incoming data create natural tension with the Specialist's tactical awareness needs. This is not artificial difficulty — it is the same context window management that the entire game teaches, applied to a specific high-stakes scenario.

4. **Permanent consequences create weight.** Unrecovered content stays redacted. This gives recovery missions stakes that persist beyond the immediate mission, unlike combat outcomes that reset on retry.

5. **The circular reward loop.** Recovering document content often teaches the player something that makes them better at future recovery missions. The loop of "fight to read, read to fight better" is self-reinforcing.

## Weaknesses

1. **Player who avoids documents gets no value.** If a player never references the tactical document (like Aisha pre-Mission 7), recovery missions feel like arbitrary collect-a-thon objectives. The mission type assumes the document is valued, which requires the corruption mechanic (5.11a) to have already established document relevance.

2. **3-tick vulnerability is punishing in one-shot-one-kill.** The extraction duration creates situations where the player's best-configured Specialist dies because of factors outside the information architecture — pure positional bad luck. Mitigation: the 3-tick duration must be playtest-validated as achievable with reasonable escort configurations.

3. **Optional recovery creates information asymmetry between playthroughs.** If recovery is optional, some players will have complete documents and others will not. This either means the game must be completable without recovered content (reducing its value) or recovery is effectively mandatory (reducing its optionality). The tension is not fully resolvable.

4. **Sequential extraction (Design D) risks tedium.** A scripted route through the board can feel like a rail rather than a sandbox. The pipeline metaphor is pedagogically valuable but the gameplay might feel on-rails compared to the freedom of other mission types.

---

## Interaction Effects

- **Document-as-corrupted-surface (5.11a):** Recovery missions are the active counterpart to passive corruption detection. Corruption is the enemy's offense; recovery is the player's offense. The two mechanics must be balanced so that the enemy corrupts at roughly the rate the player can recover.

- **Corrupted diff (5.11b):** Recovered content appears in the diff view as a new baseline. If the enemy subsequently re-corrupts a recovered section, the diff view should detect it — unless the diff itself has been compromised (5.11b). This creates a multi-layer trust problem: is this section clean because you recovered it, or has the enemy re-corrupted it since recovery?

- **Corruption personalities (5.11e):** Different enemy personalities react differently to recovery attempts. The Surgeon might subtly alter content *during* extraction (the recovered text has been pre-poisoned). The Censor might deploy purge units more aggressively. The Architect might let the recovery succeed but corrupt cross-references in other sections that point to the recovered content.

- **Sealed watch pacing:** Extraction sequences are inherently tense during sealed watch — the player watches the progress bar fill while enemies close in, unable to intervene. This is the "clutch moment" format that produces TikTok clips: will the extraction complete before the striker arrives?

- **Inspector decision traces:** The extraction tick sequence is a rich diagnostic target. The player can trace exactly which context entries were present during extraction, which were evicted to make room, and whether the extraction caused downstream awareness gaps.

- **Production economy:** Specialists cost 7m and are non-combat units. Every Specialist in the production queue delays a Striker. Recovery missions force an explicit guns-vs-butter tradeoff that teaches resource allocation.

- **Command agent (M6+):** A Command unit can `reassign` a Striker's role mid-mission to escort a Specialist based on dynamic threat assessment. Recovery missions are a natural showcase for Command agent adaptive behavior — the Command monitors extraction progress and redirects defensive resources accordingly.

---

## Comparable Games

- **Control (Remedy, 2019):** The entire game is about recovering documents in a hostile supernatural environment. The "Objects of Power" and "Altered World Events" are discovered through exploration, and each document adds context to the world. Control proves that document recovery can be a satisfying gameplay objective — but Control's documents are flavor, not mechanically useful. Robot Uprising's recovered content is *functionally necessary*, which raises the stakes.

- **Outer Wilds (Mobius Digital, 2019):** Knowledge IS progression. The player recovers Nomai writing scattered across the solar system. Each fragment changes what the player understands and what they can do. This is the closest comparable: information recovery as the core progression mechanic. Outer Wilds proves the model works — but Outer Wilds has no combat pressure during recovery. Robot Uprising adds the escort/defense layer.

- **XCOM 2: War of the Chosen (Firaxis, 2017):** Covert operations and intelligence gathering as mission objectives. XCOM 2 distinguishes between "kill everything" missions and "recover the objective" missions, proving that objective variety sustains tactical games. Recovery missions in Robot Uprising follow this pattern — the victory condition shifts from destruction to acquisition.

- **Papers, Please (Lucas Pope, 2013):** Document verification under time pressure. The player must examine documents while managing a queue and facing consequences for errors. Recovery missions share the "read under pressure" tension — the Specialist is trying to extract data while enemies close in. Both games make reading a high-stakes activity.

- **Into the Breach (Subset Games, 2018):** The train mission type, where the player must protect a moving asset that cannot defend itself. Recovery missions are the stationary variant — protect a unit that cannot move for 3 ticks. Into the Breach proves that "protect the vulnerable asset" is a satisfying puzzle frame.

---

## Sensory Description

**The data node before extraction:** A small isometric server rack, two tiles high in visual terms but occupying one grid square. Wrapped in a lattice of red static — thin horizontal scan lines that scroll upward like a corrupted CRT monitor. The rack pulses with a deep crimson glow at 0.5 Hz, synchronized with a low bass hum barely audible under the ambient battlefield sound. A `[REDACTED]` stamp hovers above it in blocky military stencil font, slightly transparent, gently rotating 2 degrees back and forth.

**During extraction:** The Specialist's tool arm extends toward the node. The red scan lines begin fracturing, gaps appearing where cyan light bleeds through. A rising electronic tone — a data-transfer whine like a modem handshake pitched up two octaves — accompanies the progress bar. The Specialist's context bar shows new entries arriving in real-time: each incoming slot fills with a brief flash of white that settles into the standard cyan pip. The node's crimson pulse quickens, as if resisting.

**Extraction complete:** The red lattice shatters. Cyan data particles — hundreds of tiny luminous squares — explode outward in a starburst, then arc in streams toward the Specialist, drawn into its antenna array. The data-transfer whine resolves into a clean two-note ascending chime (C4 to E4, 200ms). The node's server rack remains but is now grey, no glow, no static — a dead machine. A faint cyan afterimage lingers for 500ms where the red static was.

**The recovered document entry:** When the player opens their tactical document after the mission, the recovered section has a 1px cyan border on the left edge, a `[RECOVERED — Mission N]` tag in small grey monospace text below the section header, and on first viewing, the text itself renders character by character over 2 seconds — as if being decoded in real-time — before settling into normal static text. This happens once per recovered section, never again.

**The purge unit destroying a node:** The enemy Specialist approaches and its tool arm glows angry red. On contact, the node's server rack crumples — a physical collapse animation, rack panels folding inward like crushed aluminum. The red static intensifies to white-hot for 200ms, then cuts to black. A descending three-note tone (E4 to C4 to A3, 300ms total) — the inverse of the recovery chime. Grey ash particles drift from the destroyed node for 2 seconds. The document status meter on the briefing screen, if visible, drops — a permanent scar.

---

## The TikTok Clip

Split-screen, 15 seconds. Left side: the Specialist begins extraction. Progress bar appears. Right side: an enemy striker spawning, moving toward the Specialist. The progress bar fills — one-third, two-thirds. The enemy closes — 3 tiles, 2 tiles. The escort Striker intercepts. One-shot-one-kill, mutual destruction. The escort is gone. Another enemy appears. The progress bar is at 90%. The enemy is 2 tiles away. Final tick: extraction complete. Cyan particle starburst. The Specialist evades. The enemy arrives at the empty tile. Cut to the tactical document: the `[REDACTED]` stamp dissolves, replaced by recovered text. Caption: "I fought a war to read a paragraph."

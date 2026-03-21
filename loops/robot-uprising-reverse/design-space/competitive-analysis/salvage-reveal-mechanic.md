# Competitive Analysis: The Salvage Reveal Mechanic (1.20a)

**Aspect:** When a Robot Uprising unit dies, should the Inspector reveal the enemy unit's full configuration as a knowledge-looting pattern? Cogmind scatters destroyed robot parts visually; Robot Uprising could scatter destroyed robot configurations informationally.

**Pattern Name:** "The Autopsy Protocol" — kill to learn, disassemble to understand.

---

## The Design Question

Robot Uprising's Inspector already lets players scrub through their own units' decision traces after battle. But what about the *enemy*? When your striker eliminates an enemy unit, does the Inspector reveal what that enemy was made of — its skills, rules, hooks, context configuration? And if so, how much is revealed, and what does the player do with that knowledge?

This is the question of whether combat itself is an intelligence-gathering action, not just an elimination action. Kill the enemy, learn the enemy. The destroyed configuration becomes a blueprint you can study, reverse-engineer, and defend against.

---

## How Comparable Games Handle "Kill to Learn"

### Cogmind — Physical Salvage as Knowledge

When a robot dies in Cogmind, its parts scatter across adjacent tiles as colored ASCII glyphs. A destroyed Programmer might drop a `Datajack Lv.3`, a `System Shield`, and a `Light Treads` — each rendered as a colored character on the floor tile. The player walks over the debris field and examines each part individually: hovering reveals stats, capabilities, and compatibility. The parts are both *loot* (equippable resources) and *intelligence* (you now know what that enemy type carries).

The critical design insight: **salvage is simultaneous with revelation**. You don't get a separate "scan" action. The act of destroying reveals. The debris IS the documentation. The more violently you destroy (explosives), the less survives — creating a tension between efficient killing and thorough intelligence gathering. Precision weapons (lasers, EM) preserve more parts for inspection. The player learns that how you kill determines what you learn.

The visual language is immediate: parts scattered on the ground look like a robot's anatomy splayed open. An experienced player can glance at the debris pattern — the colors, the glyph shapes — and read the dead robot's loadout without hovering over each item. The battlefield becomes a library of destroyed configurations.

### XCOM — The Autopsy as Research Gate

XCOM takes a fundamentally different approach. Killing an alien leaves a corpse. The corpse goes into the research queue. A scientist spends days autopsying it. The autopsy unlocks: new weapons, new armor, new abilities, and crucially — a bestiary entry that reveals the alien's capabilities, resistances, and tactical patterns.

The key design element: **knowledge is gated behind time and resources**. You can't learn about Mutons mid-battle by killing one. You learn about Mutons three in-game days later, after committing a scientist. The autopsy is a strategic investment: "Do I research this corpse to learn about the enemy, or do I research plasma weapons to upgrade my squad?" The knowledge has opportunity cost.

XCOM also gates *technology* behind autopsies. You literally cannot build Plasma Rifles until you've autopsied a Muton and studied the weapon. The dead enemy is a technology tree node. Kill → autopsy → unlock → build. The entire progression system is "kill to learn to build."

### Metroid Prime — The Scan Visor as Pre-Combat Intelligence

Metroid Prime inverts the pattern. You learn about enemies *before* killing them, not after. The Scan Visor reveals enemy weak points, behavioral patterns, and lore entries while they're alive. The catch: scanning takes several seconds of lock-on during which you cannot fire. The knowledge has a *risk* cost rather than a resource cost. You choose between shooting and studying.

The Scan Visor populates a Logbook — a persistent database of everything you've scanned. Completionists scan every enemy type; speedrunners skip all of it. The knowledge is optional and primarily rewards curiosity rather than enabling gameplay advancement.

The critical difference from XCOM: **Metroid's knowledge is observational, not material**. You don't need a corpse. You need proximity and attention. The enemy is a text you read, not a machine you disassemble.

### Horizon Zero Dawn — The Focus Scan as Tactical Overlay

Horizon's Focus scan reveals machine weaknesses in real-time: vulnerable components highlighted in yellow, elemental weaknesses displayed as icons, armor plates flagged for removal. But the deeper system is the Machine Catalogue — a bestiary that fills out as you scan more instances of each machine type. First scan: basic stats. Multiple scans: detailed component lists. Override Cauldron completion: full technical breakdown.

The design pattern: **progressive revelation through repeated engagement**. You don't learn everything from one kill or one scan. You build knowledge over many encounters. Each fight with a Thunderjaw teaches you something new, incentivizing engagement rather than avoidance.

### Monster Hunter — The Research Log as Cumulative Knowledge

Monster Hunter World tracks every footprint found, every monster observed, every kill and capture. The Research Log fills incrementally: first encounters reveal basic information, repeated hunts reveal weakness charts, full research reveals drop tables and behavioral patterns. Capturing (non-lethal) yields more research points than killing.

The design insight: **the method of engagement affects the quality of knowledge gained**. Capturing teaches you more than killing. Tracking teaches you more than ambushing. The game rewards engagement depth, not just encounter count.

---

## The Robot Uprising Translation: Informational Salvage

In Robot Uprising, there are no physical parts to scatter. Units are configurations — skills, rules, hooks, context settings. When an enemy unit dies, what scatters is *information about its design*. The debris field is not metal and circuits on tiles — it's a configuration readout in the Inspector.

### The Mechanic: Enemy Blueprint Autopsy

When a player's unit eliminates an enemy unit during the sealed watch, the Inspector gains access to that enemy unit's full configuration at the moment of death. Clicking the destroyed enemy's last-known position in the Inspector timeline reveals:

- **Skills equipped** — what the enemy could do (patrol, engage, compress, hack)
- **Rules ordered** — the enemy's decision priority chain (IF player_visible THEN engage, IF isolated THEN retreat)
- **Hooks configured** — what channels the enemy was wired to, what triggers it used
- **Context window state** — what was in the enemy's working memory when it died (what it knew, what it was processing, what signals it had received)
- **Context configuration** — buffer size, listen/ignore filters, eviction priorities

This is the equivalent of Cogmind's parts scattering on the floor — but instead of physical components, you're scattering the enemy's *cognitive architecture*. You're reading a destroyed mind.

### Visual Language: The Configuration Autopsy Panel

In the Inspector sidebar, destroyed enemy units get a special panel treatment. Where your own units show their familiar blueprint layout with the standard cyan/white color scheme, enemy autopsy panels render in a distinct visual language:

**The "Cracked Open" aesthetic.** The enemy blueprint card appears with a fractured border — jagged diagonal cracks radiating from the point of destruction, as if the configuration itself shattered. The background shifts from the standard dark panel to a deep amber-red, the color of cooling metal. Skills, rules, and hooks are displayed in the same slot format as the player's blueprint editor, but rendered in the enemy's faction color (red-orange glyphs on dark backgrounds). Each revealed element fades in with a brief flicker animation — like data being recovered from a damaged drive.

**The "Data Recovery" progress bar.** Not all information is guaranteed. A thin horizontal bar at the top of the autopsy panel shows "Configuration Recovery: 73%" — the percentage of the enemy's blueprint that was recoverable. One-shot kills from adjacent strikers yield high recovery (80-100%). Kills from context-overload-induced stun-locks yield less (40-60%) — the enemy's configuration was already corrupted when it died. This creates a Cogmind-like tension: *how* you kill affects *what* you learn.

**Redacted entries.** Unrecovered configuration elements appear as glitched placeholder blocks — horizontal bars of static with a faint "UNRECOVERABLE" watermark. These are visible reminders of knowledge you didn't get. They create a completionist itch: "I need to kill another one of those cleanly to see the full blueprint."

### Knowledge Persistence: The Enemy Codex

Recovered enemy configurations feed into a persistent **Enemy Codex** — a subsection of the existing Blueprint Codex. Each enemy type gets a card that fills out progressively across missions:

- **First kill:** Basic silhouette, unit type name, one or two recovered skills
- **Clean kill (high recovery):** Full skill loadout, partial rule chain
- **Multiple kills across missions:** Complete configuration — all skills, full rule ordering, hook channels, context settings

The Enemy Codex card shows a composite "best known configuration" assembled from all autopsy data across the campaign. A progress ring around the card's border shows completion percentage. Fully documented enemies get a gold border treatment — a collector's satisfaction.

---

## Strengths

1. **Combat becomes intelligence-gathering.** Every kill teaches you something. This transforms battles from pure elimination into research missions. The player who kills thoughtfully (aiming for clean kills, targeting new enemy types) gains more strategic advantage than the player who kills indiscriminately.

2. **The Inspector gains a new dimension.** Post-battle analysis currently focuses on "why did MY units fail?" Adding enemy autopsy data adds "what was the enemy DOING and why?" This doubles the Inspector's analytical value and gives players a reason to scrub through enemy actions, not just their own.

3. **Natural difficulty curve revelation.** Early missions show simple enemy configurations (one skill, one rule). Later missions reveal increasingly complex enemies with multi-hook architectures and sophisticated rule chains. The autopsy panel becomes a window into what's possible — "enemies can do THAT? I want to build something like that."

4. **Teaches by example.** Players who are stuck on how to use hooks or rules effectively can study enemy configurations that demonstrate advanced patterns. The enemy AI becomes a tutorial: "Oh, the enemy relay compresses signals before forwarding — I should do that too."

5. **Creates the "reverse engineering" fantasy.** The player isn't just a designer — they're an intelligence analyst. They study enemy systems, identify patterns, and build counter-configurations. This is directly parallel to real-world agentic AI work: studying existing systems to understand and improve upon them.

## Weaknesses

1. **Information overload risk.** Players already need to process their own units' decision traces in the Inspector. Adding full enemy configuration data could overwhelm, especially in battles with many enemy casualties. Needs careful UI gating — perhaps enemy autopsies are collapsed by default, expandable on click.

2. **Spoils the discovery curve.** If players can see every enemy configuration from Mission 1, later mission introductions of new enemy types lose their surprise. The "what IS that thing?" moment disappears when you can immediately autopsy it. Counter: the "data recovery percentage" mechanic means first encounters never reveal everything.

3. **May reduce replay motivation.** If the Enemy Codex fills out completely, there's less to learn from future encounters with the same enemy type. Counter: invisible randomization means enemy configurations vary within constraints — each autopsy might reveal a different variant of the same enemy type.

4. **Cognitive disconnect with sealed watch.** The sealed watch is emotional — you watch, you feel. The autopsy is analytical — you read, you study. If autopsy data is too prominent in the Inspector, it could undermine the emotional → analytical two-act structure by making the analytical phase feel like homework.

---

## Interaction Effects

**With the Blueprint Codex:** The Enemy Codex and Blueprint Codex share the same collection-card UI language. The player's codex shows what they've unlocked; the enemy codex shows what they've discovered. These could be tabbed sections of the same screen, creating a natural comparison: "My scout has these skills... their scout has THESE skills."

**With the campaign mission arc:** Missions 1-4 (tutorial) could deliberately use simple enemy configurations that serve as "worked examples" — the autopsy reveals a clean, readable blueprint that teaches a concept. Mission 5+ enemy configurations become genuinely complex, rewarding thorough autopsy analysis.

**With the Inspector's decision trace:** Enemy autopsy data could be cross-referenced with decision traces. When your unit died, the Inspector could show: "Killed by ENEMY-STRIKER-03" with a link to that enemy's autopsy. Click through to see what rule the enemy used to target your unit, what context it had, what hook triggered its approach. Full causal chain from enemy perception to your unit's death.

**With information warfare / EM emissions:** If the specialist unit's "extract" skill is redesigned as a live-capture intelligence tool — extracting configuration data from a living enemy without killing it — the autopsy mechanic gains a pre-combat variant. Extract gives partial data from living enemies; autopsy gives full data from dead ones. Two paths to the same intelligence, with different costs.

---

## Sensory Description

**The kill moment (sealed watch).** Your striker moves adjacent to an enemy relay. Red flash. The enemy tile shatters — the unit icon fragments into four pixel shards that scatter to adjacent tiles, each shard a different color corresponding to the enemy's equipped skill types (cyan for perception skills, amber for communication, red for combat). The shards linger for one tick, then dissolve. This is the visual promise: "There's data in that wreckage."

**The autopsy reveal (Inspector).** You scrub the timeline to the tick where the enemy died. You click the death location. The sidebar slides open with a panel titled "CONFIGURATION RECOVERED" in amber monospace text. A brief animation plays: horizontal scan lines sweep down the panel, each line revealing a row of the enemy's blueprint — first the skill slots (icons flickering into focus), then the rule chain (condition→action pairs appearing line by line like a terminal printout), then the hook configuration (channel names materializing with connecting wire graphics), finally the context window state (slots filling in with the data the enemy held at death). The whole reveal takes 1.5 seconds. A soft electronic "data recovered" chime sounds — two ascending tones, like a hard drive clicking into read mode.

**The redacted sections.** Where data wasn't recovered, the scan-line animation hits a block of static — horizontal noise bars that jitter briefly, then settle into a grey placeholder with faint diagonal hash marks. A quiet buzz-click sound, like a read error. The player instinctively knows: "I didn't get that part."

**The Enemy Codex card.** In the codex screen, each enemy type card has a central portrait (the enemy unit icon at large scale, rendered in their faction's red-orange palette). Around the portrait, a circular progress ring fills clockwise as more configuration data is recovered across missions. The ring glows dim red when incomplete, shifts to amber at 75%, and pulses gold when fully documented. Below the portrait: recovered skills shown as small icons, unrecovered skills as dark silhouette placeholders. The card's edge treatment matches its completion: torn/glitched edges for partial data, clean sharp borders for complete data.

---

## Player Journeys

### Journey: Dev, 29, QA Engineer, Mission 4 (Tutorial Finale)

**Context:** Dev has completed Missions 1-3, learning context windows, rules, and hooks. Mission 4 introduces enemy diversity — the first mission with multiple enemy unit types. Dev has encountered enemy scouts and strikers but never an enemy relay. His own relay usage is basic: one relay forwarding scout reports to strikers.

**Minute 0:00 — Plan Screen, Pre-Battle**
Dev sees the mission briefing on the Plan screen. The 8x8 board preview shows three enemy spawner positions — two on the right edge, one in the upper-right corner. Enemy unit icons are visible: two red scout glyphs, two red striker glyphs, and one icon he hasn't seen before — a red unit with the relay symbol (four radiating lines). He hovers over it. A tooltip appears: "ENEMY RELAY — Unknown configuration. Eliminate to analyze." The tooltip border is amber with a dashed outline, signaling incomplete intelligence. Dev's eyes narrow. He's never seen enemy relays before. He adjusts his production queue: scouts first for reconnaissance, then strikers to engage.

**Minute 1:30 — Sealed Watch, First Contact**
Battle begins. Dev's scouts patrol forward. Tick 4: a scout spots the enemy relay at position E7 — it's stationary, like his own relays, sitting between the two enemy spawners. Green cell flash as the scout signals on the "threat" channel. But something unexpected happens at Tick 5: both enemy strikers simultaneously change direction, moving toward Dev's scout from two different angles. Dev watches the signal chain visualization — dashed red lines flare between the enemy relay and both enemy strikers. "They're coordinated. The relay is telling them where my scout is." Tick 7: Dev's scout dies, flanked by both strikers arriving from different vectors.

**Minute 2:45 — Sealed Watch, The Counter-Attack**
Dev's own striker, having received the scout's earlier signal (2-tick delay through his relay), moves toward the last known enemy position. Tick 9: Dev's striker reaches E7 — the enemy relay's position. Adjacent tile. Red flash. Enemy relay eliminated. The relay icon shatters into colored pixel shards — two cyan shards (perception-related), two amber shards (communication-related) scatter to adjacent tiles and linger for a beat before dissolving. Dev notices the shard colors but doesn't yet know what they mean. The battle continues. Without their relay, the enemy strikers stop coordinating — they revert to individual patrol patterns, no longer receiving fused intelligence. Dev's remaining units mop up.

**Minute 4:00 — Inspector, The Autopsy**
The sealed watch ends. Dev enters the Inspector. He immediately clicks his dead scout to understand what went wrong — the decision trace shows the scout was spotted by an enemy scout at Tick 3, and by Tick 5 both enemy strikers had converged. But how did both strikers know? Dev scrubs to Tick 5 and clicks the enemy relay's position at E7. The sidebar slides open.

A new panel appears: **"CONFIGURATION RECOVERED — ENEMY RELAY"** in amber monospace text. Horizontal scan lines sweep down, revealing:

- **Skills:** `compress` (identical to Dev's relay skill), and a skill Dev hasn't seen: `fuse` — icon is two arrows merging into one. Tooltip: "Combines multiple signals about the same target into a single high-priority alert."
- **Rules:** Two entries materialize line by line: `IF signal_count > 1 ABOUT same_target THEN fuse_and_broadcast` and `IF no_signals THEN amplify_channel("enemy-net")`.
- **Hooks:** Two hooks on a channel called "enemy-net" — one listening, one broadcasting. The channel wiring graphic shows connections to both enemy strikers AND both enemy scouts.
- **Context window:** 10 slots. At time of death (Tick 9), 6 were filled — two scout observations about Dev's units, two fused alerts that had been broadcast, and two ambient observations.
- **Recovery: 91%.** One rule entry shows as a glitched placeholder — the relay had a third rule that wasn't recovered.

Dev stares at the `fuse` skill. "It was combining both scouts' observations into a single alert. That's why both strikers responded simultaneously — they didn't get two separate reports, they got one fused high-priority alert." He looks at his own relay's configuration: just `compress` and `filter`. No `fuse`. He doesn't have access to `fuse` yet, but now he knows it exists and what it does.

**Minute 6:00 — The Codex Update**
Dev opens the Blueprint Codex. A new tab glows amber: "Enemy Codex." Inside, one card: ENEMY RELAY. The portrait shows the relay icon in red-orange. The progress ring is at 91% — one tick mark short of full. Below: `compress` and `fuse` skill icons are visible. The unrecovered rule shows as a dark silhouette placeholder. Dev taps the card. The full autopsy readout appears. He screenshots it with his phone.

**Minute 7:00 — Resolution**
Dev returns to the Plan screen. He can't equip `fuse` on his own relays — it's an enemy-exclusive skill (for now). But he understands the *pattern*: route multiple scouts through a relay that consolidates their observations before forwarding to strikers. He reconfigures his relay's rules to approximate the behavior: `IF signal_count > 1 ON "threat" THEN compress_and_forward`. It's not `fuse`, but it's closer. He learned an architectural pattern from dissecting the enemy.

**UI Annotations:**
- **Enemy unit tooltip (Plan screen):** Amber dashed border, "Eliminate to analyze" text, appears on hover over unscanned enemy units on the board preview
- **Pixel shard scatter (sealed watch):** 4 colored shards scatter to orthogonally adjacent tiles on enemy death, linger 1 tick, color-coded by skill category (cyan=perception, amber=communication, red=combat, green=utility)
- **Autopsy panel (Inspector):** Right sidebar, amber header, scan-line reveal animation (1.5s), shows skills/rules/hooks/context in standard blueprint layout but with red-orange enemy faction color palette
- **Recovery percentage bar:** Thin horizontal bar below autopsy header, fills left-to-right, color shifts from red (<50%) to amber (50-90%) to gold (>90%)
- **Enemy Codex tab:** Appears in Blueprint Codex after first enemy kill, amber glow notification on first availability, card layout mirrors player blueprint cards

---

### Journey: Priya, 38, Machine Learning Engineer, Mission 7 (Command Agent + Production Tuning)

**Context:** Priya is deep into the campaign. She's been systematically autopsying every enemy type she encounters, and her Enemy Codex is 60% complete. She's noticed that enemy configurations have been getting more sophisticated with each mission — Mission 5 enemies had single-hook architectures, Mission 6 introduced multi-hook enemies. She approaches Mission 7 as a research expedition as much as a combat challenge.

**Minute 0:00 — Pre-Battle Intelligence Review**
Priya opens her Enemy Codex before configuring blueprints. She reviews what she knows: enemy scouts use a "ping" skill she hasn't seen on her side. Enemy strikers have a rule she's documented: `IF tagged_target_in_range THEN engage_tagged_first` — they prioritize tagged targets. She's learned this from three separate autopsy recoveries across Missions 5 and 6. She still has a gap: the enemy command unit, encountered once in Mission 6 but only 34% recovered because her striker used a messy multi-tile engagement that corrupted the data. She needs a clean kill on an enemy command unit.

**Minute 1:30 — Deliberate Autopsy Planning**
Priya designs her production queue with intelligence gathering as a secondary objective. She creates a "surgical striker" blueprint variant — a striker with the `engage` skill but also a rule: `IF target_type == command THEN approach_from_adjacent_only`. No breach skill (which deals splash damage and corrupts nearby data). She wants a clean, one-shot, one-kill on the enemy command unit to maximize configuration recovery. She names this blueprint "Scalpel."

She also deploys specialists with the `extract` skill — hoping to pull partial configuration data from living enemies before killing them. If extraction plus autopsy can be combined, she might get above 95% recovery on the command unit.

**Minute 4:00 — Sealed Watch, The Hunt**
Battle unfolds. Priya's scouts locate the enemy command unit at position B2 — a stationary unit surrounded by two enemy relays and three enemy strikers. Signal chains light up in red across the enemy network — the command unit is clearly the hub, with dashed red lines radiating to all enemy units. Priya's "Scalpel" striker advances methodically, guided by scout reports routed through her relay network.

Tick 14: Her specialist reaches extraction range of the enemy command unit. A new visual — a thin cyan beam connects the specialist to the command unit for one tick. The specialist's context window fills with extracted data: partial rule chain, channel names. The extraction is noisy — the enemy command unit's hooks fire, routing enemy strikers toward the specialist. Tick 16: an enemy striker eliminates the specialist. But the extracted data was already forwarded through the relay network and is preserved in the event log.

Tick 19: "Scalpel" reaches the enemy command unit. Adjacent tile. Clean kill. Red flash. The command unit's icon shatters — six colored shards scatter (more than any previous enemy, reflecting its 6 hook slots). The shards include two she hasn't seen before: purple shards (a new skill category?). The battle continues, but Priya is already thinking about the Inspector.

**Minute 7:00 — Inspector, The Full Autopsy**
The battle ends. Priya goes straight to the dead enemy command unit at Tick 19. The autopsy panel opens:

**"CONFIGURATION RECOVERED — ENEMY COMMAND"**
Recovery: 96%. The clean adjacent kill plus pre-extraction data pushed recovery near maximum.

The scan-line animation reveals the most complex configuration Priya has seen:

- **Skills (4 of 4 recovered):** `reassign` (she has this), `reroute` (she has this), `prioritize` (she has this), and a new one: `adapt` — icon shows a blueprint morphing into a different shape. Tooltip: "Modifies subordinate unit rules mid-battle based on battlefield conditions."
- **Rules (5 of 6 recovered):** A sophisticated chain including `IF unit_count(striker) < 2 THEN queue(striker, priority=CRITICAL)`, `IF enemy_concentration > 3 in radius THEN reroute(strikers, flank_pattern)`, `IF relay_destroyed THEN reassign(nearest_scout, relay_duties)`, `IF losing_ground THEN adapt(all_strikers, defensive_rules)`, and `IF winning THEN adapt(scouts, aggressive_patrol)`. One rule is glitched — unrecovered.
- **Hooks (6 of 6 recovered):** Wired to five separate channels: "command-net", "threat-priority", "production-queue", "adaptation-signal", and "emergency-fallback". Each channel's listener/broadcaster status is shown.
- **Context window (14 slots):** At death, 12 were filled — a dense mix of subordinate status reports, threat assessments, production queue state, and adaptation decisions.

Priya's breath catches at the `adapt` skill. "It was rewriting its subordinates' rules mid-battle. That's why the enemy strikers changed behavior halfway through — they weren't following pre-set rules, they were being dynamically reconfigured." She scrubs back to Tick 10 in the timeline. The enemy strikers' behavior shifts visibly at that tick — they stop individual patrol and begin coordinated flanking. She checks the signal chain: an "adaptation-signal" fires from the command unit at Tick 9, received by all enemy strikers at Tick 10. The command unit saw her forces concentrating and issued a tactical adaptation.

**Minute 10:00 — Redesigning Her Own Command Agent**
Priya returns to the Plan screen. She doesn't have `adapt` — it's not in her Blueprint Codex as a player skill. But she now understands the *pattern* the enemy used: monitor battlefield state through the command agent's large context window, detect strategic shifts, issue rule modifications to subordinates. She restructures her command agent's rules to approximate this: `IF enemy_count(sector_A) > enemy_count(sector_B) THEN reroute(strikers, sector_A)`. It's cruder than `adapt`, but it's the same architectural idea. She learned it by killing the enemy and reading its mind.

**Minute 11:00 — The Codex Completion**
She opens the Enemy Codex. The ENEMY COMMAND card's progress ring fills to 96% — amber glow, almost gold. The `adapt` skill icon is now visible. She taps it. A detailed description appears, along with a note: "This skill has not been observed in player-available configurations." A subtle hook — is this foreshadowing a future unlock? Will Mission 9 or 10 grant `adapt` as a player skill after demonstrating mastery?

**Resolution:** Priya has transformed combat into an intelligence operation. She designed units specifically to maximize autopsy quality. She treated enemy configurations as a curriculum — each autopsy teaching her architectural patterns she can approximate with her own tools. The salvage reveal mechanic turned her from a tactician into a reverse engineer.

**UI Annotations:**
- **Enemy Codex review (pre-battle):** Accessible from Blueprint Codex, tabbed interface, shows all previously recovered enemy configurations as collection cards with progress rings
- **"Scalpel" blueprint naming:** Custom blueprint names appear on the production queue conveyor belt and in the Inspector unit labels
- **Extraction beam visual (sealed watch):** Thin cyan beam from specialist to target, 1-tick duration, accompanied by a soft data-transfer warble sound
- **Purple shards (sealed watch):** New shard color for meta-skills (reassign, adapt) — the player learns to read shard colors as skill category previews before reaching the Inspector
- **Adaptation-signal trace (Inspector):** The signal chain for "adaptation-signal" renders in purple (matching shard color), distinct from combat (red) and perception (cyan) signal chains

---

### Journey: Tomasz, 17, High School Student, Mission 3 (Hooks Tutorial)

**Context:** Tomasz picked up Robot Uprising because a classmate showed him a clip of signal chains lighting up in battle. He's on Mission 3 — the hook tutorial mission — and has been progressing slowly, replaying each mission twice. He doesn't think about game systems analytically; he plays by feel. He's never heard of Cogmind or XCOM.

**Minute 0:00 — Sealed Watch, Casual Observation**
Tomasz hits EXECUTE on Mission 3 without much thought. His scouts patrol, his striker waits. An enemy scout appears at D6. His scout spots it — green flash. Signal chain lights up. Two ticks later, his striker moves toward D6. At Tick 6, his striker eliminates the enemy scout. Red flash. The enemy icon shatters into two small cyan shards that scatter to C6 and D5, then dissolve. Tomasz doesn't notice the shards specifically — they blend into the combat feedback. But somewhere in his visual memory, the color registers.

**Minute 1:30 — More Kills, Pattern Formation**
Tick 9: his striker eliminates an enemy striker. This time, red shards scatter — two red pixel fragments and one amber. The color difference from the previous kill is subtle but present. Tomasz still isn't consciously reading the shards, but his brain is starting to pattern-match: "the small one dropped blue bits, the big one dropped red bits."

Tick 12: another enemy scout dies. Cyan shards again. Now Tomasz notices. "Wait — the little ones always drop blue stuff and the fighters drop red stuff." He doesn't know these represent skill categories. He just knows there's a difference. The game has planted a seed.

**Minute 2:30 — Inspector, Accidental Discovery**
The battle ends. Tomasz opens the Inspector to check why one of his scouts took a weird path (it walked into a wall — a pathfinding rule issue). While scrubbing the timeline, he accidentally clicks the tile where the enemy striker died at Tick 9. The sidebar changes. Instead of his own unit's panel, a new panel appears: **"CONFIGURATION RECOVERED — ENEMY STRIKER"** in amber text.

Tomasz pauses. "Wait, I can look at the enemy?" He reads the revealed configuration:

- **Skills:** `engage` and `rush` — the `rush` icon shows a unit moving two tiles instead of one. He doesn't have `rush` on his own striker.
- **Rules:** `IF player_unit_visible THEN rush_toward`, `IF adjacent THEN engage`. Simple, two-rule chain.
- **Context window:** 8 slots, 3 filled at death.

Tomasz stares at `rush`. "It can move TWO squares? That's why it caught my scout — my scout moved one tile and the enemy moved two." He clicks back to his dead scout's decision trace. Tick 8: scout at E5, enemy striker at G5. Scout moves to D5 (one tile). Enemy striker uses `rush` to move from G5 to E5 (two tiles), then engages. The scout never had a chance — it thought it was two tiles away and safe for one more tick.

**Minute 3:30 — The Learning Moment**
Tomasz goes back to the Plan screen. He looks at his scout's rules: `IF enemy_visible THEN move_away`. He adds a new condition, fumbling with the editor: `IF enemy_within_2 THEN evade`. He's not sure if this is the right syntax, but the intent is clear — he learned from the enemy autopsy that "two tiles away isn't safe" and is adjusting his defensive perimeter.

He doesn't realize he's just done what ML engineers do: studied a system's behavior, identified a capability gap, and patched his own system's rules. He just thinks the enemy was unfair and he's evening the odds.

**Minute 4:30 — Resolution**
Tomasz replays Mission 3. This time, when the enemy striker rushes, his scout evades instead of walking calmly. The scout survives. Tomasz pumps his fist. The autopsy mechanic taught him a specific enemy capability, which directly informed a specific blueprint adjustment, which produced a specific tactical improvement. The learning loop closed in one replay cycle.

**UI Annotations:**
- **Shard colors as unconscious cues (sealed watch):** Players don't need to understand shard colors to benefit — the visual variety signals "enemies are different" even before the Inspector confirms it
- **Accidental autopsy discovery (Inspector):** Enemy death tiles are clickable without any special mode or button — the autopsy panel simply appears when clicking a destroyed enemy's last position, same interaction pattern as clicking own units
- **`rush` skill icon:** Two arrows pointing forward with a "2x" badge — immediately communicates "moves twice as far" without reading the tooltip
- **Rule editor feedback:** When Tomasz types `IF enemy_within_2`, the rule editor's animated tooltip shows a 2-tile radius around the scout, highlighting the danger zone in red — the spatial consequence of the rule is immediately visible

---

## The TikTok Clip

A split-screen clip: left side shows the sealed watch — a striker eliminates an enemy command unit, six colored shards scatter across the board in slow motion, pixel fragments catching imaginary light. Right side shows the Inspector autopsy panel sliding open — scan lines sweeping down, revealing skill after skill, rule after rule, the enemy's entire cognitive architecture laid bare. Text overlay: "I killed it. Now I know how it thinks." Cut to the player redesigning their own command unit using patterns stolen from the autopsy. Final text: "Every kill is a lesson."

---

## Comparable Patterns Summary

| Game | Pattern | Kill-to-Learn Mechanic | Knowledge Cost | Robot Uprising Translation |
|------|---------|----------------------|----------------|--------------------------|
| **Cogmind** | Physical salvage scatter | Parts drop on floor tiles, inspectable | Weapon choice affects drop rate | Shard scatter + autopsy panel with recovery % |
| **XCOM** | Autopsy research gate | Corpse → lab → unlock | Time + scientist resources | Immediate post-battle reveal, no resource cost |
| **Metroid Prime** | Pre-combat scan | Scan visor reveals weak points while alive | Risk (can't fire while scanning) | Specialist `extract` skill for pre-kill intel |
| **Horizon Zero Dawn** | Progressive revelation | Multiple scans fill machine catalogue | Repeated engagement | Enemy Codex fills across missions |
| **Monster Hunter** | Research log | Tracks, captures, kills all contribute | Engagement depth | Recovery % varies by kill method |

## Design Recommendation

Implement the salvage reveal mechanic with these key parameters:

1. **Always available, never mandatory.** Enemy autopsy panels appear when clicking destroyed enemies in the Inspector, but players are never required to read them. Surface-layer players ignore them; deep-layer players mine them.

2. **Recovery percentage tied to kill method.** Clean adjacent kills = high recovery. Kills via context overload or splash = lower recovery. This rewards tactical precision and creates the Cogmind-like "how you kill matters" tension.

3. **Progressive codex across the campaign.** No single kill reveals everything. The Enemy Codex fills incrementally, rewarding sustained engagement with each enemy type.

4. **Foreshadowing through enemy-exclusive skills.** Some autopsy reveals show skills the player doesn't have access to yet — breadcrumbs for future unlocks. This creates anticipation ("When do I get `adapt`?") and teaches advanced concepts before the player can use them.

5. **Shard colors as pre-Inspector preview.** The colored pixel shards that scatter on enemy death are a sealed-watch-compatible hint system — players begin reading enemy compositions before reaching the Inspector, just from combat feedback colors.
